/**
 * OPAQUE (SPEC §8) over the vendored libopaque WASM build (commit 6e9ac92, see vendor/libopaque/SOURCE.md).
 * The module (~500 KB with the WASM inlined) is loaded lazily on first use, through the package's own
 * "./vendor/libopaque.cjs" export so the path works from src/, dist/, bundlers and Bun.
 */
import { KpxError } from "../errors.js";
import { passwordBytes } from "../crypto/auk.js";
import { wipe } from "../util/bytes.js";

export const OPAQUE_CONTEXT = "kpx-opaque-v1";

export interface OpaqueIds {
  /** the account email, lowercased and trimmed */
  idU: string;
  /** the issuer host, e.g. accounts.keepassxc.org */
  idS: string;
}

/** idU = lowercased, trimmed email; idS = the issuer host (from discovery `opaque.ids`, or the issuer URL's host). */
export function opaqueIds(email: string, issuerOrHost: string): OpaqueIds {
  let idS = issuerOrHost.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(idS)) idS = new URL(idS).host;
  return { idU: email.trim().toLowerCase(), idS };
}

/* The parts of the Emscripten module we use. */
interface LibOpaque {
  ready: Promise<void>;
  _malloc(n: number): number;
  _free(p: number): void;
  HEAPU8: Uint8Array;
  _opaquejs_CreateRegistrationRequest(pw: number, len: number, sec: number, M: number): number;
  _opaquejs_CreateCredentialRequest(pw: number, len: number, sec: number, pub: number): number;
  OPAQUE_REGISTER_USER_SEC_LEN: number;
  OPAQUE_USER_SESSION_SECRET_LEN: number;
  OPAQUE_USER_SESSION_PUBLIC_LEN: number;
  crypto_core_ristretto255_BYTES: number;
  finalizeRequest(p: { sec: Uint8Array; pub: Uint8Array; ids: OpaqueIds }): { rec: Uint8Array; export_key: Uint8Array };
  recoverCredentials(p: { resp: Uint8Array; sec: Uint8Array; context: string; ids: OpaqueIds }): {
    sk: Uint8Array;
    authU: Uint8Array;
    export_key: Uint8Array;
  };
  // server side (tests and reference only)
  createRegistrationResponse(p: { M: Uint8Array; skS?: Uint8Array | null }): { sec: Uint8Array; pub: Uint8Array };
  storeUserRecord(p: { sec: Uint8Array; rec: Uint8Array }): { rec: Uint8Array };
  createCredentialResponse(p: { pub: Uint8Array; rec: Uint8Array; ids: OpaqueIds; context: string }): {
    resp: Uint8Array;
    sk: Uint8Array;
    sec: Uint8Array;
  };
  userAuth(p: { sec: Uint8Array; authU: Uint8Array }): boolean;
  // the stock (buggy for non-ASCII) string wrappers, exposed only to test the workaround
  createRegistrationRequest(p: { pwdU: string }): { sec: Uint8Array; M: Uint8Array };
  createCredentialRequest(p: { pwdU: string }): { sec: Uint8Array; pub: Uint8Array };
}

let loading: Promise<LibOpaque> | null = null;

type Listener = (...args: unknown[]) => void;
interface ProcessLike {
  listeners(event: string): Listener[];
  on(event: string, listener: Listener): unknown;
}

/** Loads the WASM module once. Safe to call repeatedly. */
export function loadOpaque(): Promise<LibOpaque> {
  loading ??= (async () => {
    // libopaque's Node glue removes every uncaughtException/unhandledRejection listener; put the host's back
    const proc = (globalThis as { process?: ProcessLike }).process;
    const saved =
      proc && typeof proc.listeners === "function"
        ? ["uncaughtException", "unhandledRejection"].map((ev) => [ev, proc.listeners(ev).slice()] as const)
        : [];
    // The pinned build is compiled with -DTRACE: its C code prints passwords, OPRF values and keys.
    // Emscripten binds its stdout/stderr to console.log/console.warn when the module loads, so swap
    // those for no-ops while loading; the module then stays silent and the console is restored.
    const con = globalThis.console;
    const saved2 = { log: con.log, warn: con.warn };
    let lib: LibOpaque;
    con.log = () => {};
    con.warn = () => {};
    try {
      const mod = (await import("@kpnx/sdk/vendor/libopaque.cjs")) as { default?: LibOpaque } & LibOpaque;
      lib = (mod.default ?? mod) as LibOpaque;
      await lib.ready;
    } finally {
      con.log = saved2.log;
      con.warn = saved2.warn;
    }
    for (const [ev, listeners] of saved) {
      for (const l of listeners) if (!proc!.listeners(ev).includes(l)) proc!.on(ev, l);
    }
    return lib;
  })().catch((e) => {
    loading = null;
    throw new KpxError("opaque_failed", "could not load the OPAQUE module", undefined, { cause: e });
  });
  return loading;
}

export interface OpaqueBuildInfo {
  /**
   * True when libopaque's own randomness is replaced by the fixed sequence 00 01 02 … (built with
   * -DNORANDOM). The client's login nonce and ephemeral key and the registration envelope nonce are
   * then constant: unsafe for production. Upstream's js/dist build at 6e9ac92 is such a build; the
   * vendored one is a release rebuild and isn't.
   */
  deterministic: boolean;
}

let buildInfo: OpaqueBuildInfo | null = null;
export type OpaqueBuildPolicy = "warn" | "refuse" | "allow";
let policy: OpaqueBuildPolicy = "refuse";
let warned = false;

/** What to do with a deterministic (-DNORANDOM) build: refuse to run (default), warn once, or allow silently. */
export function setOpaqueBuildPolicy(p: OpaqueBuildPolicy): void {
  policy = p;
}

/** Detects a -DNORANDOM build: its credential request carries the nonce 00 01 … 1f. */
export async function opaqueBuildInfo(): Promise<OpaqueBuildInfo> {
  if (buildInfo) return buildInfo;
  const lib = await loadOpaque();
  const probe = requestWithBytes(lib, lib._opaquejs_CreateCredentialRequest.bind(lib), utf8probe, lib.OPAQUE_USER_SESSION_SECRET_LEN, lib.OPAQUE_USER_SESSION_PUBLIC_LEN);
  wipe(probe.sec);
  const nonce = probe.out.subarray(32, 64);
  buildInfo = { deterministic: nonce.every((b, i) => b === i) };
  return buildInfo;
}
const utf8probe = new Uint8Array([0x70, 0x72, 0x6f, 0x62, 0x65]);

async function checkBuild(): Promise<void> {
  if (policy === "allow") return;
  const info = await opaqueBuildInfo();
  if (!info.deterministic) return;
  if (policy === "refuse") throw new KpxError("opaque_failed", "the libopaque build uses fixed randomness (-DNORANDOM) and must not be used in production");
  if (!warned) {
    warned = true;
    globalThis.console?.warn?.("[@kpnx/sdk] WARNING: the loaded libopaque build uses fixed randomness (-DNORANDOM); OPAQUE logins are not secure with it. See vendor/libopaque/SOURCE.md.");
  }
}

/** Calls a libopaque request function with the password as real UTF-8 bytes (works around the wrapper bug). */
function requestWithBytes(
  lib: LibOpaque,
  fn: (pw: number, len: number, sec: number, out: number) => number,
  pw: Uint8Array,
  secBaseLen: number,
  outLen: number,
): { sec: Uint8Array; out: Uint8Array } {
  if (pw.length === 0 || pw.length > 0xffff) throw new KpxError("opaque_failed", "password must be 1..65535 UTF-8 bytes");
  const secLen = secBaseLen + pw.length;
  const pPw = lib._malloc(pw.length);
  const pSec = lib._malloc(secLen);
  const pOut = lib._malloc(outLen);
  try {
    lib.HEAPU8.set(pw, pPw);
    if (fn(pPw, pw.length, pSec, pOut) !== 0) throw new KpxError("opaque_failed", "OPAQUE request failed");
    return { sec: lib.HEAPU8.slice(pSec, pSec + secLen), out: lib.HEAPU8.slice(pOut, pOut + outLen) };
  } finally {
    lib.HEAPU8.fill(0, pPw, pPw + pw.length);
    lib.HEAPU8.fill(0, pSec, pSec + secLen);
    lib._free(pPw);
    lib._free(pSec);
    lib._free(pOut);
  }
}

const wrapErr = <T>(what: string, f: () => T): T => {
  try {
    return f();
  } catch (e) {
    if (e instanceof KpxError) throw e;
    throw new KpxError("opaque_failed", `${what} failed`, undefined, { cause: e });
  }
};

/** Client state between the two steps. Opaque to callers; wipe with `.dispose()` if abandoned. */
export class OpaqueClientState {
  constructor(readonly sec: Uint8Array) {}
  dispose(): void {
    wipe(this.sec);
  }
}

export interface RegistrationStart {
  /** `request` for /auth/register/start (OPAQUE M) */
  request: Uint8Array;
  state: OpaqueClientState;
}

export async function startRegistration(password: string): Promise<RegistrationStart> {
  await checkBuild();
  const lib = await loadOpaque();
  const pw = passwordBytes(password);
  try {
    const { sec, out } = requestWithBytes(
      lib,
      lib._opaquejs_CreateRegistrationRequest.bind(lib),
      pw,
      lib.OPAQUE_REGISTER_USER_SEC_LEN,
      lib.crypto_core_ristretto255_BYTES,
    );
    return { request: out, state: new OpaqueClientState(sec) };
  } finally {
    wipe(pw);
  }
}

/** Returns the `record` for /auth/register/finish. `exportKey` is not used in v1 (SPEC §8). */
export async function finishRegistration(state: OpaqueClientState, response: Uint8Array, ids: OpaqueIds) {
  const lib = await loadOpaque();
  try {
    const r = wrapErr("finalizeRequest", () => lib.finalizeRequest({ sec: state.sec, pub: response, ids }));
    return { record: r.rec, exportKey: r.export_key };
  } finally {
    state.dispose();
  }
}

export interface LoginStart {
  /** `ke1` for /auth/login/start */
  ke1: Uint8Array;
  state: OpaqueClientState;
}

export async function startLogin(password: string): Promise<LoginStart> {
  await checkBuild();
  const lib = await loadOpaque();
  const pw = passwordBytes(password);
  try {
    const { sec, out } = requestWithBytes(
      lib,
      lib._opaquejs_CreateCredentialRequest.bind(lib),
      pw,
      lib.OPAQUE_USER_SESSION_SECRET_LEN,
      lib.OPAQUE_USER_SESSION_PUBLIC_LEN,
    );
    return { ke1: out, state: new OpaqueClientState(sec) };
  } finally {
    wipe(pw);
  }
}

/**
 * Processes `ke2` and returns `authU` for /auth/login/finish. Throws `opaque_failed` on a wrong password
 * (or a fake record for an unknown email); the caller should show the same message as a 401.
 */
export async function finishLogin(state: OpaqueClientState, ke2: Uint8Array, ids: OpaqueIds, context = OPAQUE_CONTEXT) {
  const lib = await loadOpaque();
  try {
    const r = wrapErr("recoverCredentials", () => lib.recoverCredentials({ resp: ke2, sec: state.sec, context, ids }));
    return { authU: r.authU, sessionKey: r.sk, exportKey: r.export_key };
  } finally {
    state.dispose();
  }
}

/**
 * Server-side functions of the same build, for tests and local mock servers only. The real server is
 * the C core through the Python binding (Flask).
 */
export const opaqueServerForTests = {
  async registrationResponse(request: Uint8Array) {
    const lib = await loadOpaque();
    const r = lib.createRegistrationResponse({ M: request, skS: null });
    return { sec: r.sec, response: r.pub };
  },
  async storeRecord(sec: Uint8Array, record: Uint8Array) {
    return (await loadOpaque()).storeUserRecord({ sec, rec: record }).rec;
  },
  async credentialResponse(ke1: Uint8Array, storedRecord: Uint8Array, ids: OpaqueIds, context = OPAQUE_CONTEXT) {
    const r = (await loadOpaque()).createCredentialResponse({ pub: ke1, rec: storedRecord, ids, context });
    return { ke2: r.resp, sessionKey: r.sk, sec: r.sec };
  },
  async userAuth(sec: Uint8Array, authU: Uint8Array) {
    try {
      return (await loadOpaque()).userAuth({ sec, authU });
    } catch {
      return false;
    }
  },
  /** the stock string-based wrappers (truncate non-ASCII passwords); exposed to demonstrate the bug */
  async stockRegistrationRequest(password: string) {
    return (await loadOpaque()).createRegistrationRequest({ pwdU: password.normalize("NFKC") });
  },
  async stockCredentialRequest(password: string) {
    return (await loadOpaque()).createCredentialRequest({ pwdU: password.normalize("NFKC") });
  },
};

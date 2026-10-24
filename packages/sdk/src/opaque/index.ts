/**
 * OPAQUE (SPEC §8, RFC 9807) over opaque-ke, compiled to WASM from `opaque-wasm/` (see vendor/opaque/SOURCE.md).
 * The module (~160 KB as base64) is loaded lazily on first use, through the package's own
 * "./vendor/opaque-wasm.js" export so the path works from src/, dist/, bundlers and Bun.
 */
import { OpenVireoError } from "../errors.js";
import { passwordBytes } from "../crypto/auk.js";
import { exactBuffer, fromB64u, randomBytes, utf8, wipe } from "../util/bytes.js";

export const OPAQUE_CONTEXT = "ov-opaque-v1";

export interface OpaqueIds {
  /** the account email, lowercased and trimmed */
  idU: string;
  /** the issuer host, e.g. accounts.openvireo.com */
  idS: string;
}

/** idU = lowercased, trimmed email; idS = the issuer host (from discovery `opaque.ids`, or the issuer URL's host). */
export function opaqueIds(email: string, issuerOrHost: string): OpaqueIds {
  let idS = issuerOrHost.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(idS)) idS = new URL(idS).host;
  return { idU: email.trim().toLowerCase(), idS };
}

/* The module's exports (opaque-wasm/src/lib.rs). */
interface OpaqueWasm {
  memory: WebAssembly.Memory;
  ov_alloc(len: number): number;
  ov_free(ptr: number, len: number): void;
  ov_call(op: number, ptr: number, len: number): number;
  ov_out_ptr(): number;
  ov_out_len(): number;
  ov_out_clear(): void;
}

const enum Op {
  RegStart = 1,
  RegFinish = 2,
  LoginStart = 3,
  LoginFinish = 4,
  SrvRegStart = 10,
  SrvStore = 11,
  SrvLoginStart = 12,
  SrvLoginFinish = 13,
}

let loading: Promise<OpaqueWasm> | null = null;

/** Loads the WASM module once. Safe to call repeatedly. */
export function loadOpaque(): Promise<OpaqueWasm> {
  loading ??= (async () => {
    const mod = (await import("@openvireo/sdk/vendor/opaque-wasm.js")) as { default: string };
    const instance = await WebAssembly.instantiate(await WebAssembly.compile(exactBuffer(fromB64u(mod.default))), {});
    return instance.exports as unknown as OpaqueWasm;
  })().catch((e) => {
    loading = null;
    throw new OpenVireoError("opaque_failed", "could not load the OPAQUE module", undefined, { cause: e });
  });
  return loading;
}

/** Fields are `u32 LE length ‖ bytes`, in and out. */
function pack(fields: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(fields.reduce((n, f) => n + 4 + f.length, 0));
  const dv = new DataView(out.buffer);
  let i = 0;
  for (const f of fields) {
    dv.setUint32(i, f.length, true);
    out.set(f, i + 4);
    i += 4 + f.length;
  }
  return out;
}

function unpack(b: Uint8Array): Uint8Array[] {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const out: Uint8Array[] = [];
  for (let i = 0; i < b.length; ) {
    const n = dv.getUint32(i, true);
    out.push(b.slice(i + 4, i + 4 + n));
    i += 4 + n;
  }
  return out;
}

/**
 * Runs one operation. Returns the output fields, or null when authentication failed (wrong password,
 * or a fake record for an unknown email). Inputs and outputs are wiped from the module's memory.
 */
async function call(op: Op, fields: Uint8Array[], what: string): Promise<Uint8Array[] | null> {
  const m = await loadOpaque();
  const input = pack(fields);
  const ptr = m.ov_alloc(input.length);
  try {
    new Uint8Array(m.memory.buffer, ptr, input.length).set(input);
    const status = m.ov_call(op, ptr, input.length);
    if (status === 1) return null;
    if (status !== 0) throw new OpenVireoError("opaque_failed", `${what} failed`);
    return unpack(new Uint8Array(m.memory.buffer, m.ov_out_ptr(), m.ov_out_len()));
  } finally {
    wipe(input);
    m.ov_free(ptr, input.length); // zeroes the input
    m.ov_out_clear(); // zeroes the output
  }
}

const seed = () => randomBytes(32);
const idFields = (ids: OpaqueIds) => [utf8(ids.idU), utf8(ids.idS)];

function checkPassword(pw: Uint8Array): void {
  if (pw.length === 0 || pw.length > 0xffff) throw new OpenVireoError("opaque_failed", "password must be 1..65535 UTF-8 bytes");
}

/** Client state between the two steps (holds the password). Opaque to callers; wipe with `.dispose()` if abandoned. */
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
  const pw = passwordBytes(password);
  try {
    checkPassword(pw);
    const [request, sec] = (await call(Op.RegStart, [seed(), pw], "registration request"))!;
    return { request: request!, state: new OpaqueClientState(sec!) };
  } finally {
    wipe(pw);
  }
}

/** Returns the `record` for /auth/register/finish. `exportKey` is not used in v1 (SPEC §8). */
export async function finishRegistration(state: OpaqueClientState, response: Uint8Array, ids: OpaqueIds) {
  try {
    const r = await call(Op.RegFinish, [seed(), state.sec, response, ...idFields(ids)], "finishing the registration");
    if (!r) throw new OpenVireoError("opaque_failed", "finishing the registration failed");
    return { record: r[0]!, exportKey: r[1]! };
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
  const pw = passwordBytes(password);
  try {
    checkPassword(pw);
    const [ke1, sec] = (await call(Op.LoginStart, [seed(), pw], "credential request"))!;
    return { ke1: ke1!, state: new OpaqueClientState(sec!) };
  } finally {
    wipe(pw);
  }
}

/**
 * Processes `ke2` and returns `authU` for /auth/login/finish. Throws `opaque_failed` on a wrong password
 * (or a fake record for an unknown email); the caller should show the same message as a 401.
 */
export async function finishLogin(state: OpaqueClientState, ke2: Uint8Array, ids: OpaqueIds, context = OPAQUE_CONTEXT) {
  try {
    const r = await call(Op.LoginFinish, [seed(), state.sec, ke2, utf8(context), ...idFields(ids)], "recovering the credentials");
    if (!r) throw new OpenVireoError("opaque_failed", "wrong password");
    return { authU: r[0]!, sessionKey: r[1]!, exportKey: r[2]! };
  } finally {
    state.dispose();
  }
}

/**
 * Server-side functions of the same module (opaque-ke's server, one ServerSetup per user), for tests and
 * local mock servers only. The real server is libopaque's C core through its Python binding (Flask).
 */
export const opaqueServerForTests = {
  async registrationResponse(request: Uint8Array) {
    const [sec, response] = (await call(Op.SrvRegStart, [seed(), request], "registration response"))!;
    return { sec: sec!, response: response! };
  },
  async storeRecord(sec: Uint8Array, record: Uint8Array) {
    return (await call(Op.SrvStore, [sec, record], "storing the record"))![0]!;
  },
  async credentialResponse(ke1: Uint8Array, storedRecord: Uint8Array, ids: OpaqueIds, context = OPAQUE_CONTEXT) {
    const [ke2, sec] = (await call(Op.SrvLoginStart, [seed(), ke1, storedRecord, utf8(context), ...idFields(ids)], "credential response"))!;
    return { ke2: ke2!, sec: sec! };
  },
  /** Checks the client's `authU`; returns the server's session key, or null when it is wrong. */
  async userAuth(sec: Uint8Array, authU: Uint8Array): Promise<Uint8Array | null> {
    try {
      return (await call(Op.SrvLoginFinish, [sec, authU], "user auth"))?.[0] ?? null;
    } catch {
      return null;
    }
  },
};

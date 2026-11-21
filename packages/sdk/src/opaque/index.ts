/**
 * OPAQUE (SPEC §8, RFC 9807) over opaque-ke: the shared Rust core's ov-opaque crate, in the core's
 * full module.
 *
 * @module @openvireo/sdk/opaque
 */
import { call, ready } from "../core/full.js";
import { OpenVireoError } from "../errors.js";
import { passwordBytes } from "../crypto/auk.js";
import { wipe } from "../util/bytes.js";

export const OPAQUE_CONTEXT = "ov-opaque-v1";

export interface OpaqueIds {
  /** the account email, lowercased and trimmed */
  idU: string;
  /** the issuer host, e.g. accounts.openvireo.com */
  idS: string;
}

/** idU = lowercased, trimmed email; idS = the issuer host (from discovery `opaque.ids`, or the issuer URL's host). */
export function opaqueIds(email: string, issuerOrHost: string): OpaqueIds {
  return call((c) => c.opaqueIds(email, issuerOrHost));
}

/** Loads the core (the full module) asynchronously, so the OPAQUE calls that follow don't compile it on the spot. */
export async function loadOpaque(): Promise<void> {
  try {
    await ready();
  } catch (e) {
    throw new OpenVireoError("opaque_failed", "could not load the OPAQUE module", undefined, { cause: e });
  }
}

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
    const r = call((c) => c.opaqueStartRegistration(pw));
    return { request: r.request, state: new OpaqueClientState(r.state) };
  } finally {
    wipe(pw);
  }
}

/** Returns the `record` for /auth/register/finish. `exportKey` is not used in v1 (SPEC §8). */
export async function finishRegistration(state: OpaqueClientState, response: Uint8Array, ids: OpaqueIds) {
  try {
    const r = call((c) => c.opaqueFinishRegistration(state.sec, response, ids));
    return { record: r.record, exportKey: r.exportKey };
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
    const r = call((c) => c.opaqueStartLogin(pw));
    return { ke1: r.ke1, state: new OpaqueClientState(r.state) };
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
    const r = call((c) => c.opaqueFinishLogin(state.sec, ke2, ids, context));
    return { authU: r.authU, sessionKey: r.sessionKey, exportKey: r.exportKey };
  } finally {
    state.dispose();
  }
}

/**
 * Server-side functions (opaque-ke's server, one ServerSetup per user), for tests and local mock servers
 * only. The real server is libopaque's C core through its Python binding (Flask).
 */
export const opaqueServerForTests = {
  async registrationResponse(request: Uint8Array) {
    const r = call((c) => c.opaqueServerRegistrationResponse(request));
    return { sec: r.sec, response: r.response };
  },
  async storeRecord(sec: Uint8Array, record: Uint8Array) {
    return call((c) => c.opaqueServerStoreRecord(sec, record));
  },
  async credentialResponse(ke1: Uint8Array, storedRecord: Uint8Array, ids: OpaqueIds, context = OPAQUE_CONTEXT) {
    const r = call((c) => c.opaqueServerCredentialResponse(ke1, storedRecord, ids, context));
    return { ke2: r.ke2, sec: r.sec };
  },
  /** Checks the client's `authU`; returns the server's session key, or null when it is wrong. */
  async userAuth(sec: Uint8Array, authU: Uint8Array): Promise<Uint8Array | null> {
    try {
      return call((c) => c.opaqueServerUserAuth(sec, authU)) ?? null;
    } catch {
      return null;
    }
  },
};

/**
 * SPEC §9 access tokens. Clients only need `decodeJwt` (to read `exp` and `vlt`); `verifyJwt` is the
 * reference verifier (EdDSA only, iss/aud/exp/nbf with 60 s skew), used by the test vectors and by
 * `ov connect`-style servers.
 */
import { call } from "../core/full.js";
import { isOpenVireoError } from "../errors.js";

export type VaultRole = "read" | "write" | "manage";

export interface AccessClaims {
  iss: string;
  aud: string[] | string;
  sub: string;
  dev?: string;
  org?: string;
  vlt?: { id: string; r: VaultRole }[];
  iat: number;
  nbf?: number;
  exp: number;
  jti?: string;
  [k: string]: unknown;
}

export interface Jwk {
  kty: string;
  crv?: string;
  x?: string;
  kid?: string;
  use?: string;
  alg?: string;
}
export interface Jwks {
  keys: Jwk[];
}

export function decodeJwt(token: string): { header: Record<string, unknown>; claims: AccessClaims } {
  return call((c) => c.decodeJwt(token)) as { header: Record<string, unknown>; claims: AccessClaims };
}

export const isJwt = (token: string): boolean => token.split(".").length === 3;

export interface VerifyOptions {
  issuer: string;
  audience: string;
  /** unix seconds */
  now?: number;
  skew?: number;
  /** called once when the kid is unknown (SPEC: refetch at most every 30 s; the caller rate-limits) */
  refetchJwks?: () => Promise<Jwks>;
}

/** EdDSA only; checks iss, aud, exp and nbf with `skew` (60 s). Refetches the JWKS once for an unknown kid. */
export async function verifyJwt(token: string, jwks: Jwks, opts: VerifyOptions): Promise<AccessClaims> {
  const o = { issuer: opts.issuer, audience: opts.audience, ...(opts.now !== undefined ? { now: opts.now } : {}), ...(opts.skew !== undefined ? { skew: opts.skew } : {}) };
  try {
    return call((c) => c.verifyJwt(token, jwks, o)) as AccessClaims;
  } catch (e) {
    if (!opts.refetchJwks || !isOpenVireoError(e, "unauthorized") || !/kid/.test(e.message)) throw e;
    const fresh = await opts.refetchJwks();
    return call((c) => c.verifyJwt(token, fresh, o)) as AccessClaims;
  }
}

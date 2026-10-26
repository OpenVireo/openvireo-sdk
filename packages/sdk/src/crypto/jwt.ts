/**
 * SPEC §9 access tokens. Clients only need `decodeJwt` (to read `exp` and `vlt`); `verifyJwt` is the
 * reference verifier (EdDSA only, iss/aud/exp/nbf with 60 s skew), used by the test vectors and by
 * `ov connect`-style servers.
 */
import { OpenVireoError } from "../errors.js";
import { fromB64u, fromUtf8, utf8 } from "../util/bytes.js";
import { ed25519Verify } from "./primitives.js";

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
  const parts = token.split(".");
  if (parts.length !== 3) throw new OpenVireoError("invalid_token", "not a JWT");
  try {
    return { header: JSON.parse(fromUtf8(fromB64u(parts[0]!))), claims: JSON.parse(fromUtf8(fromB64u(parts[1]!))) };
  } catch (e) {
    throw new OpenVireoError("invalid_token", "malformed JWT", undefined, { cause: e });
  }
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

const fail = (msg: string): never => {
  throw new OpenVireoError("unauthorized", msg, 401);
};

export async function verifyJwt(token: string, jwks: Jwks, opts: VerifyOptions): Promise<AccessClaims> {
  const parts = token.split(".");
  if (parts.length !== 3) fail("not a JWT");
  const { header, claims } = decodeJwt(token);
  if (header.alg !== "EdDSA") fail("only EdDSA is accepted");
  const findKey = (set: Jwks) =>
    set.keys.find((k) => k.kid === header.kid && k.kty === "OKP" && k.crv === "Ed25519" && (k.alg ?? "EdDSA") === "EdDSA");
  let jwk = findKey(jwks);
  if (!jwk && opts.refetchJwks) jwk = findKey(await opts.refetchJwks());
  if (!jwk?.x) return fail("unknown kid");
  const ok = ed25519Verify(fromB64u(parts[2]!), utf8(`${parts[0]}.${parts[1]}`), fromB64u(jwk.x));
  if (!ok) fail("bad signature");
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const skew = opts.skew ?? 60;
  if (claims.iss !== opts.issuer) fail("wrong issuer");
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(opts.audience)) fail("wrong audience");
  if (typeof claims.exp !== "number" || now > claims.exp + skew) fail("expired");
  if (typeof claims.nbf === "number" && now + skew < claims.nbf) fail("not yet valid");
  return claims;
}

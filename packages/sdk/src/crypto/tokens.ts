/** SPEC §9: service account tokens and refresh token hashes. */
import { KpxError } from "../errors.js";
import { b64u, fromB64u, fromUtf8, randomBytes, toHex, utf8 } from "../util/bytes.js";
import { AAD, unwrap, wrap } from "./envelope.js";
import { sha256 } from "./primitives.js";

export const SA_TOKEN_PREFIX = "kpx_sa_";
export const REFRESH_TOKEN_PREFIX = "kpx_rt_";

export interface SaTokenPayload {
  v: 1;
  /** issuer URL */
  url: string;
  sa_id: string;
  /** base64url of 32 bytes */
  secret: string;
  /** base64url of 32 bytes */
  kek: string;
}

/** Builds `kpx_sa_` + base64url(UTF-8 JSON). Key order matches the SPEC so tokens are reproducible. */
export function buildSaToken(p: { url: string; saId: string; secret: Uint8Array; kek: Uint8Array }): string {
  const json = JSON.stringify({ v: 1, url: p.url, sa_id: p.saId, secret: b64u(p.secret), kek: b64u(p.kek) });
  return SA_TOKEN_PREFIX + b64u(utf8(json));
}

export interface ParsedSaToken {
  url: string;
  saId: string;
  secret: Uint8Array;
  kek: Uint8Array;
}

export function parseSaToken(token: string): ParsedSaToken {
  const t = token.trim();
  if (!t.startsWith(SA_TOKEN_PREFIX)) throw new KpxError("invalid_token", "not a service account token (kpx_sa_…)");
  let p: Partial<SaTokenPayload>;
  try {
    p = JSON.parse(fromUtf8(fromB64u(t.slice(SA_TOKEN_PREFIX.length))));
  } catch (e) {
    throw new KpxError("invalid_token", "malformed service account token", undefined, { cause: e });
  }
  if (p.v !== 1) throw new KpxError("invalid_token", `unsupported service account token version ${String(p.v)}`);
  if (typeof p.url !== "string" || typeof p.sa_id !== "string" || typeof p.secret !== "string" || typeof p.kek !== "string") {
    throw new KpxError("invalid_token", "service account token is missing fields");
  }
  const secret = fromB64u(p.secret);
  const kek = fromB64u(p.kek);
  if (secret.length !== 32 || kek.length !== 32) throw new KpxError("invalid_token", "service account token keys must be 32 bytes");
  return { url: p.url, saId: p.sa_id, secret, kek };
}

/** What the server stores for a secret: hex SHA-256 of the 32 raw bytes. */
export const saSecretHash = (secret: Uint8Array): string => toHex(sha256(secret));
/** First 8 characters of the base64url secret, for display. */
export const saSecretPrefix = (secret: Uint8Array): string => b64u(secret).slice(0, 8);

export const wrapSaMaster = (kek: Uint8Array, saId: string, master: Uint8Array, nonce?: Uint8Array): string =>
  b64u(wrap(kek, master, AAD.saMaster(saId), nonce));
export const unwrapSaMaster = (kek: Uint8Array, saId: string, wrapped: string): Uint8Array =>
  unwrap(kek, fromB64u(wrapped), AAD.saMaster(saId));

/** What the server stores for a refresh token: hex SHA-256 of the UTF-8 token. */
export const refreshTokenHash = (token: string): string => toHex(sha256(utf8(token)));

export const newRefreshToken = (): string => REFRESH_TOKEN_PREFIX + b64u(randomBytes(32));

/**
 * A new SA secret: the raw secret and kek, the `NewSaSecret` body for the server, and the token to show
 * once. `master` is the SA master key (unsealed by an owner/admin).
 */
export function newSaSecret(p: { url: string; saId: string; master: Uint8Array; secretId: string; name?: string; expiresAt?: string | null }) {
  const secret = randomBytes(32);
  const kek = randomBytes(32);
  const token = buildSaToken({ url: p.url, saId: p.saId, secret, kek });
  const body = {
    id: p.secretId,
    ...(p.name !== undefined ? { name: p.name } : {}),
    secret_hash: saSecretHash(secret),
    prefix: saSecretPrefix(secret),
    wrapped_master: wrapSaMaster(kek, p.saId, p.master),
    expires_at: p.expiresAt ?? null,
  };
  kek.fill(0);
  secret.fill(0);
  return { token, body };
}

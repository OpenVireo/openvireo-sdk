/** SPEC §9: service account tokens and refresh token hashes. */
import { call } from "../core/full.js";
import { fromUtf8 } from "../util/bytes.js";

export const SA_TOKEN_PREFIX = "ov_sa_";
export const REFRESH_TOKEN_PREFIX = "ov_rt_";

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

/** Builds `ov_sa_` + base64url(UTF-8 JSON). Key order matches the SPEC so tokens are reproducible. */
export function buildSaToken(p: { url: string; saId: string; secret: Uint8Array; kek: Uint8Array }): string {
  return fromUtf8(call((c) => c.buildSaToken(p)));
}

export interface ParsedSaToken {
  url: string;
  saId: string;
  secret: Uint8Array;
  kek: Uint8Array;
}

export function parseSaToken(token: string): ParsedSaToken {
  return call((c) => c.parseSaToken(token));
}

/** What the server stores for a secret: hex SHA-256 of the 32 raw bytes. */
export const saSecretHash = (secret: Uint8Array): string => call((c) => c.saSecretHash(secret));
/** First 8 characters of the base64url secret, for display. */
export const saSecretPrefix = (secret: Uint8Array): string => call((c) => c.saSecretPrefix(secret));

export const wrapSaMaster = (kek: Uint8Array, saId: string, master: Uint8Array, nonce?: Uint8Array): string =>
  call((c) => c.wrapSaMaster(kek, saId, master, nonce));
export const unwrapSaMaster = (kek: Uint8Array, saId: string, wrapped: string): Uint8Array => call((c) => c.unwrapSaMaster(kek, saId, wrapped));

/** What the server stores for a refresh token: hex SHA-256 of the UTF-8 token. */
export const refreshTokenHash = (token: string): string => call((c) => c.refreshTokenHash(token));

export const newRefreshToken = (): string => fromUtf8(call((c) => c.newRefreshToken()));

/**
 * A new SA secret: the `NewSaSecret` body for the server, and the token to show once. `master` is the SA
 * master key (unsealed by an owner/admin).
 */
export function newSaSecret(p: { url: string; saId: string; master: Uint8Array; secretId: string; name?: string; expiresAt?: string | null }) {
  const r = call((c) => c.newSaSecret(p));
  return { token: fromUtf8(r.token), body: r.body };
}

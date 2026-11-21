/** SPEC §3: Account Unlock Key. */
import { call } from "../core/full.js";
import { getArgon2Override } from "./argon2-hook.js";
import { fromB64u, utf8, wipe } from "../util/bytes.js";
import { hkdf } from "./primitives.js";

/** The `Kdf` schema of openapi.yaml. */
export interface KdfParams {
  alg: "argon2id";
  /** base64url, 16 bytes */
  salt: string;
  /** KiB */
  m: number;
  t: number;
  p: number;
}

export const KDF_DEFAULTS = { m: 65536, t: 3, p: 1 } as const;
export const KDF_MIN = { m: 19456, t: 2 } as const;

export function newKdfParams(overrides: Partial<Omit<KdfParams, "alg" | "salt">> = {}): KdfParams {
  return call((c) => c.newKdfParams(overrides)) as KdfParams;
}

/** Clients refuse m < 19456 or t < 2 (or the server's stricter `kdf_min`). */
export function checkKdfParams(kdf: KdfParams, min: { m: number; t: number } = KDF_MIN): void {
  call((c) => c.checkKdfParams(kdf, min));
}

/** UTF-8 of the NFKC-normalized password, not trimmed. Also the OPAQUE password input (§8). */
export const passwordBytes = (password: string): Uint8Array => call((c) => c.passwordBytes(password));

export interface DeriveAukOptions {
  /** Skip the minimum-cost check (test vectors use m=1024). Never set this for server-provided params. */
  allowWeak?: boolean;
  kdfMin?: { m: number; t: number };
}

/** Argon2id(pw, salt) then HKDF(ikm=stretched, salt=SecretKey, info="ov-auk-v1"). */
export async function stretchPassword(password: string, kdf: KdfParams, opts: DeriveAukOptions = {}): Promise<Uint8Array> {
  const custom = getArgon2Override();
  if (!custom) return call((c) => c.stretchPassword(password, kdf, opts));
  // A custom Argon2 (setArgon2Impl): same checks, then the app's implementation.
  if (!opts.allowWeak) checkKdfParams(kdf, opts.kdfMin);
  const pw = utf8(password.normalize("NFKC"));
  try {
    return await custom({ type: "argon2id", password: pw, salt: fromB64u(kdf.salt), m: kdf.m, t: kdf.t, p: kdf.p, dkLen: 32 });
  } finally {
    wipe(pw);
  }
}

export async function deriveAuk(password: string, kdf: KdfParams, secretKey: Uint8Array, opts: DeriveAukOptions = {}): Promise<Uint8Array> {
  if (!getArgon2Override()) return call((c) => c.deriveAuk(password, kdf, secretKey, opts));
  const stretched = await stretchPassword(password, kdf, opts);
  try {
    return hkdf(stretched, secretKey, "ov-auk-v1", 32);
  } finally {
    wipe(stretched);
  }
}

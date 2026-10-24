/** SPEC §3: Account Unlock Key. */
import { OpenVireoError } from "../errors.js";
import { b64u, fromB64u, randomBytes, utf8, wipe } from "../util/bytes.js";
import { argon2 } from "./argon2.js";
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
  return { alg: "argon2id", salt: b64u(randomBytes(16)), ...KDF_DEFAULTS, ...overrides };
}

/** Clients refuse m < 19456 or t < 2 (or the server's stricter `kdf_min`). */
export function checkKdfParams(kdf: KdfParams, min: { m: number; t: number } = KDF_MIN): void {
  if (kdf.alg !== "argon2id") throw new OpenVireoError("weak_kdf", `unsupported KDF ${String(kdf.alg)}`);
  if (!(kdf.m >= min.m) || !(kdf.t >= min.t) || !(kdf.p >= 1)) {
    throw new OpenVireoError("weak_kdf", `KDF parameters below the minimum (m >= ${min.m}, t >= ${min.t})`);
  }
}

/** UTF-8 of the NFKC-normalized password, not trimmed. Also the OPAQUE password input (§8). */
export const passwordBytes = (password: string): Uint8Array => utf8(password.normalize("NFKC"));

export interface DeriveAukOptions {
  /** Skip the minimum-cost check (test vectors use m=1024). Never set this for server-provided params. */
  allowWeak?: boolean;
  kdfMin?: { m: number; t: number };
}

/** Argon2id(pw, salt) then HKDF(ikm=stretched, salt=SecretKey, info="ov-auk-v1"). */
export async function stretchPassword(password: string, kdf: KdfParams, opts: DeriveAukOptions = {}): Promise<Uint8Array> {
  if (!opts.allowWeak) checkKdfParams(kdf, opts.kdfMin);
  const pw = passwordBytes(password);
  try {
    return await argon2({ type: "argon2id", password: pw, salt: fromB64u(kdf.salt), m: kdf.m, t: kdf.t, p: kdf.p, dkLen: 32 });
  } finally {
    wipe(pw);
  }
}

export async function deriveAuk(password: string, kdf: KdfParams, secretKey: Uint8Array, opts: DeriveAukOptions = {}): Promise<Uint8Array> {
  const stretched = await stretchPassword(password, kdf, opts);
  try {
    return hkdf(stretched, secretKey, "ov-auk-v1", 32);
  } finally {
    wipe(stretched);
  }
}

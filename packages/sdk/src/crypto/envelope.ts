/** SPEC §4 (wrap) and §6 (seal). */
import { OpenVireoError } from "../errors.js";
import { concat, randomBytes, wipe } from "../util/bytes.js";
import {
  NONCE_BYTES,
  aeadDecrypt,
  aeadEncrypt,
  hkdf,
  x25519PublicKey,
  x25519RandomSecret,
  x25519Shared,
} from "./primitives.js";

const VERSION = 0x01;

function decrypt(key: Uint8Array, nonce: Uint8Array, ct: Uint8Array, aad: string): Uint8Array {
  try {
    return aeadDecrypt(key, nonce, ct, aad);
  } catch (e) {
    throw new OpenVireoError("decryption_failed", "decryption failed (wrong key, wrong AAD or corrupted data)", undefined, {
      cause: e,
    });
  }
}

function checkVersion(blob: Uint8Array, minLength: number): void {
  if (blob.length === 0 || blob[0] !== VERSION) {
    throw new OpenVireoError("unsupported_version", `unsupported envelope version ${blob[0] ?? "(empty)"}`);
  }
  if (blob.length < minLength) throw new OpenVireoError("decryption_failed", "envelope too short");
}

/** wrap(key, plaintext, aad) = 0x01 ‖ nonce(24) ‖ XChaCha20-Poly1305(key, nonce, plaintext, aad). `nonce` is for tests. */
export function wrap(key: Uint8Array, plaintext: Uint8Array, aad: string, nonce: Uint8Array = randomBytes(NONCE_BYTES)): Uint8Array {
  return concat(new Uint8Array([VERSION]), nonce, aeadEncrypt(key, nonce, plaintext, aad));
}

export function unwrap(key: Uint8Array, blob: Uint8Array, aad: string): Uint8Array {
  checkVersion(blob, 1 + NONCE_BYTES + 16);
  return decrypt(key, blob.subarray(1, 1 + NONCE_BYTES), blob.subarray(1 + NONCE_BYTES), aad);
}

function sealKey(shared: Uint8Array, epk: Uint8Array, recipientPk: Uint8Array): Uint8Array {
  if (shared.every((b) => b === 0)) throw new OpenVireoError("low_order_point", "X25519 result is all zero");
  return hkdf(shared, concat(epk, recipientPk), "ov-seal-v1", 32);
}

function sharedSecret(sk: Uint8Array, pk: Uint8Array): Uint8Array {
  try {
    return x25519Shared(sk, pk);
  } catch (e) {
    // noble rejects low-order points itself
    throw new OpenVireoError("low_order_point", "invalid X25519 public key", undefined, { cause: e });
  }
}

export interface SealOptions {
  /** fixed ephemeral secret key, for test vectors only */
  ephemeralSecretKey?: Uint8Array;
  /** fixed nonce, for test vectors only */
  nonce?: Uint8Array;
}

/** sealed = 0x01 ‖ epk(32) ‖ nonce(24) ‖ XChaCha20-Poly1305(key, nonce, plaintext, aad), "ov-seal-v1". */
export function seal(recipientEncPk: Uint8Array, plaintext: Uint8Array, aad: string, opts: SealOptions = {}): Uint8Array {
  const esk = opts.ephemeralSecretKey?.slice() ?? x25519RandomSecret();
  const epk = x25519PublicKey(esk);
  const shared = sharedSecret(esk, recipientEncPk);
  const key = sealKey(shared, epk, recipientEncPk);
  const nonce = opts.nonce ?? randomBytes(NONCE_BYTES);
  try {
    return concat(new Uint8Array([VERSION]), epk, nonce, aeadEncrypt(key, nonce, plaintext, aad));
  } finally {
    wipe(esk, shared, key);
  }
}

/** Exposed for the test vectors (`derived_key_hex`). */
export function sealDerivedKey(recipientEncSk: Uint8Array, sealed: Uint8Array): Uint8Array {
  checkVersion(sealed, 1 + 32 + NONCE_BYTES + 16);
  const epk = sealed.subarray(1, 33);
  const shared = sharedSecret(recipientEncSk, epk);
  try {
    return sealKey(shared, epk, x25519PublicKey(recipientEncSk));
  } finally {
    wipe(shared);
  }
}

export function unseal(recipientEncSk: Uint8Array, sealed: Uint8Array, aad: string): Uint8Array {
  const key = sealDerivedKey(recipientEncSk, sealed);
  try {
    return decrypt(key, sealed.subarray(33, 33 + NONCE_BYTES), sealed.subarray(33 + NONCE_BYTES), aad);
  } finally {
    wipe(key);
  }
}

// ---- AAD strings (SPEC §4, §6), used byte for byte
export const AAD = {
  keyset: "ov-keyset-v1",
  vaultKey: (vaultId: string) => `ov-vault-key|${vaultId}`,
  vaultName: (vaultId: string) => `ov-vault-name|${vaultId}`,
  saMaster: (saId: string) => `ov-sa-master-v1|${saId}`,
} as const;

export const sealVaultKey = (recipientEncPk: Uint8Array, vaultId: string, vaultKey: Uint8Array, opts?: SealOptions) =>
  seal(recipientEncPk, vaultKey, AAD.vaultKey(vaultId), opts);
export const unsealVaultKey = (encSk: Uint8Array, vaultId: string, sealed: Uint8Array) =>
  unseal(encSk, sealed, AAD.vaultKey(vaultId));
export const sealSaMaster = (recipientEncPk: Uint8Array, saId: string, master: Uint8Array, opts?: SealOptions) =>
  seal(recipientEncPk, master, AAD.saMaster(saId), opts);
export const unsealSaMaster = (encSk: Uint8Array, saId: string, sealed: Uint8Array) =>
  unseal(encSk, sealed, AAD.saMaster(saId));

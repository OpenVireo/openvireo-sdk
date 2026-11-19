/** SPEC §4 (wrap) and §6 (seal), on the shared Rust core (ov-crypto). */
import { call } from "../core/full.js";

export interface SealOptions {
  /** fixed ephemeral secret key, for test vectors only */
  ephemeralSecretKey?: Uint8Array;
  /** fixed nonce, for test vectors only */
  nonce?: Uint8Array;
}

/** wrap(key, plaintext, aad) = 0x01 ‖ nonce(24) ‖ XChaCha20-Poly1305(key, nonce, plaintext, aad). `nonce` is for tests. */
export function wrap(key: Uint8Array, plaintext: Uint8Array, aad: string, nonce?: Uint8Array): Uint8Array {
  return call((c) => c.wrap(key, plaintext, aad, nonce));
}

export function unwrap(key: Uint8Array, blob: Uint8Array, aad: string): Uint8Array {
  return call((c) => c.unwrap(key, blob, aad));
}

/** sealed = 0x01 ‖ epk(32) ‖ nonce(24) ‖ XChaCha20-Poly1305(key, nonce, plaintext, aad), "ov-seal-v1". */
export function seal(recipientEncPk: Uint8Array, plaintext: Uint8Array, aad: string, opts: SealOptions = {}): Uint8Array {
  return call((c) => c.seal(recipientEncPk, plaintext, aad, opts));
}

/** Exposed for the test vectors (`derived_key_hex`). */
export function sealDerivedKey(recipientEncSk: Uint8Array, sealed: Uint8Array): Uint8Array {
  return call((c) => c.sealDerivedKey(recipientEncSk, sealed));
}

export function unseal(recipientEncSk: Uint8Array, sealed: Uint8Array, aad: string): Uint8Array {
  return call((c) => c.unseal(recipientEncSk, sealed, aad));
}

// ---- AAD strings (SPEC §4, §6, §22), used byte for byte
export const AAD = {
  keyset: "ov-keyset-v1",
  vaultKey: (vaultId: string) => `ov-vault-key|${vaultId}`,
  vaultName: (vaultId: string) => `ov-vault-name|${vaultId}`,
  saMaster: (saId: string) => `ov-sa-master-v1|${saId}`,
  share: (shareId: string) => `ov-share-v1|${shareId}`,
  shareRef: (shareId: string) => `ov-share-ref|${shareId}`,
} as const;

export const sealVaultKey = (recipientEncPk: Uint8Array, vaultId: string, vaultKey: Uint8Array, opts?: SealOptions): Uint8Array =>
  call((c) => c.sealVaultKey(recipientEncPk, vaultId, vaultKey, opts));
export const unsealVaultKey = (encSk: Uint8Array, vaultId: string, sealed: Uint8Array): Uint8Array =>
  call((c) => c.unsealVaultKey(encSk, vaultId, sealed));
export const sealSaMaster = (recipientEncPk: Uint8Array, saId: string, master: Uint8Array, opts?: SealOptions): Uint8Array =>
  call((c) => c.sealSaMaster(recipientEncPk, saId, master, opts));
export const unsealSaMaster = (encSk: Uint8Array, saId: string, sealed: Uint8Array): Uint8Array =>
  call((c) => c.unsealSaMaster(encSk, saId, sealed));

/** SPEC §4: encrypted vault names, on the shared Rust core (ov-crypto). */
import { call } from "../core/full.js";

export const vaultNameKey = (vaultKey: Uint8Array): Uint8Array => call((c) => c.vaultNameKey(vaultKey));

export function encryptVaultName(vaultKey: Uint8Array, vaultId: string, name: string, nonce?: Uint8Array): string {
  return call((c) => c.encryptVaultName(vaultKey, vaultId, name, nonce));
}

export function decryptVaultName(vaultKey: Uint8Array, vaultId: string, encryptedName: string): string {
  return call((c) => c.decryptVaultName(vaultKey, vaultId, encryptedName));
}

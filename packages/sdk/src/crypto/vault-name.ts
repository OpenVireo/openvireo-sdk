/** SPEC §4: encrypted vault names. */
import { b64u, fromB64u, fromUtf8, utf8, wipe } from "../util/bytes.js";
import { AAD, unwrap, wrap } from "./envelope.js";
import { hkdf } from "./primitives.js";

export const vaultNameKey = (vaultKey: Uint8Array): Uint8Array => hkdf(vaultKey, new Uint8Array(0), "kpx-vault-name-v1", 32);

export function encryptVaultName(vaultKey: Uint8Array, vaultId: string, name: string, nonce?: Uint8Array): string {
  const k = vaultNameKey(vaultKey);
  try {
    return b64u(wrap(k, utf8(name), AAD.vaultName(vaultId), nonce));
  } finally {
    wipe(k);
  }
}

export function decryptVaultName(vaultKey: Uint8Array, vaultId: string, encryptedName: string): string {
  const k = vaultNameKey(vaultKey);
  try {
    return fromUtf8(unwrap(k, fromB64u(encryptedName), AAD.vaultName(vaultId)));
  } finally {
    wipe(k);
  }
}

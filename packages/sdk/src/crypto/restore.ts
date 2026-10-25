/** SPEC §18: restoring archived vault keys after an account reset (proof and reseal). */
import { concat, utf8, wipe } from "../util/bytes.js";
import { type SealOptions, sealVaultKey, unsealVaultKey } from "./envelope.js";
import type { PublicKeys } from "./keyset.js";
import { ed25519Sign, ed25519Verify } from "./primitives.js";

/** "ov-restore-v1" ‖ utf8(user id) ‖ current enc_pk ‖ current sign_pk. The user id is the 36-character uuid. */
export const restoreProofMessage = (userId: string, current: Pick<PublicKeys, "encPk" | "signPk">): Uint8Array =>
  concat(utf8("ov-restore-v1"), utf8(userId), current.encPk, current.signPk);

/** proof = Ed25519.sign(old sign_seed, restoreProofMessage(...)): shows the restorer holds the old keyset. */
export const restoreProof = (oldSignSeed: Uint8Array, userId: string, current: Pick<PublicKeys, "encPk" | "signPk">): Uint8Array =>
  ed25519Sign(restoreProofMessage(userId, current), oldSignSeed);

/** What the server checks: the proof against the archived sign_pk. */
export const verifyRestoreProof = (proof: Uint8Array, userId: string, current: Pick<PublicKeys, "encPk" | "signPk">, oldSignPk: Uint8Array): boolean =>
  proof.length === 64 && ed25519Verify(proof, restoreProofMessage(userId, current), oldSignPk);

/**
 * Unseals an archived vault key with the old enc_sk (AAD `ov-vault-key|<vault>`) and seals it to the
 * current enc_pk. `opts` (fixed ephemeral key and nonce) is for test vectors only.
 */
export function resealVaultKey(oldEncSk: Uint8Array, currentEncPk: Uint8Array, vaultId: string, sealed: Uint8Array, opts?: SealOptions): Uint8Array {
  const key = unsealVaultKey(oldEncSk, vaultId, sealed);
  try {
    return sealVaultKey(currentEncPk, vaultId, key, opts);
  } finally {
    wipe(key);
  }
}

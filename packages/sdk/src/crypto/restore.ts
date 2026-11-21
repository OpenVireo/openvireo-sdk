/** SPEC §18: restoring archived vault keys after an account reset (proof and reseal), on the core. */
import { call } from "../core/full.js";
import type { SealOptions } from "./envelope.js";
import type { PublicKeys } from "./keyset.js";

type Current = Pick<PublicKeys, "encPk" | "signPk">;
const cur = (k: Current) => ({ encPk: k.encPk, signPk: k.signPk });

/** "ov-restore-v1" ‖ utf8(user id) ‖ current enc_pk ‖ current sign_pk. The user id is the 36-character uuid. */
export const restoreProofMessage = (userId: string, current: Current): Uint8Array => call((c) => c.restoreProofMessage(userId, cur(current)));

/** proof = Ed25519.sign(old sign_seed, restoreProofMessage(...)): shows the restorer holds the old keyset. */
export const restoreProof = (oldSignSeed: Uint8Array, userId: string, current: Current): Uint8Array =>
  call((c) => c.restoreProof(oldSignSeed, userId, cur(current)));

/** What the server checks: the proof against the archived sign_pk. */
export const verifyRestoreProof = (proof: Uint8Array, userId: string, current: Current, oldSignPk: Uint8Array): boolean =>
  proof.length === 64 && call((c) => c.verifyRestoreProof(proof, userId, cur(current), oldSignPk));

/**
 * Unseals an archived vault key with the old enc_sk (AAD `ov-vault-key|<vault>`) and seals it to the
 * current enc_pk. `opts` (fixed ephemeral key and nonce) is for test vectors only.
 */
export function resealVaultKey(oldEncSk: Uint8Array, currentEncPk: Uint8Array, vaultId: string, sealed: Uint8Array, opts?: SealOptions): Uint8Array {
  return call((c) => c.resealVaultKey(oldEncSk, currentEncPk, vaultId, sealed, opts));
}

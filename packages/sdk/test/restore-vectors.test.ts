import { describe, expect, it } from "vitest";
import {
  b64u,
  fromB64u,
  fromHex,
  keysetFromSecrets,
  publicKeysToJson,
  resealVaultKey,
  restoreProof,
  restoreProofMessage,
  toHex,
  unsealVaultKey,
  unwrapKeyset,
  verifyRestoreProof,
} from "../src/crypto/index.js";
import { V } from "./vectors.js";

describe("§18 restore proof and reseal", () => {
  const r = V.restore_proof;
  const old = unwrapKeyset(fromHex(V.keyset.auk_hex), { ...V.keyset.public, wrapped: V.keyset.wrapped });
  const current = keysetFromSecrets(fromHex(r.new_enc_sk_hex), fromHex(r.new_sign_seed_hex));
  const vaultId = r.reseal.aad.slice("ov-vault-key|".length);

  it("the archived keyset is the keyset vector", () => {
    expect(b64u(old.signPk)).toBe(r.old_sign_pk);
    expect(publicKeysToJson(current)).toEqual({ enc_pk: r.new_public.enc_pk, sign_pk: r.new_public.sign_pk, sig: r.new_public.sig });
  });

  it("builds the message and the proof byte for byte", () => {
    expect(toHex(restoreProofMessage(r.user_id, current))).toBe(r.message_hex);
    expect(b64u(restoreProof(old.signSeed, r.user_id, current))).toBe(r.proof);
    expect(verifyRestoreProof(fromB64u(r.proof), r.user_id, current, fromB64u(r.old_sign_pk))).toBe(true);
  });

  for (const n of r.invalid) {
    it(`rejects: ${n.case}`, () => {
      expect(verifyRestoreProof(fromB64u(n.proof), r.user_id, current, fromB64u(r.old_sign_pk))).toBe(false);
    });
  }

  it("reseals seal[0]'s vault key to the current keyset byte for byte", () => {
    expect(r.reseal.archived_sealed_key).toBe(V.seal[0].sealed);
    const sealed = resealVaultKey(old.encSk, current.encPk, vaultId, fromB64u(r.reseal.archived_sealed_key), {
      ephemeralSecretKey: fromHex(r.reseal.ephemeral_sk_hex),
      nonce: fromHex(r.reseal.nonce_hex),
    });
    expect(b64u(sealed)).toBe(r.reseal.sealed);
    expect(toHex(unsealVaultKey(current.encSk, vaultId, sealed))).toBe(V.seal[0].plaintext_hex);
  });

  it("a reseal under another vault's AAD fails", () => {
    expect(() => resealVaultKey(old.encSk, current.encPk, "00000000-0000-0000-0000-000000000000", fromB64u(r.reseal.archived_sealed_key))).toThrow(
      expect.objectContaining({ code: "decryption_failed" }),
    );
  });
});

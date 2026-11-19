/** SPEC §5: keysets, signed public keys and fingerprints, on the shared Rust core (ov-crypto). */
import { call } from "../core/full.js";
import { wipe } from "../util/bytes.js";

/** The JSON shape of PublicKeys in openapi.yaml. */
export interface PublicKeysJson {
  enc_pk: string;
  sign_pk: string;
  sig: string;
}
/** WrappedKeyset in openapi.yaml. */
export interface WrappedKeysetJson extends PublicKeysJson {
  wrapped: string;
}

export interface PublicKeys {
  encPk: Uint8Array;
  signPk: Uint8Array;
  sig: Uint8Array;
}

/** A decrypted keyset. Keep it in memory only while unlocked and call `wipeKeyset` on lock. */
export interface Keyset extends PublicKeys {
  encSk: Uint8Array;
  signSeed: Uint8Array;
}

/** The core's records carry a `fingerprint`; the SDK's types don't. */
const pub = (p: PublicKeys & { fingerprint?: string }): PublicKeys => ({ encPk: p.encPk, signPk: p.signPk, sig: p.sig });
const ks = (k: Keyset & { fingerprint?: string }): Keyset => ({ encSk: k.encSk, signSeed: k.signSeed, encPk: k.encPk, signPk: k.signPk, sig: k.sig });
const withFp = (p: PublicKeys) => ({ ...p, fingerprint: "" });

export function keysetFromSecrets(encSk: Uint8Array, signSeed: Uint8Array): Keyset {
  return ks(call((c) => c.keysetFromSecrets(encSk, signSeed)));
}

export function generateKeyset(): Keyset {
  return ks(call((c) => c.generateKeyset()));
}

/** Checks `sig` over the public keys. Every client does this before sealing anything to them. */
export function verifyPublicKeys(p: PublicKeys): boolean {
  if (p.encPk.length !== 32 || p.signPk.length !== 32 || p.sig.length !== 64) return false;
  return call((c) => c.verifyPublicKeys(withFp(p)));
}

export function publicKeysFromJson(j: PublicKeysJson): PublicKeys {
  return pub(call((c) => c.publicKeysFromJson(j)));
}

/** Parses and verifies public keys from the server; throws `invalid_public_keys` if `sig` is wrong. */
export function trustedPublicKeys(j: PublicKeysJson): PublicKeys {
  return pub(call((c) => c.trustedPublicKeys(j)));
}

export function publicKeysToJson(p: PublicKeys): PublicKeysJson {
  return call((c) => c.publicKeysToJson(withFp(p)));
}

/** First 20 bytes of SHA-256("ov-fp-v1" ‖ enc_pk ‖ sign_pk), lowercase hex in groups of 4. */
export function fingerprint(p: Pick<PublicKeys, "encPk" | "signPk">): string {
  return call((c) => c.fingerprint(p.encPk, p.signPk));
}

/** Wraps enc_sk ‖ sign_seed with the AUK or SA master key ("ov-keyset-v1"). */
export function wrapKeyset(key: Uint8Array, k: Keyset, nonce?: Uint8Array): WrappedKeysetJson {
  return call((c) => c.wrapKeyset(key, { ...k, fingerprint: "" }, nonce));
}

/**
 * Unwraps a keyset and checks that the private keys match the stored public keys and signature, so a
 * server can't pair someone's wrapped secrets with other public keys.
 */
export function unwrapKeyset(key: Uint8Array, w: WrappedKeysetJson): Keyset {
  return ks(call((c) => c.unwrapKeyset(key, w)));
}

export function wipeKeyset(k: Keyset | null | undefined): void {
  if (k) wipe(k.encSk, k.signSeed);
}

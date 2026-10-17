/** SPEC §5: keysets, signed public keys and fingerprints. */
import { KpxError } from "../errors.js";
import { b64u, concat, ctEqual, fromB64u, randomBytes, toHex, utf8, wipe } from "../util/bytes.js";
import { AAD, unwrap, wrap } from "./envelope.js";
import { ed25519PublicKey, ed25519Sign, ed25519Verify, sha256, x25519PublicKey, x25519RandomSecret } from "./primitives.js";

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

const pubkeysMessage = (encPk: Uint8Array, signPk: Uint8Array) => concat(utf8("kpx-pubkeys-v1"), encPk, signPk);

export function keysetFromSecrets(encSk: Uint8Array, signSeed: Uint8Array): Keyset {
  const encPk = x25519PublicKey(encSk);
  const signPk = ed25519PublicKey(signSeed);
  const sig = ed25519Sign(pubkeysMessage(encPk, signPk), signSeed);
  return { encSk: encSk.slice(), signSeed: signSeed.slice(), encPk, signPk, sig };
}

export function generateKeyset(): Keyset {
  const encSk = x25519RandomSecret();
  const signSeed = randomBytes(32);
  try {
    return keysetFromSecrets(encSk, signSeed);
  } finally {
    wipe(encSk, signSeed);
  }
}

/** Checks `sig` over the public keys. Every client does this before sealing anything to them. */
export function verifyPublicKeys(pub: PublicKeys): boolean {
  if (pub.encPk.length !== 32 || pub.signPk.length !== 32 || pub.sig.length !== 64) return false;
  return ed25519Verify(pub.sig, pubkeysMessage(pub.encPk, pub.signPk), pub.signPk);
}

export function publicKeysFromJson(j: PublicKeysJson): PublicKeys {
  return { encPk: fromB64u(j.enc_pk), signPk: fromB64u(j.sign_pk), sig: fromB64u(j.sig) };
}

/** Parses and verifies public keys from the server; throws `invalid_public_keys` if `sig` is wrong. */
export function trustedPublicKeys(j: PublicKeysJson): PublicKeys {
  const pub = publicKeysFromJson(j);
  if (!verifyPublicKeys(pub)) throw new KpxError("invalid_public_keys", "public key signature is invalid");
  return pub;
}

export function publicKeysToJson(pub: PublicKeys): PublicKeysJson {
  return { enc_pk: b64u(pub.encPk), sign_pk: b64u(pub.signPk), sig: b64u(pub.sig) };
}

/** First 20 bytes of SHA-256("kpx-fp-v1" ‖ enc_pk ‖ sign_pk), lowercase hex in groups of 4. */
export function fingerprint(pub: Pick<PublicKeys, "encPk" | "signPk">): string {
  const h = toHex(sha256(concat(utf8("kpx-fp-v1"), pub.encPk, pub.signPk)).subarray(0, 20));
  return h.match(/.{4}/g)!.join(" ");
}

/** Wraps enc_sk ‖ sign_seed with the AUK or SA master key ("kpx-keyset-v1"). */
export function wrapKeyset(key: Uint8Array, ks: Keyset, nonce?: Uint8Array): WrappedKeysetJson {
  const plain = concat(ks.encSk, ks.signSeed);
  try {
    return { ...publicKeysToJson(ks), wrapped: b64u(wrap(key, plain, AAD.keyset, nonce)) };
  } finally {
    wipe(plain);
  }
}

/**
 * Unwraps a keyset and checks that the private keys match the stored public keys and signature, so a
 * server can't pair someone's wrapped secrets with other public keys.
 */
export function unwrapKeyset(key: Uint8Array, w: WrappedKeysetJson): Keyset {
  const plain = unwrap(key, fromB64u(w.wrapped), AAD.keyset);
  if (plain.length !== 64) {
    wipe(plain);
    throw new KpxError("invalid_public_keys", "wrapped keyset has the wrong length");
  }
  const ks = keysetFromSecrets(plain.subarray(0, 32), plain.subarray(32, 64));
  wipe(plain);
  const stored = publicKeysFromJson(w);
  if (!ctEqual(ks.encPk, stored.encPk) || !ctEqual(ks.signPk, stored.signPk) || !verifyPublicKeys(stored)) {
    wipeKeyset(ks);
    throw new KpxError("invalid_public_keys", "keyset public keys don't match its private keys");
  }
  ks.sig = stored.sig;
  return ks;
}

export function wipeKeyset(ks: Keyset | null | undefined): void {
  if (ks) wipe(ks.encSk, ks.signSeed);
}

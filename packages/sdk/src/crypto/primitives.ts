/** Thin wrappers over @noble so the rest of the SDK names the SPEC's primitives, not a library. */
import { ed25519, x25519 } from "@noble/curves/ed25519.js";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { hkdf as nobleHkdf } from "@noble/hashes/hkdf.js";
import { sha256 as nobleSha256 } from "@noble/hashes/sha2.js";
import { utf8 } from "../util/bytes.js";

export const sha256 = (data: Uint8Array): Uint8Array => nobleSha256(data);

/** HKDF-SHA256 (RFC 5869). An empty salt means 32 zero bytes, which HMAC treats the same as no key. */
export const hkdf = (ikm: Uint8Array, salt: Uint8Array, info: string, length = 32): Uint8Array =>
  nobleHkdf(nobleSha256, ikm, salt, utf8(info), length);

export const aeadEncrypt = (key: Uint8Array, nonce: Uint8Array, plaintext: Uint8Array, aad: string): Uint8Array =>
  xchacha20poly1305(key, nonce, utf8(aad)).encrypt(plaintext);

export const aeadDecrypt = (key: Uint8Array, nonce: Uint8Array, ciphertext: Uint8Array, aad: string): Uint8Array =>
  xchacha20poly1305(key, nonce, utf8(aad)).decrypt(ciphertext);

export const x25519PublicKey = (sk: Uint8Array): Uint8Array => x25519.getPublicKey(sk);
export const x25519Shared = (sk: Uint8Array, pk: Uint8Array): Uint8Array => x25519.getSharedSecret(sk, pk);
export const x25519RandomSecret = (): Uint8Array => x25519.utils.randomSecretKey();

export const ed25519PublicKey = (seed: Uint8Array): Uint8Array => ed25519.getPublicKey(seed);
export const ed25519Sign = (message: Uint8Array, seed: Uint8Array): Uint8Array => ed25519.sign(message, seed);
export const ed25519Verify = (sig: Uint8Array, message: Uint8Array, pk: Uint8Array): boolean => {
  try {
    return ed25519.verify(sig, message, pk);
  } catch {
    return false;
  }
};

export const NONCE_BYTES = 24;
export const KEY_BYTES = 32;

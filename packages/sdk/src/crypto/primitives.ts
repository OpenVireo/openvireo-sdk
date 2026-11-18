/**
 * The SPEC's primitives, so the rest of the SDK names them, not a library. SHA-256, HKDF and
 * XChaCha20-Poly1305 run on the shared Rust core (`@openvireo/core-wasm`, ov-crypto). X25519 and
 * Ed25519 stay on @noble/curves until the core's WebAssembly binding exports them.
 */
import { ed25519, x25519 } from "@noble/curves/ed25519.js";
import { call } from "../core.js";
import { utf8 } from "../util/bytes.js";

export const sha256 = (data: Uint8Array): Uint8Array => call((c) => c.sha256(data));

/** HKDF-SHA256 (RFC 5869). An empty salt means 32 zero bytes, which HMAC treats the same as no key. */
export const hkdf = (ikm: Uint8Array, salt: Uint8Array, info: string, length = 32): Uint8Array =>
  call((c) => c.hkdfSha256(ikm, salt, utf8(info), length));

export const aeadEncrypt = (key: Uint8Array, nonce: Uint8Array, plaintext: Uint8Array, aad: string): Uint8Array =>
  call((c) => c.aeadEncrypt(key, nonce, plaintext, utf8(aad)));

export const aeadDecrypt = (key: Uint8Array, nonce: Uint8Array, ciphertext: Uint8Array, aad: string): Uint8Array =>
  call((c) => c.aeadDecrypt(key, nonce, ciphertext, utf8(aad)));

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

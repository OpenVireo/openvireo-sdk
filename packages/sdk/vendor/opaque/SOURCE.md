# OPAQUE WASM module

`opaque-wasm.js` is the WASM module built from `../../opaque-wasm/` (opaque-ke 4.0.1, RFC 9807),
base64-inlined in an ES module (`export default "<base64>"`). It has no imports: the SDK passes in a
32-byte seed from `crypto.getRandomValues` for every operation that needs randomness.

- Suite: ristretto255 OPRF and 3DH, SHA-512, KSF Argon2id v1.3 with 64 MiB, 2 passes, 1 lane and an
  all-zero 16-byte salt. That is libsodium's `crypto_pwhash` INTERACTIVE setting, which libopaque
  (Flask, Qt) uses, so the module talks to the libopaque server and shares records with the C client.
  `test/opaque-interop.test.ts` checks both directions against the C core.
- Build: `opaque-wasm/build.sh` (Rust pinned by `opaque-wasm/rust-toolchain.toml`, dependencies by the
  committed `Cargo.lock`, paths remapped). A clean rebuild gives the same bytes:
  - WASM SHA-256: `04140d3ac5ad8913843aa9a883e1840bcfe9e90e88d5c0ad94a887c8c54ca845` (118283 bytes)
  - `opaque-wasm.js` SHA-256: `3586f4501f8616264267907cd9aed548776db8ed3c3533bf9d51f9a2c6075e3d`
- License: MIT OR Apache-2.0. The crates compiled into it are MIT, Apache-2.0 or BSD
  (`curve25519-dalek` and `subtle` are BSD-3-Clause); their notices are in `THIRD-PARTY-LICENSES.txt`,
  which the build regenerates.

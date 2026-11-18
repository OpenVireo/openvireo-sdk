# OPAQUE WASM module

`opaque-wasm.js` is the legacy OPAQUE WASM module of the shared Rust core: openvireo-core
`crates/ov-opaque` (feature `legacy-c-abi`, opaque-ke 4.0.1, RFC 9807) at commit `4d123cb`,
base64-inlined in an ES module (`export default "<base64>"`). It has no imports: the SDK passes in a
32-byte seed from `crypto.getRandomValues` for every operation that needs randomness. Its source used
to live in this repo as `opaque-wasm/`; it moved into openvireo-core with its history.

The SDK keeps this module (rather than `@openvireo/core-wasm`) for `@openvireo/sdk/opaque` until the
core's WebAssembly binding exports the OPAQUE client and test-server steps.

- Suite: ristretto255 OPRF and 3DH, SHA-512, KSF Argon2id v1.3 with 64 MiB, 2 passes, 1 lane and an
  all-zero 16-byte salt. That is libsodium's `crypto_pwhash` INTERACTIVE setting, which libopaque
  (Flask, Qt) uses, so the module talks to the libopaque server and shares records with the C client.
  `test/opaque-interop.test.ts` checks both directions against the C core.
- Build, from an openvireo-core checkout at `4d123cb`: `crates/ov-opaque/build.sh <this directory>`
  (Rust pinned by the root `rust-toolchain.toml`, dependencies by the committed `Cargo.lock`, paths
  remapped). Built that way for this commit:
  - WASM SHA-256: `dea58fea7e472712886780cc74dc3bf2275ecb44e824c9be697793cd7d5dbe36` (119746 bytes)
  - `opaque-wasm.js` SHA-256: `92d871a38a0dc818b8fe108ca0d18ee35a82c9156f070dc86e19fdd91cfd515e`
- License: MIT OR Apache-2.0. The crates compiled into it are MIT, Apache-2.0 or BSD
  (`curve25519-dalek` and `subtle` are BSD-3-Clause); their notices are in `THIRD-PARTY-LICENSES.txt`,
  which the build regenerates.

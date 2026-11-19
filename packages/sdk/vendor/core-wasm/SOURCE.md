# @openvireo/core-wasm (vendored)

`openvireo-core-wasm-0.0.0.tgz` is the unmodified `npm pack` of the `@openvireo/core-wasm` package (the
shared Rust core compiled to WebAssembly: the full module, the lite primitives + share-link module, and
the JS loaders and host adapters), built from openvireo-core at commit `ca2f211` (`contract-v1.6`,
"Merge W3-A3 …"). The SDK depends on it with
`"@openvireo/core-wasm": "file:vendor/core-wasm/openvireo-core-wasm-0.0.0.tgz"` until the package is
published; then this directory goes and the dependency pins the published version (W4-R).

A `file:` dependency inside a published or packed package doesn't install for its consumers: until W4-R
pins the published package, an app testing a packed SDK adds
`"overrides": { "@openvireo/core-wasm": "file:<this tarball>" }` to its own package.json.

- Build, from an openvireo-core checkout at `ca2f211`: `cargo run -p xtask --target-dir <own dir> -- wasm`
  (Rust pinned by `rust-toolchain.toml`, wasm-bindgen CLI 0.2.130, wasm-opt version 133 `-Oz`),
  then `npm pack` in `bindings/ov-wasm/pkg/`.
- Size report of that build:

  | file | raw bytes | gzip -9 |
  |---|---|---|
  | full ov_wasm_bg.wasm (wasm-bindgen) | 4708429 | 1080990 |
  | full ov_wasm_bg.wasm (final) | 2196925 | 882896 |
  | full glue .js | 232948 | 28622 |
  | full wasm-base64.js (embedded) | 2929254 | 1177373 |
  | lite ov_wasm_lite_bg.wasm (wasm-bindgen) | 679079 | 219465 |
  | lite ov_wasm_lite_bg.wasm (final) | 405512 | 191616 |
  | lite glue .js | 42596 | 8072 |
  | lite wasm-base64.js (embedded) | 540702 | 241128 |

- SHA-256:
  - `openvireo-core-wasm-0.0.0.tgz`: `a6532e30d11d175390abfc3b1c01deb4b94310772a8f0057804b8f1c8ed9bb3f`
  - `gen/ov_wasm_bg.wasm`: `9b36ea8e50c533248602f4a3d3a8ea44d55522d037ed422a1c54106f35cbdc9f`
  - `gen/lite/ov_wasm_lite_bg.wasm`: `0fff92574e6983d761cd669772eab716b2471d2b494a29c951842e08919645e3`
- License: MIT OR Apache-2.0 (openvireo-core).

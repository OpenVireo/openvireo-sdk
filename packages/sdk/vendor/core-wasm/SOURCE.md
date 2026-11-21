# @openvireo/core-wasm (vendored)

`openvireo-core-wasm-0.0.0.tgz` is the unmodified `npm pack` of the `@openvireo/core-wasm` package (the
shared Rust core compiled to WebAssembly: the full module, the lite primitives + share-link module, and
the JS loaders and host adapters), built from openvireo-core at commit `966606d` (`contract-v1.8`,
develop after merging W3-A5). The SDK depends on it with
`"@openvireo/core-wasm": "file:vendor/core-wasm/openvireo-core-wasm-0.0.0.tgz"` until the package is
published; then this directory goes and the dependency pins the published version (W4-R).

A `file:` dependency inside a published or packed package doesn't install for its consumers: until W4-R
pins the published package, an app testing a packed SDK adds
`"overrides": { "@openvireo/core-wasm": "file:<this tarball>" }` to its own package.json.

- Build, from an openvireo-core checkout at `966606d344e970062589a423eb70c9d20137f605`: `cargo run -p xtask --target-dir <own dir> -- wasm`
  (Rust pinned by `rust-toolchain.toml`, wasm-bindgen CLI 0.2.130, wasm-opt version 133 `-Oz`),
  then `npm pack` in `bindings/ov-wasm/pkg/`.
- Size report of that build:

  | file | raw bytes | gzip -9 |
  |---|---|---|
  | full ov_wasm_bg.wasm (wasm-bindgen) | 4810838 | 1105874 |
  | full ov_wasm_bg.wasm (final) | 2252639 | 905107 |
  | full glue .js | 237276 | 29057 |
  | full wasm-base64.js (embedded) | 3003538 | 1204857 |
  | lite ov_wasm_lite_bg.wasm (wasm-bindgen) | 679079 | 219465 |
  | lite ov_wasm_lite_bg.wasm (final) | 405512 | 191616 |
  | lite glue .js | 42596 | 8072 |
  | lite wasm-base64.js (embedded) | 540702 | 241128 |

- SHA-256:
  - `openvireo-core-wasm-0.0.0.tgz`: `442b26a0fbfaffe55d5f899e11c27b834767b229d371707b07450ea484b210d3`
  - `gen/ov_wasm_bg.wasm`: `291fcdae02946f4d99f68af104feca3f22fa372186f77e606ec10ace76223890`
  - `gen/lite/ov_wasm_lite_bg.wasm`: `0fff92574e6983d761cd669772eab716b2471d2b494a29c951842e08919645e3`
- License: MIT OR Apache-2.0 (openvireo-core).

# @openvireo/core-wasm (vendored)

`openvireo-core-wasm-0.0.0.tgz` is the unmodified `npm pack` of the `@openvireo/core-wasm` package (the
shared Rust core compiled to WebAssembly: the full module, the lite primitives + share-link module, and
the JS loaders and host adapters), built from openvireo-core at commit `bd1f656` (develop, contract-v1.9,
with the KeePassXC save-stamp merge fix). The SDK depends on it with
`"@openvireo/core-wasm": "file:vendor/core-wasm/openvireo-core-wasm-0.0.0.tgz"` until the package is
published; then this directory goes and the dependency pins the published version (W4-R).

A `file:` dependency inside a published or packed package doesn't install for its consumers: until W4-R
pins the published package, an app testing a packed SDK adds
`"overrides": { "@openvireo/core-wasm": "file:<this tarball>" }` to its own package.json.

- Build, from an openvireo-core checkout at `bd1f656053ce540b69b819426d7c0800ad83f845`: `cargo run -p xtask --target-dir <own dir> -- wasm`
  (Rust pinned by `rust-toolchain.toml`, wasm-bindgen CLI 0.2.130, wasm-opt version 133 `-Oz`),
  then `npm pack` in `bindings/ov-wasm/pkg/`.
- Size report of that build:

  | file | raw bytes | gzip -9 |
  |---|---|---|
  | full ov_wasm_bg.wasm (wasm-bindgen) | 4875435 | 1121972 |
  | full ov_wasm_bg.wasm (final) | 2277962 | 916250 |
  | full glue .js | 237276 | 29057 |
  | full wasm-base64.js (embedded) | 3037302 | 1221685 |
  | lite ov_wasm_lite_bg.wasm (wasm-bindgen) | 679730 | 219692 |
  | lite ov_wasm_lite_bg.wasm (final) | 406181 | 191919 |
  | lite glue .js | 42596 | 8072 |
  | lite wasm-base64.js (embedded) | 541594 | 241511 |

- SHA-256:
  - `openvireo-core-wasm-0.0.0.tgz`: `528c594d32254a1dd2614dc110b95a42c6d4b8c03a125d98e0bdcfd41caea8b5`
  - `gen/ov_wasm_bg.wasm`: `472b01cda670f3df4b9003b32ea0b701b132eab6380aa2bb65adeca49af10409`
  - `gen/lite/ov_wasm_lite_bg.wasm`: `835d39929da9841e3b6bcc2210f161ccac42823997cfec54ebb4371cae8f36b4`
- License: MIT OR Apache-2.0 (openvireo-core).

# @openvireo/core-wasm (vendored)

`openvireo-core-wasm-0.0.0.tgz` is the unmodified `npm pack` of the `@openvireo/core-wasm` package (the
shared Rust core compiled to WebAssembly: the full module, the lite primitives + share-link module, and
the JS loaders and host adapters), built from openvireo-core at commit `80ae01b` (`contract-v1.7`,
develop after merging W3-A4). The SDK depends on it with
`"@openvireo/core-wasm": "file:vendor/core-wasm/openvireo-core-wasm-0.0.0.tgz"` until the package is
published; then this directory goes and the dependency pins the published version (W4-R).

A `file:` dependency inside a published or packed package doesn't install for its consumers: until W4-R
pins the published package, an app testing a packed SDK adds
`"overrides": { "@openvireo/core-wasm": "file:<this tarball>" }` to its own package.json.

- Build, from an openvireo-core checkout at `80ae01b13f284ee2a92d31bcaa4424b535b8df94`: `cargo run -p xtask --target-dir <own dir> -- wasm`
  (Rust pinned by `rust-toolchain.toml`, wasm-bindgen CLI 0.2.130, wasm-opt version 133 `-Oz`),
  then `npm pack` in `bindings/ov-wasm/pkg/`.
- Size report of that build:

  | file | raw bytes | gzip -9 |
  |---|---|---|
  | full ov_wasm_bg.wasm (wasm-bindgen) | 4731051 | 1086718 |
  | full ov_wasm_bg.wasm (final) | 2208978 | 888449 |
  | full glue .js | 234118 | 28743 |
  | full wasm-base64.js (embedded) | 2945322 | 1183554 |
  | lite ov_wasm_lite_bg.wasm (wasm-bindgen) | 679079 | 219465 |
  | lite ov_wasm_lite_bg.wasm (final) | 405512 | 191616 |
  | lite glue .js | 42596 | 8072 |
  | lite wasm-base64.js (embedded) | 540702 | 241128 |

- SHA-256:
  - `openvireo-core-wasm-0.0.0.tgz`: `0524fd20af07854342ec84c7c483f5f752c5398b284de1c260cc66aef76234cb`
  - `gen/ov_wasm_bg.wasm`: `c0d62c6b0e69796328c919e4f4845228428fde417b39acd2a2d242bc27a94f29`
  - `gen/lite/ov_wasm_lite_bg.wasm`: `0fff92574e6983d761cd669772eab716b2471d2b494a29c951842e08919645e3`
- License: MIT OR Apache-2.0 (openvireo-core).

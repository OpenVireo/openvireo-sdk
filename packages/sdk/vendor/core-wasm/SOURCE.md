# @openvireo/core-wasm (vendored)

`openvireo-core-wasm-0.0.0.tgz` is the `npm pack` of the `@openvireo/core-wasm` package (the shared Rust
core compiled to WebAssembly, with its JS loader and host adapters), built from openvireo-core at commit
`4d123cb` ("Merge W2-A2: ov-core on ov-vault and ov-sync …", the Wave 2 gate). The SDK depends on it with
`"@openvireo/core-wasm": "file:vendor/core-wasm/openvireo-core-wasm-0.0.0.tgz"` until the package is
published; then this directory goes and the dependency pins the published version (W4-R).

**Local patch.** The tarball here is that package with one change to `index.js`, in `loader.patch`: the
loader imports its wasm-bindgen glue with `import(spec)`, a variable, which bundlers can't follow (Next.js
with Turbopack fails with "Cannot find module as expression is too dynamic", and esbuild/tsup bundles such
as the GitHub Action's leave `gen/ov_wasm.js` out). The patch uses the literal `import("./gen/ov_wasm.js")`
for the default instance (`loadCore({ fresh: true })` still uses the variable form). This is an
OWNER-REQUEST to openvireo-core `bindings/ov-wasm/npm/index.js`; drop the patch when the published package
has the fix.

A `file:` dependency inside a published or packed package doesn't install for its consumers: until W4-R
pins the published package, an app testing a packed SDK adds
`"overrides": { "@openvireo/core-wasm": "file:<this tarball>" }` to its own package.json.

- Build, from an openvireo-core checkout at `4d123cb`: `cargo xtask wasm` (Rust pinned by
  `rust-toolchain.toml`, wasm-bindgen CLI 0.2.130, wasm-opt version 133 `-Oz`), then
  `npm pack` in `bindings/ov-wasm/pkg/`, then `loader.patch` applied to `index.js` and packed again.
- Size report of that build (`cargo xtask wasm`):

  | file | raw bytes | gzip -9 |
  |---|---|---|
  | ov_wasm_bg.wasm (wasm-bindgen) | 4241305 | 982847 |
  | ov_wasm_bg.wasm (final, after wasm-opt) | 1983483 | 805789 |
  | ov_wasm.js (glue) | 144154 | 17992 |

- SHA-256:
  - `openvireo-core-wasm-0.0.0.tgz` (patched): `6bf4eb9ecd898dff307d0ec8cd66b8a98419c064df3af36c8b7dc7e4f8320312`
  - the unpatched `npm pack` tarball: `597247bd4c94ec1317632bbd3a42062564800830f34d404a1e68bc0b9639c88f`
  - `gen/ov_wasm_bg.wasm`: `c3ba64f07d8a577a34026783472cee26fd2badbc2ecfb00b5958168548a63edb`
  - `gen/wasm-base64.js`: `b47e13514d65e03bcddefcc5e5dcee73dd9ec566647a020996809fdd9e5ceafd`
  - `gen/ov_wasm.js`: `d99d81293aa04df8216025b663f2f3ca16e0513b7b0218e34001517183f803f3`
  - `index.js` (patched): `921e81a275b27106fadfd2d9d75c2486fb9af2a91e77864ac6b0ea765e3294f6`; unpatched: `d1ec6bf26baec63c9b0241c38225bde9a620939d7e019d7d108766627dbf7ece`
- License: MIT OR Apache-2.0 (openvireo-core).

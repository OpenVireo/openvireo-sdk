# Vendored libopaque JS/WASM build

`libopaque.cjs` is `js/dist/libopaque.js` from https://github.com/stef/libopaque at commit
`6e9ac92f9a2289679e04b0b0c5fdc307bb3de54e` (v1.0.1-4, "[mod] hidden visibility of symbol \"dump\""),
byte for byte. It was renamed to `.cjs` only so that Node treats it as CommonJS inside this ESM package.

- SHA-256: `38593c230548180d9bdb7b590738ec5c0928eb03c8adf3bcb7b57ec1fae4a488`
- Check: `git -C libopaque show 6e9ac92:js/dist/libopaque.js | shasum -a 256`
- License: GPL-3.0 (`LICENSE`, copied from `js/LICENSE` of the same commit). The libopaque C core is
  LGPL-3.0; the JS build is distributed under the GPL-3.0.
- The WASM is embedded in the file (base64), so no separate `.wasm` asset is needed.

Do **not** replace it with the npm package `libopaque@0.0.0-alpha.2`: it is incompatible with the
C/Python server at this commit (it fails in `finalizeRequest`). See `docs/plans/accounts/SPEC.md` §8
and `opaque-spike/` in the keepassxc repo.

Known quirks, handled in `src/opaque/index.ts`:

1. The high-level `createRegistrationRequest` / `createCredentialRequest` wrappers pass
   `pwdU.length` (UTF-16 code units) as the length of the UTF-8 encoded password, so any non-ASCII
   password is silently truncated and does not match the C core / Python / Qt clients. The SDK calls
   the raw exports (`_opaquejs_CreateRegistrationRequest`, `_opaquejs_CreateCredentialRequest`) with
   the real UTF-8 bytes instead.
2. In Node the module calls `process.removeAllListeners("uncaughtException")` and
   `("unhandledRejection")` when it loads. The SDK restores the host's listeners afterwards.

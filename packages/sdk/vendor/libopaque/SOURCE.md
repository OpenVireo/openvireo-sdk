# Vendored libopaque JS/WASM build

`libopaque.cjs` is a **release build** of https://github.com/stef/libopaque at commit
`6e9ac92f9a2289679e04b0b0c5fdc307bb3de54e` (v1.0.1-4) with liboprf `f925b87`, made with
`DEFINES=` empty in `emscripten/emsdk:1.40.1`. It was renamed to `.cjs` only so that Node treats it
as CommonJS inside this ESM package.

- SHA-256: `a96a09af1e96fb3ddb8e59344510bde093313fa6f004a9d8587b0cd30f99071e`
- Build: `docs/plans/accounts/opaque-spike/build-libopaque-wasm.sh` in the keepassxc repo (git + Docker).
  It also checks that every login request carries a fresh nonce.
- License: GPL-3.0 (`LICENSE`, copied from `js/LICENSE` of the same commit). The libopaque C core is
  LGPL-3.0; the JS build is distributed under the GPL-3.0.
- The WASM is embedded in the file (base64), so no separate `.wasm` asset is needed.

Never use either of these instead:

- **Upstream's `js/dist/libopaque.js` at 6e9ac92.** Its `js/Makefile` sets `DEFINES=-DTRACE -DNORANDOM`,
  so libopaque's randomness is the fixed sequence 00 01 02 … (constant login nonces and ephemeral
  keys, a constant registration envelope nonce) and it traces passwords and keys to the console.
  The SDK detects such a build (`opaqueBuildInfo()`) and refuses to run it by default.
- **The npm package `libopaque@0.0.0-alpha.2`.** It is incompatible with the C/Python server at this
  commit (it fails in `finalizeRequest`).

Known quirks of the wrapper, handled in `src/opaque/index.ts`:

1. The high-level `createRegistrationRequest` / `createCredentialRequest` wrappers pass
   `pwdU.length` (UTF-16 code units) as the length of the UTF-8 encoded password, so any non-ASCII
   password is silently truncated and does not match the C core / Python / Qt clients. The SDK calls
   the raw exports (`_opaquejs_CreateRegistrationRequest`, `_opaquejs_CreateCredentialRequest`) with
   the real UTF-8 bytes instead.
2. In Node the module calls `process.removeAllListeners("uncaughtException")` and
   `("unhandledRejection")` when it loads. The SDK restores the host's listeners afterwards.

import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "crypto/index": "src/crypto/index.ts",
    "opaque/index": "src/opaque/index.ts",
    "auth/index": "src/auth/index.ts",
    "auth/storage-node": "src/auth/storage-node.ts",
    "sync/index": "src/sync/index.ts",
    "vault/index": "src/vault/index.ts",
    "merge/index": "src/merge/index.ts",
    "testing/index": "src/testing/index.ts",
  },
  format: ["esm"],
  target: "es2022",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  // The OPAQUE WASM module stays a separate file next to dist/ (see vendor/opaque/SOURCE.md)
  external: ["@openvireo/sdk/vendor/opaque-wasm.js", "node:fs/promises", "node:path", "node:os"],
});

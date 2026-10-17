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
  },
  format: ["esm"],
  target: "es2022",
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  // The vendored libopaque build stays a separate file next to dist/ (see vendor/libopaque/SOURCE.md)
  external: ["@kpnx/sdk/vendor/libopaque.cjs", "node:fs/promises", "node:path", "node:os"],
});

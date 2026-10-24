import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const sdk = (p: string) => fileURLToPath(new URL(`../sdk/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@openvireo\/sdk$/, replacement: sdk("src/index.ts") },
      { find: /^@openvireo\/sdk\/storage\/node$/, replacement: sdk("src/auth/storage-node.ts") },
      { find: /^@openvireo\/cli$/, replacement: fileURLToPath(new URL("../cli/src/index.ts", import.meta.url)) },
      { find: /^@openvireo\/connect$/, replacement: fileURLToPath(new URL("../connect/src/index.ts", import.meta.url)) },
    ],
  },
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});

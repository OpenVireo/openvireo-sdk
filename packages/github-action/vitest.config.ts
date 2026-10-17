import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const sdk = (p: string) => fileURLToPath(new URL(`../sdk/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@kpnx\/sdk$/, replacement: sdk("src/index.ts") },
      { find: /^@kpnx\/sdk\/storage\/node$/, replacement: sdk("src/auth/storage-node.ts") },
      { find: /^@kpnx\/cli$/, replacement: fileURLToPath(new URL("../cli/src/index.ts", import.meta.url)) },
      { find: /^@kpnx\/connect$/, replacement: fileURLToPath(new URL("../connect/src/index.ts", import.meta.url)) },
    ],
  },
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    server: { deps: { external: [/vendor\/libopaque/] } },
  },
});

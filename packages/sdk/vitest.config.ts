import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    // Let Node load the vendored CommonJS libopaque build as is, like a consumer's runtime would
    server: { deps: { external: [/vendor\/libopaque/] } },
  },
});

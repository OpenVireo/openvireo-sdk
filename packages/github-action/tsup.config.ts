import { defineConfig } from "tsup";

// One self-contained file (GitHub runs dist/index.mjs from the checkout, without npm install).
// tsconfig.json maps @openvireo/* to their sources, so this doesn't depend on the other builds.
export default defineConfig({
  entry: { index: "src/index.ts" },
  outDir: "dist",
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  platform: "node",
  target: "node20",
  tsconfig: "tsconfig.json",
  noExternal: [/.*/],
  // OPAQUE (user login) is never used by a service account: leave the 250 KB WASM build out
  external: ["@openvireo/sdk/vendor/libopaque.cjs"],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  banner: { js: 'import { createRequire as __ovCreateRequire } from "node:module"; const require = __ovCreateRequire(import.meta.url);' },
});

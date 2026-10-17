import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", bin: "src/bin.ts" },
  format: ["esm"],
  target: "es2022",
  platform: "node",
  // the SDK's sources are only for type-checking; the build uses the package
  tsconfig: "tsconfig.build.json",
  dts: { entry: { index: "src/index.ts" } },
  sourcemap: true,
  clean: true,
  external: ["@kpnx/sdk", "@kpnx/sdk/storage/node"],
});

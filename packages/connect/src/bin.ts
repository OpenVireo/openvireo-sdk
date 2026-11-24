#!/usr/bin/env node
import { connectMain } from "./main.js";

const argv = process.argv.slice(2);
// Only when the bin serves: not for token, version or help, and never when used as a library
if ((argv[0] ?? "serve") === "serve") {
  process.stderr.write(
    "openvireo-connect is deprecated and this is its last release: use `ov connect` from openvireo-core " +
      "(https://github.com/OpenVireo/openvireo-core/releases) or the image ghcr.io/openvireo/openvireo-connect, " +
      "with the same environment variables and API.\n",
  );
}
connectMain(argv, { prog: "openvireo-connect", env: process.env, stdout: (s) => process.stdout.write(s), stderr: (s) => process.stderr.write(s) }).then(
  (code) => process.exit(code),
  (e: Error) => {
    process.stderr.write(`openvireo-connect: ${e.message}\n`);
    process.exit(1);
  },
);

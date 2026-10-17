#!/usr/bin/env node
import { connectMain } from "./main.js";

connectMain(process.argv.slice(2), { env: process.env, stdout: (s) => process.stdout.write(s), stderr: (s) => process.stderr.write(s) }).then(
  (code) => process.exit(code),
  (e: Error) => {
    process.stderr.write(`kpx connect: ${e.message}\n`);
    process.exit(1);
  },
);

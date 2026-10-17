import { run } from "./action.js";

process.exitCode = await run({ env: process.env, stdout: (s) => process.stdout.write(s) });

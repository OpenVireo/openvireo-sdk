#!/usr/bin/env node
import { createInterface } from "node:readline";
import { main } from "./main.js";

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

/** Asks on the terminal (stderr), without echo for hidden answers. Only when stdin is a TTY. */
function prompt(question: string, opts: { hidden?: boolean } = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = createInterface({ input: process.stdin, output: process.stderr, terminal: true });
    if (opts.hidden) {
      const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput.bind(rl);
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => write(s.startsWith(question) ? question : s.replace(/[^\r\n]/g, ""));
    }
    rl.on("SIGINT", () => {
      rl.close();
      reject(new Error("cancelled"));
    });
    rl.question(question, (answer) => {
      rl.close();
      if (opts.hidden) process.stderr.write("\n");
      resolve(answer);
    });
  });
}

main(process.argv.slice(2), {
  env: process.env,
  stdout: process.stdout,
  stderr: process.stderr,
  stdin: readStdin,
  prompt: process.stdin.isTTY ? prompt : undefined,
}).then(
  (code) => {
    process.exitCode = code;
  },
  (e: Error) => {
    process.stderr.write(`kpx: ${e.message}\n`);
    process.exitCode = 1;
  },
);

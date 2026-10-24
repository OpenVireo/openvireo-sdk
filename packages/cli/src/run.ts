/** `openvireo run`: start a command with references resolved in its environment and its output masked. */
import { spawn } from "node:child_process";
import { Masker } from "./mask.js";

/** Variables the child never gets: it should use the secrets, not the credentials that unlock them. */
export const STRIPPED_ENV = ["OPENVIREO_SERVICE_ACCOUNT_TOKEN", "OPENVIREO_SERVICE_ACCOUNT_TOKEN_FILE", "OPENVIREO_PASSWORD", "OPENVIREO_SECRET_KEY"];

export interface RunOptions {
  command: string;
  args: string[];
  env: Record<string, string>;
  /** values to mask in the child's stdout and stderr; null passes the output through untouched */
  secrets: string[] | null;
  stdout: { write(chunk: Uint8Array): unknown };
  stderr: { write(chunk: Uint8Array): unknown };
  /** after this long without output, bytes held back as a possible secret prefix are written (default 100 ms) */
  holdMs?: number;
}

/** Runs the command and resolves with its exit code (128 + n when killed by signal n, like a shell). */
export function runCommand(o: RunOptions): Promise<number> {
  return new Promise((resolve, reject) => {
    const masked = o.secrets !== null;
    const child = spawn(o.command, o.args, { env: o.env, stdio: ["inherit", masked ? "pipe" : "inherit", masked ? "pipe" : "inherit"] });
    const pipes: Promise<void>[] = [];
    if (masked) {
      for (const [from, to] of [
        [child.stdout!, o.stdout],
        [child.stderr!, o.stderr],
      ] as const) {
        const masker = new Masker(o.secrets!);
        let timer: ReturnType<typeof setTimeout> | null = null;
        const flushLater = () => {
          if (timer) clearTimeout(timer);
          timer = masker.pending ? setTimeout(() => to.write(masker.flush()), o.holdMs ?? 100) : null;
        };
        from.on("data", (chunk: Buffer) => {
          const out = masker.push(chunk);
          if (out.length) to.write(out);
          flushLater();
        });
        pipes.push(
          new Promise((done) =>
            from.on("end", () => {
              if (timer) clearTimeout(timer);
              const rest = masker.flush();
              if (rest.length) to.write(rest);
              done();
            }),
          ),
        );
      }
    }
    const forward = (sig: NodeJS.Signals) => () => child.kill(sig);
    const handlers = (["SIGINT", "SIGTERM", "SIGHUP"] as const).map((s) => [s, forward(s)] as const);
    for (const [s, h] of handlers) process.on(s, h);
    child.on("error", (e) => {
      for (const [s, h] of handlers) process.off(s, h);
      reject(e);
    });
    child.on("close", (code, signal) => {
      for (const [s, h] of handlers) process.off(s, h);
      void Promise.all(pipes).then(() => resolve(code ?? 128 + (signal ? signalNumber(signal) : 1)));
    });
  });
}

const SIGNALS: Record<string, number> = { SIGHUP: 1, SIGINT: 2, SIGQUIT: 3, SIGKILL: 9, SIGTERM: 15 };
const signalNumber = (s: string) => SIGNALS[s] ?? 1;

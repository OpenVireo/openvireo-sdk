/** `[serve]`, `token` and `version`: shared by the openvireo-connect bin and `ov connect` in the CLI. */
import { parseArgs } from "node:util";
import { OpenVireoError, type FetchLike } from "@openvireo/sdk";
import { VERSION, configFromEnv, startConnect } from "./server.js";
import { newConnectToken } from "./tokens.js";

export interface ConnectIo {
  /** how the usage and log lines name the program (default `openvireo-connect`; the CLI passes `ov connect`) */
  prog?: string;
  env: Record<string, string | undefined>;
  stdout: (s: string) => void;
  stderr: (s: string) => void;
  fetch?: FetchLike;
  /** resolves when the server should stop (default: SIGINT/SIGTERM) */
  stopSignal?: Promise<void>;
}

/** The usage text, naming the program as it was run (`openvireo-connect` or `ov connect`). */
export function connectUsage(prog = "openvireo-connect"): string {
  const col = " ".repeat(prog.length + 15);
  const row = (cmd: string, what: string) => `  ${`${prog} ${cmd}`.padEnd(col.length - 2)}${what}\n`;
  return (
    "Usage:\n" +
    row("[serve]", "run the REST server (configured by environment, see README)") +
    `  ${prog} token [--name N] [--vault V]... [--write]\n${col}create a bearer token; prints it and its config entry\n` +
    row("version", "print the version")
  );
}

/** @deprecated the usage as `ov connect`; use connectUsage(prog) */
export const CONNECT_USAGE = connectUsage("ov connect");

const untilSignal = () =>
  new Promise<void>((resolve) => {
    process.once("SIGINT", () => resolve());
    process.once("SIGTERM", () => resolve());
  });

export async function connectMain(argv: string[], io: ConnectIo): Promise<number> {
  const prog = io.prog ?? "openvireo-connect";
  const [cmd = "serve", ...rest] = argv;
  if (cmd === "-h" || cmd === "--help" || cmd === "help") {
    io.stdout(connectUsage(prog));
    return 0;
  }
  if (cmd === "version" || cmd === "--version") {
    io.stdout(`${prog} ${VERSION}\n`);
    return 0;
  }
  if (cmd === "token") {
    const { values } = parseArgs({ args: rest, options: { name: { type: "string" }, vault: { type: "string", multiple: true }, write: { type: "boolean" } }, strict: true });
    const { token, entry } = newConnectToken({ name: values.name ?? "default", vaults: values.vault, access: values.write ? "write" : "read" });
    io.stdout(`${token}\n`);
    io.stderr(`Give the token above to the client and add this entry to OPENVIREO_CONNECT_TOKENS_FILE (the token itself is not stored):\n${JSON.stringify(entry)}\n`);
    return 0;
  }
  if (cmd !== "serve") {
    io.stderr(connectUsage(prog));
    return 2;
  }
  if (rest.length) throw new OpenVireoError("invalid_request", `unexpected arguments: ${rest.join(" ")}`);
  const config = configFromEnv(io.env);
  const running = await startConnect(config, { fetch: io.fetch, log: (l) => io.stderr(`${new Date().toISOString()} ${l}\n`) });
  io.stderr(`${prog} listening on ${running.url} (${config.tokens.length} token${config.tokens.length === 1 ? "" : "s"})\n`);
  await (io.stopSignal ?? untilSignal());
  await running.close();
  return 0;
}

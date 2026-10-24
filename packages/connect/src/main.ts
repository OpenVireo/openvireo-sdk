/** `openvireo connect [serve]` and `openvireo connect token`: shared by the openvireo-connect bin and the openvireo CLI. */
import { parseArgs } from "node:util";
import { OpenVireoError, type FetchLike } from "@openvireo/sdk";
import { configFromEnv, startConnect } from "./server.js";
import { newConnectToken } from "./tokens.js";

export interface ConnectIo {
  env: Record<string, string | undefined>;
  stdout: (s: string) => void;
  stderr: (s: string) => void;
  fetch?: FetchLike;
  /** resolves when the server should stop (default: SIGINT/SIGTERM) */
  stopSignal?: Promise<void>;
}

export const CONNECT_USAGE = `Usage:
  openvireo connect [serve]                      run the REST server (configured by environment, see README)
  openvireo connect token [--name N] [--vault V]... [--write]
                                           create a bearer token; prints it and its config entry
`;

const untilSignal = () =>
  new Promise<void>((resolve) => {
    process.once("SIGINT", () => resolve());
    process.once("SIGTERM", () => resolve());
  });

export async function connectMain(argv: string[], io: ConnectIo): Promise<number> {
  const [cmd = "serve", ...rest] = argv;
  if (cmd === "-h" || cmd === "--help" || cmd === "help") {
    io.stdout(CONNECT_USAGE);
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
    io.stderr(CONNECT_USAGE);
    return 2;
  }
  if (rest.length) throw new OpenVireoError("invalid_request", `unexpected arguments: ${rest.join(" ")}`);
  const config = configFromEnv(io.env);
  const running = await startConnect(config, { fetch: io.fetch, log: (l) => io.stderr(`${new Date().toISOString()} ${l}\n`) });
  io.stderr(`openvireo connect listening on ${running.url} (${config.tokens.length} token${config.tokens.length === 1 ? "" : "s"})\n`);
  await (io.stopSignal ?? untilSignal());
  await running.close();
  return 0;
}

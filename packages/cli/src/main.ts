/** The `ov` command line. `main(argv, io)` returns the exit code; bin.ts wires it to the process. */
import { writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { OpenVireoError, type FetchLike, findEntry, formatReference, itemOf, listItems, parseItemReference, parseReference, setItemFields, writeField } from "@openvireo/sdk";
import { connectMain } from "@openvireo/connect";
import { generatePassword, parseCharsets } from "./generate.js";
import { Masker } from "./mask.js";
import { STRIPPED_ENV, runCommand } from "./run.js";
import { type Prompt, VERSION, login, logout, openSource, whoami } from "./session.js";
import type { VaultSource } from "./source.js";
import { parseEnvFile, readReference, resolveTemplate } from "./template.js";

export interface CliIo {
  env: Record<string, string | undefined>;
  stdout: { write(chunk: string | Uint8Array): unknown };
  stderr: { write(chunk: string | Uint8Array): unknown };
  /** reads all of stdin */
  stdin: () => Promise<string>;
  prompt?: Prompt;
  fetch?: FetchLike;
  /** overrides how `ov connect serve` waits for a stop signal (tests) */
  stopSignal?: Promise<void>;
}

export const USAGE = `ov ${VERSION}: OpenVireo vault secrets for scripts, CI and servers

Usage: (also installed as \`ov\`)
  ov read <ov://vault/[group/…]entry/field> [-n] [-o file]
  ov inject [-i template] [-o file]          replace ov:// references ({{ ov://… }} or bare)
  ov run [--env-file .env.tpl]… [--no-masking] -- <command> [args…]
  ov item get <ov://vault/[group/…]entry> [--reveal] [--json]
  ov item list <vault> [--json]
  ov item create <ov://vault/[group/…]title> [field=value…] [--generate [--length N] [--charset S]] [--stdin-field F]
  ov item edit <ov://vault/[group/…]entry> [field=value…] [--generate [--length N] [--charset S]] [--stdin-field F]
  ov rotate <ov://vault/[group/…]entry/field> (--generate [--length N] [--charset S] | --stdin) [--print]
  ov vault list [--json]
  ov login [--issuer URL] [--email E] [--secret-key K1-…]
  ov logout | ov whoami
  ov connect [serve | token …]               the REST server (see ov connect --help)
  ov version

Credentials: OPENVIREO_SERVICE_ACCOUNT_TOKEN (or OPENVIREO_SERVICE_ACCOUNT_TOKEN_FILE), else the session from
\`ov login\` unlocked with OPENVIREO_PASSWORD or a prompt. Charsets: letters, lower, upper, digits, symbols.
`;

class UsageError extends Error {}

const ITEM_OPTIONS = {
  generate: { type: "boolean" },
  length: { type: "string" },
  charset: { type: "string" },
  "stdin-field": { type: "string" },
  reveal: { type: "boolean" },
  json: { type: "boolean" },
} as const;

function parse<T extends ParseArgsOptionsConfig>(args: string[], options: T) {
  try {
    return parseArgs({ args, options, allowPositionals: true, strict: true });
  } catch (e) {
    throw new UsageError((e as Error).message);
  }
}

function generated(values: { length?: string; charset?: string }): string {
  const length = values.length === undefined ? undefined : Number(values.length);
  if (length !== undefined && !Number.isInteger(length)) throw new UsageError(`--length must be a number: ${values.length}`);
  return generatePassword({ length, charsets: values.charset ? parseCharsets(values.charset) : undefined });
}

function assignments(list: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of list) {
    const i = a.indexOf("=");
    if (i <= 0) throw new UsageError(`expected field=value, got "${a}"`);
    out[a.slice(0, i)] = a.slice(i + 1);
  }
  return out;
}

const stripNewline = (s: string) => s.replace(/\r?\n$/, "");

export async function main(argv: string[], io: CliIo): Promise<number> {
  const out = (s: string) => io.stdout.write(s);
  const err = (s: string) => io.stderr.write(s);
  const opened: { source: VaultSource | null } = { source: null };
  const src = async () => (opened.source ??= await openSource(io));
  try {
    const [cmd, ...rest] = argv;
    switch (cmd) {
      case undefined:
      case "help":
      case "-h":
      case "--help":
        out(USAGE);
        return cmd === undefined ? 2 : 0;
      case "version":
      case "--version":
        out(`ov ${VERSION}\n`);
        return 0;

      case "read": {
        const { values, positionals } = parse(rest, { "no-newline": { type: "boolean", short: "n" }, "out-file": { type: "string", short: "o" } });
        if (positionals.length !== 1) throw new UsageError("usage: ov read <ov://vault/entry/field>");
        const value = await readReference(await src(), positionals[0]!);
        if (values["out-file"]) await writeFile(values["out-file"], value, { mode: 0o600 });
        else out(values["no-newline"] ? value : value + "\n");
        return 0;
      }

      case "inject": {
        const { values, positionals } = parse(rest, { "in-file": { type: "string", short: "i" }, "out-file": { type: "string", short: "o" } });
        if (positionals.length) throw new UsageError("usage: ov inject [-i template] [-o file]");
        const template = values["in-file"] ? readFileSync(values["in-file"], "utf8") : await io.stdin();
        const { text } = await resolveTemplate(await src(), template);
        if (values["out-file"]) await writeFile(values["out-file"], text, { mode: 0o600 });
        else out(text);
        return 0;
      }

      case "run": {
        const dash = rest.indexOf("--");
        const opts = dash < 0 ? rest : rest.slice(0, dash);
        const { values, positionals } = parse(opts, { "env-file": { type: "string", multiple: true }, "no-masking": { type: "boolean" } });
        const command = dash < 0 ? positionals : [...positionals, ...rest.slice(dash + 1)];
        if (!command.length) throw new UsageError("usage: ov run [--env-file file]… -- <command> [args…]");
        const env: Record<string, string> = {};
        for (const [k, v] of Object.entries(io.env)) if (v !== undefined) env[k] = v;
        for (const f of values["env-file"] ?? []) for (const [k, v] of parseEnvFile(readFileSync(f, "utf8"), f)) env[k] = v;
        const secrets: string[] = [];
        const s = Object.values(env).some((v) => v.includes("ov://")) ? await src() : null;
        for (const [k, v] of Object.entries(env)) {
          if (!s || !v.includes("ov://")) continue;
          const r = await resolveTemplate(s, v);
          env[k] = r.text;
          secrets.push(...r.secrets);
        }
        for (const k of STRIPPED_ENV) delete env[k];
        opened.source?.close();
        opened.source = null;
        const toBytes = (w: CliIo["stdout"]) => ({ write: (c: Uint8Array) => w.write(c) });
        return await runCommand({ command: command[0]!, args: command.slice(1), env, secrets: values["no-masking"] ? null : secrets, stdout: toBytes(io.stdout), stderr: toBytes(io.stderr) });
      }

      case "item": {
        const [sub, ...args] = rest;
        const { values, positionals } = parse(args, ITEM_OPTIONS);
        if (sub === "list") {
          if (positionals.length !== 1) throw new UsageError("usage: ov item list <vault>");
          const items = listItems(await (await src()).open(positionals[0]!));
          if (values.json) out(JSON.stringify(items, null, 2) + "\n");
          else for (const i of items) out(`${i.id}  ${[...i.group, i.title].join("/")}\n`);
          return 0;
        }
        if (sub !== "get" && sub !== "create" && sub !== "edit") throw new UsageError("usage: ov item get|list|create|edit …");
        const [refText, ...assigns] = positionals;
        if (!refText) throw new UsageError(`usage: ov item ${sub} <ov://vault/[group/…]entry>`);
        const ref = parseItemReference(refText);
        if (sub === "get") {
          if (assigns.length) throw new UsageError("usage: ov item get <ov://vault/[group/…]entry> [--reveal] [--json]");
          const item = itemOf(findEntry(await (await src()).open(ref.vault), ref), { reveal: values.reveal });
          if (values.json) out(JSON.stringify(item, null, 2) + "\n");
          else {
            out(`${[...item.group, item.title].join("/")}  (${item.id})\n`);
            for (const name of Object.keys({ ...item.fields, ...Object.fromEntries(item.protected.map((p) => [p, ""])) })) {
              out(`  ${name}: ${item.fields[name] ?? "<concealed>"}\n`);
            }
          }
          return 0;
        }
        const fields = assignments(assigns);
        if (values["stdin-field"]) fields[values["stdin-field"]] = stripNewline(await io.stdin());
        if (values.generate) fields.Password = generated(values);
        if (sub === "edit" && !Object.keys(fields).length) throw new UsageError("nothing to change: give field=value, --generate or --stdin-field");
        const s = await src();
        const item = await s.edit(ref.vault, (db) => itemOf(setItemFields(db, ref, fields, { create: sub === "create" ? "only" : false }).entry));
        err(`${sub === "create" ? "Created" : "Updated"} ${[...item.group, item.title].join("/")} (${item.id})\n`);
        if (values.json) out(JSON.stringify(item, null, 2) + "\n");
        return 0;
      }

      case "rotate": {
        const { values, positionals } = parse(rest, { generate: { type: "boolean" }, length: { type: "string" }, charset: { type: "string" }, stdin: { type: "boolean" }, print: { type: "boolean" } });
        if (positionals.length !== 1 || values.generate === values.stdin) throw new UsageError("usage: ov rotate <ov://vault/entry/field> (--generate | --stdin) [--print]");
        const ref = parseReference(positionals[0]!);
        const value = values.generate ? generated(values) : stripNewline(await io.stdin());
        if (!value) throw new UsageError("the new value is empty");
        await (await src()).edit(ref.vault, (db) => void writeField(db, ref, value));
        err(`Rotated ${formatReference(ref)}\n`);
        if (values.print) out(value + "\n");
        return 0;
      }

      case "vault": {
        const [sub, ...args] = rest;
        const { values } = parse(args, { json: { type: "boolean" } });
        if (sub !== "list") throw new UsageError("usage: ov vault list [--json]");
        const vaults = await (await src()).listVaults();
        if (values.json) out(JSON.stringify(vaults, null, 2) + "\n");
        else for (const v of vaults) out(`${v.id}  ${v.role.padEnd(6)}  ${v.name}\n`);
        return 0;
      }

      case "login": {
        const { values, positionals } = parse(rest, { issuer: { type: "string" }, email: { type: "string" }, "secret-key": { type: "string" } });
        if (positionals.length) throw new UsageError("usage: ov login [--issuer URL] [--email E]");
        err((await login(io, { issuer: values.issuer, email: values.email, secretKey: values["secret-key"] })) + "\n");
        return 0;
      }
      case "logout":
        err((await logout(io)) + "\n");
        return 0;
      case "whoami":
        for (const [k, v] of Object.entries(await whoami(io))) out(`${k}: ${v}\n`);
        return 0;

      case "connect":
        return await connectMain(rest, { env: io.env, stdout: out, stderr: err, fetch: io.fetch, stopSignal: io.stopSignal });

      default:
        throw new UsageError(`unknown command "${cmd}" (see ov help)`);
    }
  } catch (e) {
    if (e instanceof UsageError) {
      err(`ov: ${e.message}\n`);
      return 2;
    }
    // Never print a stack trace (or anything that could hold a secret) for expected failures
    const message = e instanceof Error ? e.message : String(e);
    err(`ov: ${message}\n`);
    return 1;
  } finally {
    opened.source?.close();
  }
}

/** For callers that want to mask a value printed outside `ov run` (tests, the GitHub Action). */
export const maskText = (text: string, secrets: string[]) => new Masker(secrets).maskString(text);

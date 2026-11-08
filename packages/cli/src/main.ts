/** The `ov` command line. `main(argv, io)` returns the exit code; bin.ts wires it to the process. */
import { writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { DEFAULT_SHARE_FIELDS, OpenVireoError, type FetchLike, findEntry, formatReference, itemOf, itemSharePayload, listItems, parseItemReference, parseReference, setItemFields, shareableFields, textSharePayload, writeField } from "@openvireo/sdk";
import { connectMain } from "@openvireo/connect";
import { generatePassword, parseCharsets } from "./generate.js";
import { Masker } from "./mask.js";
import { STRIPPED_ENV, runCommand } from "./run.js";
import { type Prompt, VERSION, deleteAccount, login, logout, openSource, restoreAccount, whoami } from "./session.js";
import { type VaultSource, pickVault } from "./source.js";
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

Usage:
  ov read <ov://vault/[group/…]entry/field> [-n] [-o file]
  ov inject [-i template] [-o file]          replace ov:// references ({{ ov://… }} or bare)
  ov run [--env-file .env.tpl]… [--no-masking] -- <command> [args…]
  ov item get <ov://vault/[group/…]entry> [--reveal] [--json]
  ov item list <vault> [--json]
  ov item create <ov://vault/[group/…]title> [field=value…] [--generate [--length N] [--charset S]] [--stdin-field F]
  ov item edit <ov://vault/[group/…]entry> [field=value…] [--generate [--length N] [--charset S]] [--stdin-field F]
  ov rotate <ov://vault/[group/…]entry/field> (--generate [--length N] [--charset S] | --stdin) [--print]
  ov vault list [--json]
  ov share <ov://vault/[group/…]entry> [--field F]… [--expires 7d] [--once | --max-opens N] [--passcode]
  ov share --text [--title T] [--expires 7d] [--once | --max-opens N] [--passcode]   text from stdin
  ov share list [--json]
  ov share revoke <id>                       share links open without an account (users only)
  ov login [--issuer URL] [--email E] [--secret-key K1-…]
  ov logout [--forget]                       --forget also removes the Secret Key from this machine
  ov whoami
  ov account delete [--yes --email E]        lock the account and erase it after 30 days
  ov account restore                         keep an account scheduled for deletion
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

/** "1h", "7d", "30d" → seconds */
function duration(text: string): number {
  const m = /^(\d+)([hd])$/.exec(text.trim());
  if (!m) throw new UsageError(`--expires takes hours or days, like 1h or 7d: ${text}`);
  return Number(m[1]) * (m[2] === "h" ? 3600 : 86400);
}

const SHARE_OPTIONS = {
  field: { type: "string", multiple: true },
  expires: { type: "string" },
  once: { type: "boolean" },
  "max-opens": { type: "string" },
  passcode: { type: "boolean" },
  text: { type: "boolean" },
  title: { type: "string" },
  json: { type: "boolean" },
} as const;

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

      case "share": {
        const { values, positionals } = parse(rest, SHARE_OPTIONS);
        const account = async () => {
          const s = await src();
          if (!s.account) throw new OpenVireoError("forbidden", "share links are made by users, not service accounts", 403);
          return { s, account: s.account };
        };
        if (positionals[0] === "list") {
          const shares = await (await account()).account.listShares();
          if (values.json) out(JSON.stringify(shares, null, 2) + "\n");
          else {
            for (const sh of shares) {
              const opens = sh.maxOpens === null ? `${sh.opens} opens` : `${sh.opens}/${sh.maxOpens} opens`;
              const state = sh.status === "ended" ? `ended (${sh.endReason})` : `until ${sh.expiresAt}`;
              out(`${sh.id}  ${(sh.ref?.title || "(untitled)").padEnd(24)}  ${opens.padEnd(10)}  ${state}\n`);
            }
          }
          return 0;
        }
        if (positionals[0] === "revoke") {
          if (positionals.length !== 2) throw new UsageError("usage: ov share revoke <id>");
          await (await account()).account.revokeShare(positionals[1]!);
          err(`Revoked ${positionals[1]}\n`);
          return 0;
        }
        if (values.text ? positionals.length : positionals.length !== 1) {
          throw new UsageError("usage: ov share <ov://vault/[group/…]entry> [options] | ov share --text [options] | ov share list | ov share revoke <id>");
        }
        if (values.once && values["max-opens"]) throw new UsageError("use --once or --max-opens, not both");
        const maxOpens = values.once ? 1 : values["max-opens"] ? Number(values["max-opens"]) : null;
        if (maxOpens !== null && !Number.isInteger(maxOpens)) throw new UsageError(`--max-opens must be a number: ${values["max-opens"]}`);
        const expiresIn = duration(values.expires ?? "7d");
        const { s, account: acct } = await account();
        let payload;
        let where: { vaultId?: string; entryId?: string } = {};
        if (values.text) {
          const text = stripNewline(await io.stdin());
          if (!text) throw new UsageError("nothing to share: pipe the text to stdin");
          payload = textSharePayload(text, values.title);
        } else {
          const ref = parseItemReference(positionals[0]!);
          const item = itemOf(findEntry(await s.open(ref.vault), ref), { reveal: true });
          const names = values.field?.length ? values.field : [...DEFAULT_SHARE_FIELDS];
          const known = new Set(shareableFields(item).map((f) => f.name));
          const missing = names.filter((n) => !known.has(n));
          if (missing.length) throw new UsageError(`${item.title} has no ${missing.join(", ")} to share`);
          payload = itemSharePayload(item, names);
          where = { vaultId: pickVault(await s.listVaults(), ref.vault, "this account").id, entryId: item.id };
        }
        let passcode: string | undefined;
        if (values.passcode) {
          passcode = io.env.OPENVIREO_SHARE_PASSCODE ?? (io.prompt ? await io.prompt("Passcode for the link: ", { hidden: true }) : undefined);
          if (!passcode) throw new UsageError("--passcode needs OPENVIREO_SHARE_PASSCODE or a terminal to ask on");
        }
        const share = await acct.createShare(payload, { expiresIn, maxOpens, passcode, ...where });
        err(`Expires ${share.expiresAt}${maxOpens ? `, opens ${maxOpens === 1 ? "once" : `${maxOpens} times`}` : ""}. Anyone with the link can open it.\n`);
        out(share.url + "\n");
        return 0;
      }

      case "login": {
        const { values, positionals } = parse(rest, { issuer: { type: "string" }, email: { type: "string" }, "secret-key": { type: "string" } });
        if (positionals.length) throw new UsageError("usage: ov login [--issuer URL] [--email E]");
        err((await login(io, { issuer: values.issuer, email: values.email, secretKey: values["secret-key"] })) + "\n");
        return 0;
      }
      case "logout": {
        const { values, positionals } = parse(rest, { forget: { type: "boolean" } });
        if (positionals.length) throw new UsageError("usage: ov logout [--forget]");
        err((await logout(io, { forget: values.forget })) + "\n");
        return 0;
      }
      case "account": {
        const [sub, ...args] = rest;
        if (sub === "delete") {
          const { values, positionals } = parse(args, { yes: { type: "boolean" }, email: { type: "string" } });
          if (positionals.length) throw new UsageError("usage: ov account delete [--yes --email E]");
          err((await deleteAccount(io, { yes: values.yes, email: values.email }, (line) => err(line + "\n"))) + "\n");
          return 0;
        }
        if (sub === "restore") {
          if (args.length) throw new UsageError("usage: ov account restore");
          err((await restoreAccount(io)) + "\n");
          return 0;
        }
        throw new UsageError("usage: ov account delete|restore");
      }
      case "whoami":
        for (const [k, v] of Object.entries(await whoami(io))) out(`${k}: ${v}\n`);
        return 0;

      case "connect":
        return await connectMain(rest, { prog: "ov connect", env: io.env, stdout: out, stderr: err, fetch: io.fetch, stopSignal: io.stopSignal });

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

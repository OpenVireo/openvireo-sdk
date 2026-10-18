/**
 * Credentials: KPX_SERVICE_ACCOUNT_TOKEN wins; otherwise the user session saved by `kpx login`
 * (refresh token, device id and trusted Secret Key in <config dir>/session.json, mode 0600), unlocked
 * with the master password (KPX_PASSWORD or a prompt) for each command.
 */
import { readFileSync } from "node:fs";
import { homedir, hostname } from "node:os";
import { join } from "node:path";
import { Account, KpxError, ServiceAccount, type FetchLike } from "@kpnx/sdk";
import { FileStorage } from "@kpnx/sdk/storage/node";
import { type VaultSource, serviceAccountSource, userSource } from "./source.js";

export const DEFAULT_ISSUER = "https://accounts.keepassxc.org";
export const VERSION = "0.1.0";

export interface Prompt {
  (question: string, opts?: { hidden?: boolean }): Promise<string>;
}

export interface SessionIo {
  env: Record<string, string | undefined>;
  fetch?: FetchLike;
  prompt?: Prompt;
}

export function configDir(env: Record<string, string | undefined>): string {
  if (env.KPX_CONFIG_DIR) return env.KPX_CONFIG_DIR;
  const base = env.XDG_CONFIG_HOME || (env.APPDATA && process.platform === "win32" ? env.APPDATA : join(env.HOME || homedir(), ".config"));
  return join(base, "kpx");
}

const storageFor = (env: SessionIo["env"]) => new FileStorage(join(configDir(env), "session.json"));
const http = (io: SessionIo) => ({ fetch: io.fetch, headers: { "User-Agent": `kpx/${VERSION}` } });
const device = () => ({ name: `kpx on ${hostname()}`.slice(0, 64), platform: "cli" as const });

export function serviceAccountToken(env: SessionIo["env"]): string | undefined {
  if (env.KPX_SERVICE_ACCOUNT_TOKEN) return env.KPX_SERVICE_ACCOUNT_TOKEN.trim();
  if (env.KPX_SERVICE_ACCOUNT_TOKEN_FILE) return readFileSync(env.KPX_SERVICE_ACCOUNT_TOKEN_FILE, "utf8").trim();
  return undefined;
}

async function ask(io: SessionIo, question: string, hidden: boolean): Promise<string> {
  if (!io.prompt) throw new KpxError("invalid_request", `${question.replace(/:\s*$/, "")} is needed, but there is no terminal to ask on`);
  return io.prompt(question, { hidden });
}

/** The vault source for this invocation. */
export async function openSource(io: SessionIo): Promise<VaultSource> {
  const token = serviceAccountToken(io.env);
  if (token) return serviceAccountSource(await ServiceAccount.fromToken(token, http(io)));
  const storage = storageFor(io.env);
  const issuer = await storage.get("cli:issuer");
  if (!issuer) throw new KpxError("signed_out", "not signed in: set KPX_SERVICE_ACCOUNT_TOKEN or run `kpx login`");
  const account = await Account.connect({ issuer, device: device(), storage, ...http(io) });
  if (!account.signedIn) throw new KpxError("signed_out", "the saved session has ended: run `kpx login` again");
  const password = io.env.KPX_PASSWORD ?? (await ask(io, `Master password for ${account.tokens.current?.email}: `, true));
  await account.unlock(password);
  return userSource(account);
}

export async function login(io: SessionIo, p: { issuer?: string; email?: string; secretKey?: string }): Promise<string> {
  const storage = storageFor(io.env);
  const issuer = (p.issuer ?? io.env.KPX_ISSUER ?? (await storage.get("cli:issuer")) ?? DEFAULT_ISSUER).replace(/\/+$/, "");
  const account = await Account.connect({ issuer, device: device(), storage, ...http(io) });
  const email = p.email ?? (await ask(io, "Email: ", false)).trim();
  const password = io.env.KPX_PASSWORD ?? (await ask(io, "Master password: ", true));
  let secretKey = p.secretKey ?? io.env.KPX_SECRET_KEY;
  try {
    await account.login({ email, password, secretKey, totp: () => ask(io, "Authenticator code: ", false) });
  } catch (e) {
    if (!(e instanceof KpxError) || e.code !== "invalid_secret_key" || secretKey) throw e;
    // First sign-in on this machine: the Secret Key from the Emergency Kit
    secretKey = await ask(io, "Secret Key (K1-…): ", true);
    await account.login({ email, password, secretKey, totp: () => ask(io, "Authenticator code: ", false) });
  }
  await storage.set("cli:issuer", issuer);
  account.lock();
  return `Signed in to ${issuer} as ${email}`;
}

export async function logout(io: SessionIo): Promise<string> {
  const storage = storageFor(io.env);
  const issuer = await storage.get("cli:issuer");
  if (!issuer) return "Not signed in";
  const account = await Account.connect({ issuer, device: device(), storage, ...http(io) });
  await account.logout();
  await storage.delete("cli:issuer");
  return "Signed out";
}

export async function whoami(io: SessionIo): Promise<Record<string, string>> {
  const token = serviceAccountToken(io.env);
  if (token) {
    const sa = await ServiceAccount.fromToken(token, http(io));
    sa.close();
    return { kind: "service-account", principal: sa.principal, issuer: sa.config.issuer };
  }
  const storage = storageFor(io.env);
  const issuer = await storage.get("cli:issuer");
  if (!issuer) throw new KpxError("signed_out", "not signed in: set KPX_SERVICE_ACCOUNT_TOKEN or run `kpx login`");
  const account = await Account.connect({ issuer, device: device(), storage, ...http(io) });
  const s = account.tokens.current;
  if (!s) throw new KpxError("signed_out", "the saved session has ended: run `kpx login` again");
  return { kind: "user", principal: `user:${s.userId}`, email: s.email, issuer };
}

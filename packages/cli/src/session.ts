/**
 * Credentials: OPENVIREO_SERVICE_ACCOUNT_TOKEN wins; otherwise the user session saved by `ov login`
 * (refresh token, device id and trusted Secret Key in <config dir>/session.json, mode 0600), unlocked
 * with the master password (OPENVIREO_PASSWORD or a prompt) for each command.
 */
import { readFileSync } from "node:fs";
import { homedir, hostname } from "node:os";
import { join } from "node:path";
import { APPLE_SUBSCRIPTIONS_URL, Account, OpenVireoError, ServiceAccount, type FetchLike, type Plan } from "@openvireo/sdk";
import { FileStorage } from "@openvireo/sdk/storage/node";
import { type VaultSource, serviceAccountSource, userSource } from "./source.js";

export const DEFAULT_ISSUER = "https://accounts.openvireo.com";
export const VERSION = "0.10.0";

export interface Prompt {
  (question: string, opts?: { hidden?: boolean }): Promise<string>;
}

export interface SessionIo {
  env: Record<string, string | undefined>;
  fetch?: FetchLike;
  prompt?: Prompt;
}

export function configDir(env: Record<string, string | undefined>): string {
  if (env.OPENVIREO_CONFIG_DIR) return env.OPENVIREO_CONFIG_DIR;
  const base = env.XDG_CONFIG_HOME || (env.APPDATA && process.platform === "win32" ? env.APPDATA : join(env.HOME || homedir(), ".config"));
  return join(base, "openvireo");
}

const storageFor = (env: SessionIo["env"]) => new FileStorage(join(configDir(env), "session.json"));
const http = (io: SessionIo) => ({ fetch: io.fetch, headers: { "User-Agent": `openvireo/${VERSION}` } });
const device = () => ({ name: `openvireo on ${hostname()}`.slice(0, 64), platform: "cli" as const });

export function serviceAccountToken(env: SessionIo["env"]): string | undefined {
  if (env.OPENVIREO_SERVICE_ACCOUNT_TOKEN) return env.OPENVIREO_SERVICE_ACCOUNT_TOKEN.trim();
  if (env.OPENVIREO_SERVICE_ACCOUNT_TOKEN_FILE) return readFileSync(env.OPENVIREO_SERVICE_ACCOUNT_TOKEN_FILE, "utf8").trim();
  return undefined;
}

async function ask(io: SessionIo, question: string, hidden: boolean): Promise<string> {
  if (!io.prompt) throw new OpenVireoError("invalid_request", `${question.replace(/:\s*$/, "")} is needed, but there is no terminal to ask on`);
  return io.prompt(question, { hidden });
}

/** The vault source for this invocation. */
export async function openSource(io: SessionIo): Promise<VaultSource> {
  const token = serviceAccountToken(io.env);
  if (token) return serviceAccountSource(await ServiceAccount.fromToken(token, http(io)));
  const storage = storageFor(io.env);
  const issuer = await storage.get("cli:issuer");
  if (!issuer) throw new OpenVireoError("signed_out", "not signed in: set OPENVIREO_SERVICE_ACCOUNT_TOKEN or run `ov login`");
  const account = await Account.connect({ issuer, device: device(), storage, ...http(io) });
  if (!account.signedIn) throw new OpenVireoError("signed_out", "the saved session has ended: run `ov login` again");
  const password = io.env.OPENVIREO_PASSWORD ?? (await ask(io, `Master password for ${account.tokens.current?.email}: `, true));
  await account.unlock(password);
  return userSource(account);
}

export async function login(io: SessionIo, p: { issuer?: string; email?: string; secretKey?: string }): Promise<string> {
  const storage = storageFor(io.env);
  const issuer = (p.issuer ?? io.env.OPENVIREO_ISSUER ?? (await storage.get("cli:issuer")) ?? DEFAULT_ISSUER).replace(/\/+$/, "");
  const account = await Account.connect({ issuer, device: device(), storage, ...http(io) });
  const email = p.email ?? (await ask(io, "Email: ", false)).trim();
  const password = io.env.OPENVIREO_PASSWORD ?? (await ask(io, "Master password: ", true));
  let secretKey = p.secretKey ?? io.env.OPENVIREO_SECRET_KEY;
  try {
    await account.login({ email, password, secretKey, totp: () => ask(io, "Authenticator code: ", false) });
  } catch (e) {
    if (!(e instanceof OpenVireoError) || e.code !== "invalid_secret_key" || secretKey) throw e;
    // First sign-in on this machine: the Secret Key from the Emergency Kit
    secretKey = await ask(io, "Secret Key (K1-…): ", true);
    await account.login({ email, password, secretKey, totp: () => ask(io, "Authenticator code: ", false) });
  }
  await storage.set("cli:issuer", issuer);
  account.lock();
  return `Signed in to ${issuer} as ${email}`;
}

/** Signs out; `forget` also removes the Secret Key from this machine, so the next sign-in needs the Emergency Kit. */
export async function logout(io: SessionIo, opts: { forget?: boolean } = {}): Promise<string> {
  const storage = storageFor(io.env);
  const issuer = await storage.get("cli:issuer");
  if (!issuer) return "Not signed in";
  const account = await Account.connect({ issuer, device: device(), storage, ...http(io) });
  await account.logout({ forgetDevice: opts.forget });
  await storage.delete("cli:issuer");
  return opts.forget ? "Signed out, and the Secret Key was removed from this machine" : "Signed out";
}

/** The saved, unlocked user session (not a service account). */
async function unlockedUser(io: SessionIo): Promise<{ account: Account; password: string }> {
  const storage = storageFor(io.env);
  const issuer = await storage.get("cli:issuer");
  if (!issuer) throw new OpenVireoError("signed_out", "not signed in: run `ov login`");
  const account = await Account.connect({ issuer, device: device(), storage, ...http(io) });
  if (!account.signedIn) throw new OpenVireoError("signed_out", "the saved session has ended: run `ov login` again");
  const password = io.env.OPENVIREO_PASSWORD ?? (await ask(io, `Master password for ${account.tokens.current?.email}: `, true));
  await account.unlock(password);
  return { account, password };
}

const day = (iso: string) => new Date(iso).toISOString().slice(0, 10);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const PLAN_NAMES: Record<string, string> = { free: "Free", premium: "Premium", org_free: "Free", families: "Families", teams: "Teams", business: "Business" };

/**
 * One line for a plan and who bills it (SPEC §19), e.g. "Premium, renews 8 November 2027, billed by
 * Apple. Manage it on your iPhone or in your Apple ID settings (…)". Null when billing is off.
 */
export function describePlan(plan: Plan | undefined, issuer: string): string | null {
  if (!plan?.id) return null;
  const name = PLAN_NAMES[plan.id] ?? plan.id;
  const b = plan.billing;
  if (!b) return name;
  const when = b.ends_at ? `, ends ${longDay(b.ends_at)}` : b.renews_at ? `, renews ${longDay(b.renews_at)}` : "";
  const late = b.status === "past_due" ? " (payment being retried)" : "";
  if (b.manage === "app_store") {
    return `${name}${when}${late}, billed by Apple. Manage it on your iPhone or in your Apple ID settings (${APPLE_SUBSCRIPTIONS_URL}).`;
  }
  return `${name}${when}${late}. Manage it at ${issuer.replace(/\/$/, "")}/subscription/pricing.`;
}

/**
 * Schedules the signed-in account's deletion (SPEC §23). Prints what happens first, and asks for the
 * email as confirmation unless `yes` (then `email` must be given and match).
 */
export async function deleteAccount(io: SessionIo, opts: { yes?: boolean; email?: string }, print: (line: string) => void): Promise<string> {
  const { account, password } = await unlockedUser(io);
  const email = account.email!;
  const preview = await account.deletionPreview();
  if (preview.scheduledFor) return `${email} is already scheduled for deletion on ${day(preview.scheduledFor)}`;
  print(`Deleting ${email} locks it now and erases it on ${day(preview.eraseOn)}. Until then, \`ov account restore\` keeps it.`);
  for (const v of preview.vaults) {
    const shared = v.sharedWith.map((s) => s.display ?? s.principal);
    print(`  vault ${v.name ?? v.id} is deleted${shared.length ? ` (shared with ${shared.join(", ")}, who lose it)` : ""}`);
  }
  for (const o of preview.orgs) {
    print(o.outcome === "leave" ? `  you leave ${o.name}` : o.outcome === "delete" ? `  ${o.name} is deleted with you` : `  ${o.name}: you are its only owner; make someone else an owner or delete it first`);
  }
  if (preview.subscription?.manage === "app_store") {
    print(`  your ${preview.subscription.plan} plan is billed by Apple and keeps renewing: cancel it on your iPhone or in your Apple ID settings (${APPLE_SUBSCRIPTIONS_URL})`);
  } else if (preview.subscription) print(`  your ${preview.subscription.plan} plan stops renewing`);
  if (preview.shareLinks) print(`  ${preview.shareLinks} share link${preview.shareLinks === 1 ? "" : "s"} stop working now`);
  if (preview.blocked) throw new OpenVireoError("deletion_blocked", "hand over or delete the organizations above first (in the web app or desktop app)");
  let confirm = opts.email;
  if (!opts.yes) confirm = (await ask(io, `Type ${email} to delete it: `, false)).trim();
  else if (!confirm) throw new OpenVireoError("invalid_request", "--yes needs --email <the account email>");
  if (confirm.toLowerCase() !== email.toLowerCase()) throw new OpenVireoError("confirm_mismatch", "that isn't this account's email; nothing was deleted");
  const { scheduledFor } = await account.deleteAccount({ password, confirm });
  return `${email} is locked and will be deleted on ${day(scheduledFor)}. To keep it, run \`ov login\` and \`ov account restore\` before then.`;
}

/** Restores the signed-in account while it is pending deletion. */
export async function restoreAccount(io: SessionIo): Promise<string> {
  const { account, password } = await unlockedUser(io);
  if (!account.deletionScheduledFor) return `${account.email} isn't scheduled for deletion`;
  await account.restoreAccount({ password });
  account.lock();
  return `${account.email} was restored`;
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
  if (!issuer) throw new OpenVireoError("signed_out", "not signed in: set OPENVIREO_SERVICE_ACCOUNT_TOKEN or run `ov login`");
  const account = await Account.connect({ issuer, device: device(), storage, ...http(io) });
  const s = account.tokens.current;
  if (!s) throw new OpenVireoError("signed_out", "the saved session has ended: run `ov login` again");
  const who: Record<string, string> = { kind: "user", principal: `user:${s.userId}`, email: s.email, issuer };
  try {
    const plan = describePlan((await account.auth.me()).plan, issuer);
    if (plan) who.plan = plan;
  } catch {
    // offline, or an older server: whoami still answers from the saved session
  }
  return who;
}

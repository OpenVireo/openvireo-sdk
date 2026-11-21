/**
 * High-level API for an OpenVireo account (hosted mode): register, log in, unlock/lock, list and open
 * vaults, share, revoke (with key rotation), share links and service accounts. Since 1.0 this is a thin
 * layer over the shared Rust core's `Account` (`account.core`), which owns the session, the tokens, the
 * keyring and the sync engine; this class turns strings into bytes and back, asks for TOTP codes and maps
 * the core's errors to `OpenVireoError`.
 */
import type {
  Account as CoreAccount,
  AccountEvent,
  CreatedServiceAccount,
  DeletionPreview,
  ImportOutcome,
  KdfOverrides,
  LoginStep,
  Member as CoreMember,
  OvClient,
  Plan as CorePlan,
  Profile,
  PublicKeys,
  RecoveryReset,
  RecoveryStatus,
  RotationReport,
  ServerConfig,
  ShareListing,
  SyncOptions,
  SyncReport,
  Vault,
  VaultInfo as CoreVaultInfo,
} from "@openvireo/core-wasm";
import { core } from "./core/full.js";
import { guard, guarded } from "./core/guard.js";
import { makeHost, storageStore, type HostOptions } from "./core/host.js";
import { OpenVireoError } from "./errors.js";
import { MemoryStorage, type KeyValueStorage } from "./auth/storage.js";
import { AuthClient } from "./auth/client.js";
import type { SignedOutReason } from "./auth/token-manager.js";
import type { DeviceInfo, Member, OpenVireoConfiguration, OrgRole, Plan, Principal, ShareJson, VaultRole } from "./auth/types.js";
import { payloadToCore } from "./crypto/share-convert.js";
import type { SharePayload, ShareRef } from "./crypto/share.js";
import { b64u, fromB64u, fromUtf8, randomBytes, utf8, wipe } from "./util/bytes.js";
import { parseReference, type SecretReference } from "./vault/reference.js";

export type {
  AccountEvent,
  CreatedServiceAccount,
  DeletionPreview,
  ImportOutcome,
  Profile,
  RecoveryReset,
  RecoveryStatus,
  RotationReport,
  ServerConfig,
  ShareListing,
  SyncReport,
} from "@openvireo/core-wasm";

/** A vault this account can open, with its name decrypted. */
export interface VaultInfo {
  id: string;
  name: string;
  role: VaultRole;
  orgId: string | null;
  currentKeyVersion: number;
  pendingKeyVersion: number | null;
  rotationRequired: boolean;
}

/** The core's `VaultInfo` (optional fields) in the SDK's shape (nulls). */
export const vaultInfoOf = (v: CoreVaultInfo): VaultInfo => ({
  id: v.id,
  name: v.name,
  role: v.role,
  orgId: v.orgId ?? null,
  currentKeyVersion: v.currentKeyVersion,
  pendingKeyVersion: v.pendingKeyVersion ?? null,
  rotationRequired: v.rotationRequired,
});

// Format of sealUnlocked: "<version>.<b64u iv>.<b64u AES-GCM(keyset secret)>"
const SEAL_VERSION = "s2";

/** Asks for a TOTP code; asked again with the previous `invalid_mfa` error after a wrong code. */
export type TotpPrompt = (ctx: { attempt: number; error?: OpenVireoError }) => Promise<string>;

export interface AccountOptions extends HostOptions {
  /** the hosted issuer, e.g. https://accounts.openvireo.com */
  issuer: string;
  device: DeviceInfo;
  /** the session, trusted-device Secret Keys and (with `offline`) the offline cache (default: memory) */
  storage?: KeyValueStorage;
  /** skip discovery (tests) */
  config?: OpenVireoConfiguration;
  /**
   * Keep what this device needs to unlock and open vaults without the network in `storage`, none of it
   * in clear (the core's offline cache, SPEC §20). When a server can't be reached, `connect`, `unlock`,
   * `listVaults` and `openVault` fall back to it and `offline` turns true; `reconnect` goes back online.
   */
  offline?: boolean;
}

/** Options of a new share link (SPEC.md §22). */
export interface ShareOptions {
  /** seconds, 3600 to 30 days (and the plan's share_link_days) */
  expiresIn: number;
  /** null or absent: unlimited until it expires */
  maxOpens?: number | null;
  /** the recipient types this as well as opening the link */
  passcode?: string;
  /** the vault and entry it came from; leave out for text */
  vaultId?: string;
  entryId?: string;
}

/** GET /auth/recover/{token}, camelCased: what an approved reset will do (SPEC.md §18). */
export interface RecoveryResetInfo {
  email: string;
  /** RFC 3339; the reset link works from then on (before that the routes answer `recovery_not_ready`) */
  notBefore: string;
  /** RFC 3339; the link stops working then (72 hours after approval) */
  expiresAt: string;
  /** how long the old keys and vaults are kept for a restore (30) */
  archiveDays: number;
  archives: { personalVaults: number; sharedGrants: number; soleAdminOrgs: string[] };
}

/** GET /me/recovery, camelCased: whether a recovery archive from a reset exists (SPEC.md §18). */
export interface RecoveryStatusInfo {
  archived: boolean;
  email?: string;
  expiresAt?: string;
  vaults?: number;
  /** too many failed restore attempts; an admin unlocks it */
  locked?: boolean;
}

/** What deleting the account will do (SPEC.md §23), with vault names decrypted where this device can. */
export interface DeletionPreviewInfo {
  scheduledFor: string | null;
  eraseOn: string;
  vaults: { id: string; name: string | null; sharedWith: { principal: Principal; display: string | null; role: VaultRole }[] }[];
  orgs: { id: string; name: string; role: OrgRole; outcome: "leave" | "delete" | "blocked"; members: { id: string; email: string; role: OrgRole }[] }[];
  subscription: { plan: string; periodEnd: string | null; source: string; manage: string } | null;
  shareLinks: number;
  blocked: boolean;
}

/** A share link in its owner's list, with where it came from when this account can read that. */
export interface ShareListingInfo {
  id: string;
  vaultId: string | null;
  /** null when the reference can't be read (made with keys this account no longer has) */
  ref: ShareRef | null;
  passcode: boolean;
  maxOpens: number | null;
  opens: number;
  openedAt: string[];
  createdAt: string;
  expiresAt: string;
  status: ShareJson["status"];
  endedAt: string | null;
  endReason: ShareJson["end_reason"];
}

export interface CreatedShare {
  id: string;
  /** the link to send; the key is after `#` and is never sent to the server */
  url: string;
  expiresAt: string;
}

/** Thrown by `importVault` when the vault was created but its first upload failed; `vault.sync()` retries it. */
export class VaultUploadError extends OpenVireoError {
  constructor(
    readonly vault: AccountVault,
    cause: unknown,
  ) {
    super("vault_upload_failed", `the vault was created, but its first upload failed: ${(cause as Error)?.message ?? cause}`, (cause as OpenVireoError)?.status, { cause });
  }
}

/** A remembered account whose stored erase date (SPEC.md §23) is more than a day past: remove it and its Secret Key. */
export function deletionExpired(scheduledFor: string | null | undefined, now: number = Date.now()): boolean {
  if (!scheduledFor) return false;
  const at = Date.parse(scheduledFor);
  return Number.isFinite(at) && now > at + 24 * 3600_000;
}

/** The discovery document (snake_case, as served) as the core's `ServerConfig`, and back. */
export function serverConfigOf(c: OpenVireoConfiguration): ServerConfig {
  const s: ServerConfig = { issuer: c.issuer, api: c.api, sync: c.sync, jwksUri: c.jwks_uri, opaque: { ...c.opaque } };
  if (c.kdf_min) s.kdfMin = { ...c.kdf_min };
  if (c.web) s.web = c.web;
  if (c.share) s.share = c.share;
  return s;
}
export function configOf(s: ServerConfig): OpenVireoConfiguration {
  const c: OpenVireoConfiguration = { issuer: s.issuer, api: s.api, sync: s.sync, jwks_uri: s.jwksUri, opaque: { ...s.opaque } };
  if (s.kdfMin) c.kdf_min = { ...s.kdfMin };
  if (s.web) c.web = s.web;
  if (s.share) c.share = s.share;
  return c;
}

/** The core client for these options (one per `Account.connect`). */
function clientFor(opts: Omit<AccountOptions, "issuer" | "device"> & { device?: DeviceInfo }): OvClient {
  const storage = opts.storage ?? new MemoryStorage();
  const config: { device: DeviceInfo; offline: boolean; server?: ServerConfig } = { device: opts.device ?? { name: "OpenVireo SDK", platform: "web" }, offline: !!opts.offline };
  if (opts.config) config.server = serverConfigOf(opts.config);
  return guarded(() => new (core().OvClient)(config as never, makeHost({ ...opts, storage }, storageStore(storage))));
}

/** A core `Plan` (camelCase) in the SDK's `Plan` shape (as the server sends it). */
export function planOf(p: CorePlan | undefined): Plan | undefined {
  if (!p) return undefined;
  const limits: Record<string, number | null> = {};
  for (const l of p.limits) limits[l.name] = l.value ?? null;
  const out: Plan = { id: p.id ?? null, limits };
  if (p.billing) {
    const b = p.billing;
    out.billing = { source: b.source, interval: b.interval, status: b.status, renews_at: b.renewsAt ?? null, ends_at: b.endsAt ?? null, manage: b.manage as Plan["billing"] extends infer B ? (B extends { manage: infer M } ? M : never) : never };
  }
  return out;
}

/** A member as the core takes it (the core fetches and verifies the keys itself). */
function coreMember(m: Member | CoreMember): CoreMember {
  if ("userId" in m) return m;
  const out: CoreMember = { userId: m.user_id, email: m.email, role: m.role, status: m.status };
  if (m.name) out.name = m.name;
  return out;
}

/** A core member in the server's (snake_case) shape, as `account.auth.listMembers` gives it. */
function memberJson(m: CoreMember): Member {
  const out: Member = { user_id: m.userId, email: m.email, role: m.role, status: m.status };
  if (m.name !== undefined) out.name = m.name;
  if (m.publicKeys) out.public = { enc_pk: b64u(m.publicKeys.encPk), sign_pk: b64u(m.publicKeys.signPk), sig: b64u(m.publicKeys.sig) };
  return out;
}

const kdfOf = (k?: { m?: number; t?: number; p?: number }): KdfOverrides | undefined => (k ? { ...k } : undefined);
const nul = <T>(v: T | undefined): T | null => (v === undefined ? null : v);

export class Account {
  /** The core's account handle, for everything this class doesn't wrap (orgs, devices, audit, billing…). */
  readonly core: CoreAccount;
  private readonly listeners = new Set<(r: SignedOutReason) => void>();
  private watching = false;

  private constructor(
    private readonly client: OvClient,
    coreAccount: CoreAccount,
    private readonly opts: AccountOptions,
  ) {
    this.core = coreAccount;
  }

  /**
   * Discovers the server and loads a stored session, if any (signed in but locked). With `offline`, an
   * unreachable server falls back to the discovery document from the last successful connect.
   */
  static async connect(opts: AccountOptions): Promise<Account> {
    const client = clientFor(opts);
    const acct = await client.connect(opts.issuer);
    return new Account(client, guard(acct), opts);
  }

  /** The discovery document of the server this account is on. */
  get config(): OpenVireoConfiguration {
    return configOf(this.core.serverConfig());
  }
  /** True while the servers can't be reached and this account works from the offline cache. */
  get offline(): boolean {
    return this.core.isOffline();
  }
  get signedIn(): boolean {
    return this.core.isSignedIn();
  }
  /** The erase date while the account is scheduled for deletion (SPEC.md §23), else null. */
  get deletionScheduledFor(): string | null {
    return nul(this.core.deletionScheduledFor());
  }
  get unlocked(): boolean {
    return this.core.isUnlocked();
  }
  get userId(): string | undefined {
    return this.core.userId();
  }
  get email(): string | undefined {
    return this.core.email();
  }
  get principal(): Principal {
    return this.core.principal() as Principal;
  }
  /**
   * The typed client of the account server's routes (openapi.yaml), signed in with this session: it
   * borrows the core's access token (and has the core refresh it on a 401). For the routes the core
   * doesn't wrap; JSON is the server's (snake_case).
   */
  get auth(): AuthClient {
    this._auth ??= new AuthClient({ ...this.opts, api: this.config.api }).withTokens({
      getAccessToken: async (o) => fromUtf8(await this.core.accessToken(!!o?.force)),
    });
    return this._auth;
  }
  private _auth: AuthClient | undefined;

  /** this account's public key fingerprint (to compare out of band) */
  get fingerprint(): string {
    return this.core.fingerprint();
  }

  /** Called when the server ends this session (token reused, expired, signed out elsewhere, deletion). */
  onSignedOut(listener: (reason: SignedOutReason) => void): () => void {
    this.listeners.add(listener);
    if (!this.watching) {
      this.watching = true;
      const loop = async () => {
        while (this.listeners.size > 0) {
          let reason: SignedOutReason;
          try {
            reason = (await this.core.signedOut()) as SignedOutReason;
          } catch {
            break;
          }
          for (const l of [...this.listeners]) l(reason);
        }
        this.watching = false;
      };
      void loop();
    }
    return () => void this.listeners.delete(listener);
  }

  /** Whether this device can sign in to `email` without being given the Secret Key. */
  hasSecretKey(email: string): Promise<boolean> {
    return this.core.hasSecretKey(email);
  }

  /** Creates an account. Returns the Secret Key to show once (Emergency Kit). Signs in and unlocks. */
  async register(p: { email: string; password: string; kdf?: { m?: number; t?: number; p?: number }; trustDevice?: boolean }): Promise<{ secretKey: string; userId: string }> {
    const input: { email: string; password: Uint8Array; trustDevice: boolean; kdf?: KdfOverrides } = { email: p.email, password: utf8(p.password), trustDevice: p.trustDevice ?? true };
    const kdf = kdfOf(p.kdf);
    if (kdf) input.kdf = kdf;
    const r = await this.core.register(input);
    try {
      return { secretKey: fromUtf8(r.secretKey), userId: r.userId };
    } finally {
      wipe(r.secretKey, r.auk);
    }
  }

  /** Signs in (OPAQUE) and unlocks. `totp` is a code or a prompt asked again after a wrong code. */
  async login(p: { email: string; password: string; secretKey?: string; totp?: string | TotpPrompt; trustDevice?: boolean }): Promise<void> {
    const input: { email: string; password: Uint8Array; trustDevice: boolean; secretKey?: Uint8Array; totp?: string } = { email: p.email, password: utf8(p.password), trustDevice: p.trustDevice ?? true };
    if (p.secretKey) input.secretKey = utf8(p.secretKey);
    if (typeof p.totp === "string") input.totp = p.totp;
    let step: LoginStep = await this.core.login(input);
    if (step.kind === "needsTotp") {
      if (!p.totp) throw new OpenVireoError("mfa_required", "a TOTP code is required");
      const challenge = step.challenge;
      if (typeof p.totp === "string") step = await this.core.submitTotp(challenge, p.totp);
      else {
        // SPEC §8: a wrong code (invalid_mfa) keeps the challenge, so the prompt is asked again; once the
        // server drops the MFA token (5th wrong code, or it expired) it is mfa_expired
        for (let attempt = 1, error: OpenVireoError | undefined; ; attempt++) {
          const code = await p.totp(error ? { attempt, error } : { attempt });
          try {
            step = await this.core.submitTotp(challenge, code);
            break;
          } catch (e) {
            if (e instanceof OpenVireoError && e.code === "invalid_mfa") {
              error = e;
              continue;
            }
            throw e;
          }
        }
      }
    }
    if (step.kind === "unlocked") wipe(step.unlocked.auk);
  }

  /**
   * Unlocks a signed-in (resumed) session with the master password. With `offline`, an unreachable server
   * falls back to the wrapped keyset cached at the last sign-in or unlock.
   */
  async unlock(password: string, secretKey?: string): Promise<void> {
    const r = await this.core.unlock(utf8(password), secretKey ? utf8(secretKey) : undefined);
    wipe(r.auk);
  }

  /**
   * Seals the unlocked keyset under `key` (AES-GCM, random IV, bound to this issuer and user), so a page
   * can unlock again after a reload with `resumeUnlocked` instead of the master password. Pass a
   * non-extractable AES-GCM key and keep the result apart from it.
   */
  async sealUnlocked(key: CryptoKey): Promise<string> {
    const userId = this.userId;
    if (!userId) throw new OpenVireoError("signed_out", "not signed in");
    const secret = this.core.unlockedKeysetSecret();
    const iv = randomBytes(12);
    try {
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource, additionalData: utf8(`ov-unlock-v2|${this.config.issuer}|${userId}`) as BufferSource }, key, secret as BufferSource));
      return `${SEAL_VERSION}.${b64u(iv)}.${b64u(ct)}`;
    } finally {
      wipe(secret);
    }
  }

  /** Unlocks from `sealUnlocked`'s output. Throws `decryption_failed` for another key, user or server. */
  async resumeUnlocked(sealed: string, key: CryptoKey): Promise<void> {
    const userId = this.userId;
    if (!userId) throw new OpenVireoError("signed_out", "not signed in");
    const [v, iv, ct] = sealed.split(".");
    if (v !== SEAL_VERSION || !iv || !ct) throw new OpenVireoError("unsupported_version", "unknown unlock seal");
    let secret: Uint8Array;
    try {
      secret = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64u(iv) as BufferSource, additionalData: utf8(`ov-unlock-v2|${this.config.issuer}|${userId}`) as BufferSource }, key, fromB64u(ct) as BufferSource));
    } catch (e) {
      throw new OpenVireoError("decryption_failed", "the unlock seal doesn't open with this key", undefined, { cause: e });
    }
    try {
      await this.core.resumeUnlocked(secret);
    } finally {
      wipe(secret);
    }
  }

  async changePassword(p: { current: string; next: string; kdf?: { m?: number; t?: number; p?: number } }): Promise<void> {
    wipe(await this.core.changePassword(utf8(p.current), utf8(p.next), kdfOf(p.kdf)));
  }

  requestEmailChange(email: string): Promise<void> {
    return this.core.requestEmailChange(email);
  }

  changeEmail(p: { email: string; code: string; password: string }): Promise<void> {
    return this.core.changeEmail(p.email, p.code, utf8(p.password));
  }

  /** The Secret Key this device keeps for the signed-in account, to show again; null when it keeps none. */
  async secretKey(): Promise<string | null> {
    const raw = await this.core.secretKey();
    if (!raw) return null;
    try {
      return fromUtf8(raw);
    } finally {
      wipe(raw);
    }
  }

  /** A one-time link that signs the web app in as this account (SPEC.md §16). */
  async webSessionUrl(next?: string): Promise<string> {
    return fromUtf8(await this.core.webSessionUrl(next));
  }

  async recoverInfo(token: string): Promise<RecoveryResetInfo> {
    const r: RecoveryReset = await this.core.recoverInfo(utf8(token));
    return { email: r.email, notBefore: r.notBefore, expiresAt: r.expiresAt, archiveDays: r.archiveDays, archives: { personalVaults: r.personalVaults, sharedGrants: r.sharedGrants, soleAdminOrgs: r.soleAdminOrgs } };
  }

  /** Completes an approved account reset (SPEC.md §18): new password and Secret Key; signs in. */
  async recover(p: { token: string; password: string; kdf?: { m?: number; t?: number; p?: number }; trustDevice?: boolean }): Promise<{ secretKey: string; userId: string }> {
    const r = await this.core.recover(utf8(p.token), utf8(p.password), kdfOf(p.kdf), p.trustDevice ?? true);
    try {
      return { secretKey: fromUtf8(r.secretKey), userId: r.userId };
    } finally {
      wipe(r.secretKey, r.auk);
    }
  }

  async recoveryStatus(): Promise<RecoveryStatusInfo> {
    const r: RecoveryStatus = await this.core.recoveryStatus();
    const out: RecoveryStatusInfo = { archived: r.archived };
    if (r.email !== undefined) out.email = r.email;
    if (r.expiresAt !== undefined) out.expiresAt = r.expiresAt;
    if (r.vaults !== undefined) out.vaults = r.vaults;
    if (r.locked) out.locked = true;
    return out;
  }

  /** Restores the vaults archived by a reset with the old password and Secret Key. */
  async restoreFromArchive(p: { oldPassword: string; oldSecretKey: string }): Promise<{ restored: number }> {
    return { restored: await this.core.restoreFromArchive(utf8(p.oldPassword), utf8(p.oldSecretKey)) };
  }

  /** Back online after working offline: syncs and returns the vault list and the vaults no longer listed. */
  async reconnect(): Promise<{ vaults: VaultInfo[]; dropped: string[] }> {
    const r = await this.core.reconnect();
    return { vaults: r.vaults.map(vaultInfoOf), dropped: r.dropped };
  }

  lock(): void {
    this.core.lock();
  }

  /** Signs out (and with `forgetDevice` drops the kept Secret Key and device id). */
  async logout(opts: { forgetDevice?: boolean } = {}): Promise<void> {
    await this.core.signOut(!!opts.forgetDevice);
  }

  async deletionPreview(): Promise<DeletionPreviewInfo> {
    const p: DeletionPreview = await this.core.deletionPreview();
    return {
      scheduledFor: p.scheduledFor ?? null,
      eraseOn: p.eraseOn,
      vaults: p.vaults.map((v) => ({ id: v.id, name: v.name ?? null, sharedWith: v.sharedWith.map((x) => ({ principal: x.principal as Principal, display: x.display ?? null, role: x.role })) })),
      orgs: p.orgs.map((o) => ({ id: o.id, name: o.name, role: o.role, outcome: o.outcome, members: o.members.map((m) => ({ id: m.id, email: m.email, role: m.role })) })),
      subscription: p.subscription ? { plan: p.subscription.plan, periodEnd: p.subscription.periodEnd ?? null, source: p.subscription.source, manage: p.subscription.manage } : null,
      shareLinks: p.shareLinks,
      blocked: p.blocked,
    };
  }

  async deleteAccount(p: { password: string; confirm: string }): Promise<{ scheduledFor: string }> {
    return { scheduledFor: await this.core.deleteAccount(utf8(p.password), p.confirm) };
  }

  restoreAccount(p: { password: string }): Promise<void> {
    return this.core.restoreAccount(utf8(p.password));
  }

  transferVault(vaultId: string, to: Principal): Promise<void> {
    return this.core.transferVault(vaultId, to);
  }

  /** Whether `storage` holds an active, parked or no session for this user (without connecting). */
  static async sessionState(storage: KeyValueStorage, account: { issuer: string; userId: string }): Promise<"active" | "parked" | "signed_out"> {
    return clientFor({ storage }).sessionState(account.issuer, account.userId);
  }

  /** Whether `storage` holds edits of this user's vaults not yet uploaded. */
  static async hasPendingEdits(storage: KeyValueStorage, userId: string): Promise<boolean> {
    return clientFor({ storage, offline: true }).hasPendingEdits(userId);
  }

  /** Parks this session (switching accounts) so `resumeSession` can come back to it without signing in. */
  parkSession(): Promise<boolean> {
    return this.core.parkSession();
  }
  resumeSession(userId: string): Promise<boolean> {
    return this.core.resumeSession(userId);
  }
  checkParkedSession(userId: string): Promise<"valid" | "ended" | "no_answer"> {
    return this.core.checkParkedSession(userId);
  }
  logoutParked(userId: string): Promise<void> {
    return this.core.signOutParked(userId);
  }
  forgetDevice(email: string): Promise<void> {
    return this.core.forgetDevice(email);
  }

  /** Locks and signs out with a keepalive request, for `pagehide`. */
  logoutOnUnload(): void {
    const req = this.core.signOutOnUnload();
    this.lock();
    if (!req) return;
    const f = this.opts.fetch ?? globalThis.fetch;
    const init: RequestInit = { method: req.method, keepalive: true, headers: req.headers };
    if (req.body) init.body = req.body as BodyInit;
    void f(req.url, init).catch(() => undefined);
  }

  // ------------------------------------------------------------------------------------- vaults

  /** Every vault this account can open, with names decrypted (offline: the cached list). */
  async listVaults(): Promise<VaultInfo[]> {
    return (await this.core.vaults()).map(vaultInfoOf);
  }

  /** Downloads and opens a vault (offline: the cached copy). */
  async openVault(vaultId: string): Promise<AccountVault> {
    return new AccountVault(await this.core.openVault(vaultId));
  }

  /** The verified public keys of a user or service account (`invalid_public_keys` if the signature fails). */
  verifiedPublicKeys(principal: Principal): Promise<PublicKeys> {
    return this.core.verifiedPublicKeys(principal);
  }

  /** Creates a vault (in an org with `orgId`) and uploads it empty. */
  async createVault(name: string, opts: { orgId?: string } = {}): Promise<AccountVault> {
    return new AccountVault(await this.core.createVault(name, opts.orgId));
  }

  /**
   * Imports an open local vault as a new account vault (re-keyed with a fresh vault key). Throws
   * `VaultUploadError` (holding the new vault) when it was created but the first upload failed.
   */
  async importVault(source: Vault, opts: { name?: string; orgId?: string } = {}): Promise<AccountVault> {
    const mode: { kind: "newVault"; name?: string; orgId?: string } = { kind: "newVault" };
    if (opts.name !== undefined) mode.name = opts.name;
    if (opts.orgId !== undefined) mode.orgId = opts.orgId;
    const r: ImportOutcome = await this.core.importVault(source, mode);
    const vault = new AccountVault(r.vault);
    if (!r.uploaded) throw new VaultUploadError(vault, r.uploadError);
    return vault;
  }

  /** Grants a user (by email or principal) access to a vault; returns their principal and fingerprint. */
  share(vaultId: string, who: { email?: string; principal?: Principal }, role: VaultRole): Promise<{ principal: Principal; fingerprint: string }> {
    const grantee = who.principal ? { kind: "principal" as const, principal: who.principal } : { kind: "email" as const, email: who.email ?? "" };
    return this.core.shareVault(vaultId, grantee, role) as Promise<{ principal: Principal; fingerprint: string }>;
  }

  /** Removes access and rotates the vault key so the removed principals can't read new versions. */
  revoke(vaultId: string, principals: Principal[]): Promise<SyncReport> {
    return this.core.revoke(vaultId, principals);
  }

  /** Rotates the vault key (optionally removing principals). */
  rotate(vaultId: string, opts: { remove?: Principal[] } = {}): Promise<SyncReport> {
    return this.core.rotateVaultKey(vaultId, opts.remove ?? []);
  }

  // -------------------------------------------------------------------------------- share links

  /** Where this server's share links point (`config.share`, else `${config.web}/s`), or null. */
  get shareBase(): string | null {
    return nul(this.core.shareBase());
  }

  /** Creates a share link (SPEC.md §22). The key stays in the link's fragment. */
  async createShare(payload: SharePayload, opts: ShareOptions): Promise<CreatedShare> {
    const o: { expiresIn: number; maxOpens?: number; passcode?: Uint8Array; vaultId?: string; entryId?: string } = { expiresIn: opts.expiresIn };
    if (opts.maxOpens != null) o.maxOpens = opts.maxOpens;
    if (opts.passcode) o.passcode = utf8(opts.passcode);
    if (opts.vaultId) o.vaultId = opts.vaultId;
    if (opts.entryId) o.entryId = opts.entryId;
    const r = await this.core.createShare(payloadToCore(payload), o);
    return { id: r.id, url: fromUtf8(r.url), expiresAt: r.expiresAt };
  }

  /** This account's share links, newest first, with where each came from when this account can read that. */
  async listShares(): Promise<ShareListingInfo[]> {
    return (await this.core.listShares()).map((l: ShareListing) => ({
      id: l.id,
      vaultId: l.vaultId ?? null,
      ref: l.reference ? { vault: l.reference.vault ?? null, entry: l.reference.entry ?? null, title: l.reference.title } : null,
      passcode: l.passcode,
      maxOpens: l.maxOpens ?? null,
      opens: l.opens,
      openedAt: l.openedAt,
      createdAt: l.createdAt,
      expiresAt: l.expiresAt,
      status: l.status as ShareListingInfo["status"],
      endedAt: l.endedAt ?? null,
      endReason: (l.endReason ?? null) as ShareListingInfo["endReason"],
    }));
  }

  revokeShare(id: string): Promise<void> {
    return this.core.revokeShare(id);
  }

  // ---------------------------------------------------------------------- orgs and service accounts

  /** Creates a service account in an org; `token` (shown once) is what CI uses. */
  async createServiceAccount(orgId: string, p: { name: string; vaults?: { id: string; role: VaultRole }[]; expiresAt?: string | null; secretName?: string }) {
    const input: { name: string; vaults: { vaultId: string; role: VaultRole }[]; expiresAt?: string; secretName?: string } = { name: p.name, vaults: (p.vaults ?? []).map((v) => ({ vaultId: v.id, role: v.role })) };
    if (p.expiresAt) input.expiresAt = p.expiresAt;
    if (p.secretName) input.secretName = p.secretName;
    const r: CreatedServiceAccount = await this.core.createServiceAccount(orgId, input);
    return { serviceAccount: r.serviceAccount, token: fromUtf8(r.token) };
  }

  /** Issues another secret (token) for a service account. */
  async issueServiceAccountSecret(saId: string, p: { name?: string; expiresAt?: string | null } = {}) {
    const r = await this.core.issueServiceAccountSecret(saId, p.name, p.expiresAt ?? undefined);
    return { id: r.id, prefix: r.prefix, token: fromUtf8(r.token) };
  }

  /**
   * Confirms an accepted member (SPEC §12) and grants vaults. The core fetches and verifies the member's
   * keys. Takes a member from `account.auth.listMembers` (snake_case) or `account.core.orgMembers`.
   */
  async confirmMember(orgId: string, member: Member | CoreMember, vaults: { id: string; role: VaultRole }[] = []): Promise<Member> {
    return memberJson(await this.core.confirmMember(orgId, coreMember(member), vaults.map((v) => ({ vaultId: v.id, role: v.role }))));
  }

  /** Changes an org role; promotion to owner/admin includes the SA master keys and manage on every org vault. */
  async setMemberRole(orgId: string, member: Member | CoreMember, role: OrgRole): Promise<Member> {
    return memberJson(await this.core.setMemberRole(orgId, coreMember(member), role));
  }

  /** Removes a member and rotates the keys of the vaults they could read. */
  async removeMember(orgId: string, userId: string): Promise<{ rotated: string[]; failed: { id: string; error: unknown }[] }> {
    const r: RotationReport = await this.core.removeMember(orgId, userId);
    return { rotated: r.rotated, failed: r.failed.map((f) => ({ id: f.vaultId, error: f.error })) };
  }

  /** The signed-in user's profile (plan, orgs, two-step status). */
  me(): Promise<Profile> {
    return this.core.me();
  }

  /**
   * Server events: vault changes, access changes (the vault list is refetched) and the end of the session.
   * Returns a handle to close.
   */
  subscribe(handlers: { onVaultChanged?: (e: Extract<AccountEvent, { kind: "vaultChanged" }>) => void; onVaultsChanged?: (vaults: VaultInfo[]) => void; onError?: (e: unknown) => void } = {}): { close(): void } {
    let closed = false;
    let stream: { close(): void; next(): Promise<AccountEvent | undefined> } | null = null;
    void (async () => {
      try {
        stream = await this.core.subscribe();
        if (closed) return stream.close();
        for (;;) {
          const ev = await stream.next();
          if (!ev || closed) break;
          if (ev.kind === "vaultChanged") handlers.onVaultChanged?.(ev);
          else if (ev.kind === "vaultsChanged") handlers.onVaultsChanged?.(ev.vaults.map(vaultInfoOf));
        }
      } catch (e) {
        if (!closed) handlers.onError?.(e);
      }
    })();
    return {
      close() {
        closed = true;
        stream?.close();
      },
    };
  }
}

/**
 * An open account vault: the core's `Vault` (entries, groups, fields, history, attachments) plus
 * string conveniences. Edit `vault`, then `sync()`.
 */
export class AccountVault {
  constructor(readonly vault: Vault) {}

  get id(): string {
    return this.vault.id();
  }
  get name(): string {
    return this.vault.name();
  }
  get info(): VaultInfo {
    const i = this.vault.info();
    if (!i) throw new OpenVireoError("kdbx_error", "not an account vault");
    return vaultInfoOf(i);
  }
  /** The server ETag at the last sync (compare with a `vaultChanged` event's etag). */
  get etag(): string | undefined {
    return this.vault.etag();
  }
  /** true when the last sync couldn't reach the server (or the vault was opened from the offline cache) */
  get offline(): boolean {
    return this.vault.isOffline();
  }
  get readOnly(): boolean {
    return this.vault.isReadOnly();
  }

  /**
   * Downloads, merges local edits and uploads them (conditional PUT, merge and retry on 412). With
   * `localChanged: false` it first asks the server and stops there when nothing changed.
   */
  sync(opts: { localChanged?: boolean; acceptServerState?: boolean } = {}): Promise<SyncReport> {
    const o: SyncOptions = { localChanged: opts.localChanged ?? true };
    if (opts.acceptServerState !== undefined) o.acceptServerState = opts.acceptServerState;
    return this.vault.sync(o);
  }

  read(ref: string | Pick<SecretReference, "groupPath" | "entry" | "field">): string {
    const r = typeof ref === "string" ? ref : `ov://_/${[...ref.groupPath, ref.entry, ref.field].map(encodeURIComponent).join("/")}`;
    if (typeof ref === "string") parseReference(ref);
    return fromUtf8(this.vault.readField(r));
  }

  /** Sets a field (creating the entry by title with `create`) and syncs it up. */
  write(ref: string | Pick<SecretReference, "groupPath" | "entry" | "field">, value: string, opts: { create?: boolean } = {}): Promise<SyncReport> {
    const r = typeof ref === "string" ? ref : `ov://_/${[...ref.groupPath, ref.entry, ref.field].map(encodeURIComponent).join("/")}`;
    return this.vault.writeField(r, utf8(value), !!opts.create);
  }
}

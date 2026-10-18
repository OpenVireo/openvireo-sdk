/**
 * High-level API for a KeePassXC account (hosted mode): register, log in, unlock/lock, list and open
 * vaults, share, revoke (with key rotation), and create service accounts.
 */
import { KpxError, isUnreachable } from "./errors.js";
import { AuthClient, discover } from "./auth/client.js";
import { MemoryStorage, NamespacedStorage, type KeyValueStorage } from "./auth/storage.js";
import { TokenManager, type SignedOutReason } from "./auth/token-manager.js";
import { type DeviceInfo, type Grant, type KpxConfiguration, type Member, type OrgRole, type Principal, type SaMasterGrant, type Session, type Vault, type VaultGrant, type VaultRole, type WrappedKeysetJson, isMfaChallenge } from "./auth/types.js";
import type { HttpOptions } from "./http/request.js";
import { checkKdfParams, deriveAuk, newKdfParams } from "./crypto/auk.js";
import { sealSaMaster, sealVaultKey, unsealSaMaster, unsealVaultKey } from "./crypto/envelope.js";
import { type Keyset, fingerprint, generateKeyset, trustedPublicKeys, unwrapKeyset, wipeKeyset, wrapKeyset } from "./crypto/keyset.js";
import { formatSecretKey, generateSecretKey, parseSecretKey } from "./crypto/secret-key.js";
import { newSaSecret } from "./crypto/tokens.js";
import { decryptVaultName, encryptVaultName } from "./crypto/vault-name.js";
import { b64u, fromB64u, randomBytes, randomUuid, wipe } from "./util/bytes.js";
import { finishLogin, finishRegistration, opaqueIds, startLogin, startRegistration } from "./opaque/index.js";
import { SyncClient } from "./sync/client.js";
import { type EventStream, type SyncEvent, subscribeEvents } from "./sync/events.js";
import { type SyncResult, type SyncState, deserializeSyncState, serializeSyncState, syncKdbx } from "./sync/engine.js";
import { type Kdbx, type KeyVersion, copyKdbx, createVaultKdbx, dropServerRemotes, openWithKeyVersions, rekeyToVaultKey, saveKdbx, vaultCredentials } from "./vault/kdbx.js";
import { parseReference, readField, writeField, type SecretReference } from "./vault/reference.js";

const isManager = (role: OrgRole) => role === "owner" || role === "admin";

/** Asks for a TOTP code; asked again with the previous `invalid_mfa` error after a wrong code. */
export type TotpPrompt = (ctx: { attempt: number; error?: KpxError }) => Promise<string>;

export interface AccountOptions extends HttpOptions {
  /** the hosted issuer, e.g. https://accounts.keepassxc.org */
  issuer: string;
  device: DeviceInfo;
  /** sessions, trusted-device Secret Keys and sync state (default: memory) */
  storage?: KeyValueStorage;
  /** skip discovery (tests) */
  config?: KpxConfiguration;
  /**
   * Keep what this device needs to unlock and open vaults without the network, all of it in
   * `storage` and none of it in clear: the discovery document, the wrapped keyset and KDF params, the
   * vault list as GET /vaults returned it (encrypted names, sealed keys), and per vault the sync
   * state (whose base copy is the server's encrypted .kdbx) plus local edits not yet uploaded, as a
   * .kdbx encrypted with the vault key. When a server can't be reached, `connect`, `unlock`,
   * `listVaults` and `openVault` fall back to it and `offline` turns true; `reconnect` goes back
   * online. Vaults no longer listed once online, and everything on sign-out, are dropped.
   */
  offline?: boolean;
}

/** The parts of a user's account record that unlocking needs (cached for offline unlock). */
interface Profile {
  kdf: Session["kdf"];
  keyset: WrappedKeysetJson;
}

/** Storage keys of the offline cache (the sync state keys are `sync:<vault id>`, as before). */
const OFFLINE = {
  config: (issuer: string) => `offline:config:${issuer.replace(/\/+$/, "")}`,
  profile: (userId: string) => `offline:profile:${userId}`,
  vaults: (userId: string) => `offline:vaults:${userId}`,
  pending: (vaultId: string) => `sync:${vaultId}:pending`,
};

/** Thrown by `importVault` when the vault was created but its first upload failed; `vault.sync()` retries it. */
export class VaultUploadError extends KpxError {
  constructor(
    readonly vault: AccountVault,
    cause: unknown,
  ) {
    super("vault_upload_failed", `the vault was created, but its first upload failed: ${(cause as Error)?.message ?? cause}`, (cause as KpxError)?.status, { cause });
  }
}

export interface VaultInfo {
  id: string;
  name: string;
  role: VaultRole;
  orgId: string | null;
  currentKeyVersion: number;
  pendingKeyVersion: number | null;
  rotationRequired: boolean;
}

/** Each listed vault plus the keys this account holds for it (current and pending, newest first). */
interface VaultEntry {
  info: VaultInfo;
  keys: KeyVersion[];
}

const ROLE_ORDER: Record<VaultRole, number> = { read: 0, write: 1, manage: 2 };

export class Account {
  readonly auth: AuthClient;
  readonly sync: SyncClient;
  readonly tokens: TokenManager;
  private keyset: Keyset | null = null;
  private vaults = new Map<string, VaultEntry>();
  private readonly storage: KeyValueStorage;
  private _offline = false;
  // The user whose offline cache to drop when the session ends (the session is gone by then)
  private cacheUser: string | undefined;

  private constructor(
    readonly config: KpxConfiguration,
    private readonly opts: AccountOptions,
  ) {
    this.storage = opts.storage ?? new MemoryStorage();
    const base = new AuthClient({ ...opts, api: config.api });
    this.tokens = new TokenManager({ storage: new NamespacedStorage(this.storage, "kpx:"), refresh: (rt) => base.refresh(rt) });
    this.auth = base.withTokens(this.tokens);
    this.sync = new SyncClient({ ...opts, baseUrl: config.sync, token: this.tokens });
    this.tokens.onSignedOut(() => {
      const user = this.cacheUser;
      this.cacheUser = undefined;
      if (user) void this.clearOfflineData(user, [...this.vaults.keys()]).catch(() => undefined);
    });
  }

  /**
   * Discovers the server and loads a stored session, if any (signed in but locked). With `offline`,
   * an unreachable server falls back to the discovery document from the last successful connect.
   */
  static async connect(opts: AccountOptions): Promise<Account> {
    let config = opts.config;
    let offline = false;
    if (!config) {
      const key = OFFLINE.config(opts.issuer);
      try {
        config = await discover(opts.issuer, opts);
        if (opts.offline && opts.storage) await opts.storage.set(key, JSON.stringify(config));
      } catch (e) {
        const cached = opts.offline && isUnreachable(e) ? await opts.storage?.get(key) : null;
        if (!cached) throw e;
        config = JSON.parse(cached) as KpxConfiguration;
        offline = true;
      }
    }
    const acct = new Account(config, opts);
    acct._offline = offline;
    acct.cacheUser = (await acct.tokens.load())?.userId;
    return acct;
  }

  /**
   * True while the servers can't be reached and this account works from the offline cache (only with
   * the `offline` option). Edits are kept and upload once a sync succeeds again.
   */
  get offline(): boolean {
    return this._offline;
  }

  get signedIn(): boolean {
    return this.tokens.current !== null;
  }
  get unlocked(): boolean {
    return this.keyset !== null;
  }
  get userId(): string | undefined {
    return this.tokens.current?.userId;
  }
  get email(): string | undefined {
    return this.tokens.current?.email;
  }
  get principal(): Principal {
    if (!this.tokens.current) throw new KpxError("signed_out", "not signed in");
    return `user:${this.tokens.current.userId}`;
  }
  /** this account's public key fingerprint (to compare out of band) */
  get fingerprint(): string {
    return fingerprint(this.requireKeyset());
  }
  onSignedOut(listener: (reason: SignedOutReason) => void): () => void {
    return this.tokens.onSignedOut((r) => {
      this.lock();
      listener(r);
    });
  }

  private ids(email: string) {
    return opaqueIds(email, this.config.opaque.ids);
  }
  private skKey = (email: string) => `secret_key:${this.ids(email).idU}`;
  private devKey = (email: string) => `device:${this.ids(email).idU}`;

  /** Creates an account. Returns the Secret Key to show once (Emergency Kit). Signs in and unlocks. */
  async register(p: { email: string; password: string; kdf?: Parameters<typeof newKdfParams>[0]; trustDevice?: boolean }): Promise<{ secretKey: string; userId: string }> {
    const sk = generateSecretKey();
    const kdf = newKdfParams(p.kdf);
    checkKdfParams(kdf, this.config.kdf_min);
    const reg = await startRegistration(p.password);
    const started = await this.auth.registerStart({ email: p.email.trim(), request: b64u(reg.request) });
    const { record } = await finishRegistration(reg.state, fromB64u(started.response), this.ids(p.email));
    const auk = await deriveAuk(p.password, kdf, sk, { kdfMin: this.config.kdf_min });
    const keyset = generateKeyset();
    try {
      const wrapped = wrapKeyset(auk, keyset);
      const session = await this.auth.registerFinish({
        session_id: started.session_id,
        record: b64u(record),
        kdf,
        keyset: wrapped,
        device: this.opts.device,
      });
      await this.begin(p.email, session, sk, p.trustDevice ?? true);
      await this.cacheProfile(session.user.id, { kdf, keyset: wrapped });
      this.keyset = keyset;
      return { secretKey: formatSecretKey(sk), userId: session.user.id };
    } catch (e) {
      wipeKeyset(keyset);
      throw e;
    } finally {
      wipe(auk, sk);
    }
  }

  /**
   * OPAQUE login (+ TOTP when the account has it), then unlock. The Secret Key is needed the first time
   * on a device; with `trustDevice` (default) it is kept in storage for next time.
   */
  async login(p: { email: string; password: string; secretKey?: string; totp?: string | TotpPrompt; trustDevice?: boolean }): Promise<void> {
    const stored = await this.storage.get(this.skKey(p.email));
    const skText = p.secretKey ?? stored;
    if (!skText) throw new KpxError("invalid_secret_key", "this device needs the account's Secret Key");
    const sk = parseSecretKey(skText);
    const deviceId = await this.storage.get(this.devKey(p.email));
    const ids = this.ids(p.email);
    const login = await startLogin(p.password);
    const started = await this.auth.loginStart({ email: p.email.trim(), ke1: b64u(login.ke1) });
    let authU: Uint8Array;
    try {
      ({ authU } = await finishLogin(login.state, fromB64u(started.ke2), ids, this.config.opaque.context));
    } catch (e) {
      // Same message as the server's 401 for a wrong password or unknown email
      throw new KpxError("unauthorized", "wrong email or password", 401, { cause: e });
    }
    const device = { ...this.opts.device, ...(deviceId ? { id: deviceId } : {}) };
    let res = await this.auth.loginFinish({ session_id: started.session_id, auth_u: b64u(authU), device });
    if (isMfaChallenge(res)) {
      if (!p.totp) throw new KpxError("mfa_required", "a TOTP code is required");
      const mfaToken = res.mfa_token;
      // SPEC.md §8: a wrong code (invalid_mfa) keeps the token, so a prompt is asked again; once the
      // token is gone (the 5th wrong code, or it expired) the login fails with mfa_expired
      for (let attempt = 1, error: KpxError | undefined; ; attempt++) {
        const code = typeof p.totp === "string" ? p.totp : await p.totp({ attempt, error });
        try {
          res = await this.auth.loginMfa({ mfa_token: mfaToken, totp: code });
          break;
        } catch (e) {
          if (e instanceof KpxError && e.code === "invalid_mfa" && typeof p.totp !== "string") {
            error = e;
            continue;
          }
          // The server dropped the MFA token (5th wrong code, or it expired): sign-in starts over
          if (e instanceof KpxError && e.code !== "invalid_mfa" && (e.status === 401 || e.status === 410)) {
            throw new KpxError("mfa_expired", "the sign-in expired or the code was wrong too often; sign in again", e.status, { cause: e });
          }
          throw e;
        }
      }
    }
    try {
      await this.unlockWith(p.password, res.kdf, res.keyset, sk);
      await this.begin(p.email, res, sk, p.trustDevice ?? true);
      await this.cacheProfile(res.user.id, { kdf: res.kdf, keyset: res.keyset });
      this._offline = false;
    } finally {
      wipe(sk);
    }
  }

  private async begin(email: string, s: Session, sk: Uint8Array, trust: boolean) {
    await this.tokens.start({ issuer: this.config.issuer, userId: s.user.id, email: s.user.email ?? email, deviceId: s.device_id, refreshToken: s.refresh_token }, s.access_token, s.expires_in);
    this.cacheUser = s.user.id;
    await this.storage.set(this.devKey(email), s.device_id);
    if (trust) await this.storage.set(this.skKey(email), formatSecretKey(sk));
  }

  private async unlockWith(password: string, kdf: Session["kdf"], wrapped: Session["keyset"], sk: Uint8Array) {
    checkKdfParams(kdf, this.config.kdf_min);
    const auk = await deriveAuk(password, kdf, sk, { kdfMin: this.config.kdf_min });
    try {
      this.lock();
      this.keyset = unwrapKeyset(auk, wrapped);
    } catch (e) {
      throw (e as KpxError).code === "decryption_failed" ? new KpxError("unauthorized", "wrong password or Secret Key", 401, { cause: e }) : e;
    } finally {
      wipe(auk);
    }
  }

  /**
   * Unlocks a signed-in (resumed) session with the master password; no OPAQUE round trip needed. With
   * `offline`, an unreachable server falls back to the wrapped keyset cached at the last sign-in or
   * unlock, so the password and Secret Key still have to be right.
   */
  async unlock(password: string, secretKey?: string): Promise<void> {
    const session = await this.tokens.load();
    if (!session) throw new KpxError("signed_out", "not signed in");
    this.cacheUser = session.userId;
    const skText = secretKey ?? (await this.storage.get(this.skKey(session.email)));
    if (!skText) throw new KpxError("invalid_secret_key", "this device needs the account's Secret Key");
    const sk = parseSecretKey(skText);
    try {
      let profile: Profile;
      let offline = false;
      try {
        const me = await this.auth.me();
        profile = { kdf: me.kdf, keyset: me.keyset };
      } catch (e) {
        const cached = isUnreachable(e) ? await this.cachedProfile(session.userId) : null;
        if (!cached) throw e;
        profile = cached;
        offline = true;
      }
      await this.unlockWith(password, profile.kdf, profile.keyset, sk);
      if (!offline) await this.cacheProfile(session.userId, profile);
      this._offline = offline;
    } finally {
      wipe(sk);
    }
  }

  /**
   * Changes the master password (SPEC.md §16). The current one is checked by unwrapping the keyset; then
   * OPAQUE is registered again and the same keyset is wrapped with the new AUK, so sealed vault keys keep
   * working. The Secret Key stays the same. The server signs out the other devices.
   */
  async changePassword(p: { current: string; next: string; kdf?: Parameters<typeof newKdfParams>[0] }): Promise<void> {
    const session = await this.tokens.load();
    if (!session) throw new KpxError("signed_out", "not signed in");
    const skText = await this.storage.get(this.skKey(session.email));
    if (!skText) throw new KpxError("invalid_secret_key", "this device needs the account's Secret Key");
    const sk = parseSecretKey(skText);
    let keyset: Keyset | null = null;
    let auk: Uint8Array | null = null;
    try {
      const me = await this.auth.me();
      checkKdfParams(me.kdf, this.config.kdf_min);
      const oldAuk = await deriveAuk(p.current, me.kdf, sk, { kdfMin: this.config.kdf_min });
      try {
        keyset = unwrapKeyset(oldAuk, me.keyset);
      } catch (e) {
        throw (e as KpxError).code === "decryption_failed" ? new KpxError("unauthorized", "the current password is wrong", 401, { cause: e }) : e;
      } finally {
        wipe(oldAuk);
      }
      const kdf = newKdfParams(p.kdf);
      checkKdfParams(kdf, this.config.kdf_min);
      auk = await deriveAuk(p.next, kdf, sk, { kdfMin: this.config.kdf_min });
      const wrapped = wrapKeyset(auk, keyset);
      // password/start needs an access token issued in the last 5 minutes
      await this.tokens.getAccessToken({ force: true });
      const reg = await startRegistration(p.next);
      const started = await this.auth.passwordStart({ request: b64u(reg.request) });
      const { record } = await finishRegistration(reg.state, fromB64u(started.response), this.ids(session.email));
      await this.auth.passwordFinish({ session_id: started.session_id, record: b64u(record), kdf, keyset: wrapped });
      await this.cacheProfile(session.userId, { kdf, keyset: wrapped });
    } finally {
      if (keyset) wipeKeyset(keyset);
      if (auk) wipe(auk);
      wipe(sk);
    }
  }

  /** The Secret Key kept on this device, to download the Emergency Kit again. Needs the account unlocked. */
  async secretKey(): Promise<string | null> {
    this.requireKeyset();
    const session = await this.tokens.load();
    return session ? this.storage.get(this.skKey(session.email)) : null;
  }

  /**
   * A one-time link (valid 60 seconds) that signs the browser in to the auth website and opens `next`,
   * a path there such as `/settings` (SPEC.md §16).
   */
  async webSessionUrl(next?: string): Promise<string> {
    const { code } = await this.auth.createWebSession();
    const url = new URL("session/claim", this.config.issuer.replace(/\/?$/, "/"));
    url.searchParams.set("code", code);
    if (next) url.searchParams.set("next", next);
    return url.toString();
  }

  /**
   * Goes back online after working from the offline cache: re-reads the account record and the vault
   * list. Vaults that are no longer listed (access revoked or the vault deleted meanwhile) are
   * forgotten with their local copies and returned in `dropped`. Throws while still unreachable.
   */
  async reconnect(): Promise<{ vaults: VaultInfo[]; dropped: string[] }> {
    const session = await this.tokens.load();
    if (!session) throw new KpxError("signed_out", "not signed in");
    const me = await this.auth.me();
    await this.cacheProfile(session.userId, { kdf: me.kdf, keyset: me.keyset });
    return this.loadVaultList();
  }

  /** Clears private keys and vault keys from memory (best effort). */
  lock(): void {
    wipeKeyset(this.keyset);
    this.keyset = null;
    for (const v of this.vaults.values()) for (const k of v.keys) wipe(k.key);
    this.vaults.clear();
  }

  /** Revokes this device's session on the server and forgets it locally (the trusted Secret Key stays unless `forgetDevice`). */
  async logout(opts: { forgetDevice?: boolean } = {}): Promise<void> {
    const email = this.tokens.current?.email;
    const user = this.tokens.current?.userId;
    try {
      await this.auth.logout();
    } catch {
      /* best effort */
    }
    const known = [...this.vaults.keys()];
    this.lock();
    // The offline cache goes with the session (vault copies, wrapped keyset, vault list)
    this.cacheUser = undefined;
    if (user) await this.clearOfflineData(user, known);
    this.vaults.clear();
    this._offline = false;
    await this.tokens.clear("logout");
    if (opts.forgetDevice && email) {
      await this.storage.delete(this.skKey(email));
      await this.storage.delete(this.devKey(email));
    }
  }

  private requireKeyset(): Keyset {
    if (!this.keyset) throw new KpxError("signed_out", "the account is locked");
    return this.keyset;
  }

  // ------------------------------------------------------------------------------------- vaults

  private ingest(v: Vault): VaultEntry {
    const ks = this.requireKeyset();
    const keys: KeyVersion[] = [];
    for (const k of v.keys ?? []) {
      try {
        keys.push({ version: k.key_version, key: unsealVaultKey(ks.encSk, v.id, fromB64u(k.sealed_key)) });
      } catch {
        /* a key we can't open (sealed to an old keyset): skip, the other version may work */
      }
    }
    keys.sort((a, b) => b.version - a.version);
    let name = "";
    for (const k of keys) {
      try {
        name = decryptVaultName(k.key, v.id, v.encrypted_name);
        break;
      } catch {
        /* name encrypted under the other key version */
      }
    }
    const entry: VaultEntry = {
      info: {
        id: v.id,
        name,
        role: v.role,
        orgId: v.org_id ?? null,
        currentKeyVersion: v.current_key_version,
        pendingKeyVersion: v.pending_key_version ?? null,
        rotationRequired: !!v.rotation_required,
      },
      keys,
    };
    const old = this.vaults.get(v.id);
    if (old) for (const k of old.keys) if (!keys.some((n) => n.key === k.key)) wipe(k.key);
    this.vaults.set(v.id, entry);
    return entry;
  }

  /**
   * GET /vaults: every vault this account can open, with names decrypted. With `offline`, an
   * unreachable server falls back to the list from the last successful call.
   */
  async listVaults(): Promise<VaultInfo[]> {
    return (await this.loadVaultList()).vaults;
  }

  private async loadVaultList(): Promise<{ vaults: VaultInfo[]; dropped: string[] }> {
    let vaults: Vault[];
    try {
      ({ vaults } = await this.auth.listVaults());
    } catch (e) {
      const cached = isUnreachable(e) ? await this.cachedVaults() : null;
      if (!cached) throw e;
      this._offline = true;
      return { vaults: cached.map((v) => this.ingest(v).info), dropped: [] };
    }
    this._offline = false;
    const seen = new Set(vaults.map((v) => v.id));
    const known = new Set([...this.vaults.keys(), ...((await this.cachedVaults()) ?? []).map((v) => v.id)]);
    const dropped = [...known].filter((id) => !seen.has(id));
    for (const id of dropped) {
      for (const k of this.vaults.get(id)?.keys ?? []) wipe(k.key);
      this.vaults.delete(id);
    }
    if (this.opts.offline) {
      // What this device kept for a vault it can no longer open goes with it
      for (const id of dropped) await this.forgetVaultData(id);
      if (this.tokens.current) await this.storage.set(OFFLINE.vaults(this.tokens.current.userId), JSON.stringify(vaults));
    }
    return { vaults: vaults.map((v) => this.ingest(v).info), dropped };
  }

  private async entry(vaultId: string): Promise<VaultEntry> {
    const known = this.vaults.get(vaultId);
    if (known) return known;
    try {
      const v = await this.auth.getVault(vaultId);
      await this.cacheVault(v);
      return this.ingest(v);
    } catch (e) {
      const cached = isUnreachable(e) ? (await this.cachedVaults())?.find((v) => v.id === vaultId) : undefined;
      if (!cached) throw e;
      this._offline = true;
      return this.ingest(cached);
    }
  }

  /**
   * Opens a vault: downloads and decrypts it (newest key first). With `offline`, an unreachable server
   * falls back to the copy this device kept (local edits not yet uploaded, else the server's copy at
   * the last sync), and the vault's `offline` is true; a vault never synced here fails with
   * `not_available_offline`.
   */
  async openVault(vaultId: string): Promise<AccountVault> {
    const e = await this.entry(vaultId);
    const v = new AccountVault(this, e.info, () => this.vaults.get(vaultId)?.keys ?? e.keys);
    try {
      await v.sync();
    } catch (err) {
      if (!this.opts.offline || !isUnreachable(err)) throw err;
      await v.openLocalCopy(err);
      this._offline = true;
    }
    return v;
  }

  /** Public keys of a principal, verified (sig) before anything is sealed to them. */
  async verifiedPublicKeys(principal: Principal) {
    return trustedPublicKeys(await this.auth.publicKey(principal));
  }

  /** Creates a vault (personal, or in an org with `orgId`; owners/admins are sealed in automatically). */
  async createVault(name: string, opts: { orgId?: string } = {}): Promise<AccountVault> {
    const { vault, key } = await this.registerVault(name, opts.orgId);
    vault.db = createVaultKdbx(name, key);
    await vault.sync();
    return vault;
  }

  /**
   * "Move to account": copies an open database (local, or synced with a self-hosted server), re-keys
   * the copy to a fresh vault key, creates the vault (personal, or in an org this account manages,
   * sealed to every confirmed owner and admin) and uploads it with `If-None-Match: *`. The original
   * is never changed. As in Qt, the copy's root group takes the vault name (default: the root
   * group's name) and its sync server remotes are dropped. If the vault was created but the upload
   * failed, a VaultUploadError carries the vault, whose `sync()` uploads it later.
   */
  async importVault(source: Kdbx, opts: { name?: string; orgId?: string } = {}): Promise<AccountVault> {
    this.requireKeyset();
    const copy = await copyKdbx(source);
    const root = copy.getDefaultGroup();
    const name = opts.name?.trim() || root.name?.trim() || "Imported";
    dropServerRemotes(copy);
    const { vault, key } = await this.registerVault(name, opts.orgId);
    try {
      rekeyToVaultKey(copy, key);
    } finally {
      wipe(key);
    }
    root.name = name;
    root.times.update();
    vault.db = copy;
    try {
      await vault.sync();
    } catch (e) {
      throw new VaultUploadError(vault, e);
    }
    return vault;
  }

  /** POST /vaults with key version 1 sealed to this account (and an org's owners/admins); no blob yet. */
  private async registerVault(name: string, orgId?: string): Promise<{ vault: AccountVault; key: Uint8Array }> {
    const ks = this.requireKeyset();
    const id = randomUuid();
    const key = randomBytes(32);
    const grants: Grant[] = [{ principal: this.principal, role: "manage", key_version: 1, sealed_key: b64u(sealVaultKey(ks.encPk, id, key)) }];
    if (orgId) {
      const { members } = await this.auth.listMembers(orgId);
      for (const m of members) {
        const principal = `user:${m.user_id}`;
        if (principal === this.principal || (m.role !== "owner" && m.role !== "admin") || m.status !== "confirmed" || !m.public) continue;
        grants.push({ principal, role: "manage", key_version: 1, sealed_key: b64u(sealVaultKey(trustedPublicKeys(m.public).encPk, id, key)) });
      }
    }
    const created = await this.auth.createVault({ id, org_id: orgId ?? null, encrypted_name: encryptVaultName(key, id, name), grants });
    const listed: Vault = { ...created, keys: created.keys?.length ? created.keys : [{ key_version: 1, sealed_key: grants[0]!.sealed_key }] };
    await this.cacheVault(listed);
    const entry = this.ingest(listed);
    // The new vault is only in the next token's vlt claim
    await this.tokens.refreshNow();
    return { vault: new AccountVault(this, entry.info, () => this.vaults.get(id)?.keys ?? entry.keys), key };
  }

  /** Grants (or changes) access: seals the current vault key to the grantee after checking their keys. */
  async share(vaultId: string, who: { email?: string; principal?: Principal }, role: VaultRole): Promise<{ principal: Principal; fingerprint: string }> {
    const e = await this.entry(vaultId);
    const current = e.keys.find((k) => k.version === e.info.currentKeyVersion);
    if (!current) throw new KpxError("no_vault_key", "this account doesn't hold the current vault key");
    const pp = who.principal ? await this.auth.publicKey(who.principal) : await this.auth.lookupUser(who.email ?? "");
    const pub = trustedPublicKeys(pp);
    await this.auth.grantAccess(vaultId, [{ principal: pp.principal, role, key_version: current.version, sealed_key: b64u(sealVaultKey(pub.encPk, vaultId, current.key)) }]);
    return { principal: pp.principal, fingerprint: fingerprint(pub) };
  }

  /** Removes members and rotates the vault key in one step (SPEC §7). */
  async revoke(vaultId: string, principals: Principal[]): Promise<SyncResult> {
    return this.rotate(vaultId, { remove: principals });
  }

  /**
   * Rotation (SPEC §7): new key sealed to every remaining member → POST keys (removes `remove` at once)
   * → download, re-key, conditional PUT (merge/retry on 412) → activate.
   */
  async rotate(vaultId: string, opts: { remove?: Principal[] } = {}): Promise<SyncResult> {
    const e = await this.entry(vaultId);
    if (ROLE_ORDER[e.info.role] < ROLE_ORDER.manage) throw new KpxError("forbidden", "rotating a vault key needs the manage role", 403);
    const remove = new Set(opts.remove ?? []);
    const { access } = await this.auth.listAccess(vaultId);
    const version = e.info.currentKeyVersion + 1;
    const key = randomBytes(32);
    const remaining = new Map<Principal, VaultRole>();
    for (const a of access) if (!remove.has(a.principal)) remaining.set(a.principal, a.role);
    remaining.set(this.principal, e.info.role);
    const grants: Grant[] = [];
    for (const [principal, role] of remaining) {
      const pub = principal === this.principal ? this.requireKeyset() : await this.verifiedPublicKeys(principal);
      grants.push({ principal, role, key_version: version, sealed_key: b64u(sealVaultKey(pub.encPk, vaultId, key)) });
    }
    await this.auth.startRotation(vaultId, { key_version: version, grants, remove: [...remove] });
    e.keys = [{ version, key }, ...e.keys];
    const vault = new AccountVault(this, e.info, () => e.keys);
    const result = await vault.sync({ rekeyTo: key });
    await this.auth.activateKey(vaultId, version);
    // The name is encrypted under the vault key too
    await this.auth.renameVault(vaultId, encryptVaultName(key, vaultId, e.info.name));
    e.info = { ...e.info, currentKeyVersion: version, pendingKeyVersion: null, rotationRequired: false };
    // The cached vault list must hold the new sealed key, or the re-keyed copy won't open offline
    if (this.opts.offline) await this.auth.getVault(vaultId).then((v) => this.cacheVault(v), () => undefined);
    return result;
  }

  // --------------------------------------------------------------------------- service accounts

  /**
   * Creates a service account in an org (owner/admin): generates its keyset and master key in this
   * client, seals the master key to every owner and admin, grants it the given vaults, and returns the
   * token to show once.
   */
  async createServiceAccount(orgId: string, p: { name: string; vaults?: { id: string; role: VaultRole }[]; expiresAt?: string | null; secretName?: string }) {
    const saId = randomUuid();
    const master = randomBytes(32);
    const saKeys = generateKeyset();
    try {
      const { members } = await this.auth.listMembers(orgId);
      const masterKeys = [];
      for (const m of members) {
        if ((m.role !== "owner" && m.role !== "admin") || !m.public) continue;
        if (m.status !== "confirmed" && `user:${m.user_id}` !== this.principal) continue;
        const pub = `user:${m.user_id}` === this.principal ? this.requireKeyset() : trustedPublicKeys(m.public);
        masterKeys.push({ sa_id: saId, principal: `user:${m.user_id}`, sealed_key: b64u(sealSaMaster(pub.encPk, saId, master)) });
      }
      if (!masterKeys.some((k) => k.principal === this.principal)) {
        masterKeys.push({ sa_id: saId, principal: this.principal, sealed_key: b64u(sealSaMaster(this.requireKeyset().encPk, saId, master)) });
      }
      const { token, body } = newSaSecret({ url: this.config.issuer, saId, master, secretId: randomUuid(), name: p.secretName, expiresAt: p.expiresAt });
      const sa = await this.auth.createServiceAccount(orgId, { id: saId, name: p.name, expires_at: p.expiresAt ?? null, keyset: wrapKeyset(master, saKeys), master_keys: masterKeys, secret: body });
      for (const g of p.vaults ?? []) {
        const e = await this.entry(g.id);
        const current = e.keys.find((k) => k.version === e.info.currentKeyVersion);
        if (!current) throw new KpxError("no_vault_key", `no current key for vault ${g.id}`);
        await this.auth.grantAccess(g.id, [{ principal: `sa:${saId}`, role: g.role, key_version: current.version, sealed_key: b64u(sealVaultKey(saKeys.encPk, g.id, current.key)) }]);
      }
      return { serviceAccount: sa, token };
    } finally {
      wipe(master);
      wipeKeyset(saKeys);
    }
  }

  /** Issues another secret for an SA (owner/admin): unseals the master key and builds a token to show once. */
  async issueServiceAccountSecret(saId: string, p: { name?: string; expiresAt?: string | null } = {}) {
    const sa = await this.auth.getServiceAccount(saId);
    if (!sa.master_key) throw new KpxError("forbidden", "only org owners and admins hold the SA master key", 403);
    const master = unsealSaMaster(this.requireKeyset().encSk, saId, fromB64u(sa.master_key));
    try {
      const { token, body } = newSaSecret({ url: this.config.issuer, saId, master, secretId: randomUuid(), name: p.name, expiresAt: p.expiresAt });
      await this.auth.issueSaSecret(saId, body);
      return { token, prefix: body.prefix, id: body.id };
    } finally {
      wipe(master);
    }
  }

  // --------------------------------------------------------------------------------------- orgs

  /**
   * Confirms an accepted member (owner/admin) after checking their key signature. Owners and admins
   * get every org vault this account manages, with manage, and the org's SA master keys; a member
   * gets the vaults in `vaults` only.
   */
  async confirmMember(orgId: string, member: Member, vaults: { id: string; role: VaultRole }[] = []): Promise<Member> {
    if (!member.public) throw new KpxError("invalid_request", "this member has no public keys yet", 400);
    const pub = trustedPublicKeys(member.public);
    const principal: Principal = `user:${member.user_id}`;
    const manager = isManager(member.role);
    const chosen = manager ? (await this.managedOrgVaults(orgId)).map((v) => ({ id: v.id, role: "manage" as VaultRole })) : vaults;
    const grants: VaultGrant[] = [];
    for (const g of chosen) {
      const e = await this.entry(g.id);
      if (e.info.orgId !== orgId) throw new KpxError("invalid_request", `vault ${g.id} is not a vault of this org`, 400);
      const current = e.keys.find((k) => k.version === e.info.currentKeyVersion);
      if (!current) throw new KpxError("no_vault_key", `no current key for vault ${g.id}`);
      grants.push({ vault_id: g.id, principal, role: g.role, key_version: current.version, sealed_key: b64u(sealVaultKey(pub.encPk, g.id, current.key)) });
    }
    return this.auth.confirmMember(orgId, member.user_id, {
      grants,
      sa_master_keys: manager ? await this.sealSaMasterKeys(orgId, principal, pub.encPk) : undefined,
    });
  }

  /**
   * Changes a member's org role. Promoting a confirmed member to owner/admin also hands over the SA
   * master keys and manage on every org vault this account manages; the server drops their master
   * keys on a demotion to member.
   */
  async setMemberRole(orgId: string, member: Member, role: OrgRole): Promise<Member> {
    const principal: Principal = `user:${member.user_id}`;
    const promote = isManager(role) && member.status === "confirmed" && !!member.public;
    const pub = promote ? trustedPublicKeys(member.public!) : null;
    const updated = await this.auth.setMemberRole(orgId, member.user_id, {
      role,
      sa_master_keys: pub ? await this.sealSaMasterKeys(orgId, principal, pub.encPk) : undefined,
    });
    if (pub) for (const v of await this.managedOrgVaults(orgId)) await this.share(v.id, { principal }, "manage");
    return updated;
  }

  /**
   * Removes a member, then rotates every org vault the server flagged (rotation_required) that this
   * account manages, so the old key opens nothing new. Failed rotations are returned, not thrown.
   */
  async removeMember(orgId: string, userId: string): Promise<{ rotated: string[]; failed: { id: string; error: unknown }[] }> {
    await this.auth.removeMember(orgId, userId);
    const rotated: string[] = [];
    const failed: { id: string; error: unknown }[] = [];
    for (const v of await this.listVaults()) {
      if (v.orgId !== orgId || !v.rotationRequired || v.role !== "manage") continue;
      try {
        await this.rotate(v.id);
        rotated.push(v.id);
      } catch (error) {
        failed.push({ id: v.id, error });
      }
    }
    return { rotated, failed };
  }

  private async managedOrgVaults(orgId: string): Promise<VaultInfo[]> {
    return (await this.listVaults()).filter((v) => v.orgId === orgId && v.role === "manage");
  }

  /** Seals every SA master key of the org that this account holds to another owner/admin. */
  private async sealSaMasterKeys(orgId: string, principal: Principal, encPk: Uint8Array): Promise<SaMasterGrant[]> {
    const { service_accounts } = await this.auth.listServiceAccounts(orgId);
    const grants: SaMasterGrant[] = [];
    for (const listed of service_accounts) {
      const sa = listed.master_key ? listed : await this.auth.getServiceAccount(listed.id);
      if (!sa.master_key) continue;
      const master = unsealSaMaster(this.requireKeyset().encSk, sa.id, fromB64u(sa.master_key));
      try {
        grants.push({ sa_id: sa.id, principal, sealed_key: b64u(sealSaMaster(encPk, sa.id, master)) });
      } finally {
        wipe(master);
      }
    }
    return grants;
  }

  // ------------------------------------------------------------------------------------- events

  /**
   * Live updates: `vault` events are passed on; on `access` events the JWT is refreshed (new vlt
   * claims), the vault list reloaded and the stream reconnected (SPEC §11).
   */
  subscribe(handlers: { onVaultChanged?: (e: Extract<SyncEvent, { type: "vault" }>) => void; onVaultsChanged?: (vaults: VaultInfo[]) => void; onError?: (e: unknown) => void } = {}): EventStream {
    const stream: EventStream = subscribeEvents(this.sync, {
      onEvent: (ev) => {
        if (ev.type === "vault") handlers.onVaultChanged?.(ev);
        else if (ev.type === "access") {
          void (async () => {
            try {
              await this.tokens.refreshNow();
              const vaults = await this.listVaults();
              handlers.onVaultsChanged?.(vaults);
              stream.reconnect();
            } catch (e) {
              handlers.onError?.(e);
            }
          })();
        }
      },
      onStatus: (s, d) => d?.error && handlers.onError?.(d.error),
    });
    return stream;
  }

  /** @internal storage for vault sync state */
  async loadState(vaultId: string): Promise<SyncState | null> {
    const raw = await this.storage.get(`sync:${vaultId}`);
    return raw ? deserializeSyncState(raw) : null;
  }
  /** @internal */
  async saveState(vaultId: string, state: SyncState): Promise<void> {
    await this.storage.set(`sync:${vaultId}`, serializeSyncState(state));
  }

  // ------------------------------------------------------------------------------ offline cache

  /** @internal whether the offline cache is on */
  get keepsOfflineData(): boolean {
    return !!this.opts.offline;
  }

  /** @internal local edits not yet uploaded: a .kdbx encrypted with the vault key */
  async loadPending(vaultId: string): Promise<Uint8Array | null> {
    if (!this.opts.offline) return null;
    const raw = await this.storage.get(OFFLINE.pending(vaultId));
    return raw ? fromB64u(raw) : null;
  }
  /** @internal */
  async savePending(vaultId: string, data: Uint8Array): Promise<void> {
    if (this.opts.offline) await this.storage.set(OFFLINE.pending(vaultId), b64u(data));
  }
  /** @internal */
  async deletePending(vaultId: string): Promise<void> {
    if (this.opts.offline) await this.storage.delete(OFFLINE.pending(vaultId));
  }

  private async forgetVaultData(vaultId: string): Promise<void> {
    await this.storage.delete(`sync:${vaultId}`);
    await this.storage.delete(OFFLINE.pending(vaultId));
  }

  private async cacheProfile(userId: string, profile: Profile): Promise<void> {
    if (this.opts.offline) await this.storage.set(OFFLINE.profile(userId), JSON.stringify({ kdf: profile.kdf, keyset: profile.keyset }));
  }
  private async cachedProfile(userId: string): Promise<Profile | null> {
    if (!this.opts.offline) return null;
    const raw = await this.storage.get(OFFLINE.profile(userId));
    return raw ? (JSON.parse(raw) as Profile) : null;
  }
  /** Adds or replaces one vault in the cached vault list (after create, rotation or GET /vaults/{id}). */
  private async cacheVault(v: Vault): Promise<void> {
    const userId = this.tokens.current?.userId;
    if (!this.opts.offline || !userId) return;
    const list = ((await this.cachedVaults()) ?? []).filter((x) => x.id !== v.id);
    await this.storage.set(OFFLINE.vaults(userId), JSON.stringify([...list, v]));
  }
  private async cachedVaults(): Promise<Vault[] | null> {
    const userId = this.tokens.current?.userId;
    if (!this.opts.offline || !userId) return null;
    const raw = await this.storage.get(OFFLINE.vaults(userId));
    return raw ? (JSON.parse(raw) as Vault[]) : null;
  }

  /** Drops everything the offline cache holds for a user (on sign-out, or when the session is rejected). */
  private async clearOfflineData(userId: string, known: string[] = []): Promise<void> {
    if (!this.opts.offline) return;
    const raw = await this.storage.get(OFFLINE.vaults(userId));
    const ids = new Set([...known, ...(raw ? (JSON.parse(raw) as Vault[]) : []).map((v) => v.id)]);
    for (const id of ids) await this.forgetVaultData(id);
    await this.storage.delete(OFFLINE.vaults(userId));
    await this.storage.delete(OFFLINE.profile(userId));
  }
}

/** An opened account vault: a kdbxweb database kept in sync with `vaults/<id>`. */
export class AccountVault {
  db: Kdbx | null = null;
  /** true when the last sync couldn't reach the server (or the vault was opened from the offline cache) */
  offline = false;
  private state: SyncState | null | undefined = undefined;
  private hasPending = false;

  constructor(
    private readonly account: Account,
    public info: VaultInfo,
    private readonly keys: () => KeyVersion[],
  ) {}

  get id(): string {
    return this.info.id;
  }
  get name(): string {
    return this.info.name;
  }

  /** The server ETag at the last sync (compare with a `vault` event's etag), or undefined before one. */
  get etag(): string | undefined {
    return this.state?.etag;
  }

  /**
   * Downloads, merges local edits and uploads them (conditional PUT, merge and retry on 412). With
   * `localChanged: false` it first asks the server with a HEAD and stops there when nothing changed.
   */
  async sync(opts: { rekeyTo?: Uint8Array; localChanged?: boolean } = {}): Promise<SyncResult> {
    if (this.state === undefined) this.state = await this.account.loadState(this.id);
    const keys = [...this.keys()].sort((a, b) => b.version - a.version);
    const credentials = keys.map((k) => vaultCredentials(k.key));
    const blob = this.account.sync.vault(this.id);
    let db = this.db ?? (await this.openPending(keys));
    if (!db) {
      // Nothing local yet: the server copy becomes the working copy
      const got = await blob.get().catch((e: unknown) => {
        if (isUnreachable(e)) this.offline = true;
        throw e;
      });
      if (got.status !== 200) throw new KpxError("not_found", `vault ${this.id} has no data on the sync server`, 404);
      db = (await openWithKeyVersions(got.data, keys)).db;
    }
    this.db = db;
    let result: SyncResult;
    try {
      result = await syncKdbx({
        blob,
        db,
        credentials,
        state: this.state,
        localChanged: opts.localChanged,
        beforeUpload: opts.rekeyTo ? (d) => rekeyToVaultKey(d, opts.rekeyTo!) : undefined,
      });
    } catch (e) {
      if (isUnreachable(e)) {
        this.offline = true;
        // Keep local edits on this device (encrypted with the vault key) until an upload succeeds
        if (this.account.keepsOfflineData && (opts.localChanged !== false || this.hasPending)) {
          await this.account.savePending(this.id, await saveKdbx(db));
          this.hasPending = true;
        }
      }
      throw e;
    }
    this.offline = false;
    this.db = result.db;
    this.state = result.state;
    await this.account.saveState(this.id, result.state);
    if (this.hasPending) {
      await this.account.deletePending(this.id);
      this.hasPending = false;
    }
    return result;
  }

  /** Local edits kept from an earlier session that couldn't upload them; they merge in on this sync. */
  private async openPending(keys: KeyVersion[]): Promise<Kdbx | null> {
    const pending = await this.account.loadPending(this.id);
    if (!pending) return null;
    this.hasPending = true;
    try {
      return (await openWithKeyVersions(pending, keys)).db;
    } catch {
      // Encrypted under a key this account no longer holds (rotated twice meanwhile): nothing to merge
      return null;
    }
  }

  /**
   * @internal Offline open: local edits not yet uploaded (already loaded by `sync`), else the server's
   * bytes at the last sync. `cause` is the network error to report when there is neither.
   */
  async openLocalCopy(cause: unknown): Promise<void> {
    this.offline = true;
    if (this.db) return;
    const base = this.state?.base;
    if (!base) {
      throw new KpxError("not_available_offline", `vault "${this.name || this.id}" was never synced on this device, so it can't be opened offline`, undefined, { cause });
    }
    this.db = (await openWithKeyVersions(base, [...this.keys()])).db;
  }

  read(ref: string | Pick<SecretReference, "groupPath" | "entry" | "field">): string {
    if (!this.db) throw new KpxError("kdbx_error", "vault not opened");
    return readField(this.db, typeof ref === "string" ? parseReference(ref) : ref);
  }

  /** Sets a field and syncs it up. */
  async write(ref: string | Pick<SecretReference, "groupPath" | "entry" | "field">, value: string, opts: { create?: boolean } = {}): Promise<SyncResult> {
    if (!this.db) throw new KpxError("kdbx_error", "vault not opened");
    writeField(this.db, typeof ref === "string" ? parseReference(ref) : ref, value, opts);
    return this.sync();
  }
}

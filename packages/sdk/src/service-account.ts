/**
 * Service accounts (SPEC §9): `ServiceAccount.fromToken(kpx_sa_…)` exchanges the secret for a JWT,
 * unwraps master key → keyset, and reads/writes secrets by `kpx://<vault>/<entry>/<field>`.
 * Used by the CLI, `kpx connect` and the GitHub Action.
 */
import { KpxError } from "./errors.js";
import { AuthClient, discover, type AccessTokenSource } from "./auth/client.js";
import type { KpxConfiguration, VaultRole } from "./auth/types.js";
import type { HttpOptions } from "./http/request.js";
import { unsealVaultKey } from "./crypto/envelope.js";
import { type Keyset, unwrapKeyset, wipeKeyset } from "./crypto/keyset.js";
import { parseSaToken, unwrapSaMaster } from "./crypto/tokens.js";
import { decryptVaultName } from "./crypto/vault-name.js";
import { b64u, fromB64u, wipe } from "./util/bytes.js";
import { SyncClient } from "./sync/client.js";
import { type SyncState, syncKdbx } from "./sync/engine.js";
import { type Kdbx, type KeyVersion, openWithKeyVersions, vaultCredentials } from "./vault/kdbx.js";
import { REFERENCE_PATTERN, parseReference, readField, writeField } from "./vault/reference.js";

export interface SaVault {
  id: string;
  name: string;
  role: VaultRole;
  keys: KeyVersion[];
}

export class ServiceAccount {
  private keyset: Keyset | null;
  private access: { token: string; expiresAt: number } | null;
  private inflight: Promise<string> | null = null;
  private vaults: SaVault[] | null = null;
  private opened = new Map<string, { db: Kdbx; state: SyncState | null }>();
  readonly auth: AuthClient;
  readonly sync: SyncClient;

  private constructor(
    readonly saId: string,
    readonly config: KpxConfiguration,
    private readonly secret: Uint8Array,
    keyset: Keyset,
    access: { token: string; expiresAt: number },
    private readonly http: HttpOptions,
  ) {
    this.keyset = keyset;
    this.access = access;
    const tokens: AccessTokenSource = { getAccessToken: (o) => this.accessToken(o?.force) };
    this.auth = new AuthClient({ ...http, api: config.api, tokens });
    this.sync = new SyncClient({ ...http, baseUrl: config.sync, token: tokens });
  }

  /** Exchanges the token's secret and unwraps the keyset (token → kek → master → keyset). */
  static async fromToken(token: string, http: HttpOptions & { config?: KpxConfiguration } = {}): Promise<ServiceAccount> {
    const t = parseSaToken(token);
    const config = http.config ?? (await discover(t.url, http));
    const auth = new AuthClient({ ...http, api: config.api });
    const ex = await auth.serviceAccountExchange({ sa_id: t.saId, secret: b64u(t.secret) });
    const master = unwrapSaMaster(t.kek, t.saId, ex.wrapped_master);
    wipe(t.kek);
    try {
      const keyset = unwrapKeyset(master, ex.keyset);
      return new ServiceAccount(t.saId, config, t.secret, keyset, { token: ex.access_token, expiresAt: Date.now() + ex.expires_in * 1000 }, http);
    } finally {
      wipe(master);
    }
  }

  get principal(): string {
    return `sa:${this.saId}`;
  }

  /** SAs have no refresh token: they exchange the secret again when the JWT is about to expire. */
  private accessToken(force = false): Promise<string> {
    if (!this.keyset) return Promise.reject(new KpxError("signed_out", "service account closed"));
    if (!force && this.access && this.access.expiresAt - 60_000 > Date.now()) return Promise.resolve(this.access.token);
    this.inflight ??= (async () => {
      const ex = await new AuthClient({ ...this.http, api: this.config.api }).serviceAccountExchange({ sa_id: this.saId, secret: b64u(this.secret) });
      this.access = { token: ex.access_token, expiresAt: Date.now() + ex.expires_in * 1000 };
      return ex.access_token;
    })().finally(() => (this.inflight = null));
    return this.inflight;
  }

  /** Vaults granted to this SA, with names decrypted. */
  async listVaults(refresh = false): Promise<SaVault[]> {
    if (this.vaults && !refresh) return this.vaults;
    const ks = this.keyset;
    if (!ks) throw new KpxError("signed_out", "service account closed");
    const { vaults } = await this.auth.listVaults();
    this.vaults = vaults.map((v) => {
      const keys: KeyVersion[] = [];
      for (const k of v.keys ?? []) {
        try {
          keys.push({ version: k.key_version, key: unsealVaultKey(ks.encSk, v.id, fromB64u(k.sealed_key)) });
        } catch {
          /* skip */
        }
      }
      keys.sort((a, b) => b.version - a.version);
      let name = "";
      for (const k of keys) {
        try {
          name = decryptVaultName(k.key, v.id, v.encrypted_name);
          break;
        } catch {
          /* other version */
        }
      }
      return { id: v.id, name, role: v.role, keys };
    });
    return this.vaults;
  }

  /** Finds a vault by id or (unique) name. */
  async vault(idOrName: string): Promise<SaVault> {
    const all = await this.listVaults();
    const byId = all.find((v) => v.id === idOrName);
    if (byId) return byId;
    const byName = all.filter((v) => v.name === idOrName);
    if (byName.length === 1) return byName[0]!;
    throw new KpxError("not_found", byName.length ? `${byName.length} vaults are named "${idOrName}"` : `vault "${idOrName}" not found or not shared with this service account`, 404);
  }

  /** Downloads and opens a vault (cached; `refresh` downloads again). */
  async openVault(idOrName: string, refresh = false): Promise<Kdbx> {
    const v = await this.vault(idOrName);
    const cached = this.opened.get(v.id);
    if (cached && !refresh) return cached.db;
    const got = await this.sync.vault(v.id).get();
    if (got.status !== 200) throw new KpxError("not_found", `vault ${v.id} has no data on the sync server`, 404);
    const { db } = await openWithKeyVersions(got.data, v.keys);
    this.opened.set(v.id, { db, state: cached?.state ?? null });
    return db;
  }

  /** Reads `kpx://<vault>/<entry>/<field>`. */
  async read(ref: string): Promise<string> {
    const r = parseReference(ref);
    return readField(await this.openVault(r.vault), r);
  }

  /** Replaces every kpx:// reference in a template (`kpx inject` / `run --env-file`). */
  async inject(template: string): Promise<{ text: string; secrets: string[] }> {
    const refs = [...new Set(template.match(REFERENCE_PATTERN) ?? [])];
    const values = new Map<string, string>();
    for (const ref of refs) values.set(ref, await this.read(ref));
    return { text: template.replace(REFERENCE_PATTERN, (m) => values.get(m) ?? m), secrets: [...values.values()] };
  }

  /** Writes a field (needs write) with the conditional PUT and merge/retry loop. */
  async write(ref: string, value: string, opts: { create?: boolean } = {}): Promise<void> {
    const r = parseReference(ref);
    const v = await this.vault(r.vault);
    if (v.role === "read") throw new KpxError("forbidden", `this service account can only read vault "${v.name || v.id}"`, 403);
    const db = await this.openVault(v.id);
    writeField(db, r, value, opts);
    const cached = this.opened.get(v.id)!;
    const res = await syncKdbx({ blob: this.sync.vault(v.id), db, credentials: v.keys.map((k) => vaultCredentials(k.key)), state: cached.state });
    this.opened.set(v.id, { db: res.db, state: res.state });
  }

  /** Wipes the keyset, vault keys and secret (best effort). */
  close(): void {
    wipeKeyset(this.keyset);
    this.keyset = null;
    for (const v of this.vaults ?? []) for (const k of v.keys) wipe(k.key);
    this.vaults = null;
    this.opened.clear();
    wipe(this.secret);
    this.access = null;
  }
}

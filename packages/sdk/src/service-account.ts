/**
 * Service accounts (SPEC §9): `ServiceAccount.fromToken(ov_sa_…)` exchanges the secret for a JWT, unwraps
 * master key → keyset, and reads/writes secrets by `ov://<vault>/<entry>/<field>`. A thin layer over the
 * shared Rust core's `ServiceAccount` (`sa.core`). Used by the CLI, `ov connect` and the GitHub Action.
 */
import type { ServiceAccount as CoreServiceAccount, Vault, VaultRole } from "@openvireo/core-wasm";
import { core } from "./core/full.js";
import { guard, guarded } from "./core/guard.js";
import { makeHost, storageStore } from "./core/host.js";
import { OpenVireoError } from "./errors.js";
import { MemoryStorage } from "./auth/storage.js";
import type { OpenVireoConfiguration } from "./auth/types.js";
import type { HttpOptions } from "./http/request.js";
import { serverConfigOf } from "./account.js";
import { fromUtf8, utf8 } from "./util/bytes.js";
import { parseReference } from "./vault/reference.js";

export interface SaVault {
  id: string;
  name: string;
  role: VaultRole;
}

export class ServiceAccount {
  /** The core's service account handle. */
  readonly core: CoreServiceAccount;
  private readonly locks = new Map<string, Promise<unknown>>();

  private constructor(sa: CoreServiceAccount) {
    this.core = sa;
  }

  /** Signs in with an `ov_sa_…` token (discovers the issuer it names, unless `config` is given). */
  static async fromToken(token: string, http: HttpOptions & { config?: OpenVireoConfiguration } = {}): Promise<ServiceAccount> {
    const storage = new MemoryStorage();
    const cfg: { device: { name: string; platform: "cli" }; offline: boolean; server?: ReturnType<typeof serverConfigOf> } = { device: { name: "service account", platform: "cli" }, offline: false };
    if (http.config) cfg.server = serverConfigOf(http.config);
    const client = guarded(() => new (core().OvClient)(cfg as never, makeHost({ ...http, storage }, storageStore(storage))));
    const sa = await guarded(() => core().ServiceAccount.fromToken(client, utf8(token.trim())));
    return new ServiceAccount(guard(sa));
  }

  get saId(): string {
    return this.core.saId();
  }
  get principal(): string {
    return this.core.principal();
  }
  get issuer(): string {
    return this.core.issuer();
  }

  /** The vaults this service account can open (cached; `refresh` asks again). */
  listVaults(refresh = false): Promise<SaVault[]> {
    return this.core.vaults(refresh);
  }

  /** A vault by id or (unique) name. */
  vault(idOrName: string): Promise<SaVault> {
    return this.core.vault(idOrName);
  }

  /** Opens a vault (downloaded once, then cached; `refresh` downloads again). */
  openVault(idOrName: string, refresh = false): Promise<Vault> {
    return this.core.openVault(idOrName, refresh);
  }

  /** Downloads the vault again and returns it. */
  pull(idOrName: string): Promise<Vault> {
    return this.core.pull(idOrName);
  }

  /** Runs `fn` on the open vault, then syncs the change up (needs write). Edits of one vault run one at a time. */
  async edit<T>(idOrName: string, fn: (vault: Vault) => T | Promise<T>): Promise<T> {
    const v = await this.vault(idOrName);
    if (v.role === "read") throw new OpenVireoError("forbidden", `this service account can only read vault "${v.name || v.id}"`, 403);
    const prev = this.locks.get(v.id) ?? Promise.resolve();
    const run = prev.catch(() => undefined).then(async () => {
      const vault = await this.core.openVault(v.id, false);
      const out = await fn(vault);
      await vault.sync({ localChanged: true });
      return out;
    });
    this.locks.set(v.id, run);
    return run;
  }

  /** Reads `ov://<vault>/<entry>/<field>`. */
  async read(ref: string): Promise<string> {
    parseReference(ref);
    return fromUtf8(await this.core.read(ref));
  }

  /** Replaces every ov:// reference in a template (`ov inject` / `run --env-file`). */
  async inject(template: string): Promise<{ text: string; secrets: string[] }> {
    const r = await this.core.inject(utf8(template));
    return { text: fromUtf8(r.text), secrets: r.secrets.map(fromUtf8) };
  }

  /** Writes a field (needs write) with the conditional PUT and merge/retry loop. */
  async write(ref: string, value: string, opts: { create?: boolean } = {}): Promise<void> {
    parseReference(ref);
    await this.core.write(ref, utf8(value), !!opts.create);
  }

  /** Wipes the keyset, vault keys and secret (best effort). */
  close(): void {
    this.core.close();
  }
}

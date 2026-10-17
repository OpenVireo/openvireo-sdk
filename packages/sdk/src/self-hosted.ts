/**
 * Self-hosted sync mode (no account): a device token from a pairing code, then whole-database sync
 * of password-protected .kdbx files against `databases/<id>` with the same ETag/merge/SSE logic.
 */
import type { KeyValueStorage } from "./auth/storage.js";
import type { HttpOptions } from "./http/request.js";
import { SyncClient, type BlobMeta } from "./sync/client.js";
import { type EventStream, type EventStreamOptions, subscribeEvents } from "./sync/events.js";
import { type SyncOptions, type SyncResult, type SyncState, deserializeSyncState, serializeSyncState, syncKdbx } from "./sync/engine.js";

export interface SelfHostedOptions extends HttpOptions {
  /** where the device token and sync state are kept (optional) */
  storage?: KeyValueStorage;
}

export class SelfHostedSync {
  readonly client: SyncClient;

  constructor(
    readonly serverUrl: string,
    readonly deviceToken: string,
    private readonly opts: SelfHostedOptions = {},
  ) {
    this.client = SyncClient.selfHosted(serverUrl, { ...opts, token: deviceToken });
  }

  /** Claims a pairing code ("ABCD-EFGH") for a device token and stores it. */
  static async pair(serverUrl: string, code: string, deviceName: string, opts: SelfHostedOptions = {}): Promise<SelfHostedSync> {
    const claim = await SyncClient.selfHosted(serverUrl, opts).claimPairingCode(code, deviceName);
    await opts.storage?.set(SelfHostedSync.tokenKey(serverUrl), JSON.stringify(claim));
    return new SelfHostedSync(serverUrl, claim.token, opts);
  }

  /** Restores a paired server from storage, or null. */
  static async restore(serverUrl: string, opts: SelfHostedOptions & { storage: KeyValueStorage }): Promise<SelfHostedSync | null> {
    const raw = await opts.storage.get(SelfHostedSync.tokenKey(serverUrl));
    return raw ? new SelfHostedSync(serverUrl, (JSON.parse(raw) as { token: string }).token, opts) : null;
  }

  private static tokenKey = (url: string) => `selfhosted:${url.trim().replace(/\/+$/, "")}`;

  health(): Promise<unknown> {
    return this.client.health();
  }
  listDatabases(): Promise<BlobMeta[]> {
    return this.client.listDatabases();
  }
  createPairingCode() {
    return this.client.createPairingCode();
  }

  /** Syncs a local database with `databases/<databaseId>`; keeps the sync state in storage when given. */
  async syncDatabase(databaseId: string, p: Omit<SyncOptions, "blob">): Promise<SyncResult> {
    const key = `sync:${this.serverUrl}:${databaseId}`;
    let state: SyncState | null | undefined = p.state;
    if (state === undefined && this.opts.storage) {
      const raw = await this.opts.storage.get(key);
      state = raw ? deserializeSyncState(raw) : null;
    }
    const r = await syncKdbx({ ...p, state, blob: this.client.database(databaseId) });
    await this.opts.storage?.set(key, serializeSyncState(r.state));
    return r;
  }

  /** Legacy `event: database` stream. */
  events(opts: EventStreamOptions): EventStream {
    return subscribeEvents(this.client, opts);
  }
}

/**
 * Self-hosted sync mode (no account): a device token from a pairing code, then whole-database sync of
 * password-protected .kdbx files against `databases/<id>` with the same ETag/merge logic. A thin layer
 * over the shared Rust core's `SelfHosted` (`sh.core`).
 */
import type { AccountEvent, BlobMeta, KdbxCredentials, SelfHosted as CoreSelfHosted, SyncReport, Vault, VaultVersion } from "@openvireo/core-wasm";
import { core } from "./core/full.js";
import { guard, guarded } from "./core/guard.js";
import { makeHost, storageStore } from "./core/host.js";
import { MemoryStorage, type KeyValueStorage } from "./auth/storage.js";
import type { HttpOptions } from "./http/request.js";
import { utf8 } from "./util/bytes.js";

export type { BlobMeta, VaultVersion } from "@openvireo/core-wasm";

export interface SelfHostedOptions extends HttpOptions {
  /** where the device token and sync state are kept (default: memory) */
  storage?: KeyValueStorage;
}

function clientFor(opts: SelfHostedOptions) {
  const storage = opts.storage ?? new MemoryStorage();
  return guarded(() => new (core().OvClient)({ device: { name: "OpenVireo SDK", platform: "web" }, offline: true } as never, makeHost({ ...opts, storage, offline: true }, storageStore(storage))));
}

export class SelfHostedSync {
  private constructor(readonly core: CoreSelfHosted) {}

  /** Connects with a device token you already have. */
  static connect(serverUrl: string, deviceToken: string, opts: SelfHostedOptions = {}): SelfHostedSync {
    return new SelfHostedSync(guard(guarded(() => core().SelfHosted.connect(clientFor(opts), serverUrl, utf8(deviceToken)))));
  }

  /** Claims a pairing code ("ABCD-EFGH") for a device token and keeps it in storage. */
  static async pair(serverUrl: string, code: string, deviceName: string, opts: SelfHostedOptions = {}): Promise<SelfHostedSync> {
    return new SelfHostedSync(guard(await guarded(() => core().SelfHosted.pair(clientFor(opts), serverUrl, code, deviceName))));
  }

  /** Restores a paired server from storage, or null. */
  static async restore(serverUrl: string, opts: SelfHostedOptions & { storage: KeyValueStorage }): Promise<SelfHostedSync | null> {
    const sh = await guarded(() => core().SelfHosted.restore(clientFor(opts), serverUrl));
    return sh ? new SelfHostedSync(guard(sh)) : null;
  }

  get serverUrl(): string {
    return this.core.serverUrl();
  }
  health(): Promise<string> {
    return this.core.health();
  }
  listDatabases(): Promise<BlobMeta[]> {
    return this.core.listDatabases();
  }
  createPairingCode() {
    return this.core.createPairingCode();
  }

  /** Syncs a local database (its bytes and credentials) with `databases/<databaseId>`; returns the merged bytes. */
  syncDatabase(databaseId: string, kdbx: Uint8Array, credentials: KdbxCredentials): Promise<{ kdbx: Uint8Array; report: SyncReport }> {
    return this.core.syncDatabase(databaseId, kdbx, credentials);
  }

  /** Earlier versions of a database on the server. */
  history(databaseId: string): Promise<VaultVersion[]> {
    return this.core.history(databaseId);
  }

  /** Opens an earlier version of a database. */
  openVersion(databaseId: string, revision: number, credentials: KdbxCredentials): Promise<Vault> {
    return this.core.openVersion(databaseId, revision, credentials);
  }

  /** `event: database` changes until `close()`. */
  events(onEvent: (e: AccountEvent) => void, onError?: (e: unknown) => void): { close(): void } {
    let closed = false;
    let stream: { close(): void; next(): Promise<AccountEvent | undefined> } | null = null;
    void (async () => {
      try {
        stream = await this.core.events();
        if (closed) return stream.close();
        for (;;) {
          const ev = await stream.next();
          if (!ev || closed) break;
          onEvent(ev);
        }
      } catch (e) {
        if (!closed) onError?.(e);
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

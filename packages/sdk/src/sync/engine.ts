/**
 * The sync loop of keepassxc SyncEngine for one database and one blob, without the Qt parts:
 * HEAD/GET with the ETag → open → three-way merge with the base copy → conditional PUT → on 412
 * download, merge and retry. The base copy is the server's bytes from the last successful sync.
 */
import { KpxError } from "../errors.js";
import { b64u, fromB64u } from "../util/bytes.js";
import { type CredentialsFactory, type Kdbx, openKdbx, saveKdbx, syncGeneration } from "../vault/kdbx.js";
import {
  type MergeChange,
  type MergeOptions,
  type Snapshot,
  type SyncConflict,
  conflictingFields,
  findConflicts,
  findEntryByUuid,
  mergeDatabases,
  needsCommonBase,
  snapshotOf,
} from "../merge/index.js";
import type { BlobHandle } from "./client.js";

/** What a client keeps per synced database (the web app stores it in IndexedDB next to the file). */
export interface SyncState {
  etag: string;
  revision: number;
  generation: number;
  /** entry id → modification time (ms) at the last sync */
  snapshot: Snapshot;
  /** the server's bytes at the last sync (encrypted .kdbx): the common base for the next merge */
  base?: Uint8Array;
  lastSync: string;
}

export const serializeSyncState = (s: SyncState): string => JSON.stringify({ ...s, base: s.base ? b64u(s.base) : undefined });
export const deserializeSyncState = (json: string): SyncState => {
  const o = JSON.parse(json) as Omit<SyncState, "base"> & { base?: string };
  return { ...o, base: o.base ? fromB64u(o.base) : undefined };
};

export type SyncOutcome = "unchanged" | "pulled" | "uploaded" | "created";

export interface SyncResult {
  outcome: SyncOutcome;
  /**
   * The merged database with the server's header and key: use it as the working copy from now on.
   * (The `db` passed in was merged too, but keeps its own key.)
   */
  db: Kdbx;
  /** index into `credentials` that opened the server copy (-1 when nothing was downloaded) */
  credentialsIndex: number;
  /** the server's bytes now */
  data?: Uint8Array;
  state: SyncState;
  conflicts: SyncConflict[];
  changes: MergeChange[];
  attempts: number;
}

export interface SyncOptions {
  blob: BlobHandle;
  /** the local working copy; merged in place */
  db: Kdbx;
  /** opens the server copy and the base, tried in order (newest key first) */
  credentials: CredentialsFactory | CredentialsFactory[];
  state?: SyncState | null;
  /** whether the local copy changed since the last sync (default true). False → a cheap HEAD check first. */
  localChanged?: boolean;
  /** start over from what the server has (after the user confirmed a rollback/loss) */
  acceptServerState?: boolean;
  /** attempts on 412 (default 5, like Qt's MaxAttempts) */
  maxAttempts?: number;
  /** runs on the copy about to be uploaded (rotation re-keys here); forces an upload */
  beforeUpload?: (db: Kdbx) => void | Promise<void>;
  merge?: MergeOptions;
  signal?: AbortSignal;
  onProgress?: (step: "checking" | "downloading" | "merging" | "uploading") => void;
}

async function openWith(data: Uint8Array, creds: CredentialsFactory[]): Promise<{ db: Kdbx; index: number }> {
  let last: unknown;
  for (let i = 0; i < creds.length; i++) {
    try {
      return { db: await openKdbx(data, creds[i]!), index: i };
    } catch (e) {
      if ((e as KpxError).code !== "vault_key_mismatch") throw e;
      last = e;
    }
  }
  // Qt asks the user to unlock the server copy here; SDK callers get an error they can act on
  throw last ?? new KpxError("vault_key_mismatch", "no credentials to open the server copy");
}

export async function syncKdbx(opts: SyncOptions): Promise<SyncResult> {
  const creds = Array.isArray(opts.credentials) ? opts.credentials : [opts.credentials];
  const prev = opts.acceptServerState ? null : (opts.state ?? null);
  const maxAttempts = opts.maxAttempts ?? 5;
  const local = opts.db;
  let changes: MergeChange[] = [];
  let conflicts: SyncConflict[] = [];

  const finish = (outcome: SyncOutcome, db: Kdbx, etag: string, revision: number, data: Uint8Array | undefined, index: number, attempts: number, remoteGeneration = 0): SyncResult => {
    const state: SyncState = {
      etag,
      revision: Math.max(prev?.revision ?? 0, revision),
      generation: Math.max(prev?.generation ?? 0, remoteGeneration, syncGeneration(db), syncGeneration(local)),
      snapshot: snapshotOf(local),
      base: data ?? prev?.base,
      lastSync: new Date().toISOString(),
    };
    return { outcome, db, credentialsIndex: index, data, state, conflicts, changes, attempts };
  };

  const checkRevision = (revision: number) => {
    if (!opts.acceptServerState && prev && revision >= 0 && revision < prev.revision) {
      throw new KpxError("server_rolled_back", `the sync server returned revision ${revision}, older than revision ${prev.revision} this device already synced`);
    }
  };

  // Nothing changed here since the last sync: only download when the server has a new version
  if (prev && opts.localChanged === false && !opts.beforeUpload) {
    opts.onProgress?.("checking");
    const head = await opts.blob.head(prev.etag);
    if (head.status === 304) {
      checkRevision(head.revision);
      return finish("unchanged", local, prev.etag, head.revision, prev.base, -1, 0);
    }
  }

  for (let attempt = 1; ; attempt++) {
    opts.signal?.throwIfAborted();
    opts.onProgress?.("downloading");
    const got = await opts.blob.get({ signal: opts.signal });

    if (got.status === 404) {
      if (!opts.acceptServerState && prev && prev.revision > 0) {
        throw new KpxError("server_lost_database", "the sync server no longer has this database, although this device synced it before");
      }
      // Nothing on the server yet: publish the local database as the first version
      await opts.beforeUpload?.(local);
      const data = await saveKdbx(local);
      opts.onProgress?.("uploading");
      try {
        const put = await opts.blob.put(data, { create: true }, opts.signal);
        return finish("created", local, put.etag, put.revision, data, -1, attempt);
      } catch (e) {
        if ((e as KpxError).code === "precondition_failed" && attempt < maxAttempts) continue;
        throw e;
      }
    }
    if (got.status !== 200) throw new KpxError("server_error", `unexpected status ${got.status}`);
    checkRevision(got.revision);

    opts.onProgress?.("merging");
    const { db: remote, index } = await openWith(got.data, creds);
    const remoteGeneration = syncGeneration(remote);
    if (!opts.acceptServerState && prev && remoteGeneration < prev.generation) {
      throw new KpxError("server_rolled_back", `the server copy has sync generation ${remoteGeneration}, older than ${prev.generation} already synced here`);
    }

    // The copy both sides last synced from tells which fields each side changed; only open it when needed
    const snapshot = prev?.snapshot ?? {};
    conflicts = findConflicts(local, remote, snapshot);
    let base: Kdbx | null = null;
    if (prev?.base && (conflicts.some((c) => c.kind === "edited-on-both") || needsCommonBase(local, remote, snapshot))) {
      try {
        base = (await openWith(prev.base, creds)).db;
      } catch {
        base = null; // a base under another key is no use; merge without it
      }
    }
    if (base) {
      conflicts = conflicts.filter((c) => {
        if (c.kind !== "edited-on-both") return true;
        const b = findEntryByUuid(base!, c.uuid);
        if (!b) return true;
        c.fields = conflictingFields(findEntryByUuid(local, c.uuid), findEntryByUuid(remote, c.uuid), b);
        return c.fields.length > 0; // different fields changed: both changes are kept
      });
    }

    const merged = await mergeDatabases(local, remote, base, opts.merge);
    changes = merged.changes;

    if (!merged.remoteChanged && !opts.beforeUpload) {
      // The merge didn't change the server copy: nothing to upload
      return finish(opts.localChanged === false && !merged.localChanged ? "unchanged" : "pulled", remote, got.etag, got.revision, got.data, index, attempt, remoteGeneration);
    }

    await opts.beforeUpload?.(remote);
    const data = await saveKdbx(remote);
    opts.onProgress?.("uploading");
    try {
      const put = await opts.blob.put(data, { ifMatch: got.etag }, opts.signal);
      return finish("uploaded", remote, put.etag, put.revision, data, index, attempt, remoteGeneration);
    } catch (e) {
      // Another device uploaded since our download: merge its version too and try again
      if ((e as KpxError).code === "precondition_failed") {
        if (attempt < maxAttempts) continue;
        throw new KpxError("too_many_conflicts", "the database on the sync server kept changing during the sync; local changes are kept, sync again", 412, { cause: e });
      }
      throw e;
    }
  }
}

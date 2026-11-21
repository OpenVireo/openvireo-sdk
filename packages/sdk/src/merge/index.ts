/**
 * The sync merge (docs/merge-behaviour.md) and `.kdbx` import, on the shared Rust core (ov-merge). Merges
 * work on `Kdbx` handles (or whole files with `kdbxMerge`); imports work on `Vault`s.
 *
 * @module @openvireo/sdk/merge
 */
import type { ImportSummary, ImportTarget, Kdbx, KdbxKey, KdbxMergeChange, KdbxMergeReport, KdbxSnapshot, KdbxSyncConflict, MergeIntoOptions, MergeMode, Vault } from "@openvireo/core-wasm";
import { call } from "../core/full.js";

export type {
  ChangeType,
  ConflictKind,
  ImportPreview,
  ImportSummary,
  ImportTarget,
  KdbxEntryConflict,
  KdbxImportSummary,
  KdbxMergeChange,
  KdbxMergeReport,
  KdbxSnapshot,
  KdbxSyncConflict,
  MergeChange,
  MergeIntoOptions,
  MergeMode,
} from "@openvireo/core-wasm";

/** KeePass's standard fields. */
export const DEFAULT_ATTRIBUTES = ["Title", "UserName", "Password", "URL", "Notes"];

/** Entry id → last modification (ms): what the user last saw, for `findConflicts` and `needsCommonBase`. */
export type Snapshot = KdbxSnapshot;

/**
 * SyncEngine::mergeDatabases(): merges `remote` into `local` and `local` into `remote`, using `base` (the
 * copy both sides last synced from) to combine entries edited on both sides field by field. Afterwards
 * both have the same content. `report.conflicts` lists the fields both sides changed differently.
 */
export function mergeDatabases(local: Kdbx, remote: Kdbx, base?: Kdbx | null, opts: { now?: () => Date } = {}): KdbxMergeReport {
  const now = opts.now ? Math.floor(opts.now().getTime() / 1000) : undefined;
  return base ? local.mergeWithBase(remote, base, now) : local.merge(remote, now);
}

/** The whole sync merge on file bytes: both files come back merged, with the report. */
export function kdbxMerge(local: Uint8Array, remote: Uint8Array, base: Uint8Array | null | undefined, key: KdbxKey): { local: Uint8Array; remote: Uint8Array; report: KdbxMergeReport } {
  return call((c) => c.kdbxMerge(local, remote, base, key));
}

/** KeePassXC's Database > Merge: brings `source` into `target` (`keep-newer` or `synchronize`). */
export function mergeInto(source: Kdbx, target: Kdbx, mode: MergeMode = "keep-newer", opts: MergeIntoOptions = {}): KdbxMergeChange[] {
  return target.mergeFrom(source, mode, opts);
}

export const snapshotOf = (db: Kdbx): Snapshot => db.snapshot();
/** Whether merging needs the common base (an entry both sides changed since `snapshot`). */
export const needsCommonBase = (local: Kdbx, remote: Kdbx, snapshot: Snapshot): boolean => local.needsCommonBase(remote, snapshot);
/** Entries both sides changed since `snapshot`, for a "keep which?" prompt. */
export const findConflicts = (local: Kdbx, remote: Kdbx, snapshot: Snapshot): KdbxSyncConflict[] => local.findConflicts(remote, snapshot);
/** Whether `local` deleted something `remote` still has. */
export const hasPendingDeletions = (local: Kdbx, remote: Kdbx): boolean => local.hasPendingDeletions(remote);

/**
 * Merges `source` into `target` by UUID, keeping the newer version of each entry (the older one goes into
 * its history) and deleting nothing. The source's Recycle Bin and database custom data stay behind.
 */
export function importInto(source: Vault, target: Vault): ImportSummary {
  return target.importFrom(source, { kind: "merge" });
}

/** Copies the source's entries and groups with fresh UUIDs under `parentUuid` in `target`. */
export function importAsCopies(source: Vault, target: Vault, parentUuid?: string): ImportSummary {
  return target.importFrom(source, parentUuid ? { kind: "copies", parentGroupId: parentUuid } : { kind: "copies" });
}

/** Groups an import can go under: id and path, the Recycle Bin left out. */
export function importTargets(vault: Vault): ImportTarget[] {
  return vault.importTargets();
}

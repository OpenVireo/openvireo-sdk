/**
 * The sync merge of OpenVireo's SyncEngine (gui/remote/SyncEngine.cpp): the three-way field merge of
 * entries edited on both sides against the common base copy (combineEntries), then the structure
 * merge in both directions (tree.ts), then the sync generation bump; plus the conflict checks against
 * the last-sync snapshot. Operates on kdbxweb objects.
 */
import { kdbxweb, type Kdbx, setSyncGeneration, syncGeneration } from "../vault/kdbx.js";
import { applyField, binaryBytes, entrySeconds, fieldsOf, resolveFields, sameFields, sameValue, seconds } from "./fields.js";
import {
  type MergeChange,
  type MergeMode,
  copyEntry,
  customDataKey,
  entriesUnder,
  entryTitle,
  findEntryByUuid,
  mergeInto,
  overwriteEntryData,
  record,
  trimHistory,
} from "./tree.js";

type KdbxEntry = kdbxweb.KdbxEntry;

export type { ChangeType, MergeChange, MergeIntoOptions, MergeMode } from "./tree.js";
export { findEntryByUuid, mergeInto } from "./tree.js";

export interface MergeOptions {
  /** "keep-newer" (the sync default: deletions are not applied) or "synchronize" */
  mode?: MergeMode;
  now?: () => Date;
}

/**
 * combineEntries(): gives both entries the combined fields and the same modification time, so the
 * structure merge sees one version. Each keeps its previous state in its history.
 */
export async function combineEntries(
  local: KdbxEntry,
  localDb: Kdbx,
  remote: KdbxEntry,
  remoteDb: Kdbx,
  base: KdbxEntry,
  now: () => Date = () => new Date(),
): Promise<string[]> {
  const localIsNewer = entrySeconds(local) >= entrySeconds(remote);
  const { merged, conflicts } = resolveFields(local, remote, base, localIsNewer, { local: localDb, remote: remoteDb });
  const [newer, newerDb] = localIsNewer ? [local, localDb] : [remote, remoteDb];
  const [older, olderDb] = localIsNewer ? [remote, remoteDb] : [local, localDb];
  const when = new Date(Math.max(seconds(now()), entrySeconds(local), entrySeconds(remote)) * 1000);

  for (const [entry, db] of [
    [older, olderDb],
    [newer, newerDb],
  ] as const) {
    // beginUpdate(): remember the state before; endUpdate() adds it to the history when anything emitted
    // a modification in between (Entry::m_modifiedSinceBegin), even if the end state equals the start
    const before = copyEntry(entry, db, db, "plain");
    let modified = false;
    if (entry === older) {
      // copyDataFrom() emits for attributes, attachments, custom data and auto-type (m_data is assigned silently)
      modified = emittingDataDiffers(entry, newer);
      // Everything not merged field by field comes from the newer entry
      const history = entry.history;
      const parent = entry.parentGroup;
      overwriteEntryData(entry, newer, newerDb, db);
      entry.history = history;
      entry.parentGroup = parent;
    }
    const current = fieldsOf(entry, db);
    for (const key of new Set([...current.keys(), ...merged.keys()])) {
      if (!sameValue(current.get(key), merged.get(key))) {
        await applyField(entry, db, key, merged.get(key));
        modified = true;
      }
    }
    entry.times.lastModTime = when;
    if (modified) {
      entry.history.push(before);
      trimHistory(entry, db);
    }
  }
  return conflicts;
}

/** Whether Entry::copyDataFrom(b) on `a` would emit a modification (attributes, attachments, custom data, auto-type). */
function emittingDataDiffers(a: KdbxEntry, b: KdbxEntry): boolean {
  const pick = (e: KdbxEntry) => {
    const f = fieldsOf(e);
    const parts: string[] = [];
    for (const [k, v] of [...f].sort(([x], [y]) => (x < y ? -1 : 1))) {
      if (!k.startsWith("attribute/") && !k.startsWith("attachment/")) continue;
      const prot = k.startsWith("attribute/") && e.fields.get(k.slice(10)) instanceof kdbxweb.ProtectedValue;
      parts.push(`${k}=${v.cmp}${prot ? "/p" : ""}`);
    }
    return parts.join("\n") + "|" + customDataKey(e.customData) + "|" + JSON.stringify(e.autoType);
  };
  return pick(a) !== pick(b);
}

export interface MergeResult {
  changes: MergeChange[];
  /** fields both sides changed differently, per entry uuid (base64 id) */
  conflicts: Map<string, string[]>;
  /** whether the remote database changed (and needs uploading) */
  remoteChanged: boolean;
  localChanged: boolean;
}

/**
 * SyncEngine::mergeDatabases(): merges `remote` into `local` and `local` into `remote`, using `base`
 * (the copy both sides last synced from) to combine entries edited on both sides field by field.
 * Afterwards both databases have the same content.
 */
export async function mergeDatabases(local: Kdbx, remote: Kdbx, base?: Kdbx | null, opts: MergeOptions = {}): Promise<MergeResult> {
  const changes: MergeChange[] = [];
  const conflicts = new Map<string, string[]>();
  let combined = 0;
  if (base) {
    for (const localEntry of [...entriesUnder(local.getDefaultGroup())]) {
      const remoteEntry = findEntryByUuid(remote, localEntry.uuid.id);
      const baseEntry = findEntryByUuid(base, localEntry.uuid.id);
      if (!remoteEntry || !baseEntry) continue;
      if (sameFields(localEntry, remoteEntry)) continue;
      // Compared by content with the base, so neither clocks nor same-second edits can mislead
      const localChanged = !sameFields(localEntry, baseEntry);
      const remoteChanged = !sameFields(remoteEntry, baseEntry);
      const lt = entrySeconds(localEntry);
      const rt = entrySeconds(remoteEntry);
      // The structure merge keeps the newer entry: right when only one side changed and it is strictly newer
      const needed = (localChanged && remoteChanged) || (localChanged && lt <= rt) || (remoteChanged && rt <= lt);
      if (needed) {
        const c = await combineEntries(localEntry, local, remoteEntry, remote, baseEntry, opts.now);
        if (c.length) conflicts.set(localEntry.uuid.id, c);
        combined++;
        changes.push(record("modified", localEntry, "Combined the changes made on both devices"));
      }
    }
  }
  const mode = opts.mode ?? "keep-newer";
  const toRemote = mergeInto(local, remote, mode);
  const toLocal = mergeInto(remote, local, mode);
  changes.push(...toRemote, ...toLocal);
  if (changes.length) {
    const generation = Math.max(syncGeneration(local), syncGeneration(remote)) + 1;
    setSyncGeneration(local, generation);
    setSyncGeneration(remote, generation);
  }
  return { changes, conflicts, remoteChanged: combined > 0 || toRemote.length > 0, localChanged: combined > 0 || toLocal.length > 0 };
}

// --------------------------------------------------------------------- conflict detection (SyncEngine)

/** Entry uuid (base64 id) → last modification time in ms, taken after each sync. */
export type Snapshot = Record<string, number>;

export function snapshotOf(db: Kdbx): Snapshot {
  const s: Snapshot = {};
  for (const e of entriesUnder(db.getDefaultGroup())) s[e.uuid.id] = e.times.lastModTime?.getTime() ?? 0;
  return s;
}

function changesSince(local: KdbxEntry, remote: KdbxEntry, snapshotMs: number) {
  const lt = local.times.lastModTime?.getTime() ?? 0;
  // Read back from the file since the snapshot: the milliseconds are gone but it is the same version
  const reloaded = lt % 1000 === 0 && Math.floor(lt / 1000) === Math.floor(snapshotMs / 1000);
  const localChanged = lt !== snapshotMs && !reloaded;
  const remoteChanged = entrySeconds(remote) !== Math.floor(snapshotMs / 1000) || (!localChanged && !sameFields(local, remote));
  return { local: localChanged, remote: remoteChanged };
}

/** Whether merging needs the common base (SyncEngine needsCommonBase). */
export function needsCommonBase(local: Kdbx, remote: Kdbx, snapshot: Snapshot): boolean {
  for (const [id, ms] of Object.entries(snapshot)) {
    const l = findEntryByUuid(local, id);
    const r = findEntryByUuid(remote, id);
    if (!l || !r || sameFields(l, r)) continue;
    const c = changesSince(l, r, ms);
    if ((c.local && c.remote) || (c.local && entrySeconds(l) <= entrySeconds(r)) || (c.remote && entrySeconds(r) <= entrySeconds(l))) return true;
  }
  return false;
}

export type ConflictKind = "edited-on-both" | "deleted-here-edited-there" | "edited-here-deleted-there";
export interface SyncConflict {
  uuid: string;
  kind: ConflictKind;
  title: string;
  /** for edited-on-both with a base: the fields both changed differently (empty → not reported) */
  fields: string[];
}

const deletedIn = (db: Kdbx, id: string) => db.deletedObjects.some((o) => o.uuid?.id === id);

/** SyncEngine::findConflicts */
export function findConflicts(local: Kdbx, remote: Kdbx, snapshot: Snapshot): SyncConflict[] {
  const out: SyncConflict[] = [];
  const changedSince = (e: KdbxEntry, ms: number) => entrySeconds(e) !== Math.floor(ms / 1000);
  for (const [id, ms] of Object.entries(snapshot)) {
    const l = findEntryByUuid(local, id);
    const r = findEntryByUuid(remote, id);
    if (l && r) {
      const c = changesSince(l, r, ms);
      if (!c.local || !c.remote || sameFields(l, r)) continue;
      out.push({ uuid: id, kind: "edited-on-both", title: entryTitle(l), fields: [] });
    } else if (r && deletedIn(local, id) && changedSince(r, ms)) {
      out.push({ uuid: id, kind: "deleted-here-edited-there", title: entryTitle(r), fields: [] });
    } else if (l && deletedIn(remote, id) && changedSince(l, ms)) {
      out.push({ uuid: id, kind: "edited-here-deleted-there", title: entryTitle(l), fields: [] });
    }
  }
  return out;
}

export { binaryBytes };

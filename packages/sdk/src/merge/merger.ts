/**
 * The sync merge of OpenVireo's SyncEngine (gui/remote/SyncEngine.cpp): the three-way field merge of
 * entries edited on both sides against the common base copy (combineEntries), then the structure
 * merge in both directions (tree.ts), then the sync generation bump; plus the conflict checks against
 * the last-sync snapshot. Operates on kdbxweb objects.
 */
import { toHex } from "../util/bytes.js";
import { kdbxweb, type Kdbx, setSyncGeneration, syncGeneration } from "../vault/kdbx.js";
import { applyField, binaryBytes, entrySeconds, fieldsOf, resolveFields, sameFields, sameValue, seconds } from "./fields.js";
import {
  type MergeChange,
  type MergeMode,
  copyEntry,
  customDataKey,
  detach,
  entriesUnder,
  entryTitle,
  findEntryByUuid,
  findGroup,
  groupsUnder,
  mergeInto,
  overwriteEntryData,
  record,
  trimHistory,
} from "./tree.js";

type KdbxEntry = kdbxweb.KdbxEntry;
type KdbxGroup = kdbxweb.KdbxGroup;
type Deleted = kdbxweb.KdbxDeletedObject;

export type { ChangeType, MergeChange, MergeIntoOptions, MergeMode } from "./tree.js";
export { findEntryByUuid, mergeInto } from "./tree.js";

export interface MergeOptions {
  /**
   * "keep-newer" (the sync default) or "synchronize". Either way, with a base the sync applies each
   * side's deletions to the other where the other side hasn't changed the item since the base.
   */
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
  // Found before the structure merge brings the deleted items back from the other side
  const pending = base ? new Map([...pendingDeletions(local, remote), ...pendingDeletions(remote, local)]) : new Map<string, Deleted>();
  const mode = opts.mode ?? "keep-newer";
  const toRemote = mergeInto(local, remote, mode);
  const toLocal = mergeInto(remote, local, mode);
  changes.push(...toRemote, ...toLocal);
  const after = [...(base && pending.size ? applyDeletions(local, remote, base, pending) : []), ...mergeRecycleBins(local, remote)];
  changes.push(...after);
  if (changes.length) {
    const generation = Math.max(syncGeneration(local), syncGeneration(remote)) + 1;
    setSyncGeneration(local, generation);
    setSyncGeneration(remote, generation);
  }
  return {
    changes,
    conflicts,
    remoteChanged: combined > 0 || after.length > 0 || toRemote.length > 0,
    localChanged: combined > 0 || after.length > 0 || toLocal.length > 0,
  };
}

// ------------------------------------------------------------------- deletions (SyncEngine)

/** Uuids (base64 ids) of the entries and of the groups below the root. */
function idsOf(db: Kdbx): Set<string> {
  const ids = new Set<string>();
  for (const e of entriesUnder(db.getDefaultGroup())) ids.add(e.uuid.id);
  for (const g of groupsUnder(db.getDefaultGroup())) ids.add(g.uuid.id);
  return ids;
}

/**
 * The deletions `from` made that `into` hasn't applied: recorded in `from`, gone there, still in `into`.
 * The root group is never deleted.
 */
function pendingDeletions(from: Kdbx, into: Kdbx): Map<string, Deleted> {
  const mine = idsOf(from);
  mine.add(from.getDefaultGroup().uuid.id);
  const theirs = idsOf(into);
  const pending = new Map<string, Deleted>();
  for (const rec of from.deletedObjects) {
    const id = rec.uuid?.id;
    if (id && !mine.has(id) && theirs.has(id) && !pending.has(id)) pending.set(id, rec);
  }
  return pending;
}

/** Whether a sync has deletions to apply, which needs the common base. */
export function hasPendingDeletions(local: Kdbx, remote: Kdbx): boolean {
  return pendingDeletions(local, remote).size > 0 || pendingDeletions(remote, local).size > 0;
}

const parentId = (item: KdbxEntry | KdbxGroup) => item.parentGroup?.uuid.id;
const sameGroup = (a: KdbxGroup, b: KdbxGroup) =>
  a.name === b.name &&
  (a.notes ?? "") === (b.notes ?? "") &&
  a.icon === b.icon &&
  a.customIcon?.id === b.customIcon?.id &&
  parentId(a) === parentId(b);
const depthOf = (g: KdbxGroup) => {
  let d = 0;
  for (let p = g.parentGroup; p; p = p.parentGroup) d++;
  return d;
};

/** Replaces `db`'s deletion records for `id` with `rec`, or drops them. */
function setDeletion(db: Kdbx, id: string, rec: Deleted | null): void {
  db.deletedObjects = db.deletedObjects.filter((r) => r.uuid?.id !== id);
  if (rec) db.deletedObjects.push(rec);
}

/**
 * Applies the deletions either side made since the last sync (`pending`, found before the structure
 * merge brought the items back) to both. Whether to delete is decided by the base, not by deletion and
 * modification times, so a device with a wrong clock can't delete what another device changed: an item
 * goes only when both copies still match the base (same fields, or for a group the same name, notes and
 * icon; in the same parent group) and, for a group, nothing is left in it. A deletion held back is
 * dropped, so the item stays on both.
 */
function applyDeletions(local: Kdbx, remote: Kdbx, base: Kdbx, pending: Map<string, Deleted>): MergeChange[] {
  const changes: MergeChange[] = [];
  const both = [local, remote];
  for (const [id, rec] of pending) {
    const b = findEntryByUuid(base, id);
    const copies = both.map((db) => findEntryByUuid(db, id)).filter((e): e is KdbxEntry => !!e);
    if (!copies.length) continue;
    const unchanged = !!b && copies.every((e) => parentId(e) === parentId(b) && sameFields(e, b));
    if (unchanged) {
      changes.push(record("deleted", copies[0]!, "Deleted on another device"));
      for (const e of copies) detach(e, (g) => g.entries);
    }
    for (const db of both) setDeletion(db, id, unchanged ? rec : null);
  }

  // Deepest first, so a group's deleted subgroups are gone before it is looked at
  const groups = [...pending.keys()]
    .map((id) => findGroup(local, id))
    .filter((g): g is KdbxGroup => !!g && g !== local.getDefaultGroup())
    .sort((a, b) => depthOf(b) - depthOf(a));
  for (const localGroup of groups) {
    const id = localGroup.uuid.id;
    const b = findGroup(base, id);
    const copies = both.map((db) => findGroup(db, id)).filter((g): g is KdbxGroup => !!g);
    const unchanged =
      !!b && b !== base.getDefaultGroup() && copies.every((g) => !g.entries.length && !g.groups.length && sameGroup(g, b));
    if (unchanged) {
      changes.push(record("deleted", localGroup, "Deleted on another device"));
      for (const g of copies) detach(g, (p) => p.groups);
    }
    for (const db of both) setDeletion(db, id, unchanged ? pending.get(id)! : null);
  }
  return changes;
}

/**
 * The structure merge doesn't carry the Recycle Bin (KeePassXC's "missing handling of recycle bin"), so
 * a bin made on one device was a plain group on the others, and deleting from it there moved things into
 * a bin of their own. As in KeePass, the bin changed last wins on both sides; another bin is emptied into
 * it and deleted.
 */
function mergeRecycleBins(local: Kdbx, remote: Kdbx): MergeChange[] {
  const binOf = (db: Kdbx) => (db.meta.recycleBinUuid ? findGroup(db, db.meta.recycleBinUuid.id) : undefined);
  const localBin = binOf(local);
  const remoteBin = binOf(remote);
  if (!localBin && !remoteBin) return [];
  if (localBin && remoteBin && localBin.uuid.id === remoteBin.uuid.id) return [];
  let winner: Kdbx;
  if (!remoteBin) winner = local;
  else if (!localBin) winner = remote;
  else {
    // Whole seconds, as the files keep them; the UUIDs' bytes break a tie
    const lt = Math.floor((local.meta.recycleBinChanged?.getTime() ?? 0) / 1000);
    const rt = Math.floor((remote.meta.recycleBinChanged?.getTime() ?? 0) / 1000);
    const hex = (g: KdbxGroup) => toHex(new Uint8Array(g.uuid.toBytes()));
    winner = lt !== rt ? (lt > rt ? local : remote) : hex(localBin) < hex(remoteBin) ? local : remote;
  }
  const binId = (winner === local ? localBin : remoteBin)!.uuid.id;
  const binChanged = winner.meta.recycleBinChanged;
  const others = [localBin, remoteBin].filter((g): g is KdbxGroup => !!g && g.uuid.id !== binId).map((g) => g.uuid.id);

  for (const db of [local, remote]) {
    const bin = findGroup(db, binId);
    if (!bin) continue;
    for (const id of others) {
      const other = findGroup(db, id);
      if (!other || other === bin) continue;
      // A bin inside the other one stays where it is
      let inside = false;
      for (let p = bin.parentGroup; p; p = p.parentGroup) if (p === other) inside = true;
      if (inside) continue;
      for (const item of [...other.entries, ...other.groups]) db.move(item, bin);
      // Recorded, so the devices that sync next delete it too
      db.move(other, null);
    }
    if (db.meta.recycleBinUuid?.id !== binId) {
      db.meta.recycleBinUuid = bin.uuid;
      db.meta.recycleBinChanged = binChanged;
    }
  }
  return [record("metadata", null, "Recycle Bin set from another device")];
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

/** Whether merging needs the common base (SyncEngine needsCommonBase): to combine entries, or to apply deletions. */
export function needsCommonBase(local: Kdbx, remote: Kdbx, snapshot: Snapshot): boolean {
  if (hasPendingDeletions(local, remote)) return true;
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

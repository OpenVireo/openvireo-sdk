/**
 * Port of KeePassXC's merge as used by sync:
 * - SyncEngine::mergeDatabases (gui/remote/SyncEngine.cpp): the three-way field merge against the
 *   common base copy (combineEntries), then two Merger passes (local → remote, remote → local), then
 *   the sync generation bump.
 * - Merger (core/Merger.cpp): entries/groups by modification time with history merging, locations,
 *   deletions (Synchronize mode only) and metadata (custom icons, custom data).
 * Operates on kdbxweb objects. Differences from the C++ are marked "NOTE".
 */
import { kdbxweb, type Kdbx, setSyncGeneration, syncGeneration } from "../vault/kdbx.js";
import { applyField, binaryBytes, entrySeconds, fieldsOf, resolveFields, sameFields, sameValue, seconds } from "./fields.js";

type KdbxEntry = kdbxweb.KdbxEntry;
type KdbxGroup = kdbxweb.KdbxGroup;

export type ChangeType = "added" | "modified" | "moved" | "deleted" | "metadata";
export interface MergeChange {
  type: ChangeType;
  uuid?: string;
  title?: string;
  group?: string;
  details: string;
}

export interface MergeOptions {
  /** "keep-newer" (KeePassXC's default for sync: deletions are not applied) or "synchronize" */
  mode?: "keep-newer" | "synchronize";
  now?: () => Date;
}

const title = (e: KdbxEntry) => {
  const t = e.fields.get("Title");
  return t instanceof kdbxweb.ProtectedValue ? t.getText() : (t ?? "");
};
const change = (type: ChangeType, item: KdbxEntry | KdbxGroup | null, details: string): MergeChange => {
  if (!item) return { type, details };
  if (item instanceof kdbxweb.KdbxEntry) return { type, uuid: item.uuid.id, title: title(item), group: item.parentGroup?.name, details };
  return { type, uuid: item.uuid.id, group: item.name, details };
};

function* allEntries(group: KdbxGroup): Generator<KdbxEntry> {
  yield* group.entries;
  for (const g of group.groups) yield* allEntries(g);
}
function* allGroups(group: KdbxGroup): Generator<KdbxGroup> {
  for (const g of group.groups) {
    yield g;
    yield* allGroups(g);
  }
}
export const findEntryByUuid = (db: Kdbx, id: string): KdbxEntry | undefined => {
  for (const e of allEntries(db.getDefaultGroup())) if (e.uuid.id === id) return e;
  return undefined;
};
const findGroupByUuid = (root: KdbxGroup, id: string): KdbxGroup | undefined => {
  if (root.uuid.id === id) return root;
  for (const g of allGroups(root)) if (g.uuid.id === id) return g;
  return undefined;
};

/** Copies everything but history (and parent) from `src`, bringing its binaries and custom icon into `dstDb`. */
function copyEntryData(dst: KdbxEntry, src: KdbxEntry, srcDb: Kdbx | undefined, dstDb: Kdbx): void {
  dst.copyFrom(src);
  dst.customData = src.customData ? new Map([...src.customData].map(([k, v]) => [k, { ...v }])) : undefined;
  dst.qualityCheck = src.qualityCheck;
  dst.previousParentGroup = src.previousParentGroup;
  importAssets(dst, srcDb, dstDb);
}

function importAssets(e: KdbxEntry, srcDb: Kdbx | undefined, dstDb: Kdbx): void {
  if (srcDb === dstDb) return;
  for (const b of e.binaries.values()) {
    if (kdbxweb.KdbxBinaries.isKdbxBinaryWithHash(b) && !dstDb.binaries.getValueByHash(b.hash)) dstDb.binaries.addWithHash(b);
  }
  const icon = e.customIcon?.id;
  if (icon && srcDb && !dstDb.meta.customIcons.has(icon)) {
    const ci = srcDb.meta.customIcons.get(icon);
    if (ci) dstDb.meta.customIcons.set(icon, ci);
  }
}

/** Entry::clone(CloneNoFlags | CloneIncludeHistory), same uuid. */
function cloneEntry(src: KdbxEntry, srcDb: Kdbx | undefined, dstDb: Kdbx, withHistory: boolean): KdbxEntry {
  const e = new kdbxweb.KdbxEntry();
  copyEntryData(e, src, srcDb, dstDb);
  e.history = withHistory ? src.history.map((h) => cloneEntry(h, srcDb, dstDb, false)) : [];
  return e;
}

const customDataJson = (m: Map<string, { value?: string }> | undefined) =>
  JSON.stringify([...(m ?? new Map())].map(([k, v]) => [k, v.value]).sort());

/** Entry::equals(other, CompareItemIgnoreMilliseconds [| IgnoreHistory]) */
function entryEquals(a: KdbxEntry, b: KdbxEntry, ignoreHistory = false, ignoreTimes = false): boolean {
  if (a.uuid.id !== b.uuid.id) return false;
  const fa = fieldsOf(a);
  const fb = fieldsOf(b);
  if (fa.size !== fb.size) return false;
  for (const [k, v] of fa) {
    const w = fb.get(k);
    if (!sameValue(v, w)) return false;
    // attributes compare their protection flag too
    if (v.kind === "attribute" && w?.kind === "attribute" && (a.fields.get(k.slice(10)) instanceof kdbxweb.ProtectedValue) !== (b.fields.get(k.slice(10)) instanceof kdbxweb.ProtectedValue)) return false;
  }
  const t = (x: KdbxEntry) =>
    [x.times.lastModTime, x.times.creationTime, x.times.lastAccessTime, x.times.locationChanged].map(seconds).concat(x.times.usageCount ?? 0).join(",");
  if (!ignoreTimes && t(a) !== t(b)) return false;
  if ((a.overrideUrl ?? "") !== (b.overrideUrl ?? "")) return false;
  if (JSON.stringify(a.autoType) !== JSON.stringify(b.autoType)) return false;
  if (customDataJson(a.customData) !== customDataJson(b.customData)) return false;
  if ((a.previousParentGroup?.id ?? "") !== (b.previousParentGroup?.id ?? "")) return false;
  if (!ignoreHistory) {
    if (a.history.length !== b.history.length) return false;
    for (let i = 0; i < a.history.length; i++) if (!entryEquals(a.history[i]!, b.history[i]!)) return false;
  }
  return true;
}

function truncateHistory(e: KdbxEntry, db: Kdbx): void {
  const max = db.meta.historyMaxItems;
  if (max !== undefined && max > -1 && e.history.length > max) e.history.splice(0, e.history.length - max);
  // NOTE: historyMaxSize is applied by kdbxweb's cleanup() on save paths that call it; not here.
}

/**
 * combineEntries(): gives both entries the combined fields and the same modification time, so the
 * Merger sees one version. Each keeps its previous state in its history.
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
    const before = cloneEntry(entry, db, db, false);
    let modified = false;
    if (entry === older) {
      // copyDataFrom() emits for attributes, attachments, custom data and auto-type (m_data is assigned silently)
      modified = emittingDataDiffers(entry, newer);
      // Everything not merged field by field comes from the newer entry
      const history = entry.history;
      const parent = entry.parentGroup;
      copyEntryData(entry, newer, newerDb, db);
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
      truncateHistory(entry, db);
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
    return parts.join("\n") + "|" + customDataJson(e.customData) + "|" + JSON.stringify(e.autoType);
  };
  return pick(a) !== pick(b);
}

// ------------------------------------------------------------------------------------------- Merger

interface Ctx {
  sourceDb: Kdbx;
  targetDb: Kdbx;
  sourceGroup: KdbxGroup;
  targetGroup: KdbxGroup;
}

class Merger {
  constructor(
    private readonly sourceDb: Kdbx,
    private readonly targetDb: Kdbx,
    private readonly mode: "keep-newer" | "synchronize",
  ) {}

  merge(): MergeChange[] {
    const ctx: Ctx = { sourceDb: this.sourceDb, targetDb: this.targetDb, sourceGroup: this.sourceDb.getDefaultGroup(), targetGroup: this.targetDb.getDefaultGroup() };
    return [...this.mergeGroup(ctx), ...this.mergeDeletions(), ...this.mergeMetadata()];
  }

  private moveEntry(entry: KdbxEntry, to: KdbxGroup) {
    const from = entry.parentGroup;
    if (from === to) return;
    if (from) from.entries.splice(from.entries.indexOf(entry), 1);
    to.entries.push(entry);
    entry.parentGroup = to;
  }
  private moveGroup(group: KdbxGroup, to: KdbxGroup) {
    const from = group.parentGroup;
    if (from === to) return;
    if (from) from.groups.splice(from.groups.indexOf(group), 1);
    to.groups.push(group);
    group.parentGroup = to;
  }
  private eraseEntry(entry: KdbxEntry) {
    const p = entry.parentGroup;
    if (p) p.entries.splice(p.entries.indexOf(entry), 1);
    entry.parentGroup = undefined;
  }

  private mergeGroup(ctx: Ctx): MergeChange[] {
    const changes: MergeChange[] = [];
    const targetRoot = ctx.targetDb.getDefaultGroup();
    for (const sourceEntry of [...ctx.sourceGroup.entries]) {
      let targetEntry = findEntryByUuid(ctx.targetDb, sourceEntry.uuid.id);
      if (!targetEntry) {
        changes.push(change("added", sourceEntry, ""));
        targetEntry = cloneEntry(sourceEntry, ctx.sourceDb, ctx.targetDb, true);
        targetEntry.parentGroup = undefined;
        this.moveEntry(targetEntry, ctx.targetGroup);
      } else {
        const locationChanged = (targetEntry.times.locationChanged?.getTime() ?? 0) < (sourceEntry.times.locationChanged?.getTime() ?? 0);
        if (locationChanged && targetEntry.parentGroup !== ctx.targetGroup) {
          changes.push(change("moved", sourceEntry, `Previous location: ${targetEntry.parentGroup?.name ?? ""}`));
          this.moveEntry(targetEntry, ctx.targetGroup);
        }
        changes.push(...this.resolveEntryConflict(sourceEntry, targetEntry));
      }
    }
    for (const sourceChild of [...ctx.sourceGroup.groups]) {
      let targetChild = findGroupByUuid(targetRoot, sourceChild.uuid.id);
      if (!targetChild) {
        changes.push(change("added", sourceChild, `Number of entries in group: ${sourceChild.entries.length}`));
        targetChild = new kdbxweb.KdbxGroup();
        targetChild.copyFrom(sourceChild);
        targetChild.groups = [];
        targetChild.entries = [];
        this.moveGroup(targetChild, ctx.targetGroup);
        targetChild.times.locationChanged = sourceChild.times.locationChanged;
        if (sourceChild.customIcon && !ctx.targetDb.meta.customIcons.has(sourceChild.customIcon.id)) {
          const ci = ctx.sourceDb.meta.customIcons.get(sourceChild.customIcon.id);
          if (ci) ctx.targetDb.meta.customIcons.set(sourceChild.customIcon.id, ci);
        }
      } else {
        const locationChanged = (targetChild.times.locationChanged?.getTime() ?? 0) < (sourceChild.times.locationChanged?.getTime() ?? 0);
        if (locationChanged && targetChild.parentGroup !== ctx.targetGroup) {
          changes.push(change("moved", sourceChild, `Previous location: ${targetChild.name ?? ""}`));
          this.moveGroup(targetChild, ctx.targetGroup);
          targetChild.times.locationChanged = sourceChild.times.locationChanged;
        }
        changes.push(...this.resolveGroupConflict(sourceChild, targetChild, ctx));
      }
      changes.push(...this.mergeGroup({ ...ctx, sourceGroup: sourceChild, targetGroup: targetChild }));
    }
    return changes;
  }

  private resolveGroupConflict(source: KdbxGroup, target: KdbxGroup, ctx: Ctx): MergeChange[] {
    const tExisting = target.times.lastModTime?.getTime() ?? 0;
    const tOther = source.times.lastModTime?.getTime() ?? 0;
    if (!(tExisting < tOther)) return [];
    const mods: string[] = [];
    if (target.name !== source.name) {
      mods.push("Group name");
      target.name = source.name;
    }
    if ((target.notes ?? "") !== (source.notes ?? "")) {
      mods.push("Notes");
      target.notes = source.notes;
    }
    if (source.customIcon && !source.customIcon.empty) {
      if (target.customIcon?.id !== source.customIcon.id) {
        mods.push("Icon (UUID)");
        target.customIcon = source.customIcon;
        const ci = ctx.sourceDb.meta.customIcons.get(source.customIcon.id);
        if (ci && !ctx.targetDb.meta.customIcons.has(source.customIcon.id)) ctx.targetDb.meta.customIcons.set(source.customIcon.id, ci);
      }
    } else if (target.icon !== source.icon || target.customIcon) {
      mods.push("Icon (Number)");
      target.icon = source.icon;
      target.customIcon = undefined;
    }
    if ((target.times.expiryTime?.getTime() ?? 0) !== (source.times.expiryTime?.getTime() ?? 0)) {
      mods.push("Expiry time");
      target.times.expiryTime = source.times.expiryTime;
    }
    mods.push("Modification time");
    target.times.lastModTime = source.times.lastModTime;
    return [change("modified", source, mods.join(", "))];
  }

  private resolveEntryConflict(source: KdbxEntry, target: KdbxEntry): MergeChange[] {
    const cmp = Math.sign(entrySeconds(target) - entrySeconds(source));
    const maxItems = this.targetDb.meta.historyMaxItems ?? 10;
    if (cmp < 0) {
      // Merge with the alien (newer) entry on top
      const group = target.parentGroup!;
      const cloned = cloneEntry(source, this.sourceDb, this.targetDb, true);
      this.mergeHistory(target, cloned, maxItems);
      this.eraseEntry(target);
      this.moveEntry(cloned, group);
      return [change("modified", target, "Add local modifications to new entry")];
    }
    const changed = this.mergeHistory(source, target, maxItems);
    return changed ? [change("modified", target, "Add new modifications to existing entry")] : [];
  }

  /** Merger::mergeHistory, keyed by whole seconds like Clock::serialized. Returns whether it changed. */
  private mergeHistory(source: KdbxEntry, target: KdbxEntry, maxItems: number): boolean {
    const targetHistory = target.history;
    const cmp = Math.sign(entrySeconds(source) - entrySeconds(target));
    const preferLocal = cmp < 0;
    const preferRemote = cmp > 0;
    const merged = new Map<number, KdbxEntry>();
    const srcDb = source === target ? this.targetDb : this.sourceDb;
    for (const h of targetHistory) merged.set(entrySeconds(h), cloneEntry(h, this.targetDb, this.targetDb, false));
    for (const h of source.history) {
      const t = entrySeconds(h);
      if (preferRemote && merged.has(t)) merged.delete(t);
      if (!merged.has(t)) merged.set(t, cloneEntry(h, srcDb, this.targetDb, false));
    }
    const tt = entrySeconds(target);
    const st = entrySeconds(source);
    if (tt < st) {
      if (preferLocal && merged.has(tt)) merged.delete(tt);
      if (!merged.has(tt)) merged.set(tt, cloneEntry(target, this.targetDb, this.targetDb, false));
    } else if (tt > st) {
      if (!merged.has(st)) merged.set(st, cloneEntry(source, srcDb, this.targetDb, false));
    }
    const updated = [...merged.entries()].sort((a, b) => a[0] - b[0]).map(([, e]) => e);
    let changed = false;
    // Same window as the C++ loop (it compares items count-0 .. count-(maxItems-1) from the end)
    for (let i = 0; i < maxItems; i++) {
      const o = targetHistory[targetHistory.length - i];
      const n = updated[updated.length - i];
      if (!o && !n) continue;
      if (o && n && entryEquals(o, n)) continue;
      changed = true;
      break;
    }
    if (!changed) return false;
    target.history = updated;
    truncateHistory(target, this.targetDb);
    return true;
  }

  private mergeDeletions(): MergeChange[] {
    // KeePassXC: "no deletions are applied for any other strategy" than Synchronize. Sync merges with the
    // default mode, which falls back to KeepNewer, so deletions are not applied by default.
    if (this.mode !== "synchronize") return [];
    const changes: MergeChange[] = [];
    const targetRoot = this.targetDb.getDefaultGroup();
    const all = [...this.targetDb.deletedObjects, ...this.sourceDb.deletedObjects];
    const merged = new Map<string, kdbxweb.KdbxDeletedObject>();
    const deletions: kdbxweb.KdbxDeletedObject[] = [];
    const entries: KdbxEntry[] = [];
    const groups: KdbxGroup[] = [];
    for (const o of all) {
      const id = o.uuid?.id;
      if (!id || !o.deletionTime) continue;
      if (!merged.has(id)) {
        merged.set(id, o);
        const e = findEntryByUuid(this.targetDb, id);
        if (e) {
          entries.push(e);
          continue;
        }
        const g = findGroupByUuid(targetRoot, id);
        if (g && g !== targetRoot) {
          groups.push(g);
          continue;
        }
        deletions.push(o);
        continue;
      }
      if (merged.get(id)!.deletionTime! > o.deletionTime) merged.set(id, o);
    }
    for (const e of entries) {
      const o = merged.get(e.uuid.id)!;
      if ((e.times.lastModTime?.getTime() ?? 0) > o.deletionTime!.getTime()) continue; // changed after deletion
      deletions.push(o);
      changes.push(change("deleted", e, e.parentGroup ? "Explicit deletion" : "Implicit deletion (e.g. removal of parent group)"));
      this.eraseEntry(e);
    }
    const pending = [...groups];
    while (pending.length) {
      const g = pending.shift()!;
      if (g.groups.some((c) => pending.includes(c))) {
        pending.push(g);
        continue;
      }
      const o = merged.get(g.uuid.id)!;
      if ((g.times.lastModTime?.getTime() ?? 0) > o.deletionTime!.getTime()) continue;
      if ([...allEntries(g)].length || [...allGroups(g)].length) continue; // keeps undeleted content
      deletions.push(o);
      changes.push(change("deleted", g, g.parentGroup ? "Explicit deletion" : "Implicit deletion (e.g. removal of parent group)"));
      const p = g.parentGroup;
      if (p) p.groups.splice(p.groups.indexOf(g), 1);
    }
    const key = (l: kdbxweb.KdbxDeletedObject[]) => l.map((o) => `${o.uuid?.id}@${o.deletionTime?.getTime()}`).join(",");
    if (key(deletions) !== key(this.targetDb.deletedObjects)) {
      changes.push(change("metadata", null, "Changed deleted objects"));
      this.targetDb.deletedObjects = deletions;
    }
    return changes;
  }

  private mergeMetadata(): MergeChange[] {
    const changes: MergeChange[] = [];
    const s = this.sourceDb.meta;
    const t = this.targetDb.meta;
    for (const [id, icon] of s.customIcons) {
      if (!t.customIcons.has(id)) {
        changes.push(change("metadata", null, `Adding new icon ${id}`));
        t.customIcons.set(id, icon);
      }
    }
    // Custom data, when the source's is newer (CustomData::lastModified: the _LAST_MODIFIED item)
    const lm = (m: kdbxweb.KdbxCustomDataMap) => {
      const v = m.get("_LAST_MODIFIED")?.value;
      if (v) {
        const d = Date.parse(v);
        if (!Number.isNaN(d)) return d;
      }
      let latest: number | undefined;
      for (const item of m.values()) if (item.lastModified && (latest === undefined || item.lastModified.getTime() > latest)) latest = item.lastModified.getTime();
      return latest;
    };
    const tl = lm(t.customData);
    const sl = lm(s.customData);
    if (!t.customData.has("_LAST_MODIFIED") || (tl !== undefined && sl !== undefined && tl < sl)) {
      const isProtected = (k: string) =>
        k.startsWith("KPXC_BROWSER_") || ["_CREATED_", "FDO_SECRETS_EXPOSED_GROUP", "KPXC_REMOTE_SYNC_SETTINGS", "KPXC_SYNC_GENERATION"].includes(k);
      const isAutoGenerated = (k: string) => ["_LAST_MODIFIED", "KPXC_RANDOM_SLUG", "KPXC_SYNC_GENERATION"].includes(k);
      for (const k of [...t.customData.keys()]) {
        if (!s.customData.has(k) && !isProtected(k)) {
          changes.push(change("metadata", null, `Removed custom data ${k} [${t.customData.get(k)?.value ?? ""}]`));
          t.customData.delete(k);
        }
      }
      for (const [k, item] of s.customData) {
        if (isAutoGenerated(k)) continue;
        if (item.value !== t.customData.get(k)?.value) {
          changes.push(change("metadata", null, `Adding custom data ${k} [${item.value ?? ""}]`));
          t.customData.set(k, { ...item });
        }
      }
    }
    return changes;
  }
}

/** Merger(source, target).merge() */
export function mergeInto(source: Kdbx, target: Kdbx, mode: "keep-newer" | "synchronize" = "keep-newer"): MergeChange[] {
  return new Merger(source, target, mode).merge();
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
    for (const localEntry of [...allEntries(local.getDefaultGroup())]) {
      const remoteEntry = findEntryByUuid(remote, localEntry.uuid.id);
      const baseEntry = findEntryByUuid(base, localEntry.uuid.id);
      if (!remoteEntry || !baseEntry) continue;
      if (sameFields(localEntry, remoteEntry)) continue;
      // Compared by content with the base, so neither clocks nor same-second edits can mislead
      const localChanged = !sameFields(localEntry, baseEntry);
      const remoteChanged = !sameFields(remoteEntry, baseEntry);
      const lt = entrySeconds(localEntry);
      const rt = entrySeconds(remoteEntry);
      // Merger keeps the newer entry: right when only one side changed and it is strictly newer
      const needed = (localChanged && remoteChanged) || (localChanged && lt <= rt) || (remoteChanged && rt <= lt);
      if (needed) {
        const c = await combineEntries(localEntry, local, remoteEntry, remote, baseEntry, opts.now);
        if (c.length) conflicts.set(localEntry.uuid.id, c);
        combined++;
        changes.push(change("modified", localEntry, "Combined the changes made on both devices"));
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
  for (const e of allEntries(db.getDefaultGroup())) s[e.uuid.id] = e.times.lastModTime?.getTime() ?? 0;
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
      out.push({ uuid: id, kind: "edited-on-both", title: title(l), fields: [] });
    } else if (r && deletedIn(local, id) && changedSince(r, ms)) {
      out.push({ uuid: id, kind: "deleted-here-edited-there", title: title(r), fields: [] });
    } else if (l && deletedIn(remote, id) && changedSince(l, ms)) {
      out.push({ uuid: id, kind: "edited-here-deleted-there", title: title(l), fields: [] });
    }
  }
  return out;
}

export { binaryBytes };

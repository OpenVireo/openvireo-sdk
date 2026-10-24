/**
 * Structure merge: brings one database's entries, groups, history, deletions and metadata into
 * another. Written from docs/merge-behaviour.md (section numbers below refer to it).
 */
import { kdbxweb, type Kdbx } from "../vault/kdbx.js";
import { entrySeconds, fieldsOf, seconds } from "./fields.js";

type KdbxEntry = kdbxweb.KdbxEntry;
type KdbxGroup = kdbxweb.KdbxGroup;
type Deleted = kdbxweb.KdbxDeletedObject;

export type ChangeType = "added" | "modified" | "moved" | "deleted" | "metadata";
export interface MergeChange {
  type: ChangeType;
  uuid?: string;
  title?: string;
  group?: string;
  details: string;
}
export type MergeMode = "keep-newer" | "synchronize";

export const entryTitle = (e: KdbxEntry): string => {
  const t = e.fields.get("Title");
  return t instanceof kdbxweb.ProtectedValue ? t.getText() : (t ?? "");
};

/** A change record for an entry, a group, or (null) the database. */
export function record(type: ChangeType, item: KdbxEntry | KdbxGroup | null, details: string): MergeChange {
  if (item instanceof kdbxweb.KdbxEntry) return { type, uuid: item.uuid.id, title: entryTitle(item), group: item.parentGroup?.name, details };
  if (item) return { type, uuid: item.uuid.id, group: item.name, details };
  return { type, details };
}

// ------------------------------------------------------------------------------------ tree helpers

export function* entriesUnder(group: KdbxGroup): Generator<KdbxEntry> {
  const stack = [group];
  while (stack.length) {
    const g = stack.pop()!;
    yield* g.entries;
    for (let i = g.groups.length - 1; i >= 0; i--) stack.push(g.groups[i]!);
  }
}

function* groupsUnder(group: KdbxGroup): Generator<KdbxGroup> {
  for (const child of group.groups) {
    yield child;
    yield* groupsUnder(child);
  }
}

export function findEntryByUuid(db: Kdbx, id: string): KdbxEntry | undefined {
  for (const e of entriesUnder(db.getDefaultGroup())) if (e.uuid.id === id) return e;
  return undefined;
}

function findGroup(db: Kdbx, id: string): KdbxGroup | undefined {
  const root = db.getDefaultGroup();
  if (root.uuid.id === id) return root;
  for (const g of groupsUnder(root)) if (g.uuid.id === id) return g;
  return undefined;
}

function detach<T>(item: T & { parentGroup?: KdbxGroup }, list: (g: KdbxGroup) => T[]): void {
  const parent = item.parentGroup;
  if (!parent) return;
  const siblings = list(parent);
  const i = siblings.indexOf(item);
  if (i >= 0) siblings.splice(i, 1);
  item.parentGroup = undefined;
}

/** Makes `entry` the last entry of `group`. */
function appendEntry(entry: KdbxEntry, group: KdbxGroup): void {
  if (entry.parentGroup === group) return;
  detach(entry, (g) => g.entries);
  group.entries.push(entry);
  entry.parentGroup = group;
}

/** Makes `child` the last child group of `group`. */
function appendGroup(child: KdbxGroup, group: KdbxGroup): void {
  if (child.parentGroup === group) return;
  detach(child, (g) => g.groups);
  group.groups.push(child);
  child.parentGroup = group;
}

function removeEntry(entry: KdbxEntry): void {
  detach(entry, (g) => g.entries);
}

// ------------------------------------------------------------------------------------------ copies

/** Adds a custom icon image from `from` to `to` when `to` lacks it. */
function bringIcon(id: string | undefined, from: Kdbx | undefined, to: Kdbx): void {
  if (!id || !from || from === to || to.meta.customIcons.has(id)) return;
  const icon = from.meta.customIcons.get(id);
  if (icon) to.meta.customIcons.set(id, icon);
}

/**
 * Overwrites `dst`'s data with `src`'s (not its history or parent) and makes sure `dstDb` holds the
 * attachments and custom icon it refers to.
 */
export function overwriteEntryData(dst: KdbxEntry, src: KdbxEntry, srcDb: Kdbx | undefined, dstDb: Kdbx): void {
  dst.copyFrom(src);
  dst.customData = src.customData && new Map([...src.customData].map(([k, item]) => [k, { ...item }]));
  dst.qualityCheck = src.qualityCheck;
  dst.previousParentGroup = src.previousParentGroup;
  if (srcDb === dstDb) return;
  for (const bin of src.binaries.values()) {
    if (kdbxweb.KdbxBinaries.isKdbxBinaryWithHash(bin) && !dstDb.binaries.getValueByHash(bin.hash)) dstDb.binaries.addWithHash(bin);
  }
  bringIcon(src.customIcon?.id, srcDb, dstDb);
}

/** A detached copy of `src` for `dstDb`: "full" includes copies of its history items, "plain" none. */
export function copyEntry(src: KdbxEntry, srcDb: Kdbx | undefined, dstDb: Kdbx, kind: "full" | "plain"): KdbxEntry {
  const out = new kdbxweb.KdbxEntry();
  overwriteEntryData(out, src, srcDb, dstDb);
  out.parentGroup = undefined;
  out.history = kind === "full" ? src.history.map((h) => copyEntry(h, srcDb, dstDb, "plain")) : [];
  return out;
}

/** Trims `entry`'s history to the database's limit, keeping the newest items. */
export function trimHistory(entry: KdbxEntry, db: Kdbx): void {
  const limit = db.meta.historyMaxItems;
  if (limit === undefined || limit < 0) return;
  const extra = entry.history.length - limit;
  if (extra > 0) entry.history = entry.history.slice(extra);
}

// ---------------------------------------------------------------------------------- equality (§3)

export const customDataKey = (m: Map<string, { value?: string }> | undefined): string =>
  JSON.stringify([...(m ?? [])].map(([k, item]) => [k, item.value]).sort());

/** Snapshot of everything §3 compares, except the history. */
function entryDigest(e: KdbxEntry): string {
  const fields = [...fieldsOf(e)].map(([k, v]) => {
    const raw = k.startsWith("attribute/") ? e.fields.get(k.slice("attribute/".length)) : undefined;
    return [k, v.cmp, raw instanceof kdbxweb.ProtectedValue];
  });
  fields.sort((a, b) => (a[0]! < b[0]! ? -1 : a[0]! > b[0]! ? 1 : 0));
  const t = e.times;
  return JSON.stringify([
    e.uuid.id,
    fields,
    [t.lastModTime, t.creationTime, t.lastAccessTime, t.locationChanged].map(seconds),
    t.usageCount ?? 0,
    e.overrideUrl ?? "",
    e.autoType ?? null,
    customDataKey(e.customData),
    e.previousParentGroup?.id ?? "",
  ]);
}

export function entriesEqual(a: KdbxEntry, b: KdbxEntry): boolean {
  if (entryDigest(a) !== entryDigest(b) || a.history.length !== b.history.length) return false;
  return a.history.every((h, i) => entriesEqual(h, b.history[i]!));
}

// --------------------------------------------------------------------------------- history (§2)

/**
 * Merges the history of `other` into `kept` (both already in `keptDb`'s terms, or `other` in
 * `otherDb`). Returns whether `kept`'s history changed.
 */
function mergeHistoryInto(kept: KdbxEntry, keptDb: Kdbx, other: KdbxEntry, otherDb: Kdbx): boolean {
  const keptAt = entrySeconds(kept);
  const otherAt = entrySeconds(other);
  const byTime = new Map<number, KdbxEntry>();
  for (const h of kept.history) byTime.set(entrySeconds(h), copyEntry(h, keptDb, keptDb, "plain"));
  for (const h of other.history) {
    const at = entrySeconds(h);
    if (!byTime.has(at) || otherAt > keptAt) byTime.set(at, copyEntry(h, otherDb, keptDb, "plain"));
  }
  if (keptAt < otherAt && !byTime.has(keptAt)) byTime.set(keptAt, copyEntry(kept, keptDb, keptDb, "plain"));
  if (keptAt > otherAt && !byTime.has(otherAt)) byTime.set(otherAt, copyEntry(other, otherDb, keptDb, "plain"));
  const next = [...byTime].sort(([x], [y]) => x - y).map(([, e]) => e);

  const window = (keptDb.meta.historyMaxItems ?? 10) - 1;
  const old = kept.history;
  let changed = false;
  for (let back = 1; back <= window && !changed; back++) {
    const a = old[old.length - back];
    const b = next[next.length - back];
    changed = a && b ? !entriesEqual(a, b) : a !== b;
  }
  if (!changed) return false;
  kept.history = next;
  trimHistory(kept, keptDb);
  return true;
}

// ------------------------------------------------------------------------------------------ passes

class Pass {
  readonly changes: MergeChange[] = [];

  constructor(
    private readonly from: Kdbx,
    private readonly into: Kdbx,
  ) {}

  /** §1: walks `src` (a group of `from`) into `dst` (its counterpart in `into`). */
  walk(src: KdbxGroup, dst: KdbxGroup): void {
    for (const entry of [...src.entries]) this.entry(entry, dst);
    for (const child of [...src.groups]) this.walk(child, this.group(child, dst));
  }

  private static movedLater(src: { times: kdbxweb.KdbxTimes }, dst: { times: kdbxweb.KdbxTimes }): boolean {
    return (dst.times.locationChanged?.getTime() ?? 0) < (src.times.locationChanged?.getTime() ?? 0);
  }

  /** §1.1 */
  private entry(src: KdbxEntry, dst: KdbxGroup): void {
    const existing = findEntryByUuid(this.into, src.uuid.id);
    if (!existing) {
      this.changes.push(record("added", src, ""));
      appendEntry(copyEntry(src, this.from, this.into, "full"), dst);
      return;
    }
    if (Pass.movedLater(src, existing) && existing.parentGroup !== dst) {
      this.changes.push(record("moved", src, `Previous location: ${existing.parentGroup?.name ?? ""}`));
      appendEntry(existing, dst);
    }
    if (entrySeconds(existing) < entrySeconds(src)) {
      const replacement = copyEntry(src, this.from, this.into, "full");
      mergeHistoryInto(replacement, this.into, existing, this.into);
      this.changes.push(record("modified", existing, "Add local modifications to new entry"));
      const home = existing.parentGroup!;
      removeEntry(existing);
      appendEntry(replacement, home);
    } else if (mergeHistoryInto(existing, this.into, src, this.from)) {
      this.changes.push(record("modified", existing, "Add new modifications to existing entry"));
    }
  }

  /** §1.2: returns the target group to walk `src`'s contents into. */
  private group(src: KdbxGroup, dst: KdbxGroup): KdbxGroup {
    const existing = findGroup(this.into, src.uuid.id);
    if (!existing) {
      this.changes.push(record("added", src, `Number of entries in group: ${src.entries.length}`));
      const made = new kdbxweb.KdbxGroup();
      made.copyFrom(src);
      made.groups = [];
      made.entries = [];
      made.parentGroup = undefined;
      appendGroup(made, dst);
      made.times.locationChanged = src.times.locationChanged;
      bringIcon(src.customIcon?.id, this.from, this.into);
      return made;
    }
    if (Pass.movedLater(src, existing) && existing.parentGroup !== dst) {
      this.changes.push(record("moved", src, `Previous location: ${existing.name ?? ""}`));
      appendGroup(existing, dst);
      existing.times.locationChanged = src.times.locationChanged;
    }
    if (seconds(existing.times.lastModTime) < seconds(src.times.lastModTime)) this.updateGroup(src, existing);
    return existing;
  }

  private updateGroup(src: KdbxGroup, dst: KdbxGroup): void {
    const what: string[] = [];
    if (dst.name !== src.name) {
      what.push("Group name");
      dst.name = src.name;
    }
    if ((dst.notes ?? "") !== (src.notes ?? "")) {
      what.push("Notes");
      dst.notes = src.notes;
    }
    const custom = src.customIcon && !src.customIcon.empty ? src.customIcon : undefined;
    if (custom) {
      if (dst.customIcon?.id !== custom.id) {
        what.push("Icon (UUID)");
        dst.customIcon = custom;
        bringIcon(custom.id, this.from, this.into);
      }
    } else if (dst.icon !== src.icon || dst.customIcon) {
      what.push("Icon (Number)");
      dst.icon = src.icon;
      dst.customIcon = undefined;
    }
    if (seconds(dst.times.expiryTime) !== seconds(src.times.expiryTime)) {
      what.push("Expiry time");
      dst.times.expiryTime = src.times.expiryTime;
    }
    what.push("Modification time");
    dst.times.lastModTime = src.times.lastModTime;
    this.changes.push(record("modified", src, what.join(", ")));
  }

  /** §4 */
  deletions(): void {
    const root = this.into.getDefaultGroup();
    const earliest = new Map<string, Deleted>();
    const kept: Deleted[] = [];
    const entries: KdbxEntry[] = [];
    const groups: KdbxGroup[] = [];
    for (const rec of [...this.into.deletedObjects, ...this.from.deletedObjects]) {
      const id = rec.uuid?.id;
      if (!id || !rec.deletionTime) continue;
      const seen = earliest.get(id);
      if (seen) {
        if (seen.deletionTime! > rec.deletionTime) earliest.set(id, rec);
        continue;
      }
      earliest.set(id, rec);
      const entry = findEntryByUuid(this.into, id);
      const group = entry ? undefined : findGroup(this.into, id);
      if (entry) entries.push(entry);
      else if (group && group !== root) groups.push(group);
      else kept.push(rec);
    }
    const deletedAt = (item: KdbxEntry | KdbxGroup) => earliest.get(item.uuid.id)!;
    const editedAfter = (item: KdbxEntry | KdbxGroup) => (item.times.lastModTime?.getTime() ?? 0) > deletedAt(item).deletionTime!.getTime();

    for (const entry of entries) {
      if (editedAfter(entry)) continue;
      kept.push(deletedAt(entry));
      this.changes.push(record("deleted", entry, "Explicit deletion"));
      removeEntry(entry);
    }
    const waiting = [...groups];
    while (waiting.length) {
      const group = waiting.shift()!;
      if (group.groups.some((c) => waiting.includes(c))) {
        waiting.push(group);
        continue;
      }
      if (editedAfter(group) || group.entries.length || group.groups.length) continue;
      kept.push(deletedAt(group));
      this.changes.push(record("deleted", group, "Explicit deletion"));
      detach(group, (g) => g.groups);
    }
    const listKey = (l: Deleted[]) => l.map((r) => `${r.uuid?.id}@${r.deletionTime?.getTime()}`).join(",");
    if (listKey(kept) !== listKey(this.into.deletedObjects)) {
      this.changes.push(record("metadata", null, "Changed deleted objects"));
      this.into.deletedObjects = kept;
    }
  }

  /** §5 */
  metadata(): void {
    const src = this.from.meta;
    const dst = this.into.meta;
    for (const [id, icon] of src.customIcons) {
      if (dst.customIcons.has(id)) continue;
      this.changes.push(record("metadata", null, `Adding new icon ${id}`));
      dst.customIcons.set(id, icon);
    }
    const dstTime = customDataTime(dst.customData);
    const srcTime = customDataTime(src.customData);
    const apply = !dst.customData.has("_LAST_MODIFIED") || (dstTime !== undefined && srcTime !== undefined && dstTime < srcTime);
    if (!apply) return;
    for (const key of [...dst.customData.keys()]) {
      if (src.customData.has(key) || PROTECTED_KEYS.has(key) || key.startsWith("KPXC_BROWSER_")) continue;
      this.changes.push(record("metadata", null, `Removed custom data ${key} [${dst.customData.get(key)?.value ?? ""}]`));
      dst.customData.delete(key);
    }
    for (const [key, item] of src.customData) {
      if (GENERATED_KEYS.has(key) || item.value === dst.customData.get(key)?.value) continue;
      this.changes.push(record("metadata", null, `Adding custom data ${key} [${item.value ?? ""}]`));
      dst.customData.set(key, { ...item });
    }
  }
}

const PROTECTED_KEYS = new Set(["_CREATED_", "FDO_SECRETS_EXPOSED_GROUP", "KPXC_REMOTE_SYNC_SETTINGS", "KPXC_SYNC_GENERATION"]);
const GENERATED_KEYS = new Set(["_LAST_MODIFIED", "KPXC_RANDOM_SLUG", "KPXC_SYNC_GENERATION"]);

function customDataTime(m: kdbxweb.KdbxCustomDataMap): number | undefined {
  const stamp = Date.parse(m.get("_LAST_MODIFIED")?.value ?? "");
  if (!Number.isNaN(stamp)) return stamp;
  let latest: number | undefined;
  for (const item of m.values()) {
    const t = item.lastModified?.getTime();
    if (t !== undefined && (latest === undefined || t > latest)) latest = t;
  }
  return latest;
}

/** Brings `source`'s changes into `target` (docs/merge-behaviour.md). Returns what changed in `target`. */
export function mergeInto(source: Kdbx, target: Kdbx, mode: MergeMode = "keep-newer"): MergeChange[] {
  const pass = new Pass(source, target);
  pass.walk(source.getDefaultGroup(), target.getDefaultGroup());
  if (mode === "synchronize") pass.deletions();
  pass.metadata();
  return pass.changes;
}

/**
 * Importing a .kdbx into an open database: a UUID merge, or copies with fresh UUIDs under a chosen group. The source is never changed. Either way the
 * source's recycle bin and its database custom data (sync remotes, browser keys…) stay behind.
 */
import { OpenVireoError } from "../errors.js";
import { kdbxweb, type Kdbx } from "../vault/kdbx.js";
import { type MergeChange, copyEntry, findGroup, mergeInto, record } from "./tree.js";

type KdbxEntry = kdbxweb.KdbxEntry;
type KdbxGroup = kdbxweb.KdbxGroup;

export interface ImportSummary {
  /** Entries new to the target */
  added: number;
  /** Entries the target had that the import changed (newer version, history or location) */
  updated: number;
  /** Entries the target already had as they are */
  unchanged: number;
  groupsAdded: number;
  changes: MergeChange[];
}

const recycleBinOf = (db: Kdbx): string | undefined => {
  const id = db.meta.recycleBinUuid;
  return id && !id.empty ? id.id : undefined;
};

/** The source's entries outside its recycle bin. */
function importableEntries(source: Kdbx): KdbxEntry[] {
  const bin = recycleBinOf(source);
  const out: KdbxEntry[] = [];
  const walk = (g: KdbxGroup) => {
    if (g.uuid.id === bin) return;
    out.push(...g.entries);
    g.groups.forEach(walk);
  };
  walk(source.getDefaultGroup());
  return out;
}

/**
 * Merges `source` into `target` by UUID, keeping the newer version of each entry (the older one goes
 * into its history) and deleting nothing, so importing the same file twice changes nothing. The
 * target's root group (an account vault's name) and database custom data are left as they are.
 */
export function importInto(source: Kdbx, target: Kdbx): ImportSummary {
  const bin = recycleBinOf(source);
  const changes = mergeInto(source, target, "keep-newer", {
    skipDatabaseCustomData: true,
    skipGroups: bin ? new Set([bin]) : undefined,
  });
  // Entry records carry a title, group records don't
  const isEntry = (c: MergeChange) => "title" in c;
  const added = new Set(changes.filter((c) => c.type === "added" && isEntry(c)).map((c) => c.uuid));
  const updated = new Set(changes.filter((c) => (c.type === "modified" || c.type === "moved") && isEntry(c) && !added.has(c.uuid)).map((c) => c.uuid));
  const total = importableEntries(source).length;
  return {
    added: added.size,
    updated: updated.size,
    unchanged: Math.max(0, total - added.size - updated.size),
    groupsAdded: changes.filter((c) => c.type === "added" && !isEntry(c)).length,
    changes,
  };
}

const hexOf = (u: kdbxweb.KdbxUuid): string =>
  Array.from(new Uint8Array(u.toBytes() ?? []), (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();

/**
 * Copies `source`'s tree into `target` as one new group under the group `parentUuid`, named after the
 * source's root group. Every entry (with its history) and group gets a fresh UUID, and field
 * references between the copied entries ({REF:…@I:<uuid>}) follow them. Nothing is matched against
 * the target, so importing twice gives two copies.
 */
export function importAsCopies(source: Kdbx, target: Kdbx, parentUuid: string): ImportSummary {
  const parent = findGroup(target, parentUuid);
  if (!parent) throw new OpenVireoError("not_found", "the group to import into no longer exists");
  const bin = recycleBinOf(source);
  const changes: MergeChange[] = [];
  const idMap = new Map<string, string>();
  const copies: KdbxEntry[] = [];
  let groupsAdded = 0;

  const bringIcon = (id: string | undefined) => {
    if (!id || target.meta.customIcons.has(id)) return;
    const icon = source.meta.customIcons.get(id);
    if (icon) target.meta.customIcons.set(id, icon);
  };

  const copyGroup = (src: KdbxGroup, into: KdbxGroup): KdbxGroup => {
    const made = new kdbxweb.KdbxGroup();
    made.copyFrom(src);
    made.uuid = kdbxweb.KdbxUuid.random();
    made.groups = [];
    made.entries = [];
    made.parentGroup = into;
    into.groups.push(made);
    bringIcon(src.customIcon?.id);
    groupsAdded++;
    changes.push(record("added", made, `Number of entries in group: ${src.entries.length}`));
    for (const entry of src.entries) {
      const out = copyEntry(entry, source, target, "full");
      out.uuid = kdbxweb.KdbxUuid.random();
      for (const h of out.history) h.uuid = out.uuid;
      idMap.set(hexOf(entry.uuid), hexOf(out.uuid));
      out.parentGroup = made;
      made.entries.push(out);
      copies.push(out);
      changes.push(record("added", out, ""));
    }
    for (const child of src.groups) if (child.uuid.id !== bin) copyGroup(child, made);
    return made;
  };

  const top = copyGroup(source.getDefaultGroup(), parent);
  top.times.locationChanged = new Date();
  // References by UUID between the copied entries now point at the copies
  const ref = /(\{REF:[TUPAN]@I:)([0-9A-Fa-f]{32})(\})/g;
  const remap = (e: KdbxEntry) => {
    for (const [name, value] of e.fields) {
      const text = value instanceof kdbxweb.ProtectedValue ? value.getText() : value;
      if (!text.includes("{REF:")) continue;
      const next = text.replace(ref, (all, pre: string, hex: string, post: string) => {
        const to = idMap.get(hex.toUpperCase());
        return to ? pre + to + post : all;
      });
      if (next !== text) e.fields.set(name, value instanceof kdbxweb.ProtectedValue ? kdbxweb.ProtectedValue.fromString(next) : next);
    }
  };
  for (const e of copies) {
    remap(e);
    e.history.forEach(remap);
  }
  return { added: copies.length, updated: 0, unchanged: 0, groupsAdded, changes };
}

/** Every group of `db` an import can go into (not the recycle bin or anything in it), root first, with its path. */
export function importTargets(db: Kdbx): { uuid: string; path: string }[] {
  const bin = recycleBinOf(db);
  const out: { uuid: string; path: string }[] = [];
  const walk = (g: KdbxGroup, path: string) => {
    if (g.uuid.id === bin) return;
    out.push({ uuid: g.uuid.id, path });
    for (const c of g.groups) walk(c, path ? `${path} / ${c.name ?? ""}` : (c.name ?? ""));
  };
  const root = db.getDefaultGroup();
  walk(root, root.name ?? "");
  return out;
}

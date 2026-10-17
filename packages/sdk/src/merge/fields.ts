/**
 * Port of the field model of keepassxc/src/gui/remote/SyncEngine.cpp (fieldsOf, applyField,
 * resolveFields, combineEntries) on kdbxweb entries.
 */
import { sha256 } from "@noble/hashes/sha2.js";
import { kdbxweb, type Kdbx } from "../vault/kdbx.js";
import { toHex } from "../util/bytes.js";

type KdbxEntry = kdbxweb.KdbxEntry;

export const DEFAULT_ATTRIBUTES = ["Title", "UserName", "Password", "URL", "Notes"];
const isDefaultAttribute = (k: string) => DEFAULT_ATTRIBUTES.includes(k);

/** One mergeable part of an entry. `cmp` is the comparison key (QVariant equality in the C++). */
export type FieldValue =
  | { kind: "attribute"; text: string; protect: boolean; cmp: string }
  | { kind: "attachment"; data: Uint8Array; protectedBinary: boolean; cmp: string }
  | { kind: "tags"; tags: string[]; cmp: string }
  | { kind: "expiry"; at: number | "never"; cmp: string }
  | { kind: "icon"; number: number; custom?: { id: string; icon: kdbxweb.KdbxCustomIcon | undefined }; cmp: string }
  | { kind: "colors"; fg: string; bg: string; cmp: string };

export type Fields = Map<string, FieldValue>;

export const seconds = (d: Date | undefined | null): number => (d ? Math.floor(d.getTime() / 1000) : 0);
export const entrySeconds = (e: KdbxEntry): number => seconds(e.times.lastModTime);

export function binaryBytes(v: unknown): { data: Uint8Array; protectedBinary: boolean } {
  const value = kdbxweb.KdbxBinaries.isKdbxBinaryWithHash(v as kdbxweb.KdbxBinary) ? (v as kdbxweb.KdbxBinaryWithHash).value : v;
  if (value instanceof kdbxweb.ProtectedValue) return { data: value.getBinary(), protectedBinary: true };
  if (value instanceof ArrayBuffer) return { data: new Uint8Array(value), protectedBinary: false };
  if (value instanceof Uint8Array) return { data: value, protectedBinary: false };
  return { data: new Uint8Array(0), protectedBinary: false };
}

/** fieldsOf(): the parts of an entry merged one by one, by name. `db` is the entry's database (custom icons). */
export function fieldsOf(entry: KdbxEntry, db?: Kdbx): Fields {
  const f: Fields = new Map();
  for (const [key, value] of entry.fields) {
    const text = value instanceof kdbxweb.ProtectedValue ? value.getText() : String(value ?? "");
    // The file marks the standard fields protected by the database's settings, whatever the entry says
    const protect = !isDefaultAttribute(key) && value instanceof kdbxweb.ProtectedValue;
    f.set("attribute/" + key, { kind: "attribute", text, protect, cmp: JSON.stringify([text, protect ? "protected" : ""]) });
  }
  // KeePassXC entries always have the standard attributes (an absent one reads as "")
  for (const key of DEFAULT_ATTRIBUTES) {
    if (!f.has("attribute/" + key)) f.set("attribute/" + key, { kind: "attribute", text: "", protect: false, cmp: JSON.stringify(["", ""]) });
  }
  for (const [key, value] of entry.binaries) {
    const { data, protectedBinary } = binaryBytes(value);
    f.set("attachment/" + key, { kind: "attachment", data, protectedBinary, cmp: "sha256:" + toHex(sha256(data)) });
  }
  const tags = [...(entry.tags ?? [])];
  f.set("tags", { kind: "tags", tags, cmp: JSON.stringify(tags.join(";")) });
  const at = entry.times.expires && entry.times.expiryTime ? seconds(entry.times.expiryTime) : "never";
  f.set("expiry", { kind: "expiry", at, cmp: JSON.stringify(at) });
  if (entry.customIcon && !entry.customIcon.empty) {
    const id = entry.customIcon.id;
    f.set("icon", { kind: "icon", number: entry.icon ?? 0, custom: { id, icon: db?.meta.customIcons.get(id) }, cmp: "uuid:" + id });
  } else {
    f.set("icon", { kind: "icon", number: entry.icon ?? 0, cmp: "n:" + (entry.icon ?? 0) });
  }
  const fg = entry.fgColor ?? "";
  const bg = entry.bgColor ?? "";
  f.set("colors", { kind: "colors", fg, bg, cmp: JSON.stringify([fg, bg]) });
  return f;
}

const cmpOf = (v: FieldValue | undefined) => (v === undefined ? undefined : v.cmp);
export const sameValue = (a: FieldValue | undefined, b: FieldValue | undefined) => cmpOf(a) === cmpOf(b);

export function sameFields(a: KdbxEntry, b: KdbxEntry): boolean {
  const fa = fieldsOf(a);
  const fb = fieldsOf(b);
  if (fa.size !== fb.size) return false;
  for (const [k, v] of fa) if (!sameValue(v, fb.get(k))) return false;
  return true;
}

const STANDARD_NAMES: Record<string, string> = { Title: "Title", UserName: "Username", Password: "Password", URL: "URL", Notes: "Notes" };

/** Human-readable field name, as SyncEngine's fieldName() (English). */
export function fieldName(field: string): string {
  if (field.startsWith("attribute/")) {
    const k = field.slice("attribute/".length);
    return STANDARD_NAMES[k] ?? k;
  }
  if (field.startsWith("attachment/")) return `attachment ${field.slice("attachment/".length)}`;
  return ({ tags: "Tags", expiry: "Expiry", icon: "Icon" } as Record<string, string>)[field] ?? "Colors";
}

/** applyField(): sets one field on an entry in `db`; `undefined` removes it. */
export async function applyField(entry: KdbxEntry, db: Kdbx, field: string, value: FieldValue | undefined): Promise<void> {
  if (field.startsWith("attribute/")) {
    const key = field.slice("attribute/".length);
    const current = entry.fields.get(key);
    if (!value || value.kind !== "attribute") {
      // The standard fields always exist
      if (isDefaultAttribute(key)) entry.fields.set(key, current instanceof kdbxweb.ProtectedValue ? kdbxweb.ProtectedValue.fromString("") : "");
      else entry.fields.delete(key);
      return;
    }
    const protect = isDefaultAttribute(key) ? current instanceof kdbxweb.ProtectedValue : value.protect;
    entry.fields.set(key, protect ? kdbxweb.ProtectedValue.fromString(value.text) : value.text);
  } else if (field.startsWith("attachment/")) {
    const key = field.slice("attachment/".length);
    if (!value || value.kind !== "attachment") {
      entry.binaries.delete(key);
      return;
    }
    const bin = value.protectedBinary ? kdbxweb.ProtectedValue.fromBinary(value.data.slice().buffer as ArrayBuffer) : (value.data.slice().buffer as ArrayBuffer);
    entry.binaries.set(key, await db.createBinary(bin));
  } else if (field === "tags") {
    entry.tags = value?.kind === "tags" ? [...value.tags] : [];
  } else if (field === "expiry") {
    const at = value?.kind === "expiry" ? value.at : "never";
    entry.times.expires = at !== "never";
    if (at !== "never") entry.times.expiryTime = new Date(at * 1000);
  } else if (field === "icon") {
    if (value?.kind !== "icon") return;
    if (value.custom) {
      if (!db.meta.customIcons.has(value.custom.id) && value.custom.icon) db.meta.customIcons.set(value.custom.id, value.custom.icon);
      entry.customIcon = new kdbxweb.KdbxUuid(value.custom.id);
    } else {
      entry.customIcon = undefined;
      entry.icon = value.number;
    }
  } else if (field === "colors") {
    const fg = value?.kind === "colors" ? value.fg : "";
    const bg = value?.kind === "colors" ? value.bg : "";
    entry.fgColor = fg || undefined;
    entry.bgColor = bg || undefined;
  }
}

export interface Resolution {
  merged: Fields;
  /** names (fieldName) of fields both sides changed differently */
  conflicts: string[];
}

/**
 * resolveFields(): three-way merge of the fields. A field one side changed takes that change; one both
 * changed differently takes the newer side's value and counts as a conflict.
 */
export function resolveFields(local: KdbxEntry, remote: KdbxEntry, base: KdbxEntry, localIsNewer: boolean, dbs: { local?: Kdbx; remote?: Kdbx } = {}): Resolution {
  const lf = fieldsOf(local, dbs.local);
  const rf = fieldsOf(remote, dbs.remote);
  const bf = fieldsOf(base);
  const keys = [...new Set([...lf.keys(), ...rf.keys(), ...bf.keys()])];
  const merged: Fields = new Map();
  const conflicts: string[] = [];
  for (const key of keys) {
    const l = lf.get(key);
    const r = rf.get(key);
    const b = bf.get(key);
    let v: FieldValue | undefined;
    if (sameValue(l, r) || sameValue(r, b)) v = l;
    else if (sameValue(l, b)) v = r;
    else {
      v = localIsNewer ? l : r;
      conflicts.push(fieldName(key));
    }
    if (v !== undefined) merged.set(key, v);
  }
  return { merged, conflicts };
}

/** The fields both sides changed differently (SyncEngine::conflictingFields). */
export function conflictingFields(local: KdbxEntry | undefined, remote: KdbxEntry | undefined, base: KdbxEntry | undefined): string[] {
  if (!local || !remote || !base) return [];
  return resolveFields(local, remote, base, true).conflicts;
}

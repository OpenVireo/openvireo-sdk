/**
 * Secret references: kpx://<vault>/<entry>/<field>, optionally with a group path:
 * kpx://<vault>/<group>/<subgroup>/<entry>/<field>. Segments are percent-decoded. <vault> is a vault id
 * or name; <entry> is an entry UUID (hex, dashed or base64) or a unique title; <field> is a field name
 * (case-insensitive; "username", "password", "url", "notes", "title" map to the standard fields).
 */
import { KpxError } from "../errors.js";
import { kdbxweb, type Kdbx } from "./kdbx.js";
import { fieldText, getUuidString } from "./entries.js";

export interface SecretReference {
  vault: string;
  groupPath: string[];
  entry: string;
  field: string;
}

const SCHEME = "kpx://";

export function parseReference(ref: string): SecretReference {
  if (!ref.startsWith(SCHEME)) throw new KpxError("invalid_reference", `not a kpx:// reference: ${ref}`);
  const parts = ref.slice(SCHEME.length).split("/").map((p) => {
    try {
      return decodeURIComponent(p);
    } catch {
      throw new KpxError("invalid_reference", `bad percent-encoding in ${ref}`);
    }
  });
  if (parts.length < 3 || parts.some((p) => p === "")) {
    throw new KpxError("invalid_reference", `expected kpx://<vault>/<entry>/<field>: ${ref}`);
  }
  return { vault: parts[0]!, groupPath: parts.slice(1, -2), entry: parts[parts.length - 2]!, field: parts[parts.length - 1]! };
}

export const formatReference = (r: SecretReference): string =>
  SCHEME + [r.vault, ...r.groupPath, r.entry, r.field].map((s) => encodeURIComponent(s)).join("/");

/** Finds all references in a template (for `kpx run`/`inject`): kpx://… up to whitespace, quotes or `}`. */
export const REFERENCE_PATTERN = /kpx:\/\/[^\s"'`}]+/g;

const STANDARD: Record<string, string> = { title: "Title", username: "UserName", user: "UserName", password: "Password", url: "URL", notes: "Notes" };

function uuidMatches(entry: kdbxweb.KdbxEntry, id: string): boolean {
  const hex = id.replace(/-/g, "").toLowerCase();
  if (/^[0-9a-f]{32}$/.test(hex)) {
    const bytes = new Uint8Array(entry.uuid.toBytes() ?? []);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("") === hex;
  }
  return getUuidString(entry.uuid) === id;
}

function* entriesUnder(group: kdbxweb.KdbxGroup, recycleBin?: string): Generator<kdbxweb.KdbxEntry> {
  if (recycleBin && group.uuid.toString() === recycleBin) return;
  yield* group.entries;
  for (const g of group.groups) yield* entriesUnder(g, recycleBin);
}

export function findEntry(db: Kdbx, ref: Pick<SecretReference, "groupPath" | "entry">): kdbxweb.KdbxEntry {
  let group = db.getDefaultGroup();
  for (const name of ref.groupPath) {
    const next = group.groups.find((g) => g.name === name);
    if (!next) throw new KpxError("entry_not_found", `group "${ref.groupPath.join("/")}" not found`);
    group = next;
  }
  const rb = db.meta.recycleBinUuid?.toString();
  const all = [...entriesUnder(group, rb)];
  const byId = all.find((e) => uuidMatches(e, ref.entry));
  if (byId) return byId;
  const byTitle = all.filter((e) => fieldText(e.fields.get("Title")) === ref.entry);
  if (byTitle.length === 1) return byTitle[0]!;
  if (byTitle.length > 1) throw new KpxError("entry_not_found", `${byTitle.length} entries are titled "${ref.entry}"; use the entry UUID`);
  throw new KpxError("entry_not_found", `entry "${ref.entry}" not found`);
}

export function resolveFieldName(entry: kdbxweb.KdbxEntry, field: string): string {
  if (entry.fields.has(field)) return field;
  const std = STANDARD[field.toLowerCase()];
  if (std) return std;
  for (const k of entry.fields.keys()) if (k.toLowerCase() === field.toLowerCase()) return k;
  return field;
}

export function readField(db: Kdbx, ref: Pick<SecretReference, "groupPath" | "entry" | "field">): string {
  const entry = findEntry(db, ref);
  const name = resolveFieldName(entry, ref.field);
  if (!entry.fields.has(name)) throw new KpxError("entry_not_found", `field "${ref.field}" not found`);
  return fieldText(entry.fields.get(name));
}

/** Sets a field (creating the entry by title if needed), keeping history. Password and custom fields are protected. */
export function writeField(db: Kdbx, ref: Pick<SecretReference, "groupPath" | "entry" | "field">, value: string, opts: { create?: boolean; protect?: boolean } = {}): kdbxweb.KdbxEntry {
  let entry: kdbxweb.KdbxEntry;
  try {
    entry = findEntry(db, ref);
    entry.pushHistory();
  } catch (e) {
    if (!opts.create || (e as KpxError).code !== "entry_not_found" || /\d+ entries/.test((e as Error).message)) throw e;
    let group = db.getDefaultGroup();
    for (const name of ref.groupPath) group = group.groups.find((g) => g.name === name) ?? db.createGroup(group, name);
    entry = db.createEntry(group);
    entry.fields.set("Title", ref.entry);
  }
  const name = resolveFieldName(entry, ref.field);
  const protect = opts.protect ?? (name === "Password" || !["Title", "UserName", "URL", "Notes"].includes(name));
  entry.fields.set(name, protect ? kdbxweb.ProtectedValue.fromString(value) : value);
  entry.times.update();
  db.cleanup({ historyRules: true });
  return entry;
}

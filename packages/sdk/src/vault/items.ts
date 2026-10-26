/**
 * Whole entries ("items") for the CLI's `ov item` and `ov connect`'s REST API. An item reference is
 * a secret reference without the field: ov://<vault>/[<group>/…]<entry uuid or title>.
 */
import { OpenVireoError } from "../errors.js";
import { kdbxweb, type Kdbx } from "./kdbx.js";
import { fieldText } from "./entries.js";
import { findEntry, resolveFieldName, type SecretReference } from "./reference.js";

export type ItemReference = Omit<SecretReference, "field">;

const SCHEME = "ov://";
const STANDARD_FIELDS = ["Title", "UserName", "Password", "URL", "Notes"];

/** Parses ov://<vault>/[<group>/…]<entry>. */
export function parseItemReference(ref: string): ItemReference {
  if (!ref.startsWith(SCHEME)) throw new OpenVireoError("invalid_reference", `not a ov:// reference: ${ref}`);
  const parts = ref.slice(SCHEME.length).split("/").map((p) => {
    try {
      return decodeURIComponent(p);
    } catch {
      throw new OpenVireoError("invalid_reference", `bad percent-encoding in ${ref}`);
    }
  });
  if (parts.length < 2 || parts.some((p) => p === "")) {
    throw new OpenVireoError("invalid_reference", `expected ov://<vault>/<entry>: ${ref}`);
  }
  return { vault: parts[0]!, groupPath: parts.slice(1, -1), entry: parts[parts.length - 1]! };
}

export interface Item {
  /** entry UUID, 32 lowercase hex digits (as OpenVireo shows it) */
  id: string;
  title: string;
  /** group names from the root group (excluded) down to the entry's group */
  group: string[];
  /** field values; protected ones only with `reveal` */
  fields: Record<string, string>;
  /** names of protected fields */
  protected: string[];
  tags: string[];
  updatedAt?: string;
}

export const entryId = (entry: kdbxweb.KdbxEntry): string =>
  Array.from(new Uint8Array(entry.uuid.toBytes() ?? []), (b) => b.toString(16).padStart(2, "0")).join("");

function groupPathOf(entry: kdbxweb.KdbxEntry): string[] {
  const path: string[] = [];
  for (let g = entry.parentGroup; g?.parentGroup; g = g.parentGroup) path.unshift(g.name ?? "");
  return path;
}

/** An entry as JSON. Protected values are left out unless `reveal` (the names are always listed). */
export function itemOf(entry: kdbxweb.KdbxEntry, opts: { reveal?: boolean; values?: boolean } = {}): Item {
  const fields: Record<string, string> = {};
  const prot: string[] = [];
  for (const [k, v] of entry.fields) {
    const isProtected = v instanceof kdbxweb.ProtectedValue;
    if (isProtected) prot.push(k);
    if (opts.values === false) continue;
    if (!isProtected || opts.reveal) fields[k] = fieldText(v);
  }
  const lm = entry.times.lastModTime;
  return {
    id: entryId(entry),
    title: fieldText(entry.fields.get("Title")),
    group: groupPathOf(entry),
    fields,
    protected: prot,
    tags: [...(entry.tags ?? [])],
    ...(lm ? { updatedAt: new Date(lm).toISOString() } : {}),
  };
}

/** Every entry outside the recycle bin, without field values. */
export function listItems(db: Kdbx): Item[] {
  const rb = db.meta.recycleBinUuid?.toString();
  const out: Item[] = [];
  const walk = (g: kdbxweb.KdbxGroup) => {
    if (rb && g.uuid.toString() === rb) return;
    for (const e of g.entries) out.push(itemOf(e, { values: false }));
    for (const c of g.groups) walk(c);
  };
  walk(db.getDefaultGroup());
  return out;
}

/** Password and custom fields are stored protected; Title, UserName, URL and Notes are not. */
export const isProtectedByDefault = (field: string): boolean => field === "Password" || !STANDARD_FIELDS.includes(field);

/**
 * Sets several fields of one entry, keeping history (`pushHistory` first, like KeePassXC).
 * `create`: create the entry (by title, under its group path) when it's missing; `"only"`: fail if it exists.
 * `protect` overrides which fields are protected (default: `isProtectedByDefault`).
 */
export function setItemFields(
  db: Kdbx,
  ref: Pick<ItemReference, "groupPath" | "entry">,
  fields: Record<string, string>,
  opts: { create?: boolean | "only"; protect?: Record<string, boolean> } = {},
): { entry: kdbxweb.KdbxEntry; created: boolean } {
  let entry: kdbxweb.KdbxEntry | null = null;
  try {
    entry = findEntry(db, ref);
  } catch (e) {
    const ambiguous = /\d+ entries/.test((e as Error).message);
    if (!opts.create || (e as OpenVireoError).code !== "entry_not_found" || ambiguous) throw e;
  }
  const created = !entry;
  if (entry) {
    if (opts.create === "only") throw new OpenVireoError("conflict", `entry "${ref.entry}" already exists`, 409);
    entry.pushHistory();
  } else {
    let group = db.getDefaultGroup();
    for (const name of ref.groupPath) group = group.groups.find((g) => g.name === name) ?? db.createGroup(group, name);
    entry = db.createEntry(group);
    entry.fields.set("Title", ref.entry);
  }
  for (const [field, value] of Object.entries(fields)) {
    const name = resolveFieldName(entry, field);
    const protect = opts.protect?.[field] ?? opts.protect?.[name] ?? isProtectedByDefault(name);
    entry.fields.set(name, protect ? kdbxweb.ProtectedValue.fromString(value) : value);
  }
  entry.times.update();
  db.cleanup({ historyRules: true });
  return { entry, created };
}

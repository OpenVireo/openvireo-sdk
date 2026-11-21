/**
 * Whole entries ("items") for the CLI's `ov item` and `ov connect`'s REST API. An item reference is
 * a secret reference without the field: ov://<vault>/[<group>/…]<entry uuid or title>.
 */
import type { EntryRecord, Vault } from "@openvireo/core-wasm";
import { OpenVireoError } from "../errors.js";
import { fromUtf8, utf8 } from "../util/bytes.js";
import type { SecretReference } from "./reference.js";

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

/** An entry record as an item. Protected values are left out unless `reveal` (the names are always listed). */
export function itemOf(entry: EntryRecord, opts: { reveal?: boolean; values?: boolean } = {}): Item {
  const fields: Record<string, string> = {};
  const prot: string[] = [];
  for (const f of entry.fields) {
    if (f.protected) prot.push(f.name);
    if (opts.values === false) continue;
    if (!f.protected || opts.reveal) fields[f.name] = fromUtf8(f.value);
  }
  const title = entry.fields.find((f) => f.name === "Title");
  return {
    id: entry.id,
    title: title ? fromUtf8(title.value) : "",
    group: [...entry.groupPath],
    fields,
    protected: prot,
    tags: [...entry.tags],
    ...(entry.modifiedAt ? { updatedAt: new Date(entry.modifiedAt * 1000).toISOString() } : {}),
  };
}

/** Every entry outside the recycle bin, without field values. */
export function listItems(vault: Vault): Item[] {
  return vault.entryRecords(false).map((e) => itemOf(e, { values: false }));
}

/** Password and custom fields are stored protected; Title, UserName, URL and Notes are not. */
export const isProtectedByDefault = (field: string): boolean => field === "Password" || !STANDARD_FIELDS.includes(field);

const itemRef = (ref: Pick<ItemReference, "groupPath" | "entry">): string =>
  SCHEME + ["_", ...ref.groupPath, ref.entry].map((s) => encodeURIComponent(s)).join("/");

/**
 * Sets several fields of one entry, keeping history (like KeePassXC). `create`: create the entry (by
 * title, under its group path) when it's missing; `"only"`: fail if it exists. `protect` overrides which
 * fields are protected (default: `isProtectedByDefault`).
 */
export function setItemFields(
  vault: Vault,
  ref: Pick<ItemReference, "groupPath" | "entry">,
  fields: Record<string, string>,
  opts: { create?: boolean | "only"; protect?: Record<string, boolean> } = {},
): { entry: EntryRecord; created: boolean } {
  const inputs = Object.entries(fields).map(([name, value]) => {
    const f: { name: string; value: Uint8Array; protected?: boolean } = { name, value: utf8(value) };
    const p = opts.protect?.[name];
    if (p !== undefined) f.protected = p;
    return f;
  });
  const mode = opts.create === "only" ? "create_only" : opts.create ? "create_if_missing" : "must_exist";
  return vault.setFields(itemRef(ref), inputs, mode);
}

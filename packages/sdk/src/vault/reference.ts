/**
 * Secret references: ov://<vault>/<entry>/<field>, optionally with a group path:
 * ov://<vault>/<group>/<subgroup>/<entry>/<field>. Segments are percent-decoded. <vault> is a vault id
 * or name; <entry> is an entry UUID (hex, dashed or base64) or a unique title; <field> is a field name
 * (case-insensitive; "username", "password", "url", "notes", "title" map to the standard fields).
 */
import type { EntryRecord, Vault } from "@openvireo/core-wasm";
import { OpenVireoError } from "../errors.js";
import { fromUtf8, utf8 } from "../util/bytes.js";

export interface SecretReference {
  vault: string;
  groupPath: string[];
  entry: string;
  field: string;
}

const SCHEME = "ov://";

export function parseReference(ref: string): SecretReference {
  if (!ref.startsWith(SCHEME)) throw new OpenVireoError("invalid_reference", `not a ov:// reference: ${ref}`);
  const parts = ref.slice(SCHEME.length).split("/").map((p) => {
    try {
      return decodeURIComponent(p);
    } catch {
      throw new OpenVireoError("invalid_reference", `bad percent-encoding in ${ref}`);
    }
  });
  if (parts.length < 3 || parts.some((p) => p === "")) {
    throw new OpenVireoError("invalid_reference", `expected ov://<vault>/<entry>/<field>: ${ref}`);
  }
  return { vault: parts[0]!, groupPath: parts.slice(1, -2), entry: parts[parts.length - 2]!, field: parts[parts.length - 1]! };
}

export const formatReference = (r: SecretReference): string =>
  SCHEME + [r.vault, ...r.groupPath, r.entry, r.field].map((s) => encodeURIComponent(s)).join("/");

/** Finds all references in a template (for `ov run`/`inject`): ov://… up to whitespace, quotes or `}`. */
export const REFERENCE_PATTERN = /ov:\/\/[^\s"'`}]+/g;

type Ref = string | Pick<SecretReference, "groupPath" | "entry" | "field">;
const refString = (ref: Ref): string => (typeof ref === "string" ? ref : formatReference({ vault: "_", ...ref }));
const itemRef = (ref: Pick<SecretReference, "groupPath" | "entry">): string =>
  SCHEME + ["_", ...ref.groupPath, ref.entry].map((s) => encodeURIComponent(s)).join("/");

/** The entry a reference names (by UUID or unique title, under its group path, outside the Recycle Bin). */
export function findEntry(vault: Vault, ref: Pick<SecretReference, "groupPath" | "entry">): EntryRecord {
  return vault.find(itemRef(ref));
}

/** A field's value by reference. */
export function readField(vault: Vault, ref: Ref): string {
  return fromUtf8(vault.readField(refString(ref)));
}

/**
 * Sets a field by reference (creating the entry by title with `create`), keeping history, without syncing.
 * Password and custom fields are protected unless `protect` says otherwise.
 */
export function writeField(vault: Vault, ref: Ref, value: string, opts: { create?: boolean; protect?: boolean } = {}): EntryRecord {
  const r = typeof ref === "string" ? parseReference(ref) : ref;
  const field: { name: string; value: Uint8Array; protected?: boolean } = { name: r.field, value: utf8(value) };
  if (opts.protect !== undefined) field.protected = opts.protect;
  return vault.setFields(itemRef(r), [field], opts.create ? "create_if_missing" : "must_exist").entry;
}

const STANDARD: Record<string, string> = { title: "Title", username: "UserName", user: "UserName", password: "Password", url: "URL", notes: "Notes" };

/** The entry's name for `field`: an exact match, a standard alias ("password"), or a case-insensitive match. */
export function resolveFieldName(entry: Pick<EntryRecord, "fields">, field: string): string {
  if (entry.fields.some((f) => f.name === field)) return field;
  const std = STANDARD[field.toLowerCase()];
  if (std) return std;
  return entry.fields.find((f) => f.name.toLowerCase() === field.toLowerCase())?.name ?? field;
}

/**
 * Plain-data views of a `Vault` and simple edits by id, in the shapes the web app uses (`KeePassEntry`,
 * `KeePassGroup`, `EntryData`). Ids are the core's: 32 lowercase hex digits.
 */
import type { EntryInput, EntryRecord, FieldInput, KdbxCredentials, KdbxKdf, Vault } from "@openvireo/core-wasm";
import { fromUtf8, utf8 } from "../util/bytes.js";
import { createLocalVault, openLocalVault, passwordCredentials, saveLocalVault } from "./kdbx.js";

export interface KeePassEntry {
  uuid: string;
  title: string;
  username: string;
  passwordValue: string;
  url: string;
  notes: string;
  groupName: string;
  groupUuid: string;
  tags: string[];
  expiryTime?: Date;
  lastModified?: Date;
  /** Standard KeePass icon number. */
  icon: number;
  /** Custom icon id (e.g. a downloaded favicon), when the entry has one; read it with `customIconPng`. */
  customIcon?: string;
}

export interface KeePassGroup {
  uuid: string;
  name: string;
  parentUuid: string | null;
  icon?: number;
  isRecycleBin?: boolean;
}

export interface EntryData {
  title: string;
  username: string;
  passwordValue: string;
  url: string;
  notes: string;
  tags: string[];
  expiryTime?: Date;
  /** Custom icon id (from `addCustomIconToDb`). */
  customIcon?: string;
}

/** A field's text from an entry record ("" when missing). */
export function fieldText(entry: Pick<EntryRecord, "fields">, name: string): string {
  const f = entry.fields.find((x) => x.name === name);
  return f ? fromUtf8(f.value) : "";
}

/** Every group and entry (Recycle Bin included), as plain data. */
export function collectAllDbData(vault: Vault): { entries: KeePassEntry[]; groups: KeePassGroup[] } {
  const groupInfos = vault.groups();
  const byId = new Map(groupInfos.map((g) => [g.id, g]));
  const root = vault.rootGroupId();
  const groups: KeePassGroup[] = groupInfos.map((g) => ({
    uuid: g.id,
    name: g.name || (g.id === root ? "Root" : ""),
    parentUuid: g.parentId ?? null,
    icon: g.iconId,
    isRecycleBin: g.isRecycleBin,
  }));
  const entries: KeePassEntry[] = vault.entryRecords(true).map((e) => {
    const g = byId.get(e.groupId);
    return {
      uuid: e.id,
      title: fieldText(e, "Title") || "(Untitled Entry)",
      username: fieldText(e, "UserName"),
      passwordValue: fieldText(e, "Password"),
      url: fieldText(e, "URL"),
      notes: fieldText(e, "Notes"),
      groupName: g?.name || "Root",
      groupUuid: e.groupId,
      tags: [...e.tags],
      ...(e.expiresAt !== undefined ? { expiryTime: new Date(e.expiresAt * 1000) } : {}),
      ...(e.modifiedAt ? { lastModified: new Date(e.modifiedAt * 1000) } : {}),
      icon: e.iconId,
      ...(e.customIcon ? { customIcon: e.customIcon } : {}),
    };
  });
  return { entries, groups };
}

/** Opens a password-protected database (and lists it). */
export async function decryptKdbx(fileBuffer: ArrayBuffer | Uint8Array, password: string | KdbxCredentials) {
  const vault = await openLocalVault(fileBuffer, typeof password === "string" ? passwordCredentials(password) : password);
  const { entries, groups } = collectAllDbData(vault);
  return { entries, groups, dbName: vault.name() || "KeePass Database", vault };
}

/** Creates a new password-protected database. */
export async function createNewKdbx(dbName: string, password: string | KdbxCredentials) {
  const vault = await createLocalVault(dbName, typeof password === "string" ? passwordCredentials(password) : password);
  const fileBuffer = await saveLocalVault(vault);
  const { entries, groups } = collectAllDbData(vault);
  return { entries, groups, dbName, fileBuffer, vault };
}

const std = (name: string, value: string, prot = false): FieldInput => ({ name, value: utf8(value), protected: prot });

/** Adds an entry under `groupUuid`; returns its id. */
export function addEntryToDb(vault: Vault, groupUuid: string, data: EntryData): string {
  const input: EntryInput = {
    fields: [std("Title", data.title), std("UserName", data.username), std("Password", data.passwordValue, true), std("URL", data.url), std("Notes", data.notes)],
    removeFields: [],
    tags: data.tags,
    expiry: data.expiryTime ? { kind: "at", at: Math.floor(data.expiryTime.getTime() / 1000) } : { kind: "never" },
  };
  if (data.customIcon) input.customIcon = data.customIcon;
  return vault.addEntry(groupUuid, input);
}

/**
 * Updates an entry; the previous state goes to its history first (as KeePassXC does). `customIcon: null`
 * clears the entry's custom icon.
 */
export function editEntryInDb(
  vault: Vault,
  entryUuid: string,
  data: Partial<Omit<EntryData, "expiryTime" | "customIcon">> & {
    expiryTime?: Date | null;
    customIcon?: string | null;
    fields?: Record<string, string | { value: string; protected: boolean }>;
  },
): void {
  const fields: FieldInput[] = [];
  if (data.title !== undefined) fields.push(std("Title", data.title));
  if (data.username !== undefined) fields.push(std("UserName", data.username));
  if (data.passwordValue !== undefined) fields.push(std("Password", data.passwordValue, true));
  if (data.url !== undefined) fields.push(std("URL", data.url));
  if (data.notes !== undefined) fields.push(std("Notes", data.notes));
  for (const [k, v] of Object.entries(data.fields ?? {})) fields.push(typeof v === "string" ? std(k, v) : std(k, v.value, v.protected));
  const input: EntryInput = {
    fields,
    removeFields: [],
    expiry: data.expiryTime === undefined ? { kind: "keep" } : data.expiryTime === null ? { kind: "never" } : { kind: "at", at: Math.floor(data.expiryTime.getTime() / 1000) },
  };
  if (data.tags !== undefined) input.tags = data.tags;
  if (data.customIcon !== undefined) input.customIcon = data.customIcon;
  vault.editEntry(entryUuid, input);
}

/** Moves an entry to the Recycle Bin, or deletes it for good when it's already there. */
export const deleteEntryFromDb = (vault: Vault, entryUuid: string): void => void vault.deleteEntry(entryUuid);

/** Adds a group; returns its id. */
export const createGroupInDb = (vault: Vault, parentGroupUuid: string, groupName: string): string => vault.addGroup(parentGroupUuid, groupName);

/** Moves a group to the Recycle Bin, or deletes it for good when it's in there. */
export const deleteGroupFromDb = (vault: Vault, groupUuid: string): void => void vault.deleteGroup(groupUuid);

export const emptyRecycleBinInDb = (vault: Vault): void => void vault.emptyRecycleBin();

export const renameGroupInDb = (vault: Vault, groupUuid: string, newName: string): void => void vault.renameGroup(groupUuid, newName);

export const setGroupIconInDb = (vault: Vault, groupUuid: string, icon: number): void => void vault.setGroupIcon(groupUuid, icon);

/** A custom icon's PNG bytes, or `null` when the database has no icon with that id. */
export function customIconPng(vault: Vault, iconId: string): Uint8Array | null {
  try {
    return vault.customIcon(iconId);
  } catch (e) {
    if ((e as { code?: string }).code === "not_found") return null;
    throw e;
  }
}

/** Adds a PNG as a custom icon (an identical one already there is reused); returns its id. */
export const addCustomIconToDb = (vault: Vault, png: Uint8Array): string => vault.addCustomIcon(png);

/**
 * Sets an entry's custom icon (from `addCustomIconToDb`), or clears it with `null` so the standard icon
 * shows again. Like any edit, the previous state goes to the entry's history first.
 */
export function setEntryCustomIconInDb(vault: Vault, entryUuid: string, iconId: string | null): void {
  vault.editEntry(entryUuid, { fields: [], removeFields: [], expiry: { kind: "keep" }, customIcon: iconId });
}

/** Exports the selected groups (and their entries) into a new password-protected database. */
export async function exportSelectedGroupsToKdbx(vault: Vault, selected: string[], password: string, kdf: KdbxKdf = { kind: "databaseDefault" }): Promise<Uint8Array> {
  return vault.exportKdbxWith(passwordCredentials(password), selected, kdf);
}

/**
 * Entry and group helpers moved from openvireo-web/src/lib/keepass-crypto.ts, with the same names and
 * shapes so the web app can switch its imports. Behaviour is unchanged except where noted.
 */
import { kdbxweb, type CredentialsFactory, type Kdbx, openKdbx, passwordCredentials, saveKdbx, initKdbx } from "./kdbx.js";

type KdbxEntry = kdbxweb.KdbxEntry;
type KdbxGroup = kdbxweb.KdbxGroup;

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
}

/** The id string the web app uses (KdbxUuid.toString(), i.e. base64; hex for raw bytes). */
export function getUuidString(uuid: unknown): string {
  if (!uuid) return Math.random().toString(36).substring(2, 11);
  if (typeof uuid === "string") return uuid;
  let bytes: Uint8Array | null = null;
  if (uuid instanceof ArrayBuffer) bytes = new Uint8Array(uuid);
  else if (uuid instanceof Uint8Array) bytes = uuid;
  if (bytes) return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return String((uuid as { toString(): string }).toString());
}

export function fieldText(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val instanceof kdbxweb.ProtectedValue) return val.getText();
  return String(val);
}

function collect(group: KdbxGroup, parentUuid: string | null, groups: KeePassGroup[], entries: KeePassEntry[], rb?: string): void {
  const groupUuid = getUuidString(group.uuid);
  const groupName = group.name || "Root";
  groups.push({ uuid: groupUuid, name: groupName, parentUuid, icon: typeof group.icon === "number" ? group.icon : 4, isRecycleBin: !!rb && groupUuid === rb });
  for (const entry of group.entries) {
    const lm = entry.times.lastModTime;
    entries.push({
      uuid: getUuidString(entry.uuid),
      title: fieldText(entry.fields.get("Title")) || "(Untitled Entry)",
      username: fieldText(entry.fields.get("UserName")),
      passwordValue: fieldText(entry.fields.get("Password")),
      url: fieldText(entry.fields.get("URL")),
      notes: fieldText(entry.fields.get("Notes")),
      groupName,
      groupUuid,
      tags: entry.tags || [],
      expiryTime: entry.times.expires && entry.times.expiryTime ? new Date(entry.times.expiryTime) : undefined,
      lastModified: lm ? new Date(lm) : undefined,
    });
  }
  for (const sub of group.groups) collect(sub, groupUuid, groups, entries, rb);
}

const recycleBinId = (db: Kdbx) => (db.meta.recycleBinUuid ? db.meta.recycleBinUuid.toString() : undefined);

export function collectAllDbData(db: Kdbx): { entries: KeePassEntry[]; groups: KeePassGroup[] } {
  const entries: KeePassEntry[] = [];
  const groups: KeePassGroup[] = [];
  collect(db.getDefaultGroup(), null, groups, entries, recycleBinId(db));
  return { entries, groups };
}

export function findGroupInKdbx(group: KdbxGroup | undefined, id: string): KdbxGroup | null {
  if (!group) return null;
  if (getUuidString(group.uuid) === id) return group;
  for (const g of group.groups) {
    const f = findGroupInKdbx(g, id);
    if (f) return f;
  }
  return null;
}

export function findEntryInKdbx(group: KdbxGroup | undefined, id: string): KdbxEntry | null {
  if (!group) return null;
  for (const e of group.entries) if (getUuidString(e.uuid) === id) return e;
  for (const g of group.groups) {
    const f = findEntryInKdbx(g, id);
    if (f) return f;
  }
  return null;
}

/** Opens a password-protected database (was `decryptKdbx`). */
export async function decryptKdbx(fileBuffer: ArrayBuffer | Uint8Array, password: string | CredentialsFactory) {
  const db = await openKdbx(fileBuffer, typeof password === "string" ? passwordCredentials(password) : password);
  const { entries, groups } = collectAllDbData(db);
  return { entries, groups, dbName: db.getDefaultGroup().name || "KeePass Database", dbInstance: db };
}

export async function createNewKdbx(dbName: string, password: string | CredentialsFactory) {
  initKdbx();
  const creds = typeof password === "string" ? passwordCredentials(password)() : password();
  const db = kdbxweb.Kdbx.create(creds, dbName);
  const fileBuffer = (await saveKdbx(db)).buffer as ArrayBuffer;
  const root = db.getDefaultGroup();
  return { entries: [] as KeePassEntry[], groups: [{ uuid: getUuidString(root.uuid), name: dbName, parentUuid: null, icon: 4 }] as KeePassGroup[], dbName, fileBuffer, dbInstance: db };
}

export async function addEntryToDb(db: Kdbx, groupUuid: string, data: EntryData): Promise<KdbxEntry> {
  const group = findGroupInKdbx(db.getDefaultGroup(), groupUuid);
  if (!group) throw new Error("Target group not found");
  const entry = db.createEntry(group);
  entry.fields.set("Title", data.title);
  entry.fields.set("UserName", data.username);
  entry.fields.set("Password", kdbxweb.ProtectedValue.fromString(data.passwordValue));
  entry.fields.set("URL", data.url);
  entry.fields.set("Notes", data.notes);
  entry.tags = data.tags;
  entry.times.expires = !!data.expiryTime;
  if (data.expiryTime) entry.times.expiryTime = data.expiryTime;
  return entry;
}

/**
 * Updates an entry. Unlike the web app's original, it pushes the previous state to the entry's history
 * first (as KeePassXC does), so the three-way merge and history keep working.
 */
export async function editEntryInDb(
  db: Kdbx,
  entryUuid: string,
  data: Partial<Omit<EntryData, "expiryTime">> & { expiryTime?: Date | null; fields?: Record<string, string | { value: string; protected: boolean }> },
): Promise<KdbxEntry> {
  const entry = findEntryInKdbx(db.getDefaultGroup(), entryUuid);
  if (!entry) throw new Error("Entry not found");
  entry.pushHistory();
  if (data.title !== undefined) entry.fields.set("Title", data.title);
  if (data.username !== undefined) entry.fields.set("UserName", data.username);
  if (data.passwordValue !== undefined) entry.fields.set("Password", kdbxweb.ProtectedValue.fromString(data.passwordValue));
  if (data.url !== undefined) entry.fields.set("URL", data.url);
  if (data.notes !== undefined) entry.fields.set("Notes", data.notes);
  for (const [k, v] of Object.entries(data.fields ?? {})) {
    entry.fields.set(k, typeof v === "string" ? v : v.protected ? kdbxweb.ProtectedValue.fromString(v.value) : v.value);
  }
  if (data.tags !== undefined) entry.tags = data.tags;
  if (data.expiryTime !== undefined) {
    entry.times.expires = data.expiryTime !== null;
    if (data.expiryTime) entry.times.expiryTime = data.expiryTime;
  }
  entry.times.update();
  db.cleanup({ historyRules: true });
  return entry;
}

function isInsideRecycleBin(group: KdbxGroup | undefined, rb: string | undefined): boolean {
  for (let g = group; rb && g; g = g.parentGroup) if (g.uuid.toString() === rb) return true;
  return false;
}

export async function deleteEntryFromDb(db: Kdbx, entryUuid: string): Promise<void> {
  const entry = findEntryInKdbx(db.getDefaultGroup(), entryUuid);
  if (!entry) throw new Error("Entry not found");
  if (isInsideRecycleBin(entry.parentGroup, recycleBinId(db)) && entry.parentGroup) {
    const i = entry.parentGroup.entries.indexOf(entry);
    if (i >= 0) entry.parentGroup.entries.splice(i, 1);
  } else {
    db.remove(entry);
  }
}

export async function createGroupInDb(db: Kdbx, parentGroupUuid: string, groupName: string): Promise<KdbxGroup> {
  const parent = findGroupInKdbx(db.getDefaultGroup(), parentGroupUuid);
  if (!parent) throw new Error("Parent group not found");
  return db.createGroup(parent, groupName);
}

export async function deleteGroupFromDb(db: Kdbx, groupUuid: string): Promise<void> {
  const root = db.getDefaultGroup();
  const group = findGroupInKdbx(root, groupUuid);
  if (!group) throw new Error("Group not found");
  if (group === root) throw new Error("Cannot delete root group");
  if (isInsideRecycleBin(group.parentGroup, recycleBinId(db)) && group.parentGroup) {
    const i = group.parentGroup.groups.indexOf(group);
    if (i >= 0) group.parentGroup.groups.splice(i, 1);
  } else {
    db.remove(group);
  }
}

export async function emptyRecycleBinInDb(db: Kdbx): Promise<void> {
  const rb = recycleBinId(db);
  if (!rb) throw new Error("No Recycle Bin configured in this database.");
  const bin = findGroupInKdbx(db.getDefaultGroup(), rb);
  if (!bin) throw new Error("Recycle Bin group not found.");
  bin.entries.splice(0, bin.entries.length);
  bin.groups.splice(0, bin.groups.length);
}

export async function renameGroupInDb(db: Kdbx, groupUuid: string, newName: string): Promise<void> {
  const g = findGroupInKdbx(db.getDefaultGroup(), groupUuid);
  if (!g) throw new Error("Group not found");
  g.name = newName;
  g.times.update();
}

export async function setGroupIconInDb(db: Kdbx, groupUuid: string, icon: number): Promise<void> {
  const g = findGroupInKdbx(db.getDefaultGroup(), groupUuid);
  if (!g) throw new Error("Group not found");
  g.icon = icon;
  g.times.update();
}

/** Exports selected groups (and their entries) into a new password-protected database. */
export async function exportSelectedGroupsToKdbx(original: Kdbx, selected: string[], password: string): Promise<ArrayBuffer> {
  initKdbx();
  const root = original.getDefaultGroup();
  const out = kdbxweb.Kdbx.create(passwordCredentials(password)(), root.name || "Exported DB");
  const hasSelected = (g: KdbxGroup): boolean => selected.includes(getUuidString(g.uuid)) || g.groups.some(hasSelected);
  const copy = (src: KdbxGroup, dst: KdbxGroup) => {
    if (selected.includes(getUuidString(src.uuid))) {
      for (const e of src.entries) {
        const d = out.createEntry(dst);
        for (const [k, v] of e.fields) d.fields.set(k, v instanceof kdbxweb.ProtectedValue ? v.clone() : v);
        d.tags = [...e.tags];
        d.times.expires = e.times.expires;
        d.times.expiryTime = e.times.expiryTime;
      }
    }
    for (const sub of src.groups) {
      if (hasSelected(sub)) {
        const d = out.createGroup(dst, sub.name || "Folder");
        d.icon = sub.icon;
        copy(sub, d);
      }
    }
  };
  copy(root, out.getDefaultGroup());
  return (await saveKdbx(out)).buffer as ArrayBuffer;
}

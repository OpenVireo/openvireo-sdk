import { createVaultKdbx, kdbxweb, openKdbx, saveKdbx, vaultCredentials, type Kdbx } from "../../src/vault/kdbx.js";
import { fieldText } from "../../src/vault/entries.js";

export const KEY = new Uint8Array(32).fill(7);
export const at = (s: number) => new Date(s * 1000);

/** A base database built by `build`, plus local/remote/base copies opened from the same bytes. */
export async function threeCopies(build: (db: Kdbx) => void | Promise<void>) {
  const db = createVaultKdbx("Vault", KEY);
  await build(db);
  const bytes = await saveKdbx(db);
  const open = () => openKdbx(bytes, vaultCredentials(KEY));
  return { bytes, local: await open(), remote: await open(), base: await open() };
}

export function addEntry(db: Kdbx, title: string, fields: Record<string, string> = {}, time = 100, group = db.getDefaultGroup()) {
  const e = db.createEntry(group);
  e.fields.set("Title", title);
  for (const [k, v] of Object.entries(fields)) e.fields.set(k, k === "Password" ? kdbxweb.ProtectedValue.fromString(v) : v);
  e.times.creationTime = at(time);
  e.times.lastModTime = at(time);
  e.times.locationChanged = at(time);
  return e;
}

export function byTitle(db: Kdbx, title: string) {
  const find = (g: kdbxweb.KdbxGroup): kdbxweb.KdbxEntry | undefined =>
    g.entries.find((e) => fieldText(e.fields.get("Title")) === title) ?? g.groups.map(find).find(Boolean);
  return find(db.getDefaultGroup());
}

/** Edits like a client: history first, then fields, then the modification time (seconds, or exact ms). */
export function edit(db: Kdbx, title: string, fields: Record<string, string>, time: number) {
  const e = byTitle(db, title)!;
  e.pushHistory();
  for (const [k, v] of Object.entries(fields)) e.fields.set(k, k === "Password" ? kdbxweb.ProtectedValue.fromString(v) : v);
  e.times.lastModTime = new Date(time * 1000);
  return e;
}

export const get = (db: Kdbx, title: string, field: string) => fieldText(byTitle(db, title)?.fields.get(field));

/** Comparable content of a database: groups, entries and fields (not history or times). */
export function content(db: Kdbx) {
  const out: string[] = [];
  const walk = (g: kdbxweb.KdbxGroup, path: string) => {
    for (const e of g.entries) {
      const f = [...e.fields].map(([k, v]) => `${k}=${fieldText(v)}`).sort().join(";");
      out.push(`${path}/${fieldText(e.fields.get("Title"))} {${f}} bins=${[...e.binaries.keys()].sort().join(",")}`);
    }
    for (const c of g.groups) walk(c, `${path}/${c.name}`);
  };
  walk(db.getDefaultGroup(), "");
  return out.sort();
}

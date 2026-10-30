/** Importing a .kdbx into an open database: importInto (UUID merge) and importAsCopies (fresh UUIDs). */
import { describe, expect, it } from "vitest";
import { importAsCopies, importInto, importTargets } from "../src/merge/index.js";
import { fieldText } from "../src/vault/entries.js";
import { createVaultKdbx, kdbxweb, openKdbx, passwordCredentials, saveKdbx, type Kdbx } from "../src/vault/kdbx.js";
import { KEY, addEntry, at, byTitle, content, edit, get } from "./helpers/dbs.js";

/** A password-protected "file" with a recycle bin, custom data, an attachment, a custom icon and a reference. */
async function sourceFile() {
  const db = kdbxweb.Kdbx.create(passwordCredentials("file password")(), "Home");
  const root = db.getDefaultGroup();
  const web = db.createGroup(root, "Web");
  const a = addEntry(db, "Mail", { UserName: "me", Password: "mail-pw" }, 100, web);
  a.binaries.set("note.txt", await db.createBinary(kdbxweb.ProtectedValue.fromString("hello")));
  const icon = kdbxweb.KdbxUuid.random();
  db.meta.customIcons.set(icon.id, { data: new Uint8Array([1, 2, 3]).buffer, lastModified: at(100) });
  a.customIcon = icon;
  addEntry(db, "Mail alias", { UserName: `{REF:U@I:${hex(a.uuid)}}`, Password: `{REF:P@I:${hex(a.uuid)}}` }, 100, web);
  db.createRecycleBin();
  const binned = addEntry(db, "Old", { Password: "gone" }, 100);
  db.move(binned, db.getGroup(db.meta.recycleBinUuid!)!);
  db.meta.customData.set("KPXC_REMOTE_SYNC_SETTINGS", { value: "[{\"type\":\"syncServer\"}]" });
  db.meta.customData.set("KPXC_BROWSER_key", { value: "secret" });
  // Round-trip, as a real file would be read
  return openKdbx(await saveKdbx(db), passwordCredentials("file password"));
}

const hex = (u: kdbxweb.KdbxUuid) =>
  Array.from(new Uint8Array(u.toBytes()!), (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();

function vault(): Kdbx {
  const db = createVaultKdbx("Work", KEY);
  addEntry(db, "Existing", { Password: "x" });
  return db;
}

const titles = (g: kdbxweb.KdbxGroup): string[] => g.entries.map((e) => fieldText(e.fields.get("Title")));

describe("importInto", () => {
  it("adds the file's entries and groups, keeps the vault's root, skips the recycle bin and custom data", async () => {
    const src = await sourceFile();
    const target = vault();
    const r = importInto(src, target);
    expect([r.added, r.updated, r.unchanged, r.groupsAdded]).toEqual([2, 0, 0, 1]);
    const root = target.getDefaultGroup();
    expect(root.name).toBe("Work");
    // The vault's own recycle bin, and the file's "Web"; not the file's recycle bin
    expect(root.groups.map((g) => g.name)).toEqual(["Recycle Bin", "Web"]);
    expect(titles(root.groups[1]!)).toEqual(["Mail", "Mail alias"]);
    expect(byTitle(target, "Old")).toBeUndefined();
    expect(target.meta.customData.has("KPXC_REMOTE_SYNC_SETTINGS")).toBe(false);
    expect(target.meta.customData.has("KPXC_BROWSER_key")).toBe(false);
    const mail = byTitle(target, "Mail")!;
    expect(target.meta.customIcons.has(mail.customIcon!.id)).toBe(true);
    expect(mail.binaries.has("note.txt")).toBe(true);
    // The target still saves and reopens
    const reopened = await openKdbx(await saveKdbx(target), target.credentials);
    expect(content(reopened)).toEqual(content(target));
  });

  it("reads a KDBX 3.1 file too", async () => {
    const old = kdbxweb.Kdbx.create(passwordCredentials("pw")(), "Old format");
    old.setVersion(3);
    addEntry(old, "Legacy", { Password: "p" });
    const src = await openKdbx(await saveKdbx(old), passwordCredentials("pw"));
    expect(src.header.versionMajor).toBe(3);
    const target = vault();
    expect(importInto(src, target).added).toBe(1);
    expect(get(target, "Legacy", "Password")).toBe("p");
  });

  it("importing the same file twice changes nothing", async () => {
    const src = await sourceFile();
    const target = vault();
    importInto(src, target);
    const before = content(target);
    const again = importInto(src, target);
    expect([again.added, again.updated, again.unchanged]).toEqual([0, 0, 2]);
    expect(again.changes).toEqual([]);
    expect(content(target)).toEqual(before);
  });

  it("a newer entry in the file wins and the vault's version goes into history; an older one only adds history", async () => {
    const src = await sourceFile();
    const target = vault();
    importInto(src, target);
    edit(src, "Mail", { Password: "newer-in-file" }, 300);
    edit(target, "Mail alias", { UserName: "edited-in-vault" }, 400);
    const r = importInto(src, target);
    expect(get(target, "Mail", "Password")).toBe("newer-in-file");
    expect(byTitle(target, "Mail")!.history.some((h) => fieldText(h.fields.get("Password")) === "mail-pw")).toBe(true);
    expect(get(target, "Mail alias", "UserName")).toBe("edited-in-vault");
    expect(r.added).toBe(0);
    expect(r.updated).toBe(1);
  });

  it("never deletes from the target", async () => {
    const src = await sourceFile();
    const target = vault();
    importInto(src, target);
    const mail = byTitle(src, "Mail")!;
    src.remove(mail);
    importInto(src, target);
    expect(byTitle(target, "Mail")).toBeDefined();
    expect(byTitle(target, "Existing")).toBeDefined();
  });
});

describe("importAsCopies", () => {
  it("copies the tree under the chosen group with fresh UUIDs and remapped references", async () => {
    const src = await sourceFile();
    const target = vault();
    const parent = target.createGroup(target.getDefaultGroup(), "Imports");
    const r = importAsCopies(src, target, parent.uuid.id);
    expect([r.added, r.groupsAdded]).toEqual([2, 2]);
    const top = parent.groups[0]!;
    expect(top.name).toBe("Home");
    expect(top.groups.map((g) => g.name)).toEqual(["Web"]);
    expect(byTitle(target, "Old")).toBeUndefined();
    const srcMail = byTitle(src, "Mail")!;
    const mail = byTitle(target, "Mail")!;
    expect(mail.uuid.id).not.toBe(srcMail.uuid.id);
    expect(top.uuid.id).not.toBe(src.getDefaultGroup().uuid.id);
    expect(get(target, "Mail alias", "Password")).toBe(`{REF:P@I:${hex(mail.uuid)}}`);
    expect(mail.binaries.has("note.txt")).toBe(true);
    expect(target.meta.customIcons.has(mail.customIcon!.id)).toBe(true);
    expect(target.meta.customData.has("KPXC_REMOTE_SYNC_SETTINGS")).toBe(false);
  });

  it("history items take the copy's UUID, and importing twice gives two copies", async () => {
    const src = await sourceFile();
    edit(src, "Mail", { Password: "v2" }, 200);
    const target = vault();
    const root = target.getDefaultGroup().uuid.id;
    importAsCopies(src, target, root);
    importAsCopies(src, target, root);
    const homes = target.getDefaultGroup().groups.filter((g) => g.name === "Home");
    expect(homes).toHaveLength(2);
    const mail = homes[0]!.groups[0]!.entries[0]!;
    expect(mail.history.length).toBeGreaterThan(0);
    expect(mail.history.every((h) => h.uuid.id === mail.uuid.id)).toBe(true);
    expect(homes[1]!.groups[0]!.entries[0]!.uuid.id).not.toBe(mail.uuid.id);
  });

  it("fails cleanly when the group is gone", async () => {
    await expect(async () => importAsCopies(await sourceFile(), vault(), kdbxweb.KdbxUuid.random().id)).rejects.toThrow(/no longer exists/);
  });
});

describe("importTargets", () => {
  it("lists the groups with paths, root first, without the recycle bin", async () => {
    const src = await sourceFile();
    expect(importTargets(src).map((t) => t.path)).toEqual(["Home", "Home / Web"]);
  });
});

/** Importing a .kdbx into an open vault: importInto (UUID merge) and importAsCopies (fresh UUIDs), on the core. */
import { describe, expect, it } from "vitest";
import type { Vault } from "@openvireo/core-wasm";
import { importAsCopies, importInto, importTargets } from "../src/merge/index.js";
import { fieldText } from "../src/vault/entries.js";
import { passwordCredentials } from "../src/vault/kdbx.js";
import { addEntry, byTitle, content, edit, get, newLocal, openLocal, setNow } from "./helpers/dbs.js";

const creds = passwordCredentials("file password");

/** A password-protected "file" with a recycle bin, custom data, an attachment, a custom icon and a reference. */
async function sourceFile(): Promise<Vault> {
  const v = await newLocal("Home", creds);
  setNow(100);
  const web = v.addGroup(v.rootGroupId(), "Web");
  const icon = v.addCustomIcon(new Uint8Array([137, 80, 78, 71, 1, 2, 3]));
  const enc = (t: string) => new TextEncoder().encode(t);
  const a = v.addEntry(web, { fields: [{ name: "Title", value: enc("Mail") }, { name: "UserName", value: enc("me") }, { name: "Password", value: enc("mail-pw"), protected: true }], removeFields: [], expiry: { kind: "never" }, customIcon: icon });
  v.setAttachmentWith(a, "note.txt", enc("hello"), true);
  addEntry(v, "Mail alias", { UserName: `{REF:U@I:${a.toUpperCase()}}`, Password: `{REF:P@I:${a.toUpperCase()}}` }, 100, web);
  const old = addEntry(v, "Old", { Password: "gone" }, 100);
  v.deleteEntry(old);
  v.setMetaCustomData("KPXC_REMOTE_SYNC_SETTINGS", '[{"type":"syncServer"}]');
  v.setMetaCustomData("KPXC_BROWSER_key", "secret");
  // Round-trip, as a real file would be read
  return openLocal(await v.saveLocal(), creds);
}

async function vault(): Promise<Vault> {
  const v = await newLocal("Work", passwordCredentials("vault"));
  addEntry(v, "Existing", { Password: "x" });
  return v;
}

const childGroups = (v: Vault, parent: string) => v.groups().filter((g) => g.parentId === parent);
const titlesIn = (v: Vault, groupId: string) => v.entryRecords(true).filter((e) => e.groupId === groupId).map((e) => fieldText(e, "Title")).sort();

describe("importInto", () => {
  it("adds the file's entries and groups, keeps the vault's root, skips the recycle bin and custom data", async () => {
    const src = await sourceFile();
    const target = await vault();
    const r = importInto(src, target);
    expect([r.added, r.updated, r.unchanged, r.groupsAdded]).toEqual([2, 0, 0, 1]);
    expect(target.name()).toBe("Work");
    // The vault's own recycle bin, and the file's "Web"; not the file's recycle bin
    const top = childGroups(target, target.rootGroupId());
    // a new vault gets its Recycle Bin on the first delete; the file's bin isn't imported
    expect(top.map((g) => g.name).sort()).toEqual(["Web"]);
    expect(titlesIn(target, top.find((g) => g.name === "Web")!.id)).toEqual(["Mail", "Mail alias"]);
    expect(byTitle(target, "Old")).toBeUndefined();
    expect(target.metaCustomData("KPXC_REMOTE_SYNC_SETTINGS")).toBeUndefined();
    expect(target.metaCustomData("KPXC_BROWSER_key")).toBeUndefined();
    const mail = byTitle(target, "Mail")!;
    expect(target.customIcon(mail.customIcon!)).toEqual(new Uint8Array([137, 80, 78, 71, 1, 2, 3]));
    expect(mail.attachments.map((x) => x.name)).toEqual(["note.txt"]);
    // The target still saves and reopens
    const reopened = await openLocal(await target.saveLocal(), passwordCredentials("vault"));
    expect(content(reopened)).toEqual(content(target));
  });

  it("importing the same file twice changes nothing", async () => {
    const src = await sourceFile();
    const target = await vault();
    importInto(src, target);
    const before = content(target);
    const again = importInto(src, target);
    expect([again.added, again.updated, again.unchanged]).toEqual([0, 0, 2]);
    expect(again.changes).toEqual([]);
    expect(content(target)).toEqual(before);
  });

  it("a newer entry in the file wins and the vault's version goes into history; an older one only adds history", async () => {
    const src = await sourceFile();
    const target = await vault();
    importInto(src, target);
    edit(src, "Mail", { Password: "newer-in-file" }, 300);
    edit(target, "Mail alias", { UserName: "edited-in-vault" }, 400);
    const r = importInto(src, target);
    expect(get(target, "Mail", "Password")).toBe("newer-in-file");
    expect(target.history(byTitle(target, "Mail")!.id).some((h) => fieldText(h, "Password") === "mail-pw")).toBe(true);
    expect(get(target, "Mail alias", "UserName")).toBe("edited-in-vault");
    expect(r.added).toBe(0);
    expect(r.updated).toBe(1);
  });

  it("never deletes from the target", async () => {
    const src = await sourceFile();
    const target = await vault();
    importInto(src, target);
    const id = byTitle(src, "Mail")!.id;
    src.deleteEntry(id);
    src.deleteEntry(id);
    importInto(src, target);
    expect(byTitle(target, "Mail")).toBeDefined();
    expect(byTitle(target, "Existing")).toBeDefined();
  });
});

describe("importAsCopies", () => {
  it("copies the tree under the chosen group with fresh UUIDs and remapped references", async () => {
    const src = await sourceFile();
    const target = await vault();
    const parent = target.addGroup(target.rootGroupId(), "Imports");
    const r = importAsCopies(src, target, parent);
    expect([r.added, r.groupsAdded]).toEqual([2, 2]);
    const top = childGroups(target, parent)[0]!;
    expect(top.name).toBe("Home");
    expect(childGroups(target, top.id).map((g) => g.name)).toEqual(["Web"]);
    expect(byTitle(target, "Old")).toBeUndefined();
    const mail = byTitle(target, "Mail")!;
    expect(mail.id).not.toBe(byTitle(src, "Mail")!.id);
    expect(top.id).not.toBe(src.rootGroupId());
    expect(get(target, "Mail alias", "Password")).toBe(`{REF:P@I:${mail.id.toUpperCase()}}`);
    expect(mail.attachments.map((x) => x.name)).toEqual(["note.txt"]);
    expect(mail.customIcon).toBeDefined();
    expect(target.metaCustomData("KPXC_REMOTE_SYNC_SETTINGS")).toBeUndefined();
  });

  it("history items come along, and importing twice gives two copies", async () => {
    const src = await sourceFile();
    edit(src, "Mail", { Password: "v2" }, 200);
    const target = await vault();
    importAsCopies(src, target, target.rootGroupId());
    importAsCopies(src, target, target.rootGroupId());
    const homes = childGroups(target, target.rootGroupId()).filter((g) => g.name === "Home");
    expect(homes).toHaveLength(2);
    const mails = target.entryRecords(false).filter((e) => fieldText(e, "Title") === "Mail");
    expect(mails).toHaveLength(2);
    expect(target.history(mails[0]!.id).length).toBeGreaterThan(0);
    expect(mails[0]!.id).not.toBe(mails[1]!.id);
  });

  it("fails cleanly when the group is gone", async () => {
    const src = await sourceFile();
    const target = await vault();
    expect(() => importAsCopies(src, target, "00000000000000000000000000000001")).toThrow();
  });
});

describe("importTargets", () => {
  it("lists the groups with paths, root first, without the recycle bin", async () => {
    const src = await sourceFile();
    expect(importTargets(src).map((t) => t.path)).toEqual(["Home", "Home / Web"]);
  });
});

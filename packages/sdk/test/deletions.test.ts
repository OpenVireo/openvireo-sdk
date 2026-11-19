/**
 * Sync deletions decided against the common base, not by clocks (SyncEngine applyDeletions), through the
 * core's merge. Deletion times come from the test clock (`setNow`).
 */
import { describe, expect, it } from "vitest";
import type { Vault } from "@openvireo/core-wasm";
import { needsCommonBase, snapshotOf } from "../src/merge/index.js";
import { deleteEntryFromDb, deleteGroupFromDb, emptyRecycleBinInDb } from "../src/vault/entries.js";
import { openKdbx } from "../src/vault/kdbx.js";
import { KEY, addEntry, byTitle, edit, merge, setNow, threeCopies } from "./helpers/dbs.js";

const NOW = 1000;
const bin = (v: Vault) => v.groups().find((g) => g.isRecycleBin)!;
const group = (v: Vault, name: string) => v.groups().find((g) => g.name === name);
const inBin = (v: Vault, title: string) => v.isInRecycleBin(byTitle(v, title)!.id);
const kdbx = async (v: Vault) => openKdbx(await v.saveLocal(), { vaultKey: KEY });

/** A vault with "Work" (holding "In Work") and "Loose" both in the Recycle Bin, and "Kept" outside it. */
const binned = () =>
  threeCopies((v) => {
    setNow(100);
    const work = v.addGroup(v.rootGroupId(), "Work");
    addEntry(v, "In Work", {}, 100, work);
    addEntry(v, "Loose");
    addEntry(v, "Kept");
    v.deleteGroup(work);
    v.deleteEntry(byTitle(v, "Loose")!.id);
  });

/** Deletes an entry for good: into the Recycle Bin, then out of it. */
const destroy = (v: Vault, title: string, time: number) => {
  setNow(time);
  const id = byTitle(v, title)!.id;
  if (!v.isInRecycleBin(id)) v.deleteEntry(id);
  v.deleteEntry(id);
};

describe("deleting for good", () => {
  it("a group or entry in the Recycle Bin, and emptying it", async () => {
    let { local } = await binned();
    deleteGroupFromDb(local, group(local, "Work")!.id);
    deleteEntryFromDb(local, byTitle(local, "Loose")!.id);
    expect(bin(local).entryCount).toBe(0);
    expect(local.groups().filter((g) => g.parentId === bin(local).id)).toEqual([]);
    expect(byTitle(local, "In Work")).toBeUndefined();

    ({ local } = await binned());
    emptyRecycleBinInDb(local);
    expect([byTitle(local, "Loose"), byTitle(local, "In Work"), group(local, "Work")]).toEqual([undefined, undefined, undefined]);
    expect(byTitle(local, "Kept")).toBeDefined();
  });
});

describe("the merge applies deletions against the base", () => {
  it("a group deleted from the Recycle Bin stays deleted on both sides", async () => {
    const { local, remote, base } = await binned();
    setNow(500);
    deleteGroupFromDb(local, group(local, "Work")!.id);
    deleteEntryFromDb(local, byTitle(local, "Loose")!.id);
    expect(needsCommonBase(await kdbx(local), await kdbx(remote), snapshotOf(await kdbx(base)))).toBe(true);
    const r = await merge(local, remote, base, NOW);
    for (const v of [r.local, r.remote]) {
      expect(group(v, "Work")).toBeUndefined();
      expect(byTitle(v, "In Work")).toBeUndefined();
      expect(byTitle(v, "Loose")).toBeUndefined();
      expect(byTitle(v, "Kept")).toBeDefined();
    }
    expect(r.report.remoteChanged).toBe(true);
  });

  it("deletions made on the server copy are applied locally", async () => {
    const { local, remote, base } = await binned();
    setNow(500);
    emptyRecycleBinInDb(remote);
    const r = await merge(local, remote, base, NOW);
    expect(group(r.local, "Work")).toBeUndefined();
    expect(byTitle(r.local, "Loose")).toBeUndefined();
    expect(r.report.localChanged).toBe(true);
  });

  it("an entry edited on the other side is kept, whatever the clocks say", async () => {
    const { local, remote, base } = await binned();
    // The deleting device's clock is far ahead: its deletion looks newer than the edit
    destroy(remote, "Kept", 1e9);
    edit(local, "Kept", { Notes: "edited" }, 500);
    const r = await merge(local, remote, base, NOW);
    for (const v of [r.local, r.remote]) expect(byTitle(v, "Kept") && v.readField("ov://_/Kept/Notes")).toEqual(new TextEncoder().encode("edited"));
  });

  it("a deletion is applied even when the deleting device's clock is behind", async () => {
    const { local, remote, base } = await binned();
    destroy(local, "Kept", 1); // before the entry was last changed
    const r = await merge(local, remote, base, NOW);
    expect(byTitle(r.remote, "Kept")).toBeUndefined();
    expect(byTitle(r.local, "Kept")).toBeUndefined();
  });

  it("an entry moved on the other side is kept", async () => {
    const { local, remote, base } = await binned();
    destroy(local, "Kept", 500);
    setNow(600);
    remote.moveEntry(byTitle(remote, "Kept")!.id, group(remote, "Work")!.id);
    const r = await merge(local, remote, base, NOW);
    expect(byTitle(r.local, "Kept")).toBeDefined();
  });

  it("a group that gained an entry on the other side is kept with it; the deleted entries go", async () => {
    const { local, remote, base } = await binned();
    setNow(500);
    deleteGroupFromDb(local, group(local, "Work")!.id);
    addEntry(remote, "New in Work", {}, 600, group(remote, "Work")!.id);
    const r = await merge(local, remote, base, NOW);
    for (const v of [r.local, r.remote]) {
      expect(group(v, "Work")).toBeDefined();
      expect(byTitle(v, "New in Work")).toBeDefined();
      expect(byTitle(v, "In Work")).toBeUndefined();
    }
  });

  it("a renamed group is kept", async () => {
    const { local, remote, base } = await binned();
    setNow(500);
    deleteGroupFromDb(local, group(local, "Work")!.id);
    setNow(600);
    remote.renameGroup(group(remote, "Work")!.id, "Work 2");
    const r = await merge(local, remote, base, NOW);
    expect(group(r.local, "Work 2")).toBeDefined();
  });

  it("without a base nothing is deleted, and an item that came back isn't deleted by its old record", async () => {
    const { local, remote, base } = await binned();
    setNow(500);
    deleteEntryFromDb(local, byTitle(local, "Loose")!.id);
    const first = await merge(local, remote, null, NOW);
    expect(byTitle(first.local, "Loose")).toBeDefined();
    expect(needsCommonBase(await kdbx(first.local), await kdbx(first.remote), snapshotOf(await kdbx(base)))).toBe(false);
    const again = await merge(first.local, first.remote, base, NOW);
    expect(byTitle(again.local, "Loose")).toBeDefined();
  });

  it("a group emptied by moving its entries out, then deleted, goes", async () => {
    const { local, remote, base } = await binned();
    setNow(900);
    local.moveEntry(byTitle(local, "In Work")!.id, local.rootGroupId());
    deleteGroupFromDb(local, group(local, "Work")!.id);
    const r = await merge(local, remote, base, NOW);
    for (const v of [r.local, r.remote]) {
      expect(group(v, "Work")).toBeUndefined();
      expect(byTitle(v, "In Work")?.groupId).toBe(v.rootGroupId());
    }
  });

  it("entries in the Recycle Bin stay there after a merge", async () => {
    const { local, remote, base } = await binned();
    edit(remote, "Kept", { Notes: "n" }, 500);
    const r = await merge(local, remote, base, NOW);
    expect(inBin(r.local, "Loose")).toBe(true);
    expect(inBin(r.local, "Kept")).toBe(false);
  });
});

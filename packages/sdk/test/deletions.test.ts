/** Sync deletions decided against the common base, not by clocks (SyncEngine applyDeletions). */
import { describe, expect, it } from "vitest";
import { mergeDatabases, needsCommonBase, snapshotOf } from "../src/merge/index.js";
import { deleteEntryFromDb, deleteGroupFromDb, emptyRecycleBinInDb } from "../src/vault/entries.js";
import type { Kdbx } from "../src/vault/kdbx.js";
import { addEntry, at, byTitle, edit, threeCopies } from "./helpers/dbs.js";

const now = () => at(1000);
const bin = (db: Kdbx) => db.getGroup(db.meta.recycleBinUuid!)!;
const group = (db: Kdbx, name: string) => {
  const find = (g: Kdbx["groups"][number]): typeof g | undefined => (g.name === name ? g : g.groups.map(find).find(Boolean));
  return find(db.getDefaultGroup());
};
const ids = (db: Kdbx) => db.deletedObjects.map((d) => d.uuid?.id).sort();

/** A vault with "Work" (holding "In Work") and "Loose" both in the Recycle Bin, and "Kept" outside it. */
const binned = () =>
  threeCopies((db) => {
    const work = db.createGroup(db.getDefaultGroup(), "Work");
    addEntry(db, "In Work", {}, 100, work);
    addEntry(db, "Loose");
    addEntry(db, "Kept");
    db.remove(work);
    db.remove(byTitle(db, "Loose")!);
  });

describe("deleting for good records the deletion", () => {
  it("a group or entry in the Recycle Bin, and emptying it", async () => {
    let { local } = await binned();
    await deleteGroupFromDb(local, group(local, "Work")!.uuid.id);
    await deleteEntryFromDb(local, byTitle(local, "Loose")!.uuid.id);
    expect(bin(local).groups).toEqual([]);
    expect(bin(local).entries).toEqual([]);
    expect(ids(local)).toHaveLength(3); // Work, In Work, Loose

    ({ local } = await binned());
    await emptyRecycleBinInDb(local);
    expect(ids(local)).toHaveLength(3);
  });
});

describe("mergeDatabases applies deletions against the base", () => {
  it("a group deleted from the Recycle Bin stays deleted on both sides", async () => {
    const { local, remote, base } = await binned();
    await deleteGroupFromDb(local, group(local, "Work")!.uuid.id);
    await deleteEntryFromDb(local, byTitle(local, "Loose")!.uuid.id);
    expect(needsCommonBase(local, remote, snapshotOf(base))).toBe(true);
    const r = await mergeDatabases(local, remote, base, { now });
    for (const db of [local, remote]) {
      expect(group(db, "Work")).toBeUndefined();
      expect(byTitle(db, "In Work")).toBeUndefined();
      expect(byTitle(db, "Loose")).toBeUndefined();
      expect(byTitle(db, "Kept")).toBeDefined();
    }
    expect(ids(remote)).toEqual(ids(local)); // passed on, for the devices that sync next
    expect(r.remoteChanged).toBe(true);
  });

  it("deletions made on the server copy are applied locally", async () => {
    const { local, remote, base } = await binned();
    await emptyRecycleBinInDb(remote);
    const r = await mergeDatabases(local, remote, base, { now });
    expect(group(local, "Work")).toBeUndefined();
    expect(byTitle(local, "Loose")).toBeUndefined();
    expect(r.localChanged).toBe(true);
  });

  it("an entry edited on the other side is kept, whatever the clocks say", async () => {
    const { local, remote, base } = await binned();
    // The deleting device's clock is far ahead: its deletion looks newer than the edit
    remote.move(byTitle(remote, "Kept")!, null);
    remote.deletedObjects.at(-1)!.deletionTime = at(1e9);
    edit(local, "Kept", { Notes: "edited" }, 500);
    await mergeDatabases(local, remote, base, { now });
    for (const db of [local, remote]) expect(byTitle(db, "Kept")?.fields.get("Notes")).toBe("edited");
    expect(ids(remote)).not.toContain(byTitle(local, "Kept")!.uuid.id); // the held-back deletion is dropped
  });

  it("a deletion is applied even when the deleting device's clock is behind", async () => {
    const { local, remote, base } = await binned();
    local.move(byTitle(local, "Kept")!, null);
    local.deletedObjects.at(-1)!.deletionTime = at(1); // before the entry was last changed
    await mergeDatabases(local, remote, base, { now });
    expect(byTitle(remote, "Kept")).toBeUndefined();
    expect(byTitle(local, "Kept")).toBeUndefined();
  });

  it("an entry moved on the other side is kept", async () => {
    const { local, remote, base } = await binned();
    local.move(byTitle(local, "Kept")!, null);
    remote.move(byTitle(remote, "Kept")!, bin(remote));
    await mergeDatabases(local, remote, base, { now });
    expect(byTitle(local, "Kept")).toBeDefined();
  });

  it("a group that gained an entry on the other side is kept with it; the deleted entries go", async () => {
    const { local, remote, base } = await binned();
    await deleteGroupFromDb(local, group(local, "Work")!.uuid.id);
    addEntry(remote, "New in Work", {}, 600, group(remote, "Work"));
    await mergeDatabases(local, remote, base, { now });
    for (const db of [local, remote]) {
      expect(group(db, "Work")).toBeDefined();
      expect(byTitle(db, "New in Work")).toBeDefined();
      expect(byTitle(db, "In Work")).toBeUndefined();
    }
  });

  it("a renamed group is kept", async () => {
    const { local, remote, base } = await binned();
    await deleteGroupFromDb(local, group(local, "Work")!.uuid.id);
    group(remote, "Work")!.name = "Work 2";
    await mergeDatabases(local, remote, base, { now });
    expect(group(local, "Work 2")).toBeDefined();
  });

  it("without a base nothing is deleted, and an item that came back isn't deleted by its old record", async () => {
    const { local, remote, base } = await binned();
    await deleteEntryFromDb(local, byTitle(local, "Loose")!.uuid.id);
    await mergeDatabases(local, remote, null, { now });
    expect(byTitle(local, "Loose")).toBeDefined();
    expect(needsCommonBase(local, remote, snapshotOf(base))).toBe(false);
    await mergeDatabases(local, remote, base, { now });
    expect(byTitle(local, "Loose")).toBeDefined();
  });

  it("a group emptied by moving its entries out, then deleted, goes", async () => {
    const { local, remote, base } = await binned();
    const work = group(local, "Work")!;
    local.move(byTitle(local, "In Work")!, local.getDefaultGroup());
    byTitle(local, "In Work")!.times.locationChanged = at(900);
    local.move(work, null);
    await mergeDatabases(local, remote, base, { now });
    for (const db of [local, remote]) {
      expect(group(db, "Work")).toBeUndefined();
      expect(byTitle(db, "In Work")?.parentGroup).toBe(db.getDefaultGroup());
    }
  });
});

describe("mergeDatabases merges the Recycle Bin", () => {
  it("a side without a bin takes the other side's", async () => {
    const { local, remote, base } = await binned();
    remote.meta.recycleBinUuid = undefined;
    await mergeDatabases(local, remote, base, { now });
    expect(bin(remote).uuid.id).toBe(bin(local).uuid.id);
  });

  it("two bins become one, the one changed last, holding both", async () => {
    const { local, remote, base } = await threeCopies((db) => {
      // No bin yet
      const root = db.getDefaultGroup();
      root.groups = root.groups.filter((g) => g.uuid.id !== db.meta.recycleBinUuid?.id);
      db.meta.recycleBinUuid = undefined;
      addEntry(db, "A");
      addEntry(db, "B");
    });
    // Each side made its own bin before seeing the other's
    for (const [db, title, time] of [[local, "A", 500], [remote, "B", 600]] as const) {
      db.createRecycleBin();
      db.remove(byTitle(db, title)!);
      db.meta.recycleBinChanged = at(time);
    }
    await mergeDatabases(local, remote, base, { now });
    for (const db of [local, remote]) {
      expect(db.meta.recycleBinUuid?.id).toBe(bin(remote).uuid.id);
      expect(bin(db).entries.map((e) => e.fields.get("Title")).sort()).toEqual(["A", "B"]);
      expect(db.getDefaultGroup().groups.filter((g) => g.name === "Recycle Bin")).toHaveLength(1);
    }
  });
});

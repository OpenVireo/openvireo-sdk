/**
 * Cases derived from SyncEngine::mergeDatabases / combineEntries / resolveFields and core/Merger.cpp.
 * These still need cross-checking against the Qt merge fixtures (tests/data/merge-fixtures) once they exist.
 */
import { describe, expect, it } from "vitest";
import { conflictingFields, findConflicts, mergeDatabases, needsCommonBase, resolveFields, snapshotOf } from "../src/merge/index.js";
import { kdbxweb, openKdbx, saveKdbx, syncGeneration, vaultCredentials } from "../src/vault/kdbx.js";
import { KEY, addEntry, at, byTitle, content, edit, get, threeCopies } from "./helpers/dbs.js";

const now = () => at(10_000);

describe("resolveFields", () => {
  it("takes one-sided changes and reports two-sided ones", async () => {
    const { local, remote, base } = await threeCopies((db) => void addEntry(db, "A", { UserName: "u", Password: "p", URL: "x" }));
    edit(local, "A", { Password: "p-local", URL: "same" }, 200);
    edit(remote, "A", { UserName: "u-remote", Password: "p-remote", URL: "same" }, 300);
    const r = resolveFields(byTitle(local, "A")!, byTitle(remote, "A")!, byTitle(base, "A")!, false);
    expect(r.conflicts).toEqual(["Password"]);
    const text = (k: string) => (r.merged.get(k) as { text: string }).text;
    expect([text("attribute/UserName"), text("attribute/Password"), text("attribute/URL")]).toEqual(["u-remote", "p-remote", "same"]);
    expect(conflictingFields(byTitle(local, "A"), byTitle(remote, "A"), undefined)).toEqual([]);
  });
});

describe("mergeDatabases with the common base", () => {
  it("keeps both sides' changes to different fields of one entry", async () => {
    const { local, remote, base } = await threeCopies((db) => void addEntry(db, "A", { UserName: "u", Password: "p", URL: "x" }));
    edit(local, "A", { Password: "p2" }, 200);
    edit(remote, "A", { URL: "y" }, 300);
    const r = await mergeDatabases(local, remote, base, { now });
    expect(r.conflicts.size).toBe(0);
    for (const db of [local, remote]) expect([get(db, "A", "Password"), get(db, "A", "URL")]).toEqual(["p2", "y"]);
    expect(content(local)).toEqual(content(remote));
    expect(r.remoteChanged && r.localChanged).toBe(true);
    // both had their previous state put in history, and the modification time moved to "now"
    const a = byTitle(local, "A")!;
    expect(a.times.lastModTime).toEqual(now());
    expect(a.history.map((h) => get({ getDefaultGroup: () => ({ entries: [h], groups: [] }) } as any, "A", "Password"))).toContain("p");
  });

  it("the same field changed on both sides: the newer side wins and it is a conflict", async () => {
    const { local, remote, base } = await threeCopies((db) => void addEntry(db, "A", { Password: "p" }));
    edit(local, "A", { Password: "local" }, 400);
    edit(remote, "A", { Password: "remote" }, 300);
    const r = await mergeDatabases(local, remote, base, { now });
    expect([...r.conflicts.values()]).toEqual([["Password"]]);
    expect(get(local, "A", "Password")).toBe("local");
    expect(get(remote, "A", "Password")).toBe("local");
  });

  it("a change that doesn't look newer (clock behind) still wins over an unchanged side", async () => {
    const { local, remote, base } = await threeCopies((db) => void addEntry(db, "A", { Password: "p" }, 500));
    edit(local, "A", { Password: "from a slow clock" }, 450); // older than base and remote
    const r = await mergeDatabases(local, remote, base, { now });
    expect(get(remote, "A", "Password")).toBe("from a slow clock");
    expect(r.remoteChanged).toBe(true);
  });

  it("without a base the Merger keeps the newer entry whole (local field change lost to history)", async () => {
    const { local, remote } = await threeCopies((db) => void addEntry(db, "A", { Password: "p", URL: "x" }));
    edit(local, "A", { Password: "p2" }, 200);
    edit(remote, "A", { URL: "y" }, 300);
    await mergeDatabases(local, remote, null, { now });
    for (const db of [local, remote]) expect([get(db, "A", "Password"), get(db, "A", "URL")]).toEqual(["p", "y"]);
    // the local version is kept in the history
    const hist = byTitle(local, "A")!.history.map((h) => (h.fields.get("Password") as kdbxweb.ProtectedValue).getText());
    expect(hist).toContain("p2");
  });

  it("same-second edits: identical fields need no combining", async () => {
    const { local, remote, base } = await threeCopies((db) => void addEntry(db, "A", { Password: "p" }));
    edit(local, "A", { Password: "x" }, 200);
    edit(remote, "A", { Password: "x" }, 200);
    const r = await mergeDatabases(local, remote, base, { now });
    expect(r.conflicts.size).toBe(0);
    expect(get(local, "A", "Password")).toBe("x");
  });
});

describe("Merger (structure)", () => {
  it("adds entries and groups created on either side", async () => {
    const { local, remote, base } = await threeCopies((db) => void addEntry(db, "A"));
    addEntry(local, "L", {}, 200);
    const g = remote.createGroup(remote.getDefaultGroup(), "Remote group");
    g.times.lastModTime = at(250);
    addEntry(remote, "R", {}, 300, g);
    await mergeDatabases(local, remote, base, { now });
    expect(content(local)).toEqual(["/A {Notes=;Password=;Title=A;URL=;UserName=} bins=", "/L {Notes=;Password=;Title=L;URL=;UserName=} bins=", "/Remote group/R {Notes=;Password=;Title=R;URL=;UserName=} bins="]);
    expect(content(remote)).toEqual(content(local));
  });

  it("moves an entry that was moved later on the other side", async () => {
    const { local, remote, base } = await threeCopies((db) => {
      addEntry(db, "A");
      const g = db.createGroup(db.getDefaultGroup(), "Archive");
      g.times.lastModTime = at(100);
      g.times.locationChanged = at(100);
    });
    const e = byTitle(remote, "A")!;
    remote.move(e, remote.getDefaultGroup().groups.find((g) => g.name === "Archive")!);
    e.times.locationChanged = at(300);
    await mergeDatabases(local, remote, base, { now });
    expect(content(local)).toEqual(["/Archive/A {Notes=;Password=;Title=A;URL=;UserName=} bins="]);
  });

  it("renames a group changed later on the other side", async () => {
    const { local, remote } = await threeCopies((db) => {
      const g = db.createGroup(db.getDefaultGroup(), "Old");
      g.times.lastModTime = at(100);
    });
    const g = remote.getDefaultGroup().groups.find((x) => x.name === "Old")!;
    g.name = "New";
    g.times.lastModTime = at(300);
    const r = await mergeDatabases(local, remote, null, { now });
    expect(local.getDefaultGroup().groups.find((x) => x.uuid.equals(g.uuid))?.name).toBe("New");
    expect(r.changes.some((c) => c.type === "modified" && c.details.includes("Group name"))).toBe(true);
  });

  it("deletions: kept in KeepNewer (KeePassXC's sync default), applied in Synchronize unless edited later", async () => {
    const make = () =>
      threeCopies((db) => {
        addEntry(db, "Gone");
        addEntry(db, "Edited after delete");
      });
    const del = (db: kdbxweb.Kdbx, title: string, time: number) => {
      const e = byTitle(db, title)!;
      e.parentGroup!.entries.splice(e.parentGroup!.entries.indexOf(e), 1);
      db.addDeletedObject(e.uuid, at(time));
    };
    let { local, remote, base } = await make();
    del(remote, "Gone", 200);
    await mergeDatabases(local, remote, base, { now });
    expect(byTitle(local, "Gone")).toBeDefined();
    expect(byTitle(remote, "Gone")).toBeDefined(); // re-added from local, as KeePassXC does

    ({ local, remote, base } = await make());
    del(remote, "Gone", 200);
    del(remote, "Edited after delete", 200);
    edit(local, "Edited after delete", { Notes: "still here" }, 300);
    await mergeDatabases(local, remote, base, { now, mode: "synchronize" });
    expect(byTitle(local, "Gone")).toBeUndefined();
    expect(get(local, "Edited after delete", "Notes")).toBe("still here");
  });

  it("merges attachments field by field and keeps the binaries after save", async () => {
    const { local, remote, base } = await threeCopies((db) => void addEntry(db, "A", { Password: "p" }));
    const e = edit(remote, "A", {}, 300);
    e.binaries.set("key.pem", await remote.createBinary(new TextEncoder().encode("-----BEGIN-----").buffer as ArrayBuffer));
    edit(local, "A", { Title: "A" , Password: "p2" }, 200);
    await mergeDatabases(local, remote, base, { now });
    const reopened = await openKdbx(await saveKdbx(remote), vaultCredentials(KEY));
    const a = byTitle(reopened, "A")!;
    expect(get(reopened, "A", "Password")).toBe("p2");
    const bin = a.binaries.get("key.pem")!;
    const val = kdbxweb.KdbxBinaries.isKdbxBinaryWithHash(bin) ? bin.value : bin;
    expect(new TextDecoder().decode(val instanceof kdbxweb.ProtectedValue ? val.getBinary() : new Uint8Array(val as ArrayBuffer))).toBe("-----BEGIN-----");
    expect(content(local)).toEqual(content(remote));
  });

  it("bumps the sync generation on both sides when anything changed", async () => {
    const { local, remote, base } = await threeCopies((db) => void addEntry(db, "A"));
    expect(syncGeneration(local)).toBe(0);
    addEntry(local, "B", {}, 200);
    await mergeDatabases(local, remote, base, { now });
    expect([syncGeneration(local), syncGeneration(remote)]).toEqual([1, 1]);
    const again = await mergeDatabases(local, remote, base, { now });
    expect(again.changes).toEqual([]);
    expect(syncGeneration(local)).toBe(1);
  });
});

describe("conflict detection against the last-sync snapshot", () => {
  it("finds entries edited on both sides and edit/delete conflicts, and when the base is needed", async () => {
    const { local, remote } = await threeCopies((db) => {
      addEntry(db, "Both");
      addEntry(db, "OnlyLocal");
      addEntry(db, "DeletedRemote");
    });
    const snap = snapshotOf(local);
    edit(local, "Both", { Notes: "l" }, 200);
    edit(remote, "Both", { Notes: "r" }, 300);
    edit(local, "OnlyLocal", { Notes: "l" }, 200);
    edit(local, "DeletedRemote", { Notes: "l" }, 200);
    const e = byTitle(remote, "DeletedRemote")!;
    e.parentGroup!.entries.splice(e.parentGroup!.entries.indexOf(e), 1);
    remote.addDeletedObject(e.uuid, at(250));
    const c = findConflicts(local, remote, snap);
    expect(c.map((x) => [x.title, x.kind]).sort()).toEqual([
      ["Both", "edited-on-both"],
      ["DeletedRemote", "edited-here-deleted-there"],
    ]);
    expect(needsCommonBase(local, remote, snap)).toBe(true);
  });
  it("a one-sided newer change doesn't need the base", async () => {
    const { local, remote } = await threeCopies((db) => void addEntry(db, "A"));
    const snap = snapshotOf(local);
    edit(remote, "A", { Notes: "r" }, 300);
    expect(needsCommonBase(local, remote, snap)).toBe(false);
    expect(findConflicts(local, remote, snap)).toEqual([]);
  });
});

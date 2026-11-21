/**
 * Cases for the sync merge (SyncEngine::mergeDatabases / combineEntries / resolveFields and the structure
 * merge, docs/merge-behaviour.md), run through the core's merge on `Kdbx` handles. The Qt fixtures run in
 * openvireo-core (crates/ov-merge/tests/merge_fixtures.rs).
 */
import { describe, expect, it } from "vitest";
import type { Vault } from "@openvireo/core-wasm";
import { findConflicts, mergeInto, needsCommonBase, snapshotOf } from "../src/merge/index.js";
import { openKdbx } from "../src/vault/kdbx.js";
import { fieldText } from "../src/vault/entries.js";
import { KEY, addEntry, byTitle, content, edit, get, merge, openVault, setNow, threeCopies } from "./helpers/dbs.js";

const NOW = 10_000;
const kdbx = async (v: Vault) => openKdbx(await v.saveLocal(), { vaultKey: KEY });
const history = (v: Vault, title: string, field: string) => v.history(byTitle(v, title)!.id).map((h) => fieldText(h, field));
const conflictFields = (r: { report: { conflicts: { fields: string[] }[] } }) => r.report.conflicts.map((c) => c.fields);

describe("field-level merge with the common base", () => {
  it("takes one-sided changes and reports two-sided ones", async () => {
    const { local, remote, base } = await threeCopies((v) => void addEntry(v, "A", { UserName: "u", Password: "p", URL: "x" }));
    edit(local, "A", { Password: "p-local", URL: "same" }, 200);
    edit(remote, "A", { UserName: "u-remote", Password: "p-remote", URL: "same" }, 300);
    const r = await merge(local, remote, base, NOW);
    expect(conflictFields(r)).toEqual([["Password"]]);
    expect([get(r.local, "A", "UserName"), get(r.local, "A", "Password"), get(r.local, "A", "URL")]).toEqual(["u-remote", "p-remote", "same"]);
  });

  it("keeps both sides' changes to different fields of one entry", async () => {
    const { local, remote, base } = await threeCopies((v) => void addEntry(v, "A", { UserName: "u", Password: "p", URL: "x" }));
    edit(local, "A", { Password: "p2" }, 200);
    edit(remote, "A", { URL: "y" }, 300);
    const r = await merge(local, remote, base, NOW);
    expect(r.report.conflicts).toEqual([]);
    for (const v of [r.local, r.remote]) expect([get(v, "A", "Password"), get(v, "A", "URL")]).toEqual(["p2", "y"]);
    expect(content(r.local)).toEqual(content(r.remote));
    expect(r.report.remoteChanged && r.report.localChanged).toBe(true);
    // the previous state went to history, and the modification time moved to "now"
    expect(byTitle(r.local, "A")!.modifiedAt).toBe(NOW);
    expect(history(r.local, "A", "Password")).toContain("p");
  });

  it("the same field changed on both sides: the newer side wins and it is a conflict", async () => {
    const { local, remote, base } = await threeCopies((v) => void addEntry(v, "A", { Password: "p" }));
    edit(local, "A", { Password: "local" }, 400);
    edit(remote, "A", { Password: "remote" }, 300);
    const r = await merge(local, remote, base, NOW);
    expect(conflictFields(r)).toEqual([["Password"]]);
    expect(get(r.local, "A", "Password")).toBe("local");
    expect(get(r.remote, "A", "Password")).toBe("local");
  });

  it("a change that doesn't look newer (clock behind) still wins over an unchanged side", async () => {
    const { local, remote, base } = await threeCopies((v) => void addEntry(v, "A", { Password: "p" }, 500));
    edit(local, "A", { Password: "from a slow clock" }, 450); // older than base and remote
    const r = await merge(local, remote, base, NOW);
    expect(get(r.remote, "A", "Password")).toBe("from a slow clock");
    expect(r.report.remoteChanged).toBe(true);
  });

  it("without a base the Merger keeps the newer entry whole (local field change lost to history)", async () => {
    const { local, remote } = await threeCopies((v) => void addEntry(v, "A", { Password: "p", URL: "x" }));
    edit(local, "A", { Password: "p2" }, 200);
    edit(remote, "A", { URL: "y" }, 300);
    const r = await merge(local, remote, null, NOW);
    for (const v of [r.local, r.remote]) expect([get(v, "A", "Password"), get(v, "A", "URL")]).toEqual(["p", "y"]);
    expect(history(r.local, "A", "Password")).toContain("p2");
  });

  it("same-second edits: identical fields need no combining", async () => {
    const { local, remote, base } = await threeCopies((v) => void addEntry(v, "A", { Password: "p" }));
    edit(local, "A", { Password: "x" }, 200);
    edit(remote, "A", { Password: "x" }, 200);
    const r = await merge(local, remote, base, NOW);
    expect(r.report.conflicts).toEqual([]);
    expect(get(r.local, "A", "Password")).toBe("x");
  });
});

describe("Merger (structure)", () => {
  it("adds entries and groups created on either side", async () => {
    const { local, remote, base } = await threeCopies((v) => void addEntry(v, "A"));
    addEntry(local, "L", {}, 200);
    setNow(250);
    const g = remote.addGroup(remote.rootGroupId(), "Remote group");
    addEntry(remote, "R", {}, 300, g);
    const r = await merge(local, remote, base, NOW);
    expect(content(r.local)).toEqual(["/A {Notes=;Password=;Title=A;URL=;UserName=} bins=", "/L {Notes=;Password=;Title=L;URL=;UserName=} bins=", "/Remote group/R {Notes=;Password=;Title=R;URL=;UserName=} bins="]);
    expect(content(r.remote)).toEqual(content(r.local));
  });

  it("moves an entry that was moved later on the other side", async () => {
    const { local, remote, base } = await threeCopies((v) => {
      addEntry(v, "A");
      setNow(100);
      v.addGroup(v.rootGroupId(), "Archive");
    });
    setNow(300);
    remote.moveEntry(byTitle(remote, "A")!.id, remote.groups().find((g) => g.name === "Archive")!.id);
    const r = await merge(local, remote, base, NOW);
    expect(content(r.local)).toEqual(["/Archive/A {Notes=;Password=;Title=A;URL=;UserName=} bins="]);
  });

  it("renames a group changed later on the other side", async () => {
    const { local, remote } = await threeCopies((v) => {
      setNow(100);
      v.addGroup(v.rootGroupId(), "Old");
    });
    const id = remote.groups().find((x) => x.name === "Old")!.id;
    setNow(300);
    remote.renameGroup(id, "New");
    const r = await merge(local, remote, null, NOW);
    expect(r.local.groups().find((x) => x.id === id)?.name).toBe("New");
    expect(r.report.changes.some((c) => c.change === "modified" && c.subject === "group")).toBe(true);
  });

  it("deletions without a base: kept in KeepNewer (KeePassXC's default), applied in Synchronize unless edited later", async () => {
    const make = () =>
      threeCopies((v) => {
        addEntry(v, "Gone");
        addEntry(v, "Edited after delete");
      });
    const destroy = (v: Vault, title: string, time: number) => {
      setNow(time);
      const id = byTitle(v, title)!.id;
      v.deleteEntry(id);
      v.deleteEntry(id);
    };
    let { local, remote } = await make();
    destroy(remote, "Gone", 200);
    let lk = await kdbx(local);
    let rk = await kdbx(remote);
    mergeInto(rk, lk, "keep-newer");
    expect(byTitle(await openVault(lk.write()), "Gone")).toBeDefined();

    ({ local, remote } = await make());
    destroy(remote, "Gone", 200);
    destroy(remote, "Edited after delete", 200);
    edit(local, "Edited after delete", { Notes: "still here" }, 300);
    lk = await kdbx(local);
    rk = await kdbx(remote);
    mergeInto(rk, lk, "synchronize");
    const merged = await openVault(lk.write());
    expect(byTitle(merged, "Gone")).toBeUndefined();
    expect(get(merged, "Edited after delete", "Notes")).toBe("still here");
  });

  it("merges attachments field by field and keeps the binaries after save", async () => {
    const { local, remote, base } = await threeCopies((v) => void addEntry(v, "A", { Password: "p" }));
    setNow(300);
    remote.setAttachment(byTitle(remote, "A")!.id, "key.pem", new TextEncoder().encode("-----BEGIN-----"));
    edit(local, "A", { Password: "p2" }, 200);
    const r = await merge(local, remote, base, NOW);
    const reopened = await openVault(await r.remote.saveLocal());
    expect(get(reopened, "A", "Password")).toBe("p2");
    expect(new TextDecoder().decode(reopened.attachment(byTitle(reopened, "A")!.id, "key.pem"))).toBe("-----BEGIN-----");
    expect(content(r.local)).toEqual(content(r.remote));
  });

  it("bumps the sync generation on both sides when anything changed", async () => {
    const { local, remote, base } = await threeCopies((v) => void addEntry(v, "A"));
    expect((await kdbx(local)).syncGeneration()).toBe(0);
    addEntry(local, "B", {}, 200);
    const r = await merge(local, remote, base, NOW);
    const [lk, rk] = [await kdbx(r.local), await kdbx(r.remote)];
    expect([lk.syncGeneration(), rk.syncGeneration()]).toEqual([1, 1]);
    const again = lk.mergeWithBase(rk, await kdbx(base), NOW);
    expect(again.changes).toEqual([]);
    expect(lk.syncGeneration()).toBe(1);
  });
});

describe("conflict detection against the last-sync snapshot", () => {
  it("finds entries edited on both sides and edit/delete conflicts, and when the base is needed", async () => {
    const { local, remote } = await threeCopies((v) => {
      addEntry(v, "Both");
      addEntry(v, "OnlyLocal");
      addEntry(v, "DeletedRemote");
    });
    const snap = snapshotOf(await kdbx(local));
    edit(local, "Both", { Notes: "l" }, 200);
    edit(remote, "Both", { Notes: "r" }, 300);
    edit(local, "OnlyLocal", { Notes: "l" }, 200);
    edit(local, "DeletedRemote", { Notes: "l" }, 200);
    setNow(250);
    const id = byTitle(remote, "DeletedRemote")!.id;
    remote.deleteEntry(id);
    remote.deleteEntry(id);
    const [lk, rk] = [await kdbx(local), await kdbx(remote)];
    const c = findConflicts(lk, rk, snap);
    expect(c.map((x) => [x.title, x.kind]).sort()).toEqual([
      ["Both", "edited-on-both"],
      ["DeletedRemote", "edited-here-deleted-there"],
    ]);
    expect(needsCommonBase(lk, rk, snap)).toBe(true);
  });

  it("a one-sided newer change doesn't need the base", async () => {
    const { local, remote } = await threeCopies((v) => void addEntry(v, "A"));
    const snap = snapshotOf(await kdbx(local));
    edit(remote, "A", { Notes: "r" }, 300);
    const [lk, rk] = [await kdbx(local), await kdbx(remote)];
    expect(needsCommonBase(lk, rk, snap)).toBe(false);
    expect(findConflicts(lk, rk, snap)).toEqual([]);
  });
});

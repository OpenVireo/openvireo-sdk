import { beforeAll, describe, expect, it } from "vitest";
import { ServiceAccount, isKpxError, itemOf, listItems, parseItemReference, setItemFields, findEntry } from "../src/index.js";
import { type World, editBetweenGetAndPut, makeWorld } from "./helpers/world.js";

let w: World;
beforeAll(async () => {
  w = await makeWorld();
});

describe("item references and helpers", () => {
  it("parses kpx://<vault>/[<group>/…]<entry>", () => {
    expect(parseItemReference("kpx://Team%20Infra/GitHub")).toEqual({ vault: "Team Infra", groupPath: [], entry: "GitHub" });
    expect(parseItemReference("kpx://v/a/b%2Fc/Entry")).toEqual({ vault: "v", groupPath: ["a", "b/c"], entry: "Entry" });
    for (const bad of ["kpx://v", "kpx://v//e", "https://v/e", "kpx://v/%zz"]) expect(() => parseItemReference(bad)).toThrow(/reference|encoding|expected/);
  });

  it("lists, reads and sets whole items", async () => {
    const sa = await ServiceAccount.fromToken(w.readToken, { fetch: w.fetch });
    const db = await sa.openVault("Team Infra");
    const items = listItems(db);
    expect(items.map((i) => [i.title, i.group.join("/")]).sort()).toEqual([["Database", "Deploy"], ["GitHub", ""]]);
    expect(items[0]!.fields).toEqual({});
    const gh = itemOf(findEntry(db, { groupPath: [], entry: "GitHub" }));
    expect(gh.fields).toMatchObject({ Title: "GitHub", UserName: "ci" });
    expect(gh.fields.Password).toBeUndefined();
    expect(gh.protected).toContain("Password");
    expect(gh.id).toMatch(/^[0-9a-f]{32}$/);
    expect(itemOf(findEntry(db, { groupPath: [], entry: gh.id }), { reveal: true }).fields.Password).toBe("s3cret");

    const { created } = setItemFields(db, { groupPath: ["New", "Sub"], entry: "Api" }, { username: "u", token: "t0k" }, { create: true });
    const api = itemOf(findEntry(db, { groupPath: ["New", "Sub"], entry: "Api" }), { reveal: true });
    expect([created, api.fields.UserName, api.fields.token, api.protected.sort()]).toEqual([true, "u", "t0k", ["Password", "token"]]);
    expect(() => setItemFields(db, { groupPath: [], entry: "GitHub" }, { x: "1" }, { create: "only" })).toThrow(/already exists/);
    expect(() => setItemFields(db, { groupPath: [], entry: "Missing" }, { x: "1" })).toThrow(/not found/);
    sa.close();
  });
});

describe("ServiceAccount.edit / pull", () => {
  it("refuses writes with a read grant before uploading anything", async () => {
    const sa = await ServiceAccount.fromToken(w.readToken, { fetch: w.fetch });
    const before = w.sync.blobs.get(`vaults/${w.vaultId}`)!.length;
    const err = await sa.write("kpx://Team%20Infra/GitHub/password", "x").catch((e) => e);
    expect(isKpxError(err, "forbidden")).toBe(true);
    expect(err.message).toMatch(/can only read vault "Team Infra"/);
    expect(w.sync.blobs.get(`vaults/${w.vaultId}`)!.length).toBe(before);
    sa.close();
  });

  it("drops the cached copy when the server rejects the upload", async () => {
    const sa = await ServiceAccount.fromToken(w.writeToken, { fetch: w.fetch });
    await sa.openVault(w.vaultId);
    // the role changes to read on the server, but the SA's vault list still says write
    const access = w.auth.vaults.get(w.vaultId)!.access.get(sa.principal)!;
    access.role = "read";
    try {
      const err = await sa.write("kpx://Team%20Infra/GitHub/password", "never-stored").catch((e) => e);
      expect(err.status).toBe(403);
      expect(await sa.read("kpx://Team%20Infra/GitHub/password")).toBe("s3cret");
    } finally {
      access.role = "write";
      sa.close();
    }
  });

  it("merges and retries on 412 when another client uploads in between", async () => {
    const sa = await ServiceAccount.fromToken(w.writeToken, { fetch: w.fetch });
    await sa.openVault(w.vaultId);
    const race = await editBetweenGetAndPut(w, "GitHub", { UserName: "changed-elsewhere" });
    const puts = () => w.sync.calls.filter((c) => c.method === "PUT").length;
    const before = puts();
    await sa.edit("Team Infra", (db) => void setItemFields(db, { groupPath: [], entry: "GitHub" }, { password: "from-sa" }));
    w.sync.afterGet = null;
    expect(race.fired).toBe(true);
    expect(puts() - before).toBe(2); // 412, then the merged upload
    const fresh = await ServiceAccount.fromToken(w.readToken, { fetch: w.fetch });
    expect(await fresh.read("kpx://Team%20Infra/GitHub/password")).toBe("from-sa");
    expect(await fresh.read("kpx://Team%20Infra/GitHub/username")).toBe("changed-elsewhere");
    fresh.close();
    sa.close();
  });

  it("pull only downloads when the server has a new version", async () => {
    const sa = await ServiceAccount.fromToken(w.readToken, { fetch: w.fetch });
    await sa.pull(w.vaultId);
    const gets = () => w.sync.calls.filter((c) => c.method === "GET" && c.path.endsWith(w.vaultId)).length;
    const n = gets();
    await sa.pull(w.vaultId);
    expect(gets()).toBe(n); // HEAD → 304
    const writer = await ServiceAccount.fromToken(w.writeToken, { fetch: w.fetch });
    await writer.write("kpx://Team%20Infra/GitHub/password", "pulled");
    const m = gets();
    const db = await sa.pull(w.vaultId);
    expect(gets()).toBe(m + 1);
    expect(itemOf(findEntry(db, { groupPath: [], entry: "GitHub" }), { reveal: true }).fields.Password).toBe("pulled");
    writer.close();
    sa.close();
  });

  it("serializes concurrent edits of one vault", async () => {
    const sa = await ServiceAccount.fromToken(w.writeToken, { fetch: w.fetch });
    await Promise.all(Array.from({ length: 4 }, (_, i) => sa.edit(w.vaultId, (db) => void setItemFields(db, { groupPath: ["Batch"], entry: `e${i}` }, { password: `p${i}` }, { create: true }))));
    const fresh = await ServiceAccount.fromToken(w.readToken, { fetch: w.fetch });
    for (let i = 0; i < 4; i++) expect(await fresh.read(`kpx://Team%20Infra/Batch/e${i}/password`)).toBe(`p${i}`);
    fresh.close();
    sa.close();
  });
});

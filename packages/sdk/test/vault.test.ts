import { describe, expect, it } from "vitest";
import {
  addCustomIconToDb,
  addEntryToDb,
  collectAllDbData,
  createNewKdbx,
  createVaultKdbx,
  customIconPng,
  decryptKdbx,
  editEntryInDb,
  fieldText,
  findEntry,
  formatReference,
  kdfSettings,
  openKdbx,
  openLocalVault,
  openWithKeyVersions,
  parseReference,
  readField,
  saveKdbx,
  saveLocalVault,
  setEntryCustomIconInDb,
  vaultCredentials,
  writeField,
} from "../src/vault/index.js";
import { fromHex, randomBytes } from "../src/util/bytes.js";
import { V, fixtureKdbx } from "./vectors.js";

const vaultKey = fromHex(V.vault_kdbx.vault_key_hex);
const throwsCode = (fn: () => unknown) => {
  try {
    fn();
    return "ok";
  } catch (e) {
    return (e as { code?: string }).code;
  }
};

describe("vault-fixture.kdbx (SPEC §7)", () => {
  it("opens with the vault key as a raw 32-byte key file component", async () => {
    const vault = await openLocalVault(fixtureKdbx(), vaultCredentials(vaultKey));
    expect(vault.name()).toBe(V.vault_kdbx.expect.root_group);
    const e = vault.entryRecords(false)[0]!;
    for (const [k, v] of Object.entries(V.vault_kdbx.expect.entry)) expect(fieldText(e, k)).toBe(v);
    expect(kdfSettings(fixtureKdbx())).toEqual({ kdf: "argon2id", m: V.vault_kdbx.kdf.m_kib * 1024, t: V.vault_kdbx.kdf.t, p: V.vault_kdbx.kdf.p });
    expect(openKdbx(fixtureKdbx(), vaultCredentials(vaultKey)).header().version).toMatch(/^4\./);
  });
  it("does not wipe the caller's key", async () => {
    const k = vaultKey.slice();
    await openLocalVault(fixtureKdbx(), vaultCredentials(k));
    expect(k).toEqual(vaultKey);
  });
  it("fails with vault_key_mismatch for another key", async () => {
    await expect(openLocalVault(fixtureKdbx(), vaultCredentials(randomBytes(32)))).rejects.toMatchObject({ code: "vault_key_mismatch" });
    expect(throwsCode(() => openKdbx(fixtureKdbx(), vaultCredentials(randomBytes(32))))).toBe("vault_key_mismatch");
  });
  it("can be saved and reopened", async () => {
    const db = openKdbx(fixtureKdbx(), vaultCredentials(vaultKey));
    const again = await openLocalVault(saveKdbx(db), vaultCredentials(vaultKey));
    expect(readField(again, "ov://x/GitHub%20deploy%20key/password")).toBe("hunter2-but-longer");
  });
});

describe("new vaults and rotation", () => {
  it("creates a KDBX 4 vault with the vault KDF and the name as root group", async () => {
    const key = randomBytes(32);
    const bytes = saveKdbx(createVaultKdbx("Ops", key));
    expect((await openLocalVault(bytes, vaultCredentials(key))).name()).toBe("Ops");
    expect(kdfSettings(bytes)).toEqual({ kdf: "argon2id", m: 1048576, t: 2, p: 1 });
  });
  it("re-keys: the old key fails, the new key opens, and newest-first fallback works", async () => {
    const oldKey = randomBytes(32);
    const newKey = randomBytes(32);
    const db = createVaultKdbx("Ops", oldKey);
    const v1 = saveKdbx(db);
    db.rekeyToVaultKey(newKey);
    const v2 = saveKdbx(db);
    expect(throwsCode(() => openKdbx(v2, vaultCredentials(oldKey)))).toBe("vault_key_mismatch");
    expect(openKdbx(v2, vaultCredentials(newKey)).name).toBe("Ops");
    const keys = [
      { version: 1, key: oldKey },
      { version: 2, key: newKey },
    ];
    // a crash between upload and activate: the blob may be either version
    expect(openWithKeyVersions(v2, keys).keyVersion).toBe(2);
    expect(openWithKeyVersions(v1, keys).keyVersion).toBe(1);
    expect(throwsCode(() => openWithKeyVersions(v1, [{ version: 2, key: newKey }]))).toBe("vault_key_mismatch");
    expect(throwsCode(() => openWithKeyVersions(v1, []))).toBe("no_vault_key");
  });
});

describe("entry helpers (web app shapes)", () => {
  it("password databases: create, add, edit with history, collect", async () => {
    const created = await createNewKdbx("Personal", "pw");
    const opened = await decryptKdbx(created.fileBuffer, "pw");
    expect(opened.dbName).toBe("Personal");
    const vault = opened.vault;
    const root = opened.groups.find((g) => g.parentUuid === null)!.uuid;
    const id = addEntryToDb(vault, root, { title: "Mail", username: "me", passwordValue: "p1", url: "", notes: "", tags: ["a"] });
    editEntryInDb(vault, id, { passwordValue: "p2" });
    expect(vault.history(id)).toHaveLength(1);
    const { entries } = collectAllDbData(vault);
    expect(entries.map((x) => [x.title, x.passwordValue])).toEqual([["Mail", "p2"]]);
    await expect(decryptKdbx(created.fileBuffer, "wrong")).rejects.toMatchObject({ code: "vault_key_mismatch" });
  });

  it("custom icons: add, set on an entry, collect, save, clear", async () => {
    // a 1x1 PNG
    const png = fromHex(
      "89504e470d0a1a0a0000000d4948445200000001000000010806000000" +
        "1f15c4890000000d49444154789c6360f8cfc0f01f0005000201a5f2c84a0000000049454e44ae426082",
    );
    const created = await createNewKdbx("Icons", "pw");
    const vault = created.vault;
    const root = created.groups.find((g) => g.parentUuid === null)!.uuid;
    const id = addEntryToDb(vault, root, { title: "Site", username: "", passwordValue: "", url: "https://example.com", notes: "", tags: [] });
    expect(collectAllDbData(vault).entries[0]).toMatchObject({ icon: 0 });
    expect(collectAllDbData(vault).entries[0]!.customIcon).toBeUndefined();

    const iconId = addCustomIconToDb(vault, png);
    expect(addCustomIconToDb(vault, png)).toBe(iconId);
    setEntryCustomIconInDb(vault, id, iconId);
    expect(collectAllDbData(vault).entries[0]!.customIcon).toBe(iconId);
    expect(customIconPng(vault, iconId)).toEqual(png);
    expect(customIconPng(vault, "0".repeat(32))).toBeNull();

    const reopened = await decryptKdbx(await saveLocalVault(vault), "pw");
    expect(reopened.entries[0]!.customIcon).toBe(iconId);
    expect(customIconPng(reopened.vault, iconId)).toEqual(png);

    setEntryCustomIconInDb(vault, id, null);
    expect(collectAllDbData(vault).entries[0]!.customIcon).toBeUndefined();

    // with the other fields, in one history step
    const history = vault.history(id).length;
    editEntryInDb(vault, id, { title: "Site 2", customIcon: iconId });
    expect(vault.history(id)).toHaveLength(history + 1);
    expect(collectAllDbData(vault).entries[0]).toMatchObject({ title: "Site 2", customIcon: iconId });
    editEntryInDb(vault, id, { customIcon: null });
    expect(collectAllDbData(vault).entries[0]!.customIcon).toBeUndefined();
    const other = addEntryToDb(vault, root, { title: "Other", username: "", passwordValue: "", url: "", notes: "", tags: [], customIcon: iconId });
    expect(collectAllDbData(vault).entries.find((e) => e.uuid === other)!.customIcon).toBe(iconId);
  });
});

describe("ov:// references", () => {
  it("parses, formats and rejects", () => {
    expect(parseReference("ov://Team%20Infra/GitHub%20deploy%20key/password")).toEqual({ vault: "Team Infra", groupPath: [], entry: "GitHub deploy key", field: "password" });
    expect(parseReference("ov://v/CI/Deploy/Key/Password")).toEqual({ vault: "v", groupPath: ["CI", "Deploy"], entry: "Key", field: "Password" });
    expect(formatReference({ vault: "a b", groupPath: [], entry: "c/d", field: "e" })).toBe("ov://a%20b/c%2Fd/e");
    for (const bad of ["op://a/b/c", "ov://a/b", "ov://a//c"]) expect(() => parseReference(bad)).toThrow();
  });
  it("reads by title or uuid and writes with history", async () => {
    const vault = await openLocalVault(fixtureKdbx(), vaultCredentials(vaultKey));
    expect(readField(vault, parseReference("ov://x/GitHub%20deploy%20key/password"))).toBe("hunter2-but-longer");
    expect(readField(vault, parseReference("ov://x/GitHub%20deploy%20key/username"))).toBe("ci-bot");
    const e = findEntry(vault, { groupPath: [], entry: "GitHub deploy key" });
    expect(e.id).toMatch(/^[0-9a-f]{32}$/);
    expect(readField(vault, { groupPath: [], entry: e.id, field: "URL" })).toBe("https://github.com");
    writeField(vault, { groupPath: [], entry: "GitHub deploy key", field: "password" }, "rotated");
    expect(vault.history(e.id)).toHaveLength(1);
    expect(vault.entry(e.id).fields.find((f) => f.name === "Password")!.protected).toBe(true);
    writeField(vault, { groupPath: ["CI"], entry: "New", field: "API_TOKEN" }, "t0k", { create: true });
    expect(readField(vault, parseReference("ov://x/CI/New/api_token"))).toBe("t0k");
    expect(() => readField(vault, parseReference("ov://x/Nope/password"))).toThrow(/not found/);
  });
});

describe("Node Buffers", () => {
  it("opens from a Buffer that is a view into a larger pool", async () => {
    const pooled = Buffer.concat([Buffer.alloc(100, 1), Buffer.from(fixtureKdbx()), Buffer.alloc(50, 2)]);
    const view = pooled.subarray(100, pooled.length - 50);
    expect((await openLocalVault(view, vaultCredentials(vaultKey))).name()).toBe("Team Infrastructure");
  });
});

describe("key copies", () => {
  it("never wipes a caller's Buffer key", async () => {
    const k = Buffer.from(vaultKey);
    await openLocalVault(fixtureKdbx(), vaultCredentials(k));
    expect(new Uint8Array(k)).toEqual(vaultKey);
  });
});

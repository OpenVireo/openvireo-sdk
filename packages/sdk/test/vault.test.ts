import { describe, expect, it } from "vitest";
import {
  addEntryToDb,
  collectAllDbData,
  createNewKdbx,
  createVaultKdbx,
  decryptKdbx,
  editEntryInDb,
  findEntry,
  fieldText,
  formatReference,
  kdbxweb,
  kdfSettings,
  openKdbx,
  openWithKeyVersions,
  parseReference,
  readField,
  rekeyToVaultKey,
  saveKdbx,
  vaultCredentials,
  writeField,
} from "../src/vault/index.js";
import { fromHex, randomBytes } from "../src/util/bytes.js";
import { V, fixtureKdbx } from "./vectors.js";

const vaultKey = fromHex(V.vault_kdbx.vault_key_hex);

describe("vault-fixture.kdbx (SPEC §7)", () => {
  it("opens with the vault key as a raw 32-byte key file component", async () => {
    const db = await openKdbx(fixtureKdbx(), vaultCredentials(vaultKey));
    expect(db.getDefaultGroup().name).toBe(V.vault_kdbx.expect.root_group);
    const e = db.getDefaultGroup().entries[0]!;
    for (const [k, v] of Object.entries(V.vault_kdbx.expect.entry)) expect(fieldText(e.fields.get(k))).toBe(v);
    expect(kdfSettings(db)).toEqual({ kdf: "argon2id", m: V.vault_kdbx.kdf.m_kib * 1024, t: V.vault_kdbx.kdf.t, p: V.vault_kdbx.kdf.p });
    expect(db.header.versionMajor).toBe(4);
  });
  it("does not wipe the caller's key (kdbxweb gets copies)", async () => {
    const k = vaultKey.slice();
    await openKdbx(fixtureKdbx(), vaultCredentials(k));
    expect(k).toEqual(vaultKey);
  });
  it("fails with vault_key_mismatch for another key", async () => {
    await expect(openKdbx(fixtureKdbx(), vaultCredentials(randomBytes(32)))).rejects.toMatchObject({ code: "vault_key_mismatch" });
  });
  it("can be saved and reopened", async () => {
    const db = await openKdbx(fixtureKdbx(), vaultCredentials(vaultKey));
    const again = await openKdbx(await saveKdbx(db), vaultCredentials(vaultKey));
    expect(fieldText(again.getDefaultGroup().entries[0]!.fields.get("Password"))).toBe("hunter2-but-longer");
  });
});

describe("new vaults and rotation", () => {
  it("creates a KDBX 4 vault with the vault KDF and the name as root group", async () => {
    const key = randomBytes(32);
    const db = createVaultKdbx("Ops", key);
    const reopened = await openKdbx(await saveKdbx(db), vaultCredentials(key));
    expect(reopened.getDefaultGroup().name).toBe("Ops");
    expect(kdfSettings(reopened)).toEqual({ kdf: "argon2id", m: 1048576, t: 2, p: 1 });
  });
  it("re-keys: the old key fails, the new key opens, and newest-first fallback works", async () => {
    const oldKey = randomBytes(32);
    const newKey = randomBytes(32);
    const db = createVaultKdbx("Ops", oldKey);
    const v1 = await saveKdbx(db);
    rekeyToVaultKey(db, newKey);
    const v2 = await saveKdbx(db);
    await expect(openKdbx(v2, vaultCredentials(oldKey))).rejects.toMatchObject({ code: "vault_key_mismatch" });
    expect((await openKdbx(v2, vaultCredentials(newKey))).getDefaultGroup().name).toBe("Ops");
    const keys = [
      { version: 1, key: oldKey },
      { version: 2, key: newKey },
    ];
    // a crash between upload and activate: the blob may be either version
    expect((await openWithKeyVersions(v2, keys)).keyVersion).toBe(2);
    expect((await openWithKeyVersions(v1, keys)).keyVersion).toBe(1);
    await expect(openWithKeyVersions(v1, [{ version: 2, key: newKey }])).rejects.toMatchObject({ code: "vault_key_mismatch" });
    await expect(openWithKeyVersions(v1, [])).rejects.toMatchObject({ code: "no_vault_key" });
  });
});

describe("entry helpers (moved from keepassxc-web)", () => {
  it("password databases: create, add, edit with history, collect", async () => {
    const created = await createNewKdbx("Personal", "pw");
    const opened = await decryptKdbx(created.fileBuffer, "pw");
    expect(opened.dbName).toBe("Personal");
    const db = opened.dbInstance;
    const root = opened.groups[0]!.uuid;
    const e = await addEntryToDb(db, root, { title: "Mail", username: "me", passwordValue: "p1", url: "", notes: "", tags: ["a"] });
    await editEntryInDb(db, e.uuid.toString(), { passwordValue: "p2" });
    expect(e.history).toHaveLength(1);
    const { entries } = collectAllDbData(db);
    expect(entries.map((x) => [x.title, x.passwordValue])).toEqual([["Mail", "p2"]]);
    await expect(decryptKdbx(created.fileBuffer, "wrong")).rejects.toMatchObject({ code: "vault_key_mismatch" });
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
    const db = await openKdbx(fixtureKdbx(), vaultCredentials(vaultKey));
    expect(readField(db, parseReference("ov://x/GitHub%20deploy%20key/password"))).toBe("hunter2-but-longer");
    expect(readField(db, parseReference("ov://x/GitHub%20deploy%20key/username"))).toBe("ci-bot");
    const e = findEntry(db, { groupPath: [], entry: "GitHub deploy key" });
    const hex = Array.from(new Uint8Array(e.uuid.toBytes()), (b) => b.toString(16).padStart(2, "0")).join("");
    expect(readField(db, { groupPath: [], entry: hex, field: "URL" })).toBe("https://github.com");
    writeField(db, { groupPath: [], entry: "GitHub deploy key", field: "password" }, "rotated");
    expect(e.history).toHaveLength(1);
    expect(e.fields.get("Password")).toBeInstanceOf(kdbxweb.ProtectedValue);
    writeField(db, { groupPath: ["CI"], entry: "New", field: "API_TOKEN" }, "t0k", { create: true });
    expect(readField(db, parseReference("ov://x/CI/New/api_token"))).toBe("t0k");
    expect(() => readField(db, parseReference("ov://x/Nope/password"))).toThrow(/not found/);
  });
});

describe("Node Buffers", () => {
  it("opens from a Buffer that is a view into a larger pool", async () => {
    const pooled = Buffer.concat([Buffer.alloc(100, 1), Buffer.from(fixtureKdbx()), Buffer.alloc(50, 2)]);
    const view = pooled.subarray(100, pooled.length - 50);
    const db = await openKdbx(view, vaultCredentials(vaultKey));
    expect(db.getDefaultGroup().name).toBe("Team Infrastructure");
  });
});

describe("key copies", () => {
  it("never wipes a caller's Buffer key", async () => {
    const k = Buffer.from(vaultKey);
    await openKdbx(fixtureKdbx(), vaultCredentials(k));
    expect(new Uint8Array(k)).toEqual(vaultKey);
  });
});

import { describe, expect, it } from "vitest";
import { Account, MemoryStorage } from "./e2e-imports.js";
import { FakeAuthServer, ISSUER } from "./helpers/auth-server.js";
import { FakeSyncServer } from "./helpers/sync-server.js";
import { addEntry } from "./helpers/dbs.js";
import { b64u, fromB64u } from "../src/util/bytes.js";
import { finishLogin, opaqueIds, startLogin } from "../src/opaque/index.js";
import { isOpenVireoError } from "../src/errors.js";

const kdf = { m: 19456, t: 2 };
const device = { name: "web", platform: "web" as const };

/**
 * alice with a personal vault "Home" and access to bob's vault "Bob's", then a reset approved and
 * done on a fresh device with a new password.
 */
async function world() {
  const auth = new FakeAuthServer();
  const sync = new FakeSyncServer();
  auth.onToken = (t) => sync.tokens.add(t);
  const fetch = (url: string, init?: RequestInit) => (new URL(url).host === "sync.example" ? sync.fetch(url, init) : auth.fetch(url, init));
  const connect = (storage = new MemoryStorage()) => Account.connect({ issuer: ISSUER, fetch, storage, device });

  const oldStorage = new MemoryStorage();
  const old = await connect(oldStorage);
  const { secretKey: oldSecretKey } = await old.register({ email: "alice@example.com", password: "old pw", kdf });
  const home = await old.createVault("Home");
  addEntry(home.db!, "Bank", { Password: "hunter2" }, 1000);
  await home.sync();

  const bob = await connect();
  await bob.register({ email: "bob@example.com", password: "bob pw", kdf });
  const bobs = await bob.createVault("Bob's");
  addEntry(bobs.db!, "Wifi", { Password: "guest" }, 1000);
  await bobs.sync();
  await bob.share(bobs.id, { email: "alice@example.com" }, "write");

  return { auth, sync, fetch, connect, old, oldStorage, oldSecretKey, bob, home: home.id, bobs: bobs.id };
}

async function resetWorld() {
  const w = await world();
  const token = w.auth.approveReset("alice@example.com");
  const storage = new MemoryStorage();
  const alice = await w.connect(storage);
  const { secretKey } = await alice.recover({ token, password: "new pw", kdf });
  return { ...w, token, alice, storage, secretKey };
}

const pathCalls = (auth: FakeAuthServer, suffix: string) => auth.calls.filter((c) => c.path.endsWith(suffix)).length;

describe("Account recovery: reset (SPEC.md §18)", () => {
  it("shows what the reset will do, then starts the account with new keys and an Emergency Kit", async () => {
    const w = await world();
    w.auth.totp.set("alice@example.com", "123456");
    const token = w.auth.approveReset("alice@example.com");
    const storage = new MemoryStorage();
    const alice = await w.connect(storage);
    const info = await alice.recoverInfo(token);
    expect(info).toMatchObject({ email: "alice@example.com", archiveDays: 30, archives: { personalVaults: 1, sharedGrants: 1, soleAdminOrgs: [] } });
    expect(Date.parse(info.notBefore)).toBeLessThanOrEqual(Date.now());
    expect(Date.parse(info.expiresAt)).toBeGreaterThan(Date.now());

    const oldFp = w.old.fingerprint;
    const { secretKey } = await alice.recover({ token, password: "new pw", kdf });
    expect(secretKey).toMatch(/^K1-/);
    expect(secretKey).not.toBe(w.oldSecretKey);
    expect([alice.signedIn, alice.unlocked, alice.email]).toEqual([true, true, "alice@example.com"]);
    expect(alice.userId).toBe(w.old.userId);
    expect(alice.fingerprint).not.toBe(oldFp);
    expect(await alice.secretKey()).toBe(secretKey);
    expect(await alice.listVaults()).toEqual([]);
    expect(JSON.stringify(w.auth.calls.map((c) => c.json))).not.toContain("new pw");
    expect(await alice.recoveryStatus()).toEqual({ archived: true, email: "alice@example.com", expiresAt: expect.any(String), vaults: 2, locked: false });
    // TOTP is off and the old device is signed out
    expect(w.auth.totp.has("alice@example.com")).toBe(false);
    await expect(w.old.listVaults()).rejects.toMatchObject({ status: 401 });
    // bob keeps his vault
    expect((await w.bob.listVaults()).map((v) => v.name)).toEqual(["Bob's"]);

    // the link is single use
    await expect(alice.recoverInfo(token)).rejects.toMatchObject({ code: "session_expired", status: 410 });

    // unlock after a restart uses the stored new Secret Key and the new password
    const resumed = await w.connect(storage);
    expect([resumed.signedIn, resumed.unlocked]).toEqual([true, false]);
    await expect(resumed.unlock("old pw")).rejects.toMatchObject({ code: "unauthorized" });
    await resumed.unlock("new pw");
    expect(resumed.fingerprint).toBe(alice.fingerprint);

    // another device signs in with the new Emergency Kit; the old password and Secret Key are gone
    const laptop = await w.connect();
    await expect(laptop.login({ email: "alice@example.com", password: "old pw", secretKey: w.oldSecretKey })).rejects.toMatchObject({ code: "unauthorized" });
    await expect(laptop.login({ email: "alice@example.com", password: "new pw", secretKey: w.oldSecretKey })).rejects.toMatchObject({ code: "unauthorized" });
    await laptop.login({ email: "alice@example.com", password: "new pw", secretKey });
    expect(laptop.fingerprint).toBe(alice.fingerprint);
  });

  it("surfaces recovery_not_ready with not_before, and recovery_cancelled", async () => {
    const w = await world();
    const token = w.auth.approveReset("alice@example.com", { delaySeconds: 24 * 3600 });
    const alice = await w.connect();
    const err = await alice.recoverInfo(token).catch((e) => e);
    expect(isOpenVireoError(err, "recovery_not_ready")).toBe(true);
    expect(err.status).toBe(409);
    expect(err.details.notBefore).toBe(new Date(w.auth.recoveries.get(token)!.notBefore).toISOString());
    await expect(alice.recover({ token, password: "new pw", kdf })).rejects.toMatchObject({ code: "recovery_not_ready", details: { notBefore: err.details.notBefore } });
    expect(pathCalls(w.auth, "/auth/recover/start")).toBe(0);
    // the low-level start route maps the same way
    await expect(alice.auth.recoverStart({ token, request: "AA" })).rejects.toMatchObject({ code: "recovery_not_ready", details: { notBefore: err.details.notBefore } });

    w.auth.cancelReset(token);
    await expect(alice.recoverInfo(token)).rejects.toMatchObject({ code: "recovery_cancelled", status: 410 });
    await expect(alice.recover({ token, password: "new pw", kdf })).rejects.toMatchObject({ code: "recovery_cancelled" });
    expect(alice.signedIn).toBe(false);
    // nothing changed: the old keys still sign in
    const again = await w.connect();
    await again.login({ email: "alice@example.com", password: "old pw", secretKey: w.oldSecretKey });
  });

  it("says when there is no archive", async () => {
    const w = await world();
    expect(await w.old.recoveryStatus()).toEqual({ archived: false });
    await expect(w.old.restoreFromArchive({ oldPassword: "old pw", oldSecretKey: w.oldSecretKey })).rejects.toMatchObject({ code: "not_found", status: 404 });
  });
});

describe("Account recovery: restore within 30 days (SPEC.md §18)", () => {
  it("re-seals the archived vault keys to the new keyset", async () => {
    const w = await resetWorld();
    const { restored } = await w.alice.restoreFromArchive({ oldPassword: "old pw", oldSecretKey: w.oldSecretKey });
    expect(restored).toBe(2);
    expect((await w.alice.listVaults()).map((v) => [v.name, v.role]).sort()).toEqual([
      ["Bob's", "write"],
      ["Home", "manage"],
    ]);
    expect((await w.alice.openVault(w.home)).read("ov://Home/Bank/password")).toBe("hunter2");
    expect((await w.alice.openVault(w.bobs)).read("ov://x/Wifi/password")).toBe("guest");
    expect(await w.alice.recoveryStatus()).toEqual({ archived: false });
    expect(JSON.stringify(w.auth.calls.map((c) => c.json))).not.toContain("old pw");
    // the new password and Secret Key stay; another device opens the restored vaults with them
    const laptop = await w.connect();
    await laptop.login({ email: "alice@example.com", password: "new pw", secretKey: w.secretKey });
    expect((await laptop.openVault(w.home)).read("ov://Home/Bank/password")).toBe("hunter2");
  });

  it("signs in to the archive with the old email after the email changed", async () => {
    const w = await resetWorld();
    expect(await w.alice.recoveryStatus()).toMatchObject({ archived: true, email: "alice@example.com" });
    await w.alice.requestEmailChange("alice@new.example");
    await w.alice.changeEmail({ email: "alice@new.example", code: w.auth.emailCodes.get(w.alice.userId!)!.code, password: "new pw" });
    const { restored } = await w.alice.restoreFromArchive({ oldPassword: "old pw", oldSecretKey: w.oldSecretKey });
    expect(restored).toBe(2);
    expect((await w.alice.openVault(w.home)).read("ov://Home/Bank/password")).toBe("hunter2");
  });

  it("refuses a wrong old password with 401 and restores nothing", async () => {
    const w = await resetWorld();
    const err = await w.alice.restoreFromArchive({ oldPassword: "nope", oldSecretKey: w.oldSecretKey }).catch((e) => e);
    expect(err).toMatchObject({ code: "unauthorized", status: 401 });
    expect(pathCalls(w.auth, "/restore/finish")).toBe(0);
    expect((await w.alice.recoveryStatus()).archived).toBe(true);
  });

  it("fails locally on a wrong old Secret Key, before finish", async () => {
    const w = await resetWorld();
    // a well-formed Secret Key that isn't the old one (the new one)
    const err = await w.alice.restoreFromArchive({ oldPassword: "old pw", oldSecretKey: w.secretKey }).catch((e) => e);
    expect(err).toMatchObject({ code: "invalid_secret_key" });
    expect(err.status).toBeUndefined();
    expect(pathCalls(w.auth, "/restore/verify")).toBe(1);
    expect(pathCalls(w.auth, "/restore/finish")).toBe(0);
    expect(w.auth.archives.get(w.alice.userId!)!.failures).toBe(0);
    await expect(w.alice.restoreFromArchive({ oldPassword: "old pw", oldSecretKey: "K1-not-a-key" })).rejects.toMatchObject({ code: "invalid_secret_key" });
    // the right one still works afterwards
    expect((await w.alice.restoreFromArchive({ oldPassword: "old pw", oldSecretKey: w.oldSecretKey })).restored).toBe(2);
  });

  it("leaves out grants on vaults rotated since the reset", async () => {
    const w = await resetWorld();
    await w.bob.rotate(w.bobs);
    const { restored } = await w.alice.restoreFromArchive({ oldPassword: "old pw", oldSecretKey: w.oldSecretKey });
    expect(restored).toBe(1);
    expect((await w.alice.listVaults()).map((v) => v.name)).toEqual(["Home"]);
  });

  it("surfaces restore_locked, invalid_proof and a token that is too old", async () => {
    const w = await resetWorld();
    const archive = w.auth.archives.get(w.alice.userId!)!;

    // a proof signed by the new keyset instead of the old one, through the low-level client
    const login = await startLogin("old pw");
    const started = await w.alice.auth.restoreStart({ ke1: b64u(login.ke1) });
    const { authU } = await finishLogin(login.state, fromB64u(started.ke2), opaqueIds("alice@example.com", "auth.example"));
    const verified = await w.alice.auth.restoreVerify({ session_id: started.session_id, auth_u: b64u(authU) });
    expect(verified.grants.map((g) => g.principal)).toEqual([w.alice.principal, w.alice.principal]);
    await expect(w.alice.auth.restoreFinish({ session_id: verified.session_id, grants: [], proof: b64u(new Uint8Array(64)) })).rejects.toMatchObject({
      code: "invalid_proof",
      status: 400,
    });
    expect(archive.failures).toBe(1);

    w.auth.recentTokenMs = -1;
    await expect(w.alice.restoreFromArchive({ oldPassword: "old pw", oldSecretKey: w.oldSecretKey })).rejects.toMatchObject({ code: "forbidden", status: 403 });
    w.auth.recentTokenMs = 5 * 60_000;

    archive.failures = 9;
    await expect(w.alice.auth.restoreFinish({ session_id: verified.session_id, grants: [], proof: b64u(new Uint8Array(64)) })).rejects.toMatchObject({ code: "invalid_proof" });
    expect(archive.locked).toBe(true);
    expect((await w.alice.recoveryStatus()).locked).toBe(true);
    await expect(w.alice.restoreFromArchive({ oldPassword: "old pw", oldSecretKey: w.oldSecretKey })).rejects.toMatchObject({ code: "restore_locked", status: 403 });
  });
});

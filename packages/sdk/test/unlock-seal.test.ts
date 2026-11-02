import { describe, expect, it } from "vitest";
import { Account, MemoryStorage, kdbxweb, openKdbx, passwordCredentials, passwordHash, passwordHashCredentials, saveKdbx } from "../src/index.js";
import { FakeAuthServer, FakeSyncServer, ISSUER } from "../src/testing/index.js";
import { addEntry, get } from "./helpers/dbs.js";

const kdf = { m: 19456, t: 2 };
const device = { name: "web", platform: "web" as const };

function servers() {
  const auth = new FakeAuthServer();
  const sync = new FakeSyncServer();
  auth.onToken = (t) => sync.tokens.add(t);
  const net = { up: true };
  const route = (url: string, init?: RequestInit) => (new URL(url).host === "sync.example" ? sync.fetch(url, init) : auth.fetch(url, init));
  const fetch = (url: string, init?: RequestInit) => (net.up ? route(url, init) : Promise.reject(new TypeError("fetch failed")));
  return { auth, net, fetch };
}

const sealingKey = () => crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);

/** One browser: its storage survives a "reload", which is a new Account.connect on the same storage. */
async function signedUp(email = "alice@example.com") {
  const s = servers();
  const storage = new MemoryStorage();
  const connect = () => Account.connect({ issuer: ISSUER, fetch: s.fetch, storage, device, offline: true });
  const acct = await connect();
  await acct.register({ email, password: "pw", kdf });
  return { ...s, storage, connect, acct };
}

describe("Account.sealUnlocked / resumeUnlocked", () => {
  it("resumes after a reload without the password, and the vaults open", async () => {
    const { acct, connect } = await signedUp();
    const vault = await acct.createVault("Personal");
    addEntry(vault.db!, "GitHub", { Password: "s3cret" }, 1000);
    await vault.sync();
    const key = await sealingKey();
    const sealed = await acct.sealUnlocked(key);
    expect(sealed).toMatch(/^s1\.[\w-]+\.[\w-]+$/);

    const reloaded = await connect();
    expect(reloaded.unlocked).toBe(false);
    await reloaded.resumeUnlocked(sealed, key);
    expect(reloaded.unlocked).toBe(true);
    expect(reloaded.fingerprint).toBe(acct.fingerprint);
    const v = await reloaded.openVault(vault.id);
    expect(get(v.db!, "GitHub", "Password")).toBe("s3cret");
    expect(v.read("ov://Personal/GitHub/password")).toBe("s3cret");

    reloaded.lock();
    expect(reloaded.unlocked).toBe(false);
  });

  it("needs to be unlocked to seal", async () => {
    const { acct } = await signedUp();
    acct.lock();
    await expect(acct.sealUnlocked(await sealingKey())).rejects.toMatchObject({ code: "signed_out" });
  });

  it("rejects another key, a tampered seal and garbage", async () => {
    const { acct, connect } = await signedUp();
    const sealed = await acct.sealUnlocked(await sealingKey());
    const reloaded = await connect();
    await expect(reloaded.resumeUnlocked(sealed, await sealingKey())).rejects.toMatchObject({ code: "decryption_failed" });
    const [v, iv, data] = sealed.split(".") as [string, string, string];
    const flipped = `${v}.${iv}.${data.slice(0, -2)}${data.endsWith("A") ? "B" : "A"}${data.slice(-1)}`;
    await expect(reloaded.resumeUnlocked(flipped, await sealingKey())).rejects.toMatchObject({ code: "decryption_failed" });
    await expect(reloaded.resumeUnlocked("nope", await sealingKey())).rejects.toMatchObject({ code: "unsupported_version" });
    expect(reloaded.unlocked).toBe(false);
  });

  it("is bound to the user: another account's session can't use it", async () => {
    const alice = await signedUp("alice@example.com");
    const key = await sealingKey();
    const sealed = await alice.acct.sealUnlocked(key);
    // same browser storage, now signed in as bob
    await alice.acct.logout();
    const bob = await alice.connect();
    await bob.register({ email: "bob@example.com", password: "pw", kdf });
    bob.lock();
    await expect(bob.resumeUnlocked(sealed, key)).rejects.toMatchObject({ code: "decryption_failed" });
  });

  it("fails once signed out", async () => {
    const { acct, connect } = await signedUp();
    const key = await sealingKey();
    const sealed = await acct.sealUnlocked(key);
    await acct.logout();
    await expect((await connect()).resumeUnlocked(sealed, key)).rejects.toMatchObject({ code: "signed_out" });
  });

  it("fails when the account's keys changed (e.g. after a reset)", async () => {
    const { acct, auth, connect } = await signedUp();
    const key = await sealingKey();
    const sealed = await acct.sealUnlocked(key);
    const other = await signedUp("other@example.com");
    auth.users.get("alice@example.com").keyset = other.auth.users.get("other@example.com").keyset;
    const reloaded = await connect();
    await expect(reloaded.resumeUnlocked(sealed, key)).rejects.toMatchObject({ code: "invalid_public_keys" });
    expect(reloaded.unlocked).toBe(false);
  });

  it("resumes offline from the cached profile", async () => {
    const { acct, net, connect } = await signedUp();
    const vault = await acct.createVault("Personal");
    await acct.openVault(vault.id);
    const key = await sealingKey();
    const sealed = await acct.sealUnlocked(key);
    net.up = false;
    const reloaded = await connect();
    expect(reloaded.offline).toBe(true);
    await reloaded.resumeUnlocked(sealed, key);
    expect([reloaded.unlocked, reloaded.offline]).toEqual([true, true]);
    expect((await reloaded.openVault(vault.id)).offline).toBe(true);
  });
});

describe("passwordHash / passwordHashCredentials", () => {
  it("opens a password database like the password does, and saves so the password still opens it", async () => {
    const db = kdbxweb.Kdbx.create(new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString("local pw ü")), "Home");
    addEntry(db, "Wifi", { Password: "hunter2" }, 1000);
    const bytes = await saveKdbx(db);

    const hash = await passwordHash("local pw ü");
    expect(hash.length).toBe(32);
    const factory = passwordHashCredentials(hash);
    const opened = await openKdbx(bytes, factory);
    expect(get(opened, "Wifi", "Password")).toBe("hunter2");
    // the factory makes fresh credentials each time
    await openKdbx(bytes, factory);

    addEntry(opened, "Router", { Password: "admin" }, 2000);
    const again = await openKdbx(await saveKdbx(opened), passwordCredentials("local pw ü"));
    expect(get(again, "Router", "Password")).toBe("admin");

    await expect(openKdbx(bytes, passwordHashCredentials(await passwordHash("wrong")))).rejects.toMatchObject({ code: "vault_key_mismatch" });
    expect(() => passwordHashCredentials(new Uint8Array(16))).toThrow(/32 bytes/);
  });
});

import { describe, expect, it } from "vitest";
import { Account, MemoryStorage } from "./e2e-imports.js";
import { FakeAuthServer, ISSUER } from "./helpers/auth-server.js";
import { FakeSyncServer } from "./helpers/sync-server.js";
import { addEntry } from "./helpers/dbs.js";

const kdf = { m: 19456, t: 2 };
const device = { name: "web", platform: "web" } as const;

/** One browser's storage, with two accounts, as the web app opens them (SPEC §21). */
function browser() {
  const auth = new FakeAuthServer();
  const sync = new FakeSyncServer();
  auth.onToken = (t) => sync.tokens.add(t);
  const net = { up: true };
  const fetch = (url: string, init?: RequestInit) => {
    if (!net.up) return Promise.reject(new TypeError("fetch failed"));
    return new URL(url).host === "sync.example" ? sync.fetch(url, init) : auth.fetch(url, init);
  };
  const storage = new MemoryStorage();
  const connect = () => Account.connect({ issuer: ISSUER, fetch, storage, device, offline: true });
  return { auth, sync, net, fetch, storage, connect };
}

describe("several accounts on a device (SPEC §21)", () => {
  it("comes back with only the password, with no sign-in or TOTP", async () => {
    const b = browser();
    const acct = await b.connect();
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    const alice = acct.userId!;
    const vault = await acct.createVault("Hers");
    addEntry(vault.db!, "Mail", { Password: "s3cret" }, 1000);
    await vault.sync();
    expect(await Account.sessionState(b.storage, { issuer: ISSUER, userId: alice })).toBe("active");

    expect(await acct.parkSession()).toBe(true);
    expect([acct.signedIn, acct.unlocked]).toEqual([false, false]);
    expect(await Account.sessionState(b.storage, { issuer: ISSUER, userId: alice })).toBe("parked");

    await acct.register({ email: "bob@example.com", password: "bob", kdf });
    const bob = acct.userId!;
    expect(await acct.listVaults()).toEqual([]);
    await acct.parkSession();

    const logins = b.auth.calls.length;
    expect(await acct.resumeSession(alice)).toBe(true);
    await acct.unlock("pw");
    expect(acct.email).toBe("alice@example.com");
    expect(b.auth.calls.slice(logins).some((c) => c.url.includes("/auth/login"))).toBe(false);
    const reopened = await acct.openVault(vault.id);
    expect(reopened.read("ov://Hers/Mail/password")).toBe("s3cret");
    expect(await Account.sessionState(b.storage, { issuer: ISSUER, userId: bob })).toBe("parked");
  });

  it("comes back offline, from the cache", async () => {
    const b = browser();
    const acct = await b.connect();
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    const alice = acct.userId!;
    const vault = await acct.createVault("Hers");
    addEntry(vault.db!, "Mail", { Password: "s3cret" }, 1000);
    await vault.sync();
    await acct.listVaults();
    await acct.parkSession();

    b.net.up = false;
    expect(await acct.resumeSession(alice)).toBe(true);
    await acct.unlock("pw");
    expect(acct.offline).toBe(true);
    expect((await acct.openVault(vault.id)).read("ov://Hers/Mail/password")).toBe("s3cret");
  });

  it("refuses to resume over another open account, and has nothing to resume once ended", async () => {
    const b = browser();
    const acct = await b.connect();
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    const alice = acct.userId!;
    await acct.parkSession();
    await acct.register({ email: "bob@example.com", password: "bob", kdf });
    await expect(acct.resumeSession(alice)).rejects.toMatchObject({ code: "server_error" });
    expect(await acct.resumeSession(acct.userId!)).toBe(true);
    await acct.logoutParked(alice);
    await acct.parkSession();
    expect(await acct.resumeSession(alice)).toBe(false);
  });

  it("a crash mid-move leaves the active session in charge", async () => {
    const b = browser();
    const acct = await b.connect();
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    const alice = acct.userId!;
    const session = await b.storage.get("ov:session");
    await acct.parkSession();
    await b.storage.set("ov:session", session!);
    expect(await Account.sessionState(b.storage, { issuer: ISSUER, userId: alice })).toBe("active");
    expect(await b.storage.get(`ov:parked_session:${new URL(ISSUER).host}:${alice}`)).toBeNull();
  });

  it("keeps accounts' data apart when they share a vault", async () => {
    const b = browser();
    const acct = await b.connect();
    await acct.register({ email: "bob@example.com", password: "bob", kdf });
    const bob = acct.userId!;
    await acct.parkSession();
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    const alice = acct.userId!;
    const vault = await acct.createVault("Team");
    addEntry(vault.db!, "Mail", { Password: "shared" }, 1000);
    await vault.sync();
    await acct.share(vault.id, { email: "bob@example.com" }, "write");
    await acct.listVaults();
    await acct.parkSession();

    await acct.resumeSession(bob);
    await acct.unlock("bob");
    await acct.listVaults();
    const hisCopy = await acct.openVault(vault.id);
    await hisCopy.sync();
    const key = `sync:${bob}:${vault.id}`;
    expect(await b.storage.get(key)).not.toBeNull();

    // her session ends: his copy stays
    await acct.logoutParked(alice);
    expect(await b.storage.get(key)).not.toBeNull();
    expect(await b.storage.get(`sync:${alice}:${vault.id}`)).toBeNull();
  });

  it("reads the keys from before they were per user and per server, and moves them once they've worked", async () => {
    const b = browser();
    const acct = await b.connect();
    const { secretKey } = await acct.register({ email: "alice@example.com", password: "pw", kdf });
    const vault = await acct.createVault("Hers");
    await vault.sync();
    const user = acct.userId!, host = new URL(ISSUER).host;
    const [sk, state] = [`secret_key:${host}:alice@example.com`, `sync:${user}:${vault.id}`];
    // what the previous version left
    await b.storage.delete(sk);
    await b.storage.set("secret_key:alice@example.com", secretKey);
    await b.storage.set(`sync:${vault.id}`, (await b.storage.get(state))!);
    await b.storage.delete(state);

    const later = await b.connect();
    expect(await later.hasSecretKey("alice@example.com")).toBe(true);
    await later.logout();
    const again = await b.connect();
    await again.login({ email: "alice@example.com", password: "pw" });
    expect(await b.storage.get(sk)).toBe(secretKey);
    expect(await b.storage.get("secret_key:alice@example.com")).toBeNull();
  });

  it("checks a parked session: rotates it, ends it on a refusal, and changes nothing with no answer", async () => {
    const b = browser();
    const acct = await b.connect();
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    const alice = acct.userId!;
    const vault = await acct.createVault("Hers");
    await vault.sync();
    await acct.listVaults();
    await acct.parkSession();
    await acct.register({ email: "bob@example.com", password: "bob", kdf });
    const parkedKey = `ov:parked_session:${new URL(ISSUER).host}:${alice}`;
    const before = await b.storage.get(parkedKey);

    expect(await acct.checkParkedSession(alice)).toBe("valid");
    const rotated = await b.storage.get(parkedKey);
    expect(rotated).not.toBe(before);

    b.net.up = false;
    expect(await acct.checkParkedSession(alice)).toBe("no_answer");
    expect(await b.storage.get(parkedKey)).toBe(rotated);
    b.net.up = true;

    // her token is refused
    await b.storage.set(parkedKey, JSON.stringify({ ...JSON.parse(rotated!), refreshToken: "ov_rt_revoked" }));
    expect(await acct.checkParkedSession(alice)).toBe("ended");
    expect(await Account.sessionState(b.storage, { issuer: ISSUER, userId: alice })).toBe("signed_out");
    expect(await b.storage.get(`offline:profile:${alice}`)).toBeNull();
    expect(acct.signedIn).toBe(true);
  });

  it("forgets a device signed out, refuses the open account, and leaves others alone", async () => {
    const b = browser();
    const acct = await b.connect();
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    await expect(acct.forgetDevice("alice@example.com")).rejects.toMatchObject({ code: "server_error" });
    await acct.logout();
    await acct.register({ email: "bob@example.com", password: "bob", kdf });
    expect(await acct.hasSecretKey("alice@example.com")).toBe(true);
    await acct.forgetDevice("alice@example.com");
    expect(await acct.hasSecretKey("alice@example.com")).toBe(false);
    expect(await acct.hasSecretKey("bob@example.com")).toBe(true);
  });

  it("logs out on unload with a request that outlives the page", async () => {
    const b = browser();
    const seen: RequestInit[] = [];
    const acct = await Account.connect({
      issuer: ISSUER,
      device,
      fetch: (url: string, init?: RequestInit) => {
        if (url.endsWith("/auth/logout")) seen.push(init!);
        return b.fetch(url, init);
      },
    });
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    acct.logoutOnUnload();
    expect(acct.unlocked).toBe(false);
    expect(seen[0]).toMatchObject({ method: "POST", keepalive: true });
  });
});

import { describe, expect, it } from "vitest";
import { Account, MemoryStorage, VaultUploadError, kdbxweb, kdfSettings, openKdbx, passwordCredentials, saveKdbx, vaultCredentials } from "../src/index.js";
import { FakeAuthServer, FakeSyncServer, ISSUER } from "../src/testing/index.js";
import { addEntry, edit, get } from "./helpers/dbs.js";

const kdf = { m: 19456, t: 2 };
const device = { name: "web", platform: "web" as const };

function servers() {
  const auth = new FakeAuthServer();
  const sync = new FakeSyncServer();
  auth.onToken = (t) => sync.tokens.add(t);
  const route = (url: string, init?: RequestInit) => (new URL(url).host === "sync.example" ? sync.fetch(url, init) : auth.fetch(url, init));
  return { auth, sync, route };
}

/** One device: its own storage and a network switch. */
function deviceOn(route: (url: string, init?: RequestInit) => Promise<Response>) {
  const net = { up: true };
  const fetch = (url: string, init?: RequestInit) => (net.up ? route(url, init) : Promise.reject(new TypeError("fetch failed")));
  const storage = new MemoryStorage();
  const connect = () => Account.connect({ issuer: ISSUER, fetch, storage, device, offline: true });
  return { net, fetch, storage, connect };
}

/** A local password database as the web app or Qt would have it, with KeePassXC remote settings. */
async function localDatabase(version: 3 | 4 = 4) {
  const db = kdbxweb.Kdbx.create(new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString("local pw")), "Home");
  if (version === 3) db.setVersion(3);
  addEntry(db, "Wifi", { Password: "hunter2", UserName: "me" }, 1000);
  db.meta.customData.set("KPXC_REMOTE_SYNC_SETTINGS", {
    value: JSON.stringify([
      { name: "home server", type: "syncServer", serverUrl: "https://sync.home", serverDatabaseId: "home", autoSync: true },
      { name: "scp", downloadCommand: "scp host:db.kdbx {TEMP_DATABASE}", uploadCommand: "scp {TEMP_DATABASE} host:db.kdbx" },
    ]),
  });
  // Opened from its bytes, like a database the app decrypted with the password
  return openKdbx(await saveKdbx(db), passwordCredentials("local pw"));
}

const remotes = (db: kdbxweb.Kdbx) => JSON.parse(db.meta.customData.get("KPXC_REMOTE_SYNC_SETTINGS")?.value ?? "[]") as { name: string }[];

describe("Account.importVault (Move to account)", () => {
  it("re-keys a copy to a fresh vault key and uploads it with If-None-Match: *, leaving the original as it was", async () => {
    const { sync, route } = servers();
    const alice = await deviceOn(route).connect();
    const { secretKey } = await alice.register({ email: "alice@example.com", password: "pw", kdf });
    const source = await localDatabase(3);
    edit(source, "Wifi", { Password: "unsaved change" }, 2000); // not saved yet: it moves too

    const vault = await alice.importVault(source, { name: "Home vault" });
    expect(vault.name).toBe("Home vault");
    const puts = sync.calls.filter((c) => c.method === "PUT" && c.path === `/api/v1/vaults/${vault.id}`);
    expect(puts.map((c) => c.headers["if-none-match"])).toEqual(["*"]);
    expect((await alice.listVaults()).map((v) => [v.name, v.role, v.orgId])).toEqual([["Home vault", "manage", null]]);

    // Another device of the account opens it with the vault key alone (KDBX 4, vault KDF)
    const other = await Account.connect({ issuer: ISSUER, fetch: route, device: { name: "cli", platform: "cli" } });
    await other.login({ email: "alice@example.com", password: "pw", secretKey });
    const opened = await other.openVault(vault.id);
    expect(get(opened.db!, "Wifi", "Password")).toBe("unsaved change");
    expect(opened.db!.getDefaultGroup().name).toBe("Home vault");
    expect(opened.db!.header.versionMajor).toBe(4);
    expect(kdfSettings(opened.db!)).toMatchObject({ kdf: "argon2id", m: 1024 * 1024, t: 2, p: 1 });
    // The self-hosted server remote is gone (it would sync the vault back there); the command one stays
    expect(remotes(opened.db!).map((r) => r.name)).toEqual(["scp"]);
    const blob = sync.blobs.get(`vaults/${vault.id}`)!.at(-1)!.data;
    await expect(openKdbx(blob, passwordCredentials("local pw"))).rejects.toMatchObject({ code: "vault_key_mismatch" });

    // The original keeps its password, version, name and remotes, and still saves and reopens
    expect(source.header.versionMajor).toBe(3);
    expect(source.getDefaultGroup().name).toBe("Home");
    expect(remotes(source).map((r) => r.name)).toEqual(["home server", "scp"]);
    const again = await openKdbx(await saveKdbx(source), passwordCredentials("local pw"));
    expect(get(again, "Wifi", "Password")).toBe("unsaved change");
    await expect(openKdbx(await saveKdbx(source), vaultCredentials(new Uint8Array(32)))).rejects.toMatchObject({ code: "vault_key_mismatch" });
  });

  it("creates an org vault sealed to every confirmed owner and admin, and names it after the root group by default", async () => {
    const { auth, route } = servers();
    const alice = await deviceOn(route).connect();
    await alice.register({ email: "alice@example.com", password: "pw", kdf });
    const carol = await deviceOn(route).connect();
    await carol.register({ email: "carol@example.com", password: "carol pw", kdf });
    const bob = await deviceOn(route).connect();
    await bob.register({ email: "bob@example.com", password: "bob pw", kdf });
    const org = await alice.auth.createOrg("Acme");
    auth.addMember(org.id, "carol@example.com", "admin");
    auth.addMember(org.id, "bob@example.com");
    for (const m of (await alice.auth.listMembers(org.id)).members.filter((x) => x.status === "accepted")) await alice.confirmMember(org.id, m);

    const vault = await alice.importVault(await localDatabase(), { orgId: org.id });
    expect(vault.name).toBe("Home");
    const access = auth.vaults.get(vault.id)!.access;
    expect([...access].map(([p, a]) => [p, a.role]).sort()).toEqual([[alice.principal, "manage"], [carol.principal, "manage"]].sort());
    expect(get((await carol.openVault(vault.id)).db!, "Wifi", "Password")).toBe("hunter2");
    expect(await bob.listVaults()).toEqual([]);

    // A member can't create org vaults; the server says so
    await expect(bob.importVault(await localDatabase(), { orgId: org.id })).rejects.toMatchObject({ status: 403 });
  });

  it("returns the created vault with the error when the first upload fails, so it can be retried", async () => {
    const { route } = servers();
    let syncDown = false;
    const fetch = (url: string, init?: RequestInit) =>
      syncDown && init?.method === "PUT" ? Promise.resolve(new Response(JSON.stringify({ error: "unavailable" }), { status: 503 })) : route(url, init);
    const acct = await Account.connect({ issuer: ISSUER, fetch, device });
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    syncDown = true;
    const err = await acct.importVault(await localDatabase()).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(VaultUploadError);
    expect(err).toMatchObject({ code: "vault_upload_failed", status: 503 });
    const vault = (err as VaultUploadError).vault;
    expect(vault.offline).toBe(true);
    syncDown = false;
    expect((await vault.sync()).outcome).toBe("created");
    expect(vault.offline).toBe(false);
    expect(get(vault.db!, "Wifi", "Password")).toBe("hunter2");
  });
});

describe("Offline account vaults", () => {
  async function aliceWithVault() {
    const w = servers();
    const alice = deviceOn(w.route);
    const acct = await alice.connect();
    const { secretKey } = await acct.register({ email: "alice@example.com", password: "pw", kdf });
    const vault = await acct.createVault("Infra");
    addEntry(vault.db!, "GitHub", { Password: "s3cret" }, 1000);
    await vault.sync();
    return { ...w, alice, secretKey, vaultId: vault.id };
  }

  it("unlocks and opens synced vaults without the network, keeps edits, and uploads them once back online", async () => {
    const { route, alice, secretKey, vaultId, sync } = await aliceWithVault();

    // Next launch, offline: discovery, unlock and the vault list come from the cache
    alice.net.up = false;
    const acct = await alice.connect();
    expect([acct.signedIn, acct.unlocked, acct.offline]).toEqual([true, false, true]);
    await expect(acct.unlock("wrong")).rejects.toMatchObject({ code: "unauthorized" });
    await acct.unlock("pw");
    expect(acct.offline).toBe(true);
    expect((await acct.listVaults()).map((v) => v.name)).toEqual(["Infra"]);
    const vault = await acct.openVault(vaultId);
    expect(vault.offline).toBe(true);
    expect(vault.read("kpx://Infra/GitHub/password")).toBe("s3cret");

    // An offline edit fails to upload but is kept on this device, encrypted with the vault key
    edit(vault.db!, "GitHub", { Password: "changed offline" }, 3000);
    await expect(vault.sync()).rejects.toMatchObject({ code: "network_error" });
    const pending = await alice.storage.get(`sync:${vaultId}:pending`);
    expect(pending).toBeTruthy();
    // Nothing in the cache is in clear
    const everything = JSON.stringify(await Promise.all([`sync:${vaultId}`, `sync:${vaultId}:pending`, `offline:vaults:${acct.userId}`, `offline:profile:${acct.userId}`].map((k) => alice.storage.get(k))));
    expect(everything).not.toContain("s3cret");
    expect(everything).not.toContain("changed offline");
    expect(everything).not.toContain("Infra");

    // The tab is closed and opened again, still offline: the edit is still there
    const later = await alice.connect();
    await later.unlock("pw");
    const reopened = await later.openVault(vaultId);
    expect(reopened.read("kpx://Infra/GitHub/password")).toBe("changed offline");

    // Back online: reconnect, then the next sync merges and uploads the edit
    alice.net.up = true;
    const { vaults, dropped } = await later.reconnect();
    expect([vaults.map((v) => v.id), dropped, later.offline]).toEqual([[vaultId], [], false]);
    expect((await reopened.sync()).outcome).toBe("uploaded");
    expect(reopened.offline).toBe(false);
    expect(await alice.storage.get(`sync:${vaultId}:pending`)).toBeNull();
    expect(sync.blobs.get(`vaults/${vaultId}`)!.length).toBe(3);

    const other = await Account.connect({ issuer: ISSUER, fetch: route, device: { name: "cli", platform: "cli" } });
    await other.login({ email: "alice@example.com", password: "pw", secretKey });
    expect((await other.openVault(vaultId)).read("kpx://Infra/GitHub/password")).toBe("changed offline");
  });

  it("drops a vault whose access was revoked while offline once back online", async () => {
    const { route, alice, vaultId } = await aliceWithVault();
    const acct = await alice.connect();
    await acct.unlock("pw");
    const bobDevice = deviceOn(route);
    const bob = await bobDevice.connect();
    await bob.register({ email: "bob@example.com", password: "bob pw", kdf });
    await acct.share(vaultId, { email: "bob@example.com" }, "write");
    const mine = await bob.createVault("Bob's own");
    await bob.listVaults();
    await bob.openVault(vaultId);

    // Bob goes offline and edits; meanwhile alice revokes him (and rotates the key)
    bobDevice.net.up = false;
    const offlineBob = await bobDevice.connect();
    await offlineBob.unlock("bob pw");
    const shared = await offlineBob.openVault(vaultId);
    edit(shared.db!, "GitHub", { Password: "bob was here" }, 4000);
    await expect(shared.sync()).rejects.toMatchObject({ code: "network_error" });
    await acct.revoke(vaultId, [bob.principal]);

    bobDevice.net.up = true;
    const { vaults, dropped } = await offlineBob.reconnect();
    expect(vaults.map((v) => v.id)).toEqual([mine.id]);
    expect(dropped).toEqual([vaultId]);
    expect(await bobDevice.storage.get(`sync:${vaultId}`)).toBeNull();
    expect(await bobDevice.storage.get(`sync:${vaultId}:pending`)).toBeNull();
    expect(await bobDevice.storage.get(`sync:${mine.id}`)).not.toBeNull();

    // Offline again: the revoked vault is gone from the cache too
    bobDevice.net.up = false;
    const after = await bobDevice.connect();
    await after.unlock("bob pw");
    expect((await after.listVaults()).map((v) => v.id)).toEqual([mine.id]);
    await expect(after.openVault(vaultId)).rejects.toMatchObject({ code: "network_error" });
  });

  it("can't open a vault offline that was never synced on this device", async () => {
    const { route, alice, secretKey, vaultId } = await aliceWithVault();
    const laptop = deviceOn(route);
    const acct = await laptop.connect();
    await acct.login({ email: "alice@example.com", password: "pw", secretKey });
    await acct.listVaults();
    laptop.net.up = false;
    await expect(acct.openVault(vaultId)).rejects.toMatchObject({ code: "not_available_offline" });
    expect(alice).toBeTruthy();
  });

  it("forgets the offline cache on sign-out", async () => {
    const { alice, vaultId } = await aliceWithVault();
    const acct = await alice.connect();
    const userId = acct.userId!;
    expect(await alice.storage.get(`sync:${vaultId}`)).not.toBeNull();
    await acct.logout();
    for (const k of [`sync:${vaultId}`, `offline:vaults:${userId}`, `offline:profile:${userId}`]) expect(await alice.storage.get(k)).toBeNull();
    alice.net.up = false;
    const next = await alice.connect();
    expect(next.signedIn).toBe(false);
  });

  it("keeps no offline cache unless asked to", async () => {
    const { route } = servers();
    const storage = new MemoryStorage();
    const acct = await Account.connect({ issuer: ISSUER, fetch: route, storage, device });
    await acct.register({ email: "alice@example.com", password: "pw", kdf });
    await acct.listVaults();
    expect(await storage.get(`offline:profile:${acct.userId}`)).toBeNull();
    expect(await storage.get(`offline:vaults:${acct.userId}`)).toBeNull();
    expect(acct.offline).toBe(false);
  });
});

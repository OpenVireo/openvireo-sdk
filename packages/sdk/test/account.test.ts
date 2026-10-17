import { describe, expect, it } from "vitest";
import { Account, MemoryStorage, SelfHostedSync, ServiceAccount, openKdbx, vaultCredentials, get } from "./e2e-imports.js";
import { CONFIG, FakeAuthServer, ISSUER } from "./helpers/auth-server.js";
import { FakeSyncServer } from "./helpers/sync-server.js";
import { addEntry } from "./helpers/dbs.js";

function servers() {
  const auth = new FakeAuthServer();
  const sync = new FakeSyncServer();
  auth.onToken = (t) => sync.tokens.add(t);
  const fetch = (url: string, init?: RequestInit) => (new URL(url).host === "sync.example" ? sync.fetch(url, init) : auth.fetch(url, init));
  return { auth, sync, fetch };
}
const kdf = { m: 19456, t: 2 };

describe("Account / ServiceAccount (end to end against in-memory servers)", () => {
  it("register → vault → second device → share → revoke+rotate → service account", async () => {
    const { auth, sync, fetch } = servers();
    const storage = new MemoryStorage();
    const alice = await Account.connect({ issuer: ISSUER, fetch, storage, device: { name: "web", platform: "web" } });
    expect(alice.config).toEqual(CONFIG);
    const { secretKey } = await alice.register({ email: "alice@example.com", password: "correct horse ü", kdf });
    expect(secretKey).toMatch(/^K1-/);
    // the server only ever saw the OPAQUE record and the wrapped keyset
    expect(JSON.stringify([...auth.calls.map((c) => c.json)])).not.toContain("correct horse");

    const vault = await alice.createVault("Team Infra");
    addEntry(vault.db!, "GitHub", { Password: "s3cret", UserName: "ci" }, 1000);
    await vault.sync();
    expect((await alice.listVaults()).map((v) => [v.name, v.role])).toEqual([["Team Infra", "manage"]]);

    // a second device: login with the Secret Key, open the vault
    const alice2 = await Account.connect({ issuer: ISSUER, fetch, device: { name: "cli", platform: "cli" } });
    await expect(alice2.login({ email: "alice@example.com", password: "wrong", secretKey })).rejects.toMatchObject({ code: "unauthorized" });
    await alice2.login({ email: "alice@example.com", password: "correct horse ü", secretKey });
    const v2 = await alice2.openVault(vault.id);
    expect(v2.read("kpx://Team%20Infra/GitHub/password")).toBe("s3cret");

    // resume on device 1 from storage: signed in, locked, unlock with the stored Secret Key
    const resumed = await Account.connect({ issuer: ISSUER, fetch, storage, device: { name: "web", platform: "web" } });
    expect([resumed.signedIn, resumed.unlocked]).toEqual([true, false]);
    await resumed.unlock("correct horse ü");
    expect(resumed.fingerprint).toBe(alice.fingerprint);

    // share with bob, who reads it
    const bob = await Account.connect({ issuer: ISSUER, fetch, device: { name: "web", platform: "web" } });
    const bobKit = await bob.register({ email: "bob@example.com", password: "bob pw", kdf });
    const shared = await alice.share(vault.id, { email: "bob@example.com" }, "read");
    expect(shared.fingerprint).toBe(bob.fingerprint);
    const bv = await bob.openVault(vault.id);
    expect(bv.read("kpx://x/GitHub/username")).toBe("ci");
    const oldBlob = sync.blobs.get(`vaults/${vault.id}`)!.at(-1)!.data;

    // revoke → rotation: bob loses access, the blob is re-keyed, alice's other device follows
    await alice.revoke(vault.id, [bob.principal]);
    const sv = auth.vaults.get(vault.id)!;
    expect([sv.current, sv.pending, sv.access.has(bob.principal)]).toEqual([2, null, false]);
    expect(await bob.listVaults()).toEqual([]);
    const newBlob = sync.blobs.get(`vaults/${vault.id}`)!.at(-1)!.data;
    const oldKey = (await openKdbx(oldBlob, vaultCredentials(new Uint8Array(32))).catch((e) => e)).code;
    expect(oldKey).toBe("vault_key_mismatch");
    // bob's old key (still in his memory) no longer opens the new blob
    await expect(bv.sync()).rejects.toBeTruthy();
    await alice2.listVaults();
    const again = await alice2.openVault(vault.id);
    expect(again.read("kpx://x/GitHub/password")).toBe("s3cret");
    expect((await alice2.listVaults())[0]!.name).toBe("Team Infra");

    // service account in an org with write access
    const org = await alice.auth.createOrg("Acme");
    const { token } = await alice.createServiceAccount(org.id, { name: "ci", vaults: [{ id: vault.id, role: "write" }] });
    expect(token).toMatch(/^kpx_sa_/);
    const sa = await ServiceAccount.fromToken(token, { fetch });
    expect(await sa.read(`kpx://${vault.id}/GitHub/password`)).toBe("s3cret");
    expect((await sa.inject("TOKEN=kpx://Team%20Infra/GitHub/password\n")).text).toBe("TOKEN=s3cret\n");
    await sa.write("kpx://Team%20Infra/GitHub/password", "rotated-by-ci");
    await again.sync();
    expect(again.read("kpx://x/GitHub/password")).toBe("rotated-by-ci");
    // a second secret, issued by an admin without the first one
    const second = await alice.issueServiceAccountSecret(sa.saId);
    const sa2 = await ServiceAccount.fromToken(second.token, { fetch });
    expect(await sa2.read("kpx://Team%20Infra/GitHub/password")).toBe("rotated-by-ci");
    sa.close();
    sa2.close();
    expect(bobKit.secretKey).not.toBe(secretKey);

    await alice.logout();
    expect(alice.signedIn).toBe(false);
  });
});

describe("SelfHostedSync", () => {
  it("pairs with a code and syncs a password database through databases/<id>", async () => {
    const { sync } = servers();
    const storage = new MemoryStorage();
    const sh = await SelfHostedSync.pair("https://sync.example", "ABCD-EFGH", "Web", { fetch: sync.fetch, storage });
    expect(sh.deviceToken).toBe("dev-token-2");
    const { createNewKdbx, passwordCredentials, addEntryToDb } = await import("../src/vault/index.js");
    const { dbInstance: db, groups } = await createNewKdbx("Home", "pw");
    await addEntryToDb(db, groups[0]!.uuid, { title: "Wifi", username: "", passwordValue: "hunter2", url: "", notes: "", tags: [] });
    const r = await sh.syncDatabase("home", { db, credentials: passwordCredentials("pw") });
    expect(r.outcome).toBe("created");
    const restored = await SelfHostedSync.restore("https://sync.example/", { fetch: sync.fetch, storage });
    expect((await restored!.listDatabases()).map((d) => d.id)).toEqual(["home"]);
    const server = await openKdbx(sync.blobs.get("databases/home")!.at(-1)!.data, passwordCredentials("pw"));
    expect(get(server, "Wifi", "Password")).toBe("hunter2");
  });
});

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

describe("Account.login with TOTP", () => {
  async function aliceWithTotp() {
    const { auth, fetch } = servers();
    const alice = await Account.connect({ issuer: ISSUER, fetch, device: { name: "web", platform: "web" } });
    const { secretKey } = await alice.register({ email: "alice@example.com", password: "pw", kdf });
    auth.totp.set("alice@example.com", "123456");
    const device = await Account.connect({ issuer: ISSUER, fetch, device: { name: "cli", platform: "cli" } });
    return { device, secretKey };
  }
  const login = { email: "alice@example.com", password: "pw" };

  it("asks the prompt again after a wrong code, with the invalid_mfa error", async () => {
    const { device, secretKey } = await aliceWithTotp();
    const asked: { attempt: number; code?: string }[] = [];
    await device.login({ ...login, secretKey, totp: async ({ attempt, error }) => (asked.push({ attempt, code: error?.code }), attempt < 3 ? "000000" : "123456") });
    expect(asked).toEqual([{ attempt: 1, code: undefined }, { attempt: 2, code: "invalid_mfa" }, { attempt: 3, code: "invalid_mfa" }]);
    expect(device.unlocked).toBe(true);
  });

  it("fails at once with a fixed wrong code", async () => {
    const { device, secretKey } = await aliceWithTotp();
    await expect(device.login({ ...login, secretKey, totp: "000000" })).rejects.toMatchObject({ code: "invalid_mfa" });
  });

  it("ends the login once the server drops the token after the 5th wrong code", async () => {
    const { device, secretKey } = await aliceWithTotp();
    let asked = 0;
    await expect(device.login({ ...login, secretKey, totp: async () => (++asked, "000000") })).rejects.toMatchObject({ code: "unauthorized" });
    expect(asked).toBe(6);
  });
});

describe("Org members", () => {
  it("confirm with chosen vaults → promote to admin → remove and rotate", async () => {
    const { auth, fetch } = servers();
    const alice = await Account.connect({ issuer: ISSUER, fetch, device: { name: "web", platform: "web" } });
    await alice.register({ email: "alice@example.com", password: "pw", kdf });
    const org = await alice.auth.createOrg("Acme");
    const infra = await alice.createVault("Infra", { orgId: org.id });
    addEntry(infra.db!, "GitHub", { Password: "s3cret" }, 1000);
    await infra.sync();
    const payroll = await alice.createVault("Payroll", { orgId: org.id });
    const { serviceAccount } = await alice.createServiceAccount(org.id, { name: "ci" });

    const bob = await Account.connect({ issuer: ISSUER, fetch, device: { name: "web", platform: "web" } });
    await bob.register({ email: "bob@example.com", password: "bob pw", kdf });
    auth.addMember(org.id, "bob@example.com");
    const pending = (await alice.auth.listMembers(org.id)).members.find((m) => m.email === "bob@example.com")!;
    expect(pending.status).toBe("accepted");

    // a member gets only the vaults picked for them, and no SA master keys
    const confirmed = await alice.confirmMember(org.id, pending, [{ id: infra.id, role: "read" }]);
    expect(confirmed.status).toBe("confirmed");
    expect((await bob.listVaults()).map((v) => [v.name, v.role])).toEqual([["Infra", "read"]]);
    expect((await bob.openVault(infra.id)).read("kpx://Infra/GitHub/password")).toBe("s3cret");
    await expect(bob.issueServiceAccountSecret(serviceAccount.id)).rejects.toMatchObject({ code: "forbidden" });

    // promotion: manage on every org vault, and the SA master key
    await alice.setMemberRole(org.id, confirmed, "admin");
    expect((await bob.listVaults()).map((v) => [v.name, v.role]).sort()).toEqual([["Infra", "manage"], ["Payroll", "manage"]]);
    expect((await bob.issueServiceAccountSecret(serviceAccount.id)).token).toMatch(/^kpx_sa_/);

    // removal: access goes at once, and both vault keys rotate
    const { rotated, failed } = await alice.removeMember(org.id, confirmed.user_id);
    expect([rotated.sort(), failed]).toEqual([[infra.id, payroll.id].sort(), []]);
    expect(await bob.listVaults()).toEqual([]);
    expect(auth.vaults.get(infra.id)!.current).toBe(2);
  });

  it("refuses a vault from another org or a member without keys", async () => {
    const { auth, fetch } = servers();
    const alice = await Account.connect({ issuer: ISSUER, fetch, device: { name: "web", platform: "web" } });
    await alice.register({ email: "alice@example.com", password: "pw", kdf });
    const org = await alice.auth.createOrg("Acme");
    const personal = await alice.createVault("Personal");
    const bob = await Account.connect({ issuer: ISSUER, fetch, device: { name: "web", platform: "web" } });
    await bob.register({ email: "bob@example.com", password: "bob pw", kdf });
    auth.addMember(org.id, "bob@example.com");
    const m = (await alice.auth.listMembers(org.id)).members.find((x) => x.email === "bob@example.com")!;
    await expect(alice.confirmMember(org.id, m, [{ id: personal.id, role: "read" }])).rejects.toMatchObject({ code: "invalid_request" });
    await expect(alice.confirmMember(org.id, { ...m, public: undefined })).rejects.toMatchObject({ code: "invalid_request" });
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

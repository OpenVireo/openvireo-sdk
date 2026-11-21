/**
 * What the SDK gets from contract-v1.8 of the shared core: Profile KDF + keys, sharing to confirmed keys,
 * SelfHostedSync.download and health, the web app's plain export, edits made during a sync, and unsynced
 * edits kept after an accidental session end.
 */
import { describe, expect, it } from "vitest";
import { Account, MemoryStorage, SelfHostedSync, fingerprint, isOpenVireoError, passwordCredentials, trustedPublicKeys } from "../src/index.js";
import { FakeAuthServer, FakeSyncServer, ISSUER } from "../src/testing/index.js";
import { addEntry, edit, get, newLocal, openLocal } from "./helpers/dbs.js";

const kdf = { m: 19456, t: 2 };
const device = { name: "web", platform: "web" as const };

function servers() {
  const auth = new FakeAuthServer();
  const sync = new FakeSyncServer();
  auth.onToken = (t) => sync.tokens.add(t);
  const fetch = (url: string, init?: RequestInit) => (new URL(url).host === "sync.example" ? sync.fetch(url, init) : auth.fetch(url, init));
  return { auth, sync, fetch };
}

async function signedUp(fetch: (url: string, init?: RequestInit) => Promise<Response>, email: string, storage = new MemoryStorage()) {
  const a = await Account.connect({ issuer: ISSUER, fetch, storage, device, offline: true });
  const { secretKey } = await a.register({ email, password: "pw", kdf });
  return { account: a, secretKey, storage };
}

describe("Account.me", () => {
  it("has the keyset's KDF parameters and its checked public keys", async () => {
    const { fetch } = servers();
    const { account } = await signedUp(fetch, "alice@example.com");
    const p = await account.me();
    expect(p.kdf).toMatchObject({ alg: "argon2id", m: 19456, t: 2 });
    expect(p.kdf.salt).toMatch(/.+/);
    expect(p.publicKeys.fingerprint).toBe(account.fingerprint);
    expect(fingerprint(p.publicKeys)).toBe(account.fingerprint);
  });
});

describe("Account.shareWithKeys", () => {
  it("shares to the keys the user confirmed, and refuses keys that aren't the grantee's any more", async () => {
    const { auth, fetch } = servers();
    const { account: alice } = await signedUp(fetch, "alice@example.com");
    const { account: bob } = await signedUp(fetch, "bob@example.com");
    const { account: carol } = await signedUp(fetch, "carol@example.com");
    const vault = await alice.createVault("Infra");
    addEntry(vault.vault, "GitHub", { Password: "s3cret" }, 1000);
    await vault.sync();

    // what the share dialog shows before sharing: bob's keys and fingerprint
    const shown = trustedPublicKeys(await alice.auth.lookupUser("bob@example.com"));
    expect(fingerprint(shown)).toBe(bob.fingerprint);

    // keys that aren't bob's (as if he reset his account after the fingerprint was shown): nothing is sealed
    const stale = trustedPublicKeys(await alice.auth.lookupUser("carol@example.com"));
    const err = await alice.shareWithKeys(vault.id, { email: "bob@example.com" }, "read", stale).catch((e) => e);
    expect(isOpenVireoError(err, "invalid_public_keys")).toBe(true);
    expect(auth.vaults.get(vault.id)!.access.has(bob.principal)).toBe(false);

    const r = await alice.shareWithKeys(vault.id, { principal: bob.principal }, "read", shown);
    expect(r).toMatchObject({ principal: bob.principal, fingerprint: bob.fingerprint });
    expect((await bob.openVault(vault.id)).read("ov://x/GitHub/password")).toBe("s3cret");
    expect(carol.fingerprint).not.toBe(bob.fingerprint);
  });
});

describe("SelfHostedSync.download and health", () => {
  it("downloads a database as the server has it, or null", async () => {
    const { sync } = servers();
    const sh = await SelfHostedSync.pair("https://sync.example", "ABCD-EFGH", "Web", { fetch: sync.fetch });
    expect(await sh.download("home")).toBeNull();
    const db = await newLocal("Home", passwordCredentials("pw"));
    addEntry(db, "Wifi", { Password: "hunter2" }, 1000);
    await sh.syncDatabase("home", await db.saveLocal(), passwordCredentials("pw"));
    const bytes = await sh.download("home");
    expect(bytes).toEqual(sync.blobs.get("databases/home")!.at(-1)!.data);
    expect(get(await openLocal(bytes!, passwordCredentials("pw")), "Wifi", "Password")).toBe("hunter2");
    expect(JSON.parse(await sh.health())).toMatchObject({ status: "ok" });
  });

  it("says when an address isn't a sync server", async () => {
    const page = async () => new Response("<html>not here</html>", { status: 404, headers: { "content-type": "text/html" } });
    const sh = SelfHostedSync.connect("https://example.com", "token", { fetch: page });
    await expect(sh.health()).rejects.toMatchObject({ name: "OpenVireoError", code: "not_sync_server", status: 404 });
  });
});

describe("Vault.exportPlain", () => {
  /** The web app's ExportDialog exporter (openvireo-web KeePassContext.exportDatabaseSubset), verbatim. */
  function webExport(rows: { folder: string; title: string; username: string; passwordValue: string; url: string; notes: string }[], format: "json" | "csv") {
    if (format === "json") return JSON.stringify(rows, null, 2);
    const headers = ["Folder", "Title", "Username", "Password", "URL", "Notes"];
    const escape = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
    const lines = rows.map((e) => [escape(e.folder), escape(e.title), escape(e.username), escape(e.passwordValue), escape(e.url), escape(e.notes)].join(","));
    return [headers.join(","), ...lines].join("\n");
  }

  it("writes the web app's exact bytes: own group name as folder, (Untitled Entry), no trailing newline", async () => {
    const v = await newLocal("Home", passwordCredentials("pw"));
    const work = v.addGroup(v.rootGroupId(), "Work");
    const deep = v.addGroup(work, "Deep");
    addEntry(v, "VPN", { UserName: "ops", Password: 'p"w', URL: "https://vpn", Notes: "two\nlines" }, 1000, work);
    addEntry(v, "", { Password: "x" }, 1000, deep);
    const gone = addEntry(v, "Old", { Password: "y" }, 1000, work);
    v.deleteEntry(gone);
    const rows = [
      { folder: "Work", title: "VPN", username: "ops", passwordValue: 'p"w', url: "https://vpn", notes: "two\nlines" },
      { folder: "Deep", title: "(Untitled Entry)", username: "", passwordValue: "x", url: "", notes: "" },
    ];
    const text = (b: Uint8Array) => new TextDecoder().decode(b);
    for (const format of ["csv", "json"] as const) {
      expect(text(v.exportPlain(format, [work, deep]))).toBe(webExport(rows, format));
    }
    expect(text(v.exportPlain("csv", [work, deep]))).not.toMatch(/\n$/);
    expect(text(v.exportPlain("json", []))).toBe("[]");
  });
});

describe("AccountVault.sync with edits made while it runs", () => {
  it("keeps them and uploads them in the same call", async () => {
    const { sync, fetch } = servers();
    const { account: alice, secretKey } = await signedUp(fetch, "alice@example.com");
    const vault = await alice.createVault("Infra");
    addEntry(vault.vault, "GitHub", { Password: "one" }, 1000);
    await vault.sync();

    // an edit lands while the sync is waiting for the server's copy
    edit(vault.vault, "GitHub", { Password: "two" }, 2000);
    let fired = false;
    sync.afterGet = (key) => {
      if (fired || key !== `vaults/${vault.id}`) return;
      fired = true;
      edit(vault.vault, "GitHub", { Notes: "edited during the sync" }, 3000);
    };
    const report = await vault.sync();
    expect(fired).toBe(true);
    expect(report.outcome).toBe("uploaded");
    expect(await vault.vault.hasPendingEdits()).toBe(false);
    expect([get(vault.vault, "GitHub", "Password"), get(vault.vault, "GitHub", "Notes")]).toEqual(["two", "edited during the sync"]);

    const other = await Account.connect({ issuer: ISSUER, fetch, device: { name: "cli", platform: "cli" } });
    await other.login({ email: "alice@example.com", password: "pw", secretKey });
    const theirs = await other.openVault(vault.id);
    expect([theirs.read("ov://x/GitHub/password"), theirs.read("ov://x/GitHub/notes")]).toEqual(["two", "edited during the sync"]);
  });
});

describe("an accidental session end", () => {
  it("keeps the vault's unsynced edits for the same user's next sign-in; logout drops them", async () => {
    const { auth, sync, fetch } = servers();
    const net = { up: true };
    const device1 = (url: string, init?: RequestInit) => (net.up ? fetch(url, init) : Promise.reject(new TypeError("fetch failed")));
    const { account: alice, secretKey, storage } = await signedUp(device1, "alice@example.com");
    const vault = await alice.createVault("Infra");
    addEntry(vault.vault, "GitHub", { Password: "one" }, 1000);
    await vault.sync();

    // an edit made offline stays on the device. The sync state goes with the session, so the kept edit later
    // merges without a base, by modification time: make it a second newer than the server's copy.
    await new Promise((r) => setTimeout(r, 1100));
    net.up = false;
    edit(vault.vault, "GitHub", { Password: "kept" }, 2000);
    await expect(vault.sync()).rejects.toMatchObject({ code: "network_error" });
    net.up = true;

    // the refresh token turns out to be used already (token_reused): the session ends by accident
    const userId = alice.userId!;
    const reasons: string[] = [];
    alice.onSignedOut((r) => reasons.push(r));
    for (const r of auth.refresh.values()) r.used = true;
    await expect(alice.core.accessToken(true)).rejects.toMatchObject({ code: "signed_out" });
    await expect.poll(() => reasons).toContain("token_reused");
    expect(await Account.hasPendingEdits(storage, userId)).toBe(true);

    // signing in again on the same device: opening the vault merges the edit in and uploads it
    const again = await Account.connect({ issuer: ISSUER, fetch: device1, storage, device, offline: true });
    await again.login({ email: "alice@example.com", password: "pw", secretKey });
    const reopened = await again.openVault(vault.id);
    expect(reopened.read("ov://x/GitHub/password")).toBe("kept");
    expect(sync.blobs.get(`vaults/${vault.id}`)!.length).toBe(3);
    expect(await Account.hasPendingEdits(storage, userId)).toBe(false);
    expect((await reopened.sync({ localChanged: false })).outcome).toBe("unchanged");

    // a sign-out drops unsynced edits
    net.up = false;
    edit(reopened.vault, "GitHub", { Password: "dropped" }, 4000);
    await expect(reopened.sync()).rejects.toMatchObject({ code: "network_error" });
    net.up = true;
    await again.logout();
    expect(await Account.hasPendingEdits(storage, userId)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { Account, MemoryStorage, deletionExpired } from "./e2e-imports.js";
import { FakeAuthServer, ISSUER } from "./helpers/auth-server.js";
import { FakeSyncServer } from "./helpers/sync-server.js";
import { isOpenVireoError } from "../src/errors.js";

const kdf = { m: 19456, t: 2 };
const device = { name: "web", platform: "web" as const };

function world() {
  const auth = new FakeAuthServer();
  const sync = new FakeSyncServer();
  auth.onToken = (t) => sync.tokens.add(t);
  const fetch = (url: string, init?: RequestInit) => (new URL(url).host === "sync.example" ? sync.fetch(url, init) : auth.fetch(url, init));
  const connect = (storage = new MemoryStorage()) => Account.connect({ issuer: ISSUER, fetch, storage, device });
  return { auth, sync, connect };
}

async function signedUp(connect: (s?: MemoryStorage) => Promise<Account>, email: string) {
  const storage = new MemoryStorage();
  const acct = await connect(storage);
  const { secretKey } = await acct.register({ email, password: "pw " + email, kdf });
  return { acct, storage, secretKey };
}

describe("account deletion (SPEC §23)", () => {
  it("previews, schedules, signs in to a pending account and restores it", async () => {
    const { auth, connect } = world();
    const { acct: alice, storage } = await signedUp(connect, "alice@example.com");
    const { acct: bob } = await signedUp(connect, "bob@example.com");
    const home = await alice.createVault("Home");
    await home.sync();
    await alice.share(home.id, { email: "bob@example.com" }, "read");

    const preview = await alice.deletionPreview();
    expect(preview.scheduledFor).toBeNull();
    expect(preview.blocked).toBe(false);
    expect(preview.vaults).toEqual([{ id: home.id, name: "Home", sharedWith: [{ principal: bob.principal, display: "bob@example.com", role: "read" }] }]);

    // The password is checked on the device first
    await expect(alice.deleteAccount({ password: "wrong", confirm: "alice@example.com" })).rejects.toMatchObject({ code: "unauthorized" });
    const reasons: string[] = [];
    alice.onSignedOut((r) => reasons.push(r));
    const { scheduledFor } = await alice.deleteAccount({ password: "pw alice@example.com", confirm: " Alice@Example.com " });
    expect(Date.parse(scheduledFor)).toBeGreaterThan(Date.now() + 29 * 86400_000);
    expect(alice.signedIn).toBe(false);
    expect(reasons).toEqual(["deletion_scheduled"]);
    // The Secret Key stays, so the account can still be restored from here
    expect(await alice.hasSecretKey("alice@example.com")).toBe(true);
    expect(auth.accessEvents.at(-1)?.data).toEqual({ vault: null, change: "deletion_scheduled", at: scheduledFor });

    // Signing in again gives a pending session that opens nothing
    const again = await connect(storage);
    await again.login({ email: "alice@example.com", password: "pw alice@example.com" });
    expect(again.deletionScheduledFor).toBe(scheduledFor);
    await expect(again.listVaults()).rejects.toMatchObject({ code: "account_pending_deletion" });
    expect((await again.deletionPreview()).scheduledFor).toBe(scheduledFor);

    // A resumed session learns it from /me
    const resumed = await connect(storage);
    await resumed.unlock("pw alice@example.com");
    expect(resumed.deletionScheduledFor).toBe(scheduledFor);

    await resumed.restoreAccount({ password: "pw alice@example.com" });
    expect(resumed.deletionScheduledFor).toBeNull();
    expect((await resumed.listVaults()).map((v) => v.name)).toEqual(["Home"]);
  });

  it("refuses a wrong confirmation and reports blocked orgs", async () => {
    const { auth, connect } = world();
    const { acct: alice } = await signedUp(connect, "alice@example.com");
    const { acct: bob } = await signedUp(connect, "bob@example.com");
    const org = await alice.auth.createOrg("Acme");
    auth.addMember(org.id, "bob@example.com", "admin");
    auth.orgs.get(org.id)!.members.get(bob.userId!)!.status = "confirmed";

    await expect(alice.deleteAccount({ password: "pw alice@example.com", confirm: "bob@example.com" })).rejects.toMatchObject({ code: "confirm_mismatch" });

    const preview = await alice.deletionPreview();
    expect(preview.blocked).toBe(true);
    expect(preview.orgs[0]).toMatchObject({ name: "Acme", outcome: "blocked", members: [{ email: "bob@example.com", role: "admin" }] });
    try {
      await alice.deleteAccount({ password: "pw alice@example.com", confirm: "alice@example.com" });
      expect.unreachable();
    } catch (e) {
      expect(isOpenVireoError(e) && e.code).toBe("deletion_blocked");
    }
    expect(alice.signedIn).toBe(true);
  });

  it("gives a shared vault away", async () => {
    const { auth, connect } = world();
    const { acct: alice } = await signedUp(connect, "alice@example.com");
    const { acct: bob } = await signedUp(connect, "bob@example.com");
    const home = await alice.createVault("Home");
    await home.sync();
    await alice.share(home.id, { email: "bob@example.com" }, "read");

    await alice.transferVault(home.id, bob.principal);
    expect(await alice.listVaults()).toEqual([]);
    expect(auth.vaults.get(home.id)).toMatchObject({ owner_id: bob.userId, rotationRequired: true });
    const theirs = await bob.listVaults();
    expect(theirs.map((v) => [v.name, v.role])).toEqual([["Home", "manage"]]);
  });

  it("knows when a remembered pending account can go", () => {
    const at = "2026-12-08T12:00:00Z";
    expect(deletionExpired(null)).toBe(false);
    expect(deletionExpired(at, Date.parse(at) + 3600_000)).toBe(false);
    expect(deletionExpired(at, Date.parse(at) + 25 * 3600_000)).toBe(true);
  });

  it("says when the plan is billed by Apple (SPEC §19, §23)", async () => {
    const { auth, connect } = world();
    const { acct: alice } = await signedUp(connect, "alice@example.com");
    expect((await alice.deletionPreview()).subscription).toBeNull();
    const id = auth.users.get("alice@example.com").id;
    const billing = { source: "apple", interval: "year", status: "active", renews_at: "2027-11-08T12:00:00Z", ends_at: null, manage: "app_store" } as const;
    auth.plans.set(id, { id: "premium", limits: {}, billing });
    expect((await alice.deletionPreview()).subscription).toEqual({ plan: "premium", periodEnd: "2027-11-08T12:00:00Z", source: "apple", manage: "app_store" });
    expect((await alice.auth.me()).plan?.billing).toEqual(billing);
  });

  it("reads an older server's subscription as billed on the website", async () => {
    const { auth, connect } = world();
    const { acct: alice } = await signedUp(connect, "alice@example.com");
    const preview = (auth as unknown as { previewSubscription: (pr: string) => unknown });
    preview.previewSubscription = () => ({ plan: "premium", period_end: null });
    expect((await alice.deletionPreview()).subscription).toEqual({ plan: "premium", periodEnd: null, source: "stripe", manage: "website" });
  });
});

import "fake-indexeddb/auto";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  AuthClient,
  EncryptedStorage,
  HttpError,
  IndexedDbStorage,
  MemoryStorage,
  TokenManager,
  discover,
  isMfaChallenge,
  nonExtractableIdbKey,
  staticToken,
} from "../src/auth/index.js";
import { FileStorage } from "../src/auth/storage-node.js";
import { MockServer, json } from "./helpers/mock-fetch.js";

const API = "https://auth.example/api/v1";
const config = {
  issuer: "https://auth.example",
  api: API,
  sync: "https://sync.example/api/v1",
  jwks_uri: "https://auth.example/.well-known/jwks.json",
  opaque: { lib: "libopaque", version: "1.0.1-6e9ac92", context: "ov-opaque-v1", ids: "auth.example" },
  kdf_min: { m: 19456, t: 2 },
};

describe("discovery", () => {
  it("reads /.well-known/openvireo-configuration", async () => {
    const s = new MockServer().on("GET", "/.well-known/openvireo-configuration", () => json(200, config));
    expect(await discover("https://auth.example/", { fetch: s.fetch })).toEqual(config);
    const { client } = await AuthClient.fromIssuer("https://auth.example", { fetch: s.fetch });
    expect(client.api).toBe(API);
  });
  it("rejects an incomplete document", async () => {
    const s = new MockServer().on("GET", "/.well-known/openvireo-configuration", () => json(200, { ...config, sync: undefined }));
    await expect(discover("https://auth.example", { fetch: s.fetch })).rejects.toThrow(/sync/);
  });
});

describe("AuthClient routes (openapi.yaml)", () => {
  const P = "user:5a0b7c1d-2e3f-4a5b-8c6d-7e8f9a0b1c2d";
  const V = "3f1c2a9e-7b4d-4e8a-9c21-5d6e7f809a1b";
  const O = "7e8f9a0b-1c2d-4e3f-8a5b-6c7d8e9f0a1b";
  const SA = "9b2e4f61-0c3a-4d7e-8f15-a2b3c4d5e6f7";
  const kdf = { alg: "argon2id" as const, salt: "AAAA", m: 65536, t: 3, p: 1 };
  const keyset = { enc_pk: "a", sign_pk: "b", sig: "c", wrapped: "d" };
  const grant = { principal: P, role: "read" as const, key_version: 1, sealed_key: "x" };
  const secret = { id: "s", secret_hash: "h", prefix: "12345678", wrapped_master: "w" };
  // [name, call, method, path, body, authenticated]
  const cases: [string, (c: AuthClient) => Promise<unknown>, string, string, unknown, boolean][] = [
    ["registerStart", (c) => c.registerStart({ email: "a@b.c", request: "M" }), "POST", "/auth/register/start", { email: "a@b.c", request: "M" }, false],
    ["registerFinish", (c) => c.registerFinish({ session_id: "s", record: "r", kdf, keyset, device: { name: "d", platform: "web" } }), "POST", "/auth/register/finish", { session_id: "s", record: "r", kdf, keyset, device: { name: "d", platform: "web" } }, false],
    ["loginStart", (c) => c.loginStart({ email: "a@b.c", ke1: "k" }), "POST", "/auth/login/start", { email: "a@b.c", ke1: "k" }, false],
    ["loginFinish", (c) => c.loginFinish({ session_id: "s", auth_u: "u", device: { id: "d1", name: "d", platform: "cli" } }), "POST", "/auth/login/finish", { session_id: "s", auth_u: "u", device: { id: "d1", name: "d", platform: "cli" } }, false],
    ["loginMfa", (c) => c.loginMfa({ mfa_token: "m", totp: "123456" }), "POST", "/auth/login/mfa", { mfa_token: "m", totp: "123456" }, false],
    ["refresh", (c) => c.refresh("ov_rt_x"), "POST", "/auth/refresh", { refresh_token: "ov_rt_x" }, false],
    ["logout", (c) => c.logout(), "POST", "/auth/logout", undefined, true],
    ["serviceAccountExchange", (c) => c.serviceAccountExchange({ sa_id: SA, secret: "s" }), "POST", "/auth/service-account", { sa_id: SA, secret: "s" }, false],
    ["me", (c) => c.me(), "GET", "/me", undefined, true],
    ["passwordStart", (c) => c.passwordStart({ request: "M" }), "POST", "/me/password/start", { request: "M" }, true],
    ["passwordFinish", (c) => c.passwordFinish({ session_id: "s", record: "r", kdf, keyset }), "POST", "/me/password/finish", { session_id: "s", record: "r", kdf, keyset }, true],
    ["totpStart", (c) => c.totpStart(), "POST", "/me/totp", undefined, true],
    ["totpConfirm", (c) => c.totpConfirm("123456"), "PUT", "/me/totp", { totp: "123456" }, true],
    ["totpDisable", (c) => c.totpDisable("123456"), "DELETE", "/me/totp", { totp: "123456" }, true],
    ["lookupUser", (c) => c.lookupUser("b@b.c"), "GET", "/users/lookup?email=b%40b.c", undefined, true],
    ["publicKey", (c) => c.publicKey(P), "GET", `/principals/${P}/public-key`, undefined, true],
    ["listDevices", (c) => c.listDevices(), "GET", "/devices", undefined, true],
    ["revokeDevice", (c) => c.revokeDevice("d1"), "DELETE", "/devices/d1", undefined, true],
    ["createOrg", (c) => c.createOrg("Acme"), "POST", "/orgs", { name: "Acme" }, true],
    ["getOrg", (c) => c.getOrg(O), "GET", `/orgs/${O}`, undefined, true],
    ["renameOrg", (c) => c.renameOrg(O, "B"), "PATCH", `/orgs/${O}`, { name: "B" }, true],
    ["deleteOrg", (c) => c.deleteOrg(O), "DELETE", `/orgs/${O}`, undefined, true],
    ["listMembers", (c) => c.listMembers(O), "GET", `/orgs/${O}/members`, undefined, true],
    ["setMemberRole", (c) => c.setMemberRole(O, "u1", { role: "admin", sa_master_keys: [] }), "PATCH", `/orgs/${O}/members/u1`, { role: "admin", sa_master_keys: [] }, true],
    ["removeMember", (c) => c.removeMember(O, "u1"), "DELETE", `/orgs/${O}/members/u1`, undefined, true],
    ["confirmMember", (c) => c.confirmMember(O, "u1", { grants: [{ ...grant, vault_id: V }] }), "POST", `/orgs/${O}/members/u1/confirm`, { grants: [{ ...grant, vault_id: V }] }, true],
    ["listInvitations", (c) => c.listInvitations(O), "GET", `/orgs/${O}/invitations`, undefined, true],
    ["invite", (c) => c.invite(O, { email: "x@y.z", role: "member" }), "POST", `/orgs/${O}/invitations`, { email: "x@y.z", role: "member" }, true],
    ["cancelInvitation", (c) => c.cancelInvitation(O, "i1"), "DELETE", `/orgs/${O}/invitations/i1`, undefined, true],
    ["acceptInvitation", (c) => c.acceptInvitation("t"), "POST", "/invitations/accept", { token: "t" }, true],
    ["listVaults", (c) => c.listVaults(), "GET", "/vaults", undefined, true],
    ["createVault", (c) => c.createVault({ id: V, encrypted_name: "n", grants: [grant] }), "POST", "/vaults", { id: V, encrypted_name: "n", grants: [grant] }, true],
    ["getVault", (c) => c.getVault(V), "GET", `/vaults/${V}`, undefined, true],
    ["renameVault", (c) => c.renameVault(V, "n2"), "PATCH", `/vaults/${V}`, { encrypted_name: "n2" }, true],
    ["deleteVault", (c) => c.deleteVault(V), "DELETE", `/vaults/${V}`, undefined, true],
    ["listAccess", (c) => c.listAccess(V), "GET", `/vaults/${V}/access`, undefined, true],
    ["grantAccess", (c) => c.grantAccess(V, [grant]), "POST", `/vaults/${V}/access`, { grants: [grant] }, true],
    ["startRotation", (c) => c.startRotation(V, { key_version: 2, grants: [grant], remove: [P] }), "POST", `/vaults/${V}/keys`, { key_version: 2, grants: [grant], remove: [P] }, true],
    ["activateKey", (c) => c.activateKey(V, 2), "POST", `/vaults/${V}/keys/2/activate`, undefined, true],
    ["listServiceAccounts", (c) => c.listServiceAccounts(O), "GET", `/orgs/${O}/service-accounts`, undefined, true],
    ["createServiceAccount", (c) => c.createServiceAccount(O, { id: SA, name: "ci", keyset, master_keys: [], secret }), "POST", `/orgs/${O}/service-accounts`, { id: SA, name: "ci", keyset, master_keys: [], secret }, true],
    ["getServiceAccount", (c) => c.getServiceAccount(SA), "GET", `/service-accounts/${SA}`, undefined, true],
    ["updateServiceAccount", (c) => c.updateServiceAccount(SA, { disabled: true }), "PATCH", `/service-accounts/${SA}`, { disabled: true }, true],
    ["deleteServiceAccount", (c) => c.deleteServiceAccount(SA), "DELETE", `/service-accounts/${SA}`, undefined, true],
    ["listSaSecrets", (c) => c.listSaSecrets(SA), "GET", `/service-accounts/${SA}/secrets`, undefined, true],
    ["issueSaSecret", (c) => c.issueSaSecret(SA, secret), "POST", `/service-accounts/${SA}/secrets`, secret, true],
    ["updateSaSecret", (c) => c.updateSaSecret(SA, "s1", { expires_at: null }), "PATCH", `/service-accounts/${SA}/secrets/s1`, { expires_at: null }, true],
    ["revokeSaSecret", (c) => c.revokeSaSecret(SA, "s1"), "DELETE", `/service-accounts/${SA}/secrets/s1`, undefined, true],
    ["audit", (c) => c.audit(O, { before: "c1", limit: 20 }), "GET", `/orgs/${O}/audit?before=c1&limit=20`, undefined, true],
  ];
  for (const [name, call, method, path, body, authed] of cases) {
    it(`${name}: ${method} ${path}`, async () => {
      const calls: { method: string; url: string; init: RequestInit }[] = [];
      const fetch = async (url: string, init: RequestInit = {}) => {
        calls.push({ method: init.method ?? "GET", url, init });
        return json(200, { ok: true });
      };
      const c = new AuthClient({ api: API + "/", fetch, tokens: staticToken("jwt-1") });
      await call(c);
      expect(calls).toHaveLength(1);
      expect(calls[0]!.method).toBe(method);
      expect(calls[0]!.url).toBe(API + path);
      expect(calls[0]!.init.redirect).toBe("manual");
      const h = new Headers(calls[0]!.init.headers);
      expect(h.get("Authorization")).toBe(authed ? "Bearer jwt-1" : null);
      expect(calls[0]!.init.body === undefined ? undefined : JSON.parse(calls[0]!.init.body as string)).toEqual(body);
    });
  }
  it(`covers all ${cases.length} routes of openapi.yaml`, () => {
    expect(new Set(cases.map((c) => `${c[2]} ${c[3].split("?")[0]}`)).size).toBe(49);
  });
});

describe("AuthClient errors and retries", () => {
  it("maps {error, code} and Retry-After", async () => {
    const s = new MockServer().on("POST", "/api/v1/auth/login/start", () => json(429, { error: "slow down", code: "rate_limited" }, { "Retry-After": "30" }));
    const c = new AuthClient({ api: API, fetch: s.fetch });
    const err = await c.loginStart({ email: "a", ke1: "b" }).catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err).toMatchObject({ code: "rate_limited", status: 429, retryAfter: 30, message: "slow down" });
  });
  it("falls back to a code from the status", async () => {
    const s = new MockServer().on("POST", "/api/v1/auth/register/start", () => json(409, { error: "taken" }));
    await expect(new AuthClient({ api: API, fetch: s.fetch }).registerStart({ email: "a", request: "b" })).rejects.toMatchObject({ code: "conflict" });
  });
  it("refuses redirects", async () => {
    const fetch = async () => new Response(null, { status: 302, headers: { Location: "https://evil" } });
    await expect(new AuthClient({ api: API, fetch }).me().catch((e) => e)).resolves.toMatchObject({ code: "signed_out" });
    await expect(new AuthClient({ api: API, fetch, tokens: staticToken("t") }).me()).rejects.toThrow(/redirect/);
  });
  it("reports network errors", async () => {
    const fetch = async () => {
      throw new TypeError("fetch failed");
    };
    await expect(new AuthClient({ api: API, fetch }).refresh("x")).rejects.toMatchObject({ code: "network_error" });
  });
  it("retries once with a forced refresh after a 401", async () => {
    let n = 0;
    const s = new MockServer().on("GET", "/api/v1/me", (req) =>
      req.headers.authorization === "Bearer fresh" ? json(200, { id: "u" }) : json(401, { error: "expired", code: "unauthorized" }),
    );
    const tokens = { getAccessToken: vi.fn(async (o?: { force?: boolean }) => (o?.force ? (n++, "fresh") : "stale")) };
    expect(await new AuthClient({ api: API, fetch: s.fetch, tokens }).me()).toEqual({ id: "u" });
    expect(n).toBe(1);
    expect(s.calls).toHaveLength(2);
  });
  it("tells an MFA challenge from a session", () => {
    expect(isMfaChallenge({ mfa_required: true, mfa_token: "t" })).toBe(true);
  });
});

describe("TokenManager", () => {
  const session = { issuer: "https://auth.example", userId: "u", email: "a@b.c", deviceId: "d", refreshToken: "ov_rt_1" };
  function setup(refresh: (rt: string) => Promise<any>) {
    let now = 1_000_000;
    const storage = new MemoryStorage();
    const tm = new TokenManager({ storage, refresh, now: () => now });
    return { tm, storage, advance: (ms: number) => (now += ms) };
  }

  it("refreshes shortly before expiry and rotates the stored refresh token", async () => {
    const refresh = vi.fn(async (rt: string) => ({ access_token: `at-for-${rt}`, refresh_token: rt + "x", expires_in: 600 }));
    const { tm, storage, advance } = setup(refresh);
    await tm.start(session, "at-0", 600);
    expect(await tm.getAccessToken()).toBe("at-0");
    advance(530_000); // 70 s left: still fine
    expect(await tm.getAccessToken()).toBe("at-0");
    advance(20_000); // 50 s left: inside the 60 s margin
    expect(await tm.getAccessToken()).toBe("at-for-ov_rt_1");
    expect(JSON.parse((await storage.get("session"))!).refreshToken).toBe("ov_rt_1x");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does one refresh for concurrent callers", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const refresh = vi.fn(async () => (await gate, { access_token: "new", refresh_token: "ov_rt_2", expires_in: 600 }));
    const { tm } = setup(refresh);
    await tm.start(session, "old", 0);
    const all = Promise.all([tm.getAccessToken(), tm.getAccessToken(), tm.getAccessToken({ force: true })]);
    release();
    expect(await all).toEqual(["new", "new", "new"]);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("signs out when the server reports token reuse", async () => {
    const refresh = async () => {
      throw new HttpError("token_reused", "reused", 401);
    };
    const { tm, storage } = setup(refresh);
    await tm.start(session, "old", 0);
    const out = vi.fn();
    tm.onSignedOut(out);
    await expect(tm.getAccessToken()).rejects.toMatchObject({ code: "signed_out" });
    expect(out).toHaveBeenCalledWith("token_reused");
    expect(await storage.get("session")).toBeNull();
    await expect(tm.getAccessToken()).rejects.toMatchObject({ code: "signed_out" });
  });

  it("keeps the session on network errors", async () => {
    const refresh = async () => {
      throw new HttpError("network_error", "offline", 0);
    };
    const { tm, storage } = setup(refresh);
    await tm.start(session, "old", 0);
    await expect(tm.getAccessToken()).rejects.toMatchObject({ code: "network_error" });
    expect(await storage.get("session")).not.toBeNull();
  });

  it("loads a stored session on a new start", async () => {
    const storage = new MemoryStorage();
    await storage.set("session", JSON.stringify(session));
    const tm = new TokenManager({ storage, refresh: async () => ({ access_token: "a", refresh_token: "b", expires_in: 600 }) });
    expect(await tm.load()).toEqual(session);
    expect(await tm.getAccessToken()).toBe("a");
  });
});

describe("storage adapters", () => {
  it("FileStorage persists with mode 0600", async () => {
    const dir = await mkdtemp(join(tmpdir(), "openvireo-"));
    const path = join(dir, "sub", "state.json");
    const a = new FileStorage(path);
    await a.set("k", "v");
    await a.set("k2", "v2");
    await a.delete("k2");
    expect(await new FileStorage(path).get("k")).toBe("v");
    expect(JSON.parse(await readFile(path, "utf8"))).toEqual({ k: "v" });
    expect((await stat(path)).mode & 0o777).toBe(0o600);
  });
  it("IndexedDbStorage + EncryptedStorage with a non-extractable key", async () => {
    const idb = new IndexedDbStorage("ov-test-" + Math.random());
    const enc = new EncryptedStorage(idb, nonExtractableIdbKey(idb));
    await enc.set("secret_key", "K1-…");
    expect(await enc.get("secret_key")).toBe("K1-…");
    const raw = await idb.get("secret_key");
    expect(raw).not.toContain("K1");
    const key = await idb.getRaw<CryptoKey>("__ov_wrapping_key");
    expect(key?.extractable).toBe(false);
    // Values are bound to their key name
    await idb.set("other", raw!);
    await expect(enc.get("other")).rejects.toThrow();
    await enc.delete("secret_key");
    expect(await enc.get("secret_key")).toBeNull();
  });
});

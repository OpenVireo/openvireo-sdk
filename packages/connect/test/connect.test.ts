import { beforeAll, describe, expect, it } from "vitest";
import { ServiceAccount } from "@openvireo/sdk";
import { type World, editBetweenGetAndPut, makeWorld } from "../../sdk/test/helpers/world.js";
import { type ConnectToken, configFromEnv, connectMain, createConnectHandler, hashConnectToken, newConnectToken, parseConnectTokens, startConnect } from "../src/index.js";

let w: World;
let readSa: ServiceAccount;
let writeSa: ServiceAccount;
const READ = "kpx_ct_read";
const WRITE = "kpx_ct_write";
const SCOPED = "kpx_ct_scoped";
const tokens: ConnectToken[] = [
  { name: "eso", sha256: hashConnectToken(READ), vaults: ["*"], access: "read" },
  { name: "app", sha256: hashConnectToken(WRITE), vaults: ["Team Infra"], access: "write" },
  { name: "other", sha256: hashConnectToken(SCOPED), vaults: ["Private"], access: "write" },
];

beforeAll(async () => {
  w = await makeWorld();
  readSa = await ServiceAccount.fromToken(w.readToken, { fetch: w.fetch });
  writeSa = await ServiceAccount.fromToken(w.writeToken, { fetch: w.fetch });
});

function client(source: ServiceAccount, opts: { cacheTtlMs?: number; log?: string[] } = {}) {
  const handler = createConnectHandler({ source, tokens, cacheTtlMs: opts.cacheTtlMs ?? 0, log: opts.log && ((l) => opts.log!.push(l)) });
  return async (method: string, path: string, p: { token?: string; body?: unknown; accept?: string } = {}) => {
    const headers: Record<string, string> = {};
    if (p.token !== undefined) headers.authorization = `Bearer ${p.token}`;
    if (p.accept) headers.accept = p.accept;
    if (p.body !== undefined) headers["content-type"] = "application/json";
    const res = await handler(new Request(`http://connect.local${path}`, { method, headers, body: p.body === undefined ? undefined : JSON.stringify(p.body) }));
    const text = await res.text();
    let body: any = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* text */
    }
    return { status: res.status, body, headers: res.headers };
  };
}

describe("kpx connect REST API", () => {
  it("needs one of its own bearer tokens, except for /health", async () => {
    const c = client(readSa);
    expect((await c("GET", "/health")).body).toEqual({ status: "ok" });
    expect((await c("GET", "/ready")).status).toBe(200);
    for (const token of [undefined, "", "nope", w.readToken]) {
      const r = await c("GET", "/v1/vaults", { token });
      expect(r.status).toBe(401);
      expect(r.body.code).toBe("unauthorized");
      expect(r.headers.get("www-authenticate")).toBe("Bearer");
    }
    expect((await c("GET", "/v2/x", { token: READ })).status).toBe(404);
  });

  it("lists vaults and items (without values) the token may use", async () => {
    const c = client(readSa);
    expect((await c("GET", "/v1/vaults", { token: READ })).body).toEqual({ vaults: [{ id: w.vaultId, name: "Team Infra", role: "read" }] });
    expect((await c("GET", `/v1/vaults/${w.vaultId}`, { token: READ })).body.name).toBe("Team Infra");
    // the token is scoped to another vault: the SA's vault looks like it doesn't exist
    expect((await c("GET", "/v1/vaults", { token: SCOPED })).body).toEqual({ vaults: [] });
    expect((await c("GET", "/v1/vaults/Team%20Infra/items", { token: SCOPED })).status).toBe(404);
    // not shared with the SA at all
    expect((await c("GET", `/v1/vaults/${w.otherVaultId}/items`, { token: READ })).status).toBe(404);
    const items = (await c("GET", "/v1/vaults/Team%20Infra/items", { token: READ })).body.items;
    expect(items.map((i: any) => i.title).sort()).toEqual(expect.arrayContaining(["Database", "GitHub"]));
    expect(JSON.stringify(items)).not.toContain("s3cret");
  });

  it("returns an item with its values, or one field (the ESO webhook shape)", async () => {
    const c = client(readSa);
    const gh = await c("GET", "/v1/vaults/Team%20Infra/items/GitHub", { token: READ });
    expect(gh.status).toBe(200);
    expect(gh.headers.get("cache-control")).toBe("no-store");
    expect(gh.body.fields).toMatchObject({ Title: "GitHub", UserName: "ci", URL: "https://github.com" });
    expect(gh.body.fields.Password).toBeTruthy();
    expect((await c("GET", `/v1/vaults/${w.vaultId}/items/${gh.body.id}`, { token: READ })).body.title).toBe("GitHub");
    const db = await c("GET", "/v1/vaults/Team%20Infra/items/Deploy/Database?field=password", { token: READ });
    expect(db.body).toEqual({ value: "pg-pa$$word" });
    const text = await c("GET", "/v1/vaults/Team%20Infra/items/Deploy/Database?field=notes", { token: READ, accept: "text/plain" });
    expect([text.body, text.headers.get("content-type")]).toEqual(["multi\nline", "text/plain; charset=utf-8"]);
    expect((await c("GET", "/v1/vaults/Team%20Infra/items/Deploy/Database?field=nope", { token: READ })).status).toBe(404);
    expect((await c("GET", "/v1/vaults/Team%20Infra/items/Nope", { token: READ })).body.code).toBe("not_found");
    expect((await c("GET", "/v1/vaults/Team%20Infra/items/%zz", { token: READ })).status).toBe(400);
  });

  it("rejects writes from a read-only token or a read-only service account", async () => {
    const before = w.sync.blobs.get(`vaults/${w.vaultId}`)!.length;
    const ro = await client(writeSa)("PUT", "/v1/vaults/Team%20Infra/items/GitHub", { token: READ, body: { fields: { password: "x" } } });
    expect([ro.status, ro.body.code]).toEqual([403, "forbidden"]);
    const saRo = await client(readSa)("PUT", "/v1/vaults/Team%20Infra/items/GitHub", { token: WRITE, body: { fields: { password: "x" } } });
    expect([saRo.status, saRo.body.code]).toEqual([403, "forbidden"]);
    expect(saRo.body.error).toMatch(/can only read/);
    expect(w.sync.blobs.get(`vaults/${w.vaultId}`)!.length).toBe(before);
  });

  it("creates and updates items with the conditional PUT, merging on 412", async () => {
    const log: string[] = [];
    const c = client(writeSa, { log });
    const bad = await c("PUT", "/v1/vaults/Team%20Infra/items/X", { token: WRITE, body: { fields: { a: 1 } } });
    expect([bad.status, bad.body.code]).toEqual([400, "invalid_request"]);
    expect((await c("PUT", "/v1/vaults/Team%20Infra/items/Missing?create=false", { token: WRITE, body: { fields: { a: "1" } } })).status).toBe(404);

    const created = await c("PUT", "/v1/vaults/Team%20Infra/items/Apps/Api", { token: WRITE, body: { fields: { username: "svc", token: "t-1" }, protected: { username: true } } });
    expect(created.status).toBe(201);
    expect(created.body.group).toEqual(["Apps"]);
    expect(created.body.protected.sort()).toEqual(["Password", "UserName", "token"]);
    expect(created.body.fields.token).toBeUndefined(); // the response doesn't echo protected values

    const race = await editBetweenGetAndPut(w, "GitHub", { URL: "https://github.example" });
    const upd = await c("PUT", "/v1/vaults/Team%20Infra/items/GitHub", { token: WRITE, body: { fields: { password: "via-connect" } } });
    w.sync.afterGet = null;
    expect([upd.status, race.fired]).toEqual([200, true]);
    const r = client(readSa);
    const after = (await r("GET", "/v1/vaults/Team%20Infra/items/GitHub", { token: READ })).body.fields;
    expect([after.Password, after.URL]).toEqual(["via-connect", "https://github.example"]);
    expect((await r("GET", "/v1/vaults/Team%20Infra/items/Apps/Api?field=token", { token: READ })).body.value).toBe("t-1");
    expect(log.some((l) => /^PUT \/v1\/vaults\/Team Infra\/items\/GitHub 200 token=app$/.test(l.replace(/%20/g, " ")))).toBe(true);
    expect(log.join("\n")).not.toContain("via-connect");
  });

  it("uses its cached copy until the TTL, then a HEAD check", async () => {
    const c = client(readSa, { cacheTtlMs: 60_000 });
    await c("GET", "/v1/vaults/Team%20Infra/items/GitHub", { token: READ });
    const n = w.sync.calls.length;
    await c("GET", "/v1/vaults/Team%20Infra/items/GitHub", { token: READ });
    expect(w.sync.calls.length).toBe(n);
    const ttl0 = client(readSa, { cacheTtlMs: 0 });
    await ttl0("GET", "/v1/vaults/Team%20Infra/items/GitHub", { token: READ });
    expect(w.sync.calls.slice(n).map((x) => x.method)).toEqual(["HEAD"]);
  });

  it("serves over HTTP with startConnect", async () => {
    const { token, entry } = newConnectToken({ name: "eso", vaults: ["Team Infra"] });
    const config = configFromEnv({ KPX_SERVICE_ACCOUNT_TOKEN: w.readToken, KPX_CONNECT_TOKENS: JSON.stringify({ tokens: [entry] }), KPX_CONNECT_PORT: "0" });
    const running = await startConnect(config, { fetch: w.fetch });
    try {
      const res = await fetch(`${running.url}/v1/vaults/Team%20Infra/items/Deploy/Database?field=username`, { headers: { Authorization: `Bearer ${token}` } });
      expect([res.status, await res.json()]).toEqual([200, { value: "app" }]);
      const put = await fetch(`${running.url}/v1/vaults/Team%20Infra/items/GitHub`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: "{}" });
      expect(put.status).toBe(403);
    } finally {
      await running.close();
    }
  });
});

describe("connect configuration", () => {
  it("validates the tokens config and the environment", () => {
    expect(() => parseConnectTokens("nope")).toThrow(/not JSON/);
    expect(() => parseConnectTokens('[{"name":"a","sha256":"xyz"}]')).toThrow(/sha256/);
    expect(() => parseConnectTokens(`[{"name":"a","sha256":"${"a".repeat(64)}","access":"admin"}]`)).toThrow(/access/);
    expect(parseConnectTokens(`[{"name":"a","sha256":"${"a".repeat(64)}"}]`)).toEqual([{ name: "a", sha256: "a".repeat(64), vaults: ["*"], access: "read" }]);
    expect(() => configFromEnv({})).toThrow(/KPX_SERVICE_ACCOUNT_TOKEN/);
    expect(() => configFromEnv({ KPX_SERVICE_ACCOUNT_TOKEN: "kpx_sa_x" })).toThrow(/no connect tokens/);
    const c = configFromEnv({ KPX_SERVICE_ACCOUNT_TOKEN: "kpx_sa_x", KPX_CONNECT_TOKEN: "t", KPX_CONNECT_TOKEN_ACCESS: "write" });
    expect([c.host, c.port, c.cacheTtlMs, c.tokens[0]!.access]).toEqual(["127.0.0.1", 8080, 5000, "write"]);
    expect(() => configFromEnv({ KPX_SERVICE_ACCOUNT_TOKEN: "x", KPX_CONNECT_TOKEN: "t", KPX_CONNECT_PORT: "70000" })).toThrow(/PORT/);
  });

  it("`kpx connect token` prints a token and its config entry", async () => {
    let out = "";
    let err = "";
    const code = await connectMain(["token", "--name", "eso", "--vault", "Team Infra", "--write"], { env: {}, stdout: (s) => (out += s), stderr: (s) => (err += s) });
    expect(code).toBe(0);
    const token = out.trim();
    expect(token).toMatch(/^kpx_ct_[A-Za-z0-9_-]{43}$/);
    const entry = JSON.parse(err.trim().split("\n").at(-1)!);
    expect(entry).toEqual({ name: "eso", sha256: hashConnectToken(token), vaults: ["Team Infra"], access: "write" });
    expect(err).not.toContain(token);
  });
});

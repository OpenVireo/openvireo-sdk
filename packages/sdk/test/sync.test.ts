import { describe, expect, it, vi } from "vitest";
import { CLOCK_SKEW_WARNING_MS, SseParser, SyncClient, isClockSkewed, subscribeEvents, toSyncEvent, type SyncEvent } from "../src/sync/index.js";
import { SelfHostedSync } from "../src/self-hosted.js";
import { MemoryStorage } from "../src/auth/storage.js";
import { vaultCredentials } from "../src/vault/kdbx.js";
import { KEY, addEntry, edit, get, openVault, threeCopies } from "./helpers/dbs.js";
import { FakeSyncServer } from "./helpers/sync-server.js";
import { json } from "./helpers/mock-fetch.js";

const creds = vaultCredentials(KEY);

describe("SyncClient (legacy and JWT routes)", () => {
  it("conditional GET/HEAD/PUT, history and revisions", async () => {
    const s = new FakeSyncServer();
    const c = SyncClient.selfHosted("https://sync.example/", { fetch: s.fetch, token: "dev-token" });
    const db = c.database("main");
    expect(await db.get()).toEqual({ status: 404 });
    const one = new Uint8Array([1, 2, 3]);
    const created = await db.put(one, { create: true });
    expect(created).toMatchObject({ created: true, revision: 1, etag: await SyncClient.etagFor(one) });
    expect(s.last().headers["if-none-match"]).toBe("*");
    await expect(db.put(one, { create: true })).rejects.toMatchObject({ code: "precondition_failed", status: 412 });
    const got = await db.get();
    expect(got).toMatchObject({ status: 200, revision: 1, etag: created.etag });
    expect(await db.get({ ifNoneMatch: created.etag })).toMatchObject({ status: 304, revision: 1 });
    expect(await db.head(created.etag)).toMatchObject({ status: 304 });
    expect(await db.head()).toMatchObject({ status: 200, revision: 1 });
    await expect(db.put(new Uint8Array([4]), { ifMatch: '"stale"' })).rejects.toMatchObject({ code: "precondition_failed" });
    const updated = await db.put(new Uint8Array([4]), { ifMatch: created.etag });
    expect(updated).toMatchObject({ created: false, revision: 2 });
    expect((await db.history()).map((v) => v.revision)).toEqual([2, 1]);
    expect(Array.from((await db.getRevision(1)).data)).toEqual([1, 2, 3]);
    expect((await c.listDatabases()).map((d) => d.id)).toEqual(["main"]);
    expect(s.calls.every((r) => r.url.startsWith("https://sync.example/api/v1/"))).toBe(true);
    await db.delete();
    expect(await db.get()).toEqual({ status: 404 });
  });

  it("vault routes with a refreshable JWT (401 → forced refresh → retry)", async () => {
    const s = new FakeSyncServer();
    s.store("vaults/v1", new Uint8Array([9]));
    const tokens = { getAccessToken: vi.fn(async (o?: { force?: boolean }) => (o?.force ? "jwt-ok" : "jwt-expired")) };
    const c = new SyncClient({ baseUrl: "https://sync.example/api/v1", fetch: s.fetch, token: tokens });
    expect((await c.vault("v1").get()).status).toBe(200);
    expect(tokens.getAccessToken).toHaveBeenLastCalledWith({ force: true });
    expect((await c.listVaults()).map((v) => v.id)).toEqual(["v1"]);
  });

  it("pairing: claim a code for a device token, then use it", async () => {
    const s = new FakeSyncServer();
    expect(SyncClient.isPairingCode("abcd efgh")).toBe(true);
    const anon = SyncClient.selfHosted("https://sync.example", { fetch: s.fetch });
    const claim = await anon.claimPairingCode(" ABCD-EFGH ", "Web");
    expect(claim).toEqual({ user: "alice", deviceId: "dev-2", token: "dev-token-2" });
    expect(s.last().json).toEqual({ code: "ABCD-EFGH", deviceName: "Web" });
    await expect(anon.claimPairingCode("ABCD-EFGH", "Web")).rejects.toMatchObject({ status: 400 });
    const paired = SyncClient.selfHosted("https://sync.example", { fetch: s.fetch, token: claim.token });
    expect(await paired.createPairingCode()).toEqual({ code: "WXYZ-2345", expiresAt: "2026-10-17T00:05:00Z" });
    expect(await paired.health()).toEqual({ status: "ok" });
  });
});

// The sync loop is the core's (ov-sync). These tests drive it through SelfHostedSync.syncDatabase (bytes in,
// merged bytes out), one SelfHostedSync per device so each keeps its own base copy.
const device = (s: FakeSyncServer, fetch: typeof s.fetch = s.fetch) => SelfHostedSync.connect("https://sync.example", "dev-token", { fetch, storage: new MemoryStorage() });

describe("clock offset from the server's Date header", () => {
  it("measures this computer's clock against the server's on every sync", async () => {
    const s = new FakeSyncServer();
    let serverAhead = 0;
    // The server's clock, `serverAhead` ms off this computer's
    const fetch: typeof s.fetch = async (input, init) => {
      const res = await s.fetch(input, init);
      const headers = new Headers(res.headers);
      headers.set("Date", new Date(Date.now() + serverAhead).toUTCString());
      return new Response(res.status === 204 || res.status === 304 || init?.method === "HEAD" ? null : await res.arrayBuffer(), { status: res.status, headers });
    };
    const dev = device(s, fetch);
    const { bytes } = await threeCopies((v) => void addEntry(v, "A"));

    const first = await dev.syncDatabase("db", bytes, creds);
    expect(Math.abs(first.report.clockOffsetMs!)).toBeLessThan(1500);
    expect(isClockSkewed(first.report.clockOffsetMs)).toBe(false);

    serverAhead = -2 * CLOCK_SKEW_WARNING_MS; // this computer is 10 minutes ahead
    const second = await dev.syncDatabase("db", first.kdbx, creds);
    expect(second.report.clockOffsetMs! / 60_000).toBeCloseTo(10, 1);
    expect(second.report.clockSkewed).toBe(true);
    expect(isClockSkewed(second.report.clockOffsetMs)).toBe(true);
    expect(isClockSkewed(undefined)).toBe(false);
  });
});

describe("sync loop (download → merge → conditional PUT → 412 retry)", () => {
  async function setup() {
    const s = new FakeSyncServer();
    const copies = await threeCopies((v) => void addEntry(v, "A", { Password: "p", URL: "x" }));
    return { s, ...copies };
  }
  const editBytes = async (bytes: Uint8Array, fields: Record<string, string>, time: number) => {
    const v = await openVault(bytes);
    edit(v, "A", fields, time);
    return v.saveLocal();
  };

  it("creates, then pulls, then uploads merged changes, keeping a base copy", async () => {
    const { s, bytes } = await setup();
    const dev1 = device(s);
    const first = await dev1.syncDatabase("db", bytes, creds);
    expect(first.report.outcome).toBe("created");

    // device 2 starts from the server copy, edits URL and uploads
    const dev2 = device(s);
    const pulled = await dev2.syncDatabase("db", bytes, creds);
    expect(pulled.report.outcome).toBe("pulled");
    const up2 = await dev2.syncDatabase("db", await editBytes(pulled.kdbx, { URL: "y" }, 300), creds);
    expect(up2.report.outcome).toBe("uploaded");

    // device 1 changed Password meanwhile: the base copy lets both changes survive
    const r = await dev1.syncDatabase("db", await editBytes(first.kdbx, { Password: "p2" }, 200), creds);
    expect(r.report.outcome).toBe("uploaded");
    expect(r.report.conflicts).toEqual([]);
    const mine = await openVault(r.kdbx);
    expect([get(mine, "A", "Password"), get(mine, "A", "URL")]).toEqual(["p2", "y"]);
    const server = await openVault(s.blobs.get("databases/db")!.at(-1)!.data);
    expect([get(server, "A", "Password"), get(server, "A", "URL")]).toEqual(["p2", "y"]);
    expect(s.blobs.get("databases/db")!.at(-1)!.revision).toBe(3);
  });

  it("on 412 downloads the newer version, merges it too and retries", async () => {
    const { s, bytes, remote } = await setup();
    const dev = device(s);
    const first = await dev.syncDatabase("db", bytes, creds);
    const mine = await editBytes(first.kdbx, { Password: "mine" }, 200);
    // another device uploads between our GET and PUT, once
    let raced = false;
    s.afterGet = async (key) => {
      if (raced) return;
      raced = true;
      edit(remote, "A", { Notes: "theirs" }, 250);
      s.store(key, await remote.saveLocal());
    };
    const r = await dev.syncDatabase("db", mine, creds);
    expect(r.report.attempts).toBe(2);
    expect(s.calls.filter((c) => c.method === "PUT").length).toBe(3); // create, 412, success
    const server = await openVault(s.blobs.get("databases/db")!.at(-1)!.data);
    expect([get(server, "A", "Password"), get(server, "A", "Notes")]).toEqual(["mine", "theirs"]);
  });

  it("gives up when the server keeps changing", async () => {
    const { s, bytes, remote } = await setup();
    const dev = device(s);
    const first = await dev.syncDatabase("db", bytes, creds);
    const mine = await editBytes(first.kdbx, { Password: "mine" }, 200);
    let n = 0;
    s.afterGet = async (key) => {
      edit(remote, "A", { Notes: `theirs ${n++}` }, 250 + n);
      s.store(key, await remote.saveLocal());
    };
    await expect(dev.syncDatabase("db", mine, creds)).rejects.toMatchObject({ code: "too_many_conflicts" });
    expect(n).toBeGreaterThanOrEqual(3);
  });

  it("detects rollbacks and lost databases", async () => {
    const { s, bytes } = await setup();
    const dev = device(s);
    const first = await dev.syncDatabase("db", bytes, creds);
    const second = await dev.syncDatabase("db", await editBytes(first.kdbx, { URL: "z" }, 300), creds);
    expect(second.report.outcome).toBe("uploaded");
    // the server goes back to revision 1
    s.blobs.set("databases/db", s.blobs.get("databases/db")!.slice(0, 1));
    await expect(dev.syncDatabase("db", second.kdbx, creds)).rejects.toMatchObject({ code: "server_rolled_back" });
    s.blobs.clear();
    await expect(dev.syncDatabase("db", second.kdbx, creds)).rejects.toMatchObject({ code: "server_lost_database" });
  });
});

describe("SSE", () => {
  it("parses fields, multi-line data, comments, CRLF and split chunks", () => {
    const p = new SseParser();
    const evs = [
      ...p.feed(": keepalive\r\nevent: vault\r\ndata: {\"id\":\"v1\",\"etag\":\"e\",\"revision\":3}\r\n\r\n"),
      ...p.feed("event: access\ndata: {\"vault\":null,"),
      ...p.feed("\"change\":\"org\"}\n\nretry: 5000\nid: 7\ndata: a\ndata: b\n\n"),
      ...p.feed("event: database\rdata: {\"id\":\"db\",\"deleted\":true}\r\r"),
      // a trailing CR may be half of a CRLF, so that event is only complete with the next chunk
      ...p.feed(": ping\n"),
    ];
    expect(evs).toEqual([
      { event: "vault", data: '{"id":"v1","etag":"e","revision":3}' },
      { event: "access", data: '{"vault":null,"change":"org"}' },
      { event: "message", data: "a\nb", id: "7" },
      { event: "database", data: '{"id":"db","deleted":true}', id: "7" },
    ]);
    expect(p.retry).toBe(5000);
    expect(evs.map(toSyncEvent)).toEqual([
      { type: "vault", id: "v1", etag: "e", revision: 3 },
      { type: "access", vault: null, change: "org" },
      { type: "unknown", event: "message", data: "a\nb" },
      { type: "database", id: "db", deleted: true },
    ]);
  });

  function streamResponse(chunks: string[], end = true) {
    const enc = new TextEncoder();
    return new Response(
      new ReadableStream({
        start(c) {
          for (const ch of chunks) c.enqueue(enc.encode(ch));
          if (end) c.close();
        },
      }),
      { status: 200, headers: { "Content-Type": "text/event-stream" } },
    );
  }

  it("sends the bearer token, delivers events and reconnects after the server ends the stream", async () => {
    const auths: (string | null)[] = [];
    let n = 0;
    const fetch = async (_u: string, init: RequestInit = {}) => {
      auths.push(new Headers(init.headers).get("Authorization"));
      n++;
      if (n === 1) return streamResponse(['event: vault\ndata: {"id":"v1","etag":"e1","revision":1}\n\n']);
      if (n === 2) return streamResponse(['event: access\ndata: {"vault":"v1","change":"revoked"}\n\n'], false);
      return streamResponse([], false);
    };
    let t = 0;
    const tokens = { getAccessToken: async () => `jwt-${++t}` };
    const events: SyncEvent[] = [];
    const statuses: string[] = [];
    const client = new SyncClient({ baseUrl: "https://sync.example/api/v1", fetch, token: tokens });
    const stream = subscribeEvents(client, { onEvent: (e) => events.push(e), onStatus: (s) => statuses.push(s), initialRetryMs: 5 });
    await vi.waitFor(() => expect(events).toHaveLength(2));
    expect(events).toEqual([
      { type: "vault", id: "v1", etag: "e1", revision: 1 },
      { type: "access", vault: "v1", change: "revoked" },
    ]);
    expect(auths.slice(0, 2)).toEqual(["Bearer jwt-1", "Bearer jwt-2"]);
    // an explicit reconnect (after an access event and a token refresh) aborts the open stream
    stream.reconnect();
    await vi.waitFor(() => expect(n).toBe(3));
    stream.close();
    expect(statuses).toContain("open");
    expect(statuses.at(-1)).toBe("closed");
  });

  it("sends only CORS-allowed headers, so browsers need no refused preflight", async () => {
    const seen: RequestInit[] = [];
    const fetch = async (_u: string, init: RequestInit = {}) => {
      seen.push(init);
      return streamResponse([], false);
    };
    const client = new SyncClient({ baseUrl: "https://sync.example/api/v1", fetch, token: { getAccessToken: async () => "jwt" } });
    const stream = subscribeEvents(client, { onEvent: () => {}, initialRetryMs: 5 });
    await vi.waitFor(() => expect(seen.length).toBeGreaterThan(0));
    stream.close();
    // CORS-safelisted (Accept) plus sync-openapi.yaml's allow list
    const allowed = ["accept", "authorization", "content-type", "if-match", "if-none-match"];
    expect([...new Headers(seen[0]!.headers).keys()].filter((h) => !allowed.includes(h))).toEqual([]);
    expect(seen[0]!.cache).toBe("no-store");
  });

  it("backs off after errors and forces a token refresh after a 401", async () => {
    const forced: boolean[] = [];
    let n = 0;
    const times: number[] = [];
    const fetch = async () => {
      times.push(Date.now());
      n++;
      if (n === 1) throw new TypeError("network down");
      if (n === 2) return json(503, { error: "busy" });
      if (n === 3) return json(401, { error: "expired" });
      return streamResponse(['event: database\ndata: {"id":"main","etag":"e","revision":4}\n\n'], false);
    };
    const tokens = { getAccessToken: async (o?: { force?: boolean }) => (forced.push(!!o?.force), "t") };
    const events: SyncEvent[] = [];
    const client = new SyncClient({ baseUrl: "https://sync.example/api/v1", fetch, token: tokens });
    const stream = subscribeEvents(client, { onEvent: (e) => events.push(e), initialRetryMs: 10, maxRetryMs: 25 });
    await vi.waitFor(() => expect(events).toEqual([{ type: "database", id: "main", etag: "e", revision: 4 }]), { timeout: 2000 });
    stream.close();
    expect(forced).toEqual([false, false, false, true]);
    // 10 ms, then 20 ms, then capped at 25 ms
    expect(times[1]! - times[0]!).toBeGreaterThanOrEqual(9);
    expect(times[2]! - times[1]!).toBeGreaterThanOrEqual(19);
    expect(times[3]! - times[2]!).toBeGreaterThanOrEqual(24);
  });

  it("stops on a permanent client error (e.g. 404: no JWT routes on a legacy server)", async () => {
    const fetch = vi.fn(async () => json(404, { error: "not found" }));
    const statuses: string[] = [];
    subscribeEvents(new SyncClient({ baseUrl: "https://s/api/v1", fetch, token: "x" }), { onEvent: () => {}, onStatus: (s) => statuses.push(s), initialRetryMs: 1 });
    await vi.waitFor(() => expect(statuses.at(-1)).toBe("closed"));
    await new Promise((r) => setTimeout(r, 20));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it, vi } from "vitest";
import { SseParser, SyncClient, deserializeSyncState, serializeSyncState, subscribeEvents, syncKdbx, toSyncEvent, type SyncEvent } from "../src/sync/index.js";
import { openKdbx, saveKdbx, vaultCredentials } from "../src/vault/kdbx.js";
import { KEY, addEntry, edit, get, threeCopies } from "./helpers/dbs.js";
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

describe("syncKdbx (download → merge → conditional PUT → 412 retry)", () => {
  async function setup() {
    const s = new FakeSyncServer();
    const client = SyncClient.selfHosted("https://sync.example", { fetch: s.fetch, token: "dev-token" });
    const copies = await threeCopies((db) => void addEntry(db, "A", { Password: "p", URL: "x" }));
    return { s, blob: client.database("db"), ...copies };
  }

  it("creates, then pulls, then uploads merged changes, keeping a base copy", async () => {
    const { s, blob, local, remote } = await setup();
    const first = await syncKdbx({ blob, db: local, credentials: creds });
    expect(first.outcome).toBe("created");
    expect(first.state.revision).toBe(1);
    expect(first.state.base).toBeDefined();

    // device 2 starts from the server copy, edits URL and uploads
    const dev2 = await syncKdbx({ blob, db: remote, credentials: creds });
    expect(dev2.outcome).toBe("pulled");
    edit(dev2.db, "A", { URL: "y" }, 300);
    const up2 = await syncKdbx({ blob, db: dev2.db, credentials: creds, state: dev2.state });
    expect(up2.outcome).toBe("uploaded");

    // device 1 changed Password meanwhile: the base copy lets both changes survive
    edit(local, "A", { Password: "p2" }, 200);
    const r = await syncKdbx({ blob, db: local, credentials: creds, state: first.state });
    expect(r.outcome).toBe("uploaded");
    expect(r.conflicts).toEqual([]);
    expect([get(r.db, "A", "Password"), get(r.db, "A", "URL")]).toEqual(["p2", "y"]);
    const server = await openKdbx(s.blobs.get("databases/db")!.at(-1)!.data, creds);
    expect([get(server, "A", "Password"), get(server, "A", "URL")]).toEqual(["p2", "y"]);
    expect(r.state.revision).toBe(3);
    expect(serializeSyncState(deserializeSyncState(serializeSyncState(r.state)))).toBe(serializeSyncState(r.state));
  });

  it("on 412 downloads the newer version, merges it too and retries", async () => {
    const { s, blob, local, remote } = await setup();
    const first = await syncKdbx({ blob, db: local, credentials: creds });
    edit(local, "A", { Password: "mine" }, 200);
    // another device uploads between our GET and PUT, once
    let raced = false;
    s.afterGet = async (key) => {
      if (raced) return;
      raced = true;
      edit(remote, "A", { Notes: "theirs" }, 250);
      s.store(key, await saveKdbx(remote));
    };
    const r = await syncKdbx({ blob, db: local, credentials: creds, state: first.state });
    expect(r.attempts).toBe(2);
    expect(s.calls.filter((c) => c.method === "PUT").length).toBe(3); // create, 412, success
    const server = await openKdbx(s.blobs.get("databases/db")!.at(-1)!.data, creds);
    expect([get(server, "A", "Password"), get(server, "A", "Notes")]).toEqual(["mine", "theirs"]);
  });

  it("gives up after maxAttempts when the server keeps changing", async () => {
    const { s, blob, local, remote } = await setup();
    const first = await syncKdbx({ blob, db: local, credentials: creds });
    edit(local, "A", { Password: "mine" }, 200);
    let n = 0;
    s.afterGet = async (key) => {
      edit(remote, "A", { Notes: `theirs ${n++}` }, 250 + n);
      s.store(key, await saveKdbx(remote));
    };
    await expect(syncKdbx({ blob, db: local, credentials: creds, state: first.state, maxAttempts: 3 })).rejects.toMatchObject({ code: "too_many_conflicts" });
    expect(n).toBe(3);
  });

  it("HEAD-checks when nothing changed locally, and detects rollbacks and lost databases", async () => {
    const { s, blob, local } = await setup();
    const first = await syncKdbx({ blob, db: local, credentials: creds });
    const again = await syncKdbx({ blob, db: local, credentials: creds, state: first.state, localChanged: false });
    expect(again.outcome).toBe("unchanged");
    expect(s.last().method).toBe("HEAD");
    await expect(syncKdbx({ blob, db: local, credentials: creds, state: { ...first.state, revision: 7 } })).rejects.toMatchObject({ code: "server_rolled_back" });
    s.blobs.clear();
    await expect(syncKdbx({ blob, db: local, credentials: creds, state: first.state })).rejects.toMatchObject({ code: "server_lost_database" });
    expect((await syncKdbx({ blob, db: local, credentials: creds, state: first.state, acceptServerState: true })).outcome).toBe("created");
  });

  it("re-keys before upload (rotation) and opens with the first credentials that work", async () => {
    const { s, blob, local } = await setup();
    await syncKdbx({ blob, db: local, credentials: creds });
    const newKey = new Uint8Array(32).fill(9);
    const { rekeyToVaultKey } = await import("../src/vault/kdbx.js");
    const r = await syncKdbx({ blob, db: local, credentials: [vaultCredentials(newKey), creds], beforeUpload: (db) => rekeyToVaultKey(db, newKey) });
    expect(r.outcome).toBe("uploaded");
    expect(r.credentialsIndex).toBe(1);
    const data = s.blobs.get("databases/db")!.at(-1)!.data;
    await expect(openKdbx(data, creds)).rejects.toMatchObject({ code: "vault_key_mismatch" });
    expect(get(await openKdbx(data, vaultCredentials(newKey)), "A", "Password")).toBe("p");
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

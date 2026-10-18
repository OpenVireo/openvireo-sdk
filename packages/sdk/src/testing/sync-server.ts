/** An in-memory sync server with the legacy and JWT blob semantics (ETag, revision, 412/428, history). */
import { sha256 } from "@noble/hashes/sha2.js";
import { MockServer, bytes, json } from "./mock-fetch.js";

interface Version {
  data: Uint8Array;
  etag: string;
  revision: number;
  updatedAt: string;
}

const etagOf = (d: Uint8Array) => `"${Array.from(sha256(d), (b) => b.toString(16).padStart(2, "0")).join("")}"`;

export class FakeSyncServer extends MockServer {
  readonly blobs = new Map<string, Version[]>();
  /** called after a successful GET, before the client can PUT (to simulate another device) */
  afterGet: ((key: string) => void | Promise<void>) | null = null;
  tokens = new Set(["dev-token", "jwt-ok"]);
  pairing = new Map([["ABCD-EFGH", { user: "alice", deviceId: "dev-2", token: "dev-token-2" }]]);

  constructor() {
    super();
    const auth = (h: (req: any, p: any) => Response | Promise<Response>) => (req: any, p: any) =>
      this.tokens.has((req.headers.authorization ?? "").replace(/^Bearer /, "")) ? h(req, p) : json(401, { error: "Missing or invalid access token." }, { "WWW-Authenticate": "Bearer" });
    for (const kind of ["databases", "vaults"]) {
      this.on("GET", `/api/v1/${kind}`, auth(() => json(200, { [kind]: [...this.blobs.entries()].filter(([k]) => k.startsWith(kind + "/")).map(([k, v]) => this.meta(k, v.at(-1)!)) })));
      this.on("GET", `/api/v1/${kind}/{id}`, auth(async (req, p) => this.get(`${kind}/${p.id}`, req)));
      this.on("PUT", `/api/v1/${kind}/{id}`, auth((req, p) => this.put(`${kind}/${p.id}`, req)));
      this.on("DELETE", `/api/v1/${kind}/{id}`, auth((_req, p) => (this.blobs.delete(`${kind}/${p.id}`) ? new Response(null, { status: 204 }) : json(404, { error: "Database not found." }))));
      this.on("GET", `/api/v1/${kind}/{id}/history`, auth((_r, p) => json(200, { versions: (this.blobs.get(`${kind}/${p.id}`) ?? []).map((v) => this.meta(`${kind}/${p.id}`, v)).reverse() })));
      this.on("GET", `/api/v1/${kind}/{id}/history/{rev}`, auth((_r, p) => {
        const v = this.blobs.get(`${kind}/${p.id}`)?.find((x) => x.revision === Number(p.rev));
        return v ? bytes(200, v.data, this.headers(v)) : json(404, { error: "Version not found." });
      }));
    }
    this.on("POST", "/api/v1/devices/pairing/claim", (req) => {
      const d = this.pairing.get(req.json?.code);
      if (!d || typeof req.json?.deviceName !== "string") return json(400, { error: "Unknown or expired pairing code." });
      this.pairing.delete(req.json.code);
      this.tokens.add(d.token);
      return json(201, d);
    });
    this.on("POST", "/api/v1/devices/pairing", auth(() => json(201, { code: "WXYZ-2345", expiresAt: "2026-10-17T00:05:00Z" })));
    this.on("GET", "/api/v1/health", () => json(200, { status: "ok" }));
  }

  private meta(key: string, v: Version) {
    return { id: key.split("/")[1], etag: v.etag, revision: v.revision, size: v.data.length, updatedAt: v.updatedAt };
  }
  private headers(v: Version) {
    return { ETag: v.etag, "X-Database-Revision": String(v.revision), "Last-Modified": new Date(v.updatedAt).toUTCString() };
  }
  private async get(key: string, req: any) {
    const v = this.blobs.get(key)?.at(-1);
    if (!v) return json(404, { error: "Database not found." });
    if (req.headers["if-none-match"] === v.etag) return new Response(null, { status: 304, headers: this.headers(v) });
    const res = bytes(200, v.data, this.headers(v));
    if (req.method === "GET") await this.afterGet?.(key);
    return res;
  }
  private put(key: string, req: any) {
    const cur = this.blobs.get(key)?.at(-1);
    const ifMatch = req.headers["if-match"];
    const ifNone = req.headers["if-none-match"];
    if (!ifMatch && !ifNone) return json(428, { error: "precondition required", code: "precondition_required" });
    if (ifNone === "*" && cur) return json(412, { error: "exists", code: "precondition_failed" });
    if (ifMatch && (!cur || ifMatch !== cur.etag)) return json(412, { error: "The database was changed on the server.", code: "precondition_failed" });
    this.store(key, req.body);
    const v = this.blobs.get(key)!.at(-1)!;
    return json(cur ? 200 : 201, this.meta(key, v), this.headers(v));
  }
  /** writes a version directly (another device) */
  store(key: string, data: Uint8Array) {
    const list = this.blobs.get(key) ?? [];
    list.push({ data: data.slice(), etag: etagOf(data), revision: (list.at(-1)?.revision ?? 0) + 1, updatedAt: new Date().toISOString() });
    this.blobs.set(key, list);
  }
}

/**
 * The REST API of `openvireo connect`, as a fetch-style handler `(Request) => Promise<Response>` so it runs
 * under node:http, Bun.serve or a test without sockets.
 *
 *   GET  /health                                   liveness (no auth)
 *   GET  /ready                                    the SA token was exchanged (no auth)
 *   GET  /v1/vaults                                vaults this token may use
 *   GET  /v1/vaults/{vault}                        one vault
 *   GET  /v1/vaults/{vault}/items                  items without values
 *   GET  /v1/vaults/{vault}/items/{group/…/entry}  one item with its values (?field=name → {"value"})
 *   PUT  /v1/vaults/{vault}/items/{group/…/entry}  {"fields":{…}} creates or updates (?create=false: update only)
 *
 * {vault} is a vault id or name, {entry} an entry UUID or title; segments are percent-encoded.
 * Errors are {"error","code"} as in openapi.yaml.
 */
import { OpenVireoError, type Item, type Kdbx, type SaVault, type ServiceAccount, findEntry, itemOf, listItems, resolveFieldName, setItemFields } from "@openvireo/sdk";
import { type ConnectToken, allowsVault, authenticate } from "./tokens.js";

/** The part of ServiceAccount the server uses (a fake in tests). */
export type ConnectSource = Pick<ServiceAccount, "listVaults" | "vault" | "pull" | "edit">;

export interface ConnectOptions {
  source: ConnectSource;
  tokens: readonly ConnectToken[];
  /** how long a downloaded vault is used before a HEAD check against the sync server (default 5 s) */
  cacheTtlMs?: number;
  /** how long the vault list is cached (default 60 s); grants change rarely */
  vaultsTtlMs?: number;
  /** request log (method, path, status, token name); never receives secret values */
  log?: (line: string) => void;
  maxBodyBytes?: number;
}

export type Handler = (req: Request) => Promise<Response>;

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });
const fail = (status: number, code: string, error: string, headers: Record<string, string> = {}) => json(status, { error, code }, headers);

const STATUS: Record<string, number> = {
  invalid_reference: 400,
  invalid_request: 400,
  entry_not_found: 404,
  not_found: 404,
  forbidden: 403,
  conflict: 409,
  too_many_conflicts: 409,
};

function errorResponse(e: unknown): Response {
  if (e instanceof OpenVireoError) {
    const status = STATUS[e.code];
    if (status) return fail(status, e.code === "entry_not_found" ? "not_found" : e.code, e.message);
    // The SA token was revoked or expired, or the auth/sync server failed: not the caller's fault
    if (e.status === 401) return fail(502, "upstream_unauthorized", "the service account token was rejected by the auth server");
    return fail(502, "upstream_error", e.message);
  }
  return fail(500, "server_error", "internal error");
}

export function createConnectHandler(opts: ConnectOptions): Handler {
  const ttl = opts.cacheTtlMs ?? 5_000;
  const vaultsTtl = opts.vaultsTtlMs ?? 60_000;
  const maxBody = opts.maxBodyBytes ?? 1 << 20;
  let vaultsAt = 0;
  let ready = false;

  const vaults = async (): Promise<SaVault[]> => {
    const refresh = Date.now() - vaultsAt > vaultsTtl;
    const list = await opts.source.listVaults(refresh);
    if (refresh) vaultsAt = Date.now();
    ready = true;
    return list;
  };

  /** The vault if this token may use it (404 otherwise, so tokens can't probe other vault names). */
  const vaultFor = async (token: ConnectToken, idOrName: string): Promise<SaVault> => {
    await vaults();
    let v: SaVault;
    try {
      v = await opts.source.vault(idOrName);
    } catch (e) {
      if (e instanceof OpenVireoError && e.code === "not_found") throw new OpenVireoError("not_found", `vault "${idOrName}" not found`, 404);
      throw e;
    }
    if (!allowsVault(token, v)) throw new OpenVireoError("not_found", `vault "${idOrName}" not found`, 404);
    return v;
  };

  /** The SA's copy of a vault; pull() (a HEAD check) runs at most once per TTL. */
  const cache = new Map<string, { db: Kdbx; at: number }>();
  const current = async (v: SaVault): Promise<Kdbx> => {
    const c = cache.get(v.id);
    if (c && Date.now() - c.at < ttl) return c.db;
    const db = await opts.source.pull(v.id);
    cache.set(v.id, { db, at: Date.now() });
    return db;
  };

  const vaultJson = (v: SaVault) => ({ id: v.id, name: v.name, role: v.role });

  async function route(req: Request, token: ConnectToken, seg: string[]): Promise<Response> {
    const url = new URL(req.url);
    if (seg.length === 2 && req.method === "GET") {
      return json(200, { vaults: (await vaults()).filter((v) => allowsVault(token, v)).map(vaultJson) });
    }
    const v = await vaultFor(token, seg[2]!);
    if (seg.length === 3 && req.method === "GET") return json(200, vaultJson(v));
    if (seg[3] !== "items") return fail(404, "not_found", "no such route");
    if (seg.length === 4) {
      if (req.method !== "GET") return fail(405, "invalid_request", "method not allowed", { Allow: "GET" });
      return json(200, { items: listItems(await current(v)) });
    }
    const ref = { groupPath: seg.slice(4, -1), entry: seg[seg.length - 1]! };

    if (req.method === "GET") {
      const entry = findEntry(await current(v), ref);
      const field = url.searchParams.get("field");
      if (field === null) return json(200, itemOf(entry, { reveal: true }));
      const name = resolveFieldName(entry, field);
      if (!entry.fields.has(name)) return fail(404, "not_found", `field "${field}" not found`);
      const value = itemOf(entry, { reveal: true }).fields[name] ?? "";
      const accept = req.headers.get("accept") ?? "";
      if (accept.includes("text/plain") && !accept.includes("json")) return new Response(value, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
      return json(200, { value });
    }

    if (req.method === "PUT") {
      if (token.access !== "write") return fail(403, "forbidden", `token "${token.name}" is read-only`);
      const body = await readJson(req, maxBody);
      const fields = (body as { fields?: unknown })?.fields;
      if (!fields || typeof fields !== "object" || Array.isArray(fields) || Object.values(fields).some((x) => typeof x !== "string")) {
        return fail(400, "invalid_request", 'body must be {"fields": {"<name>": "<value>", …}}');
      }
      const protect = (body as { protected?: unknown }).protected;
      if (protect !== undefined && (typeof protect !== "object" || Array.isArray(protect) || Object.values(protect as object).some((x) => typeof x !== "boolean"))) {
        return fail(400, "invalid_request", '"protected" must be {"<name>": true|false, …}');
      }
      const create = url.searchParams.get("create") !== "false";
      try {
        const out = await opts.source.edit(v.id, (db): { item: Item; created: boolean } => {
          const r = setItemFields(db, ref, fields as Record<string, string>, { create, protect: protect as Record<string, boolean> | undefined });
          return { item: itemOf(r.entry), created: r.created };
        });
        return json(out.created ? 201 : 200, out.item);
      } finally {
        // the SA now holds the merged copy (or none, if the upload failed): use it from the next request
        cache.delete(v.id);
      }
    }
    return fail(405, "invalid_request", "method not allowed", { Allow: "GET, PUT" });
  }

  async function handle(req: Request, url: URL, onToken: (t: ConnectToken) => void): Promise<Response> {
    let seg: string[];
    try {
      seg = url.pathname.split("/").filter((s) => s !== "").map(decodeURIComponent);
    } catch {
      return fail(400, "invalid_request", "bad percent-encoding in the path");
    }
    if (url.pathname === "/health") return json(200, { status: "ok" });
    if (url.pathname === "/ready") {
      if (!ready) await vaults();
      return json(200, { status: "ready" });
    }
    if (seg[0] !== "v1" || seg[1] !== "vaults") return fail(404, "not_found", "no such route");
    const token = authenticate(opts.tokens, req.headers.get("authorization"));
    if (!token) return fail(401, "unauthorized", "missing or unknown bearer token", { "WWW-Authenticate": "Bearer" });
    onToken(token);
    return route(req, token, seg);
  }

  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    let name = "-";
    let res: Response;
    try {
      res = await handle(req, url, (t) => (name = t.name));
    } catch (e) {
      res = errorResponse(e);
    }
    opts.log?.(`${req.method} ${url.pathname} ${res.status} token=${name}`);
    return res;
  };
}

async function readJson(req: Request, max: number): Promise<unknown> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > max) throw new OpenVireoError("invalid_request", "request body too large");
  const text = await req.text();
  if (text.length > max) throw new OpenVireoError("invalid_request", "request body too large");
  try {
    return JSON.parse(text);
  } catch {
    throw new OpenVireoError("invalid_request", "request body is not JSON");
  }
}

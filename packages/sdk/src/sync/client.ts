/**
 * Sync server client: the JWT routes of sync-openapi.yaml (`vaults/*`, `events`) and the legacy
 * device-token routes (`databases/*`, `devices/pairing*`, `health`), with conditional GET/PUT.
 */
import { KpxError } from "../errors.js";
import { type HttpOptions, errorFromResponse, joinUrl, seg, send, sendJson } from "../http/request.js";
import type { AccessTokenSource } from "../auth/client.js";
import type { BlobMeta } from "../auth/types.js";

export type { BlobMeta };

export interface SyncClientOptions extends HttpOptions {
  /** `{sync}` from discovery (…/api/v1), or a self-hosted server's base URL (see `selfHosted`) */
  baseUrl: string;
  /** a device token (legacy) or a JWT source (TokenManager / service account) */
  token?: string | AccessTokenSource | null;
}

export interface BlobVersion {
  etag: string;
  revision: number;
  lastModified?: string;
}

export type HeadResult = ({ status: 200 | 304 } & BlobVersion) | { status: 404 };
export type GetResult = ({ status: 200; data: Uint8Array } & BlobVersion) | ({ status: 304 } & BlobVersion) | { status: 404 };
export interface PutResult extends BlobVersion {
  created: boolean;
  meta?: BlobMeta;
}

const version = (res: Response): BlobVersion => {
  const rev = Number(res.headers.get("X-Database-Revision"));
  return { etag: res.headers.get("ETag") ?? "", revision: Number.isFinite(rev) ? rev : -1, lastModified: res.headers.get("Last-Modified") ?? undefined };
};

/** One blob: `vaults/<id>` (JWT) or `databases/<id>` (legacy). */
export class BlobHandle {
  constructor(
    private readonly client: SyncClient,
    readonly path: string,
  ) {}

  async head(ifNoneMatch?: string): Promise<HeadResult> {
    const res = await this.client.request(this.path, { method: "HEAD", headers: ifNoneMatch ? { "If-None-Match": ifNoneMatch } : {} });
    if (res.status === 404) return { status: 404 };
    if (res.status === 200 || res.status === 304) return { status: res.status, ...version(res) };
    throw await errorFromResponse(res);
  }

  async get(opts: { ifNoneMatch?: string; signal?: AbortSignal } = {}): Promise<GetResult> {
    const res = await this.client.request(this.path, { headers: opts.ifNoneMatch ? { "If-None-Match": opts.ifNoneMatch } : {}, signal: opts.signal });
    if (res.status === 404) {
      await res.body?.cancel();
      return { status: 404 };
    }
    if (res.status === 304) return { status: 304, ...version(res) };
    if (res.status !== 200) throw await errorFromResponse(res);
    return { status: 200, data: new Uint8Array(await res.arrayBuffer()), ...version(res) };
  }

  /**
   * Conditional upload: `ifMatch` updates exactly that version; `create` sends `If-None-Match: *`.
   * A mismatch throws an HttpError with code `precondition_failed` (412).
   */
  async put(data: Uint8Array, cond: { ifMatch: string } | { create: true }, signal?: AbortSignal): Promise<PutResult> {
    const headers: Record<string, string> = "create" in cond ? { "If-None-Match": "*" } : { "If-Match": cond.ifMatch };
    const res = await this.client.request(this.path, { method: "PUT", headers, body: data, signal });
    if (res.status !== 200 && res.status !== 201) {
      const err = await errorFromResponse(res);
      if (res.status === 412) throw new KpxError("precondition_failed", err.message, 412, { cause: err });
      throw err;
    }
    let meta: BlobMeta | undefined;
    try {
      meta = (await res.json()) as BlobMeta;
    } catch {
      /* empty body */
    }
    const v = version(res);
    return { created: res.status === 201, etag: v.etag || meta?.etag || "", revision: v.revision >= 0 ? v.revision : (meta?.revision ?? -1), lastModified: v.lastModified, meta };
  }

  async delete(ifMatch?: string): Promise<void> {
    const res = await this.client.request(this.path, { method: "DELETE", headers: ifMatch ? { "If-Match": ifMatch } : {} });
    if (res.status !== 204 && res.status !== 200) throw await errorFromResponse(res);
  }

  async history(): Promise<BlobMeta[]> {
    const res = await this.client.request(`${this.path}/history`, { headers: { Accept: "application/json" } });
    if (!res.ok) throw await errorFromResponse(res);
    return ((await res.json()) as { versions: BlobMeta[] }).versions;
  }

  /** One kept version (`<path>/history/<revision>`). */
  async getRevision(revision: number): Promise<{ data: Uint8Array } & BlobVersion> {
    const res = await this.client.request(`${this.path}/history/${revision}`);
    if (!res.ok) throw await errorFromResponse(res);
    return { data: new Uint8Array(await res.arrayBuffer()), ...version(res) };
  }
}

export interface PairingClaim {
  user: string;
  deviceId: string;
  token: string;
}

export class SyncClient {
  readonly baseUrl: string;
  constructor(readonly opts: SyncClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
  }

  /** For a self-hosted server URL like https://sync.example.org (adds /api/v1, as Qt does). */
  static selfHosted(serverUrl: string, opts: Omit<SyncClientOptions, "baseUrl"> = {}): SyncClient {
    return new SyncClient({ ...opts, baseUrl: serverUrl.trim().replace(/\/+$/, "") + "/api/v1" });
  }

  url(path: string): string {
    return joinUrl(this.baseUrl, path);
  }

  async token(force = false): Promise<string | null> {
    const t = this.opts.token;
    if (!t) return null;
    return typeof t === "string" ? t : t.getAccessToken({ force });
  }

  /** Sends with the bearer token; on 401 with a refreshable source, retries once with a fresh token. */
  async request(path: string, init: { method?: string; headers?: Record<string, string>; body?: Uint8Array; signal?: AbortSignal } = {}): Promise<Response> {
    const go = async (force: boolean) => send(this.opts, this.url(path), { ...init, token: await this.token(force) });
    const res = await go(false);
    if (res.status === 401 && this.opts.token && typeof this.opts.token !== "string") {
      await res.body?.cancel();
      return go(true);
    }
    return res;
  }

  private async json<T>(path: string, init: { method?: string; json?: unknown } = {}): Promise<T> {
    const token = await this.token();
    try {
      return await sendJson<T>(this.opts, this.url(path), { ...init, token });
    } catch (e) {
      if ((e as KpxError).status === 401 && this.opts.token && typeof this.opts.token !== "string") {
        return sendJson<T>(this.opts, this.url(path), { ...init, token: await this.token(true) });
      }
      throw e;
    }
  }

  // ---------------------------------------------------------------- JWT routes (sync-openapi.yaml)
  async listVaults(): Promise<BlobMeta[]> {
    return (await this.json<{ vaults: BlobMeta[] }>("vaults")).vaults;
  }
  vault(id: string): BlobHandle {
    return new BlobHandle(this, `vaults/${seg(id)}`);
  }

  // ---------------------------------------------------------------- legacy device-token routes
  async health(): Promise<unknown> {
    return sendJson(this.opts, this.url("health"));
  }
  async listDatabases(): Promise<BlobMeta[]> {
    return (await this.json<{ databases: BlobMeta[] }>("databases")).databases;
  }
  database(id: string): BlobHandle {
    return new BlobHandle(this, `databases/${seg(id.trim())}`);
  }
  /** A pairing code another device of the same user can claim (needs a device token). */
  async createPairingCode(): Promise<{ code: string; expiresAt: string }> {
    return this.json("devices/pairing", { method: "POST", json: {} });
  }
  /** Exchanges a pairing code for a device token (no token needed; the code is the credential). */
  async claimPairingCode(code: string, deviceName: string): Promise<PairingClaim> {
    return sendJson<PairingClaim>(this.opts, this.url("devices/pairing/claim"), { method: "POST", json: { code: code.trim(), deviceName } });
  }

  static isPairingCode(text: string): boolean {
    return /^[A-Z2-9]{4}[- ]?[A-Z2-9]{4}$/i.test(text.trim());
  }

  /** Same as Qt's SyncServerClient::etagFor: the quoted hex SHA-256 of the data. */
  static async etagFor(data: Uint8Array): Promise<string> {
    const { sha256 } = await import("@noble/hashes/sha2.js");
    return `"${Array.from(sha256(data), (b) => b.toString(16).padStart(2, "0")).join("")}"`;
  }
}

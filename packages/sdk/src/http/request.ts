/** Minimal fetch wrapper: JSON or bytes, the `{error, code}` error format, and no redirects. */
import { OpenVireoError } from "../errors.js";

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface HttpOptions {
  /** defaults to globalThis.fetch */
  fetch?: FetchLike;
  /** extra headers for every request (e.g. User-Agent in Node) */
  headers?: Record<string, string>;
}

export class HttpError extends OpenVireoError {
  constructor(
    code: string,
    message: string,
    status: number,
    readonly body?: unknown,
    readonly retryAfter?: number,
  ) {
    super(code, message, status);
  }
}

const codeForStatus = (status: number): string =>
  ({
    400: "invalid_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    409: "conflict",
    410: "gone",
    412: "precondition_failed",
    428: "precondition_required",
    429: "rate_limited",
  })[status] ?? (status >= 500 ? "server_error" : "invalid_request");

export async function errorFromResponse(res: Response): Promise<HttpError> {
  let body: unknown;
  let message = `HTTP ${res.status}`;
  let code = codeForStatus(res.status);
  try {
    const text = await res.text();
    body = text ? JSON.parse(text) : undefined;
    const b = body as { error?: unknown; code?: unknown } | undefined;
    if (typeof b?.error === "string") message = b.error;
    if (typeof b?.code === "string") code = b.code;
  } catch {
    /* not JSON */
  }
  const ra = res.headers.get("Retry-After");
  return new HttpError(code, message, res.status, body, ra && /^\d+$/.test(ra) ? Number(ra) : undefined);
}

export function joinUrl(base: string, path: string): string {
  return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

/** Encodes one path segment; keeps ":" readable for principals ("user:<uuid>"). */
export const seg = (s: string): string => encodeURIComponent(s).replace(/%3A/gi, ":");

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  json?: unknown;
  body?: Uint8Array;
  token?: string | null;
  signal?: AbortSignal;
  /** fetch cache mode; a header like Cache-Control would need a CORS preflight the sync server refuses */
  cache?: RequestCache;
}

export async function send(http: HttpOptions, url: string, opts: RequestOptions = {}): Promise<Response> {
  const f = http.fetch ?? (globalThis.fetch as FetchLike | undefined);
  if (!f) throw new OpenVireoError("network_error", "no fetch implementation available");
  const headers: Record<string, string> = { ...http.headers, ...opts.headers };
  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  } else if (opts.body) {
    headers["Content-Type"] ??= "application/octet-stream";
    body = opts.body as unknown as BodyInit;
  }
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  let res: Response;
  try {
    // Never follow redirects: they could forward the bearer token to another host
    res = await f(url, { method: opts.method ?? "GET", headers, body, signal: opts.signal, redirect: "manual", ...(opts.cache ? { cache: opts.cache } : {}) });
  } catch (e) {
    if ((e as { name?: string })?.name === "AbortError") throw new OpenVireoError("aborted", "request aborted", undefined, { cause: e });
    throw new OpenVireoError("network_error", `could not reach ${new URL(url).host}: ${String((e as Error)?.message ?? e)}`, 0, { cause: e });
  }
  if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400 && res.status !== 304)) {
    throw new HttpError("invalid_request", "the server answered with a redirect; check the server URL", res.status || 302);
  }
  return res;
}

/** Sends and returns the parsed JSON (or undefined for 204); throws HttpError for non-2xx. */
export async function sendJson<T>(http: HttpOptions, url: string, opts: RequestOptions = {}): Promise<T> {
  const res = await send(http, url, { ...opts, headers: { Accept: "application/json", ...opts.headers } });
  if (!res.ok) throw await errorFromResponse(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

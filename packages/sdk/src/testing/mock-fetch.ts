/** A tiny in-memory HTTP router used as `fetch` in tests. */
export interface Recorded {
  method: string;
  url: string;
  path: string;
  query: URLSearchParams;
  headers: Record<string, string>;
  body: Uint8Array | null;
  json: any;
}

export type Handler = (req: Recorded, params: Record<string, string>) => Response | Promise<Response>;

export function json(status: number, body?: unknown, headers: Record<string, string> = {}): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
  });
}

export function bytes(status: number, data: Uint8Array | null, headers: Record<string, string> = {}): Response {
  return new Response(data as BodyInit | null, { status, headers: { "Content-Type": "application/octet-stream", ...headers } });
}

export class MockServer {
  readonly calls: Recorded[] = [];
  private routes: { method: string; re: RegExp; keys: string[]; h: Handler }[] = [];

  on(method: string, pattern: string, h: Handler): this {
    const keys: string[] = [];
    const re = new RegExp(
      "^" +
        pattern.replace(/[.*+?^${}()|[\]\\]/g, (c) => (c === "{" || c === "}" ? c : "\\" + c)).replace(/\{(\w+)\}/g, (_, k) => {
          keys.push(k);
          return "([^/]+)";
        }) +
        "$",
    );
    this.routes.unshift({ method, re, keys, h });
    return this;
  }

  fetch = async (input: string, init: RequestInit = {}): Promise<Response> => {
    const u = new URL(input);
    const headers: Record<string, string> = {};
    new Headers(init.headers).forEach((v, k) => (headers[k.toLowerCase()] = v));
    let body: Uint8Array | null = null;
    if (typeof init.body === "string") body = new TextEncoder().encode(init.body);
    else if (init.body instanceof Uint8Array) body = init.body;
    let parsed: any;
    try {
      parsed = body && headers["content-type"]?.includes("json") ? JSON.parse(new TextDecoder().decode(body)) : undefined;
    } catch {
      parsed = undefined;
    }
    const req: Recorded = { method: init.method ?? "GET", url: input, path: u.pathname, query: u.searchParams, headers, body, json: parsed };
    this.calls.push(req);
    if (init.signal?.aborted) throw Object.assign(new Error("aborted"), { name: "AbortError" });
    for (const r of this.routes) {
      if (r.method !== req.method && !(r.method === "GET" && req.method === "HEAD")) continue;
      const m = r.re.exec(decodeURIComponent(u.pathname));
      if (!m) continue;
      const params: Record<string, string> = {};
      r.keys.forEach((k, i) => (params[k] = m[i + 1]!));
      const res = await r.h(req, params);
      return req.method === "HEAD" ? new Response(null, { status: res.status, headers: res.headers }) : res;
    }
    return json(404, { error: `no route for ${req.method} ${u.pathname}`, code: "not_found" });
  };

  last(): Recorded {
    return this.calls[this.calls.length - 1]!;
  }
}

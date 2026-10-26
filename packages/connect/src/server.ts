/** Runs the connect handler on node:http (also used by Bun and the single `openvireo` binary). */
import { readFileSync } from "node:fs";
import { type IncomingMessage, type Server, type ServerResponse, createServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { OpenVireoError, ServiceAccount, type FetchLike } from "@openvireo/sdk";
import { type Handler, createConnectHandler } from "./handler.js";
import { type ConnectToken, hashConnectToken, parseConnectTokens } from "./tokens.js";

/** Bridges node:http to a fetch-style handler. */
export function toNodeListener(handler: Handler) {
  return (req: IncomingMessage, res: ServerResponse) => {
    void (async () => {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c as Buffer);
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
      const method = req.method ?? "GET";
      const request = new Request(`http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`, {
        method,
        headers,
        body: method === "GET" || method === "HEAD" ? undefined : Buffer.concat(chunks),
      });
      const response = await handler(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    })().catch(() => {
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" });
      res.end('{"error":"internal error","code":"server_error"}');
    });
  };
}

export interface ConnectConfig {
  saToken: string;
  tokens: ConnectToken[];
  host: string;
  port: number;
  cacheTtlMs: number;
  tls?: { cert: string; key: string };
}

const readMaybe = (env: Record<string, string | undefined>, name: string): string | undefined => {
  if (env[name]) return env[name];
  const file = env[`${name}_FILE`];
  return file ? readFileSync(file, "utf8").trim() : undefined;
};

/**
 * Reads the configuration from the environment:
 * - OPENVIREO_SERVICE_ACCOUNT_TOKEN (or OPENVIREO_SERVICE_ACCOUNT_TOKEN_FILE)
 * - OPENVIREO_CONNECT_TOKENS (JSON) or OPENVIREO_CONNECT_TOKENS_FILE; and/or OPENVIREO_CONNECT_TOKEN (one plain token,
 *   read access to every vault, or write with OPENVIREO_CONNECT_TOKEN_ACCESS=write)
 * - OPENVIREO_CONNECT_HOST (127.0.0.1), OPENVIREO_CONNECT_PORT (8080), OPENVIREO_CONNECT_CACHE_TTL (seconds, 5)
 * - OPENVIREO_CONNECT_TLS_CERT and OPENVIREO_CONNECT_TLS_KEY (PEM files) to serve HTTPS
 */
export function configFromEnv(env: Record<string, string | undefined>): ConnectConfig {
  const saToken = readMaybe(env, "OPENVIREO_SERVICE_ACCOUNT_TOKEN");
  if (!saToken) throw new OpenVireoError("invalid_request", "set OPENVIREO_SERVICE_ACCOUNT_TOKEN (or OPENVIREO_SERVICE_ACCOUNT_TOKEN_FILE)");
  const tokens: ConnectToken[] = [];
  const list = readMaybe(env, "OPENVIREO_CONNECT_TOKENS");
  if (list) tokens.push(...parseConnectTokens(list));
  const single = readMaybe(env, "OPENVIREO_CONNECT_TOKEN");
  if (single) {
    const access = env.OPENVIREO_CONNECT_TOKEN_ACCESS === "write" ? "write" : "read";
    tokens.push({ name: "default", sha256: hashConnectToken(single), vaults: ["*"], access });
  }
  if (!tokens.length) throw new OpenVireoError("invalid_request", "no connect tokens: set OPENVIREO_CONNECT_TOKENS_FILE or OPENVIREO_CONNECT_TOKEN (create one with `openvireo connect token`)");
  const port = Number(env.OPENVIREO_CONNECT_PORT ?? 8080);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new OpenVireoError("invalid_request", `bad OPENVIREO_CONNECT_PORT: ${env.OPENVIREO_CONNECT_PORT}`);
  const ttl = Number(env.OPENVIREO_CONNECT_CACHE_TTL ?? 5);
  if (!Number.isFinite(ttl) || ttl < 0) throw new OpenVireoError("invalid_request", `bad OPENVIREO_CONNECT_CACHE_TTL: ${env.OPENVIREO_CONNECT_CACHE_TTL}`);
  const cert = env.OPENVIREO_CONNECT_TLS_CERT;
  const key = env.OPENVIREO_CONNECT_TLS_KEY;
  if (!!cert !== !!key) throw new OpenVireoError("invalid_request", "set both OPENVIREO_CONNECT_TLS_CERT and OPENVIREO_CONNECT_TLS_KEY");
  return { saToken, tokens, host: env.OPENVIREO_CONNECT_HOST ?? "127.0.0.1", port, cacheTtlMs: ttl * 1000, ...(cert && key ? { tls: { cert, key } } : {}) };
}

export interface RunningConnect {
  server: Server;
  url: string;
  close(): Promise<void>;
}

/** Exchanges the SA token and starts listening. */
export async function startConnect(config: ConnectConfig, opts: { fetch?: FetchLike; log?: (line: string) => void } = {}): Promise<RunningConnect> {
  const sa = await ServiceAccount.fromToken(config.saToken, { fetch: opts.fetch, headers: { "User-Agent": "openvireo-connect/0.2.0" } });
  const handler = createConnectHandler({ source: sa, tokens: config.tokens, cacheTtlMs: config.cacheTtlMs, log: opts.log });
  const listener = toNodeListener(handler);
  const server = config.tls ? createHttpsServer({ cert: readFileSync(config.tls.cert), key: readFileSync(config.tls.key) }, listener) : createServer(listener);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, () => resolve());
  });
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : config.port;
  const host = config.host.includes(":") ? `[${config.host}]` : config.host;
  return {
    server,
    url: `${config.tls ? "https" : "http"}://${host}:${port}`,
    close: () =>
      new Promise((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections?.();
        sa.close();
      }),
  };
}

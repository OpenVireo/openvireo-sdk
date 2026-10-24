/**
 * Server-sent events from `{sync}/events` (SPEC §11) over fetch, so the Authorization header can be
 * sent (EventSource can't). Handles `vault`, `access` and legacy `database` events, and reconnects:
 * immediately after a clean end (the server closes JWT streams at the token's exp), with exponential
 * backoff after errors, and with a forced token refresh after a 401.
 */
import { OpenVireoError } from "../errors.js";
import { send, errorFromResponse } from "../http/request.js";
import type { SyncClient } from "./client.js";

export interface RawSseEvent {
  event: string;
  data: string;
  id?: string;
}

/** Incremental text/event-stream parser (WHATWG rules: CR/LF/CRLF, comments, multi-line data, retry). */
export class SseParser {
  private buf = "";
  private event = "";
  private data: string[] = [];
  private id: string | undefined;
  retry: number | undefined;

  feed(chunk: string): RawSseEvent[] {
    this.buf += chunk;
    const out: RawSseEvent[] = [];
    for (;;) {
      const m = /\r\n|\r|\n/.exec(this.buf);
      if (!m) break;
      // a lone CR at the end of the buffer may be the first half of CRLF
      if (m[0] === "\r" && m.index === this.buf.length - 1) break;
      const line = this.buf.slice(0, m.index);
      this.buf = this.buf.slice(m.index + m[0].length);
      if (line === "") {
        if (this.data.length) out.push({ event: this.event || "message", data: this.data.join("\n"), ...(this.id !== undefined ? { id: this.id } : {}) });
        this.event = "";
        this.data = [];
        continue;
      }
      if (line.startsWith(":")) continue;
      const colon = line.indexOf(":");
      const field = colon < 0 ? line : line.slice(0, colon);
      let value = colon < 0 ? "" : line.slice(colon + 1);
      if (value.startsWith(" ")) value = value.slice(1);
      if (field === "event") this.event = value;
      else if (field === "data") this.data.push(value);
      else if (field === "id") this.id = value;
      else if (field === "retry" && /^\d+$/.test(value)) this.retry = Number(value);
    }
    return out;
  }
}

export type AccessChange = "granted" | "revoked" | "rotating" | "rotated" | "org";

export type SyncEvent =
  | { type: "vault"; id: string; etag?: string; revision?: number; deleted?: boolean }
  | { type: "access"; vault: string | null; change: AccessChange }
  | { type: "database"; id: string; etag?: string; revision?: number; deleted?: boolean }
  | { type: "unknown"; event: string; data: string };

export function toSyncEvent(e: RawSseEvent): SyncEvent | null {
  let j: Record<string, unknown>;
  try {
    j = JSON.parse(e.data) as Record<string, unknown>;
  } catch {
    return { type: "unknown", event: e.event, data: e.data };
  }
  if (e.event === "vault" || e.event === "database") {
    if (typeof j.id !== "string" || !j.id) return null;
    return {
      type: e.event,
      id: j.id,
      ...(typeof j.etag === "string" ? { etag: j.etag } : {}),
      ...(typeof j.revision === "number" ? { revision: j.revision } : {}),
      ...(j.deleted === true ? { deleted: true } : {}),
    };
  }
  if (e.event === "access") return { type: "access", vault: typeof j.vault === "string" ? j.vault : null, change: j.change as AccessChange };
  return { type: "unknown", event: e.event, data: e.data };
}

export type StreamStatus = "connecting" | "open" | "waiting" | "closed";

export interface EventStreamOptions {
  onEvent: (event: SyncEvent) => void;
  onStatus?: (status: StreamStatus, detail?: { error?: unknown; retryInMs?: number }) => void;
  initialRetryMs?: number;
  maxRetryMs?: number;
}

export class EventStream {
  private abort: AbortController | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;
  private retryMs: number;
  private forceRefresh = false;
  private runId = 0;

  constructor(
    private readonly client: SyncClient,
    private readonly opts: EventStreamOptions,
  ) {
    this.retryMs = opts.initialRetryMs ?? 1000;
  }

  start(): this {
    this.closed = false;
    this.connect();
    return this;
  }

  /** Drops the current connection and connects again now (e.g. after an `access` event and a token refresh). */
  reconnect(): void {
    if (this.closed) return;
    this.abort?.abort();
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.retryMs = this.opts.initialRetryMs ?? 1000;
    this.connect();
  }

  close(): void {
    this.closed = true;
    this.abort?.abort();
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.opts.onStatus?.("closed");
  }

  private schedule(delay: number, error?: unknown) {
    if (this.closed) return;
    this.opts.onStatus?.("waiting", { error, retryInMs: delay });
    this.timer = setTimeout(() => {
      this.timer = null;
      this.connect();
    }, delay);
  }

  private backoff(error: unknown) {
    const delay = this.retryMs;
    this.retryMs = Math.min(this.retryMs * 2, this.opts.maxRetryMs ?? 60_000);
    this.schedule(delay, error);
  }

  private connect(): void {
    if (this.closed) return;
    const run = ++this.runId;
    const abort = new AbortController();
    this.abort = abort;
    this.opts.onStatus?.("connecting");
    void (async () => {
      const parser = new SseParser();
      try {
        const token = await this.client.token(this.forceRefresh);
        this.forceRefresh = false;
        const res = await send(this.client.opts, this.client.url("events"), {
          // Only CORS-allowed headers (sync-openapi.yaml); no-store stands in for Cache-Control
          headers: { Accept: "text/event-stream" },
          cache: "no-store",
          token,
          signal: abort.signal,
        });
        if (res.status === 401) {
          await res.body?.cancel();
          this.forceRefresh = true;
          throw new OpenVireoError("unauthorized", "event stream rejected the token", 401);
        }
        if (!res.ok || !res.body) {
          const err = await errorFromResponse(res);
          if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
            this.opts.onStatus?.("closed", { error: err });
            this.closed = true;
            return;
          }
          throw err;
        }
        this.opts.onStatus?.("open");
        this.retryMs = this.opts.initialRetryMs ?? 1000;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          for (const raw of parser.feed(decoder.decode(value, { stream: true }))) {
            const ev = toSyncEvent(raw);
            if (ev && run === this.runId && !this.closed) this.opts.onEvent(ev);
          }
        }
        // Clean end (e.g. the JWT expired): reconnect right away with a fresh token
        if (run === this.runId) this.schedule(parser.retry ?? 0);
      } catch (e) {
        if (run !== this.runId || this.closed) return;
        if ((e as { name?: string })?.name === "AbortError" || (e as OpenVireoError)?.code === "aborted") return;
        if (parser.retry !== undefined) this.retryMs = Math.max(this.retryMs, parser.retry);
        this.backoff(e);
      }
    })();
  }
}

/** Opens `{sync}/events` and calls `onEvent` for each event until `close()`. */
export function subscribeEvents(client: SyncClient, opts: EventStreamOptions): EventStream {
  return new EventStream(client, opts).start();
}

/**
 * The shared Rust core (`@openvireo/core-wasm`, openvireo-core compiled to WebAssembly). The SDK's
 * primitives, Argon2id, TOTP and share-link opening run on it, so every OpenVireo client computes them
 * with the same code.
 *
 * The module is loaded once, when this file is first imported (top-level await), so the SDK's
 * synchronous functions (`sha256`, `hkdf`, the AEAD) can call it directly. The core's `OvError`
 * becomes the SDK's `OpenVireoError` with the same code at the edge (`fromCore`).
 *
 * @internal
 */
import { loadCore, OvError, type Core, type HttpTransport, type LogSink, type OvClient } from "@openvireo/core-wasm";
import { fetchTransport, memoryCache, memoryStore, systemClock } from "@openvireo/core-wasm/host";
import { OpenVireoError } from "./errors.js";
import type { FetchLike, HttpOptions } from "./http/request.js";

/** The loaded core. */
export const core: Core = await loadCore();

/** Converts the core's `OvError` into an `OpenVireoError` with the same code, status and details. */
export function fromCore(e: unknown): unknown {
  if (!(e instanceof OvError)) return e;
  const details = typeof e.details === "object" && e.details !== null ? e.details : undefined;
  return new OpenVireoError(e.code, e.message, e.status, { cause: e, ...(details ? { details } : {}) });
}

/** Runs a synchronous core call, rethrowing its errors as `OpenVireoError`. */
export function call<T>(fn: (core: Core) => T): T {
  try {
    return fn(core);
  } catch (e) {
    throw fromCore(e);
  }
}

export type { SharePayload as CoreSharePayload } from "@openvireo/core-wasm";

/** The core's HTTP transport over the SDK's `HttpOptions` (its `fetch` and extra headers). */
function transport(http: HttpOptions): HttpTransport {
  const f = http.fetch ?? (globalThis.fetch as FetchLike | undefined)?.bind(globalThis);
  return fetchTransport({
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (!f) throw new OpenVireoError("network_error", "no fetch implementation available");
      const headers = http.headers ? { ...http.headers, ...Object.fromEntries(new Headers(init?.headers).entries()) } : init?.headers;
      return f(String(input), { ...init, headers });
    }) as typeof fetch,
  });
}

const noLog: LogSink = { log() {} };

/**
 * A core client for calls that need no account (share links): memory-only store and cache, so nothing
 * persists. One per call, so each uses the `HttpOptions` it was given.
 */
export function coreClient(http: HttpOptions): OvClient {
  return new core.OvClient(
    { device: { name: "OpenVireo SDK", platform: "web" }, offline: false },
    { http: transport(http), store: memoryStore(), cache: memoryCache(), clock: systemClock, log: noLog },
  );
}

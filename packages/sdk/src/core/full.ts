/**
 * The shared Rust core's full module (`@openvireo/core-wasm/sync`): the facade handles (`OvClient`,
 * `Account`, `Vault`, `Kdbx`, …) and every low-level export. Loaded synchronously on first use (no
 * top-level await); in a browser, `await ready()` once at startup so the module compiles off the main
 * thread's critical path.
 *
 * @internal
 */
import { loadCoreSync, type Core } from "@openvireo/core-wasm/sync";
import { loadCore, type HttpTransport, type LogSink, type OvClient } from "@openvireo/core-wasm";
import { fetchTransport, memoryCache, memoryStore, systemClock } from "@openvireo/core-wasm/host";
import { OpenVireoError } from "../errors.js";
import type { FetchLike, HttpOptions } from "../http/request.js";
import { fromCore } from "./lite.js";

export { fromCore };

/** The full module, instantiated on first use. */
export const core = (): Core => loadCoreSync();

/** Compiles and instantiates the full module asynchronously (shares the instance with `core()`). */
export async function ready(): Promise<void> {
  await loadCore();
}

/** Runs a synchronous core call, rethrowing its errors as `OpenVireoError`. */
export function call<T>(fn: (core: Core) => T): T {
  try {
    return fn(core());
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
  return new (core().OvClient)(
    { device: { name: "OpenVireo SDK", platform: "web" }, offline: false },
    { http: transport(http), store: memoryStore(), cache: memoryCache(), clock: systemClock, log: noLog },
  );
}

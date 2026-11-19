/**
 * The core's Host (rust-core-tasks.md §2.2) built from the SDK's options: HTTP over the app's `fetch`
 * (and extra headers), the secure store and the offline cache over the app's `KeyValueStorage`.
 *
 * @internal
 */
import type { BlobCache, CachedVault, Host, HttpTransport, LogSink, SecureStore } from "@openvireo/core-wasm";
import { fetchTransport, memoryCache, systemClock } from "@openvireo/core-wasm/host";
import { OpenVireoError } from "../errors.js";
import type { KeyValueStorage } from "../auth/storage.js";
import type { FetchLike, HttpOptions } from "../http/request.js";
import { b64u, fromB64u, utf8 } from "../util/bytes.js";

/** The core's HTTP transport over the SDK's `HttpOptions` (its `fetch` and extra headers). */
export function transport(http: HttpOptions): HttpTransport {
  const f = http.fetch ?? (globalThis.fetch as FetchLike | undefined)?.bind(globalThis);
  return fetchTransport({
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (!f) throw new OpenVireoError("network_error", "no fetch implementation available");
      const headers = http.headers ? { ...http.headers, ...Object.fromEntries(new Headers(init?.headers).entries()) } : init?.headers;
      return f(String(input), { ...init, headers });
    }) as typeof fetch,
  });
}

const B64 = "b64:";
const strict = new TextDecoder("utf-8", { fatal: true });

/** A value as a storage string: its text when it's UTF-8 (sessions, Secret Keys), else `b64:` + base64url. */
function encodeValue(value: Uint8Array): string {
  try {
    const text = strict.decode(value);
    if (!text.startsWith(B64)) return text;
  } catch {
    /* binary */
  }
  return B64 + b64u(value);
}
const decodeValue = (v: string): Uint8Array => (v.startsWith(B64) ? fromB64u(v.slice(B64.length)) : utf8(v));

/**
 * The core's secure store over the app's storage, under the core's key names (`ov:session`,
 * `secret_key:<server>:<email>`, `device:…`, `ov:parked_session:…`), which are the names the TypeScript
 * SDK used, with text values kept as text: sessions and trusted-device Secret Keys from 0.x carry over.
 */
export function storageStore(storage: KeyValueStorage): SecureStore {
  return {
    async get(key) {
      const v = await storage.get(key);
      return v === null ? undefined : decodeValue(v);
    },
    async set(key, value) {
      await storage.set(key, encodeValue(value));
    },
    async delete(key) {
      await storage.delete(key);
    },
  };
}

/**
 * The offline cache (SPEC §20) as JSON (base64url fields) under `core-cache:<user>:` in the app's storage,
 * with an index per user (`KeyValueStorage` can't list keys). Everything in it is ciphertext or public.
 */
export function storageCache(storage: KeyValueStorage): BlobCache {
  // per-vault state under the 0.x key; a 0.x value (another format) reads as absent
  const vk = (u: string, v: string) => `sync:${u}:${v}`;
  const mk = (u: string, n: string) => `core-cache:${u}:meta:${n}`;
  const ik = (u: string) => `core-cache:${u}:index`;
  const enc = (b?: Uint8Array) => (b ? b64u(b) : undefined);
  const index = async (u: string): Promise<{ vaults: string[]; meta: string[] }> => {
    const raw = await storage.get(ik(u));
    return raw ? (JSON.parse(raw) as { vaults: string[]; meta: string[] }) : { vaults: [], meta: [] };
  };
  const addTo = async (u: string, kind: "vaults" | "meta", id: string) => {
    const i = await index(u);
    if (!i[kind].includes(id)) {
      i[kind].push(id);
      await storage.set(ik(u), JSON.stringify(i));
    }
  };
  return {
    async load(u, v) {
      const raw = await storage.get(vk(u, v));
      if (raw === null) return undefined;
      let j: Record<string, string | undefined>;
      try {
        j = JSON.parse(raw) as Record<string, string | undefined>;
      } catch {
        return undefined;
      }
      if (j.format !== "core1" || typeof j.state !== "string") return undefined;
      const out: CachedVault = { state: fromB64u(j.state!) };
      for (const f of ["base", "pending", "autofill"] as const) {
        const x = j[f];
        if (x !== undefined) out[f] = fromB64u(x);
      }
      return out;
    },
    async save(u, v, c) {
      await storage.set(vk(u, v), JSON.stringify({ format: "core1", state: enc(c.state), base: enc(c.base), pending: enc(c.pending), autofill: enc(c.autofill) }));
      await addTo(u, "vaults", v);
    },
    async remove(u, v) {
      await storage.delete(vk(u, v));
      const i = await index(u);
      i.vaults = i.vaults.filter((x) => x !== v);
      await storage.set(ik(u), JSON.stringify(i));
    },
    async list(u) {
      return (await index(u)).vaults;
    },
    async loadMeta(u, n) {
      const raw = await storage.get(mk(u, n));
      return raw === null ? undefined : fromB64u(raw);
    },
    async saveMeta(u, n, value) {
      await storage.set(mk(u, n), b64u(value));
      await addTo(u, "meta", n);
    },
    async clearUser(u) {
      const i = await index(u);
      for (const v of i.vaults) await storage.delete(vk(u, v));
      for (const n of i.meta) await storage.delete(mk(u, n));
      await storage.delete(ik(u));
    },
  };
}

const noLog: LogSink = { log() {} };

export interface HostOptions extends HttpOptions {
  storage?: KeyValueStorage;
  /** keep an offline cache in `storage` (else in memory) */
  offline?: boolean;
  log?: LogSink;
}

export function makeHost(opts: HostOptions, store: SecureStore): Host {
  return {
    http: transport(opts),
    store,
    cache: opts.offline && opts.storage ? storageCache(opts.storage) : memoryCache(),
    clock: systemClock,
    log: opts.log ?? noLog,
  };
}

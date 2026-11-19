/**
 * Wraps a core handle (`Account`, `Vault`, `Kdbx`, …) so that every error it throws or rejects with is
 * an `OpenVireoError` (same code), and handles it returns are wrapped too. Everything else is the core's.
 *
 * @internal
 */
import { fromCore } from "./lite.js";

const GUARDED = Symbol("ov.guarded");
const cache = new WeakMap<object, object>();

const isHandle = (v: unknown): v is object => typeof v === "object" && v !== null && typeof (v as { free?: unknown }).free === "function";

function wrapResult(v: unknown): unknown {
  if (v instanceof Promise) return v.then(wrapResult, (e) => Promise.reject(fromCore(e)));
  if (isHandle(v)) return guard(v);
  if (Array.isArray(v) && v.length > 0 && isHandle(v[0])) return v.map(wrapResult);
  if (typeof v === "object" && v !== null && !ArrayBuffer.isView(v)) {
    // records that carry a handle, e.g. { db: Kdbx, keyVersion }
    for (const [k, x] of Object.entries(v)) if (isHandle(x)) (v as Record<string, unknown>)[k] = guard(x);
  }
  return v;
}

/** The handle behind a guarded one (core methods take either). */
export const unguard = <T>(h: T): T => ((h as { [GUARDED]?: T })?.[GUARDED] ?? h);

export function guard<T extends object>(handle: T): T {
  if ((handle as { [GUARDED]?: unknown })[GUARDED]) return handle;
  const hit = cache.get(handle);
  if (hit) return hit as T;
  const proxy = new Proxy(handle, {
    get(target, prop) {
      if (prop === GUARDED) return target;
      const v = Reflect.get(target, prop, target);
      if (typeof v !== "function" || prop === "constructor") return v;
      return (...args: unknown[]) => {
        try {
          return wrapResult(v.apply(target, args.map(unguard)));
        } catch (e) {
          throw fromCore(e);
        }
      };
    },
  });
  cache.set(handle, proxy);
  return proxy;
}

/** Calls a static core function (a constructor or `Vault.openLocal`) with the same error mapping. */
export function guarded<T>(fn: () => T): T {
  try {
    return wrapResult(fn()) as T;
  } catch (e) {
    throw fromCore(e);
  }
}

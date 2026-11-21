/**
 * The shared Rust core's full module (`@openvireo/core-wasm/sync`): the facade handles (`OvClient`,
 * `Account`, `Vault`, `Kdbx`, …) and every low-level export. Loaded synchronously on first use (no
 * top-level await); in a browser, `await ready()` once at startup so the module compiles off the main
 * thread's critical path.
 *
 * @internal
 */
import { loadCoreSync, type Core } from "@openvireo/core-wasm/sync";
import { loadCore } from "@openvireo/core-wasm";
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


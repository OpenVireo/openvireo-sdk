/**
 * The shared Rust core's lite module (`@openvireo/core-wasm/lite-sync`): primitives, share links and
 * TOTP, about 190 KB gzip. Everything a public share page needs, without the full core.
 *
 * Loaded synchronously on first use (no top-level await). The core's `OvError` becomes the SDK's
 * `OpenVireoError` with the same code at the edge (`fromCore`).
 *
 * @internal
 */
import { loadLiteSync, OvError, type LiteCore } from "@openvireo/core-wasm/lite-sync";
import { OpenVireoError } from "../errors.js";

/** The lite module, instantiated on first use. */
export const lite = (): LiteCore => loadLiteSync();

/** Converts the core's `OvError` into an `OpenVireoError` with the same code, status and details. */
export function fromCore(e: unknown): unknown {
  if (!(e instanceof OvError)) return e;
  const details = typeof e.details === "object" && e.details !== null ? e.details : undefined;
  const opts: { cause: unknown; details?: Record<string, unknown> } = { cause: e };
  if (details) opts.details = details;
  return new OpenVireoError(e.code, e.message, e.status, opts);
}

/** Runs a synchronous lite call, rethrowing its errors as `OpenVireoError`. */
export function callLite<T>(fn: (lite: LiteCore) => T): T {
  try {
    return fn(lite());
  } catch (e) {
    throw fromCore(e);
  }
}

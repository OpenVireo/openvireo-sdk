/**
 * The shared Rust core (`@openvireo/core-wasm`, openvireo-core compiled to WebAssembly). The SDK's
 * primitives, Argon2id and TOTP run on it, so every OpenVireo client computes them with the same code.
 *
 * The module is loaded once, when this file is first imported (top-level await), so the SDK's
 * synchronous functions (`sha256`, `hkdf`, the AEAD) can call it directly. The core's `OvError`
 * becomes the SDK's `OpenVireoError` with the same code at the edge (`fromCore`).
 *
 * @internal
 */
import { loadCore, OvError, type Core } from "@openvireo/core-wasm";
import { OpenVireoError } from "./errors.js";

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

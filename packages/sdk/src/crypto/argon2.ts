import { callLite } from "../core/lite.js";
import { getArgon2Override, setArgon2Override } from "./argon2-hook.js";

/**
 * Argon2 for the AUK (SPEC §3), share passcodes and KDBX files. The default implementation is the shared
 * Rust core's (`coreArgon2`: Argon2d, Argon2i and Argon2id, any output length). It can be replaced, e.g.
 * with a native binding in Node.
 */
export type Argon2Type = "argon2d" | "argon2i" | "argon2id";

export interface Argon2Params {
  type: Argon2Type;
  password: Uint8Array;
  salt: Uint8Array;
  /** memory in KiB */
  m: number;
  t: number;
  p: number;
  dkLen: number;
}

export type Argon2Impl = (params: Argon2Params) => Promise<Uint8Array>;

/** The core's Argon2 (all three types, any `dkLen`). */
export const coreArgon2: Argon2Impl = async (params) => callLite((c) => c.argon2(params));

/** Replaces the Argon2 the SDK uses (`null` restores `coreArgon2`). */
export function setArgon2Impl(fn: Argon2Impl | null): void {
  setArgon2Override(fn);
}

export function argon2(params: Argon2Params): Promise<Uint8Array> {
  return (getArgon2Override() ?? coreArgon2)(params);
}

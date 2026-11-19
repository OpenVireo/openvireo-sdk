import { core, fromCore } from "../core/full.js";

/**
 * Argon2 for the AUK (SPEC §3) and for kdbxweb. The default implementation runs Argon2id with a
 * 32-byte output (the AUK, share passcodes and account vaults) on the shared Rust core
 * (`@openvireo/core-wasm`), and Argon2d/Argon2i or other lengths (KDBX files made by other apps) on
 * hash-wasm. It can be replaced, e.g. with a native binding in Node or with @noble/hashes/argon2 where
 * WASM is not allowed.
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

const defaultArgon2: Argon2Impl = async ({ type, password, salt, m, t, p, dkLen }) => {
  if (type === "argon2id" && dkLen === 32) {
    try {
      return core().argon2id(password, salt, m, t, p);
    } catch (e) {
      throw fromCore(e);
    }
  }
  // The core's binding has Argon2id with a 32-byte output only.
  const hw = await import("hash-wasm");
  const fn = type === "argon2id" ? hw.argon2id : type === "argon2d" ? hw.argon2d : hw.argon2i;
  return fn({
    password,
    salt,
    iterations: t,
    parallelism: p,
    memorySize: m,
    hashLength: dkLen,
    outputType: "binary",
  });
};

let impl: Argon2Impl = defaultArgon2;

export function setArgon2Impl(fn: Argon2Impl | null): void {
  impl = fn ?? defaultArgon2;
}

export function argon2(params: Argon2Params): Promise<Uint8Array> {
  return impl(params);
}

/** A pure-JS fallback built on @noble/hashes (no WASM). Slower; use it only where WASM is unavailable. */
export const nobleArgon2: Argon2Impl = async ({ type, password, salt, m, t, p, dkLen }) => {
  const noble = await import("@noble/hashes/argon2.js");
  const fn = type === "argon2id" ? noble.argon2idAsync : type === "argon2d" ? noble.argon2dAsync : noble.argon2iAsync;
  return (await fn(password, salt, { m, t, p, dkLen })).slice();
};

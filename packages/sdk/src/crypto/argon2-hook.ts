/** @internal The Argon2 an app set with `setArgon2Impl` (not part of the public API). */
import type { Argon2Impl } from "./argon2.js";

let impl: Argon2Impl | null = null;

export const getArgon2Override = (): Argon2Impl | null => impl;
export const setArgon2Override = (fn: Argon2Impl | null): void => {
  impl = fn;
};

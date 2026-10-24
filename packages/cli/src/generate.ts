/** Password generation for `openvireo rotate --generate` and `openvireo item create|edit --generate`. */
import { KpxError, randomBytes } from "@openvireo/sdk";

export const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  // no quotes, backslash, backtick or space: generated values are safer to paste into shells and .env files
  symbols: "!#$%&()*+,-./:;<=>?@[]^_{|}~",
} as const;

export type CharsetName = keyof typeof CHARSETS | "letters";

export interface GenerateOptions {
  length?: number;
  /** default letters, digits, symbols */
  charsets?: CharsetName[];
}

export function parseCharsets(spec: string): CharsetName[] {
  const names = spec.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  for (const n of names) if (n !== "letters" && !(n in CHARSETS)) throw new KpxError("invalid_request", `unknown charset "${n}" (use letters, lower, upper, digits, symbols)`);
  if (!names.length) throw new KpxError("invalid_request", "empty charset");
  return names as CharsetName[];
}

/** A uniformly random index below n (rejection sampling, no modulo bias). */
function randomBelow(n: number): number {
  const limit = Math.floor(0x1_0000_0000 / n) * n;
  for (;;) {
    const b = randomBytes(4);
    const v = ((b[0]! << 24) | (b[1]! << 16) | (b[2]! << 8) | b[3]!) >>> 0;
    if (v < limit) return v % n;
  }
}

/** A random password with at least one character from every chosen set. */
export function generatePassword(opts: GenerateOptions = {}): string {
  const length = opts.length ?? 32;
  const names = opts.charsets ?? ["letters", "digits", "symbols"];
  const sets = [...new Set(names.flatMap((n) => (n === "letters" ? ["lower", "upper"] : [n])))].map((n) => CHARSETS[n as keyof typeof CHARSETS]);
  if (!Number.isInteger(length) || length < Math.max(sets.length, 4) || length > 1024) {
    throw new KpxError("invalid_request", `length must be between ${Math.max(sets.length, 4)} and 1024`);
  }
  const alphabet = sets.join("");
  for (;;) {
    let out = "";
    for (let i = 0; i < length; i++) out += alphabet[randomBelow(alphabet.length)];
    if (sets.every((s) => [...out].some((c) => s.includes(c)))) return out;
  }
}

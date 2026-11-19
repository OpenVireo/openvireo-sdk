/**
 * RFC 6238 codes for `otpauth://totp/` URIs, so a share page can show the current one-time code. Parsing,
 * codes and KeePass TOTP fields run on the shared Rust core (ov-share).
 */
import { callLite as call } from "../core/lite.js";
import { fromUtf8, utf8 } from "../util/bytes.js";

export interface TotpParams {
  secret: Uint8Array;
  algorithm: "SHA1" | "SHA256" | "SHA512";
  digits: number;
  period: number;
  /** Steam Guard codes use their own 5-character alphabet */
  steam?: boolean;
}

/** RFC 4648 base32 (case-insensitive; spaces, `=` and `-` ignored); `invalid_totp` otherwise. */
export function base32Decode(text: string): Uint8Array {
  return call((c) => c.base32Decode(text));
}

/** Reads an `otpauth://totp/…?secret=…` URI. */
export function parseTotpUri(uri: string): TotpParams {
  const p = call((c) => c.parseTotpUri(utf8(uri)));
  const steam = p.encoder === "steam";
  return { secret: p.secret, algorithm: p.algorithm, digits: p.digits, period: p.period, steam };
}

/** The code at `now` (ms) and the seconds it has left. */
export function totpCode(params: TotpParams, now = Date.now()): { code: string; remaining: number } {
  const r = call((c) =>
    c.totpCode(
      { secret: params.secret, algorithm: params.algorithm, digits: params.digits, period: params.period, ...(params.steam ? { encoder: "steam" } : {}) },
      Math.floor(now),
    ),
  );
  return { code: fromUtf8(r.code), remaining: r.remaining };
}

/**
 * An otpauth URI for a KeePass entry's TOTP: its `otp` field when that is a URI (KeePassXC), or the
 * older `TOTP Seed` and `TOTP Settings` ("30;6", "30;S" for Steam) fields. Null without either.
 */
export function entryTotpUri(fields: Record<string, string>, label = "OpenVireo"): string | null {
  const records = Object.entries(fields).map(([name, value]) => ({ name, value: utf8(value), protected: false }));
  const uri = call((c) => c.entryTotpUri(records, label));
  return uri === undefined ? null : fromUtf8(uri);
}

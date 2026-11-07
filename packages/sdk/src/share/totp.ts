/** RFC 6238 codes for `otpauth://totp/` URIs, so a share page can show the current one-time code. */
import { hmac } from "@noble/hashes/hmac.js";
import { sha1 } from "@noble/hashes/legacy.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import { OpenVireoError } from "../errors.js";

export interface TotpParams {
  secret: Uint8Array;
  algorithm: "SHA1" | "SHA256" | "SHA512";
  digits: number;
  period: number;
  /** Steam Guard codes use their own 5-character alphabet */
  steam?: boolean;
}

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEAM = "23456789BCDFGHJKMNPQRTVWXY";

export function base32Decode(text: string): Uint8Array {
  const clean = text.toUpperCase().replace(/[\s=-]/g, "");
  const out: number[] = [];
  let bits = 0;
  let value = 0;
  for (const c of clean) {
    const i = BASE32.indexOf(c);
    if (i < 0) throw new OpenVireoError("invalid_totp", "the TOTP secret isn't base32");
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

/** Reads an `otpauth://totp/…?secret=…` URI. */
export function parseTotpUri(uri: string): TotpParams {
  let url: URL;
  try {
    url = new URL(uri.trim());
  } catch {
    throw new OpenVireoError("invalid_totp", "not an otpauth URI");
  }
  if (url.protocol !== "otpauth:" || url.host.toLowerCase() !== "totp") throw new OpenVireoError("invalid_totp", "not an otpauth://totp URI");
  const q = url.searchParams;
  const secret = base32Decode(q.get("secret") ?? "");
  if (secret.length === 0) throw new OpenVireoError("invalid_totp", "the TOTP secret is missing");
  const steam = (q.get("encoder") ?? "").toLowerCase() === "steam";
  const algorithm = (q.get("algorithm") ?? "SHA1").toUpperCase();
  if (algorithm !== "SHA1" && algorithm !== "SHA256" && algorithm !== "SHA512") throw new OpenVireoError("invalid_totp", `unsupported algorithm ${algorithm}`);
  const digits = steam ? 5 : Number(q.get("digits") ?? 6);
  const period = Number(q.get("period") ?? 30);
  if (!Number.isInteger(digits) || digits < 1 || digits > 10 || !Number.isInteger(period) || period < 1) {
    throw new OpenVireoError("invalid_totp", "bad digits or period");
  }
  return { secret, algorithm, digits, period, steam };
}

const HASH = { SHA1: sha1, SHA256: sha256, SHA512: sha512 } as const;

/** The code at `now` (ms) and the seconds it has left. */
export function totpCode(params: TotpParams, now = Date.now()): { code: string; remaining: number } {
  const seconds = Math.floor(now / 1000);
  const counter = Math.floor(seconds / params.period);
  const msg = new Uint8Array(8);
  new DataView(msg.buffer).setUint32(0, Math.floor(counter / 2 ** 32));
  new DataView(msg.buffer).setUint32(4, counter >>> 0);
  const mac = hmac(HASH[params.algorithm], params.secret, msg);
  const offset = mac[mac.length - 1]! & 0x0f;
  let bin = ((mac[offset]! & 0x7f) << 24) | (mac[offset + 1]! << 16) | (mac[offset + 2]! << 8) | mac[offset + 3]!;
  let code = "";
  if (params.steam) {
    for (let i = 0; i < params.digits; i++) {
      code += STEAM[bin % STEAM.length];
      bin = Math.floor(bin / STEAM.length);
    }
  } else {
    code = String(bin % 10 ** params.digits).padStart(params.digits, "0");
  }
  return { code, remaining: params.period - (seconds % params.period) };
}

/**
 * An otpauth URI for a KeePass entry's TOTP: its `otp` field when that is a URI (KeePassXC), or the
 * older `TOTP Seed` and `TOTP Settings` ("30;6", "30;S" for Steam) fields. Null without either.
 */
export function entryTotpUri(fields: Record<string, string>, label = "OpenVireo"): string | null {
  const otp = fields["otp"]?.trim();
  if (otp?.toLowerCase().startsWith("otpauth://")) return otp;
  const seed = (fields["TOTP Seed"] ?? (otp && !otp.includes("://") ? otp : ""))?.replace(/\s/g, "");
  if (!seed) return null;
  const [period = "30", digits = "6"] = (fields["TOTP Settings"] ?? "").split(";");
  const q = new URLSearchParams({ secret: seed, period });
  if (digits.toUpperCase() === "S") q.set("encoder", "steam");
  else q.set("digits", digits);
  return `otpauth://totp/${encodeURIComponent(label)}?${q}`;
}

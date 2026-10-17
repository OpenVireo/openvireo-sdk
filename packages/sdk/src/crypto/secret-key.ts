import { KpxError } from "../errors.js";
import { randomBytes } from "../util/bytes.js";

/** SPEC §2: the 128-bit Secret Key and its "K1-XXXXXX-XXXXX-XXXXX-XXXXX-XXXXX" display form. */
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const SECRET_KEY_BYTES = 16;

export function generateSecretKey(): Uint8Array {
  return randomBytes(SECRET_KEY_BYTES);
}

export function formatSecretKey(raw: Uint8Array): string {
  if (raw.length !== SECRET_KEY_BYTES) throw new KpxError("invalid_secret_key", "a Secret Key is 16 bytes");
  // 128 bits big-endian, padded with two zero bits to 130 = 26 * 5
  let acc = 0n;
  for (const b of raw) acc = (acc << 8n) | BigInt(b);
  acc <<= 2n;
  let s = "";
  for (let i = 25; i >= 0; i--) s += CROCKFORD[Number((acc >> BigInt(i * 5)) & 31n)];
  return `K1-${s.slice(0, 6)}-${s.slice(6, 11)}-${s.slice(11, 16)}-${s.slice(16, 21)}-${s.slice(21, 26)}`;
}

export function parseSecretKey(display: string): Uint8Array {
  const s = display
    .replace(/[\s-]/g, "")
    .toUpperCase()
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
  if (!s.startsWith("K1")) throw new KpxError("invalid_secret_key", "a Secret Key starts with K1");
  const body = s.slice(2);
  if (body.length !== 26) throw new KpxError("invalid_secret_key", "a Secret Key has 26 characters after K1");
  let acc = 0n;
  for (const c of body) {
    const v = CROCKFORD.indexOf(c);
    if (v < 0) throw new KpxError("invalid_secret_key", `invalid character "${c}" in Secret Key`);
    acc = (acc << 5n) | BigInt(v);
  }
  if ((acc & 3n) !== 0n) throw new KpxError("invalid_secret_key", "invalid Secret Key (padding bits are set)");
  acc >>= 2n;
  const out = new Uint8Array(SECRET_KEY_BYTES);
  for (let i = SECRET_KEY_BYTES - 1; i >= 0; i--) {
    out[i] = Number(acc & 0xffn);
    acc >>= 8n;
  }
  return out;
}

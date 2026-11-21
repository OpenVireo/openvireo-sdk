/** SPEC §2: the 128-bit Secret Key and its "K1-XXXXXX-XXXXX-XXXXX-XXXXX-XXXXX" display form (ov-crypto). */
import { call } from "../core/full.js";
import { fromUtf8 } from "../util/bytes.js";

export const SECRET_KEY_BYTES = 16;

export function generateSecretKey(): Uint8Array {
  return call((c) => c.generateSecretKey());
}

export function formatSecretKey(raw: Uint8Array): string {
  return fromUtf8(call((c) => c.formatSecretKey(raw)));
}

export function parseSecretKey(display: string): Uint8Array {
  return call((c) => c.parseSecretKey(display));
}

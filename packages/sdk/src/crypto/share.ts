/** SPEC §22: share links. The link key K is only ever in the link's fragment. */
import { OpenVireoError } from "../errors.js";
import { b64u, fromB64u, fromUtf8, utf8, wipe } from "../util/bytes.js";
import { stretchPassword, type KdfParams } from "./auk.js";
import { AAD, unwrap, wrap } from "./envelope.js";
import { hkdf, sha256 } from "./primitives.js";

export const SHARE_KEY_BYTES = 32;
export const SHARE_PAD = 512;
/** The largest `ct` the server takes. */
export const SHARE_MAX_CT_BYTES = 64 * 1024;

export type ShareFieldKind = "username" | "password" | "url" | "notes" | "totp" | "custom" | "text";

export interface ShareField {
  k: ShareFieldKind | (string & {});
  label: string;
  value: string;
  /** hidden until shown */
  protected?: boolean;
}

/** What a share link holds (SPEC §22). Pages render every value as plain text. */
export interface SharePayload {
  v: 1;
  kind: "entry" | "text";
  title?: string;
  /** chosen by the sender and shown as such */
  shared_by?: string;
  fields: ShareField[];
}

/** Which item a share came from, readable only by its owner. */
export interface ShareRef {
  vault: string | null;
  /** KDBX UUID, 32 lowercase hex characters */
  entry: string | null;
  title: string;
}

/** 0x80, then zero bytes up to the next multiple of 512. */
export function padShare(data: Uint8Array): Uint8Array {
  const out = new Uint8Array(Math.ceil((data.length + 1) / SHARE_PAD) * SHARE_PAD);
  out.set(data);
  out[data.length] = 0x80;
  return out;
}

export function unpadShare(padded: Uint8Array): Uint8Array {
  let end = padded.length;
  while (end > 0 && padded[end - 1] === 0) end--;
  if (end === 0 || padded[end - 1] !== 0x80) throw new OpenVireoError("decryption_failed", "bad share padding");
  return padded.subarray(0, end - 1);
}

/** P = Argon2id(NFKC(passcode), kdf), checked against the SPEC §3 minimum unless `allowWeak` (vectors). */
export const sharePasscodeKey = (passcode: string, kdf: KdfParams, opts: { allowWeak?: boolean } = {}): Promise<Uint8Array> =>
  stretchPassword(passcode, kdf, opts);

/** content = HKDF(ikm=K, salt=P or empty, info="ov-share-v1") */
export const shareContentKey = (key: Uint8Array, passcodeKey?: Uint8Array): Uint8Array =>
  hkdf(key, passcodeKey ?? new Uint8Array(0), "ov-share-v1", 32);

/** auth = HKDF(ikm=P, salt=empty, info="ov-share-auth-v1"); the server keeps its SHA-256. */
export const shareAuth = (passcodeKey: Uint8Array): Uint8Array => hkdf(passcodeKey, new Uint8Array(0), "ov-share-auth-v1", 32);

export const shareAuthHash = (auth: Uint8Array): Uint8Array => sha256(auth);

export function encryptSharePayload(key: Uint8Array, id: string, payload: SharePayload, passcodeKey?: Uint8Array, nonce?: Uint8Array): Uint8Array {
  const content = shareContentKey(key, passcodeKey);
  const padded = padShare(utf8(JSON.stringify(payload)));
  try {
    const ct = wrap(content, padded, AAD.share(id), nonce);
    if (ct.length > SHARE_MAX_CT_BYTES) throw new OpenVireoError("too_large", "this is too much to share in one link");
    return ct;
  } finally {
    wipe(content, padded);
  }
}

export function decryptSharePayload(key: Uint8Array, id: string, ct: Uint8Array, passcodeKey?: Uint8Array): SharePayload {
  const content = shareContentKey(key, passcodeKey);
  try {
    const payload = JSON.parse(fromUtf8(unpadShare(unwrap(content, ct, AAD.share(id))))) as SharePayload;
    if (payload?.v !== 1 || !Array.isArray(payload.fields)) throw new OpenVireoError("unsupported_version", "unsupported share payload");
    return payload;
  } finally {
    wipe(content);
  }
}

/** ref_key = HKDF(ikm=enc_sk, salt=empty, info="ov-share-ref-v1") */
export const shareRefKey = (encSk: Uint8Array): Uint8Array => hkdf(encSk, new Uint8Array(0), "ov-share-ref-v1", 32);

export function encryptShareRef(encSk: Uint8Array, id: string, ref: ShareRef, nonce?: Uint8Array): string {
  const k = shareRefKey(encSk);
  try {
    return b64u(wrap(k, utf8(JSON.stringify(ref)), AAD.shareRef(id), nonce));
  } finally {
    wipe(k);
  }
}

export function decryptShareRef(encSk: Uint8Array, id: string, ref: string): ShareRef {
  const k = shareRefKey(encSk);
  try {
    return JSON.parse(fromUtf8(unwrap(k, fromB64u(ref), AAD.shareRef(id)))) as ShareRef;
  } finally {
    wipe(k);
  }
}

/** `<base>/<id>#<K>` */
export const shareLink = (base: string, id: string, key: Uint8Array): string => `${base.replace(/\/+$/, "")}/${id}#${b64u(key)}`;

/** Splits a share link into its id and key; the base is everything before the id. */
export function parseShareLink(link: string): { base: string; id: string; key: Uint8Array } {
  const m = /^(.*)\/([A-Za-z0-9_-]{22})\/?#([A-Za-z0-9_-]{43})$/.exec(link.trim());
  if (!m) throw new OpenVireoError("invalid_link", "this isn't a complete share link");
  const key = fromB64u(m[3]!);
  if (key.length !== SHARE_KEY_BYTES) throw new OpenVireoError("invalid_link", "this isn't a complete share link");
  return { base: m[1]!, id: m[2]!, key };
}

/** The key from a page's `location.hash` (`#<K>`). */
export function shareKeyFromHash(hash: string): Uint8Array {
  const text = hash.replace(/^#/, "");
  if (!/^[A-Za-z0-9_-]{43}$/.test(text)) throw new OpenVireoError("invalid_link", "the link is incomplete");
  return fromB64u(text);
}

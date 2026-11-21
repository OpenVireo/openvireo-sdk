/**
 * SPEC §22: share links. The link key K is only ever in the link's fragment. Runs on the core's lite
 * module (ov-share), so a share page loads nothing else.
 */
import { callLite as call } from "../core/lite.js";
import { fromUtf8 } from "../util/bytes.js";
import { payloadFromCore, payloadToCore } from "./share-convert.js";
import type { KdfParams } from "./auk.js";

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
export const padShare = (data: Uint8Array): Uint8Array => call((c) => c.padShare(data));

export const unpadShare = (padded: Uint8Array): Uint8Array => call((c) => c.unpadShare(padded));

/** P = Argon2id(NFKC(passcode), kdf), checked against the SPEC §3 minimum unless `allowWeak` (vectors). */
export async function sharePasscodeKey(passcode: string, kdf: KdfParams, opts: { allowWeak?: boolean } = {}): Promise<Uint8Array> {
  return call((c) => c.sharePasscodeKey(passcode, kdf, !!opts.allowWeak));
}

/** content = HKDF(ikm=K, salt=P or empty, info="ov-share-v1") */
export const shareContentKey = (key: Uint8Array, passcodeKey?: Uint8Array): Uint8Array => call((c) => c.shareContentKey(key, passcodeKey));

/** auth = HKDF(ikm=P, salt=empty, info="ov-share-auth-v1"); the server keeps its SHA-256. */
export const shareAuth = (passcodeKey: Uint8Array): Uint8Array => call((c) => c.shareAuth(passcodeKey));

export const shareAuthHash = (auth: Uint8Array): Uint8Array => call((c) => c.shareAuthHash(auth));

export function encryptSharePayload(key: Uint8Array, id: string, payload: SharePayload, passcodeKey?: Uint8Array, nonce?: Uint8Array): Uint8Array {
  return call((c) => c.encryptSharePayload(key, id, payloadToCore(payload), passcodeKey, nonce));
}

export function decryptSharePayload(key: Uint8Array, id: string, ct: Uint8Array, passcodeKey?: Uint8Array): SharePayload {
  return payloadFromCore(call((c) => c.decryptSharePayload(key, id, ct, passcodeKey)));
}

/** ref_key = HKDF(ikm=enc_sk, salt=empty, info="ov-share-ref-v1") */
export const shareRefKey = (encSk: Uint8Array): Uint8Array => call((c) => c.shareRefKey(encSk));

export function encryptShareRef(encSk: Uint8Array, id: string, ref: ShareRef, nonce?: Uint8Array): string {
  const r: { vault?: string; entry?: string; title: string } = { title: ref.title };
  if (ref.vault !== null) r.vault = ref.vault;
  if (ref.entry !== null) r.entry = ref.entry;
  return call((c) => c.encryptShareRef(encSk, id, r, nonce));
}

export function decryptShareRef(encSk: Uint8Array, id: string, ref: string): ShareRef {
  const r = call((c) => c.decryptShareRef(encSk, id, ref));
  return { vault: r.vault ?? null, entry: r.entry ?? null, title: r.title };
}

/** `<base>/<id>#<K>` */
export const shareLink = (base: string, id: string, key: Uint8Array): string => fromUtf8(call((c) => c.shareLink(base, id, key)));

/** Splits a share link into its id and key; the base is everything before the id. */
export function parseShareLink(link: string): { base: string; id: string; key: Uint8Array } {
  const p = call((c) => c.parseShareLink(link));
  return { base: p.base, id: p.id, key: p.key };
}

/** The key from a page's `location.hash` (`#<K>`). */
export const shareKeyFromHash = (hash: string): Uint8Array => call((c) => c.shareKeyFromHash(hash));

/**
 * Share links (SPEC §22): opening one without an account, and turning an item into share fields. Small
 * on purpose, so a public share page loads no OPAQUE, KDBX or sync code.
 *
 * @module @openvireo/sdk/share
 */
import type { KdfParams } from "../crypto/auk.js";
import { checkKdfParams } from "../crypto/auk.js";
import {
  decryptSharePayload,
  parseShareLink,
  shareAuth,
  sharePasscodeKey,
  type ShareField,
  type SharePayload,
} from "../crypto/share.js";
import { OpenVireoError } from "../errors.js";
import { joinUrl, requireSecureUrl, sendJson, seg, type HttpOptions } from "../http/request.js";
import { b64u, fromB64u, wipe } from "../util/bytes.js";
import type { Item } from "../vault/items.js";
import { entryTotpUri } from "./totp.js";

export * from "../crypto/share.js";
export * from "./totp.js";

/** What the public page knows before opening a share. */
export interface ShareInfo {
  expiresAt: string;
  /** null: unlimited until it expires */
  opensLeft: number | null;
  /** set when the share needs a passcode */
  kdf: KdfParams | null;
}

export interface OpenedShare {
  payload: SharePayload;
  opensLeft: number | null;
}

/**
 * Whether a share can be opened, without opening it. A share that has ended, or never existed, fails
 * with `not_found` either way.
 */
export async function getShareInfo(api: string, id: string, http: HttpOptions = {}): Promise<ShareInfo> {
  requireSecureUrl(api, "api");
  const r = await sendJson<{ expires_at: string; opens_left: number | null; kdf: KdfParams | null }>(http, joinUrl(api, `public/shares/${seg(id)}`));
  return { expiresAt: r.expires_at, opensLeft: r.opens_left, kdf: r.kdf };
}

/**
 * Opens a share: counts one open on the server and decrypts. Throws `passcode_required` when the share
 * has a passcode and none was given, and the server's `invalid_passcode` (with `details.attemptsLeft`)
 * for a wrong one. `info` saves a request when the page already fetched it.
 */
export async function openShare(
  api: string,
  link: string | { id: string; key: Uint8Array },
  opts: { passcode?: string; info?: ShareInfo; http?: HttpOptions } = {},
): Promise<OpenedShare> {
  requireSecureUrl(api, "api");
  const { id, key } = typeof link === "string" ? parseShareLink(link) : link;
  const info = opts.info ?? (await getShareInfo(api, id, opts.http));
  let passcodeKey: Uint8Array | undefined;
  const body: { auth?: string } = {};
  if (info.kdf) {
    if (!opts.passcode) throw new OpenVireoError("passcode_required", "this link needs a passcode");
    checkKdfParams(info.kdf);
    passcodeKey = await sharePasscodeKey(opts.passcode, info.kdf);
    const auth = shareAuth(passcodeKey);
    body.auth = b64u(auth);
    wipe(auth);
  }
  try {
    const r = await sendJson<{ ct: string; opens_left: number | null }>(opts.http ?? {}, joinUrl(api, `public/shares/${seg(id)}/open`), {
      method: "POST",
      json: body,
    });
    return { payload: decryptSharePayload(key, id, fromB64u(r.ct), passcodeKey), opensLeft: r.opens_left };
  } finally {
    if (passcodeKey) wipe(passcodeKey);
  }
}

const STANDARD: Record<string, { k: ShareField["k"]; label: string }> = {
  UserName: { k: "username", label: "Username" },
  Password: { k: "password", label: "Password" },
  URL: { k: "url", label: "Website" },
  Notes: { k: "notes", label: "Notes" },
};
/** Fields an item shares by default; the rest are opt-in. */
export const DEFAULT_SHARE_FIELDS = ["UserName", "Password", "URL"] as const;
/** KeePass fields that hold TOTP settings, shared together as one `totp` field named "otp". */
const TOTP_FIELDS = ["otp", "TOTP Seed", "TOTP Settings"];

/**
 * The fields of an item a user can choose to share, in display order, with what's in them. `name` is
 * the KeePass field name; "otp" stands for the item's TOTP whichever way it is stored. Needs an item
 * read with `reveal` so protected values are present.
 */
export function shareableFields(item: Item): { name: string; field: ShareField }[] {
  const out: { name: string; field: ShareField }[] = [];
  for (const name of Object.keys(STANDARD)) {
    const value = item.fields[name];
    if (value) out.push({ name, field: { ...STANDARD[name]!, value, ...(item.protected.includes(name) || name === "Password" ? { protected: true } : {}) } });
  }
  const totp = entryTotpUri(item.fields, item.title || "OpenVireo");
  if (totp) out.push({ name: "otp", field: { k: "totp", label: "One-time code", value: totp, protected: true } });
  for (const [name, value] of Object.entries(item.fields)) {
    if (name === "Title" || STANDARD[name] || TOTP_FIELDS.includes(name) || !value) continue;
    out.push({ name, field: { k: "custom", label: name, value, ...(item.protected.includes(name) ? { protected: true } : {}) } });
  }
  return out;
}

/** A payload for the chosen fields of an item (names as in `shareableFields`). */
export function itemSharePayload(item: Item, names: readonly string[], sharedBy?: string): SharePayload {
  const chosen = new Set(names);
  const fields = shareableFields(item)
    .filter((f) => chosen.has(f.name))
    .map((f) => f.field);
  return { v: 1, kind: "entry", title: item.title, ...(sharedBy ? { shared_by: sharedBy } : {}), fields };
}

/** A payload for some text. */
export const textSharePayload = (text: string, title?: string, sharedBy?: string): SharePayload => ({
  v: 1,
  kind: "text",
  ...(title ? { title } : {}),
  ...(sharedBy ? { shared_by: sharedBy } : {}),
  fields: [{ k: "text", label: "Text", value: text }],
});

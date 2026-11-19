/**
 * Share links (SPEC §22): opening one without an account, and turning an item into share fields. Opening
 * and the item fields run on the shared Rust core (ov-share through `@openvireo/core-wasm`), so a public
 * share page loads the core's WebAssembly module but none of the SDK's OPAQUE, kdbxweb or sync code.
 *
 * @module @openvireo/sdk/share
 */
import type { KdfParams } from "../crypto/auk.js";
import { fromUtf8, utf8 } from "../util/bytes.js";
import type { ShareField, SharePayload } from "../crypto/share.js";
import { payloadFromCore } from "../crypto/share-convert.js";
import { callLite as call, fromCore, lite } from "../core/lite.js";
import { joinUrl, requireSecureUrl, sendJson, seg, type HttpOptions } from "../http/request.js";
import type { Item } from "../vault/items.js";

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
  const url = typeof link === "string" ? link : fromUtf8(call((c) => c.shareLink("https://share.invalid", link.id, link.key)));
  const id = call((c) => c.parseShareLink(url)).id;
  const info = opts.info ?? (await getShareInfo(api, id, opts.http));
  let open;
  try {
    open = new (lite().ShareOpen)(url, info.kdf ?? undefined, opts.passcode || undefined);
  } catch (e) {
    throw fromCore(e);
  }
  try {
    const body = JSON.parse(fromUtf8(open.requestBody())) as Record<string, unknown>;
    const r = await sendJson<{ ct: string; opens_left: number | null }>(opts.http ?? {}, joinUrl(api, `public/shares/${seg(id)}/open`), {
      method: "POST",
      json: body,
    });
    try {
      return { payload: payloadFromCore(open.decrypt(r.ct)), opensLeft: r.opens_left };
    } catch (e) {
      throw fromCore(e);
    }
  } finally {
    open.free();
  }
}

const field = (k: string, label: string, value: Uint8Array, prot: boolean): ShareField => ({ k, label, value: fromUtf8(value), ...(prot ? { protected: true } : {}) });

/** Fields an item shares by default; the rest are opt-in. */
export const DEFAULT_SHARE_FIELDS = ["UserName", "Password", "URL"] as const;

/** The item's fields as the core's field records, with Title set to the item's title. */
function fieldRecords(item: Item) {
  const fields = Object.entries(item.fields)
    .filter(([name]) => name !== "Title")
    .map(([name, value]) => ({ name, value: utf8(value), protected: item.protected.includes(name) }));
  fields.unshift({ name: "Title", value: utf8(item.title), protected: false });
  return fields;
}

/**
 * The fields of an item a user can choose to share, in display order, with what's in them. `name` is
 * the KeePass field name; "otp" stands for the item's TOTP whichever way it is stored. Needs an item
 * read with `reveal` so protected values are present.
 */
export function shareableFields(item: Item): { name: string; field: ShareField }[] {
  return call((c) => c.shareableFields(fieldRecords(item))).map((f) => ({ name: f.name, field: field(f.kind, f.label, f.value, f.protected) }));
}

/** A payload for the chosen fields of an item (names as in `shareableFields`). */
export function itemSharePayload(item: Item, names: readonly string[], sharedBy?: string): SharePayload {
  return payloadFromCore(call((c) => c.itemSharePayload(fieldRecords(item), [...names], sharedBy)));
}

/** A payload for some text. */
export const textSharePayload = (text: string, title?: string, sharedBy?: string): SharePayload =>
  payloadFromCore(call((c) => c.textSharePayload(utf8(text), title, sharedBy)));

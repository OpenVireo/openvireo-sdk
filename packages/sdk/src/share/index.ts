/**
 * Share links (SPEC §22): opening one without an account, and turning an item into share fields. Opening
 * and the item fields run on the shared Rust core (ov-share through `@openvireo/core-wasm`), so a public
 * share page loads the core's WebAssembly module but none of the SDK's OPAQUE, kdbxweb or sync code.
 *
 * @module @openvireo/sdk/share
 */
import type { KdfParams } from "../crypto/auk.js";
import { b64u, fromUtf8, utf8 } from "../util/bytes.js";
import { parseShareLink, type ShareField, type SharePayload } from "../crypto/share.js";
import { call, coreClient, fromCore, type CoreSharePayload } from "../core.js";
import { requireSecureUrl, type HttpOptions } from "../http/request.js";
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
  try {
    const r = await coreClient(http).shareInfo(api, id);
    return { expiresAt: r.expiresAt, opensLeft: r.opensLeft ?? null, kdf: (r.kdf as KdfParams | undefined) ?? null };
  } catch (e) {
    throw fromCore(e);
  }
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
  if (typeof link === "string") parseShareLink(link); // same errors as before for a malformed link
  const url = typeof link === "string" ? link : `https://share.invalid/${link.id}#${b64u(link.key)}`;
  const info = opts.info && { expiresAt: opts.info.expiresAt, ...(opts.info.opensLeft !== null ? { opensLeft: opts.info.opensLeft } : {}), ...(opts.info.kdf ? { kdf: opts.info.kdf } : {}) };
  try {
    const r = await coreClient(opts.http ?? {}).openShare(api, utf8(url), opts.passcode ? utf8(opts.passcode) : undefined, info);
    return { payload: payloadFromCore(r.payload), opensLeft: r.opensLeft ?? null };
  } catch (e) {
    throw fromCore(e);
  }
}

function payloadFromCore(p: CoreSharePayload): SharePayload {
  return {
    v: p.v as 1,
    kind: p.kind as SharePayload["kind"],
    ...(p.title !== undefined ? { title: p.title } : {}),
    ...(p.sharedBy !== undefined ? { shared_by: p.sharedBy } : {}),
    fields: p.fields.map((f) => field(f.k, f.label, f.value, f.protected)),
  };
}

const field = (k: string, label: string, value: Uint8Array, prot: boolean): ShareField => ({ k, label, value: fromUtf8(value), ...(prot ? { protected: true } : {}) });

/** Fields an item shares by default; the rest are opt-in. */
export const DEFAULT_SHARE_FIELDS = ["UserName", "Password", "URL"] as const;

/** The item as the core's entry record: only its fields matter here, with Title set to the item's title. */
function entryRecord(item: Item) {
  const fields = Object.entries(item.fields)
    .filter(([name]) => name !== "Title")
    .map(([name, value]) => ({ name, value: utf8(value), protected: item.protected.includes(name) }));
  fields.unshift({ name: "Title", value: utf8(item.title), protected: false });
  return {
    id: item.id,
    groupId: "",
    groupPath: item.group,
    fields,
    tags: item.tags,
    iconId: 0,
    foregroundColor: "",
    backgroundColor: "",
    overrideUrl: "",
    createdAt: 0,
    modifiedAt: 0,
    attachments: [],
    historyCount: 0,
    qualityCheck: true,
  };
}

/**
 * The fields of an item a user can choose to share, in display order, with what's in them. `name` is
 * the KeePass field name; "otp" stands for the item's TOTP whichever way it is stored. Needs an item
 * read with `reveal` so protected values are present.
 */
export function shareableFields(item: Item): { name: string; field: ShareField }[] {
  return call((c) => c.shareableFields(entryRecord(item))).map((f) => ({ name: f.name, field: field(f.kind, f.label, f.value, f.protected) }));
}

/** A payload for the chosen fields of an item (names as in `shareableFields`). */
export function itemSharePayload(item: Item, names: readonly string[], sharedBy?: string): SharePayload {
  return payloadFromCore(call((c) => c.itemSharePayload(entryRecord(item), [...names], sharedBy)));
}

/** A payload for some text. */
export const textSharePayload = (text: string, title?: string, sharedBy?: string): SharePayload =>
  payloadFromCore(call((c) => c.textSharePayload(utf8(text), title, sharedBy)));

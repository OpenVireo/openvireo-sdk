/** @internal Share payloads between the SDK's shape and the core's (not part of the public API). */
import type { SharePayload as CorePayload } from "@openvireo/core-wasm/lite";
import { fromUtf8, utf8 } from "../util/bytes.js";
import type { SharePayload } from "./share.js";

/** The SDK's payload (string values, `shared_by`) as the core's (UTF-8 values, `sharedBy`). */
export function payloadToCore(p: SharePayload): CorePayload {
  const out: CorePayload = { v: p.v, kind: p.kind, fields: p.fields.map((f) => ({ k: f.k, label: f.label, value: utf8(f.value), protected: !!f.protected })) };
  if (p.title !== undefined) out.title = p.title;
  if (p.shared_by !== undefined) out.sharedBy = p.shared_by;
  return out;
}

/** The core's payload as the SDK's. */
export function payloadFromCore(p: CorePayload): SharePayload {
  const out: SharePayload = {
    v: p.v as 1,
    kind: p.kind as SharePayload["kind"],
    fields: p.fields.map((f) => ({ k: f.k, label: f.label, value: fromUtf8(f.value), ...(f.protected ? { protected: true } : {}) })),
  };
  if (p.title !== undefined) out.title = p.title;
  if (p.sharedBy !== undefined) out.shared_by = p.sharedBy;
  return { v: out.v, kind: out.kind, ...(out.title !== undefined ? { title: out.title } : {}), ...(out.shared_by !== undefined ? { shared_by: out.shared_by } : {}), fields: out.fields };
}


/** Runs the Qt merge fixtures (C++ SyncEngine::mergeDatabases results) through the TS port. */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { mergeDatabases } from "../src/merge/index.js";
import { kdbxweb, type Kdbx } from "../src/vault/kdbx.js";
import { fieldText } from "../src/vault/entries.js";
import { b64u, fromB64u, fromHex, toHex } from "../src/util/bytes.js";
import { conflictingFields } from "../src/merge/fields.js";
import { findEntryByUuid } from "../src/merge/merger.js";

const dir = process.env.KPX_MERGE_FIXTURES ?? fileURLToPath(new URL("./fixtures/merge-fixtures/", import.meta.url));
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const ROOT = "6e3a9f40-1c2b-4d5e-8f70-9a1b2c3d4e5f";
const T0 = new Date("2026-01-01T00:00:00Z");
const STANDARD = ["Title", "UserName", "Password", "URL", "Notes"];

const uuidOf = (s: string) => new kdbxweb.KdbxUuid(fromHex(s.replace(/-/g, "")).buffer as ArrayBuffer);
const uuidStr = (u: kdbxweb.KdbxUuid) => {
  const h = toHex(new Uint8Array(u.toBytes()));
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
const iso = (d?: Date) => (d ? d.toISOString().replace(/\.\d{3}Z$/, "Z") : "");

async function build(spec: any): Promise<Kdbx> {
  const db = kdbxweb.Kdbx.create(new kdbxweb.Credentials(null, new Uint8Array(32)), "Root");
  db.meta.recycleBinEnabled = false;
  db.meta.recycleBinUuid = undefined;
  const root = db.getDefaultGroup();
  root.groups = [];
  root.uuid = uuidOf(ROOT);
  for (const k of ["creationTime", "lastModTime", "lastAccessTime", "locationChanged"] as const) root.times[k] = T0;
  for (const e of spec.entries) {
    const entry = db.createEntry(root);
    entry.uuid = uuidOf(e.uuid);
    for (const [k, v] of Object.entries<string>(e.attributes)) {
      const protect = k === "Password" || (e.protected ?? []).includes(k);
      entry.fields.set(k, protect ? kdbxweb.ProtectedValue.fromString(v) : v);
    }
    entry.tags = e.tags ? e.tags.split(/[,;]/).filter(Boolean) : [];
    for (const [name, data] of Object.entries<string>(e.attachments ?? {})) {
      entry.binaries.set(name, await db.createBinary(fromB64u(data).slice().buffer as ArrayBuffer));
    }
    entry.times.creationTime = T0;
    entry.times.locationChanged = T0;
    entry.times.lastModTime = new Date(e.modified);
    entry.times.lastAccessTime = new Date(e.modified);
  }
  for (const d of spec.deleted ?? []) db.addDeletedObject(uuidOf(d.uuid), new Date(d.time));
  return db;
}

function project(db: Kdbx) {
  const entries = [...db.getDefaultGroup().entries].map((e) => {
    const attributes: Record<string, string> = {};
    const prot: string[] = [];
    for (const [k, v] of e.fields) {
      const t = fieldText(v);
      if (STANDARD.includes(k) && t === "") continue;
      attributes[k] = t;
      if (!STANDARD.includes(k) && v instanceof kdbxweb.ProtectedValue) prot.push(k);
    }
    const attachments: Record<string, string> = {};
    for (const [k, b] of e.binaries) {
      const v = kdbxweb.KdbxBinaries.isKdbxBinaryWithHash(b) ? b.value : b;
      attachments[k] = b64u(v instanceof kdbxweb.ProtectedValue ? v.getBinary() : new Uint8Array(v as ArrayBuffer));
    }
    const sortKeys = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
    return {
      ...(Object.keys(attachments).length ? { attachments: sortKeys(attachments) } : {}),
      attributes: sortKeys(attributes),
      history_count: e.history.length,
      modified: iso(e.times.lastModTime),
      ...(prot.length ? { protected: prot.sort() } : {}),
      ...(e.tags.length ? { tags: [...e.tags].sort() } : {}),
      uuid: uuidStr(e.uuid),
    };
  });
  entries.sort((a, b) => a.uuid.localeCompare(b.uuid));
  return { deleted: db.deletedObjects.map((d) => uuidStr(d.uuid!)).sort(), entries };
}

const normalize = (r: any) => ({
  deleted: [...r.deleted].sort(),
  entries: r.entries.map((e: any) => ({ ...e, ...(e.attachments ? { attachments: Object.fromEntries(Object.entries<string>(e.attachments).map(([k, v]) => [k, b64u(fromB64u(v))])) } : {}) })).map((e: any) =>
    Object.fromEntries(
      Object.entries({ ...e, ...(e.tags ? { tags: e.tags.split(/[,;]/).filter(Boolean).sort() } : {}), ...(e.protected ? { protected: [...e.protected].sort() } : {}) })
        .map(([k, v]) => [k, k === "attributes" || k === "attachments" ? Object.fromEntries(Object.entries(v as object).sort(([a], [b]) => (a < b ? -1 : 1))) : v])
        .sort(([a], [b]) => (String(a) < String(b) ? -1 : 1)),
    ),
  ),
});

describe.skipIf(files.length === 0)(`Qt merge fixtures (${dir})`, () => {
  for (const f of files) {
    const fx = JSON.parse(readFileSync(dir + "/" + f, "utf8"));
    it(`${f}: ${fx.description}`, async () => {
      const local = await build(fx.local);
      const remote = await build(fx.remote);
      const base = fx.base ? await build(fx.base) : null;
      // conflicts are computed before merging, like SyncEngine does
      const conflicts: Record<string, string[]> = {};
      if (base) {
        for (const e of local.getDefaultGroup().entries) {
          const c = conflictingFields(e, findEntryByUuid(remote, e.uuid.id), findEntryByUuid(base, e.uuid.id));
          if (c.length) conflicts[uuidStr(e.uuid)] = c;
        }
      }
      expect(conflicts).toEqual(fx.expected.conflicts);
      await mergeDatabases(local, remote, base, { now: () => new Date(fx.now) });
      const want = normalize(fx.expected.result);
      const got = project(local);
      // like TestMergeFixtures.cpp: both sides' entries end up equal (deleted objects are local's)
      expect(project(remote).entries).toEqual(got.entries);
      expect(JSON.stringify(got, null, 1)).toBe(JSON.stringify(want, null, 1));
    });
  }
});

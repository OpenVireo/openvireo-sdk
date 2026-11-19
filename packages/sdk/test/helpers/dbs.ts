/**
 * Test vaults on the core's `Vault` handle, with a clock the test sets: `addEntry(…, time)` and
 * `edit(…, time)` happen at that time (Unix seconds), as the old kdbxweb helpers set entry times.
 */
import { loadCoreSync } from "@openvireo/core-wasm/sync";
import { memoryCache, memoryStore } from "@openvireo/core-wasm/host";
import type { EntryRecord, Vault } from "@openvireo/core-wasm";
import { guard } from "../../src/core/guard.js";
import { mergeDatabases } from "../../src/merge/index.js";
import { openKdbx, vaultCredentials } from "../../src/vault/kdbx.js";
import { fieldText } from "../../src/vault/entries.js";
import { fromUtf8, utf8 } from "../../src/util/bytes.js";

export const KEY = new Uint8Array(32).fill(7);
export const at = (s: number) => new Date(s * 1000);

let nowMs = 1000_000;
/** Sets the clock the test vaults edit with (seconds, or exact ms when not a whole number of seconds). */
export const setNow = (time: number) => void (nowMs = Math.round(time * 1000));
const client = guard(
  new (loadCoreSync().OvClient)({ device: { name: "test", platform: "cli" }, offline: true } as never, {
    http: { send: () => Promise.reject({ kind: "offline" }), openStream: () => Promise.reject({ kind: "offline" }) },
    store: memoryStore(),
    cache: memoryCache(),
    clock: { nowUnixMs: () => nowMs },
    log: { log() {} },
  } as never),
);

/** A new local vault keyed with KEY (Recycle Bin on). */
export const newVault = async (name = "Vault"): Promise<Vault> => client.createLocal(name, vaultCredentials(KEY));
/** A new local vault with any credentials, on the test clock. */
export const newLocal = async (name: string, credentials: { password?: Uint8Array; keyFile?: Uint8Array }): Promise<Vault> => client.createLocal(name, credentials);
/** Opens local bytes with any credentials, on the test clock. */
export const openLocal = async (bytes: Uint8Array, credentials: { password?: Uint8Array; keyFile?: Uint8Array }): Promise<Vault> => client.openLocal(bytes, credentials);
/** Opens vault bytes keyed with KEY on the test clock. */
export const openVault = async (bytes: Uint8Array): Promise<Vault> => client.openLocal(bytes, vaultCredentials(KEY));

/** A base vault built by `build`, plus local/remote/base copies opened from the same bytes. */
export async function threeCopies(build: (v: Vault) => void | Promise<void>) {
  const v = await newVault("Vault");
  await build(v);
  const bytes = await v.saveLocal();
  return { bytes, local: await openVault(bytes), remote: await openVault(bytes), base: await openVault(bytes) };
}

const fieldInputs = (title: string | null, fields: Record<string, string>) => [
  ...(title === null ? [] : [{ name: "Title", value: utf8(title) }]),
  ...Object.entries(fields).map(([k, v]) => ({ name: k, value: utf8(v), protected: k === "Password" })),
];

/** Adds an entry at `time` (seconds); returns its id. */
export function addEntry(v: Vault, title: string, fields: Record<string, string> = {}, time = 100, groupId = v.rootGroupId()): string {
  setNow(time);
  return v.addEntry(groupId, { fields: fieldInputs(title, fields), removeFields: [], expiry: { kind: "never" } });
}

export function byTitle(v: Vault, title: string): EntryRecord | undefined {
  return v.entryRecords(true).find((e) => fieldText(e, "Title") === title);
}

/** Edits like a client at `time`: history first, then fields and the modification time. */
export function edit(v: Vault, title: string, fields: Record<string, string>, time: number): EntryRecord {
  const e = byTitle(v, title)!;
  setNow(time);
  v.editEntry(e.id, { fields: fieldInputs(null, fields), removeFields: [], expiry: { kind: "keep" } });
  return v.entry(e.id);
}

export const get = (v: Vault, title: string, field: string) => {
  const e = byTitle(v, title);
  return e ? fieldText(e, field) : "";
};

/** Comparable content of a vault: groups, entries and fields (not history or times). */
export function content(v: Vault): string[] {
  const rb = v.groups().find((g) => g.isRecycleBin)?.id;
  return v
    .entryRecords(false)
    .filter((e) => e.groupId !== rb)
    .map((e) => {
      const f = e.fields.map((x) => `${x.name}=${fromUtf8(x.value)}`).sort().join(";");
      return `/${e.groupPath.join("/")}/${fieldText(e, "Title")} {${f}} bins=${e.attachments.map((a) => a.name).sort().join(",")}`.replace("//", "/");
    })
    .sort();
}

/** The sync merge of three vaults (through `Kdbx` handles); returns the report and both merged sides as vaults. */
export async function merge(local: Vault, remote: Vault, base: Vault | null, now = 10_000) {
  const lk = openKdbx(await local.saveLocal(), { vaultKey: KEY });
  const rk = openKdbx(await remote.saveLocal(), { vaultKey: KEY });
  const bk = base ? openKdbx(await base.saveLocal(), { vaultKey: KEY }) : null;
  const report = mergeDatabases(lk, rk, bk, { now: () => at(now) });
  return { report, local: await openVault(lk.write()), remote: await openVault(rk.write()) };
}

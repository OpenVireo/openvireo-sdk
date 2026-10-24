/**
 * Open, create and save .kdbx files with kdbxweb (2.1.1, same as keepassxc-web), with Argon2 from
 * crypto/argon2 (hash-wasm by default). Account vaults use the vault key as a raw 32-byte key file
 * component with no password (SPEC §7).
 */
import * as kdbxweb from "kdbxweb";
import { OpenVireoError } from "../errors.js";
import { argon2, type Argon2Type } from "../crypto/argon2.js";
import { exactBuffer } from "../util/bytes.js";

export { kdbxweb };
export type Kdbx = kdbxweb.Kdbx;
export type KdbxCredentials = kdbxweb.KdbxCredentials;

let installed = false;

/** Installs the SDK's Argon2 into kdbxweb. Called automatically by open/create; idempotent. */
export function initKdbx(): void {
  if (installed) return;
  installed = true;
  kdbxweb.CryptoEngine.setArgon2Impl(async (password, salt, memory, iterations, length, parallelism, type) => {
    const t: Argon2Type =
      type === kdbxweb.CryptoEngine.Argon2TypeArgon2id ? "argon2id" : type === kdbxweb.CryptoEngine.Argon2TypeArgon2d ? "argon2d" : "argon2i";
    const out = await argon2({
      type: t,
      password: new Uint8Array(password),
      salt: new Uint8Array(salt),
      m: memory,
      t: iterations,
      p: parallelism,
      dkLen: length,
    });
    return exactBuffer(out);
  });
}

/** Something that makes fresh credentials: kdbxweb wipes key material it is given, so never reuse one. */
export type CredentialsFactory = () => KdbxCredentials;

/** Account vault credentials: the 32-byte vault key as a raw key file component, no password. */
export function vaultCredentials(vaultKey: Uint8Array): CredentialsFactory {
  if (vaultKey.length !== 32) throw new OpenVireoError("no_vault_key", "a vault key is 32 bytes");
  // Copies (new Uint8Array, not .slice(), which is a view on Node Buffers): kdbxweb wipes what it gets
  const key = new Uint8Array(vaultKey);
  return () => new kdbxweb.Credentials(null, new Uint8Array(key));
}

/** Password (and optional key file) credentials, for local and self-hosted databases. */
export function passwordCredentials(password: string | null, keyFile?: Uint8Array): CredentialsFactory {
  return () => new kdbxweb.Credentials(password === null ? null : kdbxweb.ProtectedValue.fromString(password), keyFile ? new Uint8Array(keyFile) : undefined);
}

/** The vault KDF (SPEC §7): Argon2id, m = 1 MiB, t = 2, p = 1. */
export const VAULT_KDF = { m: 1024 * 1024, t: 2, p: 1 } as const;

export function applyVaultKdf(db: Kdbx): void {
  db.setKdf(kdbxweb.Consts.KdfId.Argon2id);
  const params = db.header.kdfParameters!;
  params.set("M", kdbxweb.VarDictionary.ValueType.UInt64, kdbxweb.Int64.from(VAULT_KDF.m));
  params.set("I", kdbxweb.VarDictionary.ValueType.UInt64, kdbxweb.Int64.from(VAULT_KDF.t));
  params.set("P", kdbxweb.VarDictionary.ValueType.UInt32, VAULT_KDF.p);
}

export function kdfSettings(db: Kdbx): { kdf: string; m?: number; t?: number; p?: number } {
  const p = db.header.kdfParameters;
  const uuid = p?.get("$UUID") as ArrayBuffer | undefined;
  const id = uuid ? kdbxweb.ByteUtils.bytesToBase64(uuid) : "";
  const kdf =
    id === kdbxweb.Consts.KdfId.Argon2id ? "argon2id" : id === kdbxweb.Consts.KdfId.Argon2d ? "argon2d" : id === kdbxweb.Consts.KdfId.Aes ? "aes" : id;
  const num = (k: string) => {
    const v = p?.get(k) as { valueOf(): number } | number | undefined;
    return v === undefined ? undefined : Number(v.valueOf());
  };
  return { kdf, m: num("M"), t: num("I"), p: num("P") };
}

const toArrayBuffer = (data: Uint8Array | ArrayBuffer): ArrayBuffer =>
  data instanceof ArrayBuffer ? data.slice(0) : exactBuffer(data);

function mapError(e: unknown): never {
  const code = (e as { code?: string })?.code;
  if (code === kdbxweb.Consts.ErrorCodes.InvalidKey) {
    throw new OpenVireoError("vault_key_mismatch", "wrong key for this database", undefined, { cause: e });
  }
  throw new OpenVireoError("kdbx_error", `could not read the database: ${(e as Error)?.message ?? e}`, undefined, { cause: e });
}

export async function openKdbx(data: Uint8Array | ArrayBuffer, credentials: CredentialsFactory | KdbxCredentials): Promise<Kdbx> {
  initKdbx();
  const creds = typeof credentials === "function" ? credentials() : credentials;
  try {
    return await kdbxweb.Kdbx.load(toArrayBuffer(data), creds);
  } catch (e) {
    mapError(e);
  }
}

export async function saveKdbx(db: Kdbx): Promise<Uint8Array> {
  initKdbx();
  return new Uint8Array(await db.save());
}

/** A new account vault: KDBX 4, vault KDF, root group named after the vault. */
export function createVaultKdbx(name: string, vaultKey: Uint8Array): Kdbx {
  initKdbx();
  const db = kdbxweb.Kdbx.create(vaultCredentials(vaultKey)(), name);
  applyVaultKdf(db);
  return db;
}

/**
 * Re-keys a database to a new vault key (rotation, "Move to account"); the next save uses it. A KDBX 3
 * database is upgraded to KDBX 4 first, since vaults are KDBX 4 files with an Argon2id KDF (SPEC §7).
 */
export function rekeyToVaultKey(db: Kdbx, vaultKey: Uint8Array): void {
  if (db.header.versionMajor < 4) db.upgrade();
  db.credentials = vaultCredentials(vaultKey)();
  applyVaultKdf(db);
}

/**
 * A separate copy of an open database, with its unsaved changes and the same key, so changes to the
 * copy (re-keying it, say) leave the original as it is. Costs one save and one load (two KDF runs).
 */
export async function copyKdbx(db: Kdbx): Promise<Kdbx> {
  initKdbx();
  const data = await db.save();
  try {
    return await kdbxweb.Kdbx.load(data, db.credentials);
  } catch (e) {
    mapError(e);
  }
}

/** KeePassXC's remote sync settings in the database's custom data (Qt `CustomData::RemoteProgramSettings`). */
export const REMOTE_SETTINGS_KEY = "KPXC_REMOTE_SYNC_SETTINGS";

/**
 * Drops the sync server and account vault remotes from KeePassXC's remote settings, keeping
 * command-based ones, as Qt does when it moves a database to an account. A copy moved into a vault
 * must not keep syncing to the self-hosted database it came from (it would upload a file under the
 * vault key over the password-protected one).
 */
export function dropServerRemotes(db: Kdbx): void {
  const raw = db.meta.customData.get(REMOTE_SETTINGS_KEY)?.value;
  if (raw === undefined) return;
  let kept: unknown[] = [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      kept = parsed.filter((r) => {
        const type = (r as { type?: unknown } | null)?.type;
        return type !== "syncServer" && type !== "accountVault";
      });
    }
  } catch {
    kept = []; // unreadable settings: drop them rather than risk keeping a server remote
  }
  if (kept.length) db.meta.customData.set(REMOTE_SETTINGS_KEY, { value: JSON.stringify(kept) });
  else db.meta.customData.delete(REMOTE_SETTINGS_KEY);
}

export interface KeyVersion {
  version: number;
  key: Uint8Array;
}

/**
 * Opens a vault with the newest key first, falling back to older ones (SPEC §7), so a crash between the
 * re-keyed upload and `activate` never locks anyone out. Returns which version worked.
 */
export async function openWithKeyVersions(data: Uint8Array | ArrayBuffer, keys: KeyVersion[]): Promise<{ db: Kdbx; keyVersion: number }> {
  if (keys.length === 0) throw new OpenVireoError("no_vault_key", "no vault key available");
  const sorted = [...keys].sort((a, b) => b.version - a.version);
  let last: unknown;
  for (const k of sorted) {
    try {
      return { db: await openKdbx(data, vaultCredentials(k.key)), keyVersion: k.version };
    } catch (e) {
      if ((e as OpenVireoError).code !== "vault_key_mismatch") throw e;
      last = e;
    }
  }
  throw last;
}

/** The sync generation kept in the database's custom data (KeePassXC `KPXC_SYNC_GENERATION`). */
export const SYNC_GENERATION_KEY = "KPXC_SYNC_GENERATION";
export function syncGeneration(db: Kdbx): number {
  const v = db.meta.customData.get(SYNC_GENERATION_KEY)?.value;
  const n = v ? Number.parseInt(v, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}
export function setSyncGeneration(db: Kdbx, generation: number): void {
  db.meta.customData.set(SYNC_GENERATION_KEY, { value: String(generation) });
}

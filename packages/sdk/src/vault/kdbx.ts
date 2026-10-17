/**
 * Open, create and save .kdbx files with kdbxweb (2.1.1, same as keepassxc-web), with Argon2 from
 * crypto/argon2 (hash-wasm by default). Account vaults use the vault key as a raw 32-byte key file
 * component with no password (SPEC §7).
 */
import * as kdbxweb from "kdbxweb";
import { KpxError } from "../errors.js";
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
  if (vaultKey.length !== 32) throw new KpxError("no_vault_key", "a vault key is 32 bytes");
  const key = vaultKey.slice();
  return () => new kdbxweb.Credentials(null, key.slice());
}

/** Password (and optional key file) credentials, for local and self-hosted databases. */
export function passwordCredentials(password: string | null, keyFile?: Uint8Array): CredentialsFactory {
  return () => new kdbxweb.Credentials(password === null ? null : kdbxweb.ProtectedValue.fromString(password), keyFile?.slice());
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
    throw new KpxError("vault_key_mismatch", "wrong key for this database", undefined, { cause: e });
  }
  throw new KpxError("kdbx_error", `could not read the database: ${(e as Error)?.message ?? e}`, undefined, { cause: e });
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

/** Re-keys a database to a new vault key (rotation, "Move to account"); the next save uses it. */
export function rekeyToVaultKey(db: Kdbx, vaultKey: Uint8Array): void {
  db.credentials = vaultCredentials(vaultKey)();
  applyVaultKdf(db);
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
  if (keys.length === 0) throw new KpxError("no_vault_key", "no vault key available");
  const sorted = [...keys].sort((a, b) => b.version - a.version);
  let last: unknown;
  for (const k of sorted) {
    try {
      return { db: await openKdbx(data, vaultCredentials(k.key)), keyVersion: k.version };
    } catch (e) {
      if ((e as KpxError).code !== "vault_key_mismatch") throw e;
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

/**
 * Vaults as the shared Rust core's handles. A `Vault` is one decrypted database you edit in place
 * (entries, groups, fields, history, attachments) and save or sync; `Kdbx` is the lower-level file handle
 * (read, write, rekey, merge, import) that `@openvireo/sdk/merge` works with. Account vaults use the vault
 * key as a raw 32-byte key file component with no password (SPEC §7).
 */
import type { Kdbx, KdbxCredentials, KdbxKdfSettings, KdbxKey, Vault } from "@openvireo/core-wasm";
import { call, core } from "../core/full.js";
import { guarded } from "../core/guard.js";
import { OpenVireoError } from "../errors.js";
import { utf8 } from "../util/bytes.js";

export type {
  AttachmentInfo,
  EntryExpiry,
  EntryInput,
  EntryRecord,
  EntrySummary,
  FieldInput,
  FieldRecord,
  GroupInfo,
  ImportPreview,
  ImportSummary,
  ImportTarget,
  Kdbx,
  KdbxCredentials,
  KdbxHeaderInfo,
  KdbxKdf,
  KdbxKdfSettings,
  KdbxKey,
  KdbxKeyVersion,
  LocalImportMode,
  SetFieldsResult,
  Vault,
} from "@openvireo/core-wasm";

/** Credentials for a password-protected (and optionally key-file) database. */
export function passwordCredentials(password: string | null, keyFile?: Uint8Array): KdbxCredentials {
  const c: KdbxCredentials = {};
  if (password !== null) c.password = utf8(password);
  if (keyFile) c.keyFile = new Uint8Array(keyFile);
  return c;
}

/** Account vault credentials: the 32-byte vault key as a raw key file component, no password. */
export function vaultCredentials(vaultKey: Uint8Array): KdbxCredentials {
  if (vaultKey.length !== 32) throw new OpenVireoError("no_vault_key", "a vault key is 32 bytes");
  return { keyFile: new Uint8Array(vaultKey) };
}

/**
 * SHA-256 of the password: the password component of a KDBX composite key. An app that has to keep a
 * database openable (e.g. across a page reload) can keep this instead of the password, and open, save and
 * sync the file with `passwordHashCredentials(hash)`.
 */
export async function passwordHash(password: string): Promise<Uint8Array> {
  return call((c) => c.kdbxPasswordHash(password));
}

/**
 * Credentials from a `passwordHash` (and optionally a key file), equivalent to `passwordCredentials(password,
 * keyFile)`: `openLocalVault`, `openKdbx`, `saveLocal` and `SelfHostedSync.syncDatabase` all take them.
 */
export function passwordHashCredentials(hash: Uint8Array, keyFile?: Uint8Array): KdbxCredentials {
  if (hash.length !== 32) throw new OpenVireoError("invalid_password_hash", "a password hash is 32 bytes");
  const c: KdbxCredentials = { passwordHash: new Uint8Array(hash) };
  if (keyFile) c.keyFile = new Uint8Array(keyFile);
  return c;
}

/**
 * Opens a local `.kdbx` file as an editable `Vault` (with a password, a password hash and/or a key file). A
 * wrong password or key file is `vault_key_mismatch`.
 */
export async function openLocalVault(data: Uint8Array | ArrayBuffer, credentials: KdbxCredentials): Promise<Vault> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return guarded(() => core().Vault.openLocal(bytes, credentials));
}

/** Creates a new local database (Argon2 KDF, a Recycle Bin) as an editable `Vault`. */
export async function createLocalVault(name: string, credentials: KdbxCredentials): Promise<Vault> {
  return guarded(() => core().Vault.createLocal(name, credentials));
}

/** Saves a local vault with its credentials and returns the `.kdbx` bytes. */
export async function saveLocalVault(vault: Vault): Promise<Uint8Array> {
  return vault.saveLocal();
}

/** The vault KDF (SPEC §7): Argon2id, m = 1 MiB, t = 2, p = 1. */
export const VAULT_KDF = { m: 1024 * 1024, t: 2, p: 1 } as const;

/** Meta custom data key of KeePassXC's remote sync settings (dropped from account vaults). */
export const REMOTE_SETTINGS_KEY = "KPXC_REMOTE_SYNC_SETTINGS";
/** Meta custom data key of the sync generation counter. */
export const SYNC_GENERATION_KEY = "KPXC_SYNC_GENERATION";

// ---- the lower-level file handle

/** Decrypts a `.kdbx` file into a `Kdbx` handle. */
export function openKdbx(data: Uint8Array | ArrayBuffer, key: KdbxKey | KdbxCredentials): Kdbx {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return guarded(() => core().Kdbx.read(bytes, key));
}

/** Encrypts a `Kdbx` handle back to bytes (with its key, or `key`). */
export const saveKdbx = (db: Kdbx, key?: KdbxKey): Uint8Array => db.write(key);

/** A new account vault database keyed with the vault key (SPEC §7). */
export function createVaultKdbx(name: string, vaultKey: Uint8Array): Kdbx {
  return guarded(() => core().Kdbx.createVault(name, vaultKey));
}

/** One vault key version, for files written while a rotation was under way. */
export interface KeyVersion {
  version: number;
  key: Uint8Array;
}

/** Opens a vault file with whichever of the given key versions fits (newest first). */
export function openWithKeyVersions(data: Uint8Array, keys: KeyVersion[]): { db: Kdbx; keyVersion: number } {
  return guarded(() => core().Kdbx.openWithKeyVersions(data, keys));
}

/** The KDF of a file, from its outer header (no key needed). */
export function kdfSettings(data: Uint8Array): KdbxKdfSettings {
  return guarded(() => core().Kdbx.peekHeader(data)).kdf;
}


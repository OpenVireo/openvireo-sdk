/** Types for openapi.yaml (ov v1). Field names are the wire names. */
import type { KdfParams } from "../crypto/auk.js";
import type { PublicKeysJson, WrappedKeysetJson } from "../crypto/keyset.js";
import type { VaultRole } from "../crypto/jwt.js";

export type { KdfParams, PublicKeysJson, WrappedKeysetJson, VaultRole };
/** "user:<uuid>" | "sa:<uuid>" */
export type Principal = string;
export type OrgRole = "owner" | "admin" | "member";
export type MemberStatus = "invited" | "accepted" | "confirmed";
export type Platform = "qt-linux" | "qt-macos" | "qt-windows" | "web" | "cli" | "connect" | "ios";

/** GET /.well-known/openvireo-configuration (SPEC §10) */
export interface OpenVireoConfiguration {
  issuer: string;
  api: string;
  sync: string;
  jwks_uri: string;
  opaque: { lib: string; version: string; context: string; ids: string };
  kdf_min?: { m: number; t: number };
  /** The web app: account settings and the auth website's sign-in (SPEC.md §16) */
  web?: string;
}

export interface DeviceInfo {
  id?: string;
  name: string;
  platform: Platform;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  device_id: string;
  user: { id: string; email: string };
  kdf: KdfParams;
  keyset: WrappedKeysetJson;
}

export interface MfaChallenge {
  mfa_required: true;
  mfa_token: string;
  methods?: "totp"[];
}

export const isMfaChallenge = (r: Session | MfaChallenge): r is MfaChallenge => (r as MfaChallenge).mfa_required === true;

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ServiceAccountExchange {
  access_token: string;
  expires_in: number;
  wrapped_master: string;
  keyset: WrappedKeysetJson;
}

export interface Me {
  id: string;
  email: string;
  name?: string | null;
  kdf: KdfParams;
  keyset: WrappedKeysetJson;
  mfa: { totp?: boolean };
  /** The user's personal plan (SPEC.md §19). */
  plan?: Plan;
  orgs?: { id: string; name: string; role: OrgRole; status: MemberStatus; plan?: Plan }[];
}

/**
 * A plan and its limits (SPEC.md §19). On a server without billing `id` and every limit are null; a
 * null limit is unlimited. Users have personal_vaults, share_recipients and vault_bytes; orgs have
 * members, org_vaults, service_accounts, audit_days and vault_bytes.
 */
export interface Plan {
  id: "free" | "premium" | "org_free" | "families" | "teams" | "business" | (string & {}) | null;
  limits: Record<string, number | null>;
}

export interface PublicPrincipal extends PublicKeysJson {
  principal: Principal;
  email?: string;
  name?: string;
}

export interface Device {
  id: string;
  name: string;
  platform: Platform;
  created_at: string;
  last_seen_at: string;
  current: boolean;
}

export interface Org {
  id: string;
  name: string;
  role: OrgRole;
  /** The org's plan (SPEC.md §19). */
  plan?: Plan;
  created_at: string;
}

export interface Member {
  user_id: string;
  email: string;
  name?: string | null;
  role: OrgRole;
  status: MemberStatus;
  public?: PublicKeysJson;
}

export interface Invitation {
  id: string;
  email: string;
  role: OrgRole;
  expires_at: string;
  invited_by: Principal;
}

export interface Grant {
  principal: Principal;
  role: VaultRole;
  key_version: number;
  sealed_key: string;
}

/** A Grant that names its vault, for routes that grant several vaults at once (member confirmation) */
export interface VaultGrant extends Grant {
  vault_id: string;
}

export interface SaMasterGrant {
  sa_id: string;
  principal: Principal;
  sealed_key: string;
}

export interface NewSaSecret {
  id: string;
  name?: string;
  secret_hash: string;
  prefix: string;
  wrapped_master: string;
  expires_at?: string | null;
}

export interface Vault {
  id: string;
  org_id?: string | null;
  owner_id?: string | null;
  encrypted_name: string;
  role: VaultRole;
  current_key_version: number;
  pending_key_version?: number | null;
  rotation_required?: boolean;
  /** the caller's sealed keys for the current and pending versions, newest first */
  keys: { key_version: number; sealed_key: string }[];
  created_at?: string;
}

export interface VaultAccess {
  principal: Principal;
  role: VaultRole;
  key_version: number;
  display?: string;
  granted_by?: Principal;
  granted_at?: string;
}

export interface ServiceAccount {
  id: string;
  org_id: string;
  name: string;
  public?: PublicKeysJson;
  keyset?: WrappedKeysetJson;
  master_key?: string;
  created_by?: Principal;
  created_at?: string;
  expires_at?: string | null;
  disabled?: boolean;
}

export interface SaSecretInfo {
  id: string;
  prefix: string;
  name?: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: Principal;
  action: string;
  target?: string;
  ip?: string;
  details?: Record<string, unknown>;
}

/** BlobMeta (sync server) */
export interface BlobMeta {
  id: string;
  etag: string;
  revision: number;
  size: number;
  updatedAt: string;
}

/** GET /auth/recover/{token}: what an approved reset will do (SPEC.md §18) */
export interface RecoveryResetJson {
  email: string;
  not_before: string;
  expires_at: string;
  archive_days?: number;
  archives: { personal_vaults?: number; shared_grants?: number; sole_admin_orgs?: string[] };
}

/** GET /me/recovery: whether a recovery archive from a reset exists (SPEC.md §18) */
export interface RecoveryArchiveJson {
  archived: boolean;
  email?: string;
  expires_at?: string;
  vaults?: number;
  locked?: boolean;
}

/** POST /me/recovery/restore/verify */
export interface RestoreVerified {
  session_id: string;
  kdf: KdfParams;
  /** the archived keyset, wrapped with the old AUK */
  keyset: WrappedKeysetJson;
  /** archived grants (principal = the caller) whose vault still exists at that key_version */
  grants: VaultGrant[];
}

/** REST client for every route of openapi.yaml (auth server, under `{api}`). */
import { KpxError } from "../errors.js";
import { type HttpOptions, joinUrl, seg, sendJson } from "../http/request.js";
import type { Jwks } from "../crypto/jwt.js";
import type {
  AuditEvent,
  Device,
  DeviceInfo,
  Grant,
  Invitation,
  KdfParams,
  KpxConfiguration,
  Me,
  Member,
  MfaChallenge,
  NewSaSecret,
  Org,
  OrgRole,
  Principal,
  PublicPrincipal,
  SaMasterGrant,
  SaSecretInfo,
  ServiceAccount,
  ServiceAccountExchange,
  Session,
  TokenPair,
  Vault,
  VaultAccess,
  VaultGrant,
  WrappedKeysetJson,
} from "./types.js";

export interface AccessTokenSource {
  getAccessToken(opts?: { force?: boolean }): Promise<string>;
}

export interface AuthClientOptions extends HttpOptions {
  /** `{api}`, e.g. https://accounts.keepassxc.org/api/v1 */
  api: string;
  /** bearer tokens for authenticated routes (a TokenManager, or a fixed token for service accounts) */
  tokens?: AccessTokenSource;
}

/** Fetches `/.well-known/kpx-configuration` from the issuer (SPEC §10). */
export async function discover(issuer: string, http: HttpOptions = {}): Promise<KpxConfiguration> {
  const base = issuer.replace(/\/+$/, "");
  const cfg = await sendJson<KpxConfiguration>(http, `${base}/.well-known/kpx-configuration`);
  for (const k of ["issuer", "api", "sync", "jwks_uri"] as const) {
    if (typeof cfg?.[k] !== "string") throw new KpxError("invalid_request", `kpx-configuration is missing "${k}"`);
  }
  if (!cfg.opaque?.ids) throw new KpxError("invalid_request", "kpx-configuration is missing opaque.ids");
  return cfg;
}

export async function fetchJwks(jwksUri: string, http: HttpOptions = {}): Promise<Jwks> {
  return sendJson<Jwks>(http, jwksUri);
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class AuthClient {
  readonly api: string;
  constructor(private readonly opts: AuthClientOptions) {
    this.api = opts.api.replace(/\/+$/, "");
  }

  /** Builds a client from discovery. */
  static async fromIssuer(issuer: string, opts: HttpOptions & { tokens?: AccessTokenSource } = {}) {
    const config = await discover(issuer, opts);
    return { config, client: new AuthClient({ ...opts, api: config.api }) };
  }

  withTokens(tokens: AccessTokenSource): AuthClient {
    return new AuthClient({ ...this.opts, tokens });
  }

  private url(path: string, query?: Record<string, string | number | undefined>): string {
    let u = joinUrl(this.api, path);
    const q = Object.entries(query ?? {}).filter(([, v]) => v !== undefined) as [string, string | number][];
    if (q.length) u += "?" + q.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
    return u;
  }

  /** Unauthenticated call */
  private pub<T>(method: Method, path: string, json?: unknown): Promise<T> {
    return sendJson<T>(this.opts, this.url(path), { method, json });
  }

  /** Authenticated call: retries once with a forced refresh on 401. */
  private async authed<T>(method: Method, path: string, json?: unknown, query?: Record<string, string | number | undefined>): Promise<T> {
    const tokens = this.opts.tokens;
    if (!tokens) throw new KpxError("signed_out", "this call needs an access token");
    const url = this.url(path, query);
    try {
      return await sendJson<T>(this.opts, url, { method, json, token: await tokens.getAccessToken() });
    } catch (e) {
      if ((e as KpxError).status !== 401) throw e;
      return sendJson<T>(this.opts, url, { method, json, token: await tokens.getAccessToken({ force: true }) });
    }
  }

  // ---------------------------------------------------------------- authentication
  registerStart(body: { email: string; request: string }) {
    return this.pub<{ session_id: string; response: string; user_id: string }>("POST", "auth/register/start", body);
  }
  registerFinish(body: { session_id: string; record: string; kdf: KdfParams; keyset: WrappedKeysetJson; device: DeviceInfo }) {
    return this.pub<Session>("POST", "auth/register/finish", body);
  }
  loginStart(body: { email: string; ke1: string }) {
    return this.pub<{ session_id: string; ke2: string }>("POST", "auth/login/start", body);
  }
  loginFinish(body: { session_id: string; auth_u: string; device: DeviceInfo }) {
    return this.pub<Session | MfaChallenge>("POST", "auth/login/finish", body);
  }
  loginMfa(body: { mfa_token: string; totp: string }) {
    return this.pub<Session>("POST", "auth/login/mfa", body);
  }
  refresh(refreshToken: string) {
    return this.pub<TokenPair>("POST", "auth/refresh", { refresh_token: refreshToken });
  }
  logout() {
    return this.authed<void>("POST", "auth/logout");
  }
  serviceAccountExchange(body: { sa_id: string; secret: string }) {
    return this.pub<ServiceAccountExchange>("POST", "auth/service-account", body);
  }

  // ---------------------------------------------------------------- me, keys, devices
  me() {
    return this.authed<Me>("GET", "me");
  }
  passwordStart(body: { request: string }) {
    return this.authed<{ session_id: string; response: string }>("POST", "me/password/start", body);
  }
  passwordFinish(body: { session_id: string; record: string; kdf: KdfParams; keyset: WrappedKeysetJson }) {
    return this.authed<void>("POST", "me/password/finish", body);
  }
  totpStart() {
    return this.authed<{ secret: string; otpauth_uri: string }>("POST", "me/totp");
  }
  totpConfirm(totp: string) {
    return this.authed<void>("PUT", "me/totp", { totp });
  }
  totpDisable(totp: string) {
    return this.authed<void>("DELETE", "me/totp", { totp });
  }
  lookupUser(email: string) {
    return this.authed<PublicPrincipal>("GET", "users/lookup", undefined, { email });
  }
  publicKey(principal: Principal) {
    return this.authed<PublicPrincipal>("GET", `principals/${seg(principal)}/public-key`);
  }
  listDevices() {
    return this.authed<{ devices: Device[] }>("GET", "devices");
  }
  revokeDevice(id: string) {
    return this.authed<void>("DELETE", `devices/${seg(id)}`);
  }

  // ---------------------------------------------------------------- orgs
  createOrg(name: string) {
    return this.authed<Org>("POST", "orgs", { name });
  }
  getOrg(org: string) {
    return this.authed<Org>("GET", `orgs/${seg(org)}`);
  }
  renameOrg(org: string, name: string) {
    return this.authed<Org>("PATCH", `orgs/${seg(org)}`, { name });
  }
  deleteOrg(org: string) {
    return this.authed<void>("DELETE", `orgs/${seg(org)}`);
  }
  listMembers(org: string) {
    return this.authed<{ members: Member[] }>("GET", `orgs/${seg(org)}/members`);
  }
  setMemberRole(org: string, user: string, body: { role: OrgRole; sa_master_keys?: SaMasterGrant[] }) {
    return this.authed<Member>("PATCH", `orgs/${seg(org)}/members/${seg(user)}`, body);
  }
  removeMember(org: string, user: string) {
    return this.authed<void>("DELETE", `orgs/${seg(org)}/members/${seg(user)}`);
  }
  confirmMember(org: string, user: string, body: { grants?: VaultGrant[]; sa_master_keys?: SaMasterGrant[] }) {
    return this.authed<Member>("POST", `orgs/${seg(org)}/members/${seg(user)}/confirm`, body);
  }
  listInvitations(org: string) {
    return this.authed<{ invitations: Invitation[] }>("GET", `orgs/${seg(org)}/invitations`);
  }
  invite(org: string, body: { email: string; role: OrgRole }) {
    return this.authed<Invitation>("POST", `orgs/${seg(org)}/invitations`, body);
  }
  cancelInvitation(org: string, id: string) {
    return this.authed<void>("DELETE", `orgs/${seg(org)}/invitations/${seg(id)}`);
  }
  acceptInvitation(token: string) {
    return this.authed<Member>("POST", "invitations/accept", { token });
  }

  // ---------------------------------------------------------------- vaults
  listVaults() {
    return this.authed<{ vaults: Vault[] }>("GET", "vaults");
  }
  createVault(body: { id: string; org_id?: string | null; encrypted_name: string; grants: Grant[] }) {
    return this.authed<Vault>("POST", "vaults", body);
  }
  getVault(vault: string) {
    return this.authed<Vault>("GET", `vaults/${seg(vault)}`);
  }
  renameVault(vault: string, encryptedName: string) {
    return this.authed<Vault>("PATCH", `vaults/${seg(vault)}`, { encrypted_name: encryptedName });
  }
  deleteVault(vault: string) {
    return this.authed<void>("DELETE", `vaults/${seg(vault)}`);
  }
  listAccess(vault: string) {
    return this.authed<{ access: VaultAccess[] }>("GET", `vaults/${seg(vault)}/access`);
  }
  grantAccess(vault: string, grants: Grant[]) {
    return this.authed<void>("POST", `vaults/${seg(vault)}/access`, { grants });
  }
  startRotation(vault: string, body: { key_version: number; grants: Grant[]; remove?: Principal[] }) {
    return this.authed<void>("POST", `vaults/${seg(vault)}/keys`, body);
  }
  activateKey(vault: string, version: number) {
    return this.authed<void>("POST", `vaults/${seg(vault)}/keys/${version}/activate`);
  }

  // ---------------------------------------------------------------- service accounts
  listServiceAccounts(org: string) {
    return this.authed<{ service_accounts: ServiceAccount[] }>("GET", `orgs/${seg(org)}/service-accounts`);
  }
  createServiceAccount(
    org: string,
    body: { id: string; name: string; expires_at?: string | null; keyset: WrappedKeysetJson; master_keys: SaMasterGrant[]; secret: NewSaSecret },
  ) {
    return this.authed<ServiceAccount>("POST", `orgs/${seg(org)}/service-accounts`, body);
  }
  getServiceAccount(sa: string) {
    return this.authed<ServiceAccount>("GET", `service-accounts/${seg(sa)}`);
  }
  updateServiceAccount(sa: string, body: { name?: string; expires_at?: string | null; disabled?: boolean }) {
    return this.authed<ServiceAccount>("PATCH", `service-accounts/${seg(sa)}`, body);
  }
  deleteServiceAccount(sa: string) {
    return this.authed<void>("DELETE", `service-accounts/${seg(sa)}`);
  }
  listSaSecrets(sa: string) {
    return this.authed<{ secrets: SaSecretInfo[] }>("GET", `service-accounts/${seg(sa)}/secrets`);
  }
  issueSaSecret(sa: string, body: NewSaSecret) {
    return this.authed<unknown>("POST", `service-accounts/${seg(sa)}/secrets`, body);
  }
  /** Changes when a secret expires (null: never); the token stays the same (SPEC §9). */
  updateSaSecret(sa: string, id: string, body: { expires_at: string | null }) {
    return this.authed<SaSecretInfo>("PATCH", `service-accounts/${seg(sa)}/secrets/${seg(id)}`, body);
  }
  revokeSaSecret(sa: string, id: string) {
    return this.authed<void>("DELETE", `service-accounts/${seg(sa)}/secrets/${seg(id)}`);
  }

  // ---------------------------------------------------------------- audit
  audit(org: string, opts: { before?: string; limit?: number } = {}) {
    return this.authed<{ events: AuditEvent[]; next: string | null }>("GET", `orgs/${seg(org)}/audit`, undefined, opts);
  }
}

/** A fixed token source (service accounts exchange again instead of refreshing). */
export const staticToken = (token: string): AccessTokenSource => ({ getAccessToken: async () => token });

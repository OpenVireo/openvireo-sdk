/**
 * Access-token lifecycle for a signed-in device (SPEC §9): refresh shortly before expiry, one refresh
 * at a time (single flight), rotate the stored refresh token, and treat a rejected refresh (reuse
 * detection, revoked device, expired) as "signed out".
 */
import { KpxError } from "../errors.js";
import { decodeJwt } from "../crypto/jwt.js";
import type { KeyValueStorage } from "./storage.js";
import type { TokenPair } from "./types.js";

export interface StoredSession {
  issuer: string;
  userId: string;
  email: string;
  deviceId: string;
  refreshToken: string;
}

export interface TokenManagerOptions {
  storage: KeyValueStorage;
  /** storage key for the session (one per account) */
  storageKey?: string;
  refresh: (refreshToken: string) => Promise<TokenPair>;
  /** refresh this long before `exp` (default 60 s) */
  marginMs?: number;
  now?: () => number;
}

export type SignedOutReason = "token_reused" | "session_expired" | "unauthorized" | "logout";

export class TokenManager {
  private access: { token: string; expiresAt: number } | null = null;
  private session: StoredSession | null = null;
  private inflight: Promise<string> | null = null;
  private readonly listeners = new Set<(reason: SignedOutReason) => void>();
  private readonly key: string;
  private readonly now: () => number;

  constructor(private readonly opts: TokenManagerOptions) {
    this.key = opts.storageKey ?? "session";
    this.now = opts.now ?? Date.now;
  }

  /** Loads a stored session (e.g. at app start). Returns null when signed out. */
  async load(): Promise<StoredSession | null> {
    if (this.session) return this.session;
    const raw = await this.opts.storage.get(this.key);
    this.session = raw ? (JSON.parse(raw) as StoredSession) : null;
    return this.session;
  }

  get current(): StoredSession | null {
    return this.session;
  }

  /** After login/register: keep the session and its first access token. */
  async start(session: StoredSession, accessToken: string, expiresIn: number): Promise<void> {
    this.session = session;
    this.setAccess(accessToken, expiresIn);
    await this.opts.storage.set(this.key, JSON.stringify(session));
  }

  private setAccess(token: string, expiresIn: number) {
    let expiresAt = this.now() + expiresIn * 1000;
    try {
      const { claims } = decodeJwt(token);
      if (typeof claims.exp === "number") expiresAt = Math.min(expiresAt, claims.exp * 1000);
    } catch {
      /* not a JWT (tests) */
    }
    this.access = { token, expiresAt };
  }

  /** A valid access token, refreshing first if it expires within the margin (or `force`). */
  async getAccessToken(opts: { force?: boolean } = {}): Promise<string> {
    const margin = this.opts.marginMs ?? 60_000;
    if (!opts.force && this.access && this.access.expiresAt - margin > this.now()) return this.access.token;
    return this.refreshNow();
  }

  /** Single-flight refresh: concurrent callers share one request. */
  refreshNow(): Promise<string> {
    this.inflight ??= (async () => {
      const session = await this.load();
      if (!session) throw new KpxError("signed_out", "not signed in");
      let pair: TokenPair;
      try {
        pair = await this.opts.refresh(session.refreshToken);
      } catch (e) {
        const status = (e as KpxError).status;
        if (status === 401 || status === 403 || status === 410) {
          const code = (e as KpxError).code;
          await this.clear(code === "token_reused" ? "token_reused" : code === "session_expired" ? "session_expired" : "unauthorized");
          throw new KpxError("signed_out", `signed out: ${(e as Error).message}`, status, { cause: e });
        }
        throw e; // network trouble: keep the session and let the caller retry
      }
      // Persist the rotated refresh token before using the new access token
      this.session = { ...session, refreshToken: pair.refresh_token };
      await this.opts.storage.set(this.key, JSON.stringify(this.session));
      this.setAccess(pair.access_token, pair.expires_in);
      return pair.access_token;
    })().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  /** Forget the session locally (after logout, or when the server rejected the refresh token). */
  async clear(reason: SignedOutReason = "logout"): Promise<void> {
    this.session = null;
    this.access = null;
    await this.opts.storage.delete(this.key);
    for (const l of this.listeners) l(reason);
  }

  onSignedOut(listener: (reason: SignedOutReason) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

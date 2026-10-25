/** An in-memory auth server following openapi.yaml closely enough for end-to-end tests of the SDK. */
import { opaqueServerForTests as OS, opaqueIds } from "../opaque/index.js";
import { b64u, fromB64u, randomUuid, toHex } from "../util/bytes.js";
import { sha256 } from "../crypto/primitives.js";
import { verifyRestoreProof } from "../crypto/restore.js";
import { MockServer, json } from "./mock-fetch.js";

export const ISSUER = "https://auth.example";
export const CONFIG = {
  issuer: ISSUER,
  api: ISSUER + "/api/v1",
  sync: "https://sync.example/api/v1",
  jwks_uri: ISSUER + "/.well-known/jwks.json",
  opaque: { lib: "opaque-ke", version: "4.0.1", context: "ov-opaque-v1", ids: "auth.example" },
  kdf_min: { m: 19456, t: 2 },
};

interface Access {
  role: string;
  keys: Map<number, string>;
}

/** An approved reset (SPEC.md §18); the token is `ov_rc_…` */
export interface FakeRecovery {
  email: string;
  notBefore: number;
  expiresAt: number;
  status: "approved_reset" | "cancelled" | "completed";
}

/** What a reset archived (SPEC.md §18) */
export interface FakeArchive {
  email: string;
  rec: Uint8Array;
  kdf: any;
  keyset: any;
  expiresAt: number;
  /** archived grants, at the key version they had at the reset */
  grants: { vault_id: string; role: string; key_version: number; sealed_key: string }[];
  /** personal vaults nobody else could open, archived with the account */
  personalVaults: string[];
  failures: number;
  locked: boolean;
}

export class FakeAuthServer extends MockServer {
  users = new Map<string, any>(); // email → user
  sessions = new Map<string, any>();
  refresh = new Map<string, { principal: string; used: boolean }>();
  tokens = new Map<string, string>(); // access token → principal
  vaults = new Map<string, { org_id: string | null; owner_id?: string | null; encrypted_name: string; current: number; pending: number | null; access: Map<string, Access>; rotationRequired?: boolean; archived?: boolean }>();
  orgs = new Map<string, { name: string; members: Map<string, { role: string; status: string }> }>();
  sas = new Map<string, any>();
  /** email → TOTP code; those users get an MFA challenge (SPEC.md §8) */
  totp = new Map<string, string>();
  mfa = new Map<string, { email: string; wrong: number }>();
  /** user id → the pending email change and its mailed code (SPEC.md §16) */
  emailCodes = new Map<string, { email: string; code: string }>();
  /** ov_rc_ token → approved reset; see `approveReset` (SPEC.md §18) */
  recoveries = new Map<string, FakeRecovery>();
  /** user id → recovery archive */
  archives = new Map<string, FakeArchive>();
  /** access token → when it was issued (ms); the restore routes want one from the last `recentTokenMs` */
  issuedAt = new Map<string, number>();
  recentTokenMs = 5 * 60_000;
  onToken: (t: string) => void = () => {};

  /**
   * Approves a reset for an account (what the admin review does) and returns the `ov_rc_` token of the
   * mailed link. `delaySeconds` is OPENVIREO_RECOVERY_DELAY (default 0, as in tests).
   */
  approveReset(email: string, opts: { delaySeconds?: number } = {}): string {
    if (!this.users.has(email)) throw new Error(`no user ${email}`);
    const token = `ov_rc_${b64u(sha256(new TextEncoder().encode(randomUuid())))}`;
    const now = Date.now();
    this.recoveries.set(token, { email, notBefore: now + (opts.delaySeconds ?? 0) * 1000, expiresAt: now + 72 * 3600_000, status: "approved_reset" });
    return token;
  }
  /** The notice's cancel link */
  cancelReset(token: string): void {
    const r = this.recoveries.get(token);
    if (r) r.status = "cancelled";
  }

  private issue(principal: string) {
    const t = `at-${randomUuid()}`;
    this.tokens.set(t, principal);
    this.issuedAt.set(t, Date.now());
    this.onToken(t);
    return t;
  }
  private session(user: any, status = 200) {
    const rt = `ov_rt_${randomUuid()}`;
    this.refresh.set(rt, { principal: `user:${user.id}`, used: false });
    return json(status, { access_token: this.issue(`user:${user.id}`), refresh_token: rt, expires_in: 600, device_id: "dev-" + user.id.slice(0, 4), user: { id: user.id, email: user.email }, kdf: user.kdf, keyset: user.keyset });
  }
  /** Adds a user to an org as accepted (invitation flow skipped), to be confirmed by an admin */
  addMember(org: string, email: string, role = "member") {
    this.orgs.get(org)!.members.set(this.users.get(email).id, { role, status: "accepted" });
  }
  private memberJson(uid: string, m: { role: string; status: string }) {
    return { user_id: uid, email: this.userById(uid).email, role: m.role, status: m.status, public: this.pub(`user:${uid}`) };
  }
  private storeSaMasterKeys(keys: { sa_id: string; principal: string; sealed_key: string }[] = []) {
    for (const k of keys) this.sas.get(k.sa_id).master.set(k.principal, k.sealed_key);
  }
  private userById = (id: string) => [...this.users.values()].find((u) => u.id === id);
  private pub(principal: string) {
    const [kind, id] = principal.split(":");
    if (kind === "user") {
      const u = this.userById(id!);
      return u && { principal, email: u.email, enc_pk: u.keyset.enc_pk, sign_pk: u.keyset.sign_pk, sig: u.keyset.sig };
    }
    const sa = this.sas.get(id!);
    return sa && { principal, enc_pk: sa.keyset.enc_pk, sign_pk: sa.keyset.sign_pk, sig: sa.keyset.sig };
  }
  private vaultJson(id: string, principal: string) {
    const v = this.vaults.get(id)!;
    const a = v.access.get(principal)!;
    const keys = [...a.keys].filter(([k]) => k === v.current || k === v.pending).sort((x, y) => y[0] - x[0]).map(([key_version, sealed_key]) => ({ key_version, sealed_key }));
    return { id, org_id: v.org_id, encrypted_name: v.encrypted_name, role: a.role, current_key_version: v.current, pending_key_version: v.pending, rotation_required: !!v.rotationRequired, keys };
  }

  constructor() {
    super();
    const ids = (email: string) => opaqueIds(email, CONFIG.opaque.ids);
    const A = (h: (req: any, p: any, principal: string) => any) => (req: any, p: any) => {
      const principal = this.tokens.get((req.headers.authorization ?? "").replace("Bearer ", ""));
      return principal ? h(req, p, principal) : json(401, { error: "unauthorized", code: "unauthorized" }, { "WWW-Authenticate": "Bearer" });
    };
    const P = "/api/v1/";
    this.on("GET", "/.well-known/openvireo-configuration", () => json(200, CONFIG));
    this.on("POST", P + "auth/register/start", async (req) => {
      if (this.users.has(req.json.email)) return json(409, { error: "taken", code: "conflict" });
      const { sec, response } = await OS.registrationResponse(fromB64u(req.json.request));
      const sid = randomUuid();
      const user_id = randomUuid();
      this.sessions.set(sid, { sec, email: req.json.email, user_id });
      return json(200, { session_id: sid, response: b64u(response), user_id });
    });
    this.on("POST", P + "auth/register/finish", async (req) => {
      const s = this.sessions.get(req.json.session_id);
      if (!s) return json(410, { error: "expired", code: "session_expired" });
      const rec = await OS.storeRecord(s.sec, fromB64u(req.json.record));
      const user = { id: s.user_id, email: s.email, rec, kdf: req.json.kdf, keyset: req.json.keyset };
      this.users.set(s.email, user);
      return this.session(user, 201);
    });
    this.on("POST", P + "auth/login/start", async (req) => {
      const u = this.users.get(req.json.email);
      if (!u) return json(500, { error: "fake records not implemented in the mock" });
      const r = await OS.credentialResponse(fromB64u(req.json.ke1), u.rec, ids(u.email));
      const sid = randomUuid();
      this.sessions.set(sid, { sec: r.sec, email: u.email });
      return json(200, { session_id: sid, ke2: b64u(r.ke2) });
    });
    this.on("POST", P + "auth/login/finish", async (req) => {
      const s = this.sessions.get(req.json.session_id);
      if (!s || !(await OS.userAuth(s.sec, fromB64u(req.json.auth_u)))) return json(401, { error: "wrong email or password", code: "unauthorized" });
      if (this.totp.has(s.email)) {
        const mfa_token = `mfa-${randomUuid()}`;
        this.mfa.set(mfa_token, { email: s.email, wrong: 0 });
        return json(200, { mfa_required: true, mfa_token, methods: ["totp"] });
      }
      return this.session(this.users.get(s.email));
    });
    this.on("POST", P + "auth/login/mfa", (req) => {
      const m = this.mfa.get(req.json.mfa_token);
      if (!m) return json(401, { error: "The MFA token is invalid or expired", code: "unauthorized" });
      if (req.json.totp !== this.totp.get(m.email)) {
        if (++m.wrong >= 5) this.mfa.delete(req.json.mfa_token);
        return json(401, { error: "The code is incorrect", code: "invalid_mfa" });
      }
      this.mfa.delete(req.json.mfa_token);
      return this.session(this.users.get(m.email));
    });
    this.on("POST", P + "auth/refresh", (req) => {
      const r = this.refresh.get(req.json.refresh_token);
      if (!r) return json(401, { error: "unknown", code: "unauthorized" });
      if (r.used) return json(401, { error: "reused", code: "token_reused" });
      r.used = true;
      const rt = `ov_rt_${randomUuid()}`;
      this.refresh.set(rt, { principal: r.principal, used: false });
      return json(200, { access_token: this.issue(r.principal), refresh_token: rt, expires_in: 600 });
    });
    this.on("POST", P + "auth/logout", A(() => new Response(null, { status: 204 })));
    this.on("POST", P + "auth/service-account", (req) => {
      const sa = this.sas.get(req.json.sa_id);
      const w = sa?.secrets.get(toHex(sha256(fromB64u(req.json.secret))));
      if (!w) return json(401, { error: "bad secret", code: "unauthorized" });
      return json(200, { access_token: this.issue(`sa:${sa.id}`), expires_in: 600, wrapped_master: w, keyset: sa.keyset });
    });
    // ---- account recovery (SPEC.md §18)
    const recovery = (token: string) => {
      const r = this.recoveries.get(token);
      if (!r) return { error: json(404, { error: "unknown token", code: "not_found" }) };
      if (r.status === "cancelled") return { error: json(410, { error: "This reset was cancelled", code: "recovery_cancelled" }) };
      if (r.status !== "approved_reset" || Date.now() > r.expiresAt) return { error: json(410, { error: "This link was used or has expired", code: "session_expired" }) };
      if (Date.now() < r.notBefore) {
        const not_before = new Date(r.notBefore).toISOString();
        return { error: json(409, { error: `The link works from ${not_before}`, code: "recovery_not_ready", not_before }) };
      }
      return { r };
    };
    this.on("GET", P + "auth/recover/{token}", (_req, p) => {
      const { r, error } = recovery(p.token!);
      if (error) return error;
      const u = this.users.get(r.email);
      const personal = [...this.vaults.values()].filter((v) => !v.archived && v.owner_id === u.id && v.access.has(`user:${u.id}`));
      const lone = personal.filter((v) => v.access.size === 1).length;
      const grants = [...this.vaults.values()].filter((v) => !v.archived && v.access.has(`user:${u.id}`)).length - lone;
      const soleAdmin = [...this.orgs.values()].filter((o) => {
        const admins = [...o.members].filter(([, m]) => m.status === "confirmed" && (m.role === "owner" || m.role === "admin"));
        return admins.length === 1 && admins[0]![0] === u.id;
      });
      return json(200, {
        email: r.email,
        not_before: new Date(r.notBefore).toISOString(),
        expires_at: new Date(r.expiresAt).toISOString(),
        archive_days: 30,
        archives: { personal_vaults: lone, shared_grants: grants, sole_admin_orgs: soleAdmin.map((o) => o.name) },
      });
    });
    this.on("POST", P + "auth/recover/start", async (req) => {
      const { r, error } = recovery(req.json.token);
      if (error) return error;
      const { sec, response } = await OS.registrationResponse(fromB64u(req.json.request));
      const sid = randomUuid();
      this.sessions.set(sid, { sec, recoverToken: req.json.token, email: r.email });
      return json(200, { session_id: sid, response: b64u(response) });
    });
    this.on("POST", P + "auth/recover/finish", async (req) => {
      const s = this.sessions.get(req.json.session_id);
      if (!s?.recoverToken) return json(410, { error: "expired", code: "session_expired" });
      const { r, error } = recovery(s.recoverToken);
      if (error) return error;
      this.sessions.delete(req.json.session_id);
      const u = this.users.get(r.email);
      const principal = `user:${u.id}`;
      const archive: FakeArchive = { email: u.email, rec: u.rec, kdf: u.kdf, keyset: u.keyset, expiresAt: Date.now() + 30 * 86400_000, grants: [], personalVaults: [], failures: 0, locked: false };
      for (const [id, v] of this.vaults) {
        const a = v.access.get(principal);
        if (!a || v.archived) continue;
        const sealed = a.keys.get(v.current);
        if (sealed) archive.grants.push({ vault_id: id, role: a.role, key_version: v.current, sealed_key: sealed });
        if (v.owner_id === u.id && v.access.size === 1) {
          v.archived = true;
          archive.personalVaults.push(id);
        }
        v.access.delete(principal);
      }
      for (const o of this.orgs.values()) {
        const m = o.members.get(u.id);
        if (m?.status === "confirmed") m.status = "accepted";
      }
      for (const sa of this.sas.values()) sa.master.delete(principal);
      for (const [t, p] of this.tokens) if (p === principal) this.tokens.delete(t);
      for (const [t, rt] of this.refresh) if (rt.principal === principal) this.refresh.delete(t);
      this.totp.delete(u.email);
      this.archives.set(u.id, archive);
      Object.assign(u, { rec: await OS.storeRecord(s.sec, fromB64u(req.json.record)), kdf: req.json.kdf, keyset: req.json.keyset });
      r.status = "completed";
      return this.session(u);
    });
    const R = (h: (req: any, archive: FakeArchive, userId: string) => any) =>
      A((req, _p, pr) => {
        const issued = this.issuedAt.get((req.headers.authorization ?? "").replace("Bearer ", "")) ?? 0;
        if (Date.now() - issued > this.recentTokenMs) return json(403, { error: "Sign in again to restore", code: "forbidden" });
        const userId = pr.split(":")[1]!;
        const archive = this.archives.get(userId);
        if (!archive) return json(404, { error: "no recovery archive", code: "not_found" });
        if (archive.locked) return json(403, { error: "Too many failed attempts", code: "restore_locked" });
        return h(req, archive, userId);
      });
    const failed = (archive: FakeArchive, res: Response) => {
      if (++archive.failures >= 10) archive.locked = true;
      return res;
    };
    this.on("GET", P + "me/recovery", A((_r, _p, pr) => {
      const a = this.archives.get(pr.split(":")[1]!);
      return json(200, a ? { archived: true, email: a.email, expires_at: new Date(a.expiresAt).toISOString(), vaults: a.grants.length, locked: a.locked } : { archived: false });
    }));
    this.on("POST", P + "me/recovery/restore/start", R(async (req, archive, userId) => {
      const r = await OS.credentialResponse(fromB64u(req.json.ke1), archive.rec, ids(archive.email));
      const sid = randomUuid();
      this.sessions.set(sid, { sec: r.sec, restore: userId, verified: null });
      return json(200, { session_id: sid, ke2: b64u(r.ke2), email: archive.email });
    }));
    // The grants verify would return now: vaults that still exist at the archived key version
    const live = (archive: FakeArchive) => archive.grants.filter((g) => this.vaults.get(g.vault_id)?.current === g.key_version);
    this.on("POST", P + "me/recovery/restore/verify", R(async (req, archive, userId) => {
      const s = this.sessions.get(req.json.session_id);
      if (!s || s.restore !== userId || s.verified) return json(410, { error: "expired", code: "session_expired" });
      if (!(await OS.userAuth(s.sec, fromB64u(req.json.auth_u)))) return failed(archive, json(401, { error: "The old password is wrong", code: "unauthorized" }, { "WWW-Authenticate": "Bearer" }));
      const grants = live(archive).map((g) => ({ ...g, principal: `user:${userId}` }));
      s.verified = grants;
      return json(200, { session_id: req.json.session_id, kdf: archive.kdf, keyset: archive.keyset, grants });
    }));
    this.on("POST", P + "me/recovery/restore/finish", R((req, archive, userId) => {
      const s = this.sessions.get(req.json.session_id);
      if (!s || s.restore !== userId || !s.verified) return json(410, { error: "expired", code: "session_expired" });
      const u = this.userById(userId);
      const principal = `user:${userId}`;
      const current = { encPk: fromB64u(u.keyset.enc_pk), signPk: fromB64u(u.keyset.sign_pk) };
      if (!verifyRestoreProof(fromB64u(req.json.proof ?? ""), userId, current, fromB64u(archive.keyset.sign_pk))) {
        return failed(archive, json(400, { error: "The proof doesn't match the archived keys", code: "invalid_proof" }));
      }
      for (const g of req.json.grants ?? []) {
        if (g.principal !== principal || !s.verified.some((v: any) => v.vault_id === g.vault_id && v.key_version === g.key_version)) {
          return failed(archive, json(400, { error: `grant for ${g.vault_id} was not returned by verify`, code: "invalid_request" }));
        }
      }
      for (const g of req.json.grants ?? []) {
        const v = this.vaults.get(g.vault_id);
        // Rotated or deleted since verify: skipped
        if (!v || v.current !== g.key_version) continue;
        const role = archive.grants.find((a) => a.vault_id === g.vault_id)!.role;
        v.access.set(principal, { role, keys: new Map([[g.key_version, g.sealed_key]]) });
        v.archived = false;
      }
      this.sessions.delete(req.json.session_id);
      this.archives.delete(userId);
      return new Response(null, { status: 204 });
    }));
    this.on("GET", P + "me", A((_r, _p, pr) => {
      const u = this.userById(pr.split(":")[1]!);
      const orgs = [...this.orgs].filter(([, o]) => o.members.has(u.id)).map(([id, o]) => ({ id, name: o.name, ...o.members.get(u.id)! }));
      return json(200, { id: u.id, email: u.email, kdf: u.kdf, keyset: u.keyset, mfa: { totp: false }, orgs });
    }));
    this.on("POST", P + "me/password/start", A(async (req, _p, pr) => {
      const { sec, response } = await OS.registrationResponse(fromB64u(req.json.request));
      const sid = randomUuid();
      this.sessions.set(sid, { sec, principal: pr });
      return json(200, { session_id: sid, response: b64u(response) });
    }));
    this.on("POST", P + "me/password/finish", A(async (req, _p, pr) => {
      const s = this.sessions.get(req.json.session_id);
      if (!s || s.principal !== pr) return json(410, { error: "expired", code: "session_expired" });
      const u = this.userById(pr.split(":")[1]!);
      const pub = (k: any) => [k.enc_pk, k.sign_pk, k.sig].join();
      if (pub(req.json.keyset) !== pub(u.keyset)) return json(400, { error: "keyset must keep the same public keys", code: "invalid_request" });
      Object.assign(u, { rec: await OS.storeRecord(s.sec, fromB64u(req.json.record)), kdf: req.json.kdf, keyset: req.json.keyset });
      return new Response(null, { status: 204 });
    }));
    this.on("POST", P + "me/email", A((req, _p, pr) => {
      const email = String(req.json.email).trim().toLowerCase();
      if (this.users.has(email)) return json(409, { error: "Another account uses this email", code: "conflict" });
      const code = String(Math.floor(Math.random() * 1e8)).padStart(8, "0");
      this.emailCodes.set(pr.split(":")[1]!, { email, code });
      return json(202, { expires_in: 1800 });
    }));
    this.on("POST", P + "me/email/start", A(async (req, _p, pr) => {
      const pending = this.emailCodes.get(pr.split(":")[1]!);
      if (!pending || pending.email !== String(req.json.email).trim().toLowerCase()) return json(410, { error: "Ask for a new code", code: "session_expired" });
      if (pending.code !== req.json.code) return json(400, { error: "The code is incorrect", code: "invalid_code" });
      this.emailCodes.delete(pr.split(":")[1]!);
      const { sec, response } = await OS.registrationResponse(fromB64u(req.json.request));
      const sid = randomUuid();
      this.sessions.set(sid, { sec, principal: pr, email: pending.email });
      return json(200, { session_id: sid, response: b64u(response) });
    }));
    this.on("POST", P + "me/email/finish", A(async (req, _p, pr) => {
      const s = this.sessions.get(req.json.session_id);
      if (!s || s.principal !== pr) return json(410, { error: "expired", code: "session_expired" });
      const u = this.userById(pr.split(":")[1]!);
      this.users.delete(u.email);
      Object.assign(u, { rec: await OS.storeRecord(s.sec, fromB64u(req.json.record)), email: s.email });
      this.users.set(u.email, u);
      return new Response(null, { status: 204 });
    }));
    this.on("POST", P + "me/web-session", A(() => json(200, { code: `ov_ws_${randomUuid()}`, expires_in: 60 })));
    this.on("GET", P + "users/lookup", A((req) => {
      const u = this.users.get(req.query.get("email"));
      return u ? json(200, this.pub(`user:${u.id}`)) : json(404, { error: "no such user", code: "not_found" });
    }));
    this.on("GET", P + "principals/{p}/public-key", A((_r, p) => json(200, this.pub(p.p))));
    this.on("POST", P + "orgs", A((req, _p, pr) => {
      const id = randomUuid();
      this.orgs.set(id, { name: req.json.name, members: new Map([[pr.split(":")[1]!, { role: "owner", status: "confirmed" }]]) });
      return json(201, { id, name: req.json.name, role: "owner" });
    }));
    this.on("GET", P + "orgs/{org}/members", A((_r, p) =>
      json(200, { members: [...this.orgs.get(p.org)!.members].map(([uid, m]) => this.memberJson(uid, m)) }),
    ));
    // Confirm: grants name their vault (VaultGrant); owners/admins also get SA master keys
    this.on("POST", P + "orgs/{org}/members/{u}/confirm", A((req, p) => {
      const m = this.orgs.get(p.org)!.members.get(p.u)!;
      for (const g of req.json.grants ?? []) {
        const v = this.vaults.get(g.vault_id);
        if (!v || v.org_id !== p.org) return json(400, { error: "not an org vault", code: "invalid_request" });
        if (g.principal !== `user:${p.u}`) return json(400, { error: "grants must be sealed to the member", code: "invalid_request" });
        if (g.key_version !== v.current) return json(409, { error: "not current", code: "conflict" });
        v.access.set(g.principal, { role: g.role, keys: new Map([[g.key_version, g.sealed_key]]) });
      }
      this.storeSaMasterKeys(req.json.sa_master_keys);
      m.status = "confirmed";
      return json(200, this.memberJson(p.u, m));
    }));
    this.on("PATCH", P + "orgs/{org}/members/{u}", A((req, p) => {
      const m = this.orgs.get(p.org)!.members.get(p.u)!;
      m.role = req.json.role;
      if (m.role === "member") for (const sa of this.sas.values()) if (sa.org_id === p.org) sa.master.delete(`user:${p.u}`);
      this.storeSaMasterKeys(req.json.sa_master_keys);
      return json(200, this.memberJson(p.u, m));
    }));
    this.on("DELETE", P + "orgs/{org}/members/{u}", A((_r, p) => {
      this.orgs.get(p.org)!.members.delete(p.u);
      for (const v of this.vaults.values()) if (v.org_id === p.org && v.access.delete(`user:${p.u}`)) v.rotationRequired = true;
      return new Response(null, { status: 204 });
    }));
    this.on("GET", P + "orgs/{org}/service-accounts", A((_r, p, pr) =>
      json(200, { service_accounts: [...this.sas.values()].filter((sa) => sa.org_id === p.org).map((sa) => ({ id: sa.id, org_id: sa.org_id, name: sa.name, master_key: sa.master.get(pr) })) }),
    ));
    this.on("GET", P + "vaults", A((_r, _p, pr) => json(200, { vaults: [...this.vaults].filter(([, v]) => v.access.has(pr) && !v.archived).map(([id]) => this.vaultJson(id, pr)) })));
    this.on("POST", P + "vaults", A((req, _p, pr) => {
      if (!req.json.grants.some((g: any) => g.principal === pr)) return json(400, { error: "the caller must be one of the grantees", code: "invalid_request" });
      // SPEC §7: an org vault needs a manage grant for every confirmed owner and admin
      if (req.json.org_id) {
        const org = this.orgs.get(req.json.org_id);
        const me = org?.members.get(pr.split(":")[1]!);
        if (!org || !me || me.status !== "confirmed" || (me.role !== "owner" && me.role !== "admin")) return json(403, { error: "only owners and admins create org vaults", code: "forbidden" });
        const missing = [...org.members]
          .filter(([, m]) => m.status === "confirmed" && (m.role === "owner" || m.role === "admin"))
          .map(([uid]) => `user:${uid}`)
          .filter((p) => !req.json.grants.some((g: any) => g.principal === p && g.role === "manage"));
        if (missing.length) return json(400, { error: `missing manage grants for ${missing.join(", ")}`, code: "invalid_request" });
      }
      const access = new Map<string, Access>();
      for (const g of req.json.grants) access.set(g.principal, { role: g.role, keys: new Map([[g.key_version, g.sealed_key]]) });
      this.vaults.set(req.json.id, { org_id: req.json.org_id ?? null, owner_id: req.json.org_id ? null : pr.split(":")[1]!, encrypted_name: req.json.encrypted_name, current: 1, pending: null, access });
      return json(201, this.vaultJson(req.json.id, pr));
    }));
    this.on("GET", P + "vaults/{v}", A((_r, p, pr) => (this.vaults.get(p.v)?.access.has(pr) && !this.vaults.get(p.v)!.archived ? json(200, this.vaultJson(p.v, pr)) : json(404, { error: "no such vault", code: "not_found" }))));
    this.on("PATCH", P + "vaults/{v}", A((req, p, pr) => {
      this.vaults.get(p.v)!.encrypted_name = req.json.encrypted_name;
      return json(200, this.vaultJson(p.v, pr));
    }));
    this.on("GET", P + "vaults/{v}/access", A((_r, p) => json(200, { access: [...this.vaults.get(p.v)!.access].map(([principal, a]) => ({ principal, role: a.role, key_version: Math.max(...a.keys.keys()) })) })));
    this.on("POST", P + "vaults/{v}/access", A((req, p) => {
      const v = this.vaults.get(p.v)!;
      for (const g of req.json.grants) {
        if (g.key_version !== v.current) return json(409, { error: "not current", code: "conflict" });
        v.access.set(g.principal, { role: g.role, keys: new Map([[g.key_version, g.sealed_key]]) });
      }
      return json(200, {});
    }));
    this.on("POST", P + "vaults/{v}/keys", A((req, p) => {
      const v = this.vaults.get(p.v)!;
      if (v.pending !== null || req.json.key_version !== v.current + 1) return json(409, { error: "rotation pending", code: "conflict" });
      for (const r of req.json.remove ?? []) v.access.delete(r);
      for (const g of req.json.grants) v.access.get(g.principal)?.keys.set(g.key_version, g.sealed_key);
      v.pending = req.json.key_version;
      return new Response(null, { status: 202 });
    }));
    this.on("POST", P + "vaults/{v}/keys/{n}/activate", A((_r, p) => {
      const v = this.vaults.get(p.v)!;
      v.current = Number(p.n);
      v.pending = null;
      v.rotationRequired = false;
      for (const a of v.access.values()) for (const k of [...a.keys.keys()]) if (k < v.current) a.keys.delete(k);
      return new Response(null, { status: 204 });
    }));
    this.on("POST", P + "orgs/{org}/service-accounts", A((req, p, pr) => {
      const b = req.json;
      const sa = { id: b.id, org_id: p.org, name: b.name, keyset: b.keyset, master: new Map(b.master_keys.map((m: any) => [m.principal, m.sealed_key])), secrets: new Map([[b.secret.secret_hash, b.secret.wrapped_master]]) };
      this.sas.set(b.id, sa);
      return json(201, { id: sa.id, org_id: p.org, name: sa.name, created_by: pr });
    }));
    this.on("GET", P + "service-accounts/{sa}", A((_r, p, pr) => {
      const sa = this.sas.get(p.sa);
      return json(200, { id: sa.id, org_id: sa.org_id, name: sa.name, keyset: sa.keyset, master_key: sa.master.get(pr) });
    }));
    this.on("POST", P + "service-accounts/{sa}/secrets", A((req, p) => {
      this.sas.get(p.sa).secrets.set(req.json.secret_hash, req.json.wrapped_master);
      return json(201, {});
    }));
  }
}

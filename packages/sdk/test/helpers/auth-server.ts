/** An in-memory auth server following openapi.yaml closely enough for end-to-end tests of the SDK. */
import { opaqueServerForTests as OS, opaqueIds } from "../../src/opaque/index.js";
import { b64u, fromB64u, randomUuid, toHex } from "../../src/util/bytes.js";
import { sha256 } from "../../src/crypto/primitives.js";
import { MockServer, json } from "./mock-fetch.js";

export const ISSUER = "https://auth.example";
export const CONFIG = {
  issuer: ISSUER,
  api: ISSUER + "/api/v1",
  sync: "https://sync.example/api/v1",
  jwks_uri: ISSUER + "/.well-known/jwks.json",
  opaque: { lib: "libopaque", version: "1.0.1-6e9ac92", context: "kpx-opaque-v1", ids: "auth.example" },
  kdf_min: { m: 19456, t: 2 },
};

interface Access {
  role: string;
  keys: Map<number, string>;
}

export class FakeAuthServer extends MockServer {
  users = new Map<string, any>(); // email → user
  sessions = new Map<string, any>();
  refresh = new Map<string, { principal: string; used: boolean }>();
  tokens = new Map<string, string>(); // access token → principal
  vaults = new Map<string, { org_id: string | null; encrypted_name: string; current: number; pending: number | null; access: Map<string, Access> }>();
  orgs = new Map<string, { name: string; members: Map<string, string> }>();
  sas = new Map<string, any>();
  onToken: (t: string) => void = () => {};

  private issue(principal: string) {
    const t = `at-${randomUuid()}`;
    this.tokens.set(t, principal);
    this.onToken(t);
    return t;
  }
  private session(user: any, status = 200) {
    const rt = `kpx_rt_${randomUuid()}`;
    this.refresh.set(rt, { principal: `user:${user.id}`, used: false });
    return json(status, { access_token: this.issue(`user:${user.id}`), refresh_token: rt, expires_in: 600, device_id: "dev-" + user.id.slice(0, 4), user: { id: user.id, email: user.email }, kdf: user.kdf, keyset: user.keyset });
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
    return { id, org_id: v.org_id, encrypted_name: v.encrypted_name, role: a.role, current_key_version: v.current, pending_key_version: v.pending, keys };
  }

  constructor() {
    super();
    const ids = (email: string) => opaqueIds(email, CONFIG.opaque.ids);
    const A = (h: (req: any, p: any, principal: string) => any) => (req: any, p: any) => {
      const principal = this.tokens.get((req.headers.authorization ?? "").replace("Bearer ", ""));
      return principal ? h(req, p, principal) : json(401, { error: "unauthorized", code: "unauthorized" }, { "WWW-Authenticate": "Bearer" });
    };
    const P = "/api/v1/";
    this.on("GET", "/.well-known/kpx-configuration", () => json(200, CONFIG));
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
      return this.session(this.users.get(s.email));
    });
    this.on("POST", P + "auth/refresh", (req) => {
      const r = this.refresh.get(req.json.refresh_token);
      if (!r) return json(401, { error: "unknown", code: "unauthorized" });
      if (r.used) return json(401, { error: "reused", code: "token_reused" });
      r.used = true;
      const rt = `kpx_rt_${randomUuid()}`;
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
    this.on("GET", P + "me", A((_r, _p, pr) => {
      const u = this.userById(pr.split(":")[1]!);
      return json(200, { id: u.id, email: u.email, kdf: u.kdf, keyset: u.keyset, mfa: { totp: false } });
    }));
    this.on("GET", P + "users/lookup", A((req) => {
      const u = this.users.get(req.query.get("email"));
      return u ? json(200, this.pub(`user:${u.id}`)) : json(404, { error: "no such user", code: "not_found" });
    }));
    this.on("GET", P + "principals/{p}/public-key", A((_r, p) => json(200, this.pub(p.p))));
    this.on("POST", P + "orgs", A((req, _p, pr) => {
      const id = randomUuid();
      this.orgs.set(id, { name: req.json.name, members: new Map([[pr.split(":")[1]!, "owner"]]) });
      return json(201, { id, name: req.json.name, role: "owner" });
    }));
    this.on("GET", P + "orgs/{org}/members", A((_r, p) =>
      json(200, { members: [...this.orgs.get(p.org)!.members].map(([uid, role]) => ({ user_id: uid, email: this.userById(uid).email, role, status: "confirmed", public: this.pub(`user:${uid}`) })) }),
    ));
    this.on("GET", P + "vaults", A((_r, _p, pr) => json(200, { vaults: [...this.vaults].filter(([, v]) => v.access.has(pr)).map(([id]) => this.vaultJson(id, pr)) })));
    this.on("POST", P + "vaults", A((req, _p, pr) => {
      const access = new Map<string, Access>();
      for (const g of req.json.grants) access.set(g.principal, { role: g.role, keys: new Map([[g.key_version, g.sealed_key]]) });
      this.vaults.set(req.json.id, { org_id: req.json.org_id ?? null, encrypted_name: req.json.encrypted_name, current: 1, pending: null, access });
      return json(201, this.vaultJson(req.json.id, pr));
    }));
    this.on("GET", P + "vaults/{v}", A((_r, p, pr) => json(200, this.vaultJson(p.v, pr))));
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

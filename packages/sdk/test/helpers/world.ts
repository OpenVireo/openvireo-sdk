/**
 * A ready-made hosted setup for service-account tests (SDK, CLI, connect, GitHub Action): the in-memory
 * auth and sync servers, the sync server enforcing vault roles like the JWT routes do (no access → 403,
 * a PUT with `read` → 403), alice with an org vault "Team Infra", and two SA tokens (read and write).
 */
import { Account } from "../../src/account.js";
import { MemoryStorage } from "../../src/auth/storage.js";
import { FakeAuthServer, ISSUER } from "./auth-server.js";
import { FakeSyncServer } from "./sync-server.js";
import { json } from "./mock-fetch.js";
import { addEntry } from "./dbs.js";

export interface World {
  auth: FakeAuthServer;
  sync: FakeSyncServer;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  alice: Account;
  password: string;
  secretKey: string;
  vaultId: string;
  otherVaultId: string;
  readToken: string;
  writeToken: string;
}

export async function makeWorld(): Promise<World> {
  const auth = new FakeAuthServer();
  const sync = new FakeSyncServer();
  auth.onToken = (t) => sync.tokens.add(t);
  const syncFetch = async (url: string, init: RequestInit = {}) => {
    const m = /\/api\/v1\/vaults\/([^/]+)/.exec(new URL(url).pathname);
    const principal = auth.tokens.get(new Headers(init.headers).get("authorization")?.replace(/^Bearer /, "") ?? "");
    if (m && principal) {
      const role = auth.vaults.get(m[1]!)?.access.get(principal)?.role;
      if (!role) return json(403, { error: "no access to this vault", code: "forbidden" });
      if ((init.method === "PUT" || init.method === "DELETE") && role === "read") return json(403, { error: "read-only access", code: "forbidden" });
    }
    return sync.fetch(url, init);
  };
  const fetch = (url: string, init?: RequestInit) => (new URL(url).host === "sync.example" ? syncFetch(url, init) : auth.fetch(url, init));

  const password = "correct horse ü";
  const alice = await Account.connect({ issuer: ISSUER, fetch, storage: new MemoryStorage(), device: { name: "test", platform: "web" } });
  const { secretKey } = await alice.register({ email: "alice@example.com", password, kdf: { m: 19456, t: 2 } });
  const org = await alice.auth.createOrg("Acme");
  const vault = await alice.createVault("Team Infra", { orgId: org.id });
  const db = vault.db!;
  addEntry(db, "GitHub", { UserName: "ci", Password: "s3cret", URL: "https://github.com" }, 1000);
  const deploy = db.createGroup(db.getDefaultGroup(), "Deploy");
  addEntry(db, "Database", { UserName: "app", Password: "pg-pa$$word", Notes: "multi\nline" }, 1000, deploy);
  await vault.sync();
  const other = await alice.createVault("Private", { orgId: org.id });
  addEntry(other.db!, "Bank", { Password: "nope" }, 1000);
  await other.sync();

  const read = await alice.createServiceAccount(org.id, { name: "ci-read", vaults: [{ id: vault.id, role: "read" }] });
  const write = await alice.createServiceAccount(org.id, { name: "ci-write", vaults: [{ id: vault.id, role: "write" }] });
  return { auth, sync, fetch, alice, password, secretKey, vaultId: vault.id, otherVaultId: other.id, readToken: read.token, writeToken: write.token };
}

/**
 * Simulates another client editing the vault right after a GET (forces a 412 on the PUT that follows).
 * `skipGets`: GETs of the vault to let through first (a client that downloads, then syncs).
 */
export async function editBetweenGetAndPut(w: World, title: string, fields: Record<string, string>, opts: { skipGets?: number } = {}) {
  const { openWithKeyVersions, saveKdbx, kdbxweb } = await import("../../src/vault/kdbx.js");
  const { fieldText } = await import("../../src/vault/entries.js");
  const vault = await w.alice.openVault(w.vaultId);
  let done = false;
  let skip = opts.skipGets ?? 0;
  w.sync.afterGet = async (key) => {
    if (done || key !== `vaults/${w.vaultId}` || skip-- > 0) return;
    done = true;
    const cur = w.sync.blobs.get(key)!.at(-1)!.data;
    const keys = [{ version: vault.info.currentKeyVersion, key: (vault as any).keys()[0].key }];
    const { db } = await openWithKeyVersions(cur, keys);
    const find = (g: any): any => g.entries.find((e: any) => fieldText(e.fields.get("Title")) === title) ?? g.groups.map(find).find(Boolean);
    const e = find(db.getDefaultGroup());
    e.pushHistory();
    for (const [k, v] of Object.entries(fields)) e.fields.set(k, k === "Password" ? kdbxweb.ProtectedValue.fromString(v) : v);
    e.times.update();
    w.sync.store(key, await saveKdbx(db));
  };
  return {
    get fired() {
      return done;
    },
  };
}

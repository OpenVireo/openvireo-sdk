# @openvireo/sdk

TypeScript SDK for OpenVireo accounts, vault sync and sharing (**ov v1**, see
`openvireo/docs/plans/accounts/SPEC.md`). It runs in browsers, Node ≥ 20 and Bun (also when compiled
into a single binary). The server only ever receives OPAQUE messages, encrypted `.kdbx` blobs, wrapped
keysets and sealed keys.

| Subpath | What it contains |
|---|---|
| `@openvireo/sdk` | everything below, plus `Account`, `ServiceAccount`, `SelfHostedSync` |
| `@openvireo/sdk/crypto` | Secret Key, AUK (Argon2id), wrap/seal, keysets, fingerprints, vault names, SA/refresh tokens, JWT verify, restore proof/reseal |
| `@openvireo/sdk/opaque` | OPAQUE client (opaque-ke compiled to WASM, lazy-loaded) |
| `@openvireo/sdk/auth` | `AuthClient` (all of `openapi.yaml`), discovery, `TokenManager`, storage adapters |
| `@openvireo/sdk/storage/node` | `FileStorage` (0600 JSON file) for the CLI and connect |
| `@openvireo/sdk/sync` | `SyncClient` (vault + legacy routes), `syncKdbx` merge/retry loop, SSE `subscribeEvents` |
| `@openvireo/sdk/vault` | kdbxweb open/save, vault-key credentials, rotation helpers, entry helpers, `ov://` references |
| `@openvireo/sdk/merge` | the sync merge: three-way field merge against the base copy, then the structure merge (`docs/merge-behaviour.md`), matching the Qt client |
| `@openvireo/sdk/testing` | in-memory auth and sync servers (`FakeAuthServer`, `FakeSyncServer`) for app tests; not for production |

## Hosted account

```ts
import { Account, browserStorage } from "@openvireo/sdk";

const account = await Account.connect({
  issuer: "https://accounts.openvireo.com",       // discovery: /.well-known/openvireo-configuration
  device: { name: "Firefox on Linux", platform: "web" },
  storage: browserStorage(),                        // IndexedDB + non-extractable AES-GCM key
});

// Sign up: show the Secret Key once (Emergency Kit)
const { secretKey } = await account.register({ email, password });

// Sign in (the Secret Key is needed once per device, then kept as a trusted device)
await account.login({ email, password, secretKey, totp: () => askForCode() });

// Next launch: the stored session is signed in but locked
if (account.signedIn && !account.unlocked) await account.unlock(password);

const vaults = await account.listVaults();          // names decrypted locally
const vault = await account.openVault(vaults[0].id); // downloads + decrypts (newest key first)
vault.read("ov://Team/GitHub/password");
await vault.write("ov://Team/GitHub/password", "new value"); // conditional PUT, merge + retry on 412

const team = await account.createVault("Team Infra", { orgId });
const { fingerprint } = await account.share(team.id, { email: "bob@example.com" }, "write");
await account.revoke(team.id, ["user:<bob uuid>"]); // removes and rotates the vault key (SPEC §7)

const live = account.subscribe({
  onVaultChanged: (e) => vault.sync(),          // another device uploaded
  onVaultsChanged: (list) => render(list),      // access changed: JWT refreshed, list reloaded, stream reconnected
});

// "Move to account": a re-keyed copy of an open local or self-hosted database becomes a new vault
// (uploaded with If-None-Match: *); the original is not changed. A VaultUploadError carries the
// created vault when only the upload failed (vault.sync() retries it).
const moved = await account.importVault(localDb, { name: "Home", orgId });

account.lock();     // wipes keys from memory
await account.logout(); // also drops the offline cache
```

### Account recovery (SPEC §18)

After an approved reset the user opens `{web}/?view=recover#token=ov_rc_…`. Errors are
`OpenVireoError`s: `recovery_not_ready` (409, `err.details.notBefore`), `recovery_cancelled` (410),
`session_expired` (410, used or expired), and on restore `restore_locked` (403), `invalid_proof` (400),
`unauthorized` (401, wrong old password) and `invalid_secret_key` (local: the old Secret Key doesn't
open the archived keys; nothing was restored).

```ts
const info = await account.recoverInfo(token);   // { email, notBefore, expiresAt, archiveDays, archives: { personalVaults, sharedGrants, soleAdminOrgs } }
const { secretKey } = await account.recover({ token, password }); // new keys; signed in + unlocked; show the new Emergency Kit

// Later, within 30 days, with the old Emergency Kit (needs the account unlocked)
const status = await account.recoveryStatus();  // { archived, expiresAt?, vaults?, locked? }
const { restored } = await account.restoreFromArchive({ oldPassword, oldSecretKey }); // vault list reloaded
```

`FakeAuthServer` (`@openvireo/sdk/testing`) serves these routes too: `approveReset(email, { delaySeconds })`
returns the token, and `cancelReset(token)` cancels it.

### Offline

With `offline: true`, `connect`, `unlock`, `listVaults` and `openVault` fall back to what this device
kept when a server can't be reached (`isUnreachable(e)`: no network, or 502/503/504), and
`account.offline` / `vault.offline` turn true. The cache lives in `storage` and holds only what the
servers store too: the discovery document, the wrapped keyset and KDF params, GET /vaults as returned
(encrypted names, sealed keys), the sync state (its base copy is the server's encrypted .kdbx), and
local edits not yet uploaded as a .kdbx encrypted with the vault key (`sync:<vault id>:pending`).
Unlocking offline still needs the master password and the Secret Key (kept on trusted devices).

```ts
const account = await Account.connect({ issuer, device, storage: browserStorage(), offline: true });
await account.unlock(password);              // works offline from the cached wrapped keyset
const vault = await account.openVault(id);   // offline: the local copy; `not_available_offline` if never synced here
await vault.sync().catch(() => {});          // offline: the edit is kept (pending) and merges in later
const { vaults, dropped } = await account.reconnect(); // back online; revoked vaults are forgotten
```

## Service accounts (CLI, connect, GitHub Action)

```ts
import { Account, ServiceAccount } from "@openvireo/sdk";

// An org owner/admin creates it; the token is shown once
const { token } = await account.createServiceAccount(orgId, { name: "ci", vaults: [{ id: vaultId, role: "read" }] });

// In CI: OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_…
const sa = await ServiceAccount.fromToken(process.env.OPENVIREO_SERVICE_ACCOUNT_TOKEN!);
await sa.read("ov://Team Infra/GitHub deploy key/password");
const { text, secrets } = await sa.inject("TOKEN=ov://Team%20Infra/CI/token\n"); // mask `secrets` in logs
await sa.write("ov://Team Infra/CI/token", rotated);                            // needs the write role
sa.close();
```

References are `ov://<vault id or name>/[<group>/…]<entry uuid or title>/<field>`, percent-encoded.

For long-running processes and whole entries (used by `ov connect` and `ov item`):

```ts
import { ServiceAccount, findEntry, itemOf, listItems, parseItemReference, setItemFields } from "@openvireo/sdk";

const db = await sa.pull("Team Infra");             // HEAD with the last ETag; downloads only if changed
listItems(db);                                      // [{id, title, group, fields: {}, protected, …}] without values
itemOf(findEntry(db, parseItemReference("ov://Team%20Infra/Deploy/Database")), { reveal: true });

// any change, then the conditional PUT with merge/retry; one edit per vault at a time, and a failed
// upload drops the cached copy. A `read` grant throws OpenVireoError("forbidden") before anything is sent.
await sa.edit("Team Infra", (db) => setItemFields(db, { groupPath: ["Apps"], entry: "Api" }, { username: "svc", token }, { create: true }));
```

## Self-hosted sync server (no account)

```ts
import { SelfHostedSync, decryptKdbx, passwordCredentials } from "@openvireo/sdk";

const server = await SelfHostedSync.pair("https://sync.example.org", "ABCD-EFGH", "Web", { storage });
const { dbInstance } = await decryptKdbx(fileBytes, password);
const result = await server.syncDatabase("personal", { db: dbInstance, credentials: passwordCredentials(password) });
// result.db is the merged copy; result.state (ETag, revision, snapshot, base copy) is persisted in storage
server.events({ onEvent: (e) => e.type === "database" && resync(e.id) });
```

## Lower level

- `syncKdbx({ blob, db, credentials, state })` is SyncEngine's loop: HEAD when nothing changed, GET,
  rollback checks (revision and `KPXC_SYNC_GENERATION`), three-way merge against the base copy,
  `If-Match` PUT, and on 412 download-merge-retry (5 attempts). Persist `result.state`
  (`serializeSyncState`) next to the file: the web app keeps it in IndexedDB with the cached database.
- `mergeDatabases(local, remote, base)` matches the Qt merge on the shared fixtures
  (`test/fixtures/merge-fixtures`). Like Qt, deletions are not applied in the default mode
  (`mode: "synchronize"` applies them).
- Argon2 defaults to hash-wasm. At m = 64 MiB, t = 3 it took ~104 ms against ~608 ms for
  `@noble/hashes` (Node 24 and Bun 1.3, M-series Mac). `setArgon2Impl(nobleArgon2)` switches to
  pure JS, and kdbxweb uses the same implementation (`initKdbx()`).
- The web app's `keepass-crypto.ts` helpers (`decryptKdbx`, `collectAllDbData`, `addEntryToDb`, …) are
  in `@openvireo/sdk/vault` with the same names and shapes. `editEntryInDb` now pushes history first.

## OPAQUE module

OPAQUE runs in a small WASM module (~118 KB, no imports) built from `opaque-wasm/` with opaque-ke 4.0.1.
It uses the same suite as the libopaque server and the Qt client (ristretto255, SHA-512, Argon2id at
libsodium's interactive setting), so records and logins work across all three. Rebuild it with
`opaque-wasm/build.sh` (needs Rust; the toolchain is pinned) and see `vendor/opaque/SOURCE.md` for the
checksums. Bundlers need nothing special: `vendor/opaque/opaque-wasm.js` is a plain ES module.

## Development

```sh
npm install
npm run typecheck -w @openvireo/sdk      # tsc --noEmit
npm test -w @openvireo/sdk               # vitest
npm run build -w @openvireo/sdk && npm run smoke -w @openvireo/sdk   # dist/ in Node and Bun
# OPAQUE against libopaque's C core (Python binding), see opaque-spike/README.md:
OPENVIREO_OPAQUE_PYTHON=…/venv/bin/python3 OPENVIREO_OPAQUE_PYBINDING=…/libopaque/python LIBOPAQUE=…/libopaque.dylib npm test -w @openvireo/sdk
```

License: MIT OR Apache-2.0, at your option (`LICENSE-MIT`, `LICENSE-APACHE`).

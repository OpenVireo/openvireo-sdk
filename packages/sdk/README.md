# @kpnx/sdk

TypeScript SDK for KeePassXC accounts, vault sync and sharing (**kpx v1**, see
`keepassxc/docs/plans/accounts/SPEC.md`). It runs in browsers, Node ≥ 20 and Bun (also when compiled
into a single binary). The server only ever receives OPAQUE messages, encrypted `.kdbx` blobs, wrapped
keysets and sealed keys.

| Subpath | What it contains |
|---|---|
| `@kpnx/sdk` | everything below, plus `Account`, `ServiceAccount`, `SelfHostedSync` |
| `@kpnx/sdk/crypto` | Secret Key, AUK (Argon2id), wrap/seal, keysets, fingerprints, vault names, SA/refresh tokens, JWT verify |
| `@kpnx/sdk/opaque` | OPAQUE client over the vendored libopaque WASM build (lazy-loaded) |
| `@kpnx/sdk/auth` | `AuthClient` (all of `openapi.yaml`), discovery, `TokenManager`, storage adapters |
| `@kpnx/sdk/storage/node` | `FileStorage` (0600 JSON file) for the CLI and connect |
| `@kpnx/sdk/sync` | `SyncClient` (vault + legacy routes), `syncKdbx` merge/retry loop, SSE `subscribeEvents` |
| `@kpnx/sdk/vault` | kdbxweb open/save, vault-key credentials, rotation helpers, entry helpers, `kpx://` references |
| `@kpnx/sdk/merge` | port of KeePassXC's three-way merge (`SyncEngine::mergeDatabases` + `Merger`) |

## Hosted account

```ts
import { Account, browserStorage } from "@kpnx/sdk";

const account = await Account.connect({
  issuer: "https://accounts.keepassxc.org",       // discovery: /.well-known/kpx-configuration
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
vault.read("kpx://Team/GitHub/password");
await vault.write("kpx://Team/GitHub/password", "new value"); // conditional PUT, merge + retry on 412

const team = await account.createVault("Team Infra", { orgId });
const { fingerprint } = await account.share(team.id, { email: "bob@example.com" }, "write");
await account.revoke(team.id, ["user:<bob uuid>"]); // removes and rotates the vault key (SPEC §7)

const live = account.subscribe({
  onVaultChanged: (e) => vault.sync(),          // another device uploaded
  onVaultsChanged: (list) => render(list),      // access changed: JWT refreshed, list reloaded, stream reconnected
});

account.lock();     // wipes keys from memory
await account.logout();
```

## Service accounts (CLI, connect, GitHub Action)

```ts
import { Account, ServiceAccount } from "@kpnx/sdk";

// An org owner/admin creates it; the token is shown once
const { token } = await account.createServiceAccount(orgId, { name: "ci", vaults: [{ id: vaultId, role: "read" }] });

// In CI: KPX_SERVICE_ACCOUNT_TOKEN=kpx_sa_…
const sa = await ServiceAccount.fromToken(process.env.KPX_SERVICE_ACCOUNT_TOKEN!);
await sa.read("kpx://Team Infra/GitHub deploy key/password");
const { text, secrets } = await sa.inject("TOKEN=kpx://Team%20Infra/CI/token\n"); // mask `secrets` in logs
await sa.write("kpx://Team Infra/CI/token", rotated);                            // needs the write role
sa.close();
```

References are `kpx://<vault id or name>/[<group>/…]<entry uuid or title>/<field>`, percent-encoded.

## Self-hosted sync server (no account)

```ts
import { SelfHostedSync, decryptKdbx, passwordCredentials } from "@kpnx/sdk";

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
  in `@kpnx/sdk/vault` with the same names and shapes. `editEntryInDb` now pushes history first.

## OPAQUE build: read before shipping

`vendor/libopaque/libopaque.cjs` is libopaque `js/dist/libopaque.js` at 6e9ac92, as the contract
requires. That build has **`-DTRACE -DNORANDOM`**: the client's login nonce and ephemeral key and
the registration envelope nonce are constant. The SDK silences the trace output, works around the
wrapper's non-ASCII password bug, and warns once (`setOpaqueBuildPolicy("refuse")` blocks it). It
must be replaced by a release build before production. See `vendor/libopaque/SOURCE.md`.

Bundlers: the module is plain CommonJS with the WASM inlined. Webpack may need
`resolve.fallback = { crypto: false }` for its unused Node branch.

## Development

```sh
npm install
npm run typecheck -w @kpnx/sdk      # tsc --noEmit
npm test -w @kpnx/sdk               # vitest
npm run build -w @kpnx/sdk && npm run smoke -w @kpnx/sdk   # dist/ in Node and Bun
# OPAQUE against the C core (Python binding), see opaque-spike/README.md:
KPX_OPAQUE_PYTHON=…/venv/bin/python3 KPX_OPAQUE_PYBINDING=…/libopaque/python LIBOPAQUE=…/libopaque.dylib npm test -w @kpnx/sdk
```

License: GPL-3.0-or-later (it bundles the GPL-3.0 libopaque JS build).

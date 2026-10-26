# @openvireo/sdk

TypeScript SDK for OpenVireo accounts, vault sync and sharing. It runs in browsers, Node ≥ 20 and Bun
(also when compiled into a single binary). Everything is end-to-end encrypted on the client: the servers
only ever receive OPAQUE messages, encrypted `.kdbx` files, wrapped keysets and sealed keys.

```ts
import { Account, browserStorage } from "@openvireo/sdk";

const account = await Account.connect({
  issuer: "https://accounts.openvireo.com",
  device: { name: "Firefox on Linux", platform: "web" },
  storage: browserStorage(),
});
await account.login({ email, password, secretKey });

const vaults = await account.listVaults();           // names decrypted locally
const vault = await account.openVault(vaults[0]!.id);
vault.read("ov://Team/GitHub/password");
await vault.write("ov://Team/GitHub/password", "new value"); // conditional upload, merge and retry
```

For CI and servers, `ServiceAccount.fromToken(process.env.OPENVIREO_SERVICE_ACCOUNT_TOKEN)` does the same
without a password. Without an account, `SelfHostedSync` syncs `.kdbx` files with a self-hosted
OpenVireo Sync Server.

## Documentation

In [`docs/`](../../docs/index.md) at the repository root, and on
[openvireo.com/docs/sdk](https://openvireo.com/docs/sdk/):

- Guides: [hosted accounts](../../docs/guides/hosted-account.md),
  [vaults and sharing](../../docs/guides/vaults-and-sharing.md), [live updates](../../docs/guides/events.md),
  [offline](../../docs/guides/offline.md), [moving a database to an account](../../docs/guides/move-to-account.md),
  [account recovery](../../docs/guides/recovery.md), [service accounts](../../docs/guides/service-accounts.md),
  [self-hosted sync servers](../../docs/guides/self-hosted-sync.md), [testing](../../docs/guides/testing.md)
- Reference: [concepts](../../docs/concepts.md), [errors](../../docs/errors.md),
  [merge behaviour](../../docs/merge-behaviour.md), [lower-level APIs](../../docs/lower-level.md), and the
  [API reference](https://openvireo.com/docs/sdk/api/) (`npm run docs:api` at the repository root builds it)

The protocol is specified in OpenVireo's
[SPEC.md](https://github.com/openvireo/openvireo/blob/develop/docs/plans/accounts/SPEC.md) (ov v1).

## Subpaths

| Subpath | What it contains |
|---|---|
| `@openvireo/sdk` | everything below, plus `Account`, `ServiceAccount`, `SelfHostedSync` |
| `@openvireo/sdk/crypto` | Secret Key, AUK (Argon2id), wrap/seal, keysets, fingerprints, vault names, SA/refresh tokens, JWT verify |
| `@openvireo/sdk/opaque` | OPAQUE client (opaque-ke compiled to WASM, lazy-loaded) |
| `@openvireo/sdk/auth` | `AuthClient` (all of `openapi.yaml`), discovery, `TokenManager`, storage adapters |
| `@openvireo/sdk/storage/node` | `FileStorage` (0600 JSON file) for the CLI and connect |
| `@openvireo/sdk/sync` | `SyncClient` (vault + legacy routes), `syncKdbx` merge/retry loop, SSE `subscribeEvents` |
| `@openvireo/sdk/vault` | kdbxweb open/save, vault-key credentials, rotation helpers, entry helpers, `ov://` references |
| `@openvireo/sdk/merge` | the sync merge, matching the Qt client |
| `@openvireo/sdk/testing` | in-memory auth and sync servers (`FakeAuthServer`, `FakeSyncServer`) for app tests; not for production |

## OPAQUE module

OPAQUE runs in a small WASM module (~118 KB, no imports) built from `opaque-wasm/` with opaque-ke 4.0.1.
Rebuild it with `opaque-wasm/build.sh` (needs Rust; the toolchain is pinned) and see `vendor/opaque/SOURCE.md`
for the checksums.

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

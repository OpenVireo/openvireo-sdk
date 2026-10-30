# OpenVireo SDK

TypeScript code for building on OpenVireo: sign in to an account, open and edit vaults, share them, run
service accounts in CI, or sync with a self-hosted sync server. It is the same code the OpenVireo web app,
the `ov` CLI, `ov connect` and the GitHub Action run, and it interoperates with the desktop app: the same
crypto, the same OPAQUE suite, the same merge.

Everything is end-to-end encrypted on the client. The servers only ever receive OPAQUE messages,
encrypted `.kdbx` files, wrapped keysets and sealed keys; see [Concepts](concepts.md).

## Packages

| Package | What it is |
|---|---|
| `@openvireo/sdk` | The library: accounts, vaults, sharing, sync, merge, service accounts |
| `@openvireo/cli` | `ov`: read, inject and rotate secrets from scripts and CI. See [CLI](cli.md) |
| `@openvireo/connect` | `ov connect`: a REST server for one service account, with Kubernetes manifests. See [Connect](connect.md) |
| GitHub Action | Loads secrets into a workflow and masks them. See [GitHub Action](github-action.md) |

The SDK runs in browsers, Node ≥ 20 and Bun (also compiled into a single binary). It's ESM only.

## Install

Releases are published to GitHub Packages. Installing from there needs a GitHub token with `read:packages`,
even though the packages are public:

```sh
echo "@openvireo:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}" >> .npmrc
npm install @openvireo/sdk
```

The `ov` CLI and the `openvireo-connect` server are command-line programs: download them as signed single
binaries from the [releases](https://github.com/OpenVireo/openvireo-sdk/releases) (no Node needed); see
[CLI](cli.md#install) and [Connect](connect.md#install).

## A first program

<!-- prelude
declare const email: string, password: string, secretKey: string;
-->
```ts
import { Account, MemoryStorage } from "@openvireo/sdk";

const account = await Account.connect({
  issuer: "https://accounts.openvireo.com",
  device: { name: "My script", platform: "cli" },
  storage: new MemoryStorage(),
});
await account.login({ email, password, secretKey });

for (const info of await account.listVaults()) {
  console.log(info.name, info.role);
}
const vault = await account.openVault((await account.listVaults())[0]!.id);
console.log(vault.read("ov://Personal/GitHub/username"));
await account.logout();
```

For automation, prefer a [service account](guides/service-accounts.md): it needs no password and can be
limited to a few vaults.

## Guides

- [Hosted accounts](guides/hosted-account.md): sign up, sign in, unlock, lock, devices, storage
- [Vaults and sharing](guides/vaults-and-sharing.md): open, read, write, create, share, revoke, organisations
- [Live updates](guides/events.md): react to changes from other devices and to access changes
- [Offline](guides/offline.md): keep working without the network
- [Moving a database to an account](guides/move-to-account.md)
- [Account recovery](guides/recovery.md): resets and restoring the old vaults
- [Service accounts](guides/service-accounts.md): CI, servers and long-running processes
- [Self-hosted sync servers](guides/self-hosted-sync.md): no account, just a sync server
- [Testing your app](guides/testing.md): the in-memory servers

## Reference

- [Concepts](concepts.md): keys, vaults, roles, references, what the servers see
- [Errors](errors.md): every error code and what to do about it
- [Merge behaviour](merge-behaviour.md): how concurrent edits are combined
- [Lower-level APIs](lower-level.md): the sync loop, HTTP clients, KDBX helpers, Argon2, OPAQUE
- [API reference](https://openvireo.com/docs/sdk/api/): every export, generated from the source
  (`npm run docs:api` builds it locally)

## Subpath imports

Everything is exported from `@openvireo/sdk`. Smaller entry points keep bundles small:

| Subpath | What it contains |
|---|---|
| `@openvireo/sdk/crypto` | Secret Key, AUK (Argon2id), wrap/seal, keysets, fingerprints, vault names, SA and refresh tokens, JWT verification |
| `@openvireo/sdk/opaque` | The OPAQUE client (opaque-ke compiled to WASM, lazy-loaded) |
| `@openvireo/sdk/auth` | `AuthClient` (every account server route), discovery, `TokenManager`, storage adapters |
| `@openvireo/sdk/storage/node` | `FileStorage` (a 0600 JSON file) |
| `@openvireo/sdk/sync` | `SyncClient`, the `syncKdbx` merge and retry loop, `subscribeEvents` |
| `@openvireo/sdk/vault` | kdbxweb open and save, vault-key credentials, entry helpers, `ov://` references |
| `@openvireo/sdk/merge` | The sync merge, matching the desktop app |
| `@openvireo/sdk/testing` | In-memory auth and sync servers for tests (not for production) |

## License

MIT OR Apache-2.0, at your option.

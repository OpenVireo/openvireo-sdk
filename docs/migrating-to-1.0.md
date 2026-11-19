# Migrating to 1.0

`@openvireo/sdk` 1.0 runs on the shared Rust core (`@openvireo/core-wasm`), the same code the iOS and desktop
apps use. Crypto, OPAQUE, the session and tokens, the keyring, sync, KDBX and merge all happen in the core.
The SDK is now a TypeScript layer over it.

Most of the account API is the same. What changed is everything that used to hand you a
[kdbxweb](https://github.com/keeweb/kdbxweb) object: vaults are now the core's `Vault` handle (to edit) or
`Kdbx` handle (to merge and re-key). kdbxweb, hash-wasm and `@noble/*` are no longer dependencies.

## Loading

The core loads synchronously the first time a function needs it. In Node, Bun and workers you don't need to
do anything. In a browser, call `await ready()` once at startup, so the full module (about 880 KB gzip)
compiles before the first synchronous call:

<!-- no-check -->
```ts
import { ready } from "@openvireo/sdk";
await ready();
```

`@openvireo/sdk/share` uses only the lite module (about 190 KB gzip), so a public share page doesn't load the
rest.

## Accounts

| 0.x | 1.0 |
|---|---|
| `account.auth` (an `AuthClient` with its own tokens) | `account.auth` is still an `AuthClient`, but it borrows the core's access token |
| `account.sync` (`SyncClient`) | gone: the core syncs. To call the sync server yourself, make a `SyncClient` with `account.auth`'s token |
| `account.tokens` (`TokenManager`), `tokens.current` | gone: `account.signedIn`, `account.userId`, `account.email`; `account.core.accessToken(false)` gives the token |
| `alice.auth.createOrg`, `listMembers`, `listDevices`, … | still on `account.auth` (snake_case JSON), or `account.core.createOrg`, `orgMembers`, `devices`, … (camelCase records) |
| `confirmMember(orgId, member)` with `auth.listMembers` members | pass members from `account.core.orgMembers(orgId)` (`userId`, `publicKeys`). The core fetches and checks the keys itself |
| `account.me()` | the core's `Profile` (camelCase). `planOf(profile.plan)` turns its plan into the 0.x `Plan` shape |
| `sealUnlocked` output `s1.…` | now `s2.…`. Seals made by 0.x don't open, so after the upgrade, unlock once with the password |
| `importVault(source: Kdbx, …)` | `importVault(source: Vault, …)` |
| `subscribe({ onVaultChanged })` gets `{ type: "vault", id, etag }` | gets `{ kind: "vaultChanged", vaultId, etag, revision, deleted }` |
| `loadState`, `saveState`, `loadPending`, `savePending`, `deletePending`, `keepsOfflineData` | gone: the offline cache belongs to the core |

`listVaults`, `reconnect`, `listShares`, `recoverInfo`, `recoveryStatus` and `deletionPreview` return the
same shapes as before. Two differences: `recoveryStatus().locked` only appears when it's `true`, and wrong-key
errors are `vault_key_mismatch` as before.

**Storage.** `storage` keeps the same key names (`ov:session`, `secret_key:<server>:<email>`, `device:…`,
`ov:parked_session:…`), so signed-in sessions and trusted-device Secret Keys carry over. The offline cache
uses a new format. Edits that a 0.x device made offline and never uploaded are **not** carried over, so let
each device sync before upgrading. After the upgrade, vaults download again the first time they're opened.

**One live session per storage.** The core keeps the session in memory. Two `Account` instances on the
same storage in one process can't both refresh tokens (the server sees a reused refresh token and ends the
session). Use one instance per storage, and connect a new one only after a reload.

## Account vaults

<!-- prelude
import type { AccountVault } from "@openvireo/sdk";
declare const vault: AccountVault;
-->
```ts
import { addEntryToDb, setItemFields } from "@openvireo/sdk";

// 0.x: addEntryToDb(vault.db!, vault.db!.getDefaultGroup().uuid.toString(), …)
addEntryToDb(vault.vault, vault.vault.rootGroupId(), { title: "Db", username: "app", passwordValue: "s3cret", url: "", notes: "", tags: [] });
setItemFields(vault.vault, { groupPath: ["Apps"], entry: "Api" }, { token: "…" }, { create: true });
const report = await vault.sync();   // 0.x SyncResult → the core's SyncReport (outcome, conflicts, changes, clockOffsetMs)
```

- `vault.db` (kdbxweb) is now `vault.vault`, the core's `Vault`.
- `vault.sync({ rekeyTo })` is gone: `account.rotate` re-keys.
- `vault.sync({ acceptServerState: true })` continues after `server_rolled_back` or `server_lost_database`.
- `vault.info` has the same shape. `vault.etag` and `vault.offline` are unchanged, and `vault.readOnly` is new.

## Local databases (`@openvireo/sdk/vault`)

| 0.x (kdbxweb) | 1.0 |
|---|---|
| `Kdbx` = kdbxweb's database | `Vault` (core handle) to edit; `Kdbx` (core handle) to merge, re-key, snapshot |
| `openKdbx(bytes, credentials)` → kdbxweb `Kdbx` (async) | `openLocalVault(bytes, credentials)` → `Vault`; `openKdbx(bytes, key)` → `Kdbx` (sync) |
| `kdbxweb.Kdbx.create(...)`, `createNewKdbx(name, pw)` | `createLocalVault(name, credentials)`, `createNewKdbx(name, pw)` (returns `vault`, not `dbInstance`) |
| `saveKdbx(db)` (async) | `vault.saveLocal()`; `saveKdbx(kdbx)` (sync) for a `Kdbx` |
| `decryptKdbx(...).dbInstance` | `decryptKdbx(...).vault` |
| `CredentialsFactory` (`passwordCredentials(pw)()`) | plain `{ password?, keyFile? }` bytes; `passwordCredentials(pw)` returns it directly |
| `passwordHashCredentials(hash)` | returns a `KdbxKey` for `openKdbx(bytes, key)`. `openLocalVault` can't take a hash yet |
| `addEntryToDb(db, groupUuid, data)` → `KdbxEntry` | `addEntryToDb(vault, groupId, data)` → the new entry's id |
| `editEntryInDb`, `deleteEntryFromDb`, `createGroupInDb`, … (async, kdbxweb objects) | same names, synchronous, on a `Vault`, ids instead of objects |
| `findEntryInKdbx`, `findGroupInKdbx`, `getUuidString`, `fieldText(value)` | `vault.entry(id)`, `vault.groups()`; ids are hex; `fieldText(entryRecord, name)` |
| `findEntry(db, ref)` → `KdbxEntry` | `findEntry(vault, ref)` → `EntryRecord` |
| `readField`, `writeField`, `setItemFields`, `itemOf`, `listItems` on kdbxweb | the same on a `Vault` / `EntryRecord` |
| `exportSelectedGroupsToKdbx(db, ids, pw)` → `ArrayBuffer` | `exportSelectedGroupsToKdbx(vault, ids, pw, kdf?)` → `Uint8Array` |
| `rekeyToVaultKey(db, key)`, `copyKdbx`, `syncGeneration(db)`, `dropServerRemotes(db)`, `applyVaultKdf(db)` | methods on `Kdbx`: `rekeyToVaultKey`, `clone`, `syncGeneration`, `dropServerRemotes`, `applyVaultKdf` |
| `kdfSettings(db)` | `kdfSettings(bytes)` (reads the outer header) or `kdbx.kdfSettings()` |
| `initKdbx`, `kdbxweb` | gone |

Entry and group ids are the core's: 32 lowercase hex digits. kdbxweb used base64 ids, so if you stored ids,
convert them (`base64 → bytes → hex`).

## Merge (`@openvireo/sdk/merge`)

<!-- prelude
declare const localBytes: Uint8Array, remoteBytes: Uint8Array, baseBytes: Uint8Array, vaultKey: Uint8Array;
-->
```ts
import { kdbxMerge, mergeDatabases } from "@openvireo/sdk/merge";
import { openKdbx } from "@openvireo/sdk/vault";

const local = openKdbx(localBytes, { vaultKey });
const report = mergeDatabases(local, openKdbx(remoteBytes, { vaultKey }), openKdbx(baseBytes, { vaultKey }));
report.conflicts;   // 0.x: a Map of uuid → fields; now [{ uuid, title, fields }]
// or on bytes:
const merged = kdbxMerge(localBytes, remoteBytes, baseBytes, { vaultKey });
```

- `mergeDatabases` is synchronous and returns `{ conflicts, added, updated, deleted, changes, localChanged, remoteChanged }`.
- `mergeInto(source, target, mode)` (KeePassXC's Database > Merge), `snapshotOf`, `needsCommonBase`,
  `findConflicts` and `hasPendingDeletions` take `Kdbx` handles.
- `importInto(source, target)` and `importAsCopies(source, target, parentId)` take `Vault`s. Their summary
  is the same.
- `fieldsOf`, `applyField`, `resolveFields`, `conflictingFields`, `combineEntries`, `sameFields`,
  `binaryBytes`, `findEntryByUuid`, `entrySeconds` are gone. They worked on kdbxweb entries, and the core does
  all of that inside the merge.

## Sync (`@openvireo/sdk/sync`)

- `syncKdbx`, `SyncState`, `serializeSyncState`, `deserializeSyncState` are gone. Use `vault.sync()`,
  `SelfHostedSync.syncDatabase`, or `account.core.syncVaultKdbx(vaultId, bytes, base)` for an account vault
  you hold as a file.
- `SyncResult` is now the core's `SyncReport`. `isClockSkewed` and `CLOCK_SKEW_WARNING_MS` are unchanged.
- `SyncClient`, `SseParser` and `subscribeEvents` are unchanged, for calling the sync server yourself.

## Self-hosted (`SelfHostedSync`)

<!-- prelude
import type { SelfHostedSync } from "@openvireo/sdk";
declare const server: SelfHostedSync, bytes: Uint8Array;
-->
```ts
import { passwordCredentials } from "@openvireo/sdk";

// 0.x: server.syncDatabase("home", { db, credentials: passwordCredentials(pw) }) → { db, state, … }
const { kdbx, report } = await server.syncDatabase("home", bytes, passwordCredentials("pw"));
```

- `new SelfHostedSync(url, token)` is now `SelfHostedSync.connect(url, token, opts)`.
- `deviceToken` and `client` are gone. `serverUrl` is a getter, and `history` and `openVersion` are new.
- `events({ onEvent })` is now `events(onEvent, onError?)` with the core's event records.

## Service accounts

`ServiceAccount.fromToken`, `read`, `inject`, `write` and `listVaults` are unchanged. `openVault` and `pull`
return the core's `Vault`, and `edit(id, fn)` hands `fn` a `Vault`. `sa.config` and `sa.auth`/`sa.sync` are
gone: use `sa.issuer` (or `sa.core.serverConfig()`).

## Crypto, OPAQUE, share links

These signatures are unchanged and now call the core. Removed:

- `nobleArgon2` (pure-JS Argon2). `setArgon2Impl` still replaces the AUK's Argon2, and `coreArgon2` is the
  default. Share passcodes always use the core's.
- The vendored `opaque-wasm.js` module and its `@openvireo/sdk/vendor/opaque-wasm.js` export. `loadOpaque()`
  now loads the core.

Renamed: the server's vault JSON type in `@openvireo/sdk/auth` is `VaultJson` (it was `Vault`, which is now
the core handle).

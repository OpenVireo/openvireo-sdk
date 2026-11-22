# Moving a database to an account

`importVault` turns a database the user already has (a local `.kdbx`, or one synced with a self-hosted
server) into a new vault in their account. This is *Move to account* in the desktop and web apps.

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, fileBytes: Uint8Array, password: string, orgId: string;
-->
```ts tab="TypeScript"
import { VaultUploadError, decryptKdbx } from "@openvireo/sdk";

const { vault: localDb } = await decryptKdbx(fileBytes, password);
try {
  const vault = await account.importVault(localDb, { name: "Home" });   // or { name, orgId } for an org vault
} catch (e) {
  if (!(e instanceof VaultUploadError)) throw e;
  await e.vault.sync();   // the vault exists but its first upload failed: retry it later
}
```
```python tab="Python"
creds = ov.KdbxCredentials(password=password, key_file=None)
outcome = await account.import_kdbx(file_bytes, creds, ov.ImportMode.NEW_VAULT(name="Home", org_id=None))
if not outcome.uploaded:
    # the vault exists but its first upload failed (outcome.upload_error): retry it later
    await outcome.vault.sync(ov.SyncOptions(local_changed=True))
```
```kotlin tab="Kotlin"
val creds = KdbxCredentials(password = password, keyFile = null)
val outcome = account.importKdbx(fileBytes, creds, ImportMode.NewVault(name = "Home", orgId = null), CancelToken())
if (!outcome.uploaded) {
    // the vault exists but its first upload failed (outcome.uploadError): retry it later
    outcome.vault.sync(SyncOptions(localChanged = true), CancelToken())
}
```
```java tab="Java"
KdbxCredentials creds = new KdbxCredentials(password, null, null);
ImportOutcome outcome = account.importKdbx(fileBytes, creds, new ImportMode.NewVault("Home", null)).join();
if (!outcome.getUploaded()) {
    // the vault exists but its first upload failed: retry it later
    new JVault(outcome.getVault()).sync(new SyncOptions(true, false)).join();
}
```
```swift tab="Swift"
let creds = KdbxCredentials(password: password, keyFile: nil)
let outcome = try await account.importKdbx(kdbx: fileBytes, credentials: creds,
                                           mode: .newVault(name: "Home", orgId: nil), cancel: cancel)
if !outcome.uploaded {
    // the vault exists but its first upload failed (outcome.uploadError): retry it later
    _ = try await outcome.vault.sync(options: SyncOptions(localChanged: true, acceptServerState: false), cancel: cancel)
}
```
```cpp tab="C++"
ov::KdbxCredentials creds{true, std::move(password), false, {}, false, {}};
ov::ImportMode mode{ov::ImportModeKind::NewVault, "Home", "", ""};   // kind, name, org_id, vault_id
auto outcome = ov::call([&] { return account->import_kdbx(std::move(file_bytes), std::move(creds), mode, *cancel); });
// outcome.uploaded is false when the first upload failed: sync the vault again later
```

- The original database is never changed. A copy is re-keyed to a fresh vault key (the database's password
  no longer opens it) and uploaded as a new vault with `If-None-Match: *`.
- The copy's root group takes the vault name (by default, the root group's current name), and its sync server
  settings are dropped. The rest of its database custom data comes along.
- In an organisation, the vault is sealed to every confirmed owner and admin, like any new org vault.

Tell the user the old file and the new vault are now separate: edits to one don't reach the other.

## Importing into a vault you already have

To bring a `.kdbx`'s entries into an existing vault (or any open database) instead, use `importInto` or
`importAsCopies` from `@openvireo/sdk/merge` on `vault.vault` (the core `Vault`), then `sync()` as after any other change:

<!-- prelude
import type { AccountVault } from "@openvireo/sdk";
declare const vault: AccountVault, fileBytes: Uint8Array, password: string, groupUuid: string;
-->
```ts tab="TypeScript"
import { decryptKdbx } from "@openvireo/sdk";
import { importAsCopies, importInto } from "@openvireo/sdk/merge";

const { vault: file } = await decryptKdbx(fileBytes, password);
const { added, updated, unchanged } = importInto(file, vault.vault);
// or: importAsCopies(file, vault.vault, groupUuid), with importTargets(vault.vault) listing the groups to offer
await vault.sync();
```
```python tab="Python"
file = await client.open_local(file_bytes, ov.KdbxCredentials(password=password, key_file=None))
summary = vault.import_from(file, ov.LocalImportMode.MERGE())   # added, updated, unchanged
# or: ov.LocalImportMode.COPIES(parent_group_id=group_id), with vault.import_targets() listing the groups
await vault.sync(ov.SyncOptions(local_changed=True))
```
```kotlin tab="Kotlin"
val file = client.openLocal(fileBytes, KdbxCredentials(password = password, keyFile = null), CancelToken())
val summary = vault.importFrom(file, LocalImportMode.Merge)   // added, updated, unchanged
// or: LocalImportMode.Copies(groupId), with vault.importTargets() listing the groups to offer
vault.sync(SyncOptions(localChanged = true), CancelToken())
```
```java tab="Java"
JVault file = client.openLocal(fileBytes, new KdbxCredentials(password, null, null)).join();
ImportSummary summary = vault.importFrom(file, LocalImportMode.Merge.INSTANCE);   // added, updated, unchanged
// or: new LocalImportMode.Copies(groupId), with vault.importTargets() listing the groups to offer
vault.sync(new SyncOptions(true, false)).join();
```
```swift tab="Swift"
let file = try await client.openLocal(kdbx: fileBytes, credentials: KdbxCredentials(password: password, keyFile: nil), cancel: cancel)
let summary = try vault.importFrom(source: file, mode: .merge)   // added, updated, unchanged
// or: .copies(parentGroupId: groupId), with vault.importTargets() listing the groups to offer
_ = try await vault.sync(options: SyncOptions(localChanged: true, acceptServerState: false), cancel: cancel)
```
```cpp tab="C++"
ov::KdbxCredentials creds{true, std::move(password), false, {}, false, {}};
auto file = ov::call([&] { return client->open_local(std::move(file_bytes), std::move(creds), *cancel); });
ov::LocalImportMode merge{ov::LocalImportKind::Merge, ""};   // or {Copies, group_id}: vault->import_targets() lists them
auto summary = ov::call([&] { return vault->import_from(*file, merge); });   // added, updated, unchanged
ov::call([&] { return vault->sync(true, *cancel); });
```

- `importInto` merges by entry and group UUID and keeps the newer version of each entry (the older goes into
  its history). It deletes nothing, so importing the same file twice changes nothing, and a file exported from
  the vault earlier just updates it.
- `importAsCopies` puts the file's tree, named after its root group, under the chosen group with fresh UUIDs
  for every entry and group; references between the copied entries (`{REF:…@I:…}`) follow them. Importing
  twice gives two copies.
- Both leave out the file's recycle bin and never change the vault's root group, which holds its name. The
  file itself is not changed.
- `importInto` also brings the file's database custom data items the vault doesn't have yet (browser
  integration keys, plugin settings), but never its sync server settings (`KPXC_REMOTE_SYNC_SETTINGS`) or
  generated items. `importAsCopies` brings no custom data.

# Self-hosted sync servers

Without an account, the SDK syncs ordinary password-protected `.kdbx` files with a self-hosted
[OpenVireo Sync Server](https://github.com/openvireo/openvireo-sync-server/blob/develop/docs/index.md), the
same way the desktop app does. There are no vaults, no sharing and no keys beyond the database's own
password: each database is one file under the user's name on the server.

## Pairing

A device gets a token of its own by claiming a pairing code from another device (**Pair Device…** in the
desktop app) or from the server (`openvireo-sync-server devices pair alice`):

<!-- prelude
import type { KeyValueStorage } from "@openvireo/sdk";
declare const storage: KeyValueStorage;
-->
```ts tab="TypeScript"
import { SelfHostedSync } from "@openvireo/sdk";

const server = await SelfHostedSync.pair("https://sync.example.org", "ABCD-EFGH", "Web", { storage });

// next time
const again = await SelfHostedSync.restore("https://sync.example.org", { storage });
```
```rust tab="Rust"
let url = "https://sync.example.org".to_string();
let server = SelfHosted::pair(client.clone(), url.clone(), "ABCD-EFGH".into(), "Laptop".into(), cancel.clone()).await?;

// next time, with the same persistent store
let again = SelfHosted::restore(client.clone(), url).await?;
```
```python tab="Python"
server = await ov.SelfHosted.pair(client, "https://sync.example.org", "ABCD-EFGH", "Laptop")

# next time, with the same persistent store
again = await ov.restore_self_hosted(client, "https://sync.example.org")
```
```kotlin tab="Kotlin"
val server = SelfHosted.pair(client, "https://sync.example.org", "ABCD-EFGH", "Laptop", CancelToken())

// next time, with the same persistent store
val again = restoreSelfHosted(client, "https://sync.example.org")
```
```java tab="Java"
JSelfHosted server = JSelfHosted.pair(client, "https://sync.example.org", "ABCD-EFGH", "Laptop").join();

// next time, with the same persistent store
JSelfHosted again = JOv.restoreSelfHosted(client, "https://sync.example.org").join();
```
```swift tab="Swift"
let server = try await SelfHosted.pair(client: client, serverUrl: "https://sync.example.org",
                                       code: "ABCD-EFGH", deviceName: "iPhone", cancel: cancel)

// next time, with the same persistent store
let again = try await restoreSelfHosted(client: client, serverUrl: "https://sync.example.org")
```
```cpp tab="C++"
auto server = ov::call([&] { return ov::self_hosted_pair(*client, "https://sync.example.org", "ABCD-EFGH", "Desktop", *cancel); });

// next time, with the same persistent store
auto restored = ov::call([&] { return ov::self_hosted_restore(*client, "https://sync.example.org"); });
if (restored->is_paired()) server = ov::call([&] { return restored->take(); });
```

The token is kept in `storage`. Calling a server from a web app needs the server to allow the app's origin
(`SYNC_ALLOWED_ORIGINS`, see the sync server's
[CORS](https://github.com/openvireo/openvireo-sync-server/blob/develop/docs/api.md#cors) section).

## Syncing a database

<!-- prelude
import type { SelfHostedSync } from "@openvireo/sdk";
declare const server: SelfHostedSync, fileBytes: Uint8Array, password: string;
-->
```ts tab="TypeScript"
import { decryptKdbx, passwordCredentials } from "@openvireo/sdk";

const { vault } = await decryptKdbx(fileBytes, password);
const result = await server.syncDatabase("personal", await vault.saveLocal(), passwordCredentials(password));
// result.kdbx is the merged file: save it locally and reopen it (result.report says what changed)
```
```rust tab="Rust"
let creds = KdbxCredentials { password: Some(password), ..Default::default() };
let result = server.sync_database("personal".into(), file_bytes, creds, cancel.clone()).await?;
// result.kdbx is the merged file: save it locally and reopen it (result.report says what changed)
```
```python tab="Python"
creds = ov.KdbxCredentials(password=password, key_file=None)
result = await server.sync_database("personal", file_bytes, creds)
# result.kdbx is the merged file: save it locally and reopen it (result.report says what changed)
```
```kotlin tab="Kotlin"
val creds = KdbxCredentials(password = password, keyFile = null)
val result = server.syncDatabase("personal", fileBytes, creds, CancelToken())
// result.kdbx is the merged file: save it locally and reopen it (result.report says what changed)
```
```java tab="Java"
KdbxCredentials creds = new KdbxCredentials(password, null, null);
SelfHostedSyncResult result = server.syncDatabase("personal", fileBytes, creds).join();
// result.getKdbx() is the merged file: save it locally and reopen it
```
```swift tab="Swift"
let creds = KdbxCredentials(password: password, keyFile: nil)
let result = try await server.syncDatabase(databaseId: "personal", kdbx: fileBytes, credentials: creds, cancel: cancel)
// result.kdbx is the merged file: save it locally and reopen it (result.report says what changed)
```
```cpp tab="C++"
ov::KdbxCredentials creds{true, std::move(password), false, {}, false, {}};
auto result = ov::call([&] { return server->sync_database("personal", std::move(file_bytes), std::move(creds), *cancel); });
// result.kdbx is the merged file: save it locally and reopen it (result.report says what changed)
```

The first sync of a database id uploads it. Later syncs download the server copy, merge it with yours against
the last common version, and upload the result, retrying on conflicts. The sync state (ETag, revision,
base copy) is kept in `storage` (the core's offline cache), so give each device its own storage.

To keep a database openable without keeping its password (for example, sealed for a page reload), keep
`await passwordHash(password)` instead: the 32-byte password part of the KDBX key.
`openKdbx(bytes, passwordHashCredentials(hash))` opens the file with it.

If another device changed the database's password, the server copy doesn't open with yours
(`vault_key_mismatch`): ask for the other password and sync with that.

## Other calls

<!-- prelude
import type { SelfHostedSync } from "@openvireo/sdk";
declare const server: SelfHostedSync;
declare function resync(id: string): void;
-->
```ts tab="TypeScript"
await server.health();                                   // '{"status":"ok"}'; not_sync_server for another site
const databases = await server.listDatabases();          // [{ id, revision, etag, size, updatedAt }]
const first = await server.download("personal");         // the .kdbx as uploaded, or null; opens with its password
const { code } = await server.createPairingCode();       // for the next device
const stream = server.events((e) => e.kind === "databaseChanged" && resync(e.databaseId));
```
```rust tab="Rust"
let health = server.health(cancel.clone()).await?;                     // '{"status":"ok"}'
let databases = server.list_databases(cancel.clone()).await?;          // id, revision, etag, size, updated_at
let first = server.download("personal".into(), cancel.clone()).await?;   // the .kdbx, or None
let code = server.create_pairing_code(cancel.clone()).await?.code;     // for the next device
let stream = server.events(cancel.clone()).await?;                     // next() gives AccountEvent::DatabaseChanged
```
```python tab="Python"
await server.health()                      # '{"status":"ok"}'; not_sync_server for another site
databases = await server.list_databases()  # BlobMeta: id, revision, etag, size, updated_at
first = await server.download("personal")  # the .kdbx as uploaded, or None
code = (await server.create_pairing_code()).code   # for the next device
stream = await server.events()             # next() gives AccountEvent.DATABASE_CHANGED
```
```kotlin tab="Kotlin"
server.health(CancelToken())                       // '{"status":"ok"}'; not_sync_server for another site
val databases = server.listDatabases(CancelToken())   // id, revision, etag, size, updatedAt
val first = server.download("personal", CancelToken())   // the .kdbx as uploaded, or null
val code = server.createPairingCode(CancelToken()).code  // for the next device
val stream = server.events(CancelToken())          // next() gives AccountEvent.DatabaseChanged
```
```java tab="Java"
server.health().join();                                  // '{"status":"ok"}'
List<BlobMeta> databases = server.listDatabases().join();
byte[] first = server.download("personal").join();       // the .kdbx as uploaded, or null
String code = server.createPairingCode().join().getCode();   // for the next device
JEventStream stream = server.events().join();            // next() gives AccountEvent.DatabaseChanged
```
```swift tab="Swift"
_ = try await server.health(cancel: cancel)                            // '{"status":"ok"}'
let databases = try await server.listDatabases(cancel: cancel)         // id, revision, etag, size, updatedAt
let first = try await server.download(databaseId: "personal", cancel: cancel)   // the .kdbx, or nil
let code = try await server.createPairingCode(cancel: cancel).code     // for the next device
let stream = try await server.events(cancel: cancel)                   // next(cancel:) gives .databaseChanged
```
```cpp tab="C++"
ov::call([&] { return server->health(*cancel); });                       // '{"status":"ok"}'
auto databases = ov::call([&] { return server->list_databases(*cancel); });   // id, revision, etag, size, updated_at
auto code = ov::call([&] { return server->create_pairing_code(*cancel); }).code;   // for the next device
auto stream = ov::call([&] { return server->events(*cancel); });         // next() gives DatabaseChanged
```

`health()` checks an address before pairing: a web page, a 404 or JSON that isn't the sync server's is
`not_sync_server` (with the page's `status`), and an address that doesn't answer is `network_error`.
`download(id)` fetches a database this device doesn't have yet, without its password, to save as the first
local copy before the first `syncDatabase`.

`server.history(id)` and `server.openVersion(id, revision, credentials)` read earlier versions;
`server.core` is the core's `SelfHosted` handle.

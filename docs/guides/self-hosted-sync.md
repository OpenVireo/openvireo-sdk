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
```ts
import { SelfHostedSync } from "@openvireo/sdk";

const server = await SelfHostedSync.pair("https://sync.example.org", "ABCD-EFGH", "Web", { storage });

// next time
const again = await SelfHostedSync.restore("https://sync.example.org", { storage });
```

The token is kept in `storage`. Calling a server from a web app needs the server to allow the app's origin
(`SYNC_ALLOWED_ORIGINS`, see the sync server's
[CORS](https://github.com/openvireo/openvireo-sync-server/blob/develop/docs/api.md#cors) section).

## Syncing a database

<!-- prelude
import type { SelfHostedSync } from "@openvireo/sdk";
declare const server: SelfHostedSync, fileBytes: Uint8Array, password: string;
-->
```ts
import { decryptKdbx, passwordCredentials } from "@openvireo/sdk";

const { vault } = await decryptKdbx(fileBytes, password);
const result = await server.syncDatabase("personal", await vault.saveLocal(), passwordCredentials(password));
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
```ts
await server.health();                                   // '{"status":"ok"}'; not_sync_server for another site
const databases = await server.listDatabases();          // [{ id, revision, etag, size, updatedAt }]
const first = await server.download("personal");         // the .kdbx as uploaded, or null; opens with its password
const { code } = await server.createPairingCode();       // for the next device
const stream = server.events((e) => e.kind === "databaseChanged" && resync(e.databaseId));
```

`health()` checks an address before pairing: a web page, a 404 or JSON that isn't the sync server's is
`not_sync_server` (with the page's `status`), and an address that doesn't answer is `network_error`.
`download(id)` fetches a database this device doesn't have yet, without its password, to save as the first
local copy before the first `syncDatabase`.

`server.history(id)` and `server.openVersion(id, revision, credentials)` read earlier versions;
`server.core` is the core's `SelfHosted` handle.

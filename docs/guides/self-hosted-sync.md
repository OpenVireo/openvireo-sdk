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

const { dbInstance } = await decryptKdbx(fileBytes, password);
const result = await server.syncDatabase("personal", {
  db: dbInstance,
  credentials: passwordCredentials(password),
});
// result.db is the merged copy: save it locally and keep working on it
```

The first sync of a database id uploads it. Later syncs download the server copy, merge it with yours against
the last common version, and upload the result, retrying on conflicts. The sync state (ETag, revision,
base copy) is kept in `storage` under the database id; without `storage`, pass it yourself as `state` and
keep `result.state`.

If another device changed the database's password, the server copy doesn't open with yours
(`vault_key_mismatch`): ask for the other password and pass both, newest first, as
`credentials: [passwordCredentials(newPassword), passwordCredentials(password)]`.

## Other calls

<!-- prelude
import type { SelfHostedSync } from "@openvireo/sdk";
declare const server: SelfHostedSync;
declare function resync(id: string): void;
-->
```ts
const databases = await server.listDatabases();          // [{ id, revision, etag, size, updatedAt }]
const { code } = await server.createPairingCode();       // for the next device
const stream = server.events({ onEvent: (e) => e.type === "database" && resync(e.id) });
```

`server.client` is the underlying `SyncClient`, with every database route (history, delete, conditional
requests).

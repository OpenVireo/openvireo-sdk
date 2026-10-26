# Moving a database to an account

`importVault` turns a database the user already has (a local `.kdbx`, or one synced with a self-hosted
server) into a new vault in their account. This is *Move to account* in the desktop and web apps.

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, fileBytes: Uint8Array, password: string, orgId: string;
-->
```ts
import { VaultUploadError, decryptKdbx } from "@openvireo/sdk";

const { dbInstance: localDb } = await decryptKdbx(fileBytes, password);
try {
  const vault = await account.importVault(localDb, { name: "Home" });   // or { name, orgId } for an org vault
} catch (e) {
  if (!(e instanceof VaultUploadError)) throw e;
  await e.vault.sync();   // the vault exists but its first upload failed: retry it later
}
```

- The original database is never changed. A copy is re-keyed to a fresh vault key (the database's password
  no longer opens it) and uploaded as a new vault with `If-None-Match: *`.
- The copy's root group takes the vault name (by default, the root group's current name), and its sync server
  settings are dropped.
- In an organisation, the vault is sealed to every confirmed owner and admin, like any new org vault.

Tell the user the old file and the new vault are now separate: edits to one don't reach the other.

# Live updates

The sync server keeps an events stream open to each signed-in device, so apps can react as soon as another
device uploads a vault or someone changes who may open what.

<!-- prelude
import type { Account, AccountVault, VaultInfo } from "@openvireo/sdk";
declare const account: Account, vault: AccountVault;
declare function render(vaults: VaultInfo[]): void;
-->
```ts
const live = account.subscribe({
  onVaultChanged: (e) => {
    // another device uploaded (or deleted) a vault this account can open
    if (e.id === vault.id && e.etag !== vault.etag) void vault.sync({ localChanged: false });
  },
  onVaultsChanged: (vaults) => render(vaults),   // access changed: vaults added, removed or re-keyed
  onError: (e) => console.warn("events", e),
});

live.close();   // when the app no longer needs it
```

- `onVaultChanged` gets `{ id, etag, revision }`, or `{ id, deleted: true }`. Compare `etag` with
  `vault.etag` to skip your own uploads.
- On an access change (a grant, a revoke, a key rotation, an organisation change), `subscribe` refreshes the
  access token so it lists the new vaults, reloads the vault list, reconnects the stream, and then calls
  `onVaultsChanged`.
- The stream reconnects on its own after network errors, with backoff, and when the access token expires.

Events are a hint, not a guarantee: a device that was offline misses them. Sync on start-up and when the app
comes back to the foreground too, with `vault.sync({ localChanged: false })`, which costs one `HEAD` when
nothing changed.

For a [self-hosted server](self-hosted-sync.md), `server.events({ onEvent })` gives the same stream with
`database` events.

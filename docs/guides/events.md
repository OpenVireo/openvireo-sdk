# Live updates

The sync server keeps an events stream open to each signed-in device, so apps can react as soon as another
device uploads a vault or someone changes who may open what.

<!-- prelude
import type { Account, AccountVault, VaultInfo } from "@openvireo/sdk";
declare const account: Account, vault: AccountVault;
declare function render(vaults: VaultInfo[]): void;
-->
```ts tab="TypeScript"
const live = account.subscribe({
  onVaultChanged: (e) => {
    // another device uploaded (or deleted) a vault this account can open
    if (e.vaultId === vault.id && e.etag !== vault.etag) void vault.sync({ localChanged: false });
  },
  onVaultsChanged: (vaults) => render(vaults),   // access changed: vaults added, removed or re-keyed
  onError: (e) => console.warn("events", e),
});

live.close();   // when the app no longer needs it
```
```python tab="Python"
stream = await account.subscribe()
while (event := await stream.next()) is not None:
    if isinstance(event, ov.AccountEvent.VAULT_CHANGED):
        # another device uploaded (or deleted) a vault this account can open
        if event.vault_id == vault.id() and event.etag != vault.etag():
            await vault.sync(ov.SyncOptions(local_changed=False))
    elif isinstance(event, ov.AccountEvent.VAULTS_CHANGED):
        render(event.vaults)   # access changed: vaults added, removed or re-keyed
    elif isinstance(event, ov.AccountEvent.SESSION_ENDED):
        break

stream.close()   # from any thread; a pending next() then returns None
```
```kotlin tab="Kotlin"
val stream = account.subscribe(CancelToken())
while (true) {
    when (val event = stream.next(CancelToken()) ?: break) {
        is AccountEvent.VaultChanged ->   // another device uploaded (or deleted) a vault this account can open
            if (event.vaultId == vault.id() && event.etag != vault.etag()) vault.sync(SyncOptions(localChanged = false), CancelToken())
        is AccountEvent.VaultsChanged -> render(event.vaults)   // access changed
        is AccountEvent.SessionEnded -> break
        else -> {}
    }
}

stream.closeStream()   // a pending next() then returns null
```
```java tab="Java"
JEventStream stream = account.subscribe().join();
for (AccountEvent event; (event = stream.next().join()) != null; ) {
    if (event instanceof AccountEvent.VaultChanged changed) {
        // another device uploaded (or deleted) a vault this account can open
        if (changed.getVaultId().equals(vault.id()) && !Objects.equals(changed.getEtag(), vault.etag())) {
            vault.sync(new SyncOptions(false, false)).join();
        }
    } else if (event instanceof AccountEvent.VaultsChanged list) {
        render(list.getVaults());   // access changed
    } else if (event instanceof AccountEvent.SessionEnded) {
        break;
    }
}

stream.close();
```
```swift tab="Swift"
let stream = try await account.subscribe(cancel: cancel)
loop: while let event = try await stream.next(cancel: cancel) {
    switch event {
    case .vaultChanged(let vaultId, let etag, _, _):
        // another device uploaded (or deleted) a vault this account can open
        if vaultId == vault.id() && etag != vault.etag() {
            _ = try await vault.sync(options: SyncOptions(localChanged: false, acceptServerState: false), cancel: cancel)
        }
    case .vaultsChanged(let vaults): render(vaults)   // access changed
    case .sessionEnded: break loop
    default: break
    }
}

stream.close()
```
```cpp tab="C++"
auto stream = ov::call([&] { return account->subscribe(*cancel); });
for (;;) {
    auto event = ov::call([&] { return stream->next(*cancel); });   // blocks
    if (event.kind == ov::AccountEventKind::Closed || event.kind == ov::AccountEventKind::SessionEnded) break;
    if (event.kind == ov::AccountEventKind::VaultChanged && event.id == vault->id() && event.etag != vault->etag())
        ov::call([&] { return vault->sync(false, *cancel); });   // another device uploaded this vault
    if (event.kind == ov::AccountEventKind::VaultsChanged) render(event.vaults);   // access changed
}

ov::call([&] { stream->close(); });   // from another thread, ends a blocked next()
```

- `onVaultChanged` gets `{ kind: "vaultChanged", vaultId, etag, revision, deleted }`. Compare `etag` with
  `vault.etag` to skip your own uploads.
- When the account is scheduled for deletion or erased elsewhere, `subscribe` closes the stream and signs this
  device out (`onSignedOut` reports `deletion_scheduled` or `account_deleted`; the latter also forgets the
  Secret Key).
- On an access change (a grant, a revoke, a key rotation, an organisation change), `subscribe` refreshes the
  access token so it lists the new vaults, reloads the vault list, reconnects the stream, and then calls
  `onVaultsChanged`.
- The stream reconnects on its own after network errors, with backoff, and when the access token expires.

Events are a hint, not a guarantee: a device that was offline misses them. Sync on start-up and when the app
comes back to the foreground too, with `vault.sync({ localChanged: false })`, which costs one `HEAD` when
nothing changed.

For a [self-hosted server](self-hosted-sync.md), `server.events({ onEvent })` gives the same stream with
`database` events.

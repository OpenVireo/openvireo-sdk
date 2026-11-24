# Offline

With `offline: true`, an `Account` keeps what this device needs to unlock and open vaults without the
network, and keeps edits made offline until they can be uploaded.

<!-- prelude
import { browserStorage } from "@openvireo/sdk";
declare const issuer: string, password: string, id: string;
-->
```ts tab="TypeScript"
import { Account, isUnreachable } from "@openvireo/sdk";

const account = await Account.connect({
  issuer,
  device: { name: "Web", platform: "web" },
  storage: browserStorage(),
  offline: true,
});
await account.unlock(password);              // works offline from the cached wrapped keyset
const vault = await account.openVault(id);   // offline: the local copy
account.offline;                             // true while the servers can't be reached

await vault.write("ov://Home/Wifi/password", "new").catch((e) => {
  if (!isUnreachable(e)) throw e;            // offline: the edit is kept and merges in later
});

const { vaults, dropped } = await account.reconnect();   // back online; revoked vaults are forgotten
await vault.sync();                                       // uploads the kept edit
```
```rust tab="Rust"
let client = OvClient::new(
    ClientConfig {
        device: DeviceInfo { id: None, name: "Laptop".into(), platform: Platform::Cli },
        offline: true,   // offline needs a Host with a persistent BlobCache
        server: None,
    },
    host,
);
let account = client.connect(issuer, cancel.clone()).await?;
account.unlock(password, None, cancel.clone()).await?;            // works offline
let vault = account.open_vault(vault_id, cancel.clone()).await?;   // offline: the local copy
account.is_offline();                                              // true while unreachable

if let Err(e) = vault.write_field("ov://Home/Wifi/password".into(), b"new".to_vec(), false, cancel.clone()).await {
    if e.code != OvErrorCode::NetworkError {
        return Err(e.into());
    }
    // offline: the edit is kept and merges in later
}

let result = account.reconnect(cancel.clone()).await?;   // back online; result.dropped: revoked vaults
vault.sync(SyncOptions { local_changed: true, accept_server_state: false }, cancel.clone()).await?;
```
```python tab="Python"
client = ov.OvClient(
    ov.ClientConfig(device=ov.DeviceInfo(id=None, name="Laptop", platform=ov.Platform.CLI), offline=True, server=None),
    default_host(store=KeyringStore(), cache_dir="~/.cache/openvireo"),   # offline needs a persistent cache
)
account = await client.connect(issuer)
await account.unlock(password, None)       # works offline from the cached wrapped keyset
vault = await account.open_vault(vault_id)  # offline: the local copy
account.is_offline()                        # True while the servers can't be reached

try:
    await vault.write_field("ov://Home/Wifi/password", b"new", False)
except ov.OvError as e:
    if e.code != ov.OvErrorCode.NETWORK_ERROR:
        raise                               # offline: the edit is kept and merges in later

result = await account.reconnect()          # back online; result.dropped: revoked vaults, forgotten
await vault.sync(ov.SyncOptions(local_changed=True))   # uploads the kept edit
```
```kotlin tab="Kotlin"
val client = OvClient(
    ClientConfig(DeviceInfo(id = null, name = "Laptop", platform = Platform.CLI), offline = true, server = null),
    defaultHost(cacheDir = Path.of("ov-cache")),   // offline needs a persistent cache
)
val account = client.connect(issuer, CancelToken())
account.unlock(password, null, CancelToken())                 // works offline from the cached wrapped keyset
val vault = account.openVault(vaultId, CancelToken())         // offline: the local copy
account.isOffline()                                           // true while the servers can't be reached

try {
    vault.writeField("ov://Home/Wifi/password", "new".toByteArray(), false, CancelToken())
} catch (e: OvException) {
    if (e.code != OvErrorCode.NETWORK_ERROR) throw e          // offline: the edit is kept and merges in later
}

val result = account.reconnect(CancelToken())                 // back online; result.dropped: revoked vaults
vault.sync(SyncOptions(localChanged = true), CancelToken())   // uploads the kept edit
```
```java tab="Java"
JOvClient client = new JOvClient(
    new ClientConfig(new DeviceInfo(null, "Laptop", Platform.CLI), true, null),
    JDefaultHosts.create(Path.of("ov-cache")));   // offline needs a persistent cache
JAccount account = client.connect(issuer).join();
account.unlock(password, null).join();          // works offline from the cached wrapped keyset
JVault vault = account.openVault(vaultId).join();   // offline: the local copy

try {
    vault.writeField("ov://Home/Wifi/password", "new".getBytes(StandardCharsets.UTF_8), false).join();
} catch (CompletionException e) {
    if (JErrors.code(e) != OvErrorCode.NETWORK_ERROR) throw e;   // offline: the edit is kept
}

ReconnectResult result = account.reconnect().join();   // back online; getDropped(): revoked vaults
vault.sync(new SyncOptions(true, false)).join();       // uploads the kept edit
```
```swift tab="Swift"
let client = OvClient(
    config: ClientConfig(device: DeviceInfo(id: nil, name: "iPhone", platform: .ios), offline: true, server: nil),
    host: host)   // offline needs a Host with a persistent BlobCache
let account = try await client.connect(issuer: issuer, cancel: cancel)
_ = try await account.unlock(password: password, secretKey: nil, cancel: cancel)   // works offline
let vault = try await account.openVault(vaultId: vaultId, cancel: cancel)            // offline: the local copy
try account.isOffline()                                                             // true while unreachable

do {
    _ = try await vault.writeField(reference: "ov://Home/Wifi/password", value: Data("new".utf8), create: false, cancel: cancel)
} catch let error as OvError where error.code == .networkError {
    // offline: the edit is kept and merges in later
}

let result = try await account.reconnect(cancel: cancel)   // back online; result.dropped: revoked vaults
_ = try await vault.sync(options: SyncOptions(localChanged: true, acceptServerState: false), cancel: cancel)
```
```cpp tab="C++"
ov::ClientConfig config{"", "Laptop", ov::Platform::QtLinux, true, false, ov::ServerConfig{}};   // offline = true
// ... new_client with a persistent BlobCache, then connect as usual
ov::call([&] { return account->unlock(std::move(password), {}, *cancel); });   // works offline
auto vault = ov::call([&] { return account->open_vault(vault_id, *cancel); });   // offline: the local copy

try {
    ov::call([&] { return vault->write_field("ov://Home/Wifi/password", to_bytes("new"), false, *cancel); });   // to_bytes: std::string → rust::Vec<uint8_t>
} catch (const ov::Error &e) {
    if (e.code() != "network_error") throw;   // offline: the edit is kept and merges in later
}

auto result = ov::call([&] { return account->reconnect(*cancel); });   // result.dropped: revoked vaults
ov::call([&] { return vault->sync(true, *cancel); });                  // uploads the kept edit
```

## What falls back

`connect`, `unlock`, `listVaults` and `openVault` use the cache when a server can't be reached:
`isUnreachable(e)` is true, meaning no network or a `502`, `503` or `504` from a gateway. Any other error,
such as a wrong password or a revoked session, still throws. `account.offline` and `vault.offline` say
which state you are in.

A vault that was never synced on this device can't be opened offline (`not_available_offline`).

## What is cached

Only what the servers store too, so the cache is no weaker than the server's copy:

- the discovery document;
- the wrapped keyset and its KDF parameters;
- the vault list as the server returned it (encrypted names, sealed keys);
- per vault, the sync state, whose base copy is the server's encrypted `.kdbx`;
- per vault, local edits not yet uploaded, as a `.kdbx` encrypted with the vault key.

Unlocking offline still needs the master password and the Secret Key (kept on trusted devices). Signing out,
and a session the server revoked or refused, drop the whole cache. A session that ended by accident
(`onSignedOut` reports `session_expired` or `token_reused`) keeps each vault's unsynced edits, still encrypted
with the vault key, and they merge in on the next sync after the same user signs in again. The vault list,
keyset, sync states and server copies go either way, and so does everything when a different user signs in. `reconnect()` drops vaults the account can no longer
open and returns their ids in `dropped`.

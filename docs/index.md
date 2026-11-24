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
| `ov` | A native binary (from openvireo-core) to read, inject and rotate secrets from scripts and CI. See [CLI](cli.md) |
| `ov connect` | A REST server for one service account, built into `ov`, with a container image and Kubernetes manifests. See [Connect](connect.md). (`@openvireo/connect`, its TypeScript version, is deprecated) |
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

The `ov` CLI, which includes the `ov connect` server, is a native program: download it as a signed single
binary from [openvireo-core's releases](https://github.com/OpenVireo/openvireo-core/releases) (no Node needed);
see [CLI](cli.md#install) and [Connect](connect.md#install). Connect's container image is
`ghcr.io/openvireo/openvireo-connect`.

## A first program

Sign in, list the vaults, read one field and sign out. The same program in every language: TypeScript is
this SDK; Rust calls the core directly; Python, Kotlin, Java, Swift and C++ are the [core bindings](https://github.com/openvireo/openvireo-core/blob/develop/docs/bindings/README.md),
which share its API and error codes; the `ov` CLI does it from a shell.

<!-- prelude
declare const email: string, password: string, secretKey: string;
-->
```ts tab="TypeScript"
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
```rust tab="Rust"
use ov_core::api::{CancelToken, ClientConfig, DeviceInfo, LoginInput, OvClient, Platform};

// The Host is the platform's part: HTTP, a secure store, a cache, a clock and a log sink.
// Implement the ov_core::host traits, or copy host.rs from the Rust examples.
let client = OvClient::new(
    ClientConfig {
        device: DeviceInfo { id: None, name: "My script".into(), platform: Platform::Cli },
        offline: false,
        server: None,
    },
    host,
);
let cancel = CancelToken::new();
let account = client.connect("https://accounts.openvireo.com".into(), cancel.clone()).await?;
// The LoginStep asks for a TOTP code when two-step sign-in is on
let login = LoginInput { email, password, secret_key: Some(secret_key), totp: None, trust_device: true };
account.login(login, cancel.clone()).await?;

let vaults = account.vaults(cancel.clone()).await?;
for info in &vaults {
    println!("{} {:?}", info.name, info.role);
}
let vault = account.open_vault(vaults[0].id.clone(), cancel.clone()).await?;
println!("{}", String::from_utf8_lossy(&vault.read_field("ov://Personal/GitHub/username".into())?));
account.sign_out(false, cancel).await?;
```
```python tab="Python"
import openvireo as ov
from openvireo.hosts import default_host


async def main(email: str, password: bytes, secret_key: bytes) -> None:
    client = ov.OvClient(
        ov.ClientConfig(
            device=ov.DeviceInfo(id=None, name="My script", platform=ov.Platform.CLI),
            offline=False,
            server=None,
        ),
        default_host(),
    )
    account = await client.connect("https://accounts.openvireo.com")
    # Returns LoginStep.NEEDS_TOTP when two-step sign-in is on: see the Python guide
    await account.login(ov.LoginInput(email=email, password=password, secret_key=secret_key, totp=None, trust_device=True))

    vaults = await account.vaults()
    for info in vaults:
        print(info.name, info.role)
    vault = await account.open_vault(vaults[0].id)
    print(vault.read_field("ov://Personal/GitHub/username").decode())
    await account.sign_out(False)
```
```kotlin tab="Kotlin"
import com.openvireo.core.*
import com.openvireo.core.hosts.defaultHost

suspend fun firstProgram(email: String, password: ByteArray, secretKey: ByteArray) {
    val client = OvClient(
        ClientConfig(DeviceInfo(id = null, name = "My script", platform = Platform.CLI), offline = false, server = null),
        defaultHost(),
    )
    val account = client.connect("https://accounts.openvireo.com", CancelToken())
    // Returns LoginStep.NeedsTotp when two-step sign-in is on: see the Kotlin guide
    account.login(LoginInput(email, password, secretKey = secretKey, totp = null, trustDevice = true), CancelToken())

    val vaults = account.vaults(CancelToken())
    for (info in vaults) println("${info.name} ${info.role}")
    val vault = account.openVault(vaults.first().id, CancelToken())
    println(vault.readField("ov://Personal/GitHub/username").decodeToString())
    account.signOut(false, CancelToken())
}
```
```java tab="Java"
import com.openvireo.core.*;
import com.openvireo.core.java.*;
import java.nio.charset.StandardCharsets;
import java.util.List;

JOvClient client = new JOvClient(
    new ClientConfig(new DeviceInfo(null, "My script", Platform.CLI), false, null),
    JDefaultHosts.create());
JAccount account = client.connect("https://accounts.openvireo.com").join();
// Returns LoginStep.NeedsTotp when two-step sign-in is on: see the Java guide
account.login(new LoginInput(email, password, secretKey, null, true)).join();

List<VaultInfo> vaults = account.vaults().join();
for (VaultInfo info : vaults) System.out.println(info.getName() + " " + info.getRole());
JVault vault = account.openVault(vaults.get(0).getId()).join();
System.out.println(new String(vault.readField("ov://Personal/GitHub/username"), StandardCharsets.UTF_8));
account.signOut(false).join();
```
```swift tab="Swift"
import OpenVireoRustCore

// The Host is the platform's part: HTTP, a secure store, a cache, a clock and a log sink.
// The iOS app has one; implement the HttpTransport, SecureStore, BlobCache, Clock and LogSink protocols.
let host = Host(http: MyHttp(), store: MyKeychainStore(), cache: MyCache(), clock: MyClock(), log: MyLog())
let client = OvClient(
    config: ClientConfig(device: DeviceInfo(id: nil, name: "My app", platform: .ios), offline: false, server: nil),
    host: host)
let cancel = CancelToken()
let account = try await client.connect(issuer: "https://accounts.openvireo.com", cancel: cancel)
// The LoginStep asks for a TOTP code when two-step sign-in is on
_ = try await account.login(
    input: LoginInput(email: email, password: password, secretKey: secretKey, totp: nil, trustDevice: true),
    cancel: cancel)

let vaults = try await account.vaults(cancel: cancel)
for info in vaults { print(info.name, info.role) }
let vault = try await account.openVault(vaultId: vaults[0].id, cancel: cancel)
print(String(decoding: try vault.readField(reference: "ov://Personal/GitHub/username"), as: UTF8.self))
try await account.signOut(forgetDevice: false, cancel: cancel)
```
```cpp tab="C++"
#include <ovcore.h>

// Calls block: run them on a worker thread. MyHttp, MyStore, MyCache, MyClock and MyLog implement the
// Host classes in <host.h>.
auto cancel = ov::new_cancel_token();
ov::ClientConfig config{"", "My tool", ov::Platform::Cli, false, false, ov::ServerConfig{}};
auto client = ov::call([&] {
    return ov::new_client(config, std::make_unique<MyHttp>(), std::make_unique<MyStore>(),
                          std::make_unique<MyCache>(), std::make_unique<MyClock>(), std::make_unique<MyLog>());
});
auto account = ov::call([&] { return client->connect("https://accounts.openvireo.com", *cancel); });
// A LoginStep that needs a TOTP code when two-step sign-in is on
ov::LoginInput input{email, std::move(password), true, std::move(secret_key), "", true};
ov::call([&] { return account->login(std::move(input), *cancel); });

auto vaults = ov::call([&] { return account->vaults(*cancel); });
for (const auto &info : vaults) std::printf("%s\n", std::string(info.name).c_str());
auto vault = ov::call([&] { return account->open_vault(vaults[0].id, *cancel); });
auto value = ov::call([&] { return vault->read_field("ov://Personal/GitHub/username"); });
std::printf("%.*s\n", static_cast<int>(value.size()), reinterpret_cast<const char *>(value.data()));
ov::wipe(value);
ov::call([&] { account->sign_out(false, *cancel); });
```
```sh tab="ov CLI"
ov login --email you@example.com      # master password, then the Secret Key the first time
ov vault list
ov read ov://Personal/GitHub/username
ov logout
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
- [Share links](guides/share-links.md): give an item or some text to someone without an account
- [Service accounts](guides/service-accounts.md): CI, servers and long-running processes
- [Self-hosted sync servers](guides/self-hosted-sync.md): no account, just a sync server
- [Testing your app](guides/testing.md): the in-memory servers

## Reference

- [Concepts](concepts.md): keys, vaults, roles, references, what the servers see
- [Errors](errors.md): every error code and what to do about it
- [Merge behaviour](merge-behaviour.md): how concurrent edits are combined
- [Lower-level APIs](lower-level.md): the sync loop, HTTP clients, vaults and KDBX, Argon2, the core modules
- [Migrating to 1.0](migrating-to-1.0.md): from 0.x (kdbxweb) to the core's handles
- [API reference](https://developer.openvireo.com/sdk/api/): every export, generated from the source
  (`npm run docs:api` builds it locally)

## Subpath imports

Everything is exported from `@openvireo/sdk`. Smaller entry points keep bundles small:

| Subpath | What it contains |
|---|---|
| `@openvireo/sdk/crypto` | Secret Key, AUK (Argon2id), wrap/seal, keysets, fingerprints, vault names, SA and refresh tokens, JWT verification |
| `@openvireo/sdk/opaque` | The OPAQUE client (opaque-ke, in the shared core) |
| `@openvireo/sdk/auth` | `AuthClient` (every account server route), discovery, `TokenManager`, storage adapters |
| `@openvireo/sdk/storage/node` | `FileStorage` (a 0600 JSON file) |
| `@openvireo/sdk/sync` | `SyncClient`, `subscribeEvents`, sync results and the clock-skew check |
| `@openvireo/sdk/vault` | The core's `Vault` and `Kdbx` handles, credentials, entry helpers, `ov://` references |
| `@openvireo/sdk/merge` | The sync merge and `.kdbx` import, matching the desktop app |
| `@openvireo/sdk/share` | Opening share links without an account, share payloads, TOTP codes (loads only the core's lite module) |
| `@openvireo/sdk/testing` | In-memory auth and sync servers for tests (not for production) |

## License

MIT OR Apache-2.0, at your option.

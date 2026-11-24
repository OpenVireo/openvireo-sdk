# Hosted accounts

`Account` is the entry point for anything a person does with their OpenVireo account: signing up and in,
unlocking, opening vaults, sharing. See [Concepts](../concepts.md) for what the keys and secrets are.

## Connecting

<!-- prelude
import { browserStorage } from "@openvireo/sdk";
-->
```ts tab="TypeScript"
import { Account } from "@openvireo/sdk";

const account = await Account.connect({
  issuer: "https://accounts.openvireo.com",       // discovery: /.well-known/openvireo-configuration
  device: { name: "Firefox on Linux", platform: "web" },
  storage: browserStorage(),                        // where sessions and trusted-device keys live
});
```
```rust tab="Rust"
use ov_core::api::{CancelToken, ClientConfig, DeviceInfo, OvClient, Platform};

// host: your Host (HTTP, a keychain-backed SecureStore, a cache, a clock, a log sink)
let client = OvClient::new(
    ClientConfig {
        device: DeviceInfo { id: None, name: "Laptop".into(), platform: Platform::Cli },
        offline: false,
        server: None,
    },
    host,
);
let cancel = CancelToken::new();
let account = client.connect("https://accounts.openvireo.com".into(), cancel.clone()).await?;
```
```python tab="Python"
import openvireo as ov
from openvireo.hosts import KeyringStore, default_host

client = ov.OvClient(
    ov.ClientConfig(
        device=ov.DeviceInfo(id=None, name="Backup script on Linux", platform=ov.Platform.CLI),
        offline=False,
        server=None,
    ),
    default_host(store=KeyringStore(), cache_dir="~/.cache/openvireo"),  # where sessions and trusted-device keys live
)
account = await client.connect("https://accounts.openvireo.com")
```
```kotlin tab="Kotlin"
import com.openvireo.core.*
import com.openvireo.core.hosts.defaultHost
import java.nio.file.Path

val client = OvClient(
    ClientConfig(DeviceInfo(id = null, name = "Backup tool", platform = Platform.CLI), offline = false, server = null),
    defaultHost(cacheDir = Path.of("ov-cache")),   // pass store = for a SecureStore that outlives the process
)
val account = client.connect("https://accounts.openvireo.com", CancelToken())
```
```java tab="Java"
import com.openvireo.core.*;
import com.openvireo.core.java.*;
import java.nio.file.Path;

JOvClient client = new JOvClient(
    new ClientConfig(new DeviceInfo(null, "Backup tool", Platform.CLI), false, null),
    JDefaultHosts.create(Path.of("ov-cache")));
JAccount account = client.connect("https://accounts.openvireo.com").join();
```
```swift tab="Swift"
import OpenVireoRustCore

// host: your Host (HTTP, a Keychain-backed SecureStore, a cache, a clock, a log sink)
let client = OvClient(
    config: ClientConfig(device: DeviceInfo(id: nil, name: "iPhone", platform: .ios), offline: false, server: nil),
    host: host)
let cancel = CancelToken()
let account = try await client.connect(issuer: "https://accounts.openvireo.com", cancel: cancel)
```
```cpp tab="C++"
#include <ovcore.h>

// Calls block: make them on a worker thread. MyHttp, MyStore, ... implement the classes in <host.h>.
auto cancel = ov::new_cancel_token();
ov::ClientConfig config{"", "Linux desktop", ov::Platform::QtLinux, false, false, ov::ServerConfig{}};
auto client = ov::call([&] {
    return ov::new_client(config, std::make_unique<MyHttp>(), std::make_unique<MyStore>(),
                          std::make_unique<MyCache>(), std::make_unique<MyClock>(), std::make_unique<MyLog>());
});
auto account = ov::call([&] { return client->connect("https://accounts.openvireo.com", *cancel); });
```

`connect` reads the issuer's discovery document to find the account and sync servers, then loads a stored
session if `storage` has one. A resumed session is **signed in but locked** (`account.signedIn` is true,
`account.unlocked` false): the keys need the master password again.

`device.platform` is one of `web`, `cli`, `connect`, `qt-linux`, `qt-macos`, `qt-windows`, `ios`. Device lists can also show `android` (Android apps). The name shows up in
the user's device list.

### Storage

`storage` keeps the session (refresh token, device id), the trusted device's Secret Key, and each vault's sync
state. Pick one for the platform:

| Storage | Where | Use it for |
|---|---|---|
| `browserStorage()` | IndexedDB, encrypted with a non-extractable WebCrypto key | browsers |
| `new FileStorage(path)` from `@openvireo/sdk/storage/node` | a JSON file with mode 0600 | Node and Bun tools |
| `new MemoryStorage()` (the default) | memory | tests, one-off scripts |

Anything with `get`, `set` and `delete` (the `KeyValueStorage` interface) works, and `EncryptedStorage` wraps
another storage with an AES-GCM key you provide.

In Rust and the core bindings (Python, Kotlin, Java, Swift, C++) the **Host** plays this part: its `SecureStore`
keeps the session and trusted Secret Keys, its `BlobCache` the vaults and their sync state. Python's
`default_host()` and Kotlin's `defaultHost()` build one (in memory unless you pass a store and a cache directory);
Rust, Swift and C++ apps supply their own ([`host.rs`](https://github.com/openvireo/openvireo-examples-rust/blob/main/src/host.rs)
in the Rust examples is one to copy). The other examples on these pages assume `account` (and, in Rust, Swift
and C++, `cancel`) from here.

## Signing up

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, email: string, password: string;
declare function showEmergencyKit(secretKey: string): void;
-->
```ts tab="TypeScript"
const { secretKey, userId } = await account.register({ email, password });
showEmergencyKit(secretKey);   // the only time the Secret Key is shown; the user must keep it
```
```rust tab="Rust"
let input = RegisterInput { email, password, kdf: None, trust_device: true };
let created = account.register(input, cancel.clone()).await?;
show_emergency_kit(&created.secret_key);   // the only time the Secret Key is shown; the user must keep it
```
```python tab="Python"
created = await account.register(ov.RegisterInput(email=email, password=password, kdf=None, trust_device=True))
show_emergency_kit(created.secret_key)   # the only time the Secret Key is shown; the user must keep it
```
```kotlin tab="Kotlin"
val created = account.register(RegisterInput(email, password, kdf = null, trustDevice = true), CancelToken())
showEmergencyKit(created.secretKey)   // the only time the Secret Key is shown; the user must keep it
```
```java tab="Java"
NewAccount created = account.register(new RegisterInput(email, password, null, true)).join();
showEmergencyKit(created.getSecretKey());   // the only time the Secret Key is shown; the user must keep it
```
```swift tab="Swift"
let created = try await account.register(
    input: RegisterInput(email: email, password: password, kdf: nil, trustDevice: true), cancel: cancel)
showEmergencyKit(created.secretKey)   // the only time the Secret Key is shown; the user must keep it
```
```cpp tab="C++"
ov::RegisterInput input{email, std::move(password), ov::KdfOverrides{}, true};
auto created = ov::call([&] { return account->register_account(std::move(input), *cancel); });
show_emergency_kit(created.secret_key);   // the only time the Secret Key is shown; the user must keep it
```

`register` makes the Secret Key and keyset on the device, registers OPAQUE, and leaves the account signed in
and unlocked. With `trustDevice` (the default) this device keeps the Secret Key for next time. Later,
`account.secretKey()` returns the kept copy, so the user can download the Emergency Kit again.

## Signing in

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, email: string, password: string, secretKey: string;
declare function askForCode(): Promise<string>;
-->
```ts tab="TypeScript"
await account.login({
  email,
  password,
  secretKey,                     // only needed the first time on this device
  totp: () => askForCode(),      // asked only when the account has two-factor authentication on
});
```
```rust tab="Rust"
// secret_key: only needed the first time on this device (else None)
let input = LoginInput { email, password, secret_key, totp: None, trust_device: true };
let mut step = account.login(input, cancel.clone()).await?;
while let LoginStep::NeedsTotp(challenge) = step {   // two-factor authentication is on
    step = account.submit_totp(challenge, ask_for_code(), cancel.clone()).await?;
}
```
```python tab="Python"
# secret_key: only needed the first time on this device (else None)
login = ov.LoginInput(email=email, password=password, secret_key=secret_key, totp=None, trust_device=True)
step = await account.login(login)
while isinstance(step, ov.LoginStep.NEEDS_TOTP):   # two-factor authentication is on
    step = await account.submit_totp(step.challenge, ask_for_code())
```
```kotlin tab="Kotlin"
// secretKey: only needed the first time on this device (else null)
var step = account.login(LoginInput(email, password, secretKey = secretKey, totp = null, trustDevice = true), CancelToken())
while (step is LoginStep.NeedsTotp) {   // two-factor authentication is on
    step = account.submitTotp(step.challenge, askForCode(), CancelToken())
}
```
```java tab="Java"
// secretKey: only needed the first time on this device (else null)
LoginStep step = account.login(new LoginInput(email, password, secretKey, null, true)).join();
while (step instanceof LoginStep.NeedsTotp) {   // two-factor authentication is on
    JTotpChallenge challenge = new JTotpChallenge(((LoginStep.NeedsTotp) step).getChallenge());
    step = account.submitTotp(challenge, askForCode()).join();
}
```
```swift tab="Swift"
// secretKey: only needed the first time on this device (else nil)
var step = try await account.login(
    input: LoginInput(email: email, password: password, secretKey: secretKey, totp: nil, trustDevice: true),
    cancel: cancel)
while case .needsTotp(let challenge) = step {   // two-factor authentication is on
    step = try await account.submitTotp(challenge: challenge, code: askForCode(), cancel: cancel)
}
```
```cpp tab="C++"
// has_secret_key = false (and an empty secret_key) once this device trusts the account
ov::LoginInput input{email, std::move(password), true, std::move(secret_key), "", true};
auto step = ov::call([&] { return account->login(std::move(input), *cancel); });
while (step->needs_totp()) {   // two-factor authentication is on
    auto challenge = ov::call([&] { return step->challenge(); });
    step = ov::call([&] { return account->submit_totp(*challenge, ask_for_code(), *cancel); });
}
```
```sh tab="ov CLI"
ov login --email you@example.com      # master password, the Secret Key the first time, then a TOTP code if on
```

`totp` can be a code or a function, which is called again (with `attempt` and the last `error`) when a code
is wrong. A missing code throws `mfa_required`, too many wrong ones `mfa_expired`.

Without `secretKey` on a device that doesn't trust this account yet, `login` throws `invalid_secret_key`: ask
for the Secret Key and try again. Pass `trustDevice: false` on shared computers.

## Unlocking and locking

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, password: string;
-->
```ts tab="TypeScript"
if (account.signedIn && !account.unlocked) await account.unlock(password);

account.lock();             // wipes the keys from memory; the session stays
await account.logout();     // ends the session on the server and forgets it here
await account.logout({ forgetDevice: true });   // also forgets the trusted Secret Key
```
```rust tab="Rust"
if account.is_signed_in() && !account.is_unlocked() {
    account.unlock(password, None, cancel.clone()).await?;
}

account.lock();                                // wipes the keys from memory; the session stays
account.sign_out(false, cancel.clone()).await?;   // ends the session and forgets it here
account.sign_out(true, cancel.clone()).await?;    // also forgets the trusted Secret Key
```
```python tab="Python"
if account.is_signed_in() and not account.is_unlocked():
    await account.unlock(password, None)

account.lock()                  # wipes the keys from memory; the session stays
await account.sign_out(False)   # ends the session on the server and forgets it here
await account.sign_out(True)    # also forgets the trusted Secret Key
```
```kotlin tab="Kotlin"
if (account.isSignedIn() && !account.isUnlocked()) account.unlock(password, null, CancelToken())

account.lock()                          // wipes the keys from memory; the session stays
account.signOut(false, CancelToken())   // ends the session on the server and forgets it here
account.signOut(true, CancelToken())    // also forgets the trusted Secret Key
```
```java tab="Java"
if (account.isSignedIn() && !account.isUnlocked()) account.unlock(password, null).join();

account.lock();                 // wipes the keys from memory; the session stays
account.signOut(false).join();  // ends the session on the server and forgets it here
account.signOut(true).join();   // also forgets the trusted Secret Key
```
```swift tab="Swift"
if try account.isSignedIn(), try !account.isUnlocked() {
    _ = try await account.unlock(password: password, secretKey: nil, cancel: cancel)
}

try account.lock()                                          // wipes the keys from memory; the session stays
try await account.signOut(forgetDevice: false, cancel: cancel)   // ends the session and forgets it here
try await account.signOut(forgetDevice: true, cancel: cancel)    // also forgets the trusted Secret Key
```
```cpp tab="C++"
if (account->is_signed_in() && !account->is_unlocked())
    ov::call([&] { return account->unlock(std::move(password), {}, *cancel); });   // empty: the kept Secret Key

ov::call([&] { account->lock(); });                      // wipes the keys from memory; the session stays
ov::call([&] { account->sign_out(false, *cancel); });    // ends the session on the server and forgets it here
ov::call([&] { account->sign_out(true, *cancel); });     // also forgets the trusted Secret Key
```
```sh tab="ov CLI"
ov logout            # ends the session
ov logout --forget   # also removes the Secret Key from this machine
```

`unlock` needs no OPAQUE round trip: it unwraps the keyset with the password and the kept Secret Key.

### Staying unlocked across a page reload

A web app loses its memory on every reload. To unlock again without the master password, seal the
unlocked keyset under a non-extractable WebCrypto key and keep the two apart: the key in IndexedDB, the
sealed string somewhere that ends with the tab, such as `sessionStorage`.

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, reloaded: Account;
declare function saveKey(key: CryptoKey): Promise<void>;
declare function loadKey(): Promise<CryptoKey>;
-->
```ts tab="TypeScript"
const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
await saveKey(key);
sessionStorage.setItem("unlocked", await account.sealUnlocked(key));

// after the reload, on a connected (signed-in, locked) account
const sealed = sessionStorage.getItem("unlocked");
if (sealed) await reloaded.resumeUnlocked(sealed, await loadKey());
```
```rust tab="Rust"
let secret = account.unlocked_keyset_secret()?;   // keep it in the keychain

// after a relaunch, on a connected (signed-in, locked) account
reloaded.resume_unlocked(secret, cancel.clone()).await?;
```
```python tab="Python"
secret = account.unlocked_keyset_secret()   # keep it in the OS keychain, never on disk in the clear

# after a restart, on a connected (signed-in, locked) account
await reloaded.resume_unlocked(secret)
```
```kotlin tab="Kotlin"
val secret = account.unlockedKeysetSecret()   // keep it in the platform's secure store

// after a restart, on a connected (signed-in, locked) account
reloaded.resumeUnlocked(secret, CancelToken())
```
```java tab="Java"
byte[] secret = account.unlockedKeysetSecret();   // keep it in the platform's secure store

// after a restart, on a connected (signed-in, locked) account
reloaded.resumeUnlocked(secret).join();
```
```swift tab="Swift"
let secret = try account.unlockedKeysetSecret()   // keep it in the Keychain

// after a relaunch, on a connected (signed-in, locked) account
try await reloaded.resumeUnlocked(keysetSecret: secret, cancel: cancel)
```
```cpp tab="C++"
auto secret = ov::call([&] { return account->unlocked_keyset_secret(); });   // keep it in the OS keychain

// after a restart, on a connected (signed-in, locked) account
ov::call([&] { reloaded->resume_unlocked(std::move(secret), *cancel); });
```

The seal is bound to this issuer and user. `resumeUnlocked` checks the unsealed keys against the account's
public keys (from `/me`, or offline the cached profile). It fails with `signed_out` when the session has
ended, `decryption_failed` for a seal the key can't open, and `invalid_public_keys` when the account's keys
changed (an account reset). `lock()` doesn't revoke a seal, so delete the string and the key when your app
locks.

The session can also end on its own: when the refresh token expires, is revoked from another device, or is
used twice (`token_reused`, a sign of a stolen token). Listen for it:

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account;
declare function showSignIn(): void;
-->
```ts tab="TypeScript"
const stop = account.onSignedOut((reason) => {   // "session_expired" | "token_reused" | "unauthorized" | "logout"
  showSignIn();
});
```
```rust tab="Rust"
let reason = account.signed_out(cancel.clone()).await?;   // SessionExpired, TokenReused, Unauthorized, Logout, ...
show_sign_in();
```
```python tab="Python"
reason = await account.signed_out()   # waits: SignedOutReason.SESSION_EXPIRED, TOKEN_REUSED, UNAUTHORIZED, LOGOUT, ...
show_sign_in()
```
```kotlin tab="Kotlin"
val reason = account.signedOut(CancelToken())   // suspends: SESSION_EXPIRED, TOKEN_REUSED, UNAUTHORIZED, LOGOUT, ...
showSignIn()
```
```java tab="Java"
account.signedOut().thenAccept(reason -> showSignIn());   // SESSION_EXPIRED, TOKEN_REUSED, UNAUTHORIZED, LOGOUT, ...
```
```swift tab="Swift"
let reason = try await account.signedOut(cancel: cancel)   // .sessionExpired, .tokenReused, .unauthorized, .logout, ...
showSignIn()
```
```cpp tab="C++"
auto reason = ov::call([&] { return account->signed_out(*cancel); });   // blocks until the session ends
show_sign_in();
```

After `session_expired` or `token_reused` (an accident, not a sign-out), edits this device hadn't uploaded
yet are kept and sync once the same user signs in again. Every other reason, and `logout()`, drops them with
the rest of the offline cache.

## The account itself

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, current: string, next: string, code: string, password: string;
-->
```ts tab="TypeScript"
account.email;          // the signed-in email
account.userId;
account.fingerprint;    // this account's public key fingerprint, for others to compare

await account.changePassword({ current, next });                  // signs the other devices out
await account.requestEmailChange("new@example.com");              // mails a code to the new address
await account.changeEmail({ email: "new@example.com", code, password });

const url = await account.webSessionUrl("/settings");   // a one-time link into the account website (60 s)
```
```rust tab="Rust"
let email = account.email();               // the signed-in email
let user_id = account.user_id();
let fingerprint = account.fingerprint()?;   // this account's public key fingerprint, for others to compare

account.change_password(current, next, None, cancel.clone()).await?;            // signs others out
account.request_email_change("new@example.com".into(), cancel.clone()).await?;  // mails a code
account.change_email("new@example.com".into(), code, password, cancel.clone()).await?;

let url = account.web_session_url(Some("/settings".into()), cancel.clone()).await?;   // one-time (60 s)
```
```python tab="Python"
account.email()         # the signed-in email
account.user_id()
account.fingerprint()   # this account's public key fingerprint, for others to compare

await account.change_password(current, next, None)          # signs the other devices out
await account.request_email_change("new@example.com")       # mails a code to the new address
await account.change_email("new@example.com", code, password)

url = (await account.web_session_url("/settings")).decode()   # a one-time link into the account website (60 s)
```
```kotlin tab="Kotlin"
account.email()         // the signed-in email
account.userId()
account.fingerprint()   // this account's public key fingerprint, for others to compare

account.changePassword(current, next, null, CancelToken())        // signs the other devices out
account.requestEmailChange("new@example.com", CancelToken())      // mails a code to the new address
account.changeEmail("new@example.com", code, password, CancelToken())

val url = account.webSessionUrl("/settings", CancelToken()).decodeToString()   // one-time link (60 s)
```
```java tab="Java"
account.email();         // the signed-in email
account.userId();
account.fingerprint();   // this account's public key fingerprint, for others to compare

account.changePassword(current, next, null).join();          // signs the other devices out
account.requestEmailChange("new@example.com").join();        // mails a code to the new address
account.changeEmail("new@example.com", code, password).join();

String url = new String(account.webSessionUrl("/settings").join(), StandardCharsets.UTF_8);   // one-time link (60 s)
```
```swift tab="Swift"
try account.email()         // the signed-in email
try account.userId()
try account.fingerprint()   // this account's public key fingerprint, for others to compare

_ = try await account.changePassword(current: current, next: next, kdf: nil, cancel: cancel)   // signs others out
try await account.requestEmailChange(email: "new@example.com", cancel: cancel)               // mails a code
try await account.changeEmail(email: "new@example.com", code: code, password: password, cancel: cancel)

let url = String(decoding: try await account.webSessionUrl(next: "/settings", cancel: cancel), as: UTF8.self)
```
```cpp tab="C++"
account->email();         // the signed-in email
account->user_id();
account->fingerprint();   // this account's public key fingerprint, for others to compare

ov::call([&] { return account->change_password(std::move(current), std::move(next), ov::KdfOverrides{}, *cancel); });
ov::call([&] { account->request_email_change("new@example.com", *cancel); });   // mails a code to the new address
ov::call([&] { account->change_email("new@example.com", code, std::move(password), *cancel); });

auto url = ov::call([&] { return account->web_session_url("/settings", *cancel); });   // one-time link (60 s)
```

Changing the password keeps the same Secret Key and keyset, so vaults and shares keep working.

### Deleting the account

Deleting is scheduled (SPEC §23): the account is locked at once and erased after a grace period (30 days on
the hosted service), when its personal vaults, keys and billing go too. Until then the user can sign in and
restore it.

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, password: string, typedEmail: string, bobPrincipal: `user:${string}`;
-->
```ts tab="TypeScript"
const preview = await account.deletionPreview();
preview.eraseOn;     // when it would be erased
preview.vaults;      // { id, name, sharedWith }: shared vaults can be given away first
preview.orgs;        // outcome "leave", "delete" (deleted with the account) or "blocked"
if (preview.vaults[0]?.sharedWith.length) await account.transferVault(preview.vaults[0].id, bobPrincipal);

const { scheduledFor } = await account.deleteAccount({ password, confirm: typedEmail });
// This device is signed out (onSignedOut reports "deletion_scheduled") and its offline cache is gone.
// The Secret Key stays so the user can sign in again and restore:
if (account.deletionScheduledFor) await account.restoreAccount({ password });
```
```rust tab="Rust"
let preview = account.deletion_preview(cancel.clone()).await?;
let erase_on = &preview.erase_on;   // when it would be erased
let vaults = &preview.vaults;       // id, name, shared_with: shared vaults can be given away first
if let Some(vault) = preview.vaults.first().filter(|v| !v.shared_with.is_empty()) {
    account.transfer_vault(vault.id.clone(), bob_principal, cancel.clone()).await?;
}

let scheduled_for = account.delete_account(password.clone(), typed_email, cancel.clone()).await?;
// This device is signed out and its offline cache is gone. The Secret Key stays, so after signing in again:
if account.deletion_scheduled_for().is_some() {
    account.restore_account(password, cancel.clone()).await?;
}
```
```python tab="Python"
preview = await account.deletion_preview()
preview.erase_on   # when it would be erased
preview.vaults     # id, name, shared_with: shared vaults can be given away first
preview.orgs       # each with its outcome: leave, delete or blocked
if preview.vaults and preview.vaults[0].shared_with:
    await account.transfer_vault(preview.vaults[0].id, bob_principal)

scheduled_for = await account.delete_account(password, typed_email)
# This device is signed out and its offline cache is gone. The Secret Key stays, so after signing in again:
if account.deletion_scheduled_for():
    await account.restore_account(password)
```
```kotlin tab="Kotlin"
val preview = account.deletionPreview(CancelToken())
preview.eraseOn    // when it would be erased
preview.vaults     // id, name, sharedWith: shared vaults can be given away first
preview.orgs       // each with its outcome: leave, delete or blocked
preview.vaults.firstOrNull()?.takeIf { it.sharedWith.isNotEmpty() }?.let {
    account.transferVault(it.id, bobPrincipal, CancelToken())
}

val scheduledFor = account.deleteAccount(password, typedEmail, CancelToken())
// This device is signed out and its offline cache is gone. The Secret Key stays, so after signing in again:
if (account.deletionScheduledFor() != null) account.restoreAccount(password, CancelToken())
```
```java tab="Java"
DeletionPreview preview = account.deletionPreview().join();
preview.getEraseOn();   // when it would be erased
preview.getVaults();    // id, name, sharedWith: shared vaults can be given away first
if (!preview.getVaults().isEmpty() && !preview.getVaults().get(0).getSharedWith().isEmpty()) {
    account.transferVault(preview.getVaults().get(0).getId(), bobPrincipal).join();
}

String scheduledFor = account.deleteAccount(password, typedEmail).join();
// This device is signed out and its offline cache is gone. The Secret Key stays, so after signing in again:
if (account.deletionScheduledFor() != null) account.restoreAccount(password).join();
```
```swift tab="Swift"
let preview = try await account.deletionPreview(cancel: cancel)
preview.eraseOn   // when it would be erased
preview.vaults    // id, name, sharedWith: shared vaults can be given away first
if let vault = preview.vaults.first, !vault.sharedWith.isEmpty {
    try await account.transferVault(vaultId: vault.id, to: bobPrincipal, cancel: cancel)
}

let scheduledFor = try await account.deleteAccount(password: password, confirm: typedEmail, cancel: cancel)
// This device is signed out and its offline cache is gone. The Secret Key stays, so after signing in again:
if try account.deletionScheduledFor() != nil {
    try await account.restoreAccount(password: password, cancel: cancel)
}
```
```cpp tab="C++"
auto preview = ov::call([&] { return account->deletion_preview(*cancel); });
// preview.erase_on: when it would be erased; preview.vaults: id, name, shared_with
if (!preview.vaults.empty() && !preview.vaults[0].shared_with.empty())
    ov::call([&] { account->transfer_vault(preview.vaults[0].id, bob_principal, *cancel); });

auto scheduled_for = ov::call([&] { return account->delete_account(std::move(password), typed_email, *cancel); });
// This device is signed out and its offline cache is gone. The Secret Key stays, so after signing in again:
if (!ov::call([&] { return account->deletion_scheduled_for(); }).empty())
    ov::call([&] { account->restore_account(std::move(password), *cancel); });
```
```sh tab="ov CLI"
ov account delete    # lock the account now, erase it after 30 days
ov account restore   # after `ov login`, keep an account scheduled for deletion
```

- A `blocked` org is one where the user is the only confirmed owner and others are in it. `deleteAccount`
  fails with `deletion_blocked` until the user makes one of `members` an owner (`setMemberRole`; admins
  need no new keys) or deletes the org.
- Signed in to a pending account, `deletionScheduledFor` is the erase date and every vault call fails with
  `account_pending_deletion`. Show a screen with Restore and Sign out.
- Other signed-in devices hear `deletion_scheduled` on the event stream and are signed out the same way.
- Keep the date with your remembered-accounts list (SPEC §21) and remove the account, with
  `forgetDevice`, once `deletionExpired(date)` is true.

The lower-level `account.auth` (an `AuthClient`) covers every account server route, for things `Account` has no
helper for, such as the device list and two-factor setup:

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account;
-->
```ts tab="TypeScript"
const { devices } = await account.auth.listDevices();   // name, platform, last_seen_at, current, …
const old = devices.find((d) => !d.current && d.name === "Old laptop");
if (old) await account.auth.revokeDevice(old.id);
```
```rust tab="Rust"
let devices = account.devices(cancel.clone()).await?;   // name, platform, last_seen_at, current, ...
if let Some(old) = devices.iter().find(|d| !d.current && d.name == "Old laptop") {
    account.revoke_device(old.id.clone(), cancel.clone()).await?;
}
```
```python tab="Python"
devices = await account.devices()   # name, platform, last_seen_at, current, ...
old = next((d for d in devices if not d.current and d.name == "Old laptop"), None)
if old:
    await account.revoke_device(old.id)
```
```kotlin tab="Kotlin"
val devices = account.devices(CancelToken())   // name, platform, lastSeenAt, current, ...
devices.find { !it.current && it.name == "Old laptop" }?.let { account.revokeDevice(it.id, CancelToken()) }
```
```java tab="Java"
List<Device> devices = account.devices().join();   // name, platform, lastSeenAt, current, ...
devices.stream().filter(d -> !d.getCurrent() && d.getName().equals("Old laptop")).findFirst()
    .ifPresent(d -> account.revokeDevice(d.getId()).join());
```
```swift tab="Swift"
let devices = try await account.devices(cancel: cancel)   // name, platform, lastSeenAt, current, ...
if let old = devices.first(where: { !$0.current && $0.name == "Old laptop" }) {
    try await account.revokeDevice(deviceId: old.id, cancel: cancel)
}
```
```cpp tab="C++"
auto devices = ov::call([&] { return account->devices(*cancel); });   // name, platform, last_seen_at, current, ...
for (const auto &d : devices)
    if (!d.current && std::string(d.name) == "Old laptop")
        ov::call([&] { account->revoke_device(d.id, *cancel); });
```

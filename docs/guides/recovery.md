# Account recovery

Someone who lost their master password or Secret Key can ask for their account back. After an admin approves
the request, they get a reset link that opens `{web app}/?view=recover#token=ov_rc_…`. The reset gives them
a new password, Secret Key and keys, and an account that starts without personal vaults. For 30 days the old
vaults can be restored with the old password and the old Emergency Kit. See SPEC §18 for the full flow.

## Resetting

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, token: string, password: string;
declare function showEmergencyKit(secretKey: string): void;
-->
```ts tab="TypeScript"
const info = await account.recoverInfo(token);   // works signed out
// { email, notBefore, expiresAt, archiveDays, archives: { personalVaults, sharedGrants, soleAdminOrgs } }

const { secretKey } = await account.recover({ token, password });   // signed in and unlocked afterwards
showEmergencyKit(secretKey);
```
```python tab="Python"
info = await account.recover_info(token)   # works signed out
# email, not_before, expires_at, archive_days, personal_vaults, shared_grants, sole_admin_orgs

created = await account.recover(token, password, None, True)   # signed in and unlocked afterwards
show_emergency_kit(created.secret_key)
```
```kotlin tab="Kotlin"
val info = account.recoverInfo(token, CancelToken())   // works signed out

val created = account.recover(token, password, null, true, CancelToken())   // signed in and unlocked afterwards
showEmergencyKit(created.secretKey)
```
```java tab="Java"
RecoveryReset info = account.recoverInfo(token).join();   // works signed out

NewAccount created = account.recover(token, password, null, true).join();   // signed in and unlocked afterwards
showEmergencyKit(created.getSecretKey());
```
```swift tab="Swift"
let info = try await account.recoverInfo(token: token, cancel: cancel)   // works signed out

let created = try await account.recover(token: token, password: password, kdf: nil, trustDevice: true, cancel: cancel)
showEmergencyKit(created.secretKey)
```
```cpp tab="C++"
auto info = ov::call([&] { return account->recover_info(std::move(token), *cancel); });   // works signed out

auto created = ov::call([&] { return account->recover(std::move(token), std::move(password), ov::KdfOverrides{}, true, *cancel); });
show_emergency_kit(created.secret_key);
```

Show `info` before resetting, so the user knows what gets archived: personal vaults, vaults shared with
them, and organisations where they are the only admin.

## Restoring the old vaults

Later, with the account unlocked, and within the 30 days:

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, oldPassword: string, oldSecretKey: string;
-->
```ts tab="TypeScript"
const status = await account.recoveryStatus();   // { archived, email?, expiresAt?, vaults?, locked? }
if (status.archived && !status.locked) {
  const { restored } = await account.restoreFromArchive({ oldPassword, oldSecretKey });   // vault list reloaded
}
```
```python tab="Python"
status = await account.recovery_status()   # archived, email, expires_at, vaults, locked
if status.archived and not status.locked:
    restored = await account.restore_from_archive(old_password, old_secret_key)   # vault list reloaded
```
```kotlin tab="Kotlin"
val status = account.recoveryStatus(CancelToken())
if (status.archived && !status.locked) {
    val restored = account.restoreFromArchive(oldPassword, oldSecretKey, CancelToken())   // vault list reloaded
}
```
```java tab="Java"
RecoveryStatus status = account.recoveryStatus().join();
if (status.getArchived() && !status.getLocked()) {
    long restored = account.restoreFromArchive(oldPassword, oldSecretKey).join();   // vault list reloaded
}
```
```swift tab="Swift"
let status = try await account.recoveryStatus(cancel: cancel)
if status.archived && !status.locked {
    let restored = try await account.restoreFromArchive(oldPassword: oldPassword, oldSecretKey: oldSecretKey, cancel: cancel)
}
```
```cpp tab="C++"
auto status = ov::call([&] { return account->recovery_status(*cancel); });
if (status.archived && !status.locked)
    ov::call([&] { return account->restore_from_archive(std::move(old_password), std::move(old_secret_key), *cancel); });
```

The old keys are opened on the device, each archived vault key is sealed to the new keys, and the old keys are
wiped again. The server never sees the old password or Secret Key.

## Errors

| Code | Status | When |
|---|---|---|
| `recovery_not_ready` | 409 | The link doesn't work yet (a notice period); `err.details.notBefore` says when it will |
| `recovery_cancelled` | 410 | The account owner cancelled the reset |
| `session_expired` | 410 | The link was used or expired |
| `unauthorized` | 401 | Restoring: wrong old password |
| `invalid_secret_key` | — | Restoring: the old Secret Key doesn't open the archived keys. Nothing was restored |
| `restore_locked` | 403 | Too many failed restore attempts; an admin has to unlock it |
| `invalid_proof` | 400 | The server didn't accept the restore |
| `not_found` | 404 | There is no archive (none, or it expired) |

# Vaults and sharing

All of this needs an unlocked [`Account`](hosted-account.md).

## Listing and opening

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account;
-->
```ts tab="TypeScript"
const vaults = await account.listVaults();
// [{ id, name, role: "read" | "write" | "manage", orgId, currentKeyVersion, pendingKeyVersion, rotationRequired }]

const vault = await account.openVault(vaults[0]!.id);   // downloads and decrypts it
vault.name;
vault.vault;     // the core `Vault` handle: entries, groups, fields, history, attachments
vault.etag;      // the server version this copy is based on
```
```python tab="Python"
vaults = await account.vaults()   # VaultInfo: id, name, role (VaultRole.READ, WRITE, MANAGE), org_id, ...

vault = await account.open_vault(vaults[0].id)   # downloads and decrypts it
vault.name()
vault.entries(False)   # EntrySummary records; vault.entry(id) gives the full record
vault.etag()           # the server version this copy is based on
```
```kotlin tab="Kotlin"
val vaults = account.vaults(CancelToken())   // VaultInfo: id, name, role (READ, WRITE, MANAGE), orgId, ...

val vault = account.openVault(vaults[0].id, CancelToken())   // downloads and decrypts it
vault.name()
vault.entries(false)   // EntrySummary records; vault.entry(id) gives the full record
vault.etag()           // the server version this copy is based on
```
```java tab="Java"
List<VaultInfo> vaults = account.vaults().join();   // id, name, role (READ, WRITE, MANAGE), orgId, ...

JVault vault = account.openVault(vaults.get(0).getId()).join();   // downloads and decrypts it
vault.name();
vault.entries(false);   // EntrySummary records; vault.entry(id) gives the full record
vault.etag();           // the server version this copy is based on
```
```swift tab="Swift"
let vaults = try await account.vaults(cancel: cancel)   // VaultInfo: id, name, role (.read, .write, .manage), orgId

let vault = try await account.openVault(vaultId: vaults[0].id, cancel: cancel)   // downloads and decrypts it
vault.name()
try vault.entries(includeRecycleBin: false)   // EntrySummary records; vault.entry(entryId:) the full record
vault.etag()                                  // the server version this copy is based on
```
```cpp tab="C++"
auto vaults = ov::call([&] { return account->vaults(*cancel); });   // id, name, role, org_id, ...

auto vault = ov::call([&] { return account->open_vault(vaults[0].id, *cancel); });   // downloads and decrypts it
vault->name();
ov::call([&] { return vault->entries(false); });   // EntrySummary records; vault->entry(id) the full record
vault->etag();                                    // the server version this copy is based on
```
```sh tab="ov CLI"
ov vault list
ov item list "Team Infra"
```

Names are decrypted on the device. `openVault` tries the newest key the account holds first and falls back
to the previous one, so a vault in the middle of a key rotation still opens.

## Reading and writing fields

<!-- prelude
import type { AccountVault } from "@openvireo/sdk";
declare const vault: AccountVault;
-->
```ts tab="TypeScript"
vault.read("ov://Team/GitHub/password");
vault.read({ groupPath: ["Apps"], entry: "Stripe", field: "username" });

await vault.write("ov://Team/GitHub/password", "new value");                 // edits and syncs
await vault.write("ov://Team/Apps/Stripe/api_key", key, { create: true });  // creates the entry if needed
```
```python tab="Python"
vault.read_field("ov://Team/GitHub/password").decode()

await vault.write_field("ov://Team/GitHub/password", b"new value", False)   # edits and syncs
await vault.write_field("ov://Team/Apps/Stripe/api_key", key, True)        # creates the entry if needed
```
```kotlin tab="Kotlin"
vault.readField("ov://Team/GitHub/password").decodeToString()

vault.writeField("ov://Team/GitHub/password", "new value".toByteArray(), false, CancelToken())   // edits and syncs
vault.writeField("ov://Team/Apps/Stripe/api_key", key, true, CancelToken())   // creates the entry if needed
```
```java tab="Java"
new String(vault.readField("ov://Team/GitHub/password"), StandardCharsets.UTF_8);

vault.writeField("ov://Team/GitHub/password", "new value".getBytes(StandardCharsets.UTF_8), false).join();   // edits and syncs
vault.writeField("ov://Team/Apps/Stripe/api_key", key, true).join();   // creates the entry if needed
```
```swift tab="Swift"
String(decoding: try vault.readField(reference: "ov://Team/GitHub/password"), as: UTF8.self)

// edits and syncs; create: true creates the entry if needed
_ = try await vault.writeField(reference: "ov://Team/GitHub/password", value: Data("new value".utf8), create: false, cancel: cancel)
_ = try await vault.writeField(reference: "ov://Team/Apps/Stripe/api_key", value: key, create: true, cancel: cancel)
```
```cpp tab="C++"
auto value = ov::call([&] { return vault->read_field("ov://Team/GitHub/password"); });

// edits and syncs; create = true creates the entry if needed
ov::call([&] { return vault->write_field("ov://Team/GitHub/password", to_bytes("new value"), false, *cancel); });
ov::call([&] { return vault->write_field("ov://Team/Apps/Stripe/api_key", std::move(key), true, *cancel); });
```
```sh tab="ov CLI"
ov read ov://Team/GitHub/password
ov item edit ov://Team/GitHub --stdin-field password < new.txt
ov item create ov://Team/Apps/Stripe api_key=… url=https://stripe.com
```

See [Concepts](../concepts.md#secret-references) for how references find entries. `write` keeps the previous
version in the entry's history and stores password and custom fields protected.

## Editing the database directly

`vault.vault` is the shared Rust core's `Vault` handle. Edit it (`addEntry`, `editEntry`, `setFields`,
`moveEntry`, `addGroup`, `setAttachment`, …, or the SDK's plain-data helpers), then call `sync()`:

<!-- prelude
import type { AccountVault } from "@openvireo/sdk";
declare const vault: AccountVault;
-->
```ts tab="TypeScript"
import { addEntryToDb, setItemFields } from "@openvireo/sdk";

addEntryToDb(vault.vault, vault.vault.rootGroupId(), {
  title: "Database", username: "app", passwordValue: "s3cret", url: "", notes: "", tags: [],
});
setItemFields(vault.vault, { groupPath: ["Apps"], entry: "Api" }, { username: "svc", token: "…" }, { create: true });

const result = await vault.sync();
result.outcome;     // "uploaded", "pulled" (only downloaded), "created" or "unchanged"
result.conflicts;   // entries both sides changed: { uuid, kind, title, fields }
result.changes;     // what the merge did, entry by entry
```
```python tab="Python"
vault.add_entry(vault.root_group_id(), ov.EntryInput(
    fields=[
        ov.FieldInput(name="Title", value=b"Database", protected=None),
        ov.FieldInput(name="UserName", value=b"app", protected=None),
        ov.FieldInput(name="Password", value=b"s3cret", protected=None),
    ],
    remove_fields=[], tags=None, icon_id=None, expiry=ov.EntryExpiry.KEEP(),
))
vault.set_fields("ov://Team/Apps/Api", [
    ov.FieldInput(name="UserName", value=b"svc", protected=None),
    ov.FieldInput(name="token", value=b"...", protected=True),
], ov.CreateMode.CREATE_IF_MISSING)

result = await vault.sync(ov.SyncOptions(local_changed=True))
result.outcome     # SyncOutcome.UPLOADED, PULLED (only downloaded), CREATED or UNCHANGED
result.conflicts   # entries both sides changed
result.changes     # what the merge did, entry by entry
```
```kotlin tab="Kotlin"
vault.addEntry(vault.rootGroupId(), EntryInput(
    fields = listOf(
        FieldInput("Title", "Database".toByteArray(), null),
        FieldInput("UserName", "app".toByteArray(), null),
        FieldInput("Password", "s3cret".toByteArray(), null),
    ),
    removeFields = emptyList(), tags = null, iconId = null, expiry = EntryExpiry.Keep,
))
vault.setFields("ov://Team/Apps/Api", listOf(
    FieldInput("UserName", "svc".toByteArray(), null),
    FieldInput("token", "…".toByteArray(), true),
), CreateMode.CREATE_IF_MISSING)

val result = vault.sync(SyncOptions(localChanged = true), CancelToken())
result.outcome     // UPLOADED, PULLED (only downloaded), CREATED or UNCHANGED
result.conflicts   // entries both sides changed
result.changes     // what the merge did, entry by entry
```
```java tab="Java"
vault.addEntry(vault.rootGroupId(), JRecords.newEntryInput(List.of(
    new FieldInput("Title", "Database".getBytes(StandardCharsets.UTF_8), null),
    new FieldInput("UserName", "app".getBytes(StandardCharsets.UTF_8), null),
    new FieldInput("Password", "s3cret".getBytes(StandardCharsets.UTF_8), null)),
    List.of(), null, null, EntryExpiry.Keep.INSTANCE));
vault.setFields("ov://Team/Apps/Api", List.of(
    new FieldInput("UserName", "svc".getBytes(StandardCharsets.UTF_8), null),
    new FieldInput("token", "…".getBytes(StandardCharsets.UTF_8), true)), CreateMode.CREATE_IF_MISSING);

SyncReport result = vault.sync(new SyncOptions(true, false)).join();
result.getOutcome();     // UPLOADED, PULLED (only downloaded), CREATED or UNCHANGED
result.getConflicts();   // entries both sides changed
```
```swift tab="Swift"
_ = try vault.addEntry(groupId: vault.rootGroupId(), input: EntryInput(
    fields: [
        FieldInput(name: "Title", value: Data("Database".utf8), protected: nil),
        FieldInput(name: "UserName", value: Data("app".utf8), protected: nil),
        FieldInput(name: "Password", value: Data("s3cret".utf8), protected: nil),
    ],
    removeFields: [], tags: nil, iconId: nil, expiry: .keep,
    foregroundColor: nil, backgroundColor: nil, customIcon: nil, fieldOrder: nil))
_ = try vault.setFields(reference: "ov://Team/Apps/Api", fields: [
    FieldInput(name: "UserName", value: Data("svc".utf8), protected: nil),
    FieldInput(name: "token", value: Data("…".utf8), protected: true),
], create: .createIfMissing)

let result = try await vault.sync(options: SyncOptions(localChanged: true, acceptServerState: false), cancel: cancel)
result.outcome     // .uploaded, .pulled (only downloaded), .created or .unchanged
result.conflicts   // entries both sides changed
result.changes     // what the merge did, entry by entry
```
```cpp tab="C++"
// set_fields is the short way to write fields by reference (the entry is created here if missing)
ov::call([&] {
    return vault->set_fields("ov://Team/Apps/Api", {
        ov::FieldInput{"UserName", to_bytes("svc"), false, false},
        ov::FieldInput{"token", to_bytes("…"), true, true},   // has_protected, is_protected
    }, ov::CreateMode::CreateIfMissing);
});

auto result = ov::call([&] { return vault->sync(true, *cancel); });
// result.outcome: Uploaded, Pulled (only downloaded), Created or Unchanged; result.conflicts, result.changes
```

`sync()` downloads the server copy, merges it with your changes against the last common version, and
uploads the result with `If-Match`. When another device uploaded in between, it merges again and retries (up
to five times, then `too_many_conflicts`; your changes stay in `vault.vault`). See
[Merge behaviour](../merge-behaviour.md).

Call `vault.sync({ localChanged: false })` to only pick up changes from elsewhere: it asks the server with a
`HEAD` first and downloads nothing when the version hasn't moved.

Editing `vault.vault` while a sync runs is safe: the core merges those edits into the sync's result and
uploads them in up to two more rounds of the same call. Edits that land after that stay as unsynced edits
(`vault.vault.hasPendingEdits()`) for the next sync.

## Creating vaults

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, orgId: string;
-->
```ts tab="TypeScript"
const personal = await account.createVault("Personal");
const team = await account.createVault("Team Infra", { orgId });   // org owners and admins get manage automatically
```
```python tab="Python"
personal = await account.create_vault("Personal", None)
team = await account.create_vault("Team Infra", org_id)   # org owners and admins get manage automatically
```
```kotlin tab="Kotlin"
val personal = account.createVault("Personal", null, CancelToken())
val team = account.createVault("Team Infra", orgId, CancelToken())   // org owners and admins get manage automatically
```
```java tab="Java"
JVault personal = account.createVault("Personal", null).join();
JVault team = account.createVault("Team Infra", orgId).join();   // org owners and admins get manage automatically
```
```swift tab="Swift"
let personal = try await account.createVault(name: "Personal", orgId: nil, cancel: cancel)
let team = try await account.createVault(name: "Team Infra", orgId: orgId, cancel: cancel)   // admins get manage
```
```cpp tab="C++"
auto personal = ov::call([&] { return account->create_vault("Personal", "", *cancel); });   // "": no org
auto team = ov::call([&] { return account->create_vault("Team Infra", org_id, *cancel); });   // admins get manage
```

`createVault` makes the vault key, registers the vault with the account server, and uploads an empty database
whose root group has the vault's name. It returns the opened vault.

## Sharing

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, vaultId: string;
declare function confirmWithBob(fingerprint: string): Promise<void>;
-->
```ts tab="TypeScript"
const { principal, fingerprint } = await account.share(vaultId, { email: "bob@example.com" }, "write");
await confirmWithBob(fingerprint);   // compare it with what Bob's app shows, out of band

await account.share(vaultId, { principal }, "read");   // changing the role
```
```python tab="Python"
grant = await account.share_vault(vault_id, ov.Grantee.EMAIL("bob@example.com"), ov.VaultRole.WRITE)
await confirm_with_bob(grant.fingerprint)   # compare it with what Bob's app shows, out of band

await account.change_role(vault_id, grant.principal, ov.VaultRole.READ)   # changing the role
```
```kotlin tab="Kotlin"
val grant = account.shareVault(vaultId, Grantee.Email("bob@example.com"), VaultRole.WRITE, CancelToken())
confirmWithBob(grant.fingerprint)   // compare it with what Bob's app shows, out of band

account.changeRole(vaultId, grant.principal, VaultRole.READ, CancelToken())   // changing the role
```
```java tab="Java"
GrantResult grant = account.shareVault(vaultId, new Grantee.Email("bob@example.com"), VaultRole.WRITE).join();
confirmWithBob(grant.getFingerprint());   // compare it with what Bob's app shows, out of band

account.changeRole(vaultId, grant.getPrincipal(), VaultRole.READ).join();   // changing the role
```
```swift tab="Swift"
let grant = try await account.shareVault(vaultId: vaultId, grantee: .email("bob@example.com"), role: .write, cancel: cancel)
try await confirmWithBob(grant.fingerprint)   // compare it with what Bob's app shows, out of band

try await account.changeRole(vaultId: vaultId, principal: grant.principal, role: .read, cancel: cancel)
```
```cpp tab="C++"
ov::Grantee bob{ov::GranteeKind::Email, "bob@example.com"};
auto grant = ov::call([&] { return account->share_vault(vault_id, bob, ov::VaultRole::Write, *cancel); });
confirm_with_bob(grant.fingerprint);   // compare it with what Bob's app shows, out of band

ov::call([&] { account->change_role(vault_id, grant.principal, ov::VaultRole::Read, *cancel); });
```

`share` looks up the person's public keys, checks their signature, seals the vault key to them and grants the
role. It needs `manage` on the vault. The other person needs an account already.

To have the user compare the fingerprint *before* anything is sealed, look the person up first and share to
the keys they confirmed. If the keys changed in between (the person reset their account), `shareWithKeys`
seals nothing and fails with `invalid_public_keys`:

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, vaultId: string;
declare function confirmWithBob(fingerprint: string): Promise<void>;
-->
```ts tab="TypeScript"
import { fingerprint, trustedPublicKeys } from "@openvireo/sdk";

const bob = await account.auth.lookupUser("bob@example.com");
const keys = trustedPublicKeys(bob);   // throws invalid_public_keys if the signature doesn't verify
await confirmWithBob(fingerprint(keys));
await account.shareWithKeys(vaultId, { principal: bob.principal }, "write", keys);
```
```python tab="Python"
bob = await account.look_up("bob@example.com")
if not ov.verify_public_keys(bob.public_keys):
    raise RuntimeError("Bob's keys don't verify")
await confirm_with_bob(bob.public_keys.fingerprint)
await account.share_vault_with_keys(vault_id, ov.Grantee.PRINCIPAL(bob.principal), ov.VaultRole.WRITE, bob.public_keys)
```
```kotlin tab="Kotlin"
val bob = account.lookUp("bob@example.com", CancelToken())
check(verifyPublicKeys(bob.publicKeys)) { "Bob's keys don't verify" }
confirmWithBob(bob.publicKeys.fingerprint)
account.shareVaultWithKeys(vaultId, Grantee.Principal(bob.principal), VaultRole.WRITE, bob.publicKeys, CancelToken())
```
```java tab="Java"
ShareRecipient bob = account.lookUp("bob@example.com").join();
if (!JOv.verifyPublicKeys(bob.getPublicKeys())) throw new IllegalStateException("Bob's keys don't verify");
confirmWithBob(bob.getPublicKeys().getFingerprint());
account.shareVaultWithKeys(vaultId, new Grantee.Principal(bob.getPrincipal()), VaultRole.WRITE, bob.getPublicKeys()).join();
```
```swift tab="Swift"
let bob = try await account.lookUp(email: "bob@example.com", cancel: cancel)
guard try verifyPublicKeys(keys: bob.publicKeys) else { throw KeysDontVerify() }
try await confirmWithBob(bob.publicKeys.fingerprint)
_ = try await account.shareVaultWithKeys(vaultId: vaultId, grantee: .principal(bob.principal), role: .write,
                                         keys: bob.publicKeys, cancel: cancel)
```
```cpp tab="C++"
auto bob = ov::call([&] { return account->look_up("bob@example.com", *cancel); });
const auto &k = bob.public_keys;
auto slice = [](const rust::Vec<std::uint8_t> &v) { return rust::Slice<const std::uint8_t>(v.data(), v.size()); };
if (!ov::verify_public_keys(slice(k.enc_pk), slice(k.sign_pk), slice(k.sig))) throw std::runtime_error("Bob's keys don't verify");
confirm_with_bob(k.fingerprint);
ov::Grantee grantee{ov::GranteeKind::Principal, bob.principal};
ov::call([&] { return account->share_vault_with_keys(vault_id, grantee, ov::VaultRole::Write, k, *cancel); });
```

## Revoking and rotating

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, vaultId: string, bobPrincipal: string;
-->
```ts tab="TypeScript"
await account.revoke(vaultId, [bobPrincipal]);   // removes access and rotates the vault key in one step
await account.rotate(vaultId);                     // a new key without removing anyone
```
```python tab="Python"
await account.revoke(vault_id, [bob_principal])   # removes access and rotates the vault key in one step
await account.rotate_vault_key(vault_id, [])      # a new key without removing anyone
```
```kotlin tab="Kotlin"
account.revoke(vaultId, listOf(bobPrincipal), CancelToken())   // removes access and rotates the vault key
account.rotateVaultKey(vaultId, emptyList(), CancelToken())    // a new key without removing anyone
```
```java tab="Java"
account.revoke(vaultId, List.of(bobPrincipal)).join();   // removes access and rotates the vault key
account.rotateVaultKey(vaultId, List.of()).join();       // a new key without removing anyone
```
```swift tab="Swift"
_ = try await account.revoke(vaultId: vaultId, principals: [bobPrincipal], cancel: cancel)   // and rotates the key
_ = try await account.rotateVaultKey(vaultId: vaultId, remove: [], cancel: cancel)          // a new key only
```
```cpp tab="C++"
ov::call([&] { return account->revoke(vault_id, {bob_principal}, *cancel); });   // and rotates the vault key
ov::call([&] { return account->rotate_vault_key(vault_id, {}, *cancel); });      // a new key without removing anyone
```

Rotating makes a new vault key, seals it to everyone who stays, re-encrypts the file with it and then makes it
current. Access is removed on the server first, so the removed person can't download the re-encrypted
file. Their old downloads still open with the old key, so change the secrets inside if that matters. A vault
whose `rotationRequired` is true (someone left the organisation) should be rotated by a manager.

A rotation that stopped half way (the app closed before the new key was made current) is finished by the
next `revoke` or `rotate` from the same account, before its own rotation. Another account's unfinished
rotation blocks it with `rotation_pending` (409) until that one is finished or, after 24 hours, replaced.

## Organisations

Organisations are managed through the account server API on `account.auth`, with helpers on `Account` for
the steps that need keys:

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, invitationToken: string;
-->
```ts tab="TypeScript"
const org = await account.auth.createOrg("Acme");
await account.auth.invite(org.id, { email: "carol@example.com", role: "member" });
// Carol gets an email, and her app calls account.auth.acceptInvitation(invitationToken)

const { members } = await account.auth.listMembers(org.id);
const carol = members.find((m) => m.email === "carol@example.com" && m.status === "accepted")!;
await account.confirmMember(org.id, carol, [{ id: "<vault id>", role: "read" }]);   // seals vault keys to her

await account.setMemberRole(org.id, carol, "admin");   // admins get manage on every org vault
const { rotated, failed } = await account.removeMember(org.id, carol.user_id);   // and rotates her vaults
```
```python tab="Python"
org = await account.create_org("Acme")
await account.invite(org.id, "carol@example.com", ov.OrgRole.MEMBER)
# Carol gets an email, and her app calls account.accept_invitation(invitation_token)

members = await account.org_members(org.id)
carol = next(m for m in members if m.email == "carol@example.com" and m.status == ov.MemberStatus.ACCEPTED)
await account.confirm_member(org.id, carol, [ov.VaultGrantRequest(vault_id="<vault id>", role=ov.VaultRole.READ)])

await account.set_member_role(org.id, carol, ov.OrgRole.ADMIN)   # admins get manage on every org vault
report = await account.remove_member(org.id, carol.user_id)      # and rotates her vaults: report.rotated, report.failed
```
```kotlin tab="Kotlin"
val org = account.createOrg("Acme", CancelToken())
account.invite(org.id, "carol@example.com", OrgRole.MEMBER, CancelToken())
// Carol gets an email, and her app calls account.acceptInvitation(invitationToken, CancelToken())

val carol = account.orgMembers(org.id, CancelToken())
    .first { it.email == "carol@example.com" && it.status == MemberStatus.ACCEPTED }
account.confirmMember(org.id, carol, listOf(VaultGrantRequest("<vault id>", VaultRole.READ)), CancelToken())

account.setMemberRole(org.id, carol, OrgRole.ADMIN, CancelToken())   // admins get manage on every org vault
val report = account.removeMember(org.id, carol.userId, CancelToken())   // and rotates her vaults
```
```java tab="Java"
Org org = account.createOrg("Acme").join();
account.invite(org.getId(), "carol@example.com", OrgRole.MEMBER).join();
// Carol gets an email, and her app calls account.acceptInvitation(invitationToken)

Member carol = account.orgMembers(org.getId()).join().stream()
    .filter(m -> m.getEmail().equals("carol@example.com") && m.getStatus() == MemberStatus.ACCEPTED)
    .findFirst().orElseThrow();
account.confirmMember(org.getId(), carol, List.of(new VaultGrantRequest("<vault id>", VaultRole.READ))).join();

account.setMemberRole(org.getId(), carol, OrgRole.ADMIN).join();   // admins get manage on every org vault
RotationReport report = account.removeMember(org.getId(), carol.getUserId()).join();   // and rotates her vaults
```
```swift tab="Swift"
let org = try await account.createOrg(name: "Acme", cancel: cancel)
_ = try await account.invite(orgId: org.id, email: "carol@example.com", role: .member, cancel: cancel)
// Carol gets an email, and her app calls account.acceptInvitation(token:cancel:)

let members = try await account.orgMembers(orgId: org.id, cancel: cancel)
let carol = members.first { $0.email == "carol@example.com" && $0.status == .accepted }!
_ = try await account.confirmMember(orgId: org.id, member: carol,
                                    vaults: [VaultGrantRequest(vaultId: "<vault id>", role: .read)], cancel: cancel)

_ = try await account.setMemberRole(orgId: org.id, member: carol, role: .admin, cancel: cancel)   // manage everywhere
let report = try await account.removeMember(orgId: org.id, userId: carol.userId, cancel: cancel)  // rotates her vaults
```
```cpp tab="C++"
auto org = ov::call([&] { return account->create_org("Acme", *cancel); });
ov::call([&] { return account->invite(org.id, "carol@example.com", ov::OrgRole::Member, *cancel); });
// Carol gets an email, and her app calls account->accept_invitation(token, *cancel)

auto members = ov::call([&] { return account->org_members(org.id, *cancel); });
auto carol = *std::find_if(members.begin(), members.end(), [](const ov::Member &m) {
    return std::string(m.email) == "carol@example.com" && m.status == ov::MemberStatus::Accepted;
});
ov::call([&] { return account->confirm_member(org.id, carol, {ov::VaultGrantRequest{"<vault id>", ov::VaultRole::Read}}, *cancel); });

ov::call([&] { return account->set_member_role(org.id, carol, ov::OrgRole::Admin, *cancel); });   // manage everywhere
auto report = ov::call([&] { return account->remove_member(org.id, carol.user_id, *cancel); });  // rotates her vaults
```

`(await account.auth.me()).orgs` lists the organisations the account belongs to.

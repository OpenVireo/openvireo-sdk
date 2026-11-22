# Share links

A share link gives a copy of an item, or some text, to anyone. The person who opens it needs no account, no
app and no sign-in. The content is encrypted on the sender's device with a new key that only the link holds,
after the `#`, which browsers never send to a server. The account server keeps the ciphertext and counts
opens; it can't read what was shared. See SPEC §22 for the format.

A link is a copy: editing or deleting the item later doesn't change it. It ends when it expires, when it has
been opened as many times as allowed, when its owner revokes it, after five wrong passcodes, when its owner
loses access to the vault, or when the vault's organisation turns share links off.

## Making a link

<!-- prelude
import type { Account, AccountVault } from "@openvireo/sdk";
declare const account: Account, vault: AccountVault, entryId: string;
-->
```ts tab="TypeScript"
import { DEFAULT_SHARE_FIELDS, findEntry, itemOf, itemSharePayload, shareableFields } from "@openvireo/sdk";

const item = itemOf(findEntry(vault.vault, { groupPath: [], entry: entryId }), { reveal: true });

// What can be shared, in display order: [{ name: "UserName", field: { k: "username", … } }, …]
const choices = shareableFields(item);

const payload = itemSharePayload(item, DEFAULT_SHARE_FIELDS, "Sam");   // username, password, website
const link = await account.createShare(payload, {
  expiresIn: 7 * 86400,        // seconds: 1 hour to 30 days (free plans: 7 days)
  maxOpens: 1,                 // null or left out: until it expires
  vaultId: vault.id,
  entryId: item.id,
});
console.log(link.url);         // https://share.openvireo.com/<id>#<key>
```
```python tab="Python"
entry = vault.entry(entry_id)
choices = ov.shareable_fields(entry)   # what can be shared, in display order

payload = ov.item_share_payload(entry, ov.default_share_fields(), "Sam")   # username, password, website
link = await account.create_share(payload, ov.ShareOptions(
    expires_in=7 * 86400,   # seconds: 1 hour to 30 days (free plans: 7 days)
    max_opens=1,            # None: until it expires
    passcode=None,
    vault_id=vault.id(),
    entry_id=entry_id,
))
print(link.url.decode())    # https://share.openvireo.com/<id>#<key>
```
```kotlin tab="Kotlin"
val entry = vault.entry(entryId)
val choices = shareableFields(entry)   // what can be shared, in display order

val payload = itemSharePayload(entry, defaultShareFields(), "Sam")   // username, password, website
val link = account.createShare(payload, ShareOptions(
    expiresIn = 7u * 86400u,   // seconds: 1 hour to 30 days (free plans: 7 days)
    maxOpens = 1u,             // null: until it expires
    passcode = null,
    vaultId = vault.id(),
    entryId = entryId,
), CancelToken())
println(link.url.decodeToString())   // https://share.openvireo.com/<id>#<key>
```
```java tab="Java"
EntryRecord entry = vault.entry(entryId);
List<ShareableField> choices = JOv.shareableFields(entry);   // what can be shared, in display order

SharePayload payload = JOv.itemSharePayload(entry, JOv.defaultShareFields(), "Sam");   // username, password, website
CreatedShare link = account.createShare(payload,
    JRecords.newShareOptions(7L * 86400, 1L, null, vault.id(), entryId)).join();   // expiresIn, maxOpens, passcode, ...
System.out.println(new String(link.getUrl(), StandardCharsets.UTF_8));   // https://share.openvireo.com/<id>#<key>
```
```swift tab="Swift"
let entry = try vault.entry(entryId: entryId)
let choices = try shareableFields(entry: entry)   // what can be shared, in display order

let payload = try itemSharePayload(entry: entry, names: try defaultShareFields(), sharedBy: "Sam")   // username, password, website
let link = try await account.createShare(payload: payload, options: ShareOptions(
    expiresIn: 7 * 86400,   // seconds: 1 hour to 30 days (free plans: 7 days)
    maxOpens: 1,            // nil: until it expires
    passcode: nil, vaultId: vault.id(), entryId: entryId), cancel: cancel)
print(String(decoding: link.url, as: UTF8.self))   // https://share.openvireo.com/<id>#<key>
```
```cpp tab="C++"
auto entry = ov::call([&] { return vault->entry(entry_id); });
auto choices = ov::call([&] { return ov::shareable_fields(entry); });   // what can be shared, in display order

auto payload = ov::call([&] { return ov::item_share_payload(entry, ov::default_share_fields(), "Sam"); });
ov::ShareOptions options{7 * 86400, true, 1, false, {}, vault->id(), entry_id};   // expires_in, max_opens, passcode, ...
auto link = ov::call([&] { return account->create_share(std::move(payload), std::move(options), *cancel); });
// link.url: https://share.openvireo.com/<id>#<key> (bytes: it holds the key)
```
```sh tab="ov CLI"
ov share ov://Private/Wi-Fi                                    # username, password and website; 7 days
ov share ov://Private/Bank --field Password --once --expires 1d
```

`shareableFields` lists an item's username, password, website, notes, one-time code (`name: "otp"`, whichever
way the TOTP is stored) and custom fields. Sharing the one-time code shares the TOTP secret, so the person who
opens the link can make codes until it expires; say so where people choose it.

For text that isn't in a vault, use `textSharePayload(text, title?)` and leave out `vaultId` and `entryId`.

A passcode is a second secret, sent another way. The link alone, or the passcode alone, opens nothing:

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account;
-->
```ts tab="TypeScript"
import { textSharePayload } from "@openvireo/sdk";

const link = await account.createShare(textSharePayload("The alarm code is 4321", "Front door"), {
  expiresIn: 3600,
  passcode: "tiger lily 42",
});
```
```python tab="Python"
link = await account.create_share(
    ov.text_share_payload(b"The alarm code is 4321", "Front door", None),
    ov.ShareOptions(expires_in=3600, max_opens=None, passcode=b"tiger lily 42", vault_id=None, entry_id=None),
)
```
```kotlin tab="Kotlin"
val link = account.createShare(
    textSharePayload("The alarm code is 4321".toByteArray(), "Front door", null),
    ShareOptions(expiresIn = 3600u, maxOpens = null, passcode = "tiger lily 42".toByteArray(), vaultId = null, entryId = null),
    CancelToken(),
)
```
```java tab="Java"
CreatedShare link = account.createShare(
    JOv.textSharePayload("The alarm code is 4321".getBytes(StandardCharsets.UTF_8), "Front door", null),
    JRecords.newShareOptions(3600L, null, "tiger lily 42".getBytes(StandardCharsets.UTF_8), null, null)).join();
```
```swift tab="Swift"
let link = try await account.createShare(
    payload: try textSharePayload(text: Data("The alarm code is 4321".utf8), title: "Front door", sharedBy: nil),
    options: ShareOptions(expiresIn: 3600, maxOpens: nil, passcode: Data("tiger lily 42".utf8), vaultId: nil, entryId: nil),
    cancel: cancel)
```
```cpp tab="C++"
auto payload = ov::call([&] { return ov::text_share_payload(to_bytes("The alarm code is 4321"), "Front door", ""); });
ov::ShareOptions options{3600, false, 0, true, to_bytes("tiger lily 42"), "", ""};
auto link = ov::call([&] { return account->create_share(std::move(payload), std::move(options), *cancel); });
```
```sh tab="ov CLI"
ov share ov://Private/Bank --field otp --passcode    # asks for a passcode (or OPENVIREO_SHARE_PASSCODE)
```

`createShare` fails with `plan_limit` (`details.limit` is `share_links` or `share_link_days`) when the plan
doesn't allow more, and `forbidden` when the vault's organisation doesn't allow links (`item_share_links` on
`GET /me`'s `orgs` is `managers` or `off`).

## Listing and revoking

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account;
-->
```ts tab="TypeScript"
for (const s of await account.listShares()) {
  // ref is { vault, entry, title }, readable only by this account
  console.log(s.ref?.title, s.status, s.opens, s.maxOpens, s.expiresAt, s.endReason);
}
await account.revokeShare(id);
```
```python tab="Python"
for s in await account.list_shares():
    # s.reference has vault, entry, title, readable only by this account
    print(s.reference.title if s.reference else None, s.status, s.opens, s.max_opens, s.expires_at, s.end_reason)
await account.revoke_share(share_id)
```
```kotlin tab="Kotlin"
for (s in account.listShares(CancelToken())) {
    // s.reference has vault, entry, title, readable only by this account
    println("${s.reference?.title} ${s.status} ${s.opens}/${s.maxOpens} ${s.expiresAt} ${s.endReason}")
}
account.revokeShare(shareId, CancelToken())
```
```java tab="Java"
for (ShareListing s : account.listShares().join()) {
    System.out.println(s.getStatus() + " " + JRecords.getOpens(s) + " " + s.getExpiresAt());
}
account.revokeShare(shareId).join();
```
```swift tab="Swift"
for s in try await account.listShares(cancel: cancel) {
    // s.reference has vault, entry, title, readable only by this account
    print(s.reference?.title ?? "", s.status, s.opens, s.maxOpens ?? 0, s.expiresAt, s.endReason ?? "")
}
try await account.revokeShare(shareId: shareId, cancel: cancel)
```
```cpp tab="C++"
for (const auto &s : ov::call([&] { return account->list_shares(*cancel); }))
    std::printf("%s %s %u\n", std::string(s.id).c_str(), std::string(s.status).c_str(), s.opens);
ov::call([&] { account->revoke_share(share_id, *cancel); });
```
```sh tab="ov CLI"
ov share list            # add --json for everything
ov share revoke <id>
```

Links that ended in the last 30 days stay in the list with their `endReason`: `expired`, `opened`, `revoked`,
`passcode`, `access_lost` or `policy`.

Owners and admins choose who in an organisation may make links from its vaults:

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, orgId: string;
-->
```ts tab="TypeScript"
await account.auth.setOrgShareLinks(orgId, "managers");   // "on" (default), "managers" or "off"
```
```python tab="Python"
await account.set_org_share_links(org_id, ov.ShareLinkPolicy.MANAGERS)   # ON (default), MANAGERS or OFF
```
```kotlin tab="Kotlin"
account.setOrgShareLinks(orgId, ShareLinkPolicy.MANAGERS, CancelToken())   // ON (default), MANAGERS or OFF
```
```java tab="Java"
account.setOrgShareLinks(orgId, ShareLinkPolicy.MANAGERS).join();   // ON (default), MANAGERS or OFF
```
```swift tab="Swift"
_ = try await account.setOrgShareLinks(orgId: orgId, policy: .managers, cancel: cancel)   // .on (default), .managers, .off
```
```cpp tab="C++"
ov::call([&] { return account->set_org_share_links(org_id, ov::ShareLinkPolicy::Managers, *cancel); });
```

Turning links off, or limiting them to managers, ends the links that are no longer allowed.

## Opening a link

The `@openvireo/sdk/share` entry point opens a link without an account, and loads no OPAQUE, KDBX or sync
code, so a public page stays small. It needs the account server's API URL, which the page knows from its own
configuration:

<!-- prelude
declare const api: string, askForPasscode: () => Promise<string>;
-->
```ts tab="TypeScript"
import { getShareInfo, openShare, parseShareLink, parseTotpUri, totpCode } from "@openvireo/sdk/share";

const { id, key } = parseShareLink(location.href);
const info = await getShareInfo(api, id);     // { expiresAt, opensLeft, kdf }; doesn't count as an open
// Show a "Reveal" button and open only when it's pressed: link previews then can't use up a one-time link.
const passcode = info.kdf ? await askForPasscode() : undefined;
const { payload, opensLeft } = await openShare(api, { id, key }, { passcode, info });

for (const f of payload.fields) {
  const shown = f.k === "totp" ? totpCode(parseTotpUri(f.value)).code : f.value;
  // render as plain text; hide f.protected values until shown
}
```
```python tab="Python"
api = account.server_config().api          # or the share host's API, without an account
share_id = ov.parse_share_link(link).id
info = await client.share_info(api, share_id)   # expires_at, opens_left, kdf; doesn't count as an open
# Show a "Reveal" button and open only when it's pressed: link previews then can't use up a one-time link.
passcode = ask_for_passcode().encode() if info.kdf else None
opened = await client.open_share(api, link.encode(), passcode, info)

for f in opened.payload.fields:
    shown = ov.totp_code(ov.parse_totp_uri(f.value), int(time.time() * 1000)).code if f.k == "totp" else f.value
    # render as plain text; hide f.protected values until shown
```
```kotlin tab="Kotlin"
val api = account.serverConfig().api       // or the share host's API, without an account
val info = client.shareInfo(api, parseShareLink(link).id, CancelToken())   // doesn't count as an open
// Show a "Reveal" button and open only when it's pressed: link previews then can't use up a one-time link.
val passcode = if (info.kdf != null) askForPasscode().toByteArray() else null
val opened = client.openShare(api, link.toByteArray(), passcode, info, CancelToken())

for (f in opened.payload.fields) {
    val shown = if (f.k == "totp") totpCode(parseTotpUri(f.value), System.currentTimeMillis()).code else f.value
    // render as plain text; hide f.protected values until shown
}
```
```java tab="Java"
String api = account.serverConfig().getApi();   // or the share host's API, without an account
ShareInfo info = client.shareInfo(api, JOv.parseShareLink(link).getId()).join();   // doesn't count as an open
// Show a "Reveal" button and open only when it's pressed: link previews then can't use up a one-time link.
byte[] passcode = info.getKdf() != null ? askForPasscode().getBytes(StandardCharsets.UTF_8) : null;
OpenedShare opened = client.openShare(api, link.getBytes(StandardCharsets.UTF_8), passcode, info).join();

for (ShareField f : opened.getPayload().getFields()) {
    byte[] shown = f.getK().equals("totp")
        ? JOv.totpCode(JOv.parseTotpUri(f.getValue()), System.currentTimeMillis()).getCode()
        : f.getValue();
    // render as plain text; hide f.getProtected() values until shown
}
```
```swift tab="Swift"
let api = account.serverConfig().api       // or the share host's API, without an account
let info = try await client.shareInfo(api: api, shareId: try parseShareLink(link: link).id, cancel: cancel)
// Show a "Reveal" button and open only when it's pressed: link previews then can't use up a one-time link.
let passcode = info.kdf != nil ? Data(askForPasscode().utf8) : nil
let opened = try await client.openShare(api: api, link: Data(link.utf8), passcode: passcode, info: info, cancel: cancel)

for f in opened.payload.fields {
    let shown = f.k == "totp"
        ? try totpCode(params: try parseTotpUri(uri: f.value), nowMs: Int64(Date().timeIntervalSince1970 * 1000)).code
        : f.value
    // render as plain text; hide f.protected values until shown
}
```
```cpp tab="C++"
auto api = ov::call([&] { return account->server_config(); }).api;   // or the share host's API, without an account
auto parts = ov::call([&] { return ov::parse_share_link(link); });
ov::wipe(parts.key);
auto info = ov::call([&] { return client->share_info(api, parts.id, *cancel); });   // doesn't count as an open
// Show a "Reveal" button and open only when it's pressed: link previews then can't use up a one-time link.
ov::OpenShareInput input{to_bytes(link), false, {}, true, info};
if (info.has_kdf) { input.has_passcode = true; input.passcode = to_bytes(ask_for_passcode()); }
auto opened = ov::call([&] { return client->open_share(api, std::move(input), *cancel); });

for (const auto &f : opened.payload.fields) {
    // f.k == "totp": ov::totp_code(ov::parse_totp_uri(f.value), now_ms).code; hide f.is_protected values until shown
}
```

`openShare` fails with `not_found` for a link that ended or never existed (the two look the same),
`passcode_required` when a passcode is needed and none was given, and `invalid_passcode` with
`details.attemptsLeft` for a wrong one.

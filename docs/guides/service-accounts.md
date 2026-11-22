# Service accounts

A service account lets a program use a few vaults without anyone's password: CI jobs, servers, scripts.
It belongs to an organisation, gets grants like a person (`read`, `write` or `manage` per vault), and signs
in with a token, `ov_sa_…`. See [Concepts](../concepts.md#service-accounts).

If you only need secrets in a shell, CI job or Kubernetes, the [CLI](../cli.md), [GitHub Action](../github-action.md)
and [Connect](../connect.md) already do this. Use the SDK directly from your own code.

## Creating one

An organisation owner or admin creates it from their account:

<!-- prelude
import type { Account } from "@openvireo/sdk";
declare const account: Account, orgId: string, vaultId: string;
-->
```ts tab="TypeScript"
const { token } = await account.createServiceAccount(orgId, {
  name: "ci",
  vaults: [{ id: vaultId, role: "read" }],
  expiresAt: "2027-01-01T00:00:00Z",   // optional
});
// show `token` once; store it as a CI secret

const { token: second } = await account.issueServiceAccountSecret("<service account id>", { name: "staging" });
```
```python tab="Python"
created = await account.create_service_account(org_id, ov.NewServiceAccount(
    name="ci",
    vaults=[ov.VaultGrantRequest(vault_id=vault_id, role=ov.VaultRole.READ)],
    expires_at="2027-01-01T00:00:00Z",   # or None
    secret_name=None,
))
# show created.token once; store it as a CI secret

second = await account.issue_service_account_secret("<service account id>", "staging", None)
```
```kotlin tab="Kotlin"
val created = account.createServiceAccount(orgId, NewServiceAccount(
    name = "ci",
    vaults = listOf(VaultGrantRequest(vaultId, VaultRole.READ)),
    expiresAt = "2027-01-01T00:00:00Z",   // or null
    secretName = null,
), CancelToken())
// show created.token once; store it as a CI secret

val second = account.issueServiceAccountSecret("<service account id>", "staging", null, CancelToken())
```
```java tab="Java"
CreatedServiceAccount created = account.createServiceAccount(orgId, new NewServiceAccount(
    "ci", List.of(new VaultGrantRequest(vaultId, VaultRole.READ)), "2027-01-01T00:00:00Z", null)).join();
// show created.getToken() once; store it as a CI secret

IssuedSecret second = account.issueServiceAccountSecret("<service account id>", "staging", null).join();
```
```swift tab="Swift"
let created = try await account.createServiceAccount(orgId: orgId, input: NewServiceAccount(
    name: "ci", vaults: [VaultGrantRequest(vaultId: vaultId, role: .read)],
    expiresAt: "2027-01-01T00:00:00Z", secretName: nil), cancel: cancel)
// show created.token once; store it as a CI secret

let second = try await account.issueServiceAccountSecret(saId: "<service account id>", name: "staging", expiresAt: nil, cancel: cancel)
```
```cpp tab="C++"
ov::NewServiceAccount input{"ci", {ov::VaultGrantRequest{vault_id, ov::VaultRole::Read}}, "2027-01-01T00:00:00Z", ""};
auto created = ov::call([&] { return account->create_service_account(org_id, input, *cancel); });
// show created.token once; store it as a CI secret

auto second = ov::call([&] { return account->issue_service_account_secret("<service account id>", "staging", "", *cancel); });
```

A service account can have several tokens (secrets), each with its own name and expiry, so one can be
replaced without stopping everything else. `account.auth` lists, disables and revokes them
(`listServiceAccounts`, `updateServiceAccount`, `listSaSecrets`, `revokeSaSecret`).

## Reading and writing

<!-- prelude
declare const rotated: string;
-->
```ts tab="TypeScript"
import { ServiceAccount } from "@openvireo/sdk";

const sa = await ServiceAccount.fromToken(process.env.OPENVIREO_SERVICE_ACCOUNT_TOKEN!);
const password = await sa.read("ov://Team Infra/GitHub deploy key/password");

const { text, secrets } = await sa.inject("TOKEN=ov://Team%20Infra/CI/token\n");   // mask `secrets` in logs
await sa.write("ov://Team Infra/CI/token", rotated);                                // needs the write role
sa.close();   // wipes the keys from memory
```
```python tab="Python"
sa = await ov.ServiceAccount.from_token(client, os.environ["OPENVIREO_SERVICE_ACCOUNT_TOKEN"].encode())
password = await sa.read("ov://Team Infra/GitHub deploy key/password")

injected = await sa.inject(b"TOKEN=ov://Team%20Infra/CI/token\n")   # mask injected.secrets in logs
await sa.write("ov://Team Infra/CI/token", rotated, False)           # needs the write role
sa.close()   # wipes the keys from memory
```
```kotlin tab="Kotlin"
val sa = ServiceAccount.fromToken(client, System.getenv("OPENVIREO_SERVICE_ACCOUNT_TOKEN").toByteArray(), CancelToken())
val password = sa.read("ov://Team Infra/GitHub deploy key/password", CancelToken())

val injected = sa.inject("TOKEN=ov://Team%20Infra/CI/token\n".toByteArray(), CancelToken())   // mask injected.secrets
sa.write("ov://Team Infra/CI/token", rotated, false, CancelToken())   // needs the write role
sa.close()   // wipes the keys from memory
```
```java tab="Java"
JServiceAccount sa = JServiceAccount.fromToken(client,
    System.getenv("OPENVIREO_SERVICE_ACCOUNT_TOKEN").getBytes(StandardCharsets.UTF_8)).join();
byte[] password = sa.read("ov://Team Infra/GitHub deploy key/password").join();

Injected injected = sa.inject("TOKEN=ov://Team%20Infra/CI/token\n".getBytes(StandardCharsets.UTF_8)).join();
sa.write("ov://Team Infra/CI/token", rotated, false).join();   // needs the write role
sa.close();   // wipes the keys from memory
```
```swift tab="Swift"
let token = Data(ProcessInfo.processInfo.environment["OPENVIREO_SERVICE_ACCOUNT_TOKEN"]!.utf8)
let sa = try await ServiceAccount.fromToken(client: client, token: token, cancel: cancel)
let password = try await sa.read(reference: "ov://Team Infra/GitHub deploy key/password", cancel: cancel)

let injected = try await sa.inject(template: Data("TOKEN=ov://Team%20Infra/CI/token\n".utf8), cancel: cancel)
try await sa.write(reference: "ov://Team Infra/CI/token", value: rotated, create: false, cancel: cancel)
sa.close()   // wipes the keys from memory
```
```cpp tab="C++"
auto sa = ov::call([&] {
    return ov::service_account_from_token(*client, to_bytes(std::getenv("OPENVIREO_SERVICE_ACCOUNT_TOKEN")), *cancel);
});
auto password = ov::call([&] { return sa->read("ov://Team Infra/GitHub deploy key/password", *cancel); });

auto injected = ov::call([&] { return sa->inject(to_bytes("TOKEN=ov://Team%20Infra/CI/token\n"), *cancel); });
ov::call([&] { sa->write("ov://Team Infra/CI/token", std::move(rotated), false, *cancel); });   // needs write
ov::call([&] { sa->close(); });   // wipes the keys from memory
```
```sh tab="ov CLI"
export OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_…
ov read "ov://Team Infra/GitHub deploy key/password"
ov inject -i config.yml.tpl -o config.yml
ov run --env-file .env.tpl -- ./deploy.sh    # resolved values are masked in the output
```

`fromToken` exchanges the token for an access token and opens the service account's keys. Access tokens are
short-lived; the service account exchanges again on its own when one is about to expire.

`inject` replaces every reference in a template: a bare `ov://…` runs up to whitespace, a quote, a backtick or
`}`; use `{{ ov://… }}` when other text follows it.

## Long-running processes and whole entries

For servers that read the same vaults again and again, `pull` only downloads when the vault changed, and
`edit` changes a vault with the conditional upload and merge loop:

<!-- prelude
import type { ServiceAccount } from "@openvireo/sdk";
declare const sa: ServiceAccount, token: string;
-->
```ts
import { findEntry, itemOf, listItems, parseItemReference, setItemFields } from "@openvireo/sdk";

const db = await sa.pull("Team Infra");   // a HEAD with the last ETag; downloads only if it changed
listItems(db);                            // [{ id, title, group, fields: {}, protected, … }] without values
itemOf(findEntry(db, parseItemReference("ov://Team%20Infra/Deploy/Database")), { reveal: true });

await sa.edit("Team Infra", (db) =>
  setItemFields(db, { groupPath: ["Apps"], entry: "Api" }, { username: "svc", token }, { create: true }),
);
```

Edits of one vault run one at a time. If an upload fails, the cached copy is dropped, so a failed edit is
never read back. A service account with only `read` gets `forbidden` before anything is sent.

To keep a granted vault as a `.kdbx` file of your own (as the desktop app does), `sa.core.vaultKdbxCredentials(vaultId)`
gives the key it is under (a secret: wipe it) and `sa.core.syncVaultKdbx(vaultId, bytes, base)` syncs the file,
with `base` the server's bytes from your last sync (a service account keeps no offline cache).

## Good practice

- Give each service account the fewest vaults and the lowest role that work. Use one per environment or job.
- Give tokens an expiry, and rotate them by issuing a new one before revoking the old.
- Keep the token in your CI's secret store or a file readable only by the process, never in the repository.
- Values you read are secrets too: mask them in logs (`inject` returns them in `secrets` for that).

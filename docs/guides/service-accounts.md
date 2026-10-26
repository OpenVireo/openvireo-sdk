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
```ts
const { token } = await account.createServiceAccount(orgId, {
  name: "ci",
  vaults: [{ id: vaultId, role: "read" }],
  expiresAt: "2027-01-01T00:00:00Z",   // optional
});
// show `token` once; store it as a CI secret

const { token: second } = await account.issueServiceAccountSecret("<service account id>", { name: "staging" });
```

A service account can have several tokens (secrets), each with its own name and expiry, so one can be
replaced without stopping everything else. `account.auth` lists, disables and revokes them
(`listServiceAccounts`, `updateServiceAccount`, `listSaSecrets`, `revokeSaSecret`).

## Reading and writing

<!-- prelude
declare const rotated: string;
-->
```ts
import { ServiceAccount } from "@openvireo/sdk";

const sa = await ServiceAccount.fromToken(process.env.OPENVIREO_SERVICE_ACCOUNT_TOKEN!);
const password = await sa.read("ov://Team Infra/GitHub deploy key/password");

const { text, secrets } = await sa.inject("TOKEN=ov://Team%20Infra/CI/token\n");   // mask `secrets` in logs
await sa.write("ov://Team Infra/CI/token", rotated);                                // needs the write role
sa.close();   // wipes the keys from memory
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

## Good practice

- Give each service account the fewest vaults and the lowest role that work. Use one per environment or job.
- Give tokens an expiry, and rotate them by issuing a new one before revoking the old.
- Keep the token in your CI's secret store or a file readable only by the process, never in the repository.
- Values you read are secrets too: mask them in logs (`inject` returns them in `secrets` for that).

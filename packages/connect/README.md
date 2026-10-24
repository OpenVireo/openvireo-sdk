# @openvireo/connect: `kpx connect`

A small self-hosted REST server that holds **one service account token** and gives any language
HTTP access to the vaults that service account can open. Callers use connect's **own bearer tokens**
(`kpx_ct_…`), never the SA token: each one is stored only as its SHA-256 and can be limited to some
vaults and to read or write. Vault data is decrypted inside kpx connect, so run it next to its callers
(same host, pod network) and not on the public internet.

Writes go through the SDK's conditional PUT with merge/retry (`If-Match`; on 412 download, merge, retry),
so connect, the CLI, Qt and the web app can all edit the same vault. A service account with a `read`
grant gets 403 on every write.

## Run

```sh
# 1. a connect token (printed once) and its config entry (hash only)
kpx connect token --name eso --vault "Team Infra" > eso.token 2> entry.txt
tail -1 entry.txt   # {"name":"eso","sha256":"…","vaults":["Team Infra"],"access":"read"}
echo "[$(tail -1 entry.txt)]" > tokens.json

# 2. the server
KPX_SERVICE_ACCOUNT_TOKEN=kpx_sa_… KPX_CONNECT_TOKENS_FILE=tokens.json kpx connect
# kpx connect listening on http://127.0.0.1:8080 (1 token)

curl -H "Authorization: Bearer $(cat eso.token)" \
  "http://127.0.0.1:8080/v1/vaults/Team%20Infra/items/Deploy/Database?field=password"
# {"value":"…"}
```

`kpx connect` is the same as `kpx-connect serve` (this package's bin, `node dist/bin.js`).

| Variable | Default | |
|---|---|---|
| `KPX_SERVICE_ACCOUNT_TOKEN` / `_FILE` | required | the `kpx_sa_…` token |
| `KPX_CONNECT_TOKENS` / `_FILE` | | JSON array (or `{"tokens":[…]}`) of `{name, sha256, vaults, access}` |
| `KPX_CONNECT_TOKEN` / `_FILE` | | one plain token for every vault; `KPX_CONNECT_TOKEN_ACCESS=write` to allow writes |
| `KPX_CONNECT_HOST` | `127.0.0.1` | `0.0.0.0` in a container |
| `KPX_CONNECT_PORT` | `8080` | |
| `KPX_CONNECT_CACHE_TTL` | `5` | seconds a vault copy is served before a `HEAD` check (`If-None-Match`) against the sync server |
| `KPX_CONNECT_TLS_CERT`, `KPX_CONNECT_TLS_KEY` | | PEM files: serve HTTPS |

At least one connect token is required. `vaults` entries are vault ids or names, or `"*"`.

## API

`{vault}` is a vault id or name and `{entry}` an entry UUID (32 hex digits) or a unique title, with
any group path in front. Path segments are percent-encoded. Errors are `{"error","code"}` (codes as in
the auth API: `unauthorized` 401, `forbidden` 403, `not_found` 404, `invalid_request` 400,
`conflict` 409; `upstream_unauthorized`/`upstream_error` 502 when the auth or sync server refuses the
SA). Responses carry `Cache-Control: no-store`.

| Method and path | |
|---|---|
| `GET /health` | liveness, no auth |
| `GET /ready` | 200 once the SA token works, no auth |
| `GET /v1/vaults` | `{"vaults":[{id,name,role}]}`: vaults the SA can open and the token may use |
| `GET /v1/vaults/{vault}` | one of those |
| `GET /v1/vaults/{vault}/items` | `{"items":[Item]}` without values (`fields` is empty; `protected` lists names) |
| `GET /v1/vaults/{vault}/items/{group/…/entry}` | the Item with every value |
| `GET …/items/{group/…/entry}?field=password` | `{"value":"…"}`; with `Accept: text/plain`, the raw value |
| `PUT /v1/vaults/{vault}/items/{group/…/entry}` | body `{"fields":{"name":"value",…},"protected":{"name":true}}`; creates the entry (201) or updates those fields (200), keeping history. `?create=false` updates only (404 if missing). Needs a `write` token and a `write` grant. The response omits protected values. |

An Item is `{id, title, group: [names], fields: {name: value}, protected: [names], tags, updatedAt}`.
Field names are KeePassXC's (`Title`, `UserName`, `Password`, `URL`, `Notes`, custom names); requests also
accept `username`, `password`, `url`, `notes`, `title` and any case. Password and custom fields are
stored protected unless `protected` says otherwise.

The vault list is refreshed every 60 s, so a new grant shows up within a minute. Unknown vaults, and
vaults outside a token's scope, both answer 404.

## Kubernetes: External Secrets Operator

kpx connect plugs into ESO's built-in **webhook provider**; there is no custom operator. In `deploy/`:

- `kubernetes/`: `kubectl apply -k` manifests: namespace, the two Secrets as placeholders
  (`secrets.example.yaml`), the Deployment (non-root, read-only root filesystem, probes on `/ready`
  and `/health`), Service, a NetworkPolicy that only lets the `external-secrets` namespace in, and two
  `ClusterSecretStore`s. `external-secret.example.yaml` shows the consumer side.
- `helm/kpx-connect/`: the same as a chart (`existingSecret` or `serviceAccountToken` + `connectTokens`,
  `externalSecrets.token` for the ESO Secret, `networkPolicy.allowedNamespaces`).
- `helm/external-secrets-values.yaml`: values for the upstream ESO chart.

```sh
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace \
  -f packages/connect/deploy/helm/external-secrets-values.yaml
kpx connect token --name eso > eso.token 2> entry.txt
helm install kpx packages/connect/deploy/helm/kpx-connect -n kpx-connect --create-namespace \
  --set-file serviceAccountToken=sa.token --set-json "connectTokens=[$(tail -1 entry.txt)]" \
  --set-file externalSecrets.token=eso.token
```

The stores (`apiVersion: external-secrets.io/v1`, ESO ≥ 0.17; use `v1beta1` on older releases):

- `kpx`: one field per `remoteRef`, `key: "Team%20Infra/items/Deploy/Database"`, `property: password`
  (calls `…/items/…?field=password`, result `$.value`). `property` is required.
- `kpx-items`: `dataFrom: [{extract: {key: "Team%20Infra/items/GitHub"}}]` makes every field of the item a key
  of the Secret (result `$.fields`).

The image is built from the repository root with `docker build -f packages/connect/Dockerfile -t kpx-connect .`
(Bun single binary on distroless). It is not published yet: push it to your registry and set `image`.

## Library

```ts
import { createConnectHandler, newConnectToken } from "@openvireo/connect";
import { ServiceAccount } from "@openvireo/sdk";

const sa = await ServiceAccount.fromToken(process.env.KPX_SERVICE_ACCOUNT_TOKEN!);
const { token, entry } = newConnectToken({ name: "app", access: "write" });
const handler = createConnectHandler({ source: sa, tokens: [entry] }); // (Request) => Promise<Response>
Bun.serve({ port: 8080, fetch: handler });
```

## Development

```sh
npm run typecheck -w @openvireo/connect && npm test -w @openvireo/connect && npm run build -w @openvireo/connect
helm lint deploy/helm/kpx-connect --set serviceAccountToken=x --set 'connectTokens[0].name=a' --set "connectTokens[0].sha256=$(printf 'a%.0s' {1..64})"
kubectl kustomize deploy/kubernetes
```

The tests run the handler and a real HTTP listener against the SDK's in-memory auth and sync servers
(`packages/sdk/test/helpers/world.ts`), including scoped tokens, read-only rejection and a 412 race.

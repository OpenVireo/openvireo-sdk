# Connect: `ov connect`

A small self-hosted REST server that holds **one service account token** and gives any language
HTTP access to the vaults that service account can open. Callers use connect's **own bearer tokens**
(`ov_ct_…`), never the SA token: each one is stored only as its SHA-256 and can be limited to some
vaults and to read or write. Vault data is decrypted inside ov connect, so run it next to its callers
(same host, pod network) and not on the public internet.

Writes go through the same conditional PUT with merge/retry as the apps (`If-Match`; on 412 download, merge, retry),
so connect, the CLI, Qt and the web app can all edit the same vault. A service account with a `read`
grant gets 403 on every write.

## Install

Connect is part of `ov`, the native binary from
[openvireo-core's releases](https://github.com/OpenVireo/openvireo-core/releases) (from 1.2.0): install `ov`
as in [CLI: Install](cli.md#install) and run `ov connect`. Nothing else is needed. The binaries are signed and
the checksums GPG-signed; see [Verifying the binaries](cli.md#verifying-the-binaries).

```sh
ov connect --help
ov connect version
```

For containers, the core release also publishes the image `ghcr.io/openvireo/openvireo-connect` (linux amd64
and arm64, distroless, non-root), tagged with the core version. Its entrypoint is `ov`, running `ov connect`:

```sh
# VERSION: the core release without the v, e.g. 1.2.0
docker run --rm -p 8080:8080 -e OPENVIREO_CONNECT_HOST=0.0.0.0 \
  -e OPENVIREO_SERVICE_ACCOUNT_TOKEN_FILE=/run/secrets/sa.token -e OPENVIREO_CONNECT_TOKENS_FILE=/run/secrets/tokens.json \
  -v "$PWD/secrets:/run/secrets:ro" ghcr.io/openvireo/openvireo-connect:VERSION
```

To build `ov` from source, see [Building from source](cli.md#building-from-source).

## Run

```sh
# 1. a connect token (printed once) and its config entry (hash only)
ov connect token --name eso --vault "Team Infra" > eso.token 2> entry.txt
tail -1 entry.txt   # {"name":"eso","sha256":"…","vaults":["Team Infra"],"access":"read"}
echo "[$(tail -1 entry.txt)]" > tokens.json

# 2. the server
OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_… OPENVIREO_CONNECT_TOKENS_FILE=tokens.json ov connect
# ov connect listening on http://127.0.0.1:8080 (1 token)

curl -H "Authorization: Bearer $(cat eso.token)" \
  "http://127.0.0.1:8080/v1/vaults/Team%20Infra/items/Deploy/Database?field=password"
# {"value":"…"}
```

`ov connect` is the same as `ov connect serve`. `ov connect token [--name N] [--vault V]... [--write]` prints
a new token on stdout and its config entry as the last line on stderr; `ov connect version` prints the
version. The server logs one line per request on stderr (time, method, path, status, token name), never
values.

| Variable | Default | |
|---|---|---|
| `OPENVIREO_SERVICE_ACCOUNT_TOKEN` / `_FILE` | required | the `ov_sa_…` token |
| `OPENVIREO_CONNECT_TOKENS` / `_FILE` | | JSON array (or `{"tokens":[…]}`) of `{name, sha256, vaults, access}` |
| `OPENVIREO_CONNECT_TOKEN` / `_FILE` | | one plain token for every vault; `OPENVIREO_CONNECT_TOKEN_ACCESS=write` to allow writes |
| `OPENVIREO_CONNECT_HOST` | `127.0.0.1` | `0.0.0.0` in a container |
| `OPENVIREO_CONNECT_PORT` | `8080` | |
| `OPENVIREO_CONNECT_CACHE_TTL` | `5` | seconds a vault copy is served before a `HEAD` check (`If-None-Match`) against the sync server |
| `OPENVIREO_CONNECT_TLS_CERT`, `OPENVIREO_CONNECT_TLS_KEY` | | PEM files: serve HTTPS |

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
Field names are KeePass's (`Title`, `UserName`, `Password`, `URL`, `Notes`, custom names); requests also
accept `username`, `password`, `url`, `notes`, `title` and any case. Password and custom fields are
stored protected unless `protected` says otherwise.

The vault list is refreshed every 60 s, so a new grant shows up within a minute. Unknown vaults, and
vaults outside a token's scope, both answer 404.

## Kubernetes: External Secrets Operator

ov connect plugs into ESO's built-in **webhook provider**; there is no custom operator. The manifests are in
openvireo-core, in [`deploy/connect/`](https://github.com/OpenVireo/openvireo-core/tree/develop/deploy/connect),
next to the image they run:

- `kubernetes/`: `kubectl apply -k deploy/connect/kubernetes` manifests: namespace, the two Secrets as
  placeholders (`secrets.example.yaml`), the Deployment (non-root, read-only root filesystem, probes on
  `/ready` and `/health`), Service, a NetworkPolicy that only lets the `external-secrets` namespace in, and two
  `ClusterSecretStore`s. `external-secret.example.yaml` shows the consumer side.
- `helm/openvireo-connect/`: the same as a chart (`existingSecret` or `serviceAccountToken` + `connectTokens`,
  `externalSecrets.token` for the ESO Secret, `networkPolicy.allowedNamespaces`). It runs
  `ghcr.io/openvireo/openvireo-connect` at the chart's `appVersion` (the core version) by default.
- `helm/external-secrets-values.yaml`: values for the upstream ESO chart.

```sh
git clone https://github.com/OpenVireo/openvireo-core && cd openvireo-core   # check out the release tag you run
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace \
  -f deploy/connect/helm/external-secrets-values.yaml
ov connect token --name eso > eso.token 2> entry.txt
helm install openvireo deploy/connect/helm/openvireo-connect -n openvireo-connect --create-namespace \
  --set-file serviceAccountToken=sa.token --set-json "connectTokens=[$(tail -1 entry.txt)]" \
  --set-file externalSecrets.token=eso.token
```

The stores (`apiVersion: external-secrets.io/v1`, ESO ≥ 0.17; use `v1beta1` on older releases):

- `openvireo`: one field per `remoteRef`, `key: "Team%20Infra/items/Deploy/Database"`, `property: password`
  (calls `…/items/…?field=password`, result `$.value`). `property` is required.
- `openvireo-items`: `dataFrom: [{extract: {key: "Team%20Infra/items/GitHub"}}]` makes every field of the item a key
  of the Secret (result `$.fields`).

## Migrating from openvireo-connect

Before openvireo-core 1.2.0, connect was a separate program, `openvireo-connect`: a Bun single binary on the
SDK's releases (up to SDK 1.1.0), the `@openvireo/connect` package on GitHub Packages, and an image you built
yourself from `packages/connect/Dockerfile`.
`ov connect` replaces it with the same environment variables, the same token format and config entries, the
same routes, responses and status codes, and the same `User-Agent` (`openvireo-connect/<version>`) towards
the auth and sync servers. To move, swap the program and keep the config:

- A binary or systemd unit: replace `openvireo-connect` with `ov connect` (`openvireo-connect token …` becomes
  `ov connect token …`).
- A container: use `ghcr.io/openvireo/openvireo-connect:<core version>` instead of your own image.
- Helm or kustomize: use the chart and manifests in openvireo-core `deploy/connect/`; the values are the same.
  They lived in this repo's `packages/connect/deploy/` before.
- The `@openvireo/connect` package (including `createConnectHandler` for embedding): removed after SDK 1.2.0,
  from this repo and from GitHub Packages. Run `ov connect` next to your app and call its REST API instead.

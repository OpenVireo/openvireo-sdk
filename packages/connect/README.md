# @openvireo/connect: `openvireo-connect` / `ov connect`

A small self-hosted REST server that holds **one service account token** and gives any language
HTTP access to the vaults that service account can open, with its own scoped bearer tokens. It plugs into
the External Secrets Operator on Kubernetes (`deploy/`).

```sh
ov connect token --name app --vault "Team Infra" > app.token 2> entry.txt
OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_… OPENVIREO_CONNECT_TOKENS="[$(tail -1 entry.txt)]" ov connect
curl -H "Authorization: Bearer $(cat app.token)" \
  "http://127.0.0.1:8080/v1/vaults/Team%20Infra/items/Deploy/Database?field=password"
```

This package's own bin is `openvireo-connect` (`openvireo-connect [serve]`, `openvireo-connect token …`,
`openvireo-connect --version`); `ov connect` is the same server inside the CLI.

Download the signed `openvireo-connect` binary from the
[releases](https://github.com/OpenVireo/openvireo-sdk/releases), or build it from source; see
[Install](../../docs/connect.md#install).

**Documentation:** [docs/connect.md](../../docs/connect.md), also on
[openvireo.com/docs/sdk/connect](https://openvireo.com/docs/sdk/connect/).

## Development

```sh
npm run typecheck -w @openvireo/connect && npm test -w @openvireo/connect && npm run build -w @openvireo/connect
helm lint deploy/helm/openvireo-connect --set serviceAccountToken=x --set 'connectTokens[0].name=a' --set "connectTokens[0].sha256=$(printf 'a%.0s' {1..64})"
kubectl kustomize deploy/kubernetes
```

The tests run the handler and a real HTTP listener against the SDK's in-memory auth and sync servers
(`packages/sdk/test/helpers/world.ts`), including scoped tokens, read-only rejection and a 412 race.

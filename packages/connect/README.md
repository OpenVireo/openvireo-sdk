# @openvireo/connect (deprecated)

> **Deprecated: use `ov connect` from [openvireo-core](https://github.com/OpenVireo/openvireo-core/releases)
> or the container image `ghcr.io/openvireo/openvireo-connect`.** They take the same environment variables
> and serve the same API, so moving is a swap of the binary or image. This is the last release of this
> package; see [Migrating from openvireo-connect](../../docs/connect.md#migrating-from-openvireo-connect).
> The Helm chart and Kubernetes manifests moved to openvireo-core
> [`deploy/connect/`](https://github.com/OpenVireo/openvireo-core/tree/develop/deploy/connect).

The TypeScript version of connect: a small self-hosted REST server that holds **one service account token**
and gives any language HTTP access to the vaults that service account can open, with its own scoped bearer
tokens.

```sh
ov connect token --name app --vault "Team Infra" > app.token 2> entry.txt
OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_… OPENVIREO_CONNECT_TOKENS="[$(tail -1 entry.txt)]" ov connect
curl -H "Authorization: Bearer $(cat app.token)" \
  "http://127.0.0.1:8080/v1/vaults/Team%20Infra/items/Deploy/Database?field=password"
```

This package's bin, `openvireo-connect` (`openvireo-connect [serve]`, `openvireo-connect token …`,
`openvireo-connect --version`), still works the same way, and prints a deprecation notice on stderr when it
starts serving. `createConnectHandler` and `newConnectToken` are still exported for embedding.

**Documentation:** [docs/connect.md](../../docs/connect.md), also on
[developer.openvireo.com/cli/connect/](https://developer.openvireo.com/cli/connect/).

## Development

```sh
npm run typecheck -w @openvireo/connect && npm test -w @openvireo/connect && npm run build -w @openvireo/connect
```

The tests run the handler and a real HTTP listener against the SDK's in-memory auth and sync servers
(`packages/sdk/test/helpers/world.ts`), including scoped tokens, read-only rejection and a 412 race.

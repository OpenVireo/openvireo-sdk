# @openvireo/cli: `ov`

Read, inject and rotate OpenVireo vault secrets from scripts, CI and servers, with a **service
account** (`OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_…`) or your own **login**.

```sh
export OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_…
ov read ov://Team%20Infra/GitHub/password
ov run --env-file .env.tpl -- ./migrate.sh     # references resolved in the environment, output masked
```

**Documentation:** [docs/cli.md](../../docs/cli.md), also on
[openvireo.com/docs/sdk/cli](https://openvireo.com/docs/sdk/cli/).

## Single binary

Each [release](https://github.com/OpenVireo/openvireo-sdk/releases) has `ov` binaries for Linux, macOS
and Windows; see [Install](../../docs/cli.md#install). To build one:

```sh
npm run build:binary -w @openvireo/cli     # builds the SDK and connect, then bun build --compile … src/bin.ts --outfile dist/ov
npm run smoke -w @openvireo/cli            # runs dist/ov against the in-memory servers over HTTP
```

## Development

```sh
npm run typecheck -w @openvireo/cli && npm test -w @openvireo/cli
```

Tests run `main()` against the SDK's in-memory auth and sync servers
(`packages/sdk/test/helpers/world.ts`), which enforce vault roles like the sync server. They cover
reference parsing, masking (chunk splits, overlapping and multi-line secrets, UTF-8), `.env` parsing,
`run` with real child processes, read-only rejection, a 412 race during `rotate` and human login.

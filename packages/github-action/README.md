# KeePassXC load secrets (GitHub Action)

Loads secrets from KeePassXC vaults into a job with a **kpx service account**, and masks every value
in the logs. It is a JavaScript action (`runs: node24`, one bundled file, `dist/index.mjs`); nothing is
installed at run time.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Load secrets
        uses: <owner>/kpnx-sdk/packages/github-action@<ref>
        with:
          service-account-token: ${{ secrets.KPX_SERVICE_ACCOUNT_TOKEN }}
          secrets: |
            DEPLOY_KEY=kpx://Team%20Infra/GitHub%20deploy%20key/password
        env:
          # any env value with a kpx:// reference is loaded too, under the same name
          DB_PASSWORD: kpx://Team%20Infra/Deploy/Database/password
          DATABASE_URL: postgres://app:{{ kpx://Team%20Infra/Deploy/Database/password }}@db/app

      - run: ./deploy.sh   # $DEPLOY_KEY, $DB_PASSWORD and $DATABASE_URL are set; echoing them prints ***
```

| Input | Default | |
|---|---|---|
| `service-account-token` | `$KPX_SERVICE_ACCOUNT_TOKEN` | the `kpx_sa_…` token (store it as a repository or environment secret) |
| `secrets` | | extra `NAME=kpx://…` lines (`#` comments allowed) |
| `export-env` | `true` | `true`: export to `$GITHUB_ENV` for the following steps; `false`: only set step outputs (`steps.<id>.outputs.NAME`) |

Output `loaded` lists the names that were set.

References are `kpx://<vault id or name>/[<group>/…]<entry uuid or title>/<field>`, percent-encoded; use
`{{ kpx://… }}` when other text follows the reference in the same value. Every resolved value, every
line (4+ characters) of a multi-line value, the complete templated value and the SA token itself are
registered with `::add-mask::` before anything is exported, so later steps' logs show `***`. If any
reference fails (unknown vault or entry, revoked token), the step fails with `::error::` and nothing is
exported. `KPX_SERVICE_ACCOUNT_TOKEN`, `PATH`, `NODE_OPTIONS` and the `GITHUB_*` file variables are never
overwritten.

Give the service account a `read` grant on just the vaults the workflow needs. To change secrets from a
workflow (`kpx rotate`), use the CLI with a `write` grant instead:

```yaml
      - run: kpx rotate kpx://Team%20Infra/CI/token --generate
        env:
          KPX_SERVICE_ACCOUNT_TOKEN: ${{ secrets.KPX_SERVICE_ACCOUNT_TOKEN }}
```

## Development

```sh
npm run typecheck -w @kpnx/github-action
npm test -w @kpnx/github-action
npm run build -w @kpnx/github-action   # rebuilds dist/index.mjs: commit it with the source change
```

The bundle maps `@kpnx/sdk` and `@kpnx/cli` to their sources and leaves out the libopaque WASM build
(a service account never runs OPAQUE). Tests run the action against the SDK's in-memory auth and sync
servers and check that the committed bundle loads in plain Node.

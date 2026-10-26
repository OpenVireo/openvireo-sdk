# OpenVireo load secrets (GitHub Action)

Loads secrets from OpenVireo vaults into a job with a service account, and masks every value in the logs.

```yaml
      - uses: openvireo/openvireo-sdk/packages/github-action@<ref>
        with:
          service-account-token: ${{ secrets.OPENVIREO_SERVICE_ACCOUNT_TOKEN }}
          secrets: |
            DEPLOY_KEY=ov://Team%20Infra/GitHub%20deploy%20key/password
```

**Documentation:** [docs/github-action.md](../../docs/github-action.md), also on
[openvireo.com/docs/sdk/github-action](https://openvireo.com/docs/sdk/github-action/).

## Development

```sh
npm run typecheck -w @openvireo/github-action
npm test -w @openvireo/github-action
npm run build -w @openvireo/github-action   # rebuilds dist/index.mjs: commit it with the source change
```

The bundle maps `@openvireo/sdk` and `@openvireo/cli` to their sources and leaves out the OPAQUE WASM module
(a service account never runs OPAQUE). Tests run the action against the SDK's in-memory auth and sync
servers and check that the committed bundle loads in plain Node.

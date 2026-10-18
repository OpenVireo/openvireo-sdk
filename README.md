# kpnx-sdk

npm workspace for the KeePassXC accounts/sharing client code.

| Package | |
|---|---|
| [`packages/sdk`](packages/sdk/README.md) | `@kpnx/sdk`: the shared TypeScript SDK (crypto, OPAQUE, auth and sync clients, vault, merge, `ServiceAccount`) |
| [`packages/cli`](packages/cli/README.md) | `kpx`: `read`, `inject`, `run` (masked output), `item`, `rotate`, `login`; a Bun single binary |
| [`packages/connect`](packages/connect/README.md) | `kpx connect`: REST server holding one service account token; `deploy/` has ESO webhook manifests and Helm values |
| [`packages/github-action`](packages/github-action/README.md) | JavaScript action that loads secrets into a job and masks them (`action.yml`, bundled `dist/`) |

```sh
npm install
npm run typecheck && npm test && npm run build    # every package, the SDK first
npm run build:binary -w @kpnx/cli                 # packages/cli/dist/kpx (needs Bun)
npm run smoke -w @kpnx/cli                        # runs that binary against in-memory servers over HTTP
```

The CLI, connect and the action type-check and test against the SDK's sources (tsconfig `paths` and
vitest aliases), and share the in-memory servers in `packages/sdk/test/helpers/world.ts`.

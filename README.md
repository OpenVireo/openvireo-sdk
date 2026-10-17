# kpnx-sdk

npm workspace for the KeePassXC accounts/sharing client code.

- `packages/sdk`: `@kpnx/sdk`, the shared TypeScript SDK (crypto, OPAQUE, auth and sync clients, vault, merge).
  See [packages/sdk/README.md](packages/sdk/README.md).
- Planned (Phase 5, built on the SDK): `packages/cli` (`kpx`, a Bun single binary), `packages/connect`
  (`kpx connect` REST server and ESO webhook manifests), `packages/github-action`.

```sh
npm install && npm run typecheck && npm test
```

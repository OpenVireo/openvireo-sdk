# openvireo-sdk

npm workspace for the OpenVireo accounts/sharing client code. OpenVireo is a fork of KeePassXC.

| Package | |
|---|---|
| [`packages/sdk`](packages/sdk/README.md) | `@openvireo/sdk`: the shared TypeScript SDK (crypto, OPAQUE, auth and sync clients, vault, merge, `ServiceAccount`) |
| [`packages/cli`](packages/cli/README.md) | `openvireo` (alias `ov`): `read`, `inject`, `run` (masked output), `item`, `rotate`, `login`; a Bun single binary |
| [`packages/connect`](packages/connect/README.md) | `openvireo connect`: REST server holding one service account token; `deploy/` has ESO webhook manifests and Helm values |
| [`packages/github-action`](packages/github-action/README.md) | JavaScript action that loads secrets into a job and masks them (`action.yml`, bundled `dist/`) |

```sh
npm install
npm run typecheck && npm test && npm run build    # every package, the SDK first
npm run build:binary -w @openvireo/cli            # packages/cli/dist/openvireo (needs Bun)
npm run smoke -w @openvireo/cli                   # runs that binary against in-memory servers over HTTP
```

The CLI, connect and the action type-check and test against the SDK's sources (tsconfig `paths` and
vitest aliases), and share the in-memory servers in `packages/sdk/test/helpers/world.ts`.

## Releasing

Bump `version` in `packages/{sdk,connect,cli}/package.json` (they release together; keep the exact
cross-package pins in step), commit, then push a matching tag: `git tag v0.1.0 && git push origin v0.1.0`.
`.github/workflows/release.yml` tests, builds and packs once, then publishes the same tarballs to:

- **GitHub Packages**, always.
- **npmjs.com**, once the repository variable `NPMJS_PUBLISH` is `true`. The first publish needs an
  `NPM_TOKEN` secret (a granular token that can publish `@openvireo/*`); after it, add this repo and
  `release.yml` as a trusted publisher for each package on npmjs.com and delete the secret.

Installing from GitHub Packages needs a token with `read:packages`, even for public packages:

```sh
echo "@openvireo:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}" >> .npmrc
npm install @openvireo/sdk
```

## License

Licensed under either of [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at your option.
Unless you state otherwise, any contribution you submit for inclusion is dual licensed the same way,
without additional terms. Third-party notices for the OPAQUE WASM module are in
`packages/sdk/vendor/opaque/THIRD-PARTY-LICENSES.txt`.

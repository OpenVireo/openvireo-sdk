# Changelog

What changed in each release of `@openvireo/sdk`, the `ov` CLI's TypeScript side and the GitHub Action.
The SDK follows [Semantic Versioning](https://semver.org). Releases before 1.0.0 are listed on
[GitHub](https://github.com/openvireo/openvireo-sdk/releases).

## Unreleased

- **Removed** `@openvireo/connect`. Run `ov connect` from openvireo-core instead.
- Releases publish to npmjs.com by trusted publishing, with no token.

## 1.2.0

2026-11-24

- `ov connect` in openvireo-core's native `ov` replaces the `openvireo-connect` binaries.
  `@openvireo/connect` is deprecated, and 1.2.0 is its last release.
- `@openvireo/sdk` is on npmjs.com (from 2026-11-28), so installing it no longer needs a GitHub token.

## 1.1.0

2026-11-24

- **Added** entry custom icons: `addCustomIconToDb`, `setEntryCustomIconInDb`, `customIconPng`, and
  `customIcon` in `addEntryToDb`, `editEntryInDb` and `collectAllDbData`.

## 1.0.1

2026-11-23

- On `@openvireo/core-wasm` 1.1.0.

## 1.0.0

2026-11-22

The SDK on the shared Rust core. See [Migrating to 1.0](docs/migrating-to-1.0.md).

- The vault, sync and crypto code is openvireo-core, compiled to wasm; kdbxweb is gone.
- `shareWithKeys`, `SelfHostedSync.download` and new error codes (contract v1.8).
- Device lists can show `android`.
- Syncing a move and an edit of the same entry keeps the copy that moved last where it is.
- `ov` comes from openvireo-core as a native binary. The TypeScript `ov` ended at 0.11.0.

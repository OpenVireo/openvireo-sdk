# Signed release binaries

`release.yml` signs the single binaries of `ov` and `openvireo-connect` before it packs and checksums them,
and signs the checksums. It reuses the desktop app's signing identities (OpenVireo/openvireo,
`.github/RELEASE-SIGNING.md` there); only the secrets have to be set again here, since secret values can't
be copied between repositories.

| What | How | Job |
| --- | --- | --- |
| macOS (x64, arm64) | Developer ID Application signature, hardened runtime, notarized | `sign-macos` (`scripts/macos/sign.sh`) |
| Windows (x64) | Azure Artifact Signing (Authenticode, RFC 3161 timestamp) through SignTool's dlib | `sign-windows` |
| Linux | none; covered by the signed checksums | |
| `SHA256SUMS` | detached GPG signature `SHA256SUMS.asc` with the OpenVireo release key | `github-release` |

The order is: `binaries` compiles everything unpacked (`scripts/build-binaries.sh --compile-only`), the signing
jobs sign the macOS and Windows executables in place, `pack` packs them and writes `SHA256SUMS`
(`--pack-only`), and `verify-binaries` checks the signatures in the release archives on each platform
(`codesign --verify --strict`, `spctl` must report `source=Notarized Developer ID`, `Get-AuthenticodeSignature`
must be `Valid`) and runs the binaries, on macOS including the OPAQUE login smoke test.

## When signing runs

All signing secrets live in the repository's **`signing` environment**, which only allows `v*` tags. The
signing jobs use that environment only on a tag push, or on a manual run with the `sign` input.

- **Release tag:** signing is required. If a secret or variable is missing, the job fails with an error and
  no release is created; it never ships unsigned binaries.
- **Manual run from a branch** (`gh workflow run release.yml --ref <branch>`): no environment, no secrets.
  Signing is skipped with a warning and the rest builds and tests as usual; the Windows job then signs a copy
  with a throwaway self-signed certificate to check that a signed Bun executable still runs.
- **Pull requests** never run this workflow (`ci.yml` has no secrets), and forks have no access to the
  environment.

To try signing from a branch, allow it in the environment for the test, run with `sign`, then remove it:

```sh
gh api -X POST repos/OpenVireo/openvireo-sdk/environments/signing/deployment-branch-policies -f name=my-branch -f type=branch
gh workflow run release.yml -R OpenVireo/openvireo-sdk --ref my-branch -f sign=true
gh api repos/OpenVireo/openvireo-sdk/environments/signing/deployment-branch-policies   # find its id, then:
gh api -X DELETE repos/OpenVireo/openvireo-sdk/environments/signing/deployment-branch-policies/<id>
```

## Secrets and variables (environment `signing`)

| Name | Kind | Value |
| --- | --- | --- |
| `MACOS_CERTIFICATE_P12` | secret | base64 of the exported "Developer ID Application" certificate and key (.p12) |
| `MACOS_CERTIFICATE_PASSWORD` | secret | the .p12 password |
| `APPLE_ID` | secret | Apple ID for notarization |
| `APPLE_TEAM_ID` | secret | `DP5U2UP42V` |
| `APPLE_APP_PASSWORD` | secret | app-specific password of that Apple ID |
| `AZURE_CLIENT_ID` | secret | app registration `openvireo-github-signing`: `39cd540b-8c65-4104-87de-f5684440546f` |
| `AZURE_TENANT_ID` | secret | `186097fa-79cb-495c-8336-195a445eae9f` |
| `AZURE_SUBSCRIPTION_ID` | secret | `a4b5b3c9-6a08-46b7-a61c-f4cc21c19aa7` |
| `ARTIFACT_SIGNING_ENDPOINT` | variable | `https://eus.codesigning.azure.net` |
| `ARTIFACT_SIGNING_ACCOUNT` | variable | `openvireo` |
| `ARTIFACT_SIGNING_PROFILE` | variable | `openvireo-public` |
| `GPG_PRIVATE_KEY` | secret | the release key's signing subkey without a passphrase (`ci-signing-subkey.asc`) |

These are the same values as the desktop app's repository secrets of the same names.

## One-time setup

### 1. The `signing` environment, limited to `v*` tags

```sh
R=OpenVireo/openvireo-sdk
gh api -X PUT repos/$R/environments/signing --input - <<'EOF'
{"deployment_branch_policy": {"protected_branches": false, "custom_branch_policies": true}}
EOF
gh api -X POST repos/$R/environments/signing/deployment-branch-policies -f name='v*' -f type=tag
gh api repos/$R/environments/signing/deployment-branch-policies --jq '.branch_policies[] | {name, type}'
```

Anyone who can push a `v*` tag can then sign. To limit that to admins, add a tag ruleset (optional):

```sh
gh api -X POST repos/$R/rulesets --input - <<'EOF'
{"name": "Release tags", "target": "tag", "enforcement": "active",
 "conditions": {"ref_name": {"include": ["refs/tags/v*"], "exclude": []}},
 "rules": [{"type": "creation"}, {"type": "update"}, {"type": "deletion"}],
 "bypass_actors": [{"actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always"}]}
EOF
```

### 2. Secrets and variables

From the same files and values used for OpenVireo/openvireo (`gh secret set` without `--body` prompts):

```sh
R=OpenVireo/openvireo-sdk
base64 -i DeveloperIDApplication.p12 | gh secret set MACOS_CERTIFICATE_P12 -R $R --env signing
gh secret set MACOS_CERTIFICATE_PASSWORD -R $R --env signing
gh secret set APPLE_ID -R $R --env signing
gh secret set APPLE_TEAM_ID -R $R --env signing --body DP5U2UP42V
gh secret set APPLE_APP_PASSWORD -R $R --env signing
gh secret set AZURE_CLIENT_ID -R $R --env signing --body 39cd540b-8c65-4104-87de-f5684440546f
gh secret set AZURE_TENANT_ID -R $R --env signing --body 186097fa-79cb-495c-8336-195a445eae9f
gh secret set AZURE_SUBSCRIPTION_ID -R $R --env signing --body a4b5b3c9-6a08-46b7-a61c-f4cc21c19aa7
gh secret set GPG_PRIVATE_KEY -R $R --env signing < ci-signing-subkey.asc
gh variable set ARTIFACT_SIGNING_ENDPOINT -R $R --env signing --body https://eus.codesigning.azure.net
gh variable set ARTIFACT_SIGNING_ACCOUNT -R $R --env signing --body openvireo
gh variable set ARTIFACT_SIGNING_PROFILE -R $R --env signing --body openvireo-public
gh secret list -R $R --env signing && gh variable list -R $R --env signing
```

Keep them in the environment rather than as repository or organization secrets: those would be readable by
a workflow on any branch, while the environment's tag rule keeps them to release tags.

### 3. Azure federated credential for this repository

The app registration already has the "Artifact Signing Certificate Profile Signer" role on `openvireo-public`;
it only needs to trust this repository's `signing` environment. The organization sends immutable OIDC subjects
(`gh api repos/OpenVireo/openvireo-sdk/actions/oidc/customization/sub`), so the subject has the owner and
repository ids:

```sh
az ad app federated-credential create --id 39cd540b-8c65-4104-87de-f5684440546f --parameters '{
  "name": "github-openvireo-sdk-signing",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:OpenVireo@347287727/openvireo-sdk@1432309428:environment:signing",
  "audiences": ["api://AzureADTokenExchange"]
}'
az ad app federated-credential list --id 39cd540b-8c65-4104-87de-f5684440546f --query '[].subject'
```

Signing two executables takes seconds after `azure/login`, well inside the OIDC assertion's lifetime, so this
workflow doesn't need the desktop app's `azure-login-refresh.sh`.

## macOS details

`scripts/macos/sign.sh` signs with `--options runtime --timestamp` and `scripts/macos/entitlements.plist`, which
grants only `com.apple.security.cs.allow-jit`. Without it a Bun executable still runs under the hardened runtime,
but JavaScriptCore falls back to its interpreter (the OPAQUE login smoke test took 5.9 s instead of 1.3 s).
None of the other entitlements Bun's docs list (unsigned executable memory, disabled page protection, dyld
environment variables, disabled library validation) is needed.

The executables are submitted to the notary service together in one zip. Apple can't staple a ticket to a bare
Mach-O file, so Gatekeeper looks the ticket up online on the first run; `spctl --assess --type install -vv`
shows `source=Notarized Developer ID` once it is notarized.

Locally: `scripts/build-binaries.sh --compile-only dist-binaries`, then
`scripts/macos/sign.sh dist-binaries "Developer ID Application: …"` (or no identity for an ad hoc signature),
then `scripts/build-binaries.sh --pack-only dist-binaries`. Set `NOTARY_PROFILE` to a
`xcrun notarytool store-credentials` profile to notarize as well.

## Windows details

Bun 1.3 keeps the bundled program in a `.bun` PE section rather than appended after the image, so an
Authenticode signature (appended as the certificate table) leaves it intact; `sign-windows` runs each signed
executable before uploading it. SignTool is the newest one in the runner's Windows SDK; the Artifact Signing
client (dlib) is pinned by version and SHA-256 in `release.yml`'s `env` block, the same as the desktop app's.

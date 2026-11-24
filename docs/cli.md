# CLI: `ov`

Read, inject and rotate OpenVireo vault secrets from scripts, CI and servers, with a **service
account** (`OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_…`) or your own **login**. Vaults are downloaded and
decrypted locally; writes use the same conditional PUT and merge/retry loop as the desktop and web apps, so
concurrent edits are merged, not lost.

`ov` is a native binary built from [openvireo-core](https://github.com/OpenVireo/openvireo-core), the shared
Rust core every OpenVireo app runs on. It needs nothing else installed. It replaces the TypeScript `ov` that
earlier releases of this repo shipped (see [The TypeScript `ov`](#the-typescript-ov)); the commands, flags,
output and exit codes are the same, with the differences listed under
[Differences from the TypeScript `ov`](#differences-from-the-typescript-ov).

## Install

Each [openvireo-core release](https://github.com/OpenVireo/openvireo-core/releases) has `ov` for Linux (x64,
arm64), macOS (x64, arm64) and Windows (x64), with a `SHA256SUMS` file and its GPG signature
`SHA256SUMS.asc`:

```sh
v=VERSION p=linux-x64    # VERSION: the core release without the v, e.g. 1.1.0; p: linux-arm64 | darwin-x64 | darwin-arm64
for f in "ov-$v-$p.tar.gz" SHA256SUMS SHA256SUMS.asc; do
  curl -fLO "https://github.com/OpenVireo/openvireo-core/releases/download/v$v/$f"
done
gpg --verify SHA256SUMS.asc SHA256SUMS        # see Verifying the binaries
sha256sum --ignore-missing -c SHA256SUMS      # macOS: shasum -a 256 --ignore-missing -c SHA256SUMS
tar -xzf "ov-$v-$p.tar.gz" && sudo install "ov-$v-$p/ov" /usr/local/bin/
ov version
```

On Windows, in PowerShell:

```powershell
$v = "VERSION"
$base = "https://github.com/OpenVireo/openvireo-core/releases/download/v$v"
foreach ($f in "ov-$v-windows-x64.zip", "SHA256SUMS", "SHA256SUMS.asc") { Invoke-WebRequest "$base/$f" -OutFile $f }
gpg --verify SHA256SUMS.asc SHA256SUMS                  # gpg from Gpg4win
(Get-FileHash "ov-$v-windows-x64.zip").Hash             # compare with its line in SHA256SUMS
Expand-Archive "ov-$v-windows-x64.zip" .
.\ov-$v-windows-x64\ov.exe version                       # or put that directory on your PATH
```

`SHA256SUMS` also lists the release's other files (the core's libraries for app builds), so check with
`--ignore-missing` or compare the one line.

`ov connect` runs the REST server, which is a separate program, `openvireo-connect`: install it from this
repo's releases (see [Connect](connect.md#install)) and put it on your `PATH`.

### Verifying the binaries

`SHA256SUMS.asc` is signed with the OpenVireo release key, the same one as the desktop app's releases:
fingerprint `FE27 78BF 0747 05E0 994B BAF9 FEBA 3556 2DE1 04CB`, from
[openvireo.com/openvireo-release.asc](https://openvireo.com/openvireo-release.asc) or keys.openpgp.org
(see [Verifying Signatures](https://openvireo.com/verifying-signatures)):

```sh
curl -sSL https://openvireo.com/openvireo-release.asc | gpg --import
gpg --verify SHA256SUMS.asc SHA256SUMS        # "Good signature", and the primary key fingerprint above
```

The macOS binaries are signed with OpenVireo's Developer ID (team `DP5U2UP42V`) and notarized by Apple, so
Gatekeeper runs them even when downloaded with a browser. A bare executable can't carry its notarization
ticket, so the first run checks it online. To check by hand:

```sh
codesign --verify --strict --verbose=2 ov     # valid on disk, satisfies its Designated Requirement
codesign -dv ov 2>&1 | grep TeamIdentifier    # TeamIdentifier=DP5U2UP42V
spctl --assess --type install -vv ov          # accepted, source=Notarized Developer ID
```

The Windows binaries are signed with Azure Artifact Signing, the same publisher as the desktop app's installers:

```powershell
Get-AuthenticodeSignature .\ov.exe | Format-List Status, SignerCertificate, TimeStamperCertificate   # Status: Valid
```

To build `ov` yourself, see [Building from source](#building-from-source).

### Differences from the TypeScript `ov`

The native `ov` was checked against the TypeScript one by running both on the same inputs against the same
test servers: help text, arguments, output and exit codes match. A session saved by `ov login` in one works
in the other (same `session.json`). What differs:

- **`ov connect`** runs `openvireo-connect` from your `PATH` with the same arguments. The TypeScript `ov` had
  connect built in. Without it, `ov connect` exits 1 and says where to get it.
- **An empty password stays protected.** An entry created with an empty `Password` keeps its protected
  flag after the upload, as KeePassXC keeps it; the TypeScript `ov` up to 0.11.0 lost the flag, so
  `ov item get` showed that field differently.
- **`OPENVIREO_LOG`** (`error`, `warn`, `info`, `debug` or `trace`) prints the core's log lines on stderr.
  Off when unset; the TypeScript `ov` had no logging.
- **TLS** uses the operating system's trust store.

### The TypeScript `ov`

openvireo-sdk releases up to 0.11.0 shipped `ov` built from TypeScript (`packages/cli`): a single binary made
with Bun (~60 MB, with the Bun runtime) on the
[SDK's releases](https://github.com/OpenVireo/openvireo-sdk/releases), downloaded and checked as above with
`openvireo-sdk` in place of `openvireo-core` in the URLs, and `@openvireo/cli` on GitHub Packages for Node ≥ 20
(see [Install](index.md#install) for the registry setup):

```sh
npm install -g @openvireo/cli
ov version
```

## References

```
ov://<vault>/[<group>/…]<entry>/<field>
```

`<vault>` is a vault id or name, `<entry>` an entry UUID (32 hex digits) or a unique title, with the
group path from the root group. Segments are percent-encoded (`Team%20Infra`). Fields are KeePass's
(`username`, `password`, `url`, `notes`, `title`, any case) or custom field names. Item commands take the
reference without the field.

## Commands

```sh
export OPENVIREO_SERVICE_ACCOUNT_TOKEN=ov_sa_…

ov read ov://Team%20Infra/GitHub/password                 # value + newline (-n: none, -o file: mode 0600)

# templates: bare references, or {{ ov://… }} when text follows the reference
echo 'dsn: postgres://app:{{ ov://Team%20Infra/Deploy/Database/password }}@db/app' | ov inject
ov inject -i config.yml.tpl -o config.yml                  # output file mode 0600

# run a command with references resolved in its environment; its stdout/stderr are masked
cat .env.tpl
#   DB_PASSWORD=ov://Team%20Infra/Deploy/Database/password
#   DB_USER="ov://Team%20Infra/Deploy/Database/username"
ov run --env-file .env.tpl -- ./migrate.sh                 # "echo $DB_PASSWORD" prints <concealed by openvireo>
GH_TOKEN=ov://Team%20Infra/GitHub/password ov run -- gh auth status   # variables already set work too

ov item get ov://Team%20Infra/GitHub [--reveal] [--json]
ov item list "Team Infra"
ov item create ov://Team%20Infra/Apps/Stripe username=billing url=https://stripe.com --generate
ov item edit ov://Team%20Infra/Apps/Stripe --stdin-field api_key < key.txt
ov rotate ov://Team%20Infra/Deploy/Database/password --generate [--length 40] [--charset letters,digits] [--print]
printf %s "$NEW" | ov rotate ov://Team%20Infra/CI/token --stdin

ov vault list
ov whoami
ov connect                                                # the REST server, see connect.md
```

- `ov run` takes `KEY=value` lines (`export`, `#` comments, `"…"` with `\n` escapes, `'…'` literal).
  Masking replaces every resolved value, and every line (4+ characters) of a multi-line value, in the
  child's output, also when a value is split across writes. Bytes that may be the start of a secret are
  held back until the next write, or for at most 100 ms. Masking pipes the child's stdout/stderr (they are
  not TTYs); `--no-masking` gives it the terminal directly. The child never receives
  `OPENVIREO_SERVICE_ACCOUNT_TOKEN`, `OPENVIREO_PASSWORD` or `OPENVIREO_SECRET_KEY`. The exit code is the child's.
- `item create` fails if the entry exists; `item edit` fails if it doesn't. Password and custom fields
  are stored protected. Every edit keeps the previous version in the entry's history.
- `--generate` makes 32 characters from letters, digits and `!#$%&()*+,-./:;<=>?@[]^_{|}~`, at least one
  of each chosen set (`--charset` takes `letters`, `lower`, `upper`, `digits`, `symbols`).
- A vault granted as `read` refuses `rotate` and `item create|edit` before anything is uploaded:
  `ov: this service account can only read vault "Team Infra"`, exit code 1. The sync server enforces
  the same with 403.
- Errors print `ov: <message>` with exit code 1 (2 for usage errors), never a stack trace.

## Human login

```sh
ov login --email alice@example.com [--issuer https://accounts.openvireo.com]
# Master password, then the Secret Key (K1-…) the first time on this machine, then a TOTP code if enabled
ov read ov://Private/Bank/password                       # asks for the master password every time
ov logout                                                 # add --forget to also remove the Secret Key from this machine
ov account delete                                         # lock the account now, erase it after 30 days
ov account restore                                        # after `ov login`, keep an account scheduled for deletion
```

`ov account delete` prints what happens to each vault, organization, plan and share link, then asks you to type
the account email (`--yes --email E` for scripts). It refuses while you are the only owner of an organization
that has other members: make someone else an owner, or delete the organization, in the web or desktop app.
A plan bought in the iOS app is billed by Apple and only you can cancel it: `ov account delete` says so, and
it keeps renewing until you cancel it on your iPhone or in your Apple ID settings.

Signed in as a user, `ov whoami` also prints the plan and who bills it, e.g.
`plan: Premium, renews 8 November 2027, billed by Apple. Manage it on your iPhone or in your Apple ID settings (…)`,
or `… Manage it at https://accounts.openvireo.com/subscription/pricing.` for a plan bought on the website.

The session (refresh token, device id, trusted Secret Key and the encrypted vault base copies) lives in
`$OPENVIREO_CONFIG_DIR`, else `$XDG_CONFIG_HOME/openvireo`, else `~/.config/openvireo`, in `session.json` with mode 0600.
The master password is never stored. `OPENVIREO_PASSWORD`, `OPENVIREO_SECRET_KEY` and `OPENVIREO_ISSUER` are read from the
environment for non-interactive use; prefer a service account for automation.
`OPENVIREO_SERVICE_ACCOUNT_TOKEN` (or `OPENVIREO_SERVICE_ACCOUNT_TOKEN_FILE`) always takes precedence over a login.

## Share links

Share links open in a browser without an account (see the [share links guide](guides/share-links.md)). Only
users make them, not service accounts.

```sh
ov share ov://Private/Wi-Fi                                    # username, password and website; 7 days
ov share ov://Private/Bank --field Password --once --expires 1d
ov share ov://Private/Bank --field otp --passcode               # asks for a passcode (or OPENVIREO_SHARE_PASSCODE)
echo "The alarm code is 4321" | ov share --text --title "Front door" --expires 1h
ov share list                                                   # add --json for everything
ov share revoke <id>
```

The link is printed on stdout; what it allows goes to stderr. `--field` takes KeePass field names (`UserName`,
`Password`, `URL`, `Notes`, a custom field) or `otp` for the one-time code, which shares the TOTP secret.

## Building from source

The native `ov` builds with the Rust toolchain that openvireo-core pins in `rust-toolchain.toml` (`rustup`
installs it on the first `cargo` call):

```sh
git clone https://github.com/OpenVireo/openvireo-core && cd openvireo-core
cargo build --release --locked -p ov       # target/release/ov
./target/release/ov version
cargo test -p ov                           # the CLI tests, against in-memory servers
```

Check out a release tag to build that release rather than `develop`. openvireo-core's
[`docs/building.md`](https://github.com/OpenVireo/openvireo-core/blob/develop/docs/building.md) has the rest.

### Building the TypeScript `ov`

You need Node ≥ 20 and npm, and [Bun](https://bun.sh) 1.3 or later for the single binary:

```sh
git clone https://github.com/OpenVireo/openvireo-sdk && cd openvireo-sdk
npm ci
npm run build:binary -w @openvireo/cli     # builds the SDK and connect, then bun build --compile … src/bin.ts --outfile dist/ov
./packages/cli/dist/ov version             # ov 1.1.0
npm run smoke -w @openvireo/cli            # runs dist/ov against the in-memory servers over HTTP
```

Without Bun, `npm run build` builds every package for Node, and `node packages/cli/dist/bin.js` runs `ov`.
The SDK's releases no longer have binaries.

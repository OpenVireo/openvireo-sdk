# @kpnx/cli: `kpx`

Read, inject and rotate KeePassXC vault secrets from scripts, CI and servers, with a **service
account** (`KPX_SERVICE_ACCOUNT_TOKEN=kpx_sa_…`) or your own **login**. Vaults are downloaded and
decrypted locally; writes use the same conditional PUT and merge/retry loop as Qt and the web app, so
concurrent edits are merged, not lost. Ships as one binary (Bun `--compile`, no Node needed).

## References

```
kpx://<vault>/[<group>/…]<entry>/<field>
```

`<vault>` is a vault id or name, `<entry>` an entry UUID (32 hex digits) or a unique title, with the
group path from the root group. Segments are percent-encoded (`Team%20Infra`). Fields are KeePassXC's
(`username`, `password`, `url`, `notes`, `title`, any case) or custom field names. Item commands take the
reference without the field.

## Commands

```sh
export KPX_SERVICE_ACCOUNT_TOKEN=kpx_sa_…

kpx read kpx://Team%20Infra/GitHub/password          # value + newline (-n: none, -o file: mode 0600)

# templates: bare references, or {{ kpx://… }} when text follows the reference
echo 'dsn: postgres://app:{{ kpx://Team%20Infra/Deploy/Database/password }}@db/app' | kpx inject
kpx inject -i config.yml.tpl -o config.yml           # output file mode 0600

# run a command with references resolved in its environment; its stdout/stderr are masked
cat .env.tpl
#   DB_PASSWORD=kpx://Team%20Infra/Deploy/Database/password
#   DB_USER="kpx://Team%20Infra/Deploy/Database/username"
kpx run --env-file .env.tpl -- ./migrate.sh          # "echo $DB_PASSWORD" prints <concealed by kpx>
GH_TOKEN=kpx://Team%20Infra/GitHub/password kpx run -- gh auth status   # variables already set work too

kpx item get kpx://Team%20Infra/GitHub [--reveal] [--json]
kpx item list "Team Infra"
kpx item create kpx://Team%20Infra/Apps/Stripe username=billing url=https://stripe.com --generate
kpx item edit kpx://Team%20Infra/Apps/Stripe --stdin-field api_key < key.txt
kpx rotate kpx://Team%20Infra/Deploy/Database/password --generate [--length 40] [--charset letters,digits] [--print]
printf %s "$NEW" | kpx rotate kpx://Team%20Infra/CI/token --stdin

kpx vault list
kpx whoami
kpx connect                                         # the REST server, see ../connect/README.md
```

- `kpx run` takes `KEY=value` lines (`export`, `#` comments, `"…"` with `\n` escapes, `'…'` literal).
  Masking replaces every resolved value, and every line (4+ characters) of a multi-line value, in the
  child's output, also when a value is split across writes. Bytes that may be the start of a secret are
  held back until the next write, or for at most 100 ms. Masking pipes the child's stdout/stderr (they are
  not TTYs); `--no-masking` gives it the terminal directly. The child never receives
  `KPX_SERVICE_ACCOUNT_TOKEN`, `KPX_PASSWORD` or `KPX_SECRET_KEY`. The exit code is the child's.
- `item create` fails if the entry exists; `item edit` fails if it doesn't. Password and custom fields
  are stored protected. Every edit keeps the previous version in the entry's history.
- `--generate` makes 32 characters from letters, digits and `!#$%&()*+,-./:;<=>?@[]^_{|}~`, at least one
  of each chosen set (`--charset` takes `letters`, `lower`, `upper`, `digits`, `symbols`).
- A vault granted as `read` refuses `rotate` and `item create|edit` before anything is uploaded:
  `kpx: this service account can only read vault "Team Infra"`, exit code 1. The sync server enforces
  the same with 403.
- Errors print `kpx: <message>` with exit code 1 (2 for usage errors), never a stack trace.

## Human login

```sh
kpx login --email alice@example.com [--issuer https://accounts.keepassxc.org]
# Master password, then the Secret Key (K1-…) the first time on this machine, then a TOTP code if enabled
kpx read kpx://Private/Bank/password                # asks for the master password every time
kpx logout
```

The session (refresh token, device id, trusted Secret Key and the encrypted vault base copies) lives in
`$KPX_CONFIG_DIR`, else `$XDG_CONFIG_HOME/kpx`, else `~/.config/kpx`, in `session.json` with mode 0600.
The master password is never stored. `KPX_PASSWORD`, `KPX_SECRET_KEY` and `KPX_ISSUER` are read from the
environment for non-interactive use; prefer a service account for automation.
`KPX_SERVICE_ACCOUNT_TOKEN` (or `KPX_SERVICE_ACCOUNT_TOKEN_FILE`) always takes precedence over a login.

## Single binary

```sh
npm run build:binary -w @kpnx/cli     # builds the SDK and connect, then bun build --compile … src/bin.ts --outfile dist/kpx
./packages/cli/dist/kpx version        # kpx 0.1.0
npm run smoke -w @kpnx/cli            # runs dist/kpx against the in-memory servers over HTTP
# cross-compile: add --target=bun-linux-x64 | bun-linux-arm64 | bun-darwin-arm64 | bun-windows-x64
```

The binary is ~60 MB (the Bun runtime) and includes the vendored libopaque release build, so login
works without Node. `npm run build` also produces `dist/bin.js` for Node ≥ 20 (`node dist/bin.js`).

## Development

```sh
npm run typecheck -w @kpnx/cli && npm test -w @kpnx/cli
```

Tests run `main()` against the SDK's in-memory auth and sync servers
(`packages/sdk/test/helpers/world.ts`), which enforce vault roles like the sync server. They cover
reference parsing, masking (chunk splits, overlapping and multi-line secrets, UTF-8), `.env` parsing,
`run` with real child processes, read-only rejection, a 412 race during `rotate` and human login.

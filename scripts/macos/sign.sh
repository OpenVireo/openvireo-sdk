#!/usr/bin/env bash
# Signs the macOS executables that `scripts/build-binaries.sh --compile-only <dir>` wrote, with the hardened
# runtime and scripts/macos/entitlements.plist, and optionally notarizes them:
#
#   scripts/macos/sign.sh <dir> [identity]     # identity: a codesigning identity; default "-" (ad hoc)
#
# With NOTARY_PROFILE set (a `xcrun notarytool store-credentials` profile; NOTARY_KEYCHAIN for a keychain
# other than the default), the signed executables are submitted to Apple's notary service in one zip and
# the script fails unless it accepts them. A bare executable can't be stapled: Gatekeeper looks the ticket
# up online the first time it sees the file. Runs on macOS only (codesign).
set -euo pipefail

dir="$(cd "${1:?usage: $0 <dir> [identity]}" && pwd)"
identity="${2:--}"
here="$(cd "$(dirname "$0")" && pwd)"

shopt -s nullglob
exes=("$dir"/*-darwin-*/ov "$dir"/*-darwin-*/openvireo-connect)
[[ ${#exes[@]} -gt 0 ]] || { echo "no darwin executables in $dir" >&2; exit 1; }

args=(--force --options runtime --entitlements "$here/entitlements.plist")
# A secure timestamp needs a real identity; Apple's notary service requires one
[[ "$identity" != "-" ]] && args+=(--timestamp)

for exe in "${exes[@]}"; do
  chmod 755 "$exe"
  codesign "${args[@]}" --identifier "com.openvireo.$(basename "$exe")" --sign "$identity" "$exe"
  codesign --verify --strict --verbose=2 "$exe"
done

if [[ -n "${NOTARY_PROFILE:-}" ]]; then
  work="$(mktemp -d)"
  trap 'rm -rf "$work"' EXIT
  mkdir "$work/bin"
  for exe in "${exes[@]}"; do
    d="$work/bin/$(basename "$(dirname "$exe")")"
    mkdir -p "$d" && cp -p "$exe" "$d/"
  done
  ditto -c -k --keepParent "$work/bin" "$work/notarize.zip"
  notary=(--keychain-profile "$NOTARY_PROFILE")
  [[ -n "${NOTARY_KEYCHAIN:-}" ]] && notary+=(--keychain "$NOTARY_KEYCHAIN")
  xcrun notarytool submit "$work/notarize.zip" "${notary[@]}" --wait --timeout 30m --output-format json \
    | tee "$work/result.json"
  echo
  id="$(plutil -extract id raw "$work/result.json")"
  status="$(plutil -extract status raw "$work/result.json")"
  xcrun notarytool log "$id" "${notary[@]}" || true
  [[ "$status" == Accepted ]] || { echo "notarization: $status" >&2; exit 1; }
fi

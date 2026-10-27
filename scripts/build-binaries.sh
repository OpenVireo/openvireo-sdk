#!/usr/bin/env bash
# Cross-compiles `ov` and `openvireo-connect` into single binaries (Bun --compile) for every release
# platform and packs each into an archive with the licences, plus a SHA256SUMS file:
#
#   scripts/build-binaries.sh [out-dir]     # default: dist-binaries/
#
# gives ov-<version>-<platform>.tar.gz (.zip for Windows) and openvireo-connect-<version>-<platform>…
# Builds the SDK and connect first, since Bun resolves @openvireo/sdk through the workspace's dist/.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$(mkdir -p "${1:-$root/dist-binaries}" && cd "${1:-$root/dist-binaries}" && pwd)"
version="$(node -p "require('$root/packages/cli/package.json').version")"
platforms=(linux-x64 linux-arm64 darwin-x64 darwin-arm64 windows-x64)

cd "$root"
npm run build -w @openvireo/sdk -w @openvireo/connect >/dev/null

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# name, entry point, package directory
build() {
  local name="$1" entry="$2" pkg="$3" platform="$4"
  local exe="$name" dir="$work/$name-$version-$platform"
  [[ "$platform" == windows-* ]] && exe="$name.exe"
  mkdir -p "$dir"
  bun build --compile --minify --sourcemap --target="bun-$platform" "$entry" --outfile "$dir/$exe" >/dev/null
  # --sourcemap embeds the map in the binary and also writes a copy next to it
  rm -f "$dir"/*.map
  cp "$pkg/README.md" "$pkg/LICENSE-MIT" "$pkg/LICENSE-APACHE" "$dir/"
  if [[ "$platform" == windows-* ]]; then
    (cd "$work" && zip -qr "$out/$name-$version-$platform.zip" "$name-$version-$platform")
  else
    tar -C "$work" -czf "$out/$name-$version-$platform.tar.gz" "$name-$version-$platform"
  fi
  echo "$name $platform"
}

for platform in "${platforms[@]}"; do
  build ov packages/cli/src/bin.ts packages/cli "$platform"
  build openvireo-connect packages/connect/src/bin.ts packages/connect "$platform"
done

cd "$out"
rm -f SHA256SUMS
if command -v sha256sum >/dev/null; then sha256sum ./*-"$version"-* > SHA256SUMS; else shasum -a 256 ./*-"$version"-* > SHA256SUMS; fi
sed -i.bak 's| \./| |' SHA256SUMS && rm -f SHA256SUMS.bak
ls -l "$out"

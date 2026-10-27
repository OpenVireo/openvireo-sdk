#!/usr/bin/env bash
# Cross-compiles `ov` and `openvireo-connect` into single binaries (Bun --compile) for every release
# platform and packs each into an archive with the licences, plus a SHA256SUMS file:
#
#   scripts/build-binaries.sh [out-dir]                    # compile and pack; default: dist-binaries/
#   scripts/build-binaries.sh --compile-only <dir>         # only the unpacked <name>-<version>-<platform>/ dirs
#   scripts/build-binaries.sh --pack-only <dir> [out-dir]  # pack those dirs (default: into <dir>)
#
# gives ov-<version>-<platform>.tar.gz (.zip for Windows) and openvireo-connect-<version>-<platform>…
# The release signs the executables between the two stages (scripts/sign-macos.sh, Artifact Signing), so
# that the archives and SHA256SUMS hold the signed files.
# Compiling builds the SDK and connect first, since Bun resolves @openvireo/sdk through the workspace's dist/.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
version="$(node -p "require('$root/packages/cli/package.json').version")"
platforms=(linux-x64 linux-arm64 darwin-x64 darwin-arm64 windows-x64)
names=(ov openvireo-connect)

mode=all
case "${1:-}" in
  --compile-only) mode=compile; shift ;;
  --pack-only) mode=pack; shift ;;
esac
if [[ "$mode" != all && -z "${1:-}" ]]; then echo "usage: $0 [--compile-only|--pack-only] <dir> [out-dir]" >&2; exit 2; fi
abs() { mkdir -p "$1" && (cd "$1" && pwd); }

# name, entry point, package directory, platform, destination
compile() {
  local name="$1" entry="$2" pkg="$3" platform="$4" dir="$5/$1-$version-$4" exe="$1"
  [[ "$platform" == windows-* ]] && exe="$name.exe"
  mkdir -p "$dir"
  bun build --compile --minify --sourcemap --target="bun-$platform" "$entry" --outfile "$dir/$exe" >/dev/null
  # --sourcemap embeds the map in the binary and also writes a copy next to it
  rm -f "$dir"/*.map
  cp "$pkg/README.md" "$pkg/LICENSE-MIT" "$pkg/LICENSE-APACHE" "$dir/"
  echo "$name $platform"
}

compile_all() {
  local dest="$1"
  cd "$root"
  npm run build -w @openvireo/sdk -w @openvireo/connect >/dev/null
  for platform in "${platforms[@]}"; do
    compile ov packages/cli/src/bin.ts packages/cli "$platform" "$dest"
    compile openvireo-connect packages/connect/src/bin.ts packages/connect "$platform" "$dest"
  done
}

# Packs every <name>-<version>-<platform>/ in $1 into $2 and writes $2/SHA256SUMS
pack_all() {
  local src="$1" out="$2" name platform base
  for platform in "${platforms[@]}"; do
    for name in "${names[@]}"; do
      base="$name-$version-$platform"
      [[ -d "$src/$base" ]] || { echo "missing $src/$base" >&2; exit 1; }
      if [[ "$platform" == windows-* ]]; then
        rm -f "$out/$base.zip"
        (cd "$src" && zip -qr "$out/$base.zip" "$base")
      else
        # Artifact uploads drop the executable bit, so set it here rather than trust the input
        chmod 755 "$src/$base/$name"
        tar -C "$src" -czf "$out/$base.tar.gz" "$base"
      fi
    done
  done
  cd "$out"
  rm -f SHA256SUMS
  local files=(./*-"$version"-*.tar.gz ./*-"$version"-*.zip)
  if command -v sha256sum >/dev/null; then sha256sum "${files[@]}" > SHA256SUMS; else shasum -a 256 "${files[@]}" > SHA256SUMS; fi
  sed -i.bak 's| \./| |' SHA256SUMS && rm -f SHA256SUMS.bak
  ls -l "$out"
}

case "$mode" in
  compile) compile_all "$(abs "$1")" ;;
  pack) src="$(abs "$1")"; pack_all "$src" "$(abs "${2:-$1}")" ;;
  all)
    out="$(abs "${1:-$root/dist-binaries}")"
    work="$(mktemp -d)"
    trap 'rm -rf "$work"' EXIT
    compile_all "$work"
    pack_all "$work" "$out"
    ;;
esac

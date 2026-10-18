#!/usr/bin/env bash
# Builds dist/divi5-flip-cards-<version>.zip, ready for Plugins > Add New > Upload Plugin.
# Run `npm run zip`, which builds the assets first.
set -euo pipefail

cd "$(dirname "$0")/.."

slug="divi5-flip-cards"
version="$(sed -n "s/^define( 'D5FC_VERSION', '\(.*\)' );$/\1/p" "$slug.php")"

if [ ! -f build/bundle.js ]; then
  echo "build/ is missing. Run 'npm run build' first." >&2
  exit 1
fi

staging="$(mktemp -d)"
trap 'rm -rf "$staging"' EXIT

mkdir -p "$staging/$slug"
cp -R "$slug.php" readme.txt LICENSE modules build "$staging/$slug/"

# Runtime Composer dependencies (the update checker), when installed with `composer install --no-dev`.
if [ -d vendor ]; then
  cp -R vendor "$staging/$slug/"
fi
find "$staging/$slug/build" -name '*.map' -delete

mkdir -p dist
rm -f "dist/$slug-$version.zip"
(cd "$staging" && zip -qr - "$slug") > "dist/$slug-$version.zip"

echo "Created dist/$slug-$version.zip"

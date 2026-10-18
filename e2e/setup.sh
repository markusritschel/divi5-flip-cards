#!/bin/sh
# Set up the local browser-test WordPress: e2e/setup.sh /path/to/Divi.zip
# Divi is unpacked to ~/.cache/d5fc-e2e (outside the repo; it is licensed). Safe to run again:
# it reuses the unpacked theme and the site, and resets every fixture page.
set -eu
cd "$(dirname "$0")"

CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/d5fc-e2e"
export DIVI_THEME_DIR="${DIVI_THEME_DIR:-$CACHE/Divi}"
URL="http://localhost:${E2E_PORT:-8087}"

if [ ! -f "$DIVI_THEME_DIR/style.css" ]; then
	ZIP="${1:?usage: e2e/setup.sh /path/to/Divi.zip}"
	mkdir -p "$CACHE"
	unzip -q "$ZIP" -d "$CACHE"
fi
echo "Divi $(sed -n 's/^Version: *//p' "$DIVI_THEME_DIR/style.css")"

[ -f ../build/modules-json/flip-card/module.json ] || echo "warning: no build/ - run 'npm run build' first"

docker compose up -d
# Wait for WordPress with a working database (500 = database still starting).
until curl -s -o /dev/null -w '%{http_code}' "$URL" | grep -q '^[23]'; do sleep 2; done

wp() { docker compose run --rm -T cli wp "$@"; }
wp core is-installed 2>/dev/null || wp core install --url="$URL" --title=D5FC --admin_user=admin --admin_password=admin --admin_email=e2e@example.com --skip-email
wp rewrite structure '/%postname%/'
wp theme activate Divi
wp plugin activate divi5-flip-cards

for f in fixtures/*.html; do
	slug=$(basename "$f" .html)
	id=$(wp post list --post_type=page --name="$slug" --field=ID)
	if [ -z "$id" ]; then
		wp post create "/fixtures/$slug.html" --post_type=page --post_status=publish --post_title="$slug" --post_name="$slug" --meta_input='{"_et_pb_use_builder":"on"}' --porcelain
	else
		wp post update "$id" "/fixtures/$slug.html"
	fi
done
# Start the tests with an empty PHP log and Divi's CSS cache cleared.
docker compose exec -T wp rm -rf wp-content/debug.log wp-content/et-cache
echo "Ready: $URL (admin/admin). Run: cd e2e && pnpm install && pnpm test"

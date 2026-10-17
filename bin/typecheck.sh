#!/usr/bin/env bash
# Type-checks the plugin's own code.
#
# @divi/types ships TypeScript sources that import packages this plugin does not install,
# so tsc always reports errors inside node_modules/@divi. Those are ignored here; only
# errors in src/ fail the check.
set -uo pipefail

output="$(npx tsc --noEmit 2>&1)"
own_errors="$(grep -E '^src/' <<< "$output")"

if [ -n "$own_errors" ]; then
  echo "$own_errors"
  exit 1
fi

echo "No type errors in src/."

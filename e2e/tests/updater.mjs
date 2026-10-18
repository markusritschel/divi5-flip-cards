// Update detection: Plugin Update Checker is set up for this plugin's GitHub releases (needs
// `composer install` in the repo, as the release ZIP ships vendor/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { wp, inWp, debugLog, BASE } from '../lib.mjs';

const hasVendor = existsSync(fileURLToPath(new URL('../../vendor/autoload.php', import.meta.url)));

test('the update checker watches the GitHub releases', { skip: !hasVendor && 'no vendor/ (run composer install)' }, () => {
  const info = JSON.parse(wp('eval-file', '/fixtures/updater.php'));
  assert.match(info.checker, /PluginUpdateChecker\\v5p\d+\\Vcs\\PluginUpdateChecker/);
  assert.equal(info.slug, 'divi5-flip-cards');
  assert.equal(info.repo, 'https://github.com/markusritschel/divi5-flip-cards/');
  assert.ok(info.assets, 'release assets enabled');
});

test('pages load without PHP errors with the updater active', async () => {
  inWp('rm -f wp-content/debug.log');
  const home = await fetch(`${BASE}/`);
  assert.equal(home.status, 200);
  assert.doesNotMatch(debugLog(), /Fatal|Warning|Notice/);
});

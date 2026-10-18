// The PHP guard: if Divi lacks a class the plugin needs (e.g. renamed in an update), the modules
// stay unregistered and admins get a warning, instead of every page failing with a fatal error.
// A must-use plugin simulates the missing class through D5FC_REQUIRED_CLASSES.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { start, BASE, inWp, debugLog, resetPage } from '../lib.mjs';

const MU = 'wp-content/mu-plugins/d5fc-e2e-missing-class.php';
const MISSING = 'ET\\Builder\\Renamed\\InAnUpdate';
let browser, context;

before(async () => {
  resetPage('flip');
  ({ browser, context } = await start());
});
after(async () => {
  inWp(`rm -f ${MU}`);
  await browser?.close();
});

const noticeText = async () => {
  const page = await context.newPage();
  await page.goto(`${BASE}/wp-admin/`);
  const text = await page.locator('.notice').allInnerTexts();
  await page.close();
  return text.join('\n');
};

test('an intact install shows no warning', async () => {
  assert.doesNotMatch(await noticeText(), /Flip Cards/);
});

test('a missing Divi class: pages still load, cards are off, admins are warned', async () => {
  inWp('rm -f wp-content/debug.log');
  inWp(`mkdir -p wp-content/mu-plugins && printf '%s\\n' '<?php' "define( 'D5FC_REQUIRED_CLASSES', [ '${MISSING.replaceAll('\\', '\\\\')}' ] );" > ${MU}`);

  const page = await context.newPage();
  const resp = await page.goto(`${BASE}/flip/`, { waitUntil: 'networkidle' });
  assert.equal(resp.status(), 200);
  assert.equal(await page.locator('.d5fc_flip_card').count(), 0, 'cards not rendered');
  assert.match(await page.locator('body').innerText(), /FRONT text/, 'their content still shows');

  const vb = await page.goto(`${BASE}/flip/?et_fb=1&PageSpeed=off`, { waitUntil: 'domcontentloaded' });
  assert.equal(vb.status(), 200, 'builder still opens');
  await page.close();

  const notice = await noticeText();
  assert.match(notice, /Flip Cards for Divi 5/);
  assert.ok(notice.includes(MISSING), `notice names the missing class: ${notice}`);
  assert.doesNotMatch(debugLog(), /Fatal/);
});

test('with the class back, the cards return', async () => {
  inWp(`rm -f ${MU}`);
  const page = await context.newPage();
  await page.goto(`${BASE}/flip/`, { waitUntil: 'networkidle' });
  assert.ok(await page.locator('.d5fc_flip_card').count() > 0);
  await page.close();
});

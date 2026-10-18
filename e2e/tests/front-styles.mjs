// Live page: style regressions against Divi's own CSS.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, resetPage } from '../lib.mjs';

let browser;
before(async () => { browser = await launch(); });
after(() => browser?.close());

test('block-layout column: no gutter margin on faces, own face margin still applies', async () => {
  resetPage('legacy');
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(`${BASE}/legacy/`, { waitUntil: 'networkidle' });
  const f = await page.evaluate(() => [...document.querySelectorAll('.d5fc_flip_card_face')].map((e) => ({ mb: getComputedStyle(e).marginBottom, h: e.getBoundingClientRect().height, block: !!e.closest('.et_block_column') })));
  assert.ok(f[0].block, 'fixture really is a legacy block column');
  assert.equal(f[0].mb, '0px');
  assert.equal(f[0].h, f[1].h);
  assert.equal(f[2].mb, '15px');
});

test('faces without design settings get the default look; set values win', async () => {
  resetPage('flip');
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(`${BASE}/flip/`, { waitUntil: 'networkidle' });
  const look = (sel) => page.locator(sel).evaluate((e) => { const s = getComputedStyle(e); return [s.padding, s.backgroundColor, s.minHeight]; });
  assert.deepEqual(await look('.d5fc_flip_card_face_2'), ['30px', 'rgb(244, 246, 248)', '200px']);
  assert.deepEqual(await look('.d5fc_flip_card_face_3'), ['30px', 'rgb(227, 234, 242)', '200px']);
  assert.deepEqual(await look('.d5fc_flip_card_face_0'), ['11px 12px 13px 14px', 'rgb(255, 204, 0)', '200px']);
});

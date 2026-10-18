// Live page: the four ready-made designs render as intended (fixture built from modules/StarterLayouts).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, wp, resetPage, faceVisibility } from '../lib.mjs';

let browser, page;
before(async () => {
  if (!wp('post', 'list', '--post_type=page', '--name=starters', '--field=ID')) {
    wp('post', 'create', '/fixtures/starters.html', '--post_type=page', '--post_status=publish', '--post_title=starters', '--post_name=starters', '--meta_input={"_et_pb_use_builder":"on"}');
  }
  resetPage('starters');
  browser = await launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
  await page.goto(`${BASE}/starters/`, { waitUntil: 'networkidle' });
});
after(() => browser?.close());

const headingColor = (card, face) => page.locator('.d5fc_flip_card').nth(card).evaluate((c, face) => {
  const f = c.querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face')[face];
  return getComputedStyle(f.querySelector('h2, h3, li, p')).color;
}, face);

test('four cards with their settings', async () => {
  const cls = await page.locator('.d5fc_flip_card').evaluateAll((cs) => cs.map((c) => c.className.match(/--(flip|slide|trigger-\w+|hint)(?![\w-])/g).join(' ')));
  assert.deepEqual(cls, [
    '--flip --trigger-hover --hint',
    '--slide --trigger-hover',
    '--flip --trigger-click --hint',
    '--flip --trigger-button',
  ]);
});

test('dark faces have light text, light faces dark text', async () => {
  assert.equal(await headingColor(1, 0), 'rgb(255, 255, 255)', 'bold statement front');
  assert.equal(await headingColor(2, 1), 'rgb(255, 255, 255)', 'feature list back');
  assert.equal(await headingColor(3, 0), 'rgb(255, 255, 255)', 'call to action front');
  assert.notEqual(await headingColor(0, 1), 'rgb(255, 255, 255)', 'icon + text back');
  assert.notEqual(await headingColor(1, 1), 'rgb(255, 255, 255)', 'bold statement back');
});

test('the blurb shows its icon and title; the call to action has its "More" button', async () => {
  const blurb = await page.locator('.d5fc_flip_card').nth(0).evaluate((c) => { const i = c.querySelector('.et-pb-icon'); return { icon: !!i && i.textContent.trim().length > 0, title: c.querySelector('.et_pb_module_header')?.textContent.trim() }; });
  assert.deepEqual(blurb, { icon: true, title: 'Feature title' });
  const more = page.locator('.d5fc_flip_card').nth(3).locator(':scope > .d5fc_flip_card__toggle');
  assert.equal((await more.innerText()).trim(), 'More');
  await more.click();
  await page.waitForTimeout(900);
  assert.deepEqual(await faceVisibility(page, 3), ['hidden', 'visible']);
  await page.screenshot({ path: process.env.D5FC_SCREENSHOT || '/dev/null', fullPage: true }).catch(() => {});
});

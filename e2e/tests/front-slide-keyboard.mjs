// Live page: a slide card's front stays visible, but while a back face covers it completely it is
// inert, so keyboard users can't tab into hidden links.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, wp, resetPage } from '../lib.mjs';

let browser, page;
before(async () => {
  if (!wp('post', 'list', '--post_type=page', '--name=slide-keyboard', '--field=ID')) {
    wp('post', 'create', '/fixtures/slide-keyboard.html', '--post_type=page', '--post_status=publish', '--post_title=slide-keyboard', '--post_name=slide-keyboard', '--meta_input={"_et_pb_use_builder":"on"}');
  }
  resetPage('slide-keyboard');
  browser = await launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
  await page.goto(`${BASE}/slide-keyboard/`, { waitUntil: 'networkidle' });
});
after(() => browser?.close());

// Flip with the keyboard: focus the card's flip button and press Enter.
const pressFlip = async (i) => {
  await page.locator('.d5fc_flip_card').nth(i).locator(':scope > .d5fc_flip_card__toggle').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
};
const canFocus = (id) => page.evaluate((id) => { const a = document.getElementById(id); a.focus(); const ok = document.activeElement === a; a.blur(); return ok; }, id);
const frontInert = (i) => page.locator('.d5fc_flip_card').nth(i).evaluate((c) => c.querySelector('.d5fc_flip_card_face').hasAttribute('inert'));

test('a fully covered front is inert while flipped, and usable again afterwards', async () => {
  assert.equal(await canFocus('covered-link'), true, 'before');
  await pressFlip(0);
  assert.equal(await frontInert(0), true);
  assert.equal(await canFocus('covered-link'), false, 'covered link out of reach');
  await pressFlip(0);
  assert.equal(await frontInert(0), false);
  assert.equal(await canFocus('covered-link'), true, 'after flipping back');
});

test('a partly covered front stays usable', async () => {
  await pressFlip(1);
  assert.equal(await frontInert(1), false);
  assert.equal(await canFocus('partly-link'), true);
});

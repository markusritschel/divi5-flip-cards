// Live page: how a flipped click/button card returns (second click, Escape, pointer leaving).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, wp, resetPage, faceVisibility } from '../lib.mjs';

let browser, page;
const FRONT = ['visible', 'hidden'];
const BACK = ['hidden', 'visible'];
const card = (i) => page.locator('.d5fc_flip_card').nth(i);
const pause = () => page.waitForTimeout(350);
const clickCard = async (i) => { await card(i).click({ position: { x: 300, y: 60 } }); await pause(); };

before(async () => {
  if (!wp('post', 'list', '--post_type=page', '--name=flip-back', '--field=ID')) {
    wp('post', 'create', '/fixtures/flip-back.html', '--post_type=page', '--post_status=publish', '--post_title=flip-back', '--post_name=flip-back', '--meta_input={"_et_pb_use_builder":"on"}');
  }
  resetPage('flip-back');
  browser = await launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(`${BASE}/flip-back/`, { waitUntil: 'networkidle' });
});
after(() => browser?.close());

test('defaults: a second click and Escape turn the card back, leaving does not', async () => {
  await clickCard(0);
  assert.deepEqual(await faceVisibility(page, 0), BACK);
  await page.mouse.move(2, 2); await pause();
  assert.deepEqual(await faceVisibility(page, 0), BACK, 'leaving keeps it');
  await page.keyboard.press('Escape'); await pause();
  assert.deepEqual(await faceVisibility(page, 0), FRONT, 'Escape');
  await clickCard(0);
  await clickCard(0);
  assert.deepEqual(await faceVisibility(page, 0), FRONT, 'second click');
});

test('second click off, pointer leaving on', async () => {
  await clickCard(1);
  await clickCard(1);
  assert.deepEqual(await faceVisibility(page, 1), BACK, 'a second click keeps it');
  await page.mouse.move(2, 2); await pause();
  assert.deepEqual(await faceVisibility(page, 1), FRONT, 'leaving turns it back');
});

test('flip button with second click off: Escape turns it back and keeps focus on the button', async () => {
  const button = card(2).locator(':scope > .d5fc_flip_card__toggle');
  await button.click(); await pause();
  await button.click(); await pause();
  assert.deepEqual(await faceVisibility(page, 2), BACK, 'pressing again keeps it');
  await page.keyboard.press('Escape'); await pause();
  assert.deepEqual(await faceVisibility(page, 2), FRONT);
  assert.equal(await button.getAttribute('aria-pressed'), 'false');
  assert.ok(await button.evaluate((b) => b === document.activeElement), 'focus on the flip button');
});

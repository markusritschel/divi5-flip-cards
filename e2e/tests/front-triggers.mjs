// Live page: click / button / hover triggers, keyboard, nested cards, touch fallback.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, resetPage, faceVisibility } from '../lib.mjs';

let browser, page;
const errors = [];
const card = (i) => page.locator('.d5fc_flip_card').nth(i);
const pause = () => page.waitForTimeout(400);
const pressed = (i) => card(i).locator(':scope > .d5fc_flip_card__toggle').getAttribute('aria-pressed');
const buttonWidth = (i) => card(i).locator(':scope > .d5fc_flip_card__toggle').evaluate((b) => Math.round(b.getBoundingClientRect().width));

before(async () => {
  resetPage('triggers');
  browser = await launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/triggers/`, { waitUntil: 'networkidle' });
});
after(() => browser?.close());

test('click anywhere: clicks flip, hover does not, flip button stays hidden', async () => {
  await card(0).hover(); await pause();
  assert.deepEqual(await faceVisibility(page, 0), ['visible', 'hidden']);
  await card(0).click({ position: { x: 300, y: 150 } }); await pause();
  assert.deepEqual(await faceVisibility(page, 0), ['hidden', 'visible']);
  assert.equal(await pressed(0), 'true');
  assert.equal(await buttonWidth(0), 1);
  await card(0).click({ position: { x: 300, y: 150 } }); await pause();
  assert.deepEqual(await faceVisibility(page, 0), ['visible', 'hidden']);
});

test('flip button: only the button flips, and back-face links become reachable', async () => {
  assert.equal(await buttonWidth(1), 36);
  await card(1).click({ position: { x: 300, y: 50 } }); await pause();
  assert.deepEqual(await faceVisibility(page, 1), ['visible', 'hidden']);
  await card(1).locator(':scope > .d5fc_flip_card__toggle').click(); await pause();
  assert.deepEqual(await faceVisibility(page, 1), ['hidden', 'visible']);
  assert.ok(await page.locator('#back-link').isVisible());
});

test('hover flips; keyboard users get the flip button on focus', async () => {
  await card(2).hover(); await pause();
  assert.deepEqual(await faceVisibility(page, 2), ['hidden', 'visible']);
  await page.mouse.move(2, 2); await pause();
  await card(2).locator(':scope > .d5fc_flip_card__toggle').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab'); // Keyboard focus, so :focus-visible applies.
  assert.equal(await buttonWidth(2), 36);
  await page.keyboard.press('Enter'); await pause();
  assert.deepEqual(await faceVisibility(page, 2), ['hidden', 'visible']);
  assert.equal(await pressed(2), 'true');
});

test('a card nested in a face does not turn with the outer card', async () => {
  await card(3).hover({ position: { x: 900, y: 20 } }); await pause();
  assert.deepEqual(await faceVisibility(page, 3), ['hidden', 'visible']);
  assert.deepEqual(await faceVisibility(page, 4), ['visible', 'hidden']);
});

test('a link on a click card navigates without flipping the card', async () => {
  const flips = [];
  await page.exposeFunction('noteFlip', (v) => flips.push(v));
  await page.evaluate(() => document.getElementById('inner-link').addEventListener('click', () => setTimeout(() => window.noteFlip(document.querySelector('.d5fc_flip_card').classList.contains('d5fc_flip_card--flipped')), 0)));
  await Promise.all([page.waitForURL(/\/flip\/$/), page.locator('#inner-link').click()]);
  assert.ok(!flips.includes(true));
  assert.deepEqual(errors, []);
});

test('touch screens: the hover trigger flips on tap', async () => {
  const ctx = await browser.newContext({ viewport: { width: 400, height: 900 }, hasTouch: true, isMobile: true });
  const touch = await ctx.newPage();
  await touch.goto(`${BASE}/triggers/`, { waitUntil: 'networkidle' });
  assert.equal(await touch.evaluate(() => matchMedia('(hover: hover)').matches), false);
  const c = touch.locator('.d5fc_flip_card').nth(2);
  await c.scrollIntoViewIfNeeded();
  await c.tap(); await touch.waitForTimeout(400);
  assert.deepEqual(await faceVisibility(touch, 2), ['hidden', 'visible']);
  await c.tap(); await touch.waitForTimeout(400);
  assert.deepEqual(await faceVisibility(touch, 2), ['visible', 'hidden']);
  await ctx.close();
});

// Live page: the four directions turn the card different ways (sampled half-way through the flip).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, resetPage } from '../lib.mjs';

test('left/right turn around Y, up/down around X, in opposite senses', async () => {
  resetPage('flip');
  const browser = await launch();
  const res = {};
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
    await page.goto(`${BASE}/flip/`, { waitUntil: 'networkidle' });
    // Cards 0 left, 1 up, 3 right, 4 down (see fixtures/flip.html).
    for (const i of [0, 1, 3, 4]) {
      const card = page.locator(`.d5fc_flip_card_${i}`);
      const ms = await card.evaluate((c) => parseFloat(getComputedStyle(c.querySelector('.d5fc_flip_card_face')).transitionDuration) * 1000);
      await card.scrollIntoViewIfNeeded();
      await page.mouse.move(2, 2);
      await page.waitForTimeout(ms + 200);
      await card.hover();
      await page.waitForTimeout(ms * 0.35);
      const m = await card.evaluate((c) => new DOMMatrix(getComputedStyle(c.querySelector('.d5fc_flip_card_face')).transform));
      res[(await card.getAttribute('class')).match(/--(left|right|up|down)\b/)[1]] = { y: Math.sign(Math.round(m.m13 * 10)), x: Math.sign(Math.round(m.m23 * 10)) };
    }
  } finally {
    // Always close, or an error leaves the browser (and the test run) hanging.
    await browser.close();
  }
  assert.deepEqual(res, { left: { y: 1, x: 0 }, up: { y: 0, x: 1 }, right: { y: -1, x: 0 }, down: { y: 0, x: -1 } });
});

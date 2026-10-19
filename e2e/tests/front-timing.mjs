// Live page: Speed Curve, Delay and Perspective.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, resetPage } from '../lib.mjs';

test('speed curve, delay and perspective reach the transition', async () => {
  resetPage('timing');
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/timing/`, { waitUntil: 'networkidle' });
    const card = (i) => page.locator('.d5fc_flip_card').nth(i);
    const settings = (i) => card(i).evaluate((c) => {
      const face = getComputedStyle(c.querySelector('.d5fc_flip_card_face'));
      return {
        easing: face.transitionTimingFunction.split(',')[0].trim(),
        delay: face.transitionDelay,
        perspective: getComputedStyle(c.querySelector('.d5fc_flip_card__inner')).perspective,
      };
    });
    // Front face: visibility and the cosine of its turn.
    const front = (i) => card(i).evaluate((c) => {
      const s = getComputedStyle(c.querySelector('.d5fc_flip_card_face'));
      return { vis: s.visibility, cos: new DOMMatrix(s.transform).m11 };
    });

    assert.deepEqual(await settings(0), { easing: 'linear', delay: '0.4s, 0.4s, 0.9s', perspective: '500px' });
    assert.deepEqual(await settings(1), { easing: 'ease-in-out', delay: '0s, 0s, 0.3s', perspective: '1200px' }, 'an unknown speed curve is ignored');
    assert.deepEqual(await settings(2), { easing: 'ease-in-out', delay: '0s, 0s, 0.3s', perspective: '1200px' }, 'defaults');

    // The card waits for the delay, then turns; the front hides half-way through the turn.
    await card(0).hover();
    await page.waitForTimeout(250);
    const waiting = await front(0);
    assert.ok(Math.abs(waiting.cos - 1) < 0.001, `still facing the viewer during the delay (${waiting.cos})`);
    await page.waitForTimeout(450);
    const turning = await front(0);
    assert.ok('visible' === turning.vis && turning.cos < 0.95 && turning.cos > 0, `turning after the delay (${JSON.stringify(turning)})`);
    await page.waitForTimeout(1000);
    assert.equal((await front(0)).vis, 'hidden');

    assert.deepEqual(errors, []);
  } finally {
    // Always close, or a failed assertion leaves the browser (and the test run) hanging.
    await browser.close();
  }
});

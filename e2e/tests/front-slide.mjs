// Live page: the Slide effect moves the back face in over the front face.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, resetPage } from '../lib.mjs';

test('back face slides in over the front, which stays visible', async () => {
  resetPage('slide');
  const browser = await launch();
  try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/slide/`, { waitUntil: 'networkidle' });
  const card = (i) => page.locator('.d5fc_flip_card').nth(i);
  const faces = (i) => card(i).evaluate((c) => [...c.querySelectorAll('.d5fc_flip_card_face')].map((f) => { const s = getComputedStyle(f); const m = new DOMMatrix(s.transform); return { vis: s.visibility, tx: Math.round(m.m41), ty: Math.round(m.m42), z: s.zIndex }; }));

  assert.equal(await card(0).evaluate((c) => getComputedStyle(c.querySelector('.d5fc_flip_card__inner')).overflow), 'hidden');
  const rest = await faces(0);
  assert.deepEqual(rest.map((f) => f.vis), ['visible', 'hidden']);
  assert.ok(rest[1].tx > 500, 'back face waits outside on the right');

  await card(0).hover();
  await page.waitForTimeout(500);
  const mid = await faces(0);
  assert.equal(mid[0].vis, 'visible', 'front visible while being covered');
  assert.ok(mid[1].tx > 0 && mid[1].tx < rest[1].tx, 'back face on its way in');
  assert.equal(mid[1].z, '1');
  await page.waitForTimeout(800);
  assert.deepEqual((await faces(0)).map((f) => [f.vis, f.tx]), [['visible', 0], ['visible', 0]], 'the front stays visible under the back');

  await page.mouse.move(2, 2);
  await page.waitForTimeout(500);
  assert.equal((await faces(0))[0].vis, 'visible', 'front visible again at once when leaving');
  await page.waitForTimeout(800);
  assert.deepEqual((await faces(0)).map((f) => f.vis), ['visible', 'hidden']);

  await card(1).hover();
  await page.waitForTimeout(500);
  const up = await faces(1);
  assert.ok(up[1].ty > 0 && up[1].tx === 0, 'up: back face comes from below');
  assert.deepEqual(errors, []);
  } finally {
    // Always close, or a failed assertion leaves the browser (and the test run) hanging.
    await browser.close();
  }
});

test('the back face\'s Design > Filters > Backdrop Blur blurs the front showing through', async () => {
  const browser = await launch();
  try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(`${BASE}/slide/`, { waitUntil: 'networkidle' });
  const backdrop = (i) => page.locator('.d5fc_flip_card').nth(i).evaluate((c) => getComputedStyle(c.querySelectorAll('.d5fc_flip_card_face')[1]).backdropFilter);
  assert.equal(await backdrop(2), 'blur(8px)');
  assert.equal(await backdrop(0), 'none', 'no blur unless set');
  await page.locator('.d5fc_flip_card').nth(2).hover();
  await page.waitForTimeout(600);
  const vis = await page.locator('.d5fc_flip_card').nth(2).evaluate((c) => [...c.querySelectorAll('.d5fc_flip_card_face')].map((f) => getComputedStyle(f).visibility));
  assert.deepEqual(vis, ['visible', 'visible']);
  } finally {
    // Always close, or a failed assertion leaves the browser (and the test run) hanging.
    await browser.close();
  }
});

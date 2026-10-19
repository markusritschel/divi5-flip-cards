// Live page: structure, height, hover flip, per-face design, extra face, grid, reduced motion.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, resetPage, faceVisibility } from '../lib.mjs';

let browser, page;
const errors = [];

before(async () => {
  resetPage('flip');
  browser = await launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/flip/`, { waitUntil: 'networkidle' });
});
after(() => browser?.close());

test('faces are direct children of the inner wrapper', async () => {
  const kids = await page.evaluate(() => [...document.querySelectorAll('.d5fc_flip_card__inner')].map((i) => [...i.children].every((c) => c.classList.contains('d5fc_flip_card_face'))));
  assert.ok(kids.length >= 6 && kids.every(Boolean));
});

test('card is as tall as the taller face, and hovering flips it', async () => {
  const h = await page.evaluate(() => { const c = document.querySelector('.d5fc_flip_card_0'); return [c, ...c.querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face')].map((e) => e.getBoundingClientRect().height); });
  assert.equal(h[1], h[0]);
  assert.equal(h[2], h[0]);
  assert.deepEqual(await faceVisibility(page, 0), ['visible', 'hidden']);
  await page.locator('.d5fc_flip_card_0').hover();
  await page.waitForTimeout(900);
  assert.deepEqual(await faceVisibility(page, 0), ['hidden', 'visible']);
  await page.mouse.move(2, 2);
  await page.waitForTimeout(900);
});

test('duration setting reaches the transition', async () => {
  const d = await page.evaluate(() => [0, 1].map((i) => getComputedStyle(document.querySelector(`.d5fc_flip_card_${i} .d5fc_flip_card_face`)).transitionDuration));
  // transform, opacity, visibility, then the back face's clip (`--d5fc-out`, `--d5fc-released`).
  assert.deepEqual(d, ['0.6s, 0.6s, 0s, 0.6s, 0s', '1.2s, 1.2s, 0s, 1.2s, 0s']);
});

test('per-face design settings apply', async () => {
  const s = await page.evaluate(() => { const st = getComputedStyle(document.querySelector('.d5fc_flip_card_face_0')); return [st.backgroundColor, st.padding, st.borderTopLeftRadius, `${st.borderTopWidth} ${st.borderTopStyle}`, st.boxShadow !== 'none']; });
  assert.deepEqual(s, ['rgb(255, 204, 0)', '11px 12px 13px 14px', '20px', '3px solid', true]);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.d5fc_flip_card_face_1')).flexDirection), 'column');
});

test('a third face is hidden', async () => {
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelectorAll('.d5fc_flip_card_2 .d5fc_flip_card_face')[2]).display), 'none');
});

test('cards in a grid group line up', async () => {
  const g = await page.evaluate(() => { const grp = [...document.querySelectorAll('.et_pb_group')].find((e) => e.querySelector('.d5fc_flip_card_3')); return { cols: getComputedStyle(grp).gridTemplateColumns.split(' ').length, tops: [...grp.querySelectorAll(':scope > .d5fc_flip_card')].map((c) => Math.round(c.getBoundingClientRect().top)) }; });
  assert.equal(g.cols, 3);
  assert.equal(new Set(g.tops).size, 1);
});

test('reduced motion cross-fades instead of rotating', async () => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.d5fc_flip_card_1').hover();
  await page.waitForTimeout(1500);
  const f = await page.evaluate(() => [...document.querySelectorAll('.d5fc_flip_card_1 .d5fc_flip_card_face')].map((x) => [getComputedStyle(x).transform, getComputedStyle(x).opacity]));
  assert.deepEqual(f, [['none', '0'], ['none', '1']]);
  assert.deepEqual(errors, []);
});

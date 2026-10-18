// Live page: a sliding back face sits at the edge it comes from; its size comes from the back
// face's own Design > Sizing, and without one it fills the card.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, wp, resetPage } from '../lib.mjs';

let browser, page;
before(async () => {
  if (!wp('post', 'list', '--post_type=page', '--name=back-size', '--field=ID')) {
    wp('post', 'create', '/fixtures/back-size.html', '--post_type=page', '--post_status=publish', '--post_title=back-size', '--post_name=back-size', '--meta_input={"_et_pb_use_builder":"on"}');
  }
  resetPage('back-size');
  browser = await launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
  await page.goto(`${BASE}/back-size/`, { waitUntil: 'networkidle' });
});
after(() => browser?.close());

// Back face box relative to the card, measured while the card shows its back.
const flipped = async (i) => {
  const card = page.locator('.d5fc_flip_card').nth(i);
  await card.hover();
  await page.waitForTimeout(500);
  const r = await card.evaluate((c) => {
    const cr = c.getBoundingClientRect();
    const [front, back] = c.querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face');
    const b = back.getBoundingClientRect();
    return {
      card: [Math.round(cr.width), Math.round(cr.height)], front: Math.round(front.getBoundingClientRect().height),
      back: [Math.round(b.left - cr.left), Math.round(b.top - cr.top), Math.round(b.width), Math.round(b.height)],
      backContent: back.scrollHeight,
    };
  });
  await page.mouse.move(2, 2);
  await page.waitForTimeout(400);
  return r;
};

test('Sizing height auto, sliding up: as tall as its content, at the bottom edge', async () => {
  const r = await flipped(0);
  assert.equal(r.card[1], r.front, 'card height = front height');
  assert.ok(r.back[3] < r.card[1] / 2, `back is short (${r.back[3]}px)`);
  assert.equal(r.back[1] + r.back[3], r.card[1], 'sits at the bottom edge');
  assert.equal(r.back[2], r.card[0], 'full width');
});

test('Sizing width 40%, sliding left: 40% wide, at the right edge, full height', async () => {
  const r = await flipped(1);
  assert.ok(Math.abs(r.back[2] - r.card[0] * 0.4) <= 1, `width ${r.back[2]} of ${r.card[0]}`);
  assert.equal(r.back[0] + r.back[2], r.card[0], 'right edge');
  assert.equal(r.back[3], r.card[1], 'full height');
});

test('no Sizing: the back face fills the card, and the card grows to the taller face', async () => {
  const r = await flipped(2);
  assert.equal(r.back[3], r.card[1], 'full height');
  assert.equal(r.backContent, r.card[1], 'the card grows with the long back face (nothing clipped)');
  assert.ok(r.card[1] > 400, `taller than the short front alone (${r.card[1]}px)`);
  assert.deepEqual([r.back[0], r.back[1], r.back[2]], [0, 0, r.card[0]]);
});

test('the flip effect is unaffected', async () => {
  const r = await page.locator('.d5fc_flip_card').nth(3).evaluate((c) => {
    const [front, back] = c.querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face');
    return [Math.round(back.getBoundingClientRect().width), Math.round(front.getBoundingClientRect().width), Math.round(back.getBoundingClientRect().height), Math.round(front.getBoundingClientRect().height)];
  });
  assert.deepEqual([r[0], r[2]], [r[1], r[3]], 'same size as the front');
});

// Live page: Design > Flip Button (position, text, colors) styles the flip button.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, wp, resetPage, faceVisibility } from '../lib.mjs';

let browser, page;
before(async () => {
  if (!wp('post', 'list', '--post_type=page', '--name=button-design', '--field=ID')) {
    wp('post', 'create', '/fixtures/button-design.html', '--post_type=page', '--post_status=publish', '--post_title=button-design', '--post_name=button-design', '--meta_input={"_et_pb_use_builder":"on"}');
  }
  resetPage('button-design');
  browser = await launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/button-design/`, { waitUntil: 'networkidle' });
});
after(() => browser?.close());

const button = (i) => page.locator('.d5fc_flip_card').nth(i).evaluate((c) => {
  const b = c.querySelector(':scope > .d5fc_flip_card__toggle');
  const s = getComputedStyle(b);
  const cr = c.getBoundingClientRect();
  const br = b.getBoundingClientRect();
  return {
    left: Math.round(br.left - cr.left), top: Math.round(br.top - cr.top),
    right: Math.round(cr.right - br.right), bottom: Math.round(cr.bottom - br.bottom),
    width: Math.round(br.width), text: b.innerText.trim(), bg: s.backgroundColor, color: s.color,
    labelWidth: Math.round(b.querySelector('.d5fc_flip_card__toggle-label').getBoundingClientRect().width),
    icon: getComputedStyle(b.querySelector('path')).stroke,
  };
});

test('position, text and colors from the Design tab', async () => {
  const b = await button(0);
  assert.deepEqual([b.left, b.top], [10, 10], 'top left corner');
  assert.equal(b.text, 'More');
  assert.ok(b.labelWidth > 20, 'the text is visible');
  assert.ok(b.width > 36, 'a pill wide enough for the text');
  assert.equal(b.bg, 'rgb(255, 0, 0)');
  assert.equal(b.color, 'rgb(0, 255, 0)');
  assert.equal(b.icon, 'rgb(0, 255, 0)', 'the icon follows the text color');
  await page.locator('.d5fc_flip_card').nth(0).locator(':scope > .d5fc_flip_card__toggle').click();
  await page.waitForTimeout(800);
  assert.deepEqual(await faceVisibility(page, 0), ['hidden', 'visible'], 'still flips the card');
});

test('without settings: round icon button in the bottom right corner', async () => {
  const b = await button(1);
  assert.deepEqual([b.right, b.bottom, b.width], [10, 10, 36]);
  assert.equal(b.text, 'Flip card');
  assert.equal(b.labelWidth, 1, 'the label is only for screen readers');
  assert.equal(b.bg, 'rgba(0, 0, 0, 0.6)');
});

test('a picked icon replaces the arrows, in the Divi icon font', async () => {
  const r = await page.locator('.d5fc_flip_card').nth(2).evaluate((c) => {
    const b = c.querySelector(':scope > .d5fc_flip_card__toggle');
    const i = b.querySelector('.d5fc_flip_card__toggle-icon');
    return { svg: !!b.querySelector('svg'), text: i?.textContent, family: i && getComputedStyle(i).fontFamily };
  });
  assert.equal(r.svg, false, 'no arrows');
  assert.equal(r.text, '\ue030', 'the picked glyph');
  assert.match(r.family, /ETmodules/);
  await page.evaluate(() => document.fonts.ready);
  assert.ok(await page.evaluate(() => document.fonts.check('18px ETmodules')), 'Divi loaded its icon font');
});

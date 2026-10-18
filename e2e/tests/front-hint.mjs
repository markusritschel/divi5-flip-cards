// Live page: the optional flip hint (badge, one wiggle on scroll-in, hidden when flipped).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, wp, resetPage } from '../lib.mjs';

let browser;
before(async () => {
  // The fixture page is created on first use, so the suite works without re-running setup.sh.
  if (!wp('post', 'list', '--post_type=page', '--name=hint', '--field=ID')) {
    wp('post', 'create', '/fixtures/hint.html', '--post_type=page', '--post_status=publish', '--post_title=hint', '--post_name=hint', '--meta_input={"_et_pb_use_builder":"on"}');
  }
  resetPage('hint');
  browser = await launch();
});
after(() => browser?.close());

const hint = (page, i) => page.locator('.d5fc_flip_card').nth(i).evaluate((c) => {
  const h = c.querySelector(':scope > .d5fc_flip_card__hint');
  if (!h) return null;
  const s = getComputedStyle(h);
  return { display: s.display, opacity: s.opacity, animation: s.animationName, played: c.classList.contains('d5fc_flip_card--hint-played') };
});

test('badge only where the hint is on, never with the flip button trigger', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  await page.goto(`${BASE}/hint/`, { waitUntil: 'networkidle' });
  const first = await hint(page, 0);
  assert.equal(first.display, 'flex');
  assert.equal((await hint(page, 1)).display, 'none', 'hidden with the button trigger');
  assert.equal(await hint(page, 2), null, 'no badge without the setting');
  assert.ok(first.played, 'a card in view has wiggled');
  assert.equal(first.animation, 'd5fc-hint-wiggle');
  await page.close();
});

test('a card below the fold wiggles only once scrolled into view; flipped cards hide the badge', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 700 } });
  await page.goto(`${BASE}/hint/`, { waitUntil: 'networkidle' });
  assert.equal((await hint(page, 3)).played, false, 'not yet');
  await page.locator('.d5fc_flip_card').nth(3).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  assert.equal((await hint(page, 3)).played, true, 'after scrolling');

  await page.locator('.d5fc_flip_card').nth(3).hover();
  await page.waitForTimeout(600);
  assert.equal((await hint(page, 3)).opacity, '0', 'badge gone while the back shows');
  await page.close();
});

test('no wiggle for reduced motion', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 700 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/hint/`, { waitUntil: 'networkidle' });
  assert.equal((await hint(page, 0)).animation, 'none');
  await ctx.close();
});

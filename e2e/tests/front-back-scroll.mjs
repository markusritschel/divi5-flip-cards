// A back face with Design > Sizing height 100% and Overflow Y scroll (or auto) takes the front's
// height and scrolls its content, instead of making the card taller. Live page and builder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASE, wp, resetPage, start, builder, launch } from '../lib.mjs';

const SCROLL = 'd5fc_flip_card_face--scroll';

// Card i, measured while it shows its back: card and face heights, and the back face's scrolling.
const measure = async (page, i) => {
  const card = page.locator('.d5fc_flip_card').nth(i);
  await card.hover();
  await page.waitForTimeout(600);
  const r = await card.evaluate((c) => {
    const [front, back] = c.querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face');
    back.scrollTop = 50;
    return {
      card: Math.round(c.getBoundingClientRect().height),
      front: Math.round(front.getBoundingClientRect().height),
      back: Math.round(back.getBoundingClientRect().height),
      content: back.scrollHeight,
      scrolled: back.scrollTop,
      scroll: back.classList.contains('d5fc_flip_card_face--scroll'),
      scrollbar: getComputedStyle(back).scrollbarWidth,
    };
  });
  await page.mouse.move(2, 2);
  await page.waitForTimeout(400);
  return r;
};

test('a scrolling back face takes the front\'s height; a visible one still grows the card', async () => {
  if (!wp('post', 'list', '--post_type=page', '--name=back-scroll', '--field=ID')) {
    wp('post', 'create', '/fixtures/back-scroll.html', '--post_type=page', '--post_status=publish', '--post_title=back-scroll', '--post_name=back-scroll', '--meta_input={"_et_pb_use_builder":"on"}');
  }
  resetPage('back-scroll');
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
    await page.goto(`${BASE}/back-scroll/`, { waitUntil: 'networkidle' });

    const short = [];
    for (const [i, label] of [[0, 'flip, scroll'], [1, 'slide, auto']]) {
      const r = await measure(page, i);
      short.push(r.card);
      assert.equal(r.scroll, true, `${label}: marked as scrolling`);
      assert.equal(r.card, r.front, `${label}: card as tall as the front (${JSON.stringify(r)})`);
      assert.equal(r.back, r.card, `${label}: back face fills the card`);
      assert.ok(r.content > r.back + 100, `${label}: the long content overflows the face`);
      assert.equal(r.scrolled, 50, `${label}: and scrolls`);
      assert.equal(r.scrollbar, 'thin', `${label}: with a thin scrollbar`);
    }

    const visible = await measure(page, 2);
    assert.equal(visible.scroll, false);
    // Same short front as the cards above; the long back face makes this card taller.
    assert.ok(visible.card > Math.max(...short) + 100 && visible.content === visible.card, `overflow visible: the card grows with the back (${JSON.stringify(visible)}, scrolling cards ${short})`);
  } finally {
    await browser.close();
  }
});

test('builder: the same class; the stacked view shows the whole back face', async () => {
  const { browser, context } = await start();
  try {
    const { app } = await builder(context, 'back-scroll');
    const r = await app.evaluate((cls) => [...document.querySelectorAll('.d5fc_flip_card')].map((c) => {
      const back = c.querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face')[1];
      return { scroll: back.classList.contains(cls), height: Math.round(back.getBoundingClientRect().height), content: back.scrollHeight };
    }), SCROLL);
    assert.deepEqual(r.map((x) => x.scroll), [true, true, false]);
    // "Show in Builder: Both" (the default) stacks the faces: the back face shows all its content.
    assert.ok(r.every((x) => x.height >= x.content - 1), `stacked: nothing hidden (${JSON.stringify(r)})`);
  } finally {
    await browser.close();
  }
});

// Live page: the Fade, Zoom and Cube effects.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, resetPage } from '../lib.mjs';

// Per face: visibility, opacity, scale (x), the cosine of the turn and the depth (z translation).
const facesOf = (card) => card.evaluate((c) => [...c.querySelectorAll('.d5fc_flip_card_face')].map((f) => {
  const s = getComputedStyle(f);
  const m = new DOMMatrix(s.transform);
  return { vis: s.visibility, op: Number(s.opacity), sx: Math.hypot(m.m11, m.m12, m.m13), cosY: m.m11, cosX: m.m22, z: Math.round(m.m43), none: 'none' === s.transform };
}));

test('fade, zoom and cube move the faces as designed', async () => {
  resetPage('effects');
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/effects/`, { waitUntil: 'networkidle' });
    const card = (i) => page.locator('.d5fc_flip_card').nth(i);

    // Hovers card i, returns the faces half-way and once the transition is over.
    const turn = async (i) => {
      await card(i).hover();
      await page.waitForTimeout(500);
      const mid = await facesOf(card(i));
      await page.waitForTimeout(800);
      const end = await facesOf(card(i));
      await page.mouse.move(2, 2);
      await page.waitForTimeout(1300);
      return { mid, end };
    };

    // Fade: no movement, the faces cross-fade; the back lies over the front.
    const fadeRest = await facesOf(card(0));
    assert.deepEqual(fadeRest.map((f) => [f.vis, f.op, f.none]), [['visible', 1, true], ['hidden', 0, true]]);
    const fade = await turn(0);
    assert.deepEqual(fade.mid.map((f) => f.vis), ['visible', 'visible'], 'fade: both faces visible half-way');
    assert.ok(fade.mid.every((f) => f.op > 0.05 && f.op < 0.95), `fade: both half transparent (${fade.mid.map((f) => f.op)})`);
    assert.deepEqual(fade.end.map((f) => [f.vis, f.op]), [['hidden', 0], ['visible', 1]]);

    // Zoom: the front shrinks away, the back grows in from a little larger, inside the card (the
    // back face clips itself, see front-shadows.mjs).
    assert.equal(await card(1).evaluate((c) => getComputedStyle(c.querySelector('.d5fc_flip_card__inner')).overflow), 'visible');
    const zoom = await turn(1);
    assert.ok(zoom.mid[0].sx < 1 && zoom.mid[0].sx > 0.85, `zoom: front shrinking (${zoom.mid[0].sx})`);
    assert.ok(zoom.mid[1].sx > 1 && zoom.mid[1].sx < 1.15, `zoom: back growing in (${zoom.mid[1].sx})`);
    assert.deepEqual(zoom.end.map((f) => [f.vis, f.op, Math.round(f.sx * 100)]), [['hidden', 0, 85], ['visible', 1, 100]]);

    // Cube, left: both faces turn together around an axis behind the card; the front stays visible
    // until it has turned away.
    const cube = await turn(2);
    assert.deepEqual(cube.mid.map((f) => f.vis), ['visible', 'visible'], 'cube: both faces visible half-way');
    assert.ok(cube.mid.every((f) => f.cosY > 0.05 && f.cosY < 0.95), `cube: both faces part-way through the quarter turn (${cube.mid.map((f) => f.cosY)})`);
    assert.ok(cube.mid.every((f) => f.z !== 0), 'cube: the faces move in depth while turning');
    assert.deepEqual(cube.end.map((f) => f.vis), ['hidden', 'visible']);
    assert.ok(Math.abs(cube.end[1].cosY - 1) < 0.001 && 0 === cube.end[1].z, 'cube: the back face ends facing the viewer');

    // Cube, up: the depth is half the card's height, measured by the front-end script.
    const depth = await card(3).evaluate((c) => {
      const inner = c.querySelector('.d5fc_flip_card__inner');
      return { value: parseFloat(inner.style.getPropertyValue('--d5fc-depth-y')), half: inner.getBoundingClientRect().height / 2 };
    });
    assert.ok(depth.value > 50 && Math.abs(depth.value - depth.half) < 1, `cube up: depth is half the height (${JSON.stringify(depth)})`);
    const up = await turn(3);
    assert.ok(up.mid.every((f) => f.cosX > 0.05 && f.cosX < 0.95 && f.z !== 0), `cube up: turning around the x axis, in depth (${JSON.stringify(up.mid)})`);
    assert.deepEqual(up.end.map((f) => f.vis), ['hidden', 'visible']);

    assert.deepEqual(errors, []);
  } finally {
    // Always close, or a failed assertion leaves the browser (and the test run) hanging.
    await browser.close();
  }
});

// Live page: diagonal directions for the flip, the slide and the cube (which flips instead).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { launch, BASE, resetPage } from '../lib.mjs';

// Per face: visibility, the z components of the x and y axes (the tilt around each axis) and the
// x/y translation.
const facesOf = (card) => card.evaluate((c) => [...c.querySelectorAll('.d5fc_flip_card_face')].map((f) => {
  const s = getComputedStyle(f);
  const m = new DOMMatrix(s.transform);
  return { vis: s.visibility, xz: m.m13, yz: m.m23, tx: Math.round(m.m41), ty: Math.round(m.m42) };
}));

test('diagonal directions turn and slide across both axes', async () => {
  resetPage('diagonals');
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/diagonals/`, { waitUntil: 'networkidle' });
    const card = (i) => page.locator('.d5fc_flip_card').nth(i);

    const midTurn = async (i) => {
      await card(i).hover();
      await page.waitForTimeout(350);
      const mid = await facesOf(card(i));
      await page.waitForTimeout(1000);
      const end = await facesOf(card(i));
      await page.mouse.move(2, 2);
      await page.waitForTimeout(1300);
      return { mid, end };
    };

    // Flip, up left: the front tilts around both axes; it hides half-way, as with any flip.
    const flip = await midTurn(0);
    assert.equal(flip.mid[0].vis, 'visible');
    assert.ok(Math.abs(flip.mid[0].xz) > 0.1 && Math.abs(flip.mid[0].yz) > 0.1, `flip: tilted around both axes (${JSON.stringify(flip.mid[0])})`);
    assert.deepEqual(flip.end.map((f) => f.vis), ['hidden', 'visible']);

    // Slide, down right: the back face comes in from the top left corner.
    const rest = await facesOf(card(1));
    assert.ok(rest[1].tx < -500 && rest[1].ty < -100, `slide: back face waits top left (${JSON.stringify(rest[1])})`);
    const slide = await midTurn(1);
    assert.ok(slide.mid[1].tx < 0 && slide.mid[1].tx > rest[1].tx && slide.mid[1].ty < 0 && slide.mid[1].ty > rest[1].ty, 'slide: back face on its way in, diagonally');
    assert.deepEqual(slide.end.map((f) => [f.vis, f.tx, f.ty]), [['visible', 0, 0], ['visible', 0, 0]]);

    // Cube, up right: flips diagonally instead (no depth movement, back hidden until half-way).
    const cube = await midTurn(2);
    assert.ok(Math.abs(cube.mid[0].xz) > 0.1 && Math.abs(cube.mid[0].yz) > 0.1, 'cube: diagonal flip');
    assert.equal(cube.mid[1].vis, 'hidden', 'cube: the back appears only half-way, as with a flip');
    assert.deepEqual(cube.end.map((f) => f.vis), ['hidden', 'visible']);

    assert.deepEqual(errors, []);
  } finally {
    // Always close, or a failed assertion leaves the browser (and the test run) hanging.
    await browser.close();
  }
});

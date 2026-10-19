// Live page: a face's Box Shadow shows with every effect, at rest and once turned, while slide and
// zoom still keep the moving back face inside the card. The fixture gives the front a red ring, the
// back a blue ring and a green background (Divi's "preset5": 10px spread, no blur).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { launch, BASE, resetPage } from '../lib.mjs';

// What the page shows at the given points, read from a screenshot (decoded in the page).
async function colorsAt(page, points) {
  const png = (await page.screenshot()).toString('base64');
  return page.evaluate(async ({ png, points }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${png}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return points.map(([x, y]) => {
      const [r, g, b] = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      if (r > 180 && g < 90 && b < 90) return 'red';
      if (b > 180 && r < 90 && g < 90) return 'blue';
      if (r >= 250 && g >= 250 && b >= 250) return 'white';
      return `rgb(${r},${g},${b})`;
    });
  }, { png, points });
}

// Points `d` px outside the middle of each edge of card i's faces: top, right, bottom, left.
const around = (page, i, d) => page.locator('.d5fc_flip_card__inner').nth(i).evaluate((inner, d) => {
  const r = inner.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  return [[x, r.top - d], [r.right + d, y], [x, r.bottom + d], [r.left - d, y]];
}, d);

const all = (c) => [c, c, c, c];

test('face shadows show with every effect; slide and zoom stay inside the card', async () => {
  resetPage('shadows');
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/shadows/`, { waitUntil: 'networkidle' });
    const cards = page.locator('.d5fc_flip_card');
    const count = await cards.count();
    assert.equal(count, 8);

    // Per card: the ring at rest, half-way (slide and zoom: 30px out, where nothing may show), once
    // turned and once turned back. Compared at the end, so a failure lists every effect.
    const seen = {};
    const expected = {};
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const label = (await card.locator('p').first().textContent()).replace(' front', '');
      const moves = /SLIDE|ZOOM/.test(label);
      await card.evaluate((c) => c.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.mouse.move(2, 2);
      await page.waitForTimeout(700);
      const ring = await around(page, i, 5);
      seen[label] = { rest: await colorsAt(page, ring) };

      const box = await card.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      if (moves) {
        await page.waitForTimeout(200);
        seen[label].halfWay = await colorsAt(page, await around(page, i, 30));
      }
      await page.waitForTimeout(700);
      seen[label].turned = await colorsAt(page, ring);

      await page.mouse.move(2, 2);
      await page.waitForTimeout(700);
      seen[label].back = await colorsAt(page, ring);

      expected[label] = { rest: all('red'), ...(moves && { halfWay: all('white') }), turned: all('blue'), back: all('red') };
    }
    const failing = Object.keys(seen).filter((k) => !isDeepStrictEqual(seen[k], expected[k]));
    assert.deepEqual(seen, expected, `wrong for ${failing.join(', ')}: ${JSON.stringify(Object.fromEntries(failing.map((k) => [k, seen[k]])))}`);
    assert.deepEqual(errors, []);
  } finally {
    // Always close, or a failed assertion leaves the browser (and the test run) hanging.
    await browser.close();
  }
});

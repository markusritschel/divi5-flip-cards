// Builder: Trigger and Effect tiles, the canvas flip button, and the one-off preview.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { start, builder, resetPage, openFlipSettings } from '../lib.mjs';

let browser, context;
before(async () => ({ browser, context } = await start()));
after(() => browser?.close());

const tile = (page, label) => page.locator('button', { hasText: new RegExp(`^\\s*${label}\\s*$`) }).first();
const tileLabels = (page, label) => tile(page, label).evaluate((b) => [...b.parentElement.querySelectorAll('button')].map((x) => x.innerText.trim()));
const cardClasses = (app) => app.evaluate(() => document.querySelector('.d5fc_flip_card').className);

test('trigger tiles; with "Button" the canvas shows the flip button, which switches the face', async () => {
  resetPage('flip-edit');
  const { page, app, errors } = await builder(context, 'flip-edit');
  await openFlipSettings(page, app);
  assert.deepEqual(await tileLabels(page, 'Button'), ['Hover', 'Click', 'Button']);
  const width = () => app.evaluate(() => Math.round(document.querySelector('.d5fc_flip_card > .d5fc_flip_card__toggle').getBoundingClientRect().width));
  assert.equal(await width(), 1);
  await tile(page, 'Button').click();
  await page.waitForTimeout(1000);
  assert.match(await cardClasses(app), /trigger-button/);
  assert.equal(await width(), 36);
  await page.locator('#et-vb-flip-advanced-preview').click();
  await page.locator('#et-vb-flip-advanced-preview li[data-value="front"]').click();
  await page.waitForTimeout(800);
  await app.locator('.d5fc_flip_card > .d5fc_flip_card__toggle').click();
  await page.waitForTimeout(1000);
  assert.match(await cardClasses(app), /preview-back/);
  assert.deepEqual(errors, []);
  await page.close();
});

test('"Show Flip Hint" adds the badge on the canvas', async () => {
  resetPage('flip-edit');
  const { page, app, errors } = await builder(context, 'flip-edit');
  await openFlipSettings(page, app);
  assert.equal(await app.locator('.d5fc_flip_card > .d5fc_flip_card__hint').count(), 0);
  await page.locator('[aria-label="Toggle flip-advanced-hint"]').click();
  await page.waitForTimeout(1000);
  assert.equal(await app.locator('.d5fc_flip_card > .d5fc_flip_card__hint').count(), 1);
  assert.match(await cardClasses(app), /d5fc_flip_card--hint\b/);
  assert.deepEqual(errors, []);
  await page.close();
});

test('Design tab: Flip Button groups; button text updates the canvas button', async () => {
  resetPage('flip-edit');
  const { page, app, errors } = await builder(context, 'flip-edit');
  await openFlipSettings(page, app);
  await page.getByRole('tab', { name: 'Design' }).or(page.locator('text=Design')).first().click();
  await page.waitForTimeout(800);
  assert.ok(await page.getByText('Flip Button Text', { exact: true }).count(), 'text group');
  await page.getByText('Flip Button', { exact: true }).first().click();
  await page.waitForTimeout(800);
  const input = page.locator('input[id*="flipButton-advanced-label"], input[name*="flipButton-advanced-label"]').first();
  assert.equal(await input.count(), 1, 'Button Text field');
  await input.fill('More');
  await input.press('Tab');
  await page.waitForTimeout(1200);
  const b = await app.evaluate(() => { const t = document.querySelector('.d5fc_flip_card > .d5fc_flip_card__toggle'); return [t.classList.contains('d5fc_flip_card__toggle--labelled'), t.querySelector('.d5fc_flip_card__toggle-label').textContent]; });
  assert.deepEqual(b, [true, 'More']);
  assert.deepEqual(errors, []);
  await page.close();
});

test('direction tiles with arrows; choosing one switches the card', async () => {
  resetPage('flip-edit');
  const { page, app, errors } = await builder(context, 'flip-edit');
  await openFlipSettings(page, app);
  const tiles = page.locator('button[name^="et-vb-field-input-button-options--flip-advanced-direction--"]');
  assert.deepEqual(await tiles.evaluateAll((bs) => bs.map((b) => [b.dataset.name, b.innerText.trim(), !!b.querySelector('.et-vb-icon svg path')])), [
    ['left', 'Left', true], ['right', 'Right', true], ['up', 'Up', true], ['down', 'Down', true],
  ]);
  await tiles.nth(2).click();
  await page.waitForTimeout(800);
  assert.match(await cardClasses(app), /d5fc_flip_card--up\b/);
  assert.deepEqual(errors, []);
  await page.close();
});

test('effect tiles; choosing one plays the preview once and restores the stacked view', async () => {
  resetPage('flip-edit');
  const { page, app, errors } = await builder(context, 'flip-edit');
  await openFlipSettings(page, app);
  assert.deepEqual(await tileLabels(page, 'Slide'), ['Flip', 'Slide']);
  await tile(page, 'Slide').click();
  const samples = [];
  for (let i = 0; i < 12; i++) {
    samples.push(await cardClasses(app));
    await page.waitForTimeout(250);
  }
  assert.ok(samples.some((s) => s.includes('--play')), 'preview played');
  assert.ok(samples.at(-1).includes('--slide') && !samples.at(-1).includes('--play'));
  await page.waitForTimeout(1500);
  assert.match(await cardClasses(app), /preview-both/);
  assert.deepEqual(errors, []);
  await page.close();
});

// Every animation frame after a tile click: a slide preview must not rotate a visible face, a flip
// preview must not move one sideways (the old effect's position must not animate into the new one).
test('the preview shows only the chosen effect', async () => {
  for (const view of ['both', 'front']) {
    for (const effect of ['Slide', 'Flip']) {
      resetPage('flip-edit');
      const { page, app } = await builder(context, 'flip-edit');
      await openFlipSettings(page, app);
      if ('front' === view) {
        await page.locator('#et-vb-flip-advanced-preview').click();
        await page.locator('#et-vb-flip-advanced-preview li[data-value="front"]').click();
        await page.waitForTimeout(800);
      }
      if ('Flip' === effect) {
        await tile(page, 'Slide').click();
        await page.waitForTimeout(3000);
      }
      const recording = app.evaluate(() => new Promise((resolve) => {
        const card = document.querySelector('.d5fc_flip_card');
        const frames = [];
        const t0 = performance.now();
        const tick = () => {
          frames.push({
            cls:   card.className,
            faces: [...card.querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face')].map((f) => { const s = getComputedStyle(f); const m = new DOMMatrix(s.transform); return { vis: s.visibility, rot: Math.max(Math.abs(m.m13), Math.abs(m.m23)), tr: Math.abs(m.m41) + Math.abs(m.m42) }; }),
          });
          if (performance.now() - t0 < 2600) requestAnimationFrame(tick); else resolve(frames);
        };
        requestAnimationFrame(tick);
      }));
      await tile(page, effect).click();
      const frames = await recording;
      const stray = frames.filter((f) => !f.cls.includes('preview-both') && f.faces.some((x) => 'visible' === x.vis && ('Slide' === effect ? x.rot > 0.02 : x.tr > 2)));
      assert.ok(frames.some((f) => f.cls.includes('--play')), `${view}/${effect}: preview played`);
      assert.equal(stray.length, 0, `${view}/${effect}: stray motion`);
      await page.close();
    }
  }
});

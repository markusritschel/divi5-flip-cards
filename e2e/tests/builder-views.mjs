// Builder: stacked view, Front/Back switch, hover off, extra faces, save and reload.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { start, builder, frontend, resetPage, wp, faceVisibility, openFlipSettings } from '../lib.mjs';

let browser, context;
before(async () => ({ browser, context } = await start()));
after(() => browser?.close());

test('default "Both" stacks the faces, labelled; extra faces are outlined; live page unchanged', async () => {
  resetPage('flip');
  const { page, app, errors } = await builder(context, 'flip');
  const c0 = await app.evaluate(() => { const c = document.querySelector('.d5fc_flip_card'); const f = [...c.querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face')]; return { stacked: c.classList.contains('d5fc_flip_card--preview-both'), below: f[1].getBoundingClientRect().top >= f[0].getBoundingClientRect().bottom, labels: f.map((x) => getComputedStyle(x, '::after').content) }; });
  assert.deepEqual(c0, { stacked: true, below: true, labels: ['"Front"', '"Back"'] });
  assert.deepEqual(await faceVisibility(app, 0), ['visible', 'visible']);
  const extra = await app.evaluate(() => { const f = document.querySelectorAll('.d5fc_flip_card')[2].querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face')[2]; const s = getComputedStyle(f); return [s.display, s.outlineStyle, s.outlineColor]; });
  assert.deepEqual(extra, ['block', 'dashed', 'rgb(224, 43, 32)']);
  assert.deepEqual(errors, []);
  await page.close();

  const { page: live } = await frontend(context, 'flip');
  assert.deepEqual(await faceVisibility(live, 0), ['visible', 'hidden']);
  assert.ok(!(await live.locator('.d5fc_flip_card').first().getAttribute('class')).includes('preview'));
  await live.close();
});

test('Front/Back switch next to the toolbar flips the preview and syncs the setting; hover does not', async () => {
  resetPage('flip-switch');
  const { page, app, errors } = await builder(context, 'flip-switch');
  const card = app.locator('.d5fc_flip_card').first();
  await card.hover();
  await page.waitForTimeout(600);
  assert.deepEqual(await faceVisibility(app), ['hidden', 'visible'], 'hover changes nothing');
  assert.ok(await app.locator('.d5fc_flip_card__switch').isVisible());
  await app.locator('.d5fc_flip_card__switch button', { hasText: 'Front' }).click();
  await page.waitForTimeout(1000);
  assert.deepEqual(await faceVisibility(app), ['visible', 'hidden']);
  await card.hover();
  await app.locator('.d5fc_flip_card__switch button', { hasText: 'Back' }).click();
  await page.waitForTimeout(1000);
  assert.deepEqual(await faceVisibility(app), ['hidden', 'visible']);
  await openFlipSettings(page, app);
  assert.equal((await page.locator('#et-vb-flip-advanced-preview').innerText()).trim(), 'Back');
  assert.deepEqual(errors, []);
  await page.close();
});

test('editing a module on the hidden face shows that face, without changing the setting', async () => {
  resetPage('flip-switch');
  const { page, app, errors } = await builder(context, 'flip-switch');
  const card = app.locator('.d5fc_flip_card').first();
  await card.hover();
  await page.waitForTimeout(500);
  await app.locator('.d5fc_flip_card__switch button', { hasText: 'Front' }).click();
  await page.waitForTimeout(1000);
  assert.deepEqual(await faceVisibility(app), ['visible', 'hidden']);

  // Open the Back face's settings from the card's face list.
  await card.hover({ force: true });
  await page.waitForTimeout(400);
  await app.locator('.d5fc_flip_card > .et-vb-module-options button.et-vb-module-options-button').first().click();
  await page.waitForTimeout(1500);
  const back = page.locator('.et-vb-draggable-list-item', { hasText: 'Back' }).first();
  await back.hover();
  await back.locator('button').first().click();
  await page.waitForTimeout(1500);
  assert.deepEqual(await faceVisibility(app), ['hidden', 'visible'], 'back face shown while it is edited');
  assert.ok(!(await card.getAttribute('class')).includes('preview-back'), 'setting still Front');
  await card.hover({ force: true });
  assert.equal(await app.locator('.d5fc_flip_card__switch .is-active').innerText(), 'Back');

  await app.locator('.d5fc_flip_card__switch button', { hasText: 'Front' }).click();
  await page.waitForTimeout(1000);
  assert.deepEqual(await faceVisibility(app), ['visible', 'hidden'], 'the switch takes over again');
  assert.deepEqual(errors, []);
  await page.close();
});

test('settings survive save and reload, and reach the live page', async () => {
  resetPage('flip-edit');
  const fields = (page) => page.evaluate(() => ({
    preview:   document.querySelector('#et-vb-flip-advanced-preview')?.innerText.trim(),
    direction: document.querySelector('button.et-vb-field-input-button-option--selected[name*="flip-advanced-direction"] .et-vb-field-input-button-option-label')?.innerText.trim(),
    duration:  document.querySelector('input#et-vb-field-common-numeric-input--range--flip-advanced-duration, #et-vb-field-common-numeric-input--range--flip-advanced-duration input')?.value,
  }));
  {
    const { page, app, errors } = await builder(context, 'flip-edit');
    await openFlipSettings(page, app);
    await page.locator('#et-vb-flip-advanced-preview').click();
    await page.waitForTimeout(400);
    await page.locator('#et-vb-flip-advanced-preview li[data-value="back"]').click();
    await page.waitForTimeout(800);
    await page.locator('button[name="et-vb-field-input-button-options--flip-advanced-direction--down"]').click();
    await page.waitForTimeout(800);
    const num = page.locator('input#et-vb-field-common-numeric-input--range--flip-advanced-duration, #et-vb-field-common-numeric-input--range--flip-advanced-duration input').first();
    await num.click({ clickCount: 3 });
    await num.fill('900');
    await num.press('Enter');
    await page.waitForTimeout(1200);
    assert.equal(await app.evaluate(() => document.querySelector('.d5fc_flip_card style.et-vb-module-styles')?.textContent.match(/--d5fc-duration:\s*([^;]*)/)?.[1]), '900ms');
    await page.locator('button:has-text("Save")').first().click();
    await page.waitForTimeout(5000);
    assert.deepEqual(errors, []);
    await page.close();
  }
  const id = wp('post', 'list', '--post_type=page', '--name=flip-edit', '--field=ID');
  assert.match(wp('post', 'get', id, '--field=post_content'), /"preview":\{"desktop":\{"value":"back"\}\},"direction":\{"desktop":\{"value":"down"\}\},"duration":\{"desktop":\{"value":"900ms"\}\}/);
  {
    const { page, app } = await builder(context, 'flip-edit');
    assert.deepEqual(await faceVisibility(app), ['hidden', 'visible']);
    await openFlipSettings(page, app);
    assert.deepEqual(await fields(page), { preview: 'Back', direction: 'Down', duration: '900ms' });
    await page.close();
  }
  const { page: live } = await frontend(context, 'flip-edit');
  const c = await live.evaluate(() => { const card = document.querySelector('.d5fc_flip_card'); return [card.classList.contains('d5fc_flip_card--down'), getComputedStyle(card.querySelector('.d5fc_flip_card_face')).transitionDuration]; });
  assert.deepEqual(c, [true, '0.9s, 0.9s, 0s, 0.9s, 0s']);
  assert.deepEqual(await faceVisibility(live), ['visible', 'hidden']);
  await live.close();
});

// Builder: module picker, icon, inserting a card, where Faces can go, filling an empty face.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { start, builder, resetPage } from '../lib.mjs';

let browser, context;
before(async () => ({ browser, context } = await start()));
after(() => browser?.close());

const openColumnPicker = async (page, app) => {
  await app.locator('button.et-vb-add-module').first().click({ force: true });
  await page.waitForTimeout(1500);
};
const pickerOptions = (page) => page.locator('button.et-vb-module-picker-option').evaluateAll((bs) => bs.map((b) => b.value));

test('the picker offers Flip Card with a whole icon, never a bare Face', async () => {
  resetPage('empty');
  const { page, app, errors } = await builder(context, 'empty', '.et_pb_column');
  await openColumnPicker(page, app);
  const all = await pickerOptions(page);
  assert.ok(all.includes('d5fc/flip-card'));
  assert.ok(!all.includes('d5fc/flip-card-face'));
  const icon = await page.locator('.et-vb-icon--d5fc-module-flip-card path').first().evaluate((p) => { const b = p.getBBox(); const vb = p.ownerSVGElement.viewBox.baseVal; return b.x + b.width <= vb.width && b.y + b.height <= vb.height; });
  assert.ok(icon, 'icon fits its viewBox');

  // Inserting creates a Front and a Back face.
  await page.locator('button.et-vb-module-picker-option[value="d5fc/flip-card"]').click();
  await page.waitForTimeout(3000);
  assert.equal(await app.locator('.d5fc_flip_card > .d5fc_flip_card__inner > .d5fc_flip_card_face').count(), 2);
  const labels = await page.locator('.et-vb-draggable-list-item--title').allInnerTexts();
  assert.deepEqual(labels.slice(0, 2), ['Front', 'Back']);
  assert.deepEqual(errors, []);
  await page.close();
});

test('a card with two faces offers no way to add a third', async () => {
  resetPage('empty-containers');
  const { page, app } = await builder(context, 'empty-containers');
  const face = app.locator('.d5fc_flip_card_face').first();
  await face.hover({ force: true });
  await page.waitForTimeout(600);
  const addFace = face.locator(':scope > .et-vb-add-module-wrap > button');
  assert.equal(await addFace.count(), 1, 'Divi renders the button');
  assert.equal(await addFace.isVisible(), false, 'but it is hidden');

  await app.locator('.d5fc_flip_card').first().hover({ force: true });
  await page.waitForTimeout(500);
  await app.locator('.d5fc_flip_card > .et-vb-module-options button.et-vb-module-options-button').first().click();
  await page.waitForTimeout(1500);
  assert.deepEqual(await page.locator('.et-vb-draggable-list-item--title').allInnerTexts(), ['Front', 'Back']);
  assert.equal(await page.getByText('Add New Face', { exact: true }).count(), 0, 'no "Add New Face" in the settings');
  await page.close();
});

// Divi's add buttons ignore synthetic clicks in a headless browser (even Divi's own Group), so
// this dispatches the mousedown the button listens to.
test('an empty face shows "+" and the chosen module lands in that face', async () => {
  resetPage('empty-containers');
  const { page, app, errors } = await builder(context, 'empty-containers');
  const face = app.locator('.d5fc_flip_card_face').first();
  await face.hover({ force: true });
  await page.waitForTimeout(800);
  const plus = face.locator(':scope > .et-vb-add-child-module-wrap > button.et-vb-add-module');
  assert.equal(await plus.count(), 1);
  await plus.dispatchEvent('mousedown', { bubbles: true, button: 0 });
  await page.waitForTimeout(1500);
  const opts = await pickerOptions(page);
  assert.ok(opts.includes('divi/text') && !opts.includes('d5fc/flip-card-face'));
  await page.locator('button.et-vb-module-picker-option[value="divi/text"]').click();
  await page.waitForTimeout(2500);
  assert.equal(await app.evaluate(() => [...document.querySelectorAll('.d5fc_flip_card_face')].indexOf(document.querySelector('.d5fc_flip_card .et_pb_text')?.closest('.d5fc_flip_card_face'))), 0);
  assert.deepEqual(errors, []);
  await page.close();
});

test('the face settings have Elements > Add Element, which adds into the face', async () => {
  resetPage('empty-containers');
  const { page, app, errors } = await builder(context, 'empty-containers');
  await app.locator('.d5fc_flip_card').first().hover({ force: true });
  await page.waitForTimeout(500);
  await app.locator('.d5fc_flip_card > .et-vb-module-options button.et-vb-module-options-button').first().click();
  await page.waitForTimeout(1500);
  const front = page.locator('.et-vb-draggable-list-item', { hasText: 'Front' }).first();
  await front.hover();
  await front.locator('button').first().click();
  await page.waitForTimeout(1500);
  const add = page.getByText('Add Element', { exact: true }).first();
  const bb = await add.boundingBox();
  await page.mouse.click(bb.x + 10, bb.y + bb.height / 2);
  await page.waitForTimeout(1500);
  assert.ok((await pickerOptions(page)).includes('divi/text'));
  await page.locator('button.et-vb-module-picker-option[value="divi/text"]').click();
  await page.waitForTimeout(2500);
  assert.equal(await app.evaluate(() => [...document.querySelectorAll('.d5fc_flip_card_face')].indexOf(document.querySelector('.d5fc_flip_card .et_pb_text')?.closest('.d5fc_flip_card_face'))), 0);
  assert.deepEqual(errors, []);
  await page.close();
});

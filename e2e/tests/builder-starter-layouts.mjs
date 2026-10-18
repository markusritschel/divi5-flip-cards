// Ready-made cards in the Divi Library: created once (every on-disk state), insertable in the builder.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { start, builder, resetPage, wp, BASE } from '../lib.mjs';

let browser, context;
const META = '_d5fc_starter_layout';
const ids = (status = 'any') => wp('post', 'list', '--post_type=et_pb_layout', `--post_status=${status}`, `--meta_key=${META}`, '--field=ID').split(/\s+/).filter(Boolean);
// `wp option delete` fails when the option does not exist; that is fine here.
const deleteOption = () => { try { wp('option', 'delete', 'd5fc_starter_layouts'); } catch { /* not set */ } };
const visitAdmin = async () => { const p = await context.newPage(); await p.goto(`${BASE}/wp-admin/post-new.php?post_type=page`); await p.close(); };

before(async () => {
  // Start from nothing: no starter items, no option.
  const existing = ids();
  if (existing.length) wp('post', 'delete', ...existing, '--force');
  deleteOption();
  ({ browser, context } = await start());
});
after(() => browser?.close());

test('created once on the first visit to a screen where Divi loads its library; no duplicates on later visits', async () => {
  await visitAdmin();
  assert.equal(ids('publish').length, 4);
  await visitAdmin();
  assert.equal(ids().length, 4, 'second visit adds nothing');
});

test('a lost option does not duplicate the items', async () => {
  deleteOption();
  await visitAdmin();
  assert.equal(ids().length, 4);
});

test('a design the user deleted is not brought back', async () => {
  const [first] = ids('publish');
  wp('post', 'delete', first, '--force');
  await visitAdmin();
  assert.equal(ids().length, 3);
});

test('library items have Divi\'s module-item format', async () => {
  const [id] = ids('publish');
  assert.equal(wp('post', 'meta', 'get', id, '_et_pb_use_divi_5'), 'on');
  assert.match(wp('post', 'term', 'list', id, 'layout_type', '--field=slug'), /^module$/);
  assert.match(wp('post', 'get', id, '--field=post_content'), /^<!-- wp:divi\/placeholder -->\s*<!-- wp:d5fc\/flip-card /);
});

test('"Add From Library" lists the cards, and inserting one adds a complete card', async () => {
  // Bring all four back for this test.
  const existing = ids();
  if (existing.length) wp('post', 'delete', ...existing, '--force');
  deleteOption();
  await visitAdmin();

  resetPage('empty');
  const { page, app, errors } = await builder(context, 'empty', '.et_pb_column');
  await app.locator('button.et-vb-add-module').first().click({ force: true });
  await page.waitForTimeout(1500);
  await page.getByText('Add From Library', { exact: true }).first().click();
  await page.waitForTimeout(4000);
  const listed = await page.getByText(/^Flip Card – /).allInnerTexts();
  // Divi title-cases library titles with CSS, so compare without case.
  assert.deepEqual([...new Set(listed.map((t) => t.trim().toLowerCase()))].sort(), ['flip card – bold statement', 'flip card – call to action', 'flip card – feature list', 'flip card – icon + text']);

  await page.getByText('Flip Card – Icon + Text', { exact: true }).first().click();
  await page.waitForTimeout(2000);
  // Some library modals need an explicit "Use This Layout"/"Insert" confirmation.
  const confirm = page.getByRole('button', { name: /Use This|Insert|Import/i }).first();
  if (await confirm.count() && await confirm.isVisible()) {
    await confirm.click();
    await page.waitForTimeout(3000);
  }
  const card = await app.evaluate(() => { const c = document.querySelector('.d5fc_flip_card'); return c && { faces: c.querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face').length, blurb: !!c.querySelector('.et_pb_blurb'), hint: !!c.querySelector(':scope > .d5fc_flip_card__hint') }; });
  assert.deepEqual(card, { faces: 2, blurb: true, hint: true });
  assert.deepEqual(errors, []);
  await page.close();
});

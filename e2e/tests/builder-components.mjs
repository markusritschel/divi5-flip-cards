// Builder: a Flip Card saved as a Component is listed and offered under "Convert to Component".
// Divi matches a library item's stored module type (the module name, `d5fc/flip-card`) to a module
// through `d4Shortcode` for every module outside `divi/`; an empty one matches nothing.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { start, builder, wp } from '../lib.mjs';

let browser, context;
before(async () => ({ browser, context } = await start()));
after(() => browser?.close());

test('Divi resolves a saved Flip Card to the Flip Card module (builder)', async () => {
  const { page, app, errors } = await builder(context, 'flip-edit');
  const resolved = await app.evaluate(() => {
    const utils = window.divi?.moduleUtils;
    return ['d5fc/flip-card', 'd5fc/flip-card-face'].map((name) => utils?.resolveLibraryModuleName?.(name) ?? null);
  });
  assert.deepEqual(resolved, ['d5fc/flip-card', 'd5fc/flip-card-face']);
  assert.deepEqual(errors, []);
  await page.close();
});

test('Divi resolves a saved Flip Card to the Flip Card module (server, Component order)', () => {
  const php = [
    "do_action( 'init' );",
    "$m = new ReflectionMethod( 'ET\\\\Builder\\\\VisualBuilder\\\\REST\\\\DiviLibrary\\\\DiviLibraryController', '_resolve_component_module_name' );",
    '$m->setAccessible( true );',
    "echo $m->invoke( null, 'd5fc/flip-card' );",
  ].join(' ');
  assert.equal(wp('eval', php), 'd5fc/flip-card');
});

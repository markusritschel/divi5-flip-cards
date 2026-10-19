// Shared helpers for the browser tests against the local WordPress + Divi from e2e/setup.sh.
// CHROMIUM_PATH=/usr/bin/chromium uses a system browser instead of Playwright's own.
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const DIR = fileURLToPath(new URL('.', import.meta.url));
export const BASE = `http://localhost:${process.env.E2E_PORT || 8087}`;
const env = { ...process.env, DIVI_THEME_DIR: process.env.DIVI_THEME_DIR || `${process.env.XDG_CACHE_HOME || `${homedir()}/.cache`}/d5fc-e2e/Divi` };

const compose = (...args) => execFileSync('docker', ['compose', ...args], { cwd: DIR, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/** wp-cli in the test site. */
export const wp = (...args) => compose('run', '--rm', '-T', 'cli', 'wp', ...args);

/** Shell command in the WordPress container (from the WordPress root). */
export const inWp = (command) => compose('exec', '-T', 'wp', 'sh', '-c', command);

/** Puts a fixture page back to e2e/fixtures/<slug>.html and clears Divi's CSS cache. */
export function resetPage(slug) {
  const id = wp('post', 'list', '--post_type=page', `--name=${slug}`, '--field=ID');
  wp('post', 'update', id, `/fixtures/${slug}.html`);
  inWp('rm -rf wp-content/et-cache');
}

/** Contents of wp-content/debug.log ('' when there is none). */
export const debugLog = () => inWp('cat wp-content/debug.log 2>/dev/null || true');

// BROWSER=firefox|webkit runs the tests in Playwright's Firefox or WebKit (Safari's engine);
// install them once with `pnpm exec playwright install firefox webkit`.
const engines = { chromium, firefox, webkit };

export const launch = () => {
  const name = process.env.BROWSER || 'chromium';
  const options = 'chromium' === name && process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  return engines[name].launch(options);
};

/** A browser with a logged-in admin context. */
export async function start(contextOptions = {}) {
  const browser = await launch();
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, ...contextOptions });
  const page = await context.newPage();
  await page.goto(`${BASE}/wp-login.php`);
  await page.fill('#user_login', 'admin');
  await page.fill('#user_pass', 'admin');
  await page.click('#wp-submit');
  await page.waitForURL(/wp-admin/);
  await page.close();
  return { browser, context };
}

/** Live page; collects page errors. */
export async function frontend(context, slug, viewport = { width: 1280, height: 1600 }) {
  const page = await context.newPage();
  await page.setViewportSize(viewport);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/${slug}/`, { waitUntil: 'networkidle' });
  return { page, errors };
}

/** Visual Builder for a page; returns the top page, the app frame and collected errors. */
export async function builder(context, slug, waitFor = '.d5fc_flip_card') {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`top: ${e}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  await page.goto(`${BASE}/${slug}/?et_fb=1&PageSpeed=off`, { waitUntil: 'domcontentloaded' });
  const app = await (await page.waitForSelector('iframe#et-vb-app-frame', { timeout: 120000 })).contentFrame();
  await app.waitForSelector(waitFor, { timeout: 120000 });
  await page.waitForTimeout(3000);
  return { page, app, errors };
}

/** Opens the first card's settings and its "Flip" group. */
export async function openFlipSettings(page, app) {
  await app.locator('.d5fc_flip_card').first().hover({ force: true });
  await page.waitForTimeout(500);
  await app.locator('.d5fc_flip_card > .et-vb-module-options button.et-vb-module-options-button').first().click();
  await page.waitForTimeout(1500);
  await page.getByText('Flip', { exact: true }).first().click();
  await page.waitForTimeout(800);
}

/** Visibility of a card's faces (`i`-th card in the document). */
export const faceVisibility = (frame, i = 0) => frame.evaluate((i) => [...document.querySelectorAll('.d5fc_flip_card')[i]
  .querySelectorAll(':scope > .d5fc_flip_card__inner > .d5fc_flip_card_face')].map((f) => getComputedStyle(f).visibility), i);

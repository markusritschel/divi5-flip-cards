// README images: a GIF of the four ready-made cards flipping, and the module's settings in the Builder sidebar.
// Needs the test site from setup.sh and ffmpeg. Run: cd e2e && node capture.mjs
// Writes docs/screenshots/; resets the fixture pages it uses.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, launch, start, builder, resetPage, openFlipSettings } from './lib.mjs';

const OUT = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const browser = await launch();
try {
  await heroGif();
} finally {
  await browser.close();
}
await sidebarShots();

/**
 * The starters fixture (the four Divi Library cards, 2×2 at 1280 px): each card's own trigger in turn, then the
 * click and button cards turned back, so the GIF loops without a jump. Cropped to the cards.
 */
async function heroGif() {
  resetPage('starters');
  const size = { width: 1280, height: 900 };
  const dir = mkdtempSync(join(tmpdir(), 'd5fc-capture-'));
  const context = await browser.newContext({ viewport: size, recordVideo: { dir, size } });
  const page = await context.newPage();
  const t0 = Date.now();
  await page.goto(`${BASE}/starters/`, { waitUntil: 'networkidle' });
  await page.mouse.move(640, 880);
  await page.waitForTimeout(800);
  const from = (Date.now() - t0) / 1000;
  const card = (i) => page.locator('.d5fc_flip_card').nth(i);
  const hold = () => page.waitForTimeout(1500); // Deliberate: the 600 ms flip plus time to read the back.
  await card(0).hover(); // Hover: 3D flip.
  await hold();
  await card(1).hover(); // Hover: slide; the first card turns back.
  await hold();
  await card(2).click(); // Click anywhere on the card.
  await hold();
  await card(3).locator(':scope > .d5fc_flip_card__toggle').click(); // The "More" flip button.
  await hold();
  await card(2).click();
  await card(3).locator(':scope > .d5fc_flip_card__toggle').click();
  await page.mouse.move(640, 880);
  await page.waitForTimeout(1200);
  const length = (Date.now() - t0) / 1000 - from;
  const box = await page.locator('.d5fc_flip_card').evaluateAll((cs) => {
    const rs = cs.map((c) => c.getBoundingClientRect());
    const x = Math.min(...rs.map((r) => r.left)), y = Math.min(...rs.map((r) => r.top));
    return { x, y, width: Math.max(...rs.map((r) => r.right)) - x, height: Math.max(...rs.map((r) => r.bottom)) - y };
  });
  await context.close(); // Writes the video.
  const video = join(dir, readdirSync(dir).find((f) => f.endsWith('.webm')));
  const m = 20; // Margin around the cards.
  const crop = `crop=${Math.round(box.width + 2 * m)}:${Math.round(box.height + 2 * m)}:${Math.round(box.x - m)}:${Math.round(box.y - m)}`;
  gif(video, from, length, crop, 720, join(OUT, 'flip-cards.gif'));
  rmSync(dir, { recursive: true, force: true });
}

/** Content > Flip and Design > Flip Button, cropped from the sidebar. */
async function sidebarShots() {
  resetPage('flip-edit');
  const { browser: admin, context } = await start({ viewport: { width: 1600, height: 1800 }, deviceScaleFactor: 2 });
  try {
    const { page, app } = await builder(context, 'flip-edit');
    await openFlipSettings(page, app);
    await sidebarGroup(page, 'Flip', 'builder-flip.png');
    await page.getByText('Design', { exact: true }).first().click();
    await page.waitForTimeout(800);
    await sidebarGroup(page, 'Flip Button', 'builder-flip-button.png');
  } finally {
    await admin.close();
  }
}

/** Opens the sidebar group titled `title` and saves the sidebar down to that group's end. */
async function sidebarGroup(page, title, file) {
  const header = page.locator('.et-vb-modal-group-title', { hasText: new RegExp(`^\\s*${title}\\s*$`) }).first();
  const group = header.locator('xpath=..');
  if (!(await group.evaluate((g) => g.classList.contains('et-vb-modal-group--opened')))) await header.click();
  await page.waitForTimeout(800);
  const sidebar = await page.locator('.et-vb-sidebar--right').boundingBox();
  const box = await group.boundingBox();
  await page.screenshot({ path: join(OUT, file), clip: { x: sidebar.x, y: sidebar.y, width: sidebar.width, height: box.y + box.height + 12 - sidebar.y } });
}

/** `length` seconds of `video` from `from`, cropped, `width` px wide, as a looping GIF with its own palette. */
function gif(video, from, length, crop, width, out) {
  const filter = `${crop},fps=20,scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(from), '-t', String(length), '-i', video, '-vf', filter, '-loop', '0', out]);
}

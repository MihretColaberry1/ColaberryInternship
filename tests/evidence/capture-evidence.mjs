// Captures the STORY-000 evidence from the running console: screenshots at phone, tablet and desktop
// widths in light and dark themes, the state matrix, axe results and a scripted keyboard walkthrough.
// Writes only under docs/evidence/. Never contacts the platform: it reads this repository through a
// local static server.
//
// Tools are NOT repository dependencies. Install them in a folder outside the repo and point TOOLS at it:
//   npm install --prefix <tools-dir> playwright-core@1.48.2 axe-core@4.10.2
//   python -m http.server 8765 --bind 127.0.0.1        (from the repository root, in another terminal)
//   TOOLS=<tools-dir> node tests/evidence/capture-evidence.mjs
// Optional: BASE_URL (default http://127.0.0.1:8765/), CHROME (path to an installed Chrome).
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

if (!process.env.TOOLS) throw new Error('Set TOOLS to the folder holding playwright-core and axe-core (see the header).');
const require = createRequire(path.join(process.env.TOOLS, 'package.json'));
const { chromium } = require('playwright-core');
const AXE_PATH = require.resolve('axe-core/axe.min.js');
const AXE_VERSION = require('axe-core/package.json').version;
const PW_VERSION = require('playwright-core/package.json').version;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'docs/evidence');
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8765/';
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const WIDTHS = [['phone', 390, 844], ['tablet', 820, 1180], ['desktop', 1440, 900]];
const THEMES = ['light', 'dark'];
const CAPABILITY = 'product_experience.design_token_drift_audit';

const settled = (page) => page.waitForFunction(() => document.querySelectorAll('.panel').length === 6
  && !document.querySelector('.panel[data-state="loading"]'), null, { timeout: 15000 });

async function open(browser, { width, height, theme }, route = '') {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${m.text()} ${m.location().url ?? ''}`.trim()); });
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  return { context, page, errors };
}

async function axe(page, label) {
  await page.addScriptTag({ path: AXE_PATH });
  const r = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }));
  return { label, url: page.url(), violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length,
    targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')) })), passes: r.passes.length, incomplete: r.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })) };
}

async function screenshots(browser, log) {
  const shots = [];
  for (const theme of THEMES) {
    for (const [name, width, height] of WIDTHS) {
      const { context, page, errors } = await open(browser, { width, height, theme });
      await settled(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const file = `screenshots/console-${name}-${theme}.png`;
      await page.screenshot({ path: path.join(OUT, file), fullPage: true });
      shots.push({ file, width, theme, horizontal_overflow_px: overflow, console_errors: errors });
      if (name === 'desktop') {
        await page.$$eval('details.disclosure', (ds) => ds.forEach((d) => { d.open = true; }));
        const expanded = `screenshots/console-desktop-${theme}-expanded.png`;
        await page.screenshot({ path: path.join(OUT, expanded), fullPage: true });
        shots.push({ file: expanded, width, theme, note: 'every disclosure opened' });
      }
      await context.close();
      log(`${file} overflow=${overflow}`);
    }
    for (const [name, width, height] of [WIDTHS[0], WIDTHS[2]]) {
      const { context, page } = await open(browser, { width, height, theme }, `#/capability/${CAPABILITY}`);
      await page.waitForSelector('.hypothetical');
      const file = `screenshots/capability-detail-${name}-${theme}.png`;
      await page.screenshot({ path: path.join(OUT, file), fullPage: true });
      shots.push({ file, width, theme, horizontal_overflow_px: await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth) });
      await context.close();
    }
  }
  return shots;
}

async function stateMatrix(browser) {
  const { context, page } = await open(browser, { width: 1440, height: 900, theme: 'light' }, 'docs/evidence/state-matrix.html');
  await page.waitForSelector('body[data-ready="true"]', { timeout: 15000 });
  const matrix = await page.evaluate(() => window.__stateMatrix);
  await (await page.$('#matrix')).screenshot({ path: path.join(OUT, 'screenshots/state-matrix-table.png') });
  for (const id of Object.keys(matrix)) {
    await (await page.$(`#scenario-${id}`)).screenshot({ path: path.join(OUT, `screenshots/state-${id}.png`) });
  }
  const a11y = await axe(page, 'state matrix page (fixtures), desktop light');
  await context.close();
  return { matrix, a11y };
}

async function accessibility(browser) {
  const runs = [];
  for (const theme of THEMES) {
    for (const [name, width, height] of [WIDTHS[0], WIDTHS[2]]) {
      const { context, page } = await open(browser, { width, height, theme });
      await settled(page);
      runs.push(await axe(page, `console, ${name}, ${theme}, disclosures closed`));
      await page.$$eval('details.disclosure', (ds) => ds.forEach((d) => { d.open = true; }));
      runs.push(await axe(page, `console, ${name}, ${theme}, every disclosure open`));
      await context.close();
    }
  }
  for (const route of [`#/capability/${CAPABILITY}`, '#/rung/autonomy:R1', '#/guide/capture', '#/story/STORY-000']) {
    const { context, page } = await open(browser, { width: 1440, height: 900, theme: 'light' }, route);
    await page.waitForSelector('.back');
    runs.push(await axe(page, `detail ${route}, desktop light`));
    await context.close();
  }
  return runs;
}

/** Tab through the console from the top and record where focus lands and whether it is visible. */
async function keyboard(browser) {
  const { context, page } = await open(browser, { width: 1440, height: 900, theme: 'light' });
  await settled(page);
  const describe = () => page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    const panel = el.closest('.panel')?.dataset.panel ?? null;
    return { tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70), panel,
      outline_px: parseFloat(cs.outlineWidth) || 0, outline_style: cs.outlineStyle };
  });
  const stops = [];
  for (let i = 0; i < 70; i += 1) {
    await page.keyboard.press('Tab');
    stops.push({ n: i + 1, ...(await describe()) });
  }
  const checks = [];
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await settled(page);
  await page.keyboard.press('Tab');
  checks.push({ step: 'First Tab lands on the skip link', pass: (await describe()).text === 'Skip to content' });
  await page.keyboard.press('Enter');
  checks.push({ step: 'Enter on the skip link moves focus to main', pass: await page.evaluate(() => document.activeElement.id === 'main') });
  const summary = page.locator('#panel-inventory summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  checks.push({ step: 'Enter on a disclosure summary opens it', pass: await page.evaluate(() => document.querySelector('#panel-inventory details').open) });
  await page.keyboard.press('Space');
  checks.push({ step: 'Space on the same summary closes it', pass: await page.evaluate(() => !document.querySelector('#panel-inventory details').open) });
  await page.locator('#panel-ladder .btn-primary').focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('.hypothetical');
  checks.push({ step: 'Enter on the ladder panel action opens a capability detail page', pass: page.url().includes('#/capability/') });
  await page.locator('a.back').focus();
  await page.keyboard.press('Enter');
  await settled(page);
  checks.push({ step: 'Enter on "Back to the console" returns to the ladder panel and focuses its heading',
    pass: await page.evaluate(() => document.activeElement.id === 'panel-ladder-title') });
  const themeButton = page.getByRole('button', { name: 'Dark' });
  await themeButton.focus();
  await page.keyboard.press('Enter');
  checks.push({ step: 'Enter on the "Dark" theme button switches the theme and marks it pressed',
    pass: await page.evaluate(() => document.documentElement.dataset.theme === 'dark'
      && document.querySelector('.mode-btn[aria-pressed="true"]').textContent === 'Dark') });
  await context.close();
  return { stops, checks, invisible_focus: stops.filter((s) => s.tag !== 'body' && (s.outline_px < 2 || s.outline_style === 'none')) };
}

const lines = [];
const log = (m) => { lines.push(m); console.log(m); };
await mkdir(path.join(OUT, 'screenshots'), { recursive: true });
await mkdir(path.join(OUT, 'a11y'), { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
try {
  const shots = await screenshots(browser, log);
  const { matrix, a11y: matrixAxe } = await stateMatrix(browser);
  const axeRuns = [...(await accessibility(browser)), matrixAxe];
  const kb = await keyboard(browser);
  const meta = { captured_at: new Date().toISOString(), base_url: BASE, tools: { 'playwright-core': PW_VERSION, 'axe-core': AXE_VERSION }, chrome: CHROME };
  await writeFile(path.join(OUT, 'screenshots/index.json'), `${JSON.stringify({ ...meta, shots }, null, 2)}\n`);
  await writeFile(path.join(OUT, 'state-matrix.json'), `${JSON.stringify({ ...meta, matrix }, null, 2)}\n`);
  await writeFile(path.join(OUT, 'a11y/axe-results.json'), `${JSON.stringify({ ...meta, runs: axeRuns }, null, 2)}\n`);
  await writeFile(path.join(OUT, 'a11y/keyboard-walkthrough.json'), `${JSON.stringify({ ...meta, ...kb }, null, 2)}\n`);
  log(`axe: ${axeRuns.map((r) => `${r.label}: ${r.violations.length} violations`).join(' | ')}`);
  log(`keyboard: ${kb.checks.filter((c) => c.pass).length} of ${kb.checks.length} checks pass; ${kb.invisible_focus.length} stops without a visible outline`);
} finally {
  await browser.close();
}

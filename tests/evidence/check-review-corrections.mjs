// Browser checks for Aleem's three required corrections to PR #1 (review of 2026-11-08):
//   - layout: opening any panel disclosure must not move or resize any other panel, and its content
//     stays inside its own panel, at narrow and wide widths;
//   - contrast: axe's colour-contrast rule on the console, every disclosure closed and open;
//   - the filled button's real computed colours, and their contrast ratio;
//   - the panel order as rendered.
// Writes docs/evidence/review-corrections-check.json. Never contacts the platform: it reads this
// repository through a local static server.
//
// Tools are NOT repository dependencies (same as capture-evidence.mjs):
//   npm install --prefix <tools-dir> playwright-core@1.48.2 axe-core@4.10.2
//   python -m http.server 8765 --bind 127.0.0.1        (from the repository root, in another terminal)
//   TOOLS=<tools-dir> node tests/evidence/check-review-corrections.mjs
// Optional: BASE_URL (default http://127.0.0.1:8765/), CHROME (path to an installed Chrome), OUT_FILE.
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

if (!process.env.TOOLS) throw new Error('Set TOOLS to the folder holding playwright-core and axe-core (see the header).');
const require = createRequire(path.join(process.env.TOOLS, 'package.json'));
const { chromium } = require('playwright-core');
const AXE_PATH = require.resolve('axe-core/axe.min.js');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_FILE = process.env.OUT_FILE ?? path.join(ROOT, 'docs/evidence/review-corrections-check.json');
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8765/';
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const WIDTHS = [['narrow', 320, 800], ['phone', 390, 844], ['tablet', 820, 1180], ['desktop', 1440, 900]];
const TOLERANCE = 0.5; // px: sub-pixel rounding only

const settled = (page) => page.waitForFunction(() => document.querySelectorAll('.panel').length === 6
  && !document.querySelector('.panel[data-state="loading"]'), null, { timeout: 15000 });

/** Every panel's box, keyed by its data-panel id. */
const panelBoxes = (page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.panel')]
  .map((p) => { const r = p.getBoundingClientRect(); return [p.dataset.panel, { left: r.left, top: r.top + window.scrollY, width: r.width, height: r.height }]; })));

const near = (a, b) => Math.abs(a - b) <= TOLERANCE;

/**
 * Opens one disclosure and compares every panel before and after. A panel in an earlier or the same
 * grid row must not move at all; a panel in a later row may only move straight down, by the height
 * the opened content added. No panel may change column or width, the opened one included.
 */
async function checkDisclosure(page, panelId, index) {
  const summary = page.locator(`.panel[data-panel="${panelId}"] > .panel-details > details.disclosure > summary`).nth(index);
  const title = (await summary.textContent()).trim();
  const before = await panelBoxes(page);
  await summary.click();
  const after = await panelBoxes(page);
  const inside = await page.evaluate(({ panelId, index }) => {
    const panel = document.querySelector(`.panel[data-panel="${panelId}"]`);
    const det = panel.querySelectorAll(':scope > .panel-details > details.disclosure')[index];
    const body = det.querySelector('.disclosure-body');
    const p = panel.getBoundingClientRect();
    const b = body.getBoundingClientRect();
    // Readable, not just in place: no word in a table cell may be split across lines, which is what a
    // table squeezed to fit a narrow panel looks like (headers one letter per line). Measured on the
    // rendered text: each segment between spaces, or ending at a hyphen (a normal break point), must
    // sit on one line.
    const broken = [];
    for (const cell of body.querySelectorAll('th, td')) {
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      let found = false;
      for (let t = walker.nextNode(); t && !found; t = walker.nextNode()) {
        for (const m of t.textContent.matchAll(/[^\s-]+-?/g)) {
          const range = document.createRange();
          range.setStart(t, m.index);
          range.setEnd(t, m.index + m[0].length);
          const lines = new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top)));
          if (lines.size > 1) { broken.push(m[0].slice(0, 40)); found = true; break; }
        }
      }
    }
    return { open: det.open, body_within_panel: b.left >= p.left - 0.5 && b.right <= p.right + 0.5,
      body_overflow_px: Math.max(0, body.scrollWidth - body.clientWidth),
      page_overflow_px: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      cells_with_broken_words: broken.length, broken_sample: broken.slice(0, 3) };
  }, { panelId, index });
  const opened = before[panelId];
  const problems = [];
  for (const [id, b] of Object.entries(before)) {
    const a = after[id];
    if (!near(a.left, b.left) || !near(a.width, b.width)) problems.push(`${id}: column or width changed (left ${b.left}->${a.left}, width ${b.width}->${a.width})`);
    const laterRow = b.top > opened.top + TOLERANCE;
    if (id !== panelId && !laterRow && !near(a.top, b.top)) problems.push(`${id}: moved although it is in an earlier or the same row (top ${b.top}->${a.top})`);
  }
  if (!inside.open) problems.push('the disclosure did not open');
  if (!inside.body_within_panel) problems.push('the opened content extends outside its panel');
  if (inside.body_overflow_px > 0) problems.push(`the opened content overflows its panel by ${inside.body_overflow_px}px`);
  if (inside.page_overflow_px > 0) problems.push(`the page scrolls sideways by ${inside.page_overflow_px}px`);
  if (inside.cells_with_broken_words > 0) problems.push(`${inside.cells_with_broken_words} table cells break a word to fit, e.g. ${JSON.stringify(inside.broken_sample)}`);
  const shifted = Object.entries(before).filter(([id, b]) => id !== panelId && !near(after[id].top, b.top)).map(([id]) => id);
  await summary.click(); // close again, so each disclosure is checked from the same starting layout
  const restored = await panelBoxes(page);
  const reverted = Object.entries(before).every(([id, b]) => near(restored[id].left, b.left) && near(restored[id].top, b.top) && near(restored[id].width, b.width));
  if (!reverted) problems.push('closing it did not restore the original layout');
  return { panel: panelId, disclosure: title, pass: problems.length === 0, problems, moved_down_only: shifted };
}

async function layout(browser) {
  const results = [];
  for (const [name, width, height] of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await settled(page);
    const counts = await page.evaluate(() => [...document.querySelectorAll('.panel')]
      .map((p) => [p.dataset.panel, p.querySelectorAll(':scope > .panel-details > details.disclosure').length]));
    const checks = [];
    for (const [panelId, n] of counts) for (let i = 0; i < n; i += 1) checks.push(await checkDisclosure(page, panelId, i));
    const columns = await page.evaluate(() => getComputedStyle(document.querySelector('.console')).gridTemplateColumns.split(' ').length);
    results.push({ width_name: name, width, grid_columns: columns, disclosures_checked: checks.length,
      failed: checks.filter((c) => !c.pass).length, checks });
    await context.close();
  }
  return results;
}

/**
 * Reflow (WCAG 1.4.10): at 320 CSS px no page may scroll sideways. Every page a visitor can reach is
 * checked, not only the console: the capture guide scrolled 76 px on 2026-11-09 because of a file path
 * with no break point, and the console-only checks did not see it.
 */
export const REFLOW_ROUTES = ['', '#/capability/product_experience.design_token_drift_audit', '#/rung/autonomy:R1',
  '#/rung/autonomy:R8', '#/story/STORY-000', '#/guide/capture', '#/guide/requests', '#/guide/refresh'];

async function reflow(browser) {
  const results = [];
  for (const route of REFLOW_ROUTES) {
    const context = await browser.newContext({ viewport: { width: 320, height: 800 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    if (route === '') await settled(page); else await page.waitForSelector('.back');
    const r = await page.evaluate(() => {
      // Text that runs past the right edge, found on the rendered text itself.
      const far = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let t = w.nextNode(); t; t = w.nextNode()) {
        const rg = document.createRange();
        rg.selectNodeContents(t);
        if ([...rg.getClientRects()].some((rc) => rc.right > innerWidth + 1)) far.push(t.textContent.trim().slice(0, 60));
      }
      const sideways = Math.max(0, document.documentElement.scrollWidth - innerWidth);
      // Only when the page itself scrolls: text inside a table's own scrolling frame is clipped there.
      return { sideways_px: sideways, text_past_edge: sideways > 0 ? far.slice(0, 3) : [] };
    });
    results.push({ route: route || '/', ...r, pass: r.sideways_px === 0 });
    await context.close();
  }
  return results;
}

async function contrastAndButton(browser) {
  const out = { axe_color_contrast: [], button: null, order: null };
  for (const [name, width, height] of [WIDTHS[1], WIDTHS[3]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await settled(page);
    await page.addScriptTag({ path: AXE_PATH });
    for (const state of ['closed', 'open']) {
      if (state === 'open') await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));
      const r = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'rule', values: ['color-contrast'] } }));
      out.axe_color_contrast.push({ run: `console, ${name}, disclosures ${state}`, violations: r.violations.flatMap((v) => v.nodes.map((n) => ({ target: n.target.join(' '), summary: n.failureSummary }))),
        nodes_passed: r.passes.reduce((n, p) => n + p.nodes.length, 0) });
    }
    if (name === 'desktop') {
      out.order = await page.evaluate(() => [...document.querySelectorAll('.panel')].map((p) => `${p.querySelector('.panel-order').textContent} ${p.dataset.panel}`));
      out.button = await page.evaluate(() => {
        const b = document.querySelector('.btn-primary');
        if (!b) return null;
        const s = getComputedStyle(b);
        return { text: b.textContent.trim(), color: s.color, background: s.backgroundColor, font_size: s.fontSize, font_weight: s.fontWeight };
      });
      if (out.button) out.button.contrast_ratio = ratio(out.button.color, out.button.background);
    }
    await context.close();
  }
  return out;
}

function ratio(fg, bg) {
  const lum = (css) => {
    const [r, g, b] = css.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
      const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  const result = { checked_against: BASE, widths: WIDTHS.map(([n, w]) => `${n} ${w}px`), layout: await layout(browser),
    reflow_320: await reflow(browser), ...(await contrastAndButton(browser)) };
  result.summary = {
    disclosures_checked: result.layout.reduce((n, l) => n + l.disclosures_checked, 0),
    layout_failures: result.layout.reduce((n, l) => n + l.failed, 0),
    reflow_pages_checked: result.reflow_320.length,
    reflow_failures: result.reflow_320.filter((r) => !r.pass).map((r) => `${r.route}: ${r.sideways_px}px`),
    contrast_violations: result.axe_color_contrast.reduce((n, r) => n + r.violations.length, 0),
    button_contrast: result.button?.contrast_ratio ?? null,
  };
  await writeFile(OUT_FILE, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ order: result.order, button: result.button, summary: result.summary }, null, 2));
} finally {
  await browser.close();
}

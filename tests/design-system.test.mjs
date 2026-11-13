// Aleem's review of PR #1 (2026-11-08), required changes 1 and 3, checked without a browser:
//   1. the page is built on the real Colaberry design-system tokens, pinned, with AA contrast;
//   3. no style rule moves or resizes a panel because a disclosure opened.
// Change 2 (panel order) is tested in console.test.mjs. The browser layout and axe checks are
// tests/evidence/check-review-corrections.mjs.
// Run from the repository root: node --test tests/design-system.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFile(path.join(ROOT, f), 'utf8');
const TOKENS = ['colors', 'typography', 'spacing'].map((n) => `command-center/vendor/colaberry-ds/tokens/${n}.css`);

// ---- Provenance: the vendored files are the upstream files, byte for byte ----

test('every vendored design-system file matches the git blob recorded in SOURCES.json, at a pinned commit', async () => {
  const { design_system: ds } = JSON.parse(await read('command-center/sources/SOURCES.json'));
  assert.equal(ds.repo, 'https://github.com/aleemcolaberry/Colaberry-DS-School-Final');
  assert.match(ds.commit, /^[0-9a-f]{40}$/);
  for (const f of TOKENS) assert.ok(ds.files.some((x) => x.file === f), `${f} is not recorded`);
  for (const rec of ds.files) {
    // git may check a file out with CRLF on Windows; the upstream blob is LF.
    const bytes = Buffer.from((await read(rec.file)).replace(/\r\n/g, '\n'), 'utf8');
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    assert.equal(blob, rec.git_blob, `${rec.file} no longer matches ${rec.upstream_path}@${ds.commit}`);
  }
});

test('the page and the state-matrix evidence page load the three token files, in order, before styles.css', async () => {
  for (const [file, prefix] of [['index.html', ''], ['docs/evidence/state-matrix.html', '../../']]) {
    const html = await read(file);
    const at = (href) => html.indexOf(`href="${prefix}${href}"`);
    const positions = [...TOKENS, 'command-center/styles.css'].map(at);
    positions.forEach((p, i) => assert.ok(p > 0, `${file} does not load ${[...TOKENS, 'styles.css'][i]}`));
    assert.deepEqual([...positions].sort((a, b) => a - b), positions, `${file} loads them out of order`);
    assert.match(html, /<meta name="color-scheme" content="light">/, file);
  }
});

// ---- No invented values ----

test('styles.css writes no colour of its own: no hex, rgb(), hsl() or system font stack', async () => {
  const css = (await read('command-center/styles.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(css, /\b(rgba?|hsla?|oklch)\(/);
  assert.doesNotMatch(css, /system-ui|Segoe UI|Consolas/);
  assert.match(css, /font-family: var\(--font-body\)/);
  assert.match(css, /code \{ font-family: var\(--font-mono\)/);
});

/** All custom properties declared in a stylesheet, from any rule. */
const declared = (css) => new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

test('every token styles.css uses is defined by the design system or by styles.css itself', async () => {
  const css = await read('command-center/styles.css');
  const defined = new Set([...declared(css)]);
  for (const f of TOKENS) for (const n of declared(await read(f))) defined.add(n);
  const used = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  const missing = [...used].filter((n) => !defined.has(n));
  assert.deepEqual(missing, []);
});

test('light theme only: no invented dark values, and the page never sets data-theme', async () => {
  const css = (await read('command-center/styles.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /prefers-color-scheme:\s*dark/);
  assert.doesNotMatch(css, /data-theme/);
  const app = await read('command-center/app.js');
  assert.doesNotMatch(app, /dataset\.theme\s*=/);
  assert.doesNotMatch(app, /themeSwitch|THEMES/);
});

// ---- Contrast, computed on the design system's own values ----

/** The light :root values: the first :root block of each token file, then styles.css's :root. */
async function lightTokens() {
  const map = new Map();
  const take = (css) => {
    const block = css.match(/:root\s*\{([\s\S]*?)\n\}/);
    for (const m of block[1].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim());
  };
  for (const f of TOKENS) take(await read(f));
  take(await read('command-center/styles.css'));
  return map;
}

function resolve(map, name, seen = []) {
  assert.ok(!seen.includes(name), `token cycle: ${[...seen, name].join(' -> ')}`);
  const v = map.get(name);
  assert.ok(v, `${name} is not defined`);
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve(map, ref[1], [...seen, name]) : v;
}

function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test('the filled button is white on --red-600 (#E5121D), 4.73:1, and its hover is darker still', async () => {
  const t = await lightTokens();
  assert.equal(resolve(t, '--action-fill').toUpperCase(), '#E5121D');
  assert.equal(resolve(t, '--on-accent').toUpperCase(), '#FFFFFF');
  assert.equal(contrast(resolve(t, '--on-accent'), resolve(t, '--action-fill')).toFixed(2), '4.73');
  assert.ok(contrast(resolve(t, '--on-accent'), resolve(t, '--action-fill-hover')) >= 4.5);
  const css = await read('command-center/styles.css');
  assert.match(css, /\.btn-primary \{[^}]*background: var\(--action-fill\)/);
  assert.match(css, /\.btn-primary:hover \{ background: var\(--action-fill-hover\)/);
});

test('every text colour meets WCAG AA (4.5:1) on every background it is used on', async () => {
  const t = await lightTokens();
  const pairs = [
    ['--text', '--bg'], ['--text', '--surface'], ['--text', '--surface-alt'], ['--heading', '--surface'],
    ['--muted', '--bg'], ['--muted', '--surface'], ['--muted', '--surface-alt'], ['--muted', '--track'], ['--muted', '--warn-soft'],
    ['--berry-blue', '--bg'], ['--berry-blue', '--surface'], ['--berry-blue', '--berry-blue-soft'],
    ['--berry-green', '--berry-green-soft'], ['--berry-green', '--surface'],
    ['--danger', '--danger-soft'], ['--danger', '--surface'],
    ['--warn-text', '--warn-soft'], ['--text', '--danger-soft'],
  ];
  const low = pairs.map(([fg, bg]) => [fg, bg, contrast(resolve(t, fg), resolve(t, bg))]).filter(([, , r]) => r < 4.5);
  assert.deepEqual(low.map(([fg, bg, r]) => `${fg} on ${bg}: ${r.toFixed(2)}`), []);
});

test('the focus outline is at least 3:1 against the surfaces it sits on', async () => {
  const t = await lightTokens();
  for (const bg of ['--bg', '--surface', '--surface-alt']) assert.ok(contrast(resolve(t, '--focus'), resolve(t, bg)) >= 3, bg);
});

test('the brand cherry and leaf never carry text: they fail AA with white or on white', async () => {
  const t = await lightTokens();
  // The reason --action-fill is --red-600 and --berry-green is --green-800, kept as a check.
  assert.ok(contrast('#FFFFFF', resolve(t, '--red-500')) < 4.5);
  assert.ok(contrast(resolve(t, '--green-600'), '#FFFFFF') < 4.5);
  const css = (await read('command-center/styles.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  for (const rule of css.split('}')) {
    if (/(^|[;{\s])color:\s*var\(--(cherry|brand-primary|brand-secondary|green-600|red-500)\)/.test(rule)) assert.fail(`brand colour used as text: ${rule.trim()}`);
  }
});

// ---- Required change 3: opening a disclosure never places a panel ----

test('no rule changes a panel\'s grid placement depending on an open disclosure, and no panel spans columns', async () => {
  const css = (await read('command-center/styles.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = css.split('}').map((r) => r.trim()).filter(Boolean);
  for (const r of rules) {
    const [selector, body = ''] = r.split('{');
    const places = /grid-(column|row|area)\s*:/.test(body);
    if (places && /\[open\]|:has\(/.test(selector)) assert.fail(`placement depends on state: ${r}`);
    if (/\.panel/.test(selector) && /grid-column\s*:\s*(span|1\s*\/\s*-1)/.test(body)) assert.fail(`a panel spans columns: ${r}`);
  }
});

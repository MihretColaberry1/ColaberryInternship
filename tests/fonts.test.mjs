// The self-hosted fonts (Mohammed Abdul Aleem's re-review of PR #1, 2026-11-13): "Self-host Roboto (400 and
// 700, Latin subset, woff2) and Roboto Mono (400) in your vendor folder, with their licence, declared with
// font-display: swap. No font CDN." Checks the files are the recorded ones, exactly those three faces are
// declared, nothing is loaded from another site, and the OFL 1.1 licences ship beside them.
// Run from the repository root: node --test tests/fonts.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = 'command-center/vendor/fonts';
const read = (f) => readFile(path.join(ROOT, f));
const text = async (f) => (await read(f)).toString('utf8');

// git may check a text file out with CRLF on Windows; the recorded hash is of the file as downloaded (LF).
async function sha256(file) {
  let bytes = await read(file);
  if (file.endsWith('.txt')) bytes = Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  return createHash('sha256').update(bytes).digest('hex');
}

test('every font file is the one recorded in SOURCES.json, by SHA-256, and the folder holds nothing else', async () => {
  const { fonts } = JSON.parse(await text('command-center/sources/SOURCES.json'));
  assert.match(fonts.license, /^SIL Open Font License 1\.1/);
  for (const rec of fonts.files) assert.equal(await sha256(rec.file), rec.sha256, rec.file);
  const recorded = new Set(fonts.files.map((r) => path.basename(r.file)));
  const extra = (await readdir(path.join(ROOT, DIR))).filter((f) => !recorded.has(f) && !['fonts.css', 'README.md'].includes(f));
  assert.deepEqual(extra, [], 'no unrecorded file in the fonts folder');
  for (const rec of fonts.files.filter((r) => r.file.endsWith('.woff2'))) {
    assert.equal((await read(rec.file)).subarray(0, 4).toString('latin1'), 'wOF2', `${rec.file} is a woff2 file`);
  }
});

test('fonts.css declares exactly Roboto 400 and 700 and Roboto Mono 400, normal, with font-display: swap', async () => {
  const css = await text(`${DIR}/fonts.css`);
  const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => m[1]);
  assert.equal(faces.length, 3);
  const prop = (face, name) => face.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();
  const declared = faces.map((f) => `${prop(f, 'font-family')} ${prop(f, 'font-weight')}`).sort();
  assert.deepEqual(declared, ["'Roboto Mono' 400", "'Roboto' 400", "'Roboto' 700"]);
  for (const f of faces) {
    assert.equal(prop(f, 'font-display'), 'swap');
    assert.equal(prop(f, 'font-style'), 'normal');
    assert.match(prop(f, 'unicode-range'), /^U\+0000-00FF,/, 'the Latin subset');
    const urls = [...f.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
    assert.equal(urls.length, 1);
    assert.match(urls[0], /^\.\/[a-z0-9-]+\.woff2$/, 'a woff2 file in this folder');
    await read(`${DIR}/${urls[0].slice(2)}`);
  }
});

test('no font CDN: nothing is loaded from another site, and fonts.css loads before the design-system tokens', async () => {
  const css = await text(`${DIR}/fonts.css`);
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ''), /https?:|\/\/|@import/);
  for (const [page, href] of [['index.html', 'command-center/vendor/fonts/fonts.css'], ['docs/evidence/state-matrix.html', '../../command-center/vendor/fonts/fonts.css']]) {
    const html = await text(page);
    const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
    assert.ok(links.includes(href), `${page} loads the self-hosted fonts`);
    assert.ok(links.indexOf(href) < links.findIndex((l) => l.includes('colaberry-ds/tokens/')), `${page}: fonts before tokens`);
    assert.deepEqual(links.filter((l) => /^(https?:)?\/\//.test(l)), [], `${page} loads no stylesheet from another site`);
    assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic|fontsource|jsdelivr|unpkg/, page);
  }
});

test('both OFL 1.1 licences ship beside the fonts, with their copyright lines', async () => {
  const roboto = await text(`${DIR}/LICENSE-Roboto.txt`);
  const mono = await text(`${DIR}/LICENSE-RobotoMono.txt`);
  for (const l of [roboto, mono]) {
    assert.match(l, /This Font Software is licensed under the SIL Open Font License, Version 1\.1\./);
    assert.match(l, /SIL OPEN FONT LICENSE Version 1\.1 - 26 February 2007/);
  }
  assert.match(roboto, /Copyright 2011 The Roboto Project Authors/);
  assert.match(mono, /Copyright 2015 The Roboto Mono Project Authors/);
  assert.match(await text(`${DIR}/README.md`), /SIL Open Font License, Version 1\.1/);
});

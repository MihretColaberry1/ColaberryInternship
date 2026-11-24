// The state-matrix evidence page (docs/evidence/state-matrix.html) and its scenarios. Its "Today" row
// must be exactly what the console shows on this branch, never a frozen picture of an older day:
// on 2026-11-09 it still showed Panels 1 and 5 as "Not available" although the platform sync had
// made them Ready and Empty. Run from the repository root: node --test tests/state-matrix.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll } from './fake-dom.mjs';
import { SNAPSHOT_FILE, loadAgentDomainData } from '../command-center/agent-domain-data.js';
import { PANEL_ORDER, consoleInputs, renderPanels } from '../command-center/console.js';
import { FIXTURE_CAPTURE, FIXTURE_TIME_LABEL, REAL_SCENARIOS, SCENARIOS, TEST_DATA_QUEUE, TEST_DATA_SOURCE_NOTE, labelFixtureCaptureTime, relabelTestDataQueue } from '../docs/evidence/state-fixtures.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Repo files from disk; the snapshot always answers 404, so a local snapshot cannot change results.
async function diskFetch(url) {
  if (url === SNAPSHOT_FILE) return { ok: false, status: 404, json: async () => null };
  try {
    const text = await readFile(path.join(ROOT, url), 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(text) };
  } catch (err) {
    if (err.code === 'ENOENT') return { ok: false, status: 404, json: async () => null };
    throw err;
  }
}

function states(domain) {
  const remove = installFakeDom();
  try {
    const panels = renderPanels(consoleInputs(domain), null);
    return Object.fromEntries(Object.entries(panels).map(([id, p]) => [id, p.getAttribute('data-state')]));
  } finally { remove(); }
}

test('the scenarios load, with unique ids, and every one renders all six panels', async () => {
  const real = await loadAgentDomainData({ fetchImpl: diskFetch });
  assert.equal(new Set(SCENARIOS.map((s) => s.id)).size, SCENARIOS.length);
  for (const s of SCENARIOS) assert.equal(Object.keys(states(s.domain(real.source, real))).length, 6, s.id);
});

test('"Today" renders exactly what the console loads, platform sync included', async () => {
  const real = await loadAgentDomainData({ fetchImpl: diskFetch });
  const today = SCENARIOS.find((s) => s.id === 'today');
  assert.deepEqual(states(today.domain(real.source, real)), states({ status: 'loaded', ...real }));
  assert.equal(states(today.domain(real.source, real)).employee, 'ready');
  assert.equal(states(today.domain(real.source, real)).governance, 'empty');
});

test('"nothing captured or synced" is the only real-data row where Panels 1 to 5 are "Not available"', async () => {
  const real = await loadAgentDomainData({ fetchImpl: diskFetch });
  const none = states(SCENARIOS.find((s) => s.id === 'nothing-captured').domain(real.source, real));
  for (const id of ['employee', 'inventory', 'ladder', 'behaviour', 'governance']) assert.equal(none[id], 'not_available', id);
  // The pinned research file is loaded in this row, and is still not used in place of the synced records.
  assert.equal(real.source.status, 'ok');
});

test('the state-matrix page labels both real-data rows as real and every other row as a fixture', async () => {
  const html = await readFile(path.join(ROOT, 'docs/evidence/state-matrix.html'), 'utf8');
  assert.match(html, /\['today', 'nothing-captured'\]\.includes\(s\.id\) \? 'muted' : 'fixture-banner'/);
  assert.deepEqual([...REAL_SCENARIOS], ['today', 'nothing-captured']);
  for (const s of SCENARIOS.filter((x) => !['loading', ...REAL_SCENARIOS].includes(x.id))) assert.match(s.what, /^FIXTURE/, s.id);
  // Real rows never call themselves fixtures, and the live row says it is live.
  for (const id of REAL_SCENARIOS) assert.doesNotMatch(SCENARIOS.find((s) => s.id === id).what, /FIXTURE|TEST DATA/, id);
  assert.match(SCENARIOS.find((s) => s.id === 'today').what, /^LIVE DATA, no fixtures/);
});

// Each scenario states the state every panel must reach; the render must agree, panel by panel.
test('every scenario renders, panel by panel, exactly the states it claims', async () => {
  const real = await loadAgentDomainData({ fetchImpl: diskFetch });
  for (const s of SCENARIOS) {
    assert.deepEqual(Object.keys(s.expect).sort(), [...PANEL_ORDER].sort(), `${s.id}: expect names all six panels`);
    assert.deepEqual(states(s.domain(real.source, real)), s.expect, s.id);
  }
});

// state-matrix.md is written by hand from state-matrix.json; it must say what the scenarios render.
test('state-matrix.md documents every scenario with the states it renders', async () => {
  const md = await readFile(path.join(ROOT, 'docs/evidence/state-matrix.md'), 'utf8');
  const word = (cell) => cell.replace(/\*\*/g, '').replace(/\(.*\)/, '').trim().toLowerCase().replace(/ /g, '_');
  const rows = new Map(md.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| Scenario') && !l.startsWith('|---'))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim())).filter((c) => c.length === 8)
    .map((c) => [c[0].replace(/\*\*/g, ''), c.slice(1, 7).map(word)]));
  for (const s of SCENARIOS) {
    assert.ok(rows.has(s.title), `state-matrix.md has a row for "${s.title}"`);
    assert.deepEqual(rows.get(s.title), PANEL_ORDER.map((id) => s.expect[id]), s.title);
  }
  assert.equal(rows.size, SCENARIOS.length, 'no stale rows');
});

function panel(domain, id) {
  return renderPanels(consoleInputs(domain), null)[id];
}

test('"Captured: data": the submitted tool request is waiting, and no request is shown as a grant', async () => {
  const real = await loadAgentDomainData({ fetchImpl: diskFetch });
  const s = SCENARIOS.find((x) => x.id === 'captured-data');
  const remove = installFakeDom();
  try {
    const p = panel(s.domain(real.source, real), 'governance');
    const rows = findAll(p, (el) => el.tagName === 'TR').map((tr) => findAll(tr, (el) => el.tagName === 'TD').map((td) => td.textContent));
    const data = rows.filter((cells) => cells.length);
    assert.equal(data.length, 3, 'three test-data requests');
    for (const cells of data) assert.match(cells.at(-1), /^Nothing: a request is not a grant/, cells.join(' / '));
    const submitted = data.find((cells) => cells.some((c) => /^Submitted/.test(c)));
    assert.ok(submitted, 'the submitted tool request is shown');
    assert.ok(submitted.includes('Not decided yet'), 'a submitted request has no decision');
    for (const cells of data) for (const c of cells) assert.doesNotMatch(c, /\bGranted\b|now has|grants the/i, c);
    assert.doesNotMatch(p.textContent, /requester@|reviewer@/, 'people are withheld');
  } finally { remove(); }
});

test('fixture rows show Panel 3 from the real synced authority, the same as "Today"', async () => {
  const real = await loadAgentDomainData({ fetchImpl: diskFetch });
  const remove = installFakeDom();
  try {
    const headline = (s) => findAll(panel(s.domain(real.source, real), 'ladder'), (el) => (el.className ?? '').includes('panel-headline'))[0]?.textContent;
    const today = headline(SCENARIOS.find((s) => s.id === 'today'));
    assert.ok(today);
    for (const id of ['captured-empty', 'captured-data', 'refused']) {
      const s = SCENARIOS.find((x) => x.id === id);
      assert.match(s.what, /Panel 3 shows the REAL platform-synced authority record/, id);
      assert.equal(headline(s), today, id);
    }
  } finally { remove(); }
});

// In a TEST DATA row, Panel 5's own source wording would call made-up rows the platform's synced snapshot
// and give them a last-changed time. The review page swaps that block and its "Reads:" tag for TEST DATA labels.
test('TEST DATA rows: Panel 5 never calls its rows the synced snapshot or gives them a time; Today keeps the real wording', async () => {
  const real = await loadAgentDomainData({ fetchImpl: diskFetch });
  const html = await readFile(path.join(ROOT, 'docs/evidence/state-matrix.html'), 'utf8');
  assert.match(html, /if \(TEST_DATA_QUEUE\.includes\(s\.id\)\) relabelTestDataQueue\(panels\.governance\)/);
  assert.ok(TEST_DATA_QUEUE.every((id) => !REAL_SCENARIOS.includes(id)), 'no real row is relabelled');
  const remove = installFakeDom();
  try {
    for (const id of TEST_DATA_QUEUE) {
      const s = SCENARIOS.find((x) => x.id === id);
      assert.match(s.what, /^FIXTURE.*TEST DATA/, id);
      const p = panel(s.domain(real.source, real), 'governance');
      assert.match(p.textContent, /synced snapshot/, `${id}: the console's own wording is there before relabelling`);
      const empty = s.expect.governance === 'empty';
      assert.equal(relabelTestDataQueue(p), empty ? 3 : 2, `${id}: the source block, the Reads tag${empty ? ' and the empty headline' : ''} are relabelled`);
      assert.ok(p.textContent.includes(TEST_DATA_SOURCE_NOTE), id);
      // Outside the TEST DATA note itself, nothing presents the rows as the platform's, or dates them.
      const rest = p.textContent.replace(TEST_DATA_SOURCE_NOTE, '');
      assert.doesNotMatch(rest, /synced snapshot|platform snapshot records|last changed|3 November|Platform sync · \.colaberry\/agent-domain\.json · governance/, id);
    }
    const today = panel(SCENARIOS.find((x) => x.id === 'today').domain(real.source, real), 'governance');
    assert.match(today.textContent, /the platform's synced snapshot/, 'Today keeps the live wording');
    assert.doesNotMatch(today.textContent, /TEST DATA/);
  } finally { remove(); }
});

// Panel 1 in a FIXTURE capture row shows the fixture's made-up capture time; the review page labels it.
test('FIXTURE capture rows: every capture time Panel 1 shows is labelled as a simulated FIXTURE time; real rows are untouched', async () => {
  const real = await loadAgentDomainData({ fetchImpl: diskFetch });
  const html = await readFile(path.join(ROOT, 'docs/evidence/state-matrix.html'), 'utf8');
  assert.match(html, /if \(FIXTURE_CAPTURE\.includes\(s\.id\)\) labelFixtureCaptureTime\(panels\.employee\)/);
  assert.ok(FIXTURE_CAPTURE.every((id) => !REAL_SCENARIOS.includes(id)), 'no real row is labelled');
  const remove = installFakeDom();
  try {
    let labelled = 0;
    for (const id of FIXTURE_CAPTURE) {
      const s = SCENARIOS.find((x) => x.id === id);
      assert.match(s.what, /^FIXTURE.*capture time is labelled as a FIXTURE time/, id);
      const p = panel(s.domain(real.source, real), 'employee');
      const times = (p.textContent.match(/, captured [^.]*? (?:CST|CDT)/g) ?? []).length;
      const added = labelFixtureCaptureTime(p);
      assert.equal(added, times, `${id}: one label per capture time shown`);
      assert.equal(p.textContent.split(FIXTURE_TIME_LABEL).length - 1, times, id);
      for (const m of p.textContent.matchAll(/, captured [^.]*? (?:CST|CDT)/g)) {
        assert.ok(p.textContent.slice(m.index + m[0].length).startsWith(` ${FIXTURE_TIME_LABEL}`), `${id}: the label follows the time`);
      }
      labelled += added;
    }
    assert.equal(labelled, 2, 'the two rows with an HTTP 200 capture show a time; the refused row shows none');
    const today = panel(SCENARIOS.find((x) => x.id === 'today').domain(real.source, real), 'employee');
    assert.doesNotMatch(today.textContent, /FIXTURE/);
  } finally { remove(); }
});

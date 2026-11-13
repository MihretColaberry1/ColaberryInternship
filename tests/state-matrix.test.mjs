// The state-matrix evidence page (docs/evidence/state-matrix.html) and its scenarios. Its "Today" row
// must be exactly what the console shows on this branch, never a frozen picture of an older day:
// on 2026-11-09 it still showed Panels 1 and 5 as "Not available" although the platform sync had
// made them Ready and Empty. Run from the repository root: node --test tests/state-matrix.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom } from './fake-dom.mjs';
import { SNAPSHOT_FILE, loadAgentDomainData } from '../command-center/agent-domain-data.js';
import { consoleInputs, renderPanels } from '../command-center/console.js';
import { SCENARIOS } from '../docs/evidence/state-fixtures.js';

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

test('"nothing captured or synced" is the only real-data row where Panels 1 and 5 are "Not available"', async () => {
  const real = await loadAgentDomainData({ fetchImpl: diskFetch });
  const none = states(SCENARIOS.find((s) => s.id === 'nothing-captured').domain(real.source, real));
  assert.equal(none.employee, 'not_available');
  assert.equal(none.governance, 'not_available');
  assert.equal(none.inventory, 'ready');
});

test('the state-matrix page labels both real-data rows as real and every other row as a fixture', async () => {
  const html = await readFile(path.join(ROOT, 'docs/evidence/state-matrix.html'), 'utf8');
  assert.match(html, /\['today', 'nothing-captured'\]\.includes\(s\.id\) \? 'muted' : 'fixture-banner'/);
  for (const s of SCENARIOS.filter((x) => !['loading', 'today', 'nothing-captured'].includes(x.id))) assert.match(s.what, /^FIXTURE/, s.id);
});

// The six-panel console (STORY-000, current brief of 2026-11-03), rendered for real through the fake
// DOM: panel order, the endpoint each panel names (criterion 1), the five states and how they differ
// (criterion 2), one primary action per panel, collapsed details, and no trace of the nine tabs.
// Run from the repository root: node --test tests/console.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll, hasClass } from './fake-dom.mjs';
import { SNAPSHOT_FILE, loadAgentDomainData } from '../command-center/agent-domain-data.js';
import { ENDPOINTS, PANEL_ENDPOINTS } from '../command-center/agent-domain-facts.js';
import { loadProjectData } from '../command-center/data.js';
import { buildOverviewModel } from '../command-center/model.js';
import { PANEL_ORDER, renderConsole } from '../command-center/console.js';

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

async function realInputs() {
  const domain = { status: 'loaded', ...(await loadAgentDomainData({ fetchImpl: diskFetch })) };
  const data = await loadProjectData({ fetchImpl: diskFetch });
  return { domain, project: { status: 'loaded', data, model: buildOverviewModel(data, new Date('2026-11-03T18:00:00Z')), error: null } };
}

function renderPanels(domain, project) {
  const remove = installFakeDom();
  try {
    return findAll(renderConsole(domain, project), hasClass('panel'));
  } finally { remove(); }
}

const byId = (panels) => Object.fromEntries(panels.map((p) => [p.getAttribute('data-panel'), p]));
const GET = (key) => `GET ${ENDPOINTS[key]}`;
const endpointsNamed = (p) => new Set(findAll(findAll(p, hasClass('panel-reads'))[0], hasClass('src-endpoint'))
  .map((tag) => findAll(tag, hasClass('src-detail'))[0]?.textContent.replace(/^ · /, '')));
// Display id to the brief's panel number (docs/stories/STORY-000.md).
const BRIEF = { employee: 1, inventory: 2, ladder: 3, behaviour: 4, governance: 5, gaps: 6 };

test('six panels render in the operator order, numbered 1 to 6', async () => {
  const { domain, project } = await realInputs();
  const panels = renderPanels(domain, project);
  assert.deepEqual(panels.map((p) => p.getAttribute('data-panel')), PANEL_ORDER);
  assert.deepEqual(PANEL_ORDER, ['employee', 'governance', 'inventory', 'ladder', 'behaviour', 'gaps']);
  panels.forEach((p, i) => assert.equal(findAll(p, hasClass('panel-order'))[0].textContent, String(i + 1)));
});

test('criterion 1: each panel names, as whole tags, every endpoint the brief assigns it', async () => {
  const { domain, project } = await realInputs();
  const panels = byId(renderPanels(domain, project));
  for (const [id, n] of Object.entries(BRIEF)) {
    const named = endpointsNamed(panels[id]);
    for (const k of PANEL_ENDPOINTS[n]) assert.ok(named.has(GET(k)), `${id} does not name ${GET(k)}: ${[...named].join(', ')}`);
  }
  for (const k of Object.keys(ENDPOINTS)) assert.ok(endpointsNamed(panels.gaps).has(GET(k)), `gaps does not name ${GET(k)}`);
});

test('today, with no snapshot: Panels 1 and 5 are "Not available", the other four are ready', async () => {
  const { domain, project } = await realInputs();
  const panels = byId(renderPanels(domain, project));
  const states = Object.fromEntries(Object.entries(panels).map(([id, p]) => [id, p.getAttribute('data-state')]));
  assert.deepEqual(states, { employee: 'not_available', governance: 'not_available', inventory: 'ready', ladder: 'ready', behaviour: 'ready', gaps: 'ready' });
  for (const id of ['employee', 'governance']) {
    const block = findAll(panels[id], hasClass('not-available'));
    assert.equal(block.length, 1, id);
    for (const word of ['Missing', 'Waiting for', 'Will show']) assert.match(block[0].textContent, new RegExp(word), id);
    assert.match(findAll(panels[id], hasClass('state-chip'))[0].textContent, /Not available/);
  }
});

test('criterion 2: a loading panel says "Loading", is aria-busy, and carries no "Not available" block', async () => {
  const panels = renderPanels({ status: 'loading' }, null);
  assert.equal(panels.length, 6);
  for (const p of panels) {
    assert.equal(p.getAttribute('data-state'), 'loading', p.getAttribute('data-panel'));
    assert.equal(p.getAttribute('aria-busy'), 'true');
    assert.match(findAll(p, hasClass('state-chip'))[0].textContent, /Loading/);
    assert.equal(findAll(p, hasClass('not-available')).length, 0);
  }
});

test('a refused capture is an error with the HTTP status, not "Not available" and not loading', async () => {
  const { domain, project } = await realInputs();
  const refused = { state: 'refused', status: 403, fetched_at: '2026-11-03T18:00:00Z', message: null };
  const panels = byId(renderPanels({ ...domain, snapshot: { status: 'captured', endpoints: { ...domain.snapshot.endpoints, mine: refused, requests: refused } } }, project));
  for (const id of ['employee', 'governance']) {
    assert.equal(panels[id].getAttribute('data-state'), 'error', id);
    assert.equal(findAll(panels[id], hasClass('error-block'))[0].getAttribute('role'), 'alert');
  }
  assert.match(findAll(panels.employee, hasClass('error-block'))[0].textContent, /HTTP 403/);
});

test('a missing source file puts the capability panels in an error state, said in words', async () => {
  const panels = byId(renderPanels({ status: 'loaded', source: { status: 'error', error: 'HTTP 404' }, snapshot: { status: 'not_captured', endpoints: {
    mine: { state: 'not_captured' }, domain: { state: 'not_captured' }, coverage: { state: 'not_captured' }, requests: { state: 'not_captured' } } } }, null));
  for (const id of ['inventory', 'ladder', 'behaviour']) {
    assert.equal(panels[id].getAttribute('data-state'), 'error', id);
    assert.match(panels[id].textContent, /could not be read/);
  }
  assert.doesNotMatch(panels.gaps.textContent, /0 of 0/);
});

test('an empty governance queue says so, instead of an empty table', async () => {
  const { domain, project } = await realInputs();
  const empty = { state: 'ok', status: 200, fetched_at: '2026-11-03T18:00:00Z', body: { change_requests: [] } };
  const panels = byId(renderPanels({ ...domain, snapshot: { status: 'captured', endpoints: { ...domain.snapshot.endpoints, requests: empty } } }, project));
  assert.equal(panels.governance.getAttribute('data-state'), 'empty');
  assert.match(panels.governance.textContent, /No change or tool requests are filed/);
});

test('every panel has exactly one primary action, and every disclosure starts collapsed', async () => {
  const { domain, project } = await realInputs();
  for (const p of renderPanels(domain, project)) {
    assert.equal(findAll(p, hasClass('btn-primary')).length, 1, p.getAttribute('data-panel'));
    for (const d of findAll(p, hasClass('disclosure'))) assert.equal(d.getAttribute('open'), null);
  }
});

test('content from the old tabs is carried into the panels, and the tabs themselves are gone', async () => {
  const { domain, project } = await realInputs();
  const remove = installFakeDom();
  try {
    const out = renderConsole(domain, project);
    const panels = byId(findAll(out, hasClass('panel')));
    const summaries = (id) => findAll(panels[id], (el) => el.tagName === 'SUMMARY').map((s) => s.textContent);
    assert.ok(summaries('inventory').some((t) => t.startsWith('Stories, criteria and points')));
    assert.ok(summaries('inventory').some((t) => t.startsWith('Release timeline')));
    assert.ok(summaries('governance').some((t) => t.startsWith('Guardrails waiting on a human')));
    assert.ok(summaries('gaps').some((t) => t.startsWith('Not in the project plan yet')));
    assert.equal(findAll(out, hasClass('tabs')).length, 0);
    assert.doesNotMatch(findAll(out, () => true).map((n) => n.textContent).join(''), /SAMPLE DATA|Sample mode/);
  } finally { remove(); }
});

// STORY-000 criterion 1: Panels 2-4 read the platform's synced capability records, never the pinned
// research file in their place. Since AF12.5 (platform 41808ee2) .colaberry/agent-domain.json carries
// capabilities[], the same projection GET /api/admin/agent-domains-mine/<key> returns, and names that
// endpoint in sources.capabilities. These eight tests were written to fail on the code before the change
// (commit c7271fd) and pass after it; they use only functions that exist in both, so that can be shown.
// Run from the repository root: node --test tests/criterion-1-sync.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll, hasClass } from './fake-dom.mjs';
import { CAPABILITY_FILE, PLATFORM_SYNC_FILE, SNAPSHOT_FILE, loadAgentDomainData } from '../command-center/agent-domain-data.js';
import { consoleInputs, renderPanels, renderRoute } from '../command-center/console.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (f) => JSON.parse(await readFile(path.join(ROOT, f), 'utf8'));

/** Repository files from disk; `over` replaces a file's JSON (null = answers 404). No snapshot is ever read. */
function diskFetch(over = {}) {
  return async (url) => {
    if (url === SNAPSHOT_FILE) return { ok: false, status: 404, json: async () => null };
    if (Object.hasOwn(over, url)) {
      return over[url] === null ? { ok: false, status: 404, json: async () => null } : { ok: true, status: 200, json: async () => structuredClone(over[url]) };
    }
    try {
      const text = await readFile(path.join(ROOT, url), 'utf8');
      return { ok: true, status: 200, json: async () => JSON.parse(text) };
    } catch (err) {
      if (err.code === 'ENOENT') return { ok: false, status: 404, json: async () => null };
      throw err;
    }
  };
}

async function load(over) {
  const d = await loadAgentDomainData({ fetchImpl: diskFetch(over) });
  return { status: 'loaded', ...d };
}

function withDom(fn) {
  const remove = installFakeDom();
  try { return fn(); } finally { remove(); }
}
const panelsOf = (domain) => withDom(() => {
  const p = renderPanels(consoleInputs(domain), null);
  return Object.fromEntries(Object.entries(p).map(([id, el]) => [id, { state: el.getAttribute('data-state'), text: el.textContent, el }]));
});
const pageText = (domain, parts) => withDom(() => [renderRoute(parts, domain, null)].flat(Infinity).map((n) => n?.textContent ?? '').join(''));
const readsOf = (panel) => findAll(panel.el, hasClass('panel-reads'))[0]?.textContent ?? '';

const MANAGER = /Aleem|Mohammed/;

// 1
test('Panels 2 to 4 are Ready from the synced records with the pinned file absent: no inventory or behaviour value comes from it', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const domain = await load({ [CAPABILITY_FILE]: null });
  const p = panelsOf(domain);
  for (const id of ['inventory', 'ladder', 'behaviour']) assert.equal(p[id].state, 'ready', id);
  const rows = withDom(() => consoleInputs(domain).rows);
  assert.deepEqual(rows.map((r) => [r.id, r.name, r.classification, r.implementation_state, r.validation, r.starting, r.ceiling, r.human_decision, r.behaviours.length]),
    json.capabilities.map((c) => [c.capability_id, c.name, c.classification, c.implementation_state, c.requirement_validation_state,
      c.starting_autonomy, c.max_permitted_autonomy, c.human_decision, c.release_behaviour.length]));
  // The two fields only the pinned file holds are said to be unavailable, never shown as "none".
  assert.match(p.governance.text, /Tools the capabilities will needNot available: the pinned source file did not load/);
});

// 2
test("each capability panel's endpoint label is the snapshot's own sources value, not a constant", async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const real = panelsOf(await load());
  const cap = json.sources.capabilities.slice('GET '.length);
  const cov = json.sources.capability_ladder.slice('GET '.length);
  assert.match(readsOf(real.inventory), new RegExp(`GET ${cap.replace(/[/]/g, '\\/')}\\b`));
  assert.ok(readsOf(real.inventory).includes(`GET ${cov}`), 'Panel 2 also names /coverage');
  for (const id of ['ladder', 'behaviour']) assert.ok(readsOf(real[id]).includes(`GET ${cap}`), id);
  // Change the label in the file: the page follows the file.
  const moved = { ...json, sources: { ...json.sources, capabilities: 'GET /api/admin/agent-domains-mine/product_experience/relabelled' } };
  const p = panelsOf(await load({ [PLATFORM_SYNC_FILE]: moved }));
  for (const id of ['inventory', 'ladder', 'behaviour']) assert.ok(readsOf(p[id]).includes('GET /api/admin/agent-domains-mine/product_experience/relabelled'), id);
});

// 3
test('one malformed capability record makes Panels 2 to 4 an Error with the reason, never a partial list', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const bad = structuredClone(json);
  bad.capabilities[3].starting_autonomy = 'R0'; // not an autonomy:Rn rung
  const p = panelsOf(await load({ [PLATFORM_SYNC_FILE]: bad }));
  for (const id of ['inventory', 'ladder', 'behaviour']) {
    assert.equal(p[id].state, 'error', id);
    assert.match(p[id].text, /capabilities\[3\] is not a well-formed capability record/, id);
    assert.equal(findAll(p[id].el, (el) => el.tagName === 'A' && /^#\/capability\//.test(el.getAttribute('href') ?? '')).length, 0, `${id}: no rows shown`);
  }
});

// 4
test('a synced file with no capabilities section makes Panels 2 to 4 "Not available", not an Error', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const { capabilities, ...without } = json;
  assert.ok(Array.isArray(capabilities));
  const p = panelsOf(await load({ [PLATFORM_SYNC_FILE]: without }));
  for (const id of ['inventory', 'ladder', 'behaviour']) {
    assert.equal(p[id].state, 'not_available', id);
    for (const word of ['Missing', 'Waiting for', 'Will show']) assert.match(p[id].text, new RegExp(word), id);
    assert.match(p[id].text, /The pinned research file is not used in its place/, id);
  }
});

// 5
test('the /coverage rows are said, in words, to be absent from the synced file; nothing is assumed', async () => {
  const p = panelsOf(await load());
  assert.match(p.inventory.text, /Not available: not in the platform's synced file/);
  assert.match(p.inventory.text, /names this endpoint but carries none of its rows/);
  assert.match(p.gaps.text, /carries none of its rows, so the \/coverage check in the capability inventory is left blank/);
  assert.doesNotMatch(p.inventory.text, /Matches the synced record|Differs from the synced record/);
});

// 6
test('capability records and authority rows are joined on capability_id, never by position', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const reversed = { ...json, capabilities: [...json.capabilities].reverse() };
  const domain = await load({ [PLATFORM_SYNC_FILE]: reversed });
  const rows = withDom(() => consoleInputs(domain).rows);
  const byId = Object.fromEntries(json.authority.map((a) => [a.capability_id, a]));
  assert.deepEqual(rows.map((r) => r.id), reversed.capabilities.map((c) => c.capability_id), 'rows follow the synced file');
  for (const r of rows) {
    assert.equal(r.platform?.effective_autonomy, byId[r.id].effective_autonomy, r.id);
    assert.equal(r.platform?.max_permitted_autonomy, byId[r.id].max_permitted_autonomy, r.id);
    assert.equal(r.ceiling_reason, byId[r.id].ceiling_reason, `${r.id}: the platform's ceiling reason`);
  }
});

// 7
test("the accountable manager's name never appears in rendered behaviour text, and without the name list the text is withheld", async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  assert.ok(MANAGER.test(JSON.stringify(json.capabilities)), 'the synced behaviour text does name the manager, so this test is not vacuous');
  const pages = (domain) => [pageText(domain, []),
    ...json.capabilities.map((c) => pageText(domain, ['capability', c.capability_id])),
    ...[...new Set(json.capabilities.flatMap((c) => c.release_behaviour.map((b) => b.autonomy)))].map((s) => pageText(domain, ['rung', s]))];
  // With the name list: replaced by "the accountable manager".
  const named = pages(await load());
  for (const t of named) assert.doesNotMatch(t, MANAGER);
  assert.ok(named.some((t) => /the accountable manager/i.test(t)));
  // Without it (the pinned file loads but records no accountable_human): fail-closed, the text is withheld.
  const pinned = await readJson(CAPABILITY_FILE);
  const { accountable_human, ...noName } = pinned;
  assert.ok(accountable_human);
  const unnamed = pages(await load({ [CAPABILITY_FILE]: noName }));
  for (const t of unnamed) assert.doesNotMatch(t, MANAGER);
  assert.ok(unnamed.some((t) => t.includes('Withheld: the list of names this page must not show did not load')));
});

// 8
test("rows keep the synced file's research order, whatever order the pinned file is in", async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const pinned = await readJson(CAPABILITY_FILE);
  const domain = await load({ [CAPABILITY_FILE]: { ...pinned, capabilities: [...pinned.capabilities].reverse() } });
  const rows = withDom(() => consoleInputs(domain).rows);
  assert.deepEqual(rows.map((r) => r.id), json.capabilities.map((c) => c.capability_id));
  // Panel 2's table lists them in that order too.
  const p = panelsOf(domain);
  const links = findAll(p.inventory.el, (el) => el.tagName === 'A' && /^#\/capability\//.test(el.getAttribute('href') ?? ''))
    .map((a) => decodeURIComponent(a.getAttribute('href').slice('#/capability/'.length)));
  assert.deepEqual(links.filter((id, i, all) => all.indexOf(id) === i), json.capabilities.map((c) => c.capability_id));
});

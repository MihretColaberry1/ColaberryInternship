// Panels 1, 2 and 6 reading .colaberry/agent-domain.json, the platform's synced copy of its endpoints:
// what it becomes, what it withholds, how it is labelled, what wins when both sources exist, and what
// a broken file does. Showing the agent's state is never treated as approval to change it.
// Run from the repository root: node --test tests/agent-domain-platform-sync.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { findAll, hasClass, installFakeDom } from './fake-dom.mjs';
import {
  PLATFORM_SYNC_FILE, PLATFORM_SYNC_SCHEMA, SNAPSHOT_FILE, combineEndpoints, loadAgentDomainData, readPlatformSync,
} from '../command-center/agent-domain-data.js';
import { ENDPOINTS } from '../command-center/agent-domain-facts.js';
import { PRESENT, RECORD_ID_PATTERN, WITHHELD } from '../command-center/agent-domain-redact.js';
import { employeeView, requestGroups, toolRuleStatus } from '../command-center/agent-domain-model.js';
import { NOT_AN_APPROVAL, renderEmployeePanel } from '../command-center/panel-employee.js';
import { renderGovernancePanel } from '../command-center/panel-governance.js';
import { consoleInputs, renderPanels } from '../command-center/console.js';
import { formatCentral } from '../command-center/model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async (p) => JSON.parse(await readFile(path.join(ROOT, p), 'utf8'));
// "Last changed" is the manifest's generated_at in Central time. Read from the manifest, not typed in:
// a hard-coded time broke on the next platform sync (main 4ca7ada, 2026-11-04, merged 2026-11-09).
const LAST_CHANGED_CENTRAL = formatCentral(new Date((await read('.colaberry/manifest.json')).generated_at));
test('the expected "last changed" text is a Central-time date, as the page writes it', () => {
  assert.match(LAST_CHANGED_CENTRAL, /^\d{1,2} [A-Z][a-z]+ \d{4}, \d{1,2}:\d{2} [AP]M C[SD]T$/);
});
// Independent of the manifest: fixed inputs and typed-in answers, so a formatter that drifted would fail
// here even though the page and LAST_CHANGED_CENTRAL above would still agree with each other.
test('formatCentral pins standard time (CST) to fixed inputs', () => {
  assert.equal(formatCentral(new Date('2026-11-04T02:26:48.364Z')), '3 November 2026, 8:26 PM CST');
  assert.equal(formatCentral(new Date('2026-11-04T21:14:40.376Z')), '4 November 2026, 3:14 PM CST');
});

// Repo files from disk; the local snapshot always answers 404. `override` replaces one file's answer.
function diskFetch(override = {}) {
  return async (url) => {
    if (url in override) return override[url];
    if (url === SNAPSHOT_FILE) return { ok: false, status: 404, json: async () => null };
    try {
      const text = await readFile(path.join(ROOT, url), 'utf8');
      return { ok: true, status: 200, json: async () => JSON.parse(text) };
    } catch (err) {
      if (err.code === 'ENOENT') return { ok: false, status: 404, json: async () => null };
      throw err;
    }
  };
}
const answer = (json) => ({ ok: true, status: 200, json: async () => json });

async function realDomain(override) {
  return { status: 'loaded', ...(await loadAgentDomainData({ fetchImpl: diskFetch(override) })) };
}

function text(nodes) {
  const remove = installFakeDom();
  try { return [nodes].flat(Infinity).map((n) => n?.textContent ?? '').join(' '); } finally { remove(); }
}
function rendered(fn) {
  const remove = installFakeDom();
  try { return fn(); } finally { remove(); }
}

// ---- What the file becomes ----

test('the real file becomes ok endpoint states for mine and requests, dated by the manifest', async () => {
  const [json, manifest] = await Promise.all([read(PLATFORM_SYNC_FILE), read('.colaberry/manifest.json')]);
  const s = readPlatformSync(json, manifest.generated_at);
  assert.equal(s.status, 'synced');
  assert.equal(s.last_changed, manifest.generated_at);
  assert.deepEqual(Object.keys(s.endpoints).sort(), ['mine', 'requests']);
  for (const e of Object.values(s.endpoints)) {
    assert.equal(e.state, 'ok');
    assert.equal(e.origin, 'platform_sync');
    assert.equal(e.last_changed, manifest.generated_at);
    assert.equal(e.fetched_at, null, 'the file has no fetch time, and none is invented');
  }
  const [row] = s.endpoints.mine.body.domains;
  assert.equal(row.domain_key, 'product_experience');
  assert.equal(row.agent_display_name, json.agent.display_name);
  assert.equal(row.agent_enabled, json.agent.enabled);
  assert.equal(row.agent_autonomy_level, json.agent.autonomy_level);
  assert.deepEqual(row.agent_tools_granted, json.agent.tools_granted);
  assert.equal(row.agent_tools_granted_count, json.agent.tools_granted_count);
  assert.deepEqual(s.endpoints.requests.body.change_requests, json.governance.requests);
});

test('the agent id is reduced to "present": no UUID-shaped record id survives the conversion', async () => {
  const s = readPlatformSync(await read(PLATFORM_SYNC_FILE), null);
  assert.equal(s.endpoints.mine.body.domains[0].agent_id, PRESENT);
  assert.equal((JSON.stringify(s.endpoints).match(new RegExp(RECORD_ID_PATTERN, 'g')) ?? []).length, 0);
});

test('a request in the synced file keeps its kind and status but withholds who filed and decided it', () => {
  const json = { schema: PLATFORM_SYNC_SCHEMA, domain_key: 'product_experience', agent: { exists: false },
    governance: { requests: [{ id: 'r-1', kind: 'tool', status: 'pending', title: 'Grant repo_read',
      requested_by_identity: 'someone@example.com', approved_by_identity: null }] } };
  const [r] = readPlatformSync(json, null).endpoints.requests.body.change_requests;
  assert.deepEqual([r.kind, r.status, r.title], ['tool', 'pending', 'Grant repo_read']);
  assert.equal(r.requested_by_identity, WITHHELD);
  assert.equal(Object.hasOwn(r, 'id'), false, 'the row key is dropped by the allow-list');
});

test('an agent the file says does not exist reads as "no agent linked", never as a recorded value', () => {
  const json = { schema: PLATFORM_SYNC_SCHEMA, domain_key: 'product_experience', agent: { exists: false, display_name: null }, governance: { requests: [] } };
  const v = employeeView({ domain: { state: 'not_captured' }, ...readPlatformSync(json, null).endpoints });
  assert.equal(v.link.state, 'not_linked');
  assert.ok(v.fields.filter((f) => f.key.startsWith('agent_')).every((f) => f.state === 'no_agent'));
});

// ---- Failure paths ----

test('a file of the wrong schema, domain or shape is invalid and supplies nothing', () => {
  const good = { schema: PLATFORM_SYNC_SCHEMA, domain_key: 'product_experience', agent: {}, governance: { requests: [] } };
  for (const bad of [null, { ...good, schema: 'other/v1' }, { ...good, domain_key: 'website' }, { ...good, agent: null }, { ...good, governance: {} }]) {
    const s = readPlatformSync(bad, null);
    assert.equal(s.status, 'invalid');
    assert.match(s.error, /agent-domain\.json/);
    assert.deepEqual(s.endpoints, {});
  }
});

test('no synced file is "not synced"; an unreadable one is reported, not hidden', async () => {
  const none = await realDomain({ [PLATFORM_SYNC_FILE]: { ok: false, status: 404, json: async () => null } });
  assert.equal(none.snapshot.sync.status, 'not_synced');
  const broken = await realDomain({ [PLATFORM_SYNC_FILE]: { ok: true, status: 200, json: async () => { throw new SyntaxError('x'); } } });
  assert.equal(broken.snapshot.sync.status, 'invalid');
  assert.match(broken.snapshot.sync.error, /not valid JSON/);
});

test('a broken synced file makes Panels 1 and 5 an error, never "Not available" and never loading', async () => {
  const domain = await realDomain({ [PLATFORM_SYNC_FILE]: answer({ schema: 'wrong' }) });
  const panels = rendered(() => renderPanels(consoleInputs(domain), null));
  for (const id of ['employee', 'governance']) {
    const p = panels[id];
    assert.equal(p.getAttribute('data-state'), 'error', id);
    assert.match(p.textContent, /platform-synced file could not be used/, id);
    assert.equal(findAll(p, hasClass('not-available')).length, 0, id);
  }
});

test('a manifest with no generated_at says "last changed: not recorded" rather than inventing a time', async () => {
  const domain = await realDomain({ '.colaberry/manifest.json': answer({}) });
  assert.equal(domain.snapshot.endpoints.mine.last_changed, null);
  const panel = rendered(() => renderPanels(consoleInputs(domain), null).employee);
  assert.match(panel.textContent, /last changed: not recorded/);
});

// ---- Which source wins ----

test('your own capture wins wherever it answered; the sync fills only what it did not', () => {
  const captured = { state: 'ok', status: 200, fetched_at: '2026-11-03T18:00:00Z', body: { domains: [] } };
  const refused = { state: 'refused', status: 403 };
  const sync = { status: 'synced', last_changed: 'L', endpoints: {
    mine: { state: 'ok', origin: 'platform_sync', body: { domains: [] } },
    requests: { state: 'ok', origin: 'platform_sync', body: { change_requests: [] } } } };
  const out = combineEndpoints({ status: 'captured', endpoints: { mine: captured, requests: refused, domain: { state: 'not_captured' } } }, sync);
  assert.equal(out.endpoints.mine, captured);
  assert.equal(out.endpoints.requests.origin, 'platform_sync');
  assert.equal(out.endpoints.domain.state, 'not_captured');
  assert.deepEqual(out.sync, { status: 'synced', last_changed: 'L', error: null });
});

// ---- Labels on the real page ----

test('Panel 1 on real data: labelled as the platform sync, with its file, endpoint and last-changed time', async () => {
  const domain = await realDomain();
  const p = rendered(() => renderPanels(consoleInputs(domain), null).employee);
  assert.equal(p.getAttribute('data-state'), 'ready');
  const syncTags = findAll(p, hasClass('src-platform_sync')).map((t) => t.textContent);
  assert.ok(syncTags.length > 0);
  assert.ok(syncTags.every((t) => t.includes(PLATFORM_SYNC_FILE) && t.includes(`GET ${ENDPOINTS.mine}`)), syncTags.join(' | '));
  const reads = findAll(p, hasClass('reads'))[0].textContent;
  assert.match(reads, new RegExp(`last changed ${LAST_CHANGED_CENTRAL}`));
  assert.match(reads, /this page did not call the endpoint/);
  assert.doesNotMatch(reads, /captured|HTTP/, 'a synced copy is never described as a capture');
});

test('Panel 1 states the agent as recorded and says plainly that this is not approval to change it', async () => {
  const domain = await realDomain();
  const json = await read(PLATFORM_SYNC_FILE);
  const p = rendered(() => renderPanels(consoleInputs(domain), null).employee);
  assert.match(p.textContent, /An agent is linked to this domain\./);
  assert.match(p.textContent, new RegExp(`It is ${json.agent.enabled ? 'enabled' : 'disabled'}`));
  assert.match(p.textContent, new RegExp(`per-agent autonomy level is ${json.agent.autonomy_level}`));
  assert.match(p.textContent, /None: the platform sync records 0 tools granted/);
  assert.ok(p.textContent.includes(NOT_AN_APPROVAL));
  assert.doesNotMatch(p.textContent, /approved to enable|may be enabled|ready to enable/i);
  assert.equal((p.textContent.match(new RegExp(RECORD_ID_PATTERN, 'g')) ?? []).length, 0, 'no record id on the page');
});

test('the synced agent state changes no capability authority: still R0 for all, the tool rule holds none', async () => {
  const inputs = consoleInputs(await realDomain());
  assert.equal(inputs.link.state, 'linked');
  assert.deepEqual(inputs.link.tools_granted, []);
  assert.ok(inputs.rows.every((r) => r.authority.effective_autonomy === 'autonomy:R0'));
  assert.equal(toolRuleStatus(inputs.rows).held, 0);
});

test('Panel 5 on real data: empty, said in words, read from the synced copy, and a request is never a grant', async () => {
  const domain = await realDomain();
  const p = rendered(() => renderPanels(consoleInputs(domain), null).governance);
  assert.equal(p.getAttribute('data-state'), 'empty');
  assert.match(p.textContent, /No change or tool requests are filed, as the platform sync records\./);
  assert.ok(findAll(p, hasClass('src-platform_sync')).length > 0);
  // A tool request arriving through the sync renders with the "not a grant" column.
  const groups = requestGroups({ state: 'ok', origin: 'platform_sync', body: { change_requests: [{ kind: 'tool', status: 'pending', title: 'Grant repo_read' }] } });
  const withTool = rendered(() => text(renderGovernancePanel(groups, [], {})));
  assert.match(withTool, /Nothing: a request is not a grant/);
});

test('Panel 6 on real data: 2 of 4 endpoints have no usable response, 2 of 4 read from the sync, with the time', async () => {
  const domain = await realDomain();
  const p = rendered(() => renderPanels(consoleInputs(domain), null).gaps);
  assert.match(p.textContent, /Endpoints with no usable response\s*2 of 4/);
  assert.match(p.textContent, new RegExp(`Endpoints read from the platform sync\\s*2 of 4, last changed ${LAST_CHANGED_CENTRAL}`));
  assert.match(p.textContent, /An agent is linked to this domain\./);
});

test('the employee panel alone, with the synced row, still keeps "loading" distinct', () => {
  const loading = employeeView({ mine: { state: 'loading' }, domain: { state: 'loading' } });
  const p = rendered(() => renderEmployeePanel(loading, {}));
  assert.equal(p.getAttribute('data-state'), 'loading');
  assert.equal(p.getAttribute('aria-busy'), 'true');
});

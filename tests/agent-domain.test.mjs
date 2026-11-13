// Tests for the Agent domain tab's data and model: sources stay apart, endpoint states stay distinct,
// and nothing reads as approved or granted. Run from the repository root:
//   node --test tests/agent-domain.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  CAPABILITY_FILE, PLATFORM_SYNC_FILE, SNAPSHOT_FILE, SNAPSHOT_SCHEMA, endpointState, loadAgentDomainData, readSnapshot,
} from '../command-center/agent-domain-data.js';
import { ENDPOINTS, UNAVAILABLE_FIELDS } from '../command-center/agent-domain-facts.js';
import {
  capabilityRows, coverageCheck, employeeView, gapList, ladderCell, requestGroups, rungSummary,
} from '../command-center/agent-domain-model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Reads repo files from disk. The snapshot path always answers 404 unless a test supplies one,
// so a snapshot sitting in your local (git-ignored) folder cannot change these results.
// `sync: false` makes the platform-synced file answer 404 too, to test the page without it.
function diskFetch(snapshot = null, { sync = true } = {}) {
  return async (url) => {
    if (url === SNAPSHOT_FILE) {
      return snapshot ? { ok: true, status: 200, json: async () => snapshot } : { ok: false, status: 404, json: async () => null };
    }
    if (url === PLATFORM_SYNC_FILE && !sync) return { ok: false, status: 404, json: async () => null };
    try {
      const text = await readFile(path.join(ROOT, url), 'utf8');
      return { ok: true, status: 200, json: async () => JSON.parse(text) };
    } catch (err) {
      if (err.code === 'ENOENT') return { ok: false, status: 404, json: async () => null };
      throw err;
    }
  };
}

async function realRows() {
  const d = await loadAgentDomainData({ fetchImpl: diskFetch() });
  return { d, rows: capabilityRows(d.source.matrix) };
}

const snap = (entries) => ({ schema: SNAPSHOT_SCHEMA, captured_at: '2026-10-31T22:00:00Z', snapshots: entries });
const entry = (key, status, body) => ({ endpoint: ENDPOINTS[key], method: 'GET', fetched_at: '2026-10-31T22:00:00Z', http_status: status, body });

// ---- Source file ----

test('the source file loads with its provenance and 25 capabilities, all draft', async () => {
  const { d, rows } = await realRows();
  assert.equal(d.source.status, 'ok');
  assert.equal(d.source.record.file, CAPABILITY_FILE);
  assert.equal(d.source.record.platform_commit.slice(0, 8), '9d9aa3c3');
  assert.equal(rows.length, 25);
  assert.ok(rows.every((r) => r.validation === 'draft'));
});

test('rows keep the order the research recorded them in', async () => {
  const { d, rows } = await realRows();
  assert.deepEqual(rows.map((r) => r.id), d.source.matrix.capabilities.map((c) => c.capability_id));
});

test('with no approval recorded, authority is effectiveAuthority() of the starting rung: autonomy:R0, never the ceiling', async () => {
  const { rows } = await realRows();
  for (const r of rows) {
    assert.equal(r.approved, null, r.id);
    assert.equal(r.authority.effective_autonomy, 'autonomy:R0', r.id);
    assert.ok(!r.authority.reasons.includes('no_tool_grants'), r.id);
    assert.notEqual(r.authority.effective_autonomy, r.ceiling);
  }
});

test('human_decision is read as a strict boolean from the source file', async () => {
  const { d, rows } = await realRows();
  assert.equal(rows.filter((r) => r.human_decision).length, d.source.matrix.capabilities.filter((c) => c.human_decision === true).length);
});

test('a missing source file is an error state, not an empty inventory', async () => {
  const d = await loadAgentDomainData({ fetchImpl: async () => ({ ok: false, status: 404, json: async () => null }) });
  assert.equal(d.source.status, 'error');
  assert.match(d.source.error, /HTTP 404/);
});

// ---- Ladder and per-rung behaviour ----

test('rungs above a ceiling are unreachable, and R8 is never drawn as reachable', () => {
  const r = { starting: 'autonomy:R0', ceiling: 'autonomy:R4' };
  assert.equal(ladderCell(r, 'autonomy:R0'), 'start');
  assert.equal(ladderCell(r, 'autonomy:R2'), 'within');
  assert.equal(ladderCell(r, 'autonomy:R4'), 'ceiling');
  assert.equal(ladderCell(r, 'autonomy:R5'), 'above_ceiling');
  assert.equal(ladderCell({ starting: 'autonomy:R0', ceiling: 'autonomy:R9' }, 'autonomy:R8'), 'unreachable_by_fact');
  assert.equal(ladderCell({ starting: 'autonomy:R0', ceiling: 'not set' }, 'autonomy:R1'), 'no_ceiling');
});

test('the rung summary has all ten rungs and every behaviour lands under exactly one', async () => {
  const { rows } = await realRows();
  const rungs = rungSummary(rows);
  assert.equal(rungs.length, 10);
  assert.equal(rungs.filter((g) => g.unreachable_by_fact).map((g) => g.stage).join(), 'autonomy:R8');
  const written = rows.reduce((n, r) => n + r.behaviours.length, 0);
  assert.equal(rungs.reduce((n, g) => n + g.behaviours.length, 0), written);
  assert.equal(rungs.reduce((n, g) => n + g.ceilings_here.length, 0), rows.length);
});

// ---- Endpoint snapshot states ----

test('with neither a snapshot nor the platform sync, all four endpoints are "not captured", not empty and not loading', async () => {
  const d = await loadAgentDomainData({ fetchImpl: diskFetch(null, { sync: false }) });
  assert.equal(d.snapshot.status, 'not_captured');
  assert.equal(d.snapshot.sync.status, 'not_synced');
  assert.deepEqual(Object.values(d.snapshot.endpoints).map((e) => e.state), ['not_captured', 'not_captured', 'not_captured', 'not_captured']);
});

test('with no snapshot, the real platform sync answers mine and requests; domain and coverage stay not captured', async () => {
  const d = await loadAgentDomainData({ fetchImpl: diskFetch() });
  assert.equal(d.snapshot.status, 'not_captured');
  assert.equal(d.snapshot.sync.status, 'synced');
  const { mine, requests, domain, coverage } = d.snapshot.endpoints;
  assert.deepEqual([mine.state, mine.origin, requests.state, requests.origin], ['ok', 'platform_sync', 'ok', 'platform_sync']);
  assert.deepEqual([domain.state, coverage.state], ['not_captured', 'not_captured']);
});

test('endpoint states: 200 ok, 403 refused, 401 refused, no response failed, 500 error, missing not captured', () => {
  assert.equal(endpointState(entry('mine', 200, { domains: [] })).state, 'ok');
  assert.equal(endpointState(entry('coverage', 403, { error: 'Forbidden' })).state, 'refused');
  assert.equal(endpointState(entry('coverage', 403, { error: 'Forbidden' })).message, 'Forbidden');
  assert.equal(endpointState(entry('coverage', 401, null)).state, 'refused');
  assert.equal(endpointState({ ...entry('mine', null, null), error: 'no answer within 15s' }).state, 'failed');
  assert.equal(endpointState(entry('mine', 500, { error: 'x' })).state, 'error');
  assert.equal(endpointState(undefined).state, 'not_captured');
});

test('a 200 with no body is not treated as data', () => {
  assert.equal(endpointState(entry('mine', 200, null)).state, 'error');
});

test('a snapshot of the wrong shape is reported invalid and shows nothing as captured', () => {
  const s = readSnapshot({ snapshots: [] });
  assert.equal(s.status, 'invalid');
  assert.ok(Object.values(s.endpoints).every((e) => e.state === 'not_captured'));
});

test('a captured snapshot is read per endpoint, and an absent entry stays not captured', async () => {
  const d = await loadAgentDomainData({ fetchImpl: diskFetch(snap([entry('coverage', 403, { error: 'Forbidden' }), entry('mine', 200, { domains: [] })]), { sync: false }) });
  assert.equal(d.snapshot.status, 'captured');
  assert.equal(d.snapshot.endpoints.coverage.state, 'refused');
  assert.equal(d.snapshot.endpoints.mine.state, 'ok');
  assert.equal(d.snapshot.endpoints.requests.state, 'not_captured');
});

// ---- Panel models ----

test('employee: the registry seed value stays as recorded, but only the endpoint decides the link', () => {
  const none = employeeView(readSnapshot(snap([])).endpoints);
  assert.equal(none.registry_agent_id, null);
  assert.equal(none.mine.state, 'not_captured');
  // The registry's null is not evidence: with no capture the link is unknown, not "none".
  assert.equal(none.link.state, 'unknown');
  const v = employeeView(readSnapshot(snap([entry('mine', 200, { domains: [{ domain_key: 'product_experience', agent_id: null, agent_display_name: null }] })])).endpoints);
  assert.equal(v.mine.in_list, true);
  assert.equal(v.mine.agent_id, null);
});

test('employee: a captured list without this domain says so rather than inventing a row', () => {
  const v = employeeView(readSnapshot(snap([entry('mine', 200, { domains: [], note: 'This email matches no domain' })])).endpoints);
  assert.equal(v.mine.in_list, false);
  assert.equal(v.mine.note, 'This email matches no domain');
});

test('coverage check: matching, differing and missing rows are told apart; no capture stays not captured', async () => {
  const { rows } = await realRows();
  const [a, b] = rows;
  const body = { rows: [
    { capability_id: a.id, capability_name: a.name, current_state: a.implementation_state, validation_state: a.validation, target_autonomy: a.ceiling, effective_authority: null },
    { capability_id: b.id, capability_name: b.name, current_state: b.implementation_state, validation_state: 'confirmed', target_autonomy: b.ceiling },
  ] };
  const checks = coverageCheck(rows, { state: 'ok', body });
  assert.equal(checks.get(a.id).state, 'match');
  assert.equal(checks.get(b.id).state, 'differs');
  assert.deepEqual(checks.get(b.id).diffs, [{ field: 'validation_state', source_file: 'draft', endpoint: 'confirmed' }]);
  assert.equal(checks.get(rows[2].id).state, 'missing');
  assert.equal(coverageCheck(rows, { state: 'not_captured' }).get(a.id).state, 'not_captured');
});

test('governance: change and tool requests are split, and a row with no kind is not guessed into either', () => {
  const g = requestGroups({ state: 'ok', body: { change_requests: [{ kind: 'change' }, { kind: 'tool' }, { kind: 'tool' }, { title: 'no kind' }] } });
  assert.equal(g.change.length, 1);
  assert.equal(g.tool.length, 2);
  assert.equal(g.unknown_kind.length, 1);
  assert.equal(requestGroups({ state: 'refused', status: 403 }).state, 'refused');
});

test('gaps: draft count, empty release_behaviour, unavailable fields and unready endpoints all come from data', async () => {
  const { d, rows } = await realRows();
  const gaps = gapList(rows, d.snapshot.endpoints);
  assert.deepEqual(gaps.drafts, { count: 25, total: 25 });
  assert.equal(gaps.no_behaviour.length, rows.filter((r) => r.behaviours.length === 0).length);
  assert.equal(gaps.unavailable, UNAVAILABLE_FIELDS);
  // The platform sync answers mine and requests; the two capability endpoints are still not captured.
  assert.deepEqual(gaps.endpoints_not_ready.map((e) => e.key), ['domain', 'coverage']);
  assert.deepEqual(gaps.endpoints_synced.map((e) => e.key), ['mine', 'requests']);
  assert.equal(gaps.r8.rung, 'autonomy:R8');
});

// ---- The tab never shows made-up data ----

test('no console module imports a sample data generator', async () => {
  for (const f of (await readdir(path.join(ROOT, 'command-center'))).filter((n) => n.endsWith('.js'))) {
    const src = await readFile(path.join(ROOT, 'command-center', f), 'utf8');
    assert.doesNotMatch(src, /sample\.js|makeSampleData/, f);
  }
});

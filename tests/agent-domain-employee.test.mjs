// Panel 1 ("Your employee") against what GET /api/admin/agent-domains-mine returns at platform commit
// 992e0e01: every field has an explicit state, so a recorded value, "no agent yet", "not captured"
// and "not recorded by the platform" can never be confused. Run from the repository root:
//   node --test tests/agent-domain-employee.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { installFakeDom } from './fake-dom.mjs';
import { SNAPSHOT_SCHEMA, readSnapshot } from '../command-center/agent-domain-data.js';
import { ENDPOINTS, MINE_AGENT_FIELDS, SET_BY_NOT_RECORDED, UNAVAILABLE_FIELDS } from '../command-center/agent-domain-facts.js';
import { employeeView } from '../command-center/agent-domain-model.js';
import { renderEmployeePanel } from '../command-center/panel-employee.js';

const snap = (entries) => ({ schema: SNAPSHOT_SCHEMA, captured_at: '2026-11-02T18:00:00Z', snapshots: entries });
const mine = (status, body) => ({ endpoint: ENDPOINTS.mine, method: 'GET', fetched_at: '2026-11-02T18:00:00Z', http_status: status, body });
const view = (entries) => employeeView(readSnapshot(snap(entries)).endpoints);
const noSnapshot = () => employeeView(readSnapshot(snap([])).endpoints);
const field = (v, key) => v.fields.find((f) => f.key === key);

// A row shaped like the current endpoint (agentDomainProvisionedReader.ts at 992e0e01).
const ROW = {
  domain_key: 'product_experience', agent_id: 'a-1', agent_display_name: 'Pixel',
  agent_enabled: false, agent_autonomy_level: 'observe', agent_autonomy_level_set_at: '2026-11-02T15:00:00Z',
  agent_autonomy_level_source: 'manual', agent_tools_granted: ['repo_read', 'report_renderer'], agent_tools_granted_count: 2,
};
const NOT_RECORDED = [{ field: 'agent.autonomy_level_set_by', reason: 'Platform says: no set_by column.' }];

test('the field list is exactly what the endpoint returns, plus who-set-it, which it does not', () => {
  assert.deepEqual(MINE_AGENT_FIELDS.map((f) => f.key), [
    'agent_display_name', 'agent_enabled', 'agent_autonomy_level', 'agent_tools_granted_count',
    'agent_tools_granted', 'agent_autonomy_level_set_at', 'agent_autonomy_level_source']);
  assert.equal(SET_BY_NOT_RECORDED.field, 'agent.autonomy_level_set_by');
});

test('no snapshot: every endpoint field is "not captured" with no value, and who-set-it is "not recorded"', () => {
  const v = noSnapshot();
  for (const f of MINE_AGENT_FIELDS) {
    assert.equal(field(v, f.key).state, 'not_read', f.key);
    assert.equal(field(v, f.key).reason, 'not_captured', f.key);
    assert.equal(field(v, f.key).value, undefined, f.key);
  }
  assert.equal(field(v, 'autonomy_level_set_by').state, 'not_recorded');
});

test('a current response with an agent: every field is recorded with its exact value', () => {
  const v = view([mine(200, { domains: [ROW], not_recorded: NOT_RECORDED })]);
  for (const f of MINE_AGENT_FIELDS) {
    assert.equal(field(v, f.key).state, 'recorded', f.key);
    assert.deepEqual(field(v, f.key).value, ROW[f.key], f.key);
  }
  // false is a recorded value, not a missing one.
  assert.equal(field(v, 'agent_enabled').value, false);
  // The endpoint's own reason is preferred over the copy in this repo.
  assert.equal(field(v, 'autonomy_level_set_by').reason, 'Platform says: no set_by column.');
});

test('a row with no agent linked says "no agent yet" for every agent field, never a recorded null', () => {
  const v = view([mine(200, { domains: [{ ...ROW, agent_id: null, agent_display_name: null, agent_enabled: null,
    agent_autonomy_level: null, agent_autonomy_level_set_at: null, agent_autonomy_level_source: null,
    agent_tools_granted: null, agent_tools_granted_count: 0 }] })]);
  for (const f of MINE_AGENT_FIELDS) assert.equal(field(v, f.key).state, 'no_agent', f.key);
});

test('a response captured before the platform added the fields marks them absent, not empty', () => {
  const v = view([mine(200, { domains: [{ domain_key: 'product_experience', agent_id: 'a-1', agent_display_name: 'Pixel' }] })]);
  assert.equal(field(v, 'agent_display_name').state, 'recorded');
  for (const k of ['agent_enabled', 'agent_autonomy_level', 'agent_tools_granted', 'agent_tools_granted_count']) {
    assert.equal(field(v, k).state, 'absent', k);
  }
});

test('a list without this domain, and a refused read, are their own states', () => {
  assert.equal(field(view([mine(200, { domains: [] })]), 'agent_enabled').state, 'not_in_list');
  const refused = field(view([mine(403, { error: 'no' })]), 'agent_enabled');
  assert.deepEqual([refused.state, refused.reason], ['not_read', 'refused']);
});

test('the unavailable list no longer claims the endpoint lacks fields it now returns', () => {
  const employee = UNAVAILABLE_FIELDS.filter((f) => f.panel === 'Your employee').map((f) => f.field);
  assert.deepEqual(employee, ['autonomy_level_set_by']);
});

// ---- What a person sees ----

function panelText(v) {
  const remove = installFakeDom();
  try { return renderEmployeePanel(v).textContent; } finally { remove(); }
}

test('rendered, with no snapshot: fields say "Not captured yet" and who-set-it says "Not recorded by the platform"', () => {
  const text = panelText(noSnapshot());
  assert.doesNotMatch(text, /No endpoint returns it/);
  for (const f of MINE_AGENT_FIELDS) assert.match(text, new RegExp(`${f.key}Not captured yet`), f.key);
  assert.match(text, /autonomy_level_set_byNot recorded by the platform/);
});

test('rendered, with a recorded agent: values appear, and the autonomy level is labelled as not a rung', () => {
  const domain = { endpoint: ENDPOINTS.domain, method: 'GET', fetched_at: '2026-11-02T18:00:00Z', http_status: 200, body: { agent_id: 'a-1' } };
  const text = panelText(view([mine(200, { domains: [ROW], not_recorded: NOT_RECORDED }), domain]));
  assert.match(text, /agent_enabledfalse/);
  assert.match(text, /agent_tools_granted_count2/);
  assert.match(text, /repo_read/);
  assert.match(text, /agent_autonomy_level_sourcemanual/);
  assert.match(text, /not a rung/);
  assert.doesNotMatch(text, /Not captured yet/);
});

test('rendered: a captured list without this domain says so, never "No agent exists"', () => {
  const text = panelText(view([mine(200, { domains: [] })]));
  assert.match(text, /This domain is not in your list on the platform/);
  assert.doesNotMatch(text, /No agent exists for this domain yet/);
});

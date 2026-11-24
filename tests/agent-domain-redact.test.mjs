// The snapshot redaction guard (Ali Muwwakkil's conditions, 2026-11-02). Fixtures here are shaped
// like the platform's responses at commit ebe81e68 (ProvisionedDomainRow, ChangeRequestRow) and use
// made-up example.com people. No real capture is read or written by these tests.
// Run from the repository root: node --test tests/agent-domain-redact.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { SNAPSHOT_SCHEMA, readSnapshot } from '../command-center/agent-domain-data.js';
import { ENDPOINTS } from '../command-center/agent-domain-facts.js';
import { employeeView, requestGroups } from '../command-center/agent-domain-model.js';
import {
  APPROVED_ENDPOINTS, PRESENT, SELF, WITHHELD, findEmails, privacyViolations, redactSnapshot,
} from '../command-center/agent-domain-redact.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ME = 'intern.self@example.com';
const STAFF = 'manager.person@example.com';

const entry = (endpoint, body, status = 200) => ({ endpoint, method: 'GET', fetched_at: '2026-11-02T19:00:00Z', http_status: status, body });
const MINE_ROW = {
  domain_key: 'product_experience', student_project_id: 'sp-1', anchor_id: 'an-1', stage: 'build', entry_point: null,
  manager_identity_id: 'om-9', manager_email: STAFF, manager_can_reach: false,
  manager_blocker: 'Pat Example has no admin login', intended_builder_state: null,
  agent_id: null, agent_display_name: null, agent_enabled: null, agent_autonomy_level: null,
  agent_autonomy_level_set_at: null, agent_autonomy_level_source: null, agent_tools_granted: null,
  agent_tools_granted_count: null, releases: 2, stories: 30, stories_verified: 0, build_authorizations: 0,
};
const REQUEST = {
  id: 'cr-1', kind: 'tool', domain_key: 'product_experience', title: 'Request repo_read', description: 'Needed for R1',
  status: 'declined', requested_by_identity: ME, requested_at: '2026-11-01T15:00:00Z',
  approved_by_identity: STAFF, approved_at: '2026-11-02T15:00:00Z', declined_reason: `Ask ${STAFF} first`,
};
const raw = () => ({
  schema: SNAPSHOT_SCHEMA, captured_at: '2026-11-02T19:00:00Z',
  snapshots: [
    entry(ENDPOINTS.mine, { summary: { domains: 1 }, domains: [{ ...MINE_ROW }], not_recorded: [{ field: 'agent.autonomy_level_set_by', reason: 'no column' }] }),
    entry(ENDPOINTS.requests, { change_requests: [{ ...REQUEST }] }),
    entry(ENDPOINTS.domain, { accountable_human: { name: 'Pat Example', email: STAFF } }),
    entry(ENDPOINTS.coverage, { rows: [] }),
  ],
});

test('a raw capture fails the commit gate: emails, unapproved endpoints and identities are all caught', () => {
  const problems = privacyViolations(raw()).map((p) => p.problem);
  assert.ok(problems.includes('email address'));
  assert.ok(problems.some((p) => p.startsWith('endpoint not approved')));
  assert.ok(problems.includes('identity not withheld'));
  assert.ok(problems.includes('field not on the allow-list'));
});

test('after redaction the gate is clean and no email survives anywhere', () => {
  const { snapshot } = redactSnapshot(raw(), { selfEmails: [ME] });
  assert.deepEqual(privacyViolations(snapshot), []);
  assert.deepEqual(findEmails(snapshot), []);
  assert.doesNotMatch(JSON.stringify(snapshot), /Pat Example|example\.com/);
});

test('only the two endpoints Ali approved are kept; the others are dropped and reported', () => {
  assert.deepEqual(APPROVED_ENDPOINTS, [ENDPOINTS.mine, ENDPOINTS.requests]);
  const { snapshot, report } = redactSnapshot(raw(), { selfEmails: [ME] });
  assert.deepEqual(snapshot.snapshots.map((s) => s.endpoint), [ENDPOINTS.mine, ENDPOINTS.requests]);
  assert.deepEqual(report.dropped_endpoints, [ENDPOINTS.domain, ENDPOINTS.coverage]);
});

test('Panel 1: manager identity, email, blocker text and record ids are dropped; agent fields are kept', () => {
  const { snapshot, report } = redactSnapshot(raw(), { selfEmails: [ME] });
  const row = snapshot.snapshots[0].body.domains[0];
  for (const k of ['manager_email', 'manager_identity_id', 'manager_blocker', 'student_project_id', 'anchor_id']) {
    assert.equal(Object.hasOwn(row, k), false, k);
    assert.ok(report.dropped_keys.some((p) => p.endsWith(`.${k}`)), k);
  }
  assert.equal(row.agent_id, null);
  assert.equal(row.manager_can_reach, false);
  assert.equal(row.stories, 30);
  assert.deepEqual(snapshot.snapshots[0].body.not_recorded, [{ field: 'agent.autonomy_level_set_by', reason: 'no column' }]);
});

test('Panel 5: your own identity becomes "you"; staff identities are withheld, never named or given a role', () => {
  const { snapshot, report } = redactSnapshot(raw(), { selfEmails: [ME.toUpperCase()] });
  const r = snapshot.snapshots[1].body.change_requests[0];
  assert.equal(r.requested_by_identity, SELF);
  assert.equal(r.approved_by_identity, WITHHELD);
  assert.equal(r.declined_reason, `Ask ${WITHHELD} first`);
  assert.equal(r.status, 'declined');
  assert.equal(r.approved_at, '2026-11-02T15:00:00Z');
  // Free text is kept only after a person reads it: it is listed for review.
  for (const k of ['title', 'description', 'declined_reason']) assert.ok(report.review_text.some((p) => p.endsWith(`.${k}`)), k);
});

test('with no self address given, even your own identity is withheld', () => {
  const { snapshot } = redactSnapshot(raw());
  assert.equal(snapshot.snapshots[1].body.change_requests[0].requested_by_identity, WITHHELD);
});

test('a field the platform adds later is withheld by default, not published by default', () => {
  const r = raw();
  r.snapshots[1].body.change_requests[0].requester_full_name = 'Pat Example';
  r.snapshots[1].body.reviewer = { name: 'Pat Example' };
  const { snapshot } = redactSnapshot(r, { selfEmails: [ME] });
  assert.doesNotMatch(JSON.stringify(snapshot), /Pat Example/);
  assert.deepEqual(privacyViolations(snapshot), []);
});

test('if redaction leaves a panel with nothing to show, the report says so (stop and ask Ali)', () => {
  const r = raw();
  r.snapshots[1].body.change_requests = [{ id: 'cr-2', kind: 'tool', requested_by_identity: STAFF, approved_by_identity: STAFF }];
  assert.deepEqual(redactSnapshot(r, { selfEmails: [ME] }).report.emptied, ['snapshots[1].body']);
  assert.deepEqual(redactSnapshot(raw(), { selfEmails: [ME] }).report.emptied, []);
});

test('refused and failed reads keep their state, with any email removed from the message', () => {
  const r = { schema: SNAPSHOT_SCHEMA, snapshots: [
    entry(ENDPOINTS.requests, { error: `Not permitted for ${ME}` }, 403),
    { endpoint: ENDPOINTS.mine, method: 'GET', fetched_at: null, http_status: null, body: null, error: 'timeout' }] };
  const { snapshot } = redactSnapshot(r, { selfEmails: [ME] });
  assert.equal(snapshot.snapshots[0].http_status, 403);
  assert.equal(snapshot.snapshots[0].body.error, `Not permitted for ${WITHHELD}`);
  assert.equal(snapshot.snapshots[1].error, 'timeout');
  assert.deepEqual(privacyViolations(snapshot), []);
});

test('redacting twice gives the same file (idempotent)', () => {
  const once = redactSnapshot(raw(), { selfEmails: [ME] }).snapshot;
  assert.deepEqual(redactSnapshot(once, { selfEmails: [ME] }).snapshot, once);
});

test('the redacted file still reads as a valid snapshot, and Panel 5 still sorts tool from change requests', () => {
  const { snapshot } = redactSnapshot(raw(), { selfEmails: [ME] });
  const read = readSnapshot(snapshot);
  assert.equal(read.status, 'captured');
  assert.equal(read.endpoints.mine.state, 'ok');
  assert.equal(read.endpoints.domain.state, 'not_captured');
  const g = requestGroups(read.endpoints.requests);
  assert.equal(g.tool.length, 1);
  assert.equal(g.change.length, 0);
});

test('request ids are dropped: Panel 5 never shows them and each one keys a row holding emails', () => {
  const { snapshot, report } = redactSnapshot(raw(), { selfEmails: [ME] });
  assert.equal(Object.hasOwn(snapshot.snapshots[1].body.change_requests[0], 'id'), false);
  assert.ok(report.dropped_keys.includes('snapshots[1].body.change_requests[0].id'));
  const leaked = structuredClone(snapshot);
  leaked.snapshots[1].body.change_requests[0].id = 'cr-1';
  assert.ok(privacyViolations(leaked).some((p) => p.path.endsWith('.id') && p.problem === 'field not on the allow-list'));
});

test('agent_id is kept only as present or absent: Panel 1 needs existence, not the record key', () => {
  const r = raw();
  r.snapshots[0].body.domains[0].agent_id = '9f1c2d3e-0000-4000-8000-000000000001';
  const { snapshot } = redactSnapshot(r, { selfEmails: [ME] });
  assert.equal(snapshot.snapshots[0].body.domains[0].agent_id, PRESENT);
  assert.doesNotMatch(JSON.stringify(snapshot), /9f1c2d3e/);
  assert.equal(redactSnapshot(raw(), { selfEmails: [ME] }).snapshot.snapshots[0].body.domains[0].agent_id, null);
  const leaked = structuredClone(snapshot);
  leaked.snapshots[0].body.domains[0].agent_id = '9f1c2d3e';
  assert.ok(privacyViolations(leaked).some((p) => p.problem === 'record id not reduced to presence'));
  // The panel still tells "agent exists" from "no agent": PRESENT is a recorded value, null is no_agent.
  const fields = employeeView(readSnapshot(snapshot).endpoints).fields;
  assert.equal(fields.find((f) => f.key === 'agent_enabled').state, 'recorded');
});

// ---- The gate on what is actually in git ----

test('commit gate: every snapshot file tracked or staged in git passes the privacy check', async () => {
  const tracked = execFileSync('git', ['ls-files', '--', 'command-center/snapshots', '.colaberry/agent-domain.json'],
    { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  for (const file of tracked) {
    const json = JSON.parse(await readFile(path.join(ROOT, file), 'utf8'));
    assert.deepEqual(findEmails(json), [], `${file} contains an email address`);
    if (json.schema === SNAPSHOT_SCHEMA) assert.deepEqual(privacyViolations(json), [], `${file} fails the privacy check`);
  }
});

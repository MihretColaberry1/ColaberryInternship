// Tests for draft guardrails: SAFE requirements written in this repo but not (yet) in the platform plan.
// Run from the repository root: node --test tests/command-center-drafts.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { DRAFTS_FILE, loadDraftGuardrails, loadProjectData } from '../command-center/data.js';
import { buildOverviewModel } from '../command-center/model.js';
import { draftGuardrailStatus } from '../command-center/model-tabs.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOW = new Date('2026-10-30T12:00:00Z');
const TOKEN = 'product_experience.CAP.design_token_drift_audit';
const CONTRAST = 'product_experience.CAP.color_contrast_regression_check';

function diskFetch() {
  return async (url) => {
    try {
      const text = await readFile(path.join(ROOT, url), 'utf8');
      return { ok: true, status: 200, json: async () => JSON.parse(text) };
    } catch (err) {
      if (err.code === 'ENOENT') return { ok: false, status: 404, json: async () => null };
      throw err;
    }
  };
}

async function realDrafts() {
  const data = await loadProjectData({ fetchImpl: diskFetch() });
  const model = buildOverviewModel(data, NOW);
  return { data, statuses: draftGuardrailStatus(data.drafts.items, data.plan, data.progress, model.rows) };
}

const draft = (extra = {}) => ({
  id: 'REQ-T', kind: 'SAFE', statement: 'Test statement.', stories: ['S1'],
  sources: ['docs/x.md'], enforcement: [{ check: 'a check', test: null }], ...extra,
});
const emptyPlan = { requirements: [], derived: { guardrails: [] } };
const progressWith = (criteriaPassed, state) => ({
  stories: [{ id: 'S1', criteria: [{ text: 'c', passed: criteriaPassed }], verification: state ? { state } : null }],
});
const rowsWith = (state) => [{ id: 'S1', title: 'Story one', state }];

// ---- Real data: REQ-001 is a draft and nothing more ----

test('real drafts file holds REQ-001 as a SAFE draft linked to the two stories', async () => {
  const { data } = await realDrafts();
  assert.equal(data.drafts.error, null);
  const [d] = data.drafts.items;
  assert.equal(d.id, 'REQ-001');
  assert.equal(d.kind, 'SAFE');
  assert.equal(d.priority, 'must');
  assert.equal(d.cluster, 'design-system governance');
  assert.equal(d.statement, 'The agent may report that the product does not match the design system, but only a human decides what the design system is.');
  assert.deepEqual(d.stories, [TOKEN, CONTRAST]);
});

test('real REQ-001: only "draft documented" is done; every other status is pending', async () => {
  const { statuses } = await realDrafts();
  const [g] = statuses;
  assert.equal(g.documented.status, 'done');
  assert.equal(g.registered.status, 'pending');
  assert.equal(g.signoff.status, 'pending');
  assert.equal(g.enforcement.status, 'pending');
  assert.equal(g.verification.status, 'pending');
});

test('real REQ-001: both linked stories exist in the platform plan', async () => {
  const { statuses } = await realDrafts();
  assert.deepEqual(statuses[0].stories.map((s) => s.inPlan), [true, true]);
});

test('the drafts file itself carries no status, approval or verification claim', async () => {
  const raw = JSON.parse(await readFile(path.join(ROOT, DRAFTS_FILE), 'utf8'));
  const claimKeys = /^(status|registered|approved|signed_off|signoff|enforced|verified|passed|kept)$/i;
  for (const d of raw.drafts) {
    assert.deepEqual(Object.keys(d).filter((k) => claimKeys.test(k)), [], `${d.id} claims its own status`);
  }
});

// ---- Statuses come from evidence files, never from the draft ----

test('a draft that claims its own statuses is still reported as pending', () => {
  const claiming = draft({ registered: true, approved: true, verified: true, status: 'kept' });
  const [g] = draftGuardrailStatus([claiming], emptyPlan, progressWith(false, null), rowsWith('not_started'));
  assert.equal(g.registered.status, 'pending');
  assert.equal(g.signoff.status, 'pending');
  assert.equal(g.verification.status, 'pending');
});

test('registered only when plan.json has the id typed SAFE and listed in derived.guardrails', () => {
  const req = { id: 'REQ-T', kind: 'SAFE', statement: 'Test statement.', fulfilled_by: ['S1'] };
  const onlyReq = { requirements: [req], derived: { guardrails: [] } };
  const both = { requirements: [req], derived: { guardrails: [{ id: 'REQ-T', statement: 'Test statement.' }] } };
  const status = (plan) => draftGuardrailStatus([draft()], plan, progressWith(false, null), rowsWith(null))[0].registered.status;
  assert.equal(status(emptyPlan), 'pending');
  assert.equal(status(onlyReq), 'pending');
  assert.equal(status(both), 'done');
});

test('a plan requirement with the same id but a different kind or statement is a conflict', () => {
  const plan = (kind, statement) => ({ requirements: [{ id: 'REQ-T', kind, statement }], derived: { guardrails: [] } });
  const status = (p) => draftGuardrailStatus([draft()], p, progressWith(false, null), rowsWith(null))[0].registered.status;
  assert.equal(status(plan('FUNC', 'Test statement.')), 'conflict');
  assert.equal(status(plan('SAFE', 'Something else.')), 'conflict');
});

test('R0 sign-off is done only when every criterion of every linked story is confirmed in progress.json', () => {
  const status = (progress) => draftGuardrailStatus([draft()], emptyPlan, progress, rowsWith(null))[0].signoff.status;
  assert.equal(status(progressWith(false, null)), 'pending');
  assert.equal(status(progressWith(true, null)), 'done');
  assert.equal(status({ stories: [] }), 'pending'); // story missing from progress: not confirmed
});

test('enforcement is pending until every check names a test', () => {
  const status = (enforcement) => draftGuardrailStatus([draft({ enforcement })], emptyPlan, progressWith(false, null), rowsWith(null))[0].enforcement.status;
  assert.equal(status([]), 'pending');
  assert.equal(status([{ check: 'a', test: 'tests/a.test.mjs' }, { check: 'b', test: null }]), 'pending');
  assert.equal(status([{ check: 'a', test: 'tests/a.test.mjs' }]), 'done');
});

test('verification is done only when every linked story is verified', () => {
  const status = (rows) => draftGuardrailStatus([draft({ stories: ['S1', 'S2'] })], emptyPlan, progressWith(true, null), rows)[0].verification.status;
  assert.equal(status([{ id: 'S1', state: 'verified' }, { id: 'S2', state: 'submitted' }]), 'pending');
  assert.equal(status([{ id: 'S1', state: 'verified' }, { id: 'S2', state: 'verified' }]), 'done');
});

test('a draft with no sources is not counted as documented', () => {
  const [g] = draftGuardrailStatus([draft({ sources: [] })], emptyPlan, progressWith(false, null), rowsWith(null));
  assert.equal(g.documented.status, 'pending');
});

test('a draft linking a story the plan does not have marks that story as not in plan', () => {
  const [g] = draftGuardrailStatus([draft({ stories: ['NOPE'] })], { stories: [], ...emptyPlan }, { stories: [] }, []);
  assert.equal(g.stories[0].inPlan, false);
  assert.equal(g.verification.status, 'pending');
});

// ---- Drafts file: failure paths ----

test('a missing drafts file means no drafts, not an error', async () => {
  const drafts = await loadDraftGuardrails({ fetchImpl: async () => ({ ok: false, status: 404, json: async () => null }) });
  assert.deepEqual(drafts, { items: [], error: null });
});

test('a broken drafts file is reported, not silently ignored', async () => {
  const bad = await loadDraftGuardrails({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('x'); } }) });
  assert.match(bad.error, /not valid JSON/);
  const wrongShape = await loadDraftGuardrails({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({}) }) });
  assert.match(wrongShape.error, /no "drafts" list/);
});

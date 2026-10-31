// Tests for the logic behind the eight tabs after Overview, and the Knowledge base question panel.
// Run from the repository root: node --test tests/command-center-tabs.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { loadNotes, loadProjectData } from '../command-center/data.js';
import { buildOverviewModel } from '../command-center/model.js';
import {
  agentRoster, dataEntities, dayDiff, guardrailStatus, rolesWithStories, taskList, timeline, traceability,
} from '../command-center/model-tabs.js';
import { CANNOT_ANSWER, answerQuestion } from '../command-center/qa.js';
import { makeSampleData } from '../command-center/sample.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOW = new Date('2026-10-28T12:00:00Z');

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

async function realContext() {
  const data = await loadProjectData({ fetchImpl: diskFetch() });
  return { data, model: buildOverviewModel(data, NOW) };
}

function sampleContext() {
  const data = makeSampleData(NOW);
  return { data, model: buildOverviewModel(data, NOW) };
}

// ---- Real data: empty plan sections stay empty ----

test('real plan: no guardrails, measures, roles, systems or requirements are invented', async () => {
  const { data, model } = await realContext();
  assert.deepEqual(guardrailStatus(data.plan, model.rows), []);
  assert.deepEqual(rolesWithStories(data.plan), []);
  assert.deepEqual(traceability(data.plan, model.rows), []);
  assert.deepEqual(data.plan.derived.measures, []);
  assert.deepEqual(data.plan.derived.systems, []);
});

test('real plan: with no scoped agents, the roster shows story owners, not agents', async () => {
  const { data, model } = await realContext();
  const roster = agentRoster(data.plan, model.rows);
  assert.equal(roster.kind, 'owners');
  assert.deepEqual(roster.items.map((i) => i.name), ['Unassigned']);
  assert.equal(roster.items[0].owns.length, data.plan.stories.length);
  assert.deepEqual(roster.items[0].skills, []);
});

test('real notes file loads as an empty notebook', async () => {
  const { data } = await realContext();
  assert.deepEqual(data.notes, { items: [], error: null });
});

// ---- Notes: failure paths ----

test('a missing notes file is an empty notebook, not an error', async () => {
  const notes = await loadNotes({ fetchImpl: async () => ({ ok: false, status: 404, json: async () => null }) });
  assert.deepEqual(notes, { items: [], error: null });
});

test('a broken notes file is reported, not silently ignored', async () => {
  const bad = await loadNotes({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('x'); } }) });
  assert.match(bad.error, /not valid JSON/);
  const wrongShape = await loadNotes({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({}) }) });
  assert.match(wrongShape.error, /no "notes" list/);
});

// ---- Unknown is never shown as confirmed ----

test('a guardrail is "kept" only when every covering story is verified', () => {
  const { data, model } = sampleContext();
  const [g] = guardrailStatus(data.plan, model.rows);
  assert.equal(g.id, 'SAMPLE-REQ-2');
  assert.equal(g.status, 'not-kept'); // SAMPLE-3 has no verification
});

test('a guardrail with no story is reported as unenforced', () => {
  const plan = { requirements: [{ id: 'S1', fulfilled_by: [] }], derived: { guardrails: [{ id: 'S1', statement: 'x' }] } };
  assert.equal(guardrailStatus(plan, [])[0].status, 'no-story');
});

test('traceability flags a "must" with no story as a gap and never as built', () => {
  const { data, model } = sampleContext();
  const t = traceability(data.plan, model.rows);
  const gap = t.find((r) => r.id === 'SAMPLE-REQ-4');
  assert.equal(gap.gap, true);
  assert.equal(gap.built, false);
  assert.equal(t.find((r) => r.id === 'SAMPLE-REQ-1').built, true);
});

// ---- Project management ----

test('task list shows how far a due date moved and flags past-due unverified work', () => {
  const rows = [
    { id: 'A', dueOn: '2026-09-20', dueBaselineOn: '2026-10-20', state: 'in_progress' },
    { id: 'B', dueOn: '2026-09-20', dueBaselineOn: '2026-09-20', state: 'verified' },
    { id: 'C', dueOn: null, dueBaselineOn: null, state: null },
  ];
  const [a, b, c] = taskList(rows, '2026-10-28');
  assert.equal(a.shiftDays, -30);
  assert.equal(a.pastDue, true);
  assert.equal(b.pastDue, false);
  assert.equal(c.shiftDays, null);
  assert.equal(c.pastDue, false);
});

test('timeline places releases and markers only from dates the plan holds', async () => {
  const { data, model } = await realContext();
  const tl = timeline(data.plan, model.rows, '2026-10-28');
  assert.equal(tl.start, '2026-09-20');
  assert.equal(tl.end, '2026-10-28');
  assert.equal(tl.releases.length, data.plan.releases.length);
  assert.deepEqual(tl.markers.map((m) => m.label), ['Demo day', 'Today']);
  assert.equal(timeline({ releases: [], schedule: null }, [], null), null);
  assert.equal(dayDiff('2026-09-20', '2026-09-27'), 7);
});

// ---- Data model ----

test('data model counts come from the files', async () => {
  const { data } = await realContext();
  const byName = Object.fromEntries(dataEntities(data.plan, data.progress).map((e) => [e.name, e.count]));
  assert.equal(byName.Story, data.plan.stories.length);
  assert.equal(byName['Story progress'], data.progress.stories.length);
  assert.equal(byName.Requirement, 0);
});

// ---- Knowledge base question panel ----

test('questions are answered from the files and name their source tab', async () => {
  const ctx = await realContext();
  const verified = answerQuestion('How many stories are verified?', ctx);
  assert.equal(verified.answer, `${ctx.data.progress.totals.stories_verified} of ${ctx.data.progress.totals.stories_total} stories verified.`);
  assert.equal(verified.source.tab, 'Overview');
  assert.match(answerQuestion('Any guardrails?', ctx).answer, /no guardrails yet/);
  assert.equal(answerQuestion('Any guardrails?', ctx).source.tab, 'Guardrails');
});

test('a question about one story answers from that story', async () => {
  const ctx = await realContext();
  const a = answerQuestion('What is the state of product_experience.LEGACY-MIGRATION-PLAN?', ctx);
  assert.match(a.answer, /LEGACY-MIGRATION-PLAN is verified/);
  assert.equal(a.source.tab, 'Project management');
});

test('a question the data cannot answer says so instead of guessing', async () => {
  const ctx = await realContext();
  assert.deepEqual(answerQuestion('What is the weather in Dallas?', ctx), { answer: CANNOT_ANSWER, source: null });
  assert.equal(answerQuestion('   ', ctx).source, null);
});

test('sample data fills every tab and stays marked as sample', () => {
  const { data, model } = sampleContext();
  assert.equal(model.isSample, true);
  assert.ok(data.plan.derived.measures.length && data.plan.derived.guardrails.length);
  assert.ok(data.plan.derived.systems.length && data.plan.derived.roles.length && data.plan.agents.length);
  assert.ok(data.plan.requirements.every((r) => r.statement.startsWith('Sample')));
  assert.equal(rolesWithStories(data.plan)[0].stories.length, 3);
});

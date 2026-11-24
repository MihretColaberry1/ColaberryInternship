// Tests for the project-plan logic the six panels carry over from the old tabs (README, "Content inventory").
// Run from the repository root: node --test tests/command-center-tabs.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { loadNotes, loadProjectData } from '../command-center/data.js';
import { buildOverviewModel } from '../command-center/model.js';
import {
  dayDiff, guardrailStatus, rolesWithStories, taskList, timeline, traceability,
} from '../command-center/model-tabs.js';

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


// ---- Real data: empty plan sections stay empty ----

test('real plan: no guardrails, measures, roles, systems or requirements are invented', async () => {
  const { data, model } = await realContext();
  assert.deepEqual(guardrailStatus(data.plan, model.rows), []);
  assert.deepEqual(rolesWithStories(data.plan), []);
  assert.deepEqual(traceability(data.plan, model.rows), []);
  assert.deepEqual(data.plan.derived.measures, []);
  assert.deepEqual(data.plan.derived.systems, []);
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

// A tiny plan, written inline for these tests only (the Sample mode generator was removed on 2026-11-03).
const PLAN = {
  requirements: [
    { id: 'R-1', statement: 'Show a weekly report.', kind: 'FUNC', priority: 'must', fulfilled_by: ['S-1'] },
    { id: 'R-2', statement: 'Never send a report without review.', kind: 'SAFE', priority: 'must', fulfilled_by: ['S-1', 'S-3'] },
    { id: 'R-3', statement: 'A must-have nothing covers yet.', kind: 'FUNC', priority: 'must', fulfilled_by: [] },
  ],
  derived: { guardrails: [{ id: 'R-2', statement: 'Never send a report without review.' }] },
};
const ROWS = [{ id: 'S-1', title: 'One', state: 'verified' }, { id: 'S-3', title: 'Three', state: null }];

test('a guardrail is "kept" only when every covering story is verified', () => {
  const [g] = guardrailStatus(PLAN, ROWS);
  assert.equal(g.id, 'R-2');
  assert.equal(g.status, 'not-kept'); // S-3 has no verification
  assert.equal(guardrailStatus(PLAN, ROWS.map((r) => ({ ...r, state: 'verified' })))[0].status, 'kept');
});

test('a guardrail with no story is reported as unenforced', () => {
  const plan = { requirements: [{ id: 'S1', fulfilled_by: [] }], derived: { guardrails: [{ id: 'S1', statement: 'x' }] } };
  assert.equal(guardrailStatus(plan, [])[0].status, 'no-story');
});

test('traceability flags a "must" with no story as a gap and never as built', () => {
  const t = traceability(PLAN, ROWS);
  const gap = t.find((r) => r.id === 'R-3');
  assert.equal(gap.gap, true);
  assert.equal(gap.built, false);
  assert.equal(t.find((r) => r.id === 'R-1').built, true);
  assert.equal(t.find((r) => r.id === 'R-2').built, false);
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
  const today = '2026-10-28';
  const tl = timeline(data.plan, model.rows, today);
  // The expected range comes from the dates the plan file holds, gathered here directly from the plan
  // (releases, demo day, every story's due dates) plus today. The platform re-syncs the plan and moves
  // these dates (2026-11-23), so a hard-coded day would break on its next sync rather than on a bug.
  const planDates = [
    ...data.plan.releases.flatMap((r) => [r.starts_on, r.ends_on]),
    data.plan.schedule?.demo_day,
    ...data.plan.stories.flatMap((s) => [s.due_on, s.due_baseline_on]),
    today,
  ].filter(Boolean).sort();
  assert.ok(planDates.length > 1, 'the plan holds dates to place');
  assert.equal(tl.start, planDates[0]);
  assert.equal(tl.end, planDates[planDates.length - 1]);
  for (const r of tl.releases.filter((x) => x.start && x.end)) {
    assert.ok(r.start >= tl.start && r.end <= tl.end, `${r.key} sits inside the timeline`);
    assert.ok(r.left >= 0 && r.left + r.width <= 100.0001, `${r.key} is drawn inside the track`);
  }
  assert.equal(tl.releases.length, data.plan.releases.length);
  assert.deepEqual(tl.markers.map((m) => m.label), ['Demo day', 'Today']);
  assert.equal(timeline({ releases: [], schedule: null }, [], null), null);
  assert.equal(dayDiff('2026-09-20', '2026-09-27'), 7);
});







// Tests for the Command Center's data loading and Overview model.
// Run from the repository root: node --test tests/command-center.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { loadJson, loadProjectData, checkShapes, DataLoadError } from '../command-center/data.js';
import { buildOverviewModel, describeFreshness, joinStories, summarizeSchedule } from '../command-center/model.js';
import { makeSampleData } from '../command-center/sample.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOUR = 60 * 60 * 1000;

// A fetch stand-in that serves files from this repository, like the local server does.
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

const jsonResponse = (body) => ({ ok: true, status: 200, json: async () => body });

// ---- Loading: happy path ----

test('loads the real .colaberry files and keeps the platform totals unchanged', async () => {
  const data = await loadProjectData({ fetchImpl: diskFetch() });
  const progress = JSON.parse(await readFile(path.join(ROOT, '.colaberry/progress.json'), 'utf8'));
  const model = buildOverviewModel(data, new Date());
  assert.equal(model.isSample, false);
  assert.deepEqual(model.totals, progress.totals);
  assert.equal(model.releases.length, data.plan.releases.length);
});

test('a network error is retried once and then succeeds', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) throw new TypeError('Failed to fetch');
    return jsonResponse({ ok: true });
  };
  assert.deepEqual(await loadJson('x.json', { fetchImpl }), { ok: true });
  assert.equal(calls, 2);
});

// ---- Loading: failure paths ----

test('a missing file fails with a named error and is not retried', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls += 1; return { ok: false, status: 404, json: async () => null }; };
  await assert.rejects(loadJson('.colaberry/plan.json', { fetchImpl }), (err) => {
    assert.ok(err instanceof DataLoadError);
    assert.match(err.message, /plan\.json.*HTTP 404/);
    return true;
  });
  assert.equal(calls, 1);
});

test('invalid JSON fails with a clear reason', async () => {
  const fetchImpl = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad'); } });
  await assert.rejects(loadJson('p.json', { fetchImpl }), /not valid JSON/);
});

test('a request that never answers times out, retries once, then fails', async () => {
  let calls = 0;
  const fetchImpl = (url, { signal }) => {
    calls += 1;
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    });
  };
  await assert.rejects(loadJson('slow.json', { fetchImpl, timeoutMs: 20, attempts: 2 }), /no answer within/);
  assert.equal(calls, 2);
});

test('a file missing a required field is rejected before anything renders', () => {
  const good = makeSampleData(new Date());
  assert.throws(() => checkShapes({ ...good, plan: { releases: [] } }), /"stories" to be a list/);
  assert.throws(() => checkShapes({ ...good, manifest: {} }), /"generated_at" to be a timestamp/);
});

// ---- Freshness stamp ----

test('fresh data shows an absolute Central time and a relative age, with no warning', () => {
  const now = new Date('2026-10-28T12:00:00Z');
  const f = describeFreshness('2026-10-28T10:00:00Z', now);
  assert.equal(f.level, 'fresh');
  assert.equal(f.warning, false);
  assert.equal(f.text, 'Data as of 28 October 2026, 5:00 AM CDT (2 hours ago)');
});

test('data older than a week warns and asks for a sync', () => {
  const now = new Date('2026-10-28T12:00:00Z');
  const f = describeFreshness('2026-10-18T12:00:00Z', now);
  assert.equal(f.level, 'stale');
  assert.equal(f.warning, true);
  assert.match(f.text, /10 days ago.*sync from the portal to refresh/);
});

test('an unreadable timestamp is reported as unknown, not as fresh', () => {
  const f = describeFreshness('not a date', new Date());
  assert.equal(f.level, 'unknown');
  assert.equal(f.warning, true);
});

// ---- Joining plan and progress ----

test('a story with no verification is "not checked", never zero', () => {
  const plan = { stories: [{ id: 'A', title: 'A', release: 'r0' }], releases: [] };
  const progress = { stories: [{ id: 'A', criteria: [{ text: 'c', passed: false }], verification: null }] };
  const [row] = joinStories(plan, progress);
  assert.equal(row.state, null);
  assert.equal(row.confirmedPassed, null);
  assert.equal(row.points, null);
});

test('a story only in progress.json (like STORY-000) is kept and flagged', () => {
  const plan = { stories: [{ id: 'A', release: 'r0' }], releases: [] };
  const progress = { stories: [{ id: 'A' }, { id: 'STORY-000', criteria: [] }] };
  const rows = joinStories(plan, progress);
  assert.deepEqual(rows.map((r) => [r.id, r.inPlan]), [['A', true], ['STORY-000', false]]);
});

test('removing a story from the plan removes it from the page model (nothing hard-coded)', async () => {
  const data = await loadProjectData({ fetchImpl: diskFetch() });
  const removed = data.plan.stories[0].id;
  const trimmed = { ...data, plan: { ...data.plan, stories: data.plan.stories.slice(1) },
    progress: { ...data.progress, stories: data.progress.stories.filter((s) => s.id !== removed) } };
  const ids = buildOverviewModel(trimmed, new Date()).rows.map((r) => r.id);
  assert.ok(!ids.includes(removed));
});

test('schedule dates before today are marked as past', () => {
  const plan = { schedule: { build_start: '2026-09-20', build_end: '2026-12-01', demo_day: null, prep: [] } };
  const s = summarizeSchedule(plan, new Date('2026-10-28T12:00:00Z'));
  assert.deepEqual(s.milestones.map((m) => m.isPast), [true, false, false]);
});

// ---- Sample mode ----

test('sample data is flagged as sample and has the same shape as real data', () => {
  const sample = makeSampleData(new Date());
  assert.doesNotThrow(() => checkShapes(sample));
  const model = buildOverviewModel(sample, new Date());
  assert.equal(model.isSample, true);
  assert.match(model.project.name, /Sample/);
});

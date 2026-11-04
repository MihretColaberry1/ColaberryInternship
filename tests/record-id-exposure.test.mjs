// No page shows an internal record id. The pinned research file carries a staff member's org_members
// record id inside its manager_has_no_admin_login blocker (and the platform-written plan.json carries
// it too). The page withholds it at display time; the source files are left exactly as the platform
// wrote them. This test renders every page a visitor can reach and fails on any UUID-shaped value.
// Run from the repository root: node --test tests/record-id-exposure.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom } from './fake-dom.mjs';
import { CAPABILITY_FILE, SNAPSHOT_FILE, SNAPSHOT_SCHEMA, loadAgentDomainData, readSnapshot } from '../command-center/agent-domain-data.js';
import { AUTONOMY_STAGES } from '../command-center/authority.js';
import { ENDPOINTS } from '../command-center/agent-domain-facts.js';
import { PRESENT, RECORD_ID_PATTERN, RECORD_ID_WITHHELD, withholdRecordIds } from '../command-center/agent-domain-redact.js';
import { loadProjectData } from '../command-center/data.js';
import { buildOverviewModel } from '../command-center/model.js';
import { renderRoute } from '../command-center/console.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANY_ID = () => new RegExp(RECORD_ID_PATTERN, 'g');

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

const AT = '2026-11-03T22:56:00Z';
const entry = (key, body) => ({ endpoint: ENDPOINTS[key], method: 'GET', fetched_at: AT, http_status: 200, body });
const captured = (agentId) => readSnapshot({ schema: SNAPSHOT_SCHEMA, captured_at: AT, snapshots: [
  entry('mine', { domains: [{ domain_key: 'product_experience', agent_id: agentId }] }), entry('requests', { change_requests: [] })] });

async function inputs() {
  const domain = { status: 'loaded', ...(await loadAgentDomainData({ fetchImpl: diskFetch })) };
  const data = await loadProjectData({ fetchImpl: diskFetch });
  const project = { status: 'loaded', data, model: buildOverviewModel(data, new Date('2026-11-03T18:00:00Z')), error: null };
  return { domain, project };
}

function pageText(parts, domain, project) {
  const remove = installFakeDom();
  try {
    return [renderRoute(parts, domain, project)].flat(Infinity).map((n) => (n == null ? '' : n.textContent ?? String(n))).join('');
  } finally { remove(); }
}

/** Every route a visitor can reach, as [label, route parts, domain]. */
async function everyPage() {
  const { domain, project } = await inputs();
  const matrix = JSON.parse(await readFile(path.join(ROOT, CAPABILITY_FILE), 'utf8'));
  const withAgent = { ...domain, snapshot: captured(PRESENT) };
  const noAgent = { ...domain, snapshot: captured(null) };
  return { project, pages: [
    ['console, not captured', [], domain],
    ['console, agent linked', [], withAgent],
    ['console, no agent linked', [], noAgent],
    ...matrix.capabilities.map((c) => [`capability ${c.capability_id}`, ['capability', c.capability_id], domain]),
    ...AUTONOMY_STAGES.map((s) => [`rung ${s}`, ['rung', s], domain]),
    ...['capture', 'requests', 'refresh'].map((g) => [`guide ${g}`, ['guide', g], domain]),
    ['story STORY-000', ['story', 'STORY-000'], domain],
  ] };
}

test('the helper withholds every UUID-shaped id, in any case, and nothing else', () => {
  const id = '0f1e2d3c-4b5a-4987-8a6b-5c4d3e2f1a0b';
  assert.equal(withholdRecordIds(`row (${id}) and ${id.toUpperCase()}`), `row (${RECORD_ID_WITHHELD}) and ${RECORD_ID_WITHHELD}`);
  assert.equal(withholdRecordIds('autonomy:R2, 4,492 hex literals, sha 9d9aa3c3'), 'autonomy:R2, 4,492 hex literals, sha 9d9aa3c3');
  // Idempotent: running it twice gives the same text.
  assert.equal(withholdRecordIds(withholdRecordIds(id)), RECORD_ID_WITHHELD);
});

test('the source file is unchanged: it still carries the id, so the withholding is display-only', async () => {
  const text = await readFile(path.join(ROOT, CAPABILITY_FILE), 'utf8');
  assert.ok((text.match(ANY_ID()) ?? []).length > 0, 'the pinned research file is expected to be untouched');
});

test('no page a visitor can reach shows a UUID-shaped record id', async () => {
  const { project, pages } = await everyPage();
  assert.equal(pages.length, 3 + 25 + 10 + 3 + 1);
  for (const [label, parts, domain] of pages) {
    const text = pageText(parts, domain, project);
    assert.ok(text.length > 200, `${label}: rendered something`);
    // The count only, never the value, so a failure does not print the id it found.
    assert.equal((text.match(ANY_ID()) ?? []).length, 0, `${label}: shows a record id`);
  }
});

test('capability pages say the id is withheld, and keep the rest of the blocker', async () => {
  const { domain, project } = await inputs();
  const matrix = JSON.parse(await readFile(path.join(ROOT, CAPABILITY_FILE), 'utf8'));
  for (const c of matrix.capabilities.filter((x) => x.blocked_by?.some((b) => ANY_ID().test(b)))) {
    const text = pageText(['capability', c.capability_id], domain, project);
    assert.ok(text.includes(`org_members row (${RECORD_ID_WITHHELD})`), c.capability_id);
    assert.match(text, /manager_has_no_admin_login/, c.capability_id);
  }
});

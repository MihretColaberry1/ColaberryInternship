// Every page a visitor can reach shows no personal name, email address or internal record id
// (Mihret's privacy corrections, 2026-11-10: D4, then Panels 3 to 5 and the capture guide).
//
// The accountable manager's name is read from the pinned file (`accountable_human`), so this test does
// not spell it out. The platform owner's surname is listed below: it appeared in the capture guide and
// must not come back. Neutral role words ("the accountable manager", "the platform owner") are expected.
// Run from the repository root: node --test tests/public-privacy.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll, hasClass } from './fake-dom.mjs';
import { CAPABILITY_FILE, SNAPSHOT_FILE, loadAgentDomainData } from '../command-center/agent-domain-data.js';
import { AUTONOMY_STAGES } from '../command-center/authority.js';
import { loadProjectData } from '../command-center/data.js';
import { buildOverviewModel } from '../command-center/model.js';
import { renderConsole, renderRoute } from '../command-center/console.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OTHER_STAFF_SURNAMES = ['Muwwakkil'];
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
const ACCOUNT_STATE = /org_members|manager_has_no_admin_login|mgmt_role/;

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

async function everyPage() {
  const domain = { status: 'loaded', ...(await loadAgentDomainData({ fetchImpl: diskFetch })) };
  const data = await loadProjectData({ fetchImpl: diskFetch });
  const project = { status: 'loaded', data, model: buildOverviewModel(data, new Date('2026-11-10T18:00:00Z')), error: null };
  const remove = installFakeDom();
  try {
    const text = (nodes) => [].concat(nodes).filter(Boolean).map((n) => (typeof n === 'string' ? n : n.textContent)).join(' ');
    const pages = [];
    for (const p of findAll(renderConsole(domain, project), hasClass('panel'))) pages.push([`panel ${p.getAttribute('data-panel')}`, p.textContent]);
    for (const c of domain.source.matrix.capabilities) pages.push([`capability ${c.capability_id}`, text(renderRoute(['capability', c.capability_id], domain, project))]);
    for (const s of AUTONOMY_STAGES) pages.push([`rung ${s}`, text(renderRoute(['rung', s], domain, project))]);
    for (const r of project.model.rows) pages.push([`story ${r.id}`, text(renderRoute(['story', r.id], domain, project))]);
    for (const g of ['capture', 'requests', 'refresh']) pages.push([`guide ${g}`, text(renderRoute(['guide', g], domain, project))]);
    return pages;
  } finally { remove(); }
}

const managerTokens = async () => {
  const name = JSON.parse(await readFile(path.join(ROOT, CAPABILITY_FILE), 'utf8')).accountable_human;
  return [name, name.split(/\s+/).pop()];
};

test('no reachable page names the accountable manager or other staff', async () => {
  const pages = await everyPage();
  assert.equal(pages.length, 6 + 25 + 10 + 32 + 3, 'every panel and every detail page is checked');
  const tokens = [...(await managerTokens()), ...OTHER_STAFF_SURNAMES];
  for (const [label, t] of pages) {
    assert.ok(t.length > 100, `${label}: rendered something`);
    // The count only, never the matched text, so a failure does not print the name it found.
    const hits = tokens.filter((n) => new RegExp(`\\b${n}\\b`).test(t)).length;
    assert.equal(hits, 0, `${label}: shows a personal name`);
  }
});

test('no reachable page shows an email address, a record id or a person\'s account-state records', async () => {
  for (const [label, t] of await everyPage()) {
    assert.doesNotMatch(t, EMAIL, `${label}: email address`);
    assert.doesNotMatch(t, UUID, `${label}: record id`);
    assert.doesNotMatch(t, ACCOUNT_STATE, `${label}: account-state records`);
  }
});

test('the neutral role wording is what replaced the names', async () => {
  const pages = Object.fromEntries(await everyPage());
  assert.match(pages['panel governance'], /REQ-001: Accountable manager's R0 sign-off/);
  assert.match(pages['guide capture'], /the process stops and the platform owner is asked/);
  assert.match(pages['guide capture'], /the platform owner's direction, 2026-11-02/);
  assert.match(pages['rung autonomy:R0'], /The accountable manager signs off a written scope and exception list/);
  assert.match(pages['capability product_experience.manager_design_review_queue'], /and the accountable manager confirms he can use it/);
});

test('the capture guide keeps every technical instruction', async () => {
  const t = Object.fromEntries(await everyPage())['guide capture'];
  for (const s of ['Sign in to the portal yourself', 'Run the reviewed capture snippet (v4)', 'GET /api/admin/agent-domains-mine',
    'GET /api/admin/agent-domain-change-requests-mine', 'Save the downloaded file outside this repository', SNAPSHOT_FILE]) {
    assert.ok(t.includes(s), s);
  }
});

// Panels 1, 2 and 6 against the committed platform snapshot (Mihret's decisions D1 to D4, 2026-11-10).
//   D1: Panel 1 shows the brief's employee fields at a glance; registry and runs move to the details.
//   D2: Panel 2 keeps your ticks and the platform verifier apart; per-rung verifier records stay out.
//   D3: Panel 6 names ticks ahead of the verifier, and the snapshot's authority sections as a
//       data-integration limitation.
//   D4: no page these panels own shows the accountable manager's name or account-access records.
// Run from the repository root: node --test tests/panels-1-2-6.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll, hasClass } from './fake-dom.mjs';
import {
  CAPABILITY_FILE, PLATFORM_SYNC_FILE, SNAPSHOT_FILE, loadAgentDomainData, sectionsNotShown, verdictReasons,
} from '../command-center/agent-domain-data.js';
import { REGISTRY_ENTRY } from '../command-center/agent-domain-facts.js';
import {
  MANAGER_ACCESS_TEXT, accountableNames, isManagerAccessText, publicBlockerText, withholdNames,
} from '../command-center/agent-domain-redact.js';
import { isPerRungRecord, ticksAheadOfVerifier } from '../command-center/verification-model.js';
import { loadProjectData } from '../command-center/data.js';
import { buildOverviewModel } from '../command-center/model.js';
import { renderConsole, renderRoute } from '../command-center/console.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const ACCOUNT = /org_members|admin_users|mgmt_role|manager_has_no_admin_login/;

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

async function realInputs({ sync = true } = {}) {
  const fetchImpl = sync ? diskFetch
    : async (url) => (url === PLATFORM_SYNC_FILE ? { ok: false, status: 404, json: async () => null } : diskFetch(url));
  const domain = { status: 'loaded', ...(await loadAgentDomainData({ fetchImpl })) };
  const data = await loadProjectData({ fetchImpl: diskFetch });
  return { domain, project: { status: 'loaded', data, model: buildOverviewModel(data, new Date('2026-11-10T18:00:00Z')), error: null } };
}

/** Each panel's whole text, and its glance as label -> value text. */
function render(domain, project) {
  const remove = installFakeDom();
  try {
    const panels = findAll(renderConsole(domain, project), hasClass('panel'));
    const out = {};
    for (const p of panels) {
      const id = p.getAttribute('data-panel');
      const dl = findAll(p, hasClass('glance'))[0];
      const glance = {};
      if (dl) {
        const items = findAll(dl, (el) => el.tagName === 'DT' || el.tagName === 'DD');
        for (let i = 0; i < items.length; i += 2) glance[items[i].textContent] = items[i + 1].textContent;
      }
      out[id] = { text: p.textContent, glance };
    }
    return out;
  } finally { remove(); }
}

function pageText(parts, domain, project) {
  const remove = installFakeDom();
  try {
    return [].concat(renderRoute(parts, domain, project)).filter(Boolean).map((n) => (typeof n === 'string' ? n : n.textContent)).join(' ');
  } finally { remove(); }
}

const managerName = async () => JSON.parse(await readFile(path.join(ROOT, CAPABILITY_FILE), 'utf8')).accountable_human;

// ---- D4: the privacy helpers ----

test('withholdNames replaces the full name, the possessive and the surname, and capitalises at a sentence start', () => {
  const names = ['Pat Q Example'];
  assert.equal(withholdNames("Document Pat Q Example's role", names), "Document the accountable manager's role");
  assert.equal(withholdNames('Pat Q Example signs off the scope.', names), 'The accountable manager signs off the scope.');
  assert.equal(withholdNames('Agreed. Example confirms it.', names), 'Agreed. The accountable manager confirms it.');
  assert.equal(withholdNames('Examples are fine; Exampleton too.', names), 'Examples are fine; Exampleton too.', 'whole words only');
});

test('withholdNames with no name list returns null, so a caller falls back instead of guessing', () => {
  assert.equal(withholdNames('Pat Q Example signs off', []), null);
  assert.equal(withholdNames(null, ['Pat Q Example']), null);
});

test('accountableNames reads the name from the file, not from this code', () => {
  assert.deepEqual(accountableNames({ accountable_human: '  Pat Q Example ' }), ['Pat Q Example']);
  assert.deepEqual(accountableNames({}), []);
  assert.deepEqual(accountableNames(null), []);
});

test('a blocker about admin-portal account records becomes the neutral sentence; other blockers keep their meaning', () => {
  const access = 'manager_has_no_admin_login: Pat Q Example has an org_members row (11111111-2222-3333-4444-555555555555) but no admin_users row';
  assert.equal(isManagerAccessText(access), true);
  assert.equal(publicBlockerText(access, ['Pat Q Example']), MANAGER_ACCESS_TEXT);
  const other = 'no agreed allow-list exists; Pat Q Example decides it (id 11111111-2222-3333-4444-555555555555)';
  const shown = publicBlockerText(other, ['Pat Q Example']);
  assert.doesNotMatch(shown, /Pat|Example|11111111/);
  assert.match(shown, /no agreed allow-list exists; the accountable manager decides it/);
});

test('the registry blocker the panels show is the same neutral sentence', () => {
  assert.equal(REGISTRY_ENTRY.blocker, MANAGER_ACCESS_TEXT);
  assert.equal(MANAGER_ACCESS_TEXT, 'Accountable manager access: Not configured in the admin portal.');
});

// ---- D2 / D3: the verification model and the sync extras ----

test('ticksAheadOfVerifier keeps the two counts apart, and counts a missing verifier record as no record', () => {
  const rows = [
    { id: 'a', tickedPassed: 5, tickedTotal: 6, confirmedPassed: 0, confirmedTotal: 6, state: 'in_progress' },
    { id: 'b', tickedPassed: 3, tickedTotal: 3, confirmedPassed: 3, confirmedTotal: 3, state: 'verified' },
    { id: 'c', tickedPassed: 1, tickedTotal: 1, confirmedPassed: null, confirmedTotal: null, state: null },
    { id: 'd', tickedPassed: 0, tickedTotal: 1, confirmedPassed: null, confirmedTotal: null, state: null },
  ];
  assert.deepEqual(ticksAheadOfVerifier(rows), [
    { id: 'a', ticked: 5, tickedTotal: 6, confirmed: 0, confirmedTotal: 6, state: 'in_progress' },
    { id: 'c', ticked: 1, tickedTotal: 1, confirmed: null, confirmedTotal: null, state: null },
  ]);
  assert.deepEqual(ticksAheadOfVerifier([]), []);
});

test('verdictReasons keeps plan stories only, and only their reasons', () => {
  const out = verdictReasons({ stories: [
    { story_id: 'x.STORY-000', title: 'T', reasons: ['r1'], outstanding: ['criterion text'], commit_sha: null },
    { story_id: 'x.CAP.thing.autonomy:R0', reasons: ['rung reason'] },
    { story_id: 'x.RESEARCH-1', reasons: null },
  ] });
  assert.deepEqual(out, { 'x.STORY-000': ['r1'], 'x.RESEARCH-1': [] });
  assert.equal(isPerRungRecord('x.CAP.thing.autonomy:R4'), true);
  assert.equal(isPerRungRecord('x.STORY-000'), false);
  assert.deepEqual(verdictReasons(undefined), {});
});

test('sectionsNotShown names the authority sections by presence and size, never by value', () => {
  assert.deepEqual(sectionsNotShown({ authority: [{}, {}], authority_rule: { rule: 'r' } }),
    [{ section: 'authority[]', size: 2 }, { section: 'authority_rule', size: null }]);
  assert.deepEqual(sectionsNotShown({}), []);
});

// ---- D1: Panel 1 on the real snapshot ----

test('Panel 1 shows the brief\'s employee fields at a glance, exactly as the snapshot records them', async () => {
  const { domain, project } = await realInputs();
  const { employee } = render(domain, project);
  const g = employee.glance;
  assert.equal(g['Agent linked (platform sync)'], 'Yes, as the platform sync records');
  assert.equal(g['Agent name'], 'Maru');
  assert.equal(g.Enabled, 'No (disabled)');
  assert.match(g['Autonomy level'], /^observePer-agent scale; not a rung on the R0 to R9 ladder$/);
  assert.equal(g['Tools granted'], 'None: the platform sync records 0 tools granted');
  assert.equal(g['Autonomy last set'], '18 October 2026, 11:08 AM CDT, by default (auto)');
  assert.equal(g['Autonomy set by'], 'Not recorded by the platform');
});

test('Panel 1 moves the registry seed and runs out of the glance and into the details', async () => {
  const { domain, project } = await realInputs();
  const { employee } = render(domain, project);
  assert.equal('Agent in the platform registry' in employee.glance, false);
  assert.equal('Runs' in employee.glance, false);
  assert.ok(employee.text.includes(REGISTRY_ENTRY.agent_id_label), 'the stale-seed label is still on the panel');
  assert.match(employee.text, /Runs: None recorded; not checked from here/);
});

test('Panel 1 with nothing synced or captured shows no agent value at a glance, only "not captured"', async () => {
  const { domain, project } = await realInputs({ sync: false });
  const { employee } = render(domain, project);
  for (const label of ['Agent name', 'Enabled', 'Autonomy level', 'Autonomy last set']) {
    assert.equal(employee.glance[label], 'Not captured yet', label);
  }
  assert.doesNotMatch(employee.text, /Maru/);
});

// ---- D2: Panel 2 ----

test('Panel 2 keeps the 32 plan stories and STORY-000\'s six criteria apart, and your ticks apart from the verifier', async () => {
  const { domain, project } = await realInputs();
  const { inventory } = render(domain, project);
  assert.equal(inventory.glance['Verified by the platform'], '6 of 32 plan stories');
  assert.equal(inventory.glance['Ticks ahead of verifier'], 'STORY-000: 5 of 6 ticked locally; platform verifier 0 of 6');
  assert.match(inventory.text, /Your ticks \(progress\.json\)/);
  assert.match(inventory.text, /Platform verifier/);
  assert.match(inventory.text, /Not equivalent Your ticks are ahead of the platform verifier for STORY-000: 5 of 6 criteria ticked in progress\.json; the platform verifier records 0 of 6\. These are two different records\./);
  assert.doesNotMatch(inventory.text, /Criteria \(platform · your ticks\)/, 'no merged column');
});

test('Panel 2 leaves the verifier\'s per-rung records out', async () => {
  const { domain, project } = await realInputs();
  const { inventory } = render(domain, project);
  assert.doesNotMatch(inventory.text, /\.autonomy:R\d/);
});

// ---- D3: Panel 6 ----

test('Panel 6 names your ticks ahead of the verifier, with both numbers and the verifier\'s own reason', async () => {
  const { domain, project } = await realInputs();
  const { gaps } = render(domain, project);
  assert.match(gaps.text, /Your ticks are ahead of the platform verifier for product_experience\.STORY-000: 5 of 6 criteria ticked in progress\.json, but the platform verifier records 0 of 6\./);
  assert.match(gaps.text, /The verifier's reason, as of its last sync: /);
  assert.equal(gaps.glance['Ticks ahead of verifier'], '1 story');
});

test('Panel 6 names the authority sections as a data-integration limitation, not an agent failure, without their values', async () => {
  const { domain, project } = await realInputs();
  const { gaps } = render(domain, project);
  assert.match(gaps.text, /Outstanding data-integration limitation, not an agent failure: the platform snapshot already carries authority\[\] \(25 rows\) and authority_rule, but this console does not display them yet\./);
  assert.match(gaps.text, /^6What is not available.*8 things this console cannot show or cannot claim/);
  assert.doesNotMatch(gaps.text, /binds_nothing|approved_above_r2/, 'no value from the authority sections is read');
});

// ---- D4: what these panels and their pages show ----

test('Panels 1, 2 and 6 show no manager name, account records, email address or record id', async () => {
  const name = await managerName();
  const surname = name.split(/\s+/).pop();
  const { domain, project } = await realInputs();
  const panels = render(domain, project);
  for (const id of ['employee', 'inventory', 'gaps']) {
    const t = panels[id].text;
    assert.equal(t.includes(surname), false, `${id}: names the accountable manager`);
    assert.doesNotMatch(t, ACCOUNT, `${id}: shows account records`);
    assert.doesNotMatch(t, EMAIL, `${id}: shows an email address`);
    assert.doesNotMatch(t, UUID, `${id}: shows a record id`);
  }
  assert.ok(panels.gaps.text.includes(MANAGER_ACCESS_TEXT));
  assert.ok(panels.employee.text.includes(MANAGER_ACCESS_TEXT));
});

test('story pages reached from Panel 2 withhold the name; titles that named it now say "the accountable manager"', async () => {
  const name = await managerName();
  const surname = name.split(/\s+/).pop();
  const { domain, project } = await realInputs();
  for (const r of project.model.rows) {
    const t = pageText(['story', r.id], domain, project);
    assert.equal(t.includes(surname), false, r.id);
    assert.doesNotMatch(t, UUID, r.id);
  }
  assert.match(pageText(['story', 'product_experience.RESEARCH-3-ROLE-AND-DA-TRANSITION'], domain, project), /Document the accountable manager's role/);
});

test('a story page waits for the name list rather than showing the plan text unfiltered', async () => {
  const { project } = await realInputs();
  const t = pageText(['story', 'product_experience.RESEARCH-3-ROLE-AND-DA-TRANSITION'], { status: 'loading' }, project);
  assert.match(t, /Loading…/);
  assert.equal(t.includes((await managerName()).split(/\s+/).pop()), false);
});

/**
 * The "Blocked by" section of a capability page. Only this section is checked here: the page's
 * per-rung behaviour section shows release_behaviour[] (Panel 4's data), which this change does not touch.
 */
export const blockedBySection = (text) => {
  const start = text.indexOf('Blocked by');
  const end = text.indexOf('Tools it will need', start);
  return start < 0 ? '' : text.slice(start, end < 0 ? undefined : end);
};

test('capability pages show the neutral access sentence once, even where two access blockers are recorded', async () => {
  const { domain, project } = await realInputs();
  const t = blockedBySection(pageText(['capability', 'product_experience.manager_design_review_queue'], domain, project));
  assert.ok(t.length > 0, 'the page has a Blocked by section');
  assert.equal(t.split(MANAGER_ACCESS_TEXT).length - 1, 1);
  assert.doesNotMatch(t, ACCOUNT);
  assert.equal(t.includes((await managerName()).split(/\s+/).pop()), false);
});

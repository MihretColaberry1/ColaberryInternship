// Panel 5, the governance queue (criterion 5, and the platform owner's decisions of 2026-11-14):
//   - the whole Product Experience queue, from the platform's synced snapshot only: a personal capture of
//     the -mine route (only the capturer's own requests) is never used; the source is described as what it
//     is, not by the snapshot's -mine label; the 200-request limit is disclosed;
//   - submitted is the one pending status; approved, declined and withdrawn are terminal; any other
//     value is shown as recorded and labelled unrecognised, never guessed;
//   - the snapshot carries no person fields, so proposer and decision-maker read "Not included in the
//     platform snapshot"; any person a row does carry is withheld; free text loses emails, record ids and names;
//   - nothing states or implies that filing or deciding a request granted a tool or capability.
// Every case is platform-shaped: the real synced file with its governance section replaced.
// Run from the repository root: node --test tests/panel-governance.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll, hasClass } from './fake-dom.mjs';
import { CAPABILITY_FILE, PLATFORM_SYNC_FILE, combineEndpoints, readPlatformSync } from '../command-center/agent-domain-data.js';
import { ENDPOINTS, GOVERNANCE_SNAPSHOT, PANEL_ENDPOINTS, REQUEST_GRANTS_NOTHING, REQUEST_STATUSES } from '../command-center/agent-domain-facts.js';
import { requestStatus } from '../command-center/agent-domain-model.js';
import { WITHHELD, accountableNames } from '../command-center/agent-domain-redact.js';
import { consoleInputs, renderPanels } from '../command-center/console.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (f) => JSON.parse(await readFile(path.join(ROOT, f), 'utf8'));
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
const RECORD = '5f0c1a2b-1111-4222-8333-944445555666';
const notCaptured = () => Object.fromEntries(Object.keys(ENDPOINTS).map((k) => [k, { state: 'not_captured' }]));

/**
 * Panel 5 rendered from the real synced file with `governance` (and optionally `sources`) replaced.
 * `capture` is a personal capture of the -mine route, as a captured endpoint state; `synced: false` drops the sync.
 */
async function panelWith(governance, { sources, capture, synced = true } = {}) {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const sync = synced
    ? readPlatformSync({ ...json, governance: { ...json.governance, ...governance }, ...(sources ? { sources } : {}) }, '2026-11-14T22:12:18.142Z')
    : { status: 'not_synced', error: null, endpoints: {} };
  const matrix = await readJson(CAPABILITY_FILE);
  const captured = { status: capture ? 'captured' : 'not_captured', endpoints: { ...notCaptured(), ...(capture ? { requests: capture } : {}) } };
  const domain = { status: 'loaded', source: { status: 'ok', matrix, record: { platform_commit: 'x'.repeat(40), git_blob: 'y'.repeat(40), platform_path: 'p' } },
    snapshot: combineEndpoints(captured, sync) };
  const remove = installFakeDom();
  try {
    const p = renderPanels(consoleInputs(domain), null).governance;
    const glance = {};
    const items = findAll(findAll(p, hasClass('glance'))[0], (el) => el.tagName === 'DT' || el.tagName === 'DD');
    for (let i = 0; i < items.length; i += 2) glance[items[i].textContent] = items[i + 1].textContent;
    const tables = findAll(p, (el) => el.tagName === 'TABLE');
    return { p, text: p.textContent, glance, state: p.getAttribute('data-state'), tables, matrix };
  } finally { remove(); }
}

const row = (over) => ({ id: RECORD, kind: 'tool', domain_key: 'product_experience', title: 'Grant repo_read', description: 'Needed for R1',
  status: 'submitted', requested_by_identity: 'someone@example.com', requested_at: '2026-11-12T15:00:00Z',
  approved_by_identity: null, approved_at: null, ...over });

const QUEUE = [
  row({ kind: 'tool', status: 'submitted', title: 'Grant repo_read' }),
  row({ kind: 'tool', status: 'approved', title: 'Grant contrast_calculator', approved_by_identity: 'reviewer@example.com', approved_at: '2026-11-13T16:00:00Z' }),
  row({ kind: 'change', status: 'declined', title: 'Raise the ceiling', approved_by_identity: 'reviewer@example.com', approved_at: '2026-11-13T17:00:00Z' }),
  row({ kind: 'change', status: 'withdrawn', title: 'Rename a capability' }),
  row({ kind: 'tool', status: 'pending', title: 'Grant jest_runner' }),
];

test('statuses: submitted is pending; approved, declined and withdrawn are terminal; anything else is unrecognised', () => {
  assert.deepEqual(Object.keys(REQUEST_STATUSES), ['submitted', 'approved', 'declined', 'withdrawn']);
  assert.equal(requestStatus('submitted').terminal, false);
  for (const s of ['approved', 'declined', 'withdrawn']) assert.equal(requestStatus(s).terminal, true, s);
  for (const s of ['pending', 'cancelled', null, undefined]) {
    const r = requestStatus(s);
    assert.equal(r.known, false, String(s));
    assert.equal(r.terminal, null, String(s));
  }
  assert.match(requestStatus('pending').words, /^Unrecognised status "pending": shown as recorded, not counted as waiting or decided$/);
});

test('the whole queue: counted by status, each status in words, and a decision only where one exists', async () => {
  const { text, glance, state } = await panelWith({ requests: QUEUE, pending: 1 });
  assert.equal(state, 'ready');
  assert.match(text, /1 of 5 requests is waiting on a human decision \(submitted\); 3 are closed \(approved, declined or withdrawn\); 1 has a status this page does not recognise\. None of them grants anything\./);
  assert.equal(glance['Change requests'], '2');
  assert.equal(glance['Tool requests'], '3');
  assert.equal(glance['Waiting on a human (submitted)'], '1');
  assert.equal(glance['Closed (approved, declined, withdrawn)'], '3');
  for (const s of ['submitted', 'approved', 'declined', 'withdrawn']) assert.ok(text.includes(REQUEST_STATUSES[s].words), s);
  assert.ok(text.includes(requestStatus('pending').words));
  assert.match(text, /Not decided yet/);
  assert.match(text, /No decision: withdrawn/);
  assert.ok(text.includes(GOVERNANCE_SNAPSHOT.statement));
});

test('no request reads as a grant: every row says "Nothing", and no request text claims a grant', async () => {
  const { tables } = await panelWith({ requests: QUEUE, pending: 1 });
  const requestTables = tables.filter((t) => t.textContent.includes('Proposed by'));
  assert.equal(requestTables.length, 2, 'the change and tool tables');
  const rows = requestTables.flatMap((t) => findAll(t, (el) => el.tagName === 'TR')).filter((tr) => findAll(tr, (el) => el.tagName === 'TD').length);
  assert.equal(rows.length, QUEUE.length);
  for (const tr of rows) assert.ok(tr.textContent.includes(REQUEST_GRANTS_NOTHING), tr.textContent);
  // Checked cell by cell: a table's textContent runs cells together ("Granted" + "withheld..."), which
  // would hide a word boundary. The Title cell is what someone typed ("Grant repo_read") and is skipped;
  // every other cell is the page's own words, and none may say a grant happened.
  const cells = rows.flatMap((tr) => findAll(tr, (el) => el.tagName === 'TD').slice(1)).map((td) => td.textContent);
  assert.equal(cells.length, QUEUE.length * 6);
  for (const c of cells) assert.doesNotMatch(c, /\bgranted\b|\bgrants (?!nothing)|now (has|holds)|access given/i, c);
});

test('people and identifiers are withheld: no email, no record id, no withheld name', async () => {
  const names = accountableNames(await readJson(CAPABILITY_FILE));
  assert.ok(names.length > 0, 'the accountable manager\'s name is known to the page, so it can be withheld');
  const surname = names[0].split(/\s+/).pop();
  const { text } = await panelWith({ requests: [
    row({ title: `Ask ${surname} about ${RECORD}`, requested_by_identity: 'staff.member@example.com', status: 'approved', approved_by_identity: 'other@example.com', approved_at: '2026-11-13T16:00:00Z' }),
  ], pending: 0 });
  assert.doesNotMatch(text, EMAIL);
  assert.doesNotMatch(text, UUID);
  assert.doesNotMatch(text, new RegExp(`\\b${surname}\\b`));
  assert.ok(text.includes(WITHHELD), 'who proposed and who decided are withheld, not blank');
});

test('the source is described as what it is, and the -mine label is never presented as the source', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  assert.equal(json.sources.governance, `GET ${GOVERNANCE_SNAPSHOT.mine_route}`, 'the platform still labels the section -mine');
  const { p, text } = await panelWith({});
  assert.ok(text.includes(GOVERNANCE_SNAPSHOT.statement));
  assert.match(text, /That route returns only the signed-in person's own requests; the platform fills this section with every request on the domain, so the label does not describe these rows\./);
  assert.doesNotMatch(text, /Source the platform recorded for this queue/);
  // No source tag anywhere on the panel names the -mine route: the label appears only as quoted, flagged text.
  for (const tag of findAll(p, hasClass('src'))) assert.doesNotMatch(tag.textContent, /change-requests-mine/, tag.textContent);
  const reads = findAll(p, hasClass('panel-reads'))[0].textContent;
  assert.match(reads, /Platform sync · \.colaberry\/agent-domain\.json · governance: every product_experience request/);
  assert.match(reads, /agentDomainCommandCenterForSync\.ts @992e0e01/);
  assert.deepEqual(PANEL_ENDPOINTS[5], [], 'Panel 5 reads no endpoint');
  // A label that does not name the -mine route is still not used as the source.
  const other = await panelWith({}, { sources: { ...json.sources, governance: 'GET /api/admin/somewhere-else' } });
  assert.match(other.text, /This page does not use that label as the source\./);
});

test('a personal capture of the -mine route never replaces the whole-domain queue', async () => {
  const own = { state: 'ok', origin: 'endpoint', status: 200, fetched_at: '2026-11-14T18:00:00Z',
    body: { change_requests: [{ kind: 'tool', status: 'submitted', title: 'Only my own request' }] } };
  // With the sync: the panel shows the synced queue (here, two requests), not the capture.
  const both = await panelWith({ requests: [QUEUE[0], QUEUE[1]], pending: 1 }, { capture: own });
  assert.equal(both.glance['Tool requests'], '2');
  assert.doesNotMatch(both.text, /Only my own request/);
  // Without the sync: "Not available", and the capture is still not shown in its place.
  const alone = await panelWith({}, { capture: own, synced: false });
  assert.equal(alone.state, 'not_available');
  assert.match(alone.text, /A personal capture holds only your own requests, so it is not used in its place\./);
  assert.doesNotMatch(alone.text, /Only my own request/);
});

test('the 200-request limit is disclosed, and a full snapshot says older requests may be missing', async () => {
  const some = await panelWith({ requests: QUEUE, pending: 1 });
  assert.ok(some.text.includes(GOVERNANCE_SNAPSHOT.limit_words));
  assert.doesNotMatch(some.text, /may be missing/);
  const full = Array.from({ length: GOVERNANCE_SNAPSHOT.limit }, (_, i) => row({ status: 'approved', title: `Request ${i}` }));
  const atLimit = await panelWith({ requests: full, pending: 0 });
  assert.match(atLimit.text, /This snapshot holds 200, the limit, so older requests may be missing\./);
});

// The source note is folded (Aleem, 2026-11-17, point 2), but its warnings are not: a full snapshot and a
// pending-count disagreement are both said in the panel body, outside every disclosure.
const outsideDisclosures = (p) => p.children.filter((c) => !hasClass('panel-details')(c)).map((c) => c.textContent).join(' ');

test('the full-snapshot warning and the pending-count disagreement stay visible, outside the folded note', async () => {
  const full = Array.from({ length: GOVERNANCE_SNAPSHOT.limit }, (_, i) => row({ status: 'approved', title: `Request ${i}` }));
  const atLimit = await panelWith({ requests: full, pending: 0 });
  assert.match(outsideDisclosures(atLimit.p), /This snapshot holds 200, the limit, so older requests may be missing\./);
  const under = await panelWith({ requests: QUEUE, pending: 1 });
  assert.doesNotMatch(outsideDisclosures(under.p), /may be missing|at most the 200 newest/, 'below the limit, nothing about it in the body');
  const differ = await panelWith({ requests: QUEUE, pending: 3 });
  assert.match(outsideDisclosures(differ.p), /The platform records 3 pending, but 1 request in its queue is submitted\./);
});

test('proposer and decision-maker read "Not included in the platform snapshot" when the snapshot omits them', async () => {
  // Shaped exactly as the platform's sync job writes a row: no requested_by_identity, no approved_by_identity.
  const platformRow = (over) => ({ id: RECORD, kind: 'change', title: 'Raise a ceiling', status: 'approved',
    requested_at: '2026-11-12T15:00:00Z', approved_at: '2026-11-13T16:00:00Z', declined_reason: null, ...over });
  const { tables } = await panelWith({ requests: [platformRow({}), platformRow({ status: 'declined' })], pending: 0 });
  const cells = tables.filter((t) => t.textContent.includes('Proposed by'))
    .flatMap((t) => findAll(t, (el) => el.tagName === 'TR')).map((tr) => findAll(tr, (el) => el.tagName === 'TD').map((td) => td.textContent))
    .filter((r) => r.length);
  assert.equal(cells.length, 2);
  for (const r of cells) {
    assert.equal(r[2], GOVERNANCE_SNAPSHOT.people_words, 'Proposed by');
    assert.equal(r[4], GOVERNANCE_SNAPSHOT.people_words, 'Decided by');
  }
  assert.equal(GOVERNANCE_SNAPSHOT.people_words, 'Not included in the platform snapshot');
});

test("the platform's pending count is shown against the rows; a disagreement is said, not resolved", async () => {
  const agree = await panelWith({ requests: QUEUE, pending: 1 });
  assert.doesNotMatch(agree.text, /does not choose/);
  const differ = await panelWith({ requests: QUEUE, pending: 3 });
  assert.match(differ.text, /The platform records 3 pending, but 1 request in its queue is submitted\. Both are shown as recorded; this page does not choose\./);
});

test('today, on the real file: the queue is empty, said in words, with its source and limit, and no disagreement', async () => {
  const { text, state, glance } = await panelWith({});
  assert.equal(state, 'empty');
  assert.match(text, /No change or tool requests are in the Product Experience governance queue, as the platform snapshot records\. Nothing is waiting on a human decision\./);
  assert.equal(glance['Waiting on a human (submitted)'], '0');
  assert.ok(text.includes(GOVERNANCE_SNAPSHOT.statement));
  assert.ok(text.includes(GOVERNANCE_SNAPSHOT.limit_words));
  assert.doesNotMatch(text, /does not choose/);
});

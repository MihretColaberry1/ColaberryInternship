// FIXTURES for the state matrix only. These are made-up endpoint responses and a made-up platform-sync
// governance queue, used to put every panel into each of its states for review. They are never loaded by
// the console (index.html) and never describe this domain's real data. What IS real in a fixture row is
// said in its `what`: the project plan and the platform's real synced file (capability records, authority).
//
// Since 2026-11-14 Panels 3 and 5 read only the platform sync (.colaberry/agent-domain.json): Panel 3 its
// authority record, Panel 5 its whole-domain governance queue. Since 2026-11-23 Panels 2-4 read its
// capability records (capabilities[]) too; the pinned file supplies only required tools, blockers and the
// list of names to withhold. A personal endpoint capture drives Panel 1 only. So each fixture row says which source drives which panel, and `expect` records the state each
// panel must reach; tests/state-matrix.test.mjs checks both the render and state-matrix.md against it.
import { SNAPSHOT_SCHEMA, PLATFORM_SYNC_SCHEMA, readSnapshot, readPlatformSync } from '../../command-center/agent-domain-data.js';
import { DOMAIN_KEY, ENDPOINTS } from '../../command-center/agent-domain-facts.js';
import { SELF } from '../../command-center/agent-domain-redact.js';
import { h } from '../../command-center/dom.js';

const at = '2026-11-03T18:00:00Z';
const entry = (key, status, body) => ({ endpoint: ENDPOINTS[key], method: 'GET', fetched_at: at, http_status: status, body });
const capture = (entries) => readSnapshot({ schema: SNAPSHOT_SCHEMA, captured_at: at, snapshots: entries });
const notCaptured = () => ({ status: 'not_captured', endpoints: Object.fromEntries(Object.keys(ENDPOINTS).map((k) => [k, { state: 'not_captured' }])) });

/**
 * A TEST DATA governance queue, shaped like the platform's synced file and read through the console's own
 * reader (readPlatformSync), so the same allow-list and redaction apply as to the real file. The label
 * and disclosure are the platform's own wording; the requests and the pending count are made up.
 */
function fixtureQueue(requests, pending) {
  return readPlatformSync({
    schema: PLATFORM_SYNC_SCHEMA, domain_key: DOMAIN_KEY, agent: { exists: false },
    sources: { governance: `GET ${ENDPOINTS.requests}` },
    governance: { requests, pending,
      disclosure: 'A filed request grants nothing. Status is what a named human decided, and a pending row means nobody has decided yet.' },
  }, null).governance; // no last-changed time: test data was never synced
}

/** The scenarios whose Panel 5 reads a TEST DATA queue (fixtureQueue), not the platform's synced file. */
export const TEST_DATA_QUEUE = Object.freeze(['captured-empty', 'captured-data', 'refused']);

export const TEST_DATA_SOURCE_NOTE = 'TEST DATA: these requests were written for this review page '
  + '(docs/evidence/state-fixtures.js). They are not the platform\'s synced snapshot, were never synced, '
  + 'and have no last-changed time. On the live console this block names the platform\'s synced file, '
  + 'when it last changed, and the 200-request limit: see the "Today" row.';

/**
 * Review page only (state-matrix.html): in a TEST DATA row, Panel 5's own source wording would describe
 * made-up rows as the platform's synced snapshot. This swaps that block, and the matching "Reads:" tag,
 * for TEST DATA labels. Everything else in the panel is the console's real output for these rows.
 * Works on the browser DOM and on tests/fake-dom.mjs (which has no replaceWith). Returns the swaps made.
 */
export function relabelTestDataQueue(panel) {
  let swaps = 0;
  const kids = (n) => [...(n.children ?? [])];
  const swap = (parent, old, neu) => {
    if (typeof old.replaceWith === 'function') old.replaceWith(neu);
    else parent.children[parent.children.indexOf(old)] = neu;
    swaps += 1;
  };
  const walk = (n) => {
    for (const c of kids(n)) {
      const cls = String(c.className ?? '');
      const text = c.textContent ?? '';
      if (cls.split(/\s+/).includes('reads') && text.includes('this page called no endpoint')) {
        swap(n, c, h('div', { class: 'reads' }, h('p', { class: 'fixture-note', role: 'note' }, TEST_DATA_SOURCE_NOTE)));
      } else if (cls.split(/\s+/).includes('src-platform_sync') && text.includes('governance: every product_experience request')) {
        swap(n, c, h('span', { class: 'src fixture-tag' }, 'TEST DATA · docs/evidence/state-fixtures.js · not from the platform'));
      } else if (cls.split(/\s+/).includes('panel-headline') && text.includes('in the Product Experience governance queue, as the platform snapshot records')) {
        // The empty state's headline names its source; say which source these rows really come from.
        swap(n, c, h(c.tagName.toLowerCase(), { class: cls }, text.replace('in the Product Experience governance queue, as the platform snapshot records', 'in this TEST DATA queue, which is not from the platform')));
      } else walk(c);
    }
  };
  walk(panel);
  return swaps;
}

/** The scenarios whose Panel 1 reads a FIXTURE capture (made-up endpoint responses, all dated `at`). */
export const FIXTURE_CAPTURE = Object.freeze(['captured-empty', 'captured-data', 'refused']);

export const FIXTURE_TIME_LABEL = 'FIXTURE time: simulated for this review page, not a real capture';

/**
 * Review page only (state-matrix.html): in a FIXTURE capture row, Panel 1's "Reads" line says
 * "HTTP 200, captured 3 November 2026, 12:00 PM CST", the made-up time of the fixture. This adds a
 * FIXTURE label right after it; the console's own text is left as it is. Returns the labels added.
 */
export function labelFixtureCaptureTime(panel) {
  let added = 0;
  const walk = (n) => {
    for (const c of [...(n.children ?? [])]) {
      const cls = String(c.className ?? '');
      if (cls.split(/\s+/).includes('reads') && (c.textContent ?? '').includes(', captured ')) {
        c.append(document.createTextNode(' '), h('span', { class: 'src fixture-tag' }, FIXTURE_TIME_LABEL));
        added += 1;
      } else walk(c);
    }
  };
  walk(panel);
  return added;
}

/** A fixture capture for Panel 1, plus the REAL platform sync (Panel 3's authority, Panel 6's verifier reasons) with a TEST DATA queue for Panel 5. */
function fixtureDomain(source, real, entries, queue) {
  return { status: 'loaded', source, snapshot: { status: 'captured', ...capture(entries), sync: { ...real.snapshot.sync, governance: queue } } };
}

const FILED = [
  { kind: 'tool', status: 'submitted', title: 'Grant contrast_calculator', requested_by_identity: SELF, requested_at: '2026-11-02T15:00:00Z', approved_by_identity: null, approved_at: null },
  { kind: 'change', status: 'declined', title: 'Raise the ceiling of one capability', requested_by_identity: 'requester@example.com', requested_at: '2026-11-01T15:00:00Z', approved_by_identity: 'reviewer@example.com', approved_at: '2026-11-02T17:00:00Z' },
  { kind: 'tool', status: 'withdrawn', title: 'Grant screenshot_capture', requested_by_identity: 'requester@example.com', requested_at: '2026-11-01T16:00:00Z', approved_by_identity: null, approved_at: null },
];

const REAL_P3 = 'Panel 3 shows the REAL platform-synced authority record. Panel 5\'s source block and its "Reads:" tag are replaced on this page by TEST DATA labels, and Panel 1\'s capture time is labelled as a FIXTURE time.';
const INVALID = '.colaberry/agent-domain.json is not a "colaberry.agent-domain/v1" file for product_experience';

/** The rows that use real sources only. Every other row except Loading is labelled FIXTURE. */
export const REAL_SCENARIOS = Object.freeze(['today', 'nothing-captured']);

/**
 * Each scenario is { id, title, what, expect, domain(source, real) }: `source` is the real loaded source
 * file, `real` is everything the console itself loads (source file, snapshot if any, and the platform sync).
 * `expect` is the state each panel must reach, in the brief's panel order.
 */
export const SCENARIOS = [
  { id: 'loading', title: 'Loading', what: 'The sources have not answered yet.',
    expect: { employee: 'loading', inventory: 'loading', ladder: 'loading', behaviour: 'loading', governance: 'loading', gaps: 'loading' },
    domain: () => ({ status: 'loading' }) },
  { id: 'today', title: 'Today (real sources)', what: 'LIVE DATA, no fixtures: exactly what the console loads on this branch: the pinned source file, the project plan and the platform\'s synced copy (.colaberry/agent-domain.json), which drives Panel 1, Panel 3\'s authority and Panel 5\'s governance queue; no endpoint snapshot is captured. This is what the published console shows.',
    expect: { employee: 'ready', inventory: 'ready', ladder: 'ready', behaviour: 'ready', governance: 'empty', gaps: 'ready' },
    domain: (source, real) => ({ status: 'loaded', ...real }) },
  { id: 'nothing-captured', title: 'Real sources, nothing captured or synced', what: 'The real pinned source file and project plan, with neither an endpoint snapshot nor the platform sync. No fixture data; the endpoint answers and the synced file are simply absent, so Panels 1 to 5 say "Not available". The pinned research file is not used in place of the synced capability records.',
    expect: { employee: 'not_available', inventory: 'not_available', ladder: 'not_available', behaviour: 'not_available', governance: 'not_available', gaps: 'ready' },
    domain: (source) => ({ status: 'loaded', source, snapshot: notCaptured() }) },
  { id: 'captured-empty', title: 'Captured: no agent; test-data queue empty', what: `FIXTURE: a personal capture where both endpoints answered 200 and the domain has no agent (Panel 1), and a TEST DATA queue, shaped like the platform-synced file, with no requests (Panel 5). ${REAL_P3}`,
    expect: { employee: 'ready', inventory: 'ready', ladder: 'ready', behaviour: 'ready', governance: 'empty', gaps: 'ready' },
    domain: (source, real) => fixtureDomain(source, real, [
      entry('mine', 200, { domains: [{ domain_key: DOMAIN_KEY, agent_id: null }] }),
      entry('requests', 200, { change_requests: [] })], fixtureQueue([], 0)) },
  { id: 'captured-data', title: 'Captured: agent linked; test-data queue: requests filed', what: `FIXTURE: a personal capture where an agent is present (Panel 1), and a TEST DATA queue, shaped like the platform-synced file, with three requests: a tool request submitted and not yet decided, a change request declined, and a tool request withdrawn (Panel 5). None of them grants anything; people are withheld as the redaction guard does. ${REAL_P3}`,
    expect: { employee: 'ready', inventory: 'ready', ladder: 'ready', behaviour: 'ready', governance: 'ready', gaps: 'ready' },
    domain: (source, real) => fixtureDomain(source, real, [
      entry('mine', 200, { domains: [{ domain_key: DOMAIN_KEY, agent_id: '[present]' }] }),
      entry('requests', 200, { change_requests: [] })], fixtureQueue(FILED, 1)) },
  { id: 'refused', title: 'Captured: refused (HTTP 403); test-data queue empty', what: `FIXTURE: the personal capture ran but the platform refused both endpoints, so Panel 1 is an error. Panel 5 reads only the platform-synced queue, so a refused capture does not change it; here that queue is TEST DATA, and empty. ${REAL_P3}`,
    expect: { employee: 'error', inventory: 'ready', ladder: 'ready', behaviour: 'ready', governance: 'empty', gaps: 'ready' },
    domain: (source, real) => fixtureDomain(source, real, [entry('mine', 403, { error: 'Not permitted' }), entry('requests', 403, { error: 'Not permitted' })], fixtureQueue([], 0)) },
  { id: 'sync-invalid', title: 'Platform-synced file unreadable', what: 'FIXTURE: .colaberry/agent-domain.json is present but is not a "colaberry.agent-domain/v1" file for this domain, and nothing is captured. Panels 2 to 5, which read only that file, say it could not be used.',
    expect: { employee: 'error', inventory: 'error', ladder: 'error', behaviour: 'error', governance: 'error', gaps: 'ready' },
    domain: (source) => ({ status: 'loaded', source, snapshot: { ...notCaptured(),
      sync: { status: 'invalid', last_changed: null, error: INVALID, verdict_reasons: {}, governance: null, paths: {},
        capabilities: { status: 'invalid', error: INVALID, rows: [], size: 0 },
        authority: { status: 'invalid', error: INVALID, byId: {}, rule: null, size: 0 } } } }) },
  { id: 'source-missing', title: 'Pinned source file missing', what: "FIXTURE: the pinned capability file could not be read; the real platform sync is present and nothing is captured. Panels 2 to 4 still read the platform's synced capability records. Only the pinned file's required tools, blockers and list of names to withhold are missing, so the tools say \"Not available\" and behaviour text that could name a person is withheld.",
    expect: { employee: 'ready', inventory: 'ready', ladder: 'ready', behaviour: 'ready', governance: 'empty', gaps: 'ready' },
    domain: (source, real) => ({ status: 'loaded', source: { status: 'error', error: 'HTTP 404 for the capability file' }, snapshot: real.snapshot }) },
  { id: 'source-empty', title: 'Synced capability section empty', what: "FIXTURE: the platform's synced file holds an empty capabilities[] list; otherwise it is the real synced file, and nothing is captured.",
    expect: { employee: 'ready', inventory: 'empty', ladder: 'empty', behaviour: 'empty', governance: 'empty', gaps: 'ready' },
    domain: (source, real) => ({ status: 'loaded', source, snapshot: { ...real.snapshot,
      sync: { ...real.snapshot.sync, capabilities: { status: 'ok', error: null, rows: [], size: 0 } } } }) },
];

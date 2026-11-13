// Whether an agent is linked to product_experience comes from the LIVE endpoint, never from the
// registry. agentDomainRegistry.ts keeps agent_id: null for this domain as a seed value the platform
// deliberately does not keep current (agentDomainAgentLink.ts, lines 9-22, at cc1ebc55); the platform
// links the agent in agent_domain_projects.agent_id, which GET /api/admin/agent-domains-mine reads.
// Three cases, across every panel: agent present, agent absent, and not captured. In every one, all 25
// capabilities stay at autonomy:R0 with no human approval.
// Run from the repository root: node --test tests/agent-domain-link.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll, hasClass } from './fake-dom.mjs';
import { CAPABILITY_FILE, SNAPSHOT_SCHEMA, readSnapshot } from '../command-center/agent-domain-data.js';
import { AUTHORITY_WORDS, ENDPOINTS, REGISTRY_ENTRY } from '../command-center/agent-domain-facts.js';
import { agentLink, grantedToolsFor, toolGrantWords } from '../command-center/agent-domain-model.js';
import { PRESENT } from '../command-center/agent-domain-redact.js';
import { consoleInputs, renderConsole } from '../command-center/console.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const matrix = async () => JSON.parse(await readFile(path.join(ROOT, CAPABILITY_FILE), 'utf8'));

const AT = '2026-11-03T22:56:00Z';
const entry = (key, status, body) => ({ endpoint: ENDPOINTS[key], method: 'GET', fetched_at: AT, http_status: status, body });
const snapshotOf = (entries) => readSnapshot({ schema: SNAPSHOT_SCHEMA, captured_at: AT, snapshots: entries });

// The three cases. "Present" is shaped exactly like the reviewed redacted capture: the row carries only
// domain_key and agent_id reduced to PRESENT, so the agent's own fields were not captured.
const CASES = {
  present: () => snapshotOf([entry('mine', 200, { domains: [{ domain_key: 'product_experience', agent_id: PRESENT }] }),
    entry('requests', 200, { change_requests: [] })]),
  absent: () => snapshotOf([entry('mine', 200, { domains: [{ domain_key: 'product_experience', agent_id: null }] }),
    entry('requests', 200, { change_requests: [] })]),
  not_captured: () => ({ status: 'not_captured', error: null, endpoints: snapshotOf([]).endpoints }),
};

async function domainFor(snapshot) {
  return { status: 'loaded', source: { status: 'ok', matrix: await matrix(),
    record: { platform_commit: 'x'.repeat(40), git_blob: 'y'.repeat(40), platform_path: 'p' } }, snapshot };
}

async function render(caseKey) {
  const domain = await domainFor(CASES[caseKey]());
  const remove = installFakeDom();
  try {
    const out = renderConsole(domain, null);
    const panels = Object.fromEntries(findAll(out, hasClass('panel')).map((p) => [p.getAttribute('data-panel'), p.textContent]));
    const all = [out].flat(Infinity).map((n) => n?.textContent ?? '').join('');
    return { panels, all, inputs: consoleInputs(domain) };
  } finally { remove(); }
}

// ---- The model ----

test('agentLink: the live endpoint decides; the registry seed value is never consulted', () => {
  assert.equal(REGISTRY_ENTRY.agent_id, null, 'the registry seed value is unchanged');
  assert.equal(agentLink(CASES.present().endpoints).state, 'linked');
  assert.equal(agentLink(CASES.present().endpoints).source, 'mine');
  assert.equal(agentLink(CASES.absent().endpoints).state, 'not_linked');
  const unknown = agentLink(CASES.not_captured().endpoints);
  assert.equal(unknown.state, 'unknown');
  assert.equal(unknown.reason, 'not_captured');
});

test('agentLink: a list without this domain, a refused read, and a row with no agent_id key stay unknown', () => {
  assert.equal(agentLink(snapshotOf([entry('mine', 200, { domains: [] })]).endpoints).state, 'not_in_list');
  const refused = agentLink(snapshotOf([entry('mine', 403, { error: 'Forbidden' })]).endpoints);
  assert.equal(refused.state, 'unknown');
  assert.equal(refused.reason, 'refused');
  assert.equal(agentLink(snapshotOf([entry('mine', 200, { domains: [{ domain_key: 'product_experience' }] })]).endpoints).state, 'unknown');
});

test('tool grants: null (not captured) unless an endpoint records them; none only when a source says none', () => {
  const present = agentLink(CASES.present().endpoints);
  assert.equal(grantedToolsFor(present), null);
  assert.match(toolGrantWords(present), /^Not captured/);
  const absent = agentLink(CASES.absent().endpoints);
  assert.deepEqual(grantedToolsFor(absent), []);
  assert.match(toolGrantWords(absent), /^None: the endpoint links no agent/);
  const unknown = agentLink(CASES.not_captured().endpoints);
  assert.equal(grantedToolsFor(unknown), null);
  assert.equal(toolGrantWords(unknown), 'Not captured yet');
  // A later capture that records the grants is shown as recorded.
  const recorded = agentLink(snapshotOf([entry('mine', 200, { domains: [{ domain_key: 'product_experience', agent_id: PRESENT,
    agent_tools_granted: ['repo_read'], agent_tools_granted_count: 1 }] })]).endpoints);
  assert.deepEqual(grantedToolsFor(recorded), ['repo_read']);
  assert.equal(toolGrantWords(recorded), '1 granted, as the endpoint records');
});

// ---- Every panel, in each case ----

const UNSUPPORTED = /[Nn]o agent exists|none does|no agent exists to hold a grant|0 granted|None: no agent exists/;

for (const caseKey of Object.keys(CASES)) {
  test(`${caseKey}: no panel claims "no agent exists", and all 25 capabilities stay at autonomy:R0`, async () => {
    const { panels, all, inputs } = await render(caseKey);
    assert.doesNotMatch(all, UNSUPPORTED);
    assert.equal(inputs.rows.length, 25);
    for (const r of inputs.rows) {
      assert.equal(r.authority.effective_autonomy, 'autonomy:R0', r.id);
      assert.equal(r.approved, null, r.id);
    }
    assert.ok(panels.ladder.includes(`autonomy:R0 for all 25: ${AUTHORITY_WORDS.not_approved}.`));
    assert.ok(panels.ladder.includes(AUTHORITY_WORDS.cap_idle));
    // The employee's rung is unknown in every case: no source records an agent's rung on this ladder.
    assert.match(panels.ladder, /Your employee's rungUnknown: no source records an agent's rung on this ladder/);
    // The registry value is always labelled as a stale seed value wherever Panel 1 shows it.
    assert.ok(panels.employee.includes(REGISTRY_ENTRY.agent_id_label));
  });
}

test('present: Panel 1 says linked, and every detail it did not capture says "not captured"', async () => {
  const { panels } = await render('present');
  assert.match(panels.employee, /An agent is linked to this domain\. Its enabled state, autonomy level and tools were not captured\./);
  assert.match(panels.employee, /Agent linked \(live endpoint\)Yes, as the endpoint records/);
  assert.match(panels.employee, /Tools grantedNot captured: the snapshot records only that an agent is linked/);
  assert.match(panels.employee, /Not captured: not in the captured response/);
  assert.match(panels.governance, /Tools granted to the agentNot captured/);
  assert.match(panels.governance, /Grant not captured/);
  assert.doesNotMatch(panels.governance, /Not granted/);
  assert.match(panels.gaps, /An agent is linked to this domain\. Its enabled state, autonomy level and tool grants were not captured/);
  assert.match(panels.ladder, /Tool grants were not captured/);
});

test('absent: the endpoint links no agent, so "none granted" is supported and said with its source', async () => {
  const { panels } = await render('absent');
  assert.match(panels.employee, /No agent is linked to this domain in the captured response\./);
  assert.match(panels.employee, /Agent linked \(live endpoint\)No, as the endpoint records/);
  assert.match(panels.employee, /Tools grantedNone: the endpoint links no agent to this domain/);
  assert.match(panels.governance, /Not granted/);
  assert.match(panels.gaps, /The captured response links no agent to this domain, so no agent holds a tool grant\./);
  assert.match(panels.ladder, /0 of 25 have a tool granted/);
});

test('not captured: Panel 1 says it does not know, and does not lean on the registry', async () => {
  const { panels } = await render('not_captured');
  assert.match(panels.employee, /Not available: the employee record has not been captured yet\./);
  assert.match(panels.employee, /Until then this panel does not say either way/);
  assert.match(panels.employee, /Agent linked \(live endpoint\)Not captured yet/);
  assert.match(panels.employee, /Tools grantedNot captured yet/);
  assert.match(panels.gaps, /Whether an agent is linked to this domain is not captured\. The registry's agent_id: null is a seed value, not kept current/);
  assert.match(panels.ladder, /Tool grants were not captured/);
});

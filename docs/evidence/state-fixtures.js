// FIXTURES for the state matrix only. These are made-up endpoint responses used to put every panel
// into each of its states for review. They are never loaded by the console (index.html) and never
// describe this domain's real data. The capability source file used here IS the real pinned file.
import { SNAPSHOT_SCHEMA, readSnapshot } from '../../command-center/agent-domain-data.js';
import { ENDPOINTS } from '../../command-center/agent-domain-facts.js';
import { SELF, WITHHELD } from '../../command-center/agent-domain-redact.js';

const at = '2026-11-03T18:00:00Z';
const entry = (key, status, body) => ({ endpoint: ENDPOINTS[key], method: 'GET', fetched_at: at, http_status: status, body });
const snap = (entries) => ({ status: 'captured', ...readSnapshot({ schema: SNAPSHOT_SCHEMA, captured_at: at, snapshots: entries }) });
const notCaptured = () => ({ status: 'not_captured', endpoints: Object.fromEntries(Object.keys(ENDPOINTS).map((k) => [k, { state: 'not_captured' }])) });

/** Each scenario is { id, title, what, domain(source) } where source is the real loaded source file. */
export const SCENARIOS = [
  { id: 'loading', title: 'Loading', what: 'The sources have not answered yet.',
    domain: () => ({ status: 'loading' }) },
  { id: 'today', title: 'Today (real sources, no snapshot)', what: 'The real pinned source file and project plan; no endpoint snapshot captured. This is what the published console shows.',
    domain: (source) => ({ status: 'loaded', source, snapshot: notCaptured() }) },
  { id: 'captured-empty', title: 'Captured: no agent, nothing filed', what: 'FIXTURE: both endpoints answered 200; the domain has no agent and no requests.',
    domain: (source) => ({ status: 'loaded', source, snapshot: snap([
      entry('mine', 200, { domains: [{ domain_key: 'product_experience', agent_id: null }] }),
      entry('requests', 200, { change_requests: [] })]) }) },
  { id: 'captured-data', title: 'Captured: agent linked, requests filed', what: 'FIXTURE: an agent is present and two requests are filed; people are withheld as the redaction guard does.',
    domain: (source) => ({ status: 'loaded', source, snapshot: snap([
      entry('mine', 200, { domains: [{ domain_key: 'product_experience', agent_id: '[present]' }] }),
      entry('requests', 200, { change_requests: [
        { kind: 'tool', status: 'submitted', requested_by_identity: SELF, approved_by_identity: null },
        { kind: 'change', status: 'declined', requested_by_identity: SELF, approved_by_identity: WITHHELD }] })]) }) },
  { id: 'refused', title: 'Captured: refused (HTTP 403)', what: 'FIXTURE: the capture ran but the platform refused both endpoints.',
    domain: (source) => ({ status: 'loaded', source, snapshot: snap([entry('mine', 403, { error: 'Not permitted' }), entry('requests', 403, { error: 'Not permitted' })]) }) },
  { id: 'source-missing', title: 'Source file missing', what: 'FIXTURE: the pinned capability file could not be read.',
    domain: () => ({ status: 'loaded', source: { status: 'error', error: 'HTTP 404 for the capability file' }, snapshot: notCaptured() }) },
  { id: 'source-empty', title: 'Source file empty', what: 'FIXTURE: the capability file holds no capabilities.',
    domain: (source) => ({ status: 'loaded', source: { ...source, matrix: { capabilities: [] } }, snapshot: notCaptured() }) },
];

// Panel "Your employee" (brief panel 1): does it exist, and what is it allowed to do?
// Reads GET /api/admin/agent-domains-mine through a captured, redacted snapshot. This public page
// cannot call an admin endpoint, and that is the access boundary working (Ali Muwwakkil, 2026-11-02).
import { h } from './dom.js';
import { badge, table } from './ui.js';
import { AGENT_AUTONOMY_SCALE, AGENT_LINK_SOURCE, ENDPOINTS, REGISTRY_ENTRY, SET_BY_NOT_RECORDED } from './agent-domain-facts.js';
import { recordedBy, toolGrantWords } from './agent-domain-model.js';
import { centralTime, endpointRead, endpointTags, platformTag, valueTag } from './agent-domain-ui.js';
import { consolePanel, errorBlock, loadingBlock, notAvailable } from './console-ui.js';

const NOT_READ_TEXT = { not_captured: 'Not captured yet', loading: 'Loading…', refused: 'Refused' };

/** A recorded value as text. false and 0 are values; an empty list says so. */
function recordedValue(f) {
  const v = f.value;
  if (v === null) return h('code', {}, 'null');
  if (Array.isArray(v)) return v.length ? h('ul', { class: 'tool-list' }, v.map((t) => h('li', {}, h('code', {}, String(t))))) : 'none (empty list)';
  if (f.key === 'agent_autonomy_level_set_at') return centralTime(v);
  return h('code', {}, String(v));
}

function fieldValue(f) {
  switch (f.state) {
    case 'recorded': return recordedValue(f);
    case 'no_agent': return badge('neutral', 'No agent yet (null)');
    case 'absent': return badge('warn', 'Not captured: not in the captured response');
    case 'not_in_list': return badge('neutral', 'This domain is not in your list');
    case 'not_recorded': return [badge('neutral', 'Not recorded by the platform'), h('div', { class: 'muted' }, f.reason)];
    default: return badge('neutral', NOT_READ_TEXT[f.reason] ?? 'Not read');
  }
}

function fieldSource(f, v) {
  if (f.state !== 'not_recorded') return valueTag(ENDPOINTS.mine, v.mine);
  return f.from_endpoint ? valueTag(`${ENDPOINTS.mine} · not_recorded`, v.mine)
    : platformTag(SET_BY_NOT_RECORDED.source.path, SET_BY_NOT_RECORDED.source.commit);
}

function fieldTable(v) {
  return [h('p', { class: 'muted' }, `Each value says where it came from. A value is shown only when ${recordedBy(v.mine.origin)} returned it.`),
    table([
      { label: 'Field', cell: (f) => h('code', {}, f.key) },
      { label: 'Value', cell: fieldValue },
      { label: 'What it is', cell: (f) => (f.key === 'agent_autonomy_level' ? [f.label, h('div', { class: 'muted' }, AGENT_AUTONOMY_SCALE)] : f.label) },
      { label: 'Source', cell: (f) => fieldSource(f, v) },
    ], v.fields)];
}

/**
 * Decision D1 (2026-11-10): the registry seed value and "Runs" sit here, in the details, not at a glance.
 * Decision D4: manager access is stated in neutral words (REGISTRY_ENTRY.blocker), with no name or account records.
 */
function registryDetail() {
  return [h('p', {}, platformTag(REGISTRY_ENTRY.source.path), ' The registry entry for product_experience has ',
    h('code', {}, 'agent_id: null'), ' and ', h('code', {}, 'can_reach_surface: false'), '.'),
  h('p', {}, badge('warn', 'Stale seed value'), ' ', h('strong', {}, `${REGISTRY_ENTRY.agent_id_label}.`), ' ', REGISTRY_ENTRY.stale_note),
  h('p', {}, platformTag(AGENT_LINK_SOURCE.source.path, AGENT_LINK_SOURCE.source.commit), ' ', AGENT_LINK_SOURCE.statement),
  h('p', {}, REGISTRY_ENTRY.blocker),
  h('p', {}, h('strong', {}, 'Runs: '), 'None recorded; not checked from here. No source this page reads records an agent run.')];
}

const SOURCE_WORDS = { auto: 'by default (auto)', manual: 'by a person (manual)' };

/**
 * One glance value for an agent field: the recorded value in plain words, or the same "not captured",
 * "no agent yet" or "not in your list" wording the details table uses. Never a guessed value.
 */
function glanceValue(v, key) {
  const f = v.fields.find((x) => x.key === key);
  if (!f) return badge('neutral', 'Not read');
  if (f.state !== 'recorded') return fieldValue(f);
  const value = f.value;
  if (value === null || value === undefined) return h('code', {}, 'null');
  switch (key) {
    case 'agent_enabled': return value === false ? 'No (disabled)' : value === true ? 'Yes (enabled)' : h('code', {}, String(value));
    case 'agent_autonomy_level': return [h('code', {}, String(value)), h('div', { class: 'muted' }, 'Per-agent scale; not a rung on the R0 to R9 ladder')];
    case 'agent_autonomy_level_set_at': {
      const how = v.fields.find((x) => x.key === 'agent_autonomy_level_source');
      const source = how?.state === 'recorded' ? (SOURCE_WORDS[how.value] ?? `source: ${how.value}`) : null;
      return [centralTime(value), source ? `, ${source}` : ''];
    }
    default: return String(value);
  }
}

/** "Set by", which the platform does not store: said in words, never a name. */
function setByValue(v) {
  const f = v.fields.find((x) => x.key === 'autonomy_level_set_by');
  return f ? badge('neutral', 'Not recorded by the platform') : badge('neutral', 'Not read');
}

/** "Agent linked" in words, from the live endpoint (or the platform's synced copy of it) only. */
function linkWords(link) {
  if (link.state === 'linked') return `Yes, as ${recordedBy(link.origin)} records`;
  if (link.state === 'not_linked') return `No, as ${recordedBy(link.origin)} records`;
  if (link.state === 'not_in_list') return 'Unknown: this domain is not in your list on the platform';
  return 'Not captured yet';
}

/** Showing the agent's state is never permission to change it. */
export const NOT_AN_APPROVAL = 'Showing this is not approval to change it. Enabling the agent, raising its autonomy '
  + 'or granting it a tool is a decision a named human makes on the platform; nothing on this page does any of those.';

/** The agent's own state in one sentence, from recorded fields only. */
function agentStateWords(v) {
  const rec = (key) => v.fields.find((f) => f.key === key && f.state === 'recorded');
  const enabled = rec('agent_enabled');
  const level = rec('agent_autonomy_level');
  if (!enabled && !level) return null;
  const parts = [];
  if (enabled) parts.push(enabled.value === false ? 'It is disabled' : enabled.value === true ? 'It is enabled' : `Enabled: ${enabled.value}`);
  if (level) parts.push(`its per-agent autonomy level is ${level.value}`);
  return `${parts.join(', and ')}, as ${recordedBy(v.mine.origin)} records.`;
}

/** The headline when the endpoint answered. An absent detail is said to be not captured, never none. */
function readyHeadline(v) {
  if (v.mine.in_list === false && v.link.state === 'not_in_list') {
    return 'This domain is not in your list on the platform, so the endpoint says nothing about its agent.';
  }
  if (v.link.state === 'linked') {
    const detailsCaptured = v.fields.some((f) => f.state === 'recorded');
    return detailsCaptured ? 'An agent is linked to this domain.'
      : 'An agent is linked to this domain. Its enabled state, autonomy level and tools were not captured.';
  }
  if (v.link.state === 'not_linked') return 'No agent is linked to this domain in the captured response.';
  return 'The captured response does not say whether an agent is linked to this domain.';
}

/**
 * A source file that exists but cannot be used is an error, never "not available". Each file only
 * counts against an endpoint it was meant to supply: a broken capture does not hide good synced data.
 */
export function unusableSource(snapshot, e) {
  if (e?.state === 'ok') return null;
  if (snapshot?.status === 'invalid') return `The snapshot file could not be used: ${snapshot.error}`;
  if (snapshot?.sync?.status === 'invalid') return `The platform-synced file could not be used: ${snapshot.sync.error}`;
  return null;
}

/** Which of the five states the panel is in, from the endpoint state alone. */
export function employeeState(v, snapshot) {
  if (unusableSource(snapshot, v.mine)) return 'error';
  const s = v.mine.state;
  if (s === 'loading') return 'loading';
  if (s === 'not_captured') return 'not_available';
  if (s === 'ok') return 'ready';
  return 'error';
}

export const CAPTURE_ACTION = Object.freeze({ href: '#/guide/capture', label: 'Capture this panel with your own sign-in' });

export function renderEmployeePanel(v, { order, snapshot } = {}) {
  const state = employeeState(v, snapshot);
  // The live endpoint decides. The registry's agent_id is a stale seed value and never counts.
  const agentLinked = v.link.state === 'linked';

  let headline = null;
  let body = null;
  let action = null;
  if (state === 'loading') body = loadingBlock();
  if (state === 'not_available') {
    headline = 'Not available: the employee record has not been captured yet.';
    body = notAvailable({
      missing: 'Whether an agent is linked to this domain on the platform, read from your own account.',
      waitingFor: [`A redacted snapshot of GET ${ENDPOINTS.mine}. It is an admin endpoint, so this public page cannot call it.`],
      willShow: "Whether an agent is linked to product_experience. Until then this panel does not say either way: the registry's agent_id: null is a seed value, not kept current for this domain.",
      action: CAPTURE_ACTION,
    });
  }
  if (state === 'error') {
    headline = 'The employee record could not be read.';
    body = errorBlock({
      what: unusableSource(snapshot, v.mine) ?? `GET ${ENDPOINTS.mine}: ${v.mine.state}${v.mine.status ? `, HTTP ${v.mine.status}` : ''}`,
      why: v.mine.message ? `The platform said: ${v.mine.message}` : 'Nothing from this endpoint is shown, and nothing is assumed in its place.',
      action: CAPTURE_ACTION,
    });
  }
  if (state === 'ready') {
    headline = readyHeadline(v);
    const stateLine = agentLinked ? agentStateWords(v) : null;
    body = [endpointRead(ENDPOINTS.mine, v.mine),
      stateLine ? h('p', {}, stateLine) : null,
      agentLinked ? h('p', { class: 'muted not-approval' }, NOT_AN_APPROVAL) : null];
    action = agentLinked ? { href: '#/panel/ladder', label: 'See what it is allowed to do' } : { href: '#/panel/gaps', label: 'See what this console cannot show' };
  }

  return consolePanel({
    id: 'employee', order, state, headline, body, action,
    title: 'Your employee',
    question: 'Does it exist, and what is it allowed to do?',
    // Decision D1: the brief's employee fields at a glance, each exactly as the snapshot records it.
    glance: [
      [v.link.origin === 'platform_sync' ? 'Agent linked (platform sync)' : 'Agent linked (live endpoint)', linkWords(v.link)],
      ['Agent name', glanceValue(v, 'agent_display_name')],
      ['Enabled', glanceValue(v, 'agent_enabled')],
      ['Autonomy level', glanceValue(v, 'agent_autonomy_level')],
      ['Tools granted', toolGrantWords(v.link)],
      ['Autonomy last set', glanceValue(v, 'agent_autonomy_level_set_at')],
      ['Autonomy set by', setByValue(v)],
    ],
    reads: [endpointTags(1), platformTag(REGISTRY_ENTRY.source.path)],
    details: [
      { title: 'The agent, as the endpoint records it', count: v.fields.length, body: fieldTable(v) },
      { title: 'Registry entry, manager access and runs', body: registryDetail() },
    ],
  });
}

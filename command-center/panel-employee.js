// Panel "Your employee" (brief panel 1): does it exist, and what is it allowed to do?
// Reads GET /api/admin/agent-domains-mine through a captured, redacted snapshot. This public page
// cannot call an admin endpoint, and that is the access boundary working (Ali Muwwakkil, 2026-11-02).
import { h } from './dom.js';
import { badge, table } from './ui.js';
import { AGENT_AUTONOMY_SCALE, AGENT_LINK_SOURCE, ENDPOINTS, REGISTRY_ENTRY, SET_BY_NOT_RECORDED } from './agent-domain-facts.js';
import { toolGrantWords } from './agent-domain-model.js';
import { centralTime, endpointRead, endpointTags, platformTag, sourceTag } from './agent-domain-ui.js';
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

function fieldSource(f) {
  if (f.state !== 'not_recorded') return sourceTag('endpoint', `GET ${ENDPOINTS.mine}`);
  return f.from_endpoint ? sourceTag('endpoint', `GET ${ENDPOINTS.mine} · not_recorded`)
    : platformTag(SET_BY_NOT_RECORDED.source.path, SET_BY_NOT_RECORDED.source.commit);
}

function fieldTable(v) {
  return [h('p', { class: 'muted' }, 'Each value says where it came from. A value is shown only when the endpoint returned it.'),
    table([
      { label: 'Field', cell: (f) => h('code', {}, f.key) },
      { label: 'Value', cell: fieldValue },
      { label: 'What it is', cell: (f) => (f.key === 'agent_autonomy_level' ? [f.label, h('div', { class: 'muted' }, AGENT_AUTONOMY_SCALE)] : f.label) },
      { label: 'Source', cell: fieldSource },
    ], v.fields)];
}

function registryDetail() {
  return [h('p', {}, platformTag(REGISTRY_ENTRY.source.path), ' The registry entry for product_experience has ',
    h('code', {}, 'agent_id: null'), ' and ', h('code', {}, 'can_reach_surface: false'), '.'),
  h('p', {}, badge('warn', 'Stale seed value'), ' ', h('strong', {}, `${REGISTRY_ENTRY.agent_id_label}.`), ' ', REGISTRY_ENTRY.stale_note),
  h('p', {}, platformTag(AGENT_LINK_SOURCE.source.path, AGENT_LINK_SOURCE.source.commit), ' ', AGENT_LINK_SOURCE.statement),
  h('p', {}, REGISTRY_ENTRY.blocker)];
}

/** "Agent linked" in words, from the live endpoint only. */
const LINK_WORDS = {
  linked: 'Yes, as the endpoint records',
  not_linked: 'No, as the endpoint records',
  not_in_list: 'Unknown: this domain is not in your list on the platform',
  unknown: 'Not captured yet',
};

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

/** Which of the five states the panel is in, from the endpoint state alone. */
export function employeeState(v, snapshotStatus) {
  if (snapshotStatus === 'invalid') return 'error';
  const s = v.mine.state;
  if (s === 'loading') return 'loading';
  if (s === 'not_captured') return 'not_available';
  if (s === 'ok') return 'ready';
  return 'error';
}

export const CAPTURE_ACTION = Object.freeze({ href: '#/guide/capture', label: 'Capture this panel with your own sign-in' });

export function renderEmployeePanel(v, { order, snapshot } = {}) {
  const state = employeeState(v, snapshot?.status);
  // The live endpoint decides. The registry's agent_id is a stale seed value and never counts.
  const agentLinked = v.link.state === 'linked';
  const registryLine = [h('code', {}, 'agent_id: null'), ' ', badge('warn', 'Stale seed value'),
    h('div', { class: 'muted' }, REGISTRY_ENTRY.agent_id_label), platformTag(REGISTRY_ENTRY.source.path)];

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
      what: snapshot?.status === 'invalid' ? `The snapshot file could not be used: ${snapshot.error}` : `GET ${ENDPOINTS.mine}: ${v.mine.state}${v.mine.status ? `, HTTP ${v.mine.status}` : ''}`,
      why: v.mine.message ? `The platform said: ${v.mine.message}` : 'Nothing from this endpoint is shown, and nothing is assumed in its place.',
      action: CAPTURE_ACTION,
    });
  }
  if (state === 'ready') {
    headline = readyHeadline(v);
    body = endpointRead(ENDPOINTS.mine, v.mine);
    action = agentLinked ? { href: '#/panel/ladder', label: 'See what it is allowed to do' } : { href: '#/panel/gaps', label: 'See what this console cannot show' };
  }

  return consolePanel({
    id: 'employee', order, state, headline, body, action,
    title: 'Your employee',
    question: 'Does it exist, and what is it allowed to do?',
    glance: [
      ['Agent linked (live endpoint)', LINK_WORDS[v.link.state]],
      ['Tools granted', toolGrantWords(v.link)],
      ['Agent in the platform registry', registryLine],
      ['Runs', 'None recorded; not checked from here'],
    ],
    reads: [endpointTags(1), platformTag(REGISTRY_ENTRY.source.path)],
    details: [
      { title: 'The agent, as the endpoint records it', count: v.fields.length, body: fieldTable(v) },
      { title: 'Registry entry and manager access', body: registryDetail() },
    ],
  });
}

// Panel "Your governance queue" (brief panel 5): what am I waiting on a human for?
// Reads GET /api/admin/agent-domain-change-requests-mine through a captured, redacted snapshot.
// Criterion 5: nothing here states or implies that filing a request granted anything.
import { h } from './dom.js';
import { badge, table } from './ui.js';
import { ENDPOINTS, REQUEST_RULE } from './agent-domain-facts.js';
import { centralTime, endpointRead, endpointTags, platformTag, sourceFileTag } from './agent-domain-ui.js';
import { consolePanel, errorBlock, loadingBlock, notAvailable } from './console-ui.js';
import { guardrailsSection, notesSection, pendingSignoffs } from './project-sections.js';
import { CAPTURE_ACTION } from './panel-employee.js';
import { toolGrantWords } from './agent-domain-model.js';

/** One required tool's grant status: known only when the endpoint recorded the agent's grants. */
function grantBadge(tool, link) {
  if (link.state === 'not_linked' || link.tools_granted_count === 0) return badge('neutral', 'Not granted');
  if (link.tools_granted) return link.tools_granted.includes(tool) ? badge('info', 'Granted') : badge('neutral', 'Not granted');
  return badge('neutral', 'Grant not captured');
}

function grantSentence(link) {
  if (link.state === 'not_linked') return ' The research lists them; the captured response links no agent to this domain, so none is granted.';
  if (link.tools_granted) return ' The research lists them; each is marked against the grants the endpoint records.';
  return ' The research lists them. Whether the agent holds any of them was not captured.';
}

const STATUS_BADGE = { approved: 'info', declined: 'error' };

function requestTable(items, isTool) {
  return table([
    { label: 'Title', cell: (r) => r.title ?? 'not captured' },
    { label: 'Status', cell: (r) => badge(STATUS_BADGE[r.status] ?? 'neutral', r.status ?? 'not stated') },
    { label: 'Proposed by', cell: (r) => r.requested_by_identity ?? 'not recorded' },
    { label: 'Proposed at', cell: (r) => (r.requested_at ? centralTime(r.requested_at) : 'not captured') },
    { label: 'Decided by', cell: (r) => r.approved_by_identity ?? 'not decided' },
    { label: 'Decided at', cell: (r) => (r.approved_at ? centralTime(r.approved_at) : 'not decided') },
    isTool ? { label: 'Grants', cell: () => badge('neutral', 'Nothing: a request is not a grant') } : null,
  ].filter(Boolean), items, isTool ? 'No tool requests filed.' : 'No change requests filed.');
}

export function governanceState(groups, snapshotStatus) {
  if (snapshotStatus === 'invalid') return 'error';
  if (groups.state === 'loading') return 'loading';
  if (groups.state === 'not_captured') return 'not_available';
  if (groups.state !== 'ok') return 'error';
  return groups.change.length + groups.tool.length + groups.unknown_kind.length === 0 ? 'empty' : 'ready';
}

const count = (groups, key) => (groups.state === 'ok' ? String(groups[key].length) : 'not captured');

const UNKNOWN_LINK = Object.freeze({ state: 'unknown', reason: 'not_captured', tools_granted: null, tools_granted_count: null });

export function renderGovernancePanel(groups, rows, { order, snapshot, project, link = UNKNOWN_LINK } = {}) {
  const state = governanceState(groups, snapshot?.status);
  const tools = [...new Set(rows.flatMap((r) => r.required_tools))];
  const signoffs = project?.data ? pendingSignoffs(project.data, project.model) : [];

  let headline = REQUEST_RULE.statement;
  let body = null;
  let action = null;
  if (state === 'loading') body = loadingBlock();
  if (state === 'not_available') {
    body = notAvailable({
      missing: 'Your change requests and tool requests, with their status and who decided them.',
      waitingFor: `A redacted snapshot of GET ${ENDPOINTS.requests}. It is an admin endpoint, so this public page cannot call it.`,
      willShow: 'Change requests and tool requests listed separately, by kind and status. People are withheld; a tool request never reads as a grant.',
      action: CAPTURE_ACTION,
    });
  }
  if (state === 'error') {
    body = errorBlock({
      what: snapshot?.status === 'invalid' ? `The snapshot file could not be used: ${snapshot.error}` : `GET ${ENDPOINTS.requests}: ${groups.state}`,
      why: groups.endpoint?.message ? `The platform said: ${groups.endpoint.message}` : 'Nothing from this endpoint is shown, and nothing is assumed in its place.',
      action: CAPTURE_ACTION,
    });
  }
  if (state === 'empty') {
    headline = 'No change or tool requests are filed. Nothing is waiting on a human decision from this endpoint.';
    body = endpointRead(ENDPOINTS.requests, groups.endpoint);
    action = { href: '#/guide/requests', label: 'How to file a tool request' };
  }
  if (state === 'ready') {
    body = endpointRead(ENDPOINTS.requests, groups.endpoint);
    action = { href: '#/guide/requests', label: 'Follow up a pending request' };
  }

  return consolePanel({
    id: 'governance', order, state, headline, body, action,
    title: 'Your governance queue',
    question: 'What am I waiting on a human for?',
    glance: [
      ['Change requests', count(groups, 'change')],
      ['Tool requests', count(groups, 'tool')],
      ['Tools the capabilities will need', `${tools.length} listed`],
      ['Tools granted to the agent', toolGrantWords(link)],
      ['Sign-off waiting in this repo', signoffs.length ? signoffs.map((d) => `${d.id}: Aleem's R0 sign-off`).join('; ') : 'None'],
    ],
    reads: [endpointTags(5), platformTag(REQUEST_RULE.source.path), ' ', sourceFileTag()],
    details: [
      groups.state === 'ok' ? { title: 'Change requests', count: groups.change.length, body: requestTable(groups.change, false) } : null,
      groups.state === 'ok' ? { title: 'Tool requests', count: groups.tool.length, body: requestTable(groups.tool, true) } : null,
      groups.state === 'ok' && groups.unknown_kind.length ? { title: 'Requests with no stated kind', count: groups.unknown_kind.length, body: requestTable(groups.unknown_kind, false) } : null,
      { title: 'Tools the capabilities will need', count: tools.length, body: [
        h('p', {}, sourceFileTag(), grantSentence(link), ' A tool not yet granted would need a tool request that a human decides.'),
        h('ul', { class: 'tool-list' }, tools.map((t) => h('li', {}, h('code', {}, t), ' ', grantBadge(t, link))))] },
      project?.data ? { title: 'Guardrails waiting on a human', body: guardrailsSection(project.data, project.model) } : null,
      project?.data ? { title: 'Decisions recorded in this repo', body: notesSection(project.data.notes) } : null,
    ],
  });
}

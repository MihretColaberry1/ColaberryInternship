// Panel "Your governance queue" (brief panel 5): what am I waiting on a human for?
// Shows the whole Product Experience governance queue from the platform's synced snapshot only: every
// request filed against the domain, by anyone, newest 200 (GOVERNANCE_SNAPSHOT). A personal capture of
// GET /api/admin/agent-domain-change-requests-mine holds only the capturer's own requests and is never
// used here. The snapshot carries no person fields; free text is scrubbed of record ids and names. Statuses are the platform owner's: submitted is pending; approved, declined and withdrawn
// are terminal; anything else is shown as recorded and labelled unrecognised.
// Criterion 5: nothing here states or implies that filing or deciding a request granted anything.
import { h } from './dom.js';
import { badge, table } from './ui.js';
import { GOVERNANCE_SNAPSHOT, REQUEST_GRANTS_NOTHING, REQUEST_RULE } from './agent-domain-facts.js';
import { centralTime, lastChangedWords, platformTag, sourceFileTag, sourceTag } from './agent-domain-ui.js';
import { consolePanel, errorBlock, loadingBlock, notAvailable } from './console-ui.js';
import { guardrailsSection, notesSection, pendingSignoffs } from './project-sections.js';
import { recordedBy, requestStatus, toolGrantWords } from './agent-domain-model.js';
import { withholdNames, withholdRecordIds } from './agent-domain-redact.js';

/** One required tool's grant status: known only when the endpoint recorded the agent's grants. */
function grantBadge(tool, link) {
  if (link.state === 'not_linked' || link.tools_granted_count === 0) return badge('neutral', 'Not granted');
  if (link.tools_granted) return link.tools_granted.includes(tool) ? badge('info', 'Granted') : badge('neutral', 'Not granted');
  return badge('neutral', 'Grant not captured');
}

function grantSentence(link) {
  if (link.state === 'not_linked') return ` The research lists them; ${recordedBy(link.origin)} links no agent to this domain, so none is granted.`;
  if (link.tools_granted) return ` The research lists them; each is marked against the grants ${recordedBy(link.origin)} records.`;
  return ' The research lists them. Whether the agent holds any of them was not captured.';
}

/** Free text someone typed: no record id and no name the page withholds elsewhere. */
const publicText = (text, names) => (text == null ? null : withholdNames(withholdRecordIds(String(text)), names));

/** Who decided, and when, in words that fit the status: a submitted or withdrawn request has no decision. */
function decision(r) {
  const s = requestStatus(r.status);
  if (s.status === 'submitted') return { by: 'Not decided yet', at: 'Not decided yet' };
  if (s.status === 'withdrawn') return { by: 'No decision: withdrawn', at: 'No decision: withdrawn' };
  return { by: r.approved_by_identity ?? GOVERNANCE_SNAPSHOT.people_words, at: r.approved_at ? centralTime(r.approved_at) : 'not recorded' };
}

function requestTable(items, kindWords, names) {
  return table([
    { label: 'Title', cell: (r) => publicText(r.title, names) ?? 'not captured' },
    { label: 'Status', cell: (r) => { const s = requestStatus(r.status); return badge(s.tone, s.words); } },
    { label: 'Proposed by', cell: (r) => r.requested_by_identity ?? GOVERNANCE_SNAPSHOT.people_words },
    { label: 'Proposed at', cell: (r) => (r.requested_at ? centralTime(r.requested_at) : 'not captured') },
    { label: 'Decided by', cell: (r) => decision(r).by },
    { label: 'Decided at', cell: (r) => decision(r).at },
    { label: 'Grants', cell: () => badge('neutral', REQUEST_GRANTS_NOTHING) },
  ], items, `No ${kindWords} in the queue.`);
}

export function governanceState(groups) {
  if (groups.state === 'loading') return 'loading';
  if (groups.state === 'not_synced') return 'not_available';
  if (groups.state !== 'ok') return 'error';
  return groups.all.length === 0 ? 'empty' : 'ready';
}

const count = (groups, key) => (groups.state === 'ok' ? String(groups[key].length) : 'not captured');

const snapshotTag = () => sourceTag('platform_sync', '.colaberry/agent-domain.json · governance: every product_experience request');

export const SOURCE_NOTE_TITLE = 'Where these rows come from';

/**
 * Where the rows come from, said plainly: the snapshot, when it last changed, the 200-row limit, and the
 * platform's own label for the section, which names a different route (one that holds only your own).
 * Folded into the panel's first disclosure (Aleem, 2026-11-17, point 2); limitWarning keeps the one part
 * that can become a warning in the panel body.
 */
function sourceNote(e) {
  const label = e?.platform?.label;
  return h('div', { class: 'reads' },
    h('p', {}, snapshotTag(), ' ', GOVERNANCE_SNAPSHOT.statement, ` It was ${lastChangedWords(e?.last_changed ?? null)}. `,
      'Read from this repository; this page called no endpoint.'),
    h('p', { class: 'muted' }, GOVERNANCE_SNAPSHOT.limit_words),
    label ? h('p', { class: 'muted' }, 'The snapshot labels this section ', h('code', {}, label), '. ',
      label.includes(GOVERNANCE_SNAPSHOT.mine_route)
        ? "That route returns only the signed-in person's own requests; the platform fills this section with every request on the domain, so the label does not describe these rows."
        : 'This page does not use that label as the source.') : null);
}

/** A snapshot at the 200-row limit may be missing older requests: said in the panel body, never folded. */
function limitWarning(count) {
  if (count < GOVERNANCE_SNAPSHOT.limit) return null;
  return h('p', { class: 'error' }, GOVERNANCE_SNAPSHOT.limit_words,
    ` This snapshot holds ${count}, the limit, so older requests may be missing.`);
}

/** The platform's own pending count, beside the rows it describes; a disagreement is said, not resolved. */
function pendingCheck(groups) {
  const pending = groups.endpoint?.platform?.pending;
  if (pending == null || pending === groups.waiting.length) return null;
  return h('p', { class: 'error', role: 'note' }, `The platform records ${pending} pending, but ${groups.waiting.length} `
    + `${groups.waiting.length === 1 ? 'request in its queue is' : 'requests in its queue are'} submitted. Both are shown as recorded; this page does not choose.`);
}

function readyHeadline(groups) {
  const closed = groups.decided.length + groups.withdrawn.length;
  const odd = groups.unrecognised.length;
  return `${groups.waiting.length} of ${groups.all.length} requests ${groups.waiting.length === 1 ? 'is' : 'are'} waiting on a human decision (submitted); `
    + `${closed} ${closed === 1 ? 'is' : 'are'} closed (approved, declined or withdrawn)`
    + (odd ? `; ${odd} ${odd === 1 ? 'has' : 'have'} a status this page does not recognise` : '') + '. None of them grants anything.';
}

const REFRESH_ACTION = Object.freeze({ href: '#/guide/refresh', label: 'How to refresh the data' });

const UNKNOWN_LINK = Object.freeze({ state: 'unknown', reason: 'not_captured', tools_granted: null, tools_granted_count: null });

export function renderGovernancePanel(groups, rows, { order, project, link = UNKNOWN_LINK, names = [] } = {}) {
  const state = governanceState(groups);
  const tools = [...new Set(rows.flatMap((r) => r.required_tools))];
  const signoffs = project?.data ? pendingSignoffs(project.data, project.model) : [];

  let headline = REQUEST_RULE.statement;
  let body = null;
  let action = null;
  if (state === 'loading') body = loadingBlock();
  if (state === 'not_available') {
    body = notAvailable({
      missing: 'The Product Experience governance queue: every change and tool request on the domain, with its status.',
      waitingFor: 'The platform to sync .colaberry/agent-domain.json into this repository with its governance section. A personal capture holds only your own requests, so it is not used in its place.',
      willShow: 'Change and tool requests listed separately, each with its status (submitted, approved, declined or withdrawn). No person is shown; no request reads as a grant.',
      action: REFRESH_ACTION,
    });
  }
  if (state === 'error') {
    body = errorBlock({
      what: "The platform's synced snapshot could not be used for the governance queue.",
      why: groups.endpoint?.message ?? groups.message ?? 'Nothing from it is shown, and nothing is assumed in its place.',
      action: REFRESH_ACTION,
    });
  }
  if (state === 'empty') {
    headline = 'No change or tool requests are in the Product Experience governance queue, as the platform snapshot records. '
      + 'Nothing is waiting on a human decision.';
    body = [pendingCheck(groups)];
    action = { href: '#/guide/requests', label: 'How to file a tool request' };
  }
  if (state === 'ready') {
    headline = readyHeadline(groups);
    body = [limitWarning(groups.all.length), pendingCheck(groups)];
    action = groups.waiting.length ? { href: '#/guide/requests', label: 'Follow up a submitted request' } : { href: '#/guide/requests', label: 'How to file a tool request' };
  }
  const disclosure = groups.endpoint?.platform?.disclosure;

  return consolePanel({
    id: 'governance', order, state, headline, body, action,
    title: 'Your governance queue',
    question: 'What am I waiting on a human for?',
    glance: [
      ['Change requests', count(groups, 'change')],
      ['Tool requests', count(groups, 'tool')],
      ['Waiting on a human (submitted)', count(groups, 'waiting')],
      ['Closed (approved, declined, withdrawn)', groups.state === 'ok' ? String(groups.decided.length + groups.withdrawn.length) : 'not captured'],
      ['Tools the capabilities will need', `${tools.length} listed`],
      ['Tools granted to the agent', toolGrantWords(link)],
      ['Sign-off waiting in this repo', signoffs.length ? signoffs.map((d) => `${d.id}: Accountable manager's R0 sign-off`).join('; ') : 'None'],
    ],
    reads: [snapshotTag(), ' ', platformTag(GOVERNANCE_SNAPSHOT.source.path, GOVERNANCE_SNAPSHOT.source.commit), ' ',
      platformTag(REQUEST_RULE.source.path), ' ', sourceFileTag()],
    details: [
      state === 'empty' || state === 'ready' ? { title: SOURCE_NOTE_TITLE, body: sourceNote(groups.endpoint) } : null,
      groups.state === 'ok' ? { title: 'Change requests', count: groups.change.length, body: requestTable(groups.change, 'change requests', names) } : null,
      groups.state === 'ok' ? { title: 'Tool requests', count: groups.tool.length, body: requestTable(groups.tool, 'tool requests', names) } : null,
      groups.state === 'ok' && groups.unknown_kind.length ? { title: 'Requests with no stated kind', count: groups.unknown_kind.length, body: requestTable(groups.unknown_kind, 'requests without a kind', names) } : null,
      groups.state === 'ok' ? { title: 'What each status means', body: [
        h('p', {}, platformTag(REQUEST_RULE.source.path), ' ', REQUEST_RULE.statement),
        disclosure ? h('p', { class: 'muted' }, 'The platform\'s note: ', disclosure) : null,
        h('ul', {}, ['submitted', 'approved', 'declined', 'withdrawn'].map((s) => h('li', {}, h('code', {}, s), ' ', requestStatus(s).words, '.')))] } : null,
      { title: 'Tools the capabilities will need', count: tools.length, body: [
        h('p', {}, sourceFileTag(), grantSentence(link), ' A tool not yet granted would need a tool request that a human decides.'),
        h('ul', { class: 'tool-list' }, tools.map((t) => h('li', {}, h('code', {}, t), ' ', grantBadge(t, link))))] },
      project?.data ? { title: 'Guardrails waiting on a human', body: guardrailsSection(project.data, project.model) } : null,
      project?.data ? { title: 'Decisions recorded in this repo', body: notesSection(project.data.notes) } : null,
    ],
  });
}

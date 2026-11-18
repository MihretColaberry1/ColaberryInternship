// Detail pages one level below the console: a capability, a rung, and the three operator guides the
// panels' primary actions point to. The capability page uses the same criterion 4 wording as the
// console (authorityView), with every authority value taken from the platform's own record.
import { h } from './dom.js';
import { badge, facts } from './ui.js';
import { REASON_TEXT } from './authority.js';
import { AUTHORITY_WORDS, BEHAVIOUR_EXPOSURE, ENDPOINTS, REGISTRY_ENTRY, REQUEST_RULE, TOOL_RULE } from './agent-domain-facts.js';
import { PLATFORM_SYNC_FILE, SNAPSHOT_FILE } from './agent-domain-data.js';
import { publicBlockerText } from './agent-domain-redact.js';
import { authorityView, platformLadderRow, toolRuleStatus } from './agent-domain-model.js';
import { draftBadge, platformTag, sourceFileTag, unavailableTag } from './agent-domain-ui.js';
import { backToConsole } from './console-ui.js';
import { authorityReadLine, authorityTag, ladderGrid, startingWords, toolRuleVerdict } from './panel-ladder.js';
import { behaviourTable } from './panel-behaviour.js';

/**
 * A blocker as the research file records it, verbatim. The file was written when the registry seed said
 * agent_id: null, so its "no AI employee provisioned" blocker is annotated: that seed value is not kept
 * current for this domain, and the live endpoint decides whether an agent is linked. The pinned file
 * itself is never edited (a test checks it against the platform's git blob).
 */
export const STALE_AGENT_BLOCKER = 'no_ai_employee_provisioned';

// Display-only (the pinned file is unchanged): see publicBlockerText in agent-domain-redact.js.
function blockerItem(text) {
  if (!text.startsWith(STALE_AGENT_BLOCKER)) return h('li', {}, text);
  return h('li', {}, text, h('div', { class: 'muted' }, badge('warn', 'May be out of date'), ' ', REGISTRY_ENTRY.stale_note));
}

/** Each blocker once: two access blockers that both become the neutral sentence are shown once. */
const blockerTexts = (blockedBy, names) => [...new Set(blockedBy.map((b) => publicBlockerText(b, names)))];

const reasonList = (reasons) => (reasons.length
  ? h('ul', {}, reasons.map((x) => h('li', {}, h('code', {}, x), ` ${REASON_TEXT[x] ?? ''}`))) : 'None recorded.');

/**
 * The tool-grant rule on a capability page, as the platform states it (`authority_rule`), with the
 * console's verdict wording. This replaced the computed "if approved up to the ceiling" box: the page
 * no longer calculates authority (the platform owner's decision, approved by Mihret on 2026-11-14).
 */
export function ruleExplanation(status) {
  if (!status.known) return null;
  return h('div', { class: 'tool-rule', role: 'note' },
    h('p', { class: 'state-title' }, 'The tool rule ', h('code', {}, TOOL_RULE.reason), ', as the platform states it ', authorityTag()),
    h('p', {}, status.rule),
    h('p', {}, h('strong', {}, toolRuleVerdict(status))),
    status.note ? h('p', { class: 'muted' }, "The platform's note: ", status.note) : null);
}

/** The Authority section: every value from the platform's record, or a plain "not available". */
function authorityFacts(r, check, authority) {
  const a = authorityView(r);
  const coverage = ['/coverage endpoint', check?.state === 'differs'
    ? h('ul', {}, check.diffs.map((d) => h('li', {}, `${d.field}: endpoint says ${d.endpoint}, source file says ${d.source_file}`)))
    : (check?.state ?? 'not captured yet').replace('_', ' ')];
  const confirmation = ['Human confirmation', [AUTHORITY_WORDS.confirmation_unavailable, ' ', unavailableTag()]];
  if (!a.recorded) {
    const why = authority?.status === 'ok' ? `The platform's authority record has no row for ${r.id}.`
      : authority?.status === 'invalid' ? `The platform's authority record could not be used: ${authority.error}`
        : `The platform's authority record is not in this repository (${PLATFORM_SYNC_FILE}).`;
    return facts([['Current rung', [AUTHORITY_WORDS.not_in_snapshot, ' ', unavailableTag()]], ['Why', why], confirmation, coverage]);
  }
  return facts([
    ['Current rung (platform)', h('code', {}, a.current ?? 'none recorded')],
    ['Starting rung?', startingWords(a)],
    confirmation,
    ['What holds it back', a.constraint],
    ['Reasons (platform)', reasonList(a.reasons)],
    ['Ceiling (platform)', a.ceiling ? h('code', {}, a.ceiling) : 'None recorded'],
    ...(a.ceiling_note ? [['Ceiling note', a.ceiling_note]] : []),
    ['Why this ceiling', a.ceiling_reason ?? 'No reason recorded.'],
    coverage,
  ]);
}

export function capabilityDetail(r, check, { names = [], authority = null, sync = null } = {}) {
  // The rule's verdict is about the whole domain: counted over every row the platform recorded.
  const domainRows = authority?.status === 'ok' ? Object.values(authority.byId).map((p) => ({ platform: p })) : [];
  const status = toolRuleStatus(domainRows, authority);
  return [backToConsole('ladder'), h('h2', {}, r.name, ' ', draftBadge(r.validation)), h('p', {}, sourceFileTag(), ' ', h('code', {}, r.id)),
    facts([
      ['Classification', r.classification], ['Implementation state', r.implementation_state],
      ['Starting rung', r.starting],
      ['Human decision', r.human_decision ? '★ Yes: a human makes this decision at every level, forever.' : 'No'],
      ['Blocked by', r.blocked_by.length ? h('ul', {}, blockerTexts(r.blocked_by, names).map(blockerItem)) : 'Nothing recorded'],
      [r.granted_tools === null ? 'Tools it will need (grants not captured)' : 'Tools it will need', r.required_tools.length ? r.required_tools.map((t) => h('code', {}, `${t} `)) : 'None listed'],
    ]),
    // One source tag for the section: it opens the read line below the heading, not the heading as well.
    h('h3', {}, 'Authority'),
    r.platform ? authorityReadLine(sync) : null,
    authorityFacts(r, check, authority),
    ruleExplanation(status),
    h('h3', {}, 'Ladder'), ladderGrid([platformLadderRow(r)]),
    h('h3', {}, 'Behaviour per rung ', sourceFileTag()),
    h('p', { class: 'muted source-note' }, BEHAVIOUR_EXPOSURE.statement),
    behaviourTable(r.behaviours, false, { names })];
}

export function rungDetail(g, { names = [] } = {}) {
  return [backToConsole('behaviour'), h('h2', {}, g.stage), h('p', {}, platformTag('autonomyLadder.ts'), ' ', g.meaning),
    g.unreachable_by_fact ? h('p', { class: 'error' }, 'Unreachable by fact: coordinated handoff between agents does not exist in the platform today.') : null,
    h('h3', {}, 'Behaviours written for this rung ', sourceFileTag()), behaviourTable(g.behaviours, true, { names })];
}

// ---- Operator guides: where each primary action leads ----

const GUIDES = {
  capture: {
    panel: 'employee',
    title: 'Capture Panel 1 (Your employee) with your own sign-in',
    steps: [
      'Sign in to the portal yourself, in your own browser. Never use anyone else\'s login.',
      `Run the reviewed capture snippet (v4) in that tab's console. It only reads GET ${ENDPOINTS.mine} and GET ${ENDPOINTS.requests}, and downloads one file.`,
      'Save the downloaded file outside this repository, and send its location to the person preparing the snapshot. You do not run any redaction command yourself.',
      'The redaction and privacy check are done for you, outside this repository, and the report is shown to you. If redaction would empty a panel, the process stops and the platform owner is asked.',
      `Only the redacted file, after you have reviewed it, is placed at ${SNAPSHOT_FILE}. Nothing that identifies another person is committed.`,
    ],
    why: 'This page is public. Panel 1 (Your employee) reads an admin endpoint that a public page cannot and should not call, so a reviewed snapshot is the intended pattern (the platform owner\'s direction, 2026-11-02). Panel 5 (Your governance queue) is not captured: it reads only the platform\'s synced whole-domain snapshot.',
  },
  requests: {
    panel: 'governance',
    title: 'File or follow up a request',
    steps: [
      'Change requests and tool requests are filed and decided in the portal, not on this page.',
      REQUEST_RULE.statement,
      'A submitted request is waiting on a human; approved, declined and withdrawn are closed. None of them grants a tool or capability.',
      "After a decision, the platform's next sync of .colaberry/agent-domain.json brings the new status here. Refresh is manual; this page does not poll.",
    ],
    why: 'This console is read-only. It shows the queue; it never changes it.',
  },
  refresh: {
    panel: 'gaps',
    title: 'Refresh the data',
    steps: [
      'Press "Sync from GitHub" on the portal story page. The platform rewrites .colaberry/plan.json, progress.json and manifest.json.',
      'The "Data as of" stamp at the top of the console moves only when that data changes, and warns when it is over a week old.',
      'The capability source file is pinned to a platform commit. Updating it is a deliberate copy, checked by a test against the platform\'s git blob.',
    ],
    why: 'Every panel shows data as of its last sync or capture, never live data, and says so.',
  },
};

export function guidePage(key) {
  const g = GUIDES[key];
  if (!g) return [backToConsole(), h('h2', {}, 'Guide not found'), h('p', {}, `There is no guide "${key}".`)];
  return [backToConsole(g.panel), h('h2', {}, g.title), h('ol', { class: 'guide-steps' }, g.steps.map((s) => h('li', {}, s))), h('p', { class: 'muted' }, g.why)];
}

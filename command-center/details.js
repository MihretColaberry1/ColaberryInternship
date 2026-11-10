// Detail pages one level below the console: a capability, a rung, and the three operator guides the
// panels' primary actions point to. The capability page uses the same criterion 4 wording as the
// console (authorityView), and shows the R2 cap only as a labelled hypothetical.
import { h } from './dom.js';
import { badge, facts } from './ui.js';
import { REASON_TEXT, autonomyIndex } from './authority.js';
import { AUTHORITY_WORDS, ENDPOINTS, REGISTRY_ENTRY } from './agent-domain-facts.js';
import { SNAPSHOT_FILE } from './agent-domain-data.js';
import { withholdRecordIds } from './agent-domain-redact.js';
import { authorityView } from './agent-domain-model.js';
import { draftBadge, platformTag, sourceFileTag } from './agent-domain-ui.js';
import { backToConsole } from './console-ui.js';
import { ladderGrid } from './panel-ladder.js';
import { behaviourTable } from './panel-behaviour.js';

/**
 * A blocker as the research file records it, verbatim. The file was written when the registry seed said
 * agent_id: null, so its "no AI employee provisioned" blocker is annotated: that seed value is not kept
 * current for this domain, and the live endpoint decides whether an agent is linked. The pinned file
 * itself is never edited (a test checks it against the platform's git blob).
 */
export const STALE_AGENT_BLOCKER = 'no_ai_employee_provisioned';
function blockerItem(raw) {
  // Display-only: a staff member's internal record id in the blocker text is withheld.
  const b = withholdRecordIds(raw);
  if (!b.startsWith(STALE_AGENT_BLOCKER)) return h('li', {}, b);
  return h('li', {}, b, h('div', { class: 'muted' }, badge('warn', 'May be out of date'), ' ', REGISTRY_ENTRY.stale_note));
}

const reasonList = (reasons) => (reasons.length
  ? h('ul', {}, reasons.map((x) => h('li', {}, h('code', {}, x), ` ${REASON_TEXT[x] ?? ''}`))) : 'None returned.');

/** The labelled hypothetical Aleem asked to keep (2026-11-03). Not data, and never shown as current. */
export function hypotheticalText(r) {
  const capped = r.hypothetical.reasons.includes('no_tool_grants');
  if (capped) {
    return r.granted_tools === null
      ? `If a human approved this capability up to its ${r.ceiling} ceiling and no tool were granted, the no-tool-grants rule would hold it at autonomy:R2. Whether any tool is granted today was not captured.`
      : `If a human approved this capability up to its ${r.ceiling} ceiling, the no-tool-grants rule would hold it at autonomy:R2, because no tools are granted.`;
  }
  if (autonomyIndex(r.ceiling) <= autonomyIndex('autonomy:R2')) {
    return `Its ceiling is ${r.ceiling}, so the no-tool-grants rule would not change it even if a human approved it up to that ceiling.`;
  }
  return `If a human approved this capability up to its ${r.ceiling} ceiling, effectiveAuthority() would return ${r.hypothetical.effective_autonomy}.`;
}

export function capabilityDetail(r, check) {
  const a = authorityView(r);
  return [backToConsole('ladder'), h('h2', {}, r.name, ' ', draftBadge(r.validation)), h('p', {}, sourceFileTag(), ' ', h('code', {}, r.id)),
    facts([
      ['Classification', r.classification], ['Implementation state', r.implementation_state],
      ['Starting rung', r.starting], ['Ceiling (proposed)', r.ceiling],
      ['Why this ceiling', r.ceiling_reason ?? 'No reason recorded.'],
      ['Human decision', r.human_decision ? '★ Yes: a human makes this decision at every level, forever.' : 'No'],
      ['Blocked by', r.blocked_by.length ? h('ul', {}, r.blocked_by.map(blockerItem)) : 'Nothing recorded'],
      [r.granted_tools === null ? 'Tools it will need (grants not captured)' : 'Tools it will need', r.required_tools.length ? r.required_tools.map((t) => h('code', {}, `${t} `)) : 'None listed'],
    ]),
    h('h3', {}, 'Authority ', platformTag('autonomyLadder.ts')),
    facts([
      ['Current rung (effectiveAuthority())', h('code', {}, a.current ?? 'none')],
      ['Human approval', a.approval],
      ['What holds it back', a.constraint],
      ['Reasons returned', reasonList(a.reasons)],
      ['/coverage endpoint', check?.state === 'differs'
        ? h('ul', {}, check.diffs.map((d) => h('li', {}, `${d.field}: endpoint says ${d.endpoint}, source file says ${d.source_file}`)))
        : (check?.state ?? 'not captured yet').replace('_', ' ')],
    ]),
    h('div', { class: 'hypothetical', role: 'note' },
      h('p', { class: 'state-title' }, badge('neutral', 'Hypothetical: not an approval, not data'), ' If approved up to the ceiling'),
      h('p', {}, hypotheticalText(r)),
      h('p', { class: 'muted' }, `Today: ${AUTHORITY_WORDS.cap_idle}. No human has approved this capability above its starting rung.`)),
    h('h3', {}, 'Ladder'), ladderGrid([r]),
    h('h3', {}, 'Behaviour per rung ', sourceFileTag()), behaviourTable(r.behaviours, false)];
}

export function rungDetail(g) {
  return [backToConsole('behaviour'), h('h2', {}, g.stage), h('p', {}, platformTag('autonomyLadder.ts'), ' ', g.meaning),
    g.unreachable_by_fact ? h('p', { class: 'error' }, 'Unreachable by fact: coordinated handoff between agents does not exist in the platform today.') : null,
    h('h3', {}, 'Behaviours written for this rung ', sourceFileTag()), behaviourTable(g.behaviours, true)];
}

// ---- Operator guides: where each primary action leads ----

const GUIDES = {
  capture: {
    panel: 'employee',
    title: 'Capture Panels 1 and 5 (Your employee and Your governance queue) with your own sign-in',
    steps: [
      'Sign in to the portal yourself, in your own browser. Never use anyone else\'s login.',
      `Run the reviewed capture snippet (v4) in that tab's console. It only reads GET ${ENDPOINTS.mine} and GET ${ENDPOINTS.requests}, and downloads one file.`,
      'Save the downloaded file outside this repository, and send its location to the person preparing the snapshot. You do not run any redaction command yourself.',
      'The redaction and privacy check are done for you, outside this repository, and the report is shown to you. If redaction would empty a panel, the process stops and Ali Muwwakkil is asked.',
      `Only the redacted file, after you have reviewed it, is placed at ${SNAPSHOT_FILE}. Nothing that identifies another person is committed.`,
    ],
    why: 'This page is public. Panels 1 and 5 (Your employee and Your governance queue) read admin endpoints that a public page cannot and should not call, so a reviewed snapshot is the intended pattern (Ali Muwwakkil, 2026-11-02).',
  },
  requests: {
    panel: 'governance',
    title: 'File or follow up a request',
    steps: [
      'Change requests and tool requests are filed and decided in the portal, not on this page.',
      'Filing a request grants nothing. A decision records approved or declined and stops: it starts no build and grants no tool.',
      'After a decision, capture Panel 5 again so this console shows the new status.',
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

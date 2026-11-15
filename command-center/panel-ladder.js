// Panel "The autonomy ladder" (brief panel 3): where is this going?
// Criterion 3: all ten rungs in the owner's words, each ceiling marked against the rung it stops at.
// Criterion 4: each capability's authority and the no_tool_grants rule, exactly as the platform recorded
// them (`authority[]` and `authority_rule` in .colaberry/agent-domain.json), never recalculated here.
// Human confirmation is a separate platform record the snapshot does not carry, so it is shown as
// not available rather than inferred.
import { h } from './dom.js';
import { badge, table } from './ui.js';
import { AUTONOMY_STAGES, autonomyIndex } from './authority.js';
import { AUTHORITY_WORDS, ENDPOINTS, R8_UNREACHABLE, TOOL_RULE } from './agent-domain-facts.js';
import { authorityView, ladderCell, platformLadderRow, toolRuleStatus } from './agent-domain-model.js';
import { endpointTags, lastChangedWords, platformTag, sourceFileTag, sourceTag, unavailableTag, valueTag } from './agent-domain-ui.js';
import { PLATFORM_SYNC_FILE } from './agent-domain-data.js';
import { consolePanel, loadingBlock, errorBlock, notAvailable } from './console-ui.js';
import { capabilityHref } from './panel-inventory.js';

export const rungHref = (stage) => `#/rung/${encodeURIComponent(stage)}`;

const CELL = {
  start_and_ceiling: 'start · ceiling', start: 'start', ceiling: 'ceiling', within: '·', below_start: '',
  above_ceiling: 'unreachable', unreachable_by_fact: 'unreachable by fact', no_ceiling: 'no ceiling recorded',
};

/** The tag for a value from the platform's own authority record, as synced into this repository. */
export const authorityTag = () => valueTag(ENDPOINTS.domain, { origin: 'platform_sync' });

/** Rows must already carry the platform's ceiling (platformLadderRow): the grid draws what it is given. */
export function ladderGrid(rows) {
  return h('div', { class: 'table-wrap', tabindex: '0' }, h('table', { class: 'ladder' },
    h('caption', { class: 'visually-hidden' }, 'Each capability against the ten rungs'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Capability'),
      AUTONOMY_STAGES.map((s) => h('th', { scope: 'col', class: s === R8_UNREACHABLE.rung ? 'rung-fact' : null },
        s.replace('autonomy:', ''), s === R8_UNREACHABLE.rung ? h('div', { class: 'muted' }, 'no handoff exists') : null)))),
    h('tbody', {}, rows.map((r) => h('tr', {},
      h('th', { scope: 'row' }, h('a', { href: capabilityHref(r.id) }, r.name),
        r.ceiling_reason ? h('details', {}, h('summary', {}, 'Why this ceiling'), h('p', {}, r.ceiling_reason)) : h('p', { class: 'muted' }, 'No ceiling reason recorded.')),
      AUTONOMY_STAGES.map((s) => {
        const c = ladderCell(r, s);
        return h('td', { class: `cell-${c}` }, CELL[c]);
      }))))));
}

/** One line saying where the authority values came from, and when the platform last rewrote them. */
export function authorityReadLine(sync) {
  return h('p', { class: 'reads' }, authorityTag(),
    ` The platform's own authority record (authority[] and authority_rule) in its synced copy of GET ${ENDPOINTS.domain}, `
    + `${lastChangedWords(sync?.last_changed ?? null)}. Read from this repository as the platform wrote it; this page did not call `
    + 'the endpoint and does not recalculate anything.');
}

/** The rule's verdict in words, also when zero, and plainly when the platform's data disagrees with itself. */
export function toolRuleVerdict(s) {
  // Field names go in <code>, which may wrap anywhere, so a long name never forces sideways scrolling at 320 px.
  return !s.consistent
    ? ["The platform's data disagrees with itself: ", h('code', {}, 'authority_rule.binds_nothing'), ` is ${s.binds_nothing}, but ${s.held} of ${s.recorded} `
      + 'capabilities carry the reason no_tool_grants. Both are shown as recorded; this page does not choose between them.']
    : s.held > 0
      ? `${AUTHORITY_WORDS.cap_holding.replace('this capability', `${s.held} of ${s.total} capabilities`)}.`
      : `${AUTHORITY_WORDS.cap_idle}: it holds 0 of ${s.total} capabilities.`;
}

/** Criterion 4: the platform's rule, its verdict, the counts behind it, and the platform's own note. */
export function toolRuleBlock(s) {
  return h('div', { class: 'tool-rule', role: 'note' },
    h('p', { class: 'state-title' }, 'The tool rule ', h('code', {}, TOOL_RULE.reason), ' ', authorityTag(), ' ', platformTag(TOOL_RULE.source.path, TOOL_RULE.source.commit)),
    h('p', {}, s.rule),
    h('p', {}, h('strong', {}, toolRuleVerdict(s))),
    h('ul', {},
      h('li', {}, `The platform records ${s.approved_above_r2} ${s.approved_above_r2 === 1 ? 'capability' : 'capabilities'} with a level above autonomy:R2 (`,
        h('code', {}, 'authority_rule.approved_above_r2'), ').'),
      h('li', {}, `${s.held} of ${s.recorded} capabilities carry the reason no_tool_grants in the platform's authority record.`),
      s.recorded < s.total ? h('li', {}, `${s.total - s.recorded} of ${s.total} capabilities have no row in the platform's authority record.`) : null),
    s.note ? h('p', { class: 'muted' }, 'The platform\'s note: ', s.note) : null);
}

/** Each capability's current rung, confirmation and constraint: the same words as its detail page. */
function authorityTable(rows) {
  return table([
    { label: 'Capability', cell: (r) => h('a', { href: capabilityHref(r.id) }, r.name) },
    { label: 'Current rung (platform)', cell: (r) => (r.platform ? h('code', {}, authorityView(r).current ?? 'none recorded') : AUTHORITY_WORDS.not_in_snapshot) },
    { label: 'Starting rung?', cell: (r) => startingWords(authorityView(r)) },
    { label: 'Human confirmation', cell: () => ['Not available ', unavailableTag()] },
    { label: 'What holds it back', cell: (r) => authorityView(r).constraint },
    { label: 'Reasons (platform)', cell: (r) => (r.platform?.reasons.length ? r.platform.reasons.map((x) => h('div', {}, h('code', {}, x))) : '—') },
  ], rows);
}

/** "Starting rung", or which rung it started at; the starting rung is the research file's. */
export function startingWords(v) {
  if (v.isStarting == null) return '—';
  return v.isStarting ? AUTHORITY_WORDS.starting : `${AUTHORITY_WORDS.not_starting} (started at ${v.starting})`;
}

/** All ten rungs, in the owner's words, with the platform's ceilings that stop at each (criterion 3). */
function rungList(rows, rungs) {
  const ceilings = rows.map((r) => r.platform?.max_permitted_autonomy ?? null);
  return h('ol', { class: 'rung-list' }, rungs.map((g) => {
    const i = autonomyIndex(g.stage);
    const here = ceilings.filter((c) => c === g.stage).length;
    const above = ceilings.filter((c) => c != null && autonomyIndex(c) < i).length;
    return h('li', {},
      h('a', { href: rungHref(g.stage), class: 'rung-code' }, h('code', {}, g.stage)),
      h('span', { class: 'rung-meaning' }, g.meaning),
      h('span', { class: 'rung-marks' },
        here ? badge('warn', `Ceiling for ${here} of ${rows.length}`) : null,
        g.unreachable_by_fact ? badge('error', 'Unreachable by fact for every capability')
          : above ? h('span', { class: 'muted' }, `Unreachable for ${above} of ${rows.length} (above their ceiling)`) : null));
  }));
}

/** The single phrase for the console headline: identical to the per-row and detail-page wording. */
function authorityHeadline(rows) {
  const views = rows.map(authorityView);
  const same = views.every((v) => v.current === views[0].current && v.isStarting === views[0].isStarting);
  if (!same || views[0].current == null) return 'Current rungs differ by capability; open "Each capability\'s authority" for each one.';
  return [h('code', {}, views[0].current), ` for all ${rows.length}: ${startingWords(views[0])} — ${AUTHORITY_WORDS.confirmation_short}.`];
}

function ladderState(rows, sourceState, authority) {
  if (sourceState !== 'ready') return sourceState;
  if (!authority || authority.status === 'not_synced' || authority.status === 'missing') return 'not_available';
  if (authority.status !== 'ok') return 'error';
  return rows.length === 0 ? 'empty' : 'ready';
}

function stateBody(state, { sourceError, authority }) {
  if (state === 'loading') return loadingBlock();
  if (state === 'not_available') {
    return notAvailable({
      missing: `The platform's authority record (authority[] and authority_rule) in ${PLATFORM_SYNC_FILE}.`,
      waitingFor: `The platform to sync ${PLATFORM_SYNC_FILE} into this repository with its authority section. Nothing is calculated in its place.`,
      willShow: "Each capability's current rung, reasons and ceiling as the platform recorded them, and the no_tool_grants rule's verdict.",
      action: { href: '#/guide/refresh', label: 'How to refresh the data' },
    });
  }
  if (state === 'error') {
    const what = authority && authority.status !== 'ok' ? "The platform's authority record could not be used." : 'The capability source file could not be read.';
    return errorBlock({ what, why: authority?.error ?? sourceError, action: { href: '#/guide/refresh', label: 'How to refresh the data' } });
  }
  return null;
}

export function renderLadderPanel(rows, rungs, { order, sourceState = 'ready', sourceError, authority = null, sync = null } = {}) {
  const state = ladderState(rows, sourceState, authority);
  const status = toolRuleStatus(rows, authority);
  const ready = state === 'ready';
  return consolePanel({
    id: 'ladder', order, state,
    headline: ready ? authorityHeadline(rows) : null,
    title: 'The autonomy ladder',
    question: 'Where is this going?',
    glance: ready ? [
      ['Tool-grant cap', status.held > 0 ? AUTHORITY_WORDS.cap_holding : AUTHORITY_WORDS.cap_idle],
      ['Capabilities it holds at autonomy:R2', String(status.held)],
      ['Human confirmation', ['Not available from the platform yet ', unavailableTag()]],
      ['Your employee\'s rung', ['Unknown: no source records an agent\'s rung on this ladder ', unavailableTag()]],
      ['autonomy:R8', 'Unreachable by fact: no agent handoff exists'],
    ] : null,
    body: ready ? [toolRuleBlock(status), h('h3', { class: 'section-title' }, "The ten rungs, in the owner's words"), rungList(rows, rungs)]
      : stateBody(state, { sourceError, authority }),
    action: ready ? { href: capabilityHref(rows[0].id), label: "Open a capability's authority record" } : null,
    reads: [endpointTags(3), authorityTag(), ' ', platformTag('autonomyLadder.ts'), ' ', sourceFileTag(), ' ', platformTag(R8_UNREACHABLE.source.path)],
    details: ready ? [
      { title: "Each capability's authority", count: rows.length, body: [authorityReadLine(sync),
        h('p', { class: 'muted source-note' }, sourceFileTag(), ' Capability names and starting rungs come from the pinned research file. ',
          sourceTag('unavailable', 'no verified source'), ' Human confirmation is a separate platform record (AgentDomainCapabilityConfirmation) that the platform does not expose yet.'),
        authorityTable(rows)] },
      { title: 'Each capability against the ladder, with its ceiling', count: rows.length, body: [
        h('p', { class: 'muted' }, 'Ceilings are the platform\'s max_permitted_autonomy for each capability. Rungs above a ceiling are unreachable for that capability, not future work.'),
        ladderGrid(rows.map(platformLadderRow))] },
    ] : [],
  });
}

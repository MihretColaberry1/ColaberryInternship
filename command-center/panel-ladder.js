// Panel "The autonomy ladder" (brief panel 3): where is this going?
// Criterion 3: all ten rungs in the owner's words, each ceiling marked. Criterion 4: the authority
// effectiveAuthority() returns, and the no_tool_grants rule with the number it constrains, in words.
import { h } from './dom.js';
import { badge, table } from './ui.js';
import { AUTONOMY_STAGES } from './authority.js';
import { AUTHORITY_WORDS, R8_UNREACHABLE, TOOL_RULE } from './agent-domain-facts.js';
import { authorityView, ladderCell, toolRuleStatus } from './agent-domain-model.js';
import { capabilitySourceNote, endpointTags, platformTag, sourceFileTag, unavailableTag } from './agent-domain-ui.js';
import { consolePanel, loadingBlock, errorBlock } from './console-ui.js';
import { capabilityHref } from './panel-inventory.js';

export const rungHref = (stage) => `#/rung/${encodeURIComponent(stage)}`;

const CELL = {
  start_and_ceiling: 'start · ceiling', start: 'start', ceiling: 'ceiling', within: '·', below_start: '',
  above_ceiling: 'unreachable', unreachable_by_fact: 'unreachable by fact', no_ceiling: 'no ceiling recorded',
};

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

/** Criterion 4: the rule, the number it constrains (in words when zero), and why. Counted, never asserted. */
export function toolRuleBlock(s) {
  const verdict = s.held > 0
    ? `${AUTHORITY_WORDS.cap_holding.replace('this capability', `${s.held} of ${s.total} capabilities`)}.`
    : `${AUTHORITY_WORDS.cap_idle}: it holds 0 of ${s.total} capabilities.`;
  return h('div', { class: 'tool-rule', role: 'note' },
    h('p', { class: 'state-title' }, 'The tool rule ', h('code', {}, 'no_tool_grants'), ' ', platformTag(TOOL_RULE.source.path, TOOL_RULE.source.commit)),
    h('p', {}, TOOL_RULE.rule),
    h('p', {}, h('strong', {}, verdict)),
    s.held > 0 ? null : h('ul', {},
      h('li', {}, `${s.approved_above_r2} of ${s.total} have a level above autonomy:R2 approved by a human (${s.approved} have any approved level at all).`),
      h('li', {}, `${s.starting_r0} of ${s.total} are at their starting rung, autonomy:R0; ${s.starting_above_r2} start above autonomy:R2.`),
      h('li', {}, s.grants_known ? `${s.with_tools} of ${s.total} have a tool granted.`
        : 'Tool grants were not captured. That does not change the verdict: the rule acts only on an approved level above autonomy:R2, and none exists.'),
      h('li', {}, 'A ceiling above R2 is a proposal, not an approval, so the rule does not act on it.')),
    h('p', { class: 'muted' }, 'Nothing here is invented to make the rule fire. It binds only when a named human approves a level above autonomy:R2 while no tools are granted.'));
}

/** Each capability's current rung, approval and constraint: the same words as its detail page. */
function authorityTable(rows) {
  return table([
    { label: 'Capability', cell: (r) => h('a', { href: capabilityHref(r.id) }, r.name) },
    { label: 'Current rung (effectiveAuthority())', cell: (r) => h('code', {}, authorityView(r).current ?? 'none') },
    { label: 'Human approval', cell: (r) => authorityView(r).approval },
    { label: 'What holds it back', cell: (r) => authorityView(r).constraint },
    { label: 'Reasons returned', cell: (r) => (r.authority.reasons.length ? r.authority.reasons.map((x) => h('div', {}, h('code', {}, x))) : '—') },
  ], rows);
}

/** All ten rungs, in the owner's words, with the ceilings that stop at each (criterion 3). */
function rungList(rows, rungs) {
  return h('ol', { class: 'rung-list' }, rungs.map((g) => h('li', {},
    h('a', { href: rungHref(g.stage), class: 'rung-code' }, h('code', {}, g.stage)),
    h('span', { class: 'rung-meaning' }, g.meaning),
    h('span', { class: 'rung-marks' },
      g.ceilings_here.length ? badge('warn', `Ceiling for ${g.ceilings_here.length} of ${rows.length}`) : null,
      g.unreachable_by_fact ? badge('error', 'Unreachable by fact for every capability')
        : g.above_ceiling ? h('span', { class: 'muted' }, `Unreachable for ${g.above_ceiling} of ${rows.length} (above their ceiling)`) : null))));
}

/** The single phrase for the console headline: identical to the per-row and detail-page wording. */
function authorityHeadline(rows) {
  const views = rows.map(authorityView);
  const same = views.every((v) => v.current === views[0].current && v.approval === views[0].approval);
  if (!same) return `Current rungs differ by capability; open "Each capability's authority" for each one.`;
  return [h('code', {}, views[0].current ?? 'none'), ` for all ${rows.length}: ${views[0].approval}.`];
}

export function renderLadderPanel(rows, rungs, { order, sourceState = 'ready', sourceError } = {}) {
  const state = sourceState !== 'ready' ? sourceState : rows.length === 0 ? 'empty' : 'ready';
  const status = toolRuleStatus(rows);
  const capped = rows.find((r) => r.hypothetical.reasons.includes('no_tool_grants'));
  return consolePanel({
    id: 'ladder', order, state,
    headline: state === 'ready' ? authorityHeadline(rows) : null,
    title: 'The autonomy ladder',
    question: 'Where is this going?',
    glance: state === 'ready' ? [
      ['Tool-grant cap', status.held > 0 ? AUTHORITY_WORDS.cap_holding : AUTHORITY_WORDS.cap_idle],
      ['Capabilities it holds at autonomy:R2', String(status.held)],
      ['Your employee\'s rung', ['Unknown: no source records an agent\'s rung on this ladder ', unavailableTag()]],
      ['autonomy:R8', 'Unreachable by fact: no agent handoff exists'],
    ] : null,
    body: state === 'ready' ? [toolRuleBlock(status), h('h3', { class: 'section-title' }, "The ten rungs, in the owner's words"), rungList(rows, rungs)]
      : state === 'loading' ? loadingBlock()
        : state === 'error' ? errorBlock({ what: 'The capability source file could not be read.', why: sourceError, action: { href: '#/guide/refresh', label: 'How to refresh the data' } }) : null,
    action: state === 'ready' && capped ? { href: capabilityHref(capped.id), label: 'See how the R2 cap would apply' } : null,
    reads: [endpointTags(3), platformTag('autonomyLadder.ts'), ' ', sourceFileTag(), ' ', platformTag(R8_UNREACHABLE.source.path)],
    details: state === 'ready' ? [
      { title: "Each capability's authority", count: rows.length, body: [capabilitySourceNote(), authorityTable(rows)] },
      { title: 'Each capability against the ladder, with its ceiling', count: rows.length, body: [
        h('p', { class: 'muted' }, 'Rungs above a ceiling are unreachable for that capability, not future work. Each ceiling is proposed in the draft research with its reason on record; no one has approved it yet.'),
        ladderGrid(rows)] },
    ] : [],
  });
}

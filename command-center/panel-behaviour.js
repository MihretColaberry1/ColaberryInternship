// Panel "Per-rung behaviour" (brief panel 4): what does the next rung require of me?
// Every behaviour and its acceptance criteria are read from release_behaviour[] in the pinned source
// file. None is invented, none is approved, and none has evidence recorded against it.
import { h } from './dom.js';
import { badge, table } from './ui.js';
import { autonomyIndex, AUTONOMY_STAGES } from './authority.js';
import { capabilitySourceNote, endpointTags, sourceFileTag } from './agent-domain-ui.js';
import { consolePanel, errorBlock, loadingBlock } from './console-ui.js';
import { rungHref } from './panel-ladder.js';
import { withholdNames } from './agent-domain-redact.js';

/**
 * Wording only (Mihret's privacy correction, 2026-11-10): the accountable manager's name in a behaviour
 * or its criteria reads "the accountable manager" on this public page. The pinned file is unchanged, and
 * which behaviours are shown, and from where, is unchanged. With no name list the text is shown as it is;
 * that happens only when the source file is not loaded, and then there are no rows to show.
 */
export function behaviourTable(items, withCapability, { names = [] } = {}) {
  const say = (text) => withholdNames(text, names) ?? text;
  return table([
    withCapability ? { label: 'Capability', cell: (b) => b.capability_name } : { label: 'Rung', cell: (b) => h('code', {}, b.autonomy) },
    { label: 'Behaviour at this rung', cell: (b) => say(b.behaviour) },
    { label: 'Its acceptance criteria', cell: (b) => say(b.acceptance_criteria) },
    { label: 'State', cell: () => badge('warn', 'Draft · not evidenced') },
  ], items, 'No behaviour is written for this rung.');
}

/** The next rung above the lowest starting rung: the one the operator would decide on first. */
export function nextRung(rows) {
  const lowest = Math.min(...rows.map((r) => autonomyIndex(r.starting)).filter((i) => i >= 0));
  return Number.isFinite(lowest) ? AUTONOMY_STAGES[Math.min(lowest + 1, AUTONOMY_STAGES.length - 1)] : null;
}

export function renderBehaviourPanel(rows, rungs, { order, sourceState = 'ready', sourceError, names = [] } = {}) {
  const total = rungs.reduce((n, g) => n + g.behaviours.length, 0);
  const state = sourceState !== 'ready' ? sourceState : total === 0 ? 'empty' : 'ready';
  const next = nextRung(rows);
  const nextGroup = rungs.find((g) => g.stage === next);
  const without = rows.filter((r) => r.behaviours.length === 0).length;
  return consolePanel({
    id: 'behaviour', order, state,
    headline: state === 'ready' ? [`The next rung for every capability is `, h('code', {}, next), `: ${nextGroup?.behaviours.length ?? 0} behaviours are written for it.`]
      : state === 'empty' ? 'No behaviour is written for any rung yet. Defining one is the first piece of work on each capability.' : null,
    title: 'Per-rung behaviour',
    question: 'What does the next rung require of me?',
    glance: state === 'ready' ? [
      ['Behaviours written', `${total} across ${rows.length} capabilities`],
      ['Capabilities with no behaviour written', String(without)],
      ['Approved or evidenced', 'None: all draft'],
    ] : null,
    body: state === 'loading' ? loadingBlock()
      : state === 'error' ? errorBlock({ what: 'The capability source file could not be read.', why: sourceError, action: { href: '#/guide/refresh', label: 'How to refresh the data' } })
        : capabilitySourceNote(),
    action: state === 'ready' && next ? { href: rungHref(next), label: `Read what ${next} requires` } : null,
    reads: [endpointTags(4), sourceFileTag(), ' ', h('code', {}, 'release_behaviour[]')],
    details: state === 'ready' ? [
      { title: 'Behaviours written for each rung', count: rungs.length, body: table([
        { label: 'Rung', cell: (g) => h('a', { href: rungHref(g.stage) }, g.stage) },
        { label: 'Behaviours written', cell: (g) => String(g.behaviours.length) },
        { label: 'Note', cell: (g) => (g.unreachable_by_fact ? 'Unreachable by fact: no agent handoff exists'
          : (g.behaviours.length ? 'Open the rung to read them' : 'None written for this rung')) },
      ], rungs) },
      nextGroup ? { title: `What ${next} requires, capability by capability`, count: nextGroup.behaviours.length, body: behaviourTable(nextGroup.behaviours, true, { names }) } : null,
    ] : [],
  });
}

// Building blocks for the six-panel console: the panel shell, its five states, the "Not available"
// block, collapsed disclosures and the one primary action per panel. Every state is said in words;
// colour and border style only reinforce them.
import { h } from './dom.js';

/** The five states every panel can be in, and the word shown for each. */
export const PANEL_STATES = Object.freeze({
  loading: 'Loading',
  ready: 'Ready',
  empty: 'Empty',
  not_available: 'Not available',
  error: 'Error',
});

export function stateChip(state) {
  return h('span', { class: `state-chip state-chip-${state}` },
    h('span', { class: 'visually-hidden' }, 'Panel state: '), PANEL_STATES[state] ?? state);
}

/** The single primary action of a panel: always a link, because this page changes nothing. */
export function primaryAction({ href, label }) {
  return h('p', { class: 'panel-action' }, h('a', { class: 'btn-primary', href }, label));
}

/** Long content, collapsed until the operator opens it. */
export function disclosure({ title, count, body, id }) {
  return h('details', { class: 'disclosure', id: id ?? null },
    h('summary', {}, title, count != null ? h('span', { class: 'muted' }, ` (${count})`) : null),
    h('div', { class: 'disclosure-body' }, body));
}

/**
 * The "Not available" block (Aleem, 2026-11-03): what is missing, what it waits for, what the panel
 * will show when it arrives, and one next action. The action here IS the panel's primary action.
 */
export function notAvailable({ missing, waitingFor, willShow, action }) {
  return h('div', { class: 'not-available' },
    h('dl', { class: 'na-list' },
      h('dt', {}, 'Missing'), h('dd', {}, missing),
      h('dt', {}, 'Waiting for'), h('dd', {}, waitingFor),
      h('dt', {}, 'Will show'), h('dd', {}, willShow)),
    action ? primaryAction(action) : null);
}

/** An error block: what failed, in words, and what to do. */
export function errorBlock({ what, why, action }) {
  return h('div', { class: 'error-block', role: 'alert' },
    h('p', { class: 'state-title' }, what),
    why ? h('p', {}, why) : null,
    action ? primaryAction(action) : null);
}

/** A loading block, visibly different from "Not available": no dashed border, and aria-busy. */
export function loadingBlock(text = 'Reading the sources…') {
  return h('div', { class: 'loading-block' }, h('p', {}, text));
}

/**
 * One panel. spec: { id, order, title, question, state, headline, glance: [[label, value]], body,
 * action: { href, label }, reads, details: [{ title, count, body }] }. A panel in the "Not
 * available" or "Error" state carries its action inside that block, so it is never shown twice.
 */
export function consolePanel(spec) {
  const titleId = `panel-${spec.id}-title`;
  return h('section', {
    class: `panel panel-state-${spec.state}`, id: `panel-${spec.id}`, 'data-panel': spec.id, 'data-state': spec.state,
    'aria-labelledby': titleId, 'aria-busy': spec.state === 'loading' ? 'true' : null,
  },
  h('header', { class: 'panel-head' },
    h('h2', { id: titleId, class: 'panel-title' }, h('span', { class: 'panel-order', 'aria-hidden': 'true' }, String(spec.order)), spec.title),
    stateChip(spec.state)),
  h('p', { class: 'panel-question' }, spec.question),
  spec.headline ? h('p', { class: 'panel-headline' }, spec.headline) : null,
  spec.glance?.length ? h('dl', { class: 'glance' }, spec.glance.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])) : null,
  spec.body ?? null,
  spec.action ? primaryAction(spec.action) : null,
  h('div', { class: 'panel-reads' }, h('span', { class: 'muted' }, 'Reads: '), spec.reads),
  spec.details?.length ? h('div', { class: 'panel-details' }, spec.details.filter(Boolean).map(disclosure)) : null);
}

/** A detail page's way back to the console, landing on the panel it came from. */
export function backToConsole(panelId) {
  return h('a', { class: 'back', href: panelId ? `#/panel/${panelId}` : '#/' }, '← Back to the console');
}

// Panel "What is not available" (brief panel 6): what would I be lying about?
// Each gap names the source that proves it. The project plan's empty areas from the old nine tabs
// (outcomes, roles, systems, data tables) are listed here as named gaps, not as empty pages.
import { h } from './dom.js';
import { table } from './ui.js';
import { AGENT_LINK_SOURCE, ENDPOINTS, NO_APPROVALS_RECORDED, R8_UNREACHABLE, REGISTRY_ENTRY } from './agent-domain-facts.js';
import { toolGrantWords } from './agent-domain-model.js';
import { endpointTags, lastChangedWords, platformTag, sourceFileTag, sourceTag, unavailableTag, valueTag } from './agent-domain-ui.js';
import { consolePanel, loadingBlock } from './console-ui.js';
import { planGaps } from './project-sections.js';
import { withholdNames } from './agent-domain-redact.js';
import { ticksAheadOfVerifier, verifierWords, yourTickWords } from './verification-model.js';
import { PLATFORM_SYNC_FILE } from './agent-domain-data.js';

const progressTag = () => h('span', { class: 'src src-plan' }, 'Project plan', h('span', { class: 'src-detail' }, ' · .colaberry/progress.json'));
const syncTag = () => sourceTag('platform_sync', PLATFORM_SYNC_FILE);

/**
 * Decision D3 (2026-11-10), first item: a story whose ticks claim more than the platform verifier
 * records. The two numbers stay separate, and the verifier's own reason is quoted when the synced
 * file carries one (names withheld, decision D4).
 */
export function aheadItems(rows, reasons = {}, names = []) {
  return ticksAheadOfVerifier(rows).map((a) => {
    const said = (reasons[a.id] ?? []).map((x) => withholdNames(x, names) ?? '').filter(Boolean);
    return [[progressTag(), ' ', syncTag()],
      `Your ticks are ahead of the platform verifier for ${a.id}: ${yourTickWords(a)}, but ${verifierWords(a)}. `
      + 'These are two different records and are not equivalent; a story counts as verified only on the platform verifier\'s record.'
      + (said.length ? ` The verifier's reason, as of its last sync: ${said.join(' ')}` : '')];
  });
}

/**
 * Decision D3, second item: an outstanding data-integration limitation, not an agent failure. Names the
 * snapshot sections the console deliberately does not display yet; never reads their values.
 */
export function integrationItem(notShown = []) {
  if (!notShown.length) return null;
  const list = notShown.map((s) => (s.size == null ? s.section : `${s.section} (${s.size} rows)`)).join(' and ');
  return [syncTag(),
    `Outstanding data-integration limitation, not an agent failure: the platform snapshot already carries ${list}, `
    + 'but this console does not display them yet. The platform\'s capability projection for the autonomy ladder, per-rung behaviour '
    + 'and governance panels is being extended; those panels will read the updated structure once it is confirmed. Until then the '
    + 'autonomy ladder computes authority from the pinned research file, as it says.'];
}

const ENDPOINT_WORDS = { not_captured: 'Not captured yet: left blank.', loading: 'Loading…' };

/**
 * The agent gap, from the live endpoint (gaps.agent). The registry's agent_id: null is named as a stale
 * seed value, never as evidence that no agent exists.
 */
export function agentGapItem(agent) {
  const link = agent ?? { state: 'unknown', reason: 'not_captured' };
  const seed = `The registry's agent_id: null is a seed value, not kept current for this domain, so it is not evidence either way.`;
  if (link.state === 'linked') {
    const grants = link.tools_granted_count == null
      ? 'Its enabled state, autonomy level and tool grants were not captured, so this console does not say whether any tool is granted.'
      : `Tools granted: ${toolGrantWords(link)}.`;
    return [valueTag(ENDPOINTS.mine, link), `An agent is linked to this domain. ${grants} ${seed}`];
  }
  if (link.state === 'not_linked') {
    return [valueTag(ENDPOINTS.mine, link), 'The captured response links no agent to this domain, so no agent holds a tool grant.'];
  }
  return [platformTag(AGENT_LINK_SOURCE.source.path, AGENT_LINK_SOURCE.source.commit),
    `Whether an agent is linked to this domain is not captured. ${seed}`];
}

/**
 * The gaps, in a fixed order: the first six are capability and agent gaps (renderGapsPanel keeps items
 * 0 and 3 onward when the source file is missing), then the two decision D3 items.
 */
export function gapItems(gaps, { rows = [], reasons = {}, names = [], notShown = [] } = {}) {
  return [
    [platformTag(R8_UNREACHABLE.source.path), R8_UNREACHABLE.statement],
    [sourceFileTag(), `${gaps.drafts.count} of ${gaps.drafts.total} capabilities are draft. A draft capability has not been agreed by anyone.`],
    [sourceFileTag(), gaps.no_behaviour.length
      ? `${gaps.no_behaviour.length} capabilities have an empty release_behaviour[]: no next rung is defined, and defining it is the first piece of work on each.`
      : `None of the ${gaps.drafts.total} capabilities has an empty release_behaviour[]. Every one has at least one rung written, all of it draft.`],
    agentGapItem(gaps.agent),
    [platformTag(NO_APPROVALS_RECORDED.source.path), NO_APPROVALS_RECORDED.statement],
    // Decision D4: neutral words; no name, no account records.
    [platformTag(REGISTRY_ENTRY.source.path), REGISTRY_ENTRY.blocker],
    ...aheadItems(rows, reasons, names),
    integrationItem(notShown),
  ].filter(Boolean);
}

function planGapTable(project) {
  if (!project) return h('p', { class: 'empty' }, 'The project plan is still loading.');
  if (project.error) return h('p', { class: 'error' }, `The project plan could not be read: ${project.error.message}`);
  return table([
    { label: 'Area', cell: (g) => g.what },
    { label: 'In the plan', cell: (g) => (g.count ? String(g.count) : ['0 ', unavailableTag()]) },
    { label: 'Why it is blank', cell: (g) => g.missing },
    { label: 'Will show', cell: (g) => g.willShow },
  ], planGaps(project.data));
}

export function renderGapsPanel(gaps, { order, sourceState = 'ready', project, names = [], sync = null } = {}) {
  const state = sourceState === 'loading' ? 'loading' : 'ready';
  const extra = { rows: project?.model?.rows ?? [], reasons: sync?.verdict_reasons ?? {}, names, notShown: sync?.not_shown ?? [] };
  const ahead = ticksAheadOfVerifier(extra.rows);
  // With no source file, capability counts would read "0 of 0": say the file is missing instead.
  const items = sourceState === 'ready' ? gapItems(gaps, extra)
    : sourceState === 'error' ? [[sourceFileTag(), 'The capability source file could not be read, so no capability gap can be counted.'],
      ...gapItems(gaps, extra).filter((_, i) => i === 0 || i >= 3)] : [];
  const endpointsDown = gaps?.endpoints_not_ready ?? [];
  const synced = gaps?.endpoints_synced ?? [];
  return consolePanel({
    id: 'gaps', order, state,
    headline: state === 'ready' ? `${items.length} things this console cannot show or cannot claim, each with the source that proves it.` : null,
    title: 'What is not available',
    question: 'What would I be lying about?',
    glance: state === 'ready' ? [
      ['Endpoints with no usable response', `${endpointsDown.length} of ${Object.keys(ENDPOINTS).length}`],
      // Shorter at a glance (approved 2026-11-10); the details section keeps the full title.
      ['Endpoints from the sync', `${synced.length} of ${Object.keys(ENDPOINTS).length}`
        + (synced.length ? `, ${lastChangedWords(synced[0].last_changed)}` : '')],
      ['Fields with no verified source', String(gaps.unavailable.length)],
      // Short label: the glance grid gives a long label its full width and squeezes the value (820 px check).
      ['Ticks ahead of verifier', project?.model ? `${ahead.length} ${ahead.length === 1 ? 'story' : 'stories'}` : 'project plan not loaded'],
    ] : null,
    body: state === 'loading' ? loadingBlock()
      : h('ul', { class: 'gap-list' }, items.map(([tag, text]) => h('li', {}, tag, h('p', {}, text)))),
    action: state === 'ready' ? { href: '#/guide/refresh', label: 'Refresh the data from the portal' } : null,
    reads: [endpointTags(6), platformTag('autonomyLadder.ts'), ' ', sourceFileTag()],
    details: state === 'ready' ? [
      { title: 'Endpoints with no usable response', count: endpointsDown.length, body: endpointsDown.length
        ? h('ul', { class: 'gap-list' }, endpointsDown.map((e) => h('li', {}, sourceTag('endpoint', `GET ${ENDPOINTS[e.key]}`),
          h('p', {}, ENDPOINT_WORDS[e.state] ?? `Not read (${e.state}${e.status ? `, HTTP ${e.status}` : ''}): left blank.`))))
        : h('p', {}, 'Every endpoint returned a response in the captured snapshot.') },
      synced.length ? { title: 'Endpoints read from the platform sync', count: synced.length, body: [
        h('p', { class: 'muted' }, 'The platform writes these into this repository. "Last changed" is when it last rewrote them, not when anything was checked.'),
        h('ul', { class: 'gap-list' }, synced.map((e) => h('li', {}, valueTag(ENDPOINTS[e.key], { origin: 'platform_sync' }),
          h('p', {}, `Read from this repository, ${lastChangedWords(e.last_changed)}.`))))] } : null,
      { title: 'Fields left blank because no verified source exists', count: gaps.unavailable.length, body: table([
        { label: 'Panel', cell: (f) => f.panel }, { label: 'Field', cell: (f) => h('code', {}, f.field) },
        { label: 'Value', cell: () => unavailableTag() }, { label: 'Why', cell: (f) => f.why }], gaps.unavailable) },
      { title: 'Not in the project plan yet', body: planGapTable(project) },
    ] : [],
  });
}

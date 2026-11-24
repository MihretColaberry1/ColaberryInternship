// The six-panel console (STORY-000, current brief of 2026-11-03), and the detail pages below it.
// Panels follow the STORY-000 brief's order and numbering, the same for every domain (Aleem's review of
// PR #1, 2026-11-08, required change 2). A different order, governance second, is written up as a
// proposal for the brief's owner in docs/evidence/panel-order-proposal.md; it is not applied here.
import { h } from './dom.js';
import { ENDPOINTS } from './agent-domain-facts.js';
import { CAPABILITY_FILE, PLATFORM_SYNC_FILE } from './agent-domain-data.js';
import {
  agentLink, capabilityRows, coverageCheck, employeeView, gapList, grantedToolsFor, requestGroups, rungSummary,
} from './agent-domain-model.js';
import { lastChangedWords, sourceTag } from './agent-domain-ui.js';
import { accountableNames } from './agent-domain-redact.js';
import { backToConsole } from './console-ui.js';
import { renderEmployeePanel } from './panel-employee.js';
import { renderGovernancePanel } from './panel-governance.js';
import { renderInventoryPanel } from './panel-inventory.js';
import { renderLadderPanel } from './panel-ladder.js';
import { renderBehaviourPanel } from './panel-behaviour.js';
import { renderGapsPanel } from './panel-gaps.js';
import { capabilityDetail, guidePage, rungDetail } from './details.js';
import { storyDetail } from './project-sections.js';

/** Display order = the brief's panel numbers 1 to 6 (docs/evidence/traceability.md). */
export const PANEL_ORDER = Object.freeze(['employee', 'inventory', 'ladder', 'behaviour', 'governance', 'gaps']);

const loadingEndpoints = () => Object.fromEntries(Object.keys(ENDPOINTS).map((k) => [k, { state: 'loading' }]));

/**
 * Panels 2-4's state, from the platform's synced capability records: Ready, Not available (no synced file,
 * or no capabilities[] in it) or Error (a malformed file or record). Never from the pinned file.
 */
export function capabilityState(d) {
  if (d.status === 'loading') return { state: 'loading', error: null };
  const c = d.snapshot?.sync?.capabilities;
  if (c?.status === 'ok') return { state: 'ready', error: null };
  if (c?.status === 'invalid') return { state: 'error', error: c.error };
  return { state: 'not_available', error: c?.error ?? null };
}

/** Everything the panels need, computed once per render from the loaded sources. */
export function consoleInputs(domain) {
  const d = domain ?? { status: 'loading' };
  const { state: sourceState, error: sourceError } = capabilityState(d);
  // The pinned file is read only for required_tools, blocked_by and the name list (decisions 1 and 2).
  const research = d.source?.status === 'ok' ? d.source.matrix : null;
  const endpoints = d.status === 'loading' ? loadingEndpoints() : (d.snapshot?.endpoints ?? loadingEndpoints());
  // The endpoint labels the panels show: the snapshot's own `sources`, falling back to ENDPOINTS.
  const paths = { ...ENDPOINTS, ...(d.snapshot?.sync?.paths ?? {}) };
  // Whether an agent is linked, and its grants, come from the live endpoint only (never the registry seed).
  const link = agentLink(endpoints);
  // Authority is the platform's own record from the synced file, never recalculated (step 2, 2026-11-14).
  const authority = d.snapshot?.sync?.authority ?? null;
  // Panel 5 reads only the platform's synced whole-domain queue. A personal capture of the -mine route
  // holds only the capturer's own requests, so it is never used in its place (2026-11-14).
  const sync0 = d.snapshot?.sync;
  const queue = d.status === 'loading' ? { state: 'loading' }
    : sync0?.governance ?? { state: sync0?.status === 'invalid' ? 'invalid' : 'not_synced', message: sync0?.error ?? null };
  const rows = sourceState === 'ready'
    ? capabilityRows(d.snapshot.sync.capabilities.rows, { grantedTools: grantedToolsFor(link), authority, research }) : [];
  // Decision D4, and Mihret's decision of 2026-11-23: the accountable manager's name, read from the pinned
  // file only as a list of names to withhold. With no list, `names` is empty and every text that could
  // carry a name is withheld rather than shown unchecked (fail-closed, in withholdNames' callers).
  const names = research ? accountableNames(research) : [];
  return { d, sourceState, sourceError, research, paths, endpoints, link, rows, rungs: rungSummary(rows),
    checks: coverageCheck(rows, endpoints.coverage), snapshot: d.snapshot ?? null, names, sync: d.snapshot?.sync ?? null, authority, queue };
}

function syncText(sync) {
  if (!sync || sync.status === 'not_synced') return '';
  if (sync.status === 'invalid') return ` The platform-synced file ${PLATFORM_SYNC_FILE} could not be used: ${sync.error}`;
  return ` Panels 1 to 5 read ${PLATFORM_SYNC_FILE}, the platform's synced copy of its endpoints, ${lastChangedWords(sync.last_changed)}.`;
}

function intro(inputs) {
  const snap = inputs.snapshot;
  const snapText = !snap ? 'Endpoint snapshot: loading.'
    : (snap.status === 'captured' ? `Endpoint snapshot captured ${snap.captured_at ?? '(time not recorded)'}.`
      : snap.status === 'invalid' ? `Endpoint snapshot could not be used: ${snap.error}`
        : snap.sync?.status === 'synced' ? 'Endpoint snapshot: not captured.'
          : 'Endpoint snapshot: not captured yet, so Panels 1 to 5 say "Not available".') + syncText(snap.sync);
  return h('section', { class: 'console-intro', 'aria-label': 'About this console' },
    h('p', { class: 'job' }, 'A human governs agents. This console shows what you govern, what is waiting on you, and what it cannot show yet.'),
    h('p', { class: 'muted' }, 'Every value is tagged: ', sourceTag('endpoint'), ' a response you captured with your own sign-in; ',
      sourceTag('platform_sync'), ' the platform\'s own copy of an endpoint, synced into this repository; ',
      sourceTag('source_file'), ' the platform research file, pinned to a commit; ', sourceTag('platform_code'),
      ' a rule or constant in platform code; ', sourceTag('unavailable'), ' no verified source exists.'),
    h('p', { class: 'muted' }, 'Progress shown here is never authority. A named human promotes one rung at a time, on evidence. ', snapText));
}

export function renderPanels(inputs, project) {
  const { d, sourceState, sourceError, endpoints, link, rows, rungs, checks, snapshot, names, sync, authority, queue, research, paths } = inputs;
  const order = (id) => PANEL_ORDER.indexOf(id) + 1;
  const common = { sourceState, sourceError, paths, research: research != null };
  return {
    employee: renderEmployeePanel(employeeView(endpoints), { order: order('employee'), snapshot }),
    governance: renderGovernancePanel(requestGroups(queue), rows, { order: order('governance'), project, link, names, research: research != null }),
    inventory: renderInventoryPanel(rows, checks, endpoints.coverage, { ...common, order: order('inventory'), project, names }),
    ladder: renderLadderPanel(rows, rungs, { ...common, order: order('ladder'), authority, sync }),
    behaviour: renderBehaviourPanel(rows, rungs, { ...common, order: order('behaviour'), names }),
    gaps: renderGapsPanel(gapList(rows, endpoints), { ...common, order: order('gaps'), project, sourceRecord: d.source?.record, names, sync }),
  };
}

function sourcesFooter(inputs) {
  const rec = inputs.d.source?.record;
  const caps = inputs.sync?.capabilities;
  return h('footer', { class: 'console-footer muted' },
    h('p', {}, caps?.status === 'ok'
      ? ['Capability records: the platform\'s synced copy of ', h('code', {}, `GET ${inputs.paths.domain}`), ' in ', h('code', {}, PLATFORM_SYNC_FILE),
        `, ${lastChangedWords(inputs.sync.last_changed)}.`]
      : 'Capability records: not available from the platform\'s synced file.'),
    h('p', {}, rec ? ['Required tools and blockers only: ', h('code', {}, rec.platform_path), ' at platform commit ', h('code', {}, rec.platform_commit.slice(0, 8)),
      ' (git blob ', h('code', {}, rec.git_blob.slice(0, 8)), '), copied into ', h('code', {}, CAPABILITY_FILE), '.']
      : 'Required tools and blockers: the pinned source file did not load, so they are shown as not available.'));
}

export function renderConsole(domain, project) {
  const inputs = consoleInputs(domain);
  const panels = renderPanels(inputs, project);
  return [intro(inputs), h('div', { class: 'console' }, PANEL_ORDER.map((id) => panels[id])), sourcesFooter(inputs)];
}

/** Routes: '' or 'panel/<id>' (the console), 'capability/<id>', 'rung/<stage>', 'story/<id>', 'guide/<key>'. */
export function renderRoute(parts, domain, project) {
  const [page, arg] = parts;
  if (page === 'guide') return guidePage(arg);
  if (page === 'story') {
    if (!project?.model) return [backToConsole('inventory'), h('p', {}, project?.error ? `The project plan could not be read: ${project.error.message}` : 'Loading the project plan…')];
    // Decision D4: the page withholds the accountable manager's name, so it waits for the list of names.
    const inputs = consoleInputs(domain);
    if (domain?.status === 'loading' || !domain) return [backToConsole('inventory'), h('p', {}, 'Loading…')];
    if (inputs.names.length === 0) {
      return [backToConsole('inventory'), h('p', {}, 'This story page is not shown: the list of names this page must withhold did not load'
        + (domain.source?.error ? ` (${domain.source.error})` : '') + ', so its text could not be checked.')];
    }
    return storyDetail(project.model, arg, { names: inputs.names });
  }
  if (page === 'capability' || page === 'rung') {
    const inputs = consoleInputs(domain);
    if (inputs.sourceState !== 'ready') {
      return [backToConsole(), h('p', {}, inputs.sourceState === 'loading' ? 'Loading the capability records…'
        : `The platform's capability records are not available from ${PLATFORM_SYNC_FILE}${inputs.sourceError ? `: ${inputs.sourceError}` : '.'}`)];
    }
    if (page === 'capability') {
      const r = inputs.rows.find((x) => x.id === arg);
      return r ? capabilityDetail(r, inputs.checks.get(r.id), { names: inputs.names, authority: inputs.authority, sync: inputs.sync, paths: inputs.paths })
        : [backToConsole('inventory'), h('h2', {}, 'Not found'), h('p', {}, `The platform's capability records have no capability "${arg}".`)];
    }
    const g = inputs.rungs.find((x) => x.stage === arg);
    return g ? rungDetail(g, { names: inputs.names, paths: inputs.paths }) : [backToConsole('ladder'), h('h2', {}, 'Not found'), h('p', {}, `"${arg}" is not one of the ten rungs.`)];
  }
  return renderConsole(domain, project);
}

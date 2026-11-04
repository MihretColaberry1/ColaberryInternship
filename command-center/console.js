// The six-panel console (STORY-000, current brief of 2026-11-03), and the detail pages below it.
// Panels are ordered by what the governing human needs first (docs/evidence/design-rationale.md):
// does my employee exist, what is waiting on me, what am I building, how far may it go, what does
// the next rung require, and what can this page not tell me.
import { h } from './dom.js';
import { ENDPOINTS } from './agent-domain-facts.js';
import { CAPABILITY_FILE } from './agent-domain-data.js';
import {
  agentLink, capabilityRows, coverageCheck, employeeView, gapList, grantedToolsFor, requestGroups, rungSummary,
} from './agent-domain-model.js';
import { sourceTag } from './agent-domain-ui.js';
import { backToConsole } from './console-ui.js';
import { renderEmployeePanel } from './panel-employee.js';
import { renderGovernancePanel } from './panel-governance.js';
import { renderInventoryPanel } from './panel-inventory.js';
import { renderLadderPanel } from './panel-ladder.js';
import { renderBehaviourPanel } from './panel-behaviour.js';
import { renderGapsPanel } from './panel-gaps.js';
import { capabilityDetail, guidePage, rungDetail } from './details.js';
import { storyDetail } from './project-sections.js';

/** Display order. Each id maps to one brief panel (docs/evidence/traceability.md). */
export const PANEL_ORDER = Object.freeze(['employee', 'governance', 'inventory', 'ladder', 'behaviour', 'gaps']);

const loadingEndpoints = () => Object.fromEntries(Object.keys(ENDPOINTS).map((k) => [k, { state: 'loading' }]));

/** Everything the panels need, computed once per render from the two loaded sources. */
export function consoleInputs(domain) {
  const d = domain ?? { status: 'loading' };
  const sourceState = d.status === 'loading' ? 'loading' : d.source?.status === 'ok' ? 'ready' : 'error';
  const endpoints = d.status === 'loading' ? loadingEndpoints() : (d.snapshot?.endpoints ?? loadingEndpoints());
  // Whether an agent is linked, and its grants, come from the live endpoint only (never the registry seed).
  const link = agentLink(endpoints);
  const rows = sourceState === 'ready' ? capabilityRows(d.source.matrix, { grantedTools: grantedToolsFor(link) }) : [];
  return { d, sourceState, sourceError: d.source?.error ?? null, endpoints, link, rows, rungs: rungSummary(rows),
    checks: coverageCheck(rows, endpoints.coverage), snapshot: d.snapshot ?? null };
}

function intro(inputs) {
  const snap = inputs.snapshot;
  const snapText = !snap ? 'Endpoint snapshot: loading.'
    : snap.status === 'captured' ? `Endpoint snapshot captured ${snap.captured_at ?? '(time not recorded)'}.`
      : snap.status === 'invalid' ? `Endpoint snapshot could not be used: ${snap.error}`
        : 'Endpoint snapshot: not captured yet, so Panels 1 and 5 say "Not available".';
  return h('section', { class: 'console-intro', 'aria-label': 'About this console' },
    h('p', { class: 'job' }, 'A human governs agents. This console shows what you govern, what is waiting on you, and what it cannot show yet.'),
    h('p', { class: 'muted' }, 'Every value is tagged: ', sourceTag('endpoint'), ' a response you captured with your own sign-in; ',
      sourceTag('source_file'), ' the platform research file, pinned to a commit; ', sourceTag('platform_code'),
      ' a rule or constant in platform code; ', sourceTag('unavailable'), ' no verified source exists.'),
    h('p', { class: 'muted' }, 'Progress shown here is never authority. A named human promotes one rung at a time, on evidence. ', snapText));
}

export function renderPanels(inputs, project) {
  const { d, sourceState, sourceError, endpoints, link, rows, rungs, checks, snapshot } = inputs;
  const order = (id) => PANEL_ORDER.indexOf(id) + 1;
  const common = { sourceState, sourceError };
  return {
    employee: renderEmployeePanel(employeeView(endpoints), { order: order('employee'), snapshot }),
    governance: renderGovernancePanel(requestGroups(endpoints.requests), rows, { order: order('governance'), snapshot, project, link }),
    inventory: renderInventoryPanel(rows, checks, endpoints.coverage, { ...common, order: order('inventory'), project }),
    ladder: renderLadderPanel(rows, rungs, { ...common, order: order('ladder') }),
    behaviour: renderBehaviourPanel(rows, rungs, { ...common, order: order('behaviour') }),
    gaps: renderGapsPanel(gapList(rows, endpoints), { ...common, order: order('gaps'), project, sourceRecord: d.source?.record }),
  };
}

function sourcesFooter(d) {
  const rec = d.source?.record;
  return h('footer', { class: 'console-footer muted' },
    rec ? ['Capability records: ', h('code', {}, rec.platform_path), ' at platform commit ', h('code', {}, rec.platform_commit.slice(0, 8)),
      ' (git blob ', h('code', {}, rec.git_blob.slice(0, 8)), '), copied into ', h('code', {}, CAPABILITY_FILE), '.']
      : 'Capability source file not loaded.');
}

export function renderConsole(domain, project) {
  const inputs = consoleInputs(domain);
  const panels = renderPanels(inputs, project);
  return [intro(inputs), h('div', { class: 'console' }, PANEL_ORDER.map((id) => panels[id])), sourcesFooter(inputs.d)];
}

/** Routes: '' or 'panel/<id>' (the console), 'capability/<id>', 'rung/<stage>', 'story/<id>', 'guide/<key>'. */
export function renderRoute(parts, domain, project) {
  const [page, arg] = parts;
  if (page === 'guide') return guidePage(arg);
  if (page === 'story') {
    if (!project?.model) return [backToConsole('inventory'), h('p', {}, project?.error ? `The project plan could not be read: ${project.error.message}` : 'Loading the project plan…')];
    return storyDetail(project.model, arg);
  }
  if (page === 'capability' || page === 'rung') {
    const inputs = consoleInputs(domain);
    if (inputs.sourceState !== 'ready') return [backToConsole(), h('p', {}, inputs.sourceState === 'loading' ? 'Loading the capability records…' : `The source file could not be read: ${inputs.sourceError}`)];
    if (page === 'capability') {
      const r = inputs.rows.find((x) => x.id === arg);
      return r ? capabilityDetail(r, inputs.checks.get(r.id)) : [backToConsole('inventory'), h('h2', {}, 'Not found'), h('p', {}, `The source file has no capability "${arg}".`)];
    }
    const g = inputs.rungs.find((x) => x.stage === arg);
    return g ? rungDetail(g) : [backToConsole('ladder'), h('h2', {}, 'Not found'), h('p', {}, `"${arg}" is not one of the ten rungs.`)];
  }
  return renderConsole(domain, project);
}

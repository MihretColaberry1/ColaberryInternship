// App shell: tabs, hash routing, the Sample/Real switch and the "Data as of" stamp.
import { h } from './dom.js';
import { loadProjectData } from './data.js';
import { buildOverviewModel } from './model.js';
import { makeSampleData } from './sample.js';
import { renderOverview } from './overview.js';
import { renderGuardrails, renderOutcomes, renderSystems, renderUsers } from './tabs-plan.js';
import { renderAgents, renderProjectManagement } from './tabs-delivery.js';
import { renderDataModel, renderKnowledgeBase } from './tabs-knowledge.js';

export const TABS = [
  { id: 'overview', label: 'Overview', render: ({ model }, sub) => renderOverview(model, sub) },
  { id: 'outcomes', label: 'Outcomes', render: renderOutcomes },
  { id: 'users', label: 'Users and use case', render: renderUsers },
  { id: 'guardrails', label: 'Guardrails', render: renderGuardrails },
  { id: 'systems', label: 'Systems', render: renderSystems },
  { id: 'project-management', label: 'Project management', render: renderProjectManagement },
  { id: 'ai-agents', label: 'AI agents', render: renderAgents },
  { id: 'knowledge-base', label: 'Knowledge base', render: renderKnowledgeBase },
  { id: 'data-model', label: 'Data model', render: renderDataModel },
];

const MODE_KEY = 'command-center-mode';
const state = { mode: 'real', real: null, realError: null };

function readMode() {
  try {
    return localStorage.getItem(MODE_KEY) === 'sample' ? 'sample' : 'real';
  } catch (err) {
    console.warn('Command Center: could not read the saved mode; defaulting to Real.', err);
    return 'real';
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch (err) {
    console.warn('Command Center: could not save the mode; it will reset on reload.', err);
  }
}

function parseRoute() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const tab = TABS.find((t) => t.id === parts[0]) ?? TABS[0];
  return { tab, sub: tab.id === parts[0] ? parts.slice(1) : [] };
}

function modeSwitch() {
  const button = (mode, label) => h('button', {
    type: 'button', class: 'mode-btn', 'aria-pressed': state.mode === mode ? 'true' : 'false',
    onclick: () => { state.mode = mode; saveMode(mode); render(); },
  }, label);
  return h('div', { class: 'mode-switch', role: 'group', 'aria-label': 'Data mode' },
    button('real', 'Real'), button('sample', 'Sample'));
}

function tabBar(active) {
  return h('nav', { class: 'tabs', 'aria-label': 'Command Center tabs' },
    h('ul', {}, TABS.map((t) => h('li', {},
      h('a', { href: `#/${t.id}`, 'aria-current': t.id === active.id ? 'page' : null }, t.label)))));
}

function sampleBanner() {
  return h('div', { class: 'banner banner-sample', role: 'note' },
    h('span', { class: 'sample-chip' }, 'SAMPLE DATA'), ' Made up, not your project. Switch to Real before you demo.');
}

function errorView(err) {
  return [h('h2', {}, 'Could not load the project data'),
    h('p', { class: 'error' }, err.message),
    h('p', {}, 'If you opened index.html by double-clicking it, the browser blocks it from reading the data files. ',
      'Start a local server in the repository folder instead: ', h('code', {}, 'python -m http.server 8000'),
      ', then open ', h('code', {}, 'http://localhost:8000/'), '.'),
    h('p', {}, 'Sample mode still works without the data files.')];
}

function currentData() {
  if (state.mode === 'sample') return { data: makeSampleData(new Date()), error: null };
  return { data: state.real, error: state.realError };
}

export function render() {
  const { tab, sub } = parseRoute();
  const { data, error } = currentData();
  const model = data ? buildOverviewModel(data, new Date()) : null;
  document.title = `${tab.label} · Command Center`;

  const stamp = model
    ? h('p', { class: `stamp stamp-${model.freshness.level}`, role: model.freshness.warning ? 'alert' : null }, model.freshness.text)
    : h('p', { class: 'stamp stamp-unknown' }, 'Data as of: unknown (data not loaded)');

  // h() skips null children; replaceChildren would print them as the text "null".
  const root = document.getElementById('app');
  root.replaceChildren(h('div', {},
    h('div', { class: 'brand-stripe', 'aria-hidden': 'true' }),
    h('header', { class: 'site-header' },
      h('div', { class: 'header-row' },
        h('div', {}, h('p', { class: 'eyebrow' }, 'Colaberry · Command Center'),
          h('h1', {}, model?.project.name ?? 'Command Center')),
        modeSwitch()),
      stamp),
    state.mode === 'sample' ? sampleBanner() : null,
    tabBar(tab),
    h('main', { id: 'main', class: state.mode === 'sample' ? 'is-sample' : null, tabindex: '-1' },
      error ? errorView(error) : tab.render({ model, data }, sub))));
}

async function start() {
  state.mode = readMode();
  try {
    state.real = await loadProjectData();
  } catch (err) {
    console.error('Command Center: failed to load project data.', err);
    state.realError = err;
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  render();
}

start();

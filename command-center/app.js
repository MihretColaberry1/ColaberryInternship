// App shell for the six-panel console: header, "Data as of" stamp and hash routing.
// The nine tabs and the Sample/Real switch were removed on 2026-11-03 (README, "Content inventory").
import { h } from './dom.js';
import { loadProjectData } from './data.js';
import { buildOverviewModel } from './model.js';
import { loadAgentDomainData } from './agent-domain-data.js';
import { PANEL_ORDER, renderRoute } from './console.js';

// Light theme only (Aleem's review of PR #1, 2026-11-08, and Mihret's decision of 2026-11-09): the
// design system's dark set is partial, so a dark theme would need values the system does not define.
// No theme switch is offered and data-theme is never set, so the system's [data-theme="dark"] block never applies.
const state = { domain: { status: 'loading' }, project: { status: 'loading' } };

// Old tab links (#/overview, #/agent-domain/capability/x, #/project-management/story/x) still land
// somewhere sensible: the matching detail page, or the console.
const LEGACY_DETAIL = { 'agent-domain': 1, 'project-management': 1 };

export function parseRoute(hash) {
  let parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (LEGACY_DETAIL[parts[0]]) parts = parts.slice(1);
  const known = ['panel', 'capability', 'rung', 'story', 'guide'];
  return known.includes(parts[0]) ? parts : [];
}

function stamp() {
  const p = state.project;
  if (p.status === 'loading') return h('p', { class: 'stamp stamp-unknown' }, 'Data as of: loading the project plan…');
  if (p.error) return h('p', { class: 'stamp stamp-unknown', role: 'alert' }, `Data as of: unknown. ${p.error.message}`);
  const f = p.model.freshness;
  return h('p', { class: `stamp stamp-${f.level}`, role: f.warning ? 'alert' : null }, f.text);
}

export function render() {
  const parts = parseRoute(window.location.hash);
  const onConsole = parts.length === 0 || parts[0] === 'panel';
  document.title = onConsole ? 'Command Center · Product Experience' : `${parts.slice(0, 2).join(' ')} · Command Center`;
  const project = state.project.status === 'loading' ? null : state.project;
  const root = document.getElementById('app');
  // h() skips null children; replaceChildren would print them as the text "null".
  root.replaceChildren(h('div', {},
    h('div', { class: 'brand-stripe', 'aria-hidden': 'true' }),
    h('header', { class: 'site-header' },
      h('div', { class: 'header-row' },
        h('div', {}, h('p', { class: 'eyebrow' }, 'Colaberry · Command Center · product_experience'),
          h('h1', {}, h('a', { href: '#/', class: 'home-link' }, 'Product Experience & UI/UX agent domain')))),
      stamp()),
    h('main', { id: 'main', tabindex: '-1', class: onConsole ? 'main-console' : 'main-detail' }, renderRoute(parts, state.domain, project))));
  if (parts[0] === 'panel' && PANEL_ORDER.includes(parts[1])) {
    const target = document.getElementById(`panel-${parts[1]}`);
    target?.scrollIntoView({ block: 'start' });
    target?.querySelector('h2')?.setAttribute('tabindex', '-1');
    target?.querySelector('h2')?.focus({ preventScroll: true });
  }
}

async function start() {
  // The skip link moves focus itself: following "#main" would change the route and re-render.
  document.querySelector('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('main')?.focus();
  });
  render();
  window.addEventListener('hashchange', () => { render(); if (!window.location.hash.startsWith('#/panel/')) window.scrollTo(0, 0); });
  const domain = loadAgentDomainData()
    .then((d) => { state.domain = { status: 'loaded', ...d }; })
    .catch((err) => {
      console.error('Command Center: failed to load the agent-domain sources.', err);
      state.domain = { status: 'loaded', source: { status: 'error', error: err.message }, snapshot: null };
    })
    .finally(render);
  const project = loadProjectData()
    .then((data) => { state.project = { status: 'loaded', data, model: buildOverviewModel(data, new Date()), error: null }; })
    .catch((err) => {
      console.error('Command Center: failed to load the project plan.', err);
      state.project = { status: 'loaded', data: null, model: null, error: err };
    })
    .finally(render);
  await Promise.allSettled([domain, project]);
}

start();

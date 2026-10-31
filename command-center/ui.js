// Shared building blocks so all nine tabs look and behave the same.
// Every status carries a text label; colour is never the only signal.
import { h } from './dom.js';

export const NOT_CHECKED = 'not checked yet';

const STATE_LABELS = {
  verified: 'Verified', submitted: 'Submitted', in_progress: 'In progress', not_started: 'Not started',
};

export function stateBadge(state) {
  const label = state ? (STATE_LABELS[state] ?? state) : NOT_CHECKED;
  return h('span', { class: `badge badge-${state ?? 'unchecked'}` }, state === 'verified' ? `✓ ${label}` : label);
}

// kind: 'ok' | 'info' | 'warn' | 'error' | 'neutral'
export function badge(kind, label) {
  return h('span', { class: `badge badge-${kind}` }, label);
}

export function card(href, title, value, caption, extra) {
  return h('a', { class: 'card', href },
    h('span', { class: 'card-title' }, title),
    h('span', { class: 'card-value' }, value),
    caption ? h('span', { class: 'card-caption' }, caption) : null,
    extra ?? null,
    h('span', { class: 'card-more' }, 'View details →'));
}

// A labelled bar. Only drawn when both numbers exist; otherwise nothing is implied.
export function progressBar(done, total, label) {
  if (done == null || !total) return null;
  const pct = Math.round((done / total) * 100);
  return h('div', { class: 'progress', role: 'img', 'aria-label': `${label}: ${done} of ${total}` },
    h('span', { class: 'progress-fill', style: `width: ${pct}%` }));
}

export function back(href, label) {
  return h('a', { class: 'back', href }, `← ${label}`);
}

export function emptyState(title, ...lines) {
  return h('div', { class: 'empty' }, h('p', { class: 'empty-title' }, title), lines.map((l) => h('p', {}, l)));
}

export function greyStatus(text) {
  return h('li', {}, h('span', { class: 'dot dot-grey', 'aria-hidden': 'true' }),
    h('span', {}, text, ' ', badge('neutral', 'not checked from here')));
}

export function sectionTitle(text) {
  return h('h3', { class: 'section-title' }, text);
}

export function table(columns, rows, emptyText = 'Nothing here yet.') {
  if (rows.length === 0) return h('p', { class: 'empty' }, emptyText);
  return h('div', { class: 'table-wrap' }, h('table', {},
    h('thead', {}, h('tr', {}, columns.map((c) => h('th', { scope: 'col' }, c.label)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, columns.map((c) => h('td', {}, c.cell(r))))))));
}

export function facts(pairs) {
  return h('dl', { class: 'facts' }, pairs.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v ?? '—')]));
}

export function storyLink(id) {
  return `#/project-management/story/${encodeURIComponent(id)}`;
}

// Dates stay on one line so "2026-09-20" never breaks in a narrow column.
export function date(value, fallback = '—') {
  return value ? h('span', { class: 'nowrap' }, value) : fallback;
}

export const columns = {
  // The readable title is the link; the long story id sits underneath for reference.
  story: {
    label: 'Story',
    cell: (r) => [h('a', { href: storyLink(r.id), class: 'story-link' }, r.title ?? r.id),
      r.title ? h('div', {}, h('code', { class: 'story-id' }, r.id)) : null],
  },
  state: { label: 'State', cell: (r) => stateBadge(r.state) },
  due: {
    label: 'Due (first given)',
    cell: (r) => (r.dueOn ? [date(r.dueOn), ' ', h('span', { class: 'muted nowrap' }, `(${r.dueBaselineOn ?? 'no baseline'})`)] : 'no due date in plan'),
  },
};

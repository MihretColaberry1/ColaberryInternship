// Outcomes, Users and use case, Guardrails, Systems: the tabs that read plan.derived.
// Each shows an honest empty state when the plan holds nothing for it.
import { h } from './dom.js';
import { back, badge, card, columns, emptyState, facts, greyStatus, sectionTitle, table } from './ui.js';
import { draftGuardrailStatus, guardrailStatus, rolesWithStories } from './model-tabs.js';
import { DRAFTS_FILE } from './data.js';

const notFound = (href, label, what) => [back(href, label), h('h2', {}, 'Not found'), h('p', {}, `plan.json has no ${what}.`)];

// ---- Outcomes ----

export function renderOutcomes({ data }, [page, arg]) {
  const measures = data.plan.derived?.measures ?? [];
  if (page === 'measure') {
    const m = measures.find((x) => x.id === arg);
    if (!m) return notFound('#/outcomes', 'Back to Outcomes', `measure "${arg}"`);
    return [back('#/outcomes', 'Back to Outcomes'), h('h2', {}, m.id), facts([
      ['Statement', m.statement],
      ['Current value', 'not measured: values come from your running system, not from these files'],
    ])];
  }
  return [h('h2', {}, 'Outcomes: the numbers this has to move'),
    measures.length === 0
      ? emptyState('Your plan carries no numeric target yet.',
        'A measure appears here when a requirement in plan.json states a number this project commits to move.',
        'Nothing is shown until then, so no value on this page is invented.')
      : h('div', { class: 'cards' }, measures.map((m) => card(`#/outcomes/measure/${encodeURIComponent(m.id)}`,
        m.id, 'Not measured yet', m.statement)))];
}

// ---- Users and use case ----

export function renderUsers({ data }, [page, arg]) {
  const roles = rolesWithStories(data.plan);
  if (page === 'role') {
    const r = roles.find((x) => x.role === arg);
    if (!r) return notFound('#/users', 'Back to Users', `role "${arg}"`);
    return [back('#/users', 'Back to Users'), h('h2', {}, r.role),
      h('p', {}, 'The stories written for this role, with the sentence each role came from:'),
      table([{ label: 'Story', cell: (s) => h('code', {}, s.id) }, { label: 'Narrative', cell: (s) => s.narrative }],
        r.stories, 'No story narrative names this role.')];
  }
  return [h('h2', {}, 'Users and use case'),
    roles.length === 0
      ? emptyState('Roles are not yet named in your stories.',
        'Roles are taken from stories written "As a <role>, I want …". None of your stories use that form yet.',
        'Your accountable human is named in the story files, but that is not the same as a user role, so it is not listed here.')
      : h('div', { class: 'cards' }, roles.map((r) => card(`#/users/role/${encodeURIComponent(r.role)}`,
        'Role', r.role, `${r.stories.length} stories written for this role`)))];
}

// ---- Guardrails ----

const GUARD_LABELS = {
  kept: ['ok', '✓ Enforced: every story verified'],
  'not-kept': ['warn', 'A promise not yet kept'],
  'no-story': ['warn', 'No story enforces this yet'],
};

const DRAFT_STEPS = [
  ['documented', 'Draft documented'],
  ['registered', 'Registered in platform plan'],
  ['signoff', "Aleem's R0 sign-off"],
  ['enforcement', 'Enforcement implemented'],
  ['verification', 'Verification completed'],
];

const STEP_BADGES = {
  done: ['ok', '✓ Done'],
  pending: ['neutral', 'Pending'],
  conflict: ['error', 'Conflicts with plan.json'],
};

function draftDetail(d) {
  return [back('#/guardrails', 'Back to Guardrails'), h('h2', {}, `${d.id} `, badge('warn', 'Draft')),
    facts([['Must never happen', d.statement], ['Kind', `${d.kind ?? '—'} · ${d.priority ?? '—'}`],
      ['Cluster', d.cluster], ['Written in', h('code', {}, DRAFTS_FILE)]]),
    sectionTitle('Status, each read from the file that can prove it'),
    table([{ label: 'Step', cell: ([, label]) => label },
      { label: 'Status', cell: ([key]) => badge(...STEP_BADGES[d[key].status]) },
      { label: 'Evidence', cell: ([key]) => d[key].evidence }], DRAFT_STEPS),
    sectionTitle('Linked stories'),
    table([columns.story, columns.state,
      { label: 'In platform plan', cell: (s) => (s.inPlan ? 'yes' : badge('error', 'not in plan.json')) }], d.stories, 'No story linked.'),
    sectionTitle('Enforcement checks still to build'),
    table([{ label: 'Check', cell: (c) => c.check }, { label: 'Test', cell: (c) => (c.test ? h('code', {}, c.test) : badge('neutral', 'none yet')) }],
      d.checks, 'No enforcement check written yet.'),
    sectionTitle('Sources'),
    h('ul', {}, d.sources.map((s) => h('li', {}, s)))];
}

function draftSection(drafts) {
  if (drafts.error) return h('p', { class: 'error' }, `Your draft guardrails could not be read: ${drafts.error}`);
  if (drafts.items.length === 0) return null;
  return [sectionTitle('Drafts written in this repo, not in your platform plan'),
    h('p', {}, `These come from ${DRAFTS_FILE}. The platform does not know about them, so they do not count as guardrails yet. Nothing here is approved.`),
    h('div', { class: 'cards' }, drafts.items.map((d) => card(`#/guardrails/draft/${encodeURIComponent(d.id)}`,
      `Draft SAFE requirement · ${d.stories.length} linked stories`, d.id, d.statement,
      badge(...(d.registered.status === 'done' ? STEP_BADGES.done : ['warn', 'Not registered in platform plan'])))))];
}

export function renderGuardrails({ data, model }, [page, arg]) {
  const guards = guardrailStatus(data.plan, model.rows);
  const draftsFile = data.drafts ?? { items: [], error: null };
  const drafts = { error: draftsFile.error,
    items: draftGuardrailStatus(draftsFile.items, data.plan, data.progress, model.rows) };
  if (page === 'draft') {
    const d = drafts.items.find((x) => x.id === arg);
    return d ? draftDetail(d) : notFound('#/guardrails', 'Back to Guardrails', `draft guardrail "${arg}"`);
  }
  if (page === 'guardrail') {
    const g = guards.find((x) => x.id === arg);
    if (!g) return notFound('#/guardrails', 'Back to Guardrails', `guardrail "${arg}"`);
    return [back('#/guardrails', 'Back to Guardrails'), h('h2', {}, g.id),
      facts([['Must never happen', g.statement], ['Status', badge(...GUARD_LABELS[g.status])]]),
      sectionTitle('Stories that enforce it'),
      table([columns.story, columns.state], g.stories, 'No story fulfils this requirement yet.')];
  }
  return [h('h2', {}, 'Guardrails: what must never happen'),
    guards.length === 0
      ? [h('p', {}, badge('warn', 'Open blocker: needs your instructor')),
        emptyState('Your plan has no requirement typed SAFE yet.',
          'This is not "no guardrails needed". It usually means a safety promise from your interview was recorded as a normal feature.',
          'STORY-000 says to raise this with your instructor before building further. Nothing here is approved, and this page will not invent a guardrail to fill the gap.')]
      : h('div', { class: 'cards' }, guards.map((g) => card(`#/guardrails/guardrail/${encodeURIComponent(g.id)}`,
        g.id, g.statement, null, badge(...GUARD_LABELS[g.status])))),
    draftSection(drafts)];
}

// ---- Systems ----

export function renderSystems({ data }, [page, arg]) {
  const systems = data.plan.derived?.systems ?? [];
  if (page === 'system') {
    if (!systems.includes(arg)) return notFound('#/systems', 'Back to Systems', `system "${arg}"`);
    return [back('#/systems', 'Back to Systems'), h('h2', {}, arg),
      h('ul', { class: 'status-list' }, greyStatus('Connection status unknown. Last checked: never.')),
      h('p', {}, 'Your files only hold this name. Whether it is connected is a fact about your running system, which nothing in this repository can check.')];
  }
  return [h('h2', {}, 'Systems: what this connects to'),
    systems.length === 0
      ? emptyState('Your plan names no external system yet.',
        'Systems appear here when a CONSTRAINT requirement in plan.json names one.')
      : h('div', { class: 'cards' }, systems.map((s) => card(`#/systems/system/${encodeURIComponent(s)}`,
        'System', s, 'Last checked: never', badge('neutral', 'not checked from here'))))];
}

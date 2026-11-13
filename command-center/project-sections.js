// What the nine-tab console used to show from .colaberry/plan.json and progress.json, carried into the
// six panels as collapsed sections (README, "Content inventory"). Same model functions, same tests:
// only the place it is shown changed. Nothing here is endpoint data.
import { h } from './dom.js';
import { NOT_CHECKED, badge, columns, date, facts, sectionTitle, stateBadge, table } from './ui.js';
import { draftGuardrailStatus, guardrailStatus, rolesWithStories, taskList, timeline, traceability } from './model-tabs.js';
import { DRAFTS_FILE, NOTES_FILE } from './data.js';
import { backToConsole } from './console-ui.js';
import { publicBlockerText, withholdNames } from './agent-domain-redact.js';
import { ticksAheadOfVerifier, verifierWords, yourTickWords } from './verification-model.js';

const plainText = (text) => (text ?? '').replace(/\*\*|`|#{1,6}\s/g, '');
const planTag = () => h('span', { class: 'src src-plan' }, 'Project plan', h('span', { class: 'src-detail' }, ' · .colaberry/'));

function shiftText(days) {
  if (days == null) return 'no baseline';
  if (days === 0) return 'unchanged';
  return days > 0 ? `moved ${days} days later` : `moved ${-days} days earlier`;
}

const ofText = (totals, done, total) => (totals?.[done] == null || totals?.[total] == null ? NOT_CHECKED : `${totals[done]} of ${totals[total]}`);

/** The headline numbers from progress.json, exactly as the platform recorded them. */
export function projectTotals(model) {
  const t = model?.totals;
  return { stories: ofText(t, 'stories_verified', 'stories_total'), criteria: ofText(t, 'criteria_passed', 'criteria_total'),
    points: t?.points_awarded ?? NOT_CHECKED };
}

// ---- Stories, criteria and points (Overview, Project management, Knowledge base) ----

/**
 * A story title as this public page shows it: the accountable manager's name withheld (decision D4).
 * With no name list loaded, the title is dropped so the id is shown instead of a title that might name someone.
 */
const safeTitle = (title, names) => (title == null ? title : withholdNames(title, names));

/**
 * Two different records, kept in separate columns and never added together (decision D2):
 *   - "Your ticks": the `passed` flags you set in progress.json, which are your claim;
 *   - "Platform verifier": the `verification` block the platform writes into the same file
 *     (docs/DATA_CONTRACT.md), which is what it confirmed from a pushed commit.
 */
export function storiesSection(model, { names = [] } = {}) {
  const today = model.schedule?.today ?? '';
  const tasks = taskList(model.rows, today).map((r) => ({ ...r, title: safeTitle(r.title, names) }));
  const t = projectTotals(model);
  const ahead = ticksAheadOfVerifier(model.rows);
  return [h('p', {}, planTag(), ` Plan stories verified by the platform: ${t.stories}. Criteria the platform confirms: ${t.criteria}. Points awarded: ${t.points}. `,
    'Due dates are shown exactly as plan.json records them; past dates are not corrected or hidden.'),
  // A short badge: badges do not wrap, so the explanation is ordinary text that reflows at 320 px.
  ahead.length ? h('p', {}, badge('warn', 'Not equivalent'), ' Your ticks are ahead of the platform verifier for ',
    ahead.map((a) => `${a.id.replace(/^product_experience\./, '')}: ${yourTickWords(a)}; ${verifierWords(a)}.`).join(' '),
    ' These are two different records. See "What is not available".') : null,
  table([
    columns.story,
    { label: 'Release', cell: (r) => r.release ?? '—' },
    columns.state,
    { label: 'Due', cell: (r) => date(r.dueOn) },
    { label: 'First given', cell: (r) => date(r.dueBaselineOn) },
    { label: 'Change', cell: (r) => shiftText(r.shiftDays) },
    { label: 'Your ticks (progress.json)', cell: (r) => `${r.tickedPassed} of ${r.tickedTotal}` },
    { label: 'Platform verifier', cell: (r) => (r.confirmedTotal == null ? NOT_CHECKED : `${r.confirmedPassed} of ${r.confirmedTotal}`) },
    { label: 'Status', cell: (r) => (r.pastDue ? badge('warn', 'Past due, not verified') : r.state === 'verified' ? badge('ok', '✓ Done') : '') },
  ], tasks, 'plan.json and progress.json hold no stories.'),
  h('p', { class: 'muted' }, 'Your ticks are your claim in progress.json. The platform verifier is what the platform confirmed from a pushed commit, '
    + 'and writes into the same file. A story counts as verified only on the platform verifier\'s record.')];
}

export function timelineSection(data, model) {
  const tl = timeline(data.plan, model.rows, model.schedule?.today ?? null);
  if (!tl) return h('p', { class: 'empty' }, 'No dates in plan.json yet.');
  return h('div', { class: 'gantt', role: 'group', 'aria-label': 'Release timeline' },
    h('div', { class: 'gantt-axis muted' }, h('span', {}, tl.start), h('span', {}, tl.end)),
    tl.releases.map((r) => h('div', { class: 'gantt-row' },
      h('div', { class: 'gantt-label' }, h('strong', {}, `${r.key}${r.isDemoTarget ? ' · demo' : ''}`),
        h('span', { class: 'muted' }, r.start ? `${r.start} to ${r.end ?? 'not set'}` : 'no dates in plan')),
      h('div', { class: 'gantt-track' },
        r.left == null ? null : h('span', { class: 'gantt-bar', style: `left: ${r.left}%; width: max(${r.width}%, 10px)`, role: 'img', 'aria-label': `Release ${r.key}, ${r.start} to ${r.end}` }),
        tl.markers.map((m) => h('span', { class: `gantt-marker gantt-marker-${m.label === 'Today' ? 'today' : 'demo'}`, style: `left: ${m.left}%` }))))),
    h('ul', { class: 'gantt-legend muted' }, tl.markers.map((m) => h('li', {},
      h('span', { class: `legend-swatch legend-${m.label === 'Today' ? 'today' : 'demo'}`, 'aria-hidden': 'true' }),
      m.label === 'Today' ? `Today: ${m.date} (this computer's date in Central time)` : `${m.label}: ${m.date} (recorded in plan.json)`))));
}

export function requirementsSection(data, model) {
  const trace = traceability(data.plan, model.rows);
  if (trace.length === 0) return h('p', { class: 'empty' }, 'plan.json has no requirements yet.');
  const gaps = trace.filter((r) => r.gap).length;
  return [gaps ? h('p', {}, badge('warn', `${gaps} "must" requirements have no story`)) : null,
    table([
      { label: 'Requirement', cell: (r) => [h('code', {}, r.id), h('div', { class: 'muted' }, r.statement)] },
      { label: 'Kind', cell: (r) => `${r.kind ?? '—'} · ${r.priority ?? '—'}` },
      { label: 'Covered by', cell: (r) => (r.stories.length ? r.stories.map((s) => s.id).join(', ') : badge('warn', 'nothing')) },
      { label: 'Verified', cell: (r) => (r.built ? badge('ok', '✓ yes') : badge('neutral', 'not yet')) },
    ], trace)];
}

export function scheduleSection(model) {
  const s = model.schedule;
  if (!s) return h('p', { class: 'empty' }, 'plan.json has no schedule yet.');
  const dates = (items) => table([
    { label: 'Item', cell: (m) => m.label },
    { label: 'Date', cell: (m) => m.date ?? 'not set' },
    { label: 'Status', cell: (m) => (m.isPast ? badge('warn', 'in the past') : '') },
  ], items, 'None in the plan.');
  return [h('p', {}, `Dates exactly as plan.json records them. Today in Central time is ${s.today}.`),
    dates(s.milestones), sectionTitle('Preparation tasks'), dates(s.prep)];
}

// ---- Guardrails and notes (Guardrails, Knowledge base) ----

const DRAFT_STEPS = [['documented', 'Draft documented'], ['registered', 'Registered in platform plan'],
  ['signoff', "Accountable manager's R0 sign-off"], ['enforcement', 'Enforcement implemented'], ['verification', 'Verification completed']];
const STEP_BADGES = { done: ['ok', '✓ Done'], pending: ['neutral', 'Pending'], conflict: ['error', 'Conflicts with plan.json'] };

/** Guardrails waiting on a human: the platform's SAFE requirements and this repo's drafts. */
export function guardrailsSection(data, model) {
  const guards = guardrailStatus(data.plan, model.rows);
  const file = data.drafts ?? { items: [], error: null };
  const drafts = draftGuardrailStatus(file.items, data.plan, data.progress, model.rows);
  return [
    guards.length === 0
      ? h('p', {}, badge('warn', 'Open'), ' plan.json has no requirement typed SAFE. This is not "no guardrails needed"; it is raised with the instructor, and nothing is invented to fill it.')
      : table([{ label: 'Guardrail', cell: (g) => [h('code', {}, g.id), h('div', { class: 'muted' }, g.statement)] },
        { label: 'Stories enforcing it', cell: (g) => String(g.stories.length) }], guards),
    file.error ? h('p', { class: 'error' }, `The draft guardrails could not be read: ${file.error}`) : null,
    drafts.map((d) => [sectionTitle(`${d.id} · draft in ${DRAFTS_FILE}, not approved`),
      facts([['Must never happen', d.statement], ['Linked stories', d.stories.map((s) => s.id).join(', ') || 'none']]),
      table([{ label: 'Step', cell: ([, label]) => label },
        { label: 'Status', cell: ([key]) => badge(...STEP_BADGES[d[key].status]) },
        { label: 'Evidence', cell: ([key]) => d[key].evidence }], DRAFT_STEPS)])];
}

export function pendingSignoffs(data, model) {
  const file = data.drafts ?? { items: [] };
  return draftGuardrailStatus(file.items, data.plan, data.progress, model.rows).filter((d) => d.signoff.status !== 'done');
}

export function notesSection(notes) {
  if (notes?.error) return h('p', { class: 'error' }, `Your notes could not be read: ${notes.error}`);
  const items = notes?.items ?? [];
  if (items.length === 0) return h('p', { class: 'empty' }, `No decisions recorded in ${NOTES_FILE} yet. Each one should name the file or link that backs it.`);
  return h('ul', { class: 'notes' }, items.map((n) => h('li', {}, h('strong', {}, n.title ?? 'Untitled'),
    n.date ? h('span', { class: 'muted' }, ` · ${n.date}`) : null, n.text ? h('p', {}, n.text) : null,
    n.source ? h('p', { class: 'muted' }, `Source: ${n.source}`) : null)));
}

// ---- Not in the plan yet (Outcomes, Users, Systems, Data model) ----

/** What the old tabs showed as empty states, as named gaps. Counted from plan.json, never assumed. */
export function planGaps(data) {
  const derived = data.plan.derived ?? {};
  const gap = (what, count, missing, willShow) => ({ what, count, missing, willShow });
  return [
    gap('Outcomes: the numbers this has to move', (derived.measures ?? []).length,
      'No requirement in plan.json states a numeric target.', 'Each measure and its value from the running system.'),
    gap('Users and roles', rolesWithStories(data.plan).length,
      'No story is written "As a <role>, I want …".', 'Each role and the stories written for it.'),
    gap('Systems this connects to', (derived.systems ?? []).length,
      'No CONSTRAINT requirement in plan.json names an external system.', 'Each system, with its connection status marked "not checked from here".'),
    gap("The domain's data tables", 0,
      'Tables are derived with you as a design step, and none has been derived.', 'Each table and its fields, once reviewed.'),
  ];
}

// ---- Story detail page (Project management) ----

/**
 * One story. `names` is the accountable-manager name list (decision D4): every line of text from the
 * plan passes through withholdNames. The console only renders this page once that list is known.
 */
export function storyDetail(model, id, { names = [] } = {}) {
  const tasks = taskList(model.rows, model.schedule?.today ?? '');
  const r = tasks.find((t) => t.id === id);
  if (!r) return [backToConsole('inventory'), h('h2', {}, 'Story not found'), h('p', {}, `No story "${id}" in plan.json or progress.json.`)];
  const safe = (text) => (text == null ? text : (withholdNames(text, names) ?? ''));
  const ticked = new Map(r.criteria.map((c) => [c.text, c.passed === true]));
  const criteriaText = r.acceptance.length ? r.acceptance : r.criteria.map((c) => c.text);
  return [backToConsole('inventory'), h('h2', {}, safe(r.title) || r.id), h('p', {}, planTag(), ' ', h('code', {}, r.id)),
    facts([['State (platform verifier)', stateBadge(r.state)],
      ['Your ticks (progress.json)', `${r.tickedPassed} of ${r.tickedTotal}`],
      ['Platform verifier', r.confirmedTotal == null ? NOT_CHECKED : `${r.confirmedPassed} of ${r.confirmedTotal}`],
      ['Release', r.release ?? (r.inPlan ? '—' : 'not in plan.json')],
      ['Due', r.dueOn ?? 'no due date in plan'], ['First given', r.dueBaselineOn ?? '—'], ['Change', shiftText(r.shiftDays)],
      ['Verified commit', r.commitUrl ? h('a', { href: r.commitUrl }, 'open on GitHub') : '—']]),
    r.narrative ? [sectionTitle('What it asks for'), h('p', {}, safe(plainText(r.narrative)))] : null,
    sectionTitle('Acceptance criteria'),
    criteriaText.length === 0 ? h('p', { class: 'empty' }, 'No criteria recorded.')
      : h('ul', { class: 'criteria' }, criteriaText.map((text) => h('li', {}, ticked.get(text) ? badge('ok', '✓ ticked') : badge('neutral', 'not ticked'), ' ', safe(text)))),
    h('p', { class: 'muted' }, 'A tick is your claim in progress.json. The state above is what the platform verifier confirmed; the two are not equivalent.'),
    r.failurePaths.length ? [sectionTitle('Failure paths'), h('ul', {}, r.failurePaths.map((f) => h('li', {}, safe(f))))] : null,
    r.blockedBy.length ? [sectionTitle('Blocked by'), h('ul', {}, [...new Set(r.blockedBy.map((b) => publicBlockerText(b, names)))].map((b) => h('li', {}, b)))] : null];
}

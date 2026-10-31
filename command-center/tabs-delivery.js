// Project management and AI agents: the plan's releases, tasks and owners, joined to progress.
import { h } from './dom.js';
import { back, badge, card, columns, date, emptyState, facts, greyStatus, sectionTitle, stateBadge, table } from './ui.js';
import { agentRoster, taskList, timeline } from './model-tabs.js';

// Narratives are written in Markdown; show them as plain sentences without the symbols.
const plainText = (text) => (text ?? '').replace(/\*\*|`|#{1,6}\s/g, '');

function shiftText(days) {
  if (days == null) return 'no baseline';
  if (days === 0) return 'unchanged';
  return days > 0 ? `moved ${days} days later` : `moved ${-days} days earlier`;
}

// ---- Project management ----

function gantt(tl) {
  if (!tl) return emptyState('No dates in plan.json yet.', 'The timeline appears once releases or stories have dates.');
  const lane = (label, sub, bar) => h('div', { class: 'gantt-row' },
    h('div', { class: 'gantt-label' }, h('strong', {}, label), h('span', { class: 'muted' }, sub)),
    h('div', { class: 'gantt-track' }, bar,
      tl.markers.map((m) => h('span', { class: `gantt-marker gantt-marker-${m.label === 'Today' ? 'today' : 'demo'}`, style: `left: ${m.left}%` }))));
  return h('div', { class: 'gantt', role: 'group', 'aria-label': 'Release timeline' },
    h('div', { class: 'gantt-axis muted' }, h('span', {}, tl.start), h('span', {}, tl.end)),
    tl.releases.map((r) => lane(`${r.key}${r.isDemoTarget ? ' · demo' : ''}`,
      r.start ? `${r.start} to ${r.end ?? 'not set'}` : 'no dates in plan',
      r.left == null ? null : h('a', {
        class: 'gantt-bar', href: `#/overview/release/${encodeURIComponent(r.key)}`,
        style: `left: ${r.left}%; width: max(${r.width}%, 10px)`, 'aria-label': `Release ${r.key}, ${r.start} to ${r.end}`,
      }))),
    h('ul', { class: 'gantt-legend muted' }, tl.markers.map((m) => h('li', {},
      h('span', { class: `legend-swatch legend-${m.label === 'Today' ? 'today' : 'demo'}`, 'aria-hidden': 'true' }),
      m.label === 'Today'
        ? `Today: ${m.date} (this computer's date in Central time, not from the plan)`
        : `${m.label}: ${m.date} (recorded in plan.json)`))));
}

function storyDetail(tasks, id) {
  const r = tasks.find((t) => t.id === id);
  const toPm = back('#/project-management', 'Back to Project management');
  if (!r) return [toPm, h('h2', {}, 'Story not found'), h('p', {}, `No story "${id}" in plan.json or progress.json.`)];
  const ticked = new Map(r.criteria.map((c) => [c.text, c.passed === true]));
  const criteriaText = r.acceptance.length ? r.acceptance : r.criteria.map((c) => c.text);
  return [toPm, h('h2', {}, r.title ?? r.id), h('p', {}, h('code', {}, r.id)),
    facts([
      ['State', stateBadge(r.state)],
      ['Release', r.release ?? (r.inPlan ? '—' : 'not in plan.json')],
      ['Due', r.dueOn ?? 'no due date in plan'],
      ['First given', r.dueBaselineOn ?? '—'],
      ['Change', shiftText(r.shiftDays)],
      ['Verified commit', r.commitUrl ? h('a', { href: r.commitUrl }, 'open on GitHub') : '—'],
    ]),
    r.narrative ? [sectionTitle('What it asks for'), h('p', {}, plainText(r.narrative))] : null,
    sectionTitle('Acceptance criteria'),
    criteriaText.length === 0 ? h('p', { class: 'empty' }, 'No criteria recorded.')
      : h('ul', { class: 'criteria' }, criteriaText.map((text) => h('li', {},
        ticked.get(text) ? badge('ok', '✓ ticked') : badge('neutral', 'not ticked'), ' ', text))),
    h('p', { class: 'muted' }, 'A tick is your claim in progress.json. The state above is what the platform confirmed.'),
    r.failurePaths.length ? [sectionTitle('Failure paths'), h('ul', {}, r.failurePaths.map((f) => h('li', {}, f)))] : null,
    r.blockedBy.length ? [sectionTitle('Blocked by'), h('ul', {}, r.blockedBy.map((b) => h('li', {}, b)))] : null];
}

export function renderProjectManagement({ model, data }, [page, arg]) {
  const today = model.schedule?.today ?? null;
  const tasks = taskList(model.rows, today ?? '');
  if (page === 'story') return storyDetail(tasks, arg);
  const statusCell = {
    label: 'Status',
    cell: (r) => (r.pastDue ? badge('warn', 'Past due, not verified') : r.state === 'verified' ? badge('ok', '✓ Done') : ''),
  };
  return [h('h2', {}, 'Project management'),
    h('p', {}, 'Every release and due date below is recorded in plan.json, shown exactly as written: past dates are not corrected or hidden. ',
      'Nothing is estimated. A missing date shows as "—" or "no dates in plan". Click a release bar or a story for details.'),
    gantt(timeline(data.plan, model.rows, today)),
    sectionTitle('Every task'),
    table([
      columns.story,
      { label: 'Release', cell: (r) => r.release ?? '—' },
      columns.state,
      { label: 'Due', cell: (r) => date(r.dueOn) },
      { label: 'First given', cell: (r) => date(r.dueBaselineOn) },
      { label: 'Change', cell: (r) => shiftText(r.shiftDays) },
      statusCell,
    ], tasks)];
}

// ---- AI agents ----

function agentDetail(roster, id) {
  const a = roster.items.find((x) => x.id === id);
  const toAgents = back('#/ai-agents', 'Back to AI agents');
  if (!a) return [toAgents, h('h2', {}, 'Not found'), h('p', {}, `No agent or owner "${id}".`)];
  const list = (items) => (items.length ? h('ul', {}, items.map((i) => h('li', {}, String(i)))) : 'none recorded');
  return [toAgents, h('h2', {}, a.name),
    roster.kind === 'owners'
      ? h('p', {}, 'This is a story owner from plan.json, not a scoped AI agent.')
      : facts([
        ['Purpose', a.purpose], ['Trigger', a.trigger ? `${a.trigger} (${a.triggerType ?? 'type not set'})` : null],
        ['Autonomy level', a.autonomyLevel], ['Inputs', list(a.inputs)], ['Outputs', list(a.outputs)],
        ['Approval gates', list(a.approvalGates)], ['Escalation rules', list(a.escalationRules)],
      ]),
    facts([['Skills', a.skills.length ? list(a.skills) : 'no skills registered yet']]),
    h('ul', { class: 'status-list' }, greyStatus('No runs recorded.')),
    sectionTitle(`Stories owned (${a.owns.length})`),
    table([columns.story, columns.state], a.owns, 'Owns no stories.')];
}

export function renderAgents({ model, data }, [page, arg]) {
  const roster = agentRoster(data.plan, model.rows);
  if (page === 'agent') return agentDetail(roster, arg);
  const byLevel = data.plan.derived?.counts?.agents_by_autonomy ?? {};
  const levels = Object.entries(byLevel);
  return [h('h2', {}, 'AI agents'),
    roster.kind === 'owners'
      ? emptyState('Your plan does not carry a scoped agent roster yet.',
        'The cards below group stories by their owner in plan.json. These are owners, not AI agents.',
        'No agent has run, so there is no run history, last-run time or success rate to show.')
      : h('p', {}, levels.length ? `Agents by autonomy level: ${levels.map(([k, v]) => `${k}: ${v}`).join(', ')}.` : 'No autonomy breakdown in plan.json.'),
    h('div', { class: 'cards' }, roster.items.map((a) => card(`#/ai-agents/agent/${encodeURIComponent(a.id)}`,
      roster.kind === 'owners' ? 'Story owner (not an agent)' : `Agent · ${a.autonomyLevel ?? 'autonomy not set'}`,
      a.name, `Owns ${a.owns.length} stories · ${a.skills.length ? `${a.skills.length} skills` : 'no skills registered yet'}`,
      badge('neutral', 'No runs recorded'))))];
}

// The Overview tab: the thirty-second view of the project, and one detail page per card.
import { h } from './dom.js';
import { NOT_CHECKED, back, card, columns, facts, greyStatus, progressBar, sectionTitle, table } from './ui.js';

const toOverview = () => back('#/overview', 'Back to Overview');

function ofText(totals, done, total) {
  if (!totals || totals[done] == null || totals[total] == null) return NOT_CHECKED;
  return `${totals[done]} of ${totals[total]}`;
}

function currentRelease(model) {
  const today = model.schedule?.today;
  if (!today) return null;
  return model.releases.find((r) => r.startsOn && r.endsOn && r.startsOn <= today && today <= r.endsOn) ?? null;
}

function renderMain(model) {
  const t = model.totals;
  const current = currentRelease(model);
  const demoKey = model.schedule?.demoReleaseKey;
  return [
    h('section', { class: 'intro' },
      h('h2', {}, model.project.name ?? 'Project name not in plan.json'),
      h('p', {}, model.project.descriptor ?? 'No descriptor in plan.json.')),
    sectionTitle('Progress'),
    h('div', { class: 'cards' },
      card('#/overview/stories', 'Stories verified', ofText(t, 'stories_verified', 'stories_total'),
        t ? `${t.stories_in_progress ?? 0} in progress, ${t.stories_not_started ?? 0} not started` : null,
        progressBar(t?.stories_verified, t?.stories_total, 'Stories verified')),
      card('#/overview/criteria', 'Acceptance criteria passed', ofText(t, 'criteria_passed', 'criteria_total'), null,
        progressBar(t?.criteria_passed, t?.criteria_total, 'Criteria passed')),
      card('#/overview/points', 'Points awarded', t?.points_awarded ?? NOT_CHECKED, 'as recorded by the platform'),
      card('#/overview/project', 'Project plan', model.project.planVersion != null ? `Version ${model.project.planVersion}` : '—',
        'repository and plan details')),
    sectionTitle('Where you are'),
    h('div', { class: 'cards' },
      card('#/overview/schedule', 'Schedule', demoKey ? `Demo: ${demoKey}` : 'No demo release',
        current ? `Today falls in release ${current.key}` : 'Today is outside every release window in the plan'),
      model.releases.map((r) => card(`#/overview/release/${encodeURIComponent(r.key)}`,
        `Release ${r.key}`, `${r.verifiedCount} of ${r.storyCount} verified`, r.name,
        progressBar(r.verifiedCount, r.storyCount, `Release ${r.key} verified`)))),
    sectionTitle('What is live'),
    h('div', { class: 'cards' },
      card('#/overview/live', 'Agents and systems',
        model.agentsInPlan === 0 ? 'No agent built yet' : `${model.agentsInPlan} agents designed`,
        'No runs recorded. Not checked from here.')),
  ];
}

function groupByRelease(model) {
  const groups = model.releases.map((rel) => ({
    title: `${rel.key} · ${rel.name}`, rows: model.rows.filter((r) => r.inPlan && r.release === rel.key),
  }));
  const outside = model.rows.filter((r) => !r.inPlan);
  if (outside.length) groups.push({ title: 'Listed in progress.json but not in plan.json', rows: outside });
  return groups;
}

function renderStories(model) {
  const { inPlan, inProgress } = model.storyCounts;
  return [toOverview(), h('h2', {}, 'Stories by release'),
    h('p', {}, `plan.json lists ${inPlan} stories; progress.json tracks ${inProgress}. `,
      inPlan !== inProgress ? 'The headline total comes from progress.json, so it counts the extra ones listed at the bottom.' : ''),
    groupByRelease(model).map((g) => [sectionTitle(g.title), table([columns.story, columns.state, columns.due], g.rows, 'No stories here.')])];
}

function renderCriteria(model) {
  const confirmed = {
    label: 'Confirmed by the platform',
    cell: (r) => (r.confirmedTotal == null ? NOT_CHECKED : `${r.confirmedPassed} of ${r.confirmedTotal}`),
  };
  const ticked = { label: 'Ticked in progress.json', cell: (r) => `${r.tickedPassed} of ${r.tickedTotal}` };
  return [toOverview(), h('h2', {}, 'Acceptance criteria'),
    h('p', {}, 'A tick in progress.json is your claim. "Confirmed" is what the platform verified from a pushed commit.'),
    table([columns.story, columns.state, confirmed, ticked], model.rows)];
}

function renderPoints(model) {
  const points = { label: 'Points', cell: (r) => (r.points == null ? NOT_CHECKED : String(r.points)) };
  const commit = { label: 'Verified commit', cell: (r) => (r.commitUrl ? h('a', { href: r.commitUrl }, 'open') : '—') };
  return [toOverview(), h('h2', {}, 'Points awarded'),
    h('p', {}, `The platform's total is ${model.totals?.points_awarded ?? NOT_CHECKED}. Per story:`),
    table([columns.story, columns.state, points, commit], model.rows)];
}

function renderProject(model) {
  const p = model.project;
  return [toOverview(), h('h2', {}, 'Project'), facts([
    ['Name', p.name],
    ['Descriptor', p.descriptor],
    ['Repository', p.repoUrl ? h('a', { href: p.repoUrl }, p.repoUrl) : 'not in plan.json'],
    ['Plan version', p.planVersion],
    ['Plan hash', p.planSha ? h('code', {}, p.planSha.slice(0, 12)) : null],
  ])];
}

function dateTable(items) {
  return table([
    { label: 'Item', cell: (m) => m.label },
    { label: 'Date', cell: (m) => m.date ?? 'not set' },
    { label: 'Status', cell: (m) => (m.isPast ? h('span', { class: 'badge badge-warn' }, 'in the past') : '') },
  ], items);
}

function renderSchedule(model) {
  const s = model.schedule;
  if (!s) return [toOverview(), h('h2', {}, 'Schedule'), h('p', { class: 'empty' }, 'plan.json has no schedule yet.')];
  return [toOverview(), h('h2', {}, 'Schedule'),
    h('p', {}, `Dates exactly as plan.json records them. Today in Central time is ${s.today}.`),
    dateTable(s.milestones), sectionTitle('Preparation tasks'),
    s.prep.length ? dateTable(s.prep) : h('p', { class: 'empty' }, 'No preparation tasks in the plan.')];
}

function renderRelease(model, key) {
  const rel = model.releases.find((r) => r.key === key);
  if (!rel) return [toOverview(), h('h2', {}, 'Release not found'), h('p', {}, `plan.json has no release "${key}".`)];
  const rows = model.rows.filter((r) => rel.storyIds.includes(r.id));
  return [toOverview(), h('h2', {}, `Release ${rel.key} · ${rel.name}`), facts([
    ['Goal', rel.goal],
    ['Done when you can show', rel.demo],
    ['Dates', `${rel.startsOn ?? 'not set'} to ${rel.endsOn ?? 'not set'}`],
    ['Demo target', rel.isDemoTarget ? 'Yes' : 'No'],
  ]),
  table([columns.story, columns.state, columns.due], rows, 'No stories in this release.')];
}

function renderLive(model) {
  return [toOverview(), h('h2', {}, 'Agents and systems'),
    h('p', {}, 'Nothing on this page is live. It shows the files as of the last sync, so every status is grey.'),
    h('ul', { class: 'status-list' },
      greyStatus(model.agentsInPlan === 0
        ? 'No agent is defined in plan.json. No runs recorded.'
        : `${model.agentsInPlan} agents designed in plan.json. No runs recorded.`),
      greyStatus(model.systemsInPlan.length === 0
        ? 'No external system is named in plan.json.'
        : `Systems named in plan.json: ${model.systemsInPlan.join(', ')}.`))];
}

export function renderOverview(model, sub) {
  const [page, arg] = sub;
  switch (page) {
    case undefined: return renderMain(model);
    case 'stories': return renderStories(model);
    case 'criteria': return renderCriteria(model);
    case 'points': return renderPoints(model);
    case 'project': return renderProject(model);
    case 'schedule': return renderSchedule(model);
    case 'release': return renderRelease(model, arg);
    case 'live': return renderLive(model);
    default: return [toOverview(), h('h2', {}, 'Page not found'), h('p', {}, 'This Overview page does not exist.')];
  }
}

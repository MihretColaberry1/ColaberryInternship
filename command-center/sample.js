// Made-up data for Sample mode, so the shape of every tab is visible before real data exists.
// Every screen that shows it carries a SAMPLE banner (see app.js). None of it is real.

const HOUR_MS = 60 * 60 * 1000;

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function makeSampleData(now) {
  const day = (offset) => isoDate(new Date(now.getTime() + offset * 24 * HOUR_MS));
  const story = (id, release, title, due, baseline, fulfills) => ({
    id, release, title, narrative: `As a sample reviewer, I want ${title.toLowerCase()} so that the layout can be previewed.`,
    fulfills, acceptance: ['Sample criterion'], owner_agent: 'Sample agent', failure_paths: [],
    task_guidance: '', due_on: due, due_baseline_on: baseline,
  });
  const verified = (points) => ({
    state: 'verified', criteria_passed: 1, criteria_total: 1, points_awarded: points,
    verified_at: null, commit_sha: null, commit_url: null, commit_at: null, outstanding: [],
  });
  const progressStory = (id, release, verification) => ({
    id, release, acceptance_total: 1, criteria: [{ text: 'Sample criterion', passed: Boolean(verification) }],
    files_touched: [], tests_added: [], notes: null, updated_at: null, verification,
  });
  return {
    isSample: true,
    plan: {
      schema_version: 2,
      project: {
        name: 'Sample project (made up)',
        descriptor: 'A made-up project used to preview the layout.',
        repo_url: null, plan_version: 1, plan_sha256: null,
      },
      requirements: [
        { id: 'SAMPLE-REQ-1', statement: 'Sample: show a weekly report.', kind: 'FUNC', priority: 'must', cluster: 'sample', fulfilled_by: ['SAMPLE-1'] },
        { id: 'SAMPLE-REQ-2', statement: 'Sample: never send a report without review.', kind: 'SAFE', priority: 'must', cluster: 'sample', fulfilled_by: ['SAMPLE-3'] },
        { id: 'SAMPLE-REQ-3', statement: 'Sample: cut review time to 10 minutes.', kind: 'NFR', priority: 'should', cluster: 'sample', fulfilled_by: ['SAMPLE-2'] },
        { id: 'SAMPLE-REQ-4', statement: 'Sample: a must-have requirement nothing covers yet.', kind: 'FUNC', priority: 'must', cluster: 'sample', fulfilled_by: [] },
      ],
      releases: [
        { key: 's1', name: 'Sample release one', goal: 'Sample goal', demo: 'Sample demo', story_ids: ['SAMPLE-1', 'SAMPLE-2'], starts_on: day(-14), ends_on: day(-7), is_demo_target: true },
        { key: 's2', name: 'Sample release two', goal: 'Sample goal', demo: 'Sample demo', story_ids: ['SAMPLE-3'], starts_on: day(-7), ends_on: day(7), is_demo_target: false },
      ],
      stories: [
        story('SAMPLE-1', 's1', 'Sample story one', day(-10), day(-10), ['SAMPLE-REQ-1']),
        story('SAMPLE-2', 's1', 'Sample story two', day(-8), day(-9), ['SAMPLE-REQ-3']),
        story('SAMPLE-3', 's2', 'Sample story three', day(-2), day(-4), ['SAMPLE-REQ-2']),
      ],
      agents: [{
        id: 'sample-agent', name: 'Sample agent', purpose: 'A made-up agent to preview the card.',
        trigger_type: 'schedule', trigger: 'weekly', inputs: ['sample input'], outputs: ['sample report'],
        autonomy_level: 'R1', approval_gates: ['a human approves each report'], escalation_rules: ['sample escalation'],
        skills: ['sample skill'], owns: ['SAMPLE-1', 'SAMPLE-2', 'SAMPLE-3'],
      }],
      schedule: {
        build_start: day(-14), build_end: day(7), demo_day: day(10), build_weeks: 3,
        demo_release_key: 's1', roadmap_release_keys: ['s2'],
        prep: [{ key: 'SAMPLE-PREP', title: 'Sample prep task', due_on: day(3) }],
      },
      derived: {
        measures: [{ id: 'SAMPLE-REQ-3', statement: 'Sample: cut review time to 10 minutes.' }],
        guardrails: [{ id: 'SAMPLE-REQ-2', statement: 'Sample: never send a report without review.' }],
        systems: ['Sample email service'],
        roles: ['sample reviewer'],
        counts: { releases_total: 2, agents_by_autonomy: { R1: 1 } },
      },
    },
    progress: {
      schema_version: 2,
      totals: {
        stories_total: 3, stories_verified: 2, stories_submitted: 0, stories_in_progress: 1,
        stories_not_started: 0, criteria_total: 3, criteria_passed: 2, points_awarded: 20,
      },
      stories: [
        progressStory('SAMPLE-1', 's1', verified(10)),
        progressStory('SAMPLE-2', 's1', verified(10)),
        progressStory('SAMPLE-3', 's2', null),
      ],
    },
    manifest: { generated_at: new Date(now.getTime() - 2 * HOUR_MS).toISOString() },
    notes: { items: [{ date: day(-3), title: 'Sample decision', text: 'A made-up note to preview the list.', source: 'sample' }], error: null },
  };
}

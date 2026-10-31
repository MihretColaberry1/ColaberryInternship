// Pure helpers for the eight tabs after Overview. Same rules as model.js:
// no DOM, no network, and nothing here produces a value the files do not hold.

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayDiff(fromIso, toIso) {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / DAY_MS);
}

function rowLookup(rows) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  return (id) => byId.get(id) ?? { id, title: null, state: null };
}

// A guardrail is a promise. It is kept only when it has stories and every one is verified.
export function guardrailStatus(plan, rows) {
  const row = rowLookup(rows);
  const reqById = new Map((plan.requirements ?? []).map((r) => [r.id, r]));
  return (plan.derived?.guardrails ?? []).map((g) => {
    const stories = (reqById.get(g.id)?.fulfilled_by ?? []).map(row);
    let status = 'not-kept';
    if (stories.length === 0) status = 'no-story';
    else if (stories.every((s) => s.state === 'verified')) status = 'kept';
    return { id: g.id, statement: g.statement, stories, status };
  });
}

// A draft guardrail is written in this repo; each status is read from the file that can prove it.
// Fields a draft sets about itself (registered, approved, verified…) are ignored on purpose.
export function draftGuardrailStatus(drafts, plan, progress, rows) {
  const row = rowLookup(rows);
  const planStoryIds = new Set((plan.stories ?? []).map((s) => s.id));
  const progressById = new Map((progress.stories ?? []).map((s) => [s.id, s]));
  const pending = (evidence) => ({ status: 'pending', evidence });
  const done = (evidence) => ({ status: 'done', evidence });

  return drafts.map((d) => {
    const storyIds = d.stories ?? [];
    const stories = storyIds.map((id) => ({ ...row(id), id, inPlan: planStoryIds.has(id) }));

    const sources = d.sources ?? [];
    const documented = d.statement && sources.length > 0
      ? done(`Written in the drafts file, from ${sources.length} source(s)`)
      : pending('Needs a statement and at least one source');

    const req = (plan.requirements ?? []).find((r) => r.id === d.id);
    const listed = (plan.derived?.guardrails ?? []).some((g) => g.id === d.id);
    let registered = pending(`plan.json has no requirement ${d.id}`);
    if (req && (req.kind !== 'SAFE' || req.statement !== d.statement)) {
      registered = { status: 'conflict', evidence: `plan.json has ${d.id} with a different kind or statement` };
    } else if (req && listed) registered = done(`plan.json lists ${d.id} as SAFE in derived.guardrails`);
    else if (req) registered = pending(`plan.json has ${d.id} but derived.guardrails does not list it`);

    const confirmed = storyIds.filter((id) => {
      const criteria = progressById.get(id)?.criteria ?? [];
      return criteria.length > 0 && criteria.every((c) => c.passed === true);
    });
    const signoff = storyIds.length > 0 && confirmed.length === storyIds.length
      ? done('Every criterion of every linked story is confirmed in progress.json')
      : pending(`${confirmed.length} of ${storyIds.length} linked stories have their criteria confirmed in progress.json`);

    const checks = d.enforcement ?? [];
    const tested = checks.filter((c) => typeof c.test === 'string' && c.test.length > 0);
    const enforcement = checks.length > 0 && tested.length === checks.length
      ? done('Every check names a test')
      : pending(`${tested.length} of ${checks.length} checks name a test`);

    const verifiedCount = stories.filter((s) => s.state === 'verified').length;
    const verification = stories.length > 0 && verifiedCount === stories.length
      ? done('Every linked story is verified')
      : pending(`${verifiedCount} of ${stories.length} linked stories verified`);

    return {
      id: d.id, kind: d.kind ?? null, priority: d.priority ?? null, cluster: d.cluster ?? null,
      statement: d.statement ?? '', sources, checks, stories,
      documented, registered, signoff, enforcement, verification,
    };
  });
}

// Every requirement, the stories covering it, and whether they are all verified.
// A `must` with nothing covering it is a gap and is kept visible, never filtered out.
export function traceability(plan, rows) {
  const row = rowLookup(rows);
  return (plan.requirements ?? []).map((req) => {
    const stories = (req.fulfilled_by ?? []).map(row);
    return {
      id: req.id, statement: req.statement, kind: req.kind ?? null, priority: req.priority ?? null,
      cluster: req.cluster ?? null, stories,
      built: stories.length > 0 && stories.every((s) => s.state === 'verified'),
      gap: req.priority === 'must' && stories.length === 0,
    };
  });
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Roles come from plan.derived.roles; each links back to the stories written "As a <role>".
export function rolesWithStories(plan) {
  return (plan.derived?.roles ?? []).map((role) => {
    const pattern = new RegExp(`\\bAs an? ${escapeRegex(role)}\\b`, 'i');
    return { role, stories: plan.stories.filter((s) => pattern.test(s.narrative ?? '')) };
  });
}

// Scoped agents when the plan has them; otherwise story owners, which are NOT agents.
export function agentRoster(plan, rows) {
  const row = rowLookup(rows);
  const agents = plan.agents ?? [];
  if (agents.length > 0) {
    return {
      kind: 'agents',
      items: agents.map((a) => ({
        id: a.id ?? a.name, name: a.name ?? a.id, purpose: a.purpose ?? null,
        triggerType: a.trigger_type ?? null, trigger: a.trigger ?? null,
        inputs: a.inputs ?? [], outputs: a.outputs ?? [], autonomyLevel: a.autonomy_level ?? null,
        approvalGates: a.approval_gates ?? [], escalationRules: a.escalation_rules ?? [],
        skills: a.skills ?? [], owns: (a.owns ?? []).map(row),
      })),
    };
  }
  const groups = new Map();
  for (const s of plan.stories) {
    const owner = (s.owner_agent ?? '').trim() || 'Unassigned';
    if (!groups.has(owner)) groups.set(owner, []);
    groups.get(owner).push(row(s.id));
  }
  return { kind: 'owners', items: [...groups].map(([name, owns]) => ({ id: name, name, owns, skills: [] })) };
}

// Positions (in percent) for the release Gantt. Only dates the plan holds are drawn.
export function timeline(plan, rows, today) {
  const releases = plan.releases.map((r) => ({
    key: r.key, name: r.name, start: r.starts_on ?? null, end: r.ends_on ?? null, isDemoTarget: r.is_demo_target === true,
  }));
  const markers = [
    { label: 'Demo day', date: plan.schedule?.demo_day ?? null },
    { label: 'Today', date: today },
  ].filter((m) => m.date);
  const dates = [
    ...releases.flatMap((r) => [r.start, r.end]), ...markers.map((m) => m.date),
    ...rows.flatMap((r) => [r.dueOn, r.dueBaselineOn]),
  ].filter(Boolean).sort();
  if (dates.length === 0) return null;
  const start = dates[0];
  const end = dates[dates.length - 1];
  const span = Math.max(dayDiff(start, end), 1);
  const pos = (d) => (dayDiff(start, d) / span) * 100;
  return {
    start, end,
    releases: releases.map((r) => ({
      ...r,
      left: r.start ? pos(r.start) : null,
      width: r.start && r.end ? (Math.max(dayDiff(r.start, r.end), 0) / span) * 100 : null,
    })),
    markers: markers.map((m) => ({ ...m, left: pos(m.date) })),
  };
}

// Per story: how far the due date has moved from the first date given, and whether it is past due.
export function taskList(rows, today) {
  return rows.map((r) => ({
    ...r,
    shiftDays: r.dueOn && r.dueBaselineOn ? dayDiff(r.dueBaselineOn, r.dueOn) : null,
    pastDue: Boolean(r.dueOn) && r.dueOn < today && r.state !== 'verified',
  }));
}

// The shapes this Command Center reads, from docs/DATA_CONTRACT.md, with live counts from the files.
export function dataEntities(plan, progress) {
  const count = (v) => (Array.isArray(v) ? v.length : 0);
  return [
    { name: 'Requirement', source: 'plan.json → requirements[]', count: count(plan.requirements),
      fields: ['id', 'statement', 'kind', 'priority', 'cluster', 'fulfilled_by → Story'] },
    { name: 'Release', source: 'plan.json → releases[]', count: count(plan.releases),
      fields: ['key', 'name', 'goal', 'demo', 'starts_on', 'ends_on', 'is_demo_target', 'story_ids → Story'] },
    { name: 'Story', source: 'plan.json → stories[]', count: count(plan.stories),
      fields: ['id', 'release → Release', 'title', 'narrative', 'fulfills → Requirement', 'acceptance', 'due_on', 'due_baseline_on'] },
    { name: 'Agent', source: 'plan.json → agents[]', count: count(plan.agents),
      fields: ['id', 'name', 'purpose', 'trigger', 'autonomy_level', 'approval_gates', 'owns → Story'] },
    { name: 'Story progress', source: 'progress.json → stories[]', count: count(progress.stories),
      fields: ['id → Story', 'criteria[] (text, passed)', 'files_touched', 'tests_added', 'notes'] },
    { name: 'Verification', source: 'progress.json → stories[].verification', count: progress.stories.filter((s) => s.verification).length,
      fields: ['state', 'criteria_passed', 'criteria_total', 'commit_sha', 'points_awarded', 'outstanding'] },
    { name: 'Manifest', source: 'manifest.json', count: 1, fields: ['generated_at', 'plan_sha256', 'files[]'] },
  ];
}

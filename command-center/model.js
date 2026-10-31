// Turns the raw .colaberry files into what the Overview shows.
// Pure functions only: same input, same output, no DOM and no network.

const DAY_MS = 24 * 60 * 60 * 1000;
export const STALE_AFTER_MS = 7 * DAY_MS;
const TIME_ZONE = 'America/Chicago';

// "27 October 2026, 9:52 PM CDT". The project's readers work in Central time.
export function formatCentral(date) {
  const day = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(date);
  return `${day}, ${time}`;
}

// Today's calendar date in Central time, as YYYY-MM-DD, for comparing with plan dates.
export function centralDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function relativeAge(ageMs) {
  const minutes = Math.floor(ageMs / 60000);
  if (minutes < 1) return 'less than a minute ago';
  if (minutes < 60) return `${plural(minutes, 'minute')} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${plural(hours, 'hour')} ago`;
  return `${plural(Math.floor(hours / 24), 'day')} ago`;
}

// "Data as of", never "last synced": the stamp moves only when the data changes,
// so an old stamp can mean "nothing happened" or "not synced". We do not guess which.
export function describeFreshness(generatedAt, now) {
  const stamp = new Date(generatedAt);
  if (Number.isNaN(stamp.getTime())) {
    return { level: 'unknown', text: 'Data date unknown: manifest.json has no readable generated_at', warning: true };
  }
  const ageMs = now.getTime() - stamp.getTime();
  const absolute = formatCentral(stamp);
  if (ageMs < 0) {
    return { level: 'unknown', text: `Data as of ${absolute} (later than this computer's clock)`, warning: true };
  }
  const text = `Data as of ${absolute} (${relativeAge(ageMs)})`;
  if (ageMs > STALE_AFTER_MS) {
    return { level: 'stale', text: `${text}. Over a week old: sync from the portal to refresh.`, warning: true };
  }
  return { level: ageMs < DAY_MS ? 'fresh' : 'aging', text, warning: false };
}

// One row per story. Plan gives title/release/dates; progress gives state.
// Stories that exist only in progress.json (STORY-000) are kept and flagged.
export function joinStories(plan, progress) {
  const progressById = new Map(progress.stories.map((s) => [s.id, s]));
  const planIds = new Set(plan.stories.map((s) => s.id));
  const toRow = (planStory, progressStory) => {
    const v = progressStory?.verification ?? null;
    const criteria = progressStory?.criteria ?? [];
    return {
      id: planStory?.id ?? progressStory.id,
      title: planStory?.title ?? null,
      release: planStory?.release ?? progressStory?.release ?? null,
      inPlan: Boolean(planStory),
      state: v?.state ?? null,
      confirmedPassed: v ? v.criteria_passed : null,
      confirmedTotal: v ? v.criteria_total : null,
      tickedPassed: criteria.filter((c) => c.passed === true).length,
      tickedTotal: criteria.length,
      points: v?.points_awarded ?? null,
      commitUrl: v?.commit_url ?? null,
      dueOn: planStory?.due_on ?? null,
      dueBaselineOn: planStory?.due_baseline_on ?? null,
      narrative: planStory?.narrative ?? null,
      acceptance: planStory?.acceptance ?? [],
      criteria,
      outstanding: v?.outstanding ?? [],
      failurePaths: planStory?.failure_paths ?? [],
      blockedBy: planStory?.blocked_by ?? [],
      fulfills: planStory?.fulfills ?? [],
      ownerAgent: planStory?.owner_agent ?? null,
      verifiedAt: v?.verified_at ?? null,
    };
  };
  const rows = plan.stories.map((s) => toRow(s, progressById.get(s.id)));
  for (const s of progress.stories) {
    if (!planIds.has(s.id)) rows.push(toRow(null, s));
  }
  return rows;
}

export function summarizeReleases(plan, rows) {
  const rowById = new Map(rows.map((r) => [r.id, r]));
  return plan.releases.map((r) => {
    const ids = r.story_ids ?? [];
    return {
      key: r.key,
      name: r.name,
      goal: r.goal ?? null,
      demo: r.demo ?? null,
      startsOn: r.starts_on ?? null,
      endsOn: r.ends_on ?? null,
      isDemoTarget: r.is_demo_target === true,
      storyIds: ids,
      storyCount: ids.length,
      verifiedCount: ids.filter((id) => rowById.get(id)?.state === 'verified').length,
    };
  });
}

export function summarizeSchedule(plan, now) {
  const today = centralDateKey(now);
  const s = plan.schedule ?? null;
  if (!s) return null;
  const dated = (label, date) => ({ label, date: date ?? null, isPast: Boolean(date) && date < today });
  return {
    today,
    demoReleaseKey: s.demo_release_key ?? null,
    buildWeeks: s.build_weeks ?? null,
    milestones: [
      dated('Build starts', s.build_start),
      dated('Build ends', s.build_end),
      dated('Demo day', s.demo_day),
    ],
    prep: (s.prep ?? []).map((p) => ({ key: p.key, ...dated(p.title, p.due_on) })),
  };
}

export function buildOverviewModel(data, now) {
  const { plan, progress, manifest } = data;
  const rows = joinStories(plan, progress);
  return {
    isSample: data.isSample === true,
    project: {
      name: plan.project?.name ?? plan.project_name ?? null,
      descriptor: plan.project?.descriptor ?? plan.descriptor ?? null,
      repoUrl: plan.project?.repo_url ?? null,
      planVersion: plan.project?.plan_version ?? null,
      planSha: plan.project?.plan_sha256 ?? null,
    },
    // Totals are taken as the platform summed them, never recomputed here.
    totals: progress.totals ?? null,
    storyCounts: { inPlan: plan.stories.length, inProgress: progress.stories.length },
    rows,
    releases: summarizeReleases(plan, rows),
    releasesTotal: plan.derived?.counts?.releases_total ?? plan.releases.length,
    schedule: summarizeSchedule(plan, now),
    agentsInPlan: Array.isArray(plan.agents) ? plan.agents.length : 0,
    systemsInPlan: plan.derived?.systems ?? [],
    freshness: describeFreshness(manifest.generated_at, now),
  };
}

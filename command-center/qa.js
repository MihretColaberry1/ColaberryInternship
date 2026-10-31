// The Knowledge base question panel. It answers only from the data already on this page:
// no AI service, no guessing. Every answer names the tab it came from, and a question it
// cannot match gets an honest "cannot answer" instead of a made-up reply.
import { guardrailStatus, traceability } from './model-tabs.js';

const STATE_TEXT = {
  verified: 'verified', submitted: 'submitted', in_progress: 'in progress', not_started: 'not started',
};

const stateText = (s) => (s ? STATE_TEXT[s] ?? s : 'not checked yet');
const has = (q, ...words) => words.some((w) => q.includes(w));
const reply = (text, tab, href) => ({ answer: text, source: { tab, href } });

export const CANNOT_ANSWER = "I can't answer that from this page's data. Try asking about stories, criteria, points, releases, the schedule, agents, guardrails, systems, measures, roles or requirements.";

function findStory(q, rows) {
  return rows.find((r) => q.includes(r.id.toLowerCase()))
    ?? rows.find((r) => r.title && r.title.length > 8 && q.includes(r.title.toLowerCase()));
}

function storyAnswer(r) {
  const due = r.dueOn ? ` Due ${r.dueOn}.` : '';
  const confirmed = r.confirmedTotal == null ? '' : ` ${r.confirmedPassed} of ${r.confirmedTotal} criteria confirmed.`;
  return reply(`${r.id} is ${stateText(r.state)}.${confirmed}${due}`, 'Project management',
    `#/project-management/story/${encodeURIComponent(r.id)}`);
}

const RULES = [
  {
    test: (q) => has(q, 'as of', 'sync', 'fresh', 'how old', 'stale', 'data age'),
    respond: ({ model }) => reply(`${model.freshness.text}.`, 'Overview', '#/overview'),
  },
  {
    test: (q) => has(q, 'guardrail', 'safe', 'safety', 'never happen'),
    respond: ({ model, data }) => {
      const g = guardrailStatus(data.plan, model.rows);
      if (g.length === 0) return reply('Your plan has no guardrails yet: no requirement is typed SAFE.', 'Guardrails', '#/guardrails');
      const kept = g.filter((x) => x.status === 'kept').length;
      return reply(`${g.length} guardrails; ${kept} enforced by verified stories.`, 'Guardrails', '#/guardrails');
    },
  },
  {
    test: (q) => has(q, 'system', 'integration', 'connect'),
    respond: ({ data }) => {
      const s = data.plan.derived?.systems ?? [];
      return reply(s.length ? `Systems named in the plan: ${s.join(', ')}. None is checked from here.` : 'Your plan names no external system yet.', 'Systems', '#/systems');
    },
  },
  {
    test: (q) => has(q, 'measure', 'outcome', 'kpi', 'target', 'metric'),
    respond: ({ data }) => {
      const m = data.plan.derived?.measures ?? [];
      return reply(m.length ? `${m.length} measures in the plan. None has a measured value in these files.` : 'Your plan carries no numeric target yet.', 'Outcomes', '#/outcomes');
    },
  },
  {
    test: (q) => has(q, 'role', 'user', 'persona', 'who is this for'),
    respond: ({ data }) => {
      const r = data.plan.derived?.roles ?? [];
      return reply(r.length ? `Roles in your stories: ${r.join(', ')}.` : 'No roles are named in your stories yet.', 'Users and use case', '#/users');
    },
  },
  {
    test: (q) => has(q, 'agent', 'autonomy', 'runs'),
    respond: ({ data }) => {
      const n = (data.plan.agents ?? []).length;
      return reply(n ? `${n} agents are designed in the plan. No runs recorded.` : 'No AI agent is defined in the plan yet. No runs recorded.', 'AI agents', '#/ai-agents');
    },
  },
  {
    test: (q) => has(q, 'requirement', 'traceab'),
    respond: ({ model, data }) => {
      const t = traceability(data.plan, model.rows);
      if (t.length === 0) return reply('plan.json has no requirements yet.', 'Knowledge base', '#/knowledge-base');
      const gaps = t.filter((x) => x.gap).length;
      return reply(`${t.length} requirements; ${t.filter((x) => x.built).length} fully verified; ${gaps} "must" requirements with no story.`, 'Knowledge base', '#/knowledge-base');
    },
  },
  {
    test: (q) => has(q, 'point'),
    respond: ({ model }) => reply(`Points awarded: ${model.totals?.points_awarded ?? 'not checked yet'}.`, 'Overview', '#/overview/points'),
  },
  {
    test: (q) => has(q, 'criteri'),
    respond: ({ model }) => {
      const t = model.totals;
      return reply(t ? `${t.criteria_passed} of ${t.criteria_total} acceptance criteria passed.` : 'Not checked yet.', 'Overview', '#/overview/criteria');
    },
  },
  {
    test: (q) => /\brelease\b|\br\d+\b/.test(q),
    respond: ({ model }, q) => {
      const rel = model.releases.find((r) => new RegExp(`\\b${r.key.toLowerCase()}\\b`).test(q));
      if (!rel) return reply(`${model.releases.length} releases: ${model.releases.map((r) => r.key).join(', ')}.`, 'Project management', '#/project-management');
      return reply(`Release ${rel.key} (${rel.name}): ${rel.verifiedCount} of ${rel.storyCount} stories verified.`, 'Overview', `#/overview/release/${encodeURIComponent(rel.key)}`);
    },
  },
  {
    test: (q) => has(q, 'due', 'deadline', 'demo', 'schedule', 'when', 'date'),
    respond: ({ model }) => {
      const s = model.schedule;
      if (!s) return reply('plan.json has no schedule yet.', 'Project management', '#/project-management');
      const demo = s.milestones.find((m) => m.label === 'Demo day');
      return reply(`Demo day is ${demo?.date ?? 'not set'}${demo?.isPast ? ' (in the past)' : ''}; demo release ${s.demoReleaseKey ?? 'not set'}.`, 'Overview', '#/overview/schedule');
    },
  },
  {
    test: (q) => has(q, 'story', 'stories', 'verified', 'progress', 'done', 'complete', 'how many'),
    respond: ({ model }) => {
      const t = model.totals;
      return reply(t ? `${t.stories_verified} of ${t.stories_total} stories verified.` : 'Not checked yet.', 'Overview', '#/overview/stories');
    },
  },
];

export function answerQuestion(question, ctx) {
  const q = String(question ?? '').toLowerCase().trim();
  if (!q) return { answer: 'Type a question first.', source: null };
  const story = findStory(q, ctx.model.rows);
  if (story) return storyAnswer(story);
  const rule = RULES.find((r) => r.test(q));
  return rule ? rule.respond(ctx, q) : { answer: CANNOT_ANSWER, source: null };
}

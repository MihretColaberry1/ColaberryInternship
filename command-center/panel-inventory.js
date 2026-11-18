// Panel "Your capability inventory" (brief panel 2): what am I actually building?
// Capability rows come from the pinned platform source file (the per-domain endpoint does not return
// them); the /coverage cross-check needs a captured snapshot. The project's own stories, releases and
// requirements, from .colaberry/, are carried here from the old nine tabs.
import { h } from './dom.js';
import { badge, table } from './ui.js';
import { ENDPOINTS } from './agent-domain-facts.js';
import { capabilitySourceNote, draftBadge, endpointNotice, endpointRead, endpointTags, sourceFileTag } from './agent-domain-ui.js';
import { consolePanel, errorBlock, loadingBlock } from './console-ui.js';
import { projectTotals, requirementsSection, scheduleSection, storiesSection, timelineSection } from './project-sections.js';
import { ticksAheadOfVerifier } from './verification-model.js';

export const capabilityHref = (id) => `#/capability/${encodeURIComponent(id)}`;
const th = (label, source) => [label, h('span', { class: 'th-src' }, source)];

const CHECK_TEXT = {
  match: ['ok', 'Matches source file'], differs: ['error', 'Differs from source file'], missing: ['warn', 'Not in endpoint response'],
  not_captured: ['neutral', 'Not captured yet'], loading: ['neutral', 'Loading…'], refused: ['error', 'Refused'],
  failed: ['error', 'Not read'], error: ['error', 'Not read'],
};

function countBy(rows, key) {
  const counts = new Map();
  for (const r of rows) counts.set(r[key], (counts.get(r[key]) ?? 0) + 1);
  return [...counts].map(([k, n]) => `${n} ${k}`).join(', ');
}

function capabilityTable(rows, checks) {
  return table([
    { label: 'Capability', cell: (r) => h('a', { href: capabilityHref(r.id) }, r.name) },
    { label: th('Classification', 'source file'), cell: (r) => h('code', {}, r.classification) },
    { label: th('Implementation', 'source file'), cell: (r) => h('code', {}, r.implementation_state) },
    { label: th('Validation', 'source file'), cell: (r) => draftBadge(r.validation) },
    { label: th('Starting rung', 'source file'), cell: (r) => h('code', {}, r.starting) },
    { label: th('Ceiling (proposed)', 'source file'), cell: (r) => h('code', {}, r.ceiling) },
    { label: th('Human decision', 'source file'), cell: (r) => (r.human_decision ? badge('warn', '★ Human decides, always') : 'No') },
    { label: th('/coverage check', 'endpoint'), cell: (r) => badge(...CHECK_TEXT[checks.get(r.id)?.state ?? 'not_captured']) },
  ], rows, 'The source file holds no capabilities.');
}

function projectDetails(project, names) {
  if (!project) return [];
  if (project.error) {
    return [{ title: 'Stories and releases from the project plan', body: errorBlock({ what: 'The project plan could not be read.',
      why: project.error.message, action: { href: '#/guide/refresh', label: 'How to refresh the data' } }) }];
  }
  const { data, model } = project;
  return [
    { title: 'Stories: your ticks and the platform verifier', count: model.rows.length, body: [storiesSection(model, { names }),
      h('p', { class: 'muted' }, 'The platform verifier also keeps a record for each capability rung. Those per-rung records belong to the per-rung behaviour panel and are not counted here.')] },
    { title: 'Release timeline', count: model.releases.length, body: timelineSection(data, model) },
    { title: 'Requirements and which stories cover them', count: (data.plan.requirements ?? []).length, body: requirementsSection(data, model) },
    { title: 'Schedule and milestones', body: scheduleSection(model) },
  ];
}

/** STORY-000 and the like, in words: your ticks and the verifier's count side by side, never merged. */
function aheadWords(project) {
  if (!project?.model) return 'project plan not loaded';
  const ahead = ticksAheadOfVerifier(project.model.rows);
  if (ahead.length === 0) return 'None: no story has more ticks than the platform verifier records';
  return ahead.map((a) => `${a.id.replace(/^product_experience\./, '')}: ${a.ticked} of ${a.tickedTotal} ticked locally; `
    + (a.confirmedTotal == null ? 'no platform verifier record yet' : `platform verifier ${a.confirmed} of ${a.confirmedTotal}`)).join('. ');
}

export function renderInventoryPanel(rows, checks, coverage, { order, sourceState = 'ready', sourceError, project, names = [] } = {}) {
  const state = sourceState !== 'ready' ? sourceState : rows.length === 0 ? 'empty' : 'ready';
  const drafts = rows.filter((r) => r.validation === 'draft').length;
  const humans = rows.filter((r) => r.human_decision).length;
  const firstDraft = rows.find((r) => r.validation === 'draft') ?? rows[0];
  const totals = project?.model ? projectTotals(project.model) : null;

  const headline = state === 'ready'
    ? `${rows.length} capabilities, ${drafts === rows.length ? 'all' : drafts} draft: none has been agreed by anyone yet.`
    : state === 'empty' ? 'The source file holds no capabilities.' : null;
  return consolePanel({
    id: 'inventory', order, state, headline,
    title: 'Your capability inventory',
    question: 'What am I actually building?',
    glance: state === 'ready' ? [
      ['Capabilities', [String(rows.length), ' ', sourceFileTag()]],
      ['Validation', `${drafts} of ${rows.length} draft`],
      ['A human decides, always', `${humans} of ${rows.length}`],
      ['Implementation', countBy(rows, 'implementation_state')],
      // Short labels: the glance grid gives a long label its full width and squeezes the value (820 px check).
      ['Verified by the platform', totals ? `${totals.stories} plan stories` : 'project plan not loaded'],
      ['Ticks ahead of verifier', aheadWords(project)],
    ] : null,
    body: state === 'error'
      ? errorBlock({ what: 'The capability source file could not be read.', why: sourceError, action: { href: '#/guide/refresh', label: 'How to refresh the data' } })
      : state === 'loading' ? loadingBlock() : capabilitySourceNote(),
    action: state === 'ready' && firstDraft ? { href: capabilityHref(firstDraft.id), label: 'Review a draft capability' } : null,
    reads: [endpointTags(2), sourceFileTag()],
    details: [
      state === 'ready' ? { title: 'All capabilities, in the order research recorded them', count: rows.length, body: [
        endpointNotice(ENDPOINTS.coverage, coverage) ?? endpointRead(ENDPOINTS.coverage, coverage),
        capabilityTable(rows, checks)] } : null,
      // Decision D4: titles pass through withholdNames; with no name list loaded they show as story ids.
      ...projectDetails(project, names),
    ],
  });
}

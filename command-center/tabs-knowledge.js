// Knowledge base and Data model: what the project knows about itself, and the shapes behind it.
import { h } from './dom.js';
import { back, badge, card, columns, emptyState, facts, sectionTitle, table } from './ui.js';
import { dataEntities, traceability } from './model-tabs.js';
import { answerQuestion } from './qa.js';
import { NOTES_FILE } from './data.js';

// ---- Knowledge base ----

function askPanel(ctx) {
  const output = h('div', { class: 'qa-answer', 'aria-live': 'polite' });
  const input = h('input', { id: 'qa-input', type: 'text', autocomplete: 'off', placeholder: 'e.g. How many stories are verified?' });
  const onsubmit = (event) => {
    event.preventDefault();
    const { answer, source } = answerQuestion(input.value, ctx);
    // Wrapped in h() so a missing source is skipped rather than printed as "null".
    output.replaceChildren(h('div', {}, h('p', {}, answer),
      source ? h('p', { class: 'muted' }, 'Source: ', h('a', { href: source.href }, `${source.tab} tab`)) : null));
  };
  return h('section', { class: 'qa', 'aria-labelledby': 'qa-title' },
    h('h3', { id: 'qa-title', class: 'section-title' }, 'Ask about this project'),
    h('p', { class: 'muted' }, 'Answers come only from the data on this page and name the tab they came from. No AI service is called; if the data cannot answer, it says so.'),
    h('form', { class: 'qa-form', onsubmit },
      h('label', { for: 'qa-input', class: 'visually-hidden' }, 'Your question'),
      input, h('button', { type: 'submit', class: 'btn-primary' }, 'Ask')),
    output);
}

function requirementDetail(trace, id) {
  const r = trace.find((x) => x.id === id);
  const toKb = back('#/knowledge-base', 'Back to Knowledge base');
  if (!r) return [toKb, h('h2', {}, 'Not found'), h('p', {}, `plan.json has no requirement "${id}".`)];
  return [toKb, h('h2', {}, r.id), facts([
    ['Statement', r.statement], ['Kind', r.kind], ['Priority', r.priority], ['Cluster', r.cluster],
    ['Status', r.built ? badge('ok', '✓ Every covering story verified') : r.gap ? badge('warn', 'Gap: no story covers this') : badge('neutral', 'Not yet verified')],
  ]), sectionTitle('Covered by'), table([columns.story, columns.state], r.stories, 'No story fulfils this requirement.')];
}

function notesSection(notes) {
  if (notes?.error) return h('p', { class: 'error' }, `Your notes could not be read: ${notes.error}`);
  const items = notes?.items ?? [];
  if (items.length === 0) return emptyState('No decisions or notes recorded yet.', `Add them to ${NOTES_FILE} as you go. Each one should name the file or link that backs it.`);
  return h('ul', { class: 'notes' }, items.map((n) => h('li', {},
    h('strong', {}, n.title ?? 'Untitled'), n.date ? h('span', { class: 'muted' }, ` · ${n.date}`) : null,
    n.text ? h('p', {}, n.text) : null, n.source ? h('p', { class: 'muted' }, `Source: ${n.source}`) : null)));
}

export function renderKnowledgeBase(ctx, [page, arg]) {
  const { model, data } = ctx;
  const trace = traceability(data.plan, model.rows);
  if (page === 'requirement') return requirementDetail(trace, arg);
  const gaps = trace.filter((r) => r.gap).length;
  return [h('h2', {}, 'Knowledge base'),
    askPanel(ctx),
    sectionTitle('Requirements and traceability'),
    trace.length === 0
      ? emptyState('plan.json has no requirements yet.', 'When it does, each requirement is listed with the stories that cover it and whether they are verified.')
      : [gaps ? h('p', {}, badge('warn', `${gaps} "must" requirements have no story`)) : null,
        table([
          { label: 'Requirement', cell: (r) => [h('a', { href: `#/knowledge-base/requirement/${encodeURIComponent(r.id)}` }, h('code', {}, r.id)), h('div', { class: 'muted' }, r.statement)] },
          { label: 'Kind', cell: (r) => `${r.kind ?? '—'} · ${r.priority ?? '—'}` },
          { label: 'Covered by', cell: (r) => (r.stories.length ? r.stories.map((s) => s.id).join(', ') : badge('warn', 'nothing')) },
          { label: 'Verified', cell: (r) => (r.built ? badge('ok', '✓ yes') : badge('neutral', 'not yet')) },
        ], trace)],
    sectionTitle('Stories'),
    table([columns.story, { label: 'Release', cell: (r) => r.release ?? '—' }, columns.state,
      { label: 'Criteria', cell: (r) => String(r.acceptance.length || r.tickedTotal) }], model.rows),
    sectionTitle('Decisions and notes'),
    notesSection(data.notes)];
}

// ---- Data model ----

export function renderDataModel({ data }, [page, arg]) {
  const entities = dataEntities(data.plan, data.progress);
  if (page === 'entity') {
    const e = entities.find((x) => x.name === arg);
    const toDm = back('#/data-model', 'Back to Data model');
    if (!e) return [toDm, h('h2', {}, 'Not found'), h('p', {}, `No table "${arg}".`)];
    return [toDm, h('h2', {}, e.name), facts([['Read from', h('code', {}, e.source)], ['Rows in your files', String(e.count)]]),
      sectionTitle('Fields (→ marks a relationship)'), h('ul', { class: 'fields' }, e.fields.map((f) => h('li', {}, h('code', {}, f))))];
  }
  const requirements = data.plan.requirements ?? [];
  return [h('h2', {}, 'Data model'),
    sectionTitle("Your domain's tables"),
    emptyState(requirements.length === 0
      ? 'No requirements in plan.json, so no domain tables can be derived yet.'
      : `${requirements.length} requirements are available to derive tables from.`,
    'Deriving tables is a design step done with you: STORY-000 says to show the model for review before any table is created. None has been created.'),
    sectionTitle('The data behind this Command Center'),
    h('p', {}, 'These shapes come from docs/DATA_CONTRACT.md. Stories in plan.json and progress.json are joined on story id.'),
    h('div', { class: 'cards' }, entities.map((e) => card(`#/data-model/entity/${encodeURIComponent(e.name)}`,
      'Table', e.name, `${e.count} rows · ${e.source}`)))];
}

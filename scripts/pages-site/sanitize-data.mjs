// Public copies of the five data files the Command Center reads, for the GitHub Pages demo only.
//
// Two rules, and nothing else:
//   1. Keep only the fields the page reads (KEEP below). A field it never reads is dropped, not changed.
//   2. Where a kept field holds a person's name, a staff record id or account records, rewrite it with
//      the page's OWN display functions (command-center/agent-domain-redact.js, unchanged), so the file
//      holds exactly what the screen already shows. Nothing is invented; the two placeholders used are
//      named in each file's `_public_copy` block, with the sha256 of the original.
// The originals in the repository are never written. tests/pages-site.test.mjs renders all 71 pages from
// the originals and from these copies and fails unless the visible text is identical.
//
// Failure modes handled: a missing or unparsable input file, or no manager name to withhold, throws
// (the build stops; nothing is half-written because the caller writes only after every file is ready).
// Not handled here: a name inside a field kept whole (for example a future authority[] entry). The
// verifier's privacy scan (verify-site.mjs) catches that and fails the build.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import {
  PRESENT, MANAGER_ACCESS_TEXT, accountableNames, isManagerAccessText, publicBlockerText,
  withholdNames, withholdRecordIds,
} from '../../command-center/agent-domain-redact.js';

export const CAPABILITY_FILE = 'command-center/sources/product_experience.capabilities.json';

/** The placeholder for accountable_human. The page uses that field only as the name to withhold. */
export const NAME_PLACEHOLDER = 'WITHHELD';

/**
 * The fields the page reads, found by rendering every reachable page against instrumented copies of
 * the files (2026-11-13, at 080ac31). A path ending at a container keeps the container whole.
 */
export const KEEP = Object.freeze({
  '.colaberry/plan.json': ['.agents', '.derived.counts.releases_total', '.derived.guardrails', '.derived.measures',
    '.derived.roles', '.derived.systems', '.project.descriptor', '.project.name', '.project.plan_sha256',
    '.project.plan_version', '.project.repo_url', '.releases[].demo', '.releases[].ends_on', '.releases[].goal',
    '.releases[].is_demo_target', '.releases[].key', '.releases[].name', '.releases[].starts_on',
    '.releases[].story_ids[]', '.requirements', '.schedule.build_end', '.schedule.build_start',
    '.schedule.build_weeks', '.schedule.demo_day', '.schedule.demo_release_key', '.schedule.prep[].due_on',
    '.schedule.prep[].key', '.schedule.prep[].title', '.stories[].acceptance[]', '.stories[].due_baseline_on',
    '.stories[].due_on', '.stories[].failure_paths', '.stories[].fulfills', '.stories[].id', '.stories[].narrative',
    '.stories[].owner_agent', '.stories[].release', '.stories[].title'],
  '.colaberry/progress.json': ['.stories[].criteria[].passed', '.stories[].criteria[].text', '.stories[].id',
    '.stories[].release', '.stories[].verification.commit_url', '.stories[].verification.criteria_passed',
    '.stories[].verification.criteria_total', '.stories[].verification.outstanding',
    '.stories[].verification.points_awarded', '.stories[].verification.state', '.stories[].verification.verified_at',
    '.totals.criteria_passed', '.totals.criteria_total', '.totals.points_awarded', '.totals.stories_total',
    '.totals.stories_verified'],
  '.colaberry/manifest.json': ['.generated_at'],
  '.colaberry/agent-domain.json': ['.agent.agent_id', '.agent.autonomy_level', '.agent.autonomy_level_set_at',
    '.agent.autonomy_level_source', '.agent.display_name', '.agent.enabled', '.agent.exists', '.agent.tools_granted',
    '.agent.tools_granted_count', '.authority', '.authority_rule', '.domain_key', '.governance.requests',
    '.not_recorded[].field', '.not_recorded[].reason', '.schema', '.verification.stories[].reasons[]',
    '.verification.stories[].story_id'],
  [CAPABILITY_FILE]: ['.accountable_human', '.capabilities[].blocked_by[]', '.capabilities[].capability_id',
    '.capabilities[].classification', '.capabilities[].human_decision', '.capabilities[].implementation_state',
    '.capabilities[].max_autonomy_rationale', '.capabilities[].max_permitted_autonomy', '.capabilities[].name',
    '.capabilities[].release_behaviour[].acceptance_criteria', '.capabilities[].release_behaviour[].autonomy',
    '.capabilities[].release_behaviour[].behaviour', '.capabilities[].required_tools[]',
    '.capabilities[].requirement_validation_state', '.capabilities[].starting_autonomy'],
});

function keepTree(paths) {
  const tree = {};
  for (const p of paths) {
    let node = tree;
    for (const seg of p.match(/\.[^.[]+|\[\]/g)) node = (node[seg] ??= {});
  }
  return tree;
}

/** Copies only the kept paths. An empty subtree means "keep this value whole". */
export function pick(value, tree) {
  if (Array.isArray(value)) return tree['[]'] ? value.map((x) => pick(x, tree['[]'])) : value;
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) {
      const sub = tree[`.${k}`];
      if (sub) out[k] = Object.keys(sub).length ? pick(value[k], sub) : value[k];
    }
    return out;
  }
  return value;
}

/** The page's own text rules, in the order its screens apply them. */
function textRules(names) {
  const say = (x) => (typeof x === 'string' ? withholdNames(withholdRecordIds(x), names) : x);
  // A narrative line describing a person's account records becomes the page's neutral sentence (D4).
  const line = (l) => (isManagerAccessText(l) ? (l.match(/^\s*[-*]\s*/)?.[0] ?? '') + MANAGER_ACCESS_TEXT : say(l));
  const narrative = (x) => (typeof x === 'string' ? x.split('\n').map(line).join('\n') : x);
  return { say, narrative, blocker: (b) => publicBlockerText(b, names) };
}

const TRANSFORMS = Object.freeze({
  '.colaberry/plan.json': ['names -> "the accountable manager"', 'record ids -> "[record ID withheld]"',
    'narrative lines about a person\'s account records -> the page\'s neutral sentence'],
  '.colaberry/progress.json': ['names -> "the accountable manager"', 'record ids -> "[record ID withheld]"'],
  '.colaberry/manifest.json': [],
  '.colaberry/agent-domain.json': ['agent.agent_id -> "[present]" (the page shows only whether an agent is linked)',
    'names -> "the accountable manager"'],
  [CAPABILITY_FILE]: [`accountable_human -> "${NAME_PLACEHOLDER}" (the page uses it only as the name to withhold)`,
    'names -> "the accountable manager"', 'record ids -> "[record ID withheld]"',
    'blocked_by[] -> the text the page shows for each blocker'],
});

function applyRules(file, data, rules) {
  const { say, narrative, blocker } = rules;
  const each = (xs, fn) => (Array.isArray(xs) ? xs.map(fn) : xs);
  if (file === '.colaberry/plan.json') {
    for (const s of data.stories ?? []) { s.title = say(s.title); s.narrative = narrative(s.narrative); s.acceptance = each(s.acceptance, say); }
  } else if (file === '.colaberry/progress.json') {
    for (const s of data.stories ?? []) {
      for (const c of s.criteria ?? []) c.text = say(c.text);
      if (s.verification) s.verification.outstanding = each(s.verification.outstanding, say);
    }
  } else if (file === '.colaberry/agent-domain.json') {
    if (data.agent) data.agent.agent_id = data.agent.agent_id == null || data.agent.agent_id === '' ? null : PRESENT;
    for (const s of data.verification?.stories ?? []) s.reasons = each(s.reasons, say);
  } else if (file === CAPABILITY_FILE) {
    data.accountable_human = NAME_PLACEHOLDER;
    for (const c of data.capabilities ?? []) {
      c.name = say(c.name); c.max_autonomy_rationale = say(c.max_autonomy_rationale);
      c.blocked_by = each(c.blocked_by, blocker);
      for (const b of c.release_behaviour ?? []) { b.behaviour = say(b.behaviour); b.acceptance_criteria = say(b.acceptance_criteria); }
    }
  }
  return data;
}

async function readRaw(root, file) {
  const bytes = await readFile(path.join(root, file));
  try {
    return { bytes, json: JSON.parse(bytes.toString('utf8')) };
  } catch (err) {
    throw new Error(`pages build: ${file} is not valid JSON (${err.message})`);
  }
}

/** The manager's name list, read from the original research file; the build refuses to run without it. */
export async function managerNames(root) {
  const names = accountableNames((await readRaw(root, CAPABILITY_FILE)).json);
  if (names.length === 0) throw new Error(`pages build: ${CAPABILITY_FILE} has no accountable_human, so names cannot be withheld`);
  return names;
}

/** Returns { file: text } for the five public copies. Reads the originals; writes nothing. */
export async function sanitizeData(root) {
  const rules = textRules(await managerNames(root));
  const out = {};
  for (const file of Object.keys(KEEP)) {
    const { bytes, json } = await readRaw(root, file);
    const kept = applyRules(file, pick(json, keepTree(KEEP[file])), rules);
    const provenance = {
      derived_from: file,
      source_sha256: createHash('sha256').update(bytes).digest('hex'),
      kept: 'only the fields the Command Center reads',
      transforms: TRANSFORMS[file],
      note: 'A public copy for the GitHub Pages demo, not platform output. The original is unchanged in the repository.',
    };
    out[file] = `${JSON.stringify({ _public_copy: provenance, ...kept }, null, 2)}\n`;
  }
  return out;
}

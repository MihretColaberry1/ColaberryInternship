// Offline regression test for docs/definitions/brand_design_system_sync_review.R0.md.
// Run from the repository root: node --test tests/brand-sync-review-r0.test.mjs
//
// What this guards: the R0 definition stays honest and complete. It must quote the story's
// criterion exactly, handle every exception the story lists, resolve every in-repo link and
// source citation, and never claim Aleem's approval unless the sign-off record holds it.
// What it does NOT do: read the platform repository or GitHub. Every input is a file in this
// repository, so it is deterministic and runs with no network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORY_ID = 'product_experience.CAP.brand_design_system_sync_review';
const DOC_PATH = 'docs/definitions/brand_design_system_sync_review.R0.md';
const STORY_PATH = `docs/stories/${STORY_ID}.md`;

const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');

// ---------------------------------------------------------------------------------------------
// Pure helpers. Each takes text and returns data, so the failure cases below can feed them
// small hand-written documents.

/** The story's acceptance criteria: the "- [ ]" or "- [x]" lines under "## Acceptance". */
export function storyCriteria(storyText) {
  const at = storyText.indexOf('## Acceptance');
  if (at < 0) return [];
  return [...storyText.slice(at).matchAll(/^- \[[ x]\] (.+)$/gm)].map((m) => m[1].trim());
}

/** The story's "Exceptions that must be handled" bullets, from the first build prompt. */
export function storyExceptions(storyText) {
  const at = storyText.indexOf('**Exceptions that must be handled**');
  if (at < 0) return [];
  const lines = storyText.slice(at).split('\n').slice(1);
  const out = [];
  for (const line of lines) {
    if (!line.startsWith('- ')) break;
    out.push(line.slice(2).trim());
  }
  return out;
}

/** Rows of the sign-off record table, excluding the header and divider. */
export function signOffRows(docText) {
  const at = docText.indexOf('### Sign-off record');
  if (at < 0) return null;
  const rows = [];
  for (const line of docText.slice(at).split('\n').slice(1)) {
    if (line.startsWith('#')) break;
    if (!line.startsWith('|')) { if (rows.length) break; continue; }
    rows.push(line.split('|').slice(1, -1).map((c) => c.trim()));
  }
  return rows.slice(2); // header row, divider row
}

/** True for a real entry rather than the "(none)" placeholder row. */
const isRealEntry = (cells) => Boolean(cells[0]) && cells[0] !== '(none)' && !/no response recorded/i.test(cells.join(' '));

/** True when the record holds at least one real entry, about any decision. */
export function hasRecordedSignOff(rows) {
  return rows.some(isRealEntry);
}

/**
 * The outcomes recorded in "Decisions covered" (column 3), across every real entry, as
 * "ID: outcome" strings, e.g. ["D2: confirmed", "OQ1: answered"]. The document asks for this form.
 */
export function recordedOutcomes(rows) {
  return rows.filter(isRealEntry)
    .flatMap((cells) => String(cells[2] || '').split(';'))
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
}

/**
 * The R0 criterion needs BOTH Aleem's confirmation of the note format (D2) and his answer to OQ1,
 * in one entry or across entries. Anything else, including a D2 entry asking for a change, or an
 * entry about another decision, does not meet it.
 */
export function criterionSignedOff(rows) {
  const outcomes = recordedOutcomes(rows);
  return outcomes.some((o) => /^D2: confirmed$/i.test(o)) && outcomes.some((o) => /^OQ1: answered$/i.test(o));
}

/**
 * Open questions that no decision row refers to. A question is covered when a "| Dn |" row names
 * it (OQ1 does not match OQ10), or when its own "Blocks" cell says it blocks nothing in this document.
 */
export function questionsWithoutDecision(docText) {
  const decisionText = (docText.match(/^\| D\d+ \|.*$/gm) || []).join('\n');
  const rows = [...docText.matchAll(/^\| \*{0,2}(OQ\d+)\*{0,2} \|(.*)$/gm)];
  return rows
    .filter(([, id, rest]) => {
      if (new RegExp(`\\b${id}\\b`).test(decisionText)) return false;
      const blocks = rest.split('|')[2] || '';
      return !/none in this document/i.test(blocks);
    })
    .map(([, id]) => id);
}

/** The status line near the top of the document. */
export function statusLine(docText) {
  return (docText.match(/^\*\*Status:\*\*.*$/m) || [''])[0];
}

/** Relative markdown link targets (no scheme, no pure anchors), without their #fragment. */
export function relativeLinks(docText) {
  return [...docText.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((m) => m[1])
    .filter((href) => !/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('#'))
    .map((href) => href.split('#')[0]);
}

/** Source ids cited in the body ([S1], [S2][S3]) and the ids defined in the Sources table. */
export function sourceIds(docText) {
  const at = docText.lastIndexOf('## Sources');
  const body = at < 0 ? docText : docText.slice(0, at);
  const table = at < 0 ? '' : docText.slice(at);
  const cited = new Set([...body.matchAll(/\[(S\d+)\]/g)].map((m) => m[1]));
  const defined = new Set([...table.matchAll(/^\| (S\d+) \|/gm)].map((m) => m[1]));
  return { cited, defined };
}

/** Numbered ids of one family (I, D, OQ, E, G) that appear as the first cell of a table row. */
export function tableIds(docText, prefix) {
  const re = new RegExp(`^\\| \\*{0,2}(${prefix}\\d+)\\*{0,2} \\|`, 'gm');
  return [...docText.matchAll(re)].map((m) => m[1]);
}

const isConsecutive = (ids, prefix) => ids.every((id, i) => id === `${prefix}${i + 1}`);

// ---------------------------------------------------------------------------------------------
// The real files.

const doc = read(DOC_PATH);
const story = read(STORY_PATH);
const progress = JSON.parse(read('.colaberry/progress.json'));
const progressStory = progress.stories.find((s) => s.id === STORY_ID);

test('the definition quotes the story criterion exactly, and progress.json carries the same text', () => {
  const criteria = storyCriteria(story);
  assert.equal(criteria.length, 1, 'the story is expected to have exactly one R0 criterion');
  // Markdown renders a line break inside a paragraph as a space, so compare with whitespace collapsed.
  const flat = (s) => s.replace(/\s+/g, ' ');
  assert.ok(flat(doc).includes(criteria[0]), `definition must quote the criterion verbatim: ${criteria[0]}`);
  assert.ok(progressStory, `${STORY_ID} must exist in .colaberry/progress.json`);
  assert.deepEqual(progressStory.criteria.map((c) => c.text), criteria);
});

test('no approval is claimed: the criterion passes only with D2 confirmed AND OQ1 answered on record', () => {
  const rows = signOffRows(doc);
  assert.ok(rows && rows.length > 0, 'the sign-off record table must exist');
  const passed = progressStory.criteria.every((c) => c.passed === true);
  const met = criterionSignedOff(rows);
  if (!met) {
    assert.equal(passed, false, 'progress.json must not pass the criterion without D2: confirmed and OQ1: answered');
    assert.notEqual(progressStory.verification.state, 'verified');
  }
  if (!hasRecordedSignOff(rows)) {
    assert.match(statusLine(doc), /not signed/i, 'an empty record requires an unsigned status line');
    assert.match(doc, /Not signed\. Aleem has not confirmed anything/);
  }
  // Whatever the record says, a passed criterion must be backed by both recorded outcomes.
  if (passed) assert.ok(met, 'a passed criterion needs D2: confirmed and OQ1: answered in the sign-off record');
});

test('every exception the story lists is handled in section 5, in the story order', () => {
  const exceptions = storyExceptions(story);
  assert.equal(exceptions.length, 4, 'the story lists four exceptions');
  // Each story exception, the word that identifies it, and the row of §5 that must handle it.
  const expected = [
    [/font-file-only/i, 'E1', /Font-file-only change/],
    [/dead token/i, 'E2', /Dead token/],
    [/failed sync/i, 'E3', /Failed sync/],
    [/hand-authored/i, 'E4', /Hand-authored files/],
  ];
  expected.forEach(([storyWord, id, rowWord], i) => {
    assert.match(exceptions[i], storyWord, `story exception ${i + 1} changed: ${exceptions[i]}`);
    const row = doc.match(new RegExp(`^\\| ${id} \\|.*$`, 'm'));
    assert.ok(row, `section 5 must have row ${id}`);
    assert.match(row[0], rowWord);
  });
});

test('the definition names every source module the story lists', () => {
  const at = story.indexOf('**Source modules**');
  const modules = story.slice(at).split('\n').slice(1).filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim());
  assert.ok(modules.length >= 5);
  for (const mod of modules.slice(0, 5)) {
    assert.ok(doc.includes(mod.replace(/\/$/, '')), `definition must cite ${mod}`);
  }
});

test('required sections are present, in order', () => {
  const headings = [
    '## 0. Where this story stands on the platform',
    '## What R0 is, and what it is not',
    '## 1. What the sync does today',
    '## 2. Worked example: PR #2342',
    '## 3. What a brand impact note must contain',
    '## 4. What makes a note insufficient for a merge decision',
    '## 5. Exceptions, and how the note handles each',
    '## 6. Gaps between the story and the code',
    '## 7. Boundaries and stop conditions',
    '## 8. Open questions',
    '## Sign-off',
    '### Decisions',
    '### Sign-off record',
    '## Sources',
  ];
  let last = -1;
  for (const h of headings) {
    const at = doc.indexOf(h);
    assert.ok(at > last, `missing or out of order: ${h}`);
    last = at;
  }
});

test('numbered ids run without gaps, every open question maps to a decision, and no decision is pre-ticked', () => {
  for (const [prefix, min] of [['I', 11], ['E', 7], ['G', 9], ['OQ', 10], ['D', 10]]) {
    const ids = tableIds(doc, prefix);
    assert.ok(ids.length >= min, `${prefix}: expected at least ${min}, found ${ids.length}`);
    assert.ok(isConsecutive(ids, prefix), `${prefix} ids must run 1..n with no gaps: ${ids.join(',')}`);
  }
  // Every open question is named by a decision row, or says it blocks nothing in this document.
  assert.deepEqual(questionsWithoutDecision(doc), [], 'open questions with no decision row');
  // Every decision row offers Aleem a choice and none is pre-ticked.
  const decisionRows = doc.match(/^\| D\d+ \|.*$/gm);
  for (const row of decisionRows) {
    assert.match(row, /☐/, `decision row must offer a choice: ${row.slice(0, 40)}`);
    assert.doesNotMatch(row, /☑|☒|\[x\]/i, `decision row must not be pre-ticked: ${row.slice(0, 40)}`);
  }
});

test('every in-repository link resolves', () => {
  const docDir = path.dirname(DOC_PATH);
  const links = relativeLinks(doc);
  assert.ok(links.length > 0);
  for (const href of links) {
    const target = path.join(ROOT, docDir, decodeURI(href));
    assert.ok(existsSync(target), `broken link: ${href}`);
  }
});

test('every bracketed [Sn] citation is defined in the Sources table, and every defined source is cited in brackets', () => {
  const { cited, defined } = sourceIds(doc);
  const undefinedIds = [...cited].filter((id) => !defined.has(id));
  const uncited = [...defined].filter((id) => !cited.has(id));
  assert.deepEqual(undefinedIds, [], 'cited but not defined');
  assert.deepEqual(uncited, [], 'defined but never cited');
});

// ---------------------------------------------------------------------------------------------
// Failure paths: the helpers must catch the mistakes this test exists to prevent.

const fakeDoc = (status, recordRow) => [
  `**Status:** ${status}`,
  '### Sign-off record',
  '',
  '| Date (Central) | Channel | Decisions covered | Words | Where | By |',
  '|---|---|---|---|---|---|',
  recordRow,
  '',
  '### Next',
].join('\n');

test('failure path: an empty record is not mistaken for a sign-off', () => {
  const rows = signOffRows(fakeDoc('draft, not signed.', '| (none) | (none) | (none) | *No response recorded yet.* | (none) | (none) |'));
  assert.equal(rows.length, 1);
  assert.equal(hasRecordedSignOff(rows), false);
});

test('failure path: a real entry is detected as a sign-off', () => {
  const rows = signOffRows(fakeDoc('signed', '| 3:10 PM CST on 2026-11-20 | Email | D2, OQ1 | "Yes, that answers it." | inbox | Mihret |'));
  assert.equal(hasRecordedSignOff(rows), true);
});

test('failure path: an entry about another decision does not meet the criterion', () => {
  const rows = signOffRows(fakeDoc('partly answered', '| 3:10 PM CST on 2026-11-20 | Email | D4: agreed; D6: agreed | "Fine." | inbox | Mihret |'));
  assert.equal(hasRecordedSignOff(rows), true);
  assert.equal(criterionSignedOff(rows), false);
});

test('failure path: D2 alone, OQ1 alone, or D2 with a change request does not meet the criterion', () => {
  const row = (covered) => `| 3:10 PM CST on 2026-11-20 | Email | ${covered} | "…" | inbox | Mihret |`;
  assert.equal(criterionSignedOff(signOffRows(fakeDoc('x', row('D2: confirmed')))), false);
  assert.equal(criterionSignedOff(signOffRows(fakeDoc('x', row('OQ1: answered')))), false);
  assert.equal(criterionSignedOff(signOffRows(fakeDoc('x', row('D2: change requested; OQ1: answered')))), false);
  // OQ10 is not OQ1, and D20 is not D2.
  assert.equal(criterionSignedOff(signOffRows(fakeDoc('x', row('D20: confirmed; OQ10: answered')))), false);
  // A placeholder row never counts, whatever its cells say.
  assert.equal(criterionSignedOff(signOffRows(fakeDoc('x', '| (none) | (none) | D2: confirmed; OQ1: answered | *No response recorded yet.* | (none) | (none) |'))), false);
});

test('happy path: D2 confirmed and OQ1 answered meet the criterion, in one entry or across two', () => {
  const row = (covered) => `| 3:10 PM CST on 2026-11-20 | Email | ${covered} | "…" | inbox | Mihret |`;
  assert.equal(criterionSignedOff(signOffRows(fakeDoc('x', row('D2: confirmed; OQ1: answered')))), true);
  const twoEntries = fakeDoc('x', `${row('OQ1: answered')}\n${row('D2: confirmed; D4: agreed')}`);
  assert.equal(criterionSignedOff(signOffRows(twoEntries)), true);
});

test('failure path: a question no decision names is reported; one that blocks nothing is not', () => {
  const sample = [
    '| **OQ1** | q | why | D1 | wd | ad | p |',
    '| **OQ2** | q | why | D9 | wd | ad | p |',
    '| **OQ3** | q | why | (none in this document) | wd | ad | p |',
    '| D1 | covers OQ1 | wd | ☐ agree |',
  ].join('\n');
  assert.deepEqual(questionsWithoutDecision(sample), ['OQ2']);
  // OQ1 named in a decision row must not cover OQ10.
  assert.deepEqual(questionsWithoutDecision('| **OQ10** | q | why | D1 | x |\n| D1 | covers OQ1 | x |'), ['OQ10']);
});

test('failure path: a source mentioned without brackets does not count as cited', () => {
  const { cited, defined } = sourceIds('Body mentions S2 in passing and cites [S1].\n## Sources\n| S1 | x |\n| S2 | y |\n');
  assert.deepEqual([...defined].filter((id) => !cited.has(id)), ['S2']);
});

test('failure path: a missing record table is reported, not treated as empty', () => {
  assert.equal(signOffRows('**Status:** draft'), null);
});

test('failure path: broken links, uncited sources and gapped ids are all detected', () => {
  assert.deepEqual(relativeLinks('[a](../nope.md#x) [b](https://example.com) [c](#anchor)'), ['../nope.md']);
  const { cited, defined } = sourceIds('Body cites [S1][S3].\n## Sources\n| S1 | x |\n| S2 | y |\n');
  assert.deepEqual([...cited].filter((id) => !defined.has(id)), ['S3']);
  assert.deepEqual([...defined].filter((id) => !cited.has(id)), ['S2']);
  assert.equal(isConsecutive(tableIds('| I1 | a |\n| I3 | b |\n', 'I'), 'I'), false);
  assert.deepEqual(storyCriteria('no acceptance heading here'), []);
  assert.deepEqual(storyExceptions('nothing'), []);
});

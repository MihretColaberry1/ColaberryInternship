// Detection tests for the design review prototype, against seeded fixtures with known patterns.
// Run from the repository root: node --test tests/design-review.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import { runReview } from '../review/review-page.mjs';
import { readTags, stripComments } from '../review/jsx-tags.mjs';
import { commitChange, makeWorkspace } from './design-review-helpers.mjs';

const SEEDED = 'frontend/src/pages/Seeded.tsx';

// What Seeded.tsx plants, by rule and line. Changing the fixture means changing this list.
const EXPECTED_DETECTED = [
  ['R2', 5], ['R9', 12], ['R1', 13], ['R3', 16], ['R4', 22], ['R5', 24], ['R7', 28], ['R10', 31],
];
const EXPECTED_REVIEW = [['R9', 11], ['R5', 25], ['R6', 26], ['R8', 30]];

let ws;
before(() => { ws = makeWorkspace(); });
after(() => ws.cleanup());

const review = (page, commit = ws.commit, out = path.join(ws.dir, 'out')) =>
  runReview({ repo: ws.repo, commit, page, rules: ws.pack, out }).report;
const pairs = (r, status) => r.findings.filter((f) => f.status === status).map((f) => [f.rule_id, f.line]);

test('the seeded page reports exactly the planted patterns, split by status', () => {
  const r = review(SEEDED);
  assert.deepEqual(pairs(r, 'pattern_detected'), EXPECTED_DETECTED);
  assert.deepEqual(pairs(r, 'needs_human_review'), EXPECTED_REVIEW);
  assert.equal(r.summary.pattern_detected, 8);
  assert.equal(r.summary.needs_human_review, 4);
  assert.equal(r.outcome.code, 'findings_for_review');
});

test('removing one planted pattern reports exactly one fewer', () => {
  const fewer = commitChange(ws.repo, SEEDED, (s) => s.replace(/ {6}<img src="a\.png" \/>\r?\n/, ''));
  const r = review(SEEDED, fewer);
  assert.equal(r.summary.pattern_detected, 7);
  assert.ok(!r.findings.some((f) => f.rule_id === 'R4'));
});

test('a comment, an anchor href and JSX text that look like hex are not reported', () => {
  const lines = review(SEEDED, ws.commit).findings.map((f) => f.line);
  for (const line of [6, 14, 15]) assert.ok(!lines.includes(line), `line ${line} should have no finding`);
});

test('a token suggestion names a token only on an exact value match', () => {
  const r = review(SEEDED, ws.commit);
  const r1 = r.findings.find((f) => f.rule_id === 'R1');
  const r2 = r.findings.find((f) => f.rule_id === 'R2');
  assert.match(r1.suggestion, /var\(--color-text\)/);
  assert.match(r2.suggestion, /No token in the token file has exactly this value/);
  assert.match(r2.suggestion, /decision for Aleem/);
});

test('every finding carries file, line, code, source rule, rationale, suggestion and no severity', () => {
  for (const f of review(SEEDED, ws.commit).findings) {
    assert.equal(f.file, SEEDED);
    assert.ok(Number.isInteger(f.line) && f.line > 0);
    assert.ok(f.snippet.length > 0 && f.rationale && f.suggestion);
    assert.ok(f.sources.length > 0 && f.sources.every((s) => s.path && s.line));
    assert.equal(f.severity, null);
    assert.equal(f.rule_status, 'draft_unapproved');
  }
});

test('a clean page reports no patterns, says it is not a pass, and still lists what was not checked', () => {
  const r = review('frontend/src/pages/Clean.tsx');
  assert.equal(r.findings.length, 0);
  assert.equal(r.outcome.code, 'no_patterns_detected');
  assert.match(r.outcome.text, /not a pass/);
  const titles = r.could_not_check.map((c) => c.title);
  assert.ok(titles.includes('Colour contrast'));
  assert.ok(titles.includes('Touch-target size'));
});

test('a page with no markup is never reported as clean', () => {
  const r = review('frontend/src/pages/Empty.tsx');
  assert.equal(r.outcome.code, 'nothing_to_review');
  assert.match(r.outcome.text, /not a clean result/);
});

test('relative imports are listed as not reviewed', () => {
  const titles = review(SEEDED, ws.commit).could_not_check.map((c) => c.title);
  assert.ok(titles.includes('Imported module not reviewed: ./Child'));
});

test('comment stripping keeps offsets, and attribute values may contain arrows and braces', () => {
  const src = 'a // x #fff\n<div onClick={() => { go(">"); }} className="b">';
  assert.equal(stripComments(src).length, src.length);
  const { tags } = readTags(stripComments(src));
  assert.equal(tags[0].name, 'div');
  assert.equal(tags[0].line, 2);
  assert.equal(tags[0].attrs.className.raw, 'b');
});

test('a finding on a tag that spans lines shows the whole tag as its code', () => {
  const multi = commitChange(ws.repo, 'frontend/src/pages/Clean.tsx',
    (s) => s.replace('<input id="q" type="text" />', '<input id="q" type="text" />\n      <input\n        type="text"\n        placeholder="Two"\n      />'));
  const f = review('frontend/src/pages/Clean.tsx', multi).findings.find((x) => x.rule_id === 'R3');
  assert.equal(f.snippet, '<input type="text" placeholder="Two" />');
});

test('a closing tag straight after text is read, and a generic is not taken for a tag', () => {
  const { tags } = readTags('const [v] = useState<string>("");\n<td>row</td>');
  assert.deepEqual(tags.map((t) => `${t.kind}:${t.name}`), ['open:td', 'close:td']);
});

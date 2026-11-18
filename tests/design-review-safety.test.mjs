// Safety, reproducibility and honest-reporting tests for the design review prototype.
// Run from the repository root: node --test tests/design-review-safety.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { makeWorkspace, runCli, treeHash, writePack } from './design-review-helpers.mjs';

const SEEDED = 'frontend/src/pages/Seeded.tsx';

let ws;
before(() => { ws = makeWorkspace(); });
after(() => ws.cleanup());

const args = (over = {}) => {
  const a = { repo: ws.repo, commit: ws.commit, page: SEEDED, rules: ws.pack, out: path.join(ws.dir, 'out'), ...over };
  return Object.entries(a).flatMap(([k, v]) => [`--${k}`, v]);
};
const refusedWith = (over, errorClass) => {
  const r = runCli(args(over));
  assert.equal(r.code, 1, JSON.stringify(r));
  assert.equal(r.err.error_class, errorClass, r.err.message);
};

test('paths that escape or leave the repository are refused', () => {
  refusedWith({ page: '../outside.tsx' }, 'PathRefused');
  refusedWith({ page: 'frontend/../../outside.tsx' }, 'PathRefused');
  refusedWith({ page: '/etc/page.tsx' }, 'PathRefused');
  refusedWith({ page: 'C:\\Windows\\page.tsx' }, 'PathRefused');
  refusedWith({ page: 'frontend/src/styles/tokens.css' }, 'PathRefused');
});

test('a page that does not exist is reported as not found, with the path', () => {
  const r = runCli(args({ page: 'frontend/src/pages/Missing.tsx' }));
  assert.equal(r.err.error_class, 'PageNotFound');
  assert.match(r.err.message, /Missing\.tsx was not found/);
});

test('a branch name is refused: the review must name an exact commit', () => {
  refusedWith({ commit: 'main' }, 'ValidationError');
  refusedWith({ commit: 'deadbeefdeadbeef' }, 'CommitNotFound');
});

test('an output folder inside the reviewed repository is refused', () => {
  refusedWith({ out: ws.repo }, 'OutputRefused');
  refusedWith({ out: path.join(ws.repo, 'frontend', 'reports') }, 'OutputRefused');
});

test('rules packs without a real citation, or with an invented quote, are refused', () => {
  const pack = (name, edit) => writePack(ws.dir, name, edit, ws.commit);
  refusedWith({ rules: pack('no-source.json', (p) => { p.rules[0].sources = []; return p; }) }, 'RulesPackInvalid');
  refusedWith({ rules: pack('invented.json', (p) => { p.rules[0].sources[0].quote = 'always use purple'; return p; }) }, 'CitationMismatch');
  refusedWith({ rules: pack('bad-line.json', (p) => { p.rules[0].sources[0].line = 999; return p; }) }, 'CitationMismatch');
  refusedWith({ rules: pack('unknown-check.json', (p) => { p.rules[0].check = 'make_it_pretty'; return p; }) }, 'RulesPackInvalid');
});

test('a pack cannot claim approval without a named human, or by a machine', () => {
  const pack = (name, approvedBy) => writePack(ws.dir, name, (p) => ({ ...p, approval: { state: 'approved', approved_by: approvedBy } }), ws.commit);
  refusedWith({ rules: pack('approved-nobody.json', null) }, 'RulesPackInvalid');
  refusedWith({ rules: pack('approved-system.json', 'system:auto_approve_timeout') }, 'RulesPackInvalid');
});

test('a review changes nothing in the reviewed repository, .git included', () => {
  const before = treeHash(ws.repo);
  const r = runCli(args());
  assert.equal(r.code, 0, JSON.stringify(r));
  assert.equal(treeHash(ws.repo), before);
});

test('two runs on the same inputs give byte-identical reports', () => {
  const a = runCli(args({ out: path.join(ws.dir, 'run-a') }));
  const b = runCli(args({ out: path.join(ws.dir, 'run-b') }));
  assert.equal(a.code, 0); assert.equal(b.code, 0);
  assert.equal(readFileSync(a.out.json, 'utf8'), readFileSync(b.out.json, 'utf8'));
  assert.equal(readFileSync(a.out.markdown, 'utf8'), readFileSync(b.out.markdown, 'utf8'));
});

test('the report separates draft-rule patterns from official violations and claims no conformance', () => {
  const r = runCli(args({ out: path.join(ws.dir, 'wording') }));
  const md = readFileSync(r.out.markdown, 'utf8');
  const json = JSON.parse(readFileSync(r.out.json, 'utf8'));
  assert.match(md, /## Patterns detected by a draft rule/);
  assert.match(md, /## Needs human review/);
  assert.match(md, /## Could not check/);
  assert.match(md, /unapproved draft/);
  assert.match(md, /pending confirmation/);
  const withoutDisclaimer = md
    .replace('It is not an official accessibility or design-system violation.', '')
    .replace('makes no claim that the page meets or fails WCAG 2.1 AA or WCAG 2.2 AA', '');
  assert.match(md, /makes no claim that the page meets or fails WCAG 2\.1 AA or WCAG 2\.2 AA/);
  assert.doesNotMatch(withoutDisclaimer, /violat/i);
  assert.doesNotMatch(withoutDisclaimer, /\b(is|are) conformant\b|\bpasses WCAG\b|\bfails WCAG\b|\bWCAG (2\.1|2\.2) AA (pass|fail)/i);
  assert.equal(json.rules_pack.approval.state, 'unapproved');
  assert.equal(json.rules_pack.standard.state, 'pending_confirmation');
  assert.equal(json.summary.severity, 'not assigned: left for the reviewer');
});

test('usage errors exit 2 without running', () => {
  const r = runCli(['--page']);
  assert.equal(r.code, 2);
});

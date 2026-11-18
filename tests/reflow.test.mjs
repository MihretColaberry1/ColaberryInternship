// Regression test for WCAG 1.4.10 (reflow) on the capture guide. On 2026-11-09 #/guide/capture scrolled
// 76 px sideways at 320 CSS px: a step names the snapshot file path, which has no break point. The fix
// lets guide steps wrap such strings. This checks the fix without a browser; the measured check on
// every page at 320 px is tests/evidence/check-review-corrections.mjs ("reflow_320").
// Run from the repository root: node --test tests/reflow.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll, hasClass } from './fake-dom.mjs';
import { guidePage } from '../command-center/details.js';
import { SNAPSHOT_FILE } from '../command-center/agent-domain-data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function rendered(key) {
  const remove = installFakeDom();
  try { return guidePage(key); } finally { remove(); }
}

test('the capture guide still names the snapshot path, inside a guide step', () => {
  const steps = findAll(rendered('capture'), hasClass('guide-steps'));
  assert.equal(steps.length, 1);
  assert.match(steps[0].textContent, new RegExp(SNAPSHOT_FILE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  // The path really is one unbreakable run: no space, so plain text cannot wrap it.
  assert.doesNotMatch(SNAPSHOT_FILE, /\s/);
  assert.ok(SNAPSHOT_FILE.length > 40, 'long enough to overflow a 320 px column');
});

test('guide steps wrap an unbreakable string instead of widening the page', async () => {
  const css = (await readFile(path.join(ROOT, 'command-center/styles.css'), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = css.match(/\.guide-steps li \{([^}]*)\}/);
  assert.ok(rule, 'no .guide-steps li rule');
  assert.match(rule[1], /overflow-wrap:\s*(anywhere|break-word)/);
  assert.doesNotMatch(rule[1], /white-space:\s*(nowrap|pre)\b/);
});

test('every guide renders its steps in the wrapping list', () => {
  for (const key of ['capture', 'requests', 'refresh']) {
    assert.equal(findAll(rendered(key), hasClass('guide-steps')).length, 1, key);
  }
});

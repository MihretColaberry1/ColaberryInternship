// Parity tests for the ported effectiveAuthority() and the ladder, plus the source file's provenance.
// The authority cases repeat backend/src/services/agentDomain/__tests__/autonomyLadder.test.ts at
// platform commit 9d9aa3c3, so this copy is held to the platform's own definition.
// Run from the repository root: node --test tests/agent-domain-authority.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  AUTONOMY_LEVELS, AUTONOMY_MEANINGS, AUTONOMY_STAGES, autonomyIndex, effectiveAuthority, isAutonomyStage,
} from '../command-center/authority.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const base = (over = {}) => ({
  capability_id: 'marketing.example',
  approved_autonomy: 'autonomy:R2',
  max_permitted_autonomy: 'autonomy:R7',
  granted_tools: ['read_records'],
  environment: 'sandbox',
  human_decision: false,
  ...over,
});

// ---- Ladder ----

test('the ladder is ten namespaced rungs in order, with the owner wording from the STORY-000 brief', () => {
  assert.equal(AUTONOMY_LEVELS.length, 10);
  assert.deepEqual(AUTONOMY_STAGES, AUTONOMY_LEVELS.map((l) => `autonomy:${l}`));
  assert.equal(AUTONOMY_MEANINGS.R0, 'Define the workflow, requirements, risks and human decisions.');
  assert.equal(AUTONOMY_MEANINGS.R8, 'Coordinate necessary, authorized handoffs with other agents.');
  assert.equal(AUTONOMY_MEANINGS.R9, 'Demonstrate reliable operation, monitoring, recovery and ownership.');
  assert.equal(autonomyIndex('autonomy:R9'), 9);
});

test('a bare R3 is not a stage: it means a risk tier elsewhere in the platform', () => {
  assert.equal(isAutonomyStage('R3'), false);
  assert.equal(isAutonomyStage('autonomy:R3'), true);
});

// ---- effectiveAuthority, platform cases ----

test('no tool grants caps at R2, whatever was approved', () => {
  const r = effectiveAuthority(base({ approved_autonomy: 'autonomy:R7', granted_tools: [] }));
  assert.equal(r.effective_autonomy, 'autonomy:R2');
  assert.ok(r.reasons.includes('no_tool_grants'));
});

test('a max_permitted ceiling lowers but never raises', () => {
  assert.equal(effectiveAuthority(base({ approved_autonomy: 'autonomy:R7', max_permitted_autonomy: 'autonomy:R3' })).effective_autonomy, 'autonomy:R3');
  assert.equal(effectiveAuthority(base({ approved_autonomy: 'autonomy:R1', max_permitted_autonomy: 'autonomy:R9' })).effective_autonomy, 'autonomy:R1');
});

test('a human-required decision is capped below automation at every level', () => {
  const r = effectiveAuthority(base({ approved_autonomy: 'autonomy:R9', granted_tools: ['a'], human_decision: true }));
  assert.ok(autonomyIndex(r.effective_autonomy) <= autonomyIndex('autonomy:R5'));
  assert.ok(r.reasons.includes('human_decision_required_at_every_level'));
  assert.ok(r.reasons.includes('capped_below_automation_because_human_decision'));
});

test('production at R6 or above flags the separate pilot approval', () => {
  const r = effectiveAuthority(base({ approved_autonomy: 'autonomy:R6', granted_tools: ['a'], environment: 'production' }));
  assert.ok(r.reasons.includes('production_requires_separate_pilot_approval'));
});

test('an unapproved capability has no effective authority, never a default', () => {
  for (const approved of [null, undefined, 'R3', { not_applicable: true, reason: 'n/a' }]) {
    const r = effectiveAuthority(base({ approved_autonomy: approved }));
    assert.equal(r.effective_autonomy, null);
    assert.deepEqual(r.reasons, ['no_approved_autonomy']);
  }
});

test('positive control: a fully approved sandbox capability does reach its level', () => {
  assert.equal(effectiveAuthority(base({ approved_autonomy: 'autonomy:R4', granted_tools: ['a'] })).effective_autonomy, 'autonomy:R4');
});

// ---- Source file provenance ----

test('the copied source file is byte-for-byte the platform blob recorded in SOURCES.json', async () => {
  const sources = JSON.parse(await readFile(path.join(ROOT, 'command-center/sources/SOURCES.json'), 'utf8'));
  for (const rec of sources.files) {
    assert.match(rec.platform_commit, /^[0-9a-f]{40}$/, `${rec.file} records a full platform commit`);
    // git may check the file out with CRLF on Windows; the platform blob is LF.
    const text = (await readFile(path.join(ROOT, rec.file), 'utf8')).replace(/\r\n/g, '\n');
    const bytes = Buffer.from(text, 'utf8');
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    assert.equal(blob, rec.git_blob, `${rec.file} no longer matches ${rec.platform_path}@${rec.platform_commit}`);
  }
});

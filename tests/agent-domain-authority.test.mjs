// The ladder (ten rungs in the owner's words) and the pinned source file's provenance.
// The page holds no copy of effectiveAuthority(): authority is the platform's own record, read from
// .colaberry/agent-domain.json (tests/agent-domain-tool-rule.test.mjs). The parity tests of the old copy
// were removed with it on 2026-11-14 (the platform owner's decision: do not recalculate).
// Run from the repository root: node --test tests/agent-domain-authority.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import * as authority from '../command-center/authority.js';
import { CAPABILITY_FILE } from '../command-center/agent-domain-data.js';

const { AUTONOMY_LEVELS, AUTONOMY_MEANINGS, AUTONOMY_STAGES, autonomyIndex, isAutonomyStage } = authority;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

test('the ladder module carries no authority calculation', () => {
  assert.equal('effectiveAuthority' in authority, false);
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

test('the pinned file holds the 67 per-rung behaviours across 25 capabilities that the platform owner confirmed', async () => {
  const matrix = JSON.parse(await readFile(path.join(ROOT, CAPABILITY_FILE), 'utf8'));
  assert.equal(matrix.capabilities.length, 25);
  assert.equal(matrix.capabilities.reduce((n, c) => n + (Array.isArray(c.release_behaviour) ? c.release_behaviour.length : 0), 0), 67);
});

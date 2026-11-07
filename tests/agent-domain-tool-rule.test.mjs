// Criterion 4, as Mohammed Abdul Aleem decided it on 2026-11-03 (Option 1) and as the platform reworded
// it on 2026-11-02: each capability's current rung (what effectiveAuthority() returns), whether a human
// approved it, and what holds it back are shown separately, in the same words on the console and the
// detail page; the no_tool_grants rule is named with the number it constrains, in words when zero; and
// the R2 cap appears only as a labelled hypothetical. Nothing is invented to make the rule fire.
// Run from the repository root: node --test tests/agent-domain-tool-rule.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll, hasClass } from './fake-dom.mjs';
import { CAPABILITY_FILE } from '../command-center/agent-domain-data.js';
import { AUTHORITY_WORDS, TOOL_RULE } from '../command-center/agent-domain-facts.js';
import { authorityView, capabilityRows, toolRuleStatus } from '../command-center/agent-domain-model.js';
import { toolRuleBlock } from '../command-center/panel-ladder.js';
import { renderRoute } from '../command-center/console.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const matrix = async () => JSON.parse(await readFile(path.join(ROOT, CAPABILITY_FILE), 'utf8'));
const notCaptured = { state: 'not_captured' };
const domainOf = async () => ({ status: 'loaded', source: { status: 'ok', matrix: await matrix(), record: { platform_commit: 'x'.repeat(40), git_blob: 'y'.repeat(40), platform_path: 'p' } },
  snapshot: { status: 'not_captured', endpoints: { mine: notCaptured, domain: notCaptured, coverage: notCaptured, requests: notCaptured } } });

const allText = (out) => [out].flat(Infinity).map((n) => (n == null ? '' : n.textContent ?? String(n))).join('');
function render(build) {
  const remove = installFakeDom();
  try { return build(); } finally { remove(); }
}

test("Aleem's exact wording is what the page uses", () => {
  assert.equal(AUTHORITY_WORDS.not_approved, 'Starting rung — no human approval yet');
  assert.equal(AUTHORITY_WORDS.cap_idle, 'Tool-grant cap in force; constrains nothing today');
});

test('today, on the real file: autonomy:R0, no human approval, and the cap constrains nothing, for all 25', async () => {
  const rows = capabilityRows(await matrix());
  assert.equal(rows.length, 25);
  for (const r of rows) {
    const a = authorityView(r);
    assert.equal(a.current, 'autonomy:R0', r.id);
    assert.equal(a.approval, AUTHORITY_WORDS.not_approved, r.id);
    assert.equal(a.constraint, AUTHORITY_WORDS.cap_idle, r.id);
    assert.ok(!r.authority.reasons.includes('no_tool_grants'), `${r.id}: live data must not trigger the rule`);
  }
  assert.deepEqual(toolRuleStatus(rows), {
    total: 25, held: 0, approved: 0, approved_above_r2: 0, starting_above_r2: 0, starting_r0: 25, with_tools: 0,
    grants_known: false,
  });
  // Grants are not captured today: the rows say so (null), rather than claiming none.
  assert.ok(rows.every((r) => r.granted_tools === null));
});

test('R0 holds whatever the grants are: not captured, none, or some (nothing is approved)', async () => {
  const m = await matrix();
  for (const grantedTools of [null, [], ['repo_read']]) {
    for (const r of capabilityRows(m, { grantedTools })) {
      assert.equal(authorityView(r).current, 'autonomy:R0', `${r.id} with ${JSON.stringify(grantedTools)}`);
      assert.equal(authorityView(r).constraint, AUTHORITY_WORDS.cap_idle);
    }
  }
  const known = toolRuleStatus(capabilityRows(m, { grantedTools: [] }));
  assert.equal(known.grants_known, true);
  assert.equal(known.with_tools, 0);
});

test('approved above R2 with no tool grants: effectiveAuthority() returns R2 with no_tool_grants, and the page says it binds', async () => {
  const m = await matrix();
  const id = m.capabilities.find((c) => c.max_permitted_autonomy === 'autonomy:R5').capability_id;
  const rows = capabilityRows(m, { approvals: { [id]: 'autonomy:R4' }, grantedTools: [] });
  const r = rows.find((x) => x.id === id);
  assert.equal(r.authority.effective_autonomy, 'autonomy:R2');
  assert.ok(r.authority.reasons.includes('no_tool_grants'));
  const a = authorityView(r);
  assert.equal(a.approval, 'Approved by a named human at autonomy:R4');
  assert.equal(a.constraint, AUTHORITY_WORDS.cap_holding);
  const s = toolRuleStatus(rows);
  assert.equal(s.held, 1);
  const text = render(() => toolRuleBlock(s).textContent);
  assert.match(text, /holding 1 of 25 capabilities at autonomy:R2/);
  assert.doesNotMatch(text, /constrains nothing/);
  // With grants not captured, the rule is read as if none were granted: it can only lower authority.
  const unknown = capabilityRows(m, { approvals: { [id]: 'autonomy:R4' } }).find((x) => x.id === id);
  assert.equal(unknown.authority.effective_autonomy, 'autonomy:R2');
});

test('control: the same approval with a tool granted is not capped', async () => {
  const m = await matrix();
  const id = m.capabilities.find((c) => c.max_permitted_autonomy === 'autonomy:R5').capability_id;
  const r = capabilityRows(m, { approvals: { [id]: 'autonomy:R4' }, grantedTools: ['repo_read'] }).find((x) => x.id === id);
  assert.ok(!r.authority.reasons.includes('no_tool_grants'));
  assert.notEqual(r.authority.effective_autonomy, 'autonomy:R2');
});

test('the rule block names the rule and says, in words, that it constrains nothing today', async () => {
  const status = toolRuleStatus(capabilityRows(await matrix()));
  const text = render(() => toolRuleBlock(status).textContent);
  assert.match(text, /no_tool_grants/);
  assert.ok(text.includes(TOOL_RULE.rule));
  assert.ok(text.includes(`${AUTHORITY_WORDS.cap_idle}: it holds 0 of 25 capabilities.`));
  assert.match(text, /0 of 25 have a level above autonomy:R2 approved by a human/);
  // Grants not captured: said in words, never counted as "0 of 25 have a tool granted".
  assert.match(text, /Tool grants were not captured\. That does not change the verdict/);
  assert.doesNotMatch(text, /have a tool granted/);
  const known = toolRuleStatus(capabilityRows(await matrix(), { grantedTools: [] }));
  const knownText = render(() => toolRuleBlock(known).textContent);
  assert.match(knownText, /0 of 25 have a tool granted/);
});

test('console ladder panel: Aleem\'s wording, never "None" as authority, and no hypothetical', async () => {
  const domain = await domainOf();
  const out = render(() => renderRoute([], domain, null));
  const ladder = render(() => findAll(out, hasClass('panel')).find((p) => p.getAttribute('data-panel') === 'ladder'));
  const text = ladder.textContent;
  assert.ok(text.includes(`autonomy:R0 for all 25: ${AUTHORITY_WORDS.not_approved}.`));
  assert.ok(text.includes(AUTHORITY_WORDS.cap_idle));
  assert.doesNotMatch(text, /Effective authority\s*None|\bNone \(no approved autonomy\)/);
  assert.doesNotMatch(allText(out), /[Hh]ypothetical/);
});

test('detail page: the same wording as the console, plus the labelled R2-cap hypothetical', async () => {
  const domain = await domainOf();
  const m = domain.source.matrix;
  const high = m.capabilities.find((c) => c.max_permitted_autonomy === 'autonomy:R5');
  const low = m.capabilities.find((c) => c.max_permitted_autonomy === 'autonomy:R2');
  const textHigh = render(() => allText(renderRoute(['capability', high.capability_id], domain, null)));
  assert.ok(textHigh.includes(`Current rung (effectiveAuthority())autonomy:R0`));
  assert.ok(textHigh.includes(`Human approval${AUTHORITY_WORDS.not_approved}`));
  assert.ok(textHigh.includes(`What holds it back${AUTHORITY_WORDS.cap_idle}`));
  assert.match(textHigh, /Hypothetical: not an approval, not data/);
  assert.match(textHigh, /If a human approved this capability up to its autonomy:R5 ceiling and no tool were granted, the no-tool-grants rule would hold it at autonomy:R2\. Whether any tool is granted today was not captured\./);
  assert.doesNotMatch(textHigh, /because no tools are granted/);
  assert.match(textHigh, /Tools it will need \(grants not captured\)/);
  // The research file's stale blocker is shown verbatim, with the label beside it.
  assert.match(textHigh, /no_ai_employee_provisioned[^]*May be out of date[^]*seed value[^]*not evidence either way/);
  const textLow = render(() => allText(renderRoute(['capability', low.capability_id], domain, null)));
  assert.match(textLow, /Its ceiling is autonomy:R2, so the no-tool-grants rule would not change it/);
});

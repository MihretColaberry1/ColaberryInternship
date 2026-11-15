// Criterion 4, from the platform's own record (step 2, 2026-11-14). Each capability's current rung,
// reasons and ceiling are what the platform wrote in `authority[]`; the no_tool_grants rule, its wording
// and its verdict are the platform's `authority_rule`. The page never recalculates them, never treats
// approved_autonomy as approval, and shows human confirmation as not available until the platform
// exposes AgentDomainCapabilityConfirmation. The same words appear on the console and the detail page.
// Every case below is platform-shaped data; nothing is invented to make the rule fire on the real page.
// Run from the repository root: node --test tests/agent-domain-tool-rule.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll, hasClass } from './fake-dom.mjs';
import { CAPABILITY_FILE, PLATFORM_SYNC_FILE, readAuthority } from '../command-center/agent-domain-data.js';
import { AUTHORITY_WORDS, BEHAVIOUR_EXPOSURE } from '../command-center/agent-domain-facts.js';
import { authorityView, capabilityRows, toolRuleStatus } from '../command-center/agent-domain-model.js';
import { renderRoute } from '../command-center/console.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (f) => JSON.parse(await readFile(path.join(ROOT, f), 'utf8'));
const notCaptured = { state: 'not_captured' };

/** A loaded domain whose platform sync carries `authority` (a readAuthority() result). */
async function domainOf(authority) {
  return {
    status: 'loaded',
    source: { status: 'ok', matrix: await readJson(CAPABILITY_FILE), record: { platform_commit: 'x'.repeat(40), git_blob: 'y'.repeat(40), platform_path: 'p' } },
    snapshot: { status: 'not_captured', endpoints: { mine: notCaptured, domain: notCaptured, coverage: notCaptured, requests: notCaptured },
      sync: { status: 'synced', last_changed: null, verdict_reasons: {}, authority } },
  };
}

/** The real synced file, optionally changed: `rows` maps each authority row, `rule` overrides authority_rule. */
async function platform({ rows = (r) => r, rule = {} } = {}) {
  const json = await readJson(PLATFORM_SYNC_FILE);
  return readAuthority({ ...json, authority: json.authority.map(rows).filter(Boolean), authority_rule: { ...json.authority_rule, ...rule } });
}

const allText = (out) => [out].flat(Infinity).map((n) => (n == null ? '' : n.textContent ?? String(n))).join('');
function render(build) {
  const remove = installFakeDom();
  try { return build(); } finally { remove(); }
}
const ladderOf = (domain) => render(() => findAll(renderRoute([], domain, null), hasClass('panel')).find((p) => p.getAttribute('data-panel') === 'ladder'));
const capabilityPage = (domain, id) => render(() => allText(renderRoute(['capability', id], domain, null)));

test("the wording: Aleem's phrases, and human confirmation as not available", () => {
  assert.equal(AUTHORITY_WORDS.starting, 'Starting rung');
  assert.equal(AUTHORITY_WORDS.cap_idle, 'Tool-grant cap in force; constrains nothing today');
  assert.equal(AUTHORITY_WORDS.cap_holding, 'Tool-grant cap in force; holding this capability at autonomy:R2');
  assert.match(AUTHORITY_WORDS.confirmation_unavailable, /^Not available: the platform does not expose human confirmation records \(AgentDomainCapabilityConfirmation\) yet$/);
});

test('today, on the real file: the platform records autonomy:R0 for all 25, and its rule constrains nothing', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const domain = await domainOf(await platform());
  const ladder = ladderOf(domain);
  const text = ladder.textContent;
  assert.equal(ladder.getAttribute('data-state'), 'ready');
  assert.ok(text.includes(`autonomy:R0 for all 25: ${AUTHORITY_WORDS.starting} — ${AUTHORITY_WORDS.confirmation_short}.`));
  assert.ok(text.includes(json.authority_rule.rule), 'the rule in the platform\'s own words');
  assert.ok(text.includes(json.authority_rule.note), 'the platform\'s own note');
  assert.ok(text.includes(`${AUTHORITY_WORDS.cap_idle}: it holds 0 of 25 capabilities.`));
  assert.match(text, /The platform records 0 capabilities with a level above autonomy:R2 \(authority_rule\.approved_above_r2\)\./);
  assert.match(text, /0 of 25 capabilities carry the reason no_tool_grants/);
  assert.match(text, /Capabilities it holds at autonomy:R20Human confirmationNot available from the platform yet/);
  assert.doesNotMatch(text, /Effective authority\s*None|[Hh]ypothetical|no human approval yet/);
  // Every value is tagged as the platform's synced record of the per-domain endpoint.
  assert.ok(findAll(ladder, hasClass('src-platform_sync')).some((t) => t.textContent.includes(PLATFORM_SYNC_FILE)));
});

test("the rule binds: two capabilities the platform holds at R2 with no_tool_grants (Aleem's case)", async () => {
  // Platform-shaped: approved above R2 with no tool grants, which the platform records as R2 + no_tool_grants.
  let n = 0;
  const authority = await platform({
    rows: (r) => (r.max_permitted_autonomy !== 'autonomy:R2' && n++ < 2 ? { ...r, effective_autonomy: 'autonomy:R2', reasons: ['no_tool_grants'] } : r),
    rule: { approved_above_r2: 2, binds_nothing: false },
  });
  const domain = await domainOf(authority);
  const text = ladderOf(domain).textContent;
  assert.match(text, /Tool-grant cap in force; holding 2 of 25 capabilities at autonomy:R2\./);
  assert.match(text, /Capabilities it holds at autonomy:R22/);
  assert.match(text, /Current rungs differ by capability/);
  const held = Object.entries(authority.byId).find(([, r]) => r.reasons.includes('no_tool_grants'))[0];
  const page = capabilityPage(domain, held);
  assert.ok(page.includes('Current rung (platform)autonomy:R2'), 'the rung the platform recorded, not the ceiling');
  assert.ok(page.includes(`What holds it back${AUTHORITY_WORDS.cap_holding}`));
  assert.match(page, /no_tool_grants No tools are granted, so it is held at autonomy:R2\./);
  assert.ok(page.includes(`Starting rung?${AUTHORITY_WORDS.not_starting} (started at autonomy:R0)`));
});

test('the platform data disagrees with itself: both are shown, and the page does not choose', async () => {
  const authority = await platform({ rows: (r, i) => (i === 0 ? { ...r, reasons: ['no_tool_grants'] } : r) });
  assert.equal(authority.rule.binds_nothing, true);
  const status = toolRuleStatus(capabilityRows(await readJson(CAPABILITY_FILE), { authority }), authority);
  assert.equal(status.consistent, false);
  const text = ladderOf(await domainOf(authority)).textContent;
  assert.match(text, /The platform's data disagrees with itself: authority_rule\.binds_nothing is true, but 1 of 25 capabilities carry the reason no_tool_grants\./);
});

test('approved_autonomy is never shown as approval, whatever it says', async () => {
  const authority = await platform({ rows: (r) => ({ ...r, approved_autonomy: 'autonomy:R5' }) });
  const domain = await domainOf(authority);
  const id = Object.keys(authority.byId)[0];
  for (const text of [ladderOf(domain).textContent, capabilityPage(domain, id)]) {
    assert.doesNotMatch(text, /[Aa]pproved by|approved at autonomy|Human approvalautonomy/);
    assert.doesNotMatch(text, /autonomy:R5 for all/);
    assert.match(text, /Not available/);
  }
});

test('no authority section: Panel 3 says "Not available" and calculates nothing in its place', async () => {
  for (const authority of [{ status: 'not_synced', error: null, byId: {}, rule: null, size: 0 }, readAuthority({})]) {
    const domain = await domainOf(authority);
    const ladder = ladderOf(domain);
    assert.equal(ladder.getAttribute('data-state'), 'not_available');
    assert.match(ladder.textContent, /MissingThe platform's authority record \(authority\[\] and authority_rule\)/);
    assert.match(ladder.textContent, /Nothing is calculated in its place\./);
    assert.doesNotMatch(ladder.textContent, /autonomy:R0 for all/);
    const id = domain.source.matrix.capabilities[0].capability_id;
    const page = capabilityPage(domain, id);
    assert.match(page, /Current rungNot in the platform snapshot/);
    assert.match(page, /The platform's authority record is not in this repository/);
  }
});

test('a malformed authority section is an error with the reason, never a partial picture', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const authority = readAuthority({ ...json, authority: [{ ...json.authority[0], effective_autonomy: 'R0' }] });
  const ladder = ladderOf(await domainOf(authority));
  assert.equal(ladder.getAttribute('data-state'), 'error');
  assert.match(ladder.textContent, /The platform's authority record could not be used\..*authority\[0\] is not a well-formed authority row/);
});

test('a capability the platform has no row for is said so, and counted, never defaulted', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const gone = json.authority[0].capability_id;
  const authority = await platform({ rows: (r) => (r.capability_id === gone ? null : r) });
  const domain = await domainOf(authority);
  const view = authorityView(capabilityRows(domain.source.matrix, { authority }).find((r) => r.id === gone));
  assert.equal(view.recorded, false);
  assert.equal(view.current, null);
  const text = ladderOf(domain).textContent;
  assert.match(text, /1 of 25 capabilities have no row in the platform's authority record\./);
  assert.match(capabilityPage(domain, gone), new RegExp(`The platform's authority record has no row for ${gone.replace(/\./g, '\\.')}\\.`));
});

test('detail page: the console\'s words, the platform\'s rule in place of the old hypothetical, and honest sources', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const domain = await domainOf(await platform());
  const high = domain.source.matrix.capabilities.find((c) => c.max_permitted_autonomy === 'autonomy:R5');
  const page = capabilityPage(domain, high.capability_id);
  assert.ok(page.includes('Current rung (platform)autonomy:R0'));
  assert.ok(page.includes(`Starting rung?${AUTHORITY_WORDS.starting}`));
  assert.ok(page.includes(`Human confirmation${AUTHORITY_WORDS.confirmation_unavailable}`));
  assert.ok(page.includes(`What holds it back${AUTHORITY_WORDS.cap_idle}`));
  assert.ok(page.includes('Ceiling (platform)autonomy:R5'));
  assert.ok(page.includes(json.authority_rule.rule));
  assert.ok(page.includes(`${AUTHORITY_WORDS.cap_idle}: it holds 0 of 25 capabilities.`), 'the verdict covers the whole domain');
  assert.doesNotMatch(page, /[Hh]ypothetical|would hold it at|would return/);
  assert.ok(page.includes(BEHAVIOUR_EXPOSURE.statement));
  assert.match(page, /Tools it will need \(grants not captured\)/);
  // The Authority section is tagged once, at the start of its read line, not on the heading as well.
  assert.match(page, /AuthorityPlatform sync · \.colaberry\/agent-domain\.json · GET \/api\/admin\/agent-domains\/product_experience The platform's own authority record/);
  assert.doesNotMatch(page, /Authority Platform sync/);
  // The research file's stale blocker is shown verbatim, with the label beside it.
  assert.match(page, /no_ai_employee_provisioned[^]*May be out of date[^]*seed value[^]*not evidence either way/);
});

test('long platform field names sit in <code>, which wraps, so Panel 3 cannot scroll sideways at 320 px', async () => {
  // Found by the 320 px browser check on 2026-11-14: "(authority_rule.approved_above_r2)" as plain text
  // widened Panel 3 by 18 px. tests/reflow.test.mjs covers only the guides, so this guards Panel 3.
  const authority = await platform({ rows: (r, i) => (i === 0 ? { ...r, reasons: ['no_tool_grants'] } : r) });
  const ladder = ladderOf(await domainOf(authority));
  const codes = findAll(ladder, (el) => el.tagName === 'CODE').map((el) => el.textContent);
  for (const name of ['authority_rule.approved_above_r2', 'authority_rule.binds_nothing']) {
    assert.ok(codes.includes(name), `${name} is in a <code> element`);
  }
});

test('no console module calculates authority: no copy, import or call of effectiveAuthority()', async () => {
  const dir = path.join(ROOT, 'command-center');
  for (const f of (await readdir(dir)).filter((x) => x.endsWith('.js'))) {
    // Comments may name the platform's function; code may not define, import or call it.
    const code = (await readFile(path.join(dir, f), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(code, /effectiveAuthority/, `${f} defines, imports or calls effectiveAuthority`);
  }
});

// Turns the Agent domain inputs into what each panel shows. Pure functions: no DOM, no network.
// Every value keeps its source: 'source_file', 'endpoint' or 'platform_code'. Values from one
// source are never relabelled as another, and authority comes only from effectiveAuthority().
import { AUTONOMY_LEVELS, AUTONOMY_MEANINGS, AUTONOMY_STAGES, autonomyIndex, effectiveAuthority } from './authority.js';
import {
  AUTHORITY_WORDS, DOMAIN_KEY, MINE_AGENT_FIELDS, R8_UNREACHABLE, REGISTRY_ENTRY, SET_BY_NOT_RECORDED, UNAVAILABLE_FIELDS,
} from './agent-domain-facts.js';

/**
 * Whether an agent is linked to this domain, from the LIVE endpoint only. The registry's agent_id is a
 * stale seed value for this domain (REGISTRY_ENTRY.stale_note) and is never consulted here.
 *   linked       the endpoint returned a non-null agent_id for this domain
 *   not_linked   the endpoint returned this domain with agent_id null
 *   not_in_list  the captured list does not include this domain, so it says nothing either way
 *   unknown      no usable response (`reason` is the endpoint state: not_captured, loading, refused...)
 * Tool grants are recorded only when the endpoint returned them; otherwise they stay null (not captured).
 */
export function agentLink(endpoints) {
  const mine = endpoints?.mine ?? { state: 'not_captured' };
  const domain = endpoints?.domain;
  const row = mine.state === 'ok' ? (mine.body?.domains ?? []).find((d) => d.domain_key === DOMAIN_KEY) ?? null : null;
  const linked = (v) => v != null && v !== '';
  let state = 'unknown';
  let source = null;
  if (row && Object.hasOwn(row, 'agent_id')) {
    state = linked(row.agent_id) ? 'linked' : 'not_linked';
    source = 'mine';
  } else if (domain?.state === 'ok' && Object.hasOwn(domain.body ?? {}, 'agent_id')) {
    state = linked(domain.body.agent_id) ? 'linked' : 'not_linked';
    source = 'domain';
  } else if (mine.state === 'ok') {
    state = row ? 'unknown' : 'not_in_list';
  }
  const tools = state === 'linked' && Array.isArray(row?.agent_tools_granted) ? row.agent_tools_granted : null;
  const count = state === 'linked' && Number.isInteger(row?.agent_tools_granted_count) ? row.agent_tools_granted_count : null;
  return { state, source, reason: state === 'unknown' ? mine.state : null,
    tools_granted: tools, tools_granted_count: count ?? (tools ? tools.length : null) };
}

/**
 * The tool list effectiveAuthority() is given, from the link: [] when no agent is linked or the endpoint
 * records 0 grants, the recorded list when there is one, and null (not captured) otherwise.
 */
export function grantedToolsFor(link) {
  if (link.state === 'not_linked') return [];
  if (link.tools_granted) return link.tools_granted;
  if (link.tools_granted_count === 0) return [];
  return null;
}

/** "Tools granted" in words, for every panel that states it. Never "None" unless a source says so. */
export function toolGrantWords(link) {
  if (link.state === 'not_linked') return 'None: the endpoint links no agent to this domain';
  if (link.state === 'linked') {
    if (link.tools_granted_count === 0) return 'None: the endpoint records 0 tools granted';
    if (link.tools_granted_count != null) return `${link.tools_granted_count} granted, as the endpoint records`;
    return 'Not captured: the snapshot records only that an agent is linked';
  }
  if (link.state === 'not_in_list') return 'Unknown: this domain is not in your list on the platform';
  return 'Not captured yet';
}

/**
 * One row per capability, in the order the research file records them.
 *
 * Criterion 4 (Aleem's Option 1, 2026-11-03): three separate facts per capability.
 *   - `approved`: the level a named human approved. None is recorded anywhere today, so the real page
 *     passes no `approvals` and every row is null. Tests pass approvals to exercise the rule.
 *   - `authority`: what effectiveAuthority() returns for the level in force: the approved level, or,
 *     with no approval, the starting rung. That is how the platform's own snapshot computes it
 *     (agentDomainSnapshot.ts), so the page shows autonomy:R0, never "None".
 *   - `hypothetical`: what the same rule would return if a human approved up to the ceiling. Shown
 *     only on detail pages, always labelled; it is not data.
 *
 * `grantedTools` is null when the grants were not captured (the real page today: grantedToolsFor()).
 * The rule is then evaluated as if none were granted, the reading that can only lower authority, never
 * raise it. Today that changes nothing: no capability has an approved level, so all stay at R0.
 * `granted_tools` on the row keeps the null, so the page says "not captured" rather than "none".
 */
export function capabilityRows(matrix, { approvals = {}, grantedTools = null } = {}) {
  return (matrix?.capabilities ?? []).map((c) => {
    const ceiling = c.max_permitted_autonomy;
    const approved = approvals[c.capability_id] ?? null;
    const inputs = {
      capability_id: c.capability_id,
      max_permitted_autonomy: ceiling,
      granted_tools: grantedTools ?? [],
      environment: 'sandbox',
      human_decision: c.human_decision === true,
    };
    return {
      id: c.capability_id,
      name: c.name,
      classification: c.classification,
      implementation_state: c.implementation_state,
      validation: c.requirement_validation_state,
      starting: c.starting_autonomy,
      ceiling,
      ceiling_reason: c.max_autonomy_rationale ?? null,
      human_decision: c.human_decision === true,
      behaviours: Array.isArray(c.release_behaviour) ? c.release_behaviour : [],
      required_tools: Array.isArray(c.required_tools) ? c.required_tools : [],
      blocked_by: Array.isArray(c.blocked_by) ? c.blocked_by : [],
      approved,
      granted_tools: grantedTools,
      authority: effectiveAuthority({ ...inputs, approved_autonomy: approved ?? c.starting_autonomy }),
      hypothetical: effectiveAuthority({ ...inputs, approved_autonomy: ceiling }),
    };
  });
}

/**
 * Criterion 4's three facts for one row, as the words the page shows. The same function feeds the
 * console and the detail page, so the wording cannot drift between them.
 */
export function authorityView(row) {
  const holding = row.authority.reasons.includes('no_tool_grants');
  return {
    current: row.authority.effective_autonomy,
    approval: row.approved == null ? AUTHORITY_WORDS.not_approved : `${AUTHORITY_WORDS.approved} ${row.approved}`,
    approved: row.approved != null,
    constraint: holding ? AUTHORITY_WORDS.cap_holding : AUTHORITY_WORDS.cap_idle,
    holding,
    reasons: row.authority.reasons,
  };
}

/**
 * Criterion 4: whether the no_tool_grants rule constrains anything, counted from the rows rather
 * than asserted. `held` is what effectiveAuthority() actually returned with no_tool_grants.
 */
export function toolRuleStatus(rows) {
  const aboveR2 = (stage) => stage != null && autonomyIndex(stage) > autonomyIndex('autonomy:R2');
  return {
    total: rows.length,
    held: rows.filter((r) => r.authority.reasons.includes('no_tool_grants')).length,
    approved: rows.filter((r) => r.approved != null).length,
    approved_above_r2: rows.filter((r) => aboveR2(r.approved)).length,
    starting_above_r2: rows.filter((r) => aboveR2(r.starting)).length,
    starting_r0: rows.filter((r) => r.starting === 'autonomy:R0').length,
    with_tools: rows.filter((r) => Array.isArray(r.granted_tools) && r.granted_tools.length > 0).length,
    grants_known: rows.length > 0 && rows.every((r) => Array.isArray(r.granted_tools)),
  };
}

const COMPARED = [
  ['name', 'capability_name'],
  ['implementation_state', 'current_state'],
  ['validation', 'validation_state'],
  ['ceiling', 'target_autonomy'],
];

/** Compares each source-file row with the /coverage endpoint row, when one was captured. */
export function coverageCheck(rows, coverage) {
  if (coverage.state !== 'ok') return new Map(rows.map((r) => [r.id, { state: coverage.state }]));
  const byId = new Map((coverage.body.rows ?? []).map((r) => [r.capability_id, r]));
  return new Map(rows.map((r) => {
    const e = byId.get(r.id);
    if (!e) return [r.id, { state: 'missing' }];
    const diffs = COMPARED.filter(([mine, theirs]) => e[theirs] !== r[mine])
      .map(([mine, theirs]) => ({ field: theirs, source_file: r[mine], endpoint: e[theirs] }));
    return [r.id, { state: diffs.length ? 'differs' : 'match', diffs, effective_authority: e.effective_authority ?? null }];
  }));
}

/** Where one capability stands on one rung. */
export function ladderCell(row, stage) {
  const i = autonomyIndex(stage);
  const ceiling = autonomyIndex(row.ceiling);
  const start = autonomyIndex(row.starting);
  if (ceiling < 0) return 'no_ceiling';
  if (i > ceiling) return 'above_ceiling';
  if (stage === R8_UNREACHABLE.rung) return 'unreachable_by_fact';
  if (i === start && i === ceiling) return 'start_and_ceiling';
  if (i === start) return 'start';
  if (i === ceiling) return 'ceiling';
  return i < start ? 'below_start' : 'within';
}

/** One entry per rung: meaning, ceilings that stop there, and the behaviours written for it. */
export function rungSummary(rows) {
  return AUTONOMY_STAGES.map((stage, i) => ({
    stage,
    meaning: AUTONOMY_MEANINGS[AUTONOMY_LEVELS[i]],
    unreachable_by_fact: stage === R8_UNREACHABLE.rung,
    ceilings_here: rows.filter((r) => r.ceiling === stage),
    above_ceiling: rows.filter((r) => autonomyIndex(r.ceiling) < i).length,
    behaviours: rows.flatMap((r) => r.behaviours
      .filter((b) => b.autonomy === stage)
      .map((b) => ({ capability_id: r.id, capability_name: r.name, behaviour: b.behaviour, acceptance_criteria: b.acceptance_criteria }))),
  }));
}

/**
 * Panel 1, one entry per agent field, each with an explicit state:
 *   recorded     the endpoint returned this value (false and 0 are values)
 *   no_agent     the row has no agent linked, so the platform returns null for every agent field
 *   absent       the response has this domain's row but not this field (captured before AF3.9)
 *   not_in_list  the response does not include this domain
 *   not_read     no usable response; `reason` is the endpoint state (not_captured, loading, refused...)
 *   not_recorded the platform does not store this field at all
 */
function agentFields(mine, row) {
  const fields = MINE_AGENT_FIELDS.map(({ key, label }) => {
    if (mine.state !== 'ok') return { key, label, state: 'not_read', reason: mine.state };
    if (!row) return { key, label, state: 'not_in_list' };
    if (!Object.hasOwn(row, key)) return { key, label, state: 'absent' };
    if (row.agent_id == null) return { key, label, state: 'no_agent' };
    return { key, label, state: 'recorded', value: row[key] };
  });
  const said = mine.state === 'ok' && Array.isArray(mine.body.not_recorded)
    ? mine.body.not_recorded.find((g) => g?.field === SET_BY_NOT_RECORDED.field) : null;
  fields.push({ key: 'autonomy_level_set_by', label: 'Autonomy last set by', state: 'not_recorded',
    reason: said?.reason ?? SET_BY_NOT_RECORDED.reason, from_endpoint: Boolean(said?.reason) });
  return fields;
}

/**
 * Panel 1. Endpoint values only when captured. `link` (from the live endpoint) decides whether an agent
 * is linked; `registry_agent_id` is the registry's stale seed value, shown only with that label.
 */
export function employeeView(endpoints) {
  const mine = endpoints.mine;
  const domain = endpoints.domain;
  const row = mine.state === 'ok' ? (mine.body.domains ?? []).find((d) => d.domain_key === DOMAIN_KEY) ?? null : null;
  return {
    link: agentLink(endpoints),
    registry_agent_id: REGISTRY_ENTRY.agent_id,
    mine: { state: mine.state, status: mine.status, fetched_at: mine.fetched_at ?? null, message: mine.message ?? null,
      in_list: mine.state === 'ok' ? row !== null : null,
      note: mine.state === 'ok' ? mine.body.note ?? null : null,
      agent_id: row ? row.agent_id ?? null : null,
      agent_display_name: row ? row.agent_display_name ?? null : null },
    fields: agentFields(mine, row),
    domain: { state: domain.state, status: domain.status, fetched_at: domain.fetched_at ?? null, message: domain.message ?? null,
      agent_id: domain.state === 'ok' ? domain.body.agent_id ?? null : null,
      manager_can_reach: domain.state === 'ok' ? domain.body.manager_can_reach ?? null : null },
  };
}

/** Panel 5. Change and tool requests kept apart; a row with no kind is not guessed into either. */
export function requestGroups(endpoint) {
  if (endpoint.state !== 'ok') return { state: endpoint.state, endpoint };
  const all = Array.isArray(endpoint.body.change_requests) ? endpoint.body.change_requests : [];
  return {
    state: 'ok', endpoint,
    change: all.filter((r) => r.kind === 'change'),
    tool: all.filter((r) => r.kind === 'tool'),
    unknown_kind: all.filter((r) => r.kind !== 'change' && r.kind !== 'tool'),
  };
}

/** Panel 6. Each gap names the source that proves it. */
export function gapList(rows, endpoints) {
  const drafts = rows.filter((r) => r.validation === 'draft');
  const noBehaviour = rows.filter((r) => r.behaviours.length === 0);
  const notReady = Object.entries(endpoints).filter(([, e]) => e.state !== 'ok');
  return {
    r8: R8_UNREACHABLE,
    agent: agentLink(endpoints),
    drafts: { count: drafts.length, total: rows.length },
    no_behaviour: noBehaviour,
    unavailable: UNAVAILABLE_FIELDS,
    endpoints_not_ready: notReady.map(([key, e]) => ({ key, state: e.state, status: e.status ?? null })),
  };
}

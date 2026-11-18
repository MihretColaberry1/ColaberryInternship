// Turns the Agent domain inputs into what each panel shows. Pure functions: no DOM, no network.
// Every value keeps its source: 'source_file', 'endpoint', 'platform_sync' or 'platform_code'. Values
// from one source are never relabelled as another. Authority is the platform's own record
// (`authority[]` in the synced file), read as written and never recalculated here.
import { AUTONOMY_LEVELS, AUTONOMY_MEANINGS, AUTONOMY_STAGES, autonomyIndex } from './authority.js';
import {
  AUTHORITY_WORDS, DOMAIN_KEY, MINE_AGENT_FIELDS, R8_UNREACHABLE, REGISTRY_ENTRY, REQUEST_STATUSES, SET_BY_NOT_RECORDED, UNAVAILABLE_FIELDS,
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
  const origin = source === 'mine' ? mine.origin ?? 'endpoint' : source === 'domain' ? domain.origin ?? 'endpoint' : null;
  return { state, source, origin, reason: state === 'unknown' ? mine.state : null,
    tools_granted: tools, tools_granted_count: count ?? (tools ? tools.length : null) };
}

/**
 * Who "records" a value, in words: the endpoint itself, or the platform sync (its copy of the endpoint).
 * Kept short because it sits in narrow summary columns; the tag beside it names the file and endpoint.
 */
export function recordedBy(origin) {
  return origin === 'platform_sync' ? 'the platform sync' : 'the endpoint';
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
  const by = recordedBy(link.origin);
  if (link.state === 'not_linked') return `None: ${by} links no agent to this domain`;
  if (link.state === 'linked') {
    if (link.tools_granted_count === 0) return `None: ${by} records 0 tools granted`;
    if (link.tools_granted_count != null) return `${link.tools_granted_count} granted, as ${by} records`;
    return 'Not captured: the snapshot records only that an agent is linked';
  }
  if (link.state === 'not_in_list') return 'Unknown: this domain is not in your list on the platform';
  return 'Not captured yet';
}

/**
 * One row per capability, in the order the pinned research file records them. Names, starting rung,
 * behaviours, tools and blockers come from that file (`source_file`). Authority comes only from the
 * platform's own record for the same capability_id (`platform`, from `authority[]` in the synced
 * file): effective_autonomy, reasons, ceiling and ceiling reason, exactly as the platform wrote them.
 * `platform` is null when the snapshot has no row for the capability or no authority section at all;
 * the page then says so and never substitutes a default or a calculation.
 */
export function capabilityRows(matrix, { grantedTools = null, authority = null } = {}) {
  const byId = authority?.status === 'ok' ? authority.byId : {};
  return (matrix?.capabilities ?? []).map((c) => ({
    id: c.capability_id,
    name: c.name,
    classification: c.classification,
    implementation_state: c.implementation_state,
    validation: c.requirement_validation_state,
    starting: c.starting_autonomy,
    ceiling: c.max_permitted_autonomy,
    ceiling_reason: c.max_autonomy_rationale ?? null,
    human_decision: c.human_decision === true,
    behaviours: Array.isArray(c.release_behaviour) ? c.release_behaviour : [],
    required_tools: Array.isArray(c.required_tools) ? c.required_tools : [],
    blocked_by: Array.isArray(c.blocked_by) ? c.blocked_by : [],
    granted_tools: grantedTools,
    platform: Object.hasOwn(byId, c.capability_id) ? byId[c.capability_id] : null,
  }));
}

/**
 * Criterion 4 for one row, as the words the page shows. The same function feeds the console and the
 * detail page, so the wording cannot drift between them. Every value is the platform's; the only
 * comparison made here is whether its current rung is the research file's starting rung.
 */
export function authorityView(row) {
  const p = row.platform;
  if (!p) {
    return { recorded: false, current: null, starting: row.starting, isStarting: null, approval: AUTHORITY_WORDS.confirmation_unavailable,
      constraint: AUTHORITY_WORDS.not_in_snapshot, holding: false, reasons: [], ceiling: null, ceiling_note: null, ceiling_reason: null };
  }
  const holding = p.reasons.includes(TOOL_REASON);
  return {
    recorded: true,
    current: p.effective_autonomy,
    starting: row.starting,
    isStarting: p.effective_autonomy != null && p.effective_autonomy === row.starting,
    approval: AUTHORITY_WORDS.confirmation_unavailable,
    constraint: holding ? AUTHORITY_WORDS.cap_holding : AUTHORITY_WORDS.cap_idle,
    holding,
    reasons: p.reasons,
    ceiling: p.max_permitted_autonomy,
    ceiling_note: p.max_permitted_autonomy_note,
    ceiling_reason: p.ceiling_reason,
  };
}

const TOOL_REASON = 'no_tool_grants';

/**
 * Criterion 4: the tool-grant rule as the platform recorded it. `held` counts the capabilities whose
 * platform reasons include no_tool_grants (a count of what the platform wrote, not a calculation).
 * `consistent` is false when that count and the platform's own `binds_nothing` disagree; the page then
 * says the platform data disagrees with itself instead of choosing one.
 */
export function toolRuleStatus(rows, authority) {
  const rule = authority?.status === 'ok' ? authority.rule : null;
  const recorded = rows.filter((r) => r.platform);
  const held = recorded.filter((r) => r.platform.reasons.includes(TOOL_REASON)).length;
  return {
    known: rule != null,
    total: rows.length,
    recorded: recorded.length,
    held,
    rule: rule?.rule ?? null,
    note: rule?.note ?? null,
    approved_above_r2: rule?.approved_above_r2 ?? null,
    binds_nothing: rule?.binds_nothing ?? null,
    consistent: rule == null || rule.binds_nothing === (held === 0),
  };
}

/** A row as the ladder grid draws it: the research file's starting rung and the platform's ceiling. */
export const platformLadderRow = (r) => ({ ...r, ceiling: r.platform?.max_permitted_autonomy ?? null, ceiling_reason: r.platform?.ceiling_reason ?? null });

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
      origin: mine.origin ?? 'endpoint', last_changed: mine.last_changed ?? null,
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
/** A request's status as the platform defines it: known (pending or terminal), or unrecognised. */
export function requestStatus(status) {
  const known = typeof status === 'string' && Object.hasOwn(REQUEST_STATUSES, status) ? REQUEST_STATUSES[status] : null;
  return known ? { status, known: true, ...known } : { status: status ?? null, known: false, terminal: null, tone: 'neutral',
    words: status == null ? 'No status recorded' : `Unrecognised status "${status}": shown as recorded, not counted as waiting or decided` };
}

/**
 * Panel 5: the governance queue, grouped by kind (change, tool, no stated kind) and by status. Submitted
 * is the only pending status; approved, declined and withdrawn are terminal (the platform owner's
 * definition). A status outside those four is kept and counted as unrecognised, never guessed.
 */
export function requestGroups(endpoint) {
  if (endpoint.state !== 'ok') return { state: endpoint.state, endpoint };
  const all = Array.isArray(endpoint.body.change_requests) ? endpoint.body.change_requests : [];
  const by = (status) => all.filter((r) => r.status === status);
  return {
    state: 'ok', endpoint,
    all,
    change: all.filter((r) => r.kind === 'change'),
    tool: all.filter((r) => r.kind === 'tool'),
    unknown_kind: all.filter((r) => r.kind !== 'change' && r.kind !== 'tool'),
    waiting: by('submitted'),
    decided: [...by('approved'), ...by('declined')],
    withdrawn: by('withdrawn'),
    unrecognised: all.filter((r) => !requestStatus(r.status).known),
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
    endpoints_synced: Object.entries(endpoints).filter(([, e]) => e.state === 'ok' && e.origin === 'platform_sync')
      .map(([key, e]) => ({ key, last_changed: e.last_changed ?? null })),
  };
}

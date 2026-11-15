// Loads what the Agent domain tab reads. Three inputs, each kept with its own provenance:
//   - the SOURCE FILE copied from the platform repo (command-center/sources/), with its provenance
//   - the ENDPOINT SNAPSHOT you captured with your own session, if one is present locally
//   - the PLATFORM SYNC: .colaberry/agent-domain.json, which the platform writes into this repo from
//     the same endpoints, dated by .colaberry/manifest.json's generated_at ("last changed")
// No DOM access, so the same code runs in the browser and under `node --test`.
import { DATA_FILES, DataLoadError, loadJson } from './data.js';
import { DOMAIN_KEY, ENDPOINTS } from './agent-domain-facts.js';
import { redactSnapshot, withholdRecordIds } from './agent-domain-redact.js';
import { isAutonomyStage } from './authority.js';
import { isPerRungRecord } from './verification-model.js';

export const CAPABILITY_FILE = 'command-center/sources/product_experience.capabilities.json';
export const SOURCES_FILE = 'command-center/sources/SOURCES.json';
// Ignored by git on purpose: a snapshot is reviewed by hand before it is ever committed.
export const SNAPSHOT_FILE = 'command-center/snapshots/product_experience.endpoint-snapshots.json';
export const SNAPSHOT_SCHEMA = 'agent-domain-endpoint-snapshots/1';

const is404 = (err) => err instanceof DataLoadError && /HTTP 404/.test(err.reason);

async function loadSource(options) {
  const base = options.base ?? '';
  try {
    const [matrix, sources] = await Promise.all([
      loadJson(base + CAPABILITY_FILE, options),
      loadJson(base + SOURCES_FILE, options),
    ]);
    if (!matrix || !Array.isArray(matrix.capabilities)) {
      return { status: 'error', error: `${CAPABILITY_FILE} has no "capabilities" list` };
    }
    const record = (sources?.files ?? []).find((f) => f.file === CAPABILITY_FILE) ?? null;
    if (!record || !record.platform_commit) {
      return { status: 'error', error: `${SOURCES_FILE} does not record where ${CAPABILITY_FILE} came from` };
    }
    return { status: 'ok', matrix, record, error: null };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

/** One endpoint's state, read from a snapshot entry. Never invents a body. */
export function endpointState(entry) {
  if (!entry) return { state: 'not_captured' };
  const base = { fetched_at: entry.fetched_at ?? null, status: entry.http_status ?? null };
  if (entry.http_status === 200 && entry.body && typeof entry.body === 'object') {
    return { ...base, state: 'ok', body: entry.body };
  }
  if (entry.http_status === 401 || entry.http_status === 403) {
    return { ...base, state: 'refused', message: entry.body?.error ?? null };
  }
  if (entry.http_status == null) return { ...base, state: 'failed', message: entry.error ?? 'no response' };
  return { ...base, state: 'error', message: entry.body?.error ?? entry.note ?? null };
}

const notCaptured = () => Object.fromEntries(Object.keys(ENDPOINTS).map((k) => [k, { state: 'not_captured' }]));

/** Interprets a parsed snapshot file. Exported so the tests can feed it shapes directly. */
export function readSnapshot(json) {
  if (!json || json.schema !== SNAPSHOT_SCHEMA || !Array.isArray(json.snapshots)) {
    return { status: 'invalid', error: `${SNAPSHOT_FILE} is not a "${SNAPSHOT_SCHEMA}" file`, endpoints: notCaptured() };
  }
  const endpoints = {};
  for (const [key, path] of Object.entries(ENDPOINTS)) {
    endpoints[key] = endpointState(json.snapshots.find((s) => s.endpoint === path));
  }
  return { status: 'captured', captured_at: json.captured_at ?? null, error: null, endpoints };
}

async function loadSnapshot(options) {
  try {
    const json = await loadJson((options.base ?? '') + SNAPSHOT_FILE, { ...options, attempts: 1 });
    return readSnapshot(json);
  } catch (err) {
    if (is404(err)) return { status: 'not_captured', error: null, endpoints: notCaptured() };
    return { status: 'invalid', error: err.message, endpoints: notCaptured() };
  }
}

export const PLATFORM_SYNC_FILE = '.colaberry/agent-domain.json';
export const PLATFORM_SYNC_SCHEMA = 'colaberry.agent-domain/v1';

/**
 * The platform's synced copy, as endpoint states for the two endpoints it carries (mine, requests).
 * It goes through the same allow-list as a captured snapshot, so the agent id becomes PRESENT and no
 * person's identity is kept. The file has no clock of its own; `last_changed` is the manifest's
 * generated_at, which says when the platform last rewrote these files, not when anything was checked.
 */
export function readPlatformSync(json, lastChanged) {
  const valid = json && json.schema === PLATFORM_SYNC_SCHEMA && json.domain_key === DOMAIN_KEY
    && json.agent && typeof json.agent === 'object' && Array.isArray(json.governance?.requests);
  if (!valid) return { status: 'invalid', error: `${PLATFORM_SYNC_FILE} is not a "${PLATFORM_SYNC_SCHEMA}" file for ${DOMAIN_KEY}`, endpoints: {} };
  const a = json.agent;
  const row = {
    domain_key: DOMAIN_KEY,
    agent_id: a.exists === true ? a.agent_id ?? null : null,
    agent_display_name: a.display_name ?? null,
    agent_enabled: a.enabled ?? null,
    agent_autonomy_level: a.autonomy_level ?? null,
    agent_autonomy_level_set_at: a.autonomy_level_set_at ?? null,
    agent_autonomy_level_source: a.autonomy_level_source ?? null,
    agent_tools_granted: Array.isArray(a.tools_granted) ? a.tools_granted : null,
    agent_tools_granted_count: Number.isInteger(a.tools_granted_count) ? a.tools_granted_count : null,
  };
  const raw = { snapshots: [
    { endpoint: ENDPOINTS.mine, http_status: 200, body: { domains: [row], not_recorded: json.not_recorded ?? [] } },
    { endpoint: ENDPOINTS.requests, http_status: 200, body: { change_requests: json.governance.requests } },
  ] };
  const { snapshot } = redactSnapshot(raw);
  const endpoints = {};
  for (const s of snapshot.snapshots) {
    const key = Object.keys(ENDPOINTS).find((k) => ENDPOINTS[k] === s.endpoint);
    endpoints[key] = { state: 'ok', origin: 'platform_sync', status: null, fetched_at: null, last_changed: lastChanged ?? null, body: s.body };
  }
  return { status: 'synced', last_changed: lastChanged ?? null, error: null, endpoints,
    verdict_reasons: verdictReasons(json.verification), authority: readAuthority(json) };
}

const NOT_SYNCED_AUTHORITY = Object.freeze({ status: 'not_synced', error: null, byId: {}, rule: null, size: 0 });
const textOrNull = (v) => (v == null ? null : typeof v === 'string' ? withholdRecordIds(v) : undefined);

/**
 * The platform's own authority record for each capability (`authority[]`) and its tool-grant rule
 * (`authority_rule`), from the synced copy of GET /api/admin/agent-domains/product_experience. Read as
 * the platform wrote it and never recalculated (the platform owner's decision). Every row is checked;
 * one malformed row makes the whole section `invalid`, so the page reports the problem instead of
 * showing some rows and guessing the rest. `approved_autonomy` is deliberately not read: it is not a
 * record of human approval. AgentDomainCapabilityConfirmation is, and the snapshot does not carry it.
 */
export function readAuthority(json) {
  const invalid = (error) => ({ status: 'invalid', error, byId: {}, rule: null, size: 0 });
  if (!Array.isArray(json?.authority)) {
    return { status: 'missing', error: `${PLATFORM_SYNC_FILE} has no authority[] section`, byId: {}, rule: null, size: 0 };
  }
  const byId = {};
  for (const [i, a] of json.authority.entries()) {
    const id = a?.capability_id;
    const row = {
      effective_autonomy: a?.effective_autonomy ?? null,
      reasons: a?.reasons,
      max_permitted_autonomy: a?.max_permitted_autonomy ?? null,
      max_permitted_autonomy_note: textOrNull(a?.max_permitted_autonomy_note),
      ceiling_reason: textOrNull(a?.ceiling_reason),
    };
    const ok = typeof id === 'string' && id.length > 0 && !Object.hasOwn(byId, id)
      && (row.effective_autonomy === null || isAutonomyStage(row.effective_autonomy))
      && (row.max_permitted_autonomy === null || isAutonomyStage(row.max_permitted_autonomy))
      && Array.isArray(row.reasons) && row.reasons.every((x) => typeof x === 'string')
      && row.max_permitted_autonomy_note !== undefined && row.ceiling_reason !== undefined;
    if (!ok) return invalid(`${PLATFORM_SYNC_FILE} authority[${i}] is not a well-formed authority row`);
    byId[id] = row;
  }
  const r = json.authority_rule;
  const rule = r && typeof r === 'object'
    ? { rule: textOrNull(r.rule), note: textOrNull(r.note), approved_above_r2: r.approved_above_r2, binds_nothing: r.binds_nothing }
    : null;
  const ruleOk = rule && typeof rule.rule === 'string' && rule.note !== undefined
    && Number.isInteger(rule.approved_above_r2) && rule.approved_above_r2 >= 0 && typeof rule.binds_nothing === 'boolean';
  if (!ruleOk) return invalid(`${PLATFORM_SYNC_FILE} authority_rule is missing or not well-formed`);
  return { status: 'ok', error: null, byId, rule, size: json.authority.length };
}

/**
 * The platform verifier's own reasons, by plan story id (Panel 6 quotes them beside a disagreement).
 * Only `story_id` and `reasons` are kept: no titles, no criteria text, no commit data. The verifier's
 * per-rung records are left out; they belong to Panel 4 and its updated projection.
 */
export function verdictReasons(verification) {
  const out = {};
  for (const s of Array.isArray(verification?.stories) ? verification.stories : []) {
    if (typeof s?.story_id !== 'string' || isPerRungRecord(s.story_id)) continue;
    out[s.story_id] = Array.isArray(s.reasons) ? s.reasons.filter((x) => typeof x === 'string') : [];
  }
  return out;
}

async function loadPlatformSync(options) {
  const base = options.base ?? '';
  try {
    const [json, manifest] = await Promise.all([
      loadJson(base + PLATFORM_SYNC_FILE, options),
      loadJson(base + DATA_FILES.manifest, options).catch(() => null),
    ]);
    return readPlatformSync(json, typeof manifest?.generated_at === 'string' ? manifest.generated_at : null);
  } catch (err) {
    if (is404(err)) return { status: 'not_synced', error: null, endpoints: {} };
    return { status: 'invalid', error: err.message, endpoints: {} };
  }
}

/**
 * Your own capture wins wherever it answered; the platform sync fills only the endpoints the capture
 * did not answer. Endpoints neither source carries keep the capture's state (not captured, refused...).
 */
export function combineEndpoints(snapshot, sync) {
  const out = { ...snapshot.endpoints };
  for (const [key, e] of Object.entries(sync?.endpoints ?? {})) {
    if (out[key]?.state !== 'ok') out[key] = e;
  }
  return { ...snapshot, endpoints: out, sync: { status: sync?.status ?? 'not_synced', last_changed: sync?.last_changed ?? null, error: sync?.error ?? null,
    verdict_reasons: sync?.verdict_reasons ?? {},
    authority: sync?.authority
      ?? (sync?.status === 'invalid' ? { ...NOT_SYNCED_AUTHORITY, status: 'invalid', error: sync.error } : NOT_SYNCED_AUTHORITY) } };
}

export async function loadAgentDomainData(options = {}) {
  const [source, snapshot, sync] = await Promise.all([loadSource(options), loadSnapshot(options), loadPlatformSync(options)]);
  return { source, snapshot: combineEndpoints(snapshot, sync) };
}

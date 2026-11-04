// Loads what the Agent domain tab reads. Two inputs, kept apart and never merged:
//   - the SOURCE FILE copied from the platform repo (command-center/sources/), with its provenance
//   - the ENDPOINT SNAPSHOT you captured with your own session, if one is present locally
// No DOM access, so the same code runs in the browser and under `node --test`.
import { DataLoadError, loadJson } from './data.js';
import { ENDPOINTS } from './agent-domain-facts.js';

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

export async function loadAgentDomainData(options = {}) {
  const [source, snapshot] = await Promise.all([loadSource(options), loadSnapshot(options)]);
  return { source, snapshot };
}

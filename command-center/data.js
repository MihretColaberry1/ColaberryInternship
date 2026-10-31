// Loads the three .colaberry files the Command Center reads.
// No DOM access here, so the same code runs in the browser and under `node --test`.

export const DATA_FILES = Object.freeze({
  plan: '.colaberry/plan.json',
  progress: '.colaberry/progress.json',
  manifest: '.colaberry/manifest.json',
});

export class DataLoadError extends Error {
  constructor(file, reason, cause) {
    super(`Could not load ${file}: ${reason}`);
    this.name = 'DataLoadError';
    this.file = file;
    this.reason = reason;
    if (cause) this.cause = cause;
  }
}

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_ATTEMPTS = 2;

// Fetch one JSON file with a timeout. Timeouts and network errors are retried
// (capped at `attempts`); a 404 or invalid JSON is not, because retrying cannot fix it.
export async function loadJson(url, options = {}) {
  const {
    fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    attempts = DEFAULT_ATTEMPTS,
  } = options;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new DataLoadError(url, `the server answered HTTP ${response.status}`);
      try {
        return await response.json();
      } catch (err) {
        throw new DataLoadError(url, 'the file is not valid JSON', err);
      }
    } catch (err) {
      if (err instanceof DataLoadError) throw err;
      lastError = err && err.name === 'AbortError'
        ? new DataLoadError(url, `no answer within ${timeoutMs / 1000} seconds`, err)
        : new DataLoadError(url, (err && err.message) || 'network error', err);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

function requireField(file, obj, field, check, describe) {
  if (!obj || typeof obj !== 'object' || !check(obj[field])) {
    throw new DataLoadError(file, `expected "${field}" to be ${describe}`);
  }
}

const isArray = (v) => Array.isArray(v);
const isText = (v) => typeof v === 'string' && v.length > 0;

// Only the fields the page cannot work without are checked. Unknown fields are
// ignored, because the platform only ever adds fields (docs/DATA_CONTRACT.md).
export function checkShapes({ plan, progress, manifest }) {
  requireField(DATA_FILES.plan, plan, 'stories', isArray, 'a list');
  requireField(DATA_FILES.plan, plan, 'releases', isArray, 'a list');
  requireField(DATA_FILES.progress, progress, 'stories', isArray, 'a list');
  requireField(DATA_FILES.manifest, manifest, 'generated_at', isText, 'a timestamp');
}

// Optional files this repo owns. A missing file is an empty list, but a file that
// exists and cannot be read is reported, not hidden.
async function loadOptionalList(file, key, options) {
  try {
    const json = await loadJson((options.base ?? '') + file, options);
    if (!json || !Array.isArray(json[key])) return { items: [], error: `${file} has no "${key}" list` };
    return { items: json[key], error: null };
  } catch (err) {
    if (err instanceof DataLoadError && /HTTP 404/.test(err.reason)) return { items: [], error: null };
    return { items: [], error: err.message };
  }
}

// Your own decisions and notes for the Knowledge base.
export const NOTES_FILE = 'command-center/notes.json';

export function loadNotes(options = {}) {
  return loadOptionalList(NOTES_FILE, 'notes', options);
}

// SAFE requirements drafted here but not (yet) in plan.json. Drafts only: whether one is
// registered, signed off or verified is read from the .colaberry files, never from this one.
export const DRAFTS_FILE = 'command-center/draft-guardrails.json';

export function loadDraftGuardrails(options = {}) {
  return loadOptionalList(DRAFTS_FILE, 'drafts', options);
}

export async function loadProjectData(options = {}) {
  const base = options.base ?? '';
  const [plan, progress, manifest, notes, drafts] = await Promise.all([
    loadJson(base + DATA_FILES.plan, options),
    loadJson(base + DATA_FILES.progress, options),
    loadJson(base + DATA_FILES.manifest, options),
    loadNotes(options),
    loadDraftGuardrails(options),
  ]);
  const data = { plan, progress, manifest, notes, drafts, isSample: false };
  checkShapes(data);
  return data;
}

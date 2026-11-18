// Redaction guard for the endpoint snapshot behind Panels 1 and 5. Pure functions, no I/O.
//
// Ali Muwwakkil's conditions (email, 2026-11-02): nothing in a captured response that identifies
// another person goes into the repository; learner names, emails and individual records are
// redacted or aggregated before commit; if redaction would empty a panel, stop and ask Ali.
// Mihret's instruction (2026-11-02): no staff names or roles either, until Ali says they may appear.
//
// The approach is an allow-list, not a deny-list: per endpoint, only the fields a panel renders
// are kept. Everything else is dropped, so a field the platform adds later is withheld by default
// rather than published by default.
import { ENDPOINTS } from './agent-domain-facts.js';

export const WITHHELD = 'withheld: identifies a person';
export const SELF = 'you (the person who captured this)';
export const PRESENT = '[present]';

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/**
 * A UUID-shaped internal record id, such as a staff member's org_members row. Display text never
 * carries one: it is a permanent key tied to a person. This changes only what the page shows; the
 * pinned research file is left exactly as the platform wrote it (a test checks its git blob).
 */
export const RECORD_ID_PATTERN = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
export const RECORD_ID_WITHHELD = '[record ID withheld]';
export function withholdRecordIds(text) {
  return String(text).replace(new RegExp(`\\b${RECORD_ID_PATTERN}\\b`, 'g'), RECORD_ID_WITHHELD);
}

/**
 * Mihret's decision D4 (2026-11-10): this public page shows no personal account-access information
 * and does not name the accountable manager. Display-only, like the record-id rule above: the pinned
 * research file and the platform-written plan are never edited.
 */
export const MANAGER_ACCESS_TEXT = 'Accountable manager access: Not configured in the admin portal.';
const MANAGER_ACCESS_PATTERN = /admin_users|org_members|mgmt_role|admin login/i;

/** True for text that describes a person's admin-portal account records or how they would log in. */
export function isManagerAccessText(text) {
  return MANAGER_ACCESS_PATTERN.test(String(text ?? ''));
}

export const MANAGER_WORDS = 'the accountable manager';
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The accountable manager's name, as the pinned research file records it (`accountable_human`).
 * Read from data rather than written into this code. Empty when the file is not loaded.
 */
export function accountableNames(matrix) {
  const name = typeof matrix?.accountable_human === 'string' ? matrix.accountable_human.trim() : '';
  return name ? [name] : [];
}

/**
 * Replaces each recorded name, and its surname on its own, with "the accountable manager"
 * ("The accountable manager" where a sentence starts). With no names known it returns null, so a
 * caller can fall back to something that cannot carry a name (a story id) instead of guessing.
 */
export function withholdNames(text, names) {
  if (text == null) return text;
  if (!Array.isArray(names) || names.length === 0) return null;
  const tokens = new Set();
  for (const n of names) {
    tokens.add(n);
    const parts = n.split(/\s+/);
    if (parts.length > 1) tokens.add(parts[parts.length - 1]);
  }
  // Longest first, so the full name is replaced before its surname is.
  const alternation = [...tokens].sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
  const re = new RegExp(`\\b(?:${alternation})\\b`, 'g');
  return String(text).replace(re, (_m, offset, whole) => {
    const before = whole.slice(0, offset);
    const startsSentence = before.trim() === '' || /[.!?:]\s*$/.test(before);
    return startsSentence ? 'The accountable manager' : MANAGER_WORDS;
  });
}

/**
 * A blocker line as this public page shows it, for capability and story pages alike:
 *   - text describing a person's admin-portal account records becomes MANAGER_ACCESS_TEXT (D4);
 *   - a staff member's internal record id is withheld;
 *   - the accountable manager's name is withheld (when the name list is known).
 */
export function publicBlockerText(raw, names) {
  if (isManagerAccessText(raw)) return MANAGER_ACCESS_TEXT;
  const b = withholdRecordIds(raw);
  return withholdNames(b, names) ?? b;
}

const IDENTITY_KEYS = new Set(['requested_by_identity', 'approved_by_identity']);
// Panel 1 only needs to know whether an agent exists, not which database row it is. The id is a
// key into an internal record, so it is reduced to PRESENT or null.
const PRESENCE_KEYS = new Set(['agent_id']);
// Free text someone typed. Emails are removed; the rest is listed for a person to read before commit.
const FREE_TEXT_KEYS = new Set(['title', 'description', 'declined_reason', 'note', 'error', 'reason']);

/** Only Ali's two approved endpoints. Each lists the keys kept at the top and on each record. */
const RULES = Object.freeze({
  [ENDPOINTS.mine]: {
    top: ['domains', 'not_recorded', 'note', 'error'],
    list: 'domains',
    row: ['domain_key', 'stage', 'entry_point', 'manager_can_reach', 'intended_builder_state', 'agent_id',
      'agent_display_name', 'agent_enabled', 'agent_autonomy_level', 'agent_autonomy_level_set_at',
      'agent_autonomy_level_source', 'agent_tools_granted', 'agent_tools_granted_count',
      'releases', 'stories', 'stories_verified', 'build_authorizations'],
  },
  [ENDPOINTS.requests]: {
    top: ['change_requests', 'error'],
    list: 'change_requests',
    // No `id`: Panel 5 never shows it, and it is the key to a platform row that holds people's emails.
    row: ['kind', 'domain_key', 'title', 'description', 'status', 'requested_by_identity', 'requested_at',
      'approved_by_identity', 'approved_at', 'declined_reason'],
  },
});

export const APPROVED_ENDPOINTS = Object.freeze(Object.keys(RULES));

// not_recorded entries are { field, reason } notes from the platform, not people.
const NOT_RECORDED_KEYS = ['field', 'reason'];

const isSelf = (value, selfEmails) => typeof value === 'string'
  && selfEmails.some((e) => e.toLowerCase() === value.trim().toLowerCase());

function scrubText(value, path, report) {
  if (typeof value !== 'string') return value;
  const out = value.replace(EMAIL, () => { report.redacted.push(path); return WITHHELD; });
  if (out.trim()) report.review_text.push(path);
  return out;
}

function keepKeys(obj, keys, path, report, selfEmails) {
  const out = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    const at = `${path}.${k}`;
    if (!keys.includes(k)) { report.dropped_keys.push(at); continue; }
    if (IDENTITY_KEYS.has(k)) {
      if (v == null) out[k] = null;
      else if (v === SELF || v === WITHHELD) out[k] = v; // already redacted: a second pass changes nothing
      else if (isSelf(v, selfEmails)) { out[k] = SELF; report.self.push(at); }
      else { out[k] = WITHHELD; report.redacted.push(at); }
    } else if (PRESENCE_KEYS.has(k)) {
      out[k] = v == null || v === '' ? null : PRESENT;
      if (out[k] === PRESENT && v !== PRESENT) report.redacted.push(at);
    } else if (FREE_TEXT_KEYS.has(k)) out[k] = scrubText(v, at, report);
    else out[k] = v;
  }
  return out;
}

// A record that still shows something other than its key, kind and withheld markers.
const informative = (row) => Object.entries(row)
  .some(([k, v]) => !['domain_key', 'kind'].includes(k) && v != null && v !== WITHHELD && v !== SELF);

function redactBody(body, rule, path, report, selfEmails) {
  if (!body || typeof body !== 'object') return body ?? null;
  const top = keepKeys(body, rule.top, path, report, selfEmails);
  if (Array.isArray(body[rule.list])) {
    top[rule.list] = body[rule.list].map((r, i) => keepKeys(r, rule.row, `${path}.${rule.list}[${i}]`, report, selfEmails));
  }
  if (Array.isArray(body.not_recorded) && rule.top.includes('not_recorded')) {
    top.not_recorded = body.not_recorded.map((r, i) => keepKeys(r, NOT_RECORDED_KEYS, `${path}.not_recorded[${i}]`, report, selfEmails));
  }
  const before = Array.isArray(body[rule.list]) ? body[rule.list].length : 0;
  if (before > 0 && !top[rule.list].some(informative)) report.emptied.push(path);
  return top;
}

/**
 * Returns a copy of a raw capture holding only what Panels 1 and 5 need, plus a report of every
 * change. `report.emptied` non-empty means: stop, do not commit, and tell Ali.
 * `selfEmails` are the capturer's own addresses; they become SELF, never the address itself.
 */
export function redactSnapshot(raw, { selfEmails = [] } = {}) {
  const report = { dropped_endpoints: [], dropped_keys: [], redacted: [], self: [], review_text: [], emptied: [] };
  const snapshots = [];
  for (const [i, s] of (raw?.snapshots ?? []).entries()) {
    const rule = RULES[s?.endpoint];
    if (!rule) { report.dropped_endpoints.push(s?.endpoint ?? `snapshots[${i}]`); continue; }
    const path = `snapshots[${snapshots.length}]`;
    snapshots.push({
      endpoint: s.endpoint, method: 'GET', fetched_at: s.fetched_at ?? null, http_status: s.http_status ?? null,
      body: redactBody(s.body, rule, `${path}.body`, report, selfEmails),
      ...(s.error != null ? { error: scrubText(String(s.error), `${path}.error`, report) } : {}),
    });
  }
  return { snapshot: { schema: raw?.schema, captured_at: raw?.captured_at ?? null, snapshots }, report };
}

/** Every email-shaped string anywhere in a value, with its path. Used on any file before commit. */
export function findEmails(value, path = '$', found = []) {
  if (typeof value === 'string') { if (value.match(EMAIL)) found.push(path); }
  else if (Array.isArray(value)) value.forEach((v, i) => findEmails(v, `${path}[${i}]`, found));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) findEmails(v, `${path}.${k}`, found);
  return found;
}

/**
 * The commit gate: problems that make a snapshot unfit for this public repository. An empty list
 * is required. A redacted snapshot passes; a raw capture does not.
 */
export function privacyViolations(snapshot) {
  const problems = findEmails(snapshot).map((path) => ({ path, problem: 'email address' }));
  for (const [i, s] of (snapshot?.snapshots ?? []).entries()) {
    const rule = RULES[s?.endpoint];
    if (!rule) { problems.push({ path: `snapshots[${i}]`, problem: `endpoint not approved for capture: ${s?.endpoint}` }); continue; }
    const body = s.body ?? {};
    for (const k of Object.keys(body)) {
      if (!rule.top.includes(k)) problems.push({ path: `snapshots[${i}].body.${k}`, problem: 'field not on the allow-list' });
    }
    for (const [j, r] of (Array.isArray(body[rule.list]) ? body[rule.list] : []).entries()) {
      for (const [k, v] of Object.entries(r ?? {})) {
        const at = `snapshots[${i}].body.${rule.list}[${j}].${k}`;
        if (!rule.row.includes(k)) problems.push({ path: at, problem: 'field not on the allow-list' });
        else if (IDENTITY_KEYS.has(k) && v != null && v !== WITHHELD && v !== SELF) problems.push({ path: at, problem: 'identity not withheld' });
        else if (PRESENCE_KEYS.has(k) && v != null && v !== PRESENT) problems.push({ path: at, problem: 'record id not reduced to presence' });
      }
    }
  }
  return problems;
}

// Loads a rules pack and refuses it unless every rule is tied to a real source line.
//
// The point of the citation check: a rule only runs if the quoted words are actually on the cited
// line of the cited file, at the pack's pinned commit. A rule someone made up, or one whose source
// has since changed, stops the run with CitationMismatch instead of producing findings.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ReviewError, readAt, resolveCommit } from './git-source.mjs';

const MACHINE_APPROVER = /^(system:|agent:|bot:)|auto[ _-]?approve|timeout/i;

function invalid(message) {
  return new ReviewError('RulesPackInvalid', message);
}

function checkSources(where, sources) {
  if (!Array.isArray(sources) || sources.length === 0) throw invalid(`${where} has no source`);
  for (const s of sources) {
    if (typeof s?.path !== 'string' || !Number.isInteger(s.line) || s.line < 1
      || typeof s.quote !== 'string' || s.quote.trim().length < 4) {
      throw invalid(`${where} has a source without a path, line and quote`);
    }
  }
}

function checkApproval(pack) {
  const a = pack.approval;
  if (!a || !['unapproved', 'approved'].includes(a.state)) throw invalid('approval.state must be "unapproved" or "approved"');
  if (a.state === 'approved' && (typeof a.approved_by !== 'string' || !a.approved_by.trim() || MACHINE_APPROVER.test(a.approved_by))) {
    throw invalid('an approved pack must name the human who approved it');
  }
  if (typeof pack.supplied_by !== 'string' || !pack.supplied_by.trim()) throw invalid('supplied_by must name the person who compiled the pack');
  const s = pack.standard;
  if (!s || !['pending_confirmation', 'decided'].includes(s.state)) throw invalid('standard.state must be "pending_confirmation" or "decided"');
  if (s.state === 'decided' && (typeof s.decided_by !== 'string' || !s.decided_by.trim())) throw invalid('a decided standard must name who decided it');
}

/** Shape check only. Returns the pack unchanged or throws RulesPackInvalid. */
export function validatePack(pack, knownChecks) {
  if (!pack || typeof pack !== 'object') throw invalid('pack must be a JSON object');
  for (const k of ['pack_id', 'source_commit', 'token_file']) {
    if (typeof pack[k] !== 'string' || !pack[k]) throw invalid(`${k} is required`);
  }
  checkApproval(pack);
  checkSources('token_file', pack.token_file_sources);
  if (!Array.isArray(pack.rules) || pack.rules.length === 0) throw invalid('rules must be a non-empty list');
  const ids = new Set();
  for (const r of pack.rules) {
    if (typeof r?.id !== 'string' || !/^R\d+$/.test(r.id) || ids.has(r.id)) throw invalid(`rule id ${r?.id} is missing, malformed or repeated`);
    ids.add(r.id);
    if (!knownChecks.includes(r.check)) throw invalid(`rule ${r.id} names an unknown check "${r.check}"`);
    if (typeof r.title !== 'string' || !r.title) throw invalid(`rule ${r.id} has no title`);
    checkSources(`rule ${r.id}`, r.sources);
  }
  for (const n of pack.not_checked ?? []) {
    if (typeof n?.title !== 'string' || typeof n.reason !== 'string') throw invalid('every not_checked item needs a title and a reason');
    if (n.sources !== null) checkSources(`not_checked "${n.title}"`, n.sources);
  }
  if (!Array.isArray(pack.open_decisions)) throw invalid('open_decisions must be a list');
  return pack;
}

/** Re-reads every cited line at the pack's commit and confirms the quote is on it. */
export function verifyCitations(repo, pack) {
  const commit = resolveCommit(repo, pack.source_commit);
  const cache = new Map();
  const lineOf = (file, n) => {
    if (!cache.has(file)) cache.set(file, readAt(repo, commit, file).split(/\r?\n/));
    return cache.get(file)[n - 1];
  };
  const all = [...pack.token_file_sources, ...pack.rules.flatMap((r) => r.sources),
    ...(pack.not_checked ?? []).flatMap((n) => n.sources ?? [])];
  for (const s of all) {
    const text = lineOf(s.path, s.line);
    if (text === undefined || !text.includes(s.quote)) {
      throw new ReviewError('CitationMismatch', `${s.path}:${s.line} at ${commit.slice(0, 8)} does not contain "${s.quote}"`);
    }
  }
  return commit;
}

/** Reads, validates and citation-checks a pack file. Returns the pack and its SHA-256. */
export function loadPack(file, repo, knownChecks) {
  let raw;
  try {
    raw = readFileSync(file);
  } catch (err) {
    throw new ReviewError('RulesPackNotFound', `cannot read rules pack ${file}: ${err.code ?? err.message}`);
  }
  let pack;
  try {
    pack = JSON.parse(raw.toString('utf8'));
  } catch (err) {
    throw invalid(`rules pack is not valid JSON: ${err.message}`);
  }
  validatePack(pack, knownChecks);
  const sourceCommit = verifyCitations(repo, pack);
  return { pack, sourceCommit, sha256: createHash('sha256').update(raw).digest('hex') };
}

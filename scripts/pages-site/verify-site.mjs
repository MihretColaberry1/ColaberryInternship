// Checks a built GitHub Pages folder before it may be uploaded. Every check fails closed: a problem is
// returned, never fixed or ignored. build-pages-site.mjs refuses to finish while any problem remains.
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { PUBLISHED, SANITIZED, MUST_NOT_PUBLISH } from './allowlist.mjs';
import { PUBLIC_WORDING } from './public-wording.mjs';

const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
// Account-record vocabulary from the platform's admin tables. `admin_users` is allowed: it names a
// database table in one acceptance criterion and describes no one's account (Mihret, 2026-11-13).
const ACCOUNT_TERMS = /org_members|mgmt_role|admin_login/;

/** Every file under `dir`, as forward-slash paths relative to it (dot-folders included). */
export async function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out.sort();
}

/** Scans one published file's text. `names` are extra names to refuse (the manager's, read from the original). */
export function privacyProblems(file, text, names = []) {
  const problems = [];
  if (EMAIL.test(text)) problems.push(`${file}: contains an email address`);
  if (UUID.test(text)) problems.push(`${file}: contains a UUID-shaped record id`);
  for (const n of new Set([...PUBLIC_WORDING.map(([s]) => s), ...names])) {
    if (new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}\\b`).test(text)) {
      problems.push(`${file}: contains a name the published copy must not show`);
      break;
    }
  }
  if (file.endsWith('.json') && ACCOUNT_TERMS.test(text)) problems.push(`${file}: contains account-record terms`);
  return problems;
}

/** All problems with the folder at `site`, given the repository at `root`. Empty means safe to upload. */
export async function verifySite(site, root, names) {
  const problems = [];
  const files = await listFiles(site);
  const expected = new Set(PUBLISHED);
  for (const f of files) if (!expected.has(f)) problems.push(`${f}: not on the publishing allow-list`);
  for (const f of PUBLISHED) if (!files.includes(f)) problems.push(`${f}: on the allow-list but missing from the output`);
  for (const f of MUST_NOT_PUBLISH) if (files.includes(f)) problems.push(`${f}: must never be published`);
  for (const f of files) problems.push(...privacyProblems(f, await readFile(path.join(site, f), 'utf8'), names));
  for (const f of SANITIZED) {
    if (!files.includes(f)) continue;
    const copy = JSON.parse(await readFile(path.join(site, f), 'utf8'));
    const sha = createHash('sha256').update(await readFile(path.join(root, f))).digest('hex');
    if (copy?._public_copy?.derived_from !== f || copy._public_copy.source_sha256 !== sha) {
      problems.push(`${f}: _public_copy does not name this file and the sha256 of its original`);
    }
  }
  return problems;
}

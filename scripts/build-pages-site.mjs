// Builds the GitHub Pages folder for the Command Center demo: exactly the 37 allow-listed files, with
// the five data files as sanitized public copies and names replaced by the published wording (public-wording.mjs).
//
//   node scripts/build-pages-site.mjs <output-folder>
//
// Reads the repository; writes only inside <output-folder>, which must not exist yet or be empty, so a
// rerun can never mix old and new output or delete anything. Same inputs give byte-identical output.
// Exits 1, having published nothing, if any input is missing or any check in verify-site.mjs fails.
// Failure modes: a missing/unreadable input, invalid JSON, no manager name, a comment the lexer cannot
// follow, or a privacy problem in the output. Recovery: fix the input or the allow-list and rerun into an
// empty folder. There is no retry: every step is local and deterministic.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import path from 'node:path';
import { COPIED } from './pages-site/allowlist.mjs';
import { sanitizeData, managerNames } from './pages-site/sanitize-data.mjs';
import { publishSource } from './pages-site/comment-names.mjs';
import { replacePublicNames } from './pages-site/public-wording.mjs';
import { verifySite } from './pages-site/verify-site.mjs';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES_FILE = 'command-center/sources/SOURCES.json';

/**
 * A copied JSON file (notes, draft guardrails, SOURCES): names become the published wording
 * (public-wording.mjs). The replacement words contain no quote or backslash, so the text stays valid
 * JSON; it is parsed again to prove it. In draft-guardrails.json this is a deliberate, visible change
 * ("email to the project owner"); the 71-page test checks it is the only one. SOURCES.json's `files[]`,
 * the only part the page reads, must come out unchanged.
 */
function publishJson(file, text) {
  const out = replacePublicNames(text);
  const parsed = JSON.parse(out);
  if (file === SOURCES_FILE && !isDeepStrictEqual(parsed.files, JSON.parse(text).files)) {
    throw new Error(`pages build: the published wording would change ${SOURCES_FILE} files[], which the page reads`);
  }
  return out;
}

async function assertEmpty(dir) {
  try {
    if ((await readdir(dir)).length > 0) throw new Error(`pages build: ${dir} is not empty; build into a new folder`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

/** Prepares every output file in memory first, then writes; returns the verifier's problem list. */
export async function buildSite(out, root = REPO_ROOT) {
  await assertEmpty(out);
  const names = await managerNames(root);
  const files = await sanitizeData(root);
  for (const f of COPIED) {
    const text = await readFile(path.join(root, f), 'utf8');
    files[f] = f.endsWith('.json') ? publishJson(f, text) : publishSource(f, text);
  }
  for (const [f, text] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(out, f)), { recursive: true });
    await writeFile(path.join(out, f), text);
  }
  return verifySite(out, root, names);
}

async function main() {
  const out = process.argv[2];
  if (!out) { console.error('usage: node scripts/build-pages-site.mjs <output-folder>'); process.exit(2); }
  const problems = await buildSite(path.resolve(out));
  if (problems.length) {
    console.error(JSON.stringify({ event: 'pages_build', outcome: 'failure', problems }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ event: 'pages_build', outcome: 'success', output: out }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(JSON.stringify({ event: 'pages_build', outcome: 'failure', error_class: err.name, message: err.message }));
    process.exit(1);
  });
}

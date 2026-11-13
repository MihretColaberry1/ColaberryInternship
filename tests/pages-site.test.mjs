// The GitHub Pages build (scripts/build-pages-site.mjs) publishes exactly the 37 allow-listed files, no
// names, record ids or emails, and a page that reads exactly as the repository's page does.
// Run from the repository root: node --test tests/pages-site.test.mjs
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildSite } from '../scripts/build-pages-site.mjs';
import { PUBLISHED, SANITIZED, MUST_NOT_PUBLISH } from '../scripts/pages-site/allowlist.mjs';
import { verifySite, listFiles, privacyProblems } from '../scripts/pages-site/verify-site.mjs';
import { NAME_PLACEHOLDER, CAPABILITY_FILE } from '../scripts/pages-site/sanitize-data.mjs';
import { jsCommentRanges, cssCommentRanges, withoutComments, publishSource } from '../scripts/pages-site/comment-names.mjs';
import { PROJECT_OWNER_NAMES, replacePublicNames } from '../scripts/pages-site/public-wording.mjs';
import { installFakeDom } from './fake-dom.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = async (f) => createHash('sha256').update(await readFile(f)).digest('hex');
let SITE;
let ORIGINAL_HASHES;

before(async () => {
  ORIGINAL_HASHES = await Promise.all([...SANITIZED, ...PUBLISHED].map((f) => sha(path.join(ROOT, f))));
  SITE = await mkdtemp(path.join(tmpdir(), 'cc-pages-'));
  const problems = await buildSite(SITE);
  assert.deepEqual(problems, [], 'the build reports no problems');
});

test('the output is exactly the 37 allow-listed files', async () => {
  assert.equal(PUBLISHED.length, 37);
  assert.deepEqual(await listFiles(SITE), [...PUBLISHED]);
});

test('no excluded file is in the output', async () => {
  const files = new Set(await listFiles(SITE));
  for (const f of MUST_NOT_PUBLISH) assert.equal(files.has(f), false, f);
  for (const f of files) assert.doesNotMatch(f, /snapshots\/|\.seed\.json$|connect\.txt$|profile\.json$|^docs\/|^tests\/|^\.github\//, f);
});

test('the verifier passes the built folder: allow-list, privacy scan and provenance hashes', async () => {
  assert.deepEqual(await verifySite(SITE, ROOT, []), []);
});

test('the privacy scan fails closed on each kind of leak, and allows the admin_users table name', () => {
  assert.equal(privacyProblems('a.json', '{"x":"5f0c1a2b-1111-4222-8333-944445555666"}').length, 1);
  assert.equal(privacyProblems('a.js', '// write to someone@example.com').length, 1);
  assert.equal(privacyProblems('a.js', '// as Ali Muwwakkil said').length, 1);
  assert.equal(privacyProblems('a.css', '/* Aleem asked */').length, 1);
  assert.equal(privacyProblems('a.json', '"has an org_members row"').length, 1);
  assert.equal(privacyProblems('a.json', '"names a manager"', ['Jane Example']).length, 0);
  assert.equal(privacyProblems('a.json', '"Jane Example agreed"', ['Jane Example']).length, 1);
  assert.deepEqual(privacyProblems('a.json', '"a scoped admin_users row"'), []);
});

test('the build never writes the repository: every original is byte for byte unchanged', async () => {
  assert.deepEqual(await Promise.all([...SANITIZED, ...PUBLISHED].map((f) => sha(path.join(ROOT, f)))), ORIGINAL_HASHES);
});

test('idempotent: a second build gives byte-identical output', async () => {
  const again = await mkdtemp(path.join(tmpdir(), 'cc-pages-'));
  assert.deepEqual(await buildSite(again), []);
  for (const f of PUBLISHED) assert.equal(await sha(path.join(again, f)), await sha(path.join(SITE, f)), f);
});

test('refuses a non-empty output folder, so old and new output can never mix', async () => {
  await assert.rejects(buildSite(SITE), /is not empty/);
});

test('a missing input stops the build before anything is written', async () => {
  const partial = await mkdtemp(path.join(tmpdir(), 'cc-pages-root-'));
  await mkdir(path.join(partial, '.colaberry'), { recursive: true });
  await copyFile(path.join(ROOT, '.colaberry/plan.json'), path.join(partial, '.colaberry/plan.json'));
  const out = await mkdtemp(path.join(tmpdir(), 'cc-pages-'));
  await assert.rejects(buildSite(out, partial), /ENOENT/);
  assert.deepEqual(await listFiles(out), []);
});

test('the public copies drop the fields the page never reads and say what was changed', async () => {
  const read = async (f) => JSON.parse(await readFile(path.join(SITE, f), 'utf8'));
  const plan = await read('.colaberry/plan.json');
  assert.ok(plan.stories.length > 0);
  assert.ok(plan.stories.every((s) => !('task_guidance' in s)));
  assert.deepEqual(Object.keys(await read('.colaberry/manifest.json')), ['_public_copy', 'generated_at']);
  const cap = await read(CAPABILITY_FILE);
  assert.equal(cap.accountable_human, NAME_PLACEHOLDER);
  assert.equal('manager_identity_id' in cap, false);
  assert.ok(cap.capabilities.every((c) => !('intended_users' in c)));
  const agent = (await read('.colaberry/agent-domain.json')).agent;
  assert.ok(agent.agent_id === null || agent.agent_id === '[present]');
  for (const f of SANITIZED) {
    const p = (await read(f))._public_copy;
    assert.equal(p.derived_from, f);
    assert.match(p.source_sha256, /^[0-9a-f]{64}$/);
    assert.ok(Array.isArray(p.transforms));
  }
});

test('published code and stylesheets differ from the originals only inside comments', async () => {
  for (const f of PUBLISHED.filter((x) => x.endsWith('.js') || x.endsWith('.css'))) {
    const orig = await readFile(path.join(ROOT, f), 'utf8');
    const pub = await readFile(path.join(SITE, f), 'utf8');
    const ranges = f.endsWith('.js') ? jsCommentRanges : cssCommentRanges;
    assert.equal(withoutComments(pub, ranges(pub)), withoutComments(orig, ranges(orig)), f);
  }
});

test('the comment lexer is not fooled by strings, templates or regular expressions', () => {
  const src = [
    "const a = 'Ali // not a comment';",
    'const b = `Aleem ${x /* inner Aleem */ + 1} // still text`;',
    'const c = /Ali\\/\\/[/]x/g.test(s); // Ali here',
    'const d = 4 / 2; /* Aleem block */',
  ].join('\n');
  const out = publishSource('x.js', src);
  assert.match(out, /'Ali \/\/ not a comment'/);
  assert.match(out, /`Aleem \$\{x \/\* inner the accountable manager \*\/ \+ 1\} \/\/ still text`/);
  assert.match(out, /\/Ali\\\/\\\/\[\/\]x\/g\.test\(s\); \/\/ the platform owner here/);
  assert.match(out, /4 \/ 2; \/\* the accountable manager block \*\//);
});

// ---- every reachable page, rendered from the original files and from the published copy ----

async function renderAll(codeRoot, dataRoot) {
  const imp = (p) => import(pathToFileURL(path.join(codeRoot, p)).href);
  const { SNAPSHOT_FILE, loadAgentDomainData } = await imp('command-center/agent-domain-data.js');
  const { AUTONOMY_STAGES } = await imp('command-center/authority.js');
  const { loadProjectData } = await imp('command-center/data.js');
  const { buildOverviewModel } = await imp('command-center/model.js');
  const { renderConsole, renderRoute } = await imp('command-center/console.js');
  const fetchImpl = async (url) => {
    if (url === SNAPSHOT_FILE) return { ok: false, status: 404, json: async () => null };
    try {
      const text = await readFile(path.join(dataRoot, url), 'utf8');
      return { ok: true, status: 200, json: async () => JSON.parse(text) };
    } catch (err) {
      if (err.code === 'ENOENT') return { ok: false, status: 404, json: async () => null };
      throw err;
    }
  };
  const domain = { status: 'loaded', ...(await loadAgentDomainData({ fetchImpl })) };
  const data = await loadProjectData({ fetchImpl });
  const project = { status: 'loaded', data, model: buildOverviewModel(data, new Date('2026-11-13T18:00:00Z')), error: null };
  const remove = installFakeDom();
  const text = (n) => [].concat(n).filter(Boolean).map((x) => (typeof x === 'string' ? x : x.textContent)).join(' ');
  const pages = new Map();
  try {
    pages.set('console', text(renderConsole(domain, project)));
    for (const c of domain.source.matrix.capabilities) pages.set(`capability ${c.capability_id}`, text(renderRoute(['capability', c.capability_id], domain, project)));
    for (const s of AUTONOMY_STAGES) pages.set(`rung ${s}`, text(renderRoute(['rung', s], domain, project)));
    for (const r of project.model.rows) pages.set(`story ${r.id}`, text(renderRoute(['story', r.id], domain, project)));
    for (const g of ['capture', 'requests', 'refresh']) pages.set(`guide ${g}`, text(renderRoute(['guide', g], domain, project)));
  } finally { remove(); }
  return pages;
}

/**
 * Every reachable page, compared word for word. A page may differ in one way only: the project owner's
 * name replaced by its published wording (public-wording.mjs, Mihret's decision of 2026-11-13). Any
 * other difference is unintended and fails, and so does a page that still shows the name.
 */
test('every reachable page reads the same from the published copy, apart from the published wording of the owner\'s name', async (t) => {
  const original = await renderAll(ROOT, ROOT);
  const published = await renderAll(SITE, SITE);
  assert.ok(original.size >= 71, `expected at least 71 pages, got ${original.size}`);
  assert.deepEqual([...published.keys()], [...original.keys()]);
  const owner = new RegExp(`\\b(?:${PROJECT_OWNER_NAMES.map(([n]) => n).join('|')})\\b`);
  const identical = []; const intentional = []; const unintended = [];
  for (const [page, words] of original) {
    const now = published.get(page);
    if (now === words) identical.push(page);
    else if (owner.test(words) && now === replacePublicNames(words)) intentional.push(page);
    else unintended.push(page);
    assert.doesNotMatch(now, owner, `${page} still shows the owner's name`);
  }
  t.diagnostic(`pages compared: ${original.size}; identical: ${identical.length}; intentional wording change: ${intentional.length} (${intentional.join(', ')}); unintended: ${unintended.length}`);
  assert.deepEqual(unintended, [], 'pages that differ in any other way');
  // Exactly the pages that showed the name changed, and nothing else did.
  assert.deepEqual(intentional, [...original].filter(([, w]) => owner.test(w)).map(([p]) => p));
  // The comparison is meaningful only if the sanitized copy really differs underneath.
  assert.notEqual(await sha(path.join(SITE, '.colaberry/plan.json')), await sha(path.join(ROOT, '.colaberry/plan.json')));
});

test('the published wording replaces whole names only, never the GitHub account in repository links', () => {
  assert.equal(replacePublicNames('email to Mihret asking'), 'email to the project owner asking');
  assert.equal(replacePublicNames("Mihret's decision"), "the project owner's decision");
  assert.equal(replacePublicNames('https://github.com/MihretColaberry1/ColaberryInternship'), 'https://github.com/MihretColaberry1/ColaberryInternship');
  assert.equal(replacePublicNames('as Ali Muwwakkil said'), 'as the platform owner said');
});

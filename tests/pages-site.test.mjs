// The GitHub Pages build (scripts/build-pages-site.mjs) publishes exactly the 43 allow-listed files, no
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
import { BINARY, PUBLISHED, SANITIZED, MUST_NOT_PUBLISH } from '../scripts/pages-site/allowlist.mjs';
import { verifySite, listFiles, privacyProblems } from '../scripts/pages-site/verify-site.mjs';
import { NAME_PLACEHOLDER, CAPABILITY_FILE, KEEP, PUBLIC_WORDING_TRANSFORM, publicWording } from '../scripts/pages-site/sanitize-data.mjs';
import { jsCommentRanges, cssCommentRanges, withoutComments, publishSource } from '../scripts/pages-site/comment-names.mjs';
import { PUBLIC_WORDING, replacePublicNames } from '../scripts/pages-site/public-wording.mjs';
import { readCapabilities, readSourcePaths } from '../command-center/agent-domain-data.js';
import {
  MANAGER_ACCESS_TEXT, accountableNames, isManagerAccessText, withholdNames,
} from '../command-center/agent-domain-redact.js';
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

test('the output is exactly the 43 allow-listed files', async () => {
  assert.equal(PUBLISHED.length, 43);
  assert.deepEqual(await listFiles(SITE), [...PUBLISHED]);
});

test('the three self-hosted fonts are published byte for byte, with their stylesheet and licences', async () => {
  assert.deepEqual([...BINARY].sort(), ['command-center/vendor/fonts/roboto-latin-400-normal.woff2',
    'command-center/vendor/fonts/roboto-latin-700-normal.woff2', 'command-center/vendor/fonts/roboto-mono-latin-400-normal.woff2']);
  for (const f of BINARY) assert.equal(await sha(path.join(SITE, f)), await sha(path.join(ROOT, f)), f);
  for (const f of ['command-center/vendor/fonts/fonts.css', 'command-center/vendor/fonts/LICENSE-Roboto.txt',
    'command-center/vendor/fonts/LICENSE-RobotoMono.txt']) assert.ok(PUBLISHED.includes(f), f);
  // A published font that differs from its original is refused.
  const broken = await mkdtemp(path.join(tmpdir(), 'cc-pages-'));
  assert.deepEqual(await buildSite(broken), []);
  const { writeFile } = await import('node:fs/promises');
  await writeFile(path.join(broken, BINARY[0]), 'not the font');
  assert.ok((await verifySite(broken, ROOT, [])).some((p) => p.startsWith(`${BINARY[0]}: not byte for byte`)));
});

test('Panel 5 keeps its source label, pending count and disclosure in the public copy', async () => {
  const pub = JSON.parse(await readFile(path.join(SITE, '.colaberry/agent-domain.json'), 'utf8'));
  const orig = JSON.parse(await readFile(path.join(ROOT, '.colaberry/agent-domain.json'), 'utf8'));
  assert.equal(pub.sources?.governance, orig.sources.governance);
  assert.equal(pub.governance?.pending, orig.governance.pending);
  assert.equal(pub.governance?.disclosure, orig.governance.disclosure);
});

// Criterion 1 (PR #1 at e9844af): Panels 2 to 4 read the platform's capability records. Without these
// fields the public copy would render them "Not available" while the build still passed.
test('Panels 2 to 4 keep the platform\'s capability records and their two routes in the public copy', async () => {
  const pub = JSON.parse(await readFile(path.join(SITE, '.colaberry/agent-domain.json'), 'utf8'));
  const orig = JSON.parse(await readFile(path.join(ROOT, '.colaberry/agent-domain.json'), 'utf8'));
  const fromPub = readCapabilities(pub);
  const fromOrig = readCapabilities(orig);
  assert.equal(fromPub.status, fromOrig.status);
  assert.equal(fromPub.size, fromOrig.size);
  // The synced capability text names the accountable manager (acceptance criteria such as "<name> signs
  // off ..."); the public copy withholds it with the page's own withholdNames(), as Panel 4 does on screen.
  const names = accountableNames(JSON.parse(await readFile(path.join(ROOT, CAPABILITY_FILE), 'utf8')));
  assert.ok(names.length > 0);
  const say = (x) => withholdNames(x, names);
  const expected = fromOrig.rows.map((r) => ({ ...r, name: say(r.name), release_behaviour: r.release_behaviour.map((b) => ({
    ...b, behaviour: say(b.behaviour), acceptance_criteria: say(b.acceptance_criteria) })) }));
  assert.deepEqual(fromPub.rows, publicWording(expected), 'the same rows the page reads, with names withheld');
  for (const n of names) assert.doesNotMatch(JSON.stringify(pub.capabilities), new RegExp(`\\b${n}\\b`), 'no manager name in the copy');
  assert.deepEqual(readSourcePaths(pub), readSourcePaths(orig));
  // Only the routes the page reads are kept; the others are dropped, as rule 1 requires.
  assert.deepEqual(Object.keys(pub.sources ?? {}).sort(), ['capabilities', 'capability_ladder', 'governance']
    .filter((k) => k in (orig.sources ?? {})));
  // Only the fields readCapabilities() checks, nothing else from each record.
  const allowed = new Set(KEEP['.colaberry/agent-domain.json'].filter((p) => p.startsWith('.capabilities[].'))
    .map((p) => p.split('.')[2].replace('[]', '')));
  for (const c of pub.capabilities ?? []) for (const k of Object.keys(c)) assert.ok(allowed.has(k), `capabilities[].${k} is not read`);
});

test('the public data copies carry no listed name: plan narratives get the published wording', async () => {
  const named = new RegExp(`\\b(?:${PUBLIC_WORDING.map(([n]) => n.replace(/\s+/g, '\\s+')).join('|')})\\b`);
  for (const f of SANITIZED) {
    const text = await readFile(path.join(SITE, f), 'utf8');
    assert.doesNotMatch(text, named, `${f} shows a name`);
    assert.ok(JSON.parse(text)._public_copy.transforms.includes(PUBLIC_WORDING_TRANSFORM), `${f} says the wording was applied`);
  }
  // Every original narrative that names the platform owner is published with the role instead.
  const plan = JSON.parse(await readFile(path.join(ROOT, '.colaberry/plan.json'), 'utf8'));
  const pubPlan = JSON.parse(await readFile(path.join(SITE, '.colaberry/plan.json'), 'utf8'));
  const byId = new Map(pubPlan.stories.map((s) => [s.id, s]));
  for (const s of plan.stories.filter((x) => /\bAli\b/.test(x.narrative ?? ''))) {
    assert.match(byId.get(s.id).narrative, /the platform owner/, s.id);
  }
});

test('the published wording changes string values only, never keys, numbers or the GitHub account', () => {
  const input = { Ali: 'Ali owes you a screen', n: 3, ok: true, none: null,
    list: ['as Ali Muwwakkil said', { url: 'https://github.com/MihretColaberry1/ColaberryInternship', who: 'Mihret' }] };
  assert.deepEqual(publicWording(input), { Ali: 'the platform owner owes you a screen', n: 3, ok: true, none: null,
    list: ['as the platform owner said', { url: 'https://github.com/MihretColaberry1/ColaberryInternship', who: 'the project owner' }] });
  assert.equal(input.Ali, 'Ali owes you a screen', 'the input is not changed');
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
  // Flattened all the way down (2026-11-24): a story page returns nested arrays, and a one-level flatten
  // read their inner nodes as empty, so the story narratives were never compared.
  const text = (n) => [n].flat(Infinity).filter(Boolean).map((x) => (typeof x === 'string' ? x : x.textContent)).join(' ');
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
 * Every reachable page, compared line by line. A published line may differ from the repository's in
 * three ways only, each of them the published copy withholding more than the page does on its own:
 *   1. names: a listed name replaced by its published wording (public-wording.mjs). The project owner's
 *      name since Mihret's decision of 2026-11-13; since 2026-11-24 also a staff name the page's own
 *      redaction does not withhold (the platform plan narratives name the platform owner).
 *   2. account records: a narrative line describing the accountable manager's account access becomes
 *      the page's neutral sentence (sanitize-data.mjs, decision D4, in place since 2026-11-13).
 *   3. capitals: "the accountable manager" capitalised where the sanitizer's withholdNames() sees a
 *      sentence start before the page strips the line's markup.
 * Until 2026-11-24 this test flattened each page one level only, so story pages' narratives were never
 * compared and rules 2 and 3 went unseen. Any other difference is unintended and fails, and so does a
 * published page that still shows a listed name. A line rewritten by rule 2 must not itself be
 * account-access text (the admin_users table name elsewhere, as in a capability's own text, is allowed,
 * as the privacy scan allows it).
 */
test('every reachable page reads the same from the published copy, apart from names and account records withheld', async (t) => {
  const original = await renderAll(ROOT, ROOT);
  const published = await renderAll(SITE, SITE);
  assert.ok(original.size >= 71, `expected at least 71 pages, got ${original.size}`);
  assert.deepEqual([...published.keys()], [...original.keys()]);
  const named = new RegExp(`\\b(?:${PUBLIC_WORDING.map(([n]) => n.replace(/\s+/g, '\\s+')).join('|')})\\b`);
  const manager = (s) => s.replace(/\b[Tt]he accountable manager\b/g, 'the accountable manager');
  const lineOk = (was, now) => replacePublicNames(was) === now
    || (isManagerAccessText(was) && now.includes(MANAGER_ACCESS_TEXT) && !isManagerAccessText(now))
    || manager(replacePublicNames(was)) === manager(now);
  const identical = []; const names = []; const withheld = []; const unintended = [];
  for (const [page, words] of original) {
    const now = published.get(page);
    const was = words.split('\n'); const is = now.split('\n');
    if (now === words) identical.push(page);
    else if (now === replacePublicNames(words)) names.push(page);
    else if (was.length === is.length && was.every((l, i) => lineOk(l, is[i]))) withheld.push(page);
    else unintended.push(page);
    assert.doesNotMatch(now, named, `${page} still shows a name the published copy must not show`);
  }
  t.diagnostic(`pages compared: ${original.size}; identical: ${identical.length}; names only: ${names.length} (${names.join(', ')}); names and account records withheld: ${withheld.length}; unintended: ${unintended.length}`);
  assert.deepEqual(unintended, [], 'pages that differ in any other way');
  // Every page that showed a name changed.
  for (const [p, w] of original) if (named.test(w)) assert.ok(!identical.includes(p), `${p} showed a name and did not change`);
  // The comparison is meaningful only if the sanitized copy really differs underneath.
  assert.notEqual(await sha(path.join(SITE, '.colaberry/plan.json')), await sha(path.join(ROOT, '.colaberry/plan.json')));
});

test('the published wording replaces whole names only, never the GitHub account in repository links', () => {
  assert.equal(replacePublicNames('email to Mihret asking'), 'email to the project owner asking');
  assert.equal(replacePublicNames("Mihret's decision"), "the project owner's decision");
  assert.equal(replacePublicNames('https://github.com/MihretColaberry1/ColaberryInternship'), 'https://github.com/MihretColaberry1/ColaberryInternship');
  assert.equal(replacePublicNames('as Ali Muwwakkil said'), 'as the platform owner said');
});

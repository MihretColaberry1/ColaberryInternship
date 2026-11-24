// Name redaction fails closed (Mihret's decision, 2026-11-23). Blocker text and governance request titles
// are shown only after they have been checked against the list of names this public page withholds
// (the pinned file's accountable_human). When that list is missing, empty or fails to load, the text is
// withheld, and says so, rather than shown as it is. The real file's blockers that name the manager are all
// also caught by the access-text rule, so these tests add one that is not: the case the old code leaked.
// Run from the repository root: node --test tests/redaction-fail-closed.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { installFakeDom, findAll } from './fake-dom.mjs';
import { CAPABILITY_FILE, PLATFORM_SYNC_FILE, SNAPSHOT_FILE, loadAgentDomainData } from '../command-center/agent-domain-data.js';
import { BLOCKER_WITHHELD, MANAGER_ACCESS_TEXT, publicBlockerText } from '../command-center/agent-domain-redact.js';
import { TITLE_WITHHELD } from '../command-center/panel-governance.js';
import { consoleInputs, renderPanels, renderRoute } from '../command-center/console.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (f) => JSON.parse(await readFile(path.join(ROOT, f), 'utf8'));
const NAME = /Aleem|Mohammed/;

/** Repository files from disk; `over` maps a file to replacement JSON, or to a status number to answer with. */
function diskFetch(over = {}) {
  return async (url) => {
    if (url === SNAPSHOT_FILE) return { ok: false, status: 404, json: async () => null };
    if (Object.hasOwn(over, url)) {
      const v = over[url];
      if (typeof v === 'number') return { ok: false, status: v, json: async () => null };
      if (v === 'not-json') return { ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token'); } };
      return { ok: true, status: 200, json: async () => structuredClone(v) };
    }
    const text = await readFile(path.join(ROOT, url), 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(text) };
  };
}
const load = async (over) => ({ status: 'loaded', ...(await loadAgentDomainData({ fetchImpl: diskFetch(over) })) });

function withDom(fn) {
  const remove = installFakeDom();
  try { return fn(); } finally { remove(); }
}
const text = (out) => [out].flat(Infinity).map((n) => n?.textContent ?? '').join('');

/** The real pinned file, with one blocker that names the manager in words the access-text rule does not catch. */
async function pinnedWithNamedBlocker(edit = (p) => p) {
  const p = await readJson(CAPABILITY_FILE);
  const probe = `Waiting on ${p.accountable_human} to choose the exception list`;
  p.capabilities[0].blocked_by = [...p.capabilities[0].blocked_by, probe];
  return { pinned: edit(p), id: p.capabilities[0].capability_id };
}

test('publicBlockerText withholds a blocker that names someone when the name list is missing, empty or not an array', () => {
  const named = 'Waiting on Pat Q Example to choose the exception list';
  for (const names of [undefined, null, [], '', 'Pat Q Example']) {
    assert.equal(publicBlockerText(named, names), BLOCKER_WITHHELD, JSON.stringify(names));
  }
  // With the list, the name is replaced and the rest of the blocker is kept.
  assert.equal(publicBlockerText(named, ['Pat Q Example']), 'Waiting on the accountable manager to choose the exception list');
  // The access sentence names no one, so it is still shown with or without the list.
  assert.equal(publicBlockerText('needs an admin_users row for the manager', []), MANAGER_ACCESS_TEXT);
});

test('missing name list (no accountable_human): the capability page withholds the named blocker and shows no name', async () => {
  const { pinned, id } = await pinnedWithNamedBlocker((p) => { delete p.accountable_human; return p; });
  const domain = await load({ [CAPABILITY_FILE]: pinned });
  const page = withDom(() => text(renderRoute(['capability', id], domain, null)));
  assert.doesNotMatch(page, NAME);
  assert.ok(page.includes(BLOCKER_WITHHELD));
});

test('empty name list (accountable_human is blank): every capability page withholds instead of naming anyone', async () => {
  const { pinned, id } = await pinnedWithNamedBlocker((p) => ({ ...p, accountable_human: '   ' }));
  const domain = await load({ [CAPABILITY_FILE]: pinned });
  const json = await readJson(PLATFORM_SYNC_FILE);
  for (const c of json.capabilities) {
    const page = withDom(() => text(renderRoute(['capability', c.capability_id], domain, null)));
    assert.doesNotMatch(page, NAME, c.capability_id);
  }
  assert.ok(withDom(() => text(renderRoute(['capability', id], domain, null))).includes(BLOCKER_WITHHELD));
});

test('failed name-list load (pinned file answers 500, or is not JSON): blockers are not available and no name appears', async () => {
  for (const failure of [500, 'not-json']) {
    const domain = await load({ [CAPABILITY_FILE]: failure });
    assert.equal(domain.source.status, 'error', String(failure));
    const json = await readJson(PLATFORM_SYNC_FILE);
    const page = withDom(() => text(renderRoute(['capability', json.capabilities[0].capability_id], domain, null)));
    assert.doesNotMatch(page, NAME, String(failure));
    assert.match(page, /Blocked byNot available: the pinned source file did not load/, String(failure));
  }
});

test('with the name list, the same named blocker is shown with the name replaced, so the fix withholds only when it must', async () => {
  const { pinned, id } = await pinnedWithNamedBlocker();
  const domain = await load({ [CAPABILITY_FILE]: pinned });
  const shown = withDom(() => text(renderRoute(['capability', id], domain, null)));
  assert.doesNotMatch(shown, NAME);
  assert.ok(shown.includes('Waiting on the accountable manager to choose the exception list'));
  assert.ok(!shown.includes(BLOCKER_WITHHELD));
});

test('no rendered blocker text names the accountable manager, in any name-list state', async () => {
  const states = {
    loaded: await pinnedWithNamedBlocker(),
    missing: await pinnedWithNamedBlocker((p) => { delete p.accountable_human; return p; }),
    empty: await pinnedWithNamedBlocker((p) => ({ ...p, accountable_human: '' })),
  };
  const json = await readJson(PLATFORM_SYNC_FILE);
  for (const [state, { pinned }] of Object.entries(states)) {
    const domain = await load({ [CAPABILITY_FILE]: pinned });
    for (const c of json.capabilities) {
      const blockers = withDom(() => {
        const out = renderRoute(['capability', c.capability_id], domain, null);
        return findAll(out, (el) => el.tagName === 'LI').map((li) => li.textContent).join('\n');
      });
      assert.doesNotMatch(blockers, NAME, `${state}: ${c.capability_id}`);
    }
  }
});

test('Panel 5: a request title that cannot be checked for names reads "withheld", not "not captured"; an absent title is still "not captured"', async () => {
  const json = await readJson(PLATFORM_SYNC_FILE);
  const pinned = await readJson(CAPABILITY_FILE);
  const sync = structuredClone(json);
  sync.governance.requests = [
    { kind: 'tool', status: 'submitted', title: `Grant contrast_calculator for ${pinned.accountable_human}`, requested_at: '2026-11-20T15:00:00Z' },
    { kind: 'change', status: 'approved', title: null, requested_at: '2026-11-19T15:00:00Z', approved_at: '2026-11-20T15:00:00Z' },
  ];
  const titleCells = (domain) => withDom(() => {
    const gov = renderPanels(consoleInputs(domain), null).governance;
    return findAll(gov, (el) => el.tagName === 'TR').map((tr) => findAll(tr, (el) => el.tagName === 'TD')[0]?.textContent).filter(Boolean);
  });
  // No name list (the pinned file did not load).
  const without = titleCells(await load({ [PLATFORM_SYNC_FILE]: sync, [CAPABILITY_FILE]: 404 }));
  assert.ok(without.includes(TITLE_WITHHELD), without.join(' | '));
  assert.ok(without.includes('not captured'), 'a title the platform did not send is still "not captured"');
  for (const t of without) assert.doesNotMatch(t, NAME);
  assert.equal(without.filter((t) => t === 'not captured').length, 1, 'only the absent title is "not captured"');
  // With the name list: the title is shown, with the name replaced.
  const withNames = titleCells(await load({ [PLATFORM_SYNC_FILE]: sync }));
  assert.ok(withNames.includes('Grant contrast_calculator for the accountable manager'), withNames.join(' | '));
  for (const t of withNames) assert.doesNotMatch(t, NAME);
});

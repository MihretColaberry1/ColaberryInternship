// Shared setup for the design-review tests: a throwaway git repository built from the fixtures,
// a realised rules pack pinned to its commit, and a hash of every file in a folder.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(ROOT, 'tests', 'fixtures', 'design-review');
export const CLI = path.join(ROOT, 'review', 'review-page.mjs');

const git = (repo, ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();

/** A temp workspace holding a fixture repo (one commit) and a pack pinned to that commit. */
export function makeWorkspace() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'design-review-'));
  const repo = path.join(dir, 'repo');
  cpSync(path.join(FIXTURES, 'repo'), repo, { recursive: true });
  git(dir, 'init', '-q', repo);
  git(repo, 'config', 'user.email', 'fixture@example.test');
  git(repo, 'config', 'user.name', 'Fixture');
  git(repo, 'config', 'core.autocrlf', 'false');
  git(repo, 'add', '.');
  git(repo, 'commit', '-q', '-m', 'fixture');
  const commit = git(repo, 'rev-parse', 'HEAD');
  const pack = writePack(dir, 'pack.json', (p) => p, commit);
  return { dir, repo, commit, pack, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/** Writes a copy of the fixture pack, pinned to `commit`, after applying `edit`. */
export function writePack(dir, name, edit, commit) {
  const pack = JSON.parse(readFileSync(path.join(FIXTURES, 'fixture.rules.json'), 'utf8'));
  pack.source_commit = commit;
  const file = path.join(dir, name);
  writeFileSync(file, JSON.stringify(edit(pack), null, 2));
  return file;
}

/** Commits a change to one file and returns the new commit SHA. */
export function commitChange(repo, file, transform) {
  const full = path.join(repo, file);
  writeFileSync(full, transform(readFileSync(full, 'utf8')));
  git(repo, 'commit', '-q', '-am', 'change');
  return git(repo, 'rev-parse', 'HEAD');
}

/** Runs the CLI in a child process and returns its exit code and parsed output lines. */
export function runCli(args) {
  const r = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd: ROOT, timeout: 60_000 });
  const parse = (s) => (s.trim() ? JSON.parse(s.trim().split('\n').pop()) : null);
  return { code: r.status, out: r.status === 0 ? parse(r.stdout) : null, err: r.status === 1 ? parse(r.stderr) : r.stderr };
}

/** SHA-256 over the relative path and bytes of every file under `dir`, .git included. */
export function treeHash(dir) {
  const h = createHash('sha256');
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else h.update(path.relative(dir, p)).update('\0').update(readFileSync(p)).update('\0');
    }
  };
  walk(dir);
  return h.digest('hex');
}

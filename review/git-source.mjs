// Read-only access to the reviewed repository. Every read goes through `git` at a pinned commit,
// so the working tree is never checked out, touched or written.
//
// Failure handling:
// - Each git call has a 10 s timeout and is run with an argument array (no shell string).
// - There is no retry. These are local reads: one that fails will fail the same way again, so the
//   run stops with a named error class rather than looping.
// - `--no-optional-locks` stops git from refreshing the index as a side effect of a read.
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';

const GIT_TIMEOUT_MS = 10_000;
const MAX_BUFFER = 32 * 1024 * 1024;

export class ReviewError extends Error {
  constructor(errorClass, message) {
    super(message);
    this.errorClass = errorClass;
  }
}

function git(repo, args) {
  try {
    return execFileSync('git', ['--no-optional-locks', '-C', repo, ...args], {
      encoding: 'utf8', timeout: GIT_TIMEOUT_MS, maxBuffer: MAX_BUFFER, stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    if (err.code === 'ETIMEDOUT' || err.signal === 'SIGTERM') {
      throw new ReviewError('TimeoutError', `git ${args[0]} did not finish within ${GIT_TIMEOUT_MS} ms`);
    }
    const detail = String(err.stderr ?? err.message).split('\n')[0].trim();
    throw new ReviewError('GitReadError', `git ${args[0]} failed: ${detail}`);
  }
}

/** The repository's top-level folder, as a real path. */
export function repoRoot(repo) {
  const top = git(repo, ['rev-parse', '--show-toplevel']).trim();
  return realpathSync(top);
}

/** Resolves any revision to a full commit SHA, so the report always names an exact commit. */
export function resolveCommit(repo, rev) {
  if (typeof rev !== 'string' || !/^[0-9a-fA-F]{7,40}$/.test(rev)) {
    throw new ReviewError('ValidationError', 'commit must be a 7 to 40 character hex SHA, not a branch or tag name');
  }
  try {
    return git(repo, ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`]).trim();
  } catch (err) {
    if (err instanceof ReviewError && err.errorClass === 'GitReadError') {
      throw new ReviewError('CommitNotFound', `commit ${rev} does not exist in this repository`);
    }
    throw err;
  }
}

/**
 * Checks a page path before it is used: relative, no `.` or `..` segments, one .tsx or .jsx file.
 * Returns it normalised to forward slashes.
 */
export function checkPagePath(page) {
  if (typeof page !== 'string' || page.trim() === '') {
    throw new ReviewError('ValidationError', 'page path is required');
  }
  if (path.isAbsolute(page) || /^[A-Za-z]:/.test(page) || /^[\\/]/.test(page)) {
    throw new ReviewError('PathRefused', `page path must be relative to the repository: ${page}`);
  }
  const parts = page.split(/[\\/]+/);
  if (parts.some((p) => p === '..' || p === '.' || p === '')) {
    throw new ReviewError('PathRefused', `page path may not contain "." or ".." segments: ${page}`);
  }
  if (!/\.(tsx|jsx)$/.test(page)) {
    throw new ReviewError('PathRefused', `this prototype reviews one .tsx or .jsx file only: ${page}`);
  }
  return parts.join('/');
}

/** The blob id of a file at a commit, or a PageNotFound error naming the path. */
export function blobId(repo, commit, file) {
  let type;
  try {
    type = git(repo, ['cat-file', '-t', `${commit}:${file}`]).trim();
  } catch (err) {
    if (err instanceof ReviewError && err.errorClass === 'GitReadError') {
      throw new ReviewError('PageNotFound', `${file} was not found at commit ${commit.slice(0, 8)}. Check the path and try again.`);
    }
    throw err;
  }
  if (type !== 'blob') throw new ReviewError('PathRefused', `${file} is a ${type}, not a file`);
  return git(repo, ['rev-parse', `${commit}:${file}`]).trim();
}

/** The text of a file at a commit, read by blob id. */
export function readAt(repo, commit, file) {
  return git(repo, ['cat-file', 'blob', blobId(repo, commit, file)]);
}

/** Refuses an output folder that is the reviewed repository or sits inside it. */
export function checkOutsideRepo(root, outDir) {
  const out = path.resolve(outDir);
  const norm = (p) => (process.platform === 'win32' ? p.toLowerCase() : p);
  const rootN = norm(root.endsWith(path.sep) ? root : root + path.sep);
  if (norm(out + path.sep).startsWith(rootN)) {
    throw new ReviewError('OutputRefused', `output folder must be outside the reviewed repository: ${out}`);
  }
  return out;
}

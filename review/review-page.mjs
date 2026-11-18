// Design review prototype: reviews ONE page file at a pinned commit against a rules pack and writes
// a report outside the reviewed repository. It never edits, commits or deploys anything.
//
// Usage (from this repository's root):
//   node review/review-page.mjs --repo <path> --commit <sha> --page <relative path> \
//     --rules review/rules/admin-portal.draft.rules.json --out <folder outside the repo>
//
// Exit codes: 0 report written, 1 refused or failed (a JSON error line on stderr), 2 bad usage.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ReviewError, blobId, checkOutsideRepo, checkPagePath, readAt, repoRoot, resolveCommit } from './git-source.mjs';
import { loadPack } from './rules.mjs';
import { readTags, stripComments } from './jsx-tags.mjs';
import { tokenIndex } from './tokens.mjs';
import { colourFindings } from './checks-colour.mjs';
import { markupFindings } from './checks-a11y.mjs';
import { buildReport, renderMarkdown } from './report.mjs';

export const CHECKS = [
  'hex_in_inline_style', 'hardcoded_hex', 'form_control_label', 'img_alt', 'click_on_non_button',
  'icon_button_name', 'alert_announcement', 'spinner_live_region', 'heading_order', 'modal_dialog_role',
];

function relativeImports(stripped) {
  const specs = [...stripped.matchAll(/^\s*import\s+(?:[^'"]*?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/gm)].map((m) => m[1]);
  return [...new Set(specs)].sort();
}

function enrich(raw, src, rulesByCheck, page, ruleStatus) {
  return raw
    .filter((f) => rulesByCheck.has(f.check))
    .map((f) => {
      const rule = rulesByCheck.get(f.check);
      const column = f.offset - (src.lastIndexOf('\n', f.offset - 1) + 1) + 1;
      // A tag that spans lines is shown whole (whitespace collapsed), not just its first line.
      const lineText = src.split(/\r?\n/)[f.line - 1].trim();
      const tagText = f.end ? src.slice(f.offset, f.end).replace(/\s+/g, ' ') : '';
      const snippet = (tagText.length > lineText.length ? tagText : lineText).slice(0, 200);
      return {
        id: `${rule.id}@${f.line}:${column}`,
        rule_id: rule.id,
        rule_title: rule.title,
        rule_status: ruleStatus,
        status: f.status,
        file: page,
        line: f.line,
        column,
        snippet,
        rationale: f.rationale,
        suggestion: f.suggestion,
        sources: rule.sources,
        cited_wcag: rule.cited_wcag ?? null,
        notes: [...f.notes, ...(rule.scope_note ? [rule.scope_note] : [])],
        severity: null,
      };
    })
    .sort((a, b) => a.line - b.line || a.column - b.column || Number(a.rule_id.slice(1)) - Number(b.rule_id.slice(1)));
}

/** Runs one review. Returns the report and the paths it wrote. Throws ReviewError on refusal. */
export function runReview({ repo, commit, page, rules, out }) {
  for (const [k, v] of Object.entries({ repo, commit, page, rules, out })) {
    if (typeof v !== 'string' || !v) throw new ReviewError('ValidationError', `--${k} is required`);
  }
  let root;
  try {
    root = repoRoot(repo);
  } catch (err) {
    throw new ReviewError('RepoNotFound', `${repo} is not a git repository (${err.message})`);
  }
  const outDir = checkOutsideRepo(root, out);
  const file = checkPagePath(page);
  const sha = resolveCommit(root, commit);
  const blob = blobId(root, sha, file);
  const { pack, sha256, sourceCommit } = loadPack(rules, root, CHECKS);

  const src = readAt(root, sha, file);
  const stripped = stripComments(src);
  const { tags, lineAt } = readTags(stripped);
  const tokens = tokenIndex(readAt(root, sourceCommit, pack.token_file));
  const rulesByCheck = new Map(pack.rules.map((r) => [r.check, r]));
  const findings = enrich([...colourFindings({ stripped, tags, lineAt, tokens }), ...markupFindings({ stripped, tags })], src, rulesByCheck, file,
    pack.approval.state === 'approved' ? 'approved' : 'draft_unapproved');

  const report = buildReport({
    target: { page: file, commit: sha, blob },
    pack, packSha256: sha256, sourceCommit, findings,
    elementCount: tags.filter((t) => t.kind === 'open').length,
    imports: relativeImports(stripped),
  });
  mkdirSync(outDir, { recursive: true });
  const base = path.basename(file).replace(/\.(tsx|jsx)$/, '');
  const jsonPath = path.join(outDir, `${base}.review.json`);
  const mdPath = path.join(outDir, `${base}.review.md`);
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(mdPath, renderMarkdown(report));
  return { report, jsonPath, mdPath };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!/^--(repo|commit|page|rules|out)$/.test(key) || argv[i + 1] === undefined) return null;
    args[key.slice(2)] = argv[i + 1];
  }
  return args;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    process.stderr.write('usage: node review/review-page.mjs --repo <path> --commit <sha> --page <relative path> --rules <pack.json> --out <folder>\n');
    process.exit(2);
  }
  try {
    const { report, jsonPath, mdPath } = runReview(args);
    process.stdout.write(`${JSON.stringify({ outcome: report.outcome.code, ...report.summary, json: jsonPath, markdown: mdPath })}\n`);
  } catch (err) {
    const errorClass = err instanceof ReviewError ? err.errorClass : 'UnexpectedError';
    process.stderr.write(`${JSON.stringify({ error_class: errorClass, message: err.message })}\n`);
    process.exit(1);
  }
}

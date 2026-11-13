// The GitHub Pages publishing allow-list for the Command Center demo (branch command-center-pages).
// Exactly these 37 paths are published; the build fails if the output holds one more or one fewer.
// Nothing is published by folder or by pattern, so a file added to the repository later is never
// published by accident: it has to be added here, in a reviewed change.

/** Copied byte for byte, except that names become the published wording (public-wording.mjs): in comments of JS and CSS, and in the text of the copied JSON files. */
export const COPIED = Object.freeze([
  'index.html',
  'command-center/agent-domain-data.js',
  'command-center/agent-domain-facts.js',
  'command-center/agent-domain-model.js',
  'command-center/agent-domain-redact.js',
  'command-center/agent-domain-ui.js',
  'command-center/app.js',
  'command-center/authority.js',
  'command-center/console-ui.js',
  'command-center/console.js',
  'command-center/data.js',
  'command-center/details.js',
  'command-center/dom.js',
  'command-center/model-tabs.js',
  'command-center/model.js',
  'command-center/panel-behaviour.js',
  'command-center/panel-employee.js',
  'command-center/panel-gaps.js',
  'command-center/panel-governance.js',
  'command-center/panel-inventory.js',
  'command-center/panel-ladder.js',
  'command-center/project-sections.js',
  'command-center/ui.js',
  'command-center/verification-model.js',
  'command-center/styles.css',
  'command-center/vendor/colaberry-ds/LICENSE',
  'command-center/vendor/colaberry-ds/tokens/colors.css',
  'command-center/vendor/colaberry-ds/tokens/spacing.css',
  'command-center/vendor/colaberry-ds/tokens/typography.css',
  'command-center/notes.json',
  'command-center/draft-guardrails.json',
  // The page reads only its files[]; names in its documentation strings are reworded (see build).
  'command-center/sources/SOURCES.json',
]);

/** Rewritten as public copies: only the fields the page reads, with names and record ids withheld. */
export const SANITIZED = Object.freeze([
  '.colaberry/plan.json',
  '.colaberry/progress.json',
  '.colaberry/manifest.json',
  '.colaberry/agent-domain.json',
  'command-center/sources/product_experience.capabilities.json',
]);

export const PUBLISHED = Object.freeze([...COPIED, ...SANITIZED].sort());

/**
 * Files that exist in the repository (or could, such as a captured snapshot) and must never be
 * served. The build checks none of them is in the output; the post-deploy check expects a 404 for each.
 */
export const MUST_NOT_PUBLISH = Object.freeze([
  '.colaberry/connect.txt',
  '.colaberry/profile.json',
  '.colaberry/plan.seed.json',
  '.colaberry/progress.seed.json',
  '.colaberry/profile.seed.json',
  'command-center/snapshots/product_experience.endpoint-snapshots.json',
  'README.md',
  'CLAUDE.md',
  'docs/stories/STORY-000.md',
  'docs/evidence/traceability.md',
  'docs/BRD/architecture-status.md',
  'docs/definitions/design_token_drift_audit.R0.md',
  'tests/console.test.mjs',
  'tests/pages-site.test.mjs',
  'scripts/build-pages-site.mjs',
  '.github/workflows/command-center-pages.yml',
  '.gitignore',
]);

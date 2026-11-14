# product_experience.CAP.design_token_drift_audit.L4-AGENT-WATCHED — Design-token drift audit across every styled surface · 4 · agent does it, watched

**Let the agent do it at its starting rung, with a human approving every run.**

Only start this once step 3 has a recorded decision and the tool exists. The agent now does the capability at **R0**, its own starting rung, with a named human approving every single run before it takes effect.

**The behaviour to reach**
Writes the audit definition: what counts as a violation, which surfaces are in scope, which raw-colour cases are legitimate, and who decides a token-set gap.

**How it is judged**
Mohammed Abdul Aleem signs off a written scope and exception list; no scan has run against the repo yet.

**Measure it against your run log, not against a feeling.** Same inputs, same outcome, and the exceptions from step 1 handled the way you handled them. A run that differs is evidence, and it belongs in the record whether or not it is convenient.

**This capability's ceiling is autonomy:R5.** Detection and reporting have no customer-visible effect, so shadow mode against a human-reviewed reference inventory (autonomy:R5) is the honest ceiling. It stops below autonomy:R6/autonomy:R7 because the remediation this audit proposes repaints the product, and repainting the product is a brand decision a human makes.

Higher rungs are not part of this story and are not tasks. A rung is earned by a named human on evidence, after this one is working and has a record behind it.

**When this passes, the capability is done and the next one starts.** One at a time is the point: pick the next capability with your manager and open its step 1.

**Release:** autonomy:R0 · Legacy migration plan (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Design-token drift audit across every styled surface · R0
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.design_token_drift_audit`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** absent · **Source:** existing_application
## The business outcome
One list of every place the UI paints a colour or spacing value outside the token contract, so brand drift is a measured number that can be driven down instead of an impression.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Build the token set from the whole cascade, in load order, not from tokens.css alone: global.css imports tokens.css (101 custom properties in the :root block at tokens.css:6), then brand-bridge.css redefines 21 of them on :root and is imported AFTER it in index.tsx, then those point at the colaberry token layer. The resolved value is what the audit compares against; tokens.css alone reports the wrong value for 19 of the 21.
- Walk frontend/src and record every raw hex, rgb()/rgba() and inline style={{ }} occurrence with file and line.
- Classify each occurrence: has an exact token equivalent, has a near equivalent, or has none.
- Exclude allow-listed cases; any occurrence the classifier cannot categorise is reported as unclassified, never as a pass.
- Emit the inventory plus a proposed diff for the exact-equivalent cases only.
- Hand the diff to a human. The agent does not merge it.
**Inputs**
- frontend/src/**/*.tsx
- frontend/src/**/*.css
- frontend/src/styles/tokens.css as the token contract
- an agreed allow-list of legitimate raw-colour cases (e.g. brand marks, chart scales)
**Outputs**
- ranked violation inventory by file with line numbers
- per-token substitution proposal (raw value -> var(--token))
- a drift count that can be ratcheted, in the shape of the existing copy-lint baseline
- unknown values left as unknown where a raw colour has no token equivalent
**Exceptions that must be handled**
- A raw colour with no token equivalent is a token-set gap, not a code defect, and is escalated as a design decision rather than auto-substituted.
- Chart and data-visualisation scales may legitimately carry their own ramp; the dataviz palette is governed separately and must be excluded or the audit will produce noise.
- Third-party or vendored CSS under apps/*/src/assets/design is owned upstream (design-system-sync.yml) and must not be rewritten here.
- An occurrence inside a code sample or documentation string is not a styling violation.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- css_token_parser
- typescript_ast_scan
- report_renderer
**Application surfaces**
- all 445 route-reachable pages measured 2026-10-09; the audit is surface-wide rather than per-page
**Source modules**
- frontend/src/styles/tokens.css
- frontend/src/styles/global.css
- frontend/src/styles/brand-bridge.css
- frontend/src/styles/admin-shell.css
- frontend/src/styles/agentDetailV2.css
- frontend/src/styles/orchestration.css
- frontend/src/styles/rungTones.css
**Dependencies**
- read access to the frontend source tree
- an agreed allow-list, which does not exist yet
- a resolver for the three-layer token cascade (tokens.css, then brand-bridge.css, then the colaberry token layer), because no single file is the token authority at runtime
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: Detection and reporting have no customer-visible effect, so shadow mode against a human-reviewed reference inventory (autonomy:R5) is the honest ceiling. It stops below autonomy:R6/autonomy:R7 because the remediation this audit proposes repaints the product, and repainting the product is a brand decision a human makes.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**This story is one rung: autonomy:R0**
Writes the audit definition: what counts as a violation, which surfaces are in scope, which raw-colour cases are legitimate, and who decides a token-set gap.

Acceptance: Mohammed Abdul Aleem signs off a written scope and exception list; no scan has run against the repo yet.

**Satisfying this does not promote anything.** It makes autonomy:R0 *eligible*. A named human promotes the capability one step, on this evidence. Story completion, elapsed time, a conversation that went well and a passing mocked test are all recorded as non-promoting signals, so none of them moves the rung.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no agreed raw-colour allow-list exists, so the first run's true violation count is unknown: measured 2026-10-09 there are 4,492 hex literals in frontend/src/**/*.tsx, 1,778 in CSS other than tokens.css, 488 rgb()/rgba() literals and 8,219 inline style={{ }} occurrences, and the legitimate share of those is unknown until the manager sets the exceptions
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- frontend/src/styles/tokens.css:6
- frontend/CLAUDE.md:35
- frontend/CLAUDE.md:41
- .claude/skills/baseline-ui/SKILL.md:19
- .claude/skills/frontend-design/SKILL.md:155
- frontend/src/pages/admin/orchestration/studio/studioKit.tsx:1
- frontend/src/components/timeline/CardDetailBody.tsx:1
- frontend/src/pages/admin/orchestration/TimelineEditorTab.tsx:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Mohammed Abdul Aleem signs off a written scope and exception list; no scan has run against the repo yet.
- [ ] The agent produced the same outcome as the step 1 run log, on the same inputs, including the exceptions recorded there.
- [ ] Every run in the evidence window was approved by a named human before it took effect, and the record shows who.

When every box above is ticked, stop and show the demo.

# product_experience.CAP.color_contrast_regression_check — Rendered colour-contrast regression check

Text that is invisible against its background cannot reach a customer, because contrast is measured on the rendered pixel rather than inferred from the token file.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no rendered-contrast check exists in the repo today; the nearest thing, storyVisualReview.js, makes a human look at frames rather than measuring ratios
- current platform-wide contrast conformance is unknown
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Rendered colour-contrast regression check
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.color_contrast_regression_check`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
Text that is invisible against its background cannot reach a customer, because contrast is measured on the rendered pixel rather than inferred from the token file.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Render each surface in a sandbox browser at the agreed viewports.
- Walk text nodes and read computed foreground and effective background, resolving through transparency and stacked backgrounds.
- Compute the contrast ratio and compare against the threshold for that node's size and weight.
- Fail on any node below threshold and report the measured ratio, never a pass/fail bit alone.
- Report surfaces that failed to render as unknown.
**Inputs**
- a rendered surface in a sandbox browser
- the AA thresholds: 4.5:1 for normal text, 3:1 for large text at 18px bold or 24px
- the surface list to sweep
**Outputs**
- every text node whose computed contrast falls below its threshold, with the measured ratio
- the three historically-failing ratios as named regression cases
- unknown for any surface the sweep could not render
**Exceptions that must be handled**
- Decorative text and text over imagery need a human judgement about the effective background and must be flagged rather than scored.
- Text hidden by design, including visually-hidden screen-reader text, is excluded and must not be measured.
- A node whose effective background cannot be resolved is reported as unresolved, which is a finding, not a pass. This is the specific trap: a token-level check reported clean on all three real failures.
- Synthetic or injected content must be reported as synthetic, following the AUGMENT convention already documented in storyVisualReview.js.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- headless_browser_sandbox
- contrast_calculator
- repo_read
- report_renderer
**Application surfaces**
- the 11 public V2 routes already swept by v2-page-health.js are the known starting set; coverage beyond them is unknown
**Source modules**
- tests/systemV2/storyVisualReview.js
- tests/systemV2/v2-page-health.js
- frontend/src/styles/tokens.css
**Dependencies**
- a sandbox browser
- a rendered deployment of the surface under test
- agreement on which viewports constitute the sweep
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: A measured ratio is an objective fact with a reference answer, so shadow mode against human-confirmed results is reachable. It stays below automation because the fix for a contrast failure is a colour change, and a colour change is a brand decision.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Defines thresholds, the viewport set, and how decorative and image-backed text are handled.

Acceptance: Written definition approved; the three historical failures are recorded as named regression cases.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no rendered-contrast check exists in the repo today; the nearest thing, storyVisualReview.js, makes a human look at frames rather than measuring ratios
- current platform-wide contrast conformance is unknown
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- tests/systemV2/storyVisualReview.js:12
- tests/systemV2/storyVisualReview.js:1
- .claude/skills/fixing-accessibility/SKILL.md:22
- frontend/src/styles/tokens.css:6
- tests/systemV2/v2-page-health.js:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Written definition approved; the three historical failures are recorded as named regression cases.

When every box above is ticked, stop and show the demo.

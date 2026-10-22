# product_experience.CAP.responsive_and_touch_target_regressio — Responsive layout and touch-target regression check

The product stays usable on a phone, a tablet and a wide monitor, and controls stay big enough to hit with a thumb.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- no multi-viewport check exists today: v2-page-health.js renders at a single 1440 by 900 viewport, so responsive conformance at 320, 375, 768 and 1920 pixels is unknown
- the share of interactive controls covered by the responsive.css Bootstrap-class rule is unknown; 35 occurrences of a 44px rule exist across frontend CSS as measured 2026-10-09, which bounds the rules, not the controls

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Responsive layout and touch-target regression check
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.responsive_and_touch_target_regression_check`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
The product stays usable on a phone, a tablet and a wide monitor, and controls stay big enough to hit with a thumb.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Render each agreed surface at each breakpoint in a sandbox browser.
- Detect horizontal overflow using the scrollWidth against clientWidth comparison already written in v2-page-health.js.
- Measure the rendered box of every interactive element and compare against the minimum.
- Record elements that meet the minimum only because of a Bootstrap class, separately from those that meet it intrinsically.
- Report per surface per breakpoint, never collapsed to one verdict.
**Inputs**
- the breakpoint set named in the ui-ux-design skill: 320, 375, 768, 1024 and 1920 pixels
- the 44 by 44 pixel minimum for interactive elements
- the agreed surface list
**Outputs**
- horizontal overflow per surface per breakpoint
- interactive elements below the touch-target minimum, measured on the rendered box
- content that disappears or collapses unusably at a breakpoint
- unknown for surfaces not rendered
**Exceptions that must be handled**
- A deliberately wide surface such as a data table may scroll horizontally on purpose, inside a container, and that is not an overflow defect.
- The existing rule in responsive.css applies min-height 44px only under max-width 991.98px and only to .btn, .form-control and .form-select, so any custom or icon-only control outside those classes is uncovered by it and must be measured rather than assumed compliant.
- Dense admin surfaces may carry a different touch obligation from public surfaces; the manager decides.
- A measurement taken at one viewport says nothing about another, so a single-viewport pass is not a pass.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- headless_browser_sandbox
- repo_read
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- frontend/src/styles/responsive.css
- tests/systemV2/v2-page-health.js
**Dependencies**
- a sandbox browser at multiple viewports
- a rendered deployment
- the manager's per-surface touch-target obligation
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: Overflow and box size are measurable facts, shadow-comparable against an accepted baseline. Remediation changes layout, which is what the customer sees, so a human ships it.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Fixes the breakpoint set, the touch minimum per surface class, and the legitimate-horizontal-scroll exceptions.

Acceptance: Manager-approved breakpoint and minimum set, with table and dense-admin exceptions named.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- no multi-viewport check exists today: v2-page-health.js renders at a single 1440 by 900 viewport, so responsive conformance at 320, 375, 768 and 1920 pixels is unknown
- the share of interactive controls covered by the responsive.css Bootstrap-class rule is unknown; 35 occurrences of a 44px rule exist across frontend CSS as measured 2026-10-09, which bounds the rules, not the controls
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- frontend/src/styles/responsive.css:55
- frontend/src/styles/responsive.css:61
- frontend/src/styles/responsive.css:67
- .claude/skills/baseline-ui/SKILL.md:192
- .claude/skills/baseline-ui/SKILL.md:199
- .claude/skills/fixing-accessibility/SKILL.md:56
- .claude/skills/ui-ux-design/SKILL.md:114
- tests/systemV2/v2-page-health.js:30

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Manager-approved breakpoint and minimum set, with table and dense-admin exceptions named.

When every box above is ticked, stop and show the demo.

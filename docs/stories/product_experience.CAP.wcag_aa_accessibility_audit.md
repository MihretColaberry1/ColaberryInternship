# product_experience.CAP.wcag_aa_accessibility_audit — WCAG 2.1 AA accessibility audit with severity-ranked remediation proposals

The product is usable by people relying on assistive technology, and the gap to AA is a known, ranked list rather than an untested assumption.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no accessibility engine dependency exists in the repo (no axe-core, eslint-plugin-jsx-a11y, pa11y or lighthouse in frontend/package.json); adding one is an external-dependency decision that CLAUDE.md routes to escalation
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the current conformance level is unknown: no accessibility audit result exists in the repo. Partial signals measured 2026-10-09: 649 aria-label usages present, 29 of 68 CSS files honour prefers-reduced-motion, focus-visible outlines and a prefers-contrast: high block exist in responsive.css. These indicate real accessibility work, not conformance

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# WCAG 2.1 AA accessibility audit with severity-ranked remediation proposals
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.wcag_aa_accessibility_audit`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
The product is usable by people relying on assistive technology, and the gap to AA is a known, ranked list rather than an untested assumption.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Take the agreed surface list in the manager's priority order.
- Run the twelve checks: contrast, semantic HTML, ARIA, keyboard, form labels, alt text, touch targets, reduced motion, high contrast, live regions, heading hierarchy, skip navigation.
- Rank each finding by the skill's severity definitions.
- Prepare a patch per finding on a sandbox branch and leave it for review.
- Report surfaces that could not be reached as unknown rather than as conformant.
**Inputs**
- the 445 route-reachable pages and 449 components measured 2026-10-09
- the twelve AA checks enumerated in the fixing-accessibility skill
- the manager's ranking of which surfaces are audited first
**Outputs**
- findings ranked Critical / Major / Minor in the skill's stated output format
- a proposed patch per finding, in a sandbox branch
- a per-surface AA conformance statement, or unknown where the surface was not reached
**Exceptions that must be handled**
- Admin-only internal surfaces may carry a different AA obligation from public marketing pages; the manager sets that, and the audit must not assume one standard for both.
- A fix that changes visible layout or colour is a visual change and leaves the accessibility lane for the approval gate.
- Third-party embeds cannot be remediated in this repo; they are reported as upstream.
- A contrast pass computed from tokens is not proof of a visible result, which is the exact failure recorded in storyVisualReview.js.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- typescript_ast_scan
- headless_browser_sandbox
- contrast_calculator
- accessibility_rule_engine
- sandbox_git_branch
- report_renderer
**Application surfaces**
- unknown until the manager sets the surface priority order; 445 route-reachable pages are in scope as measured
**Source modules**
- .claude/skills/fixing-accessibility/SKILL.md
- frontend/src/styles/responsive.css
- frontend/src/styles/global.css
**Dependencies**
- no accessibility engine dependency exists in the repo (no axe-core, eslint-plugin-jsx-a11y, pa11y or lighthouse in frontend/package.json); adding one is an external-dependency decision that CLAUDE.md routes to escalation
- a rendered surface to audit, which needs a sandbox deployment
- the manager's surface priority order
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: Auditing is safe and shadow-mode comparable against a human-reviewed reference audit, so autonomy:R5. It stops below automation because almost every remediation alters rendered markup or visible styling, and what the customer sees is a human decision.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Records which surfaces carry an AA obligation, which carry a lower bar, and what evidence counts as a pass.

Acceptance: A written, manager-approved standard per surface class; no audit has run.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no accessibility engine dependency exists in the repo (no axe-core, eslint-plugin-jsx-a11y, pa11y or lighthouse in frontend/package.json); adding one is an external-dependency decision that CLAUDE.md routes to escalation
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the current conformance level is unknown: no accessibility audit result exists in the repo. Partial signals measured 2026-10-09: 649 aria-label usages present, 29 of 68 CSS files honour prefers-reduced-motion, focus-visible outlines and a prefers-contrast: high block exist in responsive.css. These indicate real accessibility work, not conformance
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .claude/skills/fixing-accessibility/SKILL.md:21
- .claude/skills/fixing-accessibility/SKILL.md:22
- .claude/skills/fixing-accessibility/SKILL.md:46
- .claude/skills/fixing-accessibility/SKILL.md:51
- .claude/skills/fixing-accessibility/SKILL.md:56
- .claude/skills/fixing-accessibility/SKILL.md:88
- .claude/skills/fixing-accessibility/SKILL.md:115
- frontend/src/styles/responsive.css:73
- frontend/src/styles/responsive.css:131
- .claude/skills/baseline-ui/SKILL.md:204

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] A written, manager-approved standard per surface class; no audit has run.

When every box above is ticked, stop and show the demo.

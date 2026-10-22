# product_experience.CAP.keyboard_and_semantic_interaction_aud — Keyboard and semantic-interaction audit

Every interactive element can be reached and operated without a mouse, and announces itself correctly, so keyboard and screen-reader users are not locked out of a control a sighted mouse user can click.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the true count is unknown. A single-line regex scan on 2026-10-09 found 87 click handlers on span or div elements across frontend/src/**/*.tsx, but the scan cannot match handlers spread across multiple lines of JSX, so 87 is a lower bound and the real figure is unknown until an AST scan runs

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Keyboard and semantic-interaction audit
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.keyboard_and_semantic_interaction_audit`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
Every interactive element can be reached and operated without a mouse, and announces itself correctly, so keyboard and screen-reader users are not locked out of a control a sighted mouse user can click.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Scan the React source for click handlers attached to span, div and other non-interactive elements.
- Scan for controls whose only content is an icon or glyph and which carry no accessible name.
- Render the agreed surfaces and walk the tab order, recording unreachable controls and focus traps.
- Verify the focus-visible outline actually appears on each focusable control.
- Propose patches following the before/after conversions the skill already documents.
**Inputs**
- frontend/src/**/*.tsx
- the agreed surface priority order
**Outputs**
- every click handler on a non-interactive element, with file and line
- every icon-only control lacking an accessible name
- focus-order and focus-visibility findings per surface
- proposed patches converting non-semantic handlers to real controls
**Exceptions that must be handled**
- A div with a click handler that is purely a backdrop dismissal is a known pattern with a keyboard equivalent elsewhere; it needs confirming, not converting blindly.
- A control rendered inside a third-party widget cannot be remediated here.
- Converting a span to a button can change layout, which moves the fix into the visual-approval lane.
- Static scanning cannot see controls created at runtime, so a static count is a lower bound and must be reported as one.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- typescript_ast_scan
- headless_browser_sandbox
- sandbox_git_branch
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- .claude/skills/fixing-accessibility/SKILL.md
- frontend/src/styles/responsive.css
**Dependencies**
- a sandbox browser for tab-order walking
- no accessibility engine dependency exists in the repo (no axe-core, eslint-plugin-jsx-a11y, pa11y or lighthouse in frontend/package.json); adding one is an external-dependency decision that CLAUDE.md routes to escalation
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: Detection is objective and shadow-comparable. Remediation converts markup and can move layout, so the agent proposes and a human ships.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Defines which patterns count as violations and which are approved exceptions.

Acceptance: Manager-approved pattern list, including the backdrop-dismissal exception.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the true count is unknown. A single-line regex scan on 2026-10-09 found 87 click handlers on span or div elements across frontend/src/**/*.tsx, but the scan cannot match handlers spread across multiple lines of JSX, so 87 is a lower bound and the real figure is unknown until an AST scan runs
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .claude/skills/fixing-accessibility/SKILL.md:39
- .claude/skills/fixing-accessibility/SKILL.md:27
- .claude/skills/fixing-accessibility/SKILL.md:33
- .claude/skills/fixing-accessibility/SKILL.md:128
- .claude/skills/fixing-accessibility/SKILL.md:134
- frontend/src/styles/responsive.css:73
- frontend/src/styles/responsive.css:78

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Manager-approved pattern list, including the backdrop-dismissal exception.

When every box above is ticked, stop and show the demo.

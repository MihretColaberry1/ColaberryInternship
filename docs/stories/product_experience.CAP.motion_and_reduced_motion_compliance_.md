# product_experience.CAP.motion_and_reduced_motion_compliance_ — Motion and reduced-motion compliance review

Animation stays smooth and never triggers discomfort, and a visitor who has asked their system for less motion actually gets less motion.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the real gap is unknown. Measured 2026-10-09: 277 transition or animation declarations across frontend CSS, and prefers-reduced-motion appears in 29 of 68 stylesheets. Whether the uncovered files are genuinely uncovered or are caught by the global reset at responsive.css:88 has not been determined

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Motion and reduced-motion compliance review
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.motion_and_reduced_motion_compliance_review`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
Animation stays smooth and never triggers discomfort, and a visitor who has asked their system for less motion actually gets less motion.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Parse every stylesheet and collect transition and animation declarations with their animated properties.
- Flag any animating a layout or paint property rather than transform, opacity or filter.
- For each file that animates, check whether a prefers-reduced-motion block covers it.
- Verify in a rendered sandbox that motion actually reduces when the preference is set, rather than trusting the media query's presence.
**Inputs**
- every stylesheet declaring a transition or animation
- the composited-property allow-list: transform, opacity, filter
- the duration limits stated in the skill
**Outputs**
- animations on layout- or paint-triggering properties
- stylesheets that animate without a reduced-motion fallback
- durations outside the stated limits
**Exceptions that must be handled**
- A height or width animation is sometimes the only honest way to animate a disclosure; a flag is a question, not a verdict.
- A global reduced-motion reset may cover files that contain no query of their own, so per-file coverage counting alone would overstate the gap.
- Inline and JavaScript-driven animation is invisible to a stylesheet parse and must be reported as out of static scope.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- css_token_parser
- headless_browser_sandbox
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- frontend/src/styles/global.css
- frontend/src/styles/responsive.css
- frontend/src/pages/publicV2/homeV2.css
- frontend/src/components/publicV2/cinematicV2.css
- frontend/src/components/timeline/timeline.css
**Dependencies**
- a sandbox browser able to set the reduced-motion preference
- a decision on whether the global reset in responsive.css is the intended single authority
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Motion is a felt, expressive property of the brand, and the right answer is often a judgement rather than a threshold. The agent reports and proposes; a designer decides. No approved reference motion set exists to shadow against, so it stays below autonomy:R5.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Decides whether the global reduced-motion reset is the single authority and what duration limits bind this product.

Acceptance: Written decision on the reset's scope; per-file obligations stated.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the real gap is unknown. Measured 2026-10-09: 277 transition or animation declarations across frontend CSS, and prefers-reduced-motion appears in 29 of 68 stylesheets. Whether the uncovered files are genuinely uncovered or are caught by the global reset at responsive.css:88 has not been determined
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .claude/skills/fixing-motion-performance/SKILL.md:19
- .claude/skills/fixing-motion-performance/SKILL.md:22
- .claude/skills/fixing-motion-performance/SKILL.md:30
- .claude/skills/fixing-motion-performance/SKILL.md:52
- .claude/skills/fixing-accessibility/SKILL.md:61
- frontend/src/styles/responsive.css:88
- frontend/src/styles/global.css:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Written decision on the reset's scope; per-file obligations stated.

When every box above is ticked, stop and show the demo.

# product_experience.CAP.bundle_and_render_performance_review — Bundle size and render performance review

The product loads quickly on an ordinary connection, and a page that gets slower is noticed before a customer feels it.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- no performance budget exists, so every measurement would be a number without a verdict
- current bundle size and load timings are unknown; no measurement is stored in the repo. Measured 2026-10-09 the route trees declare 118 lazy imports, 85 in adminRoutes.tsx and 33 in portalRoutes.tsx, which shows route splitting exists but says nothing about size

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Bundle size and render performance review
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.bundle_and_render_performance_review`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
The product loads quickly on an ordinary connection, and a page that gets slower is noticed before a customer feels it.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Produce a production build in the sandbox and read the chunk manifest.
- Map chunks to routes through the lazy-import boundaries.
- Identify duplicate dependencies and default imports that defeat tree-shaking.
- Profile the heaviest surfaces for avoidable re-renders.
- Report numbers against the agreed budget, or report them as unjudged when no budget exists.
**Inputs**
- the production build output
- the route-level code-split map
- an agreed performance budget, which does not exist
**Outputs**
- per-chunk size and the routes that pull each chunk
- duplicate dependencies and non-tree-shaken imports
- components re-rendering avoidably on the heaviest surfaces
- unknown wherever no budget exists to judge a number against
**Exceptions that must be handled**
- A large chunk behind an admin-only lazy route costs an admin once, not every visitor, so raw size is not severity.
- The production build runs a stricter eslint than the local typecheck, so a build that passes locally can still fail; a performance run must use the real build.
- A re-render fix must not reach for an exhaustive-deps disable comment, which is a build failure in this repo rather than a style preference.
- Images and media often dominate real load time and are an authoring concern as much as a bundling one.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- bundle_analyzer
- sandbox_build_runner
- headless_browser_sandbox
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- frontend/src/routes/adminRoutes.tsx
- frontend/src/routes/portalRoutes.tsx
- frontend/package.json
**Dependencies**
- a sandbox able to run the production build, which needs the Docker build path
- an agreed performance budget
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Performance work trades against features and visual richness, so the trade is a human call. Without an agreed budget there is no reference outcome to shadow against, which keeps this below autonomy:R5 until a budget exists.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Proposes a performance budget per surface class and defines what a regression is.

Acceptance: A manager-approved budget exists; until then every measurement is reported as unjudged.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- no performance budget exists, so every measurement would be a number without a verdict
- current bundle size and load timings are unknown; no measurement is stored in the repo. Measured 2026-10-09 the route trees declare 118 lazy imports, 85 in adminRoutes.tsx and 33 in portalRoutes.tsx, which shows route splitting exists but says nothing about size
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .claude/skills/fixing-motion-performance/SKILL.md:71
- .claude/skills/fixing-motion-performance/SKILL.md:104
- .claude/skills/fixing-motion-performance/SKILL.md:128
- .claude/skills/fixing-motion-performance/SKILL.md:130
- .claude/skills/fixing-motion-performance/SKILL.md:147
- frontend/src/routes/adminRoutes.tsx:305
- frontend/src/routes/portalRoutes.tsx:143
- frontend/CLAUDE.md:66

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] A manager-approved budget exists; until then every measurement is reported as unjudged.

When every box above is ticked, stop and show the demo.

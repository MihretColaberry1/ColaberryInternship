# product_experience.CAP.stylesheet_architecture_consolidation — Stylesheet architecture consolidation proposal

A change to the look of the product has one obvious place to be made, instead of several stylesheets that each partly own it.

**Built today:** absent. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- this crosses the large-refactor threshold and requires escalation rather than autonomous action
- the overlap between stylesheets is unknown; measured 2026-10-09 there are 8 stylesheets in frontend/src/styles and 68 across frontend/src, but no ownership map exists and no contested-selector analysis has been run

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Stylesheet architecture consolidation proposal
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.stylesheet_architecture_consolidation_proposal`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
A change to the look of the product has one obvious place to be made, instead of several stylesheets that each partly own it.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read each global stylesheet and state its apparent responsibility.
- Find selectors and declarations contested by more than one stylesheet.
- Propose a staged consolidation, smallest blast radius first.
- State what each stage would and would not change visually.
- Stop at the proposal. This is a refactor of the thing the customer sees.
**Inputs**
- the global stylesheets and their responsibilities
- the per-feature stylesheets
- the measured raw-colour and inline-style footprint
**Outputs**
- a map of which stylesheet owns which concern, and where ownership overlaps
- a staged consolidation proposal with blast radius per stage
- unknown where a stylesheet's intended responsibility cannot be determined
**Exceptions that must be handled**
- A large consolidation is a large refactor and is routed to escalation by the repository contract, not performed autonomously.
- Vendored brand assets under apps/*/src/assets/design are owned upstream and excluded.
- A stylesheet that looks redundant may be load-bearing for a surface nobody remembers; the orphan inventory must be consulted first.
- A consolidation that changes the rendered result is a visual change, whatever its intent.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- css_token_parser
- import_graph_analyzer
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- frontend/src/styles/
**Dependencies**
- the design-token drift audit
- the orphan detection capability
- an escalation decision for anything crossing the large-refactor threshold
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: Restructuring the styling layer is an architecture change with a product-wide blast radius, which the repository contract routes to escalation. The agent's ceiling is mapping and proposing from approved knowledge.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
States the target architecture question and what a consolidation would have to preserve.

Acceptance: A written scope naming the stylesheets in play and the no-visual-change constraint.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- this crosses the large-refactor threshold and requires escalation rather than autonomous action
- the overlap between stylesheets is unknown; measured 2026-10-09 there are 8 stylesheets in frontend/src/styles and 68 across frontend/src, but no ownership map exists and no contested-selector analysis has been run
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- frontend/src/styles/tokens.css:6
- frontend/src/styles/global.css:1
- frontend/src/styles/brand-bridge.css:1
- frontend/src/styles/admin-shell.css:1
- frontend/src/styles/agentDetailV2.css:1
- frontend/src/styles/orchestration.css:1
- frontend/src/styles/rungTones.css:1
- frontend/src/styles/responsive.css:1
- frontend/CLAUDE.md:35
- frontend/CLAUDE.md:41

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] A written scope naming the stylesheets in play and the no-visual-change constraint.

When every box above is ticked, stop and show the demo.

# product_experience.CAP.component_duplication_detection — Component duplication and divergence detection

One concept has one implementation, so a fix lands once instead of in three places, and two components with the same name do not quietly behave differently.

**Built today:** absent. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- a consolidation touching more than a quarter of a module is a large refactor, which CLAUDE.md routes to escalation rather than autonomous action
- the true duplication level is unknown. Measured 2026-10-09: 449 non-test components under frontend/src/components and 13 component basenames appearing more than once across pages and components, including AgentDetailModal, OverviewTab, SettingsTab and StatusBadge. Name collision is not behavioural duplication, and the behavioural overlap has not been measured

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Component duplication and divergence detection
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.component_duplication_detection`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** absent · **Source:** existing_application
## The business outcome
One concept has one implementation, so a fix lands once instead of in three places, and two components with the same name do not quietly behave differently.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Index every component by name and by shape: props, rendered structure, imported dependencies.
- Group components sharing a name across directories and diff their behaviour.
- Detect near-duplicates by structural similarity rather than name alone.
- Flag files above the size ceiling.
- Propose a consolidation per cluster, with the blast radius of each proposal stated.
**Inputs**
- frontend/src/components and frontend/src/pages
- the repository's size targets: roughly 300 lines per file with a 500-line ceiling
**Outputs**
- components sharing a name across directories, with a behavioural comparison
- near-duplicate implementations of the same concept
- files over the size ceiling, which the contract says must be split before the next change adds to them
- a consolidation proposal per cluster
**Exceptions that must be handled**
- A shared name across two different domains can be entirely legitimate; an admin tab and a portal tab may rightly differ.
- The extraction boundary rules forbid apps importing the platform frontend, so a shared component is not an available remedy across that boundary.
- Oversize files are grandfathered by the contract until touched, so a size flag is a queue entry rather than a defect.
- Consolidating two components that look alike but serve different audiences makes the product worse, not better.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- typescript_ast_scan
- import_graph_analyzer
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- frontend/src/components/
- frontend/src/pages/
- scripts/validate-app-boundaries.js
**Dependencies**
- scripts/validate-app-boundaries.js boundary rules
- the manager's view on which duplications matter
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Whether two similar components should become one is an architecture judgement with a real blast radius, and the contract routes larger refactors to escalation. The agent detects and proposes only.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Defines what counts as a duplication worth fixing and what name reuse is legitimate.

Acceptance: Manager-approved definition distinguishing legitimate name reuse from real duplication.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- a consolidation touching more than a quarter of a module is a large refactor, which CLAUDE.md routes to escalation rather than autonomous action
- the true duplication level is unknown. Measured 2026-10-09: 449 non-test components under frontend/src/components and 13 component basenames appearing more than once across pages and components, including AgentDetailModal, OverviewTab, SettingsTab and StatusBadge. Name collision is not behavioural duplication, and the behavioural overlap has not been measured
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- CLAUDE.md:1
- .claude/skills/frontend-design/SKILL.md:155
- .claude/skills/ui-ux-design/SKILL.md:128
- frontend/CLAUDE.md:41
- frontend/src/pages/admin/ai-settings/AgentDetailModal.tsx:1
- frontend/src/components/publicV2/Claim.tsx:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Manager-approved definition distinguishing legitimate name reuse from real duplication.

When every box above is ticked, stop and show the demo.

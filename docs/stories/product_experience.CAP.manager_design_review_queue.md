# product_experience.CAP.manager_design_review_queue — Manager-reachable design review and decision queue

The accountable manager can see what his AI employee found, decide on it, and have that decision recorded, which is the precondition for every other capability in this domain mattering.

**Built today:** absent. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no_manager_scoped_authorization: requireAgentManagerOrAdmin is PROPOSED, not built. Agent-detail and agent-governance routes are flat requireAdmin today, so there is no server-side 'is this human actually this agent's manager' check (docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md 'What exists today' item 2)
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- the surface itself is unknown: whether he reaches this through a new admin_users row with a scoped management role or through an alternative surface is an open decision recorded in HUMAN_OWNERSHIP_MAP.md:46, and this domain's Phase 1 is required to state it

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Manager-reachable design review and decision queue
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.manager_design_review_queue`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** absent · **Source:** manager_defined
## The business outcome
The accountable manager can see what his AI employee found, decide on it, and have that decision recorded, which is the precondition for every other capability in this domain mattering.
Intended users: Mohammed Abdul Aleem (accountable manager), Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Collect findings from the domain's audits into one queue, ranked.
- Present each with its evidence, its proposed remedy and its blast radius.
- Record his decision against the finding, server-side, attributable to his identity.
- Feed accepted exceptions back into the audits so settled questions stay settled.
**Inputs**
- findings from every audit capability in this domain
- the manager's identity, resolvable only through org_members today
- a decision vocabulary: accept, reject, defer, set exception
**Outputs**
- a queue of findings awaiting the manager's decision
- a recorded decision per finding, attributable to him
- exceptions fed back so the same finding is not raised twice
- unknown for the surface itself, which does not exist
**Exceptions that must be handled**
- Manager instructions may only restrict the agent, never expand its authority. An instruction that would widen scope is refused, not obeyed.
- Authorization must be checked server-side against a real 'is this human this agent's manager' test. Frontend visibility is not authorization.
- Until a manager-scoped gate exists, any admin could act as this manager, which is the exact hole the authorization map describes.
- A decision recorded without an attributable identity is not a decision; it is an unsigned note.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- review_queue_write
- decision_record_write
- report_renderer
**Application surfaces**
- unknown: no manager-facing review endpoint exists for this domain
**Source modules**
- docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md
**Dependencies**
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no_manager_scoped_authorization: requireAgentManagerOrAdmin is PROPOSED, not built. Agent-detail and agent-governance routes are flat requireAdmin today, so there is no server-side 'is this human actually this agent's manager' check (docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md 'What exists today' item 2)
- an org_members to admin_users join, which no login path populates in the token today
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: This capability exists to carry a human's decision, so the agent's share of it is presenting evidence and recording an answer. It cannot rise above answering from approved knowledge without becoming the decision-maker it was built to serve.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
States how this manager will reach his employee and what a recorded decision must contain, which HUMAN_OWNERSHIP_MAP.md:46 requires of this domain's Phase 1.

Acceptance: A written access plan exists naming either a scoped admin_users row or a specific alternative surface, and Mohammed Abdul Aleem confirms he can use it.
## Before you start
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no_manager_scoped_authorization: requireAgentManagerOrAdmin is PROPOSED, not built. Agent-detail and agent-governance routes are flat requireAdmin today, so there is no server-side 'is this human actually this agent's manager' check (docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md 'What exists today' item 2)
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- the surface itself is unknown: whether he reaches this through a new admin_users row with a scoped management role or through an alternative surface is an open decision recorded in HUMAN_OWNERSHIP_MAP.md:46, and this domain's Phase 1 is required to state it
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:42
- .loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44
- .loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:46
- docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13
- docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:46
- docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md:1
- docs/architecture/ai-workforce-management/AI_EMPLOYEE_ROSTER.md:31

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] A written access plan exists naming either a scoped admin_users row or a specific alternative surface, and Mohammed Abdul Aleem confirms he can use it.

When every box above is ticked, stop and show the demo.

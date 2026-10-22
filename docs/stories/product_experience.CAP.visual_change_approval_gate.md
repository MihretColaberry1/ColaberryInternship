# product_experience.CAP.visual_change_approval_gate — Visual and brand change approval gate

No change to what a customer sees reaches production without a named human having looked at it and said yes.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no_manager_scoped_authorization: requireAgentManagerOrAdmin is PROPOSED, not built. Agent-detail and agent-governance routes are flat requireAdmin today, so there is no server-side 'is this human actually this agent's manager' check (docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md 'What exists today' item 2)
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the fast-path policy for urgent visual defects is unknown and is a governance decision

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Visual and brand change approval gate
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.visual_change_approval_gate`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** manager_defined
## The business outcome
No change to what a customer sees reaches production without a named human having looked at it and said yes.
Intended users: Mohammed Abdul Aleem (accountable manager), Ali Muwwakkil (DRI), frontend engineers.
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Classify a proposed change as visual or non-visual; a change to markup, styling, tokens or customer-facing copy is visual.
- For a visual change, render before and after and attach both to the proposal.
- Route to the named approver for the surface.
- Record the decision. Only then may a human merge and deploy.
**Inputs**
- any proposed change to rendered markup, styling, tokens or copy
- the diff and a rendered before-and-after
- the named approver for that surface
**Outputs**
- an approval record per visual change, naming the approver and the diff
- a refusal path for changes that bypass the gate
- a rendered before-and-after for the approver to look at
**Exceptions that must be handled**
- A purely internal refactor with a proven-identical render is not a visual change, but 'proven' means a rendered comparison, not an assertion.
- An accessibility fix is still a visual change when it alters the rendered result.
- An urgent production visual defect needs a fast path, and who may use it is a decision this domain does not get to make for itself.
- The approval gate must not be satisfiable by the agent itself under any configuration.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- sandbox_git_branch
- screenshot_capture_sandbox
- headless_browser_sandbox
- approval_record_write
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- .github/workflows/design-system-sync.yml
- backend/src/services/delivery/execution/executionPolicy.ts
**Dependencies**
- the manager review queue, which does not exist
- no_manager_scoped_authorization: requireAgentManagerOrAdmin is PROPOSED, not built. Agent-detail and agent-governance routes are flat requireAdmin today, so there is no server-side 'is this human actually this agent's manager' check (docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md 'What exists today' item 2)
- a rendering sandbox able to produce before-and-after frames
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: A gate whose own autonomy could rise would stop being a gate. The agent prepares the evidence and records the outcome, and never holds the approving authority, at any rung.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Defines what counts as a visual change, who approves each surface, and what the urgent fast path is.

Acceptance: Written, manager-approved classification and approver map; the fast path named or explicitly deferred.
## Before you start
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no_manager_scoped_authorization: requireAgentManagerOrAdmin is PROPOSED, not built. Agent-detail and agent-governance routes are flat requireAdmin today, so there is no server-side 'is this human actually this agent's manager' check (docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md 'What exists today' item 2)
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the fast-path policy for urgent visual defects is unknown and is a governance decision
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .github/workflows/design-system-sync.yml:8
- .github/workflows/design-system-sync.yml:99
- docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md:1
- backend/src/services/delivery/execution/executionPolicy.ts:33
- .loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:46

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Written, manager-approved classification and approver map; the fast path named or explicitly deferred.

When every box above is ticked, stop and show the demo.

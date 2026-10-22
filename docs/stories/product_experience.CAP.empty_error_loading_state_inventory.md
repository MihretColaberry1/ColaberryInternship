# product_experience.CAP.empty_error_loading_state_inventory — Empty, error and loading state inventory

A customer who hits no data, a failure or a slow request sees something deliberate, because the unhappy paths are inventoried rather than discovered in production.

**Built today:** absent. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- no fault-injection path exists in a sandbox, so failure states cannot be induced and their coverage is unknown
- the count of data-fetching surfaces is unknown; no inventory exists

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Empty, error and loading state inventory
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.empty_error_loading_state_inventory`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
A customer who hits no data, a failure or a slow request sees something deliberate, because the unhappy paths are inventoried rather than discovered in production.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Find data-fetching surfaces and the states each renders.
- Induce each state in a sandbox: no data, a failed request, a slow request.
- Record what renders, including whether anything renders at all.
- Check the loading state announces itself, following the live-region pattern the accessibility skill documents.
- Report gaps against the design system's stated patterns.
**Inputs**
- surfaces that fetch data
- the design system's stated patterns for these three states
**Outputs**
- per data-fetching surface: which of the three states is handled and which is not
- states that render as a blank region, which is the worst case
- loading states that do not announce themselves to assistive technology
- unknown for states only reachable under conditions the audit cannot induce
**Exceptions that must be handled**
- Some failure states cannot be induced without a fault-injection path that does not exist, and must be reported as uninduced rather than as handled.
- A deliberately blank state can be correct when the surrounding layout carries the message; blankness is a question, not automatically a defect.
- Inducing a failure must never touch production.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- headless_browser_sandbox
- repo_read
- typescript_ast_scan
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- .claude/skills/frontend-design/SKILL.md
- .claude/skills/ui-ux-design/SKILL.md
- tests/systemV2/v2-page-health.js
**Dependencies**
- a sandbox with a fault-injection path for failed and slow requests, which does not exist
- a rendered sandbox deployment
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: What an empty or failed state should say is design and copy work, so a human decides it. The agent inventories the gaps and stays below shadow mode because no approved reference set of correct states exists.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Defines the required pattern for each of the three states and which surfaces owe them.

Acceptance: Manager-approved pattern per state; the deliberately-blank exception named.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- no fault-injection path exists in a sandbox, so failure states cannot be induced and their coverage is unknown
- the count of data-fetching surfaces is unknown; no inventory exists
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .claude/skills/frontend-design/SKILL.md:143
- .claude/skills/ui-ux-design/SKILL.md:128
- .claude/skills/fixing-accessibility/SKILL.md:71
- .claude/skills/baseline-ui/SKILL.md:71
- tests/systemV2/v2-page-health.js:24

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Manager-approved pattern per state; the deliberately-blank exception named.

When every box above is ticked, stop and show the demo.

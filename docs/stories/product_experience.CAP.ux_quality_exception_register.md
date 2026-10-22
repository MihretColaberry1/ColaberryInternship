# product_experience.CAP.ux_quality_exception_register — UX quality standard and exception register

The product has one written answer to 'what good looks like here', and every knowing departure from it is recorded with a reason, so an audit finding is either a real defect or a known exception and never an argument.

**Built today:** absent. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no_manager_scoped_authorization: requireAgentManagerOrAdmin is PROPOSED, not built. Agent-detail and agent-governance routes are flat requireAdmin today, so there is no server-side 'is this human actually this agent's manager' check (docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md 'What exists today' item 2)
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- no UX standard document exists for this domain today; the five design principles and the enterprise-executive audience definition in the skills are the nearest thing and were not authored by this manager
- the scope of this domain is unknown in one specific respect: whether it covers the three public brand apps or only the platform frontend, since Website Portfolio & Conversion is a separate domain with its own manager

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# UX quality standard and exception register
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.ux_quality_exception_register`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** absent · **Source:** manager_defined
## The business outcome
The product has one written answer to 'what good looks like here', and every knowing departure from it is recorded with a reason, so an audit finding is either a real defect or a known exception and never an argument.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Draft the standard per surface class from the existing skills and the audience definition.
- Take the manager's decisions on each audit's thresholds and record them.
- Record each accepted exception with its reason, its owner and its date.
- Feed the register into every audit so a settled exception is not re-raised.
- Re-present expired or stale exceptions rather than letting them stand forever.
**Inputs**
- the five design principles and the audience definition already written in the skills
- each audit's threshold set
- the manager's accepted exceptions
**Outputs**
- a written standard per surface class: public, portal, admin
- a dated exception register with a reason and an owner per entry
- unknown for every surface class the manager has not yet ruled on
**Exceptions that must be handled**
- An exception with no stated reason is not an exception; it is an unexplained defect.
- An exception may restrict what the agent reports but may never expand what it is allowed to do.
- A permanent exception is usually a standard that is wrong; repeated exceptions on the same rule are a signal to revisit the rule.
- This domain cannot grant itself exceptions to another domain's standards.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- exception_register_write
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- .claude/skills/ui-ux-design/SKILL.md
- .claude/skills/baseline-ui/SKILL.md
- .claude/skills/fixing-accessibility/SKILL.md
**Dependencies**
- the manager review queue, which does not exist
- every audit capability consuming the register
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: The standard is the manager's own statement of what good looks like. The agent may draft it and apply it, never ratify it, so it cannot rise above answering from approved knowledge.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Drafts the standard and the register's format, and takes the manager's rulings on each audit's thresholds.

Acceptance: A dated standard exists per surface class, with Mohammed Abdul Aleem recorded as its author of record, and every threshold either set or explicitly marked unknown.
## Before you start
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- no_manager_scoped_authorization: requireAgentManagerOrAdmin is PROPOSED, not built. Agent-detail and agent-governance routes are flat requireAdmin today, so there is no server-side 'is this human actually this agent's manager' check (docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md 'What exists today' item 2)
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- no UX standard document exists for this domain today; the five design principles and the enterprise-executive audience definition in the skills are the nearest thing and were not authored by this manager
- the scope of this domain is unknown in one specific respect: whether it covers the three public brand apps or only the platform frontend, since Website Portfolio & Conversion is a separate domain with its own manager
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- docs/architecture/ai-workforce-management/MANAGER_AUTHORIZATION_MAP.md:1
- docs/architecture/ai-workforce-management/AI_EMPLOYEE_ROSTER.md:31
- .loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:42
- .claude/skills/ui-ux-design/SKILL.md:37
- .claude/skills/ui-ux-design/SKILL.md:24
- .claude/skills/baseline-ui/SKILL.md:7

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] A dated standard exists per surface class, with Mohammed Abdul Aleem recorded as its author of record, and every threshold either set or explicitly marked unknown.

When every box above is ticked, stop and show the demo.

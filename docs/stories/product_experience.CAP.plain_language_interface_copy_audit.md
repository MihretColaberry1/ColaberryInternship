# product_experience.CAP.plain_language_interface_copy_audit — Plain-language audit of interface copy

The product speaks to its reader in their language, not in the vocabulary of the database underneath it.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the interface-string inventory is unknown; no extraction of product copy exists, and database-held copy would be invisible to a source scan
- the per-surface audience line between product and engineering vocabulary has not been set

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Plain-language audit of interface copy
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.plain_language_interface_copy_audit`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** proposed_new
## The business outcome
The product speaks to its reader in their language, not in the vocabulary of the database underneath it.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Collect interface strings from the in-scope surfaces.
- Apply the existing technical-term detection to find database, programming and agent-internal vocabulary.
- Flag error messages with no actionable next step.
- Draft replacements and mark them as drafts.
- Hand to a human. Interface copy is customer-facing.
**Inputs**
- interface copy: labels, empty states, error messages, table headers, tooltips
- the technical-term replacement set already encoded for reports
- the audience definition: enterprise executives
**Outputs**
- interface strings leaking database or programming vocabulary
- error messages that state a cause without an action
- raw column names surfaced as labels
- drafted replacements for human editing
**Exceptions that must be handled**
- Admin and engineering surfaces may legitimately use technical vocabulary; the audience differs and the manager sets the line.
- A term that looks technical may be the customer's own domain language, and replacing it would be a regression.
- Copy held in the database rather than the source is invisible to a source scan and must be reported as out of scope.
- The agent never finalises customer-facing wording.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- typescript_ast_scan
- copy_lint_scanner
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- backend/src/intelligence/assistant/agents/reportQualityAgent.ts
- backend/src/intelligence/assistant/agents/dataAnalystAgent.ts
**Dependencies**
- the manager's per-surface audience definition
- the existing replacement set remaining the shared authority
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Interface copy is what the customer reads, so a human approves every word. The agent detects and drafts, and stays below shadow mode because no approved reference copy set exists to shadow against.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Sets which surfaces owe plain language and what vocabulary is legitimate on each.

Acceptance: Manager-approved per-surface audience definition; admin exceptions named.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the interface-string inventory is unknown; no extraction of product copy exists, and database-held copy would be invisible to a source scan
- the per-surface audience line between product and engineering vocabulary has not been set
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/intelligence/assistant/agents/reportQualityAgent.ts:1
- docs/agent-catalog/assistant/report-quality-agent.md:1
- docs/agent-catalog/assistant/report-quality-agent.md:4
- backend/src/intelligence/assistant/agents/dataAnalystAgent.ts:1
- docs/agent-catalog/assistant/data-analyst-agent.md:1
- .claude/skills/ui-ux-design/SKILL.md:24

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Manager-approved per-surface audience definition; admin exceptions named.

When every box above is ticked, stop and show the demo.

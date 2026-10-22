# product_experience.CAP.dataviz_quality_audit — Data-visualisation quality audit on product surfaces

Charts in the product are the right chart for their data, are readable, and never render empty, so a dashboard informs instead of misleading.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the charted-surface inventory is unknown; no count of product charts exists
- ownership is unknown: chart validation for the Assistant sits under the Assistant department, and whether product-surface charts belong to this domain has not been decided

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Data-visualisation quality audit on product surfaces
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.dataviz_quality_audit`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** proposed_new
## The business outcome
Charts in the product are the right chart for their data, are readable, and never render empty, so a dashboard informs instead of misleading.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Inventory charted surfaces and the chart types each renders.
- Apply the existing data-shape fitness rules to each chart's real data contract.
- Check each chart's configuration keys against the component it renders through, which is the known cause of empty-rendering charts.
- Check colour encodings for greyscale and colour-blind legibility.
- Report. Changing a chart changes what the customer sees.
**Inputs**
- charted surfaces in the platform frontend
- the chart-fitness rules already encoded for the Assistant
- the dataviz colour and form guidance
**Outputs**
- charts whose type does not fit their data shape
- charts that can render empty or all-zero
- charts whose colour encoding fails in greyscale or for colour-blind readers
- unknown for charts whose data shape cannot be determined statically
**Exceptions that must be handled**
- A chart whose data shape is only known at runtime cannot be judged statically and must be reported as undetermined.
- The Assistant's generated charts are already governed by the existing agent; this capability must not duplicate that governance, only extend to the product's own charts.
- A deliberately sparse chart is not an empty chart.
- Chart palettes are governed by the dataviz guidance, not by the product token set, so a token audit will produce false findings here.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- typescript_ast_scan
- headless_browser_sandbox
- contrast_calculator
- report_renderer
**Application surfaces**
- frontend/src/components/admin/marketing/MarketingFunnelGraph.tsx
- unknown: the full charted-surface inventory has not been built
**Source modules**
- backend/src/intelligence/assistant/agents/chartValidationAgent.ts
- backend/src/intelligence/assistant/agents/dataAnalystAgent.ts
**Dependencies**
- the existing chart validation rules remaining the single fitness authority
- a decision on whether product charts fall to this domain or to the Assistant's owner
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Changing a chart changes what a customer reads from their data, which is a product and brand decision. The agent audits and proposes; it stays below shadow mode because no approved reference set of correct product charts exists yet.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Decides ownership against the Assistant department and defines chart fitness for product surfaces.

Acceptance: A written ownership decision exists; the fitness rule set is named and is either reused from the existing agent or explicitly extended.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the charted-surface inventory is unknown; no count of product charts exists
- ownership is unknown: chart validation for the Assistant sits under the Assistant department, and whether product-surface charts belong to this domain has not been decided
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/intelligence/assistant/agents/chartValidationAgent.ts:1
- docs/agent-catalog/assistant/chart-validation-agent.md:1
- docs/agent-catalog/assistant/chart-validation-agent.md:4
- .claude/skills/fixing-motion-performance/SKILL.md:104
- frontend/src/components/admin/marketing/MarketingFunnelGraph.tsx:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] A written ownership decision exists; the fitness rule set is named and is either reused from the existing agent or explicitly extended.

When every box above is ticked, stop and show the demo.

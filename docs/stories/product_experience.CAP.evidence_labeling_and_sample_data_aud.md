# product_experience.CAP.evidence_labeling_and_sample_data_aud — Evidence-class and sample-data labelling audit

A customer can always tell demo data from their own data, and a figure on screen always says what kind of evidence it rests on.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- coverage is unknown: the primitives exist and 34 claims are registered as measured 2026-10-09, but which surfaces route their figures through them is not inventoried, and the admin surfaces are not in the publicV2 primitive's scope at all

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Evidence-class and sample-data labelling audit
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.evidence_labeling_and_sample_data_audit`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
A customer can always tell demo data from their own data, and a figure on screen always says what kind of evidence it rests on.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Find every rendered metric or figure on in-scope surfaces.
- Check each resolves through the claim and evidence primitives rather than being a bare literal.
- Render sample mode and live mode and compare: a difference of one badge string is the recorded failure, not a pass.
- Verify each evidence state carries text and a glyph, not colour alone, so it survives greyscale and colour-blindness.
**Inputs**
- surfaces rendering metrics, dashboards or sample data
- the four evidence classes: verified, anonymized, illustrative, pending
**Outputs**
- metrics rendered without an evidence class
- sample-mode surfaces not visually distinguishable from live mode
- status conveyed by colour alone, which the primitives already forbid
**Exceptions that must be handled**
- A figure that is structurally part of a layout, such as a step number, is not a claim.
- Internal admin dashboards may carry a different labelling obligation from public surfaces; the manager sets that.
- A screenshot of demo data leaving the product is the original harm and is a capture-pipeline concern as well as a UI one.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- typescript_ast_scan
- headless_browser_sandbox
- claims_registry_read
- screenshot_capture_sandbox
- report_renderer
**Application surfaces**
- frontend/src/pages/publicV2/HomeV2.tsx
- frontend/src/pages/publicV2/OpportunityLabV2.tsx
- frontend/src/pages/publicV2/PricingV2.tsx
**Source modules**
- frontend/src/components/publicV2/Claim.tsx
- frontend/src/config/claimsRegistry.ts
**Dependencies**
- the claims registry remaining the single claim authority
- a sandbox able to render both sample and live modes
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: How honest the product looks is a brand and trust decision. The agent finds unlabelled figures and indistinguishable modes; a human decides the label and the visual treatment.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Defines which surfaces owe an evidence class and what makes sample mode adequately distinct.

Acceptance: Manager-approved definition covering public and admin surfaces separately.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- coverage is unknown: the primitives exist and 34 claims are registered as measured 2026-10-09, but which surfaces route their figures through them is not inventoried, and the admin surfaces are not in the publicV2 primitive's scope at all
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- frontend/src/components/publicV2/Claim.tsx:5
- frontend/src/components/publicV2/Claim.tsx:11
- frontend/src/components/publicV2/Claim.tsx:23
- frontend/src/components/publicV2/Claim.tsx:32
- frontend/src/components/publicV2/Claim.tsx:111
- frontend/src/config/claimsRegistry.ts:26
- frontend/src/config/claimsRegistry.ts:48

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Manager-approved definition covering public and admin surfaces separately.

When every box above is ticked, stop and show the demo.

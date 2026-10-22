# product_experience.CAP.multi_brand_surface_consistency_audit — Cross-brand consistency audit across the platform and the three public apps

Four separately-built surfaces stay recognisably one company where they should and deliberately distinct where they should, with the difference recorded rather than accidental.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- intended-divergence statement absent, so the ratio of real findings to intended differences is unknown
- whether the Product Experience domain owns the three public apps at all is unknown; Website Portfolio & Conversion is a separate domain with its own manager (docs/architecture/ai-workforce-management/AI_EMPLOYEE_ROSTER.md:36), and the boundary has not been drawn

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Cross-brand consistency audit across the platform and the three public apps
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.multi_brand_surface_consistency_audit`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
Four separately-built surfaces stay recognisably one company where they should and deliberately distinct where they should, with the difference recorded rather than accidental.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Read each brand's declared design system and token set.
- Build a comparison across the four surfaces for shared concepts: primary, surface, text, spacing scale, type scale, radius.
- Mark each divergence against the manager's intended-divergence list.
- Report unexplained divergences; report missing intent as unknown rather than assuming convergence is wanted.
**Inputs**
- each app's DESIGN_SYSTEM.md and token files
- frontend/src/styles/tokens.css and brand-bridge.css
- the manager's statement of which brands must converge and which must stay distinct
**Outputs**
- a per-brand token comparison table
- a list of divergences flagged as intended or unexplained
- unknown wherever a brand's intended relationship to the others has not been stated
**Exceptions that must be handled**
- Deliberate brand separation is the normal case for distinct companies and must never be reported as drift.
- validate-app-boundaries.js forbids apps importing each other or the platform frontend, so a shared component is not an available remedy and must not be proposed as one.
- A brand with no DESIGN_SYSTEM.md cannot be audited for intent; that absence is the finding.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- css_token_parser
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- apps/ai-flotation-public/src/assets/design/
- apps/cpn-public/src/assets/design/
- apps/refactored-public/src/assets/design/
- frontend/src/styles/brand-bridge.css
- scripts/validate-app-boundaries.js
**Dependencies**
- the manager's intended-divergence statement, which does not exist today
- the extraction boundary rules enforced by validate-app-boundaries.js
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Whether two brands should look alike is a positioning decision, not a lint result. The agent can only compare and report; the intent against which divergence is judged comes from a human, so it stays below shadow mode until that reference exists.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Draws the ownership boundary against the Website domain and records which brands must converge.

Acceptance: Mohammed Abdul Aleem and the Website domain's manager agree in writing which surfaces this domain audits.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- intended-divergence statement absent, so the ratio of real findings to intended differences is unknown
- whether the Product Experience domain owns the three public apps at all is unknown; Website Portfolio & Conversion is a separate domain with its own manager (docs/architecture/ai-workforce-management/AI_EMPLOYEE_ROSTER.md:36), and the boundary has not been drawn
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- apps/ai-flotation-public/src/assets/design/DESIGN_SYSTEM.md:1
- apps/cpn-public/src/assets/design/DESIGN_SYSTEM.md:1
- apps/refactored-public/src/assets/design/styles.css:1
- scripts/validate-app-boundaries.js:1
- .github/workflows/design-system-sync.yml:99
- frontend/src/styles/brand-bridge.css:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Mohammed Abdul Aleem and the Website domain's manager agree in writing which surfaces this domain audits.

When every box above is ticked, stop and show the demo.

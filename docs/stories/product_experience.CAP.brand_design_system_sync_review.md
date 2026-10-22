# product_experience.CAP.brand_design_system_sync_review — Review the vendored design-system drift pull request

Every upstream token change that would restyle a live brand site arrives with a written statement of what it changes visually and where, so the human merging it is reviewing a described change rather than a colour diff.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the set of surfaces consuming each token is not mapped today, so first-run impact coverage is unknown

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Review the vendored design-system drift pull request
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.brand_design_system_sync_review`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
Every upstream token change that would restyle a live brand site arrives with a written statement of what it changes visually and where, so the human merging it is reviewing a described change rather than a colour diff.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Detect the open design-system-sync pull request and read its diff and sync log.
- For each changed token, find the surfaces that consume it across the platform frontend and the three public apps.
- Recompute contrast for any foreground/background pair the change affects.
- Write the impact note onto the pull request as a comment.
- Stop. The merge is the human's, by the workflow's own stated design.
**Inputs**
- the chore/design-system-sync branch diff
- the sync log produced by syncDesignSystems.js
- the vendored token files under apps/*/src/assets/design/
**Outputs**
- a per-brand visual impact note: which tokens moved, which surfaces consume them
- a contrast re-check on any colour pair the diff touches
- an explicit 'needs a human eye' flag where the impact cannot be derived statically
**Exceptions that must be handled**
- A font-file-only change has no colour impact and should say so rather than manufacture one.
- A token that no surface consumes is a dead token; that is a finding, not a no-op.
- If the sync log shows a failed sync, the review must report the failure rather than review a partial diff.
- Hand-authored files in the same directories are excluded by the ownership manifest and must not be reviewed as upstream drift.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- git_diff_read
- css_token_parser
- contrast_calculator
- pull_request_comment
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- backend/src/scripts/syncDesignSystems.js
- scripts/validate-app-boundaries.js
- apps/ai-flotation-public/src/assets/design/
- apps/cpn-public/src/assets/design/
- apps/refactored-public/src/assets/design/
**Dependencies**
- the design-system-sync workflow continuing to open a pull request rather than committing
- read access to apps/*/src/assets/design/
- a contrast calculator
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: The workflow's own comment states these are live brand styles and that the pull request IS the review. An agent that could merge it would delete the control the workflow was built to create, so the ceiling sits at multi-step sandbox analysis with a written recommendation and no merge authority.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Defines what a brand impact note must contain and what makes one insufficient for a merge decision.

Acceptance: The manager confirms the note format answers the question he actually has before merging.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the set of surfaces consuming each token is not mapped today, so first-run impact coverage is unknown
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .github/workflows/design-system-sync.yml:8
- .github/workflows/design-system-sync.yml:23
- .github/workflows/design-system-sync.yml:65
- .github/workflows/design-system-sync.yml:87
- .github/workflows/design-system-sync.yml:99
- backend/src/scripts/syncDesignSystems.js:1
- scripts/validate-app-boundaries.js:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The manager confirms the note format answers the question he actually has before merging.

When every box above is ticked, stop and show the demo.

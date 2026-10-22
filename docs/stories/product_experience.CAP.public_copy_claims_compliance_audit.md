# product_experience.CAP.public_copy_claims_compliance_audit — Public copy and claims compliance audit

What the product says about itself on customer-facing surfaces stays inside the claims the company can actually support, and inside the advertising rules that bind it.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the rule set is one rule wide. bannedCopyScanner.ts:50 defines only tac-807-172-d-free; whether other advertising or claim rules bind these surfaces is unknown and is a compliance question, not an engineering one
- brandGovernance.ts is not wired to any frontend surface: its callers measured 2026-10-09 are its own seed, service, tests and composerService, so public React copy is governed only by the single-rule ratchet

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Public copy and claims compliance audit
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.public_copy_claims_compliance_audit`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
What the product says about itself on customer-facing surfaces stays inside the claims the company can actually support, and inside the advertising rules that bind it.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Scan the in-scope React source for each banned-word rule using the existing AST-aware scanner, which distinguishes user-facing copy from identifiers and comments.
- Compare against the recorded baseline: a new file with a violation, or an old file with more violations, is a failure; fewer means the ratchet turns.
- Separately scan public surfaces for claim-shaped string literals that bypass the claims registry.
- Assert the file count against a floor before believing any result, because the first draft of a sibling lint scanned 1 value instead of 77 and reported clean.
- Report. Changing published copy is a human decision.
**Inputs**
- the React source in the baseline scope
- the banned-word rule set, today a single rule
- the claims registry and its verification statuses
**Outputs**
- new banned-copy occurrences outside the recorded baseline
- unverified claims rendered as string literals rather than through the registry
- a shrink-only baseline update when violations are genuinely fixed
- unclassified occurrences reported as failures, never as passes
**Exceptions that must be handled**
- An occurrence the scanner cannot classify is a scanner defect and must fail rather than pass. This is already the stated design of the existing lint.
- Only one banned-word rule exists today; extending the rule set is a compliance decision, not an implementation detail.
- brandGovernance.ts deliberately holds no rules of its own and reads whatever rules it is handed, so per-brand rule data must exist before it can govern a brand's surfaces.
- Legal and regulatory wording is never drafted by the agent.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- typescript_ast_scan
- copy_lint_scanner
- claims_registry_read
- jest_runner
- report_renderer
**Application surfaces**
- frontend/src/pages/publicV2/HomeV2.tsx
- frontend/src/pages/publicV2/PricingV2.tsx
- frontend/src/pages/publicV2/PlatformV2.tsx
- frontend/src/pages/publicV2/TryV2.tsx
- frontend/src/pages/publicV2/SignupV2.tsx
**Source modules**
- backend/src/services/content/bannedCopyScanner.ts
- backend/src/services/content/frontendCopyBaseline.ts
- backend/src/services/content/brandGovernance.ts
- backend/src/services/content/brandGovernanceService.ts
- frontend/src/config/claimsRegistry.ts
- frontend/src/components/publicV2/Claim.tsx
**Dependencies**
- the existing scanner and baseline remaining the single authority
- per-brand rule data for brandGovernance.ts, which is not wired to the frontend today
- legal input for any new rule
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Published copy is customer-facing and carries regulatory exposure, so a human decides every wording change. The agent stays at multi-step sandbox analysis; it does not even reach shadow mode for rule authorship, because no approved reference set of correct copy exists to shadow against.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Records which rules bind which surfaces, who owns each rule, and what the agent may never draft.

Acceptance: Written rule ownership, with legal sign-off recorded for any regulatory rule.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the rule set is one rule wide. bannedCopyScanner.ts:50 defines only tac-807-172-d-free; whether other advertising or claim rules bind these surfaces is unknown and is a compliance question, not an engineering one
- brandGovernance.ts is not wired to any frontend surface: its callers measured 2026-10-09 are its own seed, service, tests and composerService, so public React copy is governed only by the single-rule ratchet
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- backend/src/services/content/bannedCopyScanner.ts:50
- backend/src/services/content/bannedCopyScanner.ts:249
- backend/src/services/content/frontendCopyBaseline.ts:33
- backend/src/services/content/frontendCopyBaseline.ts:108
- backend/src/services/content/frontendCopyBaseline.ts:122
- backend/src/services/content/__tests__/frontendCopyLint.test.ts:18
- frontend/src/config/claimsRegistry.ts:86
- frontend/src/components/publicV2/Claim.tsx:1
- backend/src/services/content/brandGovernance.ts:1
- backend/src/services/content/brandGovernance.ts:17

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Written rule ownership, with legal sign-off recorded for any regulatory rule.

When every box above is ticked, stop and show the demo.

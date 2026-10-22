# product_experience.CAP.unrouted_page_detection — Unrouted and orphaned page detection

Nobody maintains, tests or reviews a page the product cannot reach, and nobody deletes one that is deliberately parked, because the difference is recorded.

**Built today:** absent. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- no parked-page register exists, so the parked-versus-stranded split is unknown for every orphan except SignupV2, which App.tsx documents in a comment
- measured 2026-10-09 by import-graph walk from the four route trees and App.tsx: 477 non-test page components, 445 route-reachable, 32 unreachable, of which 17 are never imported by any non-test module. The largest cluster is frontend/src/pages/admin/AdminAISettingsPage.tsx, which is never imported and strands 13 route-unreachable tab components under frontend/src/pages/admin/ai-settings/. Independent grep confirmed zero references to AdminAISettingsPage, OperationsCenterPage, AdminGovernancePage, AdminSequencesPage, PilotZeroRiskPage and StrategyCallPrepPage anywhere outside their own files

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Unrouted and orphaned page detection
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.unrouted_page_detection`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** absent · **Source:** existing_application
## The business outcome
Nobody maintains, tests or reviews a page the product cannot reach, and nobody deletes one that is deliberately parked, because the difference is recorded.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Build the module import graph over frontend/src, resolving directory and index imports and React.lazy dynamic imports.
- Mark everything reachable from the four route trees and App.tsx.
- Partition the page set into reachable, imported-but-unreachable, and never-imported.
- Group never-imported parents with the subtrees they strand, so a cluster is reported once rather than as many findings.
- Check each orphan against the parked register and against in-repo comments before proposing anything.
- Report. Deletion is a separate, human decision.
**Inputs**
- the four route trees plus App.tsx as reachability roots
- the import graph of frontend/src
- a register of deliberately parked pages, which does not exist as data today
**Outputs**
- pages reachable from a route
- pages imported by something but not route-reachable
- pages never imported by any non-test module
- orphan clusters, where one unreachable parent strands a subtree
- a parked-or-stranded classification per orphan, or unknown
**Exceptions that must be handled**
- A deliberately parked page must never be reported as dead. App.tsx:116-124 documents exactly this for SignupV2, which is kept on purpose and whose comment ends 'Check what that button does before calling SignupV2 dead code'.
- A page reached only by a redirect or by a feature flag is reachable, and a naive graph walk will miss it.
- Test and fixture files are excluded from the page set but must still count as importers for the never-imported question, or a tested page looks dead.
- A route path built from a template string cannot be resolved statically and must be reported as unresolved.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- import_graph_analyzer
- typescript_ast_scan
- report_renderer
**Application surfaces**
- frontend/src/pages/admin/AdminAISettingsPage.tsx
- frontend/src/pages/admin/ops/OperationsCenterPage.tsx
- frontend/src/pages/admin/AdminGovernancePage.tsx
- frontend/src/pages/admin/AdminSequencesPage.tsx
- frontend/src/pages/admin/AdminLeadDetailPage.tsx
- frontend/src/pages/admin/AdminCurriculumTab.tsx
- frontend/src/pages/admin/ai-settings/DepartmentAgentsTab.tsx
- frontend/src/pages/admin/orchestration/CurriculumTypesTab.tsx
- frontend/src/pages/admin/orchestration/PromptControlTab.tsx
- frontend/src/pages/PilotAITeamPage.tsx
- frontend/src/pages/PilotExclusivePage.tsx
- frontend/src/pages/PilotZeroRiskPage.tsx
- frontend/src/pages/StrategyCallPrepPage.tsx
- frontend/src/pages/publicV2/SignupV2.tsx
**Source modules**
- frontend/src/routes/adminRoutes.tsx
- frontend/src/routes/portalRoutes.tsx
- frontend/src/routes/publicRoutes.tsx
- frontend/src/routes/referralRoutes.tsx
- frontend/src/App.tsx
**Dependencies**
- a parked-page register, which does not exist
- the import graph staying statically resolvable
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: Reachability is a computed fact with a checkable reference answer, so shadow mode is appropriate. It stops below automation because acting on a finding means deleting or routing a page, which changes the product.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Defines reachability, the roots, and the parked-page register's format and owner.

Acceptance: Manager-approved definition, and a parked register seeded with at least the SignupV2 case already documented in App.tsx.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- no parked-page register exists, so the parked-versus-stranded split is unknown for every orphan except SignupV2, which App.tsx documents in a comment
- measured 2026-10-09 by import-graph walk from the four route trees and App.tsx: 477 non-test page components, 445 route-reachable, 32 unreachable, of which 17 are never imported by any non-test module. The largest cluster is frontend/src/pages/admin/AdminAISettingsPage.tsx, which is never imported and strands 13 route-unreachable tab components under frontend/src/pages/admin/ai-settings/. Independent grep confirmed zero references to AdminAISettingsPage, OperationsCenterPage, AdminGovernancePage, AdminSequencesPage, PilotZeroRiskPage and StrategyCallPrepPage anywhere outside their own files
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- frontend/src/routes/adminRoutes.tsx:305
- frontend/src/routes/portalRoutes.tsx:143
- frontend/src/routes/publicRoutes.tsx:76
- frontend/src/routes/referralRoutes.tsx:17
- frontend/src/App.tsx:56
- frontend/src/App.tsx:116
- frontend/src/pages/admin/AdminAISettingsPage.tsx:1
- frontend/src/pages/admin/ops/OperationsCenterPage.tsx:1
- frontend/src/pages/admin/AdminGovernancePage.tsx:1
- frontend/src/pages/publicV2/SignupV2.tsx:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Manager-approved definition, and a parked register seeded with at least the SignupV2 case already documented in App.tsx.

When every box above is ticked, stop and show the demo.

# product_experience.CAP.route_surface_inventory — Route and surface inventory with review-coverage map

There is one current answer to 'what surfaces does this product have, and which of them has anybody actually looked at', so review effort goes where there is no coverage.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- measured 2026-10-09: 160 literal path attributes across the four route trees (93 admin, 38 portal, 27 public, 2 referral) plus inline routes in App.tsx. The true surface count is unknown because parameterised routes expand to many real surfaces and nested paths are composed rather than literal
- review coverage is thin and the exact share is unknown: tests/systemV2/v2-page-health.js sweeps 11 public V2 routes, and no equivalent sweep exists for the 93 admin or 38 portal route paths

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Route and surface inventory with review-coverage map
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.route_surface_inventory`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
There is one current answer to 'what surfaces does this product have, and which of them has anybody actually looked at', so review effort goes where there is no coverage.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Extract route paths and their components from all four trees and the inline routes in App.tsx.
- Resolve each route's guard and audience: public, portal, admin, referral.
- Join against the page-health route list, the capture scripts and the review docs to compute coverage.
- Rank never-reviewed routes by audience exposure for the manager's attention.
**Inputs**
- the route trees
- the capture-script inventory under scripts/
- the review-doc corpus under docs/
**Outputs**
- every route path with its component and auth context
- per-route coverage flags: smoke-swept, screenshotted, accessibility-audited, never reviewed
- unknown for routes whose auth context cannot be resolved statically
**Exceptions that must be handled**
- Dynamic and parameterised routes represent many real surfaces and must not be counted as one.
- A redirect route is not a surface.
- Nested and index routes compose into paths that are not literal strings in any one file.
- Routes gated by a feature flag may be unreachable in practice; flag state is not in the source.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- typescript_ast_scan
- import_graph_analyzer
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- frontend/src/routes/
- frontend/src/App.tsx
- tests/systemV2/v2-page-health.js
- scripts/captureHelpers.js
**Dependencies**
- the orphan detection capability, which answers the inverse question
- a stable naming convention for review docs
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: An inventory is a read-only derived fact, shadow-comparable against a human-checked list. No customer-visible change follows directly from it, but it stops below automation because its consumers are the audits that do propose changes.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Defines what counts as one surface, how parameterised routes are counted, and what counts as review coverage.

Acceptance: Written, manager-approved counting rule; no inventory published under an undefined rule.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- measured 2026-10-09: 160 literal path attributes across the four route trees (93 admin, 38 portal, 27 public, 2 referral) plus inline routes in App.tsx. The true surface count is unknown because parameterised routes expand to many real surfaces and nested paths are composed rather than literal
- review coverage is thin and the exact share is unknown: tests/systemV2/v2-page-health.js sweeps 11 public V2 routes, and no equivalent sweep exists for the 93 admin or 38 portal route paths
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
- frontend/src/App.tsx:44
- tests/systemV2/v2-page-health.js:8
- tests/systemV2/storyVisualReview.js:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Written, manager-approved counting rule; no inventory published under an undefined rule.

When every box above is ticked, stop and show the demo.

# product_experience.CAP.page_health_smoke_sweep — Page-health smoke sweep on direct load and client-side navigation

A surface that renders empty, errors in the console, overflows horizontally or breaks its images is caught by a sweep rather than by a customer.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- coverage beyond the 11 public V2 routes is absent, and the admin and portal sweeps would need authenticated sessions that are not provisioned
- current platform-wide page health is unknown; no sweep result is stored in the repo beyond tests/systemV2/logs/run-1.md

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Page-health smoke sweep on direct load and client-side navigation
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.page_health_smoke_sweep`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
A surface that renders empty, errors in the console, overflows horizontally or breaks its images is caught by a sweep rather than by a customer.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Visit each route by direct load and again by client-side navigation, because the original bug only appeared on the second.
- Probe for the existing signals: h1 presence, section count, hidden reveal elements, content height below the hero, text length, broken images, horizontal overflow.
- Collect page errors and failed network responses.
- Fail the sweep on any route failing in either mode and report which mode.
**Inputs**
- the agreed route list
- a rendered sandbox deployment
- the existing thresholds: an h1 present, no hidden reveal elements, content below the hero, no horizontal overflow, no broken images
**Outputs**
- a per-route pass table in both navigation modes
- console errors and 4xx or 5xx responses per route
- unknown for routes that failed to load
**Exceptions that must be handled**
- A surface legitimately behind authentication needs a session; an unauthenticated probe will report a false empty.
- A legitimately short page will trip the content-below-hero threshold and needs an explicit exemption.
- Third-party script errors are reported separately from product errors.
- A sweep that renders nothing must report unknown; a probe that silently reads an empty page would report every route clean.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- headless_browser_sandbox
- repo_read
- report_renderer
**Application surfaces**
- the 11 routes already listed in v2-page-health.js:8; extension to the 93 admin and 38 portal route paths is not implemented
**Source modules**
- tests/systemV2/v2-page-health.js
**Dependencies**
- a sandbox deployment of the frontend
- a sandbox browser
- session credentials for authenticated routes
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R5**.
Why that ceiling: The checks are objective, already written, and comparable against a known-good run, so shadow mode fits. It stays below automation because every remedy is a code or layout change that a human reviews.

Not a human-reserved decision, but promotion is still evidence-based and one step at a time.
**First release behaviour (autonomy:R0)**
Defines the route list, the thresholds, the exemptions and what a sweep failure obliges.

Acceptance: Manager-approved route list and threshold set, including exemptions for legitimately short pages.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- coverage beyond the 11 public V2 routes is absent, and the admin and portal sweeps would need authenticated sessions that are not provisioned
- current platform-wide page health is unknown; no sweep result is stored in the repo beyond tests/systemV2/logs/run-1.md
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- tests/systemV2/v2-page-health.js:1
- tests/systemV2/v2-page-health.js:8
- tests/systemV2/v2-page-health.js:24
- tests/systemV2/v2-page-health.js:29
- tests/systemV2/v2-page-health.js:30
- tests/systemV2/v2-page-health.js:50

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Manager-approved route list and threshold set, including exemptions for legitimately short pages.

When every box above is ticked, stop and show the demo.

# product_experience.CAP.image_alt_and_media_accessibility_aud — Image, media and icon alternative-text audit

Non-text content carries a correct text alternative, so the product's meaning survives for screen-reader users and for anyone whose images fail to load.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the count is unknown. A single-line regex scan on 2026-10-09 found 109 img elements in frontend/src/**/*.tsx of which 8 had no alt attribute on the matched line, but multi-line JSX attributes are invisible to that scan, so both figures are lower bounds
- no inventory exists of which images are decorative

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Image, media and icon alternative-text audit
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.image_alt_and_media_accessibility_audit`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
Non-text content carries a correct text alternative, so the product's meaning survives for screen-reader users and for anyone whose images fail to load.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Scan the source for image, video and icon elements and record the presence and content of their text alternatives.
- Classify each: missing, placeholder, plausible description, or correctly empty for decorative.
- Render the agreed surfaces and record images that fail to load, reusing the naturalWidth check already written in v2-page-health.js.
- Propose alt text only where the surrounding content makes the meaning determinable; otherwise ask.
**Inputs**
- frontend/src/**/*.tsx image, video and icon usages
- the rendered surfaces, for images injected at runtime
**Outputs**
- images with no alt attribute
- images whose alt text is a filename or placeholder, which is worse than empty
- decorative images that should carry an empty alt rather than a description
- broken images, which v2-page-health.js already detects on its 11 routes
**Exceptions that must be handled**
- Whether an image is decorative is an editorial judgement the agent must not make silently; a wrong empty alt hides real content.
- Generated or user-uploaded media cannot have alt text authored at build time and needs a capture-time solution instead.
- Icon fonts carry no intrinsic alternative; the accessible name belongs on the control, which overlaps the keyboard-and-semantics audit.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- typescript_ast_scan
- headless_browser_sandbox
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- tests/systemV2/v2-page-health.js
- .claude/skills/fixing-accessibility/SKILL.md
**Dependencies**
- a sandbox browser for runtime images
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: Writing alt text is authoring customer-facing copy, so it is a human decision. The agent can find gaps and draft candidates but stays below shadow mode because there is no approved reference set of correct alt text to shadow against.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Defines what a good alternative is here and who decides decorative versus meaningful.

Acceptance: Written, manager-approved rule covering decorative images and icon-only controls.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- shipping any UI change requires push_to_protected_main and production_deploy, both default-denied capabilities (backend/src/services/delivery/execution/executionPolicy.ts:33); a human merges and deploys
- the count is unknown. A single-line regex scan on 2026-10-09 found 109 img elements in frontend/src/**/*.tsx of which 8 had no alt attribute on the matched line, but multi-line JSX attributes are invisible to that scan, so both figures are lower bounds
- no inventory exists of which images are decorative
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .claude/skills/fixing-accessibility/SKILL.md:51
- tests/systemV2/v2-page-health.js:29
- .claude/skills/fixing-accessibility/SKILL.md:115

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Written, manager-approved rule covering decorative images and icon-only controls.

When every box above is ticked, stop and show the demo.

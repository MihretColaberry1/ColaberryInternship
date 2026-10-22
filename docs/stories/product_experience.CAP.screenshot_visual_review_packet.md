# product_experience.CAP.screenshot_visual_review_packet — Assemble the screenshot-based design review packet

A human reviewer can judge a surface by looking at it, in one document, in a few minutes, which is what makes looking happen at all.

**Built today:** partial. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- capturing authenticated production surfaces needs a live credential; the existing script reads a gitignored token file, and no sandbox-safe equivalent is provisioned
- which surfaces need a packet each cycle is unknown until the manager sets the cadence

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Assemble the screenshot-based design review packet
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.screenshot_visual_review_packet`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** partial · **Source:** existing_application
## The business outcome
A human reviewer can judge a surface by looking at it, in one document, in a few minutes, which is what makes looking happen at all.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Take the agreed surface list and capture each stop through the shared helper, so the width clamp applies by construction.
- Write the capture summary with original width, final width and whether the image was downscaled, for every image.
- Assemble the per-stop review document following the existing pattern.
- Label any synthetic or injected content as synthetic, following the convention storyVisualReview.js already states.
- Hand the document to the reviewer.
**Inputs**
- the surface list for the sprint
- the safe capture viewport and the 1800 pixel width cap
- the review-document structure the skill defines
**Outputs**
- screenshots at or below the safe width, with a mandatory summary recording original and final width
- a per-stop review document a human reads top to bottom
- an explicit note wherever content shown is synthetic rather than real
**Exceptions that must be handled**
- A retina capture is permitted only for human-embedded review images, never for an image an agent will read back.
- Any final width above 1800 pixels is a process violation, not a warning.
- A full-page capture of a very tall surface produces an unreadable image and a context hazard; walk the page a screen at a time instead.
- Capturing an authenticated production surface needs a credential, and that credential must never be committed.
- Synthetic content proves nothing about real content and must be reported as synthetic.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- screenshot_capture_sandbox
- headless_browser_sandbox
- repo_read
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- scripts/captureHelpers.js
- scripts/captureProductionScreenshots.js
- tests/systemV2/storyVisualReview.js
- tests/systemV2/storyHeroMeasure.js
**Dependencies**
- scripts/captureHelpers.js remaining the single capture path
- a sandbox browser
- a credential path for authenticated surfaces
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R4**.
Why that ceiling: The packet exists so a human can make the visual judgement, so the capability is complete at preparing it. Automating the judgement would defeat the purpose of the artefact, which keeps this below autonomy:R5.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Defines the packet's structure, the surface list, the cadence and the synthetic-content labelling rule.

Acceptance: Manager-approved structure and cadence; the width cap and summary requirement restated as hard gates.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- capturing authenticated production surfaces needs a live credential; the existing script reads a gitignored token file, and no sandbox-safe equivalent is provisioned
- which surfaces need a packet each cycle is unknown until the manager sets the cadence
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- .claude/skills/screenshot-review/SKILL.md:26
- .claude/skills/screenshot-review/SKILL.md:27
- .claude/skills/screenshot-review/SKILL.md:30
- .claude/skills/screenshot-review/SKILL.md:37
- .claude/skills/screenshot-review/SKILL.md:41
- scripts/captureHelpers.js:18
- scripts/captureHelpers.js:84
- scripts/captureProductionScreenshots.js:1
- tests/systemV2/storyVisualReview.js:1
- docs/POST_DEPLOY_WALKTHROUGH.html:1

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Manager-approved structure and cadence; the width cap and summary requirement restated as hard gates.

When every box above is ticked, stop and show the demo.

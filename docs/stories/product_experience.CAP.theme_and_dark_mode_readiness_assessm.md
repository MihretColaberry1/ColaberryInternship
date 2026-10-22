# product_experience.CAP.theme_and_dark_mode_readiness_assessm — Theme and dark-mode readiness assessment

Before anyone commits to a second theme, there is a measured answer to what it would cost and whether the token layer can carry it.

**Built today:** absent. **Requirement validated:** draft -- Mohammed Abdul Aleem must confirm scope, exceptions and success measures; he has no admin login today

**Blocked by**
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- the token layer has no theme hook today: measured 2026-10-09, tokens.css defines 101 custom properties in a single :root block at line 6 with no prefers-color-scheme and no data-theme selector anywhere in the file
- the cost is unknown until the raw-colour footprint is classified; 4,492 hex literals in TSX, 1,778 in non-token CSS and 8,219 inline style blocks were measured, but the share that is theme-relevant is unknown
- no product decision exists that a second theme is wanted

Full build prompt is attached to this story.

**Release:** r2 · r2 (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Theme and dark-mode readiness assessment
**Domain:** Product Experience & UI/UX · **Capability:** `product_experience.theme_and_dark_mode_readiness_assessment`
**Accountable human:** Mohammed Abdul Aleem · **Validation state:** draft
**Built today:** absent · **Source:** proposed_new
## The business outcome
Before anyone commits to a second theme, there is a measured answer to what it would cost and whether the token layer can carry it.
Intended users: Mohammed Abdul Aleem (accountable manager), frontend engineers, Ali Muwwakkil (DRI).
## The human-operable process, as it works now
This must be operable by a person before an agent touches it. If a human cannot do it by hand
against the surfaces below, the agent version has nothing to stand on.
**Workflow**
- Establish what the token layer would need to express a second theme.
- Measure how much of the rendered product is painted through tokens versus through raw values.
- Identify the surfaces where a theme switch would break first.
- Report readiness with the measurement behind it. Do not start the work.
**Inputs**
- the token layer
- the measured raw-colour footprint outside it
- the surfaces a second theme would have to cover
**Outputs**
- a readiness verdict with the reasoning shown
- the blocking work, ranked
- a cost estimate, or unknown where the footprint is not yet classified
**Exceptions that must be handled**
- A high-contrast mode is not a dark mode and already partially exists through a prefers-contrast block; conflating them would misstate both the cost and the benefit.
- The three public brand apps carry their own token sets and would each need their own answer.
- Introducing a theme is a product decision well above this capability's authority.
## The tool interface
**Tools this capability requires** (none is one of the eight default-denied capabilities;
anything that would need one is listed under blockers instead)
- repo_read
- css_token_parser
- report_renderer
**Application surfaces**
_none -- a surface may need building first_
**Source modules**
- frontend/src/styles/tokens.css
- frontend/src/styles/brand-bridge.css
- frontend/src/styles/responsive.css
**Dependencies**
- the design-token drift audit, which supplies the raw-colour classification
- a product decision on whether a second theme is wanted at all
## The agent behaviour that uses it
Starting autonomy **autonomy:R0**; ceiling **autonomy:R2**.
Why that ceiling: This is an assessment that informs a product decision, not a change. Its ceiling is answering the readiness question from measured evidence; the decision it informs is not the agent's to make.

**THIS IS A HUMAN DECISION.** It stays human-required at every autonomy level, forever. An
agent may prepare, summarise and propose; it may never decide. No amount of evidence
promotes this into automation.
**First release behaviour (autonomy:R0)**
Frames the question and names what evidence a credible readiness verdict needs.

Acceptance: A written assessment scope; no implementation work proposed or begun.
## Before you start
- no_ai_employee_provisioned: agent_id is null for this domain (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)
- manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row (d2efd70b-4016-4ad6-bd7b-cf0610c93370) but no admin_users row, so he cannot open his agent's Agent Detail or Talk surface (.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-46; docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13)
- the token layer has no theme hook today: measured 2026-10-09, tokens.css defines 101 custom properties in a single :root block at line 6 with no prefers-color-scheme and no data-theme selector anywhere in the file
- the cost is unknown until the raw-colour footprint is classified; 4,492 hex literals in TSX, 1,778 in non-token CSS and 8,219 inline style blocks were measured, but the share that is theme-relevant is unknown
- no product decision exists that a second theme is wanted
## Evidence this is done
Cite the real thing: a named passing test, a measured figure with its query, or a file:line.
**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, or a mocked test passing. Mohammed Abdul Aleem evaluates the evidence, and
nothing here is validated yet.
## Evidence this capability rests on
- frontend/src/styles/tokens.css:6
- frontend/CLAUDE.md:35
- frontend/src/styles/brand-bridge.css:1
- frontend/src/styles/responsive.css:131
- .claude/skills/baseline-ui/SKILL.md:19

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] A written assessment scope; no implementation work proposed or begun.

When every box above is ticked, stop and show the demo.

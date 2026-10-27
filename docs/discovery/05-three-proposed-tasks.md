# Three proposed agent tasks: Product Experience & UI/UX

**Domain:** Product Experience & UI/UX (`product_experience`)
**Story:** `product_experience.RESEARCH-5-THREE-PROPOSED-TASKS` · Release: Discovery and validation
**Accountable human:** Mohammed Abdul Aleem
**Prepared by:** Mihret Netsereab · 2026-10-27
**Status:** proposal for manager review. Nothing here enables an agent, grants a tool or raises an
autonomy level. All three capabilities stay `draft` until Mohammed Abdul Aleem reviews them [T1].

All platform citations refer to the public Colaberry platform repository,
[`ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator`](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator),
read at commit `2a139ec6`, the same commit RESEARCH-4 used. Source tags such as **[T1]** point to
the Sources table at the end. Where no source exists, the text says **unknown**.

---

## The three tasks at a glance

| # | Task (capability) | Kind | Start | Ceiling | Approver |
|---|---|---|---|---|---|
| 1 | Route and surface inventory (`route_surface_inventory`) | Read-only detection, no human decision | `autonomy:R0` | `autonomy:R5` | Mohammed Abdul Aleem |
| 2 | WCAG 2.1 AA audit (`wcag_aa_accessibility_audit`) | Audit that ends in a human decision | `autonomy:R0` | `autonomy:R5` | Mohammed Abdul Aleem; dependency decision escalates to Ali Muwwakkil |
| 3 | Design review and decision queue (`manager_design_review_queue`) | The place his decisions are recorded | `autonomy:R0` | `autonomy:R2` | Mohammed Abdul Aleem |

Starting levels and ceilings are copied from the capability file, not chosen by me [T2].

### Why these three

They are chosen from the domain's 25 draft capabilities [T1], and together they cover the three
shapes of work this domain has:

1. **Task 1 finds things and changes nothing.** It is the lowest-risk way to see whether the agent
   is accurate, and it tells Task 2 which surfaces exist. RESEARCH-2 already suggested route
   inventory as a first build [T3].
2. **Task 2 finds problems whose fixes change what customers see.** Every fix is a human decision
   [T4], so it tests whether the boundary holds.
3. **Task 3 is where his decisions on Tasks 1 and 2 get recorded.** Without it, "a human
   approved this" has nowhere to live except a timer. That is the failure behind the platform's
   106 approval rows, all decided by `system:auto_approve_timeout` [T5].

**What none of these tasks can use as evidence.** The platform refuses four signals as grounds
for promotion: a story marked complete, elapsed time, a conversation that went well, and mocked
tests passing [T6]. It also refuses evidence with no source, evidence the agent evaluated itself,
and an approver who is not a recorded human [T7]. Every evidence item below is something a person
other than the agent can open and check.

---

## How the ceilings work (applies to all three)

The ladder runs from `autonomy:R0` (define the workflow) to `autonomy:R9` (proven reliable
operation) [T8]. Three rules in the code cap a capability no matter what is approved [T9]:

- **A ceiling only lowers.** Approval can never lift a capability above its `max_permitted_autonomy`.
- **No tools, no action.** With no tools granted, a capability is held at `autonomy:R2` (answering
  from approved knowledge). Today this domain has no agent and no tools granted [T10].
- **A human decision stays human.** If `human_decision` is true, the capability is held at
  `autonomy:R5` or below, at every level, forever.

Production is never reached by approval alone: `autonomy:R6` is a separately approved pilot [T9],
and pushing to protected `main` and deploying to production are denied to every agent [T11]. None
of the three tasks goes past `autonomy:R5`.

---

## Task 1: Route and surface inventory

`product_experience.route_surface_inventory` · start `autonomy:R0` · ceiling `autonomy:R5`

### Evidence it completed correctly

Each level has its own evidence. None of it is "the run finished".

| Level | Evidence | Who checks it |
|---|---|---|
| R0 | A written counting rule (what is one surface, how parameterised routes count, what counts as "reviewed"), with Mohammed Abdul Aleem's acceptance recorded by name and date [T12] | Mohammed Abdul Aleem |
| R2 | Every answer cites the route-tree file and line; an unresolved route is reported as unresolved [T12] | Anyone, by opening the cited line |
| R5 | A shadow run compared with a human-checked route list: a route added in a test branch appears within one cycle, a removed route disappears, and parameterised paths expand by the approved rule [T12]. Every disagreement is listed. | A human reviewer, never the agent [T7] |

**A check anyone can re-run.** The capability file measured 160 literal route paths on
2026-10-09: 93 admin, 38 portal, 27 public, 2 referral, plus inline routes in `App.tsx` [T13]. The
agent's raw path count must reproduce those numbers on the same commit before its expanded count
is believed. If they differ, the difference is the first finding.

**Agreement threshold:** **unknown**. No number is set; Mohammed Abdul Aleem sets it (RESEARCH-4
Q5) [T14]. Until he accepts one, the capability can't leave R0, because the platform refuses a
threshold that is only proposed [T15].

### What the task is

Produce one current list of every route in the product, its component, its audience (public,
portal, admin, referral), and whether anyone has reviewed it: smoke-swept, screenshotted,
accessibility-audited, or never reviewed [T16]. Then rank the never-reviewed routes by audience
exposure for his attention. Today only 11 public routes have a page-health sweep; no equivalent
exists for the 93 admin or 38 portal paths [T13].

### Tools and data it needs

- **Tools:** `repo_read`, `typescript_ast_scan`, `import_graph_analyzer`, `report_renderer` [T16].
  All are read or report-only. None of them writes to the codebase.
- **Data:** the four route trees and `App.tsx`, the capture scripts under `scripts/`, the review
  documents under `docs/`, and `tests/systemV2/v2-page-health.js` [T16].
- **Not available:** feature-flag state is not in the source, so flag-gated reachability is
  **unknown** to this task [T17].

### Boundary: what the agent must NOT do

- **Must not change any file** other than its own report. Its sandbox permissions are read,
  static analysis and writing the audit report; its production permissions are empty [T18].
- **Must not publish an inventory before the counting rule is approved** [T12].
- **Must not count a parameterised route as one surface, or a redirect as a surface** [T17].
- **Must not mark a route "reviewed" without naming the review artifact** that proves it. (My
  proposal; the source defines the coverage flags but not the proof for each.)
- **Must not guess a feature-flagged route's reachability.** It reports it as unknown [T17].

### Approval boundary and approver

- **Mohammed Abdul Aleem** approves the counting rule, the scope and the exceptions, and accepts
  or rejects each finding [T18][T19].
- The agent has no production action to approve. Merging and deploying are human-only and outside
  this task [T18].

### Why the ceiling is `autonomy:R5`

An inventory is a read-only fact that can be compared with a human-checked list, so shadow mode
(R5) is meaningful. It stops below automation because the audits that use it do propose changes
[T20]. **I propose holding it at R2 until he can open the output himself**, because before then
he can only judge descriptions of it (RESEARCH-4 access blocker) [T21].

### What would make me switch it off

- An inventory published under a rule he has not approved.
- Any row without a file and line, or an unresolved route shown as resolved.
- Its raw count disagreeing with the re-runnable 160-path check, unexplained.
- Any write outside its report.

---

## Task 2: WCAG 2.1 AA accessibility audit

`product_experience.wcag_aa_accessibility_audit` · start `autonomy:R0` · ceiling `autonomy:R5`

### Evidence it completed correctly

| Level | Evidence | Who checks it |
|---|---|---|
| R0 | A written standard per surface class (which surfaces carry AA, which carry a lower bar, what counts as a pass), approved by Mohammed Abdul Aleem; no audit has run yet [T22] | Mohammed Abdul Aleem |
| R1 | Against fixture components with known, seeded violations: each of the twelve checks catches its violation, reports clean on a clean fixture, and catches a removed label by name [T22] | A human reviewer reading the fixture results |
| R3 | On one named page, ranked findings using the skill's severity definitions, each citing a source line; no finding without a located line [T22] | Mohammed Abdul Aleem, finding by finding |
| R5 | A shadow audit compared with a human-reviewed reference audit: Critical and Major findings agree, every disagreement is listed, and no finding is invented [T22] | A human reviewer, never the agent [T7] |

**The R1 fixtures run the real check against real components**, so they are not the "mocked
test" the platform refuses [T6]. They still only prove R1. Passing them doesn't promote the
audit further.

**Contrast must be measured on the rendered page, not computed from tokens.** This surface has
shipped three invisible-text failures (1.06:1, 1.03:1, 1.00:1) that "every token check and every
unit test passed" [T23]. A token-level pass is listed as an exception, not as proof [T24].

**Agreement threshold for R5:** **unknown**. No number is set; Mohammed Abdul Aleem sets it [T14][T15].

### What the task is

Audit the agreed pages, in his priority order, against the twelve AA checks in the
`fixing-accessibility` skill: contrast, semantic HTML, ARIA, keyboard, form labels, alt text,
touch targets, reduced motion, high contrast, live regions, heading hierarchy and skip navigation.
Rank findings Critical / Major / Minor, and report any page it could not reach as **unknown**,
never as conformant [T25].

Current conformance is **unknown**: no audit has ever run. There are partial signals (649
`aria-label` uses; 29 of 68 CSS files honour `prefers-reduced-motion`), but they show work done,
not conformance [T26].

### Tools and data it needs

- **Tools:** `repo_read`, `typescript_ast_scan`, `headless_browser_sandbox`,
  `contrast_calculator`, `accessibility_rule_engine`, `sandbox_git_branch`, `report_renderer` [T27].
- **Data:** 445 route-reachable pages and 449 components (measured 2026-10-09), the twelve checks
  from the skill, and his surface priority order [T25].
- **Blocker:** no accessibility engine exists in the repo (no axe-core, eslint-plugin-jsx-a11y,
  pa11y or Lighthouse). Adding one is an external-dependency decision that must be escalated [T28].
  A sandbox deployment is also needed to render pages [T28].

### Boundary: what the agent must NOT do

- **Must not report a page as conformant if it didn't render and check it** [T25].
- **Must not apply one standard to admin and public pages.** He sets the obligation per class [T24].
- **Must not claim a contrast pass from token values alone** [T24].
- **Must not make a fix that changes visible layout or colour.** That is a visual change and goes
  to the visual-change approval gate, not this task [T24].
- **Must not push anything beyond a sandbox branch, merge or deploy.** Production permissions are
  empty, and protected-main push and deploy are denied [T27][T11].
- **Must not add an accessibility library itself** [T28].
- **Must not try to fix third-party embeds.** They are reported as upstream [T24].

**My proposal, narrower than the capability file:** in this first version the agent writes
findings only, no patches, until Task 3 exists to record his decision on each. The capability
allows a patch per finding on a sandbox branch [T25]; holding that back keeps the first version
to evidence he can judge without a merge question attached.

### Approval boundary and approvers

- **Mohammed Abdul Aleem** approves the per-class standard, the surface priority order and the
  exceptions, and accepts or rejects each finding [T22][T27].
- **Ali Muwwakkil (DRI)** receives the escalation for adding an accessibility engine. Platform
  rules route external dependencies to escalation, and name him as the owner who is notified [T28][T29].
- **Who merges and deploys an approved fix: unknown.** The capability file only says "human"
  [T27]. This is RESEARCH-4 Q4's follow-up.

### Why the ceiling is `autonomy:R5`

Auditing is safe and can be compared with a human reference audit, so shadow mode is meaningful.
It stops below automation because nearly every fix changes what customers see, which is a human
decision [T30]. The code enforces the same ceiling independently: `human_decision` is true, so the
ladder holds it at R5 or below [T9].

### What would make me switch it off

- Any page reported conformant that it didn't render.
- Any finding without a located source line.
- A contrast pass with no rendered measurement behind it.
- Any change outside a sandbox branch, or any change to visible layout or colour.
- Critical or Major findings disagreeing with the reference audit beyond the threshold he sets.

---

## Task 3: Design review and decision queue

`product_experience.manager_design_review_queue` · start `autonomy:R0` · ceiling `autonomy:R2`

### Evidence it completed correctly

| Level | Evidence | Who checks it |
|---|---|---|
| R0 | A written access plan naming how he reaches the queue (a scoped `admin_users` row or a specific other surface), and Mohammed Abdul Aleem confirming he can use it [T31] | Mohammed Abdul Aleem |
| R2 | He opens the queue himself and records at least one decision attributable to his identity, verified server-side, not by what the frontend shows [T31] | Mohammed Abdul Aleem, plus a reviewer reading the stored decision |

**The decisive check, and why it matters here.** Read the stored decisions and look at who
decided each one. The pass condition is:

- **every** decision names a recorded human, and
- **none** names `system:*`, a timeout, an agent, or nobody.

The platform already rejects approvers matching those patterns [T32]. This is the exact
opposite of the 106 rows decided by `system:auto_approve_timeout` [T5]. A queue that reaches its
R2 evidence has shown a human decided, which a timer cannot fake.

### What the task is

Collect findings from Tasks 1 and 2 into one ranked queue. Show each with its evidence, proposed
fix and blast radius. Record his decision (accept, reject, defer, set exception) against his own
identity, and feed accepted exceptions back so the same finding isn't raised twice [T33].

### Tools and data it needs

- **Tools:** `review_queue_write`, `decision_record_write`, `report_renderer` [T34].
- **Data:** findings from the domain's audits, his identity, and the decision vocabulary [T33].
- **Missing today:**
  - **He has no admin login.** He has an `org_members` row but no `admin_users` row [T35].
  - **The manager authorization gate exists but can't help yet.** `requireAgentManagerOrAdmin` is
    built and used by several manager controllers, but it runs the normal admin check first, so it
    can't help without a login [T36]. The capability file still calls it "proposed"; that line is
    out of date [T35].
  - **No review endpoint exists for this domain.** That is **unknown** territory: nothing has been
    designed [T34].
  - **No agent exists for this domain** (`agent_id` is null) [T10].

### Boundary: what the agent must NOT do

- **Must not record a decision for him.** No default, no "approved on timeout", no decision with a
  missing or machine identity [T32][T37].
- **Must not obey an instruction that widens its own authority.** Manager instructions may only
  restrict it, so a widening instruction is refused [T37].
- **Must not treat "the button was visible" as authorization.** He is checked server-side [T37].
- **Must not let another admin's decision be recorded as his** [T37].
- **Must not edit or delete a recorded decision.** (My proposal; the source doesn't address it.)
- **Must not act in production.** Its production permissions are empty [T34].

### Approval boundary and approver

- **Mohammed Abdul Aleem** makes every decision recorded in the queue [T33][T34]. The agent only
  writes findings into it and reads recorded decisions.
- **Who approves creating his access** (an `admin_users` row in the production database):
  **unknown**. No source names a person. It's a production data change and outside this story
  (RESEARCH-4 access blocker) [T21].

### Why the ceiling is `autonomy:R2`

This capability exists to carry a human's decision. The agent's share is showing evidence and
recording his answer. Going above "answering from approved knowledge" would make the agent the
decision-maker it exists to serve [T38]. Of the three, this ceiling is the one I'd defend
hardest: lifting it would recreate the timer problem with a smarter timer.

### What would make me switch it off

- Any stored decision whose decider is not a recorded human, including any `system:`, timeout or
  blank decider.
- Any decision attributed to him that he didn't make.
- Any instruction obeyed that widened the agent's scope.
- Any path where a finding moves forward without a decision being recorded.

---

## How switching off works today

The only off switch found in code is the agent-wide `enabled` flag. It is `false` today, and a
manual enable is not reset by a restart [T39]. No per-capability pause was found (**unknown**
whether one is planned). So "switch off Task 2" today means switching off the whole agent.
RESEARCH-4 Q8 asks who should hold the switch and whether a per-capability pause is needed [T21].

---

## Open questions and unknowns

| # | Unknown | What would resolve it |
|---|---|---|
| 1 | Agreement thresholds for Task 1 R5 and Task 2 R5 | Mohammed Abdul Aleem sets them (RESEARCH-4 Q5) and his acceptance is recorded by name |
| 2 | Who merges and deploys an approved accessibility fix | A named person in the capability's permissions (RESEARCH-4 Q4) |
| 3 | Who approves creating his access to the queue | A named owner for the `admin_users` change |
| 4 | Whether an accessibility engine is approved | Escalation outcome from Ali Muwwakkil |
| 5 | Feature-flag reachability of routes | A flag-state source the inventory can read; none exists in the repo |
| 6 | Whether a per-capability off switch is planned | A design note; only the agent-wide flag exists |

**Three items are my proposals, not source facts:** holding Task 1 at R2 until he can see output,
findings-only for Task 2's first version, and the "must not mark reviewed without an artifact" and
"must not edit a recorded decision" boundaries. Each is labelled where it appears.

---

## Sources

Paths are in `ColaberryEnterprise_AI_LeadershipAccelerator` at commit `2a139ec6` unless marked
"this repository". **CAP** is `backend/src/services/agentDomain/capabilities/product_experience.json`.
**AD** is `backend/src/services/agentDomain/`.

| Tag | Claim | Citation |
|---|---|---|
| T1 | 25 capabilities, all `draft`; each waits on Mohammed Abdul Aleem | CAP:3-17 (`counts.distinct_capabilities: 25`); `requirement_validation_state` at CAP:1000, CAP:400, CAP:2059 |
| T2 | Start and ceiling for the three tasks | CAP:1066-1067, CAP:474-475, CAP:2123-2124 |
| T3 | RESEARCH-2 suggested route inventory or unrouted-page detection first | This repository: `docs/discovery/04-manager-interview.md` Q1, citing RESEARCH-2 |
| T4 | WCAG audit is `human_decision: true` | CAP:473 |
| T5 | 106 approval rows, one distinct decider `system:auto_approve_timeout`; gate is "a 4.25-hour delay followed by an automatic yes" | `docs/architecture/ai-workforce-management/APPROVAL_DROP_QUEUE_2026-10-06.md:44-46`, `:92-95` |
| T6 | Four non-promoting signals | AD `promotionCriteria.ts:10-11`, `:46-51` |
| T7 | Evidence needs a source; evaluator is never the agent; approver must be a recorded human | AD `promotionCriteria.ts:24-28`, `:117-121`, `:150-162` |
| T8 | Meaning of each rung R0–R9 | AD `autonomyLadder.ts:58-69` |
| T9 | Ceiling only lowers; production needs R6 pilot; no tools caps at R2; human decision caps at R5 | AD `autonomyLadder.ts:195-220` |
| T10 | No agent for this domain; registry entries start `enabled: false`, `tools_granted: []` | CAP:1070; `backend/src/services/agentRegistry/domainAgents.ts:22-29`, `:66-72` |
| T11 | `production_deploy` and `push_to_protected_main` denied for all agents | `backend/src/services/delivery/execution/executionPolicy.ts:33-42` |
| T12 | Route inventory R0/R2/R5 behaviour and acceptance criteria | CAP:1075-1090 |
| T13 | 160 literal route paths (93/38/27/2); 11 public routes swept, none for admin or portal | CAP:1072-1073 |
| T14 | No threshold set; he sets it | This repository: `docs/discovery/04-manager-interview.md` Q5 |
| T15 | A threshold stays `proposed` until a named human accepts it | AD `promotionCriteria.ts:18-22`, `:103-113` |
| T16 | Route inventory outcome, inputs, outputs, workflow, tools, source modules | CAP:982, CAP:1002-1017, CAP:1030-1041 |
| T17 | Parameterised, redirect, nested and flag-gated route exceptions | CAP:1018-1023 |
| T18 | Route inventory permissions: sandbox read/analyse/report; production agent `[]` | CAP:1042-1064 |
| T19 | Route inventory intended users include Mohammed Abdul Aleem | CAP:983-987 |
| T20 | Route inventory ceiling rationale | CAP:1068 |
| T21 | Access blocker, approval for access unknown, off-switch questions | This repository: `docs/discovery/04-manager-interview.md` (access blocker, Q4, Q8) |
| T22 | WCAG R0/R1/R3/R5 behaviour and acceptance criteria | CAP:484-504 |
| T23 | Three invisible-text failures passed every token check and unit test | `tests/systemV2/storyVisualReview.js:10-14` |
| T24 | WCAG exceptions: admin vs public standard, visual changes go to the gate, third-party embeds, token pass is not proof | CAP:419-424 |
| T25 | WCAG inputs, outputs and workflow, including "unknown rather than conformant" | CAP:402-418 |
| T26 | Conformance unknown; partial signals | CAP:482 |
| T27 | WCAG tools and permissions; production approvals listed only as "human" | CAP:439-472 |
| T28 | No accessibility engine; adding one is escalated; sandbox deployment needed | CAP:425-429, CAP:480 |
| T29 | External dependency introduction requires escalation; escalation notifies Ali Muwwakkil | Platform `CLAUDE.md:197-201` (escalation triggers), `:281` (notify `ali@colaberry.com`), `:10` (Ali Muwwakkil is DRI) |
| T30 | WCAG ceiling rationale | CAP:476 |
| T31 | Queue R0/R2 behaviour and acceptance criteria | CAP:2132-2142 |
| T32 | Approvers matching `system:`, `auto approve`, `timeout`, agent or model names are rejected | AD `promotionIdentity.ts:56-57`, `:88` |
| T33 | Queue outcome, inputs, outputs, workflow | CAP:2042, CAP:2061-2077 |
| T34 | Queue tools, permissions (production agent `[]`), no endpoint exists | CAP:2090-2121 |
| T35 | No admin login; capability file calls the manager gate "proposed" | CAP:2085-2087, CAP:2127-2128 |
| T36 | `requireAgentManagerOrAdmin` exists, runs `requireAdmin` first, and is used by manager controllers | `backend/src/middlewares/agentManagerAuthMiddleware.ts:8-16`, `:50-52`; for example `backend/src/controllers/managerDirectiveController.ts:12` |
| T37 | Queue exceptions: instructions only restrict, server-side authorization, no admin acting as him, unsigned decisions don't count | CAP:2078-2083 |
| T38 | Queue ceiling rationale | CAP:2125 |
| T39 | Agent-wide `enabled` flag is the only off switch found; not reset by restart | `backend/src/services/agentRegistry/domainAgents.ts:24-28`; RESEARCH-4 M22 |

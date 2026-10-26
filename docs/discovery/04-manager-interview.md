# Manager interview plan: Product Experience & UI/UX

**Domain:** Product Experience & UI/UX (`product_experience`)
**Story:** `product_experience.RESEARCH-4-MANAGER-INTERVIEW` · Release: Discovery and validation
**Accountable human:** Mohammed Abdul Aleem
**Prepared by:** Mihret Netsereab · 2026-10-25
**Status:** draft for manager review. Nothing here enables, configures or changes an agent, and every capability named below stays `draft`.

> **This document schedules nothing.** It is an agenda and a set of questions. No invitation,
> calendar entry, scheduling link or message has been sent, and no meeting is booked. Arranging
> the conversation is a human action taken outside this project [M1].

All platform citations refer to the public Colaberry platform repository,
[`ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator`](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator),
read at commit `2a139ec6`. Every file cited here is unchanged since commit `48e7c07`, which
RESEARCH-2 and RESEARCH-3 used, so their source tags still hold. Source tags such as **[M1]**
point to the Sources table at the end.

---

## Why this interview matters

- **Nothing in this domain has been validated by the manager.** All 25 capabilities are
  `draft` [M2].
- **Every one of them is waiting on the same decision.** Each says "Mohammed Abdul Aleem must
  confirm scope, exceptions and success measures; he has no admin login today" [M3].
- **No capability records a success measure.** The capability record has no field for one [M4],
  so "what good looks like" exists only once he says it.
- **He cannot see the agent today.** He has no admin login, so he cannot open the Agent Detail or
  Talk surface [M5][M6].

So the interview is how the 25 drafts get their scope, exceptions and success measures. The
blocker is on the agenda because without access he can only judge descriptions, not real output.

---

## Agenda (30 minutes)

| Time | Minutes | Section | Purpose |
|---|---|---|---|
| 0:00–0:03 | 3 | Purpose and ground rules | Everything is a draft, and his answers decide what gets built first |
| 0:03–0:08 | 5 | **Access blocker** (raise, do not fix) | Make sure he knows he cannot see the agent today, and hear which access route he prefers |
| 0:08–0:14 | 6 | A. Which capabilities first | Questions 1–2 |
| 0:14–0:19 | 5 | B. What stays human forever | Questions 3–4 |
| 0:19–0:24 | 5 | C. What "good" looks like, in numbers | Questions 5–6 |
| 0:24–0:28 | 4 | D. What gets switched off immediately | Questions 7–8 |
| 0:28–0:30 | 2 | Weekly check-in proposal and close | Get his reaction to the proposal below |
| | **30** | | |

**Time check:** 3 + 5 + 6 + 5 + 5 + 4 + 2 = **30 minutes**.

**If time runs short**, drop Q2 first, then Q8 if needed. Keep Q1 (scope and first capability),
Q5 (success measure), Q6 (exceptions) and Q7 (switch-off conditions). Those four cover the scope,
exceptions and success measures every capability is waiting on [M3], and each of the brief's four
topic groups still keeps at least one question [M1].

---

## Agenda item: the access blocker

**What to raise.** Mohammed Abdul Aleem has an `org_members` row but no `admin_users` row, so he
cannot open his employee's Agent Detail or Talk surface. The platform records the fix as "an
`admin_users` row with a scoped `mgmt_role`, or an alternative surface" [M5][M6]. The manager
authorization check exists, but it only runs after the normal admin login check, so it can't
help him without a login [M7].

**Why it is worth his meeting time.** Until this is fixed he can only review written
descriptions of what the agent would do. He cannot see real findings or reports.

**What to ask (not counted in the eight questions):**
- Do you prefer an admin login with a limited role, or a different way to see the agent's output,
  such as reports shared outside the platform?
- Do you know who would need to approve it? The sources don't say (**unknown**).

**What not to do in the meeting.** Don't try to fix it, request it, or promise a date. `admin_users`
is a table in the production database `accelerator_prod` [M24], so adding a row for him would
change production data. That is not part of this story. This document only records
that the blocker was raised and which route he prefers.

---

## The questions

Each question names what his answer changes. The "What the answer changes" lines are the
acceptance criterion that a finished interview changes the build, not just records opinions.

### A. Which capabilities he wants first

**Q1. Of the five detection-only checks, which one should be built first, and on which surface?**

The five are design-token drift, colour-contrast regression, unrouted-page detection, route
inventory and page-health sweep. They're the only capabilities that don't end in a human decision
[M8].

- **What the answer changes:** it chooses the first workflow turned into code and the first R1
  test fixture [M9]. RESEARCH-2 suggested route inventory or unrouted-page detection, built with
  `repo_read` and `report_renderer` only. His choice overrides that suggestion.
- **If he names a non-detection capability instead**, such as the WCAG AA audit, that's still a
  valid answer. It means the first build ends at a human review step, so it needs the review queue
  (Q2) first.

**Q2. Should the design review queue exist before any audit runs?**

The capability file describes `manager_design_review_queue` as "the precondition for every other
capability in this domain mattering" [M10]. It is capped at R2 [M11].

- **What the answer changes:** the build order.
  - **Yes:** the queue is built first, and audits report into it.
  - **No:** audits ship first as plain reports, and the queue waits until he can log in.
  - Either way, RESEARCH-2 recommends no write tools at first: the four write tools come only
    with the gate capabilities [M28].

### B. What must stay human forever

**Q3. Should design approvals, brand design systems, logos and email design always stay with a
human?**

These are recorded as his work today. RESEARCH-3 found no source saying whether they stay human,
move to AI or split, so their status is **unknown** [M12].

- **What the answer changes:** RESEARCH-3's open row 8 is settled.
  - **"Human forever":** it is written into the exceptions of
    `brand_design_system_sync_review` and `multi_brand_surface_consistency_audit` so the agent
    reports differences but never proposes design-system changes.
  - **"Split":** a split line is drafted for his review, in the same format RESEARCH-3 used.

**Q4. 20 of 25 capabilities end in a human decision. Which of those decisions must stay human
permanently?**

The decisions reserved to a human are accepting findings, approving changes, merging and
deploying [M13]. Pushing to protected main and deploying to production are blocked for every
agent [M14].

*Follow-up:* For each decision that stays human, who makes it? The capability file only says "a
human" [M13].

- **What the answer changes:**
  - Each decision he calls permanent is recorded as permanent in that capability's record. Today
    no capability's ceiling is above R5 (12 at R4, 8 at R5, 5 at R2), and production needs a
    separately approved R6 pilot [M26]. No source says what a permanent human decision would mean
    for autonomy beyond today's ceilings, or who could later change it (**unknown**).
  - The people named in the follow-up fill in RESEARCH-3's unknown "a human, not named" rows. Each
    capability's permissions then name a real approver instead of "human".

### C. What "good" looks like, in numbers

**Q5. For the capability you picked in Q1, what result would make you trust it?**

For example, a minimum agreement rate with a human-checked reference list in shadow mode, or a
maximum number of false alarms per run. The platform defines R5 readiness as agreement with a
human-reviewed reference inventory [M15], but no number is set.

- **What the answer changes:** the number becomes that capability's acceptance threshold. Without
  it, the capability can't leave R0, because nothing defines a pass.
- **If he can't give a number yet**, the follow-up is: "What would you need to see first?" That
  answer becomes the first item in the weekly check-in.

**Q6. A scan found 4,492 hex colour codes in `.tsx` files. Which kinds of those are legitimate
exceptions?**

How many are real problems is **unknown** until the manager sets the exceptions. The same scan
counted other raw-colour and inline-style cases, listed in the source note [M16].

*Follow-up:* Who keeps the exception list up to date?

- **What the answer changes:** his exceptions become the agreed allow-list. That gives the token
  drift and contrast checks a true denominator, so every reported count can say "N of M". The list
  would go through the platform's approval-gated memory, so he approves each entry [M17].

### D. What gets switched off immediately

**Q7. Which of these would make you want the agent switched off immediately?**

Read out these candidates, all taken from this domain's capability file, and ask him to add his
own:

- reporting "clean" or "pass" on something it couldn't check, such as an empty folder [M18],
  database-held copy [M19] or a chart whose data shape is only known at runtime [M20];
- a finding without a file and line, which the copy audit's R4 criteria rule out ("Every finding
  cites file and line") [M27];
- a suggested copy change not marked as a draft [M21];
- any attempt to approve its own change, which the gates' negative test exists to prevent [M11].

- **What the answer changes:** each behaviour he picks becomes a negative test and a written stop
  condition in that capability's exceptions. Those exist before any tool is granted, not after an
  incident.

**Q8. Who should be able to switch the agent off?**

The only off switch found in code is the whole agent's `enabled` flag. It is `false` today, and a
manual enable is not reset by a restart [M22]. No per-capability off switch was found (**unknown**
whether one is planned).

*Follow-ups:*
- How quickly must it stop once someone notices a problem?
- Should everything stop, or only the capability at fault?

- **What the answer changes:**
  - **"I want to switch it off myself":** the access fix becomes a hard prerequisite for the first
    tool grant, not just a nice-to-have.
  - **"Someone with admin access can do it":** that person is named in the capability file.
  - **How quickly:** becomes the required response time in the off-switch design.
  - **"Only the faulty capability should stop":** a per-capability pause has to be designed before
    the second capability is built.

---

## What happens with each answer

| Answer | Where it goes | Next decision it unblocks |
|---|---|---|
| Access route preference | The blocker note on this domain, for the DRI | Who requests the access, and which route |
| Q1: first capability | The first fixture and procedure to build | First implementation story |
| Q2: queue first or not | Build order | Whether the review queue is built first |
| Q3: design work | Exceptions of the two brand capabilities; RESEARCH-3 row 8 | The split line, if he chooses a split |
| Q4: permanent decisions and approvers | Each capability's record and permissions | A named approver for each human decision |
| Q5: trust threshold | Acceptance criteria of the Q1 capability | Moving that capability out of R0 |
| Q6: exceptions | Approval-gated memory proposals for the allow-list | True counts for drift and contrast |
| Q7: stop behaviours | Negative tests and written stop conditions | First tool grant |
| Q8: who switches off | Off-switch design and the named person | Second capability |

No capability moves out of `draft` because of the interview alone [M3]. His answers are written
into the capability record, and he then signs them off. That is the R0 step: for example, the
token-drift audit's R0 criterion is "Mohammed Abdul Aleem signs off a written scope and exception
list" [M25].

---

## Weekly check-in (proposal only)

**This is a proposal, not a scheduled meeting.** Nothing has been booked or sent. He decides
whether it happens.

- **Day:** Tuesday (a proposal; any fixed weekday works).
- **Duration:** 20 minutes.
- **What it reviews:**
  1. **Access and blocker status.** Can he reach the agent's output yet? If not, what's still
     missing? The platform's story template only says the check-in "can review real state" when
     the manager can reach the surface [M23], so this goes first.
  2. **Capability decisions.** Which `draft` capabilities had scope, exceptions or success measures
     confirmed this week, and which are waiting on him.
  3. **Evidence and stop conditions.** Fixture and shadow results for whatever is being built,
     every disagreement listed, and whether any Q7 stop condition was hit.

---

## Answers (fill in after the interview)

Left empty on purpose. After the interview this file becomes the record.

**Interview date:**
**Present:**

| # | Question | His answer | Action taken (file or story) |
|---|---|---|---|
| Blocker | Preferred access route | | |
| Q1 | First capability and surface | | |
| Q2 | Review queue first? | | |
| Q3 | Design work: human forever, split or unknown | | |
| Q4 | Permanent human decisions; follow-up: who makes each | | |
| Q5 | Trust threshold for the Q1 capability | | |
| Q6 | Colour exceptions; follow-up: who keeps the list | | |
| Q7 | Behaviours that trigger immediate switch-off | | |
| Q8 | Who switches off; follow-ups: how fast, whole agent or one capability | | |
| Check-in | Accepted, changed or declined | | |

---

## Notes and unknowns

- **The brief's "Failure paths you must handle" section is empty** [M1]. I haven't made up failure
  paths for this story. The switch-off questions (Q7, Q8) cover failure behaviour for the agent
  itself, which is different.
- **Who approves the access fix** is **unknown**. No source names who can create an `admin_users`
  row for him.
- **Whether a per-capability off switch is planned** is **unknown**. Only the agent-wide `enabled`
  flag was found [M22].
- **Who holds the unnamed human approvals** is **unknown** until Q4 is answered [M13].
- **"Manager-defined" does not mean he wrote those capabilities.** Three capabilities are
  classified `manager_defined` [M10]. The review queue's stated source is the domain's ownership
  record, not an interview with him. Whether he has seen any of the three is **unknown**.
- **The check-in day and duration are my proposal**, not taken from any source.

---

## Sources

All paths are in `ColaberryEnterprise_AI_LeadershipAccelerator` at commit `2a139ec6`. **CAP** is
`backend/src/services/agentDomain/capabilities/product_experience.json`. **SVC** is
`backend/src/services/`. **AIWM** is `docs/architecture/ai-workforce-management/`.

| Tag | Claim | Citation |
|---|---|---|
| M1 | Story sends nothing; failure-paths section empty | This repository: `docs/stories/product_experience.RESEARCH-4-MANAGER-INTERVIEW.md:5`, `:40`, `:47` (four topic groups), `:85-86`; platform template SVC `agentDomain/agentDomainStoryTemplates.ts:26-32`, `:176-188` |
| M2 | All 25 capabilities are `draft` | `grep -c '"requirement_validation_state": "draft"' CAP` returns 25 |
| M3 | Every capability waits on him to confirm scope, exceptions and success measures | `validation_dependency` on all 25 capabilities; for example CAP:42, CAP:171 |
| M4 | No success-measure field in the capability record | Field list of each CAP capability: `capability_id` … `release_behaviour`; none is a success measure |
| M5 | Blocker text: `org_members` row, no `admin_users` row; fix is a scoped `mgmt_role` or an alternative surface | SVC `agentDomain/agentDomainRegistry.ts:82-84`, `:128-136` |
| M6 | No admin login, confirmed from production rows on 2026-09-15 | AIWM `HUMAN_OWNERSHIP_MAP.md:13`, `:46` |
| M7 | Manager authorization runs after the normal admin check | `backend/src/middlewares/agentManagerAuthMiddleware.ts:12-14`, `:50-52` |
| M8 | The five detection-only capabilities (`human_decision: false`) | CAP:116, CAP:594, CAP:950, CAP:1065, CAP:1177 (as RESEARCH-1 S3) |
| M9 | R1 acceptance uses seeded fixtures | CAP:133-135 |
| M10 | Review queue's business outcome and `manager_defined` classification; three capabilities so classified | CAP:2040-2048; CAP:2047, CAP:2154, CAP:2261 |
| M11 | Gates capped at R2 with a no-self-approval negative test | CAP:2124, CAP:2230; CAP:2926 |
| M12 | Design work's transition status unknown | This repository: `docs/discovery/03-role-and-da-transition.md:105` |
| M13 | Human approvals reserved to "a human", not named | This repository: `docs/discovery/03-role-and-da-transition.md:163-166`; CAP `permissions_by_environment`, for example CAP:2426 |
| M14 | Protected-main push and production deploy denied for all agents | SVC `delivery/execution/executionPolicy.ts:33` |
| M15 | R5 readiness = agreement with a human-reviewed reference inventory | CAP:143-145 |
| M16 | Scan measured 2026-10-09: 4,492 hex codes in `frontend/src/**/*.tsx`, 1,778 in CSS other than `tokens.css`, 488 `rgb()`/`rgba()` values and 8,219 inline `style={{ }}` occurrences; legitimate share unknown until the manager sets exceptions | CAP:123 |
| M17 | Approval-gated memory | `backend/src/models/AgentMemoryProposal.ts:4-27` |
| M18 | Must not report clean on an empty fixture | CAP:135 |
| M19 | Database-held copy reported out of scope | CAP:2517 |
| M20 | Runtime-only chart shapes reported as undetermined | CAP:2401 |
| M21 | Drafted copy marked as drafts | CAP:2511-2512 |
| M22 | Agent `enabled: false`; manual enable not reset by restart | SVC `agentRegistry/domainAgents.ts:27-28`, `:70` |
| M23 | The template says the check-in "can review real state" only in the branch where the manager can reach the surface | SVC `agentDomain/agentDomainStoryTemplates.ts:184-188` |
| M24 | `admin_users` was read from the production database `accelerator_prod` | AIWM `HUMAN_OWNERSHIP_MAP.md:3` |
| M25 | Token-drift R0 criterion: "Mohammed Abdul Aleem signs off a written scope and exception list" | CAP:128-130 (`release_behaviour`, R0 entry) |
| M26 | Ceilings: 12 × R4, 8 × R5, 5 × R2, none above R5; production needs a separately approved R6 pilot | count of `max_permitted_autonomy` values in CAP; rationale at CAP:2926; SVC `agentDomain/autonomyLadder.ts:202-203` |
| M27 | Copy audit R4 criteria: "Every finding cites file and line" | CAP:2578-2579 |
| M28 | RESEARCH-2: no write tools at first; the four write tools come only with the gate capabilities | This repository: `docs/discovery/02-agent-anatomy.md:155-157` |

# Story alignment review: Product Experience & UI/UX

**Domain:** Product Experience & UI/UX (`product_experience`)
**Purpose:** Cross-check the completed research (RESEARCH-1 to 5) and the legacy migration plan
against the assigned CAP capability stories before any build starts, as Kes asked.
**Prepared by:** Mihret Netsereab · 2026-10-27
**Status:** review only. Nothing here changes source code, enables an agent, grants a tool, raises
an autonomy level or changes a capability or story status.

Every claim is tagged **Verified** (checked in this repository during this review),
**Reported** (stated by someone, not recorded in this repository), **Recommendation** (my
proposal) or **Unknown**.

---

## The short version

1. **The three proposed tasks match real CAP stories.** Their starting levels, ceilings, tools,
   boundaries and approvers match what the story files say. No task invents a capability.
   **(Verified)**
2. **The r2 stories ask for documents, not code.** Each of the 25 CAP stories has exactly one
   acceptance criterion, and it is the R0 step: a written definition, scope or standard that the
   manager approves. None asks for an audit run, a tool or an enabled agent. So "start building
   the agent" means, in this release, writing the R0 definition for each chosen capability and
   getting Mohammed Abdul Aleem's sign-off. **(Verified)**
3. **No manager approval is recorded anywhere in this repository.** The interview answers table in
   `04-manager-interview.md` is empty, and all 25 CAP stories show their criterion as not passed.
   Kes reported in chat that Aleem confirmed the role description. That is useful, but it is not
   yet recorded evidence. **(Verified that it's absent; the confirmation is Reported)**
4. **The migration plan's own sequence blocks two of the three tasks.** It says ownership of the
   overlaps with the website domain must be settled before building `route_surface_inventory`
   (anywhere in the app) and `wcag_aa_accessibility_audit` (on public pages). Only Task 3, the
   review queue, is free of that overlap. **(Verified)**
5. **STORY-000, the Command Center, is not built.** The repository contains only docs and
   `.colaberry/` files. The story says it is the page you demo from, and Kes is waiting for a
   demo. **(Verified)**

---

## 1. Story status as recorded

Source: `.colaberry/progress.json` in this working tree, read 2026-10-27. **(Verified)**

| Story | Recorded state | Criteria passed |
|---|---|---|
| RESEARCH-1 to RESEARCH-5 | `verified` | 3 of 3 each |
| LEGACY-MIGRATION-PLAN | `in_progress` | 3 of 3 |
| STORY-000 Command Center | not listed in `plan.json`; criteria unticked in `docs/stories/STORY-000.md` | 0 of 5 |
| 25 CAP stories (r2) | `in_progress` | 0 of 1 each |

**Note on LEGACY-MIGRATION-PLAN.** The local file still says `in_progress`, but you report that
Colaberry now confirms all three criteria. The platform writes this file on sync, so the local copy
is probably behind. **(Reported; local state Verified)** No change made.

---

## 2. Alignment table: the three proposed tasks

Source for every "story says" cell: the matching file in `docs/stories/`. Source for every
"RESEARCH-5 says" cell: `docs/discovery/05-three-proposed-tasks.md`.

| | Task 1: Route and surface inventory | Task 2: WCAG 2.1 AA audit | Task 3: Design review and decision queue |
|---|---|---|---|
| **CAP story** | `product_experience.CAP.route_surface_inventory` | `product_experience.CAP.wcag_aa_accessibility_audit` | `product_experience.CAP.manager_design_review_queue` |
| **Start / ceiling** | R0 / R5 in both. Match | R0 / R5 in both. Match | R0 / R2 in both. Match |
| **Human decision** | Story has no "THIS IS A HUMAN DECISION" marker; RESEARCH-5 calls it "no human decision". Match | Story marks it a human decision forever; RESEARCH-5 says the same. Match | Story marks it a human decision forever; RESEARCH-5 says the same. Match |
| **The story's acceptance criterion** | "Written, manager-approved counting rule; no inventory published under an undefined rule." | "A written, manager-approved standard per surface class; no audit has run." | "A written access plan exists naming either a scoped admin_users row or a specific alternative surface, and Mohammed Abdul Aleem confirms he can use it." |
| **Does RESEARCH-5 name it as the R0 evidence?** | Yes, with the three parts the story lists (one surface, parameterised routes, review coverage) | Yes, per surface class, with "no audit has run" | Yes, both routes named |
| **Is the R0 document written?** | No. RESEARCH-5 describes what it must contain; the rule itself isn't drafted | No. The per-class standard isn't drafted | No. The access plan isn't drafted |
| **Manager approval recorded?** | No | No | No |
| **Alignment** | **Confirmed** on scope and boundaries; **blocked** on ownership (section 3) | **Confirmed** on scope and boundaries; **partial** because RESEARCH-5 narrows it (see risks) and **blocked** on public-page ownership | **Confirmed** |
| **Mismatch or risk** | Overlaps the website domain's `public_route_inventory_and_orphan_page_detection` across the whole app, admin included (migration plan U1) | (a) RESEARCH-5 proposes findings only, no patches; the story's workflow includes "a proposed patch per finding, in a sandbox branch". This is a labelled narrowing, not an error, but the manager has to accept it. (b) No accessibility engine exists; adding one is an escalation to Ali Muwwakkil. (c) Needs a sandbox deployment to render pages. (d) Overlaps the website domain on public pages | (a) He has no admin login, so the "confirms he can use it" half can't pass yet. (b) The story says `requireAgentManagerOrAdmin` is "PROPOSED, not built"; RESEARCH-5 says it's built but runs `requireAdmin` first. That claim cites the platform repo and was **not re-checked** in this review. (c) Who approves creating his access is unknown |
| **Needs manager approval** | Counting rule; ownership vs website domain (with Sai Tejesh Kowtharapu); R5 threshold later | Per-class standard; surface priority order; findings-only first version; ownership on public pages | Access route; decision vocabulary |

---

## 3. Findings beyond the table

### 3.1 The overlap decision is the gate for Tasks 1 and 2 (Verified)

`docs/migration/legacy-migration-plan.md` section 7, order 2, lists this as blocked until ownership is
settled with the website domain:

- `route_surface_inventory` and `unrouted_page_detection`, **anywhere in the app**;
- `wcag_aa_accessibility_audit` and `public_copy_claims_compliance_audit`, on public pages.

RESEARCH-5 was written before the migration plan and doesn't mention this. The two documents don't
contradict each other, but read together they mean Task 1 can't start until that conversation
happens. Task 2 can start only on non-public surfaces, and only once he sets the per-class standard.

### 3.2 Each CAP story says "Blocked by: nothing", but its body lists blockers (Verified)

The header line on all 25 stories reads "Blocked by: nothing — you can start this now". Each body
also lists blockers: no agent provisioned, no manager login, and for some, missing dependencies.
Both are true at once: you can **start** the R0 writing now, but the criterion can't **pass**
without his sign-off, and Task 3's can't pass without his login.

### 3.3 RESEARCH-3's transition candidates differ from RESEARCH-5's tasks (Verified)

RESEARCH-3 found two capabilities labelled as Data Analyst work moving to AI:
`dataviz_quality_audit` and `plain_language_interface_copy_audit`. RESEARCH-5 picked three
different ones. That's not a contradiction, because the stories asked different questions. But if
Kes or Aleem read "what transitions from the DA role" as "what gets built first", they'll expect
those two. **Recommendation:** say this out loud when you present the plan.

### 3.4 Five capabilities end without a human decision (Verified)

Counted from the story files (no "THIS IS A HUMAN DECISION" marker): `color_contrast_regression_check`,
`design_token_drift_audit`, `page_health_smoke_sweep`, `route_surface_inventory`,
`unrouted_page_detection`. This matches the "five detection-only checks" in RESEARCH-4 Q1.

### 3.5 What is already settled in your favour (Verified)

- All three tasks use only tools listed in their story files, and none of them uses a
  default-denied capability.
- Every boundary RESEARCH-5 marks as "my proposal" is labelled as such. Nothing is presented as
  approved.
- The migration plan shows this domain inherits zero legacy agent records, so there is nothing to
  migrate before building.

---

## 4. What's complete, what remains, what's missing

### Complete

| Item | Evidence |
|---|---|
| RESEARCH-1 to 5 | `verified` in `.colaberry/progress.json` (Verified) |
| Legacy migration plan | 3 of 3 criteria `true` locally; Colaberry confirmation Reported |
| Role description confirmed by the manager | **Reported** by Kes in chat. Not in the repository |

### Remains (r2 work, in a sensible order)

| # | Work | Blocked by | Recommendation |
|---|---|---|---|
| 1 | Hold the manager interview and fill in the answers table in `04-manager-interview.md` | Scheduling | Do this first. Q1, Q2 and the access route decide everything below |
| 2 | Settle website-domain ownership (migration plan U1) | Aleem and Sai Tejesh Kowtharapu | Ask in the same interview, or ask Kes to arrange it |
| 3 | Draft the access plan for Task 3 | Nothing to draft; his login to pass | Draft now. It's the only R0 document free of the overlap |
| 4 | Draft the counting rule for Task 1 | Overlap decision to pass | Draft now, mark "awaiting ownership decision" |
| 5 | Draft the per-surface-class AA standard for Task 2 | Overlap decision for public pages | Draft now, scoped to admin and portal first |
| 6 | Get each R0 document signed off by name and date | His availability | Record the sign-off in the document itself |
| 7 | Tick `passed` in `progress.json` and commit with a `Story:` trailer | Item 6 | Only after his recorded sign-off |

### Missing before implementation (anything past R0)

- **STORY-000 Command Center.** Not built. It's the demo surface the programme expects.
- **Recorded manager approval** of anything. Zero items today.
- **An agent.** `agent_id` is null for this domain, per every CAP story.
- **Manager access.** No `admin_users` row; who can approve creating one is unknown.
- **Accessibility engine decision** (Task 2 only). Escalation to Ali Muwwakkil, not your call.
- **Agreement thresholds** for Task 1 and Task 2 at R5. He sets them, later.

---

## 5. Questions that need the manager

| # | Question | For whom | Why it matters |
|---|---|---|---|
| 1 | Which capability first, and is the review queue built before any audit? (RESEARCH-4 Q1, Q2) | Mohammed Abdul Aleem | Sets the build order |
| 2 | Who owns route inventory, unrouted pages, public-page accessibility and public copy: us or the website domain? | Aleem with Sai Tejesh Kowtharapu | Unblocks Tasks 1 and 2 |
| 3 | Is a findings-only first version of the WCAG audit acceptable? | Aleem | RESEARCH-5 narrows the story's workflow |
| 4 | How will he reach the queue, and who approves creating that access? | Aleem; access approver unknown | Task 3's criterion requires he can use it |
| 5 | Can Kes's chat confirmation of the role be recorded in the repo, or should Aleem confirm in writing? | Kes | Turns a Reported fact into evidence |
| 6 | Should STORY-000 be built before the first R0 document? | Kes | The demo he asked for needs it |

---

## 6. What I'd do next (Recommendation)

1. **Build STORY-000 first.** It's day-one work per `docs/STORIES.md`, it needs no approval, and it
   gives you the demo surface. It must read `plan.json` and `progress.json` at runtime and show
   honest state: today that's 5 research stories verified, 0 of 25 capabilities approved.
2. **Book the interview** using `04-manager-interview.md`, and add question 2 (ownership) and
   question 3 (findings-only) from section 5.
3. **Draft the three R0 documents** while waiting, each marked "draft, awaiting sign-off".
4. **Don't tick any CAP criterion** until his sign-off is in the document.

For the demo, show the Command Center, the three R0 drafts and the alignment table above. Say
plainly what is approved (nothing yet) and what is waiting on whom.

---

## Sources (all in this repository)

| Claim | File |
|---|---|
| Story states and criteria | `.colaberry/progress.json` |
| CAP acceptance criteria, ceilings, human-decision markers, blockers | `docs/stories/product_experience.CAP.*.md` (25 files) |
| Task 1 criterion | `docs/stories/product_experience.CAP.route_surface_inventory.md:75-78` |
| Task 2 criterion and workflow | `docs/stories/product_experience.CAP.wcag_aa_accessibility_audit.md:36-54`, `:82-85` |
| Task 3 criterion and blockers | `docs/stories/product_experience.CAP.manager_design_review_queue.md:7-11`, `:75-78` |
| The three proposed tasks | `docs/discovery/05-three-proposed-tasks.md` |
| DA transition candidates | `docs/discovery/03-role-and-da-transition.md:15-27`, `:109-155` |
| Interview questions; empty answers table | `docs/discovery/04-manager-interview.md:89-111`, `:247-265` |
| Overlap and sequence | `docs/migration/legacy-migration-plan.md:211-223`, `:290-305` |
| Command Center criteria | `docs/stories/STORY-000.md` (Acceptance section) |
| Command Center is first | `docs/STORIES.md` ("Before the releases") |

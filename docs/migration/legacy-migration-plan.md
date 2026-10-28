# Legacy migration plan: Product Experience & UI/UX

**Domain:** Product Experience & UI/UX (`product_experience`)
**Story:** `product_experience.LEGACY-MIGRATION-PLAN` · Release: Legacy migration plan
**Accountable human:** Mohammed Abdul Aleem
**Prepared by:** Mihret Netsereab · 2026-10-27
**Status:** plan for manager review. Nothing here enables, disables, deletes or changes an agent
or a production row. All 25 capabilities stay `draft` [L1].

All platform citations refer to the public Colaberry platform repository,
[`ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator`](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator),
read at `origin/main` commit `c96f6a68` (fetched 2026-10-27). The local copy was not updated; files
were read from the fetched history. Source tags such as **[L1]** point to the Sources table at the
end. Where no source exists, the text says **unknown**.

---

## The short version

- **This domain inherits zero legacy agent records.** I re-counted the inventory myself and got
  the same answer: 246 rows, none assigned to Product Experience [L2][L3].
- **So there is nothing to keep, merge or retire here.** The migration for this domain is a
  no-op, and the plan's job is to prove that and to keep it true.
- **Zero inherited rows is not zero overlap.** The website domain carries forward legacy UX code
  into capabilities that audit the same public pages as four of ours [L9][L10]. That boundary is
  the first decision this plan needs.
- **I found four problems in the sources** (see "What I believe is wrong"). None of them changes
  the zero, but one makes two-thirds of its proof uncheckable by anyone outside the original run.

---

## 1. Disposition table

### This domain's records

| # | Legacy record | Category | Disposition | Successor capability | Reason |
|---|---|---|---|---|---|
| — | *(none)* | — | — | — | No row in the 246-row inventory has `proposed_owner_domain` = Product Experience & UI/UX [L2][L3] |

**Every inherited record is accounted for: there are none.** The capability file records the same
thing as an empty `legacy_dispositions` list [L4].

### Nearest-neighbour records (not ours, listed so the zero can be checked)

These are the only two UX-named rows in the inventory. Both belong to the website domain. They are
here so a reader can see they were looked at, not assumed away.

| CSV line | Legacy record | Inventory category | Owner domain | Website domain's disposition | Successor |
|---|---|---|---|---|---|
| 219 | `UX_Optimization_Agent` | `retire` | Website Portfolio & Conversion | **retired**: its source file was never written [L5][L6] | none |
| 226 | `WebsiteUXHeuristicAgent` | `retire` | Website Portfolio & Conversion | **superseded**: its 268 lines of heuristic rules carry forward [L7][L8] | `website.ux_heuristic_page_review` |

### How "kept, merged, retired" map onto the inventory

The inventory uses `proposed_kind`, not those three words [L2]. For any future row this plan has
to place:

| Inventory `proposed_kind` | Plan disposition |
|---|---|
| `behavior`, `tool`, `employee` | Kept (becomes or feeds a capability) |
| `duplicate` | Merged into the row it duplicates |
| `retire` | Retired, with the reason from the inventory |
| `unresolved` | Not classified: see section 5 |

---

## 2. Citations I verified myself

| # | Claim in the brief or its sources | What I did | Result |
|---|---|---|---|
| V1 | The inventory has 246 rows and none belong to this domain | Parsed `LEGACY_AGENT_CLASSIFICATION.csv` with a CSV reader and counted `proposed_owner_domain` | **Confirmed.** 246 rows; 10 values (9 domains + `unresolved`); Product Experience appears 0 times. The per-domain counts match the capability file exactly (executive 75, marketing 40, platform 38, admissions 28, unresolved 21, sales 16, learner success 11, curriculum 8, website 8, internship 1) [L2][L3] |
| V2 | `CSV:219` is `UX_Optimization_Agent`, retire, Website | Read line 219 | **Confirmed** [L5] |
| V3 | Its source file `agents/platform/uxOptimizationAgent.ts` doesn't exist and has no git history | Listed the tree and ran `git log --all` on the path | **Confirmed.** Not in the tree, no commits ever touched it [L5] |
| V4 | `CSV:226` is `WebsiteUXHeuristicAgent`, retire, Website, wrapper has zero callers outside `aiOrchestrator*.ts` | Read line 226; searched the backend for `runWebsiteUXHeuristics` | **Confirmed.** Only callers are `aiOrchestrator.ts:452` and `aiOrchestrator-Ali-AI.ts:373`, both inside the orchestrator [L7] |
| V5 | 21 rows are `unresolved`, and five are live production rows | Listed every `unresolved` row | **Confirmed.** Lines 243–247 are `production_only`, created 2026-03-11 and "enabled" [L11] |
| V6 | The roster records this domain's legacy count as 0 | Read `AI_EMPLOYEE_ROSTER.md:31` and `:41` | **Confirmed**, with one inconsistency (problem 4 below) [L12] |
| V7 | Pass (1) and (2) of the zero: the per-domain slice files | Looked for `.loop-architect/runs/20261007-school-agent-factory/legacy-slices/` | **Could not verify.** The folder is gitignored and not in the repository (problem 1 below) [L13] |

---

## 3. What I believe is wrong

### Problem 1: two of the three proofs of "zero" can't be checked

The capability file proves the zero with "three independent passes" [L3]. Passes 1 and 2 read slice
files under `.loop-architect/`. That folder is listed in `.gitignore` (lines 18 and 106) and is
not in the repository at any commit [L13]. Only pass 3, re-parsing the CSV, can be repeated by
anyone else. I repeated it and it holds (V1), so **the zero is right, but it rests on one
checkable proof, not three**.

**Fix:** either commit the slice files, or reword the note to say passes 1 and 2 are run-local.

### Problem 2: the inventory's line citations into the seed file point at the wrong agents

The CSV cites `agentRegistrySeed.ts:1269` for `UX_Optimization_Agent` and `:736` for
`WebsiteUXHeuristicAgent` [L5][L7]. In the seed file today those agents are at **`:1286`** and
**`:753`**, 17 lines lower [L14]. The old lines now land inside other agents' entries
(`:736` is in `WebsiteBrokenLinkAgent`; `:1269` is in the partnerships block). This was already
true at `2a139ec6`, so it isn't caused by the latest commits.

**Effect:** anyone following the CSV's evidence lands on the wrong agent. The pattern (a constant
offset) suggests every seed citation in the CSV has drifted. I checked only these two, so the
extent is **unknown**.

### Problem 3: "confirmed dead" understates `WebsiteUXHeuristicAgent`

A test fixture labels it "confirmed_dead, referenced only by the seed file" [L15]. That's not what
the code shows: the agent's source file exists (268 lines) and is imported and called by
`aiOrchestrator.ts` [L7][L8]. The website domain's own file says these files are "reachable in
production today" through an admin scan endpoint and records its zero-inheritance as **false**
[L9]. The *registration* is retired; the *code* is alive and carried forward.

**Why it matters to this domain:** the brief describes the UX rows as having "gone elsewhere",
which is true, but they went into live capabilities that overlap ours (section 4).

### Problem 4: the roster mentions a row that isn't this domain's

`AI_EMPLOYEE_ROSTER.md:31`, the Product Experience row, says "the one `UX_Optimization_Agent` row
has no source file (retire)" [L12]. That row belongs to the website domain [L5], and the roster
doesn't mention the second UX row at all. The count of 0 is correct; the explanation attached to
it is misleading.

### Not wrong, but missing: the inventory is a snapshot

The current agent registry seed has 10 agents that aren't in the 246-row inventory at all, for
example `Maya`, `Dara` and `ApprovalRequestTimeoutSweep` [L16]. None is UX-shaped, so the zero
still holds today. But "zero" is a fact about the inventory taken on its date, not a guarantee
about the registry. The brief doesn't say this.

---

## 4. Unknowns: the real work

This domain has no `unknown` legacy records of its own. These are the open questions the plan
depends on. Each has one question and the person who can answer it.

| # | Unknown | The single question that resolves it | Who can answer |
|---|---|---|---|
| U1 | **Boundary with the website domain on public pages.** Four overlaps: `website.public_page_accessibility_audit` vs our `wcag_aa_accessibility_audit`; `website.public_route_inventory_and_orphan_page_detection` vs our `route_surface_inventory` and `unrouted_page_detection`; `website.ux_heuristic_page_review` (heading hierarchy) vs our WCAG heading check; `website.banned_copy_compliance_audit` and `marketing_claim_verification_audit` vs our `public_copy_claims_compliance_audit` [L10][L17] | "On public pages, does Product Experience or Website own each of these four checks?" | Mohammed Abdul Aleem and Sai Tejesh Kowtharapu, the website domain's accountable human [L10] |
| U2 | **The 10 registry agents missing from the inventory** [L16] | "Will the inventory be re-run to include agents added since it was built, and on what trigger?" | **Unknown** owner. No source names who maintains the CSV. Default escalation goes to Ali Muwwakkil (DRI) [L18] |
| U3 | **The slice files behind passes 1 and 2** [L13] | "Can the `legacy-slices/` files be committed, or the note reworded?" | Ali Muwwakkil (DRI); the run was session `CC-20261006-a4k7` [L19] |
| U4 | **The 21 unresolved rows**, which belong to no domain. Not in this plan's scope [L11] | "Which domain owns each unresolved row?" | **Unknown.** No source names who assigns owners. Escalation to Ali Muwwakkil (DRI) [L18] |
| U5 | **The five live production rows** (`calendar_intent_booster`, `forecast_engine`, `intent_scorer`, `revenue_aggregator`, `visitor_tracker`) [L11] | "Does anything still run these rows?" (the inventory's own open question) | Someone with production database access. **Unknown** who; not this domain. `visitor_tracker` is the nearest to UX telemetry, but nothing in the source ties it to this domain, so I don't propose claiming it |

---

## 5. Records the migration can't classify

The plan doesn't assume every record can be classified. A record is **unclassifiable** when its
owner domain is `unresolved`, its kind is `unresolved`, or it shows up in the registry but not in
the inventory (the 10 agents in "the inventory is a snapshot").

**What happens to it:**

1. **It is left exactly as it is.** Not enabled, not disabled, not deleted, not adopted. An
   unclassified row is never defaulted to `retire` (that would delete something that might be
   live) or to `keep` (that would adopt something nobody approved).
2. **It is listed in this plan's unknowns table** with the one question that would classify it
   and who can answer, as in U2, U4 and U5 above.
3. **It is escalated, not decided here.** Ownership is a governance decision, so it goes to Ali
   Muwwakkil (DRI) per the platform's escalation rules [L18]. If it looks UX-shaped, Mohammed Abdul
   Aleem is asked whether to claim it.
4. **It blocks nothing else in this domain.** Capability work at R0 continues; only the
   unclassified record waits.

---

## 6. Why the migration is replayable

For this domain the migration is a **read and classify** step with zero rows to act on. It has
no side effects, so running it twice can't duplicate anything.

**I ran the classification twice** on freshly read copies of the CSV at `c96f6a68`, and the
output was identical (same SHA-256 prefix `b0fbb18f6872844b` both times, 0 Product Experience
rows) [L20].

If a future row ever lands in this domain, the rules that keep it replayable are:

| Step | Replay rule |
|---|---|
| Classify | Keyed by `agent_name`. The disposition is a value written into the capability file's `legacy_dispositions`, replaced, never appended. A second run produces the same list. |
| Retire | Check the current state before acting. If the registration is already disabled, do nothing. Disabling is never done by this plan; it's a human action [L1]. |
| Merge | Point the duplicate at its target by `agent_name`. If it already points there, do nothing. |
| Keep | Map to a capability by `capability_id`. If the mapping exists, do nothing. |
| Anything unclassifiable | Left untouched (section 5). Untouched twice is still untouched. |

This follows the platform's rule that every side effect be idempotent [L18].

---

## 7. Sequence

| Order | Decision | Decided by | What is blocked until it's made |
|---|---|---|---|
| 1 | **Accept the zero** as recorded, given only the CSV proof can be checked (problem 1) | Mohammed Abdul Aleem | Closing this story's review |
| 2 | **Settle the public-page boundary with the website domain** (U1) | Mohammed Abdul Aleem with Sai Tejesh Kowtharapu | Building `wcag_aa_accessibility_audit`, `route_surface_inventory`, `unrouted_page_detection` and `public_copy_claims_compliance_audit` on public pages. Admin and portal pages aren't affected, because the website domain only covers public ones |
| 3 | **Re-run the inventory for agents added since it was built** (U2) | Owner **unknown**; escalate to Ali Muwwakkil | Calling the zero current rather than "as of the inventory date" |
| 4 | **Fix the source problems** (problems 1, 2, 4) | Ali Muwwakkil (owner of the run and roster) | Nothing in this domain, but every other domain citing the CSV's seed lines inherits problem 2 |
| 5 | **Assign owners to the 21 unresolved rows** (U4, U5) | **Unknown**; escalate to Ali Muwwakkil | Nothing in this domain. Listed so it isn't lost |

Step 2 is the one that matters most for this domain. Without it, two agents will audit the same
public pages and report the same findings to two different managers.

---

## Sources

Paths are in `ColaberryEnterprise_AI_LeadershipAccelerator` at `origin/main` commit `c96f6a68`
unless marked "this repository". **CSV** is
`docs/architecture/ai-workforce-management/LEGACY_AGENT_CLASSIFICATION.csv`. **CAP** is
`backend/src/services/agentDomain/capabilities/product_experience.json`. **WEB** is
`backend/src/services/agentDomain/capabilities/website.json`. **SEED** is
`backend/src/services/agentRegistrySeed.ts`.

| Tag | Claim | Citation |
|---|---|---|
| L1 | All 25 capabilities `draft`; nothing here changes an agent | CAP:9 (`distinct_capabilities: 25`); `"requirement_validation_state": "draft"` appears 25 times in CAP; this repository: `docs/stories/product_experience.LEGACY-MIGRATION-PLAN.md` ("Before you start") |
| L2 | 246 rows; columns `agent_name, proposed_kind, proposed_owner_domain, source, reason`; 0 Product Experience rows | CSV:1 (header), CSV:2-247; re-parsed with Python's `csv` module (V1) |
| L3 | Capability file's three-pass proof and per-domain counts | CAP:2911-2912 |
| L4 | `legacy_dispositions` is empty | CAP:2909 |
| L5 | `UX_Optimization_Agent`: retire, Website, no source file, cites SEED:1269 | CSV:219; `git log --all -- backend/src/services/agents/platform/uxOptimizationAgent.ts` returns nothing |
| L6 | Website domain records it `retired`, no successor | WEB:3498-3503 |
| L7 | `WebsiteUXHeuristicAgent`: retire, Website, zero callers outside orchestrator, cites SEED:736; callers | CSV:226; `backend/src/services/aiOrchestrator.ts:428`, `:452`; `aiOrchestrator-Ali-AI.ts:349`, `:373` |
| L8 | Agent source is 268 lines; carried forward as `website.ux_heuristic_page_review` | `backend/src/services/agents/websiteUXHeuristicAgent.ts` (268 lines); WEB:398, WEB:407, WEB:3471-3475 |
| L9 | Website domain: code "reachable in production today"; zero-inheritance recorded false | WEB:3507 |
| L10 | Website capability list and accountable human | WEB:3 (`Sai Tejesh Kowtharapu`); WEB:20, :398, :860, :1377, :1507 |
| L11 | 21 unresolved rows; five `production_only`, enabled, created 2026-03-11 | CSV:227-247 (production rows CSV:243-247) |
| L12 | Roster: Product Experience legacy count 0, explanation mentions `UX_Optimization_Agent`; total 246 | `docs/architecture/ai-workforce-management/AI_EMPLOYEE_ROSTER.md:31`, `:41` |
| L13 | `.loop-architect/` is gitignored and absent | `.gitignore:18`, `:106`; `git ls-tree -r origin/main` contains no `.loop-architect/` path |
| L14 | Current seed lines for the two agents | SEED:753 (`WebsiteUXHeuristicAgent`), SEED:1286 (`UX_Optimization_Agent`); same at `2a139ec6` |
| L15 | Fixture calls `WebsiteUXHeuristicAgent` confirmed dead, seed-only | `backend/src/services/__tests__/fixtures/cronRegistryBaseline.ts:108` |
| L16 | 10 seeded agents absent from the CSV, none UX-shaped | SEED:64, :86, :1939, :2411, :2524, :2562, :2586, :2736, :2850, :3176 (compared against every `agent_name` in CSV) |
| L17 | This domain's overlapping capabilities, including WCAG heading-hierarchy check | CAP:377, CAP:414, CAP:842, CAP:980, CAP:1212 |
| L18 | Escalation for governance decisions goes to the DRI, Ali Muwwakkil; idempotency required for side effects | Platform `CLAUDE.md:10`, `:197-201`, `:281` |
| L19 | The run that produced the capability file | `backend/src/services/agentDomain/autonomyLadder.ts:4` (run `20261007-school-agent-factory`, session `CC-20261006-a4k7`) |
| L20 | Replay check: same output hash on two runs | Command: `python -I count_legacy.py LEGACY_AGENT_CLASSIFICATION.csv` (counts `proposed_owner_domain`), run twice on 2026-10-27 at `c96f6a68` |

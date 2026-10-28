# Legacy migration plan: Product Experience & UI/UX

**Domain:** Product Experience & UI/UX (`product_experience`)
**Story:** `product_experience.LEGACY-MIGRATION-PLAN` · Release: Legacy migration plan
**Accountable human:** Mohammed Abdul Aleem
**Prepared by:** Mihret Netsereab · 2026-10-27 (revised the same day after a quality review)
**Status:** plan for manager review. Nothing here enables, disables, deletes or changes an agent
or a production row. All 25 capabilities stay `draft` [L1].

All platform citations refer to the public Colaberry platform repository,
[`ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator`](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator),
read at `origin/main` commit `c96f6a68` (fetched 2026-10-27). The local copy was not updated; files
were read from the fetched history. Source tags such as **[L1]** point to the Sources table at the
end.

### How to read this document

Every statement that matters carries one of four labels:

| Label | Meaning |
|---|---|
| **Verified** | I checked it myself against the repository, and the check is described |
| **Source says** | A platform file states it; I have not independently checked it |
| **Recommendation** | My proposal. Nobody has agreed to it |
| **Decision needed** | Waiting on a named person. Nothing moves until they decide |

Where no source exists, the text says **unknown**.

---

## The short version

- **Verified:** this domain inherits zero legacy agent records. I re-counted the 246-row inventory
  and found none assigned to Product Experience, and the tracked per-domain files account for all
  246 rows with none left over [L2][L21].
- **So there is nothing to keep, merge or retire here.** The migration for this domain is a
  no-op; this plan proves that and says how to keep it true.
- **Verified: zero inherited rows is not zero overlap.** The website domain has capabilities that
  read the same inputs as four of ours. For two of them the overlap covers the whole app, not only
  public pages [L24][L25].
  - **Decision needed:** who owns what. This is the first decision the plan needs.
- **I found five problems in the sources,** including one in the brief itself. None of them changes
  the zero.

---

## 1. Disposition table

### This domain's records

| # | Legacy record | Category | Disposition | Successor capability | Reason |
|---|---|---|---|---|---|
| — | *(none)* | — | — | — | **Verified:** no row in the 246-row inventory has `proposed_owner_domain` = Product Experience & UI/UX [L2][L21] |

**Every inherited record is accounted for: there are none.** The capability file records the same
thing as an empty `legacy_dispositions` list and `legacy_rows_analyzed: 0` [L4].

### Nearest-neighbour records (not ours, listed so the zero can be checked)

These are the only two UX-named rows in the inventory. Both belong to the website domain. They are
here so a reader can see they were looked at, not assumed away.

| CSV line | Legacy record | Inventory category | Owner domain | Website domain's disposition (**Source says**) | Successor |
|---|---|---|---|---|---|
| 219 | `UX_Optimization_Agent` | `retire` | Website Portfolio & Conversion | **retired**: its source file was never written [L5][L6] | none |
| 226 | `WebsiteUXHeuristicAgent` | `retire` | Website Portfolio & Conversion | **superseded**: its heuristic rules carry forward [L7][L8] | `website.ux_heuristic_page_review` |

The owner domain and category in both rows are **Verified** (V2, V4). The dispositions are the
website domain's records.

### How "kept, merged, retired" map onto the inventory

**Recommendation.** The inventory uses `proposed_kind`, not those three words [L2]. If a row ever
has to be placed in this domain, I propose this mapping:

| Inventory `proposed_kind` | Plan disposition |
|---|---|
| `behavior`, `tool`, `employee` | Kept (becomes or feeds a capability) |
| `duplicate` | Merged into the row it duplicates |
| `retire` | Retired, with the reason from the inventory |
| `unresolved` | Not classified: see section 5 |

---

## 2. Citations I verified myself

The brief itself contains no `file:line` citations to sample (problem 5), so I verified the
sources the brief's figures come from.

| # | Claim | What I did | Result |
|---|---|---|---|
| V1 | The inventory has 246 rows and none belong to this domain | Parsed `LEGACY_AGENT_CLASSIFICATION.csv` with a CSV reader and counted `proposed_owner_domain` | **Verified.** 246 rows; 10 values (9 domains + `unresolved`); Product Experience appears 0 times. The per-domain counts match the capability file exactly (executive 75, marketing 40, platform 38, admissions 28, unresolved 21, sales 16, learner success 11, curriculum 8, website 8, internship 1) [L2][L3] |
| V2 | `CSV:219` is `UX_Optimization_Agent`, retire, Website | Read line 219 | **Verified** [L5] |
| V3 | Its source file `agents/platform/uxOptimizationAgent.ts` doesn't exist and has no git history | Listed the tree and ran `git log --all` on the path | **Verified.** Not in the tree; no commit ever touched it [L5] |
| V4 | `CSV:226` is `WebsiteUXHeuristicAgent`, retire, Website; its wrapper has zero callers outside `aiOrchestrator*.ts` | Read line 226; searched the backend for `runWebsiteUXHeuristics` | **Verified.** The only callers are `aiOrchestrator.ts:452` and `aiOrchestrator-Ali-AI.ts:373`, both inside the orchestrator [L7] |
| V5 | 21 rows are `unresolved`, and "five of them are live production rows" (the brief's wording) | Listed every `unresolved` row in the CSV and in `_unresolved.json` | **Partly verified.** 21 rows and their three kinds: **Verified.** The five rows at CSV:243–247 are described by the inventory as "production row (2026-03-11) … enabled … verify whether anything still runs it": **Source says.** I did not read production. Whether anything actually runs these rows is **unknown**, and the inventory itself leaves that open [L11][L22] |
| V6 | The roster records this domain's legacy count as 0 | Read `AI_EMPLOYEE_ROSTER.md:31` and `:41` | **Verified**, with one inconsistency (problem 4) [L12] |
| V7 | Pass 1 of the zero: this domain's slice file | Looked for `.loop-architect/runs/20261007-school-agent-factory/legacy-slices/` | **Could not verify.** Gitignored and not in the repository (problem 1) [L13] |
| V8 | Pass 2 of the zero: all slices sum to 246 | Pass 2's files aren't available, so I summed `legacy_dispositions` (or `rows`) across the 11 tracked capability files instead | **Verified by a tracked substitute.** 246 rows, 246 distinct names, matching the CSV one for one, with nothing missing and nothing extra [L21] |
| V9 | `WebsiteUXHeuristicAgent`'s code can still be run | Traced the call chain from route to agent | **Verified as a code path:** admin route → controller → orchestrator → agent (problem 3) [L23] |

---

## 3. What I believe is wrong

### Problem 1: the proofs of "zero" are only partly checkable

**Source says:** the capability file proves the zero with "three independent passes" and says it is
"independently corroborated twice" [L3][L26]. Taking all five in turn:

| Proof | Where it points | Checkable from the repository? |
|---|---|---|
| Pass 1: this domain's slice file is empty | `.loop-architect/…/legacy-slices/product_experience.json` | **No.** Gitignored and absent [L13] |
| Pass 2: the eleven slices sum to 246 | `.loop-architect/…/legacy-slices/` | **Not as cited, but reproducible.** I redid it from the tracked capability files (V8) [L21] |
| Pass 3: CSV re-parse | `LEGACY_AGENT_CLASSIFICATION.csv` | **Yes.** I redid it (V1) |
| Corroboration 1: the roster says 0 | `AI_EMPLOYEE_ROSTER.md:31`, `:41` | **Yes** (V6) |
| Corroboration 2: an auditor re-parsed the CSV | `.loop-architect/…/plan.md:14` | **No.** Gitignored and absent [L13][L26] |

**Verified conclusion:** the zero holds on three checkable grounds (V1, V8, V6). Two of the five
proofs can't be checked by anyone outside the original run, and a third can only be redone
with different files.

**What is still limited:** I can't see what the `.loop-architect/` files actually contain.
`_unresolved.json` says it exists precisely because "no legacy functionality is silently lost"
cannot rest on a file that is not in the repository [L22]. The same reasoning applies to passes
1 and 2 and corroboration 2.

**Recommendation:** reword the capability file's note so it cites the tracked files (as V8 does)
instead of the run directory, or commit the slice files.

### Problem 2: line citations into the code have drifted

**Verified.** The CSV cites `agentRegistrySeed.ts:1269` for `UX_Optimization_Agent` and `:736` for
`WebsiteUXHeuristicAgent` [L5][L7]. In the seed file today those agents are at **`:1286`** and
**`:753`**, 17 lines lower [L14]. The old lines now land inside other agents' entries:
- `:736` is in `WebsiteBrokenLinkAgent`'s entry.
- `:1269` is in `Corporate_Training_Agent`'s entry.

This was already true at `2a139ec6`, so the latest commits didn't cause it.

**Verified, same kind of drift elsewhere.** The website capability file says the scan endpoint is
mounted at `adminRoutes.ts:256`; it is mounted at `:261` [L9][L23].

**Effect:** anyone following these citations lands on the wrong code. The constant offset suggests
the CSV's other seed citations have drifted too. I checked only these, so the extent is **unknown**.

### Problem 3: "confirmed dead" is wrong for `WebsiteUXHeuristicAgent`'s code

**Source says:** a test fixture labels it "confirmed_dead, referenced only by the seed file" [L15].

**Verified:** it isn't referenced only by the seed file.
- **The source file exists:** 268 lines [L8].
- **The orchestrator imports it** (`aiOrchestrator.ts:17`) and calls it (`:429`).
- **That call sits inside `runAllWebsiteIntelligence`** (`:452`). The controller behind
  `POST /api/admin/website-intelligence/scan` runs that function. The route is admin-only and
  mounted at `adminRoutes.ts:261` [L23].

So the *registration* is retired, but the *code* can still be run by an admin.

**Not verified:** whether anyone has triggered that scan in production. That is **unknown**. The
website domain says these files are "reachable in production today" and records its own
zero-inheritance as **false** [L9]; that's **Source says** beyond the code path I traced.

**Why it matters to this domain:** the brief says the UX rows have gone elsewhere. That is true, but
they went into capabilities that overlap ours (U1).

### Problem 4: the roster mentions a row that isn't this domain's

**Verified.** `AI_EMPLOYEE_ROSTER.md:31`, the Product Experience row, says "the one
`UX_Optimization_Agent` row has no source file (retire)" [L12]. That row belongs to the website
domain [L5], and the roster doesn't mention the second UX row. The count of 0 is correct; the
explanation attached to it is misleading.

### Problem 5: the brief says it has `file:line` evidence, and it has none

**Verified.** The story's build instructions say "The brief already contains the disposition of
every inherited legacy record for this domain, with reasons and `file:line` evidence", and ask for
"two or three of the cited `file:line` references" to be checked [L27]. The brief contains **zero**
`file:line` citations [L27].

With zero records there is nothing to cite a disposition for, but the brief's own figures are also
unsourced:
- "246-row inventory"
- "21 unresolved"
- "five of them are live production rows"

I traced them to their sources myself (V1, V5, V8). The last one overstates what its source says
(V5).

**Recommendation:** for a zero-record domain, the brief should cite the inventory and the
`_unresolved.json` file directly, and say "enabled in production" rather than "live".

### Not wrong, but missing: the inventory is a snapshot

**Verified.** The current agent registry seed has 10 agents that aren't in the 246-row inventory,
for example `Maya`, `Dara` and `ApprovalRequestTimeoutSweep` [L16]. None is UX-shaped, so the zero
still holds today. But "zero" is a fact about the inventory on the date it was built, not a
guarantee about the registry. The brief doesn't say this.

---

## 4. Unknowns: the real work

This domain has no `unknown` legacy records of its own. The open questions fall into two groups:
those that affect this domain, and the 21 unresolved records the brief names as outside every plan.

### Unknowns that affect this domain

| # | Unknown | The single question that resolves it | Who can answer |
|---|---|---|---|
| U1 | **Overlap with the website domain.** See the table below | "For each overlapping pair, which domain owns it, and on which pages?" | **Decision needed:** Mohammed Abdul Aleem and Sai Tejesh Kowtharapu, the website domain's accountable human [L10] |
| U2 | **The 10 registry agents missing from the inventory** [L16] | "Will the inventory be re-run to include agents added since it was built?" | **Unknown.** No source names who maintains the CSV. **Recommendation:** escalate to Ali Muwwakkil (DRI) [L18] |
| U3 | **What the gitignored proof files contain** [L13] | "Can the capability file's proof be re-cited to tracked files, or the slice files committed?" | Ali Muwwakkil (DRI); the run was session `CC-20261006-a4k7` [L19] |

**The overlaps behind U1.** All are **Verified** from each capability's own stated inputs and
outcome, not just from their names:

| Website capability | Our capability | Shared ground | Scope of overlap |
|---|---|---|---|
| `public_page_accessibility_audit`: alt text, ARIA, form labels, contrast on "every public page" | `wcag_aa_accessibility_audit` | Same checks | Public pages [L24][L25] |
| `ux_heuristic_page_review`: includes heading hierarchy on public pages | `wcag_aa_accessibility_audit`, whose twelve checks include heading hierarchy | One check | Public pages [L24][L25] |
| `public_route_inventory_and_orphan_page_detection`: reads "every file under frontend/src/pages", the route tree and `App.tsx`; lists `/admin/ai-settings` as a finding | `unrouted_page_detection` (route trees + `App.tsx` + import graph) and `route_surface_inventory` | Same inputs, same question | **Whole app, including admin** [L24][L25] |
| `banned_copy_compliance_audit` and `marketing_claim_verification_audit`: the banned-word baseline and `claimsRegistry.ts` | `public_copy_claims_compliance_audit` (banned-word rule set + claims registry) | Same tooling | Public pages, but the banned-copy input is all page and component sources [L24][L25] |

### The 21 unresolved records (outside every domain's plan)

**Verified:** the brief places these outside every plan [L27]. They split into three kinds with
different questions, which `_unresolved.json` records as 8 `behavior`, 8 `retire` and 5
`unresolved` [L22]. Nothing ties any of them to this domain.

| # | Kind | Rows | The single question that resolves it | Who can answer |
|---|---|---|---|---|
| U4 | **Scheduled visitor-intent scoring**: `behavior`, wired to cron (**Source says**). Reason recorded: "serves both marketing and sales; not assigned" | 5: `BehavioralSignalDetector`, `BehavioralTriggerEvaluator`, `ICPInsightComputer`, `IntentScoreRecomputer`, `OpportunityScoreRecomputer` (CSV:227–231) | "Does Marketing or Sales own visitor-intent scoring?" | Sohail Syed (Marketing) and Roselyn (Sales), the two domains' accountable humans [L28] |
| U5 | **Scheduled accelerator jobs**: `behavior`, wired to cron (**Source says**). Reason recorded: "no rule matched category=accelerator" | 3: `PortfolioGitHubSyncAgent`, `SessionLifecycle`, `SessionReminders` (CSV:232–234) | "Which domain owns accelerator session scheduling and portfolio sync?" | **Unknown.** No source names a candidate domain. **Recommendation:** escalate to Ali Muwwakkil (DRI) [L18] |
| U6 | **Registrations with no code**: `retire`, source file never written (**Source says**) | 8: three alumni, three partnerships, two intelligence agents (CSV:235–242) | "Can a registration with no code be retired without assigning an owner first?" | Ali Muwwakkil (DRI) [L18] |
| U7 | **Production-only rows**: no registry entry, described as enabled (**Source says**) | 5: `calendar_intent_booster`, `forecast_engine`, `intent_scorer`, `revenue_aggregator`, `visitor_tracker` (CSV:243–247) | "Does anything still run these rows?" (the inventory's own open question) | Someone with production database access. **Unknown** who [L11] |

`visitor_tracker` is the nearest of these to UX telemetry, but no source ties it to this domain.
**Recommendation:** don't claim it.

---

## 5. Records the migration can't classify

**Recommendation.** These are my rules, not the platform's. A record is **unclassifiable** when its
owner domain is `unresolved`, its kind is `unresolved`, or it is in the registry but not in the
inventory (the 10 agents under "the inventory is a snapshot").

**What happens to it:**

1. **It is left exactly as it is.** Not enabled, not disabled, not deleted, not adopted. An
   unclassified row is never defaulted to `retire`, which could delete something still running,
   or to `keep`, which would adopt something nobody approved.
2. **It is listed in this plan's unknowns** with the one question that would classify it and who
   can answer, as in U2 and U4–U7.
3. **It is escalated, not decided here.** Ownership is a governance decision, and the platform's
   rules route those to the DRI, Ali Muwwakkil [L18]. If it looks UX-shaped, Mohammed Abdul Aleem
   is asked whether to claim it.
4. **It blocks nothing else in this domain.** Capability work at R0 continues; only the
   unclassified record waits.

**Verified precedent:** the platform already handles its 21 unresolved rows this way. It tracks
them with disposition `unresolved` and `needs_owner_decision: true`, rather than defaulting them
[L22].

---

## 6. Why the migration is replayable

**Verified.** For this domain the migration is a read-and-classify step with zero rows to act on.
It changes nothing, so running it twice can't duplicate anything.

**Verified: I ran the classification twice** on freshly read copies of the CSV at `c96f6a68`, and
the output was identical. Both runs gave SHA-256 prefix `b0fbb18f6872844b` and 0 Product
Experience rows [L20]. Anyone can repeat it with the script in Appendix A.

**Recommendation.** If a row ever lands in this domain, these rules would keep the migration
replayable. They follow the platform's idempotency rule [L18], but the specific rules are mine:

| Step | Replay rule |
|---|---|
| Classify | Keyed by `agent_name`. The disposition is written into the capability file's `legacy_dispositions`, replacing any earlier value, never appended. A second run produces the same list. |
| Retire | Check the current state before acting. If the registration is already disabled, do nothing. Disabling is a human action, never done by this plan [L1]. |
| Merge | Point the duplicate at its target by `agent_name`. If it already points there, do nothing. |
| Keep | Map to a capability by `capability_id`. If the mapping exists, do nothing. |
| Anything unclassifiable | Left untouched (section 5). Untouched twice is still untouched. |

---

## 7. Sequence

Every row here is a **Decision needed**. The order is my **Recommendation**.

| Order | Decision | Decided by | What is blocked until it's made |
|---|---|---|---|
| 1 | **Accept the zero**, knowing it rests on three checkable grounds out of five (problem 1) | Mohammed Abdul Aleem | Closing this story's review |
| 2 | **Settle ownership of the four overlaps with the website domain** (U1) | Mohammed Abdul Aleem with Sai Tejesh Kowtharapu | Building our `wcag_aa_accessibility_audit` and `public_copy_claims_compliance_audit` on public pages; and building `unrouted_page_detection` and `route_surface_inventory` **anywhere in the app**, because that overlap covers admin pages too [L24] |
| 3 | **Re-run the inventory for agents added since it was built** (U2) | **Unknown** owner; escalate to Ali Muwwakkil | Calling the zero current rather than "as of the inventory date" |
| 4 | **Fix the source problems** (problems 1, 2, 4, 5) | Ali Muwwakkil, as DRI over the run and roster | Nothing in this domain. Other domains citing the CSV's seed lines may have the same drift (problem 2) |
| 5 | **Assign owners to the 21 unresolved rows** (U4–U7) | The people named in U4–U7 | Nothing in this domain. Listed so it isn't lost |

**Why step 2 matters most:** neither domain has built these capabilities yet; this domain has no
agent [L19]. But both domains' capability files describe the same checks on the same pages. If
both are built as written, the same finding could reach two managers. Deciding ownership now
costs a conversation; deciding later costs one of the two builds.

---

## Appendix A: scripts to repeat the checks

Both run against files read from the platform repository at `c96f6a68`, for example
`git show origin/main:docs/architecture/ai-workforce-management/LEGACY_AGENT_CLASSIFICATION.csv > legacy.csv`.

**Replay check (V1, section 6).** The SHA-256 prefix in section 6 is of this script's output,
computed with `python -I count_legacy.py legacy.csv | sha256sum`:

```python
import csv,sys,collections
rows=list(csv.DictReader(open(sys.argv[1],encoding='utf-8')))
c=collections.Counter(r['proposed_owner_domain'] for r in rows)
print(len(rows), sorted(c.items()), 'product_experience_rows=', sum(1 for r in rows if 'Product Experience' in r['proposed_owner_domain']))
```

**Totality check (V8).** Run with a folder holding the 11 files from
`backend/src/services/agentDomain/capabilities/`, and the CSV:

```python
import json,sys,os,csv
names=set(); tot=0
for fn in sorted(os.listdir(sys.argv[1])):
    d=json.load(open(os.path.join(sys.argv[1],fn),encoding='utf-8'))
    rows=d.get('rows') if 'rows' in d else d.get('legacy_dispositions',[])
    n=[r['agent_name'] for r in rows]; tot+=len(n); names|=set(n)
csvn=[r['agent_name'] for r in csv.DictReader(open(sys.argv[2],encoding='utf-8'))]
print('total',tot,'distinct',len(names),'csv',len(csvn),'missing',len(set(csvn)-names),'extra',len(names-set(csvn)))
```

Output at `c96f6a68`: `total 246 distinct 246 csv 246 missing 0 extra 0`.

---

## Sources

Paths are in `ColaberryEnterprise_AI_LeadershipAccelerator` at `origin/main` commit `c96f6a68`
unless marked "this repository". Abbreviations:

| Short name | Full path |
|---|---|
| **CSV** | `docs/architecture/ai-workforce-management/LEGACY_AGENT_CLASSIFICATION.csv` |
| **CAP** | `backend/src/services/agentDomain/capabilities/product_experience.json` |
| **WEB** | `backend/src/services/agentDomain/capabilities/website.json` |
| **UNR** | `backend/src/services/agentDomain/capabilities/_unresolved.json` |
| **SEED** | `backend/src/services/agentRegistrySeed.ts` |

| Tag | Claim | Citation |
|---|---|---|
| L1 | All 25 capabilities `draft`; nothing here changes an agent | CAP:9 (`distinct_capabilities: 25`); `"requirement_validation_state": "draft"` appears 25 times in CAP; this repository: `docs/stories/product_experience.LEGACY-MIGRATION-PLAN.md` ("Before you start") |
| L2 | 246 rows; columns `agent_name, proposed_kind, proposed_owner_domain, source, reason`; 0 Product Experience rows | CSV:1 (header), CSV:2-247; re-parsed with Python's `csv` module (V1) |
| L3 | Capability file's three-pass proof and per-domain counts | CAP:2911-2912 |
| L4 | `legacy_dispositions` empty; `legacy_rows_analyzed: 0` | CAP:2909, CAP:8 |
| L5 | `UX_Optimization_Agent`: retire, Website, no source file, cites SEED:1269 | CSV:219; `git log --all -- backend/src/services/agents/platform/uxOptimizationAgent.ts` returns nothing |
| L6 | Website domain records it `retired`, no successor | WEB:3498-3503 |
| L7 | `WebsiteUXHeuristicAgent`: retire, Website, cites SEED:736; wrapper callers only inside the orchestrator | CSV:226; `backend/src/services/aiOrchestrator.ts:428` (wrapper), `:452` (caller); `aiOrchestrator-Ali-AI.ts:349`, `:373` |
| L8 | Agent source is 268 lines; carried forward as `website.ux_heuristic_page_review` | `backend/src/services/agents/websiteUXHeuristicAgent.ts` (268 lines, counted); WEB:398, WEB:407, WEB:3471-3475 |
| L9 | Website domain: code "reachable in production today", zero-inheritance false, cites `adminRoutes.ts:256` | WEB:3507 |
| L10 | Website domain's accountable human | WEB:3 (`Sai Tejesh Kowtharapu`) |
| L11 | 21 unresolved rows; five described as production rows, enabled, "verify whether anything still runs it" | CSV:227-247 (production rows CSV:243-247) |
| L12 | Roster: Product Experience legacy count 0, explanation mentions `UX_Optimization_Agent`; total 246 | `docs/architecture/ai-workforce-management/AI_EMPLOYEE_ROSTER.md:31`, `:41` |
| L13 | `.loop-architect/` is gitignored and absent | `.gitignore:18`, `:106`; `git ls-tree -r origin/main` contains no `.loop-architect/` path |
| L14 | Current seed lines for the two agents; old cited lines fall in other entries | SEED:753 (`WebsiteUXHeuristicAgent`), SEED:1286 (`UX_Optimization_Agent`); SEED:736 in `WebsiteBrokenLinkAgent`, SEED:1269 in `Corporate_Training_Agent`; same lines at `2a139ec6` |
| L15 | Fixture calls `WebsiteUXHeuristicAgent` confirmed dead, seed-only | `backend/src/services/__tests__/fixtures/cronRegistryBaseline.ts:108` |
| L16 | 10 seeded agents absent from the CSV, none UX-shaped | SEED:64, :86, :1939, :2411, :2524, :2562, :2586, :2736, :2850, :3176 (compared against every `agent_name` in CSV) |
| L17 | *(retired in revision; folded into L25)* | — |
| L18 | Governance escalation goes to the DRI, Ali Muwwakkil; idempotency is required | Platform `CLAUDE.md:10` (DRI), `:197-201` (escalation triggers), `:281` (notify the owner), `:352` (Idempotency & Replayability) |
| L19 | The run that produced the capability file; no agent exists for this domain | `backend/src/services/agentDomain/autonomyLadder.ts:4` (run `20261007-school-agent-factory`, session `CC-20261006-a4k7`); CAP:1070 (`agent_id is null`) |
| L20 | Replay check: same output hash on two runs | Appendix A script, run twice on 2026-10-27 at `c96f6a68` |
| L21 | The 11 tracked capability files account for all 246 rows, matching the CSV one for one | Appendix A totality script over `backend/src/services/agentDomain/capabilities/*.json`; CAP:8, UNR:4 |
| L22 | `_unresolved.json`: why it is tracked; "Five of these are live production rows"; kinds 8/8/5; `needs_owner_decision` | UNR:3 (`_comment`), UNR:4 (`legacy_row_count`), UNR:5-9 (`kind_breakdown`), UNR:10 (`needs_owner_decision: true`); production-row reasons are the last five entries of UNR `rows` |
| L23 | Call chain from admin route to agent | `backend/src/routes/admin/websiteIntelligenceRoutes.ts:17` (`POST /api/admin/website-intelligence/scan`, `requireAdmin`); `backend/src/routes/adminRoutes.ts:58`, `:261` (mount); `backend/src/controllers/websiteIntelligenceController.ts:138` (`runAllWebsiteIntelligence()`); `backend/src/services/aiOrchestrator.ts:17` (import), `:429` (call), `:452` (inside `runAllWebsiteIntelligence`) |
| L24 | Website capabilities' outcomes and inputs | WEB:20-22 (public accessibility, "every public page"); WEB:398-400 (UX heuristics, heading hierarchy); WEB:860, :869, :890, :918 (route inventory reads "every file under frontend/src/pages"; `/admin/ai-settings` listed); WEB:1377, :1405 (banned copy, all page and component sources); WEB:1507, :1534 (claims registry) |
| L25 | Our overlapping capabilities' inputs | CAP:377, CAP:414 (WCAG; twelve checks incl. heading hierarchy); CAP:842, CAP:868-869 (unrouted pages: route trees + `App.tsx`, import graph); CAP:980 (route inventory); CAP:1212, CAP:1239-1240 (copy audit: banned-word rules, claims registry) |
| L26 | Corroboration note, including `.loop-architect/…/plan.md:14` | CAP:2914 |
| L27 | Brief contains no `file:line` citations, while its build instructions say it does | This repository: `docs/stories/product_experience.LEGACY-MIGRATION-PLAN.md:3-9` (the brief), `:39-40` (the instructions); a pattern search for `file.ext:line` in the brief returns 0 |
| L28 | Marketing and Sales accountable humans | `backend/src/services/agentDomain/capabilities/marketing.json:3` (`Sohail Syed`), `sales.json:3` (`Roselyn`) |

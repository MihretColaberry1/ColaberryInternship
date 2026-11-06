# Cross-brand surface consistency audit: R0 ownership-boundary definition

**Capability:** `product_experience.multi_brand_surface_consistency_audit` · **Release:** r2 ·
**Autonomy:** R0 (definition only; ceiling R4)
**Accountable manager:** Mohammed Abdul Aleem · **Website domain manager:** Sai Tejesh Kowtharapu
(as recorded, see §2.3) · **DRI:** Ali Muwwakkil
**Prepared by:** Mihret Netsereab · first draft 2026-11-05
**Status:** **draft, ready for review, not signed.** This document is what the R0 criterion asks the
two managers to agree on: *"Mohammed Abdul Aleem and the Website domain's manager agree in writing
which surfaces this domain audits"* [S1] `:79`, `:108`. Until **both** agreements are recorded in
[Sign-off](#sign-off), the criterion stays unpassed and the capability stays `draft`. Neither
manager needs admin portal access to answer.

Each claim is tagged **Verified** (checked against a repository, the GitHub API or a live request
while writing this), **Story** (stated in the capability record), **Reported** (stated by someone,
not recorded in a repository), **Proposal** (my suggestion, waiting on a human decision) or
**Unknown**.

**One difference from the two earlier R0 definitions.** The token-drift and sync-review definitions
record Mihret's *working decisions* next to each open question, following Ali Muwwakkil's guidance
[S20]. **This document records none for the ownership questions.** Deciding which domain owns a
surface affects another domain and its manager, so a working decision from this domain would
pre-empt them. §5 and §6 present **options only**.

**Read-only. Nothing in any of these was changed, commented on or merged:**
- the platform repo, `ColaberryEnterprise_AI_LeadershipAccelerator`, local shallow clone at
  `c96f6a68` (merged 8:56 PM CDT on 2026-10-27). Upstream `main` was `d77cb8d4` (7:12 PM CST on
  2026-11-05). Between those commits, the only changes in the paths cited here are copy edits in
  `apps/refactored-public` (`claims.json`, `src/index.html`, `src/about/index.html`) **(Verified,
  GitHub compare API)** [S18];
- `agentDomainRegistry.ts`, read from upstream `main` through the GitHub API, because it changed
  after the local clone [S6];
- six public hostnames, each with one HTTP `HEAD` request on the evening of 2026-11-05 (CST). No
  page script ran [S17];
- the downloaded build package `product-experience-build-docs-v1 (1).zip` (generated 8:40 PM CST
  on 2026-11-05), read in memory without extracting it [S5].

No agent setting, autonomy level, tool grant or `.colaberry/` file was changed. Maru stays
disabled.

---

## What R0 is, and what it is not

**Release r2 and autonomy R0 are two different scales (Verified).**

| Scale | Value | What it means | Source |
|---|---|---|---|
| **Release** | `r2` | The **delivery bucket** the plan schedules this story in: the release that holds all 25 capability stories, after `r0` "Discovery and validation" and `r1` "Legacy migration plan" | [S2] `.colaberry/plan.json:59`, `:260-262` |
| **Autonomy** | `autonomy:R0` (ceiling `autonomy:R4`) | **What the agent may do.** At R0 the agent does nothing; humans define the work | [S1] `:70-71`; [S5] `agent-domain.json:169-178` (`approved_autonomy: autonomy:R0`, `max_permitted_autonomy: autonomy:R4`) |

They only share a letter. An r2 story starting at autonomy R0 is the normal case for every capability
in this domain.

### R0 behaviour versus the R0 acceptance criterion (Story; interpretation Unknown)

The story states two things about R0, and they aren't the same size. **This document keeps both.**

| | What the story says | Source | Who decides it | Covered here |
|---|---|---|---|---|
| **Stated R0 behaviour** | *"Draws the ownership boundary against the Website domain **and records which brands must converge**."* Two parts: (a) the ownership boundary; (b) a record of which brands must converge | [S1] `:76-77` | (a) Aleem and the Website manager together; (b) Aleem alone, as a positioning decision [S1] `:71` | (a) §5, §6; (b) §7, L1 (template, left blank) |
| **R0 acceptance criterion** | *"Mohammed Abdul Aleem and the Website domain's manager agree in writing which surfaces this domain audits."* | [S1] `:79`, `:108`; [S2]; [S3] `:306-312` | Both managers | §5, §6, [Sign-off](#sign-off) |

**The gap (G11).** The behaviour includes part (b), the convergence record. The criterion covers only
the surface agreement, which is part (a). Two readings are possible, and **neither is assumed here**:

- **Reading 1:** the criterion is the stop condition. R0 is accepted on the surface agreement
  alone, and the convergence record (L1) can be completed later, before the first comparison.
- **Reading 2:** R0 is complete only when both parts of the stated behaviour exist. The surface
  agreement passes the criterion, but the story isn't finished until Aleem's convergence record
  also exists.

**This needs confirmation from Ali Muwwakkil (DRI) or Mohammed Abdul Aleem (accountable
manager)** (decision R1, [Sign-off](#sign-off)). Until then:
- the acceptance criterion's wording is **unchanged**, and only it is used to set `passed` in
  `.colaberry/progress.json`;
- the convergence record **stays an open human decision** (L1). It is neither dropped nor filled in.

**What this document does, and doesn't do:**

- **This document prepares the surface agreement.** It covers the surface inventory (§1), current
  ownership evidence (§2), exceptions and boundaries (§3), blockers (§4), the joint decisions (§5,
  §6) and the decisions that can wait (§7).
- **No comparison was run.** No token table, parser, report renderer or agent was built. A
  per-brand token comparison is deliberately **left out** of this document: before the boundary is
  agreed, a colour table would read as findings and pre-empt both managers.
- **The "which brands must converge" part stays open.** It's Aleem's decision alone, and it's needed
  before the first comparison. The acceptance criterion's wording doesn't mention it; whether R0
  still needs it is gap G11, above (§7, L1).
- **The brand decision stays human at every level** [S1] `:73-75`. Ali's answer to interview Q3
  says the same about brand design systems (**Reported**, waiting for Aleem's confirmation) [S20].
- **Nothing was sent.** No email went to either manager. Any outreach waits for Mihret's approval.

---

## 1. Verified surface inventory

The story speaks of *"four separately-built surfaces"*: the platform plus *"the three public apps"*
[S1] `:3`, `:25`. The code also has a fourth folder under `apps/`, six registered brands and two
external sites. So the inventory keeps **seven evidence rows in two groups**:

- **§1.1, the four core surfaces** the assignment names (rows 1-4);
- **§1.2, three related items** that are not among those four but touch them. Each needs an
  **explicit scope decision**, so none is silently included or excluded (rows 5-7).

Row numbers are the same in both groups and in §5 (J1-J7). Whether this domain audits any row is the
decision in §5.

### 1.1 The four core surfaces named by the assignment (Verified)

| # | Surface | Kind | Where it lives | Served at | Evidence |
|---|---|---|---|---|---|
| 1 | **Platform frontend** | **Deployed application, in this repo** | `frontend/` (React, CRA) | enterprise.colaberry.ai: `HEAD` 200 via Cloudflare | [S9] `nginx/Dockerfile:22`; [S17] |
| 2 | **AI Flotation public app** | **Deployed application, in this repo.** Its README calls it a "skeleton, deliberately": a tracking and lead-capture proof, not a full site | `apps/ai-flotation-public/` | aiflotation.com: `HEAD` 200 via Cloudflare | [S9] `Dockerfile:17`, `:19`, `:24`; `nginx/aiflotation.conf:15`, `:17`; [S14] `apps/ai-flotation-public/README.md:1-5`; [S17] |
| 3 | **CPN public app (OpportunityLift)** | **Deployed application, in this repo** (7 pages; "used to be a skeleton") | `apps/cpn-public/` | opportunitylift.org: `HEAD` 200 via Cloudflare | [S9] `Dockerfile:18-19`, `:25`; `nginx/opportunitylift.conf:18`, `:20`; [S14] `apps/cpn-public/README.md:7`; [S17] |
| 4 | **Refactored public app** | **Deployed application, in this repo, at the preview host only** | `apps/refactored-public/` | refactored-preview.colaberry.ai: `HEAD` 200 via Cloudflare | [S9] `Dockerfile:16`, `:19`, `:23`; `nginx/refactored-preview.conf:24`, `:26`; [S14] `apps/refactored-public/README.md:31-33`; [S17] |

### 1.2 Related items that need an explicit scope decision

None of these is one of the three public apps the story names, and none is the platform frontend.

| # | Item | Kind | Relationship to the core surfaces | Where it lives | Served at | Evidence |
|---|---|---|---|---|---|---|
| 5 | **refactored.ai** | **External production website, not in this repo** | **May be the production deployment of the Refactored app (row 4). That relationship is unverified (Unknown).** The app's own config names `https://refactored.ai` as its `publicUrl`, and its README describes S3 plus CloudFront as the production *path*. But the README also says refactored.ai *"is not served from this repository and cannot be"*, and the host answers from `nginx/1.18.0 (Ubuntu)` without Cloudflare. Whether that host serves this app's code, an older site or something else is Unknown | Unknown | refactored.ai: `HEAD` 200 from `nginx/1.18.0 (Ubuntu)`, without Cloudflare | [S14] `apps/refactored-public/README.md:31-40` (quote at `:35`); [S24] `apps/refactored-public/brand.config.js:13`; [S17] |
| 6 | **Colaberry Enterprise design-system folder** | **Supporting design-system source: a vendored copy, not an independent public website.** No build or serve step | Supplies the Colaberry Enterprise brand system that the backend landing-page renderer and font list are pinned to. The platform frontend uses its own, different copy (below) | `apps/colaberry-enterprise-design/src/assets/design/` | none (not a site) | [S10] `designSystemSync.js:65-67`; [S15] `landingPageTheme.ts:166`, `landingPageFonts.ts:43`; [S9] (absent from the Dockerfile) |
| 7 | **Colaberry Training** | **Additional external website, no code in this repo.** Not one of the three public apps | A registered brand that the design-system sync skips | none (`target: null`) | training.colaberry.com: `HEAD` 200 from Google Frontend | [S10] `designSystemSync.js:80-84`; [S17] |

**What a `HEAD` 200 proves (Verified), and what it doesn't (Unknown).** It proves the host answered.
It doesn't prove the live page matches any commit. Which commit is deployed on each host is
**Unknown**.

**A second copy of the Colaberry brand (Verified).** The platform frontend loads its own vendored
copy at `frontend/src/colaberry/`. All five of its token files differ from the row 6 copy
(`colors`, `typography`, `spacing`, `base`, `fonts`; +339/−520 lines by `git diff --no-index
--stat`) [S16]. Whether that difference is intended is **Unknown** (§7, L3).

**Where each surface's design system comes from (Verified).** All brand design systems are pulled
from repositories under `github.com/aleemcolaberry` (`design-system-sync.yml:3`, `:102-104`;
`designSystemSync.js:5`, `:30`) [S10]. That suggests Aleem authors the brand systems. It is evidence,
not a recorded ownership decision.

---

## 2. Ownership evidence as it stands

### 2.1 What the repositories assign (Verified)

| Question | Finding | Source |
|---|---|---|
| Does any record assign `apps/*` to Product Experience? | **No.** The capability record lists the design folders as source modules, but that's what the capability *reads*, not a decision on who owns the surface | [S1] `:60-65` |
| Does any record assign `apps/*` to Website Portfolio & Conversion? | **No.** None of the Website domain's 28 capabilities lists an `apps/*` module. Its notes say the aiflotation, opportunitylift and refactored-preview nginx configs were *"NOT INVESTIGATED IN THIS PASS"* | [S7] `website.json:3519` |
| Has the boundary been raised before? | **Yes, as undecided.** Discovery anatomy A22; role transition D44; story-alignment review, action 2; migration plan U1 | [S19] |
| Does migration plan U1 cover this capability? | **No.** U1 lists four other overlaps (accessibility, heuristics, route inventory, copy). Mixing them in would widen R0 | [S19] `legacy-migration-plan.md:211` |
| What does each public app depend on? | `packages/*` and the platform HTTP API by URL. Nothing in `frontend/` or `backend/` | [S23] `apps/cpn-public/EXTRACTION.md:39-41`; [S11] |

### 2.2 How the two domains differ (Verified from each domain's own records; framing is Proposal)

- **Product Experience & UI/UX** covers how the product looks and behaves: design-system adherence,
  tokens, accessibility, consistency. Its capability records centre on the platform frontend.
- **Website Portfolio & Conversion** covers the public web presence as a funnel: routes, SEO,
  sitemaps, links, lead capture, conversion, claims, and approval of anything a prospect sees [S7].
- **The three public apps sit where the two meet.** They are public conversion sites, built on
  brand design systems that Aleem appears to author (§1). That is why the boundary needs both
  managers.

### 2.3 Who the two managers are (Verified as recorded; current status Unknown)

| Domain | Recorded manager | Latest evidence | Older, consistent evidence |
|---|---|---|---|
| Product Experience & UI/UX | Mohammed Abdul Aleem (`aleem@colaberry.com`), `can_reach_surface: false`, `MANAGER_NO_LOGIN` | `agentDomainRegistry.ts:131-137` on upstream `main`, last changed `2bd1f2fa` (12:28 PM CDT on 2026-10-28) [S6] | Roster `:31`; ownership map `:13` [S8] |
| Website Portfolio & Conversion | Sai Tejesh Kowtharapu (`saitejesh@colaberry.com`), `can_reach_surface: true` | `agentDomainRegistry.ts:210-219`, same commit [S6] | `website.json` (`researched_at` 2026-10-09; last changed `233d458b`, 6:29 PM CDT on 2026-10-11) [S7]; roster `:36`; ownership map `:18` [S8] |

These are code records, the newest about 8 days old. **Whether Tejesh is still the Website manager
today is Unknown** until he confirms it (§5, J9). The story names no individual; it says *"the
Website domain's manager"* [S1] `:79`.

---

## 3. Exceptions and application-boundary restrictions

### 3.1 Exceptions, and how the audit handles each

| # | Exception | How it's handled | Source |
|---|---|---|---|
| E1 | **Deliberate brand separation** | The normal case for distinct companies. **Never reported as drift.** AI Flotation and CPN both describe themselves as extracted from a five-brand project, CPN with the other brands *"deliberately excluded"* | [S1] `:49`; [S13] AI Flotation `DESIGN_SYSTEM.md:5`, CPN `DESIGN_SYSTEM.md:9` |
| E2 | **No shared-component remedy** | A shared component is never proposed as a fix | [S1] `:50`; see G6 for a gap in the stated reason |
| E3 | **No DESIGN_SYSTEM.md** | The brand can't be audited for intent, and **the absence is the finding.** No such file exists for `refactored-public`, `colaberry-enterprise-design` or the platform's `frontend/src/colaberry/` | [S1] `:51`; [S13] |
| E4 | **Surface not served from this repo** (rows 5, 7) | Can't be audited from source. Reported as **Unknown**, never as clean. Row 5 is never treated as the same thing as row 4 until that relationship is verified | §1.2; [S10]; [S14] |
| E5 | **Upstream-owned design folders** (`apps/*/src/assets/design/`) | Read only, never edited. The folders are overwritten by the sync from `aleemcolaberry`; a change made here would be lost or would diverge from the source | [S10]; [S21] `design_token_drift_audit.R0.md:237` |
| E6 | **Variants and themes** | Each brand has more than one: AI Flotation Forge/Harbor, CPN Grove/Vestry, plus dark mode for most. Comparing defaults only could hide differences. Scope is open (§7, L2) | [S13] |
| E7 | **Two copies of one brand differ** (§1) | Reported as a difference whose intent is **Unknown**. Never called drift until intent is stated | [S16] |

### 3.2 Application-boundary restrictions (Verified)

`scripts/validate-app-boundaries.js` fails the build on these edges [S11] `:9-19`, `:83-101`:

| Forbidden | Allowed |
|---|---|
| `apps/A → apps/B` (apps must not know about each other) | `apps/* → packages/*` |
| `apps/* → frontend/src/*` | `apps/* →` the platform HTTP API, by URL only |
| `apps/* → backend/src/*` | `packages/* → packages/*` |
| `packages/* → apps/*`, `frontend/`, `backend/` | |

What this means for the audit:
- The audit **compares** surfaces. It never connects them, and never proposes an import or a shared
  stylesheet across them.
- The validator scans **JS/TS imports only** (`.js .jsx .ts .tsx .mjs .cjs`, `:27-36`), **not CSS
  `@import`**. A passing validator says nothing about CSS coupling (G7).

### 3.3 Never, at any autonomy level (Story; Ali's Q3 answer Reported [S20])

Decide whether two brands should converge; edit a design system, vendored folder, token file or
`brand-bridge.css`; propose a change to an upstream design system; or change a surface the other
domain owns.

---

## 4. Blockers

The story lists four [S1] `:7-11`, `:81-84`. One is out of date.

| # | Original blocker (Story) | Current evidence | Status | Blocks R0 acceptance? | Blocks later work? |
|---|---|---|---|---|---|
| B1 | `no_ai_employee_provisioned`: *"agent_id is null for this domain"* (kept below as historical evidence) | **Two API-derived snapshots show an agent record** (details below): `display_name: "Maru"`, `enabled: false`, `tools_granted: []`. The static `agentDomainRegistry.ts:137` still says `agent_id: null` [S6] | **Outdated as written.** Corrected: *Maru exists, is disabled, and has no tools granted*, as of the newest snapshot (8:40 PM CST on 2026-11-05) | **No.** R0 is a written human agreement | **Yes.** Any later automated comparison needs Maru enabled and `repo_read`, `css_token_parser`, `report_renderer` granted [S1] `:55-57`. None of that is in scope here. Platform level `observe` is a separate scale from `autonomy:R0` |
| B2 | `manager_has_no_admin_login` | Still recorded: `can_reach_surface: false`, `MANAGER_NO_LOGIN` [S6] `:131-137`. Underlying query dated 2026-09-15 [S8] `:13` | **Current as recorded** | **No.** Aleem can agree by email or confirmed meeting notes | **Yes.** He can't open Maru's Agent Detail or Talk surface |
| B3 | Intended-divergence statement absent | No such statement exists in either repository (searched) | **Confirmed** | **Not by the criterion's wording.** The stated R0 behaviour does include it; see G11 and R1 | **Yes.** Without it, every divergence is "intent unknown" and no audit result can be judged (§7) |
| B4 | Ownership of the three public apps unknown; boundary with Website not drawn | Neither domain's records claim `apps/*` (§2.1) | **Confirmed** | **Yes. This is the criterion itself** (§5) | Yes |

### 4.1 B1 in detail: what is known about Maru, and how

**The historical blocker, preserved as written (Story).** The capability record says:
*"no_ai_employee_provisioned: agent_id is null for this domain
(.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:47)"* [S1] `:8`,
repeated at `:81`. It stays in the story and in this document as evidence of what that 2026-10-07 run
recorded. It isn't deleted or rewritten.

**What the newer evidence is, precisely.**

| Evidence | What it is | What it shows | Label |
|---|---|---|---|
| `.colaberry/agent-domain.json:17-24` in this repo [S4] | **An API-derived snapshot.** The platform's sync wrote this file from `GET /api/admin/agent-domains-mine` (the file's own `sources` field, `:4-5`). The file carries no timestamp by design (`:14`); its agent block last changed in commit `20f1bb7` (6:13 PM CST on 2026-11-02), and the repo's `manifest.json:2` records the last sync at 8:26 PM CST on 2026-11-03 | `agent_id 7b72d4ed-0876-40a6-9571-78473ace091f`, `display_name: "Maru"`, `enabled: false`, `autonomy_level: "observe"`, `autonomy_level_set_at` 11:08 AM CDT on 2026-10-18 with `autonomy_level_source: "auto"`, `tools_granted: []` | **Verified** that the snapshot says this |
| `.colaberry/agent-domain.json:18-24` in the downloaded package [S5] | **A second API-derived snapshot**, from the same source, generated 8:40 PM CST on 2026-11-05 | The same agent block, unchanged | **Verified** that the snapshot says this |
| A direct call to `GET /api/admin/agent-domains-mine` | **Not made.** That admin endpoint needs a login. No live API response was read for this document | (none) | **Unknown:** Maru's state at any moment after 8:40 PM CST on 2026-11-05 |
| `agentDomainRegistry.ts:131-137` on upstream `main` [S6] | A **static code file**, not an API response | `agent_id: null` for this domain | **Verified** that the file says this; it is older than both snapshots in what it reflects |

**Why the historical blocker is outdated (Verified facts; one explanation marked Proposal).**
- The blocker cites a registry written by a run on **2026-10-07**. Both snapshots record Maru with
  an autonomy level set on **2026-10-18**, eleven days later.
- When Maru's record was created isn't in either snapshot, so the exact date the blocker stopped
  being true is **Unknown**.
- The story file last changed in `03ff687` (7:24 PM CDT on 2026-10-21) and still carries the
  blocker. The static registry still says `null`. **Proposal:** the story text was generated from the
  2026-10-07 run's data, or from the static registry, and wasn't refreshed from the live record. Why
  is **Unknown**.
- Nothing here depends on Maru being enabled. It stays disabled.

**Citations behind B1 and B2 (Verified).** The story cites
`.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json:44-47`. The
platform's `.gitignore` excludes `.loop-architect/` (`:18`, `:106`) [S22], so no tracked file can
confirm those lines. For B2, the tracked registry replaces them as evidence. For B1, the two
API-derived snapshots in §4.1 do.

**The same outdated claim elsewhere (Verified, not edited).**
`brand_design_system_sync_review.R0.md:421` and `design_token_drift_audit.R0.md:674` both still say
no AI employee is provisioned. This document doesn't change them. Whoever revises them should use
B1's corrected wording.

---

## 5. Joint ownership decisions (Aleem and Tejesh): options only

**This is the R0 criterion.** Each surface needs an answer from **both** managers. The options are
the same for every row:

- **A:** Product Experience audits it.
- **B:** Website Portfolio & Conversion audits it; Product Experience doesn't.
- **C:** Split by layer. Product Experience audits the design-system layer; Website audits pages,
  content and conversion (the layer question is §6).
- **D:** Neither domain audits it for now. Recorded as an explicit exclusion, with the reason.

No option is pre-selected.

| # | Surface (§1 row) | What each option implies | Aleem | Tejesh |
|---|---|---|---|---|
| | ***The four core surfaces (§1.1)*** | | | |
| J1 | Platform frontend (1) | A matches the domain's other capability records. B or C would move part of the platform's public pages to Website. Which pages are "public" vs "admin" isn't defined here | ☐A ☐B ☐C ☐D | ☐A ☐B ☐C ☐D |
| J2 | AI Flotation app (2) | It's a skeleton, so an audit may find little of substance either way | ☐A ☐B ☐C ☐D | ☐A ☐B ☐C ☐D |
| J3 | CPN app (3) | The only one of the three that is a full live site today | ☐A ☐B ☐C ☐D | ☐A ☐B ☐C ☐D |
| J4 | Refactored app, preview host (4) | Served only at the preview host. It has no DESIGN_SYSTEM.md, so under A or C the first finding is that absence (E3) | ☐A ☐B ☐C ☐D | ☐A ☐B ☐C ☐D |
| | ***Related items needing an explicit scope decision (§1.2)*** | | | |
| J5 | refactored.ai (5): external website, possibly the Refactored app's production deployment (unverified) | Not in this repo. Under A or B it can be judged only from the live site, and what serves it is Unknown. If it later proves to be the row 4 app's deployment, the answer to J4 may be meant to cover it too; the managers can say so here | ☐A ☐B ☐C ☐D | ☐A ☐B ☐C ☐D |
| J6 | Colaberry Enterprise design folder (6): supporting design-system source, not a website | It styles backend-rendered landing pages for several brands [S15], so it affects public pages without being one. B would put a design folder in Website's scope | ☐A ☐B ☐C ☐D | ☐A ☐B ☐C ☐D |
| J7 | Colaberry Training (7): additional external website, not one of the three public apps | No code here, and the sync skips it [S10] | ☐A ☐B ☐C ☐D | ☐A ☐B ☐C ☐D |

Two further joint questions:

| # | Question | Options | Aleem | Tejesh |
|---|---|---|---|---|
| J8 | **Findings routing.** When this audit finds something on a surface the other domain owns, who receives it and who decides it? | (a) Reported to that surface's manager, who decides; (b) reported to both; (c) not reported, the surface is out of scope | ______ | ______ |
| J9 | **Confirming roles.** Is Sai Tejesh Kowtharapu the Website Portfolio & Conversion manager for this agreement? | Yes / No: the manager is ______ | (n/a) | ______ |

---

## 6. Scope questions: design tokens only, or tokens plus application pages?

For every surface answered A or C in §5, the two managers also decide **how deep** the audit goes.
These are questions, not proposals.

| # | Question | Options | Why it matters |
|---|---|---|---|
| OQ1 | **Which layer is audited?** | (i) **Design tokens only:** the vendored `src/assets/design/tokens/*.css` and `styles.css`; (ii) **tokens plus app-authored CSS:** also each app's own `src/assets/site.css` and, for the platform, `tokens.css`, `brand-bridge.css` and component CSS [S12]; (iii) **tokens, CSS and the application pages themselves:** the HTML and rendered pages a visitor sees | (i) stays inside design-system files and away from Website's pages. (iii) reaches into exactly the pages Website owns. (ii) is in between: app CSS sits next to the pages but is styling, not content |
| OQ2 | If pages are in scope (iii), **source or rendered?** | Read the HTML and CSS source, or render the live or preview site | Rendering needs a browser and reaches live hosts. Source reading can't see what a visitor actually gets |
| OQ3 | If pages are in scope, **which pages?** | All routes, or a named list per site | CPN has 7 routes and Refactored 10 [S14]; the platform has far more |
| OQ4 | Is the platform's own Colaberry copy (`frontend/src/colaberry/`) audited as the platform's design system, or treated like the vendored app folders (E5)? | Audited / excluded / compared only with row 6 | Matches open question OQ5 / D8 in the drift-audit definition [S21] |
| OQ5 | **Which comparison concepts** count? The story names primary, surface, text, spacing scale, type scale and radius [S1] `:37` | Those six / more / fewer | The apps and the platform use different token names (`--accent` vs `--color-primary`), so each concept needs an agreed mapping (§7, L4) |

---

## 7. Decisions that can stay open until the future audit

**None of these is named in the R0 acceptance criterion's wording.** Each is needed before the first
comparison means anything. **L1 is the exception to watch:** the story's stated R0 behaviour
includes it, so whether R0 is complete without it is gap G11, pending decision R1.

| # | Decision | Who decides | Why it can wait |
|---|---|---|---|
| **L1** | **The intended-divergence statement:** for each pair of brands and each concept, must they converge, stay distinct, or is it unstated? This is the stated R0 behaviour's *"records which brands must converge"* [S1] `:77` | **Mohammed Abdul Aleem alone** (a positioning decision [S1] `:71`) | The criterion is about *which surfaces*, not *what they should look like*. **Whether R0 also needs it is unresolved (G11, R1). Either way, it stays an unresolved human decision.** No agent and no preparer fills it in |
| L2 | Whether variants (Forge/Harbor, Grove/Vestry) and dark modes are compared, or defaults only (E6) | Aleem | Affects the comparison's size, not its scope |
| L3 | Whether the two different Colaberry token copies (§1) are intended | Aleem | Affects how one finding is labelled |
| L4 | The token-name mapping between the apps' vocabulary and the platform's (OQ5) | Aleem, with frontend engineers | Mechanical, once the concepts are agreed |
| L5 | Confirming Ali's Q3 answer that brand authorship stays human permanently [S20] | Aleem | The story already says so [S1] `:73-75` |
| L6 | Whether Marketing Intelligence & Brand (Sohail Syed) must be consulted, given "Brand" in its domain name | Ali Muwwakkil (DRI) | No record links it to this capability (**Unknown**) |
| L7 | Corrections to the story text (G1-G11) | Whoever maintains the capability record; Ali as DRI | This document records them and doesn't edit the story |

**Template for L1, deliberately blank.** Aleem can complete it later; nothing here is a default.

| Concept | Platform ↔ AI Flotation | Platform ↔ CPN | Platform ↔ Refactored | AI Flotation ↔ CPN | AI Flotation ↔ Refactored | CPN ↔ Refactored |
|---|---|---|---|---|---|---|
| Primary / accent | | | | | | |
| Surface (background) | | | | | | |
| Text | | | | | | |
| Spacing scale | | | | | | |
| Type scale | | | | | | |
| Radius | | | | | | |

Each cell, once Aleem fills it: **converge**, **stay distinct**, or **unstated**. "Unstated" is
reported as unknown, never as an implied wish to converge [S1] `:39`.

---

## 8. Gaps between the story and the evidence (Verified unless marked)

| # | Gap | Effect here | Source |
|---|---|---|---|
| G1 | The story says four surfaces and three public apps; the evidence has four core surfaces plus three related items | §1 separates the two groups; §5 asks about every row | §1.1, §1.2 |
| G2 | Blocker `no_ai_employee_provisioned` is outdated: Maru exists, disabled, no tools | B1 corrected; the original kept as history (§4.1) | [S4][S5][S6] |
| G3 | B1 and B2 cite a gitignored file | Re-cited to the tracked registry (B2) and two API-derived snapshots (B1) | [S22] |
| G4 | The header says *"Blocked by: nothing — you can start this now"* directly below four listed blockers | §4 is used, not the header | [S1] `:7-11`, `:17` |
| G5 | *"Built today: partial"* alongside *"Application surfaces: none"*; Owner blank; no requirement linked | Informational | [S1] `:5`, `:16`, `:21`, `:58-59` |
| G6 | The story says a shared component isn't available because of the validator. The validator **allows** `apps/* → packages/*`, and `packages/brand-system` exists | E2 still applies: no shared component is proposed. The stated reason is inaccurate, not the rule | [S1] `:50`; [S11] `:9-12`; [S23] |
| G7 | The validator doesn't scan CSS `@import` | §3.2 says so | [S11] `:27-28` |
| G8 | The story cites Refactored's `styles.css:1` as design-system evidence; Refactored has no DESIGN_SYSTEM.md | E3 | [S1] `:93`; [S13] |
| G9 | The plan's dates are placeholders: every release starts and ends 2026-09-20 ("weeks 0–0") | Informational | [S2]; [S1] `:15` |
| G10 | Refactored's README describes S3 plus CloudFront as the production path; refactored.ai answers from `nginx/1.18.0 (Ubuntu)` without Cloudflare | Row 5 marked Unknown; its relationship to row 4 is unverified | [S14] `:40`; [S24]; [S17] |
| G11 | **Story vs acceptance.** The stated R0 behaviour has two parts: draw the ownership boundary **and** record which brands must converge. The acceptance criterion covers only the surface agreement. Whether R0 also needs the convergence record is unresolved | Both kept: the criterion's wording is unchanged, and the convergence record stays open (L1). **Needs confirmation from Ali Muwwakkil or Mohammed Abdul Aleem** (R1) | [S1] `:76-77`, `:79`, `:108` |

---

## Sign-off

**Not signed. Neither manager has agreed to anything in this document.** Ali Muwwakkil's interview
answers [S20] and this document's options are inputs, not a substitute.

### How to review and agree to this without portal access

- **No admin portal access is needed.** Each manager can answer by email or in a meeting.
- **What counts as evidence (as in the two earlier definitions):** each manager's own written, dated
  words, either as an email reply or as meeting notes that manager has confirmed in writing. A
  meeting without written confirmation doesn't count; the story excludes *"a conversation that went
  well"* [S1] `:87-88`.
- **The quickest review:** read §1 (four core surfaces, then three related items), then answer J1-J7
  and J8 in §5 and OQ1 in §6. Tejesh also answers J9.
- **Suggested reply format:** "J1 A; J2 C; … J8 (a); OQ1 (i)".
- **The criterion passes only when both managers' written answers name the same surface list.** If
  they differ, both answers are recorded and the criterion stays unpassed until they agree.
- **Unknown:** whether the platform accepts an email copied into this repository as evidence.

### Decisions

| # | Decision | Aleem's answer | Tejesh's answer |
|---|---|---|---|
| D1 | **Surfaces this domain audits (J1-J7). This is the criterion** | ______ | ______ |
| D2 | Findings routing (J8) | ______ | ______ |
| D3 | Website manager for this agreement (J9) | (n/a) | ______ |
| D4 | Layer audited: tokens only, plus app CSS, or plus pages (OQ1) | ______ | ______ |
| D5 | Source or rendered, and which pages, if pages are in scope (OQ2, OQ3) | ______ | ______ |
| D6 | Treatment of `frontend/src/colaberry/` (OQ4) | ______ | (n/a unless J1 is B or C) |

L1-L7 (§7) are **not** on this sign-off. They come later.

### Interpretation of R0 (gap G11): for Ali Muwwakkil or Mohammed Abdul Aleem

This isn't one of the two managers' surface decisions, and it doesn't change the criterion. It
settles whether the story is complete when the criterion passes.

| # | Question | Options | Answer | Answered by (Ali or Aleem) | Date (Central) |
|---|---|---|---|---|---|
| R1 | Is R0 complete on the written surface agreement alone, or does it also need Aleem's convergence record (L1)? | Reading 1: surface agreement alone, L1 later / Reading 2: both / Other: ______ | ______ | ______ | ______ |

### Sign-off record

| Manager | Date (Central) | Channel | Decisions covered | Their words (quote, or a summary they confirmed) | Where the original is kept | Recorded by |
|---|---|---|---|---|---|---|
| Mohammed Abdul Aleem | | | | *No response recorded yet.* | | |
| Sai Tejesh Kowtharapu | | | | *No response recorded yet.* | | |

**Signatures**

| Manager | Signature | Date (Central) |
|---|---|---|
| Mohammed Abdul Aleem, Product Experience & UI/UX | | |
| Sai Tejesh Kowtharapu, Website Portfolio & Conversion | | |

When both rows above show written agreement on the same D1 surface list, the R0 criterion in
`.colaberry/progress.json` (`:306-312`) can be set to `passed: true`, citing this file and the
sign-off record. **Not before.** If R1 is answered "Reading 2", the criterion still passes on the
surface agreement as written, and the story is reported as incomplete until L1 also exists.

### Still blocked even after agreement (not resolved by this document)

- Maru is disabled and has no tools, as of the newest snapshot (B1, §4.1). Any automated comparison
  needs a later level and tool grants.
- Aleem has no admin login (B2).
- The intended-divergence statement doesn't exist (B3, L1), and whether R0 needs it is open
  (G11, R1).
- The story text carries the gaps in §8. This document doesn't edit it.

---

## Sources

Platform paths are in `ColaberryEnterprise_AI_LeadershipAccelerator` at `c96f6a68` unless marked.
"This repo" is `MihretColaberry1/ColaberryInternship`, branch `story-000-command-center-revision`,
at `c991e12`.

| ID | What | Where |
|---|---|---|
| S1 | Outcome, workflow, inputs, outputs, exceptions, tools, source modules, blockers, autonomy, R0 behaviour and criterion | This repo: `docs/stories/product_experience.CAP.multi_brand_surface_consistency_audit.md` (last changed `03ff687`, 7:24 PM CDT on 2026-10-21); content identical to the downloaded package apart from line endings |
| S2 | Release `r2`, the r2 story list, placeholder dates | This repo: `.colaberry/plan.json:59`, `:260-262` |
| S3 | Criterion state `passed: false` | This repo: `.colaberry/progress.json:306-312` |
| S4 | Agent Maru: id, disabled, `observe`, no tools; capability authority. **An API-derived snapshot**, not a live API response | This repo: `.colaberry/agent-domain.json:4-5` (source `GET /api/admin/agent-domains-mine`), `:14` (no timestamp by design), `:17-24`, `:109`; agent block last changed in `20f1bb7` (6:13 PM CST on 2026-11-02); last sync per `.colaberry/manifest.json:2` (8:26 PM CST on 2026-11-03) |
| S5 | Same agent block; `approved_autonomy: autonomy:R0`, `max_permitted_autonomy: autonomy:R4`; verification state `in_progress`, 0 of 1. **A second API-derived snapshot** | Downloaded `product-experience-build-docs-v1 (1).zip`, `.colaberry/agent-domain.json:18-24`, `:169-178`, `:917` (generated 8:40 PM CST on 2026-11-05). Not in this repo |
| S6 | Static domain registry: PX `agent_id: null`, `MANAGER_NO_LOGIN`; Website manager Tejesh, `can_reach_surface: true` | Platform upstream `main`: `backend/src/services/agentDomain/agentDomainRegistry.ts:131-137`, `:210-219` (last changed `2bd1f2fa`, 12:28 PM CDT on 2026-10-28) |
| S7 | Website domain capabilities; no `apps/*` module; app nginx configs not investigated; canonical host unresolved | Platform: `backend/src/services/agentDomain/capabilities/website.json:1163`, `:3519` (last changed `233d458b`, 6:29 PM CDT on 2026-10-11; `researched_at` 2026-10-09) |
| S8 | Roster and ownership map: PX → Aleem (no login), Website → Tejesh | Platform: `docs/architecture/ai-workforce-management/AI_EMPLOYEE_ROSTER.md:31`, `:36`; `HUMAN_OWNERSHIP_MAP.md:13`, `:18` (last changed `a7c243e0`, 10:49 AM CDT on 2026-10-07; queries dated 2026-09-15) |
| S9 | What the production container builds and serves; hostnames | Platform: `nginx/Dockerfile:16-25`; `nginx/aiflotation.conf:15`, `:17`; `nginx/opportunitylift.conf:18`, `:20`; `nginx/refactored-preview.conf:24`, `:26` |
| S10 | Brand registry and targets; upstream author `aleemcolaberry` | Platform: `backend/src/scripts/lib/designSystemSync.js:5`, `:30`, `:42-88`; `.github/workflows/design-system-sync.yml:3`, `:102-104` |
| S11 | Boundary validator: forbidden and allowed edges; JS/TS only | Platform: `scripts/validate-app-boundaries.js:9-19`, `:27-36`, `:83-101` |
| S12 | Platform load order and bridge | Platform: `frontend/src/index.tsx:22-25`; `frontend/src/styles/brand-bridge.css:10-14`, `:19-84` |
| S13 | Design-system intent documents and their absence | Platform: `apps/ai-flotation-public/src/assets/design/DESIGN_SYSTEM.md:5`; `apps/cpn-public/src/assets/design/DESIGN_SYSTEM.md:9`; no such file under `apps/refactored-public/src/assets/design/`, `apps/colaberry-enterprise-design/src/assets/design/` or `frontend/src/colaberry/` |
| S14 | App READMEs: skeleton, page lists, where Refactored is served | Platform: `apps/ai-flotation-public/README.md:1-5`; `apps/cpn-public/README.md:7`; `apps/refactored-public/README.md:31-40` |
| S15 | Backend pinned to the Colaberry Enterprise folder | Platform: `backend/src/services/marketing/landingPageTheme.ts:166`; `landingPageFonts.ts:43` |
| S16 | The two Colaberry token copies differ in all five shared files | `git diff --no-index --stat frontend/src/colaberry/tokens apps/colaberry-enterprise-design/src/assets/design/tokens` and blob hashes, on `c96f6a68` |
| S17 | Host responses | One `curl -sI` `HEAD` request per host, evening of 2026-11-05 (CST): enterprise.colaberry.ai, aiflotation.com, opportunitylift.org, refactored-preview.colaberry.ai (200, Cloudflare); refactored.ai (200, `nginx/1.18.0 (Ubuntu)`); training.colaberry.com (200, Google Frontend) |
| S18 | Upstream changes since the local clone | GitHub compare `c96f6a68...main` (`d77cb8d4`, 7:12 PM CST on 2026-11-05). The compare API can truncate very large diffs |
| S19 | Earlier records of the undecided boundary | This repo: `docs/discovery/02-agent-anatomy.md:110`, `:257`; `docs/discovery/03-role-and-da-transition.md:276`; `docs/discovery/06-story-alignment-review.md:138`; `docs/migration/legacy-migration-plan.md:211` |
| S20 | Ali Muwwakkil's answers and process guidance (**Reported**) | This repo: `docs/discovery/04-manager-interview.md:261-267` (process), `:278` (Q3). Original email not in this repo |
| S21 | Earlier definitions: `apps/*` design folders out of scope as upstream-owned; OQ5 on `frontend/src/colaberry/`; outdated agent statement | This repo: `docs/definitions/design_token_drift_audit.R0.md:237`, `:594`, `:674`; `docs/definitions/brand_design_system_sync_review.R0.md:421` (untracked as of this draft) |
| S22 | `.loop-architect/` is gitignored | Platform: `.gitignore:18`, `:106` |
| S23 | App workspace dependencies; the `packages/` folder | Platform: `apps/cpn-public/EXTRACTION.md:39-41`; `packages/` contains `app-build`, `brand-system`, `case-study-shell`, `tracking-sdk` |
| S24 | Refactored app's configured public URL | Platform: `apps/refactored-public/brand.config.js:13` (`publicUrl: 'https://refactored.ai'`) |

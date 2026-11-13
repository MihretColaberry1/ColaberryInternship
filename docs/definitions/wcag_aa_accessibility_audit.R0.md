# WCAG AA accessibility audit: R0 standard definition

**Capability:** `product_experience.wcag_aa_accessibility_audit` · **Autonomy:** R0 (definition only)
**Accountable manager:** Mohammed Abdul Aleem · **DRI:** Ali Muwwakkil
**Prepared by:** Mihret Netsereab · first draft 2026-11-06
**Status:** **draft, ready for review, not signed.** This document is what the R0 criterion asks
Mohammed Abdul Aleem to approve: *"A written, manager-approved standard per surface class; no audit
has run."* [S1] `:85`. Until Aleem's approval is recorded in [Sign-off](#sign-off), the criterion
stays `passed: false` [S3] and the capability stays `draft`. He can review and approve it by email or in
confirmed meeting notes. He doesn't need admin portal access.

Each claim is tagged **Verified** (checked against a repository, or against the W3C text, while
writing this), **Story** (stated in the capability record), **Reported** (stated by someone, or in
an earlier document, and not re-checked here), **Proposal** (my recommendation, waiting on a human
decision) or **Unknown**.

**Every Proposal is also Mihret Netsereab's working decision,** listed in
[§9](#9-open-decisions-for-mohammed-abdul-aleem) and the [decision table](#decisions). It lets
preparation continue under Ali Muwwakkil's guidance [S24]. **It is not Aleem's approval, and it is
not platform policy.** There is **no** working decision on two things the story reserves for
humans: the obligation for internal admin surfaces (§3.4), and who owns public pages (§3.1, D8).

**Read-only. Nothing in any of these was changed:**
- the platform, `ColaberryEnterprise_AI_LeadershipAccelerator`, local shallow clone at `c96f6a68`
  (merged 8:56 PM CDT on 2026-10-27). It may be behind the remote. Nothing here was re-read at a
  newer commit;
- this repository's `.colaberry/` files and story files at `fbc7521`;
- the W3C Recommendations WCAG 2.1 (version of 6 May 2025) and WCAG 2.2 (12 December 2024), read
  on 2026-11-06 [S20].

---

## What R0 is, and what it is not

At R0 the capability *"records which surfaces carry an AA obligation, which carry a lower bar, and
what evidence counts as a pass"* [S1] `:83`.

- **This document is that record, in draft.** It covers:
  - the surface classes (§3);
  - the twelve checks mapped to WCAG (§4);
  - what counts as passing evidence (§5);
  - the exceptions (§6);
  - severity (§7);
  - the open decisions (§9).
- **No audit has run. (Verified)** No page was rendered, scanned, walked with a keyboard or
  measured, and no accessibility finding about any surface is recorded here. The facts in this
  document come from:
  - reading source files, route files and stylesheets;
  - reading `package.json` files and git history;
  - recomputing the two contrast ratios the skill itself states (§4.2, K1). That is a check of the
    documentation's arithmetic, not of any page.
- **Nothing was installed, enabled or deployed.** No package, sandbox, branch, agent setting or tool
  grant changed.
- **Accessibility decisions stay human.** The story says this capability stays human-required at
  every autonomy level: an agent may prepare and propose, never decide [S1] `:79`.
- **Working decisions don't pass the criterion.** Only Aleem's recorded approval does.

---

## 1. What the story asks for, and where it is out of date

### 1.1 The workflow this standard feeds (Story)

The later, post-R0 workflow is [S1] `:37-41`:
1. take the agreed surface list in the manager's priority order;
2. run the twelve checks;
3. rank each finding by the skill's severity definitions;
4. prepare a patch per finding on a sandbox branch;
5. report unreachable surfaces as unknown.

None of that happens at R0. This document defines the standard that the workflow would be measured
against.

### 1.2 Corrections to the capability record (Verified)

These are findings about the record. The record is not edited here.

| # | The record says | What is true now | Evidence |
|---|---|---|---|
| **G1** | *"no accessibility engine dependency exists in the repo (no axe-core, eslint-plugin-jsx-a11y, pa11y or lighthouse in frontend/package.json)"* [S1] `:10`, `:72`, `:89` | **Outdated.** `axe-core ^4.11.1` is a devDependency at `frontend/package.json:38`. It arrived in the merge of PR #3286 (`6ba85308`, 9:26 PM CDT on 2026-10-21), after the record's 2026-10-09 measurement. Five component tests already use it (§2.1). pa11y, Lighthouse and `@axe-core/playwright` are absent. Whether `eslint-plugin-jsx-a11y` arrives transitively through `react-scripts` is **Unknown**: `frontend/node_modules` isn't installed locally and no ESLint config declares it | [S9] |
| **G2** | *"the 445 route-reachable pages and 449 components measured 2026-10-09"* [S1] `:43`, `:66` | **A story-reported figure, not a verified inventory.** The sister capability measured **160** literal `path` attributes on the same date (93 admin, 38 portal, 27 public, 2 referral) [S15] `:10`. At `c96f6a68` the route files hold **170** lines containing `path=` (96 admin, 44 portal, 27 public, 2 referral, 1 lifecycle), plus inline routes in `App.tsx`. How 445 was derived is **Unknown**. Parameterised routes such as `/p/:slug` stand for many real pages, so the real page count is **Unknown** too | [S11], [S15] |
| **G3** | The story fulfils no requirement | `"fulfills": []` at `.colaberry/plan.json:443`. `docs/REQUIREMENTS.md` contains no accessibility requirement | [S2] |
| **G4** | `**Owner:**` (blank) and *"Blocked by: nothing — you can start this now"* | The header contradicts the five blockers listed above it in the same file | [S1] `:7-12`, `:17-18` |
| **G5** | *"no_ai_employee_provisioned: agent_id is null"* | **Reported as outdated:** the multi-brand R0 definition recorded, from two API-derived snapshots, that an agent "Maru" exists, is disabled, and has no tools granted. **Not re-checked here** | [S18] `:224` |
| **G6** | The skill's twelve checks are described as *"AA checks"* | Four of them cite criteria that are not WCAG 2.1 AA, and two more include advisory practices (§4) | [S4], [S20] |

The story's citation `storyVisualReview.js` (the recorded token-contrast failure) is at
`tests/systemV2/storyVisualReview.js` in the platform **(Verified, file exists)**. Its contents were
not read for this document.

---

## 2. Existing accessibility work and tools (Verified unless marked)

### 2.1 In the platform

Sources: [S6], [S7], [S10], [S12].

| What | Where | What it shows, and what it does not |
|---|---|---|
| Focus outline, 3 px, on `:focus-visible` | `responsive.css:73-85` | A focus style exists. It doesn't show that it is visible on every background |
| Touch-target minimum, 44 px, below 992 px | `responsive.css:55-70` | Applies to `.btn`, `.form-control` and `.form-select`. `.nav-link` gets padding only. Other links and icon controls get nothing |
| Reduced-motion reset | `responsive.css:88-97`; also `global.css:674`, `:759` | Story: 29 of 68 CSS files honour it (2026-10-09, not re-measured) [S1] `:12` |
| `prefers-contrast: high` block | `responsive.css:131-143` | Three rules: card borders, `.text-muted`, outline buttons |
| Skip link, V1 public | `.skip-nav` at `global.css:387-400`; used at `PublicLayout.tsx:16-20` → `#main-content` | Exists in source. Behaviour not tested here |
| Skip link, V2 public | `PublicLayoutV2.tsx:53-57`, `.cbv2-skip` → `#cbv2-main` (`tabIndex={-1}`) | A **separate** mechanism, not the `.skip-nav` the skill describes |
| No skip link found | `AdminLayout.tsx` (no `skip` or `main` match); `PortalLayout.tsx:76` (`<main>`, no id, no skip link) | A source search, **not an audit result**. Whether those pages bypass repeated blocks some other way is **Unknown** |
| axe-core component tests (jsdom) | `liveMiniPlayer.axe.test.tsx`, `liveMiniPlayer.presentation.test.tsx`, `campusA11y.test.tsx`, `campusHomeA11y.test.tsx`, `gameRoomA11y.test.tsx`; plus `campusContrast.test.ts` | They assert zero `wcag2a`/`wcag2aa` violations on component subtrees. Their own comments say jsdom has no layout or paint, so axe's `color-contrast` rule comes back incomplete (`liveMiniPlayer.axe.test.tsx:19-20`, `:117`) |
| Browser automation | `playwright ^1.58.2` at the platform root `package.json:34` | Present. No accessibility runner is wired to it |
| Public page sweep | `tests/systemV2/v2-page-health.js` (67 lines) | Story: sweeps 11 public V2 routes; no admin or portal equivalent [S15] `:11`. Not an accessibility check |

### 2.2 In this repository (not platform evidence)

`docs/evidence/a11y/README.md` records an axe-core 4.10.2 and Playwright pass, plus a keyboard
walkthrough, on **this repository's own Command Center** [S19]. It is a different product, so it is
**not** evidence for any platform surface. It is useful as a worked example of the evidence shape
§5 proposes. By its own account it didn't cover screen readers, 200% or 400% zoom, or browsers
other than Chrome.

---

## 3. Surface classes

The story requires that the audit *"must not assume one standard for both"* admin and public pages
[S1] `:51`. **Nine classes** are supported by repository evidence. Class membership is by layout and
route tree (Verified) [S11], [S12], [S13]. Embeds and previews are from [S14]. Counts are lines
with `path=` at `c96f6a68`, not page counts (G2).

For every class, the **WCAG version** is decision D1 (§9). This document writes "the chosen
version" and maps both versions in §4.

### 3.1 C1: Public marketing

| Field | Content |
|---|---|
| **Surfaces** | `publicRoutes.tsx` (27); inline routes in `App.tsx` under `PublicLayoutV2` (`:77`) and `PublicLayout` (`:256`) **(Verified)** |
| **Audience** | Anonymous visitors. The repo names the target audience as *"enterprise executives, 35-60"* (`CLAUDE.md:690`) **(Verified)**. Whether visitors who rely on assistive technology have been measured is **Unknown** |
| **Proposed obligation** | Full conformance at Level AA of the chosen version, for full pages and complete processes (WCAG §5.2.2-5.2.3 [S20]), including each responsive variant **(Proposal)** |
| **Evidence required** | All of E1-E6 in §5 **(Proposal)** |
| **Exceptions** | X1 third-party embeds; X2 visual changes; X3 token-only contrast; X4 unreached = unknown (§6) |
| **Open decisions** | D1, D2, D3, D4, **D8 ownership**. The migration plan lists the Website domain's `public_page_accessibility_audit` (alt text, ARIA, form labels, contrast on "every public page") and `ux_heuristic_page_review` (heading hierarchy) as overlapping this capability on public pages [S16] `:220-221`. Settling it is assigned to Aleem **with Sai Tejesh Kowtharapu**, the Website domain manager [S16] `:297`; [S18] `:5` **(Reported** that Tejesh is still that manager; the record was about 8 days old when last checked [S18] `:173`). **No working decision is recorded:** it would pre-empt the Website manager |

### 3.2 C2: Shareable public records

| Field | Content |
|---|---|
| **Surfaces** | `/p/:slug`, a student's shareable Capstone Record under `PublicLayoutV2` (`App.tsx:188`, `:203`) **(Verified)** |
| **Audience** | Anonymous visitors, including employers a student shares the link with **(Proposal**, inferred from "shareable"; not stated in a record) |
| **Why a separate class** | Public and unauthenticated like C1, but the content is written by students, not by marketing. One route stands for one page per student |
| **Proposed obligation** | Same as C1 for the page template we author. Student-written content (for example, images a student uploaded without alt text) is reported separately, not as a template defect **(Proposal)** |
| **Evidence required** | As C1, measured on a sample of real records. The sample size is part of D4 |
| **Exceptions** | X1-X4; plus student-authored content (D6) |
| **Open decisions** | D2 (separate class or part of C1?), D4, D6, D8 (does the Website domain's "every public page" include it? **Unknown**) |

### 3.3 C3: Authenticated portal

| Field | Content |
|---|---|
| **Surfaces** | `portalRoutes.tsx` (44), under `PortalLayout`, including the campus pages (`GameRoomPage`, `CampusHomePage`, `portalRoutes.tsx:37-38`) **(Verified)** |
| **Audience** | Signed-in programme participants (the portal's tests use `ParticipantAuthProvider`) **(Verified** for the provider; who the participants are in detail is **Unknown**) |
| **Proposed obligation** | Same as C1. Participants are external users who may rely on assistive technology, and learning and enrolment flows are "complete processes" under WCAG §5.2.3 **(Proposal)** |
| **Evidence required** | E1-E6. The existing campus axe tests (§2.1) count as **supporting** evidence for those components only. They don't count as page-level evidence, and never for contrast |
| **Exceptions** | X1-X4. Video lessons through `VideoEmbed.tsx` are C6 content inside C3 pages |
| **Open decisions** | D2, D3, D4. Whether any overlap with the Website domain extends here: **Unknown** (the migration plan names public pages only [S16]) |

### 3.4 C4: Internal administration

| Field | Content |
|---|---|
| **Surfaces** | `adminRoutes.tsx` (96) and `/admin/project-lifecycle/:projectId` (`lifecycleRoutes.tsx:148`, `:151`), under `AdminLayout` **(Verified)** |
| **Audience** | Colaberry staff with an admin login (`admin_users`) **(Story**, from the blocker wording [S1] `:8`). Whether any current or future staff member relies on assistive technology is **Unknown** |
| **Proposed obligation** | **None proposed. This is Aleem's decision (D2).** The story says admin surfaces *"may carry a different AA obligation"* and *"the manager sets that"* [S1] `:51`. Options for Aleem: **(a)** the same as C1; **(b)** AA of the chosen version, with named criterion-level exceptions recorded in the UX quality exception register [S22]; **(c)** a stated lower level, for example Level A only, with a trigger for raising it (such as a staff member requesting an accommodation). Until he decides, every C4 result is reported as "obligation not set", never as pass or fail |
| **Evidence required** | Depends on D2. Whatever level is chosen, E1, E4 and E6 are the minimum **(Proposal)** |
| **Exceptions** | X1-X4. Generated-content previews inside admin pages are C7 |
| **Open decisions** | D2, D3, D4 |

### 3.5 C5: Referral

| Field | Content |
|---|---|
| **Surfaces** | `/referrals/login` and `/referrals/dashboard`, inside `AlumniAuthProvider` and `ReferralProtectedRoute` (`referralRoutes.tsx:9-12`) **(Verified)** |
| **Audience** | Programme alumni who refer others **(Proposal**, inferred from `AlumniAuthProvider`) |
| **Proposed obligation** | Same as C3: external users, a sign-in process and a dashboard **(Proposal)** |
| **Evidence required** | E1-E6, with sign-in treated as a complete process |
| **Exceptions** | X1-X4 |
| **Open decisions** | D2 (own class, or part of C3?) |

### 3.6 C6: Third-party embedded content

| Field | Content |
|---|---|
| **Surfaces** | A Vimeo iframe on the home learning section (`HomeLearningMediaSection.tsx:42-49`, with a `title`); provider iframes for YouTube, Vimeo, Loom and Wistia in lessons (`VideoEmbed.tsx:248-259`, with a `title`); a provider iframe in V2 story pages (`StoryHeroFigure.tsx:73-75`). The same component plays self-hosted video with a captions track (`:117`, `:127`), which is **our** content, not C6 **(Verified)** |
| **Audience** | Whoever views the host page |
| **Proposed obligation** | **Not remediated in this repo; reported as upstream** [S1] `:53`. What *we* control is audited under the host page's class: the iframe's accessible name, its keyboard reachability, whether captions are available for the video we chose to embed, and whether we choose an accessible provider. WCAG's conformance model offers a "statement of partial conformance" for content from uncontrolled sources (WCAG 2.1 and 2.2 §5.4 [S20]) **(Proposal** to use that wording) |
| **Evidence required** | A list of each embed: provider, host page, our wrapper's result, and an upstream note. Never "conformant" on the provider's behalf |
| **Exceptions** | X1 |
| **Open decisions** | D6: is a third-party *library* rendering in our DOM (Bootstrap, recharts, reactflow, react-force-graph-2d, dnd-kit, all in `frontend/package.json`) C6, or our content? **Proposal:** our content. We choose and configure those libraries, and WCAG conformance is for full pages that cannot exclude parts (§5.2.2 [S20]) |

### 3.7 C7: Generated-content previews (additional class)

| Field | Content |
|---|---|
| **Surfaces** | Iframes that preview content the platform generates: `EmailPreview.tsx`, `admin/person/MessageAsSent.tsx`, `InlineLandingPageBuilder.tsx`, `LandingPageDetails.tsx`, `studio/studioKit.tsx`, `projects/presentation/DeckFrame.tsx`, `runtime/RuntimeBlogPanel.tsx`, `runtime/RuntimeFillReader.tsx` **(Verified:** each contains `<iframe`). What each one loads was not inspected **(Unknown)** |
| **Why a separate class** | They aren't third-party (we generate the content), but the content's real destination is often somewhere else, such as an email client or a published landing page, with its own accessibility needs |
| **Proposed obligation** | The preview frame (name, focus, keyboard) belongs to its host page's class. The previewed content is **out of scope for this capability's first pass** and recorded as unknown **(Proposal)** |
| **Open decisions** | D6 |

### 3.8 C8: Separate brand public apps (additional class)

| Field | Content |
|---|---|
| **Surfaces** | `apps/ai-flotation-public/`, `apps/cpn-public/` and `apps/refactored-public/`, deployed to their own hosts **(Reported** from the multi-brand R0 definition [S18] `:114-116`; not re-checked here) |
| **Why it matters** | They sit outside `frontend/`, so the story's source modules and the skill don't describe them. Who audits them is the open question of the multi-brand ownership work [S18] |
| **Proposed obligation** | **Out of scope until that ownership decision is made** (Proposal). Listed so it is excluded deliberately, not by accident |
| **Open decisions** | D2, D8 |

### 3.9 C9: Out of scope: this repository's Command Center

The static Command Center in this repo (`command-center/`) isn't a platform surface. It already has
its own evidence [S19]. It is listed only so that its results are never cited as platform evidence.

---

## 4. The twelve checks, mapped to WCAG

### 4.1 Mapping (Verified against the W3C text [S20], except where marked)

Five sibling capabilities define narrower standards for checks 1, 2, 4, 6, 7 and 8 [S23]. See the note
under Sources.

**Classification key:**
- **Required (2.1 AA):** part of Level A or AA in WCAG 2.1.
- **2.2 only:** a WCAG 2.2 requirement that doesn't exist in 2.1.
- **AAA:** beyond AA in both versions.
- **Advisory:** good practice, or a technique, but not a success criterion.

| # | Skill check, with the criterion the skill cites [S4] | What WCAG 2.1 AA actually requires | Classification | Skill finding |
|---|---|---|---|---|
| 1 | Colour contrast (1.4.3), `SKILL.md:21-25` | 1.4.3 (AA): text 4.5:1; large-scale text 3:1. "Large scale" is at least **18 point, or 14 point bold** | **Required** | K1, K2, K3 |
| 2 | Semantic HTML (1.3.1), `:27-31` | 1.3.1 (A): structure and relationships can be programmatically determined. Landmark elements and `<button>` versus `<a>` are ways of meeting it, not named requirements | **Required** (criterion); techniques **advisory** | none |
| 3 | ARIA (4.1.2), `:33-37` | 4.1.2 (A): name, role and value. The live-region bullet is 4.1.3 (check 10). The dialog and tab role patterns are ways of meeting 4.1.2 | **Required** (criterion); patterns **advisory** | none |
| 4 | Keyboard (2.1.1), `:39-44` | 2.1.1 (A) all functionality from a keyboard; 2.1.2 (A) no keyboard trap; 2.4.3 (A) focus order; 2.4.7 (AA) focus visible. "Arrow keys within groups" and "Escape closes modals" are widget conventions, not 2.1 criteria | **Required** (2.1.1, 2.1.2, 2.4.3, 2.4.7); conventions **advisory** | none |
| 5 | Form labels (1.3.1, 3.3.2), `:46-49` | 1.3.1 (A); 3.3.2 (A) labels or instructions; 3.3.1 (A) errors identified and described in text. `aria-describedby` is one way to link the error | **Required** | none |
| 6 | Alt text (1.1.1), `:51-54` | 1.1.1 (A): text alternatives; decoration may be ignored by assistive technology | **Required** | none |
| 7 | **Touch targets (2.5.8)**, `:56-59` | **Not a WCAG 2.1 requirement at any level.** 2.5.8 Target Size (Minimum) exists only in **WCAG 2.2, at AA, and requires 24 × 24 CSS px**, with five exceptions (spacing, equivalent, inline, user-agent control, essential). The **44 × 44 px** figure is **2.5.5 Target Size, Level AAA** in 2.1 (renamed "Enhanced" in 2.2) | **2.2 only** (24 px); **AAA** (44 px) | **K4** |
| 8 | **Reduced motion (2.3.3)**, `:61-64` | **2.3.3 Animation from Interactions is Level AAA** in both versions. The A-level motion criteria are 2.2.2 Pause, Stop, Hide (auto-starting motion longer than 5 seconds) and 2.3.1 Three Flashes | **AAA** (as written); 2.2.2 and 2.3.1 **Required** but not what the check tests | **K5** |
| 9 | **High contrast (1.4.11)**, `:66-69` | **1.4.11 Non-text Contrast is real and AA**, but it requires **3:1 against adjacent colours for user-interface component visuals and states, and for required graphical objects**. It says nothing about `prefers-contrast` or Windows high-contrast mode. No WCAG 2.1 or 2.2 criterion requires supporting either | **Split:** 9a non-text contrast **Required**; 9b `prefers-contrast` support **Advisory** | **K6** |
| 10 | Live regions (4.1.3), `:71-74` | 4.1.3 Status Messages (AA, new in 2.1). `role="alert"` and `aria-live` are ways of meeting it | **Required** | none |
| 11 | **Heading hierarchy (1.3.1)**, `:76-79` | 1.3.1 (A) means that what looks like a heading is marked up as one. 2.4.6 (AA) means headings describe topic or purpose. **"One `<h1>` per page" and "no skipped levels" are not in the normative text of 2.1 or 2.2.** 2.4.10 Section Headings is **AAA** | **Split:** markup and descriptive headings **Required**; one-h1 and no-skipped-levels **Advisory** | **K7** |
| 12 | Skip navigation (2.4.1), `:81-84` | 2.4.1 Bypass Blocks (A): *a mechanism* to bypass repeated blocks. A skip link is one such mechanism. Whether landmarks or headings alone satisfy it is answered in W3C's non-normative Understanding document, which was not read **(Unknown)** | **Required** (criterion); "must be a skip link" **advisory** | **K8** |

### 4.2 Findings about the skills, for review (not corrected here)

The skills are not edited by this document. The platform's `CLAUDE.md` names Ali Muwwakkil as DRI
for `.claude/skills/`. Each finding below goes to him for review **(Proposal)**.

| # | Finding | Evidence |
|---|---|---|
| **K1** | **The skill's contrast arithmetic doesn't match its own values.** It states `#2d3748` on `#ffffff` = 10.2:1 and `#718096` on `#ffffff` = 4.6:1 ("passes, barely"). Computed with the WCAG relative-luminance formula, they are **11.99:1** and **4.02:1**. So by its own numbers, `#718096` on white would be **below** 4.5:1 | `SKILL.md:23-24` [S4] |
| **K2** | **Those values are not what the platform renders.** `brand-bridge.css` reassigns both names: `--color-text` → `#2B2B2B` and `--color-text-light` → `#6B6B6B` (`brand-bridge.css:30-31`). `baseline-ui` lists `--color-primary-light` as `#C20E1E`, but the bridge makes it `#FD5760` (`:23`). This is the cascade Ali confirmed in the token-drift R0 [S25]. **Neither the skill's figures nor a recomputation from effective tokens is evidence of what any page shows** (X3) | [S8], [S5] `:24` |
| **K3** | The large-text threshold is written as "≥18px bold / ≥24px". WCAG says 18 **point** (24 px) or 14 **point** bold (about 18.7 px). The bold threshold in the skill is slightly too low | `SKILL.md:22`; [S20] |
| **K4** | The touch-target check cites the WCAG 2.2 criterion (2.5.8, 24 px) with the AAA figure (44 px), under a skill titled "WCAG 2.1 AA". Separately, `baseline-ui` says the 44 px minimum covers "buttons, inputs, links", but `responsive.css:55-70` sets it on `.btn`, `.form-control` and `.form-select` only | `SKILL.md:56-59`; `baseline-ui:199`; [S6] |
| **K5** | The reduced-motion check cites a Level AAA criterion (2.3.3) as an AA check | `SKILL.md:61` |
| **K6** | The high-contrast check cites 1.4.11, but tests `prefers-contrast` support, which no WCAG criterion requires. The real 1.4.11 test (3:1 for controls, states and graphics) isn't in the checklist at all | `SKILL.md:66-69` |
| **K7** | "One `<h1>` per page" and "no skipped levels" are presented as 1.3.1 requirements. They are good practice, not WCAG criteria | `SKILL.md:76-79` |
| **K8** | The skip-nav check assumes `.skip-nav` → `#main-content`. The V2 public layout uses `.cbv2-skip` → `#cbv2-main`, and the admin and portal layouts have no skip link in source | `SKILL.md:82-84`; [S12] |
| **K9** | "Already implemented" (focus, reduced motion, high contrast, skip nav) describes CSS that exists, not results that were measured. The story itself says these signals *"indicate real accessibility work, not conformance"* | `SKILL.md:44`, `:58`, `:62`, `:67`, `:82`; [S1] `:12` |
| **K10** | The skill audits "React components". WCAG conformance is per **full page** and cannot exclude part of a page (§5.2.2 [S20]). A clean component isn't a conformant page | `SKILL.md:3`, `:19` |
| **K11** | **The twelve checks cover only 9 of the 50 WCAG 2.1 Level A and AA success criteria adequately.** WCAG 2.1 has **30 Level A and 20 Level AA** criteria. Conformance at AA means satisfying **all 50** (WCAG §5.2.1). Compared criterion by criterion (§4.3): **9 are covered** by an existing check; **8 are partially covered** (a check touches the subject but doesn't test what the criterion requires); **33 are completely missing**, including **1.4.5** Images of Text, **2.4.5** Multiple Ways, **3.2.3** Consistent Navigation, **3.2.4** Consistent Identification and **3.3.4** Error Prevention. Several missing criteria can only be judged on a whole page (2.4.2, 3.1.1), across a set of pages (2.4.5, 3.2.3, 3.2.4) or across a process (3.3.4), which a component-level checklist can't reach (K10). Check 7 (touch targets) maps to **no** 2.1 A/AA criterion. **Passing all twelve checks therefore does not establish WCAG 2.1 AA conformance, on any surface, and no report may present it that way.** Which missing criteria actually apply to each surface is mostly **Unknown** until the surfaces are inventoried (§4.3) | [S20], [S26] |

### 4.3 Gap analysis: every WCAG 2.1 Level A and AA criterion against the twelve checks (supports K11)

**Method (Verified).** I compared each of the 50 Level A and AA criteria in the WCAG 2.1 normative
text [S26] with the wording of the twelve checks (`SKILL.md:21-84` [S4]). This compares two texts.
**No page was examined, and no status below is a finding about any surface.**

| Status | Meaning |
|---|---|
| **Covered** | A check names the criterion's subject and tests what the criterion requires. "Covered" doesn't mean the check is free of errors: K1-K10 still apply |
| **Partial** | A check touches the subject but leaves out part of what the criterion requires. Where the line between Partial and Missing is a judgment, the row is marked **(Proposal)** for Ali's review with K1-K10 |
| **Missing** | No check addresses the criterion |

**Applicability is a separate question.** A missing criterion matters only on a surface that has the
relevant content, such as video, forms or time limits.
- Applicability is stated below only where this document already holds repository evidence.
- Everywhere else it is **Unknown** until the surfaces are inventoried (B3).
- Nothing below says a criterion is passed or failed anywhere.

**Summary (Verified count; the Partial/Missing split for 2.2.2 is a Proposal):**

| Status | Count | Criteria |
|---|---|---|
| Covered | **9** | 1.3.1, 1.4.3, 2.1.1, 2.1.2, 2.4.1, 2.4.7, 3.3.2, 4.1.2, 4.1.3 |
| Partial | **8** | 1.1.1, 1.4.11, 1.4.13, 2.2.2, 2.4.3, 2.4.6, 2.5.3, 3.3.1 |
| Missing | **33** | 1.2.1, 1.2.2, 1.2.3, 1.2.4, 1.2.5, 1.3.2, 1.3.3, 1.3.4, 1.3.5, 1.4.1, 1.4.2, 1.4.4, 1.4.5, 1.4.10, 1.4.12, 2.1.4, 2.2.1, 2.3.1, 2.4.2, 2.4.4, 2.4.5, 2.5.1, 2.5.2, 2.5.4, 3.1.1, 3.1.2, 3.2.1, 3.2.2, 3.2.3, 3.2.4, 3.3.3, 3.3.4, 4.1.1 |
| **Total** | **50** | 30 Level A + 20 Level AA, all of which AA conformance requires (WCAG §5.2.1) |

Going the other way: **check 7** (touch targets) maps to no WCAG 2.1 A or AA criterion (K4),
**check 8** as written maps to AAA 2.3.3 (K5), and **check 9b** (`prefers-contrast`) to none (K6).

**Every criterion (levels and wording Verified against [S26]):**

| SC | Name | Level | Status | Nearest check | What is and isn't covered; applicability |
|---|---|---|---|---|---|
| 1.1.1 | Non-text Content | A | **Partial** | 6 | Check 6 covers images and icon-only controls. It doesn't name other non-text content: charts and graphs (`recharts`, `reactflow`, `react-force-graph-2d` are dependencies, **Verified**, `frontend/package.json`), canvas, CAPTCHA, or time-based media alternatives |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | A | **Missing** | none | Applicability **Unknown** |
| 1.2.2 | Captions (Prerecorded) | A | **Missing** | none | Prerecorded video exists on C1 and C3 pages (§3.6, **Verified**). One V2 component supplies a captions track (`StoryHeroFigure.tsx:127`, **Verified**). Whether every video has captions, including provider embeds, is **Unknown** |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) | A | **Missing** | none | Applies wherever 1.2.2 does |
| 1.2.4 | Captions (Live) | AA | **Missing** | none | The portal has a live broadcast player (`LiveMiniPlayer`, `BroadcastPlayerContext`, **Verified** from the test imports [S10]). Whether it carries live audio is **Unknown** |
| 1.2.5 | Audio Description (Prerecorded) | AA | **Missing** | none | Applies wherever 1.2.2 does |
| 1.3.1 | Info and Relationships | A | **Covered** | 2, 5, 11 | none |
| 1.3.2 | Meaningful Sequence | A | **Missing** | none | Checks 2 and 11 address structure, not reading order |
| 1.3.3 | Sensory Characteristics | A | **Missing** | none | A wording check on instructions (for example "click the red button"). Applicability **Unknown** |
| 1.3.4 | Orientation | AA | **Missing** | none | Applicability **Unknown** |
| 1.3.5 | Identify Input Purpose | AA | **Missing** | 5 (labels only) | Check 5 requires a label. It doesn't require the input purpose to be programmatically determinable (for example, `autocomplete` on fields collecting the user's own details). Applicability **Unknown**: the forms weren't inspected |
| 1.4.1 | Use of Color | A | **Missing** | 1 (contrast only) | Check 1 measures contrast, not whether colour is the only means of conveying information. A colour-coded component exists: `baseline-ui` lists `TemperatureBadge` as a "Color-coded lead temperature pill" (**Verified**, [S5]). Whether it relies on colour alone is **Unknown** |
| 1.4.2 | Audio Control | A | **Missing** | none | The home-page Vimeo iframe *permits* autoplay (`allow="autoplay; …"`, `HomeLearningMediaSection.tsx:45`, **Verified**). Whether anything plays audio automatically is **Unknown** |
| 1.4.3 | Contrast (Minimum) | AA | **Covered** | 1 | Subject to K1-K3 and X3 |
| 1.4.4 | Resize Text | AA | **Missing** | none | E3 in §5 proposes 200% testing, but no check exists for it |
| **1.4.5** | **Images of Text** | **AA** | **Missing** | none | Normative text: *"If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text"*, except when **customizable** or **essential**, and *"Logotypes … are considered essential"*. Check 6 asks for **alt text** on images, which is 1.1.1. It never asks whether **real text** should replace an image of text. Check 1 doesn't mention images. Applicability **Unknown**: marketing images weren't inspected |
| 1.4.10 | Reflow | AA | **Missing** | none | `responsive.css` has breakpoints (§2.1), but no check tests 320 px reflow |
| 1.4.11 | Non-text Contrast | AA | **Partial** | 9 | Check 9 cites the criterion but tests `prefers-contrast` support (K6) |
| 1.4.12 | Text Spacing | AA | **Missing** | none | none |
| 1.4.13 | Content on Hover or Focus | AA | **Partial** | 4 | "Escape closes modals/dropdowns" covers dismissal for some components. Tooltips and popovers, and the "hoverable" and "persistent" conditions, aren't covered |
| 2.1.1 | Keyboard | A | **Covered** | 4 | none |
| 2.1.2 | No Keyboard Trap | A | **Covered** | 4 | none |
| 2.1.4 | Character Key Shortcuts | A | **Missing** | none | Applicability **Unknown** |
| 2.2.1 | Timing Adjustable | A | **Missing** | none | Applies to any time limit the content sets, for example a session timeout. Applicability **Unknown** |
| 2.2.2 | Pause, Stop, Hide | A | **Partial (Proposal)** | 8 | Check 8 tests that animations respect `prefers-reduced-motion`. 2.2.2 requires a **mechanism on the page** to pause, stop or hide moving or auto-updating content, regardless of the operating-system setting. The reset is not that mechanism. Ranked Partial rather than Missing because the check looks at the same content |
| 2.3.1 | Three Flashes or Below Threshold | A | **Missing** | none | Check 8 doesn't mention flashing |
| 2.4.1 | Bypass Blocks | A | **Covered** | 12 | Subject to K8 |
| 2.4.2 | Page Titled | A | **Missing** | none | Judged per page. Applicability: every page |
| 2.4.3 | Focus Order | A | **Partial** | 4 | Check 4 requires every element to be reachable by Tab, not that the order preserves meaning |
| 2.4.4 | Link Purpose (In Context) | A | **Missing** | 3 (names only) | Check 3 requires accessible names. It doesn't ask whether a link's purpose can be determined (for example, repeated "Read more" links) |
| **2.4.5** | **Multiple Ways** | **AA** | **Missing** | none | Normative text: *"More than one way is available to locate a web page within a set of web pages except where the web page is the result of, or a step in, a process."* Judged across a **set of pages**, which a component checklist can't reach (K10). The admin shell has a navigation file (`components/Layout/adminNav.ts`, **Verified** to exist), which would be one way. Whether a second way exists on any surface, and what counts as a "set of web pages" for each class, are **Unknown** |
| 2.4.6 | Headings and Labels | AA | **Partial** | 5, 11 | Checks 5 and 11 require headings and labels to exist and be marked up. Neither asks whether they *"describe topic or purpose"* |
| 2.4.7 | Focus Visible | AA | **Covered** | 4 | Subject to K9: the check assumes the indicator is implemented |
| 2.5.1 | Pointer Gestures | A | **Missing** | none | Drag-and-drop and graph-canvas libraries are dependencies (`@dnd-kit/*`, `reactflow`, `react-force-graph-2d`, **Verified**). Whether any feature relies on multipoint or path-based gestures is **Unknown** |
| 2.5.2 | Pointer Cancellation | A | **Missing** | none | Applicability **Unknown** |
| 2.5.3 | Label in Name | A | **Partial** | 3 | Check 3 requires an accessible name. It doesn't require that name to contain the visible label text |
| 2.5.4 | Motion Actuation | A | **Missing** | none | Applicability **Unknown** |
| 3.1.1 | Language of Page | A | **Missing** | none | Judged per page. Applicability: every page |
| 3.1.2 | Language of Parts | AA | **Missing** | none | Applicability **Unknown** |
| 3.2.1 | On Focus | A | **Missing** | none | none |
| 3.2.2 | On Input | A | **Missing** | none | none |
| **3.2.3** | **Consistent Navigation** | **AA** | **Missing** | none | Normative text: *"Navigational mechanisms that are repeated on multiple web pages within a set of web pages occur in the same relative order each time they are repeated, unless a change is initiated by the user."* Judged across a **set of pages**, which a component checklist can't reach (K10). Relevant here: public pages use two different layouts, `PublicLayout` (V1) and `PublicLayoutV2` (§3.1, **Verified**). Whether V1 and V2 pages form one "set of web pages" is **Unknown**. It bears on how classes are drawn, and it is not decided here |
| **3.2.4** | **Consistent Identification** | **AA** | **Missing** | none | Normative text: *"Components that have the same functionality within a set of web pages are identified consistently."* Judged across a **set of pages**. Applicability: every class with repeated controls; whether any inconsistency exists is **Unknown** |
| 3.3.1 | Error Identification | A | **Partial** | 5 | Check 5 requires errors to be linked with `aria-describedby`. It doesn't require the item in error to be identified and the error *"described to the user in text"* |
| 3.3.2 | Labels or Instructions | A | **Covered** | 5 | none |
| 3.3.3 | Error Suggestion | AA | **Missing** | none | Applicability **Unknown** |
| **3.3.4** | **Error Prevention (Legal, Financial, Data)** | **AA** | **Missing** | none | Normative text: applies to pages that *"cause legal commitments or financial transactions … modify or delete user-controllable data in data storage systems, or … submit user test responses"*. At least one of these must hold: **reversible**, **checked**, or **confirmed** (*"reviewing, confirming, and correcting information before finalizing"*). Judged across a **process**. **Whether any platform surface does any of the three is Unknown**: payment, enrolment, assessment and data-deletion flows were not inspected |
| 4.1.1 | Parsing | A | **Missing** | none | The WCAG 2.1 text notes it *"should be considered as always satisfied for any content using HTML or XML"* (**Verified**, [S26]). WCAG 2.2 removes it [S20]. Recorded for completeness; little practical effect |
| 4.1.2 | Name, Role, Value | A | **Covered** | 3 | none |
| 4.1.3 | Status Messages | AA | **Covered** | 10 | none |

**What this changes, and what it doesn't:**
- **No obligation, working decision or manager decision changes.** D1-D9, §3 and §5 are as
  they were.
- **The twelve checks stay the skill's checklist.** K11 goes to Ali Muwwakkil for review, with
  K1-K10 (§4.2). Nothing here edits the skill.
- **Which evidence type in §5 would reach each missing criterion is not mapped (Unknown).** For
  example:
  - 3.2.3 and 3.2.4 need a cross-page comparison;
  - 3.3.4 needs a process review;
  - 1.2.x needs a media inventory.

  That bears on D4. It is left for Aleem's review, and D4's working decision is unchanged.
- **Any report that says a surface "conforms to WCAG 2.1 AA" must rest on all 50 criteria** (or
  the WCAG 2.2 set, under D1), **never on the twelve checks alone.**

---

## 5. What counts as passing evidence

The story's evidence rule applies: *"a named passing test, a measured figure with its query, or a
file:line"*. A story marked complete, elapsed time, a conversation, or a mocked test passing never
counts [S1] (story "Evidence this is done").

### 5.1 Evidence types (Proposal)

| ID | Evidence | What it proves | What it cannot prove |
|---|---|---|---|
| **E1** | **Rendered-page rule-engine scan:** axe-core in a real browser against a rendered page, using the tag set for the chosen version (for example `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`). Run at desktop and phone widths, in every theme the page supports, and with disclosures open and closed. Raw JSON is kept | No *detectable* violations of the rules axe can decide | Anything axe marks "incomplete" or can't test; meaning and wording; anything only a person can judge |
| **E2** | **Manual keyboard walkthrough,** scripted where possible: tab order, a visible focus at each stop, no traps, the skip mechanism, dialogs and menus | 2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.7 | Screen-reader output |
| **E3** | **Zoom and reflow:** 200% text resize and a 320 px-wide viewport | 1.4.4, 1.4.10 | Other visual criteria |
| **E4** | **Rendered contrast measurement:** computed styles or pixels on the rendered page, for text (1.4.3) and non-text (1.4.11) | The contrast that is actually shown | Not replaceable by token arithmetic (X3) |
| **E5** | **Screen-reader session** on named key journeys, with the reader, browser and version recorded | Names, roles, announcements and status messages in practice | Coverage beyond the journeys tested |
| **E6** | **A coverage statement:** pages tested out of pages in scope, with untested pages listed as unknown | The denominator | Nothing about the untested pages |

### 5.2 Rules that apply to every class (Proposal)

- **A page is "conformant" only with E1 + E2 + E3 + E4 + E6 all passing, plus E5 where the class
  requires it (D4).** Anything less is "partially evidenced", stating which evidence types exist.
- **Component tests in jsdom are supporting evidence, never page evidence.** The platform's own axe
  tests say they can't compute contrast (§2.1).
- **Zero findings with zero pages tested is reported as "0 of 0 pages tested", never as "no
  findings".**
- **Advisory checks** (7, 8, 9b, the advisory half of 11 and 12, and the conventions in 3 and 4)
  are reported in a **separate advisory list**. They never turn a page from "conformant" into "not
  conformant", unless Aleem raises them to obligations (D5).

---

## 6. Exceptions

| ID | Exception | Handling | Source |
|---|---|---|---|
| **X1** | **Third-party embeds are reported as upstream.** They can't be remediated in this repo | Listed per §3.6, with the provider and host page. Our wrapper is audited under the host page's class. The page's conformance is stated with WCAG's partial-conformance wording for uncontrolled content (Proposal) | [S1] `:53`; [S20] §5.4 |
| **X2** | **Visual changes need the human approval gate.** A fix that changes visible layout or colour leaves the accessibility lane | The finding records "visual change: route to approval gate". The visual-change capability says the same: an accessibility fix *"is still a visual change when it alters the rendered result"*. That gate's own R0 (classification and approver map) isn't signed yet, so these findings wait | [S1] `:52`; [S21] `:51`, `:81` |
| **X3** | **Token-only contrast doesn't establish rendered-page conformance** | Token arithmetic (including §4.2 K1) is never cited as a pass or a fail for a page. Only E4 counts. The story records that this exact failure happened before (`storyVisualReview.js`) | [S1] `:54`; [S8] |
| **X4** | **Unreachable surfaces are reported as unknown,** never as conformant | Any page that couldn't be rendered, signed into, or reached is listed under "not reached", with the reason. It is excluded from every pass count and included in the denominator | [S1] `:41` |
| **X5** | **Student- or user-authored content** (C2, and any user upload) | Reported separately from template defects (Proposal, D6) | §3.2 |
| **X6** | **Shipping any fix needs a human merge and deploy** (`push_to_protected_main` and `production_deploy` are default-denied) | The audit proposes and never applies | [S1] `:11` |

---

## 7. Severity

### 7.1 The skill's definitions, as written (Verified, [S4] `SKILL.md:108-114`)

| Level | Definition |
|---|---|
| **Critical** | Blocks access entirely for assistive technology users |
| **Major** | Significant barrier; workaround may exist but is unreliable |
| **Minor** | Inconvenience; does not block access but degrades experience |

The story says findings are ranked *"by the skill's severity definitions"* [S1] `:39`.

### 7.2 Discrepancies that need a decision (not corrected here)

| # | Discrepancy | Why it matters | Proposal (D7) |
|---|---|---|---|
| **V1** | Severity measures impact on users, not WCAG level. An AAA or advisory item (a 40 px button against the 44 px rule) could be ranked "Major" next to a real AA failure | Mixes obligations with good practice | Each finding carries **two separate fields**: severity (the three levels as written) **and** an obligation label: Required (chosen version) / 2.2-only / AAA / Advisory |
| **V2** | No level for "couldn't determine". axe's "incomplete" results, and unreached pages, have nowhere to go | They would be silently dropped or forced into a level | Add a status **Unknown** that is outside the severity scale (X4) |
| **V3** | "Assistive technology users" doesn't say which technology. A keyboard-only barrier and a screen-reader barrier rank the same | Two reviewers can rank the same finding differently | Record the affected user group on each finding (keyboard, screen reader, low vision, motion, cognitive) |
| **V4** | No rule for breadth. One page and a shared layout that fails on every page get the same level | The ranked list would understate sitewide defects | Record breadth (pages affected, shared component or not) alongside severity, without changing the level |
| **V5** | The definitions don't account for surface class | The same defect may matter differently on C1 and C4 | Severity stays class-independent. The class obligation (§3) decides whether the finding is a conformance failure |

---

## 8. Blockers and stop conditions

### 8.1 Still blocked after sign-off (not resolved by this document)

| # | Blocker | Blocks R0? | Blocks the audit? |
|---|---|---|---|
| B1 | **No rendered surface to audit.** The story needs a sandbox deployment [S1] `:73`. None exists, and creating one is out of scope here | No | **Yes** |
| B2 | **A browser-level accessibility runner.** axe-core is present (G1), so the original "no engine" blocker is outdated. Whether driving it through Playwright needs a new package (for example `@axe-core/playwright`), or can inject the existing `axe-core` file, is **Unknown**. Any new dependency is an escalation to Ali Muwwakkil, not Aleem's call | No | Yes |
| B3 | **No verified page inventory.** The route-inventory capability isn't built (G2), so the denominator for E6 can't be computed | No | Yes, for coverage |
| B4 | **Aleem has no admin login** [S1] `:8` | **No.** He can approve by email or confirmed notes | He can't view C4 pages himself |
| B5 | **Public-page ownership** is unsettled (D8) | No, as long as C1 and C2 are marked "pending D8" | Yes, for C1 and C2 |
| B6 | **The skill findings K1-K11** are unreviewed | No | Yes, if findings are ranked "by the skill" as written |
| B7 | **Agent status.** The record says no agent; a later record says Maru exists, disabled, with no tools (G5, Reported) | No | Yes: tools listed in the story [S1] (headless browser, rule engine, sandbox branch) aren't granted |

### 8.2 Stop conditions for any later audit run (Proposal)

| Condition | Required behaviour |
|---|---|
| A page's class or obligation isn't signed | Report "obligation not set". Don't classify findings as conformance failures |
| A page can't be rendered or reached | X4: list it as unknown; the run is incomplete, never clean |
| A contrast result comes from tokens or jsdom only | Don't count it (X3) |
| A finding lacks a page, a selector or file:line, and a criterion | Treat it as a defect in the run |
| Any attempt to apply, commit, push or deploy a fix | Forbidden. The audit only proposes (X6) |

---

## 9. Open decisions for Mohammed Abdul Aleem

**Why this section has working decisions.** Ali Muwwakkil's guidance to Mihret Netsereab
(email dated 2026-10-27, **Reported**, relayed by Mihret on 2026-10-30; not in this repository)
[S24]:
- don't wait indefinitely for the manager;
- record a working decision next to each question and continue preparing;
- mark it as the preparer's, not the manager's.

**What a working decision can and cannot do:**
- It **can** shape this document and the preparation of later work.
- It **cannot** pass the R0 criterion, start an audit, or set an obligation the story reserves for
  Aleem.

**Two rows have no working decision:** D2 for internal admin (§3.4), and D8 (public-page
ownership).

| # | Decision | Why it matters | Mihret's working decision (preparation only), and why | Aleem's approval |
|---|---|---|---|---|
| **D1** | **WCAG 2.1 AA or WCAG 2.2 AA?** | 2.2 adds AA criteria that 2.1 lacks, for example 2.5.8 Target Size (24 px) and 2.4.11 Focus Not Obscured, and removes 4.1.1 Parsing [S20]. It changes checks 7 and 12 and the tag set in E1 | **WCAG 2.1 AA**, because that is what the capability's title and the skill name. 2.2-only results are recorded as a separate label (V1), so switching later loses nothing | **Pending** |
| **D2** | **Surface classes and the obligation for each** (§3: C1-C8) | The story forbids one standard for all [S1] `:51` | C1, C2, C3, C5: full AA of the D1 version. C6: upstream (X1). C7, C8: out of the first pass. **C4 internal admin: no working decision. Aleem chooses (a), (b) or (c) in §3.4** | **Pending** |
| **D3** | **Surface priority order** | The story's workflow starts from it [S1] `:37`, `:45` | None proposed. Ordering depends on D2 and D8, and on Aleem's view of exposure | **Pending** |
| **D4** | **Required passing evidence, per class** (§5: E1-E6) | Decides what "conformant" means | E1, E2, E3, E4 and E6 for every class with an obligation. **E5 (screen reader) only for C1 and C3 key journeys, which Aleem names.** C4 per D2 | **Pending** |
| **D5** | **Treatment of advisory checks** (7, 8, 9b, and the advisory halves of 3, 4, 11 and 12) | Decides whether the skill's non-AA items can fail a page | Reported in a separate advisory list; never a conformance failure unless Aleem raises one (§5.2) | **Pending** |
| **D6** | **Boundary rules:** third-party libraries (C6), generated previews (C7), student content (C2, X5) | Decides what we are answerable for on a page | Libraries count as our content. Preview contents and student content are reported separately, not as template defects | **Pending** |
| **D7** | **Severity definitions** (§7) | The ranked list is the capability's main output | Keep the skill's three levels as written. Add the obligation label (V1), an Unknown status (V2), the affected user group (V3) and breadth (V4) as separate fields | **Pending** |
| **D8** | **Who audits public pages (C1, C2, possibly C8):** this domain or Website Portfolio & Conversion? | The Website domain's public accessibility audit covers the same checks [S16] `:220-221` | **None.** It needs Aleem **with Sai Tejesh Kowtharapu** [S16] `:297`. A working decision would pre-empt the Website manager | **Pending** (with the Website manager) |
| **D9** | **Findings only, or a proposed patch per finding, in the first version?** | The story's workflow includes patches [S1] `:40`; RESEARCH-5 proposed findings only [S17] `:72` | **Findings only**, with a "proposed fix" text per finding and no branch. Patches need a sandbox branch and the tool grants that B1, B2 and B7 block, and most fixes route to the approval gate anyway (X2) | **Pending** |

**Related decisions owned elsewhere:**
- **Ali Muwwakkil:** skill findings K1-K11; any new dependency (B2); sandbox environment (B1).
- **Unknown:** who owns the capability record's corrections (G1-G6).

---

## Sign-off

**Not signed. Aleem's approval is pending on every decision.** Mohammed Abdul Aleem is the
accountable manager. Ali Muwwakkil's guidance [S24] and Mihret's working decisions (§9) are inputs
to this sign-off, not a substitute for it.

### How to review and sign this without portal access

- **No admin portal access is needed.** Aleem can review this file, or the decision table below,
  by email, in a meeting, or both.
- **What counts as evidence (Mihret's working decision, as in the earlier R0 definitions):** Aleem's
  own written words, with a date: an email reply, or meeting notes he has confirmed in writing. A
  meeting without written confirmation doesn't count [S1].
- **Suggested reply format:** "D1 2.1; D2 agree, C4 option (b); D3 C1 then C3 …; D4 agree; …".
- **Partial sign-off is allowed.** Each decision is recorded as it arrives. The criterion passes
  only when D1-D7 and D9 each have Aleem's recorded decision, and D8 has a recorded outcome agreed
  with the Website manager (or C1 and C2 are explicitly recorded as excluded until it does).
- **Every reply is copied into the sign-off record,** with its date in Central time, the channel and
  where the original is kept.
- **Unknown:** whether the platform accepts an email copied into this repository as evidence for
  the criterion.

### Decisions

| # | Decision | Mihret's working decision (preparation only) | Aleem's approval (pending) |
|---|---|---|---|
| D1 | WCAG version | 2.1 AA; 2.2-only items labelled separately | ☐ 2.1 AA ☐ 2.2 AA ☐ other: ______ |
| D2 | Classes and obligations | C1, C2, C3, C5 full AA; C6 upstream; C7, C8 out of first pass; **C4: none** | ☐ agree ☐ change: ______ · C4: ☐ (a) ☐ (b) ☐ (c) ☐ other: ______ |
| D3 | Priority order | none | Order: ______ |
| D4 | Passing evidence | E1-E4 + E6; E5 on named C1/C3 journeys | ☐ agree ☐ change: ______ · journeys: ______ |
| D5 | Advisory checks | Separate list; never a failure | ☐ agree ☐ raise to obligation: ______ |
| D6 | Libraries, previews, user content | Libraries ours; previews and user content separate | ☐ agree ☐ change: ______ |
| D7 | Severity | Three levels as written + obligation label, Unknown, user group, breadth | ☐ agree ☐ change: ______ |
| D8 | Public-page ownership | **none** (with Sai Tejesh Kowtharapu) | ☐ this domain ☐ Website ☐ split: ______ |
| D9 | Findings only or patches | Findings only, fix described in text | ☐ findings only ☐ patches ☐ other: ______ |

### Sign-off record

| Date (Central) | Channel | Decisions covered | Aleem's words (quote, or a summary Aleem confirmed) | Where the original is kept | Recorded by |
|---|---|---|---|---|---|
| (none) | (none) | (none) | *No response recorded yet.* | (none) | (none) |

When the conditions above are met, the R0 criterion in `.colaberry/progress.json` can be set to
`passed: true`, citing this file and the sign-off record. **Not before. Working decisions never
count toward it.**

---

## Sources

Platform paths are in `ColaberryEnterprise_AI_LeadershipAccelerator` at `c96f6a68`. This-repo
paths are at `fbc7521`.

| ID | What | Where |
|---|---|---|
| S1 | Outcome, workflow, inputs, exceptions, blockers, R0 behaviour and criterion | This repo: `docs/stories/product_experience.CAP.wcag_aa_accessibility_audit.md` (lines cited inline) |
| S2 | Story plan entry with `"fulfills": []` | This repo: `.colaberry/plan.json:440-443`; `docs/REQUIREMENTS.md` |
| S3 | Criterion state `passed: false`, verification `in_progress` | This repo: `.colaberry/progress.json:606` onward (read, not changed) |
| S4 | The twelve checks, output format, severity levels | Platform: `.claude/skills/fixing-accessibility/SKILL.md` (lines cited inline) |
| S5 | Token table, touch-target row, accessibility patterns | Platform: `.claude/skills/baseline-ui/SKILL.md:11`, `:24`, `:199`, `:204-208` |
| S6 | Touch targets, focus, reduced motion, high contrast | Platform: `frontend/src/styles/responsive.css:55-70`, `:73-85`, `:88-97`, `:131-143` |
| S7 | `.skip-nav`; reduced-motion blocks | Platform: `frontend/src/styles/global.css:387-400`, `:674`, `:759` |
| S8 | Declared and effective colour values | Platform: `frontend/src/styles/tokens.css:8-9`, `:27-30`; `frontend/src/styles/brand-bridge.css:22-31`; `frontend/src/colaberry/tokens/colors.css:15-16`, `:54-56`, `:115-116` |
| S9 | `axe-core ^4.11.1`; when it arrived; `playwright` | Platform: `frontend/package.json:38`; `git log -S'"axe-core"'` → `6ba85308` (2026-10-21); root `package.json:34` |
| S10 | Existing axe component tests and their stated limits | Platform: `frontend/src/components/portal/__tests__/liveMiniPlayer.axe.test.tsx:19-20`, `:117`; `components/campus/__tests__/campusA11y.test.tsx:2-10`; `campusContrast.test.ts` |
| S11 | Route counts (lines containing `path=`) | Platform: `frontend/src/routes/adminRoutes.tsx` (96), `portalRoutes.tsx` (44), `publicRoutes.tsx` (27), `referralRoutes.tsx` (2), `lifecycleRoutes.tsx` (1) |
| S12 | Layouts and skip mechanisms | Platform: `components/Layout/PublicLayout.tsx:16-20`; `components/publicV2/PublicLayoutV2.tsx:53-57`; `components/Layout/PortalLayout.tsx:76`; `components/Layout/AdminLayout.tsx` (no match) |
| S13 | Inline routes, the shareable record, lifecycle and referral routes | Platform: `frontend/src/App.tsx:77`, `:188`, `:203`, `:256`; `routes/lifecycleRoutes.tsx:148`, `:151`; `routes/referralRoutes.tsx:9-12`; `routes/portalRoutes.tsx:37-38` |
| S14 | Embeds and previews | Platform: `components/HomeLearningMediaSection.tsx:42-49`; `components/timeline/VideoEmbed.tsx:248-259`; `pages/publicV2/StoryHeroFigure.tsx:73-75`, `:117`, `:127`; the C7 files in §3.7 |
| S15 | 160 literal paths (2026-10-09); public sweep of 11 routes | This repo: `docs/stories/product_experience.CAP.route_surface_inventory.md:10-11` |
| S16 | Website-domain overlap and who settles it | This repo: `docs/migration/legacy-migration-plan.md:220-221`, `:297` |
| S17 | Findings-only versus patches; ownership question | This repo: `docs/discovery/06-story-alignment-review.md:72`, `:161-162` |
| S18 | Website domain manager; brand apps; agent Maru status (**Reported** here, not re-checked) | This repo: `docs/definitions/multi_brand_surface_consistency_audit.R0.md:5`, `:114-116`, `:173`, `:224` |
| S19 | Command Center axe and keyboard pass (not platform evidence) | This repo: `docs/evidence/a11y/README.md` |
| S20 | WCAG success-criterion levels and text; conformance requirements §5.2; partial conformance for third-party content §5.4; "large scale" definition | W3C, *WCAG 2.1*, W3C Recommendation, version of 6 May 2025 (https://www.w3.org/TR/WCAG21/); *WCAG 2.2*, W3C Recommendation, 12 December 2024 (https://www.w3.org/TR/WCAG22/). Read 2026-11-06. The 2.1 text of 1.3.1, 2.5.3 and 2.5.5 was taken from the summary, not verbatim |
| S21 | An accessibility fix is still a visual change; the gate's R0 criterion | This repo: `docs/stories/product_experience.CAP.visual_change_approval_gate.md:51`, `:81` |
| S22 | Standard and exception register per surface class (public, portal, admin) | This repo: `docs/stories/product_experience.CAP.ux_quality_exception_register.md:47`, `:80` |
| S23 | Sibling accessibility capabilities with their own R0 criteria (contrast, keyboard, alt text, motion, touch targets) | This repo: `docs/stories/product_experience.CAP.color_contrast_regression_check.md:80`, `…keyboard_and_semantic_interaction_aud.md:80`, `…image_alt_and_media_accessibility_aud.md:77`, `…motion_and_reduced_motion_compliance_.md:80`, `…responsive_and_touch_target_regressio.md:81` |
| S24 | Ali Muwwakkil's guidance on working decisions (**Reported**) | Email to Mihret Netsereab dated 2026-10-27, relayed 2026-10-30; not in this repository. As cited in `docs/definitions/design_token_drift_audit.R0.md` [S27] |
| S25 | The three-layer token cascade, confirmed by Ali Muwwakkil | This repo: `docs/definitions/design_token_drift_audit.R0.md` §1.1-1.2 |
| S26 | Complete inventory of the WCAG 2.1 Level A (30) and Level AA (20) criteria, with verbatim normative text, including 1.4.5, 2.4.5, 3.2.3, 3.2.4, 3.3.4 and the 4.1.1 note; conformance requirement §5.2.1 | W3C, *WCAG 2.1*, W3C Recommendation 06 May 2025 (REC-WCAG21-20250506), https://www.w3.org/TR/WCAG21/. Guidelines 1.1-4.1 read in full on 2026-11-06. The Understanding and Techniques documents were not read |

**A note on S23.** Five sibling capabilities each define a narrower R0 standard for one of the
twelve checks. Their approvals and this document's should agree. Where they differ, the narrower
capability's signed standard governs its own check **(Proposal)**. None is signed today.

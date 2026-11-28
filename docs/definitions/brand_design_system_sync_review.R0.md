# Brand design-system sync review: R0 note definition

**Capability:** `product_experience.brand_design_system_sync_review` · **Autonomy:** R0 (definition only)
**Accountable manager:** Mohammed Abdul Aleem · **DRI:** Ali Muwwakkil
**Prepared by:** Mihret Netsereab · first draft 2026-11-04 · revision 2, 2026-11-14 · **revision 3, 2026-11-27**
**Status:** **draft, ready for review, not signed.** This document is what the R0 criterion asks
Mohammed Abdul Aleem to confirm: *"The manager confirms the note format answers the question he
actually has before merging."* [S1]. Until Aleem's confirmation is recorded in [Sign-off](#sign-off),
the criterion stays unpassed and the capability stays `draft`. He can review and confirm it by email
or in confirmed meeting notes. He doesn't need admin portal access.

Each claim is tagged **Verified** (checked against a repository or GitHub while writing this),
**Story** (stated in the capability record), **Reported** (stated by someone, not recorded in a
repository), **Proposal** (my recommendation, waiting on a human decision) or **Unknown**.

**Every Proposal is also Mihret Netsereab's working decision.** Each one is listed in
[§8](#8-open-questions-and-the-working-decisions-that-keep-the-work-moving) and in the
[decision table](#decisions). Working decisions let preparation continue under Ali Muwwakkil's
guidance [S27]. **They are not Aleem's approval, and they are not platform policy.**

**Design-system reference (new in revision 3).** In a meeting on 2026-11-27, Aleem shared
`aleemcolaberry/Colaberry-DS-School-Final` and directed Mihret to use it as the final Colaberry
Design System for this agent: its design rules, tokens, contrast standards, components and
validation criteria (**Reported** by Mihret [S17]). This document uses it at commit **`13b17e5c`**
(pushed 10:08 AM CST on 2026-11-20) as the **review standard** for every brand impact note. Two
things are kept apart throughout:
- **The reference** says how a change is judged: thresholds, the pairs to check, the measuring
  method, and the token values a Colaberry target is compared against [S18][S19][S20].
- **The platform's sync configuration** says where vendored files come from today. It is not
  changed by this document or by the note. Where the two differ, the note reports a technical
  discrepancy (§6 G10).

Aleem's direction is not his written sign-off of any R0 decision. The criterion, D2 and OQ1 are
unchanged ([Sign-off](#sign-off)).

**Read-only. Nothing in any of these was changed, commented on or merged:**
- the platform repo, `ColaberryEnterprise_AI_LeadershipAccelerator`, read through the GitHub API
  at the open pull request's current base, **`7806162d` (7:48 AM CST on 2026-11-27)**, and head
  **`da7b69d1` (10:49 AM CST on 2026-11-27)**, plus a read-only sparse copy of `frontend/src` at
  `7806162d`. Platform files are cited in one of three ways:
  - **Re-read at `7806162d` in revision 3:** the workflow, `syncDesignSystems.js`,
    `lib/designSystemSync.js`, the vendored `frontend/src/colaberry/` copy, its consumers and the
    `frontend/src` search (§1, §6 G10).
  - **Read at `fee57d51` or `33fd886c` in revision 2 and confirmed unchanged in revision 3:** the
    pull request's 48 files are byte-identical at `33fd886c` and `da7b69d1` (git blob hashes), so
    the §2 findings derived from them stand. The Refactored `tokens/colors.css`, `styles.css` and
    focus and form rules were re-read at both `7806162d` and `da7b69d1` for the new §2.3 non-text
    pairs.
  - **Read only at the `c96f6a68` clone in revision 2 and not re-checked:** `landingPageFonts.ts`.
- the open sync pull request,
  [ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator#2342](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator/pull/2342),
  and the workflow's run history, read through the GitHub API on 2026-11-27, last at about
  8:35 PM CST;
- the reference repository, `aleemcolaberry/Colaberry-DS-School-Final`, cloned read-only at
  `13b17e5c`.

### What changed in revision 3

1. **The pull request moved, its content didn't.** New base `7806162d`, new head `da7b69d1`. All
   48 files are byte-identical to revision 2's head, so every §2 finding and contrast figure
   stands. It is now **79 days** old (§2.1).
2. **The sync has a sixth brand and a fifth target, `colaberry-app`.** It vendors
   `colaberry-design-system` into `frontend/src/colaberry`, the copy the portal and admin React app
   paints from. Revision 2's line *"`frontend/src/colaberry/` isn't synced by this workflow"* is now
   false and is removed (§1.2). The PR body links five sources; the workflow adds three
   `frontend/src/colaberry` paths (§1.1); the sync strips external `@import`s and refuses
   unregistered targets (§1.3).
3. **DS-School-Final is adopted as the review standard**, per Aleem's direction (Reported [S17]).
   It sets the thresholds and pair set for §3 item 7, and its tokens are what the new item 11
   compares a Colaberry target against. **Item 11 is a new requirement awaiting Aleem's
   confirmation under D2.**
4. **The non-text pairs for Refactored were computed** (§2.3 item 5b): after the merge, the link
   focus ring drops to **1.73:1**, and buttons, tabs, `<summary>` and the contact-form inputs lose
   their authored focus style.
5. **Two reported findings, not fixed here:** the `colaberry-app` sync source differs from the
   reference and fails it on five measured pairs (G10); the reference contradicts itself in
   places, and revision 3 says which files it follows (G11, [Appendix](#appendix-where-the-reference-contradicts-itself-g11)).
6. **Mapping labels.** Every comparison between a platform token and a reference token says whether
   the mapping is **Confirmed** (by consumer code or the platform's own measurement), **Partly
   verified**, or **Assumed** (by name or role only). A matching name alone is never enough (§3
   item 11, I12).
7. New: §6 G10 and G11, §4 I12, §7 boundary lines, sources S17-S26. Updated: G1, G2, G8, I11, OQ2,
   OQ4, D1, D4, §1.6, §2.4 and the source line numbers.

### What changed in revision 2

Revision 2 re-checked every finding against the pull request as it stood on 2026-11-14 and added
what had changed or come to light since the first draft:

1. **Every PR #2342 finding reproduced at the then head** (`33fd886c`). Its colour, entry-point and
   font files were byte-identical to the first draft's head (`459c6a3c`). The 16 undefined tokens,
   the theme flip and the contrast figures were all recomputed from the GitHub API, not copied.
2. **The Refactored.ai design folder is hand-authored, not vendored (Verified, platform history).**
   On 2026-09-08 the vendored folder and its manifest were deleted and a hand-written token system
   was committed in their place, with a dark default chosen on purpose. PR #2342 would overwrite
   it. This changed §2.3, §1.4, E4 and G5, and added OQ9.
3. **A fifth public app, `hire-refactored-public`, appeared** and the build gate builds four apps.
   Its design folder is an unmanaged copy of the Refactored one (§1.2, G9).
4. **The "no AI employee is provisioned" blocker was outdated.** Maru exists, disabled, with no
   tools granted [S15].
5. **On the platform's `main`, this story is marked a candidate (§0).**

---

## 0. Where this story stands on the platform (Verified, 2026-11-27)

- The platform's plan sync on 2026-11-13 (`0549de8` in this repository) added a line to the story:
  *"CANDIDATE -- not started, not assigned."* A candidate becomes real work only when the builder
  picks it and the manager agrees. It then opens as four stories: do it by hand, do it in the
  app, request the tool, and agent does it, watched [S16]. The design-token drift audit has
  already been opened that way. **This capability has not**, so no step 1-4 stories exist for it,
  and this document doesn't invent them.
- The story's single R0 criterion is unchanged. In `.colaberry/progress.json` it is still
  `passed: false`, and the story's state is `in_progress` [S1].
- **This document doesn't pick the capability or open its ladder.** Picking it needs Mihret's
  choice and Aleem's agreement (§8, OQ10).

---

## What R0 is, and what it is not

At R0 the capability *"defines what a brand impact note must contain and what makes one
insufficient for a merge decision"* [S1].

- **This document is that definition.** It covers what the note must contain (§3), what makes a
  note insufficient (§4), how each exception is handled (§5), and the questions only Aleem can
  answer (§8).
- **No agent, parser, contrast tool or report renderer was built.** The worked example in §2 was
  re-derived with read-only GitHub API calls and a small contrast calculation, run from a scratch
  folder outside this repository. None of it is a tool this capability ships.
- **R0 adopts the reference's rules and builds none of its tooling.** DS-School-Final's lint
  (`_lint.mjs`), audit harness and contrast matrix are cited as the standard [S18][S20]. They were
  not run, copied or ported.
- **Nothing was posted to the pull request.** The workflow's step "write the impact note onto the
  pull request as a comment" [S1] is **not done at R0**.
- **The merge is always a human decision** [S1]. Ali's answer to interview Q3 says the same about
  brand design systems (**Reported**, waiting for Aleem's confirmation) [S4].
- **The repository's regression test**, `tests/brand-sync-review-r0.test.mjs`, checks this
  document's structure and that it claims no approval. **It doesn't test the platform**, and
  passing it doesn't pass the criterion.

---

## 1. What the sync does today (the human-operable process the note sits on)

### 1.1 The pipeline (Verified at `7806162d`)

| Step | What happens | Evidence |
|---|---|---|
| Schedule | Runs daily (cron `20 6 * * *`, 06:20 UTC), and can also be started by hand for a single brand | [S2] `design-system-sync.yml:19-30` |
| Sync | `node backend/src/scripts/syncDesignSystems.js`, with its output tee'd to `/tmp/sync.log` | [S2] `:53-67` |
| Drift? | `git status --porcelain`. If nothing changed, the job ends and no pull request is opened | [S2] `:69-77` |
| Build gate | Runs `build.js` in **four** apps (`cpn-public`, `ai-flotation-public`, `refactored-public`, `hire-refactored-public`), then `validate-app-boundaries.js`. **The `frontend/` app isn't built** | [S2] `:79-88` |
| PR body | The sync log plus a fixed warning: *"These are live brand styles"*, with source links for **five** systems, including *"Colaberry app (portal + admin)"* | [S2] `:90-108` |
| PR | One reused branch, `chore/design-system-sync`. Added paths: `apps/*/src/assets/design/**`, and since revision 2 also `frontend/src/colaberry/styles.css`, `tokens/**` and its manifest | [S2] `:110-131` |
| Why a PR | *"The pull request is the review, and it is usually two files and thirty seconds"* | [S2] `:9-13` |

### 1.2 Brands, apps and where tokens land (Verified at `7806162d`)

The registry lists **six** brands, and **five** have a target folder [S3]. Five public apps exist,
plus the platform's own React app.

| Brand / app | Design folder | Who consumes it | Managed by the sync? | Evidence |
|---|---|---|---|---|
| `ai-flotation` | `apps/ai-flotation-public/src/assets/design` | The static site, through `site.css:32` | Yes, manifest present | [S3] `:47-52`; [S6] |
| `cpn` | `apps/cpn-public/src/assets/design` | The static site, through `site.css:51` | Yes, manifest present | [S3] `:53-58`; [S6] |
| `refactored` | `apps/refactored-public/src/assets/design` | The static site, through `site.css:7`, served at `refactored-preview.colaberry.ai`, **not** `refactored.ai` | **Registered, but the folder is hand-authored and has no manifest at the base** (§1.4) | [S3] `:59-67`; [S6]; [S9]; [S13] |
| `colaberry-enterprise` | `apps/colaberry-enterprise-design/src/assets/design` | No site. The backend landing-page renderer pins its copy to this file with a parity test; four brands resolve to this theme | Yes, manifest present | [S3] `:68-82`; [S8] |
| `colaberry-training` | (none, `target: null`) | Not served from this repository. Upstream is registered as `Colaberry-Training-Design-System` | Skipped | [S3] `:83-91` |
| **`colaberry-app`** (new) | `frontend/src/colaberry` | **The portal and admin React app.** `index.tsx:25` imports `./colaberry/styles.css`; `brand-bridge.css` re-points legacy tokens at it. Inside `.cbv2-shell` (the public site), `enterprise-brand.css` re-points the action tokens only | Yes, since 2026-11-15. Upstream `colaberry-design-system`; external `@import`s stripped. The only target outside `apps/*` | [S3] `:92-108`, `:111-125`; [S22] |
| `hire-refactored-public` (hire.refactored.ai) | `apps/hire-refactored-public/src/assets/design` | Its own site, through `assets/tokens.css:26-29` | **No.** Not in the registry, no manifest. Its `tokens/colors.css` was byte-identical to the Refactored one in revision 2 | [S14] |

**The platform frontend imports none of the `apps/*` design folders.** A search of `frontend/src`
at `7806162d` for `assets/design` and `colaberry-enterprise-design` finds only comments, in
`PROVENANCE.md`, `enterprise-brand.css` and `theme/deliveryBrandThemes.ts`. The last two are
**hand-kept copies** of those folders' values (§1.6). The frontend's synced design system is
`frontend/src/colaberry`, the `colaberry-app` target above.

**Where the reference sits.** None of the six registry entries points at
`Colaberry-DS-School-Final`. The Colaberry targets sync from other upstream repositories:
`colaberry-app` from `colaberry-design-system` (last pushed 7:56 AM CDT on 2026-06-25), and
`colaberry-training` from `Colaberry-Training-Design-System` (skipped) [S3][S22]. This is a fact
about the sync configuration. It is reported as G10, not changed.

### 1.3 What the sync log tells a reviewer, and what it doesn't (Verified at `7806162d`)

The log prints one block per brand: `DRIFT`, `OK  `, `SKIP` or `FAIL`. Each block lists the files
added (`+`), changed (`~`) and removed (`-`), plus `?` for files that are referenced but missing
upstream [S4] `syncDesignSystems.js:184-196`.

- It lists **files, not tokens.** A `~ tokens/colors.css` line says nothing about which colours
  moved or what they moved to.
- **It compares against the sync source, never the reference.** `OK` means the vendored copy
  matches its registered upstream. It says nothing about whether that upstream meets
  DS-School-Final. `colaberry-app` reports `OK` while failing the reference on five measured pairs
  (G10).
- **Failure model:** a brand that fails is skipped and logged `FAIL`. The brands that succeeded are
  still written, and the process exits 1 [S4] `:15-20`, `:230-239`, `:249`.
- **Two newer behaviours that change what a diff can contain** [S3][S4]:
  - `stripExternalImports` (registry `:136-162`, applied at sync `:157-168`) rewrites external
    `@import`s in `colaberry-app` CSS into a comment before diffing, so a stripped import never
    appears as drift.
  - `isAllowedTarget` (registry `:111-125`, checked at sync `:140-144`) refuses to write anywhere
    except `apps/*/src/assets/design` and the one named path `frontend/src/colaberry`.
- **A failed sync never reaches a pull request.** The sync step sets `set -o pipefail` (`:61`).
  GitHub runs `run:` steps under `bash -e`, so a non-zero exit fails the step and every later step
  is skipped. **(Verified from the workflow text; relies on GitHub's documented default shell.)**
  An already open pull request keeps the content of the **last successful** run, and nothing on it
  says that a later run failed. The `exit=` output written at `:67` is only reached on success, and
  no later step reads it.

### 1.4 The ownership manifest: what it protects and what it doesn't (Verified)

Each managed folder holds `.design-sync-manifest.json`, the list of files the sync wrote. The sync
**deletes** only files on that list, so hand-authored files such as `DESIGN_SYSTEM.md` survive
[S3] `:360-373`; [S4] `:93-106`, `:173-178`.

- **The manifest guards deletion, not overwriting.** `writeTree` writes every upstream file to its
  path [S4] `:108-120`. A hand-authored file that sits at the same path as an upstream file, such
  as `tokens/colors.css`, is overwritten with no check against the manifest.
- **What happened to the Refactored folder (platform history, all times CDT):**

  | When (2026-09-08) | Commit | What it did to `apps/refactored-public/src/assets/design` |
  |---|---|---|
  | 10:38 AM | `21cf07f5` "Design systems sync from their own repositories instead of by hand" | Added the vendored folder and its manifest |
  | 3:00 PM | `c1148763` | **Removed** the manifest and the vendored files |
  | 4:14 PM | `bd42012d` "Build the Refactored.ai public site" | **Added** hand-written `styles.css`, `tokens/*.css` and `base/*.css`. Its message: *"Dark is the committed default because it is the product's own mode"* |

  PR #2342 opened at 6:34 AM CDT the next morning [S10][S13].
- So today the Refactored folder has no manifest. Its files are first-party code, and the sync
  treats it as a registered target. A platform comment, corrected on 2026-11-10 by its own
  account, describes the same situation for the Hire copy: *"unmanaged first-party code that LOOKS vendored"* [S14] `:7-17`.

### 1.5 What the build gate proves, and what it doesn't (Verified)

- **`build.js`** proves each of the four apps still builds [S2] `:85-87`. A CSS custom property
  that is referenced but no longer defined doesn't fail a build. **PR #2342 is the proof:** the
  pull request is only updated after the build gate passes, and it leaves 16 tokens undefined on a
  served site (§2.3).
- **`validate-app-boundaries.js`** scans `.js/.jsx/.ts/.tsx/.mjs/.cjs` imports for forbidden edges
  [S5] `:27-36`, `:83-101`. **It doesn't read CSS or tokens.**
- **The `colaberry-enterprise` and `colaberry-app` targets aren't built or tested** by the
  workflow. The backend parity test that pins the enterprise copy [S8] and the frontend's own
  `actionContrast.test.ts` [S23] aren't run there.
- **PR #2342 reports no status checks.** It has no requested reviewers, no reviews and no comments
  (Verified, 2026-11-27). Why no checks run is **Unknown**.

### 1.6 Hand-kept copies that a token change can strand (Verified)

- **Dark-mode mirrors.** `ai-flotation-public/src/assets/site.css:49-68` and
  `cpn-public/src/assets/site.css:57-79` copy their vendored `[data-theme="dark"]` block, because
  the sites follow the OS preference [S6][S7]. **Both mirrors still matched value for value (13 of
  13 each)** at revision 2's head, which is byte-identical to `da7b69d1` for these files. Nothing
  updates a mirror when a sync changes the dark block.
- **Backend landing-page palette.** `landingPageTheme.parity.test.ts:159-175` pins three
  enterprise tokens to the vendored `colors.css` [S8]. The sync workflow doesn't run it.
- **Frontend delivery themes (new in revision 3).** `frontend/src/theme/deliveryBrandThemes.ts`
  holds hand copies of each brand's vendored colours, because `frontend/` may not import from
  `apps/` [S22]. Its Refactored entry (`:103-118`) holds the **dark** values of today's bare
  `:root` (`--bg #0C141B`, `--fg #E8F0F6`, `--accent #5CA7DA`). The backend test
  `deliveryBrandThemes.test.ts` pins the AI Flotation (`:65`) and Enterprise (`:101`) copies to
  their vendored files, but **no assertion compares the Refactored copy** (Verified at `7806162d`).
- **Frontend enterprise palette.** `frontend/src/styles/enterprise-brand.css:13-30` hand-copies the
  enterprise system's roles for the public site [S22].
- **The Hire copy.** If PR #2342 is merged, the Refactored and Hire design folders, identical
  in revision 2, diverge. Nothing syncs the Hire copy [S14].

---

## 2. Worked example: PR #2342 as it stands (Verified, read-only, 2026-11-27)

This section shows what the note in §3 would say about the real open pull request. It was derived
from the GitHub API in revision 2 at base `fee57d51` and head `33fd886c`, and re-checked in
revision 3 at base `7806162d` and head `da7b69d1`. The pull request's files are byte-identical at
both heads, so §2.2 to §2.5 stand; §2.3 item 5b and the reference labels are new. **It hasn't been
posted and is not a review.**

### 2.1 The pull request

- Opened 6:34 AM CDT on 2026-09-09. It has been **open 79 days**, refreshed by every daily run. The
  latest 30 runs all succeeded, the newest at 10:48 AM CST on 2026-11-27 [S11].
- **48 files, +914 / -161.** The workflow comment expects *"usually two files"*.
- Sync log: `ai-flotation` DRIFT, `cpn` OK, `refactored` DRIFT, `colaberry-enterprise` OK,
  `colaberry-training` SKIP, `colaberry-app` OK.

### 2.2 AI Flotation: a font-only change

- `tokens/fonts.css` (+337/-3), `styles.css` (comment only), 12 new `.woff2` files, and the manifest.
- **What changed:** the fonts move from a runtime `@import` from `fonts.googleapis.com` to
  self-hosted files. The families are the same: Space Grotesk, Archivo and Manrope.
  `tokens/typography.css` isn't touched.
- **Colour impact: none.** No colour file is in the diff for this brand. This is the story's first
  exception, and the note says so in one line rather than inventing an impact.
- **Non-colour effect:** pages no longer call Google Fonts. Space Grotesk was loaded at weight 700
  only and is now a variable font. **Needs a human eye (low):** compare headings on one page.

### 2.3 Refactored.ai: the sync would replace a hand-authored design

Served surface: `refactored-preview.colaberry.ai`, the only place the rebuilt site is served
today [S9]. It isn't `refactored.ai`.

0. **What the diff replaces.** The files it rewrites (`styles.css`, `tokens/colors.css`,
   `spacing.css`, `typography.css`, `motion.css`) are the hand-written token system from
   2026-09-08, not an older vendored copy (§1.4). **Needs a human eye (high), and a decision
   (OQ9):** whether upstream should own this folder at all.
1. **The default theme flips from dark to light.** Before the merge, bare `:root` holds the
   **dark** values (the comment says *"DARK IS THE DEFAULT, deliberately"*), and light applies only
   when the OS prefers it or `data-theme="light"` is set. After the merge, `:root` holds the
   **light** values (`--system-id: "refactored-a"`), there is no `prefers-color-scheme` rule, and
   dark applies only under `[data-theme="dark"]`. **None of the 12 HTML, JS and CSS files in
   `apps/refactored-public/src` outside `assets/design/` sets `data-theme` or reads
   `prefers-color-scheme`** (Verified, head). So visitors whose OS is in dark mode go from a dark
   site to a light one, and dark mode becomes unreachable.
2. **16 of the 22 tokens `site.css` uses would be undefined after the merge:** `--bg-sunk`,
   `--fg-faint`, `--line-strong`, `--font-mono`, `--font-sans`, `--measure`, `--tap`, `--step-1`,
   and `--space-3xs`, `-2xs`, `-xs`, `-s`, `-m`, `-l`, `-xl`, `-2xl`. **Before the merge, none of
   them is undefined.** (This compares every `var(--…)` in `site.css`, which the PR doesn't change,
   with the custom properties declared in the folder's CSS at base and head.) A declaration whose
   `var()` has no value and no fallback behaves as if it weren't there. For example:
   - `.hero` padding (`site.css:10`) collapses;
   - the bar at `:34-35` loses its background and text colour;
   - `--font-mono` is used at eight places (`:24`, `:59`, `:70`, `:80`, `:86`, `:87`, `:89`,
     `:100`), and all of them lose the mono face.

   **Needs a human eye (high):** look at the preview pages after the merge.
3. **Six colour tokens are removed:** `--bg-sunk`, `--fg-faint`, `--line-strong`, `--success-soft`,
   `--warning-soft` and `--danger-soft`. The first three are used by `site.css` (item 2). The
   `*-soft` three are used nowhere outside the design folder (§5 E2).
4. **A second variant is added:** `[data-variant="geometric"]`. No page sets `data-variant`, so it
   has no visual effect today.
5. **Contrast re-check of the pairs that change.** Method and thresholds: DS-School-Final
   `CLAUDE.md` §2.2 (WCAG 2.2 AA) [S18]. Its success-criterion thresholds (1.4.3, 1.4.11) are the
   same as WCAG 2.1's, so the revision 2 text ratios stand unchanged. Values come from
   `tokens/colors.css` at base and head; `color-mix(… transparent)` is composited over the surface
   it sits on, as the reference requires [S12].

   **5a. Text pairs.** These are token pairs, mapped to the reference by **role only (Assumed)**:
   Refactored's `--fg`, `--fg-muted`, `--accent`, `--success`/`--warning`/`--danger` are judged as
   text on `--bg`/`--bg-elevated`. Which elements use each pair is the token-to-surface map the
   story says doesn't exist yet [S1].

   | Pair (what the visitor gets) | Before | After | 4.5:1 text |
   |---|---|---|---|
   | Light OS: `--success` on `--bg` | `#1B7A4B` on `#F7FAFC`: 5.10 | `#1A7F37`: 4.85 | passes both |
   | Light OS: `--warning` on `--bg` | `#9A6407`: 4.77 | `#9A6700`: 4.64 | passes both |
   | Light OS: `--danger` on `--bg` | `#A82C2C`: 6.54 | `#C93C37`: 4.79 | passes both; the largest drop |
   | Light OS: `--danger` on `--bg-elevated` | 6.86 | 5.02 | passes both |
   | Dark OS: `--fg` on `--bg` (theme flip) | `#E8F0F6` on `#0C141B`: 16.11 | `#16222C` on `#F7FAFC`: 15.42 | passes both |
   | Dark OS: `--fg-muted` on `--bg` | 8.57 | 6.11 | passes both |
   | Dark OS: links, `--accent` on `--bg` | `#5CA7DA` on `#0C141B`: 7.07 | `#1F76B4` on `#F7FAFC`: 4.65 | passes both |
   | Dark OS: buttons, `--accent-contrast` on `--accent` | 6.37 | `#FFFFFF` on `#1F76B4`: 4.87 | passes both |
   | Explicit dark: `--danger` on `--bg` | 7.75 | 6.01 | passes both; not reachable on the site (item 1) |

   **5b. Non-text pairs (new in revision 3).** The reference requires 3:1 for focus rings and
   input borders [S18]. These pairs were chosen **from the consumer rules, not from token names**:
   each row names the rule that paints it (**Confirmed** by consumer code) [S24].

   | What is painted, and by which rule | Before | After | 3:1 non-text |
   |---|---|---|---|
   | Focus indicator, dark OS (default). Before: `base/base.css:52-57`, a 2px `--accent` outline on every `a, button, input, textarea, select, summary, [tabindex]` | `#5CA7DA` on `#0C141B`: 7.07 | dark is unreachable after the merge (item 1) | passes before |
   | Focus indicator, light OS | `#1F76B4` on `#F7FAFC`: 4.65 | `css/components.css:6`: a 3px ring of `--accent` at 40% on `a`, `.b-btn`, `.b-input` only. Composited on `--bg`: **1.73**; on `--bg-elevated`: **1.76** | **passes before, fails after** |
   | Focus indicator on the site's 6 `<button>`s (5 are `role="tab"`), 10 `<summary>`s and 4 contact-form inputs | the base rule above: 7.07 dark / 4.65 light | **No authored focus style.** `base/base.css` is no longer imported, and no page uses `.b-btn` or `.b-input`. The browser default applies, which this note can't measure statically | **Needs a human eye (high)** |
   | Contact-form input border (`contact/index.html:75-83`, `.field` in `base/components.css:180-189`) | `--line-strong`: 2.04 dark, 1.60 light | **No authored border.** `base/components.css` is no longer imported; the browser default applies | already below 3:1 before (not introduced by this PR); **needs a human eye (high)** after |
   | Card edges and dividers, `--line` (`site.css:20`, `:33`, `:46`, `:57`, `:93`, `:119`) | 1.51 dark, 1.28 light | 1.28 light | not rated: the reference reserves 3:1 boundaries for form controls, and card edges and dividers are *"surfaces identified by their fill"* [S18] |

   Ratios are computed; what the browser draws when no authored focus style applies is not.
6. **Left-behind files:** `base/base.css` and `base/components.css` are still in the folder at the
   head. The new `styles.css` no longer imports them, and the new manifest doesn't list them. They
   are part of the hand-written system of 2026-09-08 (§1.4), so they are reported as hand-authored
   and no longer imported, not as drift (§5 E4). Item 5b shows what stops applying when they stop
   being imported.
7. **Hand-kept copies diverge** (§1.6): `hire-refactored-public` keeps the old token files, and the
   frontend's `deliveryBrandThemes.ts` Refactored entry keeps the old dark `:root` values. No test
   would notice either.

### 2.4 The other four brands

`cpn`, `colaberry-enterprise` and `colaberry-app`: no drift, "unchanged". `colaberry-training`:
skipped, no target. **`colaberry-app` is `OK` against its sync source, not against the
reference** (§6 G10). Because this pull request doesn't change it, item 11 has nothing to compare
here. The note still carries G10's one-line discrepancy, because `OK` would otherwise read as
"conforms".

### 2.5 What the example shows about the format

The sync log and the PR body say `~ tokens/colors.css` and *"read the colour and spacing
changes"*. Neither tells a reviewer four things:
- that a served site would lose its dark default and 16 of the tokens it uses;
- that the files being overwritten were written by hand, on purpose, the day before;
- that a second site and a frontend theme hold copies;
- that keyboard users would lose a visible focus indicator on most controls.

That gap is the business outcome this capability exists for [S1]. If the note format is right, a
reviewer sees all four in the first lines.

---

## 3. What a brand impact note must contain (Proposal, D2)

One note per pull request update. It is pinned to the pull request's head commit, so a note written
for an earlier head is visibly out of date.

**Header (all required)**
- Pull request link, head commit, base commit, and the time the note was written (Central time).
- **Reference standard (new in revision 3):** `aleemcolaberry/Colaberry-DS-School-Final` and the
  commit the note was judged against. The reference moves (for example `aaecaa00` on 2026-11-13
  and `6bcebd2` on 2026-11-20 both changed button tokens [S21]), so a note without the commit can't
  be re-checked.
- **Sync status:** the result of the run that produced this head, **and** the result of the most
  recent run if it is newer. If the most recent run failed, the note says so before anything else
  (§5 E3).
- **Summary line per brand:** `unchanged` / `font-only, no colour impact` / `tokens changed` /
  `restyle` / `replaces hand-authored files`, with the count of needs-a-human-eye flags.

**Per brand with drift (all required)**
1. **Served surface:** where the folder is actually rendered (site host, backend renderer, the
   platform React app, or "not imported"), with the file:line that proves it.
2. **Ownership:** whether the folder has a manifest, and whether any file the diff **overwrites**
   isn't on it (§1.4). A diff that overwrites a file not on the manifest is reported under its own
   heading.
3. **Token changes:** every custom property added, removed or changed. Each shows its name, its
   selector scope (`:root`, `[data-theme="dark"]`, a variant) and old → new value. A file-level line
   like `~ tokens/colors.css` is not enough.
4. **Theme and variant behaviour:** whether the default theme, the dark-mode trigger or the variant
   selectors changed, and what that means for a visitor whose page sets no attribute.
5. **Consumers:** for each changed or removed token, the authored files that use it outside the
   design folder (file:line). If there are none, the token is listed as having no consumer (§5 E2).
6. **Broken references:** tokens an authored file uses that would be undefined after the merge.
   This is the most important line in the note.
7. **Contrast re-check:** before and after ratios, in every reachable mode and variant, using the
   reference's thresholds and method (D4) [S18][S20]:
   - 4.5:1 for text; 3:1 for large text (≥ 24px, or ≥ 18.66px bold), icons, input borders, focus
     rings and chart marks;
   - text over a gradient is checked against its **lightest** stop; `opacity` and
     `color-mix(… transparent)` are composited over the surface beneath;
   - **pairs:** for a Colaberry target, the reference's text × surface lists and non-text list
     (`contrast-matrix.html:41-43`). For any other brand, the pairs are chosen from the rules that
     paint them (consumer code), and any pair chosen by role alone is labelled **Assumed**.
8. **Hand-kept copies:** whether the dark-mode mirrors, the backend palette pin, the frontend
   delivery themes and any unmanaged copy of the same folder (§1.6) still match after the merge.
9. **Needs a human eye:** each impact that can't be derived statically, with the page to look at
   and a rating (high / low).
10. **Files not reviewed:** hand-authored and no-longer-imported files in the folder, named and
    excluded (§5 E4).
11. **Reference conformance (new in revision 3; a new requirement awaiting Aleem's confirmation
    under D2).** For a Colaberry target only (today `colaberry-app`):
    - each changed token's upstream value beside the reference value at the header's commit, and
      its contrast against the reference's pairs, old → new;
    - each comparison labelled **Confirmed** (the platform consumer or the platform's own
      measurement shows the same role), **Partly verified** (the role is shown but the surface
      behind it isn't traced), or **Assumed** (matching name or role only). **A matching token
      name alone is never Confirmed;**
    - differences stated as facts, with the reference rule cited (for example *"§2.2: white text
      never on red-500"*). Never as "should be", and never as a proposed upstream change (D9);
    - when the pull request doesn't touch a Colaberry target, one line stating that the target's
      sync source isn't the reference (G10).

**Footer (all required)**
- What the note didn't check, for example "component class usage in HTML not mapped".
- Where the reference's tokens were read from: *"Reference tokens were read from `tokens/colors.css`
  at `<commit>`; `tokens.json` and `brand-profile/*.json` were not used"* (G11).
- One fixed sentence: *"This note describes the change. The merge decision is yours."*

**What the note never contains (Proposal, D9):** a merge or reject verdict, "approve" wording, a
proposed upstream design-system change, a proposed change to the sync registry, or any claim that a
check passed when it didn't run.

---

## 4. What makes a note insufficient for a merge decision (Proposal, D3)

A note fails, and must say *"insufficient for a merge decision"* at the top, if **any** of these is
true:

| # | Insufficient when | Why |
|---|---|---|
| I1 | The most recent sync run failed and the note reviews the pull request anyway, without reporting the failure first | The pull request shows the last successful run, not upstream as it is now (§1.3) |
| I2 | A token-bearing file changed but the note lists files, not token old → new values | That is what the sync log already does (§1.3) |
| I3 | A removed or renamed token isn't checked for authored consumers | It hides broken references such as §2.3 item 2 |
| I4 | A colour pair whose value changed has no contrast result for a reachable mode | The story requires the re-check [S1] |
| I5 | A change to the default theme, dark-mode trigger or variant selectors isn't described | It changes what every visitor sees, even when no single value moved much (§2.3 item 1) |
| I6 | A brand with drift has no served surface stated, or "unknown" without the reason | A reviewer can't judge impact without knowing where it renders |
| I7 | A font-only change is given a colour impact, or a colour change is called font-only | The story's first exception [S1] |
| I8 | Hand-authored files are reviewed as upstream drift, **or a diff that overwrites a file not on the manifest isn't reported** | The story's fourth exception [S1]; the manifest doesn't guard overwrites (§1.4) |
| I9 | The note is pinned to an older head commit than the pull request's current head | The branch is refreshed daily (§2.1) |
| I10 | The note contains a merge verdict or approval wording | The merge is human by design [S1][S2] |
| I11 | A registry target is silently left out of the note, including `colaberry-enterprise` and `colaberry-app`, or an unmanaged copy of a changed folder isn't mentioned | The story names three apps; the registry has five targets and a fifth app holds a copy (§6 G1, G9) |
| I12 | **New in revision 3.** The note doesn't name the reference commit; uses thresholds or pairs other than the reference's; reads reference tokens from `tokens.json` or `brand-profile/*.json`; or calls a platform-to-reference token mapping Confirmed on a matching name alone | The judgement can't be re-checked, or rests on the reference's stale files (G11) or on an unproven mapping (§3 item 11) |

---

## 5. Exceptions, and how the note handles each

| # | Exception | Handling (Proposal unless marked) | Source |
|---|---|---|---|
| E1 | **Font-file-only change** | The brand summary says `font-only, no colour impact`. The note still lists non-colour effects and a low-rated needs-a-human-eye item. For a Colaberry target, the reference's font rules (`font-display: swap`, preloads, metric-matched fallbacks, CLAUDE.md §8.3) are listed as **non-colour checks**, still with no colour impact [S18]. §2.2 is the example | Story [S1] |
| E2 | **Dead token** (no authored consumer) | Listed in its own section as a finding, not dropped. **Scope (working decision, OQ5):** only tokens **this diff** adds, changes or removes | Story [S1] |
| E3 | **Failed sync** | The note checks the latest workflow run as well as the pull request. If the latest run failed, the note opens with the failure (brand, `FAIL` message, time) and marks itself insufficient (I1). **The pull request alone can't show this** (§1.3) | Story [S1]; G4 |
| E4 | **Hand-authored files** | Files not on the manifest are excluded from drift review and named under "Files not reviewed". Files not on the manifest that the new `styles.css` no longer imports are reported as `hand-authored, no longer imported`. **A diff that overwrites a file not on the manifest is not excluded:** it is reported as `replaces hand-authored files` (§3 item 2). Who decides what happens to those files is OQ6 and OQ9. This matches the reference's own rule that an exception is listed, never left silent: *"silence is not acceptance"* [S18] | Story [S1]; [S3] `:360-373`; G5 |
| E5 | **Brand skipped** (`target: null`) | One line: skipped, with the registry note. No review | [S3] `:83-91` |
| E6 | **Folder not imported** by any surface | The served surface says `not imported` with evidence. Token changes are still listed, with no visual impact claimed | G3 |
| E7 | **Manifest-only change** | Reported as bookkeeping, with no visual impact | [S3] `:387-408` |

---

## 6. Gaps between the story and the code (Verified unless marked)

| # | Gap | What the note does about it | Who can fix the source |
|---|---|---|---|
| G1 | The story names *"the three public apps"*. The registry has **five** targets: `colaberry-enterprise` feeds the backend landing-page renderer for four brands [S3][S8], and `colaberry-app` paints the portal and admin app [S22]. The PR body links five sources | Proposal: the note covers all five targets (OQ2) | Story: whoever maintains the capability record. Workflow: platform owners. **Unknown** who |
| G2 | The story says to find consumers *"across the platform frontend"*. Since 2026-11-15 the frontend **is** a synced target (`colaberry-app`), so the search has a real consumer. It still imports none of the `apps/*` folders, but hand-copies their values (§1.2, §1.6) | For `colaberry-app`, consumers are searched in `frontend/src`. For other brands, the note states "platform frontend: no import; hand-kept copy at file:line" where one exists | Capability record |
| G3 | The registry note for `refactored` says it *"Lands but is NOT yet imported"* [S3] `:63-66`. `site.css:7` imports it, and the site is served at the preview host [S6][S9] | The note derives served surfaces from code, never from registry notes | Platform owners |
| G4 | A failed sync can't be seen on the pull request (§1.3). The story's failed-sync exception assumes it can | E3: the note reads the run history | Platform owners (workflow) |
| G5 | **The manifest guards deletion, not overwriting.** The story says hand-authored files *"are excluded by the ownership manifest"*. That is true for deletion only, and a registered folder with no manifest (Refactored) has nothing excluded at all (§1.4) | E4 and I8 | Platform owners |
| G6 | The two gates the story cites, `build.js` and `validate-app-boundaries.js`, can't detect a visual change (§1.5) | The note never cites a passing build as evidence of no visual impact | (none needed) |
| G7 | The token-to-surface map doesn't exist [S1]. **Authored CSS `var()` use can be found statically** (§2.3 item 2). Component classes used in HTML aren't mapped | Consumers from `var()` use are required (§3 item 5). Class-level impact goes under needs-a-human-eye | Later autonomy levels |
| G8 | The workflow comment expects two files and thirty seconds. The open PR has 48 files and has been open 79 days with no review (§2.1) | Informational only. Whether PR #2342 is reviewed is not this capability's decision | Aleem / platform owners |
| G9 | `hire-refactored-public` holds an unmanaged copy of the Refactored design folder, not in the registry and with no manifest [S14] | The note names unmanaged copies of any changed folder (§3 item 8, I11) | Aleem (design ownership, per [S14] `:18-20`) / platform owners |
| G10 | **New. The `colaberry-app` sync source isn't the reference, and fails it on five measured pairs.** It syncs from `colaberry-design-system` (last pushed 2026-06-25), not DS-School-Final. Because the sync compares only with its own source, it reports `OK` and no sync pull request will ever surface the difference. Detail in §6.1 | **Reported finding.** The note carries it as a technical discrepancy whenever a Colaberry target appears, and changes nothing: not the registry, not the vendored copy, not upstream (§7) | Platform owners and Aleem. Aleem has said he will correct red-500 himself, per the platform's own test [S23] (**Reported** there) |
| G11 | **New. The reference contradicts itself in places.** `BRAND.md`, `SKILL.md`, `package.json`, a component prompt, `tokens.json` and `brand-profile/colaberry-training.brand.json` disagree with `CLAUDE.md` and `tokens/colors.css` on eight points ([Appendix](#appendix-where-the-reference-contradicts-itself-g11)) | **Reported finding.** Working decision (Proposal): `CLAUDE.md` and `tokens/colors.css` win, because they are what the reference's own lint and deploy gate enforce [S18][S25]. The note says so in its footer (§3). Conflicts are listed, not resolved | Aleem (reference owner) |

### 6.1 G10 in detail: `colaberry-app` against the reference (Verified at `7806162d` and `13b17e5c`)

**What renders.** Outside `.cbv2-shell` (the portal and admin), these tokens resolve to the
vendored `frontend/src/colaberry/tokens/colors.css`: `colaberry-platform-tokens.css` defines only
platform-only tokens (`:30-38`), `brand-bridge.css` reads the status tokens without redefining them
(`:36-42`), and `enterprise-brand.css` re-points only the action tokens, only inside `.cbv2-shell`
(`:108-113`), and says it leaves the status and focus tokens alone on purpose (`:68-80`) [S22].

**The pairs are the reference's own** (`contrast-matrix.html:41-43`, `NONTEXT` list) [S20]; light
theme on white unless stated.

| Token (reference pair) | Platform value → ratio | Reference value → ratio | Threshold | Mapping |
|---|---|---|---|---|
| `--action-bg` under `--text-on-accent` (button label) | red-500 `#FB2832`: **3.85** | red-600 `#E5121D`: 4.73 | 4.5:1 | **Confirmed.** `.cb-btn` and `CompanionDeck.tsx:240` paint `--action-fg` on `--action-bg`; the platform's own test pins 3.85 on four surfaces and 3.13 on hover [S23] |
| `--text-subtle` (text) | neutral-500 `#8C8C8C`: **3.36** | neutral-600 `#6B6B6B`: 5.33 | 4.5:1 | **Partly verified.** Used as `color` (e.g. `CompanyMomentumDashboard.tsx:170`); the surface behind it was not traced, so the ratio assumes white |
| `--status-warning` on `--surface-page` (warning icon) | amber-500 `#E8920C`: **2.46** | amber-600 `#B86F08`: 3.95 | 3:1 | **Confirmed.** Painted as a status dot (`CaseStudyIntakeQueue.tsx:26`); the reference names it the icon tone |
| `--status-success` on `--surface-sunken` (success icon) | green-600 `#5BA63C`: **2.67** | green-700 `#468A2E`: 3.76 | 3:1 | **Confirmed.** Status dot (`CaseStudyIntakeQueue.tsx:25`); the reference cites this exact failure, *"`--green-600` 2.7:1 on sunken"* [S18] |
| `--focus-ring` on `--surface-page` | blue-500 at 45%: **1.87** (dark: blue-300 at 50%, 2.49) | blue-500 at 80%: 3.37 (dark: 90%, 5.50) | 3:1 | **Confirmed.** `box-shadow: var(--focus-ring)` in the vendored components (e.g. `Button.jsx:21`) |
| `--border-control`, `--control-track` | **absent** (no definition, no consumer) | neutral-500: 3.36 | 3:1 | Not applicable: no platform token to map. Which border the platform's inputs use was not traced |
| `--status-info`, `--status-danger` on `--surface-page` | blue-500: 4.91; red-600: 4.73 | the same values | 3:1 | Assumed (same name and value). Pass either way |

Four further facts, reported and not resolved:
- The platform also uses `--status-warning` and `--status-success` as **chip text** on their `-bg`
  pair (`statusVocabulary.tsx:29`, `:41`, `:59`): 2.20 and 2.80. The reference reserves those
  tokens for icons and uses a separate `-fg` chip pair, so this is a difference in **role**, not
  only in value.
- The registry's `colaberry-training` entry names `Colaberry-Training-Design-System`, while the
  reference's own brand profile uses the slug `colaberry-training` [S21]. Whether the two
  repositories are the same lineage is **Unknown**.
- The platform's AI Flotation design notes say the reference *"fed only the Colaberry brands"*
  [S26]. So the reference's **token values** are compared only for Colaberry targets. Its **rules
  and method** (§3 item 7) apply to every note.
- `colaberry-enterprise` is a Colaberry brand with its own upstream. No mapping from its tokens to
  the reference's has been confirmed, so item 11 treats it as **Assumed** until one is.

---

## 7. Boundaries and stop conditions

**Never, at any autonomy level (Story; Ali's Q3 answer Reported [S4]):** merge, approve, request
changes, push to `chore/design-system-sync`, edit vendored or hand-authored design files, or propose
a change to an upstream design system.

**Also never (new in revision 3, following Aleem's direction [S17]):** edit the sync registry or
workflow, propose that a registry entry point at a different upstream, or edit the reference
repository. G10 and G11 are reported, nothing more.

**Stop and report instead of writing a note when:**
- the latest sync run failed (E3): report the failure only;
- the pull request's head changed while the note was being written: start again on the new head;
- a registry target has no folder, or a folder has no `styles.css`: report it, don't guess;
- a consumer search can't run: mark the note insufficient (I3), and never write "no consumers";
- the reference can't be read at a named commit: write the note without item 11 and mark it
  insufficient (I12), rather than judge against a remembered value.

**At R0 specifically:** nothing is posted anywhere. §2 exists only as a worked example inside this
document.

---

## 8. Open questions, and the working decisions that keep the work moving

The same rule applies as in the drift-audit definition, following Ali Muwwakkil's guidance [S27]
(**Reported**): when Aleem hasn't answered yet, Mihret makes a working decision, writes it next to
the question, and continues preparing. **A working decision can shape this draft. It can't pass the
criterion, post a note, or settle a brand outcome.** If Aleem answers differently, his answer
replaces it and goes in the [sign-off record](#sign-off-record).

| # | Question for Aleem | Why it matters | Blocks | Mihret's working decision, and why | Ali's advice | Aleem's answer |
|---|---|---|---|---|---|---|
| **OQ1** | **When you open a design-system-sync pull request, what question do you actually need answered before you merge?** | It is the criterion itself [S1] | Everything | Proposal: *"What will a visitor to each brand see differently, on which pages, and is anything broken, harder to read, or overwritten that someone made on purpose?"* §3 is built around it | Not asked | **Pending** |
| **OQ2** | Should the note cover `colaberry-enterprise` and `colaberry-app`, which aren't in the story's three apps? | Decides I11 and G1 | D1 | **Yes, all five targets** | Not asked | **Pending** |
| **OQ3** | Does `refactored-preview.colaberry.ai` count as a live brand site for this review? | Decides how §2.3-type findings are rated | D1 | **Yes, rated like a live site.** It is the only place the rebuilt site is served [S9] | Not asked | **Pending** |
| **OQ4** | Which contrast threshold, and which pairs? | Decides §3 item 7 | D4 | **DS-School-Final at the note's named commit:** `CLAUDE.md` §2.2 thresholds and method, and the `contrast-matrix.html` pair lists for Colaberry targets; consumer-chosen pairs for other brands (§3 item 7) | Not asked | **Directed in a meeting on 2026-11-27** (Reported [S17]). Recorded in writing when Aleem signs off D4; not asked again |
| **OQ5** | Dead tokens: only those this diff touches, or the whole system? | Decides E2's length | D6 | **Only tokens this diff touches** | Not asked | **Pending** |
| **OQ6** | Who decides what happens to hand-authored files that are no longer imported, such as `refactored/base/*.css`? | E4 can name them but not remove them | D7 | **Report them; the note never recommends deletion** | Not asked | **Pending** |
| **OQ7** | Should the note contain only facts and flags, or also a recommendation? | The story's R4 ceiling allows *"a written recommendation and no merge authority"* [S1] | D9 | **Facts and flags only, until you decide otherwise.** Ali's Q3 principle: *"Detection is fair game … Authorship of the brand is not"* [S4] (**Reported**) | Q3 answered by Ali [S4] | **Pending** |
| **OQ8** | Where should the note live once it is allowed? | Decides D8 | D8 | **A PR comment, once a later level allows `pull_request_comment`.** At R0, nothing is posted | Not asked | **Pending** |
| **OQ9** | Should upstream own the Refactored design folder at all, given it was replaced by hand on 2026-09-08 with a deliberate dark default, and does the Hire copy belong under the sync? | Decides whether PR #2342-type diffs are "drift" or "an overwrite of brand decisions" | D10 | **No working decision.** It decides what the Refactored brand is, which Ali's Q3 principle reserves to a human [S4]. The note reports the overwrite (§3 item 2) whatever the answer | Not asked | **Pending** |
| **OQ10** | Do you agree to pick this capability, so the platform opens its four steps (by hand, in the app, tool request, agent watched)? | Without it the story stays a candidate (§0) | (none in this document) | **No working decision.** Picking needs your agreement by the platform's own rule [S16] | Not asked | **Pending** |

---

## Sign-off

**Not signed. Aleem has not confirmed anything in this document.** Mohammed Abdul Aleem remains the
accountable manager. Ali Muwwakkil's interview answers [S4] and guidance [S27], Aleem's reported
direction on the design-system reference [S17], and Mihret's working decisions (§8) are inputs, not
a substitute for his written confirmation.

### How to review and confirm this without portal access

- **No admin portal access is needed.** Aleem can answer by email or in a meeting.
- **What counts as evidence (working decision, same as the drift audit):** Aleem's own written,
  dated words, either an email reply or meeting notes he has confirmed in writing. A meeting
  without written confirmation doesn't count, because the story excludes *"a conversation that went
  well"* [S1].
- **The quickest review:** read §2 (the worked example) and §3 (the format), then answer OQ1:
  does this answer your question before merging? **New in revision 3:** §3 item 11 (reference
  conformance) is part of the format D2 confirms.
- **Suggested reply format:** "OQ1: yes / my question is …; D1 agree; D2 confirmed / change: …; D4 agree; OQ9: …".
- **Partial answers are fine.** Each one is recorded as it arrives. The criterion passes only when
  Aleem confirms the note format (D2) and answers OQ1.
- **Unknown:** whether the platform accepts an email copied into this repository as evidence.

### Decisions

| # | Decision | Mihret's working decision (preparation only) | Aleem's answer (pending) |
|---|---|---|---|
| D1 | Which targets and surfaces the note covers (OQ2, OQ3) | All five targets; preview host rated as live; unmanaged and hand-kept copies named | ☐ agree ☐ change: ______ |
| D2 | **The note format (§3), together with your answer to OQ1. This is the criterion.** Includes item 11, new in revision 3 | As written in §3 | ☐ answers my question ☐ change: ______ |
| D3 | The insufficiency rules I1-I12 (§4) | As written | ☐ agree ☐ change: ______ |
| D4 | Contrast threshold and pairs (OQ4) | DS-School-Final `CLAUDE.md` §2.2 and the contrast-matrix pairs, at the note's named commit, as directed on 2026-11-27 (Reported [S17]) | ☐ agree ☐ value: ______ |
| D5 | Failed-sync handling (E3) | Check run history; failure first; note marked insufficient | ☐ agree ☐ change: ______ |
| D6 | Dead-token scope (OQ5) | Only tokens this diff touches | ☐ agree ☐ whole system |
| D7 | Hand-authored, no-longer-imported files (OQ6, E4) | Reported, no recommendation | ☐ agree ☐ owner: ______ |
| D8 | Where the note lives (OQ8) | PR comment at a later level; nothing posted at R0 | ☐ agree ☐ elsewhere: ______ |
| D9 | Facts only, or a recommendation (OQ7) | Facts and flags only | ☐ agree ☐ allow a recommendation |
| D10 | Ownership of the Refactored and Hire design folders (OQ9) | **None.** Your decision | ☐ upstream owns it ☐ hand-authored stays ☐ other: ______ |

### Sign-off record

| Date (Central) | Channel | Decisions covered | Aleem's words (quote, or a summary Aleem confirmed) | Where the original is kept | Recorded by |
|---|---|---|---|---|---|
| (none) | (none) | (none) | *No response recorded yet.* | (none) | (none) |

**How to fill in "Decisions covered".** Write each id with its outcome, separated by semicolons:
`D2: confirmed`, `D2: change requested`, `OQ1: answered`, `D4: agreed`, `D10: other`, and so on.
Only Aleem's own words decide the outcome written here. Aleem's reported direction of 2026-11-27
[S17] is **not** an entry here, because it isn't his written words.

**When the criterion is met.** The R0 criterion needs **both** `D2: confirmed` **and**
`OQ1: answered` in the record, in one entry or across entries. An entry about any other decision,
or a `D2` entry that asks for a change, doesn't meet it. Only then can the criterion in
`.colaberry/progress.json` be set to `passed: true`, citing this file and the sign-off record.
**Not before. Working decisions never count toward it.** The repository test enforces this rule.

### If confirmation is delayed (working decision, following [S27])

The same steps as the drift-audit definition: an email to Aleem with this file and the decision
table, asking for a reply within 5 business days; one reminder on day 5; on day 8 without a reply,
tell Ali (DRI) the status and ask him to follow up, name an interim approver, or confirm that
preparation continues. Escalation never substitutes for confirmation.

### Still blocked even after confirmation (not resolved by this document)

- **The agent record exists but can't act yet.** The story's blocker says *"agent_id is null for
  this domain"* [S1]. The multi-brand R0 definition found that this is outdated: Maru exists, is
  disabled, and has no tools granted, as of its newest snapshot (8:40 PM CST on 2026-11-05) [S15].
  Not re-checked here.
- Aleem has no admin login [S1]. That doesn't block confirming this document.
- Posting a note needs `pull_request_comment`, which comes only at a later autonomy level.
- The token-to-surface map for component classes doesn't exist (G7).
- The capability is a candidate on the platform until it is picked (§0, OQ10).
- The story text (G1, G2, G5) and the registry note (G3) are inaccurate. This document doesn't edit
  them. Whoever maintains them should correct them.
- **The platform's Colaberry upstream isn't the reference (G10), and the reference contradicts
  itself in places (G11).** This document reports both and resolves neither.

---

## Appendix: where the reference contradicts itself (G11)

All paths are in `aleemcolaberry/Colaberry-DS-School-Final` at `13b17e5c` [S25]. The **enforced**
side is the one `_lint.mjs` and `deploy.yml` check (CLAUDE.md §9) [S18]. Informational only:
nothing here is resolved, and no change to the reference is proposed.

| # | Topic | Says one thing | Enforced side says |
|---|---|---|---|
| C1 | White text on cherry | `BRAND.md:281`: *"White button text passes on cherry (3.9:1)"* at large/bold sizes | `CLAUDE.md` §2.2: *"never on `--red-500`"*; `tokens/colors.css:175`: `--action-bg` is red-600 |
| C2 | Red-500 as a fill behind content | `BRAND.md:178`: an icon tile on `var(--red-500)` | `CLAUDE.md` §2.2, as C1 |
| C3 | Card hover lift | `BRAND.md:218`: *"Lifts 6px"* | `CLAUDE.md:489-492`: 3px, *"never more than 4 px"* |
| C4 | Green text grade | `SKILL.md:21`: *"green-700+ for body text"* | `CLAUDE.md` §2.2: green text is green-800; green-500/600/700 are never text |
| C5 | Icon set | `SKILL.md:21`: *"Lucide icons"* | `CLAUDE.md:634`: RemixIcon instead of Lucide |
| C6 | Component count | `package.json:4`: *"20 accessible components"* | `components/core/` holds 25 components |
| C7 | Link placeholder | `components/core/Button.prompt.md:8`: `<Button variant="link" href="#">` | `CLAUDE.md:175`: *"never `href="#"`"* |
| C8 | Stale token exports | `tokens.json:6` *"generated": "2026-06-17"*; dark focus ring at 50% (`:330`); no `surface-hover*`. `brand-profile/colaberry-training.brand.json:96`: dark focus ring *"50%"* | `tokens/colors.css:297`: dark focus ring at 90%; `surface-hover*` defined |

---

## Sources

Platform paths are in `ColaberryEnterprise_AI_LeadershipAccelerator`. **Line numbers are at the PR
base `7806162d`** for every file re-read in revision 3 (marked in the rows). Rows not re-read keep
revision 2's line numbers at `fee57d51` or `c96f6a68`, as marked. Reference paths are in
`aleemcolaberry/Colaberry-DS-School-Final` at `13b17e5c`. PR and run data are from the GitHub API,
last read at about 8:35 PM CST on 2026-11-27.

| ID | What | Where |
|---|---|---|
| S1 | Outcome, workflow, inputs, outputs, exceptions, blockers, R0 behaviour and criterion | This repo: [`docs/stories/product_experience.CAP.brand_design_system_sync_review.md`](../stories/product_experience.CAP.brand_design_system_sync_review.md) |
| S2 | Sync workflow: header, schedule, sync step, drift check, build gate (four apps), PR body (five sources), branch, add-paths, "the pull request is the review" | Platform at `7806162d`: `.github/workflows/design-system-sync.yml:1-13`, `:19-30`, `:53-67`, `:69-77`, `:79-88`, `:90-108`, `:110-131` |
| S3 | Brand registry (six brands, five targets); write-target guard; external-import stripping; manifest rationale; manifest format | Platform at `7806162d`: `backend/src/scripts/lib/designSystemSync.js:32-109`, `:111-125`, `:136-162`, `:360-373`, `:387-408` |
| S4 | Sync failure model, manifest reading, `writeTree`, target guard, import stripping, log format, exit codes. Ali's Q3 answer (**Reported**, waiting for Aleem's confirmation) | Platform at `7806162d`: `backend/src/scripts/syncDesignSystems.js:15-20`, `:93-106`, `:108-120`, `:140-144`, `:157-168`, `:173-178`, `:184-196`, `:230-239`, `:249`. Q3: this repo, [`docs/discovery/04-manager-interview.md:278`](../discovery/04-manager-interview.md) |
| S5 | Boundary validator scans JS/TS imports only | Platform at `fee57d51`: `scripts/validate-app-boundaries.js:27-36`, `:83-101` |
| S6 | Each site imports its design `styles.css`; dark-mode mirrors; Refactored's uses of removed tokens and of `--line` | Platform at `fee57d51` (unchanged by the PR): `apps/ai-flotation-public/src/assets/site.css:32`, `:49-68`; `apps/cpn-public/src/assets/site.css:51`, `:57-79`; `apps/refactored-public/src/assets/site.css:7`, `:10`, `:20`, `:24`, `:33-35`, `:46`, `:50`, `:57`, `:59`, `:64`, `:70`, `:72`, `:80-81`, `:86-87`, `:89`, `:93`, `:100`, `:103`, `:119` |
| S7 | Vendored dark blocks the mirrors copy | Platform at `fee57d51`: `apps/ai-flotation-public/src/assets/design/tokens/colors.css:21-35`; `apps/cpn-public/src/assets/design/tokens/colors.css:16-24` |
| S8 | Backend pins the enterprise palette to the vendored file | Platform: `backend/src/services/marketing/__tests__/landingPageTheme.parity.test.ts:159-175` (at `fee57d51`); `backend/src/services/marketing/landingPageFonts.ts:43` (at `c96f6a68`) |
| S9 | `refactored-public` is built into the container and served at `refactored-preview.colaberry.ai`, not `refactored.ai` | Platform at `fee57d51`: `nginx/refactored-preview.conf:1-17`, `:24`; `nginx/Dockerfile` (builds and copies `refactored-public` and `hire-refactored-public`) |
| S10 | PR #2342: 48 files, +914/-161, opened 2026-09-09, no comments, reviews, reviewers or status checks; sync log in body; base `7806162d`, head `da7b69d1`; its files byte-identical to revision 2's head `33fd886c` | [ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator#2342](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator/pull/2342) |
| S11 | Workflow run history: the latest 30 runs all succeeded, newest 10:48 AM CST on 2026-11-27 | `gh run list --workflow design-system-sync.yml` on the platform repo |
| S12 | Contrast ratios in §2.3 and §6.1 | WCAG relative-luminance formula (the same in 2.1 and 2.2), with `color-mix(… transparent)` composited in sRGB over the stated surface; computed from hex values in the cited `colors.css` files, in a scratch script outside this repository |
| S13 | Refactored design folder history: vendored with a manifest, then removed, then replaced by hand on 2026-09-08 | Platform commits `21cf07f5`, `c1148763`, `bd42012d` (GitHub API file lists and commit messages) |
| S14 | `hire-refactored-public`: unmanaged copy of the Refactored design folder, not in the registry, no manifest; "design ownership across all Colaberry brands sits with Aleem" | Platform at `fee57d51`: `apps/hire-refactored-public/src/assets/tokens.css:7-17` (unsynced, "LOOKS vendored"), `:18-20` (design ownership), `:26-29` (imports); `tokens/colors.css` blob identical to `apps/refactored-public`'s |
| S15 | Maru exists, disabled, no tools granted; the first draft's blocker line flagged as outdated | This repo, branch `story-000-command-center-revision`, commit `fbc7521`: [`docs/definitions/multi_brand_surface_consistency_audit.R0.md`](https://github.com/MihretColaberry1/ColaberryInternship/blob/fbc7521d4adab9978be55de3962114e5ad22560b/docs/definitions/multi_brand_surface_consistency_audit.R0.md) §4 (B1) and §4.1. Not on `main` |
| S16 | The story is marked "CANDIDATE -- not started, not assigned"; the four-step ladder; the drift audit's opened steps | This repo: plan sync `0549de8` (2026-11-13); [`docs/stories/product_experience.CAP.design_token_drift_audit.L1-BY-HAND.md`](../stories/product_experience.CAP.design_token_drift_audit.L1-BY-HAND.md) |
| S17 | Aleem's direction to use `Colaberry-DS-School-Final` as the final Colaberry Design System for this agent (**Reported**) | Meeting between Aleem and Mihret Netsereab on 2026-11-27, as relayed by Mihret the same day. Not in this repository and not a written sign-off |
| S18 | Reference rules: contrast minimums and token rules (§2.2), contrast measured and the matrix contract (§2.6), focus (§3 item 7), recording exceptions, *"silence is not acceptance"*, fonts (§8.3), hover lift, enforcement (§9) | Reference at `13b17e5c`: `CLAUDE.md:81-115`, `:141-158`, `:183-187`, `:266-270`, `:637-657`, `:489-492`, `:690-733` |
| S19 | Reference token values: ramps, `--action-bg` red-600, `--text-subtle` neutral-600, `--border-control`, `--control-track`, `--status-success` green-700, `--status-warning` amber-600, light and dark focus rings | Reference at `13b17e5c`: `tokens/colors.css:23-24`, `:37`, `:60-61`, `:70-71`, `:148`, `:168`, `:175`, `:204`, `:211`, `:220`, `:225`, `:297` |
| S20 | The reference's pair lists (text × surface, and non-text with thresholds); the contrast audit pass that produced them | Reference at `13b17e5c`: `guidelines/cards/contrast-matrix.html:41-43`; `AUDIT.md:116-152` (Pass 7) |
| S21 | The reference moves: `aaecaa00` "filled buttons meet WCAG AA 4.5:1 for their white labels" (5:02 AM CST on 2026-11-13) and `6bcebd2` sync import (9:24 AM CST on 2026-11-20); its brand profile slug `colaberry-training` | Reference: commits `aaecaa00`, `6bcebd2`; `brand-profile/colaberry-training.brand.json:2` |
| S22 | `colaberry-app`: vendored copy and what renders it; import order; platform-only tokens; bridge; public-site scope; hand-kept copies of `apps/*` values; consumers cited in §6.1 | Platform at `7806162d`: `frontend/src/colaberry/tokens/colors.css:97-153`, `:161-203`; `frontend/src/colaberry/PROVENANCE.md`; `frontend/src/index.tsx:25-31`; `frontend/src/styles/colaberry-platform-tokens.css:30-38`; `brand-bridge.css:36-42`; `enterprise-brand.css:13-30`, `:68-80`, `:108-113`; `frontend/src/theme/deliveryBrandThemes.ts:103-118`; `backend/src/__tests__/deliveryBrandThemes.test.ts:65`, `:101`; `frontend/src/components/portal/CompanionDeck.tsx:240`; `components/capability/CompanyMomentumDashboard.tsx:170`; `components/admin/ourServices/CaseStudyIntakeQueue.tsx:25-26`; `components/admin/commercialization/statusVocabulary.tsx:29`, `:41`, `:59`; `frontend/src/colaberry/components/core/Button.jsx:21`. Upstream `aleemcolaberry/colaberry-design-system` last pushed 7:56 AM CDT on 2026-06-25 (GitHub API) |
| S23 | The platform's own measurement: white on `--action-bg` 3.85:1 on four surfaces and 3.13:1 on hover, pinned as known failures; *"Aleem owns the design system and has said he will correct red-500 himself"*; reported by Aleem on 2026-11-09 | Platform at `7806162d`: `frontend/src/styles/__tests__/actionContrast.test.ts:7-52`, `:180-195` |
| S24 | Refactored focus and form rules before and after the merge; which pages use which elements | Platform at `7806162d`: `apps/refactored-public/src/assets/design/styles.css:3-8`, `base/base.css:52-57`, `base/components.css:180-189`, `tokens/colors.css:16-17`, `:22`, `:25-26`, `:37`, `:44-54`. At `da7b69d1`: `styles.css:4-11`, `css/components.css:6`, `:14-15`, `tokens/colors.css:6-16`, `:26-30`; `contact/index.html:75-83`; the 10 HTML pages and `assets/ui.js` searched for `<button`, `role="tab"`, `<summary`, `<input`, `.b-btn`, `.b-input` |
| S25 | The reference's self-contradictions (Appendix) | Reference at `13b17e5c`: `BRAND.md:178`, `:218`, `:281`; `SKILL.md:21`; `package.json:4`; `components/core/` (25 components); `components/core/Button.prompt.md:8`; `tokens.json:6`, `:330`; `brand-profile/colaberry-training.brand.json:96`; `CLAUDE.md:175`, `:634` |
| S26 | The reference fed only the Colaberry brands | Platform at `7806162d`: `apps/ai-flotation-public/src/assets/design/DESIGN_SYSTEM.md:11` |
| S27 | Ali Muwwakkil's guidance on not waiting indefinitely and on documenting the preparer's own decisions (**Reported**) | Email from Ali Muwwakkil to Mihret Netsereab dated 2026-10-27, as relayed by Mihret on 2026-10-30. Not in this repository. Same source as the drift-audit definition's S27 |

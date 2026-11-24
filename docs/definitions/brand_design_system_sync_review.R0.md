# Brand design-system sync review: R0 note definition

**Capability:** `product_experience.brand_design_system_sync_review` · **Autonomy:** R0 (definition only)
**Accountable manager:** Mohammed Abdul Aleem · **DRI:** Ali Muwwakkil
**Prepared by:** Mihret Netsereab · first draft 2026-11-04 · **revision 2, 2026-11-14**
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

**Read-only. Nothing in any of these was changed, commented on or merged:**
- the platform repo, `ColaberryEnterprise_AI_LeadershipAccelerator`: a local shallow clone at
  `c96f6a68` (merged 8:56 PM CDT on 2026-10-27), **plus the GitHub API at the open pull request's
  current base, `fee57d51` (7:36 AM CST on 2026-11-14)**, and its head `33fd886c`. Platform files
  are cited in one of three ways:
  - **Compared by git blob hash between `c96f6a68` and `fee57d51` (nine files).** Seven are
    identical: `syncDesignSystems.js`, `lib/designSystemSync.js`, `validate-app-boundaries.js`,
    `nginx/refactored-preview.conf`, `landingPageTheme.parity.test.ts`, and the AI Flotation and CPN
    `site.css`. Two changed: `.github/workflows/design-system-sync.yml` (one line, the build loop,
    with line numbers unchanged) and `nginx/Dockerfile`. §1 uses their current text.
  - **Read directly through the API at `fee57d51` or `33fd886c`, not compared with the clone:**
    the Refactored `site.css`, design CSS and the other 12 source files (§2.3); the AI Flotation and
    CPN `tokens/colors.css` and `site.css` dark blocks (§1.6); the `hire-refactored-public` files
    (§1.2); whether each of the five design folders has a manifest (§1.2); and the 2026-09-08 commits (§1.4).
  - **Read only at the `c96f6a68` clone:** `landingPageFonts.ts` and the `frontend/src` search
    (§1.2). These were not re-checked at `fee57d51`;
- the open sync pull request,
  [ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator#2342](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator/pull/2342),
  at head `33fd886c` (7:40 AM CST on 2026-11-14), and the workflow's run history. Both were read
  through the GitHub API between about 2:30 and 3:20 PM CST on 2026-11-14.

### What changed in revision 2

Revision 2 re-checks every finding against the pull request as it stands on 2026-11-14 and adds
what changed or came to light since the first draft:

1. **Every PR #2342 finding reproduces at the new head.** Its colour, entry-point and font files
   are byte-identical to the first draft's head (`459c6a3c`), and the files it changes are
   identical at the old and new base. The 16 undefined tokens, the theme flip and the contrast
   figures were all recomputed from the GitHub API, not copied from the first draft. The pull
   request is now **66 days** old (§2).
2. **The Refactored.ai design folder is hand-authored, not vendored (Verified, platform history).**
   The first draft treated `base/*.css` as files vendored before manifests existed. That was
   wrong. On 2026-09-08 the vendored folder and its manifest were deleted and a hand-written token
   system was committed in their place, with a dark default chosen on purpose. PR #2342 would
   overwrite it. This changes the Refactored part of the example (§2.3), the manifest finding (§1.4),
   exception E4 and gap G5, and adds open question OQ9.
3. **A fifth public app, `hire-refactored-public`, appeared** and the build gate now builds four
   apps. Its design folder is an unmanaged copy of the Refactored one (§1.2, G9).
4. **The "no AI employee is provisioned" blocker is outdated.** The multi-brand R0 definition found
   an agent record for this domain, Maru, which is disabled and has no tools granted [S15]. That
   document flagged this line in the first draft for correction. Revision 2 uses its wording.
5. **On the platform's `main`, this story is now marked a candidate (§0).**

---

## 0. Where this story stands on the platform (Verified, 2026-11-14)

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
- **Nothing was posted to the pull request.** The workflow's step "write the impact note onto the
  pull request as a comment" [S1] is **not done at R0**.
- **The merge is always a human decision** [S1]. Ali's answer to interview Q3 says the same about
  brand design systems (**Reported**, waiting for Aleem's confirmation) [S4].
- **The repository's regression test**, `tests/brand-sync-review-r0.test.mjs`, checks this
  document's structure and that it claims no approval. **It doesn't test the platform**, and
  passing it doesn't pass the criterion.

---

## 1. What the sync does today (the human-operable process the note sits on)

### 1.1 The pipeline (Verified at `fee57d51`)

| Step | What happens | Evidence |
|---|---|---|
| Schedule | Runs daily (cron `20 6 * * *`, 06:20 UTC), and can also be started by hand for a single brand | [S2] `design-system-sync.yml:18-29` |
| Sync | `node backend/src/scripts/syncDesignSystems.js`, with its output tee'd to `/tmp/sync.log` | [S2] `:59-66` |
| Drift? | `git status --porcelain`. If nothing changed, the job ends and no pull request is opened | [S2] `:68-76` |
| Build gate | Runs `build.js` in **four** apps (`cpn-public`, `ai-flotation-public`, `refactored-public`, `hire-refactored-public`), then `validate-app-boundaries.js` | [S2] `:78-87`. The fourth app was added after 2026-10-27 |
| PR body | The sync log plus a fixed warning: *"These are live brand styles"*, with source links for **three** brands | [S2] `:89-105` |
| PR | One reused branch, `chore/design-system-sync`. Only `apps/*/src/assets/design/**` is added | [S2] `:107-125` |
| Why a PR | *"The pull request is the review, and it is usually two files and thirty seconds"* | [S2] `:8-12` |

### 1.2 Brands, apps and where tokens land (Verified)

The registry lists **five** brands, and **four** have a target folder [S3]. Five public apps exist.
Manifests were checked at `fee57d51`: present for AI Flotation, CPN and Colaberry Enterprise; absent
for Refactored and Hire.

| Brand / app | Design folder | Who consumes it | Managed by the sync? | Evidence |
|---|---|---|---|---|
| `ai-flotation` | `apps/ai-flotation-public/src/assets/design` | The static site, through `site.css:32` | Yes, manifest present | [S3] `:43-48`; [S6] |
| `cpn` | `apps/cpn-public/src/assets/design` | The static site, through `site.css:51` | Yes, manifest present | [S3] `:49-54`; [S6] |
| `refactored` | `apps/refactored-public/src/assets/design` | The static site, through `site.css:7`, served at `refactored-preview.colaberry.ai`, **not** `refactored.ai` | **Registered, but the folder is hand-authored and has no manifest** (§1.4) | [S3] `:55-63`; [S6]; [S9]; [S13] |
| `colaberry-enterprise` | `apps/colaberry-enterprise-design/src/assets/design` | No site. The backend landing-page renderer pins its copy to this file with a parity test; four brands resolve to this theme | Yes, manifest present | [S3] `:64-78`; [S8] |
| `colaberry-training` | (none, `target: null`) | Not served from this repository | Skipped | [S3] `:79-87` |
| `hire-refactored-public` (hire.refactored.ai) | `apps/hire-refactored-public/src/assets/design` | Its own site, through `assets/tokens.css:26-29` | **No.** Not in the registry, no manifest. Its `tokens/colors.css` is byte-identical to the Refactored one at `fee57d51` | [S14] |

The **platform frontend** imports none of these folders. A search of `frontend/src` for
`assets/design` and `colaberry-enterprise-design` found no reference **(Verified at `c96f6a68`)**.
Its own vendored design system, `frontend/src/colaberry/`, isn't synced by this workflow.

### 1.3 What the sync log tells a reviewer, and what it doesn't (Verified)

The log prints one block per brand: `DRIFT`, `OK  `, `SKIP` or `FAIL`. Each block lists the files
added (`+`), changed (`~`) and removed (`-`), plus `?` for files that are referenced but missing
upstream [S4] `syncDesignSystems.js:166-178`, `:218-219`.

- It lists **files, not tokens.** A `~ tokens/colors.css` line says nothing about which colours
  moved or what they moved to.
- **Failure model:** a brand that fails is skipped and logged `FAIL`. The brands that succeeded are
  still written, and the process exits 1 [S4] `:14-19`, `:231`.
- **A failed sync never reaches a pull request.** The sync step sets `set -o pipefail` (`:60`).
  GitHub runs `run:` steps under `bash -e`, so a non-zero exit fails the step and every later step
  is skipped. **(Verified from the workflow text; relies on GitHub's documented default shell.)**
  An already open pull request keeps the content of the **last successful** run, and nothing on it
  says that a later run failed. The `exit=` output written at `:66` is only reached on success, and
  no later step reads it.

### 1.4 The ownership manifest: what it protects and what it doesn't (Verified)

Each managed folder holds `.design-sync-manifest.json`, the list of files the sync wrote. The sync
**deletes** only files on that list, so hand-authored files such as `DESIGN_SYSTEM.md` survive
[S3] `:286-299`; [S4] `:155-160`.

- **The manifest guards deletion, not overwriting.** `writeTree` writes every upstream file to its
  path [S4] `:106-111`. A hand-authored file that sits at the same path as an upstream file, such
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

- **`build.js`** proves each of the four apps still builds [S2] `:81-86`. A CSS custom property
  that is referenced but no longer defined doesn't fail a build. **PR #2342 is the proof:** the
  pull request is only updated after the build gate passes, and it leaves 16 tokens undefined on a
  served site (§2.3).
- **`validate-app-boundaries.js`** scans `.js/.jsx/.ts/.tsx/.mjs/.cjs` imports for forbidden edges
  [S5] `:27-36`, `:83-101`. **It doesn't read CSS or tokens.**
- **The `colaberry-enterprise` target isn't built or tested** by the workflow. The backend parity
  test that pins it [S8] isn't run there.
- **PR #2342 reports no status checks.** It has no requested reviewers, no reviews and no comments
  (Verified, 2026-11-14). Why no checks run is **Unknown**.

### 1.6 Hand-kept copies that a token change can strand (Verified at `33fd886c`)

- **Dark-mode mirrors.** `ai-flotation-public/src/assets/site.css:49-68` and
  `cpn-public/src/assets/site.css:57-79` copy their vendored `[data-theme="dark"]` block, because
  the sites follow the OS preference [S6][S7]. **Both mirrors still match value for value (13 of 13
  each)** at the PR head. Nothing updates a mirror when a sync changes the dark block.
- **Backend landing-page palette.** `landingPageTheme.parity.test.ts:159-175` pins three
  enterprise tokens to the vendored `colors.css` [S8]. The sync workflow doesn't run it.
- **The Hire copy.** If PR #2342 is merged, the Refactored and Hire design folders, identical
  today, diverge. Nothing syncs the Hire copy [S14].

---

## 2. Worked example: PR #2342 as it stands (Verified, read-only, 2026-11-14)

This section shows what the note in §3 would say about the real open pull request. It was
re-derived from the GitHub API at base `fee57d51` and head `33fd886c`. **It hasn't been posted and
is not a review.**

### 2.1 The pull request

- Opened 6:34 AM CDT on 2026-09-09. It has been **open 66 days**, refreshed by every daily run. The
  latest 30 runs all succeeded, the newest at 7:39 AM CST on 2026-11-14 [S11].
- **48 files, +914 / -161.** The workflow comment expects *"usually two files"*.
- Sync log: `ai-flotation` DRIFT, `cpn` OK, `refactored` DRIFT, `colaberry-enterprise` OK,
  `colaberry-training` SKIP; *"4 synced, 1 skipped, 2 with changes, 0 failed"*.

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
5. **Contrast re-check of the pairs that change** (WCAG 2.1 relative luminance; values from
   `tokens/colors.css` at base and head) [S12]:

   | Pair (what the visitor gets) | Before | After | AA 4.5:1 body text |
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

   These are token pairs. Which elements use each pair is the token-to-surface map the story says
   doesn't exist yet [S1].
6. **Left-behind files:** `base/base.css` and `base/components.css` are still in the folder at the
   head. The new `styles.css` no longer imports them, and the new manifest doesn't list them. They
   are part of the hand-written system of 2026-09-08 (§1.4), so they are reported as hand-authored
   and no longer imported, not as drift (§5 E4).
7. **The Hire copy diverges** (§1.6): `hire-refactored-public` keeps the old token files.

### 2.4 The other three brands

`cpn` and `colaberry-enterprise`: no drift, "unchanged". `colaberry-training`: skipped, no target.

### 2.5 What the example shows about the format

The sync log and the PR body say `~ tokens/colors.css` and *"read the colour and spacing
changes"*. Neither tells a reviewer three things:
- that a served site would lose its dark default and 16 of the tokens it uses;
- that the files being overwritten were written by hand, on purpose, the day before;
- that a second site holds an identical copy.

That gap is the business outcome this capability exists for [S1]. If the note format is right, a
reviewer sees all three in the first lines.

---

## 3. What a brand impact note must contain (Proposal, D2)

One note per pull request update. It is pinned to the pull request's head commit, so a note written
for an earlier head is visibly out of date.

**Header (all required)**
- Pull request link, head commit, base commit, and the time the note was written (Central time).
- **Sync status:** the result of the run that produced this head, **and** the result of the most
  recent run if it is newer. If the most recent run failed, the note says so before anything else
  (§5 E3).
- **Summary line per brand:** `unchanged` / `font-only, no colour impact` / `tokens changed` /
  `restyle` / `replaces hand-authored files`, with the count of needs-a-human-eye flags.

**Per brand with drift (all required)**
1. **Served surface:** where the folder is actually rendered (site host, backend renderer, or
   "not imported"), with the file:line that proves it.
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
7. **Contrast re-check:** before and after ratios for every foreground/background pair whose value
   changes, in every reachable mode and variant, with the threshold result (D4).
8. **Hand-kept copies:** whether the dark-mode mirrors, the backend palette pin and any unmanaged
   copy of the same folder (§1.6) still match after the merge.
9. **Needs a human eye:** each impact that can't be derived statically, with the page to look at
   and a rating (high / low).
10. **Files not reviewed:** hand-authored and no-longer-imported files in the folder, named and
    excluded (§5 E4).

**Footer (all required)**
- What the note didn't check, for example "component class usage in HTML not mapped".
- One fixed sentence: *"This note describes the change. The merge decision is yours."*

**What the note never contains (Proposal, D9):** a merge or reject verdict, "approve" wording, a
proposed upstream design-system change, or any claim that a check passed when it didn't run.

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
| I11 | A registry target is silently left out of the note, including `colaberry-enterprise`, or an unmanaged copy of a changed folder isn't mentioned | The story names three apps; the registry has four targets and a fifth app holds a copy (§6 G1, G9) |

---

## 5. Exceptions, and how the note handles each

| # | Exception | Handling (Proposal unless marked) | Source |
|---|---|---|---|
| E1 | **Font-file-only change** | The brand summary says `font-only, no colour impact`. The note still lists non-colour effects and a low-rated needs-a-human-eye item. §2.2 is the example | Story [S1] |
| E2 | **Dead token** (no authored consumer) | Listed in its own section as a finding, not dropped. **Scope (working decision, OQ5):** only tokens **this diff** adds, changes or removes | Story [S1] |
| E3 | **Failed sync** | The note checks the latest workflow run as well as the pull request. If the latest run failed, the note opens with the failure (brand, `FAIL` message, time) and marks itself insufficient (I1). **The pull request alone can't show this** (§1.3) | Story [S1]; G4 |
| E4 | **Hand-authored files** | Files not on the manifest are excluded from drift review and named under "Files not reviewed". Files not on the manifest that the new `styles.css` no longer imports are reported as `hand-authored, no longer imported`. **A diff that overwrites a file not on the manifest is not excluded:** it is reported as `replaces hand-authored files` (§3 item 2). Who decides what happens to those files is OQ6 and OQ9 | Story [S1]; [S3] `:286-299`; G5 |
| E5 | **Brand skipped** (`target: null`) | One line: skipped, with the registry note. No review | [S3] `:79-87` |
| E6 | **Folder not imported** by any surface | The served surface says `not imported` with evidence. Token changes are still listed, with no visual impact claimed | G3 |
| E7 | **Manifest-only change** | Reported as bookkeeping, with no visual impact | [S3] `:313-334` |

---

## 6. Gaps between the story and the code (Verified unless marked)

| # | Gap | What the note does about it | Who can fix the source |
|---|---|---|---|
| G1 | The story names *"the three public apps"*. The registry has **four** targets; `colaberry-enterprise` feeds the backend landing-page renderer for four brands [S3][S8]. The PR-body source links cover three | Proposal: the note covers all four targets (OQ2) | Story: whoever maintains the capability record. Workflow: platform owners. **Unknown** who |
| G2 | The story says to find consumers *"across the platform frontend"*. The frontend imports none of the synced folders (§1.2) | The note states "platform frontend: no consumer of the synced folders" | Capability record |
| G3 | The registry note for `refactored` says it *"Lands but is NOT yet imported"* [S3] `:59-62`. `site.css:7` imports it, and the site is served at the preview host [S6][S9] | The note derives served surfaces from code, never from registry notes | Platform owners |
| G4 | A failed sync can't be seen on the pull request (§1.3). The story's failed-sync exception assumes it can | E3: the note reads the run history | Platform owners (workflow) |
| G5 | **The manifest guards deletion, not overwriting.** The story says hand-authored files *"are excluded by the ownership manifest"*. That is true for deletion only, and a registered folder with no manifest (Refactored) has nothing excluded at all (§1.4) | E4 and I8 | Platform owners |
| G6 | The two gates the story cites, `build.js` and `validate-app-boundaries.js`, can't detect a visual change (§1.5) | The note never cites a passing build as evidence of no visual impact | (none needed) |
| G7 | The token-to-surface map doesn't exist [S1]. **Authored CSS `var()` use can be found statically** (§2.3 item 2). Component classes used in HTML aren't mapped | Consumers from `var()` use are required (§3 item 5). Class-level impact goes under needs-a-human-eye | Later autonomy levels |
| G8 | The workflow comment expects two files and thirty seconds. The open PR has 48 files and has been open 66 days with no review (§2.1) | Informational only. Whether PR #2342 is reviewed is not this capability's decision | Aleem / platform owners |
| G9 | `hire-refactored-public` holds an unmanaged copy of the Refactored design folder, not in the registry and with no manifest [S14] | The note names unmanaged copies of any changed folder (§3 item 8, I11) | Aleem (design ownership, per [S14] `:18-20`) / platform owners |

---

## 7. Boundaries and stop conditions

**Never, at any autonomy level (Story; Ali's Q3 answer Reported [S4]):** merge, approve, request
changes, push to `chore/design-system-sync`, edit vendored or hand-authored design files, or propose
a change to an upstream design system.

**Stop and report instead of writing a note when:**
- the latest sync run failed (E3): report the failure only;
- the pull request's head changed while the note was being written: start again on the new head;
- a registry target has no folder, or a folder has no `styles.css`: report it, don't guess;
- a consumer search can't run: mark the note insufficient (I3), and never write "no consumers".

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
| **OQ2** | Should the note cover `colaberry-enterprise`, which isn't in the story's three apps but feeds landing pages for four brands? | Decides I11 and G1 | D1 | **Yes, all four targets** | Not asked | **Pending** |
| **OQ3** | Does `refactored-preview.colaberry.ai` count as a live brand site for this review? | Decides how §2.3-type findings are rated | D1 | **Yes, rated like a live site.** It is the only place the rebuilt site is served [S9] | Not asked | **Pending** |
| **OQ4** | Which contrast threshold, and which pairs? | Decides §3 item 7 | D4 | **WCAG 2.1 AA: 4.5:1 body text, 3:1 large text and UI boundaries**, on every changed combination of `--fg`, `--fg-muted`, `--accent`, `--accent-contrast`, status colours, `--bg` and `--bg-elevated`, in every reachable mode and variant | Not asked | **Pending** |
| **OQ5** | Dead tokens: only those this diff touches, or the whole system? | Decides E2's length | D6 | **Only tokens this diff touches** | Not asked | **Pending** |
| **OQ6** | Who decides what happens to hand-authored files that are no longer imported, such as `refactored/base/*.css`? | E4 can name them but not remove them | D7 | **Report them; the note never recommends deletion** | Not asked | **Pending** |
| **OQ7** | Should the note contain only facts and flags, or also a recommendation? | The story's R4 ceiling allows *"a written recommendation and no merge authority"* [S1] | D9 | **Facts and flags only, until you decide otherwise.** Ali's Q3 principle: *"Detection is fair game … Authorship of the brand is not"* [S4] (**Reported**) | Q3 answered by Ali [S4] | **Pending** |
| **OQ8** | Where should the note live once it is allowed? | Decides D8 | D8 | **A PR comment, once a later level allows `pull_request_comment`.** At R0, nothing is posted | Not asked | **Pending** |
| **OQ9** | **New.** Should upstream own the Refactored design folder at all, given it was replaced by hand on 2026-09-08 with a deliberate dark default, and does the Hire copy belong under the sync? | Decides whether PR #2342-type diffs are "drift" or "an overwrite of brand decisions" | D10 | **No working decision.** It decides what the Refactored brand is, which Ali's Q3 principle reserves to a human [S4]. The note reports the overwrite (§3 item 2) whatever the answer | Not asked | **Pending** |
| **OQ10** | **New.** Do you agree to pick this capability, so the platform opens its four steps (by hand, in the app, tool request, agent watched)? | Without it the story stays a candidate (§0) | (none in this document) | **No working decision.** Picking needs your agreement by the platform's own rule [S16] | Not asked | **Pending** |

---

## Sign-off

**Not signed. Aleem has not confirmed anything in this document.** Mohammed Abdul Aleem remains the
accountable manager. Ali Muwwakkil's interview answers [S4] and guidance [S27], and Mihret's working
decisions (§8), are inputs, not a substitute.

### How to review and confirm this without portal access

- **No admin portal access is needed.** Aleem can answer by email or in a meeting.
- **What counts as evidence (working decision, same as the drift audit):** Aleem's own written,
  dated words, either an email reply or meeting notes he has confirmed in writing. A meeting
  without written confirmation doesn't count, because the story excludes *"a conversation that went
  well"* [S1].
- **The quickest review:** read §2 (the worked example) and §3 (the format), then answer OQ1:
  does this answer your question before merging?
- **Suggested reply format:** "OQ1: yes / my question is …; D1 agree; D4 change: …; OQ9: …".
- **Partial answers are fine.** Each one is recorded as it arrives. The criterion passes only when
  Aleem confirms the note format (D2) and answers OQ1.
- **Unknown:** whether the platform accepts an email copied into this repository as evidence.

### Decisions

| # | Decision | Mihret's working decision (preparation only) | Aleem's answer (pending) |
|---|---|---|---|
| D1 | Which targets and surfaces the note covers (OQ2, OQ3) | All four targets; preview host rated as live; unmanaged copies named | ☐ agree ☐ change: ______ |
| D2 | **The note format (§3), together with your answer to OQ1. This is the criterion** | As written in §3 | ☐ answers my question ☐ change: ______ |
| D3 | The insufficiency rules I1-I11 (§4) | As written | ☐ agree ☐ change: ______ |
| D4 | Contrast threshold and pairs (OQ4) | WCAG 2.1 AA, pairs as in OQ4 | ☐ agree ☐ value: ______ |
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
Only Aleem's own words decide the outcome written here.

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

---

## Sources

Platform paths are in `ColaberryEnterprise_AI_LeadershipAccelerator`. Line numbers were read at
`c96f6a68`. They are confirmed at the PR base `fee57d51` only for the nine files compared by blob
hash (see the list at the top of this document), and for files a row marks "at `fee57d51`" or
"at `33fd886c`". For any other file they are as at `c96f6a68`. PR and run data are from the GitHub
API, read between about 2:30 and 3:20 PM CST on 2026-11-14.

| ID | What | Where |
|---|---|---|
| S1 | Outcome, workflow, inputs, outputs, exceptions, blockers, R0 behaviour and criterion | This repo: [`docs/stories/product_experience.CAP.brand_design_system_sync_review.md`](../stories/product_experience.CAP.brand_design_system_sync_review.md) |
| S2 | Sync workflow: schedule, sync step, drift check, build gate (four apps), PR body, branch, add-paths, "the pull request is the review" | Platform at `fee57d51`: `.github/workflows/design-system-sync.yml:8-12`, `:18-29`, `:59-66`, `:68-76`, `:78-87`, `:89-105`, `:107-125` |
| S3 | Brand registry and targets; manifest rationale; manifest format | Platform: `backend/src/scripts/lib/designSystemSync.js:42-88`, `:286-299`, `:313-334` |
| S4 | Sync failure model, log format, manifest reading, `writeTree`, exit codes. Ali's Q3 answer (**Reported**, waiting for Aleem's confirmation) | Platform: `backend/src/scripts/syncDesignSystems.js:14-19`, `:91-102`, `:106-111`, `:155-160`, `:166-178`, `:218-219`, `:231`. Q3: this repo, [`docs/discovery/04-manager-interview.md:278`](../discovery/04-manager-interview.md) |
| S5 | Boundary validator scans JS/TS imports only | Platform: `scripts/validate-app-boundaries.js:27-36`, `:83-101` |
| S6 | Each site imports its design `styles.css`; dark-mode mirrors; Refactored's uses of removed tokens | Platform: `apps/ai-flotation-public/src/assets/site.css:32`, `:49-68`; `apps/cpn-public/src/assets/site.css:51`, `:57-79`; `apps/refactored-public/src/assets/site.css:7`, `:10`, `:24`, `:34-35`, `:50`, `:59`, `:64`, `:70`, `:72`, `:80-81`, `:86-87`, `:89`, `:100`, `:103` |
| S7 | Vendored dark blocks the mirrors copy | Platform: `apps/ai-flotation-public/src/assets/design/tokens/colors.css:21-35`; `apps/cpn-public/src/assets/design/tokens/colors.css:16-24` |
| S8 | Backend pins the enterprise palette to the vendored file | Platform: `backend/src/services/marketing/__tests__/landingPageTheme.parity.test.ts:159-175`; `backend/src/services/marketing/landingPageFonts.ts:43` |
| S9 | `refactored-public` is built into the container and served at `refactored-preview.colaberry.ai`, not `refactored.ai` | Platform: `nginx/refactored-preview.conf:1-17`, `:24`; `nginx/Dockerfile` at `fee57d51` (builds and copies `refactored-public` and `hire-refactored-public`) |
| S10 | PR #2342: 48 files, +914/-161, opened 2026-09-09, no comments, reviews, reviewers or status checks; sync log in body; files at base `fee57d51` and head `33fd886c`; head colour, entry-point and font files identical to the first draft's head `459c6a3c` | [ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator#2342](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator/pull/2342) |
| S11 | Workflow run history: the latest 30 scheduled runs all succeeded, newest 7:39 AM CST on 2026-11-14 | `gh run list --workflow design-system-sync.yml` on the platform repo |
| S12 | Contrast ratios in §2.3 | WCAG 2.1 relative-luminance formula, computed from the hex values in `tokens/colors.css` at `fee57d51` and `33fd886c`, in a scratch script outside this repository |
| S13 | Refactored design folder history: vendored with a manifest, then removed, then replaced by hand on 2026-09-08 | Platform commits `21cf07f5`, `c1148763`, `bd42012d` (GitHub API file lists and commit messages) |
| S14 | `hire-refactored-public`: unmanaged copy of the Refactored design folder, not in the registry, no manifest; "design ownership across all Colaberry brands sits with Aleem" | Platform at `fee57d51`: `apps/hire-refactored-public/src/assets/tokens.css:7-17` (unsynced, "LOOKS vendored"), `:18-20` (design ownership), `:26-29` (imports); `tokens/colors.css` blob identical to `apps/refactored-public`'s |
| S15 | Maru exists, disabled, no tools granted; the first draft's blocker line flagged as outdated | This repo, branch `story-000-command-center-revision`, commit `fbc7521`: [`docs/definitions/multi_brand_surface_consistency_audit.R0.md`](https://github.com/MihretColaberry1/ColaberryInternship/blob/fbc7521d4adab9978be55de3962114e5ad22560b/docs/definitions/multi_brand_surface_consistency_audit.R0.md) §4 (B1) and §4.1. Not on `main` |
| S16 | The story is marked "CANDIDATE -- not started, not assigned"; the four-step ladder; the drift audit's opened steps | This repo: plan sync `0549de8` (2026-11-13); [`docs/stories/product_experience.CAP.design_token_drift_audit.L1-BY-HAND.md`](../stories/product_experience.CAP.design_token_drift_audit.L1-BY-HAND.md) |
| S27 | Ali Muwwakkil's guidance on not waiting indefinitely and on documenting the preparer's own decisions (**Reported**) | Email from Ali Muwwakkil to Mihret Netsereab dated 2026-10-27, as relayed by Mihret on 2026-10-30. Not in this repository. Same source as the drift-audit definition's S27 |

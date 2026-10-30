# Design-token drift audit: R0 audit definition

**Capability:** `product_experience.design_token_drift_audit` · **Autonomy:** R0 (definition only)
**Accountable manager:** Mohammed Abdul Aleem · **DRI:** Ali Muwwakkil
**Prepared by:** Mihret Netsereab · 2026-10-30
**Status:** **draft, not signed.** This document is the thing the R0 criterion asks Mohammed Abdul
Aleem to sign. Until his sign-off is recorded in [Sign-off](#sign-off), the criterion stays
unpassed and the capability stays `draft`.

Each claim is tagged **Verified** (checked against the source repository while writing this),
**Story** (stated in the capability record), **Reported** (stated by someone, not recorded in a
repository), **Proposal** (my recommendation, waiting on his decision) or **Unknown**.

Source repository read: `ColaberryEnterprise_AI_LeadershipAccelerator` at commit `c96f6a68`
(merged 8:56 PM CDT on 2026-10-27). Read-only. Nothing in it was changed.

---

## What R0 is, and what it is not

The R0 criterion is: *"Mohammed Abdul Aleem signs off a written scope and exception list; no scan
has run against the repo yet."* [S1]

- **This document is that written scope and exception list.** It defines what counts as a
  violation, which surfaces are in scope, which raw-colour cases are legitimate, and who decides a
  token-set gap [S1].
- **No scan has run.** No colour, spacing or inline-style occurrence was counted for this
  document. The only measurements taken were the size of the token contract (101 properties) and
  the admin route list, because the scope can't be written without them. **(Verified)**
- **The only counts in this document are the story's figures from 2026-10-09.** Those are 4,492 hex
  literals in `.tsx`, 1,778 in CSS other than `tokens.css`, 488 `rgb()`/`rgba()` and 8,219 inline
  `style={{ }}` [S2]. They are raw occurrence counts, **not violation counts**. How many are real
  violations is **Unknown** until the exceptions below are signed.
- **Nothing here grants a tool, runs an agent or changes the product.**

---

## 1. Scope

### 1.1 Which surfaces (decision D1)

The capability record says the audit is surface-wide: "all 445 route-reachable pages" [S3]. Ali
Muwwakkil recommended starting with **the admin portal** [S4]. That narrows the capability, so this
definition has to state it and Aleem has to sign it. Neither source defines what "the admin
portal" means [S4].

**Verified facts about the admin route tree:**
- `frontend/src/routes/adminRoutes.tsx` holds 99 `<Route>` elements. Its 96 `path=` attributes all
  begin with `admin` [S5].
- Admin pages render shared components from outside `pages/admin/`. The capability's own evidence
  list cites `components/timeline/CardDetailBody.tsx`, which the portal uses too [S6].

**Proposal for D1:** the first scope is **every source file reachable through imports from
`frontend/src/routes/adminRoutes.tsx`, plus the stylesheets those files import**.
- Each finding is tagged `admin-only` or `shared`. A shared file is one that a portal, public or
  lifecycle route also reaches.
- Shared findings are reported, but no substitution is proposed for them in the first release.
  Repainting a shared component also repaints non-admin pages, and that is a brand decision
  outside the signed scope.
- Widening to all 445 pages is a later decision with its own sign-off.

*Alternative he may prefer:* only files under `pages/admin/` and `components/admin/`. This is
simpler, but it would miss shared components that visibly paint admin pages.

### 1.2 Which files

| In scope | Out of scope |
|---|---|
| `.tsx` and `.ts` files inside the D1 scope | `frontend/src/styles/tokens.css`, which is the contract, not a consumer [S7] |
| `.css` files inside the D1 scope, including `global.css`, `brand-bridge.css`, `admin-shell.css`, `agentDetailV2.css`, `orchestration.css` and `rungTones.css` [S3] | Everything under `apps/*/src/assets/design/`, which is owned upstream by `design-system-sync.yml` [S3][S8] |
| | Test files (`__tests__/`, `*.test.ts(x)`), fixtures and mocks, because they don't paint the product (**Proposal**) |
| | `node_modules/` and build output |

### 1.3 Which values (decision D2)

The outcome statement says "a colour **or spacing** value" [S1]. The workflow only names hex,
`rgb()`/`rgba()` and inline styles [S1].

**Proposal for D2:**
- **Colour: in scope from the first scan.** Hex (3, 4, 6 and 8 digit), `rgb()`, `rgba()`, `hsl()`,
  `hsla()`, and named CSS colours (`red`, `white` and so on). Named colours are included because
  leaving them out would let drift through under a different spelling. `transparent`,
  `currentColor`, `inherit`, `initial` and `unset` are **not** violations.
- **Spacing: counted, but reported separately and not ratcheted in the first release.** This
  covers `padding*`, `margin*`, `gap`, `rowGap` and `columnGap` with a literal `px` or `rem` value.
  The spacing scale has only 6 steps (4, 8, 16, 24, 32 and 48 px) [S7], so every off-scale value
  would become a token-set gap. Ratcheting spacing waits until he decides whether the scale grows.
- **Not in scope yet:** font sizes, radii, shadows and transitions. Tokens exist for these [S7],
  but the outcome names only colour and spacing. Adding them later is a scope change.

### 1.4 What an inline `style={{ }}` is

An inline style object is **not** a violation by itself. The frontend-design skill explicitly allows
inline `maxWidth`, `maxHeight`, `cursor` and `fontSize` [S9]. Only a colour or spacing value
(per D2) **inside** the object counts. So the 8,219 figure [S2] is a count of style objects. It
is not a count of violations, and it must never be reported as one.

---

## 2. What counts as a violation

A **violation** is a colour or spacing literal (per D2), in an in-scope file (per 1.2), that is
used as a styling value and is not covered by an allow-list rule (section 3).

"Used as a styling value" means one of:
- a CSS declaration value;
- a value in a JSX `style={{ }}` object;
- a value passed to a styling prop (`color`, `fill`, `stroke`, `background`, `bg` and similar);
- a value in a constant object or array whose values reach one of the above.

The project's own rules already forbid these: "Never hardcode hex values; use `var(--color-*)`"
[S10]; "never inline styles with hex values" [S11]; "Don't hardcode colors" [S9].

### 2.1 Normalisation, before any comparison

- Hex is compared case-insensitively, and 3/4-digit hex is expanded (`#fff` = `#ffffff`).
- `rgb(r, g, b)` equals the hex with the same channels. Alpha must match exactly for an exact match.
- Whitespace inside functions is ignored.
- **A `var(--token, #hex)` fallback (Proposal):** it is not a violation if the fallback equals that
  token's value. If it differs, it is reported as a `stale-fallback` finding.

### 2.2 Classification: a closed set of six outcomes

Every occurrence ends in exactly one of these. There is no seventh state, and nothing is dropped
silently.

| Outcome | Meaning | Gets a proposed substitution? |
|---|---|---|
| `exact` | The normalised value equals exactly one token's value | **Yes**, `raw -> var(--token)` |
| `exact-ambiguous` | The value equals **two or more** tokens' values | No. All candidates are listed (decision D3) |
| `near` | Within the D4 threshold of a token, but not equal to it | No. Candidate token and distance are listed |
| `gap` | No token within the threshold | No. Escalated as a design decision (section 4) |
| `allow-listed` | Covered by a signed rule in section 3 | No. The rule ID is recorded |
| `unclassified` | The classifier could not decide (parse error, dynamic value, unclear context) | No. **Counted as drift, never as a pass** [S1] |

### 2.3 Value collisions in the token contract (decision D3)

**Verified:** 11 colour values in `tokens.css` belong to more than one token. Most are the
legacy palette and the "Design E" palette defining the same colour twice [S7]:

| Value | Tokens |
|---|---|
| `#FB2832` | `--color-primary` (L8), `--cherry` (L76) |
| `#C20E1E` | `--color-primary-light` (L9), `--cherry-deep` (L78) |
| `#9ca3af` | `--color-muted` (L24), `--track-other` (L153) |
| `#f97316` | `--activity-orange` (L132), `--track-training` (L149) |
| `#2E6A86` | `--berry-hover` (L85), `--status-matched-text` (L93) |
| `#EAF2F6` | `--berry-bg` (L86), `--status-matched-bg` (L94) |
| `#468A2E` | `--leaf-text` (L82), `--status-verified-text` (L97) |
| `#F1F9EA` | `--leaf-bg` (L83), `--status-verified-bg` (L98) |
| `#B5710A` | `--amber-text` (L88), `--status-partial-text` (L95) |
| `#FDF4E6` | `--amber-bg` (L89), `--status-partial-bg` (L96) |
| `#F1F1F0` | `--n100` (L101), `--status-unmapped-bg` (L92) |

These have the same value but not the same meaning. `#f97316` is an activity band in one token
and a training track in the other. A tool can't tell from the value alone which one the author
meant.

**Proposal for D3:** these are classified `exact-ambiguous`, and no substitution is proposed. A
human picks the token. The only alternative would be a precedence order signed by him (for
example "the Design E name wins over the legacy name"). If he signs one, the D3 line below names
it, and it applies only to the pairs it lists.

### 2.4 "Near" threshold (decision D4)

**Proposal for D4:** a colour is `near` a token when its CIEDE2000 colour difference is **≤ 2.0**
and the alpha matches. A difference of about 2 is roughly the edge of what a viewer can see side
by side. The number is his to set or change. It decides only how a finding is labelled, never
whether a substitution is proposed. Near matches are never auto-substituted [S1].

For spacing, there is no "near" outcome. A value is either on the scale (`exact`) or it is a `gap`.

---

## 3. Exception list (allow-list), decision D5

No agreed allow-list exists today [S2]. These are the proposed rules. Each one needs his tick
before it counts. A rule he strikes out is simply not applied, so those occurrences fall back to
being reported.

| ID | Rule | Why | Source |
|---|---|---|---|
| **A1** | **Data visualisation.** Colour literals passed as props to chart elements (the charting library is `recharts` [S12]), or held in a constant used only by such elements. Other literals in the same file stay in scope. | The dataviz palette is governed separately. Including it produces false findings. | [S3][S13] |
| **A2** | **Brand marks.** Fills and strokes inside named logo and brand-mark components. **The file list is his to supply.** No file is excluded under A2 until it is named here. | A logo's colours are fixed by the brand. They are not UI tokens. | [S3] |
| **A3** | **Code samples and documentation strings.** Literals inside comments, inside markdown/doc text, and inside strings shown to the user as example code. | These do not paint the UI. | [S3] |
| **A4** | **Vendored upstream design CSS** under `apps/*/src/assets/design/`. Excluded entirely (see 1.2). | Owned upstream by `design-system-sync.yml`. Must not be rewritten here. | [S3][S8] |
| **A5** | **Neutral keywords:** `transparent`, `currentColor`, `inherit`, `initial`, `unset`. | They are not colour values. | Proposal |

**One case needs his ruling, not a default (decision D6):** HTML and CSS built **as strings** for a
preview frame. For example, `studioKit.tsx` exports a `frameHtml` helper [S14]. Those colours paint
a preview the admin user sees, so they look like styling. They also stand for the content being
previewed, so they may be legitimate. Until he rules on this, any such occurrence is
`unclassified`, and it counts as drift.

**Who keeps the list up to date** is open (interview Q6's follow-up [S15]). **Proposal:** any
addition, removal or change to A1–A6 is a new entry here, signed by him. Engineers can propose
changes but can't approve them.

---

## 4. Token-set gaps, and who decides them (decision D7)

A raw colour with no token equivalent is **a token-set gap, not a code defect**. It is escalated as
a design decision and never auto-substituted [S1].

**Proposal for D7:** Mohammed Abdul Aleem decides every gap. This matches Ali's recommendation
that design approvals and brand design systems stay human-controlled [S4]. The audit reports gaps
grouped by value, with the occurrence count and files for each. For each value he picks one of:
1. add a new token to `tokens.css`;
2. map it to an existing token (the code is then fixed by a human);
3. add an allow-list rule in section 3.

Until he picks, the gap stays in the drift count.

---

## 5. Outputs the first scan will produce (once R0 is signed)

1. **A ranked violation inventory by file.** Every finding has file, line, raw value, normalised
   value, outcome (2.2), candidate token(s) and the `admin-only`/`shared` tag. Files are ranked by
   non-allow-listed occurrences, highest first. **Every finding cites file and line. A finding
   without them is a defect.**
2. **A substitution proposal for `exact`, `admin-only` findings only.** This is a patch file
   that is not applied, not committed and not pushed. A human reviews, merges and deploys it.
   Shipping a UI change needs `push_to_protected_main` and `production_deploy`, and both are
   default-denied [S2].
3. **A drift count shaped like the copy-lint baseline.** This is a per-file map of exact counts that
   can only go down: up is a new violation, down must be written back, and zero means the entry is
   deleted [S16]. Drift = `exact` + `exact-ambiguous` + `near` + `gap` + `unclassified`. Spacing is
   reported next to it but not ratcheted (D2).
4. **A gap list for him** (section 4), with unknown values left marked as unknown [S1].
5. **A denominator on every count:** "N findings across F of M in-scope files scanned".

---

## 6. When the scan must stop or call itself incomplete

These are proposed as stop conditions for the first scan. Each one becomes a negative test before
any tool is granted.

| Condition | Required behaviour |
|---|---|
| `tokens.css` is missing, or its `:root` block doesn't parse | Stop. No inventory, no count, no "clean". |
| The parsed token count isn't **101**, the count measured on 2026-10-09 and again on 2026-10-30 [S2][S7] | Stop and report the new count. The contract changed, so the classification may be stale. |
| An in-scope file can't be read or parsed | List it under "not scanned". Mark the run **incomplete**, never clean. |
| Zero in-scope files found | Report "0 of 0", never "no violations". |
| A finding lacks file or line | Treat it as a defect in the scanner and fail the run. |
| Any attempt to apply, commit or push the substitution patch | Forbidden. The audit only proposes [S1]. |

---

## Sign-off

**Not signed.** To be completed by Mohammed Abdul Aleem. Ali Muwwakkil's recommendations [S4] are
inputs to this, not a substitute for it.

| # | Decision | Proposal above | His decision |
|---|---|---|---|
| D1 | Which surfaces | Files reachable from `adminRoutes.tsx`, shared files reported but not patched | ☐ agree ☐ change: ______ |
| D2 | Which values | Colour now. Spacing counted but not ratcheted. Others later | ☐ agree ☐ change: ______ |
| D3 | Same value, several tokens | `exact-ambiguous`, human picks | ☐ agree ☐ precedence order: ______ |
| D4 | "Near" threshold | CIEDE2000 ≤ 2.0, alpha equal | ☐ agree ☐ value: ______ |
| D5 | Allow-list rules A1–A5 | As listed | ☐ A1 ☐ A2 (files: ______) ☐ A3 ☐ A4 ☐ A5 |
| D6 | Styles built as preview strings | `unclassified` until ruled | ☐ in scope ☐ allow-list as A6 |
| D7 | Who decides gaps and keeps the list | Mohammed Abdul Aleem | ☐ agree ☐ name: ______ |

Signed: ____________________ · Date: __________ · How recorded (meeting notes / message / portal):
__________

When this is signed, the R0 criterion in `.colaberry/progress.json` can be set to `passed: true`,
citing this file and the record of the sign-off. **Not before.**

### Still blocked even after sign-off (not resolved by this document)

- No AI employee is provisioned for this domain (`agent_id` is null) [S2].
- Aleem has no admin login, so he can't open the agent's surfaces [S2]. The sign-off has to be
  recorded some other way (see the "How recorded" line above).
- Moving past R0 needs a trust threshold (interview Q5), which hasn't been asked yet [S15].

---

## Sources

| ID | What | Where |
|---|---|---|
| S1 | Outcome, workflow, exceptions, R0 criterion | This repo: `docs/stories/product_experience.CAP.design_token_drift_audit.md` |
| S2 | Blockers, and the 2026-10-09 raw counts | Same file, "Blocked by" |
| S3 | Surface-wide scope, source modules, exceptions | Same file, "How to build it" |
| S4 | Ali Muwwakkil's Q1–Q4 recommendations (Reported) | This repo: `docs/discovery/04-manager-interview.md`, "Responses received" |
| S5 | 99 `<Route>`; 96 `path=` all under `admin` (Verified 2026-10-30) | Source repo: `frontend/src/routes/adminRoutes.tsx` |
| S6 | Shared component cited as capability evidence | Source repo: `frontend/src/components/timeline/CardDetailBody.tsx:1` |
| S7 | Token contract: 101 custom properties in `:root`, collisions at the lines listed | Source repo: `frontend/src/styles/tokens.css:6` |
| S8 | Vendored design dirs exist under all four apps; sync workflow present | Source repo: `apps/*/src/assets/design/`, `.github/workflows/design-system-sync.yml` |
| S9 | Inline styles allowed only for `maxWidth`, `maxHeight`, `cursor`, `fontSize`; "Hardcode colors" listed under Don't | Source repo: `.claude/skills/frontend-design/SKILL.md:157-158` |
| S10 | "Never hardcode hex values; use `var(--color-*)`" | Source repo: `frontend/CLAUDE.md:35` |
| S11 | "never inline styles with hex values" | Source repo: `frontend/CLAUDE.md:41` |
| S12 | `recharts` is the chart dependency | Source repo: `frontend/package.json:28` |
| S13 | "Chart palettes are governed by the dataviz guidance, not by the product token set" | This repo: `docs/stories/product_experience.CAP.dataviz_quality_audit.md:55` |
| S14 | `frameHtml` helper builds preview HTML as a string | Source repo: `frontend/src/pages/admin/orchestration/studio/studioKit.tsx:51` |
| S15 | Q5 (trust threshold) and Q6 (colour exceptions, who maintains them) not yet asked | This repo: `docs/discovery/04-manager-interview.md`, Q5–Q6 |
| S16 | Copy-lint baseline: exact per-file counts, shrink-only, zero entries deleted | Source repo: `backend/src/services/content/frontendCopyBaseline.ts:15` |

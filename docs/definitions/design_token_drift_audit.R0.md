# Design-token drift audit: R0 audit definition

**Capability:** `product_experience.design_token_drift_audit` · **Autonomy:** R0 (definition only)
**Accountable manager:** Mohammed Abdul Aleem · **DRI:** Ali Muwwakkil
**Prepared by:** Mihret Netsereab · first draft 2026-10-30 · **revision 2, 2026-10-30**
**Status:** **draft, ready for review, not signed.** This document is the thing the R0 criterion
asks Mohammed Abdul Aleem to sign. Until Aleem's sign-off is recorded in [Sign-off](#sign-off),
the criterion stays unpassed and the capability stays `draft`. It can be reviewed and signed by
email or confirmed meeting notes; no admin portal access is needed.

Each claim is tagged **Verified** (checked against a repository while writing this),
**Story** (stated in the capability record), **Reported** (stated by someone, not recorded in a
repository), **Proposal** (my recommendation, waiting on a human decision) or **Unknown**.

**Every Proposal is also Mihret Netsereab's working decision,** listed in [§8](#8-open-questions-and-the-working-decisions-that-keep-the-work-moving)
and the [decision table](#decisions). It lets the preparation work continue under Ali Muwwakkil's
guidance [S27]. **It is not Aleem's approval, and it is not platform policy.**

**Repositories read, read-only. Nothing in them was changed:**
- the platform, `ColaberryEnterprise_AI_LeadershipAccelerator`, at commit `c96f6a68` (merged
  8:56 PM CDT on 2026-10-27). The local clone is shallow, so file history before that commit is
  not available;
- `aleemcolaberry/Colaberry-DS-School-Final`, the Colaberry School design system, shared by
  Mohammed Abdul Aleem (last pushed 7:43 AM CDT on 2026-07-16);
- `aleemcolaberry/colaberry-design-system`, for comparison only (last pushed 7:56 AM CDT on
  2026-06-25).

### What changed in revision 2

The first draft treated `frontend/src/styles/tokens.css` as the only token contract. That was
wrong. The platform loads **three token layers**, and the last one reassigns 18 of the 21 legacy
`--color-*` names to the design system's values (section 1). Revision 2 rebuilds the classification, the
collision table, the spacing scale, the file scope, the chart rule and the stop conditions on the
**effective** values. It also adds six open questions (OQ1–OQ6) that have to be answered before
sign-off.

---

## What R0 is, and what it is not

The R0 criterion is: *"Mohammed Abdul Aleem signs off a written scope and exception list; no scan
has run against the repo yet."* [S1]

- **This document is that written scope and exception list.** It defines what counts as a
  violation, which surfaces are in scope, which raw-colour cases are legitimate, and who decides a
  token-set gap [S1].
- **No scan has run.** No raw colour, spacing or inline-style literal in application code was
  counted, and no violation was identified. **(Verified)** The measurements come from:
  - the **token-contract files** (declarations and their resolved values);
  - the **CSS import chain** that loads them;
  - the admin **route list**;
  - file-hash comparisons with the design-system repositories.
- **The investigation also searched application code for structure, not violations:**
  - which files import `frontend/src/colaberry/`;
  - which `.ts`/`.tsx` files mention `data-theme`;
  - a tally of which token *names* `admin-shell.css` references through `var()`, used to support
    the claim in 1.4 that it reads DS tokens.

  None of these counted a raw literal, and none is a finding of this audit.
- **The application counts in this document are the story's figures from 2026-10-09:** 4,492 hex
  literals in `.tsx`, 1,778 in CSS other than `tokens.css`, 488 `rgb()`/`rgba()` and 8,219 inline
  `style={{ }}` [S2]. They are raw occurrence counts, **not violation counts**. How many are real
  violations is **Unknown** until this definition is signed. Those figures also predate this
  revision's scope, for example the exclusion of `frontend/src/colaberry/`.
- **Working decisions don't unblock the scan.** Mihret's working decisions (§8) let preparation
  continue. The scan stays blocked until Aleem's sign-off is recorded [S1].
- **Nothing here grants a tool, runs an agent or changes the product.**

---

## 1. The token contract: three layers, not one

### 1.1 What is loaded, in what order (Verified)

| Order | Layer | Loaded by | `:root` declarations* |
|---|---|---|---|
| 1 | **Legacy:** `frontend/src/styles/tokens.css` | `global.css:1` `@import './tokens.css'`, itself imported at `index.tsx:22` | 101 |
| 2 | **Design system (DS):** `frontend/src/colaberry/tokens/*.css` (`fonts`, `colors`, `typography`, `spacing`, `base`) | `colaberry/styles.css:6-10`, imported at `index.tsx:24` | 215 |
| 3 | **Bridge:** `frontend/src/styles/brand-bridge.css`, `:root` block at lines 19–84 | `index.tsx:25` | 43 |

\* Counted on 2026-10-30 by parsing each file's light-theme `:root` blocks with comments
removed. That gives 330 distinct names after the cascade. An earlier, cruder count of the DS
layer gave 208. The 215 figure is the one this definition uses.

`admin-shell.css` loads after the bridge (`index.tsx:26`) but declares no `:root` tokens.

Later layers win when a name is declared twice. The bridge says this is deliberate: it is
"imported LAST … so these mappings win every name collision" and "Remove this one import to fully
revert the rebrand" (`brand-bridge.css:10-14`).

### 1.2 What the bridge and the DS change (Verified)

**21 legacy names are reassigned by the bridge** (18 colours, 3 fonts), and **6 by the DS
layer** (3 radii, 3 shadows). Examples:

| Legacy name | Declared in `tokens.css` | Effective value | Set by |
|---|---|---|---|
| `--color-primary-light` | `#C20E1E` | `#FD5760` (`var(--red-400)`) | bridge `:23` |
| `--color-secondary` | `#e53e3e` | `#E5121D` | bridge |
| `--color-accent`, `--color-success` | `#38a169`, `#10b981` | `#5BA63C` | bridge |
| `--color-muted` | `#9ca3af` | `#6B6B6B` | bridge `:33` |
| `--color-text` | `#2d3748` | `#2B2B2B` | bridge |
| `--color-warning-bg` | `rgba(245, 158, 11, 0.06)` | `#FCF1DD` | bridge |
| `--radius-sm` / `-md` / `-lg` | 4 / 8 / 12 px | **8 / 12 / 16 px** | DS |
| `--shadow-sm` / `-md` / `-lg` | black-based | DS soft neutral shadows | DS |

The remaining legacy names keep their `tokens.css` value because nothing later redeclares them.
This includes `--color-purple`, `--color-warning-bg-legacy`, the "Design E" block, the heatmap,
the track colours, and four of the six activity bands (`--activity-yellow`, `-orange`, `-black`,
`-unknown`, which are literals).

**Two activity bands change colour indirectly (Verified).** They are not redeclared, but they
are aliases of names the bridge reassigns:

| Band | Declared as (`tokens.css`) | Reassigned upstream of the alias | Effective value |
|---|---|---|---|
| `--activity-green` | `var(--color-success)` (`:130`) | bridge `:36` `--color-success: var(--status-success)`, and DS `--status-success: var(--green-600)` | `#5BA63C` (was `#10b981`) |
| `--activity-red` | `var(--color-danger)` (`:133`) | bridge `:37` `--color-danger: var(--status-danger)`, and DS `--status-danger: var(--red-600)` | `#E5121D` (was `#ef4444`) |

So the `tokens.css` comment at `:123-124`, that green and red "alias the existing semantic
tokens, whose values the design already matched exactly", is no longer true at runtime. Whether
the Intern Console design wants the bridge values or its original ones is **Unknown**. It's a
design question for section 5, not something this audit decides.

**Consequence:** a classifier that compares raw values with `tokens.css` declarations gives wrong
answers. For example, it would match `#C20E1E` to `--color-primary-light` (and `--cherry-deep`),
but `--color-primary-light` actually renders `#FD5760`. **Every comparison in this definition uses effective values.**

### 1.3 Where the DS layer comes from (Verified, with one open question)

- **`frontend/src/colaberry/` is a vendored copy of the Colaberry School design system,** which is
  what that system's install guide tells a project to do (`cp … your-project/src/colaberry/`).
  - `styles.css`, `tokens/base.css` and `tokens/typography.css` are byte-identical to
    `Colaberry-DS-School-Final`.
  - `tokens/colors.css`, `spacing.css` and `fonts.css` are upstream **plus local platform
    edits**:
    - 4 `--status-violet/teal` tokens (vendored `colors.css:152-160`);
    - `--z-player` (vendored `spacing.css:74-76`);
    - the Google Fonts and Remix Icon `@import`s replaced with comments explaining their
      removal (vendored `fonts.css:13-34`).
- **Two upstream repositories hold the same tokens.** `Colaberry-DS-School-Final` and
  `colaberry-design-system` have byte-identical `tokens/*`, `styles.css`, `tokens.json` and
  `BRAND.md`. The platform's own history names the second as the one it used
  (`PROGRESS.md:7364`, 2026-06-24). The first is the one Aleem shared. **Which is canonical is
  OQ1.**
- **Nothing keeps the vendored copy in step.** Neither repository is in the
  design-system sync list (`designSystemSync.js:44-88`), which covers five other brand repos.
  Another vendored copy notes that the School repo "fed only the Colaberry brands"
  (`apps/ai-flotation-public/src/assets/design/DESIGN_SYSTEM.md:11`).

### 1.4 The platform's own documents disagree about which layer is the authority (Verified)

| Points to the legacy layer | Points to the DS layer |
|---|---|
| `.claude/skills/baseline-ui/SKILL.md:11`: `tokens.css` "is the source of truth". The only platform document that names `tokens.css` as the authority. | `caseStudyTokens.test.ts:7-9`: "THE REPOSITORY CARRIES TWO TOKEN SYSTEMS", and `tokens.css` is "an older, competing set" |
| `frontend/CLAUDE.md:35`: "Never hardcode hex values; use `var(--color-*)`". This names the legacy `--color-*` family. It does not name `tokens.css` or say which layer is authoritative. | `admin-shell.css:4`: "Brand tokens only (src/colaberry/tokens)" |
| | `publicV2.css:4-6`: "every value here resolves to a token from colaberry/tokens/*" |

**Upstream guidance, not a platform rule:** the DS's own `BRAND.md:149-150` says to "Always use
semantic tokens … rather than raw ramp values". That governs how the DS should be used. It
doesn't settle which layer this platform treats as authoritative.

So the capability's dependency **"tokens.css remaining the single token authority" [S3] is not
met today.** That is a finding about the platform, not something this audit can fix. The
capability record's wording needs revisiting, and that record is outside this document. **Which
layer the audit treats as the contract is OQ2.**

**Proposal:** the audit's contract is **the effective cascade of all three layers** (1.1). That is
what renders, so it is the only definition under which "this raw value equals a token" is
true on screen. Which *name* a fix should use is a separate question (section 3.3).

---

## 2. Scope

### 2.1 Which surfaces (decision D1)

The capability record says the audit is surface-wide: "all 445 route-reachable pages" [S3]. Ali
Muwwakkil recommended starting with **the admin portal** [S4] **(Reported)**. That narrows the capability, so this
definition has to state it and Aleem has to sign it. Neither source defines "the admin portal" [S4].

- `frontend/src/routes/adminRoutes.tsx` holds 99 `<Route>` elements. Its 96 `path=` attributes all
  begin with `admin` [S5]. **(Verified)**
- Admin pages render shared components from outside `pages/admin/`. One is
  `components/timeline/CardDetailBody.tsx`, which the portal uses too [S6]. **(Verified)**

**Proposal for D1:** the first scope is **every source file reachable through imports from
`adminRoutes.tsx`, plus the stylesheets those files import**, minus the exclusions in 2.2.
- Each finding is tagged `admin-only` or `shared`.
- Shared findings are reported, but no substitution is proposed for them in the first release,
  because repainting a shared component also repaints non-admin pages.
- Widening to all 445 pages is a later decision with its own sign-off.

*Alternative Aleem may prefer:* only files under `pages/admin/` and `components/admin/`.

### 2.2 Which files (decision D8 for the vendored folder)

| Role | Files |
|---|---|
| **Contract, not scanned for violations** | `frontend/src/styles/tokens.css`; `frontend/src/colaberry/tokens/*.css` and `colaberry/styles.css`; the `:root` block of `brand-bridge.css` (lines 19–84) |
| **In scope** (inside the D1 scope) | `.tsx`, `.ts` and `.css` files, including `global.css`, `admin-shell.css`, `agentDetailV2.css`, `orchestration.css`, `rungTones.css` [S3], and **`brand-bridge.css` after line 84**. Those class rules contain literal colours, for example `--bs-btn-color: #fff;` at `:96` inside `.btn-primary` (also `:97`, `:98`, `:106`). Literals inside the `:root` block, such as `--bs-primary: #FB2832` at `:59`, are contract, not findings. (**Proposal**) |
| **Out of scope: owned upstream** | `apps/*/src/assets/design/`, owned by `design-system-sync.yml` [S3][S8]; **`frontend/src/colaberry/`** (the vendored DS, 92 files including the 20 components). **Proposal**, D8 |
| **Out of scope: not product paint** | test files (`__tests__/`, `*.test.ts(x)`), fixtures and mocks; `node_modules/` and build output (**Proposal**) |

**Why exclude `frontend/src/colaberry/`:** it is a copy of an upstream system. Fixing a colour
there would either diverge further from upstream or be overwritten by the next copy. That's the
same reasoning the story applies to `apps/*/src/assets/design` [S3].
**What is not settled:** the copy already carries local edits (1.3) that no upstream owns.
**Who owns those edits, and whether the folder should be excluded at all, is OQ5.**

### 2.3 Which values (decision D2)

The outcome names "a colour **or spacing** value" [S1].

**Proposal for D2:**
- **Colour: in scope from the first scan.** This covers hex (3, 4, 6 and 8 digit), `rgb()`,
  `rgba()`, `hsl()`, `hsla()` and named CSS colours. `transparent`, `currentColor`, `inherit`,
  `initial` and `unset` are not violations.
- **Spacing: in scope from the first scan,** for `padding*`, `margin*`, `gap`, `rowGap` and
  `columnGap` with a literal `px` or `rem` value. The first draft proposed not ratcheting spacing
  because "the scale has only 6 steps". **That was wrong.** The effective scale is the union of
  both layers (**Verified**):
  - DS (`spacing.css:8-21`): 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 and 128 px;
  - legacy: 0.25, 0.5, 1, 1.5, 2 and 3 rem. That is 4, 8, 16, 24, 32 and 48 px, **assuming a
    16 px root font size (Unknown, not verified)**. Every legacy step is also a DS step.

  With 14 steps and a 4 px grid (DS `BRAND.md:184`), spacing is ratcheted with colour, but as a
  **separate line** so the two numbers can be driven down independently.
- **Spacing values that match more than one token (Proposal, part of D3).** Because every legacy
  step equals a DS step, six values have two names each:

  | Value | DS name | Legacy name |
  |---|---|---|
  | 4 px | `--space-1` | `--space-xs` |
  | 8 px | `--space-2` | `--space-sm` |
  | 16 px | `--space-4` | `--space-md` |
  | 24 px | `--space-6` | `--space-lg` |
  | 32 px | `--space-8` | `--space-xl` |
  | 48 px | `--space-12` | `--space-2xl` |

  Unlike colour, these pairs share a meaning as well as a value: both are "a step on the spacing
  scale". So **the proposed rule is to prefer the DS name (`--space-N`)** and classify the match
  as `exact`. That gives the same answer as the colour rule (DS first), but needs no property
  role. If OQ2 or OQ3 is answered "legacy layer", this flips to the legacy name. Until D3 is
  signed, these matches are `exact-ambiguous`.
- **Zero values (Proposal, rule A6).** A plain `0`, with or without a unit (`0`, `0px`, `0rem`),
  in a spacing property is **not a violation**. `--space-0` exists (DS `spacing.css:8`), so
  without this rule every `padding: 0` and `margin: 0` would be reported as an `exact` match.
  Zero has no brand meaning to drift from, and replacing it with a token wouldn't change what
  renders.
- **Not in scope yet:** font sizes, radii, shadows, motion and z-index. They have tokens, but the
  outcome names only colour and spacing. Adding them later is a scope change.
- **Theme (Proposal):** classify against **light-theme** effective values. The DS also declares
  `[data-theme="dark"]` values, and some admin components touch `data-theme`
  (`VisitorSankeyFlow.tsx`, `journeyPalette.ts`). **Whether admin pages ever render dark is
  Unknown.** A value that matches only a dark-theme token is reported as `unclassified`, not as a
  match.

### 2.4 What an inline `style={{ }}` is

An inline style object is **not** a violation by itself. The frontend-design skill allows inline
`maxWidth`, `maxHeight`, `cursor` and `fontSize` [S9]. Only a colour or spacing value inside the
object counts. So the 8,219 figure [S2] counts style objects, not violations, and must never be
reported as one.

---

## 3. What counts as a violation

A **violation** is a colour or spacing literal (2.3), in an in-scope file (2.2), used as a styling
value, and not covered by an allow-list rule (section 4).

"Used as a styling value" means one of:
- a CSS declaration value;
- a value in a JSX `style={{ }}` object;
- a value passed to a styling prop (`color`, `fill`, `stroke`, `background`, `bg` and similar);
- a value in a constant whose values reach one of the above.

The platform's rules forbid these (`frontend/CLAUDE.md:35`, `:41` [S10][S11]; the
frontend-design skill [S9]). The DS upstream says the same (`BRAND.md:149-150`).

**Using a legacy token name is not a raw literal, so it is not a violation under this
definition.** Whether it should be counted at all is OQ4 (3.4).

### 3.1 Normalisation, before any comparison

- Every token is resolved to its **effective light-theme value** through the three layers,
  following `var()` chains.
- Hex is compared case-insensitively, and 3/4-digit hex is expanded.
- `rgb(r, g, b)` equals the hex with the same channels. Alpha must match exactly for an exact match.
- `rem` converts to px at 16 px per rem (an **assumption**, see 2.3).
- **A `var(--token, #hex)` fallback (Proposal):** it is not a violation if the fallback equals the
  token's effective value. If it differs, it is reported as `stale-fallback`. *Hypothetical
  example:* `var(--color-primary-light, #C20E1E)` would be stale, because the effective value is
  `#FD5760`.

### 3.2 Classification: a closed set of six outcomes

| Outcome | Meaning | Gets a proposed substitution? |
|---|---|---|
| `exact` | The effective value equals exactly one token, **or** the signed precedence rule (D3) picks one | **Yes**, `raw -> var(--token)` |
| `exact-ambiguous` | Two or more tokens match and no signed rule picks one | No. All candidates are listed |
| `near` | Within the D4 threshold of a token, but not equal | No. Candidate and distance listed |
| `gap` | No token within the threshold | No. Escalated as a design decision (section 5) |
| `allow-listed` | Covered by a signed rule in section 4 | No. The rule ID is recorded |
| `unclassified` | The classifier couldn't decide (parse error, dynamic value, dark-only match, unclear context) | No. **Counted as drift, never as a pass** [S1] |

### 3.3 Value collisions across the contract (decision D3, OQ3)

The first draft listed 11 colours shared by two names inside `tokens.css`. Measured across the
effective cascade, the collision is much wider (**Verified**, 2026-10-30):

- **69 distinct hex values** are the effective value of at least one token name.
- **32 of those 69 are shared by two or more names.**

**Both figures are minimums.** They count only tokens whose effective light-theme value is a
single hex colour. Not counted:
- 3 colour tokens that resolve to `rgba()` or `color-mix()`: `--color-purple-bg`,
  `--status-violet-bg`, `--status-teal-bg`;
- colours embedded in composite tokens such as shadows and `--focus-ring`;
- dark-theme values.

A scan that resolves those too may find more collisions.

The widest:

| Effective value | Names | Examples |
|---|---|---|
| `#FB2832` | 10 | `--color-primary`, `--cherry`, `--red-500`, `--brand-primary`, `--brand-accent`, `--action-bg`, `--surface-brand`, `--border-brand`, `--chart-2`, `--bs-primary` |
| `#367895` | 9 | `--color-info`, `--berry`, `--blue-500`, `--status-info`, `--border-focus`, `--chart-1`, `--seq-5`, `--bs-info` … |
| `#E5121D` | 8 | `--color-secondary`, `--color-danger`, `--cherry-text`, `--red-600`, `--status-danger`, `--activity-red` … |
| `#5BA63C` | 8 | `--color-accent`, `--color-success`, `--leaf-action`, `--green-600`, `--status-success`, `--chart-3` … |
| `#FFFFFF` | 8 | `--color-bg`, `--neutral-0`, `--surface-page`, `--surface-card`, `--text-on-accent` … |
| `#6B6B6B` | 6 | `--color-muted`, `--color-text-light`, `--neutral-600`, `--text-muted`, `--chart-8` … |

These names share a value but not a meaning: `#FB2832` is a button background, a border, a brand
colour and a chart series. A tool cannot tell from the value which one the author meant.

**Consequence:** without a precedence rule, nearly every on-brand colour is `exact-ambiguous`, and
the substitution patch would be close to empty. **The precedence rule is the main decision in this
definition, not a detail.**

**Proposal for D3:** a fixed precedence order, applied only when the property tells the classifier
the role:
1. **DS semantic tokens first**, matched by property. Text properties prefer `--text-*`;
   backgrounds `--surface-*`, `--status-*-bg` or `--action-*`; borders `--border-*`. The DS
   upstream says this three ways:
   - `tokens/colors.css:93`: "Reference these in product code, never the raw ramps.";
   - `BRAND.md:149-150`: "Always use **semantic tokens** … rather than raw ramp values.";
   - `IMPLEMENTATION.md:8` and `:118`: "semantic tokens, never raw hex".
2. **If no semantic token of that role matches:** `exact-ambiguous`. Ramp names (`--red-500`),
   legacy names (`--color-*`), the Design E names (`--cherry`) and Bootstrap names (`--bs-*`) are
   **never** proposed automatically.
3. **Chart tokens** are proposed only under the dataviz rule (A1).

**Who decides this:** Aleem for the brand question. Possibly also Ali, because choosing the DS
names for admin code effectively retires the legacy layer, and that is an architecture direction
(OQ2/OQ3).

### 3.4 Legacy token references (decision D9, OQ4)

The V2 public code forbids legacy names (`caseStudyTokens.test.ts:7-9`). The admin code still uses
them, and the bridge makes them render DS values.

**Proposal for D9:** count `var(--<legacy-only name>)` references as a **separate, informational
line**: not drift, not ratcheted. A legacy-only name is one that `tokens.css` declares and the DS
layer doesn't. If the answer to OQ2/OQ4 is that the DS layer is the contract, this line becomes
the migration backlog.

### 3.5 Design E drift from the DS (Verified; not scanned)

The "Design E" block in `tokens.css` (lines 75–115) copies DS values under other names, and has
drifted from them:
- `--amber-bg` is `#FDF4E6`, but DS `--amber-50` is `#FCF1DD` (upstream `colors.css:63`);
- `--amber-text` (`#B5710A`) has no DS equivalent.

A raw `#FDF4E6` therefore matches a legacy token but not the DS. Under D3 it would be
`exact-ambiguous` or `gap` depending on OQ2. This is a token-set question for section 5, not a
code defect.

### 3.6 "Near" threshold (decision D4)

**Proposal for D4:** a colour is `near` a token when the CIEDE2000 difference is **≤ 2.0** and
alpha matches. Near matches are never auto-substituted [S1]. Spacing has no "near": a value is
either on the 2.3 scale (`exact`, or `exact-ambiguous` for the six two-name values until D3 is
signed) or a `gap`. Zero is covered by A6.

---

## 4. Exception list (allow-list), decision D5

No agreed allow-list exists [S2]. Each rule needs Aleem's tick before it counts. A struck rule is not
applied, and its occurrences are reported.

| ID | Rule | Why | Source |
|---|---|---|---|
| **A1** | **Data visualisation. Revised.** Colour literals passed to chart elements (`recharts` [S12]) are **classified, not excluded**. They're matched against the DS chart palette (`--chart-1…8`, `--seq-1…6`, `--div-*`, upstream `colors.css:74-89`), which `BRAND.md:153-154` says charts must use. They are counted in a **separate dataviz line, outside the ratcheted drift count**, until OQ6 is answered. A chart literal that matches no chart token is reported as a dataviz gap. Whether it's decided under D7 or by `dataviz_quality_audit` depends on OQ6. | The first draft assumed chart colour sat outside the token contract. The DS defines chart tokens, so it doesn't. But the dataviz capability says chart palettes "are governed by the dataviz guidance, not by the product token set" [S13], and whether that guidance *is* this palette is unknown. | [S3][S13], DS `BRAND.md:153-154` |
| **A2** | **Brand marks.** Fills and strokes inside named logo and brand-mark components. **The file list is Aleem's to supply.** Nothing is excluded under A2 until it is named. | The brand rule says "Never recolor the cherries" (DS `BRAND.md:135`). Logo colours are fixed, not UI tokens. | [S3] |
| **A3** | **Code samples and documentation strings.** Literals in comments, doc text and example code shown to the user. | They don't paint the UI. | [S3] |
| **A4** | **Upstream-owned design folders:** `apps/*/src/assets/design/` and, **under D8**, `frontend/src/colaberry/`. Excluded entirely (2.2). | Owned upstream. Rewriting them here diverges from, or is overwritten by, the source. | [S3][S8], 1.3 |
| **A5** | **Neutral keywords:** `transparent`, `currentColor`, `inherit`, `initial`, `unset`. | Not colour values. | Proposal |
| **A6** | **Zero spacing:** `0`, `0px`, `0rem` in a spacing property (2.3). | Zero has no brand meaning, and tokenising it wouldn't change what renders. Without this rule `--space-0` (DS `spacing.css:8`) would turn every `padding: 0` into a finding. | Proposal |

**A case that needs Aleem's ruling (decision D6):** HTML and CSS built as strings for a preview frame,
for example the `frameHtml` helper in `studioKit.tsx` [S14]. Until Aleem rules, these occurrences are
`unclassified` and count as drift.

**Who keeps the list up to date** is open (interview Q6's follow-up [S15]). **Proposal:** every
change to A1–A6 is a new entry here, signed by Aleem.

---

## 5. Token-set gaps, and who decides them (decision D7)

A raw colour with no token equivalent is **a token-set gap, not a code defect**. It is escalated as
a design decision, never auto-substituted [S1].

**Proposal for D7:** Mohammed Abdul Aleem decides every gap, in line with Ali's recommendation
that design approvals and brand design systems stay human-controlled [S4]. Gaps are reported
grouped by value with counts and files. For each one Aleem picks one of:
1. add a token;
2. map it to an existing token;
3. add an allow-list rule.

**Revision 2 adds one constraint:** a new token now has to go into a specific layer. Adding it to
the DS layer means either changing upstream (owned by the design-system repository) or adding
another local edit to the vendored copy (OQ5). Adding it to `tokens.css` grows the layer the V2
code calls "older". **Where new tokens go depends on OQ1, OQ2 and OQ5.**

---

## 6. Outputs the first scan will produce (once R0 is signed)

1. **A ranked violation inventory by file.** Each finding has file, line, raw value, normalised
   value, outcome (3.2), candidate token(s) with the layer each comes from, and the `admin-only` /
   `shared` tag. **A finding without file and line is a defect.**
2. **A substitution proposal for `exact`, `admin-only` findings only.** This is a patch file that
   is not applied, not committed and not pushed. A human merges and deploys it, because both
   `push_to_protected_main` and `production_deploy` are default-denied [S2].
3. **A drift count shaped like the copy-lint baseline:** a per-file map of exact counts that can
   only go down, with a zero entry deleted [S16]. There are two ratcheted lines:
   - **colour drift** = `exact` + `exact-ambiguous` + `near` + `gap` + `unclassified`;
   - **spacing drift**, made up the same way.

   Two lines are reported but not ratcheted: **dataviz** (A1) and **legacy references** (D9).
4. **A gap list for Aleem** (section 5), with unknown values left as unknown [S1].
5. **A denominator on every count:** "N findings across F of M in-scope files scanned".
6. **A contract snapshot:** the per-layer declaration counts and the effective value of every token
   used in classification, so a reviewer can check a finding against the contract as it was at
   scan time.

---

## 7. Dependency checks and stop conditions

Each condition becomes a negative test before any tool is granted.

### 7.1 Before the scan: the contract must be the one this definition describes

| Check | Expected (measured 2026-10-30) | If it fails |
|---|---|---|
| All contract files exist and their `:root` blocks parse | `tokens.css`, 5 DS token files, `brand-bridge.css` | **Stop.** No inventory, no count, no "clean". |
| Per-layer `:root` declaration counts | legacy **101**, DS **215**, bridge **43** | **Stop** and report the new counts. The contract changed, so classification may be stale. |
| Load order in `index.tsx` | `global.css` (:22) before `colaberry/styles.css` (:24) before `brand-bridge.css` (:25) | **Stop.** A reordered cascade changes every effective value. |
| Import chain | `global.css:1` imports `tokens.css`; `colaberry/styles.css:6-10` imports the five DS files | **Stop.** |
| Every `var()` in the contract resolves | No unresolved reference. **Measured 2026-10-30: 0 unresolved** across the light-theme `:root` blocks of the seven contract files [S26] | **Stop** and list the unresolved names. |
| Vendored DS against the upstream named in OQ1 | Known today: `colors.css`, `spacing.css`, `fonts.css` differ (1.3) | **Report, don't stop.** Any change from the known differences is listed in the output. |

### 7.2 During and after the scan

| Condition | Required behaviour |
|---|---|
| An in-scope file can't be read or parsed | List it under "not scanned"; the run is **incomplete**, never clean |
| Zero in-scope files found | Report "0 of 0", never "no violations" |
| A finding lacks file or line | Treat it as a scanner defect and fail the run |
| A substitution names a token not in the contract snapshot | Fail the run (this catches an invented step like `--space-7`, as `caseStudyTokens.test.ts` describes) |
| A substitution is proposed for any finding that is not both `exact` and `admin-only`, or for a vendored-folder file | Fail the run |
| Any attempt to apply, commit or push the patch | Forbidden. The audit only proposes [S1] |

---

## 8. Open questions, and the working decisions that keep the work moving

**Why this section has working decisions.** Ali Muwwakkil gave this guidance in an email to
Mihret Netsereab dated 2026-10-27 [S27] (**Reported**: relayed by Mihret on 2026-10-30; the email
is not in this repository):
- don't wait indefinitely for the manager;
- when a manager hasn't responded, make the decision, document the assumption and the decision
  next to the question, and continue;
- mark those decisions as the preparer's, not the manager's;
- the meeting with Aleem reviews the reasoning. It doesn't block preparing the work.

So each open question below keeps three things separate:
- **Mihret's working decision**: made by Mihret Netsereab so the work can continue. It is **not**
  Aleem's approval and **not** platform policy.
- **Ali's advice**: technical input where Ali is placed to give it. **None has been received for
  these questions yet.**
- **Aleem's approval**: **pending on every row.**

**What a working decision can and cannot do** (Mihret's working decision, following [S27]):
- It **can** be used to prepare work: refining this definition, designing the scan and its
  negative tests, and starting the next capability's R0 definition.
- It **cannot** satisfy the R0 criterion, start the scan, change the product, or settle a brand
  outcome such as repainting or adding a token. The criterion names Aleem's sign-off and says
  no scan runs before it [S1]. Ali's Q3 answer keeps design approvals and brand design systems
  human-controlled [S4], and this document treats those as Aleem's call.
- If Aleem changes a working decision, Aleem's answer replaces it and the change goes in the
  [sign-off record](#sign-off-record).

| # | Question | Why it matters | Blocks | Mihret's working decision, and why | Ali's advice | Aleem's approval |
|---|---|---|---|---|---|---|
| **OQ1** | Is `Colaberry-DS-School-Final` or `colaberry-design-system` the canonical upstream? Their tokens are identical today, but the platform's history names the second (`PROGRESS.md:7364`). | Decides what the vendored copy is checked against (7.1) and where new tokens go (5) | 7.1, D7 | **Use `Colaberry-DS-School-Final` as the reference for the 7.1 divergence check.** It's the repository Aleem shared, and its token files are byte-identical to the other one today (1.3), so the choice changes no value. Revisit if the two ever differ. | Not needed. Both repos are under the `aleemcolaberry` account. | **Pending** |
| **OQ2** | Which token set is the audit's contract: the effective three-layer cascade, the DS layer only, or `tokens.css` only? | Every classification depends on it. Today's platform rules disagree (1.4) | Everything in 3–7 | **The effective three-layer cascade** (1.4). It's what renders (1.1–1.2). Either single layer would misclassify values the bridge reassigns. | **Requested:** whether retiring the legacy layer is the platform's direction. | **Pending** (D0) |
| **OQ3** | When a fix is proposed for admin code, should it name a DS semantic token (`--text-muted`) or a legacy name (`--color-text-light`)? | Decides the D3 precedence order, and so whether the patch is near-empty | D3 | **Colour: a DS semantic token chosen by property role, otherwise `exact-ambiguous`. Spacing: the DS `--space-N` name** (3.3, 2.3). The DS says to use semantic tokens [S24], the admin shell already reads DS tokens (1.4), and the fix list stays small enough to review. | **Requested:** legacy names or DS names for admin code. | **Pending** (D3) |
| **OQ4** | Does a remaining reference to a legacy-only token name count as drift? | Decides whether D9 stays informational or becomes ratcheted | D9 | **No. It's counted as a separate informational line, not ratcheted** (3.4). Through the bridge, most legacy names render DS values, so they aren't visual drift, and ratcheting them would be a migration decision this audit shouldn't make. | **Requested:** whether legacy names should be migrated at all. | **Pending** (D9) |
| **OQ5** | Who owns the local edits in `frontend/src/colaberry/`, and should that folder be excluded like `apps/*`? | Decides D8, and whether gaps can be fixed by editing the vendored copy | D8, D7 | **Exclude the folder from the inventory** (2.2). It's a copy of an upstream system, for the same reason the story excludes `apps/*`. **Who owns the local edits stays Unknown.** Code ownership isn't something Mihret can decide. | **Requested:** who maintains the vendored copy's local edits. | **Pending** (D8) |
| **OQ6** | Is the DS chart palette (`--chart-*`, `--seq-*`, `--div-*`) the "dataviz guidance" the `dataviz_quality_audit` capability refers to? | Decides whether A1's dataviz line joins the ratcheted count | A1 | **Classify chart literals against the DS chart palette, and keep them in the separate dataviz line outside the ratchet** (A1). The DS says charts use this palette [S24]. Keeping them outside the ratchet means a wrong assumption adds no false drift. | **Requested:** who owns product-surface charts (the dataviz capability lists this as unknown). | **Pending** (A1, under D5) |

---

## Sign-off

**Not signed. Aleem's approval is pending on every decision.** Mohammed Abdul Aleem remains the
accountable manager. Only a formal change by whoever owns the capability record could change that,
and who that is is **Unknown**. Ali Muwwakkil's recommendations [S4] and guidance [S27], and
Mihret's working decisions (§8), are inputs to this sign-off, not a substitute for it.
D0, D3, D5 (A1), D7, D8 and D9 depend on the open questions in §8, so Aleem can answer each
question and its decision row together.

### How to review and sign this without portal access

- **No admin portal access is needed.** Aleem can review this file, or the decision table below,
  by email, in a meeting, or both.
- **What counts as evidence (Mihret's working decision):** Aleem's own written words, with a date,
  either as an email reply or as meeting notes that Aleem has confirmed in writing (for example
  by replying "confirmed" to the notes). A meeting without written confirmation doesn't count,
  because the story's evidence rules exclude "a conversation that went well" [S1].
- **Suggested reply format:** "D0 agree; D1 change: …; D5: A1, A3, A4, A5, A6; A2 files: …".
- **Partial sign-off is allowed (Mihret's working decision):** each decision is recorded as it
  arrives. The R0 criterion passes only when every row D0–D9 has a recorded decision from Aleem.
- **Every reply is copied into the sign-off record** with its date in Central time, the channel,
  and where the original is kept.
- **Unknown:** whether the platform accepts an email copied into this repository as evidence for
  the criterion. The story's evidence rules suggest a written, dated decision qualifies, but no
  source says so outright.

### Decisions

| # | Decision | Mihret's working decision (in effect for preparation only) | Ali can advise on | Aleem's approval (pending) |
|---|---|---|---|---|
| D0 | The token contract (OQ2) | Effective three-layer cascade (1.4) | Whether the legacy layer is being retired | ☐ agree ☐ DS only ☐ `tokens.css` only |
| D1 | Which surfaces | Files reachable from `adminRoutes.tsx`; shared files reported, not patched | Already recommended the admin portal (**Reported**, [S4]) | ☐ agree ☐ change: ______ |
| D2 | Which values | Colour and spacing, ratcheted separately; light theme only | Whether admin pages ever render dark; the root font size behind the rem assumption | ☐ agree ☐ change: ______ |
| D3 | Same value, several tokens (OQ3) | Colour: DS semantic token by property role, else `exact-ambiguous`. Spacing: DS `--space-N` | Legacy or DS names for admin code | ☐ agree ☐ other order: ______ |
| D4 | "Near" threshold | CIEDE2000 ≤ 2.0, alpha equal | (none) | ☐ agree ☐ value: ______ |
| D5 | Allow-list rules A1–A6 | A1, A3, A4, A5 and A6 as listed. **A2 stays empty: nothing is excluded as a brand mark until Aleem names the files** | Product-surface chart ownership (A1, OQ6) | ☐ A1 ☐ A2 (files: ______) ☐ A3 ☐ A4 ☐ A5 ☐ A6 |
| D6 | Styles built as preview strings | `unclassified` until ruled | How `frameHtml` output is used | ☐ in scope ☐ allow-list as A7 |
| D7 | Who decides gaps and keeps the list | Aleem decides gaps. Until then, gaps stay open in the drift count | (none) | ☐ agree ☐ name: ______ |
| D8 | Vendored `frontend/src/colaberry/` (OQ5) | Excluded, upstream-owned. Owner of the local edits Unknown | Who maintains the local edits | ☐ agree ☐ in scope |
| D9 | Legacy token references (OQ4) | Counted, informational, not ratcheted | Whether legacy names should be migrated | ☐ agree ☐ ratchet ☐ ignore |

The scan's technical mechanics, the normalisation rules (§3.1), the outputs (§6) and the stop
conditions (§7), are also Mihret's working decisions. Ali can advise on them. Aleem can review
them, but they have no separate row.

### Sign-off record

| Date (Central) | Channel | Decisions covered | Aleem's words (quote, or a summary Aleem confirmed) | Where the original is kept | Recorded by |
|---|---|---|---|---|---|
| (none) | (none) | (none) | *No response recorded yet.* | (none) | (none) |

When every row D0–D9 has a recorded decision from Aleem, the R0 criterion in
`.colaberry/progress.json` can be set to `passed: true`, citing this file and the sign-off record.
**Not before. Working decisions never count toward it.**

### If approval is delayed (Mihret's working decision, following [S27])

1. **Day 0:** Mihret emails Aleem a short summary, a link to this file and the decision table, and
   asks for a reply within **5 business days**. Partial answers are welcome, and a 20-minute call
   is offered as an alternative. Working decisions are in effect for preparation from day 0.
2. **Day 5:** one reminder, with a new date **3 business days** out.
3. **Day 8, no reply:** Mihret informs Ali (DRI) of the status and the working decisions taken, and
   asks Ali to choose one of:
   - (a) follow up with Aleem;
   - (b) formally designate an interim approver;
   - (c) confirm that preparation continues while approval is pending.

   Ali's answer is recorded as Ali's direction, not as Aleem's approval.
4. **Throughout:** the scan stays blocked and the criterion stays `passed: false`. Escalation never
   substitutes for sign-off. Only Aleem's recorded decisions, or a formal change by whoever owns
   the capability record (**Unknown**), can satisfy it. **Unknown:** whether Ali wants to be named
   in writing as the escalation point.

### Still blocked even after sign-off (not resolved by this document)

- No AI employee is provisioned for this domain (`agent_id` is null) [S2].
- Aleem has no admin login [S2]. That doesn't block sign-off (see
  [How to review and sign this without portal access](#how-to-review-and-sign-this-without-portal-access)),
  but Aleem still can't open the agent's surfaces once the agent exists.
- Moving past R0 needs a trust threshold (interview Q5), which hasn't been asked yet [S15].
- The capability's dependency "tokens.css remaining the single token authority" [S3] is not met
  (1.4). The capability record should be corrected by whoever maintains it. This document does
  not edit it.

---

## Sources

Platform paths are in `ColaberryEnterprise_AI_LeadershipAccelerator` at `c96f6a68`. "DS upstream"
means `aleemcolaberry/Colaberry-DS-School-Final`, read through the GitHub API on 2026-10-30.

| ID | What | Where |
|---|---|---|
| S1 | Outcome, workflow, exceptions, R0 criterion | This repo: `docs/stories/product_experience.CAP.design_token_drift_audit.md` |
| S2 | Blockers and the 2026-10-09 raw counts | Same file, "Blocked by" |
| S3 | Surface-wide scope, source modules, exceptions, dependency on `tokens.css` | Same file, "How to build it" |
| S4 | Ali Muwwakkil's Q1–Q4 recommendations (Reported) | This repo: `docs/discovery/04-manager-interview.md`, "Responses received" |
| S5 | 99 `<Route>`; 96 `path=` all under `admin` | Platform: `frontend/src/routes/adminRoutes.tsx` |
| S6 | Shared component cited as capability evidence | Platform: `frontend/src/components/timeline/CardDetailBody.tsx:1` |
| S7 | Legacy layer, 101 `:root` declarations; Design E block | Platform: `frontend/src/styles/tokens.css:6`, `:75-115` |
| S8 | Vendored brand design dirs; sync workflow and its brand list | Platform: `apps/*/src/assets/design/`, `.github/workflows/design-system-sync.yml`, `backend/src/scripts/lib/designSystemSync.js:44-88` |
| S9 | Inline-style allowance; "Hardcode colors" under Don't | Platform: `.claude/skills/frontend-design/SKILL.md:157-158` |
| S10 | "Never hardcode hex values; use `var(--color-*)`" | Platform: `frontend/CLAUDE.md:35` |
| S11 | "never inline styles with hex values" | Platform: `frontend/CLAUDE.md:41` |
| S12 | `recharts` is the chart dependency | Platform: `frontend/package.json:28` |
| S13 | "Chart palettes are governed by the dataviz guidance, not by the product token set" | This repo: `docs/stories/product_experience.CAP.dataviz_quality_audit.md:55` |
| S14 | `frameHtml` builds preview HTML as a string | Platform: `frontend/src/pages/admin/orchestration/studio/studioKit.tsx:51` |
| S15 | Interview Q5 and Q6 not yet asked | This repo: `docs/discovery/04-manager-interview.md` |
| S16 | Copy-lint baseline: exact per-file, shrink-only | Platform: `backend/src/services/content/frontendCopyBaseline.ts:15` |
| S17 | CSS load order | Platform: `frontend/src/index.tsx:22-26`; `frontend/src/styles/global.css:1`; `frontend/src/colaberry/styles.css:6-10` |
| S18 | Bridge reassigns legacy names; "imported LAST … win every name collision" | Platform: `frontend/src/styles/brand-bridge.css:10-14`, `:19-84` (e.g. `:23`, `:33`, `:59`) |
| S19 | "TWO TOKEN SYSTEMS"; `tokens.css` is "older, competing" | Platform: `frontend/src/components/caseStudy/__tests__/caseStudyTokens.test.ts:7-9` |
| S20 | Admin shell uses DS tokens only; V2 public site resolves to DS tokens only | Platform: `frontend/src/styles/admin-shell.css:4`; `frontend/src/components/publicV2/publicV2.css:4-6` |
| S21 | `tokens.css` named as source of truth | Platform: `.claude/skills/baseline-ui/SKILL.md:11` |
| S22 | Vendored DS: three files identical to upstream, three with local edits | Platform: `frontend/src/colaberry/` (hash and diff against DS upstream) |
| S23 | DS chart palette; amber values; spacing scale | DS upstream: `tokens/colors.css:62-63`, `:74-89`; `tokens/spacing.css:8-21` |
| S24 | Semantic tokens rather than raw ramps; chart palette rule; never recolour the mark; 4 px grid; "never the raw ramps"; "never raw hex" | DS upstream: `BRAND.md:149-150`, `:153-154`, `:135`, `:184`; `tokens/colors.css:93`; `IMPLEMENTATION.md:8`, `:118` |
| S25 | Two upstream repos with identical token files; platform history names `colaberry-design-system` | GitHub API blob hashes (2026-10-30); platform `PROGRESS.md:7364`; `apps/ai-flotation-public/src/assets/design/DESIGN_SYSTEM.md:11` |
| S26 | Effective-cascade figures: 330 names; 69 distinct hex values and 32 shared (both minimums: 3 `rgba()`/`color-mix()` colour tokens not counted); 21 + 6 legacy names reassigned; 0 unresolved `var()` references | Computed 2026-10-30 by resolving the light-theme `:root` blocks of the contract files in S17 (no application code read) |
| S27 | Ali Muwwakkil's guidance on not waiting indefinitely and on documenting the preparer's own decisions (**Reported**) | Email from Ali Muwwakkil to Mihret Netsereab dated 2026-10-27, as relayed by Mihret on 2026-10-30. Not in this repository |

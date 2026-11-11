# STORY-000 traceability: criterion and panel to screen and evidence

**For:** Mohammed Abdul Aleem's review of the live console at real widths. **Prepared:** 2026-11-03,
session CC-20261102-1whf. Criteria text: [docs/stories/STORY-000.md](../stories/STORY-000.md).

**Screens:**
- `/` is the console. Run it locally with `python -m http.server 8000` from the repository root.
- `#/panel/<id>` jumps to one panel.
- `#/capability/<id>` and `#/rung/<stage>` are the detail pages.

**Every test named below passes.** `node --test tests/*.test.mjs`: 197 of 197 on 2026-11-10, after the
changes to Panels 1, 2 and 6 and the privacy wording corrections (174 before; 19 new in
`tests/panels-1-2-6.test.mjs`, 4 new in `tests/public-privacy.test.mjs`).

**Screenshots** are in [screenshots/](screenshots/), re-captured by `tests/evidence/capture-evidence.mjs`
at 9:46 PM CST on 2026-11-10, after the privacy wording corrections (platform sync of 2026-11-04), with Aleem's three required changes applied
(design-system colours, the brief's order, disclosures in place, light theme only), the 320 px reflow fix,
and the 2026-11-10 changes to Panels 1, 2 and 6. They replace the 2026-11-09 captures, which predate those
panel changes. Widths: narrow 320 px, phone 390, tablet 820, desktop 1440.

| Capture | Files |
|---|---|
| The console at each width (light only) | `console-<width>-light.png` |
| One Panel 2 disclosure opened in place, at tablet and desktop width: the other panels keep their columns | `console-tablet-light-one-open.png`, `console-desktop-light-one-open.png` |
| The console at desktop width with every disclosure open | `console-desktop-light-expanded.png` |
| One capability's detail page, at phone and desktop width | `capability-detail-<width>-light.png` |
| Every panel in every state | `state-*.png` ([state matrix](state-matrix.md)) |

**Accessibility:** [a11y/README.md](a11y/README.md): every axe rule at four widths, the keyboard
walkthrough, a reflow check of every page at 320 px, and the limits of what automated checks can show.

## The six acceptance criteria

| # | Criterion (short) | Screen | Evidence |
|---|---|---|---|
| 1 | All six panels render, and each names the endpoint it read | `/`: the "Reads:" line at the foot of every panel | Tests `console.test.mjs`: "six panels render in the brief order, each numbered with its brief panel number", "criterion 1: each panel names, as whole tags, every endpoint the brief assigns it". Code `agent-domain-facts.js:20` (`PANEL_ENDPOINTS`). Screenshots `console-*.png` |
| 2 | An endpoint that returned nothing says so in words, distinct from loading | `/` Panels 1 and 5 with neither a snapshot nor the platform sync: "Not available" chip, dashed amber border, Missing / Waiting for / Will show | Tests `console.test.mjs`: "today, with no snapshot…", "criterion 2: a loading panel says Loading…", "a refused capture is an error…", "an empty governance queue says so". [State matrix](state-matrix.md): `state-loading.png` beside `state-today.png` |
| 3 | All ten rungs in the owner's wording; each ceiling marked against its rung | `/` Panel 3: "The ten rungs, in the owner's words", with "Ceiling for N of 25" marks; the grid in "Each capability against the ladder" | `agent-domain-authority.test.mjs` (ladder wording); `agent-domain.test.mjs` (ladder cells). Code `panel-ladder.js:65` (`rungList`), `:20` (`ladderGrid`). Screenshots `console-desktop-*.png`, `console-desktop-*-expanded.png` |
| 4 | Authority as `effectiveAuthority()` returns it; the `no_tool_grants` rule named with the number it constrains, in words when zero | `/` Panel 3: the headline "autonomy:R0 for all 25: Starting rung — no human approval yet." and "Tool-grant cap in force; constrains nothing today: it holds 0 of 25 capabilities." Detail page: the Authority facts and the labelled hypothetical | Tests `agent-domain-tool-rule.test.mjs`, all 8, including Aleem's test "approved above R2 with no tool grants: effectiveAuthority() returns R2 with no_tool_grants". Code `agent-domain-facts.js:97` (wording), `agent-domain-model.js:80`, `:116`, `:132`, `panel-ladder.js:36`, `details.js:34`. Screenshots `capability-detail-*.png` |
| 5 | Nothing implies that filing a tool request granted anything | `/` Panel 5: the headline "Filing a request grants nothing…"; the "Grants: Nothing: a request is not a grant" column; "Tools granted to the agent" says "Not captured" unless the endpoint records the grants | Code `panel-governance.js:36`. `state-captured-data.png` shows a filed tool request (fixture) |
| 6 | Trust: no number, grant, rung or result the domain has not produced | Every value carries a source tag; Panel 6 lists the gaps; placeholders are labelled | Tests `agent-domain.test.mjs` "no console module imports a sample data generator", "with no approval recorded, authority is … autonomy:R0, never the ceiling"; `agent-domain-employee.test.mjs` (a field is shown only when the endpoint returned it); `agent-domain-redact.test.mjs` (nothing that identifies another person); `agent-domain-link.test.mjs` (9 tests: whether an agent is linked comes from the live endpoint, never the registry seed; nothing claims "no agent exists"); `record-id-exposure.test.mjs` (4 tests: no page a visitor can reach, 42 in all, shows a UUID-shaped record id; the staff member's `org_members` id in the research file's blocker is shown as "[record ID withheld]") |

## Aleem's decisions of 2026-11-03

| Decision | Screen | Evidence |
|---|---|---|
| R0 labelled "Starting rung — no human approval yet"; never "None" | Panel 3 headline and "Each capability's authority"; detail page "Human approval" | `agent-domain-tool-rule.test.mjs`: "today, on the real file…", "console ladder panel: Aleem's wording, never None" |
| "Tool-grant cap in force; constrains nothing today" | Panel 3 glance and rule block; detail page "What holds it back" | Same tests |
| Same wording on the console and the detail page | Both screens use `authorityView()` (`agent-domain-model.js:116`) | `agent-domain-tool-rule.test.mjs`: "detail page: the same wording as the console…" |
| The hypothetical R2 cap on each detail page | `#/capability/<id>`: the dashed box "Hypothetical: not an approval, not data" | Same test, for an R5 and an R2 ceiling; `capability-detail-*.png` |
| A test with an approved level above R2 and no tool grants | n/a | `agent-domain-tool-rule.test.mjs`, test 3, with a control (test 4) |
| Live data never implies the rule fires | Panel 3: "holds 0 of 25" | Test 2 checks that no real row returns `no_tool_grants` |
| Six panels replace nine tabs; not side by side | `/`: no tab bar | `console.test.mjs`: "content from the old tabs is carried into the panels, and the tabs themselves are gone". [README content inventory](../../README.md#content-inventory-the-nine-tabs-mapped-to-six-panels) |
| Ordered by what the operator needs first | Superseded on 2026-11-09: the brief's order is restored (see below) | [Proposal for the brief's owner](panel-order-proposal.md) |
| One primary action per panel | The red button in each panel | `console.test.mjs`: "every panel has exactly one primary action, and every disclosure starts collapsed" |
| Long details in collapsed disclosures | The blue "▸" rows under each panel | Same test; `console-desktop-*-expanded.png` shows them open |
| "Not available" states (missing, waiting for, will show, next action) | Panels 1 and 5 when nothing is captured or synced | `console-ui.js:36`; `console.test.mjs` "today, with no snapshot" |
| Evidence: screenshots, state matrix, axe, keyboard, inventory, rationale | n/a | This folder |

## Aleem's review of PR #1, 2026-11-08: the three required changes

| Required change | Screen | Evidence |
|---|---|---|
| 1. Use the Colaberry design system; correct filled-button contrast | Every screen: design-system colours and type families; the red buttons are `--red-600` (#E5121D) | Token files pinned at `9b8a6ec6` in `command-center/vendor/colaberry-ds/`, recorded in `command-center/sources/SOURCES.json`. `design-system.test.mjs` (10 tests: blob hashes, no colour written outside the tokens, every token defined, AA on every text pair, button 4.73:1, light only, no state-dependent placement). Browser: [review-corrections-check.json](review-corrections-check.json), rendered button `rgb(229, 18, 29)` with white text at 4.73:1, axe colour contrast 0 violations at 390 and 1440 px, disclosures closed and open; the full axe rule set finds 0 WCAG A/AA violations in 17 runs ([a11y](a11y/README.md)) |
| 2. Keep the brief's panel order | Panels numbered 1 to 6 as the brief numbers them | `console.test.mjs`: "six panels render in the brief order, each numbered with its brief panel number". The case for another order: [panel-order-proposal.md](panel-order-proposal.md) |
| 3. Opening a disclosure must not move the other panels | Any disclosure, any width | [review-corrections-check.json](review-corrections-check.json): 80 disclosure openings at 320, 390, 820 and 1440 px, 0 failures. Each opening is checked for: no other panel changes column or width, panels in earlier rows do not move, the content stays inside its panel, and no table word is split across lines. Before the fix: 40 failures at 820 and 1440 px (panels moved). `console-*-one-open.png` shows it. `design-system.test.mjs`: "no rule changes a panel's grid placement depending on an open disclosure" |

## Mihret's decisions of 2026-11-10: Panels 1, 2 and 6 against the committed snapshot

Platform engineering contact's direction: keep using the committed platform snapshot, add no new route, and continue
Panels 1, 2 and 6 while the platform extends its capability projection for Panels 3, 4 and 5. Those
three panels were not changed.

| Decision | Screen | Evidence |
|---|---|---|
| D1. Panel 1 shows the brief's employee fields at a glance; the registry seed value and "Runs" move into the details | Panel 1 glance: Agent name, Enabled, Autonomy level (per-agent scale, not a rung), Tools granted, Autonomy last set (Central time, and whether by default or by a person), Autonomy set by ("Not recorded by the platform"). Details: "Registry entry, manager access and runs" | `panels-1-2-6.test.mjs`: "Panel 1 shows the brief's employee fields at a glance…", "…moves the registry seed and runs…", "…with nothing synced or captured shows no agent value…" |
| D2. Panel 2 keeps your ticks and the platform verifier apart; STORY-000's 5 of 6 (your ticks) and 0 of 6 (verifier) are never merged; the 32 plan stories are counted separately; per-rung verifier records are left out | Panel 2 glance: "Verified by the platform: 6 of 32 plan stories", "Ticks ahead of verifier: STORY-000: 5 of 6 ticked locally; platform verifier 0 of 6". Stories table: separate "Your ticks (progress.json)" and "Platform verifier" columns. Story pages: both counts as separate facts | `panels-1-2-6.test.mjs`: "Panel 2 keeps the 32 plan stories and STORY-000's six criteria apart…", "Panel 2 leaves the verifier's per-rung records out". Model: `verification-model.js` (unit tests in the same file) |
| D3. Panel 6 names ticks ahead of the verifier, and the snapshot's authority sections as an outstanding data-integration limitation, not an agent failure | Panel 6: 8 items (was 6), with the verifier's own reason quoted; glance "Ticks ahead of verifier: 1 story" | `panels-1-2-6.test.mjs`: "Panel 6 names your ticks ahead of the verifier…", "…names the authority sections as a data-integration limitation… without their values" (it never reads `binds_nothing` or `approved_above_r2`) |
| D4. No accountable-manager name or account-access records on the public page | "Accountable manager access: Not configured in the admin portal." on Panels 1 and 6 and every capability page's "Blocked by"; "the accountable manager" in Panel 2's story titles and on story pages | `panels-1-2-6.test.mjs`: "Panels 1, 2 and 6 show no manager name, account records, email address or record id", "story pages … withhold the name", "capability pages show the neutral access sentence once…"; `record-id-exposure.test.mjs` (updated). Mutation check: with name withholding disabled, 4 tests fail |

Browser checks after the changes ([review-corrections-check.json](review-corrections-check.json)):
80 disclosure openings, 0 layout failures; 320 px reflow on 8 pages, 0 px; axe colour contrast 0
violations; filled button 4.73:1; no glance value squeezed (a new check, added after a long Panel 6
label collapsed its values to 0 px at 820 px; see [a11y/README.md](a11y/README.md)). Full axe run:
0 WCAG A/AA violations in 17 runs; keyboard 7 of 7 checks.

## The six panels

| Panel (brief and display order) | Screen | State today | Evidence |
|---|---|---|---|
| 1 Your employee | `#/panel/employee` | Ready (platform sync) | `agent-domain-employee.test.mjs`; `console.test.mjs` "today, from the platform sync"; `panels-1-2-6.test.mjs` (D1, D4) |
| 2 Your capability inventory | `#/panel/inventory` | Ready (source file and project plan) | `agent-domain.test.mjs`; `command-center-tabs.test.mjs`; `command-center-drafts.test.mjs`; `panels-1-2-6.test.mjs` (D2, D4) |
| 3 The autonomy ladder | `#/panel/ladder` | Ready | `agent-domain-tool-rule.test.mjs`; `agent-domain-authority.test.mjs` |
| 4 Per-rung behaviour | `#/panel/behaviour` | Ready | `agent-domain.test.mjs` (`rungSummary`) |
| 5 Your governance queue | `#/panel/governance` | Empty (platform sync: no requests) | `console.test.mjs`; `agent-domain-platform-sync.test.mjs`; `agent-domain-redact.test.mjs` |
| 6 What is not available | `#/panel/gaps` | Ready | `console.test.mjs` ("a missing source file…"); `panels-1-2-6.test.mjs` (D3, D4) |

## Not yet evidenced

- **A captured endpoint snapshot for Panels 1 and 5.** No capture has been run; the panels read the
  platform's synced copy, and are tested on it, on fixtures and on "not captured".
- **Roboto: pending a decision from Aleem or Ali.** The design system names Roboto first, but loads
  it from the Google Fonts CDN and ships no font files to self-host. Loading it adds an external
  dependency, so it is not added; the page shows the system font that `--font-body` falls back to,
  and every screenshot and measurement used that font.
- **WCAG 2.2 AA conformance is not claimed.** axe finds 0 A/AA violations and every page reflows at
  320 px (the capture guide's 76 px overflow was fixed on 2026-11-09: `tests/reflow.test.mjs`), but
  automated checks cannot show conformance. Known open item: focusable table frames have no role (an
  experimental axe rule). Details in [a11y/README.md](a11y/README.md).
- **What "approved" R0 means: answered from platform code, 2026-11-10.** Since the platform sync of
  2026-11-04, `.colaberry/agent-domain.json` records `approved_autonomy: "autonomy:R0"` for all 25
  capabilities. The platform's snapshot writer fills that field from each capability's
  `starting_autonomy` (`agentDomainSnapshot.ts:225` at platform `39453edf`), so it is the starting rung,
  **not** a recorded human approval. The console says "Starting rung — no human approval yet" (Aleem's
  wording, 2026-11-03) and does not read that field. It stays undisplayed until the platform's extended
  projection is confirmed.
- **Personal names on the page: none, as of 2026-11-10.** After a wording-only correction to Panels 3 to 5
  (sign-off line "Accountable manager's R0 sign-off"; behaviour criteria say "the accountable manager") and
  to the capture guide ("the platform owner"), `tests/public-privacy.test.mjs` finds no personal name, email
  address, record id or account-state record on any of the 6 panels or 70 detail and guide pages. Panels 3 to
  5's logic and data sources are unchanged. One behaviour criterion still describes the access *mechanism*
  ("a scoped admin_users row or a specific alternative surface") as a requirement; it names no person and
  was kept as the criterion's meaning.
- **Not rendered, but public in the repository:** `command-center/draft-guardrails.json`'s REQ-001 source note
  now reads "Platform engineering contact" in place of a staff name (Mihret's decision, 2026-11-10). The
  platform-written `.colaberry/agent-domain.json` still carries staff names and the agent's record id; it is
  platform-owned and not edited here, and the page withholds those values.
- **A published link.** GitHub Pages is not enabled. See the README, "Publishing".
- **The axe and keyboard passes are automated, run in Chrome only.** No screen-reader session with a
  person, no manual 200% or 400% zoom test, and the keyboard pass is scripted at desktop width only.

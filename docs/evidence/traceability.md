# STORY-000 traceability: criterion and panel to screen and evidence

**For:** Mohammed Abdul Aleem's review of the live console at real widths. **Prepared:** 2026-11-03,
session CC-20261102-1whf. **Updated:** 2026-11-14, session CC-20261114-r3mz, for Panel 3 reading the
platform's authority record and Panel 5 reading the platform's synced governance queue. Criteria text:
[docs/stories/STORY-000.md](../stories/STORY-000.md).

**Screens:**
- `/` is the console. Run it locally with `python -m http.server 8000` from the repository root.
- `#/panel/<id>` jumps to one panel.
- `#/capability/<id>` and `#/rung/<stage>` are the detail pages.

**Every test named below passes.** `node --test tests/*.test.mjs`: 221 of 221 on 2026-11-15.
- **197 → 209:** Panel 3 on the platform's authority record, and the new `tests/panel-governance.test.mjs`.
- **209 → 215:** six new tests in `tests/state-matrix.test.mjs`. They check:
  - each scenario renders the states it claims, and [state-matrix.md](state-matrix.md) says the same;
  - the test-data requests never read as a grant;
  - fixture rows show Panel 3's real authority;
  - in TEST DATA rows, Panel 5 never calls its rows the platform's synced snapshot or gives them a time;
  - in FIXTURE capture rows, every capture time Panel 1 shows is labelled as a simulated FIXTURE time.
- **215 → 216:** one new test in `tests/console.test.mjs`, "Panel 3: the ten rungs sit in a closed disclosure titled in the owner's words, not in the panel body".
- **216 → 221:** one new test in `tests/agent-domain-tool-rule.test.mjs`, "Aleem's R0 headline appears only when all capabilities are at autonomy:R0, their starting rung", and four in the new `tests/fonts.test.mjs` (the files match their recorded SHA-256; exactly Roboto 400 and 700 and Roboto Mono 400 with `font-display: swap`; no font CDN; the OFL 1.1 licences ship beside them).

**Live and simulated evidence are kept apart:**
- **Live:** the console screenshots (`console-*.png`, `capability-detail-*.png`) and the state matrix's "Today" row render only the real files on this branch: the pinned capability file, the project plan and the platform's synced file `.colaberry/agent-domain.json` (last rewritten by the platform 4:12 PM CST on 2026-11-14).
- **Simulated:** every other state-matrix row is a FIXTURE, with a banner saying so on the page. Panel 5's requests in those rows are TEST DATA ([state-fixtures.js](state-fixtures.js)), read through the console's own sync reader and redaction. On the review page, Panel 5's source block, its "Reads:" tag and the empty-queue headline are relabelled TEST DATA in those rows, so the made-up rows are never called the platform's synced snapshot or given a last-changed time. Panel 1's capture time in those rows ("captured 3 November 2026, 12:00 PM CST") is the fixture's made-up time, labelled on the page "FIXTURE time: simulated for this review page, not a real capture" ([state-matrix.md](state-matrix.md)).

**Screenshots** are in [screenshots/](screenshots/), re-captured by `tests/evidence/capture-evidence.mjs`
at 3:28 PM CST on 2026-11-15, after the Panel 3 and Panel 5 changes, the ten-rung disclosure, Aleem's R0 headline and the self-hosted Roboto. They
replace the 2026-11-10 captures. Widths: narrow 320 px, phone 390, tablet 820, desktop 1440.

| Capture | Files |
|---|---|
| The console at each width (light only), live data | `console-<width>-light.png` |
| One Panel 2 disclosure opened in place, at tablet and desktop width: the other panels keep their columns | `console-tablet-light-one-open.png`, `console-desktop-light-one-open.png` |
| The console at desktop width with every disclosure open | `console-desktop-light-expanded.png` |
| One capability's detail page, at phone and desktop width, with the platform's authority and rule explanation | `capability-detail-<width>-light.png` |
| Every panel in every state (fixture rows labelled) | `state-*.png` ([state matrix](state-matrix.md)) |
| Panel 5 with test-data requests, tables open, and scrolled to the "Grants" column | `state-captured-data-requests-open.png`, `state-captured-data-grants-column.png` |

**Accessibility:** [a11y/README.md](a11y/README.md): every axe rule at four widths, the keyboard
walkthrough, a reflow check of every page at 320 px, and the limits of what automated checks can show.

## The six acceptance criteria

| # | Criterion (short) | Screen | Evidence |
|---|---|---|---|
| 1 | All six panels render, and each names the endpoint it read | `/`: the "Reads:" line at the foot of every panel. Panel 5 names the platform's synced file and the platform code that fills it, not an endpoint it called | Tests `console.test.mjs`: "six panels render in the brief order, each numbered with its brief panel number", "criterion 1: each panel names, as whole tags, every endpoint the brief assigns it". Code `agent-domain-facts.js:20` (`PANEL_ENDPOINTS`; Panel 5's list is empty because it reads only the synced snapshot). Screenshots `console-*.png`. **Not complete:** Panels 2 and 4 need a platform route that does not exist yet, and Panel 1's capture evidence is pending (see "Not yet evidenced") |
| 2 | An endpoint that returned nothing says so in words, distinct from loading | `/` Panels 1, 3 and 5 with neither a snapshot nor the platform sync: "Not available" chip, dashed amber border, Missing / Waiting for / Will show | Tests `console.test.mjs` ("with neither a snapshot nor the platform sync: Panels 1, 3 and 5 are 'Not available'…", "criterion 2: a loading panel says Loading…", "an empty governance queue says so"); `agent-domain-tool-rule.test.mjs` ('no authority section: Panel 3 says "Not available"…'). [State matrix](state-matrix.md): `state-loading.png` beside `state-nothing-captured.png`; `state-sync-invalid.png` (FIXTURE) for an unreadable synced file |
| 3 | All ten rungs in the owner's wording; each ceiling marked against its rung | `/` Panel 3: the closed disclosure "The ten rungs, in the owner's words (10)", with "Ceiling for N of 25" marks from the platform's `max_permitted_autonomy`; the grid in "Each capability against the ladder" | `agent-domain-authority.test.mjs` (ladder wording); `agent-domain.test.mjs` (ladder cells); `console.test.mjs` ("Panel 3: the ten rungs sit in a closed disclosure…"). Code `panel-ladder.js:95` (`TEN_RUNGS_TITLE`), `:98` (`rungList`), `:167` (the disclosure), `:28` (`ladderGrid`), `agent-domain-model.js:155` (`platformLadderRow`). Screenshots `console-desktop-light.png` (closed), `console-desktop-light-expanded.png` (open) |
| 4 | Authority as the platform records it; the `no_tool_grants` rule named with the number it constrains, in words when zero | `/` Panel 3: the headline, in Aleem's wording of 2026-11-13, "All 25 at autonomy:R0, the starting rung, set by default. No human has approved a higher level."; the "Human confirmation" row, "Not available from the platform yet" (Ali Muwwakkil's decisions of 2026-11-14); "Tool-grant cap in force; constrains nothing today", "Capabilities it holds at autonomy:R2: 0". Detail page: the platform's current rung, reasons, ceiling and the rule explanation | Tests `agent-domain-tool-rule.test.mjs`, all 12, including "the rule binds: two capabilities the platform holds at R2 with no_tool_grants (Aleem's case)", "the platform data disagrees with itself…", "approved_autonomy is never shown as approval…" and "no console module calculates authority…". Code `agent-domain-data.js` (`readAuthority`), `agent-domain-model.js:107` (`authorityView`), `:137` (`toolRuleStatus`), `panel-ladder.js:52`, `:63`, `details.js:41` (`ruleExplanation`). Screenshots `capability-detail-*.png`. The page shows the platform's record; it no longer calls or copies `effectiveAuthority()` |
| 5 | Nothing implies that filing a tool request granted anything | `/` Panel 5: the headline "Filing a request grants nothing…"; a "Grants" column on every change and tool request reading "Nothing: a request is not a grant of any tool or capability"; a submitted request reads "Submitted: waiting on a human decision" and "Not decided yet"; "Tools granted to the agent" says "Not captured" unless the endpoint records the grants | Tests `panel-governance.test.mjs` (10, including "no request reads as a grant: every row says 'Nothing'…"); `state-matrix.test.mjs` ('"Captured: data": the submitted tool request is waiting, and no request is shown as a grant'). Code `agent-domain-facts.js:141` (`REQUEST_GRANTS_NOTHING`), `panel-governance.js`. Screenshots (TEST DATA, FIXTURE-labelled): `state-captured-data.png`, `state-captured-data-requests-open.png`, `state-captured-data-grants-column.png`. The live queue is empty, so the ready state is shown only with test data |
| 6 | Trust: no number, grant, rung or result the domain has not produced | Every value carries a source tag; Panel 6 lists the gaps; placeholders are labelled | Tests `agent-domain.test.mjs` "no console module imports a sample data generator"; `agent-domain-tool-rule.test.mjs` (no calculation; a capability with no platform row is said so, never defaulted); `agent-domain-employee.test.mjs` (a field is shown only when the endpoint returned it); `agent-domain-redact.test.mjs` (nothing that identifies another person); `agent-domain-link.test.mjs` (whether an agent is linked comes from the live endpoint, never the registry seed); `panel-governance.test.mjs` (people withheld; the `-mine` label never presented as the source; the 200-request limit disclosed); `record-id-exposure.test.mjs` (no page a visitor can reach shows a UUID-shaped record id). **Not complete** while Panels 2 and 4 wait on a platform route |

## Aleem's decisions of 2026-11-03

| Decision | Screen | Evidence |
|---|---|---|
| R0 labelled as the starting rung; never "None" | Panel 3 headline and "Each capability's authority"; detail page | `agent-domain-tool-rule.test.mjs`: "the wording: Aleem's phrases, and human confirmation as not available". Since Aleem's re-review of 2026-11-13 the Panel 3 headline is his sentence "All 25 at autonomy:R0, the starting rung, set by default. No human has approved a higher level." (see below); capability rows and detail pages still read "Starting rung" |
| "Tool-grant cap in force; constrains nothing today" | Panel 3 glance and rule block; detail page | "today, on the real file: the platform records autonomy:R0 for all 25, and its rule constrains nothing" |
| Same wording on the console and the detail page | Both screens use `authorityView()` (`agent-domain-model.js:107`) | `agent-domain-tool-rule.test.mjs`: "detail page: the console's…" |
| The hypothetical R2 cap on each detail page | **Superseded on 2026-11-14 (approved by Mihret):** the computed box is replaced by the platform's own rule explanation (`details.js:41`) | `agent-domain-tool-rule.test.mjs` ("no console module calculates authority…"); `capability-detail-*.png` |
| A test with an approved level above R2 and no tool grants | n/a | `agent-domain-tool-rule.test.mjs`: "the rule binds: two capabilities the platform holds at R2 with no_tool_grants (Aleem's case)", on platform-shaped data |
| Live data never implies the rule fires | Panel 3: "Capabilities it holds at autonomy:R2: 0" | "today, on the real file…" |
| Six panels replace nine tabs; not side by side | `/`: no tab bar | `console.test.mjs`: "content from the old tabs is carried into the panels, and the tabs themselves are gone". [README content inventory](../../README.md#content-inventory-the-nine-tabs-mapped-to-six-panels) |
| Ordered by what the operator needs first | Superseded on 2026-11-09: the brief's order is restored (see below) | [Proposal for the brief's owner](panel-order-proposal.md) |
| One primary action per panel | The red button in each panel | `console.test.mjs`: "every panel has exactly one primary action, and every disclosure starts collapsed" |
| Long details in collapsed disclosures | The blue "▸" rows under each panel | Same test; `console-desktop-*-expanded.png` shows them open |
| "Not available" states (missing, waiting for, will show, next action) | Panels 1, 3 and 5 when nothing is captured or synced | `console-ui.js:36`; `console.test.mjs` "with neither a snapshot nor the platform sync: Panels 1, 3 and 5 are 'Not available'…" |
| Evidence: screenshots, state matrix, axe, keyboard, inventory, rationale | n/a | This folder |

## Aleem's review of PR #1, 2026-11-08: the three required changes

| Required change | Screen | Evidence |
|---|---|---|
| 1. Use the Colaberry design system; correct filled-button contrast | Every screen: design-system colours and type families; the red buttons are `--red-600` (#E5121D) | Token files pinned at `9b8a6ec6` in `command-center/vendor/colaberry-ds/`, recorded in `command-center/sources/SOURCES.json`. `design-system.test.mjs` (blob hashes, no colour written outside the tokens, every token defined, AA on every text pair, button 4.73:1, light only, no state-dependent placement). Browser, 3:21 PM CST on 2026-11-15: [review-corrections-check.json](review-corrections-check.json), rendered button `rgb(229, 18, 29)` with white text at 4.73:1, axe colour contrast 0 violations, disclosures closed and open; the full axe rule set finds 0 WCAG A/AA violations in 17 runs ([a11y](a11y/README.md)) |
| 2. Keep the brief's panel order | Panels numbered 1 to 6 as the brief numbers them | `console.test.mjs`: "six panels render in the brief order, each numbered with its brief panel number". The case for another order: [panel-order-proposal.md](panel-order-proposal.md) |
| 3. Opening a disclosure must not move the other panels | Any disclosure, any width | [review-corrections-check.json](review-corrections-check.json): 88 disclosure openings at 320, 390, 820 and 1440 px (22 per width, the ten-rung disclosure included), 0 failures. Each opening is checked for: no other panel changes column or width, panels in earlier rows do not move, the content stays inside its panel, and no table word is split across lines. Before the fix: 40 failures at 820 and 1440 px (panels moved). `console-*-one-open.png` shows it. `design-system.test.mjs`: "no rule changes a panel's grid placement depending on an open disclosure" |

## Mihret's decisions of 2026-11-10: Panels 1, 2 and 6 against the committed snapshot

Platform engineering contact's direction: keep using the committed platform snapshot, add no new route, and continue
Panels 1, 2 and 6 while the platform extends its capability projection for Panels 3, 4 and 5.

| Decision | Screen | Evidence |
|---|---|---|
| D1. Panel 1 shows the brief's employee fields at a glance; the registry seed value and "Runs" move into the details | Panel 1 glance: Agent name, Enabled, Autonomy level (per-agent scale, not a rung), Tools granted, Autonomy last set (Central time, and whether by default or by a person), Autonomy set by ("Not recorded by the platform"). Details: "Registry entry, manager access and runs" | `panels-1-2-6.test.mjs`: "Panel 1 shows the brief's employee fields at a glance…", "…moves the registry seed and runs…", "…with nothing synced or captured shows no agent value…" |
| D2. Panel 2 keeps your ticks and the platform verifier apart; the plan stories are counted separately; per-rung verifier records are left out | Panel 2 glance: "Verified by the platform: 6 of 36 plan stories", "Ticks ahead of verifier: STORY-000: 5 of 6 ticked locally; platform verifier 0 of 6". Stories table: separate "Your ticks (progress.json)" and "Platform verifier" columns | `panels-1-2-6.test.mjs` (counts computed from the plan and progress files since 2026-11-14). Model: `verification-model.js` |
| D3. Panel 6 names ticks ahead of the verifier and the platform's exposure gaps as data-integration limitations, not agent failures | Panel 6, glance "Ticks ahead of verifier: 1 story". Since 2026-11-14 its "authority sections not displayed" item is replaced by two exposure gaps: human confirmation records (AgentDomainCapabilityConfirmation) are not exposed, and no route serves the 67 per-rung behaviours | `panels-1-2-6.test.mjs` (Panel 6 items) |
| D4. No accountable-manager name or account-access records on the public page | "Accountable manager access: Not configured in the admin portal." on Panels 1 and 6 and every capability page | `panels-1-2-6.test.mjs`; `record-id-exposure.test.mjs`; `public-privacy.test.mjs` |

## Decisions of 2026-11-14: Panels 3 and 5 on the platform's records (Ali's confirmed decisions, implemented with Mihret's approval)

| Decision | Screen | Evidence |
|---|---|---|
| Panel 3 and every capability page show the platform's own `authority[]` and `authority_rule`, never a calculation; `approved_autonomy` is not read | Panel 3 headline, glance and rule block; detail page "Authority" | `agent-domain-tool-rule.test.mjs` (11); mutation checks: a reintroduced calculation, a tool-rule count that ignores the platform, and a defaulted missing row each fail |
| Human confirmation is shown as not available: AgentDomainCapabilityConfirmation is not exposed | Panel 3 "Human confirmation: Not available from the platform yet"; Panel 6 gap | `agent-domain-tool-rule.test.mjs` ("the wording…"); `panels-1-2-6.test.mjs` |
| Panel 5 shows the whole Product Experience queue from the synced snapshot, anonymized; a personal capture never replaces it | Panel 5 "Reads:" names the synced file and `agentDomainCommandCenterForSync.ts @992e0e01`; proposer and decision-maker read "Not included in the platform snapshot" | `panel-governance.test.mjs` ("a personal capture of the -mine route never replaces the whole-domain queue", "proposer and decision-maker…") |
| Statuses: submitted is pending; approved, declined and withdrawn are terminal; none grants anything | Panel 5 counts by status; "Not decided yet", "No decision: withdrawn", "Grants: Nothing" | `panel-governance.test.mjs`; `state-captured-data-grants-column.png` (TEST DATA) |
| The 200-request limit and the `-mine` label are disclosed | Panel 5 source note | `panel-governance.test.mjs` ("the 200-request limit is disclosed…", "the source is described as what it is…") |
| Refresh is manual (the platform's next sync); no polling | Panel 5 "How to refresh the data" | The requests guide in `details.js`. No automated test checks this wording |

## Aleem's re-review of PR #1, 2026-11-13: the ladder layout point, the R0 wording and the font

| Required change | Screen | Evidence |
|---|---|---|
| Fold "The ten rungs, in the owner's words" into a closed disclosure, so the three panels in a row end at similar heights; re-capture the desktop screenshot | `/` Panel 3: the rungs are the first of its three closed disclosures, "The ten rungs, in the owner's words (10)"; the panel body keeps the tool-rule block | `console.test.mjs`: "Panel 3: the ten rungs sit in a closed disclosure…" (one list, inside a disclosure that starts closed, titled with the count 10, ten rungs, nothing left in the body). Mutation checks: the rungs back in the body, and the disclosure starting open, each fail it. [review-corrections-check.json](review-corrections-check.json): the ten-rung disclosure opened at all four widths, each passing (no other panel changed column or width; earlier rows did not move; panels in later rows move down while it is open, as with every disclosure). Measured in Chrome at 1440 px, with the self-hosted Roboto: Panel 3 is 1,314 px tall (2,303 px before the fold), beside Panels 1 and 2 at 962 and 910 px. Screenshots `console-desktop-light.png` (closed), `console-desktop-light-expanded.png` (open) |
| "The R0 wording. The platform records R0 for all 25, set by default, not by a person. Make the headline say exactly that: 'All 25 at autonomy:R0, the starting rung, set by default. No human has approved a higher level.' Default and approval should never read as the same thing." | `/` Panel 3 headline: "All 25 at autonomy:R0, the starting rung, set by default. No human has approved a higher level." It is Aleem's statement, shown as he worded it when every capability is at `autonomy:R0`, its starting rung; the page does not read `approved_autonomy` to produce it. Separately and unchanged, the "Human confirmation" row says "Not available from the platform yet": Ali Muwwakkil's decisions of 2026-11-14, because the platform does not expose AgentDomainCapabilityConfirmation | Code `agent-domain-facts.js` (`R0_DEFAULT_HEADLINE`, with its source), `panel-ladder.js` (`authorityHeadline`). Tests `agent-domain-tool-rule.test.mjs`: "today, on the real file…" (the headline's exact text, the rung as code, Ali's statement not merged into it) and "Aleem's R0 headline appears only when all capabilities are at autonomy:R0, their starting rung" (not shown for an all-R1 or a mixed picture); `agent-domain-link.test.mjs` (the same sentence whether an agent is linked, absent or not captured). Mutation check: changing one word of the sentence fails 6 tests. The basis in the platform's records: `effective_autonomy` is `autonomy:R0` for all 25; R0 is each capability's starting rung, and the platform's snapshot writer fills `approved_autonomy` from `starting_autonomy`, not from a person's decision (`agentDomainSnapshot.ts:225` at `39453edf`); the platform rule's note says no capability "has been approved above autonomy:R2 yet". Screenshots `console-*.png` |
| "The font. Self-host Roboto (400 and 700, Latin subset, woff2) and Roboto Mono (400) in your vendor folder, with their licence, declared with font-display: swap. No font CDN." | Every screen: body text in Roboto, code in Roboto Mono, loaded from this site only | Files in `command-center/vendor/fonts/`: `roboto-latin-400-normal.woff2`, `roboto-latin-700-normal.woff2`, `roboto-mono-latin-400-normal.woff2`, copied unchanged from `@fontsource/roboto@5.3.0` and `@fontsource/roboto-mono@5.3.0` (each package's SHA-512 matched the registry before copying; each file's SHA-256 is recorded in `command-center/sources/SOURCES.json` and its README). Licence: SIL Open Font License 1.1 for both, checked against `github.com/google/fonts` (`ofl/roboto`, `ofl/robotomono`), shipped as `LICENSE-Roboto.txt` and `LICENSE-RobotoMono.txt`. `fonts.css`: three `@font-face` rules with `font-display: swap` and the Latin `unicode-range`, loaded by `index.html` and `state-matrix.html` before the tokens. Tests `fonts.test.mjs` (4); mutation checks: a CDN `@import` and a changed font file each fail one. Chrome, 2026-11-15: every request went to the page's own host; the three woff2 files answered 200; `document.fonts` reports Roboto 400 and 700 and Roboto Mono 400 loaded; body text computes to Roboto, code to Roboto Mono. The pinned design-system files and their `LICENSE` are unchanged |

Browser checks after the changes, 3:21 PM CST on 2026-11-15 ([review-corrections-check.json](review-corrections-check.json)):
88 disclosure openings, 0 layout failures; 320 px reflow on 8 pages, 0 failures; axe colour contrast 0
violations; filled button 4.73:1; no glance value squeezed. Evidence capture, 3:28 PM CST on
2026-11-15: full axe run 0 WCAG A/AA violations in 17 runs (the remaining findings are the AAA
enhanced-contrast rule and the experimental focus-order rule); keyboard 7 of 7 checks; 0 px sideways
scroll on the console at all four widths and on the capability page at 390 and 1440 px. The only console
error is the expected 404 for the endpoint snapshot, which is deliberately not placed.

**Script shutdown: neither browser script exited cleanly.** `capture-evidence.mjs` and
`check-review-corrections.mjs` each ran every check and wrote all of their output files. Each then
stalled in Playwright's `browser.close()` and was stopped by a time limit (exit 124), with no Chrome process
left behind.
- **Where it stalls:** Playwright's API log shows the last browser context closing within milliseconds, then
  `browser.close started` with no completion.
- **What does work:** a bare launch, page load and close with the same tools (playwright-core 1.48.2,
  Chrome 157) finishes in 1.3 s with exit 0.
- **Cause:** not determined.
- **The results are not affected:** both scripts write their files before `browser.close()`. A second run of
  the review check gave results identical to the first apart from timestamps.

## The six panels

| Panel (brief and display order) | Screen | State today (live data) | Evidence |
|---|---|---|---|
| 1 Your employee | `#/panel/employee` | Ready (platform sync) | `agent-domain-employee.test.mjs`; `console.test.mjs` "today, from the platform sync"; `panels-1-2-6.test.mjs` (D1, D4) |
| 2 Your capability inventory | `#/panel/inventory` | Ready (source file and project plan) | `agent-domain.test.mjs`; `command-center-tabs.test.mjs`; `command-center-drafts.test.mjs`; `panels-1-2-6.test.mjs` (D2, D4) |
| 3 The autonomy ladder | `#/panel/ladder` | Ready (platform authority record) | `agent-domain-tool-rule.test.mjs`; `agent-domain-authority.test.mjs` |
| 4 Per-rung behaviour | `#/panel/behaviour` | Ready (pinned source file) | `agent-domain.test.mjs` (`rungSummary`) |
| 5 Your governance queue | `#/panel/governance` | Empty (platform sync: no requests on the domain) | `panel-governance.test.mjs`; `agent-domain-platform-sync.test.mjs`; `agent-domain-redact.test.mjs` |
| 6 What is not available | `#/panel/gaps` | Ready | `console.test.mjs` ("a missing source file…"); `panels-1-2-6.test.mjs` (D3, D4) |

## Not yet evidenced

- **Panel 1's capture evidence (Option A, evidence only).** Mihret chose on 2026-11-14 to capture
  Panel 1's endpoint with Mihret's own signed-in session as evidence only; Panel 1 keeps reading the platform
  sync. The capture has not been run yet. Panel 5 is not captured: it reads only the synced whole-domain
  queue.
- **Panels 2 and 4 need a platform route.** The admissions-builder-pattern route for the domain's
  capability records does not exist yet, so both read the pinned capability file.
- **Panel 5's ready state on live data.** The live queue is empty; the ready state is shown only with
  TEST DATA in the state matrix and tested on platform-shaped data.
- **Platform issues to report (not yet sent), not fixed here:** the governance section is labelled `-mine` but holds the
  whole domain's queue; `governance.pending` counts status `'pending'`, which the platform never stores
  (it stores `submitted`), so it is always 0 and Panel 5 will flag a disagreement whenever a request is
  submitted; the 200-request limit is not stated in the file; human confirmation records are not exposed.
- **The design system's own licence line for Roboto.** The pinned `command-center/vendor/colaberry-ds/LICENSE`
  says "Roboto & Roboto Mono — Apache License 2.0"; the current releases of both fonts are SIL Open Font
  License 1.1 (checked against `github.com/google/fonts`, 2026-11-15). The pinned file is the design
  system's and is not edited here; the self-hosted fonts carry their own OFL 1.1 licences. For the
  design system's owner to correct.
- **WCAG 2.2 AA conformance is not claimed.** axe finds 0 A/AA violations and every page reflows at
  320 px, but automated checks cannot show conformance. Known open item: focusable table frames have no
  role (an experimental axe rule). Details in [a11y/README.md](a11y/README.md).
- **What `approved_autonomy` means.** `.colaberry/agent-domain.json` records
  `approved_autonomy: "autonomy:R0"` for all 25 capabilities. The platform fills it from each capability's
  `starting_autonomy`, so it is the starting rung, **not** a recorded human approval. The console does not
  read that field (a test fails if it does).
- **Personal names on the page: none.** `tests/public-privacy.test.mjs` finds no personal name, email
  address, record id or account-state record on any panel or detail and guide page.
- **Not rendered, but public in the repository:** `command-center/draft-guardrails.json`'s REQ-001 source note
  now reads "Platform engineering contact" in place of a staff name (Mihret's decision, 2026-11-10). The
  platform-written `.colaberry/agent-domain.json` still carries staff names and the agent's record id; it is
  platform-owned and not edited here, and the page withholds those values.
- **A published link of this work.** GitHub Pages is enabled at
  https://mihretcolaberry1.github.io/ColaberryInternship/, but it serves an earlier build (`d7fc65a` from
  `command-center-pages`, deployed 9:52 PM CST on 2026-11-13), not the evidence recorded here. See the
  README, "Publishing".
- **The axe and keyboard passes are automated, run in Chrome only.** No screen-reader session with a
  person, no manual 200% or 400% zoom test, and the keyboard pass is scripted at desktop width only.

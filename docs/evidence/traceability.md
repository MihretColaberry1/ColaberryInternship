# STORY-000 traceability: criterion and panel to screen and evidence

**For:** Mohammed Abdul Aleem's review of the live console at real widths. **Prepared:** 2026-11-03,
session CC-20261102-1whf. Criteria text: [docs/stories/STORY-000.md](../stories/STORY-000.md).

**Screens:**
- `/` is the console. Run it locally with `python -m http.server 8000` from the repository root.
- `#/panel/<id>` jumps to one panel.
- `#/capability/<id>` and `#/rung/<stage>` are the detail pages.

**Every test named below passes.** `node --test tests/*.test.mjs`: 123 of 123 on 2026-11-03.

**Screenshots** are in [screenshots/](screenshots/), captured by `tests/evidence/capture-evidence.mjs`.
Captures, with the widths used (phone 390 px, tablet 820, desktop 1440):

| Capture | Files |
|---|---|
| The console at each width, light and dark | `console-<width>-<theme>.png` |
| The console at desktop width with every disclosure open | `console-desktop-<theme>-expanded.png` |
| One capability's detail page, at phone and desktop width | `capability-detail-<width>-<theme>.png` |

## The six acceptance criteria

| # | Criterion (short) | Screen | Evidence |
|---|---|---|---|
| 1 | All six panels render, and each names the endpoint it read | `/`: the "Reads:" line at the foot of every panel | Tests `console.test.mjs`: "six panels render in the operator order", "criterion 1: each panel names, as whole tags, every endpoint the brief assigns it". Code `agent-domain-facts.js:20` (`PANEL_ENDPOINTS`). Screenshots `console-*.png` |
| 2 | An endpoint that returned nothing says so in words, distinct from loading | `/` Panels 1 and 2 today: "Not available" chip, dashed amber border, Missing / Waiting for / Will show | Tests `console.test.mjs`: "today, with no snapshot…", "criterion 2: a loading panel says Loading…", "a refused capture is an error…", "an empty governance queue says so". [State matrix](state-matrix.md): `state-loading.png` beside `state-today.png` |
| 3 | All ten rungs in the owner's wording; each ceiling marked against its rung | `/` Panel 4: "The ten rungs, in the owner's words", with "Ceiling for N of 25" marks; the grid in "Each capability against the ladder" | `agent-domain-authority.test.mjs` (ladder wording); `agent-domain.test.mjs` (ladder cells). Code `panel-ladder.js:65` (`rungList`), `:20` (`ladderGrid`). Screenshots `console-desktop-*.png`, `console-desktop-*-expanded.png` |
| 4 | Authority as `effectiveAuthority()` returns it; the `no_tool_grants` rule named with the number it constrains, in words when zero | `/` Panel 4: the headline "autonomy:R0 for all 25: Starting rung — no human approval yet." and "Tool-grant cap in force; constrains nothing today: it holds 0 of 25 capabilities." Detail page: the Authority facts and the labelled hypothetical | Tests `agent-domain-tool-rule.test.mjs`, all 8, including Aleem's test "approved above R2 with no tool grants: effectiveAuthority() returns R2 with no_tool_grants". Code `agent-domain-facts.js:97` (wording), `agent-domain-model.js:80`, `:116`, `:132`, `panel-ladder.js:36`, `details.js:34`. Screenshots `capability-detail-*.png` |
| 5 | Nothing implies that filing a tool request granted anything | `/` Panel 2: the headline "Filing a request grants nothing…"; the "Grants: Nothing: a request is not a grant" column; "Tools granted to the agent" says "Not captured" unless the endpoint records the grants | Code `panel-governance.js:36`. `state-captured-data.png` shows a filed tool request (fixture) |
| 6 | Trust: no number, grant, rung or result the domain has not produced | Every value carries a source tag; Panel 6 lists the gaps; placeholders are labelled | Tests `agent-domain.test.mjs` "no console module imports a sample data generator", "with no approval recorded, authority is … autonomy:R0, never the ceiling"; `agent-domain-employee.test.mjs` (a field is shown only when the endpoint returned it); `agent-domain-redact.test.mjs` (nothing that identifies another person); `agent-domain-link.test.mjs` (9 tests: whether an agent is linked comes from the live endpoint, never the registry seed; nothing claims "no agent exists"); `record-id-exposure.test.mjs` (4 tests: no page a visitor can reach, 42 in all, shows a UUID-shaped record id; the staff member's `org_members` id in the research file's blocker is shown as "[record ID withheld]") |

## Aleem's decisions of 2026-11-03

| Decision | Screen | Evidence |
|---|---|---|
| R0 labelled "Starting rung — no human approval yet"; never "None" | Panel 4 headline and "Each capability's authority"; detail page "Human approval" | `agent-domain-tool-rule.test.mjs`: "today, on the real file…", "console ladder panel: Aleem's wording, never None" |
| "Tool-grant cap in force; constrains nothing today" | Panel 4 glance and rule block; detail page "What holds it back" | Same tests |
| Same wording on the console and the detail page | Both screens use `authorityView()` (`agent-domain-model.js:116`) | `agent-domain-tool-rule.test.mjs`: "detail page: the same wording as the console…" |
| The hypothetical R2 cap on each detail page | `#/capability/<id>`: the dashed box "Hypothetical: not an approval, not data" | Same test, for an R5 and an R2 ceiling; `capability-detail-*.png` |
| A test with an approved level above R2 and no tool grants | n/a | `agent-domain-tool-rule.test.mjs`, test 3, with a control (test 4) |
| Live data never implies the rule fires | Panel 4: "holds 0 of 25" | Test 2 checks that no real row returns `no_tool_grants` |
| Six panels replace nine tabs; not side by side | `/`: no tab bar | `console.test.mjs`: "content from the old tabs is carried into the panels, and the tabs themselves are gone". [README content inventory](../../README.md#content-inventory-the-nine-tabs-mapped-to-six-panels) |
| Ordered by what the operator needs first | Panel numbers 1 to 6 | `console.test.mjs` (order); [design rationale](design-rationale.md) |
| One primary action per panel | The red button in each panel | `console.test.mjs`: "every panel has exactly one primary action, and every disclosure starts collapsed" |
| Long details in collapsed disclosures | The blue "▸" rows under each panel | Same test; `console-desktop-*-expanded.png` shows them open |
| "Not available" states (missing, waiting for, will show, next action) | Panels 1 and 2 today | `console-ui.js:36`; `console.test.mjs` "today, with no snapshot" |
| Evidence: screenshots, state matrix, axe, keyboard, inventory, rationale | n/a | This folder |

## The six panels

| Panel (display order) | Brief panel | Screen | State today | Evidence |
|---|---|---|---|---|
| 1 Your employee | 1 | `#/panel/employee` | Not available (no snapshot) | `agent-domain-employee.test.mjs` (10 tests); `panel-employee.js:91` |
| 2 Your governance queue | 5 | `#/panel/governance` | Not available (no snapshot) | `console.test.mjs`; `agent-domain-redact.test.mjs` |
| 3 Your capability inventory | 2 | `#/panel/inventory` | Ready (source file and project plan) | `agent-domain.test.mjs`; `command-center-tabs.test.mjs`; `command-center-drafts.test.mjs` |
| 4 The autonomy ladder | 3 | `#/panel/ladder` | Ready | `agent-domain-tool-rule.test.mjs`; `agent-domain-authority.test.mjs` |
| 5 Per-rung behaviour | 4 | `#/panel/behaviour` | Ready | `agent-domain.test.mjs` (`rungSummary`) |
| 6 What is not available | 6 | `#/panel/gaps` | Ready | `console.test.mjs` ("a missing source file…") |

## Not yet evidenced

- **Real endpoint data for Panels 1 and 2.** The capture has not been run. The panels have been
  tested only on fixtures and on "not captured".
- **A published link.** GitHub Pages is not enabled. See the README, "Publishing".
- **The axe and keyboard passes are automated, run in Chrome.** No screen-reader session with a
  person has been done.

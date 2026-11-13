# Accessibility pass: axe, a keyboard walkthrough and reflow

**Captured:** 9:46 PM CST on 2026-11-10, from the working tree of `story-000-command-center-revision`
(platform sync of 2026-11-04), with Aleem's three required changes of 2026-11-08 applied (design-system
tokens, the brief's panel order, disclosures that open in place), the 320 px reflow fix, the
2026-11-10 changes to Panels 1, 2 and 6 (employee fields at a glance; your ticks and the platform
verifier kept apart; neutral manager-access wording) and the privacy wording corrections (no personal
names on any page; shorter Panel 6 label), by `tests/evidence/capture-evidence.mjs`. It replaces the
captures of 7:27 PM CST on 2026-11-09 and 9:13 PM CST on 2026-11-10.
**Tools:** axe-core 4.10.2 and playwright-core 1.48.2, driving the installed Chrome. Neither is a
repository dependency.
**Raw results:** [axe-results.json](axe-results.json) and [keyboard-walkthrough.json](keyboard-walkthrough.json).

**What this is not.** These are automated checks plus one scripted keyboard pass, in one browser.
They find many failures but cannot show that the page conforms to WCAG 2.2 AA, so no conformance is
claimed here. See "What this pass does not cover" below.

## axe: every rule axe ships

**Rules run:** all of axe's rules (105 to 107 per page; 29 to 58 of them find something to check and pass), not a tag subset. That includes the
AAA and experimental rules, so each finding is labelled with what it is:

| Label | Meaning |
|---|---|
| WCAG A/AA | A failure of a WCAG 2.0, 2.1 or 2.2 success criterion at level A or AA |
| AAA | A level AAA criterion. Not required for AA; reported because it was checked |
| Best practice | axe's own advice, not a WCAG criterion |
| Experimental | A rule axe marks as experimental, with known false positives |

**Widths:** narrow 320 px, phone 390, tablet 820, desktop 1440. The console was checked with every
disclosure closed and with every disclosure open. The four detail pages were checked at 320 and 1440.

| Run | WCAG A/AA | AAA | Best practice | Experimental | Needs review |
|---|---|---|---|---|---|
| Console, 320 / 390 / 820 / 1440, disclosures closed | 0 | 1 rule | 0 | 0 | 1 rule (AAA) |
| Console, 320 / 390 / 820 / 1440, every disclosure open | 0 | 1 rule | 0 | 1 rule | 2 rules (AAA) |
| Capability detail page, 320 and 1440 | 0 | 1 rule | 0 | 1 rule | 0 |
| Rung detail page (`autonomy:R1`), 320 and 1440 | 0 | 1 rule | 0 | 1 rule | 0 |
| Capture guide, 320 and 1440 | 0 | 1 rule | 0 | 0 | 0 |
| Story page (`STORY-000`), 320 and 1440 | 0 | 1 rule | 0 | 0 | 0 |
| State matrix page (fixtures), 1440 | 0 | 1 rule | 0 | 0 | 1 rule (AAA) |

**WCAG A/AA violations: 0 in all 17 runs.**

### Every finding, and what it means

| Finding | Kind | Where | What it is |
|---|---|---|---|
| `color-contrast-enhanced` (7:1) | AAA, serious | Every page | AAA asks for 7:1 for body text. The design-system colours used for text meet AA (4.5:1) but not 7:1: muted text 5.33:1, links 5.96:1, the filled button 4.73:1. Up to 983 elements per run (the state matrix page). Meeting AAA would mean darker text colours than the design system defines; not attempted |
| `focus-order-semantics` | Experimental, minor | Console with disclosures open (12 elements); capability and rung pages (1 or 2) | The scrolling table frames take keyboard focus (`tabindex="0"`, added so a keyboard user can scroll them; axe's `scrollable-region-focusable`) but have no role, so a screen reader announces only "group" or nothing. Not a WCAG failure; worth a `role="region"` and a label in a later revision |
| `color-contrast-enhanced`, needs review | AAA | Console (6 elements), state matrix (48) | Elements axe could not measure for 7:1; AAA, not pursued |
| `identical-links-same-purpose`, needs review | AAA | Console with disclosures open (25 links) | Links with the same name leading to different pages; AAA, not pursued |

## Keyboard walkthrough (desktop 1440 px, light, scripted)

**Tab order.** From the top of the page, Tab visits 38 stops; the 39th Tab leaves the page and the
order repeats:
1. the skip link;
2. the console title;
3. then each panel in the brief's order (Employee, Inventory, Ladder, Behaviour, Governance, Gaps):
   its primary action, then its disclosures. Panel 3's ten rung links come before its action.

The walkthrough recorded 70 Tabs: one full pass, the moment focus leaves the page (Tab 39), and most
of a second pass. All 69 stops on page elements had a visible 3 px focus outline. The theme buttons are gone; the panels carry three more
disclosures than on 2026-11-03, so the total is again 38.

| Check | Result |
|---|---|
| The first Tab lands on "Skip to content" | Pass |
| Enter on the skip link moves focus to the main content | Pass |
| Enter on a disclosure summary opens it | Pass |
| Space on the same summary closes it | Pass |
| Enter on the ladder panel's action opens a capability detail page | Pass |
| Enter on "Back to the console" returns to the ladder panel and focuses its heading | Pass |
| No theme switch is offered and no theme is set: the page is light only | Pass |

## Reflow at 320 px (WCAG 1.4.10)

Measured separately on every reachable page: does the page scroll sideways at 320 CSS px?

| Page | Sideways scroll |
|---|---|
| Console | 0 px |
| Capability detail, rung detail (`R1`, `R8`), story page | 0 px |
| Guides: requests, refresh | 0 px |
| Guide: capture | 0 px. Fixed on 2026-11-09; it was 76 px (see below) |

Opening any disclosure on the console, at 320, 390, 820 and 1440 px, keeps every panel in place and
every word whole: [review-corrections-check.json](../review-corrections-check.json), 80 openings, 0
failures. A wide table in a narrow panel scrolls sideways inside its own frame; that is allowed by
1.4.10 for data tables, but it is more scrolling than a full-width view.

This is now measured on every page at 320 px by `tests/evidence/check-review-corrections.mjs`
(`reflow_320` in [review-corrections-check.json](../review-corrections-check.json)): 8 pages, 0 px each.
The same script measures every at-a-glance value at all four widths (`glance_values_squeezed`): none
is squeezed on 2026-11-10. At 820 px Panel 6's values were 88 px wide, set by its longest label
("Endpoints read from the platform sync"); that glance label is now "Endpoints from the sync" (the details
section keeps the full title), and the values are 112 px wide, set by the next-longest label, "Endpoints
with no usable response". Measured: 254 px at 320, 324 at 390, 112 at 820, 185 at 1440.

## Found and fixed during this pass

| Problem | How it was found | Fix |
|---|---|---|
| The capture guide scrolled 76 px sideways at 320 px (WCAG 1.4.10): the plain-text path `command-center/snapshots/product_experience.endpoint-snapshots.json` in its fifth step has no break point. It arrived with this PR (`0d0cc6a`) and is not on `main` | A text-overflow probe on every page at 320 px; axe's AA contrast rule also could not read that item's background | `.guide-steps li { overflow-wrap: anywhere; }`. Regression tests: `tests/reflow.test.mjs` (fails without the rule) and the 320 px reflow check on all 8 pages (reported 76 px before the fix, 0 after). axe's "needs review" item on that page is gone |
| With a disclosure opened in place, the inventory table squeezed to fit its panel and broke its headers one letter per line, at every width | Looking at the one-disclosure screenshot; the layout check passed because nothing moved | `overflow-wrap: anywhere` removed from the disclosure body, and table cells now break only between words, so the table scrolls in its frame. The layout check now also fails any opening where a table word is split across lines; with the faulty rule put back it reports 40 failures, with the fix 0 |
| The state matrix's "Today" row still showed Panels 1 and 5 as "Not available", which the real console no longer does since the platform sync | Comparing the matrix with the console | "Today" now renders exactly what the console loads; the old view is kept as its own row, "Real sources, nothing captured or synced". `tests/state-matrix.test.mjs` fails if they drift apart |
| 2026-11-10: a new 60-character glance label on Panel 6 ("Stories where your ticks are ahead of the platform verifier") took the glance grid's full label width and squeezed every Panel 6 value to 0 px at 820 px, wrapping them one character per line | axe's AA contrast rule reported 4 "needs review" items at 820 px that it could not measure (the elements had no width); measured in the browser | Shorter labels ("Ticks ahead of verifier", "Verified by the platform"). `check-review-corrections.mjs` now also fails if any glance value is narrower than 20% of its list or 60 px: with the long label put back it reports 4 values at 0 px (820 px) and 4 at 39 px (1440 px); with the fix, none. axe's contrast "needs review" items at 820 px are back to 0 |

## What this pass does not cover

- **No session with a person using a screen reader**, and no manual zoom test at 200% or 400%.
- **Chrome only**, on Windows. No Firefox, Safari or mobile browser.
- **The keyboard pass is scripted at desktop width only.**
- **The font.** Roboto is not loaded (it would come from the Google Fonts CDN, an external dependency
  pending a decision from Aleem or Ali), so every measurement used the system font that the design
  system's `--font-body` falls back to. Text widths, and so wrapping, will differ if Roboto is added.
- **axe cannot judge whether the wording is clear.** That is part of Aleem's review.

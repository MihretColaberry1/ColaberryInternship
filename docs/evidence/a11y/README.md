# Accessibility pass: axe and a keyboard walkthrough

**Captured:** 7:38 PM CST on 2026-11-03 (re-run after the agent-link correction and the record-ID redaction), by `tests/evidence/capture-evidence.mjs`.
**Tools:** axe-core 4.10.2 and playwright-core 1.48.2, driving the installed Chrome. Neither is a
repository dependency.
**Raw results:** [axe-results.json](axe-results.json) and [keyboard-walkthrough.json](keyboard-walkthrough.json).

## axe

**Rule sets:** WCAG 2.0, 2.1 and 2.2 at levels A and AA, plus axe best practice. Colour contrast is
one of the checked rules, in both themes.

| Run | Violations | Rules passed |
|---|---|---|
| Console, phone, light, disclosures closed | 0 | 41 |
| Console, phone, light, every disclosure open | 0 | 50 |
| Console, desktop, light, closed / open | 0 / 0 | 41 / 49 |
| Console, phone, dark, closed / open | 0 / 0 | 41 / 50 |
| Console, desktop, dark, closed / open | 0 / 0 | 41 / 49 |
| Capability detail page, desktop, light | 0 | 45 |
| Rung detail page (`autonomy:R1`), desktop, light | 0 | 39 |
| Capture guide, desktop, light | 0 | 36 |
| Story page (`STORY-000`), desktop, light | 0 | 38 |
| State matrix page (fixtures), desktop, light | 0 | 41 |

The first run found four problems, each fixed and re-run:

| Problem | Rule | Fix |
|---|---|---|
| Scrolling tables could not be reached by keyboard | `scrollable-region-focusable` | Table wrappers take focus and show the focus ring |
| The "Why this ceiling" toggle in the ladder grid was under 24 px tall | `target-size`, WCAG 2.2 | Given a 24 px minimum height |
| The state-matrix page repeated panel ids across scenarios | `landmark-unique` | Ids now carry a scenario suffix |
| A badge forced 14 px of sideways scrolling at 820 px wide | Not an axe rule; found by the width check | The badge now wraps |

## Keyboard walkthrough (desktop, light, scripted)

**Tab order.** From the top of the page, Tab visits 38 stops, in this order:
1. the skip link;
2. the console title;
3. the three theme buttons;
4. then each panel in turn: its primary action, then its disclosures. Panel 4's ten rung links come
   before its action.

The 39th Tab leaves the page, and the order then repeats. All 38 stops had a visible 3 px focus outline.

**Checks:**

| Check | Result |
|---|---|
| The first Tab lands on "Skip to content" | Pass |
| Enter on the skip link moves focus to the main content | Pass |
| Enter on a disclosure summary opens it | Pass |
| Space on the same summary closes it | Pass |
| Enter on the ladder panel's action opens a capability detail page | Pass |
| Enter on "Back to the console" returns to the ladder panel and focuses its heading | Pass |
| Enter on the "Dark" theme button switches the theme and marks it pressed | Pass |

**A fault the walkthrough found:** at first, the skip link changed the page address to `#main`. That
re-drew the console and lost focus. It now moves focus directly, without changing the address.

## What this pass does not cover

- **No session with a person using a screen reader**, and no manual zoom test at 200% or 400%.
- **The pages were checked in Chrome only.**
- **axe cannot judge whether the wording is clear.** That is part of Aleem's review.

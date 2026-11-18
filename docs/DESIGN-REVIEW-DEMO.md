# Design review prototype: how to run it, and what it cannot do

**Status:** local technical demo. Not the Product Experience agent, not approved, not part of any
story in `.colaberry/plan.json`. The platform's `ProductExperienceDomainAgent` stays disabled with
no tools and no prompt; this prototype does not touch it.

## What it does

Reviews **one** `.tsx` or `.jsx` file at a pinned commit of a git repository, against a rules pack,
and writes a Markdown and JSON report to a folder **outside** that repository. It reads through
`git cat-file` only, so it never checks out, edits, commits or deploys anything.

Every finding has the file and line, the code, the draft rule and its cited source line, the reason
it was raised, and a suggested improvement for a human to judge. Each one is either:

- **Pattern detected by a draft rule:** the pattern the rule describes is at that line. This is
  not an official accessibility or design-system violation.
- **Needs human review:** a heuristic hit, or the answer depends on something outside the file.

Severity is never assigned. The report makes no WCAG 2.1 AA or 2.2 AA claim.

## Run it

From this repository's root, with Node 22 and git. There are no dependencies to install.

```bash
node review/review-page.mjs --repo ../ColaberryEnterprise_AI_LeadershipAccelerator --commit 9d9aa3c3dcd2a8cecd5e3a2ab5109fb82f217a50 --page frontend/src/pages/admin/inbox/InboxAuditLogPage.tsx --rules review/rules/admin-portal.draft.rules.json --out ../design-review-output
```

```bash
node --test tests/design-review.test.mjs tests/design-review-safety.test.mjs
```

`InboxAuditLogPage.tsx` is a **temporary technical demo target**, chosen because it is available
locally. It is not Aleem's target-product decision.

## The rules pack

`review/rules/admin-portal.draft.rules.json` is an **unapproved draft compiled by Mihret Netsereab**
from three platform files at commit `9d9aa3c3`: `frontend/CLAUDE.md`,
`.claude/skills/baseline-ui/SKILL.md` and `.claude/skills/fixing-accessibility/SKILL.md`. Each rule
carries the path, line and a short quote. Before any check runs, the tool re-reads every cited line
and refuses the pack (`CitationMismatch`) if the quote is not there, so a rule cannot be invented or
silently go stale. A pack can only say `approved` if it names the human who approved it.

## Refusals and failures

| Situation | Result |
|---|---|
| Page path absolute, with `..`, or not `.tsx`/`.jsx` | `PathRefused` |
| Page not at that commit | `PageNotFound`, naming the path |
| Branch name instead of a commit SHA | `ValidationError` |
| Output folder inside the reviewed repo | `OutputRefused` |
| Rule without a source, or a quote not on the cited line | `RulesPackInvalid` / `CitationMismatch` |
| "Approved" with no named human, or by `system:` | `RulesPackInvalid` |
| A git read that hangs | `TimeoutError` after 10 s, no retry (a local read fails the same way again) |

Errors print one JSON line on stderr and exit 1. Nothing is written on a refusal.

## What it cannot check

Contrast, touch targets, keyboard and focus, reduced motion, high contrast, skip navigation and
landmarks all need a rendered page or the app shell, and contrast and touch targets also depend on
the standard, which is pending. Layout, hierarchy and brand voice have no approved rules and no
model. Every report lists these under "Could not check", along with imported modules it did not
read. The tag reader is a small pattern reader, not a parser; its limits are printed in each report.

## Decisions still open for Aleem

Target product; approval of each rule; WCAG 2.1 AA or 2.2 AA; colour exceptions such as
third-party brand colours; which token layer is authoritative; severity; whether R5 covers table
rows; and whether a model is used for judgment checks.

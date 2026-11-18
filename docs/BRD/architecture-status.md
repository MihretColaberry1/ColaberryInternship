# Architecture status review: Product Experience & UI/UX Agent (BRD v0.2)

**Prepared by:** Mihret Netsereab, with Claude Code (session CC-20261101-egvv)
**Date:** 2026-11-01
**Reviews:** [`product-experience-uiux-agent-brd-v0.2.docx`](product-experience-uiux-agent-brd-v0.2.docx). The BRD itself is unchanged.
**Status:** review only. Nothing in this document approves a requirement, builds a component,
grants a tool or enables an agent.

---

## Why this document exists

BRD v0.2 section 5 says the proposed components and tools are "in the Agent architecture tab".
**That tab is not in the Word document.** The only architecture content in it is the version 1
flow diagram:

> Request (one page path) → Load rules (from the repo) → Code checks (tokens, contrast,
> accessibility) → Judgment (layout, hierarchy, voice; model) → Report (findings, evidence, fixes)

This document builds the component list from that diagram and from FR-1 to FR-12 and the
non-functional requirements. It then checks each component against real code. It answers BRD
question **B6** ("Should existing platform code be checked for reuse? Until it is, every
architecture component stays UNVERIFIED").

`Documents/UIUX_Agent_Anatomy.xlsx` (2026-10-13) is not that tab. It holds the earlier
body-part model (Brain, Eyes, Hands and so on) and has no BRD component mapping.

---

## Two things that must not be confused

| | **Existing review prototype** | **Proposed BRD agent (version 1)** |
|---|---|---|
| Where | This repo, [`review/`](../../review/) | Not built |
| What it reviews | One `.tsx` or `.jsx` file in the **platform** repo, at a pinned commit | One `.html` page in **Aleem's design-system repo** |
| Rules | An unapproved draft pack, [`review/rules/admin-portal.draft.rules.json`](../../review/rules/admin-portal.draft.rules.json), citing the platform's `frontend/CLAUDE.md` and design skills | `BRAND.md`, `tokens/`, `components/core/`, `_adherence.oxlintrc.json` in the design-system repo |
| Severity | Never assigned, by design ([`docs/DESIGN-REVIEW-DEMO.md`](../DESIGN-REVIEW-DEMO.md)) | High / Medium / Low, with WCAG 2.2 AA thresholds (BRD section 6) |
| Model | None | Used for judgment findings (FR-7) |
| Standing | Local technical demo; not part of any story in `.colaberry/plan.json` | Draft for stakeholder review; no requirement approved |

**A component the prototype has is not a component the BRD agent has.** In the table below,
"prototype" evidence shows what could be reused. It does not show that the BRD requirement is
met.

---

## Sources and versions

| Source | Version read | How |
|---|---|---|
| Design-system repo: [`aleemcolaberry/Colaberry-DS-School-Final`](https://github.com/aleemcolaberry/Colaberry-DS-School-Final) | `9b8a6ec6` (2026-07-16) | GitHub API, read-only |
| Platform: `ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator` | `origin/main` = `9d9aa3c3` (2026-10-31) | `git show` / `git grep` on the local clone, no checkout |
| This repo: prototype and discovery docs | Working tree on `story-000-command-center-revision` | Read; prototype tests run |

**Why that design-system repo.** The BRD does not name the repository. `aleemcolaberry` has at least
ten public design-system repos. `Colaberry-DS-School-Final` is the only one matching every BRD
count: `Training Site/` with 16 HTML pages, `app/` with 6, 20 components in `components/core/`,
and `_adherence.oxlintrc.json`. The repo is an inference, so it is listed in the open questions.

**Platform clone.** The local checkout is `c96f6a68` (2026-10-27), 270 commits behind
`origin/main`. The files that define the agent did not change between the two commits:
`domainAgents.ts`, its test, `product_experience.json`, `executionPolicy.ts` and
`agentManagerAuthMiddleware.ts`.

In the tables below, platform paths are relative to the platform repo root, and design-system
paths to the design-system repo root. Paths in this repo are links.

---

## 1. Architecture component status

### Status key

| Status | Meaning |
|---|---|
| **Implemented (prototype)** | Code exists and is tested, but only in the prototype and only for its own target. Not the BRD agent. |
| **Partial** | Some of the requirement is covered by existing code. The rest is missing. |
| **Missing** | No code implements it in any repo read. |
| **Available, not granted** | The tool exists on the platform, but no agent is allowed to use it. |
| **Decision needed** | Cannot be built until a stakeholder decides. |

### Component table

| # | Flow stage | Component | BRD ref | Status | Evidence |
|---|---|---|---|---|---|
| C1 | Request | Page path validation | FR-1 | **Partial** | The prototype refuses absolute paths, `..` and wrong file types (`PathRefused`), and missing pages (`PageNotFound`): [`review/review-page.mjs`](../../review/review-page.mjs), documented in [`docs/DESIGN-REVIEW-DEMO.md`](../DESIGN-REVIEW-DEMO.md). It accepts only `.tsx` / `.jsx`, not `.html`, and only in the platform repo. |
| C2 | Request | Clarify vague requests; decline out-of-scope ones | FR-11; UC-5 to UC-8 | **Missing** | No code reads a natural-language request. The prototype takes command-line flags only. |
| C3 | Load rules | Load rules, tokens and component guides fresh each run | FR-2; NFR Maintainability | **Partial** | The prototype loads its rules pack on every run and refuses it if any cited quote is no longer on its line (`CitationMismatch`): [`review/rules.mjs:64-83`](../../review/rules.mjs#L64-L83). It does not read `BRAND.md`, `tokens/*.css` or `components/core/*.prompt.md`. |
| C4 | Code checks | Raw hex colours | FR-3 | **Partial** | Prototype rules R1 `hex_in_inline_style` and R2 `hardcoded_hex`: [`review/checks-colour.mjs:27-46`](../../review/checks-colour.mjs#L27-L46). JSX only. |
| C5 | Code checks | Raw px, fonts other than Roboto / Roboto Mono / Quicksand, invalid component props | FR-3 | **Missing** | The rules exist as oxlint selectors in design-system `_adherence.oxlintrc.json`. No oxlint dependency or runner exists in either repo (checked: platform `package.json`, `frontend/package.json`, `backend/package.json`). See gap G1: the selectors cannot read HTML or CSS. |
| C6 | Code checks | Text contrast with measured ratio | FR-4 | **Missing** | The declared tool `contrast_calculator` has 0 implementations in platform `backend/src` (non-test `.ts`). Contrast needs resolved colours, which ties to T8. |
| C7 | Code checks | Focus styles and target size | FR-5 | **Missing** | No check in any repo read. Exact sizes need a rendered page (C15). |
| C8 | Code checks | Image alt text and heading order | FR-6 | **Partial** | Prototype rules R4 `img_alt` and R9 `heading_order`: [`review/checks-a11y.mjs`](../../review/checks-a11y.mjs). JSX only, read by a pattern reader rather than a parser. |
| C9 | Judgment | Advisory review of layout, hierarchy and brand voice | FR-7 | **Missing** | No model and no prompt in the prototype or for the agent. The platform has a rule-based critique engine, `backend/src/intelligence/systemStateEngine/visual/visualCritiqueEngine.ts` ("Phase 5 V1: rule-based templates"); whether it can be reused has not been assessed. |
| C10 | Report | Finding schema: ID, severity, category, location, source rule, evidence, correction | FR-8 | **Partial** | Prototype findings carry file and line, code, rule, cited source, reason and suggestion ([`docs/DESIGN-REVIEW-DEMO.md`](../DESIGN-REVIEW-DEMO.md)). Severity is deliberately `'not assigned: left for the reviewer'`: [`review/report.mjs:61`](../../review/report.mjs#L61). |
| C11 | Report | Corrections that use only existing tokens and components, checked by the adherence rules | FR-9 | **Missing** | Nothing generates fixes or checks them. Depends on C5. |
| C12 | Report | Summary, findings ranked High to Low, list of what was not checked | FR-10; NFR Usability | **Partial** | The prototype writes Markdown and JSON with a "Could not check" section, and says "This is not a pass" when nothing is found: [`review/report.mjs:30`](../../review/report.mjs#L30), [`:132`](../../review/report.mjs#L132). Findings are grouped by rule, not ranked by severity: [`:60`](../../review/report.mjs#L60). |
| C13 | Whole flow | Read-only guard: no file changes | FR-12; NFR Security | **Implemented (prototype)** | Reads only through `git cat-file`; refuses an output folder inside the reviewed repo (`OutputRefused`); [`tests/design-review-safety.test.mjs`](../../tests/design-review-safety.test.mjs). Not yet applied to the design-system repo. |
| C14 | Whole flow | Per-review log of checks, findings, errors, time and cost | NFR Logging; NFR Performance; T7 | **Missing** | The prototype writes a report but no run log, timing or cost. |
| C15 | Code checks | Headless browser to render pages | FR-5; deferred visual review; T8 | **Available, not granted** | Platform root `package.json:34` has `"playwright": "^1.58.2"`. Capture scripts at `scripts/captureProductionScreenshots.js` and `scripts/captureHelpers.js`. Declared tools `headless_browser_sandbox` and `screenshot_capture_sandbox` have 0 implementations. |
| C16 | Code checks | Accessibility rule engine | FR-4 to FR-6 | **Available, not granted** | `frontend/package.json:38` has `"axe-core": "^4.11.1"`, used in `frontend/src/components/campus/__tests__/campusA11y.test.tsx:16`. Declared tool `accessibility_rule_engine` has 0 implementations. |
| C17 | Verification | Seeded test pages with planted issues; KPI harness | Section 9; US-5 | **Partial** | The prototype has fixtures ([`tests/fixtures/design-review/`](../../tests/fixtures/design-review/)) and 21 passing tests (run 2026-11-01: `node --test tests/design-review.test.mjs tests/design-review-safety.test.mjs`, 21 pass, 0 fail). No seeded design-system pages exist; nothing measures the section 9 KPIs. |
| C18 | Host | Runtime, model and how the agent is started | T5; T6 | **Decision needed** | See section 3. |

### Counts

18 components:

| Status | Count |
|---|---|
| Implemented (prototype) | 1 |
| Partial | 7 |
| Missing | 7 |
| Available, not granted | 2 |
| Decision needed | 1 |

**For the BRD agent itself, 0 of 18 components are built.** Every "Implemented" or "Partial"
status refers to prototype code that targets platform `.tsx` files.

---

## 2. Key gaps and technical dependencies

### Gaps

| ID | Gap | Affects | Evidence |
|---|---|---|---|
| G1 | **The adherence rules cannot check the BRD's input.** `_adherence.oxlintrc.json` is made of oxlint selectors over JS/JSX syntax (`Literal[value=...]`, `JSXOpeningElement[...]`). Training Site pages are plain HTML with an external `site.css`. Raw hex, px and font values in `.html` or `.css` files are outside what those selectors read. | FR-3, FR-9; question T2 | Design-system `_adherence.oxlintrc.json`; `Training Site/blog.html` (no inline `<style>`, no JSX) |
| G2 | **Pages reference files that are not in the repo.** `Training Site/blog.html` links `../components.css` and loads `../motion.js`. Neither file exists in the repo tree. | Rendering; C6, C7, C15; question T3 | Design-system repo tree at `9b8a6ec6` |
| G3 | **The prototype targets a different product.** It reviews platform `.tsx` files against platform-derived draft rules. Reusing it for the BRD needs a new input type (`.html`), a new rules source, and HTML/CSS parsing. | C1, C3, C4, C8 | [`review/review-page.mjs`](../../review/review-page.mjs), [`review/rules/admin-portal.draft.rules.json`](../../review/rules/admin-portal.draft.rules.json) |
| G4 | **Two severity models.** The BRD rates High, Medium or Low. The prototype refuses to rate until Aleem decides. | FR-4 to FR-8 | BRD section 6; [`review/report.mjs:61`](../../review/report.mjs#L61) |
| G5 | **Two WCAG levels.** The platform skill says 2.1 AA; the design system says 2.2. | FR-4, FR-5; question T1 | Platform `.claude/skills/fixing-accessibility/SKILL.md:3`, `:7`; design system `readme.md:17` and platform copy `frontend/public/knowledge/design/BRAND.md:227` |
| G6 | **No model, prompt or judgment rules.** | FR-7; question T5 | Section 3 below |
| G7 | **No seeded test set or baseline.** The section 9 KPIs cannot be measured. | Section 9; US-5 | C17 |

### Dependencies

| ID | Dependency | Needed for | State |
|---|---|---|---|
| D1 | Confirmation of the target repo, and that it is `Colaberry-DS-School-Final` | Everything | Pending (B1, Q1) |
| D2 | A way to run the adherence rules against HTML/CSS: oxlint on extracted code, or equivalent checks written for CSS | FR-3, FR-9 | Not designed. Adding oxlint is a new external dependency, so it needs approval |
| D3 | The missing `components.css` and `motion.js` | Rendering, contrast, focus | Pending (T3) |
| D4 | Headless browser (Playwright exists on the platform) | FR-5 exact sizes; reliable FR-4 | Pending (T8) |
| D5 | Model and runtime | FR-7 | Pending (T5, T6) |
| D6 | A reviewer to rate precision | Section 9 | Pending (B4) |

---

## 3. ProductExperienceDomainAgent: can it host the proposed agent?

**Short answer: not as it stands, and version 1 does not need it to.**

### What exists

| Fact | Evidence (platform at `9d9aa3c3`) |
|---|---|
| Registered as `ProductExperienceDomainAgent`, category `website_intelligence`. It owns "the brands and websites the platform publishes to, and the checks run across them". | `backend/src/services/agentRegistry/domainAgents.ts:153-161` |
| Release Zero floor: `enabled: false`, `tools_granted: []`, `trigger_type: 'event_driven'`, empty schedule; autonomy classifies to `observe` | `backend/src/services/agentRegistry/domainAgents.ts:66-72`, header comment `:22-37` |
| Tests fail if it is enabled, given tools, put on a schedule, or given a `system_prompt` | `backend/src/services/agentRegistry/__tests__/domainAgents.test.ts:51-89` |
| 25 capabilities declare 21 tool names, all `draft`. The names include `repo_read`, `contrast_calculator`, `accessibility_rule_engine`, `headless_browser_sandbox` and `report_renderer`. | `backend/src/services/agentDomain/capabilities/product_experience.json` (parsed) |
| 0 of the 21 tool names appear in non-test TypeScript under `backend/src` | `git grep` for each quoted name at `9d9aa3c3` |
| A tool-request path now exists (AF7.1, 2026-10-30). Not covered in the discovery docs. | Commit `e1ba08c6`: `backend/src/services/agentDomain/agentChangeRequestService.ts`, `backend/src/schemas/agentChangeRequestSchema.ts` |

### Fit with the BRD

- **The purpose fits.** The agent's description covers brand and website checks.
- **The target does not fit.** Every declared input and tool points at the platform's own
  frontend source. Nothing declared reads an external repo such as `Colaberry-DS-School-Final`.
- **The agent cannot act today.** It has no prompt, no tools and no trigger, and tests enforce
  all three.

### What hosting would require

1. A `system_prompt`, persona and role charter. Adding a prompt means changing the test that
   currently forbids one.
2. Tool grants through AF7.1, approved by a manager.
3. A read tool for an external repo, or a vendored copy of the design system inside the platform.
4. An admin login with a scoped role for Mohammed Abdul Aleem. Per
   [`docs/discovery/02-agent-anatomy.md`](../discovery/02-agent-anatomy.md) (source A9, at `48e7c07`),
   he has none. Not re-checked at `9d9aa3c3`.
5. A decided boundary with Website Portfolio & Conversion over the brand apps (anatomy source A22).

### Recommendation

Build version 1 as a standalone, review-only tool in this repo, the way the prototype runs.
Treat hosting inside `ProductExperienceDomainAgent` as a later step that needs Aleem's approval
and the five items above. This answers T6 provisionally. The decision is still Aleem's.

### Not re-checked at `9d9aa3c3`

These claims rely on [`docs/discovery/02-agent-anatomy.md`](../discovery/02-agent-anatomy.md) at `48e7c07`:

- the prompt builder (`agentSystemPrompt.ts`);
- the approval-gated memory (`AgentMemoryProposal`);
- the manager middleware (`agentManagerAuthMiddleware.ts`, unchanged between the two commits);
- the manager's missing admin login.

AF7.1 and the `visual/` engine were not read in depth.

---

## 4. Corrections found during the review

These affect the BRD (for v0.3) or the discovery docs. None has been applied to either.

| # | Finding | Where it applies | Evidence |
|---|---|---|---|
| K1 | The BRD never names the design-system repo. At least ten candidates exist. | BRD sections 2 and 10 | GitHub search, `aleemcolaberry/*` |
| K2 | The "Agent architecture tab" referenced in section 5 is not in the document. | BRD section 5 | `.docx` contents |
| K3 | "20 components" is correct: 20 `.prompt.md` and 20 `.d.ts` files. The 21st `.jsx` is `_standalone.jsx`, not a component. | BRD section 2 | Design system `components/core/` |
| K4 | "245 tokens" comes from `readme.md:64`, `:83` and `:94`. I counted 237 `--` declarations in `tokens/*.css`: 135 colours, 66 spacing, 36 typography. The difference has not been resolved. | BRD section 2 | Design system `tokens/` |
| K5 | The adherence file's rules are JSX-only (G1). The BRD lists whether it is current as the open point; whether it can read HTML is a second one. | BRD section 2, T2 | Design system `_adherence.oxlintrc.json` |
| K6 | An accessibility engine **does** exist: `axe-core`. Discovery source A30 and the capability file say it does not. | [`docs/discovery/02-agent-anatomy.md`](../discovery/02-agent-anatomy.md) A30; platform `product_experience.json:426`, `:2921` | `frontend/package.json:38` |
| K7 | The platform vendors a copy of the design system, `colaberry-design-system` v1.0.0, at `frontend/public/knowledge/design/`. It has no `Training Site/` or `app/`. This is a third option for B1. | BRD B1 | Platform `frontend/public/knowledge/design/package.json` |
| K8 | A tool-request workflow (AF7.1) landed after the discovery docs were written. | [`docs/discovery/02-agent-anatomy.md`](../discovery/02-agent-anatomy.md) section 5 | Commit `e1ba08c6` |

---

## 5. Open questions for Mohammed Abdul Aleem

The questions marked "changes scope" alter what gets built, so they come first.

| # | Question | BRD ref | Why it matters |
|---|---|---|---|
| Q1 | Is `aleemcolaberry/Colaberry-DS-School-Final` the repo version 1 should review? Or the portal, or the copy vendored in the platform at `frontend/public/knowledge/design/`? | B1 | **Changes scope.** Decides the input type (HTML or TSX) and the rules source. |
| Q2 | WCAG 2.2 AA (design system) or 2.1 AA (platform skill)? | T1 | **Changes scope.** Sets the thresholds and the severity of every accessibility finding. |
| Q3 | Is a report enough for version 1? | B2 | **Changes scope.** Confirms review-only. |
| Q4 | Is `_adherence.oxlintrc.json` current? Since its rules read JSX only, should the agent apply equivalent checks to HTML and CSS? | T2 | Decides how FR-3 and FR-9 are built (G1). |
| Q5 | Where are `components.css` and `motion.js`, and do the pages need them to render? | T3 | Blocks contrast and focus checks on rendered pages (G2). |
| Q6 | Should findings carry High / Medium / Low severity in version 1? The prototype holds back severity pending your decision. | Section 6 | Resolves G4. |
| Q7 | Is a headless browser acceptable? Playwright already exists on the platform. | T8 | Decides whether FR-5 is exact or CSS-only. |
| Q8 | Which model and environment, and is there a time or cost limit per review? | T5 | Blocks FR-7. |
| Q9 | Should version 1 run standalone, with `ProductExperienceDomainAgent` hosting it later? | T6 | Section 3 recommends this. |
| Q10 | Who rates precision and gives feedback? | B4 | Needed for the section 9 KPIs. |
| Q11 | Which token count is authoritative: 245 (readme) or the 237 declarations in `tokens/*.css`? | Section 2 | Small, but the BRD states it as Confirmed. |

---

## 6. Recommended implementation priorities

These are recommendations, not approved work. Each step stays review-only and changes no files
in the reviewed repo.

| Order | Work | Covers | Depends on |
|---|---|---|---|
| 0 | Get answers to Q1, Q2 and Q3. Name the repo and pinned commit in BRD v0.3. | B1, T1, B2 | Aleem |
| 1 | Build a seeded test set first: a few design-system-style pages with a known list of planted issues for each check, plus one clean page. | Section 9, C17 | Q1 |
| 2 | Extend the prototype's input to `.html` in the target repo, keeping its path refusals, pinned-commit reads and read-only guard. | FR-1, FR-12; C1, C13 | Q1 |
| 3 | Load rules from the design-system repo on each run: tokens from `tokens/*.css`, fonts and props from `_adherence.oxlintrc.json`. Keep the prototype's rule that every rule cites its source. | FR-2; C3 | Q4 |
| 4 | Static checks on HTML and CSS: raw hex, raw px, fonts, image alt text, heading order. | FR-3, FR-6; C4, C5, C8 | Steps 2–3; Q4 |
| 5 | Finding schema and report: add IDs, category and (if approved) severity; list everything not checked. | FR-8, FR-10; C10, C12 | Q6 |
| 6 | Per-review run log: checks run, errors, time. | NFR Logging; C14 | Q7 for storage location (T7) |
| 7 | Contrast, focus and target size, using a headless browser if approved. | FR-4, FR-5; C6, C7, C15, C16 | Q2, Q5, Q7 |
| 8 | Fix suggestions validated against the adherence checks. | FR-9; C11 | Step 4 |
| 9 | Judgment review using a model, labelled "Judgment" and never rated High. | FR-7; C9 | Q8 |
| 10 | Request handling: clarify and decline. | FR-11; C2 | Q8, Q9 |
| Later | Hosting inside `ProductExperienceDomainAgent`. | Section 3 | Q9; Aleem's login; AF7.1 grants |

**Why this order.** Steps 1 to 6 are deterministic and need only Q1 to Q4 and Q6, so they produce
measurable results early. Rendering (step 7) and the model (steps 9 and 10) are where most of the
open decisions sit, so they come later and do not block the rest.

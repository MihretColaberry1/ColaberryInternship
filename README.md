# Product Experience & UI/UX: Command Center

The Command Center for the `product_experience` agent domain: a six-panel console for the human
who governs this domain's agent. **A human governs agents; this console is designed to support
that.** It is read-only. It shows what the platform has actually produced and says, in words, what
it cannot show yet.

- **Current brief:** [docs/stories/STORY-000.md](docs/stories/STORY-000.md) (2026-11-03). The earlier
  nine-tab brief is kept as [superseded](docs/stories/STORY-000.superseded-2026-10.md).
- **Evidence for review:** [docs/evidence/](docs/evidence/): the
  [traceability table](docs/evidence/traceability.md), the [state matrix](docs/evidence/state-matrix.md),
  [screenshots](docs/evidence/screenshots/), the [accessibility pass](docs/evidence/a11y/README.md) and the
  [design rationale](docs/evidence/design-rationale.md).

## Run it and review it

The page is static HTML and JavaScript modules. It needs a local web server, because browsers block
a page opened from disk from reading its data files.

```bash
# from the repository root
python -m http.server 8000
# then open http://localhost:8000/
```

- No sign-in is needed to view it, and it never calls the platform.
- **Theme:** light only, built on the Colaberry design-system tokens (pinned in
  `command-center/sources/SOURCES.json`). The design system's dark set is partial, so no dark theme is
  offered until one can be built from its own values.
- **Font:** the design system's `--font-body` names Roboto first, but Roboto is not loaded. It would
  come from the Google Fonts CDN, an external dependency pending a decision from Aleem or Ali, so the
  page shows the system font the token falls back to.
- **Widths:** to review at phone, tablet and desktop widths, use the browser's device toolbar
  (390, 820 and 1440 px are the widths in the evidence).
- **Detail pages:**
  - `#/capability/<id>`, for example `#/capability/product_experience.design_token_drift_audit`;
  - `#/rung/autonomy:R1`;
  - `#/story/STORY-000`;
  - the operator guides `#/guide/capture`, `#/guide/requests` and `#/guide/refresh`.
- **State matrix:** `http://localhost:8000/docs/evidence/state-matrix.html` renders every panel in every
  state from labelled fixtures.

**Published link:** not published yet. GitHub Pages is not enabled on this repository, and
publishing waits for Mihret's approval and a choice of branch (see "Publishing" below).

## The six panels, in the brief's order

The order and the numbers are the STORY-000 brief's, the same in every domain (Aleem's review of
PR #1, 2026-11-08). A case for showing the governance queue second is written up as a
[proposal for the brief's owner](docs/evidence/panel-order-proposal.md); it is not applied here.

| # | Panel | Question | One primary action |
|---|---|---|---|
| 1 | Your employee | Does it exist, and what is it allowed to do? | Capture this panel with your own sign-in (today) |
| 2 | Your capability inventory | What am I actually building? | Review a draft capability |
| 3 | The autonomy ladder | Where is this going? | See how the R2 cap would apply |
| 4 | Per-rung behaviour | What does the next rung require of me? | Read what autonomy:R1 requires |
| 5 | Your governance queue | What am I waiting on a human for? | Capture this panel with your own sign-in (today) |
| 6 | What is not available | What would I be lying about? | Refresh the data from the portal |

Each panel shows:
- a state chip: Loading, Ready, Empty, Not available or Error;
- a one-line headline and a few at-a-glance facts;
- the endpoints it reads;
- its long content in collapsed disclosures.

The primary action changes with the state. For example, once a snapshot exists, Panel 1's action
becomes "See what is blocking an agent". Every design choice is in the
[design rationale](docs/evidence/design-rationale.md).

## Content inventory: the nine tabs, mapped to six panels

Every element of the old console (commit `f572e88` plus the uncommitted Agent domain tab), and
where it went. **Dropped** items are gone from the page; the reason is given.

| Old tab | Element | Now | Why |
|---|---|---|---|
| Header | "Data as of" stamp and the over-a-week warning | Header, unchanged | Every panel's age depends on it |
| Header | Sample / Real switch | **Dropped** | Aleem: do not invent values. Sample data looked like data. Every placeholder is now labelled where it appears |
| Header | Tab bar | **Dropped** | Aleem: panels at a glance, not hidden behind tabs, and not kept side by side |
| Overview | Stories verified, criteria passed, points awarded | 2 Inventory: glance lines "Verified by the platform" and "Ticks ahead of verifier", and "Stories: your ticks and the platform verifier" | What is being built |
| Overview | Project plan (name, repository, plan version and hash) | Header title; plan version **dropped** | The console is about one domain; the plan hash adds nothing an operator acts on |
| Overview | Schedule and milestones | 2 Inventory: "Schedule and milestones" | |
| Overview | Release cards and progress bars | 2 Inventory: "Release timeline" | One timeline replaces three cards |
| Overview | "What is live: agents and systems" | 1 Employee details ("Registry entry, manager access and runs") and 6 Not available (systems) | |
| Overview | Story, criteria and points detail pages | Merged into one stories table; the story page stays at `#/story/<id>` | Three tables of the same rows became one |
| Outcomes | Measures (none in the plan) | 6 Not available: "Not in the project plan yet" | An empty tab is a named gap |
| Users and use case | Roles (none in the plan) | 6 Not available | Same |
| Guardrails | SAFE requirements (none in the plan) | 5 Governance: "Guardrails waiting on a human" | A guardrail is a human decision |
| Guardrails | Draft REQ-001 and its five-step status | 5 Governance: same disclosure, and the glance line "Sign-off waiting" | It waits on the accountable manager's R0 sign-off |
| Systems | Systems named in the plan (none) | 6 Not available | |
| Project management | Release Gantt | 2 Inventory: "Release timeline" | |
| Project management | Every-task table (due, first given, change, past due) | 2 Inventory: "Stories: your ticks and the platform verifier" | |
| AI agents | Story-owner roster ("owners, not agents") | **Dropped** | Beside "Your employee" it read as a second agent list. The real agent is Panel 1 |
| AI agents | "No runs recorded" | 1 Employee details: "Registry entry, manager access and runs" (moved from the glance on 2026-11-10) | |
| Knowledge base | "Ask about this project" (keyword questions) | **Dropped** | It answered by naming tabs that no longer exist. Everything it answered is now visible at a glance |
| Knowledge base | Requirements and traceability | 2 Inventory: "Requirements and which stories cover them" | |
| Knowledge base | Stories table | Merged into the stories table | Duplicate |
| Knowledge base | Decisions and notes (`notes.json`) | 5 Governance: "Decisions recorded in this repo" | |
| Data model | Domain tables (none derived) | 6 Not available | |
| Data model | "The data behind this Command Center" cards | **Dropped** from the page; documented under "Data dependencies" below | Contract documentation, not something an operator governs |
| Agent domain | Panels 1 to 6, the capability, rung and source-tag pages | The console itself | |

## Data dependencies

| Source | Feeds | State today |
|---|---|---|
| `.colaberry/plan.json`, `progress.json`, `manifest.json` (written by the platform on "Sync from GitHub") | Header stamp; Inventory stories, releases, requirements, schedule; Governance guardrails; Not available plan gaps | Committed. Data as of 30 October 2026 (see the header). `progress.json` still holds the earlier five STORY-000 criteria: a sync should bring the six |
| `command-center/sources/product_experience.capabilities.json`, pinned at platform `9d9aa3c3` and checked against its git blob by a test | Inventory, Ladder, Behaviour, the capability and rung pages | Committed |
| `command-center/notes.json`, `command-center/draft-guardrails.json` | Governance | Committed |
| `.colaberry/agent-domain.json`, the platform's committed snapshot of its endpoints (written by the platform's sync; dated by `manifest.json`) | Panel 1 (the agent fields), Panel 5 (`governance.requests`), Panel 6 (the verifier's reasons for plan stories, and which `authority` sections are present) | Committed. `authority[]` and `authority_rule` are present but **not displayed**, pending the platform's extended capability projection |
| The `verification` block the platform writes into each story in `progress.json` | Panel 2 ("Platform verifier" column and glance) and Panel 6 (ticks ahead of the verifier) | Committed. Kept separate from your own ticks (`criteria[].passed`) everywhere |
| `command-center/snapshots/product_experience.endpoint-snapshots.json`: a redacted capture, git-ignored until reviewed | Panels 1 and 5, and the `/coverage` check | **Not captured** |

### Whether an agent is linked: the live endpoint, not the registry

The platform registry (`agentDomainRegistry.ts`) still has `agent_id: null` for product_experience.
That is a **seed value the platform does not keep current** for this domain:
- it fills the value only for learner_success and curriculum;
- it deliberately does not write the other domains' agent ids back, because they differ per
  environment (`agentDomainAgentLink.ts`, lines 9 to 22, at platform `cc1ebc55`).

The platform links the agent in `agent_domain_projects.agent_id`, and
`GET /api/admin/agent-domains-mine` reads that column. So the console treats the endpoint as the only
source for whether an agent is linked:

| Case | What the console says |
|---|---|
| The endpoint returns an `agent_id` | Linked |
| The endpoint returns `null` | Not linked |
| Not captured, or this domain is not in your list | "Not captured" or "Unknown"; never "none" |

The registry value is shown only with the label "Registry seed value, not kept current for Product
Experience & UI/UX".

**Linking an agent grants nothing.** It does not change the agent's enabled state, autonomy level or
tools. Every capability stays at `autonomy:R0` until a named human approves otherwise.

This repository never edits the registry and never writes an agent id into it.

### Record IDs are withheld on the page

The pinned research file's `manager_has_no_admin_login` blocker includes a staff member's internal
`org_members` record ID. The page first showed it as "[record ID withheld]"; since 2026-11-10 the whole
blocker is shown only as a neutral sentence (next section). Only the display changes: the
research file is kept exactly as the platform wrote it, because a test checks it against the
platform's copy. `tests/record-id-exposure.test.mjs` renders every page a visitor can reach and fails
if any UUID-shaped value appears.

The same ID is also in files the platform's sync writes (`.colaberry/plan.json` and the capability
story files), and those are already on `main`. Removing it there is the platform's decision: see
question 8 in [the plan](docs/stories/STORY-000-agent-domain-plan.md#5-questions-still-open).

### No manager name or account-access records on Panels 1, 2 and 6 (2026-11-10)

Mihret's decision D4: this public page does not name the accountable manager or describe anyone's
admin-portal account records.
- A blocker that describes account records (for example `manager_has_no_admin_login`) is shown as
  **"Accountable manager access: Not configured in the admin portal."** on Panel 1, Panel 6 and every
  capability page's "Blocked by" list. Two such blockers on one capability are shown once.
- The manager's name is read from the pinned file's `accountable_human`, not written into the code, and
  replaced with "the accountable manager" in Panel 2's story titles and on every story page. With no name
  list loaded, Panel 2 shows story ids instead of titles, and a story page waits.
- Display only: the pinned research file and the platform-written plan are unchanged.
- `tests/panels-1-2-6.test.mjs` fails if Panels 1, 2 or 6, a story page, or a capability page's "Blocked by"
  list shows the name, account records, an email address or a record id.
- **Panels 3 to 5, wording only (Mihret's correction, later on 2026-11-10):** the governance panel's sign-off
  line reads "Accountable manager's R0 sign-off", and the behaviour criteria in `release_behaviour[]` (Panel 4,
  the rung pages and each capability page's behaviour table) say "the accountable manager". Their logic, data
  sources and platform integration are unchanged.
- **The capture guide** refers to "the platform owner" instead of a staff name; its instructions are unchanged.
- `tests/public-privacy.test.mjs` renders all 6 panels and all 70 detail and guide pages and fails on a
  personal name, an email address, a record id or a person's account-state records.

### Your ticks and the platform verifier (2026-11-10)

Two records about the same story, never merged (Mihret's decision D2):
- **Your ticks:** the `passed` flags you set in `progress.json`.
- **Platform verifier:** the `verification` block the platform writes into the same file.

Panel 2 shows them in separate columns and glance lines ("Verified by the platform: 6 of 32 plan stories";
"Ticks ahead of verifier: STORY-000: 5 of 6 ticked locally; platform verifier 0 of 6"). Panel 6 lists each
story whose ticks are ahead, with the verifier's own reason from the platform snapshot. The verifier's
per-rung records are left for the per-rung behaviour panel.

### Missing endpoints and fields

This table describes the separate capture route (a redacted snapshot under your own sign-in). Since the
platform's sync of 2026-11-04, Panels 1 and 5 read `.colaberry/agent-domain.json` instead, so on today's
page Panel 1 shows the agent's recorded fields and Panel 5 reads the synced request list. The capability
projection for Panels 3, 4 and 5 is being extended by the platform; until its structure is confirmed those
panels are unchanged.

| What | Waiting for | Panel shows now |
|---|---|---|
| `GET /api/admin/agent-domains-mine` | A capture with the reviewed v4 snippet, under Mihret's own sign-in (Ali Muwwakkil approved the method on 2026-11-02, with two conditions) | 1: "Not available" |
| `GET /api/admin/agent-domain-change-requests-mine` | The same capture | 5: "Not available" |
| `GET /api/admin/agent-domains/product_experience/coverage` | Not in Ali's approval. The v4 capture does not read it | 2: "/coverage check: Not captured yet" |
| `GET /api/admin/agent-domains/product_experience` | Not in Ali's approval. Its response does not carry the capability records anyway | Values come from the pinned source file, and each panel says so |
| The agent's seven fields (enabled, autonomy level, tools granted, when set, how set) | The v4 capture keeps only whether an agent is linked. Adding them (a v5 capture) needs Ali's approval | 1: "Not captured: not in the captured response" once captured; "Tools granted: Not captured" on Panels 1 and 5 |
| Request titles and dates | Same: v4 keeps only kind and status | 5: "not captured" in those columns |
| Who proposed or decided a request | Ali's answer on whether staff names or roles may be public. Until then every name except Mihret's is withheld | 5: "withheld: identifies a person" |
| `autonomy_level_set_by` | The platform has no column for it | 1: "Not recorded by the platform" |
| An approved autonomy level for any capability | A named human approving one | 3: `autonomy:R0`, "Starting rung — no human approval yet" |
| The employee's current rung | A verified source that records an agent's rung on this ladder. None exists: the agent's `autonomy_level` is a different scale | 3: "Unknown: no source records an agent's rung on this ladder" |

## Tests

```bash
node --test tests/*.test.mjs
```

Pure logic and rendered panels are tested under Node with a small fake DOM (`tests/fake-dom.mjs`). The
evidence capture (screenshots, axe, keyboard) is `tests/evidence/capture-evidence.mjs`. Its header
explains how to run it with tools installed outside this repository.

## Publishing

GitHub Pages is not enabled. Publishing needs three things, each waiting on Mihret's approval:
1. The work committed and pushed.
2. A choice of which branch Pages serves.
3. Pages turned on for that branch.

Aleem asked that branch updates be published to Pages. Until then, review locally as described above.

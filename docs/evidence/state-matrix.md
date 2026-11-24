# State matrix: every panel in every state

**Source:** [state-matrix.html](state-matrix.html) renders the real panel code against nine
scenarios ([state-fixtures.js](state-fixtures.js)). The table below was read from each rendered
panel's `data-state` ([state-matrix.json](state-matrix.json), re-captured 9:46 PM CST on 2026-11-23,
screenshots 9:43 to 9:44 PM CST), not typed by hand. `tests/state-matrix.test.mjs` fails if this table, a
scenario's stated states, and the render ever disagree. Columns follow the brief's panel order. The
platform-synced files are those of 2026-11-23 (3:29 PM CST).

**Changed on 2026-11-23:** Panels 2 to 4 now read the platform's synced capability records, so four rows
changed: "Real sources, nothing captured or synced", "Platform-synced file unreadable", "Pinned source file
missing" (was "Source file missing") and "Synced capability section empty" (was "Source file empty"). The
re-captured JSON matches this table for all nine scenarios.

**Which sources drive which panel (since 2026-11-23):** a personal endpoint capture drives Panel 1 only.
Panels 2 to 4's capability records, Panel 3's authority and Panel 5's governance queue come only from the
platform's synced file (`.colaberry/agent-domain.json`); a capture never replaces them. The pinned research
file supplies only each capability's required tools and blockers, and the list of names this page withholds.

**Live data versus fixtures:**
- **Today** is LIVE DATA, no fixtures. It renders exactly what the console loads on this branch: the
  pinned capability file, the project plan and the platform's synced file. `tests/state-matrix.test.mjs`
  fails if it ever differs from the console.
- **Real sources, nothing captured or synced** uses the same real files with neither an endpoint
  snapshot nor the synced file. No fixture data: those answers are simply absent.
- Every other row is a **FIXTURE**, labelled as one on the page; the console never loads it.
  - **Panel 1** in the "Captured" rows reads a made-up personal capture. Where the panel shows the capture's
    time ("HTTP 200, captured 3 November 2026, 12:00 PM CST"), `labelFixtureCaptureTime()` adds, right after
    it, the label "FIXTURE time: simulated for this review page, not a real capture". No real capture was
    made at that time. The refused row shows no time.
  - **Panel 5** in those rows reads a made-up **TEST DATA** governance queue, run through the console's own
    platform-sync reader and redaction.
  - **Panel 3** in those rows shows the **real** platform-synced authority record (a test checks it
    matches Today).
  - **Panel 5's source wording in those rows is relabelled on this page.** The console's own wording would
    call the made-up rows "the platform's synced snapshot" and give them a last-changed time, so
    `relabelTestDataQueue()` in [state-fixtures.js](state-fixtures.js) swaps three things for TEST DATA
    labels: the source block, the "Reads:" tag for the synced file, and, in the empty rows, the
    headline's "as the platform snapshot records". The rest of Panel 5 is the console's real output for
    those rows. The live wording is in the **Today** row. A test checks that nothing outside the TEST DATA
    note presents the rows as the platform's, or dates them.

| Scenario | 1 Employee | 2 Inventory | 3 Ladder | 4 Behaviour | 5 Governance | 6 Not available | Screenshot |
|---|---|---|---|---|---|---|---|
| Loading | Loading | Loading | Loading | Loading | Loading | Loading | [state-loading.png](screenshots/state-loading.png) |
| **Today (real sources)** | **Ready** (platform sync) | **Ready** | **Ready** (platform authority) | **Ready** | **Empty** (no requests filed) | **Ready** | [state-today.png](screenshots/state-today.png) |
| Real sources, nothing captured or synced | Not available | Not available (no synced capability records) | Not available (no synced capability records) | Not available (no synced capability records) | Not available | Ready | [state-nothing-captured.png](screenshots/state-nothing-captured.png) |
| Captured: no agent; test-data queue empty | Ready ("No agent is linked … in the captured response") | Ready | Ready (real authority) | Ready | Empty (test-data queue) | Ready | [state-captured-empty.png](screenshots/state-captured-empty.png) |
| Captured: agent linked; test-data queue: requests filed | Ready | Ready | Ready (real authority) | Ready | Ready (test data: 1 submitted, 1 declined, 1 withdrawn; every row "Grants: Nothing") | Ready | [state-captured-data.png](screenshots/state-captured-data.png); Panel 5's request tables open: [state-captured-data-requests-open.png](screenshots/state-captured-data-requests-open.png), scrolled to the "Grants" column: [state-captured-data-grants-column.png](screenshots/state-captured-data-grants-column.png) |
| Captured: refused (HTTP 403); test-data queue empty | Error | Ready | Ready (real authority) | Ready | Empty (test-data queue; a refused capture does not change Panel 5) | Ready | [state-refused.png](screenshots/state-refused.png) |
| Platform-synced file unreadable | Error | Error | Error | Error | Error | Ready | [state-sync-invalid.png](screenshots/state-sync-invalid.png) |
| Pinned source file missing | Ready (platform sync) | Ready (synced records) | Ready (synced records) | Ready (behaviour text withheld: no name list) | Empty (no requests filed) | Ready | [state-source-missing.png](screenshots/state-source-missing.png) |
| Synced capability section empty | Ready (platform sync) | Empty | Empty | Empty | Empty (no requests filed) | Ready | [state-source-empty.png](screenshots/state-source-empty.png) |

The table as rendered: [state-matrix-table.png](screenshots/state-matrix-table.png).

**Changes from the 2026-11-10 capture:**
- **"Captured" rows:** each now gives Panel 5 a TEST DATA queue shaped like the synced file, because Panel 5 no longer reads a capture.
- **Refused row:** Panel 5 is now Empty, not Error.
- **New "Platform-synced file unreadable" row:** shows Panels 1, 3 and 5's error state for a bad synced file.
- **"Nothing captured or synced" and "Source file empty" rows:** Panel 3 is now Not available, since without the synced file it has no authority to show and no longer calculates one.

## How each state looks, so no two can be confused

Colours come from the Colaberry design-system tokens; each state is said in words by its chip first.

| State | Chip text | Panel marking | Body |
|---|---|---|---|
| Loading | "Loading" | Grey top border; `aria-busy="true"` | "Reading the sources…" on a grey block |
| Ready | "Ready" | Blue top border | Headline, facts, action, details |
| Empty | "Empty" | Grey top border | A sentence saying what is empty, not an empty table |
| Not available | "Not available" | Dashed amber border on the panel and the block | Missing, Waiting for, Will show, and one next action |
| Error | "Error" | Red top border; the block has `role="alert"` | What failed (with the HTTP status), what the platform said, and one next action |

## States a panel cannot reach, or no scenario shows, and why

| Panel | State | Why |
|---|---|---|
| 2 Inventory, 4 Behaviour | (none: every state is reached) | Since 2026-11-23 their records come from the platform's synced file, so they reach Not available (no synced file, or no capabilities[] in it) as well as Ready, Empty and Error. The `/coverage` check inside a Ready Panel 2 says "Not in the synced file", because the snapshot names that endpoint but carries none of its rows |
| 3 Ladder | (none: every state is reached) | The "Synced capability section empty" row now shows Empty |
| 6 Not available | Empty, Not available, Error (cannot reach) | It reports on the other sources. If the platform's capability records are missing or broken, it says so as its first item rather than going blank |
| 1 Employee | Empty (cannot reach) | A captured response either lists this domain (Ready, with "No agent is linked to this domain in the captured response" when the endpoint returns `agent_id: null`) or does not ("This domain is not in your list", also Ready) |
| 5 Governance | Error from a capture (cannot reach) | Panel 5 reads only the platform's synced file, so a refused capture leaves it unchanged; it is an Error only when that file cannot be used |

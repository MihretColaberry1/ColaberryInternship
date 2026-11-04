# State matrix: every panel in every state

**Source:** [state-matrix.html](state-matrix.html) renders the real panel code against seven
scenarios ([state-fixtures.js](state-fixtures.js)). The table below was read from each rendered
panel's `data-state` ([state-matrix.json](state-matrix.json), captured 2026-11-03), not typed by hand.

**Real data versus fixtures:**
- The **Today** row uses only real sources: the pinned capability file and the project plan, with no
  snapshot.
- Every other row puts **FIXTURE** endpoint responses into a panel. They are labelled as fixtures on
  the page, and the console never loads them.

| Scenario | 1 Employee | 2 Governance | 3 Inventory | 4 Ladder | 5 Behaviour | 6 Not available | Screenshot |
|---|---|---|---|---|---|---|---|
| Loading | Loading | Loading | Loading | Loading | Loading | Loading | [state-loading.png](screenshots/state-loading.png) |
| **Today (real, no snapshot)** | **Not available** | **Not available** | **Ready** | **Ready** | **Ready** | **Ready** | [state-today.png](screenshots/state-today.png) |
| Captured: no agent, nothing filed | Ready ("No agent is linked … in the captured response") | Empty | Ready | Ready | Ready | Ready | [state-captured-empty.png](screenshots/state-captured-empty.png) |
| Captured: agent linked, requests filed | Ready | Ready | Ready | Ready | Ready | Ready | [state-captured-data.png](screenshots/state-captured-data.png) |
| Captured: refused (HTTP 403) | Error | Error | Ready | Ready | Ready | Ready | [state-refused.png](screenshots/state-refused.png) |
| Source file missing | Not available | Not available | Error | Error | Error | Ready | [state-source-missing.png](screenshots/state-source-missing.png) |
| Source file empty | Not available | Not available | Empty | Empty | Empty | Ready | [state-source-empty.png](screenshots/state-source-empty.png) |

The table as rendered: [state-matrix-table.png](screenshots/state-matrix-table.png).

## How each state looks, so no two can be confused

| State | Chip text | Panel marking | Body |
|---|---|---|---|
| Loading | "Loading" | Grey top border; `aria-busy="true"` | "Reading the sources…" on a grey block |
| Ready | "Ready" | Blue top border | Headline, facts, action, details |
| Empty | "Empty" | Grey top border | A sentence saying what is empty, not an empty table |
| Not available | "Not available" | Dashed amber border on the panel and the block | Missing, Waiting for, Will show, and one next action |
| Error | "Error" | Red top border; the block has `role="alert"` | What failed (with the HTTP status), what the platform said, and one next action |

## States a panel cannot reach, and why

| Panel | State not reached | Why |
|---|---|---|
| 3 Inventory, 4 Ladder, 5 Behaviour | Not available | Their records come from a file committed in this repository, so they are either readable (Ready or Empty) or broken (Error). The one part waiting on an endpoint, the `/coverage` check, says "Not captured yet" inside the Ready panel |
| 6 Not available | Empty, Not available, Error | It reports on the other sources. If the capability file is missing, it says so as its first item rather than going blank |
| 1 Employee | Empty | A captured response either lists this domain (Ready, with "No agent is linked to this domain in the captured response" when the endpoint returns `agent_id: null`) or does not ("This domain is not in your list", also Ready) |

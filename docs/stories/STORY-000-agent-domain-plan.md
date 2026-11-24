# STORY-000 (six-panel Agent domain Command Center): status, decisions and plan

**Prepared by:** Mihret Netsereab, with Claude Code (session CC-20261102-1whf) · **2026-11-02**
**Status:** plan for review. Nothing in this file is approved by Aleem, and nothing here grants,
promotes or enables anything.

> **Update, 2026-11-03.** Mohammed Abdul Aleem's answers now settle criterion 4 and the layout. They
> are recorded in the current brief, [STORY-000.md](STORY-000.md), section "Decisions". Where this
> file differs, the brief wins. In particular, section 3 below said the "if approved up to the
> ceiling" example would be removed. Aleem asked to **keep** it on each capability's detail page,
> labelled as hypothetical, and it is kept. The snapshot rules in section 2 are unchanged.

**Scope.** This is the six-panel Command Center described in the STORY-000 brief on the
assignment page (the `#/agent-domain` tab in `command-center/`). It is **not** the standalone
design review tool. Aleem's version 1 decisions for that tool (target repo, WCAG 2.2 AA,
severity levels, vendor-library exclusion, browser checks deferred) are not requirements here.
The one that applies is his request to publish branch updates to GitHub Pages. Ali's token-cascade
answers apply to the design-token drift audit
([definition, revision 3](../definitions/design_token_drift_audit.R0.md)), not to this page.

---

## 1. The six criteria against the current build

| # | Criterion (short form; the portal holds the exact text) | State | What is left |
|---|---|---|---|
| 1 | All six panels render and each names the endpoint it reads | **Built and tested** | Browser check. Test: `tests/agent-domain-panels.test.mjs` |
| 2 | An endpoint that returned nothing says so in words, distinct from loading | **Built and tested on fabricated fixtures** | **Needs real snapshot data**: Ali asked that it be run and the result checked against what each panel needs |
| 3 | All ten rungs in the owner's words, each capability's ceiling marked | **Built** | Browser check. The employee's current rung is labelled "Unknown: no source records an agent's rung on this ladder" (corrected 2026-11-03: the registry's `agent_id: null` is a stale seed value, and the live endpoint shows an agent linked) |
| 4 | Authority shown as `effectiveAuthority()` returns it, including `no_tool_grants` | **Built and tested** to Ali's confirmed interpretation (section 3), 2026-11-02 | Browser check. Test: `tests/agent-domain-tool-rule.test.mjs` |
| 5 | A tool request never implies a grant; change and tool requests shown separately | **Built in code** | **Needs real snapshot data**: no real request has been shown yet |
| 6 | Nothing shown that the domain has not produced; gaps named | **Built**; Panel 1 corrected on 2026-11-02 | Browser check |

Also outstanding: `.colaberry/progress.json` still carries the old five generic criteria. A
"Sync from GitHub" on the portal should bring in the six. Not done yet: syncing needs your approval.

---

## 2. The endpoint snapshot for Panels 1 and 5

**Method: approved by Ali Muwwakkil, 2026-11-02, subject to the two conditions below.**
**Capture: not yet run.**

**Why a snapshot is needed at all** (Ali Muwwakkil, email to Mihret, copied to Aleem, 2026-11-02):
the Command Center page is public, and Panels 1 and 5 read admin endpoints that a public page
cannot call and should not be able to call. "That is not a gap in your build, it is the access
boundary working." A saved snapshot of those responses is the intended pattern, not a
workaround. Ali approved capture as the method.

**Endpoints in scope:** `GET /api/admin/agent-domains-mine` (Panel 1) and
`GET /api/admin/agent-domain-change-requests-mine` (Panel 5).

**Condition 1: read-only, from Mihret's own signed-in session.**
- The capture may only read endpoints and write one file. It must not POST, PATCH or DELETE.
- It runs only under Mihret's own login, never anyone else's.
- Ali: "The first is easy to comply with by accident, the second is easy to breach by accident."

**Condition 2: nothing that identifies another person goes into the repository.**
- Before anything is committed, every learner name, email address and individual record is
  redacted or aggregated. Ali: "Your repository is a real repository and a snapshot is a file that
  lives forever."
- **If redaction would empty a panel, stop and tell Ali.** He will add a shaped endpoint instead.
  The page does not publish something that should not be public.

**Ran versus checked: kept separate on purpose.**

| Step | State on 2026-11-02 |
|---|---|
| Capture script matches the reviewed version | Confirmed by Claude, as reported to Ali. The script is held outside this repo |
| Capture script passes syntax validation | Confirmed. **This proves only that the file parses**, not what the endpoints return |
| Capture run under Mihret's own session | **Not run** |
| Response checked against what each panel needs | **Not done** |
| Response redacted and reviewed before commit | **Not done** |
| Page checked in a browser rendering the snapshot | **Not done** |

Until the capture is run and checked, Panels 1 and 5 keep saying **"Not captured yet"**. If a
real response comes back empty, the panel says so in words, distinct from loading (criterion 2).

**Capture script inspected 2026-11-02 (not run): Step 3 is stopped.** The script is
`C:\Users\mihre\Downloads\product_experience-capture-snippet-v3.js`, held outside this repo. A
byte-identical copy sits beside it as `product_experience_snapshot_v3.js` (same SHA-1, `5ef5710a`).

| Check | Result | Evidence in the script |
|---|---|---|
| Every request is GET | **Pass** | One `fetch()`, `method: 'GET'` (lines 89 to 90) |
| Only the two approved endpoints | **Fail** | It calls four: also `GET /api/admin/agent-domains/product_experience` and `.../coverage` (lines 30 and 34) |
| No body, no POST, PATCH, DELETE or other write | **Pass** | No `body`, no other method, no other network call; `redirect: 'error'` |
| Writes one file outside the repo | **Pass, with a condition** | One browser download, `product_experience.endpoint-snapshots.json` (lines 146 to 152). Where it lands is set by the browser, not the script |
| No one else's login | **Pass, with a condition** | It reads `admin_token` from the tab's own `localStorage` and sends no cookies. It uses whoever is signed in on that tab, so it must be Mihret's own tab |
| No stage, commit, push, sync or publish | **Pass** | Browser-only code with no access to git or the portal's sync |

**What has to change before Step 3:** a version 4 of the script that calls only the two approved
endpoints. That is a change to a file outside the repo, and it needs Mihret's approval.

**What the script already strips, before anything is saved:** it saves no raw response. It keeps,
for this domain only, `agent_id` as `[present]` or null, and for each request only `kind`,
`status` and whether a proposer or decider is recorded (`[redacted]`). It saves no names, emails,
IDs, titles, reasons, times, headers, cookies or tokens. So it is stricter than the redaction guard,
and Panel 1's seven agent fields and Panel 5's titles and times would show as not captured.

**Redaction guard updated 2026-11-02:**
- **Request IDs are removed.** Panel 5 never displays them, and each one is the key to a platform
  row that holds the requester's and decider's emails.
- **`agent_id` is kept only as `[present]` or null.** Panel 1 needs to know whether an agent
  exists, not which database record it is, so the record key itself is never stored.

**Separate source to check after a sync:** the platform also writes `.colaberry/agent-domain.json`
on sync (schema `colaberry.agent-domain/v1`). It is not in this repo yet. Once synced, it will be
checked for the same two conditions before the page reads it.

---

## 3. Criterion 4: Ali's confirmed interpretation

**The fact.** Every one of the 25 product_experience capabilities starts at `autonomy:R0`
(capability source file, pinned). Programme-wide, Ali reports all 443 capabilities across the ten
domains start at `autonomy:R0`. No approval above that is recorded anywhere: the platform's coverage
endpoint returns `effective_authority: null` on every row.

**So the criterion's scenario cannot occur today.** `effectiveAuthority()` holds a capability at
`autonomy:R2` with reason `no_tool_grants` only when its approved level is above R2 and no tools
are granted. Nothing is above R2, so the rule constrains nothing. No builder can produce that
state, and Ali said not to try: he is rewording the criterion.

**What the page will show (the honest version, per Ali):**
1. **The rule**, in words and with its source: above `autonomy:R2` with no tools granted,
   `effectiveAuthority()` returns `autonomy:R2` with reason `no_tool_grants`
   (`autonomyLadder.ts`, ported in `command-center/authority.js`).
2. **That it constrains nothing today**, stated plainly.
3. **Why:** every capability starts at R0 and none is approved above R2, so there is nothing
   for the rule to hold back. The tools needed above R2 are listed, and none is granted.

**What the page will not do:** invent an approval, render a capability as if it were above R2,
or show progress as authority. Each capability's authority stays "None (no approved autonomy)",
which matches the platform's coverage endpoint. The existing "if a human approved it up to its
ceiling" example on each capability's detail page builds toward the scenario Ali said not to force,
so it is removed in plan step 1.

**Interpretation status: confirmed by Ali Muwwakkil, 2026-11-02.** His words: "Do not spend time
trying to make that panel satisfy it. I am rewording the criterion. Show the rule and that it
currently constrains nothing, and say why, which is the honest version of that panel." When the
reworded criterion text appears on the portal, this section is checked against it.

---

## 4. Plan, in order (each step waits for your approval)

**Done 2026-11-02:** steps 1 and 2 (approved by Mihret). Steps 3 to 8 have not started.

| Step | What | Files | Needs |
|---|---|---|---|
| 1 | **Criterion 4 display:** a rule statement in Panel 2 (or Panel 6) saying the rule, that it binds nothing today, and why. Remove the "if approved up to the ceiling" example from the detail pages (section 3). Tests check the statement and that no capability shows authority above "None". | `agent-domain-facts.js`, `agent-domain-panels.js`, `agent-domain-model.js`, `tests/agent-domain-authority.test.mjs` | Your approval |
| 2 | **Redaction guard, before any capture:** a test that fails if a committed snapshot contains an email address, or a person's name not on an explicit allow-list. A redaction step that replaces them with a role or a count. | new `command-center/agent-domain-redact.js`, `tests/agent-domain-redact.test.mjs` | **Done.** Staff identities are withheld and no roles are emitted until Ali answers question 1 |
| 3 | **Run the capture:** your session, GET only, the two endpoints above. Save outside git first. | none committed | **Stopped:** the v3 script calls four endpoints (section 2). Needs a two-endpoint version and your explicit approval |
| 4 | **Check what came back** against each panel's fields. Redact. If redaction empties a panel, stop and write to Ali. | none committed until reviewed | Step 3 |
| 5 | **Commit the redacted snapshot** and point the page at it. Un-ignore only that one file. | `.gitignore`, snapshot file, `agent-domain-data.js` | Your review of the redacted file |
| 6 | **Sync from GitHub** on the portal to bring in the six criteria (and `.colaberry/agent-domain.json`). | `.colaberry/*` (platform-written) | Your approval |
| 7 | **Browser check:** all six panels, Real and Sample modes, detail pages. Screenshots beside the endpoint responses they were built from. No admin sign-in is needed to view the page. | none | Steps 1 to 5 |
| 8 | **Tick only the criteria that are true**, commit with `Story: STORY-000`, then push and GitHub Pages. | `.colaberry/progress.json`, session log | Your review of the exact commit contents; the Pages branch |

---

## 5. Questions still open

Ali has already answered the snapshot method and the Criterion 4 interpretation (sections 2 and 3),
so they are not listed here. These are the questions nobody has answered yet:

1. **Panel 5 and staff names (Ali's condition 2).** The brief asks Panel 5 to show who proposed
   and who decided each request. Ali's condition names learners' names, emails and individual
   records. It does not say whether staff names and roles (for example the accountable manager
   who decided a request) may appear in a public repository, or must also be anonymised or
   aggregated. **Ali's to answer.** Until he does, every name other than Mihret's is redacted.
2. **Which branch GitHub Pages serves** (`main`, or this branch). Pages is not enabled yet.
3. **Whether the uncommitted Agent domain files may go into the eventual commit.** They are work
   from session CC-20261031-agr4, and the six-panel work cannot be committed without them.

**Added 2026-11-03, after the agent-link investigation. Pending confirmation; not sent to anyone.**
The console does not wait on these. Until they are answered, it says "Not captured" or "Unknown"
rather than guessing.

4. **The linked agent (Aleem or Ali).** The live endpoint shows an agent linked to
   product_experience; the platform links `ProductExperienceDomainAgent` by name
   (`agentDomainAgentLink.ts`). Is that the intended employee for this domain?
5. **A v5 capture of the agent's fields (Ali).** May the snapshot also keep the agent's enabled
   state, autonomy level and tool-grant count? None of them identifies a person, but adding them
   changes the method Ali approved on 2026-11-02. Until then, tool grants show "Not captured".
6. **The registry's other facts (Ali or Aleem).** Are `can_reach_surface: false` and the
   `manager_has_no_admin_login` blocker still true? They were measured when the registry was
   written, and its `agent_id` has since proved stale for this domain.
7. **The research file's "no AI employee provisioned" blocker (Ali).** All 25 capabilities carry
   it in the pinned research file. The console shows it word for word with a "May be out of date"
   note. Should the platform correct it at source?
8. **A staff member's internal record ID (Ali).** The research file's `manager_has_no_admin_login`
   blocker includes a staff member's `org_members` record ID. The platform's own sync has already
   committed it to `main` (in `.colaberry/plan.json` and the capability story files). Should the
   platform remove it at source, and should anything already published be cleaned up?
   *Done here, 2026-11-03:* the console now shows it as "[record ID withheld]" (display only;
   the research file is unchanged), checked by `tests/record-id-exposure.test.mjs`.

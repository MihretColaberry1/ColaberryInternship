# STORY-000: Build your Command Center (six-panel agent-domain console)

**Current version, 2026-11-03.** This is the only current brief for STORY-000. The earlier
nine-tab, five-criterion version is kept for history in
[STORY-000.superseded-2026-10.md](STORY-000.superseded-2026-10.md) and must not be built from.

**Domain:** `product_experience` (Product Experience & UI/UX) · **Accountable human:** Mohammed
Abdul Aleem · **Builder:** Mihret Netsereab, with Claude Code · **DRI:** Ali Muwwakkil

## The job to be done

**A human governs agents. The Command Center is designed to support that.** Every panel answers a
question the governing human has, shows only what the platform has actually produced, and says in
words what it cannot show yet.

## Where this specification comes from

| Source | What it settles | Recorded |
|---|---|---|
| The STORY-000 prompt on the portal story page | The six panels, the questions they answer, the endpoints, and the rules below | Pasted by Mihret, 2026-11-02 |
| Platform `backend/src/services/agentDomain/agentDomainCommandCenterStory.ts` at `bb594523` (2026-11-02) | The exact text of the six acceptance criteria, including the reworded criterion 4 | Read through the GitHub API, 2026-11-03 |
| Mohammed Abdul Aleem's answers to Mihret's two emails (relayed 2026-11-03) | The six-panel version is current; the layout; criterion 4 wording; missing-data states; evidence; review | This file, section "Decisions" |
| Ali Muwwakkil's email (2026-11-02) | Snapshot capture approved for Panels 1 and 5, with two conditions | [STORY-000-agent-domain-plan.md](STORY-000-agent-domain-plan.md) |

## The six panels

| Panel | Question it answers | Reads |
|---|---|---|
| Your employee | Does it exist, and what is it allowed to do? | `GET /api/admin/agent-domains-mine` |
| Your capability inventory | What am I actually building? | `GET /api/admin/agent-domains/product_experience`, `.../coverage` |
| The autonomy ladder | Where is this going? | `GET /api/admin/agent-domains/product_experience` |
| Per-rung behaviour | What does the next rung require of me? | `release_behaviour[]` in each capability record |
| Your governance queue | What am I waiting on a human for? | `GET /api/admin/agent-domain-change-requests-mine` |
| What is not available | What would I be lying about? | All of the above |

The console shows them in the order the governing human needs them, not in the order above. The
order and its reasons are in [docs/evidence/design-rationale.md](../evidence/design-rationale.md).

## Done means: these exact lines

Quoted from `COMMAND_CENTER_ACCEPTANCE` at platform commit `bb594523`. Do not retype them in
`.colaberry/progress.json`: the platform matches criteria by their text.

1. Given the Command Center, when it is opened, then all six panels render and each one names the endpoint it read.
2. Given a panel whose endpoint returned nothing, when it renders, then it says so in words and is visibly distinct from a panel that is still loading.
3. Given the autonomy ladder panel, when it renders, then all ten rungs are present with the owner's wording, and each capability's ceiling is marked against the rung it stops at.
4. Given the autonomy ladder panel, when a capability's authority is shown, then the page shows the effective authority `effectiveAuthority()` returns rather than the level the capability record asks for, and names the `no_tool_grants` rule with the number of capabilities it currently constrains, saying so in words when that number is zero.
5. Given the governance panel, when a tool request is shown, then nothing on the page states or implies that filing it granted anything.
6. Trust: no panel shows a number, a grant, a rung or a result this domain has not actually produced.

Criterion 4 was reworded by the platform on 2026-11-02. The earlier wording asked for a capability
above `autonomy:R2` with no granted tools, a state no builder could produce because every capability
starts at `autonomy:R0`.

## The rules this page must not break

- **Tool grants are the throttle, and they are not yours.** `effectiveAuthority()` in
  `autonomyLadder.ts` holds any capability approved above `autonomy:R2` at `autonomy:R2` when no
  tools are granted, with the reason `no_tool_grants`. Render what it returns.
- **Finishing work does not promote anything.** A story marked complete, elapsed time, a
  conversation that went well and a mocked test passing never raise autonomy. A named human
  promotes one rung at a time, on evidence.
- **Draft is not approved.** Render `draft` as draft everywhere.
- **Nothing invented.** Anything the page cannot source is left blank and labelled.

## Decisions (Mohammed Abdul Aleem, relayed 2026-11-03)

1. **Criterion 4, Option 1.** Show each capability's current rung, whether a human approved it, and
   what rule holds it back, as three separate things:
   - with no approval recorded: `autonomy:R0` labelled **"Starting rung — no human approval yet"**,
     never "None";
   - the rule: **"Tool-grant cap in force; constrains nothing today"**, because no capability is
     approved above R2;
   - on each capability's detail page, a labelled hypothetical: if a human approved it up to its R4
     or R5 ceiling, `no_tool_grants` would hold it at R2;
   - the same wording on the console and the detail pages;
   - a test that supplies an approved level above R2 with no tool grants and checks that
     `no_tool_grants` appears;
   - nothing may imply that live data triggers the rule today.
2. **The six-panel portal specification is the current STORY-000** and the version this work is
   evaluated against.
3. **Replace the nine tabs with six panels on one screen.** Inventory every element of the nine
   tabs, map each to a panel or mark it dropped with a reason, order panels by what the operator
   needs first, give each panel one primary action, put long details in collapsed disclosures, and
   do not keep the old console alongside. The inventory is in the [README](../../README.md).
4. **Do not wait for missing platform data.** Every panel has a "Not available" state that says what
   is missing, what it waits for, what it will show, and one next action. `autonomy:R0` with no
   approval is the normal state today, not an edge case. Placeholders are labelled as placeholders.
5. **Evidence:** a traceability table, a state matrix, screenshots at phone, tablet and desktop
   widths in light and dark themes, an accessibility pass (axe and a keyboard walkthrough), the
   content inventory, a one-page rationale and the criterion 4 test. All of it lives in
   [docs/evidence/](../evidence/).
6. **Review:** Aleem reviews the live console at real widths against the traceability table, then
   uses the meeting as a critique. The build is published at a link he can open.

## Evidence this story is done

Cite the real thing: a named passing test, a screenshot beside the source it was built from, or a
file and line. A story marked complete, elapsed time, a conversation that went well or a mocked test
passing do not count. Mohammed Abdul Aleem evaluates the evidence. The traceability table is
[docs/evidence/traceability.md](../evidence/traceability.md).

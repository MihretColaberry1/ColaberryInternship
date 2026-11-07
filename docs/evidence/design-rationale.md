# Design rationale: the six-panel Command Center

**For:** the design critique with Mohammed Abdul Aleem. **Date:** 2026-11-03. One page: each decision,
and why.

**The job:** a human governs agents. Every choice below is tested against one question: does this help
the governing human decide something, or stop them from being misled?

## 1. One screen of six panels, not nine tabs

A tab hides its contents until someone thinks to open it. Before, the operator's most important facts
were spread across three tabs:
- whether an agent exists was in Agent domain;
- "Aleem's sign-off is pending" was in Guardrails;
- "the data is three days old" was in the header.

On one screen they can be compared at a glance. The old console is removed, not kept beside the new
one, so there is only one version to trust. Every element of the nine tabs is accounted for in the
README's content inventory: moved, merged or dropped with a reason.

## 2. The order: what the operator needs to know first

1. **Your employee:** governance starts with "is there anything to govern?" The live endpoint answers
   it. The platform registry's `agent_id: null` is a seed value it does not keep current for this
   domain, so the panel labels that value and never treats it as the answer. Until the endpoint is
   captured, the panel says "Not captured", not "no".
2. **Your governance queue:** what is waiting on a human. These are decisions, so they come before
   inventory. The brief numbers this panel 5; it moved up because it is where the operator acts.
3. **Capability inventory:** what is being built.
4. **Autonomy ladder:** how far it may go, and what holds it back today.
5. **Per-rung behaviour:** what the next rung requires.
6. **What is not available:** last, because it qualifies everything above it. It is still a full
   panel, so the gaps are visible rather than hidden.

## 3. One primary action per panel

Each panel has one red button, the next thing to do. Everything else is a quiet link or a disclosure.
The page changes nothing on the platform, so every action leads somewhere: a detail page, a guide, or
another panel. None of them pretends to do the work. The action follows the state: while Panels 1 and
2 are not captured, their action is the capture guide.

## 4. A glance first, details collapsed

Each panel shows:
- a state chip;
- one headline sentence;
- three to five facts;
- its action;
- the endpoints it reads.

Tables, the 25-row grid and the stories list sit in closed disclosures. Opening one widens the panel
to the full row, so its table has room. A first look takes seconds, and the detail is one click away.

## 5. Five states, each said in words

"Not available" is not "Loading", and neither is "Error" (criterion 2). Each state has:
- its own chip text;
- its own border style;
- its own body.

"Not available" always says four things: what is missing, what it waits for, what it will show, and
one next action. Colour reinforces the word; it never carries the meaning on its own.

## 6. Today's state is normal, not an edge case

`autonomy:R0` with no human approval is what every operator sees today. The design treats it as the
main case:
- the ladder headline says it plainly: "autonomy:R0 for all 25: Starting rung — no human approval yet";
- the tool-grant cap is named and stated not to bind: "Tool-grant cap in force; constrains nothing
  today", with the counted reasons.

Showing "None" would have read as missing data. Showing R2 would have claimed something the platform
never computed.

## 7. Hypotheticals only where asked for, and always labelled

The R2-cap explanation appears only on each capability's detail page, in a dashed box marked
"Hypothetical: not an approval, not data". The console itself never shows a hypothetical, so a glance
cannot mistake one for the current state. The wording comes from one function, so the console and the
detail page can never disagree.

## 8. Every value says where it came from

Tags read Endpoint, Source file, Platform code, Project plan or Unavailable. The capability panels
explain why they show source-file values: the platform's endpoint does not return those records.
Panels 1 and 2 will read a reviewed, redacted snapshot. The page is public and cannot call admin
endpoints, which is the access boundary working as intended (Ali Muwwakkil, 2026-11-02).

## 9. Real widths, both themes

| Width | Layout |
|---|---|
| Under 760 px (phone) | One column |
| 760 px and up (tablet) | Two columns |
| 1200 px and up (desktop) | Three columns; the ladder spans two, because it carries the ten rungs |

The dark theme is a separate set of colour tokens, not an inverted light theme. axe checked contrast
in both themes at phone and desktop widths. Focus outlines are 3 px. Touch targets are at least 24 px,
and buttons are 44 px.

## Trade-offs worth the critique's time

- **Moving the governance queue to second place** breaks the brief's numbering. The panel names are
  unchanged, and the traceability table maps both.
- **Dropping the keyword Q&A box and Sample mode** removes two features that once satisfied the old
  brief. They were dropped because they added risk (made-up data, answers that pointed at tabs that
  no longer exist), not because they added nothing.
- **A long Panel 4** stays visible because criterion 3 asks for all ten rungs. They are shown as a
  compact list rather than a table so the panel stays readable on a phone.

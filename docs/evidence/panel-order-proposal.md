# Proposal: show the governance queue second in every domain's Command Center

**To:** the owner of the STORY-000 Command Center brief. The brief is generated for every agent
domain by `agentDomainCommandCenterStory.ts` in the platform repository; who decides changes to it
is not recorded in this repository, so this proposal is addressed to that owner rather than to a name.
**From:** Mihret Netsereab, builder of the Product Experience & UI/UX domain.
**Date:** 2026-11-09. **Status:** proposal only. Nothing in this repository applies it.

## Background

The first six-panel build (PR #1, 2026-11-03) moved "Your governance queue" from the brief's
fifth place to second. Mohammed Abdul Aleem's design review of 2026-11-08 accepted the reason but
asked for the brief's order to be restored. Every builder gets the same window so the programme can
be taught, reviewed and demonstrated as one thing, and the acceptance criteria are written in the
brief's order. One domain with a different order undoes that for every reviewer who moves between
domains. The Command Center now follows the brief exactly: Employee, Inventory, Ladder, Behaviour,
Governance, Gaps, numbered 1 to 6.

## The proposal

Change the brief so that every domain shows, in this order:

1. Your employee
2. **Your governance queue** (today: 5)
3. Your capability inventory (today: 2)
4. The autonomy ladder (today: 3)
5. Per-rung behaviour (today: 4)
6. What is not available

If the owner agrees, every domain changes together, and the acceptance criteria are renumbered in the
same change so the criteria and the screen still read in the same order.

## Why

- **The console's job is governance.** It exists so a human can govern an agent. The governance queue
  is the only panel where something waits on that human: a change or tool request that a named person
  must decide. Every other panel describes; this one asks.
- **The first question is "is there anything to govern?", the second is "is anything waiting on me?"**
  Panel 1 answers the first. In fifth place, the second answer sits below three long panels, the
  25-capability inventory, the ten-rung ladder and the per-rung behaviour, which on a phone means
  several screens of scrolling before a pending decision is visible.
- **Decisions before descriptions.** A pending request goes stale while it waits. Inventory, ladder and
  behaviour change only when the research or an approval changes, so reading them later costs nothing.
- **"What is not available" stays last** in both orders, because it qualifies everything above it.

## What would not change

- Panel names, what each panel reads, and every acceptance criterion's substance.
- The rule that a request grants nothing until a named human decides it.

## Costs

- Every domain's Command Center and its tests change in one coordinated release.
- The acceptance criteria and any training material that cites a panel by number must be renumbered.
- Reviewers who have learned the current order relearn it once.

## What I am asking for

A yes or no from the brief's owner. Until then this domain keeps the brief's order, and
`tests/console.test.mjs` fails if it drifts from it.

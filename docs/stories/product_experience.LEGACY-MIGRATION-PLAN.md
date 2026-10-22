# product_experience.LEGACY-MIGRATION-PLAN — Legacy migration plan

Disposition of this domain's 0 inherited legacy agent record(s).

**This domain inherits nothing.** Zero legacy agent records were assigned to it, verified against the sliced 246-row inventory rather than assumed from an absence of evidence. An empty legacy bucket is not an empty job: this domain still has 25 candidate capabilities, built from the application, the manager's role and proposed new work.

### Not covered by this plan
The 21 legacy records whose `proposed_owner_domain` is `unresolved` belong to no domain and are therefore not in any project's plan. Five of them are live production rows. They need an owner decision, and naming that here is the point.

**Release:** r1 · Legacy migration plan (weeks 0–0)
**Owner:** 
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

_No requirement linked._

## How to build it

# Legacy migration plan
**Domain:** Product Experience & UI/UX · **Release:** Legacy migration plan · **Story:** `product_experience.LEGACY-MIGRATION-PLAN`
**Accountable human:** Mohammed Abdul Aleem · **Deliverable:** `docs/migration/legacy-migration-plan.md`

## What this is

This is Claude Code work, and the product is a written document. There is no feature to ship
and no agent to switch on. The document is the thing your manager reviews, so it is written
to be read by them rather than by you.

## The specification is the brief on this story, not this prompt

Read the brief above this prompt on the story page. It names this domain's real figures, your
accountable human, and the specific blockers discovery already found. **Those numbers are not
repeated here on purpose:** a second copy drifts from the first, and then nobody knows which
is true. Work from the brief; this prompt tells you how to turn it into a document.

## How to build it

- The brief already contains the disposition of every inherited legacy record for this domain, with reasons and `file:line` evidence. **Your job is not to redo that work.** It is to turn it into a plan a manager can act on, and to check it.
- Verify a sample against the repo. Open two or three of the cited `file:line` references with Claude Code and confirm they say what the brief claims. Record which ones you checked.
- Every record marked `unknown` is the real work. For each, say what single question would resolve it and who can answer.

## What the document must contain

- A disposition table: one row per legacy record, its category, and its successor capability where there is one.
- The `unknown` records called out separately, each with the question that resolves it and the person who can answer.
- Which citations you personally verified, and what you found.
- A sequence: what has to be decided first, and what is blocked until it is.
- Anything in the brief you believe is WRONG, with your evidence. Discovery was done at speed and finding an error in it is a better outcome than agreeing with all of it.

Write it as Markdown with real headings. A wall of prose is not a deliverable, and neither is
a bulleted restatement of the brief.

## Evidence this is done

Cite the real thing. For this story that is the committed file `docs/migration/legacy-migration-plan.md`, and inside it,
every claim carrying either a source or the word unknown.

**None of these count:** this story being marked complete, elapsed time, a conversation that
went well, a document that restates the brief without answering it, or a confident sentence
with no source. Your accountable manager evaluates the evidence.

**Unknown is a real answer and is worth more than a guess.** Several of these questions have
no source material in this repository. Writing "the source does not exist, and here is what
would have to be written" is a complete answer, not a failure to find one.

## Before you start

- **The platform source is PUBLIC. You do not need access granted.** Wherever this brief
  cites a file like `backend/src/services/agentRegistrySeed.ts`, it means the Colaberry
  platform repository:
  **https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator**
  Clone it read-only beside your own project and point Claude Code at it. Sarbjit hit this
  within hours of starting and was right to stop rather than invent an answer: a brief that
  cites a path without naming its repository is the brief being wrong, not you.
- **Nothing in this story authorizes an outbound message.** Do not send an invitation, an
  email or a direct message, and do not record a meeting as booked. Arranging anything with a
  person is a human action taken outside this project.
- **Nothing here changes an agent.** Do not enable one, grant it a tool, or raise an autonomy
  level. A capability stays `draft` until your manager has actually reviewed it.
- Your repo may not be connected yet. The prompt works either way; the story cannot be
  verified and no points are awarded until a repo is connected, because verification is a
  read of your repo.

## Failure paths you must handle


## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] The plan accounts for every inherited legacy record for this domain, each one kept, merged or retired with a reason.
- [ ] The migration is described as replayable: running it twice leaves the same end state, with no duplicated side effects.
- [ ] The plan states what happens to a record the migration cannot classify, rather than assuming none exist.

When every box above is ticked, stop and show the demo.

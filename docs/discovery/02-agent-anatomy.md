# Agent anatomy: the Product Experience & UI/UX agent

**Domain:** Product Experience & UI/UX (`product_experience`)
**Story:** `product_experience.RESEARCH-2-AGENT-ANATOMY` · Release: Discovery and validation
**Accountable human:** Mohammed Abdul Aleem
**Prepared by:** Mihret Netsereab · 2026-10-24
**Status:** draft for manager review. Nothing here enables, configures or changes an agent.

All platform citations refer to the public Colaberry platform repository,
[`ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator`](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator),
read at commit `48e7c07`. Source tags such as **[A1]** point to the Sources table at the end.

---

## Headline: 2 of the 9 elements are unknown

| # | Element | Status for this agent |
|---|---|---|
| 1 | Reasoning | **Unknown.** No prompt, persona or role charter exists, and none has been designed. |
| 2 | Memory | **Unknown.** The platform mechanism exists. What this agent should remember is undecided, and whether it has any stored memory is not visible in code. |
| 3 | Inputs | **Declared, not built.** 25 capabilities list their inputs. Nothing feeds the agent. |
| 4 | Communication | **Exists on the platform, unusable for this agent.** The manager surfaces are built, but the agent has no prompt and the manager has no login. |
| 5 | Tools | **Declared, not built.** 21 tool names declared. 0 implemented. 0 granted. |
| 6 | Procedures | **Declared, not built.** Every capability has a written workflow. None is code. |
| 7 | Coordination | **Absent.** Agent-to-agent handoff does not exist on the platform, and no capability here needs it. |
| 8 | Safeguards | **Exists.** The Release Zero floor and platform-wide limits apply today. Capability-level safeguards are declared. |
| 9 | Verification | **Declared, not built.** One test checks that the agent is inert. Nothing tests its behaviour. |

**How the statuses are used.**
- **Exists** means there is code at a cited `file:line`.
- **Declared, not built** means the requirement is written down, mostly in this domain's
  capability file [A1], but no code implements it.
- **Absent** means the evidence shows it does not exist.
- **Unknown** means the design question is open and no source answers it.

Counted strictly, **0 of the 9 elements are implemented for this agent's own behaviour.** The
only things that run today are platform-wide safeguards and one registry test.

---

## Two findings that correct earlier records

1. **An agent shell exists, but the domain registry and brief say none does.**
   `ProductExperienceDomainAgent` is registered as a "Release Zero" employee. It is disabled,
   has no tools, has no schedule, and its autonomy classifies to `observe` [A2][A3]. At boot,
   an identity is seeded for it: an admin user, an enrollment and a community member [A4].
   The domain registry still records `agent_id: null` [A5], and the story brief says "none
   exists yet". Both describe the agent as absent when it is registered but inert. Whether
   the database row exists in production is unknown from code alone. My RESEARCH-1 document
   repeated the "no agent" claim. It was corrected on 2026-10-24 (commit `4e49a3a`).
2. **Manager-scoped authorization is built, but the capability file says it is not.**
   `requireAgentManagerOrAdmin` exists [A6] and gates the manager surfaces [A7]. The
   capability file still says it is "NOT built" [A8]. The manager is still blocked, but for a
   different reason: the middleware runs only after the normal admin check [A6], and Mohammed
   Abdul Aleem has no admin login [A5][A9]. RESEARCH-1's source S16 repeated the outdated
   claim and was corrected in the same commit.

---

## 1. Reasoning

**Exists today.**
- The platform has a generic prompt builder. Every call layers platform safety rules, a role
  charter, a persona block, the manager's directives and approved memory [A10].
- Agents that reason do so through a `system_prompt` field [A11]. Reese and Dara each have
  one [A12].

**Missing.**
- This agent has no `system_prompt`. A test enforces that it has none, so "no conversation
  path is live yet" [A13].
- No role charter exists for this domain. Charters exist only for curriculum and learner
  success [A14].
- Which model it would use is unknown.

**First honest version.** A persona block and role charter written for one job: detect UI
defects and prepare evidence for a human decision. It would use the existing builder [A10],
not new code. The charter would state the R5 ceiling and the 20 human-reserved capabilities
from RESEARCH-1. The model choice is a decision for the manager or DRI, so it stays unknown.

## 2. Memory

**Exists today.**
- `AgentMemoryProposal` is a memory a human must approve before it is used. Its status is
  `pending`, `approved` or `rejected` [A15].
- Approved memories are read fresh at runtime by both prompt builders [A16][A17].
- Older memory-shaped models have no approval gate and are not suitable [A18].

**Missing.**
- No decision exists about what this agent should remember.
- Whether any memory rows exist for it is a database question that code cannot answer.
- Approved memory only reaches the agent through a prompt, and this agent has none
  (section 1).

**First honest version.** Remember only approved, reusable decisions: allow-listed raw
colours, accepted exceptions, deliberate orphans such as SignupV2 [A19]. Each would enter
through `AgentMemoryProposal` so the manager approves it. Measurements would not be stored
as memory, because they should be re-measured each run.

## 3. Inputs

**Exists today (declared).** Each of the 25 capabilities lists its `inputs` and
`source_modules` [A20]. Most are frontend source files: `.tsx`, `.css`, `tokens.css` and
route trees.

**Missing.**
- No code reads any of these inputs on the agent's behalf. The agent has no tools (section
  5) and runs on no trigger [A3].
- Several inputs depend on things that do not exist yet, such as the raw-colour allow-list
  [A21].
- The boundary with Website Portfolio & Conversion over the three brand apps is undecided
  [A22].

**First honest version.** Read-only access to the frontend source tree at a pinned commit,
which is the `repo_read` input that 23 of 25 capabilities need. Rendered-page inputs, such
as screenshots and contrast, come later through the sandbox browser tool.

## 4. Communication

**Exists today.**
- A manager conversation ("Talk") prompt builder [A17] and its model [A23].
- Manager directives that can only restrict an agent, never widen it [A10][A24].
- Both surfaces are gated by `requireAgentManagerOrAdmin` [A6][A7].
- Email is the one channel the platform rates as reusable [A25]. For agents, though, live
  email is default-denied [A26].

**Missing.**
- **The agent side:** with no `system_prompt`, the Talk surface is not live for this agent
  [A13].
- **The manager side:** Mohammed Abdul Aleem has no admin login, so he cannot pass the
  admin check the middleware runs first [A5][A6][A9].
- **The reporting line:** the registry says it is not set [A3]. The identity seed's comment
  says the manager is already on the agent row [A27]. Which is true in production is
  unknown.

**First honest version.** The manager reads the agent's reports and answers its questions
through the existing Talk and directive surfaces. That requires an admin login with a scoped
role for him, a reporting line, and a prompt (section 1). The agent sends nothing outward.

## 5. Tools

**Exists today.**
- 21 distinct tool names are declared across the 25 capabilities [A1][A20].
- The agent's granted tool list is empty, and a test enforces it [A3][A13].
- Eight capabilities are default-denied platform-wide, including production deploy and
  pushing to protected main [A26].

**Missing.**
- **None of the 21 declared tools is implemented.** A search for each name across the
  platform's TypeScript source, excluding tests, finds 0 matches [A28].
- The capability file says the names are this blueprint's own declarations, with no
  platform allow-list behind them [A29].
- There is no accessibility engine, no visual-regression tooling and no automated token
  check. Adding one is an external-dependency decision [A30].

**First honest version.** Build `repo_read` and `report_renderer` first. Together they cover
the five detection-only capabilities. No write tools at all. The four write tools are for
review queues and records, and come only with the gate capabilities.

## 6. Procedures

**Exists today (declared).**
- Every capability has a written `workflow`, `exceptions` and `release_behaviour` [A20].
- An example is the token-drift audit's six steps, ending "Hand the diff to a human. The
  agent does not merge it." [A31]
- Each capability defines 2 to 4 autonomy levels with acceptance criteria. All 25 start at
  R0 [A20].

**Missing.**
- No procedure is code, so nothing runs.
- None is validated: all 25 capabilities are still `draft` [A32].

**First honest version.** Turn one detection workflow into a fixed, rerunnable procedure, for
example route inventory or unrouted-page detection. It should give the same output for the
same input, and report "unclassified" rather than "pass" for anything it can't sort [A31].
The manager signs off the written scope first, which is the R0 acceptance step.

## 7. Coordination

**Exists today.**
- The autonomy ladder defines coordination as R8: "Coordinate necessary, authorized handoffs
  with other agents" [A33].
- An `agent_handoff` ticket type exists [A34]. Its only real recipient is a human: Dara hands
  off to her manager, because "no AI employee has a matching capability to hand off TO yet"
  [A35].

**Missing.** Agent-to-agent handoff does not exist on this platform. No AI employee receives
handoffs [A35]. This domain's ceiling is R5 [A1], three rungs below R8.

**What it would require.** Do not build coordination for this agent. If it were ever needed,
four things would have to exist:
- a second AI employee with a matching capability to receive the work;
- an agreed domain boundary that says which agent owns what, such as the brand apps [A22];
- a reporting line for both agents [A3];
- a capability approved to R8.

None exists today.

## 8. Safeguards

**Exists today.**
- **The Release Zero floor:** disabled, no tools, `observe` autonomy, no schedule [A2][A3].
  Each is enforced by a test [A13].
- **Default-denied capabilities:** eight action classes are blocked for every agent [A26].
- **The autonomy ladder's hard limits:** production needs a separately approved R6 pilot. An
  agent with no tools cannot go above R2 [A36].
- **Platform safety rules** are injected into every assembled prompt [A10][A37].
- **Per-action authorization:** the agent authorization service [A38].
- **Restrict-only directives:** no code path lets a directive change autonomy or tools [A10].

**Declared for this domain.**
- 20 of 25 capabilities carry `human_decision`.
- In production, the agent has no permissions in 24 of 25 capabilities. The exception is
  read-only access to the exception register [A39].
- The two gates are capped at R2 and carry a negative test that the agent cannot approve its
  own change [A29].

**Missing.**
- The capability-level safeguards are written, not coded.
- The no-self-approval negative test is declared, but it does not exist yet, because the gate
  capability is not built.

**First honest version.** Keep the Release Zero floor until the manager can log in. Then grant
one read-only tool at a time, each with the declared permissions as the enforced boundary.

## 9. Verification

**Exists today.** One test file names this agent. It checks that the agent is disabled, has
no tools and has no system prompt [A13]. That proves the agent is inert. It proves nothing
about what the agent would do.

**Declared.** Each capability has acceptance criteria per autonomy level [A20]. Examples are
fixtures with known violation counts at R1, and agreement with a human-reviewed reference
inventory at R5 [A31].

**Missing.**
- No fixtures exist.
- No reference inventory exists.
- No shadow-mode comparison exists.
- No accessibility or visual-regression engine is installed [A30].

**First honest version.** For one detection capability, build an R1 fixture seeded with a
known count of N violations. The scan must report exactly N, report one fewer when one is
removed, and must not report clean on an empty directory [A31]. That one test is the first
piece of verification for the agent's behaviour.

---

## Unknowns

- **Reasoning model and persona.** No model choice, persona or charter exists for this
  agent.
- **Memory contents.** No decision about what to remember. Whether any rows exist in
  production cannot be seen from code.
- **Whether the agent row exists in production.** The registry entry and boot seed exist
  [A2][A4], but code cannot confirm the database state.
- **The reporting line.** The registry [A3] and identity seed [A27] disagree.
- **The domain boundary** with Website Portfolio & Conversion over the brand apps [A22].
- **Who may grant tools.** The registry says it "requires a manager" [A3]. With the manager
  unable to log in, who can do it today is unknown.

---

## Sources

All paths are in `ColaberryEnterprise_AI_LeadershipAccelerator` at commit `48e7c07`. **CAP**
is `backend/src/services/agentDomain/capabilities/product_experience.json`. **SVC** is
`backend/src/services/`. **AIWM** is `docs/architecture/ai-workforce-management/`.

| Tag | Claim | Citation |
|---|---|---|
| A1 | 25 capabilities, 21 tools; ceilings no higher than R5 | CAP:9, CAP:10; CAP:2926 |
| A2 | `ProductExperienceDomainAgent` registered as Release Zero | SVC `agentRegistry/domainAgents.ts:155-160`, `:76`; included in the registry at SVC `agentRegistrySeed.ts:2856` |
| A3 | Floor: disabled, `tools_granted: []`, observe, no schedule, no `reports_to`; grants need a manager | SVC `agentRegistry/domainAgents.ts:22-37`, `:66-72` |
| A4 | Identity seeded at boot; "an identity lets an agent be seen… not act" | SVC `agentDomain/domainAgentIdentitySeed.ts:28`; called at SVC `agentRegistrySeed.ts:3262` |
| A5 | Domain registry: `agent_id: null`, `can_reach_surface: false` | SVC `agentDomain/agentDomainRegistry.ts:132`, `:137` |
| A6 | `requireAgentManagerOrAdmin` defined; runs after `requireAdmin` | `backend/src/middlewares/agentManagerAuthMiddleware.ts:12-14`, `:50` |
| A7 | Manager routes gated by it | `backend/src/routes/admin/managerDirectiveRoutes.ts:12-14` |
| A8 | Capability file says manager authorization is "NOT built" | CAP:2924 |
| A9 | Manager has no admin login | AIWM `HUMAN_OWNERSHIP_MAP.md:13` |
| A10 | Generic prompt builder: safety, charter, persona, directives, memory; directives restrict only | SVC `agentBlueprint/agentSystemPrompt.ts:1-45`, `:95` |
| A11 | `system_prompt` field on agent entries | SVC `agentRegistry/agentSeedTypes.ts:24` |
| A12 | Reese and Dara have prompts | SVC `agentRegistrySeed.ts:2483`, `:2523` |
| A13 | Test: disabled, no tools, no system prompt | SVC `agentRegistry/__tests__/domainAgents.test.ts:51-64`, `:85-89` |
| A14 | Role charters only for curriculum and learner success | `ls docs/architecture/ai-workforce-management/employees/` lists `curriculum`, `learner-success` |
| A15 | Approval-gated memory model | `backend/src/models/AgentMemoryProposal.ts:4-27` |
| A16 | Approved memory read path | SVC `agentMemoryProposalService.ts:132` |
| A17 | Read by both prompt builders | SVC `agentBlueprint/agentSystemPrompt.ts:118`; SVC `agentBlueprint/agentManagerConversationPrompt.ts:91`, `:124` |
| A18 | Older memory models have no approval gate | AIWM `MEMORY_MAP.md:5-17` |
| A19 | SignupV2 kept on purpose | `frontend/src/App.tsx:147-157` |
| A20 | Per-capability `inputs`, `workflow`, `exceptions`, `required_tools`, `permissions_by_environment`, `release_behaviour`; all start R0; 2 to 4 release levels each | CAP:43, :55, :63, :87, :93, :126 (first capability; each field appears 25 times); counts by parsing CAP |
| A21 | No raw-colour allow-list exists | CAP:123 |
| A22 | Domain boundary with Website Portfolio & Conversion undecided | CAP notes, item 11 under "Everything marked unknown" (CAP:2923) |
| A23 | Manager conversation model | `backend/src/models/AgentManagerConversation.ts:159` |
| A24 | Manager directive model | `backend/src/models/ManagerDirective.ts:49` |
| A25 | Email rated reusable; other channels not | AIWM `COMMUNICATION_MAP.md:51-59` |
| A26 | Eight default-denied capabilities | SVC `delivery/execution/executionPolicy.ts:33` |
| A27 | Identity seed comment: manager "already set on the AiAgent row" | SVC `agentDomain/domainAgentIdentitySeed.ts:119` |
| A28 | 0 of 21 declared tool names appear in code | for each name, `grep -rl "'<name>'\|\"<name>\"" --include=*.ts backend/src` excluding `__tests__` returns nothing |
| A29 | Tool names are declarations; gates capped at R2 with no-self-approval test | CAP:2926, CAP:2927 |
| A30 | No accessibility, visual-regression or token-check tooling | CAP:2921 |
| A31 | Token-drift workflow and its R1/R5 acceptance criteria | CAP:55-62, CAP:133-145 |
| A32 | All 25 capabilities `draft` | `grep -c '"requirement_validation_state": "draft"' CAP` returns 25 |
| A33 | R8 defined as agent handoffs | SVC `agentDomain/autonomyLadder.ts:67` |
| A34 | `agent_handoff` ticket type | `backend/src/models/Ticket.ts:51` |
| A35 | Handoff's only real recipient is a human | SVC `curriculum/daraHandoffService.ts:13-15` |
| A36 | Production needs R6 pilot; no tools caps at R2 | SVC `agentDomain/autonomyLadder.ts:202-209` |
| A37 | Platform safety rules block | SVC `agentBlueprint/platformSafetyRules.ts:33` |
| A38 | Agent authorization service | SVC `agentAuthorizationService.ts:218` |
| A39 | 24 of 25 give the agent no production permissions; exception is `read_register` | parsing CAP; exception at CAP:2333 |

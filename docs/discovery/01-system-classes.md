# System classes: where Product Experience & UI/UX belongs

**Domain:** Product Experience & UI/UX (`product_experience`)
**Story:** `product_experience.RESEARCH-1-SYSTEM-CLASSES` · Release: Discovery and validation
**Accountable human:** Mohammed Abdul Aleem
**Prepared by:** Mihret Netsereab · 2026-10-21
**Revised:** 2026-10-24. Corrected two claims (S8, S16) after RESEARCH-2 found a registered placeholder agent and a built manager-authorization check. The recommendation and figures are unchanged.
**Status:** draft for manager review. Nothing here enables, configures or changes an agent.

All platform citations refer to the public Colaberry platform repository,
[`ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator`](https://github.com/ColaberryIntern/ColaberryEnterprise_AI_LeadershipAccelerator),
read at commit `6ba8530`. Source tags such as **[S1]** point to the Sources table at the end.

---

## The numbers this argument depends on

| Figure | Value | Source |
|---|---|---|
| Candidate capabilities | **25** | [S1] |
| Reserved to a human decision at every level (`human_decision: true`) | **20 of 25** | [S2] |
| Not human-reserved (detection only) | **5 of 25** | [S3] |
| Inherited legacy records | **0** | [S4] |
| Distinct tools the capabilities need | **21** | [S1] |
| Capabilities validated by the manager | **0** (all 25 are `draft`) | [S5] |
| Highest autonomy ceiling on any capability | **R5 (shadow mode)**. None reach R6 (pilot) or R7 (automation) | [S6] |
| Capabilities capped at R2 (answer questions only) | **5** | [S7] |
| AI employee for this domain today | **a registered placeholder only**: `ProductExperienceDomainAgent`, disabled, no tools, no prompt, observe-only. Whether its row exists in the production database is unknown. The domain registry still shows `agent_id: null` | [S8] |
| Can the manager reach an agent surface today | **no** (no admin login) | [S9] |

The story brief is generated from these same fields: capability count, legacy count and
human-reserved count [S10]. On 2026-10-22 I, Mihret Netsereab, checked the three figures the
brief uses against the official Colaberry story narrative for
`product_experience.RESEARCH-1-SYSTEM-CLASSES`. It states 25 candidate capabilities, 20 reserved
to a human at every level and 0 inherited legacy records, matching this table [S24].

---

## The five classes

### 1. Chatbot

A chatbot takes a message and returns text. It doesn't use tools, holds no state beyond the
conversation, and doesn't act on anything. On the platform's autonomy ladder that is roughly R2,
"answer questions using approved knowledge and records" [S11].

### 2. Fixed workflow

A fixed workflow runs the same steps in the same order every time, usually on a timer, with rules
written in code. The platform's registry lists one under the name "agent": `WebsiteUXHeuristicAgent`
is registered as a nightly cron whose code checks pages against hard-coded thresholds (at most 8
form fields, 1 to 5 CTAs, 100 to 3,000 words) and contains no LLM call [S12]. It is registered,
not shown to run: the legacy classification marks it `retire` because its wrapper has zero
callers outside `aiOrchestrator*.ts` [S21].

### 3. Tool-using agent

A tool-using agent is one model that decides which of a fixed, granted set of tools to call for
a task, so the tool list, not the model, sets the limits of what it can do. The nearest platform
example is `PlatformInnovationArchitect`, which is granted an explicit list
of five tools [S13]. Whether a model chooses among those tools at run time is unknown: a granted
list shows what it may use, not who decides.

### 4. Agentic system

An agentic system pursues a goal over many steps. It plans, acts, observes the result and
re-plans, and its later actions depend on earlier results without a human approving each step.
In ladder terms, that kind of self-directed, stateful action against real systems is what R4
(in a sandbox) and then R6/R7 (in production) authorize [S11].

### 5. Multi-agent system

A multi-agent system has several agents with separate roles, such as a planner, a doer and a
reviewer, coordinating through messages or shared state. Its cost is coordination: hand-offs,
conflicting outputs and harder tracing of who decided what. This domain has one disabled
placeholder agent and no second agent to coordinate with [S8], and whether the platform
coordinates agents this way elsewhere is unknown.

---

## Recommendation: one tool-using agent, with fixed workflows inside it

**This domain needs a single tool-using agent whose individual checks are fixed workflows.**
The reasons below come from this domain's own numbers.

1. **20 of the 25 capabilities end in a human decision** [S2]. The agent's job is to detect
   problems and prepare evidence. A human decides. A class whose value is acting on its own
   conclusions (agentic, multi-agent) would spend most of its design budget on a step that 20
   of 25 capabilities hand to Mohammed Abdul Aleem.
2. **The remaining 5 are detection-only**: token drift, colour contrast, unrouted pages, route
   inventory and page health [S3]. Each produces a computed fact that can be checked against a
   reference answer, which is why their ceiling is R5 shadow mode and not higher [S6]. These are
   fixed workflows: same input, same output, safe to rerun. Three human-decided capabilities
   also reach R5 (WCAG AA audit, keyboard and semantic interaction audit, responsive and
   touch-target check) [S22]. R5 is shadow evaluation, not action, so this does not change the
   ceiling argument.
3. **There is no production action at all.** No capability's ceiling goes above R5 [S6], and
   shipping any UI change needs `push_to_protected_main` and `production_deploy`. Both are
   default-denied platform-wide [S14]. A human merges and deploys.
4. **It still needs tools, so a chatbot is not enough.** 23 of the 25 capabilities need
   `repo_read`, 13 need `headless_browser_sandbox` and 12 need `typescript_ast_scan` [S15].
   Every one of the 25 declares at least three required tools, including the 5 capped at R2
   [S7][S15]. A low autonomy ceiling limits what the agent may do. It does not remove the need
   for tools, so no capability here can be done by a chatbot without them.
5. **One agent, because there is one owner and zero legacy.** All 25 capabilities report to
   one accountable human [S1], and there are 0 inherited records to split across roles [S4].
   One agent holding the 21 declared tools [S1] is simpler to audit than several agents sharing
   them.

**How the argument changes with the numbers.** If the human-reserved count fell from 20 to,
say, 5, most capabilities could act on their own findings, and the case for an agentic system
would be real. If the 5 detection capabilities were the whole domain, a set of fixed workflows
with no agent at all would do. Today's split of 20 human-decided and 5 computed is what puts
the domain at "tool-using agent".

---

## What this domain does NOT need

**It does not need a multi-agent system.** The only agent is a disabled placeholder with no
tools [S8], and there is no legacy to divide [S4]. Every capability reports to the same one person [S1], and 20 of the 25 end at that
person [S2]. Splitting the work into a planner, auditor and reviewer adds hand-offs without
adding a decision anyone is allowed to make, because the decision is reserved to a human
either way.

**It does not need an agentic system yet either.** Its defining feature, acting toward a goal
without a human approving each step, is exactly what the domain's autonomy ceilings rule out.
Nothing goes above R5 [S6]. The two gate capabilities carry two separate safeguards: a cap at R2,
because a gate whose autonomy could rise would stop being a gate, and a negative test that the
agent cannot approve its own change under any setting [S7].

---

## What would justify the next class up (agentic system)

All of these would have to be true. Each is a condition that can be checked:

1. **The manager can actually supervise.** Mohammed Abdul Aleem needs an admin login. The
   manager-scoped authorization check is already built, but it only runs after the normal
   admin login check, and he has no admin login today [S9][S16].
2. **The detection capabilities have earned R5.** At least the 5 detection-only capabilities
   [S3] have to agree with a human-reviewed reference inventory in shadow mode, with every
   disagreement itemised [S17].
3. **A capability needs multi-step action whose steps depend on each other, and a human has
   approved that.** For example, a fix that opens a sandbox branch, applies a token
   substitution, re-renders, re-measures contrast, and keeps or reverts the change on that
   result. That is R4 work [S11]. It only becomes agentic once `human_decision` is
   removed from that capability. Today 20 of 25 carry it [S2]. Who has the authority to remove
   it (the manager, the DRI, or someone else) is unknown; no source I read says.
4. **A separately approved R6 production pilot exists** for at least one capability, because
   approval alone never reaches production [S18].

The bar for a **multi-agent system** is higher still: several accountable humans or clearly
separate roles that one agent can't hold. Nothing in this domain's record points that way.

---

## Unknowns

- **The story-page brief (resolved 2026-10-22).** The domain-specific brief is not in the
  public repository or in this one. I checked the 25 / 20 / 0 figures by hand against the
  official Colaberry story narrative, and they match [S24]. The three acceptance criteria also
  match the ones read from production on 2026-10-21 [S23]. Because the narrative lives only on
  the story page, a reviewer has to open that page to repeat the check.
- **`.loop-architect/` citations.** The domain's research file cites
  `.loop-architect/runs/20261007-school-agent-factory/verified-domain-registry.json` for the
  "no agent" and "no login" facts. That directory is not in the public repository, so I could
  not read it. The "no login" fact is confirmed elsewhere [S9]. The "no agent" claim turned out
  to be incomplete: a disabled placeholder agent is registered [S8].
- **Stale line reference.** The research file cites `frontend/src/App.tsx:116-124` for the note
  that SignupV2 is kept on purpose. At commit `6ba8530` that note is at lines 147-157 [S19].
  The fact holds, but the line numbers have drifted.
- **Who can change `human_decision`.** Condition 3 above depends on removing this flag from a
  capability. No source I read says who is authorized to do that.
- **Real UX defect counts.** Measured occurrence counts exist (for example, 4,492 hex
  literals in TSX), but the true violation count is unknown because no allow-list has been
  agreed [S20]. This does not change the recommendation. It affects how much work the
  detection capabilities will find.

---

## Sources

All paths are in `ColaberryEnterprise_AI_LeadershipAccelerator` at commit `6ba8530`. CAP is
`backend/src/services/agentDomain/capabilities/product_experience.json`.

| Tag | Claim | Citation |
|---|---|---|
| S1 | 25 capabilities, 21 tools, accountable human | CAP:3, CAP:9, CAP:10 |
| S2 | 20 capabilities have `human_decision: true` | `grep -c '"human_decision": true' CAP` returns 20 |
| S3 | The 5 with `human_decision: false` | CAP:116 (design_token_drift_audit), CAP:594 (color_contrast_regression_check), CAP:950 (unrouted_page_detection), CAP:1065 (route_surface_inventory), CAP:1177 (page_health_smoke_sweep) |
| S4 | 0 legacy records | CAP:8, CAP:2909 (`"legacy_dispositions": []`); `docs/architecture/ai-workforce-management/AI_EMPLOYEE_ROSTER.md:31` |
| S5 | All 25 are `draft` | `grep -c '"requirement_validation_state": "draft"' CAP` returns 25 |
| S6 | Ceilings: 12 × R4, 8 × R5, 5 × R2; none above R5 | count of `max_permitted_autonomy` values in CAP; rationale at CAP:2926 |
| S7 | 5 capabilities capped at R2; the gates' two safeguards (R2 cap and the no-self-approval negative test) | CAP:2124, CAP:2230, CAP:2339, CAP:2666, CAP:2778; CAP:2926 |
| S8 | A disabled placeholder agent is registered; the domain registry still shows `agent_id: null`; production database state unknown | `backend/src/services/agentRegistry/domainAgents.ts:155-160` (entry), `:22-37` (disabled, no tools, observe); `backend/src/services/agentRegistry/__tests__/domainAgents.test.ts:51-64`, `:85-89` (tests); `backend/src/services/agentDomain/agentDomainRegistry.ts:137` (`agent_id: null`) |
| S9 | Manager cannot reach a surface | `backend/src/services/agentDomain/agentDomainRegistry.ts:132` (`can_reach_surface: false`); `docs/architecture/ai-workforce-management/HUMAN_OWNERSHIP_MAP.md:13` |
| S10 | Brief is generated from these fields | `backend/src/services/agentDomain/agentDomainStoryTemplates.ts:101-102`, `:125-127` |
| S11 | Autonomy ladder definitions R0-R7 | `backend/src/services/agentDomain/autonomyLadder.ts:59-66` |
| S12 | `WebsiteUXHeuristicAgent` is registered as a fixed-rule cron with no LLM call | `backend/src/services/agentRegistrySeed.ts:751-759`; thresholds at `backend/src/services/agents/websiteUXHeuristicAgent.ts:9-13`; `grep -n -i -c "openai\|llm\|chatCompletion\|anthropic" backend/src/services/agents/websiteUXHeuristicAgent.ts` returns 0 (that file only, not the modules it imports) |
| S13 | `PlatformInnovationArchitect` is granted five tools | `backend/src/services/agentRegistrySeed.ts:1973` (name), `:1981` (`tools_granted`) |
| S14 | Deploy and protected-main push are default-denied | `backend/src/services/delivery/execution/executionPolicy.ts:33` |
| S15 | Tool frequency (`repo_read` 23, `headless_browser_sandbox` 13, `typescript_ast_scan` 12); every capability declares 3 to 7 tools | count of `required_tools` across CAP capabilities |
| S16 | Manager-scoped authorization is built and gates the manager routes; it runs after the normal admin check | `backend/src/middlewares/agentManagerAuthMiddleware.ts:12-14`, `:50`; `backend/src/routes/admin/managerDirectiveRoutes.ts:12-14`. CAP:2924 and `MANAGER_AUTHORIZATION_MAP.md` still say it is not built; the code shows otherwise |
| S17 | R5 acceptance = agreement with reference inventory | CAP:143-145 (example: design_token_drift_audit) |
| S18 | Production needs a separately approved R6 pilot | `backend/src/services/agentDomain/autonomyLadder.ts:202-203` |
| S19 | SignupV2 kept on purpose | `frontend/src/App.tsx:147-157` |
| S20 | Occurrence counts; violation total unknown | CAP:123 |
| S21 | `WebsiteUXHeuristicAgent` is a retire candidate with zero callers | `docs/architecture/ai-workforce-management/LEGACY_AGENT_CLASSIFICATION.csv:226` |
| S22 | Three human-decided capabilities also reach R5 | CAP:475 (wcag_aa_accessibility_audit), CAP:713 (keyboard_and_semantic_interaction_audit), CAP:1549 (responsive_and_touch_target_regression_check) |
| S23 | Acceptance criteria for this story family, read from production 2026-10-21 | `scripts/artifacts/tickets/af102Data.js:61-68` |
| S24 | Story narrative states 25 candidate capabilities, 20 human-reserved, 0 legacy records | Manual check by Mihret Netsereab on 2026-10-22 against the official Colaberry story page for `product_experience.RESEARCH-1-SYSTEM-CLASSES`. Not a file in either repository. |
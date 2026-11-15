// PLATFORM CODE, ported: the ten autonomy rungs, in the owner's words, and the plain-language text for
// each reason the platform's effectiveAuthority() can return, from
// backend/src/services/agentDomain/autonomyLadder.ts at platform commit 9d9aa3c3.
//
// This file deliberately holds no copy of effectiveAuthority(). The page shows the authority the platform
// itself recorded (`authority[]` in .colaberry/agent-domain.json) and never recalculates it (the platform
// owner's decision). tests/agent-domain-tool-rule.test.mjs fails if a calculation comes back.

export const PLATFORM_COMMIT = '9d9aa3c3';
export const LADDER_SOURCE = 'backend/src/services/agentDomain/autonomyLadder.ts';

export const AUTONOMY_LEVELS = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9'];
export const AUTONOMY_STAGES = AUTONOMY_LEVELS.map((l) => `autonomy:${l}`);

/** What each level means, in the owner's words. */
export const AUTONOMY_MEANINGS = Object.freeze({
  R0: 'Define the workflow, requirements, risks and human decisions.',
  R1: 'Prepare isolated development, fixtures and baseline tests.',
  R2: 'Answer questions using approved knowledge and records.',
  R3: 'Perform approved, user-initiated sandbox tool operations.',
  R4: 'Execute and verify stateful, multi-step sandbox tasks.',
  R5: 'Evaluate in shadow mode against approved reference outcomes.',
  R6: 'Conduct a separately approved, supervised production pilot.',
  R7: 'Automate only explicitly authorized action classes within limits.',
  R8: 'Coordinate necessary, authorized handoffs with other agents.',
  R9: 'Demonstrate reliable operation, monitoring, recovery and ownership.',
});

export function isAutonomyStage(value) {
  return typeof value === 'string' && AUTONOMY_STAGES.includes(value);
}

export function autonomyIndex(stage) {
  return AUTONOMY_STAGES.indexOf(stage);
}

/** Plain-language text for each reason the platform's effectiveAuthority() can record. */
export const REASON_TEXT = Object.freeze({
  no_approved_autonomy: 'No human has approved an autonomy level for this capability, so it has no authority.',
  capped_by_max_permitted: 'Capped at the capability ceiling.',
  production_requires_separate_pilot_approval: 'Production needs a separately approved pilot.',
  no_tool_grants: 'No tools are granted, so it is held at autonomy:R2.',
  human_decision_required_at_every_level: 'A human makes this decision at every level.',
  capped_below_automation_because_human_decision: 'Held at autonomy:R5 because the decision stays human.',
});

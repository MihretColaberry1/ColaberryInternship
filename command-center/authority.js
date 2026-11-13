// PLATFORM CODE, ported. The ten autonomy rungs and effectiveAuthority(), copied line for line from
// backend/src/services/agentDomain/autonomyLadder.ts at platform commit 9d9aa3c3. Only the
// TypeScript types were removed. tests/agent-domain-authority.test.mjs repeats the platform's own
// cases, so a drift between this copy and the original shows up as a failing test once re-checked.
//
// Nothing here decides authority for this project. It computes what the platform's rule returns
// for the inputs the page can verify, and the page renders that rather than what a record asks for.

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

/** Plain-language text for each reason effectiveAuthority() can return. */
export const REASON_TEXT = Object.freeze({
  no_approved_autonomy: 'No human has approved an autonomy level for this capability, so it has no authority.',
  capped_by_max_permitted: 'Capped at the capability ceiling.',
  production_requires_separate_pilot_approval: 'Production needs a separately approved pilot.',
  no_tool_grants: 'No tools are granted, so it is held at autonomy:R2.',
  human_decision_required_at_every_level: 'A human makes this decision at every level.',
  capped_below_automation_because_human_decision: 'Held at autonomy:R5 because the decision stays human.',
});

/**
 * Effective authority for ONE capability. Never consults any other capability.
 * input: { capability_id, approved_autonomy, max_permitted_autonomy, granted_tools, environment, human_decision }
 */
export function effectiveAuthority(input) {
  const reasons = [];

  if (!isAutonomyStage(input.approved_autonomy)) {
    reasons.push('no_approved_autonomy');
    return { capability_id: input.capability_id, effective_autonomy: null, reasons };
  }

  let level = input.approved_autonomy;

  // A ceiling can only ever LOWER the result.
  if (isAutonomyStage(input.max_permitted_autonomy)
      && autonomyIndex(input.max_permitted_autonomy) < autonomyIndex(level)) {
    level = input.max_permitted_autonomy;
    reasons.push('capped_by_max_permitted');
  }

  // Production is never reached by approval alone: a pilot (R6) is separately approved.
  if (input.environment === 'production' && autonomyIndex(level) >= autonomyIndex('autonomy:R6')) {
    reasons.push('production_requires_separate_pilot_approval');
  }

  // No tool grants means nothing beyond answering from approved knowledge.
  if (input.granted_tools.length === 0 && autonomyIndex(level) > autonomyIndex('autonomy:R2')) {
    level = 'autonomy:R2';
    reasons.push('no_tool_grants');
  }

  // A human-required decision stays human-required at EVERY level. It is never automated.
  if (input.human_decision) {
    reasons.push('human_decision_required_at_every_level');
    if (autonomyIndex(level) > autonomyIndex('autonomy:R5')) {
      level = 'autonomy:R5';
      reasons.push('capped_below_automation_because_human_decision');
    }
  }

  return { capability_id: input.capability_id, effective_autonomy: level, reasons };
}

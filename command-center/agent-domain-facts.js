// PLATFORM CODE facts for the Agent domain tab. Each one is copied from a named platform file at
// commit 9d9aa3c3 (see command-center/sources/SOURCES.json) and is shown on the page with that
// citation. None of these is an endpoint response, and none of them is an approval.
import { PLATFORM_COMMIT } from './authority.js';

export const DOMAIN_KEY = 'product_experience';

export const ENDPOINTS = Object.freeze({
  mine: '/api/admin/agent-domains-mine',
  domain: `/api/admin/agent-domains/${DOMAIN_KEY}`,
  coverage: `/api/admin/agent-domains/${DOMAIN_KEY}/coverage`,
  requests: '/api/admin/agent-domain-change-requests-mine',
});

/**
 * The endpoints each panel reads, by panel number (criterion 1: every panel names them). Capability
 * fields (panels 2-4) are assigned to the per-domain endpoint, as the platform's own snapshot does
 * (CAPABILITY_SOURCE_NOTE). Panel 6 reports on all four.
 */
export const PANEL_ENDPOINTS = Object.freeze({
  1: ['mine', 'domain'],
  2: ['domain', 'coverage'],
  3: ['domain'],
  4: ['domain'],
  5: ['requests'],
  6: ['mine', 'domain', 'coverage', 'requests'],
});

const cite = (path, commit = PLATFORM_COMMIT) => ({ kind: 'platform_code', path, commit });

/**
 * Why panels 2-4 name the per-domain endpoint yet show source-file values. Read at platform commit
 * 992e0e01 (2026-11-02), later than PLATFORM_COMMIT, because the snapshot module is newer.
 */
export const CAPABILITY_SOURCE_NOTE = Object.freeze({
  source: cite('backend/src/services/agentDomain/agentDomainSnapshot.ts', '992e0e01'),
  statement: `The platform names GET ${ENDPOINTS.domain} as the source of capability records. That route's `
    + 'response does not include the capability records (agentDomainRoutes.ts at 992e0e01), so the values '
    + 'in this panel come from the pinned source file instead.',
});

/**
 * The product_experience registry entry (agentDomainRegistry.ts). Its agent_id is a static SEED value,
 * not live data: the platform fills it for learner_success and curriculum only, and deliberately never
 * writes the other nine domains' agent ids back, because they differ per environment
 * (agentDomainAgentLink.ts, lines 9-22, at cc1ebc55). So agent_id: null here is not evidence that no
 * agent exists. Whether one is linked comes only from the live endpoint (agentLink in the model).
 * This repository never edits the registry and never writes an agent id into it.
 */
export const REGISTRY_ENTRY = Object.freeze({
  source: cite('backend/src/services/agentDomain/agentDomainRegistry.ts'),
  agent_id: null,
  agent_id_label: 'Registry seed value, not kept current for Product Experience & UI/UX',
  stale_note: 'The registry\'s agent_id is a seed value. The platform fills it only for learner_success and curriculum, '
    + 'and deliberately does not write the other domains\' agent ids back, because they differ per environment. '
    + 'It is not evidence either way; whether an agent is linked comes from the live endpoint.',
  can_reach_surface: false,
  blocker: 'manager_has_no_admin_login: Mohammed Abdul Aleem has an org_members row but no admin_users row, '
    + "so they cannot open their employee's Agent Detail or Talk surface. Needs an admin_users row with a "
    + 'scoped mgmt_role, or an alternative surface.',
});

/**
 * Where the live link comes from: linkDomainAgents() fills agent_domain_projects.agent_id by agent name
 * (agentDomainAgentLink.ts, added 2026-10-30), and GET /api/admin/agent-domains-mine reads that column
 * (agentDomainProvisionedReader.ts). Linking changes no authority: it never writes enabled,
 * autonomy_level or tools_granted.
 */
export const AGENT_LINK_SOURCE = Object.freeze({
  source: cite('backend/src/services/agentDomain/agentDomainAgentLink.ts', 'cc1ebc55'),
  statement: 'The platform links an agent to a domain in agent_domain_projects.agent_id, and the endpoint reads that '
    + 'column. Linking grants nothing: it does not change the agent\'s enabled state, autonomy level or tools.',
});

/** coverageMatrix.ts rowFor(): effective_authority is null on every row, because nothing is approved. */
export const NO_APPROVALS_RECORDED = Object.freeze({
  source: cite('backend/src/services/agentDomain/coverageMatrix.ts'),
  statement: 'No approved autonomy is recorded for any capability. The platform sets effective_authority to null on every coverage row.',
});

/**
 * The tool throttle in effectiveAuthority() (autonomyLadder.ts). Criterion 4 as Ali Muwwakkil
 * confirmed it on 2026-11-02: show the rule, and say whether it constrains anything and why.
 * Never fabricate a capability above R2 to make the rule fire.
 */
export const TOOL_RULE = Object.freeze({
  source: cite('backend/src/services/agentDomain/autonomyLadder.ts'),
  rule: 'When a capability\'s approved level is above autonomy:R2 and no tools are granted, effectiveAuthority() '
    + 'holds it at autonomy:R2, with the reason no_tool_grants. It acts on the approved level, not on the '
    + 'starting rung or the ceiling the research proposes.',
});

/**
 * Criterion 4 wording, exactly as Mohammed Abdul Aleem approved it on 2026-11-03 (Option 1). Used
 * verbatim on the console and on every capability detail page.
 */
export const AUTHORITY_WORDS = Object.freeze({
  not_approved: 'Starting rung — no human approval yet',
  approved: 'Approved by a named human at',
  cap_idle: 'Tool-grant cap in force; constrains nothing today',
  cap_holding: 'Tool-grant cap in force; holding this capability at autonomy:R2',
});

/** agentDomainCommandCenterStory.ts: why autonomy:R8 cannot be reached. */
export const R8_UNREACHABLE = Object.freeze({
  source: cite('backend/src/services/agentDomain/agentDomainCommandCenterStory.ts'),
  rung: 'autonomy:R8',
  statement: 'Coordinated handoff between two agents does not exist in this platform today, so autonomy:R8 is unreachable by fact rather than by choice.',
});

/** agentChangeRequestRoutes.ts: what filing and deciding do. */
export const REQUEST_RULE = Object.freeze({
  source: cite('backend/src/routes/admin/agentChangeRequestRoutes.ts'),
  statement: 'Filing a request grants nothing. A decision records approved or declined and stops: it starts no build and grants no tool.',
});

/**
 * Panel 1: the agent fields on this domain's row in GET /api/admin/agent-domains-mine, as the
 * platform returns them since AF3.9 (agentDomainProvisionedReader.ts at 992e0e01). All of them are
 * null when no ai_agents row is linked to the domain: that means "no agent yet", not a failed read.
 */
export const MINE_AGENT_FIELDS = Object.freeze([
  { key: 'agent_display_name', label: 'Agent name' },
  { key: 'agent_enabled', label: 'Enabled' },
  { key: 'agent_autonomy_level', label: 'Autonomy level' },
  { key: 'agent_tools_granted_count', label: 'Tools granted (count)' },
  { key: 'agent_tools_granted', label: 'Tools granted' },
  { key: 'agent_autonomy_level_set_at', label: 'Autonomy last set at' },
  { key: 'agent_autonomy_level_source', label: 'Autonomy set by a person (manual) or by default (auto)' },
]);

/** The per-agent autonomy scale is not the capability ladder (agentDomainSnapshot.ts at 992e0e01). */
export const AGENT_AUTONOMY_SCALE = 'Per-agent scale: observe | suggest | act_audited | communicate. '
  + 'This is not a rung on the autonomy:R0 to R9 ladder, and the two are never compared.';

/** The one field the platform genuinely does not store. */
export const SET_BY_NOT_RECORDED = Object.freeze({
  source: cite('backend/src/services/agentDomain/agentDomainSnapshot.ts', '992e0e01'),
  field: 'agent.autonomy_level_set_by',
  reason: "The platform does not store who set an agent's autonomy level. ai_agents records when it was set "
    + 'and whether a person chose it (autonomy_level_source), but has no set_by column, so no name is shown.',
});

/**
 * Fields the STORY-000 brief asks for that no verified source provides. Panels render these as
 * labelled blanks, and the "What is not available" panel lists them from here.
 */
export const UNAVAILABLE_FIELDS = Object.freeze([
  { panel: 'Your employee', field: 'autonomy_level_set_by', why: SET_BY_NOT_RECORDED.reason },
  { panel: 'Autonomy ladder', field: "employee's current rung", why: 'Unknown: no verified source records an agent\'s rung '
    + 'on the autonomy:R0 to R9 ladder. Rungs belong to capabilities. The agent\'s autonomy_level, when captured, is a '
    + 'different scale and is never drawn as a rung.' },
]);

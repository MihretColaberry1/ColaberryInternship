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
  // Panel 5 reads no endpoint: it reads the whole-domain queue from the platform's synced snapshot
  // (GOVERNANCE_SNAPSHOT), never GET .../agent-domain-change-requests-mine, which holds only the caller's own.
  5: [],
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
  // The registry records a manager-access blocker for this domain. Mihret's decision D4 (2026-11-10):
  // this public page states it in neutral words, with no name and no account records.
  blocker: 'Accountable manager access: Not configured in the admin portal.',
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

/**
 * The tool throttle in the platform's effectiveAuthority() (autonomyLadder.ts). Criterion 4: show the
 * rule and whether it constrains anything. The rule's wording, its verdict and every capability's
 * reasons are the platform's own (`authority_rule` and `authority[]` in .colaberry/agent-domain.json);
 * this page never recalculates them. Only where the rule is defined is cited here.
 */
export const TOOL_RULE = Object.freeze({
  source: cite('backend/src/services/agentDomain/autonomyLadder.ts'),
  reason: 'no_tool_grants',
});

/**
 * Criterion 4 wording. "Starting rung" and the two cap phrases are Mohammed Abdul Aleem's (2026-11-03).
 * Human approval is a separate platform record, AgentDomainCapabilityConfirmation, which the snapshot
 * does not carry yet (the platform owner's confirmation), so the page says it is not available rather
 * than inferring it from any other field. Used verbatim on the console and on every capability page.
 */
export const AUTHORITY_WORDS = Object.freeze({
  starting: 'Starting rung',
  not_starting: 'Not the starting rung',
  confirmation_unavailable: 'Not available: the platform does not expose human confirmation records (AgentDomainCapabilityConfirmation) yet',
  confirmation_short: 'human confirmation not available from the platform yet',
  cap_idle: 'Tool-grant cap in force; constrains nothing today',
  cap_holding: 'Tool-grant cap in force; holding this capability at autonomy:R2',
  not_in_snapshot: 'Not in the platform snapshot',
});

/**
 * Panel 3's headline when every capability is at autonomy:R0 and that is its starting rung, in Mohammed
 * Abdul Aleem's exact wording from his re-review of PR #1 (2026-11-13): "The platform records R0 for all
 * 25, set by default, not by a person. Make the headline say exactly that ... Default and approval should
 * never read as the same thing." It is his statement, shown as he worded it; the page does not read
 * approved_autonomy to produce it. Ali Muwwakkil's separate platform statement of 2026-11-14 (human
 * confirmation records are not exposed) stays in Panel 3's "Human confirmation" row.
 */
export const R0_DEFAULT_HEADLINE = Object.freeze({
  rung: 'autonomy:R0',
  before: (count) => `All ${count} at `,
  after: ', the starting rung, set by default. No human has approved a higher level.',
  source: "Mohammed Abdul Aleem, re-review of PR #1, 2026-11-13",
});

/**
 * Per-rung behaviours: the platform holds all of them in its release ladder and capability records, but
 * no route serves them yet (the platform owner's confirmation). Until one does, the page reads them from
 * the pinned capability file and says so; it never makes a second copy.
 */
export const BEHAVIOUR_EXPOSURE = Object.freeze({
  statement: 'The platform holds these behaviours in its release ladder and capability records, but no route serves them yet, '
    + 'so they are read from the pinned capability file.',
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
  statement: 'Filing a request grants nothing. A request is submitted, then approved, declined or withdrawn; a decision records '
    + 'approved or declined and stops: it starts no build and grants no tool or capability.',
});

/**
 * The governance request statuses, as the platform owner defined them (2026-11-14): submitted is the
 * one pending status; approved, declined and withdrawn are terminal. Any other value is shown as
 * recorded and labelled unrecognised, never guessed into one of these. No status grants anything.
 */
export const REQUEST_STATUSES = Object.freeze({
  submitted: { terminal: false, tone: 'warn', words: 'Submitted: waiting on a human decision' },
  approved: { terminal: true, tone: 'info', words: 'Approved: a decision is recorded; it grants nothing by itself' },
  declined: { terminal: true, tone: 'neutral', words: 'Declined: a decision is recorded' },
  withdrawn: { terminal: true, tone: 'neutral', words: 'Withdrawn: closed without a decision' },
});

/** Every request row says this in its own column, change and tool requests alike. */
export const REQUEST_GRANTS_NOTHING = 'Nothing: a request is not a grant of any tool or capability';

/**
 * Panel 5's one source (the platform owner's decision: the whole queue). The platform's sync job fills
 * the snapshot's governance section from AgentDomainChangeRequest WHERE domain_key = this domain, newest
 * first, at most 200 rows, keeping no person fields (governanceForDomain in
 * agentDomainCommandCenterForSync.ts at 992e0e01). The section's own label names
 * GET /api/admin/agent-domain-change-requests-mine, a route that returns only the caller's own requests
 * (listMyChangeRequests: WHERE requested_by_identity = caller, at 9d9aa3c3), so the label does not
 * describe these rows. A personal capture of that route is never used for this panel.
 */
export const GOVERNANCE_SNAPSHOT = Object.freeze({
  source: cite('backend/src/services/agentDomain/agentDomainCommandCenterForSync.ts', '992e0e01'),
  limit: 200,
  statement: `Every change and tool request filed against ${DOMAIN_KEY}, by anyone: the platform's synced snapshot (governance section of .colaberry/agent-domain.json).`,
  limit_words: 'The platform includes at most the 200 newest requests in the snapshot; any older ones are not shown here.',
  people_words: 'Not included in the platform snapshot',
  mine_route: '/api/admin/agent-domain-change-requests-mine',
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

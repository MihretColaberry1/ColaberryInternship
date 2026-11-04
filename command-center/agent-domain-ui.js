// Building blocks for the Agent domain tab. Every value is tagged with where it came from, and
// every endpoint has a distinct state for loading, not captured, refused, failed and empty.
import { h } from './dom.js';
import { badge } from './ui.js';
import { formatCentral } from './model.js';
import { PLATFORM_COMMIT } from './authority.js';
import { SNAPSHOT_FILE } from './agent-domain-data.js';
import { CAPABILITY_SOURCE_NOTE, ENDPOINTS, PANEL_ENDPOINTS } from './agent-domain-facts.js';

const SOURCE_FILE_NAME = 'capabilities/product_experience.json';

/** A visible tag naming the source of a value. Colour only reinforces the words. */
export function sourceTag(kind, detail) {
  const labels = {
    endpoint: 'Endpoint',
    source_file: 'Source file',
    platform_code: 'Platform code',
    unavailable: 'Unavailable',
  };
  return h('span', { class: `src src-${kind}` }, labels[kind], detail ? h('span', { class: 'src-detail' }, ` · ${detail}`) : null);
}

export const sourceFileTag = () => sourceTag('source_file', `${SOURCE_FILE_NAME} @${PLATFORM_COMMIT}`);
export const platformTag = (path, commit = PLATFORM_COMMIT) => sourceTag('platform_code', `${path.split('/').pop()} @${commit}`);
export const unavailableTag = () => sourceTag('unavailable', 'no verified source');

/** The endpoint tags for panel n, from PANEL_ENDPOINTS, so no panel can forget to name one. */
export const endpointTags = (n) => PANEL_ENDPOINTS[n].flatMap((k) => [sourceTag('endpoint', `GET ${ENDPOINTS[k]}`), ' ']);

/** Panels 2-4: they name the per-domain endpoint, but its response does not carry their values. */
export function capabilitySourceNote() {
  const { source, statement } = CAPABILITY_SOURCE_NOTE;
  return h('p', { class: 'muted source-note' }, platformTag(source.path, source.commit), ' ', statement);
}

export function draftBadge(state) {
  if (state === 'draft') return badge('warn', 'Draft: not agreed by anyone');
  if (state === 'confirmed') return badge('info', 'Confirmed in the research record');
  return badge('neutral', state ?? 'not stated');
}

export function centralTime(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'time not recorded' : formatCentral(d);
}

/** The words for an endpoint that did not return usable data. Returns null when it did. */
export function endpointNotice(path, e) {
  const tag = sourceTag('endpoint', `GET ${path}`);
  if (e.state === 'ok') return null;
  if (e.state === 'loading') {
    return h('div', { class: 'state state-loading', 'aria-busy': 'true' }, tag, h('p', {}, 'Loading…'));
  }
  if (e.state === 'not_captured') {
    return h('div', { class: 'state state-not-captured' }, tag,
      h('p', { class: 'state-title' }, 'Not captured yet'),
      h('p', {}, 'Nothing from this endpoint is shown, and nothing is assumed in its place. Capture it with your own sign-in, ',
        'review the file, and save it as ', h('code', {}, SNAPSHOT_FILE), ' to see it here. That folder is ignored by git.'));
  }
  if (e.state === 'refused') {
    return h('div', { class: 'state state-refused' }, tag,
      h('p', { class: 'state-title' }, `Refused (HTTP ${e.status}) when captured on ${centralTime(e.fetched_at)}`),
      h('p', {}, 'Your sign-in is not permitted to read this endpoint. This page does not work around that.'),
      e.message ? h('p', { class: 'muted' }, `The platform said: ${e.message}`) : null);
  }
  const what = e.state === 'failed' ? `No response (${e.message})` : `HTTP ${e.status}`;
  return h('div', { class: 'state state-refused' }, tag,
    h('p', { class: 'state-title' }, `Could not be read: ${what}`),
    e.message && e.state !== 'failed' ? h('p', { class: 'muted' }, `The platform said: ${e.message}`) : null);
}

/** A line saying which endpoint a panel read, and when, for a panel that has data. */
export function endpointRead(path, e) {
  return h('p', { class: 'reads' }, sourceTag('endpoint', `GET ${path}`),
    ` HTTP ${e.status}, captured ${centralTime(e.fetched_at)}`);
}

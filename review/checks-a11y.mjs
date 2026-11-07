// Markup checks. Each returns findings with one of two statuses:
//   pattern_detected    the exact pattern the draft rule describes is present at that line
//   needs_human_review  a heuristic hit, or the answer depends on something outside this file
// Neither status means an official accessibility or design-system violation.
import { classNames, classWords } from './jsx-tags.mjs';

const INTERACTIVE = new Set(['button', 'a', 'input', 'select', 'textarea', 'label', 'summary', 'option', 'details']);
const isHtml = (name) => /^[a-z]/.test(name);
const has = (t, ...names) => names.some((n) => n in t.attrs);
const str = (t, n) => (t.attrs[n]?.kind === 'string' ? t.attrs[n].raw : undefined);

/** Walks the tags keeping a stack of open ancestors, and calls visit(tag, ancestors). */
function walk(tags, visit) {
  const stack = [];
  tags.forEach((t, idx) => {
    if (t.kind === 'close') {
      const at = stack.map((s) => s.name).lastIndexOf(t.name);
      if (at !== -1) stack.splice(at).forEach((s) => { s.closeIdx = idx; });
      return;
    }
    visit(t, stack.slice(), idx);
    if (!t.selfClosing) stack.push(t);
  });
}

function finding(check, status, tag, rationale, suggestion, notes = []) {
  return { check, status, offset: tag.start, end: tag.end, line: tag.line, rationale, suggestion, notes };
}

function labelFindings(t, ancestors, labelledIds) {
  if (!['input', 'select', 'textarea'].includes(t.name) || str(t, 'type') === 'hidden') return [];
  if (has(t, 'aria-label', 'aria-labelledby') || ancestors.some((a) => a.name === 'label')) return [];
  const id = t.attrs.id;
  if (id?.kind === 'string' && labelledIds.has(id.raw)) return [];
  const placeholder = has(t, 'placeholder') ? ' It has a placeholder, which is not a label.' : '';
  if (t.spread || id?.kind === 'expr') {
    return [finding('form_control_label', 'needs_human_review', t,
      `This <${t.name}> has no label that can be resolved from this file, but its ${t.spread ? 'spread props' : 'id expression'} might supply one.`,
      'Confirm whether a label reaches this control at runtime; if not, add a <label htmlFor> or an aria-label.')];
  }
  return [finding('form_control_label', 'pattern_detected', t,
    `This <${t.name}> has no associated <label>, aria-label or aria-labelledby in this file.${placeholder}`,
    'Add a visible <label htmlFor="..."> or an aria-label. The wording is a content decision for the reviewer.')];
}

function clickFindings(t) {
  if (!('onClick' in t.attrs) || !isHtml(t.name) || INTERACTIVE.has(t.name)) return [];
  if (t.name === 'span' || t.name === 'div') {
    return [finding('click_on_non_button', 'pattern_detected', t,
      `A <${t.name}> carries onClick. The draft rule says clickable actions use <button>, not <span> or <div>.`,
      'Use a <button> (for example `btn btn-link p-0`), which is focusable and keyboard-operable by default.')];
  }
  return [finding('click_on_non_button', 'needs_human_review', t,
    `A <${t.name}> carries onClick. The draft rule names only <span> and <div>, so whether it applies to <${t.name}> is a judgment.`,
    'Decide whether this needs a keyboard-reachable control (for example a <button> inside the row) as well as the mouse handler.',
    ['Keyboard reachability itself is not checked by this prototype.'])];
}

function buttonFindings(t, src, tags) {
  if (t.name !== 'button' || has(t, 'aria-label', 'aria-labelledby') || t.spread) return [];
  let text = '';
  if (!t.selfClosing) {
    const close = tags[t.closeIdx];
    if (!close) return [];
    text = src.slice(t.end, close.start);
    if (/\{/.test(text.replace(/<[^>]*>/g, ''))) return [];
    text = text.replace(/<[^>]*>/g, '').trim();
  }
  if (text.length > 1 && /[A-Za-z0-9]/.test(text)) return [];
  return [finding('icon_button_name', 'needs_human_review', t,
    text ? `This button's only visible text is "${text}", which may be an icon, and it has no aria-label.` : 'This button has no text content and no aria-label.',
    'If it is icon-only, add an aria-label on the button and aria-hidden="true" on the icon.')];
}

function alertFindings(t) {
  const fixed = classNames(t);
  const isAlert = fixed ? fixed.includes('alert') : classWords(t).includes('alert');
  if (!isAlert || has(t, 'role', 'aria-live')) return [];
  if (!fixed) {
    return [finding('alert_announcement', 'needs_human_review', t, 'This element may carry the `alert` class (its className is an expression) and has no role or aria-live.',
      'If it shows an alert message, add role="alert" or aria-live="assertive".')];
  }
  return [finding('alert_announcement', 'pattern_detected', t, 'This element has the `alert` class but no role="alert" or aria-live, so the message may not be announced.',
    'Add role="alert" (or aria-live="assertive") to the alert element.')];
}

function spinnerFindings(t, ancestors) {
  const words = classNames(t) ?? classWords(t);
  if (!words.some((w) => w === 'spinner-border' || w === 'spinner-grow')) return [];
  if (ancestors.some((a) => has(a, 'aria-live'))) return [];
  if (str(t, 'role') === 'status') {
    return [finding('spinner_live_region', 'needs_human_review', t,
      'The spinner has role="status" but is not wrapped in an aria-live region. role="status" is itself a polite live region, while the draft rule\'s pattern wraps the spinner in aria-live="polite" with aria-busy.',
      'The reviewer decides whether role="status" is enough here or whether the wrapping pattern from the source should be used.')];
  }
  return [finding('spinner_live_region', 'pattern_detected', t, 'The loading spinner is not inside an aria-live region and has no role="status".',
    'Wrap the loading state in <div aria-live="polite" aria-busy={loading}>.')];
}

function modalFindings(t) {
  const fixed = classNames(t);
  if (!fixed || !fixed.includes('modal') || str(t, 'role') === 'dialog') return [];
  return [finding('modal_dialog_role', 'pattern_detected', t, 'This element has the `modal` class but no role="dialog".',
    'Add role="dialog", aria-modal="true" and aria-labelledby pointing at the modal title.')];
}

function headingFindings(headings) {
  const out = [];
  for (let k = 1; k < headings.length; k++) {
    const prev = headings[k - 1].level; const cur = headings[k].level;
    if (cur > prev + 1) {
      out.push(finding('heading_order', 'pattern_detected', headings[k].tag, `Heading level jumps from h${prev} to h${cur} within this file.`,
        `Use h${prev + 1} here and set the visual size with a utility class.`));
    }
  }
  const h1s = headings.filter((h) => h.level === 1);
  h1s.slice(1).forEach((h) => out.push(finding('heading_order', 'pattern_detected', h.tag, 'This file has more than one <h1>.', 'Keep one <h1> per page.')));
  if (headings.length && !h1s.length) {
    out.push(finding('heading_order', 'needs_human_review', headings[0].tag,
      `This file has no <h1>; its first heading is h${headings[0].level}. Whether the page has one <h1> depends on the page or layout that renders this file, which was not reviewed.`,
      'Check the parent page: if it supplies the <h1>, nothing is needed here.'));
  }
  return out;
}

export function markupFindings({ stripped, tags }) {
  const labelledIds = new Set(tags.filter((t) => t.kind === 'open' && t.name === 'label').map((t) => str(t, 'htmlFor')).filter(Boolean));
  const out = [];
  const headings = [];
  const visits = [];
  walk(tags, (t, ancestors) => visits.push([t, ancestors]));
  for (const [t, ancestors] of visits) {
    const h = /^h([1-6])$/.exec(t.name);
    if (h) headings.push({ level: Number(h[1]), tag: t });
    out.push(...labelFindings(t, ancestors, labelledIds), ...clickFindings(t), ...buttonFindings(t, stripped, tags),
      ...alertFindings(t), ...spinnerFindings(t, ancestors), ...modalFindings(t));
    if (t.name === 'img' && (t.spread || !has(t, 'alt'))) {
      out.push(t.spread && !has(t, 'alt')
        ? finding('img_alt', 'needs_human_review', t, 'This <img> has no alt in this file, but its spread props might supply one.', 'Confirm an alt attribute reaches it at runtime.')
        : finding('img_alt', 'pattern_detected', t, 'This <img> has no alt attribute.', 'Add a descriptive alt, or alt="" with aria-hidden="true" if the image is decorative. The wording is the reviewer\'s call.'));
    }
  }
  return out.concat(headingFindings(headings));
}

// Colour checks: hex_in_inline_style and hardcoded_hex (a raw hex anywhere else in the file).
// Each hex occurrence is reported once. Inside a `style={{ }}` it belongs to hex_in_inline_style; elsewhere to hardcoded_hex.
// Only hex inside a string literal counts, so JSX text such as "ticket #123" is not a colour.
import { stringRanges } from './jsx-tags.mjs';
import { normaliseHex } from './tokens.mjs';

// 3, 4, 6 or 8 hex digits, not part of a longer word, and not an HTML entity like &#123;.
const HEX = /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])/g;

// Attribute values that hold anchors or ids, where "#add" is a link target, not a colour.
const NON_COLOUR_ATTRS = new Set(['href', 'to', 'id', 'htmlFor', 'key', 'name', 'target']);

function tokenAdvice(hex, tokens) {
  const names = tokens.get(normaliseHex(hex));
  if (names) {
    return {
      suggestion: `Use the existing token instead of the raw value: ${names.map((n) => `var(${n})`).join(' or ')} (exact match in the token file).`,
      note: 'Which token layer is authoritative is unresolved (R0 definition, section 1.4), so the reviewer confirms the token choice.',
    };
  }
  return {
    suggestion: 'No token in the token file has exactly this value. Whether to add a token, map it to an existing one, or record an exception is a decision for Aleem.',
    note: 'No exception list exists yet (R0 decision D5). This may be a deliberate colour, for example a third-party brand colour.',
  };
}

export function colourFindings({ stripped, tags, lineAt, tokens }) {
  const styleRanges = [];
  const skipRanges = [];
  for (const t of tags) {
    if (t.kind !== 'open') continue;
    for (const [name, a] of Object.entries(t.attrs)) {
      const range = [a.start, a.start + a.raw.length];
      if (name === 'style' && a.kind === 'expr') styleRanges.push(range);
      if (NON_COLOUR_ATTRS.has(name)) skipRanges.push(range);
    }
  }
  const strings = stringRanges(stripped);
  const inside = (ranges, o) => ranges.some(([s, e]) => o >= s && o < e);
  const out = [];
  for (const m of stripped.matchAll(HEX)) {
    if (!inside(strings, m.index) || inside(skipRanges, m.index)) continue;
    const inStyle = inside(styleRanges, m.index);
    const advice = tokenAdvice(m[0], tokens);
    out.push({
      check: inStyle ? 'hex_in_inline_style' : 'hardcoded_hex',
      status: 'pattern_detected',
      offset: m.index,
      line: lineAt(m.index),
      value: m[0],
      rationale: inStyle
        ? `The raw colour ${m[0]} is written inside an inline style, which the draft rule says not to do.`
        : `The raw colour ${m[0]} is hard-coded in the file rather than taken from a token.`,
      suggestion: advice.suggestion,
      notes: [advice.note],
    });
  }
  return out;
}

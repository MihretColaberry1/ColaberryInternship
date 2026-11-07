// A small, dependency-free reader for JSX opening and closing tags.
//
// It is not a parser. It finds `<name attr=... >` and `</name>` in source text, handling attribute
// values that are strings or `{ ... }` expressions (including nested braces, strings and arrows).
// Known limits, reported in every review so nobody mistakes this for a full parse:
// - Attributes built at runtime (`{...props}`) cannot be resolved; checks treat them as unknown.
// - `//` inside JSX text is taken as a comment, so the rest of that line is not scanned.
// - A `<` that starts something tag-shaped but breaks the attribute grammar is skipped, not guessed.

/** Replaces comments with spaces (keeping newlines), so line numbers and offsets stay the same. */
export function stripComments(src) {
  const out = src.split('');
  let i = 0;
  const blank = (from, to) => { for (let k = from; k < to; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '; };
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === '/' && n === '/') {
      let j = i; while (j < src.length && src[j] !== '\n') j++;
      blank(i, j); i = j;
    } else if (c === '/' && n === '*') {
      let j = src.indexOf('*/', i + 2); j = j === -1 ? src.length : j + 2;
      blank(i, j); i = j;
    } else if (c === '"' || c === "'" || c === '`') {
      i = skipString(src, i);
    } else {
      i++;
    }
  }
  return out.join('');
}

/** [start, end) offsets of every string literal, in source with comments already stripped. */
export function stringRanges(src) {
  const ranges = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') {
      const j = skipString(src, i);
      ranges.push([i, j]);
      i = j;
    } else {
      i++;
    }
  }
  return ranges;
}

// Strings in ' or " end at a newline as well as their quote, so an apostrophe in JSX text
// ("Don't") cannot swallow more than one line.
function skipString(src, i) {
  const q = src[i];
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === '\\') { j += 2; continue; }
    if (src[j] === q) return j + 1;
    if (q !== '`' && src[j] === '\n') return j;
    j++;
  }
  return j;
}

function skipBraces(src, i) {
  let depth = 0;
  let j = i;
  while (j < src.length) {
    const c = src[j];
    if (c === '"' || c === "'" || c === '`') { j = skipString(src, j); continue; }
    if (c === '{') depth++;
    if (c === '}') { depth--; if (depth === 0) return j + 1; }
    j++;
  }
  return -1;
}

const NAME = /[A-Za-z][\w.:-]*/y;
const ATTR = /[A-Za-z_][\w:-]*/y;

function readOpening(src, start) {
  NAME.lastIndex = start + 1;
  const m = NAME.exec(src);
  if (!m) return null;
  const tag = { kind: 'open', name: m[0], start, attrs: {}, spread: false, selfClosing: false };
  let i = NAME.lastIndex;
  for (;;) {
    while (/\s/.test(src[i] ?? '')) i++;
    if (src[i] === '>') { tag.end = i + 1; return tag; }
    if (src[i] === '/' && src[i + 1] === '>') { tag.end = i + 2; tag.selfClosing = true; return tag; }
    if (src[i] === '{') {
      const j = skipBraces(src, i);
      if (j === -1 || !/^\{\s*\.\.\./.test(src.slice(i, j))) return null;
      tag.spread = true; i = j; continue;
    }
    ATTR.lastIndex = i;
    const a = ATTR.exec(src);
    if (!a) return null;
    i = ATTR.lastIndex;
    if (src[i] !== '=') { tag.attrs[a[0]] = { kind: 'bool', raw: '', start: a.index }; continue; }
    i++;
    if (src[i] === '"' || src[i] === "'") {
      const j = skipString(src, i);
      if (src[j - 1] !== src[i]) return null;
      tag.attrs[a[0]] = { kind: 'string', raw: src.slice(i + 1, j - 1), start: i + 1 }; i = j;
    } else if (src[i] === '{') {
      const j = skipBraces(src, i);
      if (j === -1) return null;
      tag.attrs[a[0]] = { kind: 'expr', raw: src.slice(i + 1, j - 1), start: i + 1 }; i = j;
    } else {
      return null;
    }
  }
}

/** Every opening and closing tag in source order, with the line each one starts on. */
export function readTags(src) {
  const lineStarts = [0];
  for (let k = 0; k < src.length; k++) if (src[k] === '\n') lineStarts.push(k + 1);
  const lineAt = (offset) => {
    let lo = 0; let hi = lineStarts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= offset) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
  const tags = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') { i = skipString(src, i); continue; }
    if (c !== '<') { i++; continue; }
    if (src[i + 1] === '/') {
      const m = /^<\/([A-Za-z][\w.:-]*)\s*>/.exec(src.slice(i, i + 200));
      if (m) { tags.push({ kind: 'close', name: m[1], start: i, end: i + m[0].length, line: lineAt(i) }); i += m[0].length; continue; }
      i++; continue;
    }
    // A closing tag may follow text directly ("row</td>"); an opening one right after a word or
    // bracket is a generic or a comparison (useState<string>, a<b), not markup.
    if (/[\w)\]]/.test(src[i - 1] ?? '')) { i++; continue; }
    const tag = readOpening(src, i);
    if (!tag) { i++; continue; }
    tag.line = lineAt(i);
    tags.push(tag);
    i = tag.end;
  }
  return { tags, lineAt };
}

/** The whitespace-separated class names of a string className, or null when it is an expression. */
export function classNames(tag) {
  const a = tag.attrs.className ?? tag.attrs.class;
  if (!a) return [];
  if (a.kind === 'string') return a.raw.split(/\s+/).filter(Boolean);
  return null;
}

/** Class-like words inside a className expression, for heuristic matching only. */
export function classWords(tag) {
  const a = tag.attrs.className ?? tag.attrs.class;
  if (!a) return [];
  return [...a.raw.matchAll(/[A-Za-z][\w-]*/g)].map((m) => m[0]);
}

// Names in code comments, replaced by the published wording (public-wording.mjs) in the PUBLISHED
// copies only. The repository's source files are never written.
//
// Only comment text changes. For JavaScript, comments are found with a small lexer that understands
// strings, template literals (with nested ${...}), regular-expression literals and both comment forms;
// tests/pages-site.test.mjs then checks, for every published file, that the code with comments removed is
// identical to the original's, and renders all 71 pages from the published code.
import { replacePublicNames } from './public-wording.mjs';

const REGEX_AFTER_WORD = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void',
  'throw', 'instanceof', 'yield', 'await']);

function skipQuoted(src, i, quote) {
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === '\\') { j++; continue; }
    if (src[j] === quote) return j + 1;
    if (src[j] === '\n') throw new Error(`unterminated string at offset ${i}`);
  }
  throw new Error(`unterminated string at offset ${i}`);
}

function skipRegex(src, i) {
  let inClass = false;
  for (let j = i + 1; j < src.length; j++) {
    const c = src[j];
    if (c === '\\') { j++; continue; }
    if (c === '\n') throw new Error(`unterminated regular expression at offset ${i}`);
    if (inClass) { if (c === ']') inClass = false; continue; }
    if (c === '[') inClass = true;
    else if (c === '/') { j++; while (/[a-z]/i.test(src[j] ?? '')) j++; return j; }
  }
  throw new Error(`unterminated regular expression at offset ${i}`);
}

/** [start, end) offsets of every comment in a JavaScript module. Throws on input it cannot follow. */
export function jsCommentRanges(src) {
  const ranges = [];
  const stack = []; // 'tpl' for a ${ opened inside a template literal, '{' for an ordinary brace
  let prev = ''; // the last significant token: a punctuator character, 'word', 'value' or a keyword
  let i = 0;
  const template = (from) => { // scans template text from `from`; returns where code resumes
    for (let j = from; j < src.length; j++) {
      if (src[j] === '\\') { j++; continue; }
      if (src[j] === '`') return { at: j + 1, open: false };
      if (src[j] === '$' && src[j + 1] === '{') return { at: j + 2, open: true };
    }
    throw new Error(`unterminated template literal at offset ${from}`);
  };
  while (i < src.length) {
    const c = src[i];
    const d = src[i + 1];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && d === '/') { const e = src.indexOf('\n', i); const end = e === -1 ? src.length : e; ranges.push([i, end]); i = end; continue; }
    if (c === '/' && d === '*') {
      const e = src.indexOf('*/', i + 2);
      if (e === -1) throw new Error(`unterminated block comment at offset ${i}`);
      ranges.push([i, e + 2]); i = e + 2; continue;
    }
    if (c === '"' || c === "'") { i = skipQuoted(src, i, c); prev = 'value'; continue; }
    if (c === '`') { const t = template(i + 1); i = t.at; if (t.open) { stack.push('tpl'); prev = '('; } else prev = 'value'; continue; }
    if (c === '}' && stack[stack.length - 1] === 'tpl') {
      stack.pop(); const t = template(i + 1); i = t.at; if (t.open) { stack.push('tpl'); prev = '('; } else prev = 'value'; continue;
    }
    if (c === '/') {
      const regexAllowed = prev === '' || REGEX_AFTER_WORD.has(prev) || '(,=:[!&|?{};+-*%<>~^'.includes(prev);
      if (regexAllowed) { i = skipRegex(src, i); prev = 'value'; continue; }
      i++; prev = '/'; continue;
    }
    if (/[A-Za-z_$0-9]/.test(c)) {
      let j = i; while (j < src.length && /[A-Za-z_$0-9]/.test(src[j])) j++;
      const w = src.slice(i, j); prev = REGEX_AFTER_WORD.has(w) ? w : 'word'; i = j; continue;
    }
    if (c === '{') stack.push('{');
    else if (c === '}') stack.pop();
    prev = (c === ')' || c === ']' || c === '}') ? 'value' : c;
    i++;
  }
  if (stack.length) throw new Error('unbalanced braces: the lexer could not follow this file');
  return ranges;
}

/** [start, end) offsets of every CSS comment. CSS in this folder has no strings containing slash-star. */
export function cssCommentRanges(src) {
  const ranges = [];
  for (let i = src.indexOf('/*'); i !== -1; i = src.indexOf('/*', i)) {
    const e = src.indexOf('*/', i + 2);
    if (e === -1) throw new Error(`unterminated CSS comment at offset ${i}`);
    ranges.push([i, e + 2]); i = e + 2;
  }
  return ranges;
}

/** Applies `fn` to each range and leaves everything between the ranges byte for byte. */
export function mapRanges(src, ranges, fn) {
  let out = ''; let at = 0;
  for (const [s, e] of ranges) { out += src.slice(at, s) + fn(src.slice(s, e)); at = e; }
  return out + src.slice(at);
}

/** The text with every comment removed: what must stay identical between original and published. */
export const withoutComments = (src, ranges) => mapRanges(src, ranges, () => '');

/** The published copy of one source file: names in its comments replaced, nothing else. */
export function publishSource(file, src) {
  if (file.endsWith('.js')) return mapRanges(src, jsCommentRanges(src), replacePublicNames);
  if (file.endsWith('.css')) return mapRanges(src, cssCommentRanges(src), replacePublicNames);
  return src;
}

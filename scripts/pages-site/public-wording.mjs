// The names replaced in the PUBLISHED GitHub Pages copy, and the words used instead. One list, in one
// place, so the wording is easy to change or restore: delete a row and rebuild, and that name is
// published as written again. The repository's own files are never changed by this list.
//
// Decisions (Mihret, 2026-11-13): staff names are removed from code comments in the published copy;
// the project owner's own name is replaced with "the project owner" in the published copy only. Git
// history, commit authorship and the case-study and portfolio documents are not touched (none of them
// is published to Pages).

/** Staff named in this repository's decisions. */
export const STAFF_NAMES = Object.freeze([
  ['Mohammed Abdul Aleem', 'the accountable manager'],
  ['Ali Muwwakkil', 'the platform owner'],
  ['Muwwakkil', 'the platform owner'],
  ['Mohammed', 'the accountable manager'],
  ['Aleem', 'the accountable manager'],
  ['Abdul', 'the accountable manager'],
  ['Ali', 'the platform owner'],
]);

/** The project owner. Whole words only: the GitHub account name in repository links is not matched. */
export const PROJECT_OWNER_NAMES = Object.freeze([
  ['Mihret Netsereab', 'the project owner'],
  ['Netsereab', 'the project owner'],
  ['Mihret', 'the project owner'],
]);

/** Every replacement, longest name first so a full name is replaced before its parts. */
export const PUBLIC_WORDING = Object.freeze([...STAFF_NAMES, ...PROJECT_OWNER_NAMES]
  .sort((a, b) => b[0].length - a[0].length));

const NAME_RE = new RegExp(`\\b(?:${PUBLIC_WORDING.map(([n]) => n.replace(/\s+/g, '\\s+')).join('|')})\\b`, 'g');
const WORDS = new Map(PUBLIC_WORDING);

/** Replaces every listed name in a piece of text with its published wording. */
export function replacePublicNames(text) {
  return text.replace(NAME_RE, (m) => WORDS.get(m.replace(/\s+/g, ' ')) ?? m);
}

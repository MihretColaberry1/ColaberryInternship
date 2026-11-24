# Self-hosted fonts: Roboto and Roboto Mono

**Why:** Mohammed Abdul Aleem's re-review of PR #1, 13 November 2026: "Self-host Roboto (400 and 700,
Latin subset, woff2) and Roboto Mono (400) in your vendor folder, with their licence, declared with
`font-display: swap`. No font CDN. The design system has no font files of its own, so this is the page's
job for now."

**Declared in:** [fonts.css](fonts.css), loaded by `index.html` and `docs/evidence/state-matrix.html`
before the design-system tokens, which name `'Roboto'` and `'Roboto Mono'` first. Every `url()` is a file
in this folder; nothing is fetched from another site.

## Files and provenance

The files are copied unchanged from the npm packages built by Fontsource from Google Fonts. Each package
was fetched once with `npm pack --ignore-scripts` (no install, no dependency added to this repository),
and its SHA-512 was checked against the registry's published integrity value before anything was copied.

| File | Package | SHA-256 |
|---|---|---|
| `roboto-latin-400-normal.woff2` | `@fontsource/roboto@5.3.0` (`files/`) | `425c0713a8176f92273d378599c7eac57de7fafabd4bd0ed457b70eb8f80d371` |
| `roboto-latin-700-normal.woff2` | `@fontsource/roboto@5.3.0` (`files/`) | `b9d66d1708156f765ada51939bc24ed259dafa69eb631b36e443680fe9e15879` |
| `roboto-mono-latin-400-normal.woff2` | `@fontsource/roboto-mono@5.3.0` (`files/`) | `e03013e0baa5690a803c188da2214d920c3245b25ad78421ecc8ae86cd842ae9` |
| `LICENSE-Roboto.txt` | `@fontsource/roboto@5.3.0` (`LICENSE`) | `84044c09058803d87a241bd28abb4ce30a433d7db9c27a04da3efad6a0ca539c` |
| `LICENSE-RobotoMono.txt` | `@fontsource/roboto-mono@5.3.0` (`LICENSE`) | `b489132782690f2cc1ed23ab56d7057bbb08c42573603e8e704ae2e2ea9c8216` |

Package integrity (registry `dist.integrity`, matched on download, 2026-11-15):
- `@fontsource/roboto@5.3.0`: `sha512-BapRJOWYP+LZ21zp+wBQjfpPYKRoxc4LspJ/RLuI+HSMBD5u/X4O+ESDrSvEqDSy0rAl7GwBJ+09mdc16cVQ1Q==`
- `@fontsource/roboto-mono@5.3.0`: `sha512-yhwplHMHW9dCk+1pZuERfcJe+K3rosGVZEoK0XktkxRSqQ9qsipSwwiuW2/8Qmtp9lzu3Ixa/ie4BMH3i8CkZQ==`

`tests/fonts.test.mjs` fails if any file here no longer matches its SHA-256.

## Licence: SIL Open Font License 1.1

Both families are licensed under the **SIL Open Font License, Version 1.1** (OFL-1.1):
- Roboto: "Copyright 2011 The Roboto Project Authors (https://github.com/googlefonts/roboto-classic)".
- Roboto Mono: "Copyright 2015 The Roboto Mono Project Authors (https://github.com/googlefonts/robotomono)".

Checked on 2026-11-15 against Google's own font repository, `github.com/google/fonts`: `ofl/roboto` and
`ofl/robotomono` each carry `license: "OFL"` in `METADATA.pb` and an `OFL.txt`. The two `LICENSE-*.txt`
files here are the licences shipped in the npm packages; their text is the same OFL 1.1 as Google's
`OFL.txt`, except that the copyright line also names the italic file and the licence's web address is
the older `http://scripts.sil.org/OFL`.

**Not the licence named in the design system's own file.** The pinned
`command-center/vendor/colaberry-ds/LICENSE` says "Roboto & Roboto Mono — Apache License 2.0". That file
is the design system's, kept byte for byte, so it is not edited here. The current releases of both fonts
are OFL 1.1, as above.

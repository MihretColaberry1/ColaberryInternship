// Exact-value lookup from hex colour to token name, read from the token file at the pinned commit.
// Only exact matches count. A "near" match would need a threshold, and that threshold (decision
// D4 in docs/definitions/design_token_drift_audit.R0.md) is not signed.

/** Lower-case, six- or eight-digit form of a hex colour, so #FFF and #ffffff compare equal. */
export function normaliseHex(hex) {
  const h = hex.slice(1).toLowerCase();
  if (h.length === 3 || h.length === 4) return `#${h.split('').map((c) => c + c).join('')}`;
  return `#${h}`;
}

/** Map of normalised hex value to the sorted token names that declare exactly that value. */
export function tokenIndex(css) {
  const index = new Map();
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*[;}]/g)) {
    const key = normaliseHex(m[2]);
    if (!index.has(key)) index.set(key, new Set());
    index.get(key).add(m[1]);
  }
  return new Map([...index].map(([k, v]) => [k, [...v].sort()]));
}

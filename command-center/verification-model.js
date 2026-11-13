// Your ticks and the platform verifier: two records about the same story, kept apart (decision D2,
// 2026-11-10). Pure functions, no DOM, no network.
//
//   - Your ticks: the `passed` flags in .colaberry/progress.json `criteria[]`. Your claim.
//   - Platform verifier: the `verification` block the platform writes into the same file on every
//     sync (docs/DATA_CONTRACT.md): what it confirmed from a pushed commit. Read here as
//     `confirmedPassed` / `confirmedTotal` / `state` on each model row (model.js joinStories).
//
// The two are never added, averaged or shown as one number. A story is "verified" only on the
// platform verifier's record.

/** Stories where your ticks claim more passed criteria than the platform verifier records. */
export function ticksAheadOfVerifier(rows) {
  return (rows ?? [])
    .filter((r) => r.tickedPassed > (r.confirmedPassed ?? 0))
    .map((r) => ({
      id: r.id,
      ticked: r.tickedPassed,
      tickedTotal: r.tickedTotal,
      confirmed: r.confirmedTotal == null ? null : r.confirmedPassed,
      confirmedTotal: r.confirmedTotal ?? null,
      state: r.state ?? null,
    }));
}

export const yourTickWords = (a) => `${a.ticked} of ${a.tickedTotal} criteria ticked in progress.json`;

export const verifierWords = (a) => (a.confirmedTotal == null
  ? 'the platform verifier has no record for this story yet'
  : `the platform verifier records ${a.confirmed} of ${a.confirmedTotal}`);

/** Plan stories only: the verifier's per-rung records (ids ending ".autonomy:Rn") belong to Panel 4. */
export const isPerRungRecord = (storyId) => /\.autonomy:R\d$/.test(String(storyId));

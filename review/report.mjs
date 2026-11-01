// Builds the review report (JSON) and renders it as Markdown for a human reader.
// The report holds no wall-clock time, so the same inputs always give byte-identical output.

export function disclaimer(pack) {
  const approval = pack.approval.state === 'approved'
    ? `The rules pack was approved by ${pack.approval.approved_by}.`
    : `The rules pack is an unapproved draft, compiled by ${pack.supplied_by}. Aleem has not approved it.`;
  const standard = pack.standard.state === 'decided'
    ? `The accessibility standard was set by ${pack.standard.decided_by}.`
    : `This report makes no claim that the page meets or fails ${pack.standard.candidates.join(' or ')}. Which standard applies is pending confirmation.`;
  return [
    'Prototype output for human review. It changes no files and decides nothing.',
    approval,
    '"Pattern detected by a draft rule" means the pattern a draft rule describes is present at that line. It is not an official accessibility or design-system violation.',
    standard,
    'Severity, colour exceptions and every judgment call are left for Aleem. This does not replace his review.',
  ];
}

const STATUS_TEXT = {
  pattern_detected: 'Pattern detected by a draft rule',
  needs_human_review: 'Needs human review (heuristic or context outside this file)',
};

function outcome(findings, elementCount) {
  if (elementCount === 0) {
    return { code: 'nothing_to_review', text: 'The file contains no JSX elements, so nothing was reviewed. This is not a clean result.' };
  }
  if (findings.length === 0) {
    return { code: 'no_patterns_detected', text: 'No draft-rule patterns were detected. This is not a pass: see "Could not check".' };
  }
  return { code: 'findings_for_review', text: `${findings.length} item(s) for human review.` };
}

export function buildReport({ target, pack, packSha256, sourceCommit, findings, elementCount, imports }) {
  const count = (s) => findings.filter((f) => f.status === s).length;
  const byRule = {};
  for (const f of findings) byRule[f.rule_id] = (byRule[f.rule_id] ?? 0) + 1;
  const notReviewed = imports.map((spec) => ({
    title: `Imported module not reviewed: ${spec}`,
    reason: 'Outside the one-file scope of this prototype.',
    sources: null,
  }));
  return {
    report_kind: 'design_review_prototype',
    disclaimer: disclaimer(pack),
    target,
    rules_pack: {
      pack_id: pack.pack_id,
      sha256: packSha256,
      approval: pack.approval,
      supplied_by: pack.supplied_by,
      source_commit: sourceCommit,
      standard: pack.standard,
    },
    outcome: outcome(findings, elementCount),
    summary: {
      pattern_detected: count('pattern_detected'),
      needs_human_review: count('needs_human_review'),
      by_rule: Object.fromEntries(Object.entries(byRule).sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1)))),
      severity: 'not assigned: left for the reviewer',
    },
    findings,
    could_not_check: [
      ...pack.not_checked,
      { title: 'Pages or layouts that render this file', reason: 'Not reviewed. Page-level questions such as the single <h1> depend on them.', sources: null },
      ...notReviewed,
    ],
    known_limits_of_this_prototype: [
      'Tags are read by a small pattern reader, not a full parser. Spread props and runtime-built attributes cannot be resolved.',
      '`//` inside JSX text is treated as a comment, so the rest of that line is not scanned.',
      'An apostrophe in JSX text can hide a tag later on the same line.',
      'Only hex colours inside string literals are checked; rgb(), hsl() and named colours are not.',
    ],
    open_decisions: pack.open_decisions,
  };
}

const cite = (sources) => (sources ?? []).map((s) => `\`${s.path}:${s.line}\``).join(', ');

function findingBlock(f, n) {
  return [
    `### ${n}. ${f.rule_id}: ${f.rule_title} (line ${f.line})`,
    '',
    `- **Status:** ${STATUS_TEXT[f.status]}`,
    `- **Where:** \`${f.file}:${f.line}\``,
    '- **Code:**',
    '',
    '  ```tsx',
    `  ${f.snippet}`,
    '  ```',
    `- **Why it was raised:** ${f.rationale}`,
    `- **Suggested improvement (for human review):** ${f.suggestion}`,
    `- **Draft rule source:** ${cite(f.sources)}${f.cited_wcag ? `. The source cites ${f.cited_wcag}; which WCAG version applies is pending confirmation.` : ''}`,
    ...f.notes.map((x) => `- **Note:** ${x}`),
    '',
  ];
}

export function renderMarkdown(r) {
  const detected = r.findings.filter((f) => f.status === 'pattern_detected');
  const review = r.findings.filter((f) => f.status === 'needs_human_review');
  const a = r.rules_pack.approval;
  return [
    `# Design review prototype: \`${r.target.page}\``,
    '',
    ...r.disclaimer.map((d) => `> ${d}`),
    '',
    '## What was reviewed',
    '',
    `- **Page:** \`${r.target.page}\` (one file only)`,
    `- **Commit:** \`${r.target.commit}\``,
    `- **File blob:** \`${r.target.blob}\``,
    `- **Rules pack:** \`${r.rules_pack.pack_id}\`, sha256 \`${r.rules_pack.sha256.slice(0, 16)}\``,
    `- **Rules pack approval:** ${a.state}${a.approved_by ? ` by ${a.approved_by}` : ' (no approver)'}`,
    `- **Compiled by:** ${r.rules_pack.supplied_by}`,
    `- **Accessibility standard:** ${r.rules_pack.standard.state.replace('_', ' ')} (${r.rules_pack.standard.candidates.join(' or ')})`,
    '',
    '## Summary',
    '',
    `- ${r.outcome.text}`,
    `- Patterns detected by a draft rule: ${r.summary.pattern_detected}`,
    `- Needs human review: ${r.summary.needs_human_review}`,
    `- Severity: ${r.summary.severity}`,
    '',
    '## Patterns detected by a draft rule',
    '',
    ...(detected.length ? detected.flatMap((f, i) => findingBlock(f, i + 1)) : ['None.', '']),
    '## Needs human review',
    '',
    ...(review.length ? review.flatMap((f, i) => findingBlock(f, i + 1)) : ['None.', '']),
    '## Could not check',
    '',
    ...r.could_not_check.map((c) => `- **${c.title}.** ${c.reason}${c.sources ? ` Source: ${cite(c.sources)}.` : ''}`),
    '',
    '## Known limits of this prototype',
    '',
    ...r.known_limits_of_this_prototype.map((x) => `- ${x}`),
    '',
    '## Open decisions for Aleem',
    '',
    ...r.open_decisions.map((d) => `- ${d}`),
    '',
  ].join('\n');
}

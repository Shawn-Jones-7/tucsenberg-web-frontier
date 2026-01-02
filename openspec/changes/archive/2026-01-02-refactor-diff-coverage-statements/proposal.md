# Change: Refactor Diff Coverage to Statement-Based Calculation

## Why

CI run `#20538301905` failed due to incremental coverage gate: `81.25% < 90%`. Root cause analysis revealed two mechanism issues:

1. **Type-only files**: Istanbul/v8 coverage often has empty `statementMap` for pure type files, causing the conservative fallback (`scripts/quality-gate.js:504-506`) to treat type changes as must-cover runtime lines.

2. **Line approximation errors**: `getLineHitsFromIstanbulEntry()` uses `statementMap` startLine only (`scripts/quality-gate.js:368-374`), missing statements where changes fall on non-startLine portions of multi-line statements.

Current workaround (glob exclusion `**/*-types.ts`) is naming-convention dependent and not a robust solution.

## What Changes

- Upgrade diff coverage denominator from "changed lines" to "changed executable statements"
- Auto-skip: type-only files, comments, empty lines, braces (no executable code)
- **BREAKING**: Entry missing strategy changes from silent fallback to explicit fail with guidance
- Output messaging updated to reflect statement-based metrics

## Impact

- Affected specs: `testing`
- Affected code:
  - `scripts/quality-gate.js:346` (`getLineHitsFromIstanbulEntry`)
  - `scripts/quality-gate.js:474` (`calculateDiffCoverage`)
  - `scripts/quality-gate.js:857` (failure messaging)
- New test file: `tests/unit/scripts/quality-gate-diff-coverage.test.ts`

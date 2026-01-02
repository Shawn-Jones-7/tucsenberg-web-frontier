## 0. Prerequisite Validation

- [x] 0.1 Read and understand current logic in `scripts/quality-gate.js`:
  - `getLineHitsFromIstanbulEntry` (line 346)
  - `getChangedLinesByFile` (line 380)
  - `calculateDiffCoverage` (line 474)
  - `checkCoverage` messaging (line 857)
- [x] 0.2 Run `pnpm test:coverage` to generate coverage reports
- [x] 0.3 Verify existence of `reports/coverage/coverage-final.json`

## 1. Implementation

- [x] 1.1 Add new function `getChangedStatementCoverage(entry, changedLines)` returning `{ total, covered, statements[] }`
  - Statement hit rule: any overlap between `[start.line, end.line]` and `changedLines`
  - Coverage: `entry.s[id] > 0`
- [x] 1.2 Modify `calculateDiffCoverage()`:
  - Use statements-based calculation when `statementMap` is available
  - Mark `skippedNonExecutable: true` when `statementMap` is empty
  - Mark `missingCoverageData: true` and fail when entry is missing (Strategy A)
  - **P1 Fix**: Also mark `missingCoverageData: true` when `entry.s` is missing/invalid
- [x] 1.3 Add return fields: `metric: 'statements'`, `unitLabel: '可执行语句'`
- [x] 1.4 Update `checkCoverage()` messaging to use `metric/unitLabel`
- [x] 1.5 Add skip/missing file lists to output for debugging
- [x] 1.6 **P2 Fix**: Handle missing `end.line` as single-line statement (fallback to `start.line`)

## 2. Testing

- [x] 2.1 Create `tests/unit/scripts/quality-gate-diff-coverage.test.ts`
- [x] 2.2 Extract testable function `calculateDiffCoverageWithChangedLines(...)` for injection
- [x] 2.3 Add test cases:
  - Type-only file (`statementMap = {}`) → `skippedNonExecutable`
  - Multi-line statement (range 10-12, changedLines={11}) → statement counted
  - Uncovered statement (`hits=0`) → not added to covered
  - Missing entry → fail with `missingCoverageData: true`
  - **P1**: Entry with `statementMap` but missing `entry.s` → `missingCoverageData`
  - **P2**: Statement with missing `end.line` → treated as single-line

## 3. Verification

- [x] 3.1 Run `pnpm test`
- [x] 3.2 Run `pnpm type-check`
- [x] 3.3 Run `pnpm lint:check`
- [x] 3.4 Verify type-only files no longer cause false failures
- [x] 3.5 Verify missing entry triggers explicit failure with guidance

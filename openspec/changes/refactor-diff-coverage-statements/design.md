## Context

The current diff coverage implementation in `scripts/quality-gate.js` uses line-based approximation, causing false failures when:
- Pure type files (no executable code) are modified
- Multi-line statements are changed on non-start lines

This design documents the algorithm change from line-based to statement-based coverage calculation.

## Goals / Non-Goals

**Goals**:
- Calculate diff coverage using executable statements, not raw lines
- Automatically skip non-executable files without relying on naming conventions
- Provide clear failure messages when new files lack coverage data
- Maintain strict gate for genuinely uncovered executable code

**Non-Goals**:
- Adjust coverage thresholds (remain at 90%)
- Refactor entire quality-gate infrastructure
- Remove existing `*-types.ts` glob exclusions (kept as safety net)

## Decisions

### Statement Intersection Algorithm

**Decision**: A statement is counted in the diff denominator if `[statement.start.line, statement.end.line] ∩ changedLines ≠ ∅`

**Rationale**: Using range intersection (not just startLine) correctly handles:
- Multi-line arrow functions
- Object literals spanning multiple lines
- Template literals

```typescript
// Example: Statement spans lines 10-12, change on line 11
const obj = {     // line 10
  key: value,     // line 11 (changed)
};                // line 12
// Statement MUST be counted in denominator
```

### Missing Entry Strategy

**Decision**: Strategy A (Strict) - When `coverage-final.json` lacks an entry for a changed file:
- Mark `missingCoverageData: true`
- Fail the gate explicitly
- Provide actionable message: "New file not included in coverage. Ensure tests execute and coverage config includes `includeAllSources`."

**Alternatives Considered**:
- B (Conservative): Use `changedLines.size` as denominator, `covered=0` - backward compatible but noisy
- C (Silent skip): Don't count in denominator - risks missing uncovered new files

**Rationale**: In a strict CI environment, missing coverage data usually indicates a configuration issue or untested code. Explicit failure with guidance is more helpful than silent pass or noisy false-positive.

### Metric Alignment

**Decision**: Use `statements` metric consistently:
- Diff coverage: count executable statements
- Drop comparison: compare against `coverageSummary.total.statements.pct`
- Output: "X/Y 个可执行语句覆盖"

**Rationale**: Apples-to-apples comparison. Mixing line-based diff with statement-based overall would create confusion.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Existing glob exclusions become redundant | Keep as safety net; document deprecation path |
| Statement-based metric unfamiliar to team | Clear output messaging; document in PR |
| Edge case: file with only imports/exports | `statementMap` will be empty → `skippedNonExecutable` |

## Migration Plan

1. Implement algorithm change with feature flag (`DIFF_COVERAGE_METRIC=statements`)
2. Test in CI with flag enabled
3. If stable, make `statements` the default
4. Deprecate line-based fallback in future release

**Rollback**: Revert to line-based by setting `DIFF_COVERAGE_METRIC=lines` or reverting the commit.

## Open Questions

- Should branch coverage be added as an optional metric? (Deferred - not in scope)

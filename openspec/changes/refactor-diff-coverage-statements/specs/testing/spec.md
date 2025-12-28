## MODIFIED Requirements

### Requirement: Coverage Regression Prevention

The CI pipeline SHALL prevent coverage regressions by enforcing minimum thresholds on new code using statement-based metrics.

#### Scenario: New code coverage check
- **WHEN** new code is added to a PR
- **THEN** the new code SHALL have ≥90% executable statement coverage
- **AND** global statement coverage SHALL not decrease

#### Scenario: Coverage gate failure
- **WHEN** statement coverage drops below current phase threshold
- **THEN** CI build SHALL fail (if blocking phase)
- **AND** error message SHALL indicate metric as "可执行语句" with count format "X/Y"

#### Scenario: Type-only file skipped
- **WHEN** changed file has empty `statementMap` (pure types, interfaces, imports)
- **THEN** file SHALL be marked `skippedNonExecutable`
- **AND** file SHALL NOT count toward diff coverage denominator
- **AND** output SHALL list skipped files for transparency

#### Scenario: Multi-line statement coverage
- **WHEN** a statement spans lines 10-12 and change is on line 11
- **THEN** the entire statement SHALL be counted in denominator
- **AND** statement coverage status determined by `entry.s[id] > 0`

#### Scenario: Missing coverage entry
- **WHEN** changed file has no entry in `coverage-final.json`
- **THEN** gate SHALL fail with `missingCoverageData: true`
- **AND** error message SHALL guide: "New file not included in coverage. Ensure tests execute and coverage config includes source."

#### Scenario: Consistent metric comparison
- **WHEN** calculating coverage drop
- **THEN** diff coverage SHALL use statement metric
- **AND** comparison baseline SHALL use `coverageSummary.total.statements.pct`

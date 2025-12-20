# Issue: Restore Reliable Vitest Coverage Reporting

## Summary
Full `pnpm test` and `pnpm test -- --coverage` runs currently exceed the practical timeout window (445 files, >2k cases) and were manually terminated before coverage output could be produced. Without a stable coverage pipeline, we cannot verify Security/API/Component coverage targets.

## Proposed Steps
- Profile the slowest suites (e.g., `mobile-navigation`, `navigation-menu`, locale detection) and split them into lighter units or mark purely integration-heavy paths to run in a nightly job.
- Enable Vitest sharding/worker limits and cache Vite build artifacts in CI to reduce startup costs.
- Add a dedicated coverage script that runs in CI with an extended timeout and publishes LCOV/summary artifacts.

## Acceptance Criteria
- A CI job generates coverage artifacts without manual intervention and completes within the configured timeout.
- Coverage summaries are available for Security modules, API routes, and Components so they can be compared against the 90/70% targets.
- No manual cancellation is required to keep the pipeline green.

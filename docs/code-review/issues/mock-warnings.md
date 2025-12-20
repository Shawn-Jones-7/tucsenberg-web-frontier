# Issue: Clean Up Vitest Mock/Spy Warnings

## Summary
Multiple suites (e.g., `src/lib/__tests__/web-vitals-collector.test.ts`, `src/hooks/__tests__/use-enhanced-translations.test.ts`) emit Vitest warnings such as `The vi.fn() mock did not use 'function' or 'class' in its implementation`. These pollute logs and can hide real regressions.

## Proposed Steps
- Replace `vi.fn()` usage on non-function targets with proper `vi.spyOn` or explicit stub functions.
- Centralize shared mock data in `src/test/constants/mock-messages.ts` to avoid ad-hoc inline objects.
- Add an assertion in the Vitest config to fail on console warnings in these suites to keep the log clean.

## Acceptance Criteria
- Running the affected suites no longer prints Vitest mock/spy warnings.
- Mock data used across tests is imported from the shared constants module.
- CI logs for the test job remain free of new warning noise.

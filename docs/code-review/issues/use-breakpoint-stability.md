# Issue: Stabilize `useBreakpoint` return values

**Type:** Refactor
**Severity:** P2 (render churn risk)

## Summary
`useBreakpoint` recreates helper functions (`isAbove`, `isBelow`, `isExactly`) on every render because the return object is not memoized. Consumers that rely on referential equality (e.g., dependency arrays, memoized props) may re-render unnecessarily when width does not change.

## Evidence
- `useBreakpoint` rebuilds the return object and helper closures per render without `useMemo`/`useCallback`, so identities change even when `width` is stable.

## Proposal
- Wrap helper callbacks in `useCallback` and the return object in `useMemo` keyed by `width` and breakpoint config.
- Consider memoizing `createBreakpointConfig` or accepting a stable config prop to avoid downstream recalculation when passed inline.

## Acceptance Criteria
- Helper functions remain referentially stable across renders when inputs are unchanged.
- Existing tests (`src/hooks/__tests__/use-breakpoint.test.ts`) continue to pass.

# Partial Prerendering Trial – UI Showcase Route

## Summary
- Attempted to enable Next.js Partial Prerendering (PPR) for the `/[locale]/ui-showcase` route.
- The build failed with `experimental.ppr` requiring the latest canary release of Next.js, which the project is not currently using.
- PPR remains disabled; no runtime changes were retained in application code.

## Findings
- Our current Next.js version (15.5.x stable) does not support the `experimental.ppr` flag.
- Upgrading to the latest canary would be required before evaluating PPR in this codebase.

## Impact
- No code changes from the experiment are active; the route continues to revalidate every 86400 seconds as before.
- Build and test pipelines remain unchanged after reverting the experiment.

## Recommended Next Steps
1. Coordinate with the platform team on whether a canary upgrade is acceptable for future experiments.
2. If upgrading, re-run the trial using `experimental.ppr = 'incremental'` and capture Lighthouse/Web Vitals metrics for `/en/ui-showcase`.
3. Maintain this evidence log to track the status of PPR adoption efforts.

## Verification
- `pnpm build:check` (after reverting) ✅

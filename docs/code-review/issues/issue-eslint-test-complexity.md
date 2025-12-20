# Enforce complexity limits for tests and config files

## Summary
Current ESLint settings apply a global `complexity` limit of 15/`max-lines-per-function` 120, but the test override disables complexity entirely and does not set the relaxed 700-line ceiling expected for tests. Config files also inherit production limits instead of the intended 18 complexity / 250 lines, so the required per-scope standards are not enforced.

## Affected Files
- `eslint.config.mjs`

## Impact
- Tests and configuration files can grow without the guardrails defined in project standards, increasing risk of brittle or unmaintainable helpers.

## Recommendation
- Add explicit overrides: tests (`complexity`: 20, `max-lines-per-function`: 700) and config files (`complexity`: 18, `max-lines-per-function`: 250). Keep stricter production defaults unchanged.

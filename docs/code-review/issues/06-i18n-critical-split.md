# i18n: Trim `critical.json` to first-paint essentials

## Summary
`messages/*/critical.json` currently contains 652 lines and 16 namespaces (e.g., `home`, `footer`, `underConstruction`, `structured-data`), exceeding first-paint needs and diluting the critical/deferred split.

## Evidence
- `messages/en/critical.json` line count: 652; top-level namespaces include marketing sections and structured data.
- `messages/en/deferred.json` still contains 515 lines, indicating limited offloading of non-critical text.

## Impact
- Larger initial payload for the root `NextIntlClientProvider`, increasing render-time JSON size and bandwidth for every locale-prefixed page.
- Reduced effectiveness of deferred loading strategy; first render carries content that could be lazy-loaded.

## Suggested Fix
- Keep `critical.json` limited to navigation, hero headline/subtitle, theme toggle, basic accessibility labels, and cookie/banner copy.
- Move marketing copy, FAQ/privacy/terms sections, structured-data strings, and non-shell messages into `deferred.json` (or page-level namespaces fetched on demand).
- Update tests/mocks to reflect the new split.

## Acceptance Criteria
- `critical.json` shrinks to first-paint scope (ideally navigation + shell copy only), with complementary entries in `deferred.json`.
- CI check or script verifies namespace placement to prevent regressions.

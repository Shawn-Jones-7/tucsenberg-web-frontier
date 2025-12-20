# i18n: Hardcoded locale detection demo and layout strings

## Summary
Client-side i18n surfaces render untranslated text because UI strings are hardcoded instead of using `next-intl` translations.

## Evidence
- `src/components/i18n/locale-detection-demo.tsx`: headings, labels, and buttons are Chinese literals (lines 59-183, 232-246).
- `src/app/[locale]/layout.tsx`: footer status text is hardcoded English (`All systems normal.` line 141), and the dev-only error fallback renders Chinese (`监控组件加载失败` line 118).

## Impact
- Locale switch does not affect these components, producing mixed-language UI and failing accessibility/SEO requirements.
- Hardcoded strings bypass translation review and cannot be localized or updated centrally.

## Suggested Fix
- Introduce `useTranslations` in the affected components and move strings into the appropriate namespace (`critical` for layout chrome, `deferred` or feature-specific namespace for the demo).
- Ensure `critical.json` vs `deferred.json` placement reflects first-paint needs (layout strings in `critical`; demo strings likely `deferred`).

## Acceptance Criteria
- All strings in the referenced files resolve through `next-intl` keys with both `en` and `zh` entries.
- Snapshot or unit coverage to prevent reintroducing hardcoded text.

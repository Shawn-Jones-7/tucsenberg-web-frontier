# Phase 06: i18n System Review

## Summary
- Translation key structures match between `en` and `zh` for both `critical.json` and `deferred.json`; no missing keys detected by recursive diff.
- Critical bundle is large (652 lines, 16 namespaces) and includes non-first-paint content such as `home`, `footer`, and `underConstruction`, indicating it is not trimmed for first paint.
- Several client components render hardcoded UI strings (mostly Chinese) and bypass `next-intl`, leading to untranslated UI in other locales.
- Locale routing and middleware follow `next-intl` best practices (locale prefix `always`, cookie persistence, invalid prefix guard), and `<html lang>` is corrected via `LangUpdater` after hydration.
- ICU usage, pluralization, and locale-aware formats appear correct; date/number formats are set per locale (`CNY` vs `USD`, percent fraction digits) in `getRequestConfig`.

## Translation Completeness
- `messages/en/critical.json` vs `messages/zh/critical.json`: keys match (automated check).
- `messages/en/deferred.json` vs `messages/zh/deferred.json`: keys match (automated check).
- Missing/mismatched keys: **None found**.

## Hardcoded or Untranslated UI Strings
- `src/components/i18n/locale-detection-demo.tsx`: component renders headings, labels, and button text in Chinese without `useTranslations` (e.g., lines 59-183, 232-246), so the demo is untranslated in English.
- `src/app/[locale]/layout.tsx`: footer status text uses a hardcoded English string (`All systems normal.` at line 141), and the dev-only error fallback renders Chinese text (`监控组件加载失败` at line 118) without translation.

## Critical vs Deferred Loading
- `messages/en/critical.json` contains 652 lines across multiple namespaces (`home`, `footer`, `underConstruction`, `structured-data`, etc.), suggesting it includes secondary content rather than only first-paint strings. `deferred.json` still holds 515 lines, indicating the split is not aggressively optimized.
- Consider moving non-shell namespaces (e.g., marketing sections, structured data, API errors) to `deferred.json` and keeping `critical.json` limited to navigation, theme toggle, minimal hero copy, and accessibility labels.

## Code Patterns
- Server components (e.g., `Header`, pages) call `getTranslations`/`getTranslationsCached`; client locale switcher uses `useTranslations` with `NextIntlClientProvider` set in `[locale]/layout.tsx`.
- Routing exports (`Link`, `redirect`, `usePathname`, `useRouter`) are centralized in `src/i18n/routing.ts`, and middleware imports the edge-safe `routing-config` variant.

## Locale Detection
- Middleware validates locale prefixes, sets `NEXT_LOCALE` cookie for first-time localized paths, and rewrites invalid prefixes to the default locale when the remainder matches a known pathname.
- `LangUpdater` adjusts `<html lang>` after hydration to cover PPR scenarios, keeping SEO-friendly language tags.

## SEO
- `<html lang>` defaults to `en` in `src/app/layout.tsx` and is corrected per locale via `LangUpdater`; routing enables `alternateLinks` for hreflang generation and uses locale-prefixed URLs.

## Action Items
- Add translations for the hardcoded strings listed above and route them through `next-intl` (`critical` vs `deferred` as appropriate).
- Re-audit `critical.json` to ensure it only contains first-paint essentials; move remaining content to `deferred.json` to reduce initial payload.

# P0: Product locale path traversal in content loader

**Severity:** P0 (Critical security)

## Summary
`getProductFilesInLocale` constructs paths from unvalidated `locale` input and reads directories without a `validateFilePath` check. A crafted locale (e.g., `../../`) can traverse outside `content/products/` before any validation runs, because the only locale whitelist is applied later in `getProductDetail` and is bypassed when callers cast strings to `Locale`.

## Evidence
- Locale is concatenated into a path and read with `fs.existsSync`/`fs.readdirSync` without prefix validation.【F:src/lib/content/products-source.ts†L18-L139】
- Route handlers cast `params.locale` to `Locale` before passing into the cached product loader, so runtime inputs are not validated prior to hitting the file-system helper.【F:src/app/[locale]/products/[slug]/page.tsx†L65-L103】

## Impact
Directory traversal can expose arbitrary files under the project root to any API surface that accepts a locale string (including SSR routes). It undermines the expected isolation of `content/` and could leak secrets or source files.

## Recommendation
Validate `locale` against `routing.locales` (or a static whitelist) before joining paths, and wrap the constructed paths with `validateFilePath(PRODUCTS_DIR)` prior to any `fs` calls. Consider reusing the `getContentFiles` helper for products to keep consistent defenses.

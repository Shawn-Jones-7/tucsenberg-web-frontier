# TS2300 Fix Log

## Initial Error
- `pnpm run type-check`
- `src/lib/i18n-preloader.ts(11,127): error TS2300: Duplicate identifier 'PreloaderFactory'.`

## Plan
Duplicate exports of `PreloaderFactory` and `TranslationPreloader` in `i18n-preloader.ts` caused identifier conflicts. Remove the redundant type re-export and early value export to keep a single export for each.

## Verification
- Re-ran `pnpm run type-check`
- `PreloaderFactory` duplicate resolved.
- First remaining TS2300: `src/lib/locale-detection.ts(4,384): error TS2300: Duplicate identifier 'SmartLocaleDetector'.`

## Second Error
- `pnpm run type-check`
- `src/lib/locale-detection.ts(4,384): error TS2300: Duplicate identifier 'SmartLocaleDetector'.`

## Second Plan
`SmartLocaleDetector` was exported twice from `locale-detection.ts`. Remove the duplicate re-export so the identifier is exported only once.

## Second Verification
- Re-ran `pnpm run type-check`
- `SmartLocaleDetector` duplicate resolved.
- First remaining TS2300: `src/lib/locale-storage-manager.ts(16,628): error TS2300: Duplicate identifier 'PerformanceMetrics'.`

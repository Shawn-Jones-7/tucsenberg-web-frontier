# Implementation Tasks

## 1. Remove API Endpoints

- [ ] 1.1 Delete `src/app/api/monitoring/dashboard/` directory
- [ ] 1.2 Delete `src/app/api/analytics/web-vitals/route.ts`
- [ ] 1.3 Delete `src/app/api/analytics/i18n/` directory
- [ ] 1.4 Delete related integration tests:
  - `tests/integration/api/web-vitals.test.ts`
  - `tests/integration/api/analytics-i18n.test.ts`

## 2. Remove Library Files (Orphan/Dead Code)

- [ ] 2.1 Delete `src/lib/i18n-analytics.ts`
- [ ] 2.2 Delete `src/lib/web-vitals/` directory (19 files)
- [ ] 2.3 Delete `src/lib/web-vitals-monitor.ts`
- [ ] 2.4 Delete `src/lib/enhanced-web-vitals.ts`
- [ ] 2.5 Delete `src/lib/performance-monitoring-*.ts` (16 files)
- [ ] 2.6 Delete `src/lib/performance-report-analysis.ts`
- [ ] 2.7 Delete `src/lib/theme-analytics*.ts` (4 files)
- [ ] 2.8 Delete related test files in `src/lib/__tests__/`

## 3. Remove Hooks (Orphan Code)

- [ ] 3.1 Delete `src/hooks/web-vitals-diagnostics-*.ts` (7 files)
- [ ] 3.2 Delete `src/hooks/use-web-vitals-diagnostics.ts`
- [ ] 3.3 Delete `src/hooks/theme-transition-*.ts` (3 files)
- [ ] 3.4 Delete `src/hooks/use-enhanced-theme.ts`
- [ ] 3.5 Delete `src/hooks/use-theme-toggle.ts`
- [ ] 3.6 Delete related test files in `src/hooks/__tests__/`

## 4. Remove Components (Dev-only/Unused)

- [ ] 4.1 Delete `src/components/performance/` directory (6 files)
- [ ] 4.2 Delete `src/components/lazy/lazy-web-vitals-reporter.tsx`
- [ ] 4.3 Delete `src/components/theme/theme-performance-monitor.tsx`
- [ ] 4.4 Delete related test files

## 5. Modify Existing Files

- [ ] 5.1 Update `src/app/[locale]/layout.tsx` — Remove dev-only component imports/renders
- [ ] 5.2 Update `src/components/monitoring/enterprise-analytics-island.tsx` — Remove `useWebVitalsTracking`
- [ ] 5.3 Update `src/types/index.ts` — Remove `@/lib/web-vitals/types` exports
- [ ] 5.4 Update `openspec/specs/security/spec.md` — Remove `/api/analytics/*` rate limit requirements
- [ ] 5.5 Update `docs/api/README.md` — Remove endpoint documentation
- [ ] 5.6 Update `.vscode/settings.json` — Remove related path configurations
- [ ] 5.7 (If needed) Update `src/constants/test-constants.ts` and/or delete `src/constants/test-web-vitals-constants.ts` to avoid broken imports after removing Web Vitals tests
- [ ] 5.8 (Optional) Remove unused deps from `package.json` if orphaned (`web-vitals`, `react-scan`)
- [ ] 5.9 (Optional) Remove unused `analytics` rate limit preset if no remaining endpoints use it (`src/lib/security/distributed-rate-limit.ts`)

## 6. Cleanup References

- [ ] 6.1 Search and remove any remaining imports of deleted modules
- [ ] 6.2 Regenerate `semgrep-report.json` via the normal security scan (avoid manual edits)

## 7. Validation

- [ ] 7.1 Run `pnpm type-check`
- [ ] 7.2 Run `pnpm lint:check`
- [ ] 7.3 Run `pnpm test`
- [ ] 7.4 Run `pnpm build`
- [ ] 7.5 Verify no remaining references: `rg -n "web-vitals|performance-monitoring|i18n-analytics|theme-analytics" src/`
- [ ] 7.6 Run `openspec validate remove-monitoring-dashboard-api --strict`

# Change: Remove Self-Built Monitoring System (Tech Debt Payoff)

## Why

The template already relies on **Vercel Analytics / Speed Insights / GA4** for traffic and performance visibility. However, the codebase contains extensive self-built monitoring infrastructure that:

1. **Returns mock data** — No real storage, aggregation, or canonical metrics definition
2. **Creates 口径分裂** — Multiple overlapping data sources cause confusion
3. **Increases attack surface** — Unused API endpoints add security maintenance burden
4. **Contains dead code** — Calls to non-existent endpoints (`/api/errors/i18n`, `/api/alerts/performance`, `/api/analytics/i18n/batch`)
5. **Includes ghost features** — Developed but never integrated into production (theme-analytics, enhanced-theme hooks)

## What Changes

### API Endpoints (REMOVE)

- **BREAKING** `/api/monitoring/dashboard` — Mock dashboard API (all methods)
- **BREAKING** `/api/analytics/web-vitals` — Mock Web Vitals collection (all methods)
- **BREAKING** `/api/analytics/i18n` — Mock i18n analytics (all methods)

### Libraries (REMOVE - Orphan/Dead Code)

- `src/lib/i18n-analytics.ts` — Dead code calling non-existent endpoints
- `src/lib/web-vitals/**` — Unused monitoring framework (19 files)
- `src/lib/web-vitals-monitor.ts` — Unused
- `src/lib/enhanced-web-vitals.ts` — Unused
- `src/lib/performance-monitoring-*.ts` — Unused framework (16 files)
- `src/lib/performance-report-analysis.ts` — Unused
- `src/lib/theme-analytics*.ts` — Ghost feature (4 files)

### Hooks (REMOVE - Orphan Code)

- `src/hooks/web-vitals-diagnostics-*.ts` — Unused (7 files)
- `src/hooks/use-web-vitals-diagnostics.ts` — Unused
- `src/hooks/theme-transition-*.ts` — Ghost feature (3 files)
- `src/hooks/use-enhanced-theme.ts` — Ghost feature
- `src/hooks/use-theme-toggle.ts` — Ghost feature

### Components (REMOVE - Dev-only/Unused)

- `src/components/performance/**` — Dev-only components (6 files)
- `src/components/lazy/lazy-web-vitals-reporter.tsx` — Dev-only
- `src/components/theme/theme-performance-monitor.tsx` — Dev-only

### Files to Modify

- `src/app/[locale]/layout.tsx` — Remove dev-only component imports/renders
- `src/components/monitoring/enterprise-analytics-island.tsx` — Remove `useWebVitalsTracking` (keep Speed Insights + Analytics)
- `src/types/index.ts` — Remove `@/lib/web-vitals/types` exports
- `openspec/specs/security/spec.md` — Remove `/api/analytics/*` rate limit requirements
- `docs/api/README.md` — Remove endpoint documentation
- `.vscode/settings.json` — Remove i18n-ally paths for deleted endpoints

### Additional Cleanup (RECOMMENDED)

- `src/constants/test-web-vitals-constants.ts` — Remove if no longer referenced after deleting Web Vitals tests
- `src/lib/security/distributed-rate-limit.ts` — Consider removing `analytics` preset (no endpoints use it after deletion)
- `package.json` — Remove orphaned deps if applicable (`web-vitals`, `react-scan`)
- Docs references that may become stale:
  - `docs/references/architecture-review-2025.md`
  - `docs/references/tech-stack.md`
  - `src/testing/mock-config-standard.md`

## Impact

- **Affected specs**: `security`
- **Files deleted**: ~80+
- **Lines removed**: ~6000+
- **API endpoints removed**: 3

## Success Criteria

- Requests to removed endpoints return HTTP 404
- `pnpm test`, `pnpm type-check`, `pnpm lint:check`, `pnpm build` pass
- No remaining references to removed modules in production code
- Speed Insights and Vercel Analytics continue to function

## Non-Goals

- Building replacement self-hosted monitoring
- Removing Vercel Analytics / Speed Insights / GA4
- Changing CSP report handling (`/api/csp-report`)

## Migration Notes

- Production monitoring: Use Vercel Speed Insights dashboard
- Traffic analytics: Use Vercel Analytics + GA4
- If any dashboards rely on the custom Vercel Analytics event `web-vital`, migrate/remove those queries (this change removes the event emission)
- No downstream integration action required (removed monitoring was mock/dev-only)

## Dependencies

- None

## Rollback Strategy

- Git revert to restore all removed files
- No data migration required (all removed code used mock data)

## Risks / Concerns

- **Loss of custom dimensions**: Removing `track('web-vital', ...)` drops locale/navType segmentation that Speed Insights may not replicate
- **Stale docs/config**: Multiple internal docs and `.vscode` settings reference the removed monitoring system; leaving them creates confusion for future maintainers

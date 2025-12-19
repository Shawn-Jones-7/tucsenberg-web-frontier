# Quality Gates & CI/CD

## Complexity Limits

All limits are **function-level** (cyclomatic complexity measured per function).

| File Type | max-lines | max-lines-per-function | complexity | max-depth | max-params |
|-----------|-----------|------------------------|------------|-----------|------------|
| **Production** | 500 | 120 | 15 | 3 | 3 |
| **Config** | 800 | 250 | 18 | - | - |
| **Test** | 800 | 700 | 20 | - | 8 |

### Additional Limits

| Rule | Production | Test |
|------|------------|------|
| `max-nested-callbacks` | 2 | 6 |
| `max-statements` | 20 | 50 |

### Exemptions
- Config files: `*.config.{js,ts,mjs}`
- Dev tools: `src/components/dev-tools/**`, `src/app/**/dev-tools/**`

## Magic Numbers

No bare numbers allowed. Use constants from `src/constants/`.

**ESLint allowlist**: `0, 1, -1, 100, 200, 201, 400, 401, 403, 404, 500, 502, 503, 24, 60, 1000`

Constants organization:
- `src/constants/performance.ts` — Performance thresholds
- `src/constants/time.ts` — Time values

## Performance Monitoring (Lighthouse CI)

Next.js 16 removed build-time size metrics in favor of runtime performance measurement via Lighthouse.

**Configuration**: `lighthouserc.js`

| Metric | Current Target | Final Goal |
|--------|----------------|------------|
| Performance Score | ≥ 0.85 | ≥ 0.90 |
| total-byte-weight | ≤ 490KB | ≤ 450KB |
| bootup-time | ≤ 4000ms | ≤ 3000ms |
| unused-javascript | ≤ 150KB | ≤ 100KB |

```bash
pnpm perf:lighthouse  # Run Lighthouse CI locally
```

## CI/CD Pipeline

```bash
pnpm ci:local  # One-command local CI
```

Flow: type-check → lint → format → test → security → build → lighthouse

## Dependency Upgrade Gate（核心依赖升级必跑）

当升级 `next` / `react` / `typescript` 或引入有安全告警的依赖更新时，至少跑一轮升级验证流程：
- 规则：`/.claude/rules/dependency-upgrade.md`
- 最小验证：`pnpm ci:local:quick` + `pnpm build`

## Zero Tolerance

- TypeScript: Zero errors
- ESLint: Zero warnings
- Build: No errors
- Lighthouse: Meet all thresholds

## Test Coverage

**Progressive Roadmap** (aligned with `.augment/rules`):

| Phase | Target | Timeline |
|-------|--------|----------|
| Phase 1 (Current) | ≥65% | Baseline |
| Phase 2 | ≥75% | +3 months |
| Phase 3 | ≥80% | +6 months |

**Current Status**: ~72% (exceeds Phase 1 target)

| Module Type | Target | Enforcement |
|-------------|--------|-------------|
| Global | ≥65% | Blocking |
| Core Business | 90-92% | Blocking |
| Security | 90-92% | Blocking |
| Utils | 92-95% | Blocking |
| Performance/i18n | 85-88% | Blocking |
| UI Components | ≥70% | Blocking |

**Incremental Coverage**: New/changed code must achieve ≥90% coverage.

## Performance Budget (Core Web Vitals)

Lighthouse CI enforces progressive thresholds:

| Metric | Current CI Threshold | Good Target |
|--------|---------------------|-------------|
| LCP | ≤ 4500ms | < 2500ms |
| TBT (替代 FID) | ≤ 250ms | < 100ms |
| CLS | ≤ 0.15 | < 0.1 |
| FCP | ≤ 2000ms | < 1800ms |

**Note**: CI thresholds are relaxed for cold-start variance. Production targets align with Google's "Good" CWV standards.

## Responsive Breakpoint Changes

When modifying Tailwind CSS responsive breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`), E2E tests with specific viewport sizes may fail silently in CI.

**Pre-commit checklist for breakpoint changes**:

1. Identify affected viewport ranges (e.g., `md` → `lg` affects 768px–1023px)
2. Search for E2E tests using those viewport dimensions:
   ```bash
   grep -rn "setViewportSize.*768\|width: 768\|tablet" tests/e2e/
   grep -rn "setViewportSize.*1024\|width: 1024" tests/e2e/
   ```
3. Update test assertions to match new responsive behavior
4. Run E2E tests locally before push: `pnpm test:e2e`

**Common breakpoint values**:
| Breakpoint | Width | Use Case |
|------------|-------|----------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

## Failure Policy

- Any gate failure stops pipeline immediately
- No bypasses allowed
- Must fix before proceeding

## ESLint Disable Usage

When using `eslint-disable`:
1. Must include specific rule name
2. Must include justification comment
3. Prefer line-level over block-level disables

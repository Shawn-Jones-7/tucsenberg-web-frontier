# Infrastructure Configuration Review (Phase 04)

## Scope
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts` (not present in repo)
- `eslint.config.mjs`
- `vitest.config.mts`
- `package.json`

## Summary
- ✅ TypeScript strictness and path aliases align with project standards.
- ⚠️ ESLint test/config complexity ceilings are not enforced as required (tests currently disable complexity entirely).
- ⚠️ Production browser source maps are enabled, increasing risk of source disclosure.
- ⚠️ Tailwind config file is missing, so content/dark-mode coverage cannot be validated.
- ⚠️ Coverage thresholds are not enforced in Vitest (delegated to an external script).
- ⚠️ `pnpm audit`/`pnpm outdated` could not run due to registry 403 responses in this environment.

## Findings

### Next.js Config
- `cacheComponents: true` is enabled as required.【F:next.config.ts†L25-L31】
- `productionBrowserSourceMaps: true` exposes source maps in production; recommend disabling to avoid leaking source and environment details.【F:next.config.ts†L37-L40】
- No `output: 'standalone'`/`'export'` is set, so deployment bundling relies on defaults; validate against hosting requirements.
- Experimental `optimizePackageImports` is enabled; monitor for stability regressions on Next.js 16.【F:next.config.ts†L53-L66】

### TypeScript Config
- `strict`, `noImplicitAny`, and `exactOptionalPropertyTypes` are all enabled.【F:tsconfig.json†L4-L24】
- Path aliases for `@`, `@messages`, and `@content` are defined and align with Vitest aliases.【F:tsconfig.json†L33-L40】【F:vitest.config.mts†L138-L149】

### ESLint Config
- Security plugins `eslint-plugin-security` and `eslint-plugin-security-node` are active with recommended/expanded rules.【F:eslint.config.mjs†L11-L90】【F:eslint.config.mjs†L151-L201】
- Global complexity/length limits are set to 15/120 for all files, but the test override disables complexity entirely and does not relax max-lines-per-function to the expected 700, so the required test/config ceilings are not accurately enforced.【F:eslint.config.mjs†L210-L233】【F:eslint.config.mjs†L302-L323】

### Dependencies
- React 19.1.1 and Next.js 16.0.10 versions match the requested stack.【F:package.json†L70-L97】
- Dev dependencies are separated from runtime packages in `package.json`.
- `pnpm audit` and `pnpm outdated` failed with registry 403 responses; vulnerability/deprecation status could not be retrieved (see Command Results).【1d263b†L1-L3】【a6ed26†L1-L6】

### Tailwind Config
- No `tailwind.config.*` file exists, so content scanning paths, theme customizations, and dark-mode strategy cannot be verified. If Tailwind v4 default config is intended, document this; otherwise add an explicit config.

### Test Config (Vitest)
- `environment: 'jsdom'` is set with browser-like options suitable for UI tests.【F:vitest.config.mts†L80-L101】
- Coverage uses V8 and excludes configs, but no threshold is enforced within Vitest; coverage gates rely on external tooling, increasing risk of drift.【F:vitest.config.mts†L115-L179】
- Path aliases mirror `tsconfig` entries, and CSS/MDX stubs are configured for test isolation.【F:vitest.config.mts†L138-L165】

## Command Results
- `pnpm type-check` → Passed.【5550c2†L1-L4】
- `pnpm lint:check` → Hung; manually interrupted after >2 minutes (needs performance investigation).【ce6e3f†L1-L4】【54e10b†L1-L2】
- `pnpm audit` → Failed with registry 403 (environmental).【1d263b†L1-L3】
- `pnpm outdated` → Failed with registry 403 (environmental).【a6ed26†L1-L6】

## Recommended Actions
1. Disable `productionBrowserSourceMaps` for production builds.
2. Add tailored ESLint overrides: config files (complexity ≤18, max-lines-per-function ≤250) and tests (complexity ≤20, max-lines-per-function ≤700).
3. Clarify Tailwind setup (add `tailwind.config.ts` if not relying on v4 defaults) including content paths and dark mode strategy.
4. Enforce coverage thresholds either in Vitest or ensure `scripts/quality-gate.js` is run in CI.
5. Re-run `pnpm audit`/`pnpm outdated` with registry access to surface vulnerabilities and deprecations.

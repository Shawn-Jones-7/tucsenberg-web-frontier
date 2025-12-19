# Phase 09: Utilities (P2) Review

## Summary
- Reviewed utility functions and supporting types in `src/lib` (excluding security/content), `src/constants`, and `src/types` for type safety, magic numbers, and correctness.
- Identified hard-coded operational values that should be centralized in `src/constants` and an idempotency option that is currently ignored.
- Noted remaining `any` usage isolated to test helpers/mocks that would benefit from stronger typing.

## Type Safety
- **Ignored option:** `withIdempotency` exposes an optional `ttl` value but never applies it, so callers cannot rely on the typed contract. Recommend honoring the value when setting cache entries or removing the option from the signature. 【F:src/lib/idempotency.ts†L200-L229】
- **`any` usage (tests/helpers):**
  - `AccessibilityManager` unit tests rely on `any` mocks for DOM elements/window; could be replaced with minimal interfaces. 【F:src/lib/__tests__/accessibility-manager-core.test.ts†L42-L55】
  - `MockFunction` and `ExtendedMockFunction` in `test-types.ts` use `any` in variadic signatures; consider swapping to `unknown[]` plus generics to preserve inference while avoiding `any`. 【F:src/types/test-types.ts†L273-L288】【F:src/types/test-types.ts†L508-L516】

### GitHub Issues to Create (Type Safety)
- Implement or remove the unused `ttl` option in `withIdempotency` so the exposed type reflects runtime behavior. 【F:src/lib/idempotency.ts†L200-L229】
- Replace remaining `any` in test mocks/helpers with typed alternatives (`unknown` + helper interfaces) to keep the test surface strictly typed. 【F:src/lib/__tests__/accessibility-manager-core.test.ts†L42-L55】【F:src/types/test-types.ts†L273-L288】【F:src/types/test-types.ts†L508-L516】

## Magic Numbers to Extract
- Idempotency cache uses inline durations (24h TTL and 1h cleanup interval) instead of shared constants. Recommend moving to `src/constants` to keep behavior configurable. 【F:src/lib/idempotency.ts†L38-L59】
- Analytics event logger caps history at `500` entries via a private static number; align with a named constant in `src/constants` and document rationale. 【F:src/lib/locale-storage-analytics-events.ts†L340-L372】
- Performance monitoring defaults contain inline values (bundle analyzer port `8888`, network response threshold `1000ms`); should reference domain constants to avoid drift with other performance settings. 【F:src/lib/performance-monitoring-types.ts†L376-L435】

## Pure Functions & Side Effects
- `idempotency.ts` starts a module-level `setInterval` that runs indefinitely. Consider scoping cleanup to the Next.js runtime lifecycle or making interval injection optional to avoid background timers in serverless environments. 【F:src/lib/idempotency.ts†L38-L59】

## Error Handling & Observability
- Idempotency helper logs and rethrows errors but does not annotate cached responses with TTL metadata, limiting debuggability when entries expire unexpectedly; adding structured fields (e.g., `expiresAt`) would aid tracing. 【F:src/lib/idempotency.ts†L38-L95】

## Documentation & Testing Notes
- No documentation gaps detected for the reviewed modules, but the new constants should be documented when extracted.
- Testing commands: `pnpm type-check` (pass); `npx ts-unused-exports …` failed due to registry access restrictions—rerun when registry is available. See verification logs.

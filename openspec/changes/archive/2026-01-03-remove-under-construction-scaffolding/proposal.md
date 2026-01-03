# Change: Remove Under-Construction Scaffolding Components

## Why

The under-construction components (v2 and v3) are scaffolding residue that:

1. **Call API without required security token** — Both `under-construction-v3.tsx:32` and `under-construction-v2-components.tsx:50` call `/api/subscribe` without `turnstileToken`, but the API enforces token validation (`subscribe/route.ts:125`), causing guaranteed 400 errors
2. **Have no production references** — `rg "UnderConstructionV2|UnderConstructionV3" src/app/` returns zero matches
3. **Create maintenance burden** — 11 files with tests for non-functional code
4. **Violate security requirements** — Missing Turnstile integration contradicts the project's bot protection standards

## What Changes

### Files to Remove (11 total)

**v2 series (4 files)**:
- `src/components/shared/under-construction-v2.tsx`
- `src/components/shared/under-construction-v2-components.tsx`
- `src/components/shared/__tests__/under-construction-v2.test.tsx`
- `src/components/shared/__tests__/under-construction-v2-components.test.tsx`

**v3 series (7 files)**:
- `src/components/shared/under-construction-v3.tsx`
- `src/components/shared/under-construction-v3/page-header.tsx`
- `src/components/shared/under-construction-v3/social-links.tsx`
- `src/components/shared/under-construction-v3/subscription-form.tsx`
- `src/components/shared/under-construction-v3/__tests__/page-header.test.tsx`
- `src/components/shared/under-construction-v3/__tests__/social-links.test.tsx`
- `src/components/shared/under-construction-v3/__tests__/subscription-form.test.tsx`

### Files to Keep

- `src/components/shared/under-construction.tsx` — Original version (requires separate audit)

## Impact

- **Affected specs**: None (no spec references these components)
- **Files deleted**: 11
- **Lines removed**: ~600
- **Breaking changes**: None (components have no production consumers)

## Success Criteria

- All 11 files deleted
- `pnpm type-check`, `pnpm lint:check`, `pnpm test`, `pnpm build` pass
- No remaining imports of deleted modules

## Non-Goals

- Fixing the original `under-construction.tsx` (separate scope)
- Adding Turnstile to these components (not worth the effort for unused code)

## Risks / Concerns

- **Low risk**: No production references found
- If any hidden route uses these components, it will fail at build time (caught by CI)

# Implementation Tasks

## 1. Remove v2 Components

- [ ] 1.1 Delete `src/components/shared/under-construction-v2.tsx`
- [ ] 1.2 Delete `src/components/shared/under-construction-v2-components.tsx`
- [ ] 1.3 Delete `src/components/shared/__tests__/under-construction-v2.test.tsx`
- [ ] 1.4 Delete `src/components/shared/__tests__/under-construction-v2-components.test.tsx`

## 2. Remove v3 Components

- [ ] 2.1 Delete `src/components/shared/under-construction-v3.tsx`
- [ ] 2.2 Delete `src/components/shared/under-construction-v3/page-header.tsx`
- [ ] 2.3 Delete `src/components/shared/under-construction-v3/social-links.tsx`
- [ ] 2.4 Delete `src/components/shared/under-construction-v3/subscription-form.tsx`
- [ ] 2.5 Delete `src/components/shared/under-construction-v3/__tests__/page-header.test.tsx`
- [ ] 2.6 Delete `src/components/shared/under-construction-v3/__tests__/social-links.test.tsx`
- [ ] 2.7 Delete `src/components/shared/under-construction-v3/__tests__/subscription-form.test.tsx`
- [ ] 2.8 Delete empty `src/components/shared/under-construction-v3/` directory
- [ ] 2.9 Delete empty `src/components/shared/under-construction-v3/__tests__/` directory

## 3. Cleanup References

- [ ] 3.1 Search for any remaining imports of deleted modules
- [ ] 3.2 Update `semgrep-report.json` if it references deleted files (via normal security scan)

## 4. Validation

- [ ] 4.1 Run `pnpm type-check`
- [ ] 4.2 Run `pnpm lint:check`
- [ ] 4.3 Run `pnpm test`
- [ ] 4.4 Run `pnpm build`
- [ ] 4.5 Verify no remaining references: `rg -n "under-construction-v2|under-construction-v3|UnderConstructionV2|UnderConstructionV3" src/`

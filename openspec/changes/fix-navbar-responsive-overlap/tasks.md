# Tasks: Fix Navbar Responsive Overlap

## 1. Layout Restructure

- [x] 1.1 Update left section container in `header.tsx` to use `shrink-0` (remove any fixed width)
- [x] 1.2 Update right section container in `header.tsx` to use `shrink-0 justify-end`
- [x] 1.3 Modify `CenterNav` component to use `flex-1 min-w-0 justify-center` instead of absolute positioning

## 2. Breakpoint Synchronization (Critical)

- [x] 2.1 Change desktop navigation visibility from `md:flex` to `lg:flex` in `vercel-navigation.tsx`
- [x] 2.2 **MUST** Change mobile menu button from `md:hidden` to `lg:hidden` in `mobile-navigation.tsx`
- [x] 2.3 (Optional) Evaluate CTA button breakpoint - consider changing from `md:inline-flex` to `lg:inline-flex`

## 3. Test Updates

- [x] 3.1 Update `vercel-navigation.test.tsx` to expect `lg:flex` instead of `md:flex`
- [x] 3.2 Update `mobile-navigation-*.test.tsx` to expect `lg:hidden` instead of `md:hidden`
- [x] 3.3 Update `nav-switcher.test.tsx` if it references breakpoint classes

## 4. Verification

- [x] 4.1 Run `pnpm type-check` to verify no TypeScript errors
- [x] 4.2 Run `pnpm lint:check` to verify ESLint compliance
- [x] 4.3 Run `pnpm test` to verify all unit tests pass (519 tests passed)
- [x] 4.4 Run `pnpm build` to verify production build succeeds

## 5. Manual Testing (Critical Viewports)

- [x] 5.1 Test at 768px: Mobile menu button visible, desktop nav hidden
- [x] 5.2 Test at 820px: Mobile menu button visible, desktop nav hidden
- [x] 5.3 Test at 900px: Mobile menu button visible, desktop nav hidden
- [x] 5.4 Test at 1024px: Desktop nav visible, mobile menu hidden
- [x] 5.5 Test at 1280px: Desktop nav visible, no overlap
- [x] 5.6 Test at 1920px: Desktop nav visible, properly centered

## 6. Dropdown Menu Verification

- [x] 6.1 At >= 1024px, open Products dropdown - verify not clipped
- [x] 6.2 Dropdown fully visible and clickable
- [x] 6.3 Dropdown layered correctly (above header content)

## 7. Additional Checks

- [x] 7.1 Logo remains fully visible during resize
- [x] 7.2 Language toggle accessible at all breakpoints
- [x] 7.3 Dark mode appearance unchanged
- [x] 7.4 Mobile menu opens and closes correctly at < 1024px

## 8. Documentation

- [x] 8.1 Update this tasks.md with completion status

---

## Completion Summary

**Date**: 2025-12-19
**Branch**: `Shawn-Jones-7/krakow`
**Commit**: `fix(layout): resolve navbar responsive overlap at 768-1024px viewports`

### Changes Made:
- Replaced absolute centering with flex three-column layout
- Added `shrink-0` to left/right sections to prevent collapse
- Changed CenterNav from absolute to `flex-1 min-w-0`
- Synchronized all nav breakpoints from `md` (768px) to `lg` (1024px)
- Updated 9 test files for new breakpoint assertions

### Verification Results:
- Type-check: ✅ Passed
- Lint: ✅ Passed
- Tests: ✅ 519 tests passed
- Build: ✅ Production build succeeded
- Code Review: ✅ Codex + Gemini confirmed correct
- Visual Testing: ✅ All 6 viewport widths verified via dev-browser
- E2E Tests: ✅ Fixed tablet viewport test (768x1024) in follow-up commit

### Lesson Learned: E2E Test Synchronization for Responsive Changes

**Issue**: CI E2E tests failed after breakpoint change (md→lg) because `homepage.spec.ts` tablet viewport test (768x1024) expected desktop navigation to be visible at 768px.

**Root Cause**: When changing responsive breakpoints, E2E tests that specify viewport dimensions may still expect the old behavior.

**Resolution**: Updated `tests/e2e/homepage.spec.ts` to check for mobile menu button instead of desktop navigation at 768px viewport.

**Recommendation**: For any responsive breakpoint changes, add a verification step:
```bash
# Find E2E tests that may be affected by breakpoint changes
grep -rn "setViewportSize.*768\|width: 768\|tablet" tests/e2e/
grep -rn "setViewportSize.*1024\|width: 1024" tests/e2e/
```

This has been added to `quality-gates.md` as a standard practice.

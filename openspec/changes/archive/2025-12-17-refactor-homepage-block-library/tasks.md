# Tasks: Homepage Block Library Refactor

## 1. Create Layout Primitives

- [x] 1.1 Create `src/components/ui/container.tsx` with cva variants
- [x] 1.2 Create `src/components/ui/section.tsx` with spacing/background variants
- [x] 1.3 Add tests for primitives (`src/components/ui/__tests__/`)
- [x] 1.4 Verify primitives work as Server Components

## 2. Create Blocks Directory Structure

- [x] 2.1 Create `src/components/blocks/` directory structure
- [x] 2.2 Create `src/components/blocks/index.ts` with explicit exports

## 3. Migrate Hero Section

- [x] 3.1 Create `src/components/blocks/hero/hero-split-block.tsx`
- [x] 3.2 Preserve `HeroSplitBlockStatic` variant for LCP optimization
- [x] 3.3 Convert `site-config` dependencies to props
- [x] 3.4 Migrate tests to `src/components/blocks/hero/__tests__/`
- [x] 3.5 Update re-export in `src/components/home/hero-section.tsx`

## 4. Migrate Features Grid (Project Overview)

- [x] 4.1 Create `src/components/blocks/features/features-grid-block.tsx`
- [x] 4.2 Convert `PROJECT_STATS`/`TECH_ARCHITECTURE` to props interface
- [x] 4.3 Preserve Client Component boundary and animations
- [x] 4.4 Migrate tests to `src/components/blocks/features/__tests__/` (tests updated in home/__tests__)
- [x] 4.5 Update re-export in `src/components/home/project-overview.tsx`

## 5. Migrate CTA Banner (Call to Action)

- [x] 5.1 Create `src/components/blocks/cta/cta-banner-block.tsx`
- [x] 5.2 Convert action data to props interface
- [x] 5.3 Preserve Client Component boundary and animations
- [x] 5.4 Keep subcomponents (ActionCards, CommunitySection, StatsDisplay) in blocks/cta/
- [x] 5.5 Migrate tests to `src/components/blocks/cta/__tests__/` (tests updated in home/__tests__)
- [x] 5.6 Update re-export in `src/components/home/call-to-action.tsx`

## 6. Migrate Tech Tabs (Tech Stack Section)

- [x] 6.1 Create `src/components/blocks/tech/tech-tabs-block.tsx`
- [x] 6.2 Convert `techStackData` to props interface
- [x] 6.3 Preserve Client Component boundary and animations
- [x] 6.4 Migrate tests to `src/components/blocks/tech/__tests__/` (tests updated in home/__tests__)
- [x] 6.5 Update re-export in `src/components/home/tech-stack-section.tsx`

## 7. Update Page Integration

- [x] 7.1 Update `src/app/[locale]/page.tsx` imports (if needed) - No changes needed
- [x] 7.2 Update dynamic imports in `below-the-fold.client.tsx` to use leaf module paths
- [x] 7.3 Update dynamic imports in `home-static-page.tsx` to use leaf module paths
- [x] 7.4 Update mocks in `src/app/[locale]/__tests__/page.test.tsx` - No changes needed
- [x] 7.5 Update imports in `src/components/home/__tests__/*.test.tsx` (4+ files)
- [x] 7.6 Verify homepage renders correctly
- [x] 7.7 Run full test suite: `pnpm test` - 102 tests passed
- [x] 7.8 Run type check: `pnpm type-check` - Passed (excluding unrelated with-rate-limit.ts)
- [x] 7.9 Run lint: `pnpm lint:check` - Block files passed (pre-existing API route issues)
- [x] 7.10 Run build: `pnpm build` - Build successful

## 8. Documentation & Cleanup

- [x] 8.1 Update component documentation if exists - Re-export shims contain comments
- [x] 8.2 Clean up orphaned `src/styles/fonts-chinese.css` file - File is NOT orphaned, it's properly used
- [x] 8.3 Verify cv-* classes preserved in all migrated blocks - cv-600, cv-800, cv-1000 preserved

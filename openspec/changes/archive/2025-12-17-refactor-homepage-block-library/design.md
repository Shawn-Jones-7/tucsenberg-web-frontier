# Design: Homepage Block Library Architecture

## Context

Transform tucsenberg-web-frontier from a single-site implementation into a reusable B2B website template. This requires decoupling page-specific components into reusable blocks while preserving:
- Next.js 16 Server/Client component boundaries
- next-intl i18n patterns
- Performance optimizations (LCP, content-visibility)

## Goals / Non-Goals

**Goals:**
- Create unified layout primitives (Container, Section)
- Establish reusable block library pattern
- Maintain backward compatibility via re-exports
- Preserve existing test coverage

**Non-Goals:**
- Block registry/renderer system (deferred to future)
- MDX integration for blocks
- Dynamic block loading

## Decisions

### 1. Primitives Location: `src/components/ui/`

**Decision**: Place primitives alongside shadcn/ui components.

**Rationale**:
- Consistent with shadcn pattern (all UI primitives in `ui/`)
- Avoids creating separate `primitives/` directory
- Uses same `cva` + `Slot` patterns as existing shadcn components

**Alternatives considered**:
- `src/components/primitives/` - Would fragment UI components across directories

### 2. Block Naming: `*Block` Suffix

**Decision**: All block components use `*Block` suffix (e.g., `HeroSplitBlock`).

**Rationale**:
- Avoids naming conflicts with existing internal components (e.g., `FeatureGrid` already exists as sub-component)
- Clear distinction between blocks (page sections) and regular components
- Enables easy import discovery

### 3. Data via Props, Not Imports

**Decision**: Blocks receive data through props, not direct `site-config` imports.

**Rationale**:
- Enables true reusability across different pages/projects
- Makes data dependencies explicit and testable
- Follows React composition patterns

**Migration approach**:
```typescript
// Before (project-overview.tsx)
import { PROJECT_STATS } from '@/lib/site-config';

// After (features-grid-block.tsx)
interface FeaturesGridBlockProps {
  stats: ProjectStats;
  // ...
}
```

### 4. Re-export Pattern for Backward Compatibility

**Decision**: Keep old component files as re-export shims during migration.

**Rationale**:
- Zero breaking changes for existing page imports
- Gradual migration path
- Can be cleaned up in future phase

```typescript
// src/components/home/hero-section.tsx (after migration)
export { HeroSplitBlock as HeroSection } from '@/components/blocks';
export { HeroSplitBlockStatic as HeroSectionStatic } from '@/components/blocks';
```

### 5. Preserve i18n Patterns

**Decision**: Keep existing i18n patterns unchanged.
- Server Components: `getTranslations(namespace)`
- Client Components: `useTranslations(namespace)`

**Rationale**:
- No benefit to changing working patterns
- Hero Static variant critical for LCP (avoids provider dependency)

### 6. Primitives Design: Minimal Defaults

**Decision**: Primitives use minimal defaults, style via explicit props/className.

**Rationale** (from Codex audit):
- Current sections have varying `py-*`, `max-w-*`, `cv-*` patterns
- Default values would cause visual regression
- Better to be explicit than implicit

```typescript
// Section: NO spacing default, only default background
// cv-* classes passed via className
<Section spacing="lg" background="gradient" className="cv-600">
  <Container size="xl">
    {/* content */}
  </Container>
</Section>
```

**Container padding**: Uniform `px-4` (not responsive) to match existing codebase.

**cv-* strategy**: Passed via `className` prop, not built into Section variants.

### 7. Dynamic Import Strategy

**Decision**: Dynamic import leaf modules directly, not barrel exports.

**Rationale** (from Codex audit):
- Importing from barrel (`@/components/blocks`) risks chunk size bloat
- Leaf imports ensure optimal code splitting

```typescript
// ✅ Recommended: import leaf module
const CTABannerBlock = dynamic(() =>
  import('@/components/blocks/cta/cta-banner-block').then((m) => m.CTABannerBlock)
);

// ❌ Avoid: importing from barrel
const CTABannerBlock = dynamic(() =>
  import('@/components/blocks').then((m) => m.CTABannerBlock)
);
```

**Re-export shims**: Still provided for backward compatibility of static imports, but dynamic imports should use leaf paths.

### 8. Data Layer Separation

**Decision**: Page-specific data factories stay in page layer, not in blocks.

**Rationale**:
- `cta/data.ts` contains hardcoded i18n keys and links
- Moving to blocks would couple page-specific data to reusable blocks
- Blocks receive prepared data via props

```
src/components/home/cta/data.ts  ← stays here (page assembly layer)
src/components/blocks/cta/       ← only presentation components
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Visual regression from primitive defaults | Minimal defaults + explicit className override |
| LCP regression from i18n changes | Preserve HeroSplitBlockStatic pattern |
| Test coverage gaps during migration | Migrate tests alongside components |
| Import path confusion during transition | Re-export shims + clear documentation |

## Migration Plan

**Phase 1** (this change):
1. Create primitives (Container, Section)
2. Migrate 4 main blocks with leaf module structure
3. Keep re-export shims for static imports
4. Update dynamic imports to use leaf module paths
5. i18n namespaces remain hardcoded (`home.*`)

**Phase 2** (future):
1. Update all page imports to use blocks directly
2. Remove re-export shims
3. Abstract i18n namespaces to props if cross-page reuse needed
4. Consider block registry if needed

## i18n Scope Clarification

**Phase 1 Constraint**: Blocks are for homepage refactor only.

- i18n namespaces remain hardcoded (`home.techStack`, `home.cta`, etc.)
- This is intentional - abstracting namespaces adds complexity without benefit for single-page use
- True cross-page reusability requires Phase 2 work

## Open Questions

1. Should `cta/` subcomponents (ActionCards, CommunitySection, StatsDisplay) become independent blocks or stay as internal components?
   - **Decision**: Stay internal to CTABannerBlock

2. Should we add Storybook for block documentation?
   - **Deferred**: Out of scope for this change

3. Should `cta/data.ts` move to blocks?
   - **Decision**: No. Stay in `home/cta/` as page assembly layer. Blocks receive data via props.

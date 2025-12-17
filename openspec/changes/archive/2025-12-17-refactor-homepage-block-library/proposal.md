# Change: Refactor Homepage Components into Reusable Block Library

## Why

The current homepage components (`src/components/home/`) are tightly coupled to the single site implementation. As the project evolves into a reusable B2B foreign trade website template, these components need to be restructured into a block library that:
- Enables page composition through reusable blocks
- Unifies layout patterns via primitives
- Separates data (props) from presentation (blocks)
- Maintains existing i18n and performance optimizations

## What Changes

### 1. Add Layout Primitives
- **Container**: Unified horizontal spacing and max-width control
- **Section**: Unified vertical spacing and background variants
- Location: `src/components/ui/` (follows shadcn pattern)

### 2. Create Blocks Directory Structure
```
src/components/blocks/
├── hero/
│   └── hero-split-block.tsx
├── features/
│   └── features-grid-block.tsx
├── cta/
│   └── cta-banner-block.tsx
├── tech/
│   └── tech-tabs-block.tsx
└── index.ts  # Explicit exports only
```

### 3. Migrate Components to Blocks
| Current | New Block | Type |
|---------|-----------|------|
| `home/hero-section.tsx` | `blocks/hero/hero-split-block.tsx` | Server |
| `home/project-overview.tsx` | `blocks/features/features-grid-block.tsx` | Client |
| `home/call-to-action.tsx` | `blocks/cta/cta-banner-block.tsx` | Client |
| `home/tech-stack-section.tsx` | `blocks/tech/tech-tabs-block.tsx` | Client |

**Excluded from migration** (stays in `home/`):
- `component-showcase.tsx` and `showcase/` directory (demo-specific)
- `home-static-page.tsx` (page composition layer)
- `below-the-fold.client.tsx` (page composition layer)

### 4. Key Design Decisions
- **Naming**: All blocks use `*Block` suffix to avoid conflicts
- **Data injection**: Blocks receive data via props (not `site-config` imports)
- **i18n preservation**: Hero Static variant preserved for LCP optimization
- **Server/Client boundary**: Unchanged from current implementation
- **Test migration**: Tests move with their components

## Impact

- **Affected specs**: `ui-components`
- **Affected code**:
  - `src/components/home/*.tsx`
  - `src/components/ui/` (new primitives)
  - `src/components/blocks/` (new directory)
  - `src/app/[locale]/page.tsx` (update imports)

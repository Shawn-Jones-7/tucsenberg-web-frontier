## ADDED Requirements

### Requirement: Layout Primitives

The system SHALL provide layout primitive components for consistent page structure.

#### Scenario: Container component provides horizontal constraints
- **WHEN** a Container component is rendered
- **THEN** it MUST apply horizontal centering (`mx-auto`)
- **AND** it MUST apply uniform horizontal padding (`px-4`)
- **AND** it MUST support size variants: `sm`, `md`, `lg`, `xl`, `2xl`, `full`
- **AND** it MUST default to `xl` size (max-w-screen-xl)
- **AND** it MUST accept className for overrides

#### Scenario: Container supports polymorphism
- **WHEN** Container is used with `asChild` prop
- **THEN** it MUST render as the child element type
- **AND** it MUST merge its classes with the child's classes

#### Scenario: Section component provides vertical structure
- **WHEN** a Section component is rendered
- **THEN** it MUST render as a `<section>` HTML element
- **AND** it MUST support spacing variants: `none`, `sm`, `md`, `lg`, `xl`
- **AND** it MUST support background variants: `default`, `muted`, `gradient`
- **AND** it MUST NOT apply any spacing class when spacing prop is omitted (no default)
- **AND** it MUST default to `default` background only
- **AND** it MUST include `scroll-mt-20` for anchor link offset
- **AND** it MUST accept className for cv-* and other overrides

#### Scenario: Section supports anchor links
- **WHEN** Section is rendered with an `id` prop
- **THEN** the section MUST be scrollable via anchor link
- **AND** the scroll position MUST account for fixed header (scroll-mt-20)

### Requirement: Block Library Architecture

The system SHALL organize reusable page sections as blocks in `src/components/blocks/`.

#### Scenario: Block component structure
- **WHEN** a block component is created
- **THEN** it MUST be placed in `src/components/blocks/{domain}/{name}-block.tsx`
- **AND** it MUST use `*Block` suffix in component name
- **AND** it MUST receive data through props (not direct imports)
- **AND** it MUST be exported from `src/components/blocks/index.ts`

#### Scenario: Block export pattern
- **WHEN** blocks are exported from index.ts
- **THEN** the file MUST use explicit named exports
- **AND** it MUST NOT use `export * from` pattern
- **AND** each export MUST include type exports if applicable

#### Scenario: Hero block preserves LCP optimization
- **WHEN** HeroSplitBlock is used for above-the-fold content
- **THEN** it MUST provide a `HeroSplitBlockStatic` variant
- **AND** the Static variant MUST accept pre-loaded messages via props
- **AND** the Static variant MUST NOT require NextIntlClientProvider

#### Scenario: Client blocks preserve animations
- **WHEN** a Client block uses scroll animations
- **THEN** it MUST continue using `useIntersectionObserver` hook
- **AND** it MUST respect `prefers-reduced-motion` media query
- **AND** it MUST include `triggerOnce: true` for performance

### Requirement: Backward Compatibility Re-exports

The system SHALL maintain backward compatibility during migration via re-exports.

#### Scenario: Legacy imports continue working
- **WHEN** existing code imports from `@/components/home/{component}`
- **THEN** the import MUST resolve to the new block component
- **AND** no changes to consuming code MUST be required
- **AND** TypeScript types MUST remain compatible

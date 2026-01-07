# ui-components Specification

## Purpose
TBD - created by archiving change improve-ux-and-fix-bugs. Update Purpose after archive.
## Requirements
### Requirement: Cookie Banner and Floating Button Coordination

The system SHALL prevent visual overlap between the Cookie Banner and any floating action buttons (e.g., WhatsApp).

#### Scenario: WhatsApp button adjusts position when cookie banner visible
- **WHEN** the Cookie Banner is displayed at the bottom of the viewport
- **AND** the WhatsApp floating button is also visible
- **THEN** the WhatsApp button MUST be positioned above the Cookie Banner with appropriate spacing
- **AND** the position adjustment MUST use CSS variable `--cookie-banner-height`
- **AND** the position adjustment MUST animate smoothly (300ms ease-out)

#### Scenario: WhatsApp button returns to default position after consent
- **WHEN** the user accepts or rejects cookies
- **AND** the Cookie Banner is dismissed
- **THEN** the CSS variable `--cookie-banner-height` MUST be set to `0px`
- **AND** the WhatsApp button MUST animate back to its default bottom-right position

#### Scenario: Mobile viewport coordination
- **WHEN** viewing on mobile viewport (< 640px)
- **AND** both Cookie Banner and WhatsApp button are visible
- **THEN** the WhatsApp button MUST remain accessible and not be covered by the banner

#### Scenario: Dynamic banner height measurement
- **WHEN** the Cookie Banner is displayed
- **THEN** the banner height MUST be measured using `ResizeObserver`
- **AND** the CSS variable `--cookie-banner-height` MUST be updated on document root
- **AND** height changes (e.g., preferences panel expansion) MUST be reflected in real-time

### Requirement: WhatsApp Chat Window

The system SHALL provide a chat window interface for WhatsApp conversations instead of directly opening a new browser tab.

> **Implementation Note:** This is a custom implementation, NOT using `react-floating-whatsapp` library due to React 19 compatibility concerns.

#### Scenario: Desktop chat window interaction
- **WHEN** user clicks the WhatsApp floating button on desktop browser
- **THEN** a chat window card MUST appear above the floating button
- **AND** the window MUST display:
  - A greeting message (e.g., "Need help?")
  - Expected response time (e.g., "Team typically replies within 5 minutes")
  - A textarea for user message input
  - A "Start WhatsApp Chat" action button
  - A close button (X)
- **AND** clicking "Start WhatsApp Chat" MUST open WhatsApp Web (`web.whatsapp.com/send`) with the pre-filled message

#### Scenario: Mobile deep link behavior
- **WHEN** user clicks the WhatsApp floating button on mobile device
- **THEN** the chat window MAY be skipped (direct action preferred on mobile)
- **OR** the chat window MAY be shown with same UI
- **AND** clicking "Start WhatsApp Chat" MUST use native deep link (`whatsapp://send`)
- **AND** the native WhatsApp app MUST be opened with pre-filled message

#### Scenario: Pre-filled message context
- **WHEN** user initiates WhatsApp conversation from any page
- **THEN** the default message MUST include:
  - Base greeting in current locale (en: "Hi! I'm interested in your products." / zh: "您好！我对贵公司的产品感兴趣。")
  - Current page URL
- **AND** if user is on a product detail page (`/[locale]/products/[slug]`)
- **THEN** the message MUST also include the product name/slug

#### Scenario: User-editable message
- **WHEN** the chat window is open
- **THEN** user MUST be able to edit the pre-filled message in the textarea
- **AND** the edited message MUST be used when opening WhatsApp

#### Scenario: Dark mode support
- **WHEN** the site is in dark mode
- **THEN** the chat window MUST use dark theme styling consistent with site theme
- **AND** the floating button MUST maintain appropriate contrast in both themes

#### Scenario: Keyboard dismissal
- **WHEN** the chat window is open
- **AND** user presses Escape key
- **THEN** the chat window MUST close
- **AND** the floating button MUST remain visible

#### Scenario: Click outside dismissal
- **WHEN** the chat window is open
- **AND** user clicks outside the chat window (not on the floating button)
- **THEN** the chat window MUST close

#### Scenario: Draggable button with chat window
- **WHEN** the floating button is dragged to a new position
- **AND** the chat window is open
- **THEN** the chat window MUST move with the button
- **AND** the chat window MUST remain positioned above the button

#### Scenario: i18n support
- **WHEN** the site locale is changed
- **THEN** all chat window text MUST be displayed in the current locale
- **AND** the default pre-filled message MUST use the current locale

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

### Requirement: Global Selection Highlight

The system SHALL provide a global, brand-consistent text selection highlight using CSS-only styling.

#### Scenario: Light mode selection highlight
- **WHEN** the user selects text anywhere on the site
- **THEN** the selection background color MUST be `var(--selection-background)`
- **AND** the selection text color MUST be `var(--selection-foreground)`

#### Scenario: Dark mode selection highlight
- **WHEN** the site is rendered in dark mode (document root has the `dark` class)
- **AND** the user selects text
- **THEN** the selection highlight MUST use the dark-mode values of `--selection-background` and `--selection-foreground`

#### Scenario: Firefox support
- **WHEN** the user selects text in Firefox
- **THEN** the selection highlight MUST be applied via `::-moz-selection` with the same colors as `::selection`


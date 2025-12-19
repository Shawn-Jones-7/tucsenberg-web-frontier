## ADDED Requirements

### Requirement: Header Navigation Responsive Layout

The system SHALL provide a responsive header navigation that prevents visual overlap between Logo, navigation links, and utility controls across all viewport sizes, while preserving dropdown menu functionality.

#### Scenario: Three-column flex layout structure
- **WHEN** the header is rendered on desktop viewport (>= 1024px)
- **THEN** the header MUST use a three-column flex layout
- **AND** the left column (Logo area) MUST use `shrink-0` to prevent compression
- **AND** the center column (Navigation) MUST use `flex-1 min-w-0` to fill remaining space
- **AND** the right column (Utility controls) MUST use `shrink-0` to prevent compression
- **AND** navigation links MUST be horizontally centered within the center column

#### Scenario: Navigation visibility at lg breakpoint
- **WHEN** viewport width is less than 1024px (lg breakpoint)
- **THEN** the desktop navigation links MUST be hidden
- **AND** the mobile hamburger menu button MUST be visible

#### Scenario: Navigation visibility on large screens
- **WHEN** viewport width is 1024px or greater
- **THEN** the desktop navigation links MUST be visible
- **AND** the mobile hamburger menu button MUST be hidden

#### Scenario: Breakpoint synchronization prevents navigation gap
- **WHEN** viewport width is between 768px and 1023px
- **THEN** the mobile hamburger menu button MUST be visible and operable
- **AND** clicking the hamburger button MUST open the mobile navigation sheet
- **AND** users MUST have access to all navigation items via mobile menu

#### Scenario: Dropdown menus not clipped by layout
- **WHEN** a dropdown navigation item is opened on desktop (>= 1024px)
- **THEN** the dropdown panel MUST be fully visible
- **AND** the dropdown panel MUST NOT be clipped by any ancestor overflow property
- **AND** all dropdown menu items MUST be clickable

#### Scenario: Logo always visible during resize
- **WHEN** the viewport is resized from wide to narrow
- **THEN** the Logo (image and text) MUST remain fully visible
- **AND** the Logo MUST NOT be overlapped by navigation or utility controls

#### Scenario: Utility controls always accessible
- **WHEN** the viewport is resized
- **THEN** the language toggle MUST remain fully visible and clickable
- **AND** utility controls MUST NOT be overlapped by navigation links or dropdowns

#### Scenario: No overlap at critical viewport widths
- **WHEN** viewport width is 768px, 820px, 900px, 1024px, or 1280px
- **THEN** Logo, navigation (if visible), and right controls MUST NOT visually overlap
- **AND** bounding boxes of these regions MUST NOT intersect

#### Scenario: Stable header height during transitions
- **WHEN** the viewport width crosses the 1024px breakpoint
- **THEN** the header height MUST remain constant (h-16)
- **AND** the navigation visibility change MUST NOT cause cumulative layout shift (CLS)

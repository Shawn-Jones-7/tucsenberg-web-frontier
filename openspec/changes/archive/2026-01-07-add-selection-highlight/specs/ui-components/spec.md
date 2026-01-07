## ADDED Requirements

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


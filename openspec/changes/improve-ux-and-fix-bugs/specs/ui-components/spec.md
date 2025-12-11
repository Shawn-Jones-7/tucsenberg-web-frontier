# UI Components Specification Delta

## ADDED Requirements

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

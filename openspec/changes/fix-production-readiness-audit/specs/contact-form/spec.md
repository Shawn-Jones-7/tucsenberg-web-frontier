## ADDED Requirements

### Requirement: Client-Side Form Validation
The contact form SHALL perform client-side validation using the same Zod schema as server-side validation to provide immediate feedback.

#### Scenario: Invalid email format
- **WHEN** user enters an invalid email format
- **THEN** a validation error SHALL be displayed immediately without server round-trip
- **AND** the error message SHALL be localized to the current locale

#### Scenario: Required field empty
- **WHEN** user attempts to submit with a required field empty
- **THEN** the specific field SHALL be highlighted with an error
- **AND** the form SHALL NOT be submitted to the server

### Requirement: Product Inquiry CTA Integration
Product detail pages SHALL provide a functional call-to-action that connects users to the inquiry flow.

#### Scenario: Request Quote button interaction
- **WHEN** user clicks "Request Quote" on a product detail page
- **THEN** the system SHALL either scroll to an inquiry form OR open a drawer/modal with the form
- **AND** the product context (name, SKU) SHALL be pre-filled in the inquiry

### Requirement: Newsletter Subscription Integration
The blog section SHALL include a newsletter subscription component with proper security protection.

#### Scenario: Blog page newsletter display
- **WHEN** user visits the blog listing page
- **THEN** a newsletter subscription form SHALL be visible
- **AND** the form SHALL be protected by Turnstile CAPTCHA

# Contact Form Specification Delta

## ADDED Requirements

### Requirement: Graceful Degradation for Security Verification

The system SHALL handle unavailable Turnstile verification gracefully in development environments.

#### Scenario: Development mode bypass
- **WHEN** application is running in development mode (`NODE_ENV=development`)
- **AND** `TURNSTILE_BYPASS=true` is set in environment variables
- **THEN** Turnstile verification MUST be bypassed
- **AND** form submission MUST proceed without Turnstile token
- **AND** a warning banner MUST be displayed indicating test mode

#### Scenario: Development mode without bypass
- **WHEN** application is running in development mode
- **AND** `TURNSTILE_BYPASS` is not set or is `false`
- **AND** Turnstile widget fails to load
- **THEN** the contact form MUST still be displayed
- **AND** an informational message MUST explain the verification is unavailable
- **AND** alternative contact methods MUST be prominently displayed

#### Scenario: Production mode strict verification
- **WHEN** application is running in production mode (`NODE_ENV=production`)
- **THEN** Turnstile verification MUST NOT be bypassed regardless of environment variables
- **AND** `TURNSTILE_BYPASS` setting MUST be ignored

#### Scenario: Turnstile initialization failure handling
- **WHEN** Turnstile widget fails to initialize
- **THEN** the form MUST NOT display a full-page error
- **AND** the submit button MAY be disabled with explanation
- **AND** alternative contact information MUST be visible:
  - Email address
  - Phone number
  - Business hours

### Requirement: Alternative Contact Methods Visibility

The system SHALL always display alternative contact methods alongside the form.

#### Scenario: Contact methods always visible
- **WHEN** user views the contact page
- **THEN** the following contact methods MUST be visible:
  - Email address (contact@tucsenberg.com)
  - Phone number (+1-555-0123)
  - Business hours
- **AND** these methods MUST be displayed regardless of form status

#### Scenario: Emphasized alternatives on form error
- **WHEN** the contact form is unavailable or in error state
- **THEN** alternative contact methods MUST be emphasized
- **AND** WhatsApp contact option MUST be suggested

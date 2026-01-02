## ADDED Requirements

### Requirement: React Email Component Architecture

The email system SHALL use React Email components for template generation instead of raw HTML strings.

#### Scenario: Component-based email rendering
- **WHEN** an email needs to be sent
- **THEN** the system SHALL render a React Email component
- **AND** generate plainText fallback using `@react-email/render`

#### Scenario: Shared layout component
- **WHEN** any email template is rendered
- **THEN** it SHALL use the `EmailLayout` component for consistent header/footer/container structure

### Requirement: Email Template Types

The system SHALL provide React Email components for all existing email types.

#### Scenario: Contact form notification
- **WHEN** a user submits the contact form
- **THEN** the `ContactFormEmail` component SHALL render an admin notification
- **AND** include sender details, message content, and submission metadata

#### Scenario: User confirmation email
- **WHEN** a contact form is successfully submitted
- **THEN** the `ConfirmationEmail` component SHALL render a confirmation to the user
- **AND** include a summary of their submission

#### Scenario: Product inquiry notification
- **WHEN** a user submits a product inquiry
- **THEN** the `ProductInquiryEmail` component SHALL render an admin notification
- **AND** display product name with font-size >= 18px and font-weight bold
- **AND** display quantity with accent color (#059669) and font-weight bold

### Requirement: Email Styling Consistency

The email system SHALL use a shared theme for consistent styling across all templates.

#### Scenario: Theme constants
- **WHEN** email components are rendered
- **THEN** they SHALL use colors, fonts, and spacing from `theme.ts`
- **AND** use inline styles for email client compatibility

#### Scenario: Email client compatibility
- **WHEN** emails are rendered
- **THEN** they SHALL use inline CSS styles (not external stylesheets)
- **AND** all text content SHALL be visible without layout breakage in Outlook, Gmail, and Apple Mail
- **AND** container width SHALL NOT exceed 600px

### Requirement: PlainText Fallback

The email system SHALL generate plainText versions of all emails for deliverability.

#### Scenario: PlainText generation
- **WHEN** an email is sent via Resend
- **THEN** the system SHALL include both `react` and `text` properties
- **AND** generate `text` using `@react-email/render` with `plainText: true`

### Requirement: Developer Preview

The email system SHALL provide a local preview capability for template development.

#### Scenario: Email preview server
- **WHEN** a developer runs `pnpm email:dev`
- **THEN** the system SHALL execute `email dev --dir src/components/emails --port 3001`
- **AND** a preview server SHALL start on port 3001
- **AND** display all email templates from `src/components/emails/` directory

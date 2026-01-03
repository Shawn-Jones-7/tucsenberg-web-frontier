## ADDED Requirements

### Requirement: Client-Side Form Validation
Contact forms SHALL provide immediate client-side validation feedback using Zod schemas.

#### Scenario: Field validation on blur
- **WHEN** user leaves a form field (blur event)
- **THEN** field MUST be validated against Zod schema
- **AND** validation error MUST be displayed immediately
- **AND** error message MUST match server-side validation messages

#### Scenario: Form validation on submit
- **WHEN** user submits form
- **THEN** all fields MUST be validated client-side before submission
- **AND** invalid fields MUST be highlighted
- **AND** first invalid field MUST receive focus

#### Scenario: Schema reuse
- **WHEN** implementing client-side validation
- **THEN** same Zod schema MUST be used for client and server validation
- **AND** schema MUST be importable in client components

### Requirement: Confirmation Email
Contact form submissions SHALL trigger a confirmation email to the submitter.

#### Scenario: Successful submission confirmation
- **WHEN** contact form submission succeeds
- **THEN** confirmation email MUST be sent to submitter's email address
- **AND** email MUST include submission reference ID
- **AND** email MUST include expected response timeframe

#### Scenario: Confirmation email opt-in
- **WHEN** confirmation email feature is configured
- **THEN** sending MUST be controlled by configuration flag
- **AND** email consent checkbox MAY be required based on config

### Requirement: Centralized Contact Information
Contact page SHALL use centralized configuration for contact details instead of hardcoded values.

#### Scenario: Contact info from siteFacts
- **WHEN** rendering contact page
- **THEN** phone number MUST come from `siteFacts.contact.phone`
- **AND** email MUST come from `siteFacts.contact.email`
- **AND** address MUST come from `siteFacts.company.location`

#### Scenario: Single source of truth
- **WHEN** contact information needs to be updated
- **THEN** only `src/config/site-facts.ts` needs modification
- **AND** all pages using contact info MUST reflect the change

## MODIFIED Requirements

### Requirement: Form Submission Security
Contact form submissions SHALL be protected against spam and abuse through multiple layers.

#### Scenario: Turnstile verification
- **WHEN** form is submitted
- **THEN** Turnstile token MUST be verified server-side
- **AND** verification MUST use server-derived client IP (not hardcoded strings)
- **AND** failed verification MUST reject submission

#### Scenario: Honeypot field
- **WHEN** form includes honeypot field
- **THEN** field MUST be hidden from users via CSS
- **AND** field value MUST be checked on submission
- **AND** non-empty honeypot MUST silently reject submission

#### Scenario: Rate limiting
- **WHEN** form submissions are received
- **THEN** distributed rate limiting MUST be enforced
- **AND** rate limit MUST apply to both API routes and Server Actions
- **AND** exceeding limit MUST return HTTP 429 or appropriate error

#### Scenario: Timestamp validation
- **WHEN** form includes submission timestamp
- **THEN** timestamp MUST be validated within acceptable window (10 minutes)
- **AND** expired or future timestamps MUST reject submission

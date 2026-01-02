## ADDED Requirements

### Requirement: PII Log Sanitization
The system SHALL NOT log personally identifiable information (PII) including email addresses, IP addresses, phone numbers, or company names in production logs.

#### Scenario: Contact form submission logging
- **WHEN** a contact form is submitted successfully
- **THEN** the log entry SHALL contain only a reference ID, processing time, and success status
- **AND** the log entry SHALL NOT contain email, IP, or company name

#### Scenario: Error logging with user context
- **WHEN** an error occurs during form processing
- **THEN** the error log SHALL contain only sanitized identifiers
- **AND** sensitive fields SHALL be replaced with `[REDACTED]` or omitted entirely

### Requirement: Production Environment Validation
The system SHALL validate critical environment variables at build time and fail fast if production-required values are missing or contain placeholder defaults.

#### Scenario: Missing base URL in production
- **WHEN** `NODE_ENV=production` and `NEXT_PUBLIC_BASE_URL` is not set or equals `https://example.com`
- **THEN** the build SHALL fail with a descriptive error message

#### Scenario: Placeholder token detection
- **WHEN** `NODE_ENV=production`
- **AND** any `SITE_CONFIG` string field contains placeholder tokens like `[PROJECT_NAME]`, `[CONTACT_EMAIL]`, `[TWITTER_URL]`, `[GITHUB_URL]`, or `[LINKEDIN_URL]`
- **THEN** the quality gate SHALL fail with instructions to configure production values

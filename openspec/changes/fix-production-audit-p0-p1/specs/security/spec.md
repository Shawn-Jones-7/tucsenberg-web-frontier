## ADDED Requirements

### Requirement: Cookie Security Attributes
Session and locale cookies SHALL be configured with secure attributes to prevent interception and CSRF attacks.

#### Scenario: Production cookie security
- **WHEN** setting cookies in production environment
- **THEN** `secure` attribute MUST be `true`
- **AND** `httpOnly` attribute MUST be `true` for sensitive cookies
- **AND** `sameSite` attribute MUST be `strict` or `lax`

#### Scenario: Development cookie flexibility
- **WHEN** setting cookies in development environment
- **THEN** `secure` attribute MAY be `false` for localhost testing
- **AND** `httpOnly` and `sameSite` attributes MUST still be set

### Requirement: PII Logging Prevention
Application logs SHALL NOT contain personally identifiable information (PII) to comply with privacy regulations.

#### Scenario: Email sanitization in logs
- **WHEN** logging events that involve email addresses
- **THEN** email MUST be sanitized using `sanitizeEmail()` or omitted entirely
- **AND** only truncated/hashed identifiers MAY be logged for debugging

#### Scenario: IP address sanitization in logs
- **WHEN** logging events that involve client IP addresses
- **THEN** IP MUST be sanitized using `sanitizeIP()`
- **AND** full IP addresses MUST NOT appear in log output

#### Scenario: Company name sanitization in logs
- **WHEN** logging events that involve company names
- **THEN** company name MUST be omitted or replaced with reference ID
- **AND** business-identifying information MUST NOT appear in logs

### Requirement: Server Action Rate Limiting
Server Actions handling form submissions SHALL be protected by distributed rate limiting.

#### Scenario: Rate limit enforcement
- **WHEN** a Server Action processes a form submission
- **THEN** distributed rate limiting MUST be checked before processing
- **AND** rate limit key MUST be based on client IP
- **AND** exceeding limit MUST return appropriate error response

#### Scenario: Client IP extraction for Server Actions
- **WHEN** Server Action needs client IP for rate limiting or Turnstile
- **THEN** IP MUST be extracted from request headers (`x-forwarded-for`, `x-real-ip`)
- **AND** hardcoded strings like `'server-action'` MUST NOT be used as IP

### Requirement: Honeypot Field Validation
Contact forms SHALL validate honeypot fields to detect bot submissions.

#### Scenario: Honeypot field present
- **WHEN** form submission includes honeypot field with value
- **THEN** submission MUST be rejected as likely bot
- **AND** rejection MUST be silent (no error message revealing detection)

#### Scenario: Honeypot field empty
- **WHEN** form submission has empty honeypot field
- **THEN** submission MUST proceed to normal validation
- **AND** honeypot check MUST happen before expensive operations

### Requirement: Production Configuration Validation
Production builds SHALL validate that all placeholder values have been replaced with real configuration.

#### Scenario: Build-time validation
- **WHEN** running production build (`NODE_ENV=production`)
- **THEN** `validateSiteConfig()` MUST be called
- **AND** build MUST fail if placeholders like `[PROJECT_NAME]` or `example.com` are detected

#### Scenario: CI pipeline enforcement
- **WHEN** CI pipeline runs for production deployment
- **THEN** configuration validation MUST be a blocking step
- **AND** deployment MUST NOT proceed with placeholder values

### Requirement: CSP Report Endpoint Protection
The CSP report endpoint SHALL be rate limited to prevent abuse as a logging amplification vector.

#### Scenario: Rate limiting applied
- **WHEN** requests are sent to `/api/csp-report`
- **THEN** requests MUST be rate limited (default: 100 req/min/IP)
- **AND** exceeding limit MUST return HTTP 429

### Requirement: Webhook Endpoint Protection
External webhook endpoints SHALL be rate limited to prevent denial of service.

#### Scenario: WhatsApp webhook rate limiting
- **WHEN** requests are sent to `/api/whatsapp/webhook`
- **THEN** requests MUST be rate limited
- **AND** signature verification MUST occur before rate limit consumption
- **AND** invalid signatures MUST NOT consume rate limit quota

## MODIFIED Requirements

### Requirement: Logging Privacy Red Lines

Rate limit logging SHALL explicitly forbid recording sensitive materials.

#### Scenario: Forbidden log content
- **WHEN** logging rate limit events
- **THEN** original API key SHALL NOT be logged
- **AND** session ID SHALL NOT be logged
- **AND** token plaintext SHALL NOT be logged
- **AND** pepper value SHALL NOT be logged
- **AND** only short hash prefix (≤8 chars) may be logged for debugging
- **AND** email addresses SHALL NOT be logged
- **AND** company names SHALL NOT be logged
- **AND** full IP addresses SHALL NOT be logged

#### Scenario: Permitted log content
- **WHEN** logging rate limit events
- **THEN** strategy name MAY be logged
- **AND** route/preset name MAY be logged
- **AND** error type (timeout, connection) MAY be logged
- **AND** truncated key prefix (≤8 chars) MAY be logged
- **AND** sanitized IP (partial) MAY be logged
- **AND** reference IDs MAY be logged

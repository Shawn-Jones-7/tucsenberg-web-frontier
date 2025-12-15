## ADDED Requirements

### Requirement: Middleware Activation
The Next.js middleware file SHALL be correctly named for automatic loading.

#### Scenario: Middleware file naming
- **WHEN** the project contains middleware logic
- **THEN** the file MUST be named `middleware.ts` or `middleware.js`
- **AND** the file MUST be located at project root or `src/` directory
- **AND** Next.js MUST automatically invoke the middleware for matching routes

#### Scenario: Security headers applied
- **WHEN** a request matches the middleware matcher pattern
- **THEN** CSP headers MUST be present in the response
- **AND** nonce values MUST be injected for script-src
- **AND** HSTS, X-Frame-Options, X-Content-Type-Options headers MUST be set

### Requirement: WhatsApp API Protection
The WhatsApp send API SHALL be protected against unauthorized access and abuse.

#### Scenario: Rate limiting enforced
- **WHEN** a client sends requests to `/api/whatsapp/send`
- **THEN** requests MUST be rate limited (default: 5 req/min/IP)
- **AND** exceeding the limit MUST return HTTP 429
- **AND** response MUST include `Retry-After` header

#### Scenario: Optional API key authentication
- **WHEN** `WHATSAPP_API_KEY` environment variable is set
- **THEN** requests MUST include valid `Authorization: Bearer <key>` header
- **AND** missing or invalid key MUST return HTTP 401
- **AND** error message MUST NOT leak the expected key format

#### Scenario: Unauthenticated access when key not configured
- **WHEN** `WHATSAPP_API_KEY` environment variable is not set
- **THEN** rate limiting MUST still be enforced
- **AND** requests without Authorization header MUST be allowed (rate limit only)

### Requirement: Analytics Endpoint Rate Limiting
Public analytics collection endpoints SHALL be rate limited to prevent abuse.

#### Scenario: Web vitals endpoint protected
- **WHEN** requests are sent to `/api/analytics/web-vitals`
- **THEN** requests MUST be rate limited (default: 100 req/min/IP)
- **AND** exceeding limit MUST return HTTP 429

#### Scenario: i18n analytics endpoint protected
- **WHEN** requests are sent to `/api/analytics/i18n`
- **THEN** requests MUST be rate limited (default: 100 req/min/IP)
- **AND** exceeding limit MUST return HTTP 429

### Requirement: Server-Derived Client IP for Turnstile
Turnstile verification SHALL use only server-derived client IP addresses.

#### Scenario: Client-provided IP rejected
- **WHEN** a request to `/api/verify-turnstile` includes `remoteip` in body
- **THEN** the provided value MUST be ignored
- **AND** only server-derived IP from request headers MUST be used

#### Scenario: IP chain extraction
- **WHEN** extracting client IP for Turnstile verification
- **THEN** the system MUST use `X-Forwarded-For`, `X-Real-IP`, or connection IP
- **AND** the full IP chain MUST be passed to Turnstile for risk analysis

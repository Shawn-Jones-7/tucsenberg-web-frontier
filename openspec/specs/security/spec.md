# security Specification

## Purpose
TBD - created by archiving change fix-security-critical-gaps. Update Purpose after archive.
## Requirements
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

### Requirement: Rate Limit Higher-Order Function

API routes with rate limiting SHALL use the `withRateLimit()` higher-order function to eliminate boilerplate and ensure consistent error responses.

#### Scenario: Basic rate limit application
- **WHEN** an API route requires rate limiting
- **THEN** the route handler SHALL be wrapped with `withRateLimit(preset, handler)`
- **AND** the handler SHALL receive `clientIP` in context parameter
- **AND** rate limit check SHALL execute before handler logic

#### Scenario: Rate limit exceeded
- **WHEN** client exceeds rate limit for a preset
- **THEN** response SHALL have status code 429
- **AND** response SHALL include `Retry-After` header
- **AND** response SHALL include `X-RateLimit-*` headers
- **AND** response body SHALL contain `{ success: false, error: 'Too many requests' }`

#### Scenario: Rate limit passed
- **WHEN** client is within rate limit
- **THEN** rate limit check SHALL succeed without delay
- **AND** handler SHALL execute with clientIP available in context
- **AND** response SHALL be determined by handler logic

### Requirement: Rate Limit Key Strategies

The rate limiting system SHALL support HMAC-based key generation strategies with server-side pepper to prevent offline correlation attacks.

#### Scenario: Pure IP strategy (default)
- **WHEN** no custom key strategy is provided
- **THEN** rate limit key SHALL be `ip:${hmacKey(clientIP)}`
- **AND** HMAC SHALL use server-side pepper
- **AND** behavior SHALL be backward compatible (same IP = same quota)

#### Scenario: Session priority strategy
- **WHEN** `getSessionPriorityKey` strategy is used
- **THEN** if `session-id` cookie present, rate limit key SHALL be `session:${hmacKey(sessionId)}`
- **AND** if no session cookie, rate limit key SHALL fallback to HMAC'd IP
- **AND** different sessions on same IP SHALL have separate quotas

#### Scenario: API key priority strategy
- **WHEN** `getApiKeyPriorityKey` strategy is used
- **THEN** if `Authorization: Bearer <key>` header present, rate limit key SHALL be `apikey:${hmacKey(apiKey)}`
- **AND** if no Authorization header, rate limit key SHALL fallback to HMAC'd IP
- **AND** same API key from different IPs SHALL share quota

#### Scenario: Strategy priority hierarchy
- **WHEN** selecting a key strategy for an endpoint
- **THEN** priority SHALL follow: API key > session ID > signed token > IP
- **AND** UserAgent SHALL NOT be used as primary key shard (easily spoofed)

#### Scenario: Session ID source validation (BLOCKING)
- **WHEN** using session-based key strategy
- **THEN** session ID MUST be server-issued and server-validated
- **AND** session ID MUST NOT be directly modifiable by client
- **AND** if session cookie absent or invalid, MUST fallback to IP strategy

#### Scenario: Signed token preconditions (BLOCKING)
- **WHEN** using signed token as rate limit key
- **THEN** token signature MUST be verified before use
- **AND** token expiry MUST be checked
- **AND** token audience/issuer MUST match expected values (if applicable)
- **AND** unverified/expired/mismatched tokens MUST fallback to IP strategy

### Requirement: Rate Limit Context Injection

Rate-limited handlers SHALL receive enriched context including client IP and request metadata.

#### Scenario: Context structure
- **WHEN** handler is invoked by `withRateLimit()`
- **THEN** second parameter SHALL be context object `{ clientIP: string }`
- **AND** clientIP SHALL be the value used for rate limiting
- **AND** context type SHALL be TypeScript-safe

#### Scenario: Context usage in handler
- **WHEN** handler needs client IP for logging or business logic
- **THEN** IP SHALL be accessed from context parameter
- **AND** handler SHALL NOT re-call `getClientIP()` (avoid duplicate work)

### Requirement: HMAC-Based Key Generation

All rate limit key generation SHALL use HMAC-SHA256 with server-side pepper to prevent offline correlation attacks.

#### Scenario: HMAC key generation
- **WHEN** generating rate limit keys
- **THEN** algorithm SHALL be HMAC-SHA256
- **AND** pepper SHALL be read from `RATE_LIMIT_PEPPER` environment variable
- **AND** output SHALL be hex-encoded
- **AND** minimum 16 characters (64-bit) SHALL be used

#### Scenario: Pepper not configured
- **WHEN** `RATE_LIMIT_PEPPER` environment variable is not set
- **THEN** a default development pepper SHALL be used
- **AND** warning SHALL be logged on first use
- **AND** production deployment SHALL require explicit pepper configuration

#### Scenario: Pepper rotation
- **WHEN** rotating rate limit pepper
- **THEN** old pepper SHALL be stored in `RATE_LIMIT_PEPPER_PREVIOUS`
- **AND** both peppers SHALL be checked during grace period (24 hours)
- **AND** old pepper SHALL be removed after grace period

### Requirement: Trusted Proxy Model

Client IP extraction SHALL only trust headers from known proxy/CDN sources to prevent spoofing.

#### Scenario: Vercel deployment
- **WHEN** deployed on Vercel (`DEPLOYMENT_PLATFORM=vercel`)
- **THEN** client IP SHALL be extracted from `x-real-ip` first, then `x-forwarded-for`
- **AND** Vercel-stripped headers are safe to trust

#### Scenario: Cloudflare deployment
- **WHEN** deployed behind Cloudflare (`DEPLOYMENT_PLATFORM=cloudflare`)
- **THEN** client IP SHALL be extracted from `cf-connecting-ip` first
- **AND** optionally validate that request comes from Cloudflare IP ranges

#### Scenario: Development environment
- **WHEN** in development mode (`DEPLOYMENT_PLATFORM=development`)
- **THEN** `x-forwarded-for` header SHALL be accepted for testing
- **AND** fallback to `127.0.0.1` if no headers present

#### Scenario: X-Forwarded-For parsing
- **WHEN** extracting IP from `X-Forwarded-For` header
- **THEN** only the FIRST IP (leftmost) SHALL be used
- **AND** whitespace SHALL be trimmed
- **AND** multiple IPs separated by comma SHALL be handled

#### Scenario: Trusted entry point validation (BLOCKING)
- **WHEN** `DEPLOYMENT_PLATFORM` is configured
- **THEN** XFF headers SHALL only be parsed if request comes from trusted platform entry
- **AND** direct connections without trusted proxy SHALL ignore XFF headers
- **AND** fallback to direct connection IP or framework-provided secure source

### Requirement: Storage Failure Strategy

Rate limiting SHALL define explicit behavior when storage backend is unavailable.

#### Scenario: Storage timeout or error
- **WHEN** rate limit storage check fails (timeout, connection error)
- **THEN** request SHALL be allowed (fail-open)
- **AND** error SHALL be logged with `logger.error`
- **AND** alert SHALL be triggered if threshold exceeded (>3 failures/minute)

#### Scenario: Fail-open justification
- **WHEN** fail-open strategy is used
- **THEN** availability is prioritized over strict rate limiting
- **AND** this is acceptable for B2B website with low attack surface
- **AND** monitoring SHALL detect abuse during storage outages

#### Scenario: Controlled degradation boundary
- **WHEN** fail-open is active during storage outage
- **THEN** response SHALL include observable header indicating degraded mode
- **AND** ops team SHALL have switch to temporarily enable fail-closed
- **AND** fallback to in-memory sliding window SHALL be documented as option
- **AND** operations runbook SHALL define escalation procedure

### Requirement: Logging Privacy Red Lines

Rate limit logging SHALL explicitly forbid recording sensitive materials.

#### Scenario: Forbidden log content
- **WHEN** logging rate limit events
- **THEN** original API key SHALL NOT be logged
- **AND** session ID SHALL NOT be logged
- **AND** token plaintext SHALL NOT be logged
- **AND** pepper value SHALL NOT be logged
- **AND** only short hash prefix (≤8 chars) may be logged for debugging

#### Scenario: Permitted log content
- **WHEN** logging rate limit events
- **THEN** strategy name MAY be logged
- **AND** route/preset name MAY be logged
- **AND** error type (timeout, connection) MAY be logged
- **AND** truncated key prefix (≤8 chars) MAY be logged

### Requirement: Next.js Dynamic Route Configuration

All rate-limited API routes SHALL be configured to prevent caching that would bypass rate limits.

#### Scenario: Route dynamic export
- **WHEN** API route uses `withRateLimit()` wrapper
- **THEN** route file SHALL export `dynamic = 'force-dynamic'`
- **AND** route SHALL NOT have conflicting `revalidate` exports

#### Scenario: Build verification
- **WHEN** production build completes
- **THEN** rate-limited routes SHALL appear as "λ (Dynamic)" in build output
- **AND** routes SHALL NOT be statically generated or cached

#### Scenario: Runtime requirement
- **WHEN** rate limit key strategy uses Node.js crypto module
- **THEN** route SHALL export `runtime = 'nodejs'`
- **AND** edge runtime SHALL NOT be used for HMAC operations

### Requirement: Backward Compatibility

Rate limiting refactor SHALL NOT break existing API clients or change observable behavior.

#### Scenario: Existing clients continue working
- **WHEN** API routes are refactored to use `withRateLimit()`
- **THEN** response format SHALL remain identical
- **AND** status codes SHALL remain identical
- **AND** rate limit thresholds SHALL remain unchanged
- **AND** existing tests SHALL pass without modification

#### Scenario: IP-only rate limiting preserved
- **WHEN** no custom key strategy is specified
- **THEN** rate limiting SHALL behave exactly as before refactor
- **AND** same IP SHALL hit same quota limits

### Requirement: CORS Allowlist
Form API endpoints SHALL use an allowlist for CORS instead of wildcard.

#### Scenario: Same-origin allowed
- **WHEN** request comes from same origin
- **THEN** CORS headers allow the request

#### Scenario: Unknown origin rejected
- **WHEN** request comes from unlisted origin
- **THEN** CORS headers are not sent
- **AND** browser blocks the request

#### Scenario: Configured origin allowed
- **WHEN** request comes from allowlisted origin
- **THEN** CORS headers allow the request
- **AND** allowlist is configurable via environment

### Requirement: CORS-Turnstile Alignment
CORS allowlist SHALL align with Turnstile hostname validation.

#### Scenario: Lists synchronized
- **WHEN** an origin is added to CORS allowlist
- **THEN** it is also valid in Turnstile hostname check
- **AND** configuration is in single source


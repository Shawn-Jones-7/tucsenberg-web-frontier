## ADDED Requirements

### Requirement: API Rate Limit Testing

All API routes with rate limiting SHALL have comprehensive tests covering rate limit scenarios, including threshold enforcement and header validation.

#### Scenario: Rate limit enforcement test
- **WHEN** testing an API route with rate limiting
- **THEN** test SHALL mock `checkDistributedRateLimit` to return `allowed: false`
- **AND** test SHALL verify response status is 429
- **AND** test SHALL verify response includes error message

#### Scenario: Retry-After header validation
- **WHEN** rate limit is exceeded
- **THEN** test SHALL verify `Retry-After` header is present
- **AND** header value SHALL match `retryAfter` from rate limit result
- **AND** value SHALL be in seconds (integer)

#### Scenario: Rate limit headers validation
- **WHEN** rate limit response is returned
- **THEN** test SHALL verify `X-RateLimit-Limit` header presence
- **AND** test SHALL verify `X-RateLimit-Remaining` header presence
- **AND** test SHALL verify `X-RateLimit-Reset` header presence

#### Scenario: Rate limit allowed path
- **WHEN** testing normal request flow
- **THEN** test SHALL mock `checkDistributedRateLimit` to return `allowed: true`
- **AND** test SHALL verify handler logic executes
- **AND** test SHALL verify no rate limit errors returned

### Requirement: API Authentication Testing

API routes with authentication SHALL have tests covering all authentication scenarios including missing, invalid, and valid credentials.

#### Scenario: Missing authentication credentials
- **WHEN** API requires authentication
- **THEN** test SHALL send request without Authorization header
- **AND** test SHALL verify response status is 401
- **AND** test SHALL verify error message indicates missing credentials

#### Scenario: Invalid authentication format
- **WHEN** Authorization header has invalid format (not "Bearer <token>")
- **THEN** test SHALL verify response status is 401
- **AND** test SHALL verify error message indicates invalid format

#### Scenario: Invalid API key
- **WHEN** Authorization header contains incorrect API key
- **THEN** test SHALL verify response status is 401
- **AND** test SHALL verify error message indicates invalid credentials

#### Scenario: Valid authentication
- **WHEN** Authorization header contains valid API key
- **THEN** test SHALL verify request proceeds to handler logic
- **AND** test SHALL verify response status is not 401

#### Scenario: Optional authentication not configured
- **WHEN** API supports optional authentication but env var is not set
- **THEN** test SHALL verify authentication check is skipped
- **AND** test SHALL verify request proceeds without Authorization header

### Requirement: Security Test Coverage Threshold

Security-critical modules (authentication, rate limiting, input validation) SHALL achieve minimum 90% code coverage.

#### Scenario: Rate limit module coverage
- **WHEN** `with-rate-limit.ts` is tested
- **THEN** coverage SHALL be ≥95% for lines, statements, branches, functions
- **AND** all error paths SHALL be tested

#### Scenario: Key strategy module coverage
- **WHEN** `rate-limit-key-strategies.ts` is tested
- **THEN** coverage SHALL be ≥92% for all metrics
- **AND** all strategy variants SHALL be tested
- **AND** edge cases (missing headers, empty values) SHALL be tested

#### Scenario: API security endpoint coverage
- **WHEN** API routes with authentication/rate limiting are tested
- **THEN** coverage SHALL be ≥90% for the route file
- **AND** both success and failure paths SHALL be tested

### Requirement: Mock Hygiene for Rate Limit Tests

Rate limit tests SHALL use proper mock setup and cleanup to prevent test pollution.

#### Scenario: Mock initialization
- **WHEN** test suite begins
- **THEN** rate limit mocks SHALL be declared with `vi.hoisted()`
- **AND** mocks SHALL be reset in `beforeEach` hook
- **AND** default mock behavior SHALL be "allow" to avoid breaking unrelated tests

#### Scenario: Mock cleanup
- **WHEN** test completes
- **THEN** `vi.clearAllMocks()` SHALL be called in `afterEach`
- **AND** no mock state SHALL leak to other tests

#### Scenario: Scoped mock configuration
- **WHEN** individual test needs specific rate limit behavior
- **THEN** mock SHALL be configured within that test
- **AND** configuration SHALL not affect other tests in suite

### Requirement: Integration Test for Key Strategy

Integration tests SHALL verify that key strategies correctly differentiate users and prevent bypasses.

#### Scenario: Session-based differentiation
- **WHEN** two requests from same IP with different session cookies
- **THEN** each SHALL have independent rate limit quota
- **AND** one hitting limit SHALL NOT affect the other

#### Scenario: Same session same IP
- **WHEN** multiple requests from same IP with identical session cookie
- **THEN** they SHALL share the same rate limit quota
- **AND** quota SHALL decrement correctly across requests

#### Scenario: API key takes priority over IP
- **WHEN** request includes valid API key
- **THEN** rate limit key SHALL be based on API key HMAC hash
- **AND** same API key from different IPs SHALL share quota
- **AND** different API keys from same IP SHALL have separate quotas

### Requirement: HMAC and Pepper Testing

Tests SHALL verify correct HMAC key generation and pepper handling.

#### Scenario: HMAC key generation
- **WHEN** generating rate limit key with HMAC
- **THEN** test SHALL verify output length is 16 characters (64-bit)
- **AND** test SHALL verify same input produces same output (deterministic)
- **AND** test SHALL verify different pepper produces different output

#### Scenario: Pepper fallback
- **WHEN** `RATE_LIMIT_PEPPER` is not set
- **THEN** test SHALL verify default pepper is used
- **AND** test SHALL verify warning is logged

### Requirement: Storage Failure Testing

Tests SHALL verify correct behavior when rate limit storage fails.

#### Scenario: Storage timeout
- **WHEN** `checkDistributedRateLimit` throws error
- **THEN** test SHALL verify request is allowed (fail-open)
- **AND** test SHALL verify error is logged
- **AND** test SHALL verify handler executes normally

#### Scenario: Storage unavailable
- **WHEN** storage connection fails
- **THEN** test SHALL verify 500 is NOT returned
- **AND** test SHALL verify request proceeds to handler

### Requirement: Trusted Proxy Testing

Tests SHALL verify correct client IP extraction from proxy headers.

#### Scenario: X-Forwarded-For parsing
- **WHEN** `X-Forwarded-For` contains multiple IPs
- **THEN** test SHALL verify only first IP is used
- **AND** test SHALL verify whitespace is trimmed

#### Scenario: Platform-specific headers
- **WHEN** `DEPLOYMENT_PLATFORM=cloudflare`
- **THEN** test SHALL verify `cf-connecting-ip` is preferred
- **AND** test SHALL verify fallback to `x-forwarded-for` works

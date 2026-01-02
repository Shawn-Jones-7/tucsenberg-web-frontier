# Testing Capability

## Purpose

Comprehensive testing infrastructure for ensuring code quality, coverage targets, and regression prevention across the Next.js 16 application.
## Requirements
### Requirement: Coverage Threshold Enforcement

The testing system SHALL enforce a minimum 85% global code coverage threshold. Build SHALL fail if coverage drops below this threshold.

#### Scenario: Coverage meets threshold
- **WHEN** test suite runs with coverage
- **THEN** build passes if lines, statements, functions, and branches all meet 85%

#### Scenario: Coverage below threshold
- **WHEN** coverage for any metric falls below 85%
- **THEN** build fails with clear indication of which metric failed

### Requirement: ESM Mock Pattern

All module mocks SHALL use the `vi.hoisted()` pattern to ensure ESM compatibility with Vitest.

#### Scenario: Module mock declaration
- **WHEN** a test file needs to mock a module
- **THEN** mock variables are declared inside `vi.hoisted()` callback
- **AND** `vi.mock()` references those hoisted variables

#### Scenario: Invalid mock pattern
- **WHEN** mock variables are declared outside `vi.hoisted()`
- **THEN** tests may fail due to ESM module loading order

### Requirement: Server Component Testing

Async Server Components with Promise-based params SHALL be tested using `Promise.resolve()` for parameter props.

#### Scenario: Page component with async params
- **WHEN** testing a page component that accepts `params: Promise<{ locale: string }>`
- **THEN** test passes params as `Promise.resolve({ locale: 'en' })`
- **AND** awaits the component before rendering

#### Scenario: Rendering awaited component
- **WHEN** Server Component is awaited in test
- **THEN** result is passed to `render()` from React Testing Library

### Requirement: i18n Mock Configuration

Tests SHALL mock `next-intl/server` with `getTranslations` and `setRequestLocale` functions.

#### Scenario: Translation mock setup
- **WHEN** test requires i18n support
- **THEN** `mockGetTranslations` returns a function that maps keys to translated strings
- **AND** `setRequestLocale` is mocked as `vi.fn()`

#### Scenario: Missing translation key
- **WHEN** translation key is not in mock map
- **THEN** mock returns the key itself as fallback

### Requirement: JSON-LD Schema Testing

Pages with structured data SHALL have tests validating JSON-LD script injection.

#### Scenario: JSON-LD script presence
- **WHEN** page renders with structured data
- **THEN** container has `script[type="application/ld+json"]` element

#### Scenario: Schema validation
- **WHEN** JSON-LD script content is parsed
- **THEN** `@type` property matches expected schema type
- **AND** required properties are present and valid

### Requirement: Component Isolation

Unit tests SHALL mock child components to isolate the unit under test.

#### Scenario: Child component mocking
- **WHEN** parent component imports child components
- **THEN** child components are mocked with minimal implementations
- **AND** mock renders identifiable test elements (e.g., data-testid)

#### Scenario: Mock factory pattern
- **WHEN** mock needs to accept props
- **THEN** mock is defined as a function component returning simplified JSX

### Requirement: Progressive Coverage Threshold Enforcement

The testing system SHALL implement progressive coverage thresholds that increase as each phase completes, preventing sudden coverage jumps at the end.

#### Scenario: Phase 0 completion (Security)
- **WHEN** Phase 0 is completed
- **THEN** global coverage SHALL reach at least 45%
- **AND** all security modules SHALL have ≥90% coverage
- **AND** CI SHALL emit warning if below threshold (non-blocking)

#### Scenario: Phase 1 completion (External Integrations)
- **WHEN** Phase 1 is completed
- **THEN** global coverage SHALL reach at least 50%
- **AND** WhatsApp modules SHALL have ≥85% coverage
- **AND** CI SHALL emit warning if below threshold (non-blocking)

#### Scenario: Phase 2 completion (Core Libraries)
- **WHEN** Phase 2 is completed
- **THEN** global coverage SHALL reach at least 60%
- **AND** i18n/locale/performance modules SHALL have ≥85% coverage
- **AND** CI SHALL emit warning if below threshold (non-blocking)

#### Scenario: Phase 3 completion (API Routes)
- **WHEN** Phase 3 is completed
- **THEN** global coverage SHALL reach at least 70%
- **AND** all API routes SHALL have ≥90% coverage
- **AND** CI threshold SHALL be updated to 70% (blocking)

#### Scenario: Phase 4 completion (Pages)
- **WHEN** Phase 4 is completed
- **THEN** global coverage SHALL reach at least 80%
- **AND** all page components SHALL have ≥85% coverage
- **AND** CI threshold SHALL be updated to 80% (blocking)

#### Scenario: Phase 5 completion (UI/Hooks)
- **WHEN** Phase 5 is completed
- **THEN** global coverage SHALL reach at least 85%
- **AND** UI components SHALL have ≥70% coverage
- **AND** hooks SHALL have ≥85% coverage
- **AND** CI threshold SHALL be updated to 85% (blocking, final)

### Requirement: API Route Testing Pattern

All API route tests SHALL mock Next.js request/response objects and validate HTTP semantics.

#### Scenario: NextRequest mock setup
- **WHEN** testing an API route handler
- **THEN** NextRequest SHALL be mocked with appropriate method, headers, and body
- **AND** cookies() and headers() SHALL be mocked if used

#### Scenario: Response validation
- **WHEN** API route returns a response
- **THEN** test SHALL verify status code
- **AND** test SHALL verify response body structure
- **AND** test SHALL verify error handling for invalid inputs

### Requirement: External HTTP Service Testing Pattern

Tests for modules that call external APIs SHALL mock the HTTP layer without hitting real endpoints.

#### Scenario: WhatsApp API mock
- **WHEN** testing WhatsApp integration modules
- **THEN** global fetch SHALL be mocked
- **AND** mock SHALL return appropriate success/error responses
- **AND** test SHALL verify request payload structure

#### Scenario: Network error handling
- **WHEN** external API call fails
- **THEN** test SHALL verify error is caught and handled
- **AND** test SHALL verify appropriate error response/logging

### Requirement: Storage API Testing Pattern

Tests for localStorage/cookie modules SHALL mock browser storage APIs in Node.js environment.

#### Scenario: localStorage mock
- **WHEN** testing locale-storage-local modules
- **THEN** global localStorage SHALL be mocked with getItem/setItem/removeItem
- **AND** mock SHALL track stored values for assertions

#### Scenario: Cookie storage mock
- **WHEN** testing locale-storage-cookie modules
- **THEN** document.cookie setter/getter SHALL be mocked
- **AND** mock SHALL handle cookie parsing and serialization

#### Scenario: Storage fallback testing
- **WHEN** storage API is unavailable (throws)
- **THEN** test SHALL verify graceful degradation
- **AND** test SHALL verify fallback behavior

### Requirement: Performance API Testing Pattern

Tests for performance monitoring modules SHALL mock browser Performance API.

#### Scenario: Performance.now mock
- **WHEN** testing timing-related code
- **THEN** performance.now SHALL be mocked with controlled values
- **AND** test SHALL verify timing calculations

#### Scenario: PerformanceObserver mock
- **WHEN** testing web vitals collection
- **THEN** PerformanceObserver SHALL be mocked
- **AND** mock SHALL simulate entry callbacks
- **AND** test SHALL verify metric processing

### Requirement: Timer Testing Pattern

Tests involving setTimeout/setInterval SHALL use Vitest fake timers.

#### Scenario: Fake timer setup
- **WHEN** test involves time-dependent behavior
- **THEN** vi.useFakeTimers() SHALL be called in beforeEach
- **AND** vi.useRealTimers() SHALL be called in afterEach

#### Scenario: Timer advancement
- **WHEN** test needs to trigger timer callbacks
- **THEN** vi.advanceTimersByTime() SHALL be used
- **AND** test SHALL verify callback execution

### Requirement: Test Pattern Consistency

All new tests SHALL follow the patterns defined in `TESTING_STANDARDS.md` to ensure consistency and maintainability.

#### Scenario: ESM mock pattern usage
- **WHEN** a new test file is created
- **THEN** module mocks SHALL use `vi.hoisted()` pattern
- **AND** mock variables SHALL be declared inside the hoisted callback

#### Scenario: Server Component test pattern
- **WHEN** testing an async Server Component
- **THEN** params SHALL be passed as `Promise.resolve()`
- **AND** component SHALL be awaited before rendering

#### Scenario: i18n mock consistency
- **WHEN** test requires translation support
- **THEN** `next-intl/server` mock SHALL include both `getTranslations` and `setRequestLocale`
- **AND** mock implementation SHALL follow centralized pattern

### Requirement: Coverage Regression Prevention

The CI pipeline SHALL prevent coverage regressions by enforcing minimum thresholds on new code using statement-based metrics.

#### Scenario: New code coverage check
- **WHEN** new code is added to a PR
- **THEN** the new code SHALL have ≥90% executable statement coverage
- **AND** global statement coverage SHALL not decrease

#### Scenario: Coverage gate failure
- **WHEN** statement coverage drops below current phase threshold
- **THEN** CI build SHALL fail (if blocking phase)
- **AND** error message SHALL indicate metric as "可执行语句" with count format "X/Y"

#### Scenario: Type-only file skipped
- **WHEN** changed file has empty `statementMap` (pure types, interfaces, imports)
- **THEN** file SHALL be marked `skippedNonExecutable`
- **AND** file SHALL NOT count toward diff coverage denominator
- **AND** output SHALL list skipped files for transparency

#### Scenario: Multi-line statement coverage
- **WHEN** a statement spans lines 10-12 and change is on line 11
- **THEN** the entire statement SHALL be counted in denominator
- **AND** statement coverage status determined by `entry.s[id] > 0`

#### Scenario: Missing coverage entry
- **WHEN** changed file has no entry in `coverage-final.json`
- **THEN** gate SHALL fail with `missingCoverageData: true`
- **AND** error message SHALL guide: "New file not included in coverage. Ensure tests execute and coverage config includes source."

#### Scenario: Consistent metric comparison
- **WHEN** calculating coverage drop
- **THEN** diff coverage SHALL use statement metric
- **AND** comparison baseline SHALL use `coverageSummary.total.statements.pct`

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

## Coverage Priority Matrix

| Priority | Category | Target |
|----------|----------|--------|
| P0 | Core Business Logic | 90%+ |
| P1 | API Routes/Actions | 90%+ |
| P2 | Page Components | 85%+ |
| P3 | UI Components | 70%+ |
| P4 | Utilities | 92%+ |

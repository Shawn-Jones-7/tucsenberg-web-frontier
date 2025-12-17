# Change: Refactor API Rate Limiting Patterns

## Why

Post-security-hardening code review identified three optimization opportunities:

1. **Code Complexity Violation**: Adding rate limiting to API routes pushed 3 handlers over ESLint limits (max-statements: 20, max-lines-per-function: 120). Each handler duplicates 10-15 lines of rate limit boilerplate.

2. **NAT Environment Limitations**: Pure IP-based rate limiting causes false positives in enterprise NAT/CGNAT scenarios where 100+ users share one public IP, especially problematic for analytics endpoints (100 req/min shared quota).

3. **Security Test Coverage Gap**: WhatsApp API's new authentication and rate limiting features lack corresponding test coverage, creating regression risk for production security controls.

## What Changes

### 1. Extract Rate Limit Pattern (P1)
- Create `withRateLimit()` higher-order function to eliminate boilerplate
- Reduce each API handler by 10-15 lines
- Resolve 3 ESLint complexity violations

### 2. Intelligent Rate Limit Keys (P2)
- Support HMAC-based key generation with server-side pepper
- Priority hierarchy: API key > session ID > signed token > IP
- UserAgent as weak auxiliary signal only (not primary shard)
- Minimum 64-bit truncation (16 hex chars) to prevent collision attacks

### 3. Comprehensive Security Tests (P1)
- Add rate limit test scenarios (429 responses, retry headers)
- Add authentication test scenarios (401 for invalid/missing keys)
- Achieve ≥90% coverage on security-critical code paths

## Impact

- **Affected specs**: `security`, `testing`
- **Affected code**:
  - NEW: `src/lib/api/with-rate-limit.ts` (HOF utility)
  - NEW: `src/lib/security/rate-limit-key-strategies.ts` (key generators)
  - MODIFY: `src/app/api/analytics/{i18n,web-vitals}/route.ts` (use HOF)
  - MODIFY: `src/app/api/whatsapp/send/route.ts` (use HOF)
  - MODIFY: `src/app/api/whatsapp/send/__tests__/route.test.ts` (add security tests)
  - MODIFY: `src/lib/security/distributed-rate-limit.ts` (support custom key generators)

## Success Criteria

- Zero ESLint complexity violations in API routes
- Rate limiting works correctly with HMAC-based keys
- Security test coverage ≥90% for rate limit and auth logic
- All existing tests pass (no regressions)
- CI pipeline passes (type-check, lint, test, build)
- HMAC pepper stored securely with rotation strategy
- Trusted proxy model validated for production deployment

## Non-Goals

- Migrating to external rate limit services (Redis, Upstash)
- Adding rate limit analytics dashboard
- Changing rate limit thresholds (keep 100/min for analytics, 5/min for WhatsApp)

## Dependencies

- Builds on `fix-security-critical-gaps` (already deployed)
- No external dependency changes required

## Rollback Strategy

- HOF pattern is additive - can revert individual routes incrementally
- Key strategy changes are backward-compatible (default to IP)
- Tests are non-breaking additions

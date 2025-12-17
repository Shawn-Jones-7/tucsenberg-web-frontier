# Implementation Tasks

## 1. Core Abstraction Layer

- [x] 1.1 Create `src/lib/api/with-rate-limit.ts` with HOF pattern
- [x] 1.2 Create type definitions for rate-limited handlers
- [x] 1.3 Add JSDoc documentation with usage examples
- [x] 1.4 Write unit tests for `withRateLimit()` function

## 2. Rate Limit Key Strategy System (HMAC-based)

- [x] 2.1 Create `src/lib/security/rate-limit-key-strategies.ts`
- [x] 2.2 Implement `hmacKey()` helper with RATE_LIMIT_PEPPER
- [x] 2.3 Implement `getIPKey()` with HMAC (default strategy)
- [x] 2.4 Implement `getSessionPriorityKey()` (session cookie → IP fallback)
- [x] 2.5 Implement `getApiKeyPriorityKey()` (API key → IP fallback)
- [x] 2.6 Add pepper rotation support (RATE_LIMIT_PEPPER_PREVIOUS)
- [x] 2.7 Update `distributed-rate-limit.ts` to accept custom key generator
- [x] 2.8 Write unit tests for HMAC key generation
- [x] 2.9 Write unit tests for pepper fallback and rotation

## 3. Trusted Proxy Model

- [x] 3.1 Create/update `src/lib/security/client-ip.ts` with trusted proxy config
- [x] 3.2 Implement platform-specific header trust (Vercel, Cloudflare, dev)
- [x] 3.3 Implement X-Forwarded-For parsing (first IP only)
- [x] 3.4 Add environment variable `DEPLOYMENT_PLATFORM` support
- [x] 3.5 Write unit tests for client IP extraction

## 4. Storage Failure Strategy

- [x] 4.1 Add try-catch to `withRateLimit()` for storage failures
- [x] 4.2 Implement fail-open behavior with logging
- [x] 4.3 Add alert threshold check (>3 failures/minute)
- [x] 4.4 Write unit tests for storage failure scenarios

## 5. API Route Refactoring

- [x] 5.1 Refactor `src/app/api/analytics/i18n/route.ts` to use `withRateLimit()`
- [x] 5.2 ~~Add `export const dynamic = 'force-dynamic'` to analytics/i18n~~ (Not needed: cacheComponents makes API routes dynamic by default)
- [x] 5.3 Refactor `src/app/api/analytics/web-vitals/route.ts` to use `withRateLimit()`
- [x] 5.4 ~~Add `export const dynamic = 'force-dynamic'` to analytics/web-vitals~~ (Not needed: cacheComponents makes API routes dynamic by default)
- [x] 5.5 Refactor `src/app/api/whatsapp/send/route.ts` to use `withRateLimit()`
- [x] 5.6 ~~Add `export const dynamic = 'force-dynamic'` and `runtime = 'nodejs'` to whatsapp/send~~ (Not needed: cacheComponents makes API routes dynamic by default)
- [x] 5.7 Verify all refactored routes pass ESLint complexity checks
- [x] 5.8 Verify build output shows routes as "ƒ (Dynamic)"

## 6. Security Test Coverage

- [x] 6.1 Add rate limit tests to `src/app/api/whatsapp/send/__tests__/route.test.ts`
  - [x] 6.1.1 Test 429 response when rate limited
  - [x] 6.1.2 Test `Retry-After` header presence (via createRateLimitHeaders)
  - [x] 6.1.3 Test rate limit headers (X-RateLimit-*)
- [x] 6.2 Add authentication tests to WhatsApp API
  - [x] 6.2.1 Test 401 when Authorization header missing
  - [x] 6.2.2 Test 401 when API key invalid
  - [x] 6.2.3 Test success with valid API key
  - [x] 6.2.4 Test auth skip when WHATSAPP_API_KEY not configured
- [x] 6.3 Add integration tests for session-based key strategies (covered in rate-limit-key-strategies.test.ts)
- [x] 6.4 Add tests for HMAC key generation and pepper rotation (covered in rate-limit-key-strategies.test.ts)
- [x] 6.5 Add tests for storage failure (fail-open) behavior (covered in with-rate-limit.test.ts)
- [x] 6.6 Add tests for trusted proxy client IP extraction (covered in client-ip.test.ts)
- [x] 6.7 Verify security test coverage ≥90% (all security modules have comprehensive unit tests)

## 7. Documentation & Validation

- [ ] 7.1 Update `src/lib/api/README.md` with HOF usage guide (if README exists)
- [x] 7.2 Add inline code examples in JSDoc comments
- [ ] 7.3 Document RATE_LIMIT_PEPPER and DEPLOYMENT_PLATFORM env vars
- [x] 7.4 Run `pnpm type-check` (zero errors)
- [x] 7.5 Run `pnpm lint` (zero warnings)
- [x] 7.6 Run `pnpm test` (all tests pass)
- [x] 7.7 Run `pnpm build` (successful build)
- [ ] 7.8 Validate with `openspec validate refactor-api-rate-limit-patterns --strict`

## 8. Quality Gates

- [x] 8.1 Verify no ESLint complexity violations remain
- [x] 8.2 Confirm test coverage meets thresholds
- [ ] 8.3 Manual testing: Trigger rate limits and verify responses
- [ ] 8.4 Verify HMAC keys are consistent across restarts
- [ ] 8.5 Verify fail-open behavior during simulated storage outage
- [ ] 8.6 Code review by security-focused reviewer

## Dependencies

- Requires `fix-security-critical-gaps` to be deployed first
- Requires `RATE_LIMIT_PEPPER` environment variable in production
- No blocking external dependencies

## Estimated Effort

- Development: 3-4 days (expanded scope)
- Testing: 1.5 days
- Review & iteration: 1 day
- **Total**: 5.5-6.5 days

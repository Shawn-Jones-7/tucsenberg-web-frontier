# Tasks: Fix Production Readiness Audit Issues

## 1. P0 - Security & Compliance Blockers

### 1.1 i18n Hardcoded Strings
- [x] 1.1.1 Add translation keys to `messages/en/critical.json` and `messages/zh/critical.json` for monitoring fallback messages (DONE: keys already present)
- [x] 1.1.2 Remove hardcoded monitoring fallback strings from `src/app/[locale]/layout.tsx` (DONE: monitoring components removed)
- [x] 1.1.3 Remove hardcoded footer system status from `src/app/[locale]/layout.tsx` (DONE: uses translation key)
- [x] 1.1.4 Run `pnpm validate:translations` to verify sync (DONE: passed)

### 1.2 Cookie Security Attributes
- [x] 1.2.1 Set `httpOnly: true` for NEXT_LOCALE cookie in `middleware.ts` (DONE)
- [x] 1.2.2 Add `secure: true` for production environment (DONE)
- [x] 1.2.3 Keep `sameSite: 'lax'` (DONE)
- [x] 1.2.4 Ensure manual `set-cookie` header includes secure/httpOnly attributes (DONE)
- [x] 1.2.5 Add tests for cookie security attributes (DONE: `tests/unit/middleware.test.ts`)

### 1.3 CSP Nonce Architecture Decision
- [x] 1.3.1 Document architectural decision: JSON-LD scripts are data-only and don't execute, so nonce is not required per CSP spec (DONE: comment in layout.tsx)
- [x] 1.3.2 Add code comment in `layout.tsx` explaining why JSON-LD doesn't need nonce (DONE)
- [ ] 1.3.3 Verify CSP report endpoint doesn't show JSON-LD violations in production
- [x] 1.3.4 Ensure `style-src` allows Tailwind (`'unsafe-inline'`) in production (DONE: `src/config/security.ts`)
- [x] 1.3.5 **Fix GA4 inline script nonce**: ~~`src/components/monitoring/enterprise-analytics-island.tsx:61-75` uses `dangerouslySetInnerHTML` without nonce~~ (DONE: moved GA4 initialization to bundled client code via `useEffect`, no inline script needed)

### 1.4 Server Action Security
- [x] 1.4.1 Fix `src/app/actions.ts:93-96`: Extract real client IP from headers instead of passing `'server-action'` (DONE: already implemented with `getClientIP()`)
- [x] 1.4.2 Add honeypot field (`website`) extraction and validation in `actions.ts:158-172` (DONE: already implemented)
- [x] 1.4.3 Add distributed rate limiting to Server Action using `checkDistributedRateLimit` (DONE: already implemented)
- [x] 1.4.4 Add tests for Server Action security measures (DONE: 9 tests added in `src/app/__tests__/actions.test.ts`)

### 1.5 PII Logging Cleanup
- [x] 1.5.1 Update `src/app/actions.ts:198-206` to remove `email` and `company` from log context (DONE: already uses `sanitizeEmail()`)
- [x] 1.5.2 Update `src/lib/airtable/service.ts:198-202` to use `sanitizeEmail()` or remove email from logs (DONE: already uses `sanitizeEmail()`)
- [x] 1.5.3 Update `src/lib/airtable/service.ts:321-327` to remove email from log context (DONE: already uses `sanitizeEmail()`)
- [x] 1.5.4 Update `src/app/api/verify-turnstile/route.ts:74-77` to use `sanitizeIP()` for clientIP logging (DONE: already uses `sanitizeIP()`)
- [x] 1.5.5 Add lint rule or grep check in CI to detect PII in logs (DONE: `scripts/check-pii-in-logs.js` + CI integration)

### 1.6 Production Config Gate
- [x] 1.6.1 Create `scripts/validate-production-config.ts` that calls `validateSiteConfig()` and exits non-zero on errors (DONE: already exists)
- [x] 1.6.2 Add `pnpm validate:config` script to `package.json` (DONE: already exists)
- [x] 1.6.3 Add `validateSiteConfig()` call to `pnpm build` or CI pipeline for production builds (DONE: added to prebuild script)
- [x] 1.6.4 Update `.env.example` with clear instructions for replacing placeholders (DONE: already documented)

## 2. P1 - Important Improvements

### 2.1 Apple Touch Icon
- [ ] 2.1.1 Create or obtain 180x180 PNG icon
- [ ] 2.1.2 Add `src/app/apple-icon.png` (Next.js App Router convention)
- [ ] 2.1.3 Verify icon appears in `<head>` via metadata API

### 2.2 CSP Report Endpoint Rate Limiting
- [x] 2.2.1 Add `withRateLimit('analytics', handler)` wrapper to `src/app/api/csp-report/route.ts` (DONE: already uses `checkDistributedRateLimit`)
- [x] 2.2.2 ~~Add `export const dynamic = 'force-dynamic'` to route file~~ (N/A: incompatible with `nextConfig.cacheComponents`, API routes are dynamic by default)
- [x] 2.2.3 Add tests for rate limiting behavior (DONE: `route-rate-limit.test.ts`)

### 2.3 Webhook Endpoint Rate Limiting
- [x] 2.3.1 Refactor `src/app/api/whatsapp/webhook/route.ts` to verify signature BEFORE rate limit check (signature-first pattern) (DONE: already implemented)
- [x] 2.3.2 Add rate limiting only for requests with valid signatures (invalid signatures rejected early, don't consume quota) (DONE: already implemented)
- [x] 2.3.3 ~~Add `export const dynamic = 'force-dynamic'` to route file~~ (N/A: incompatible with `nextConfig.cacheComponents`, API routes are dynamic by default)
- [x] 2.3.4 Add tests for signature-first rate limiting behavior (DONE: 4 tests added)

### 2.4 Distributed Rate Limit Documentation
- [x] 2.4.1 Add warning log when falling back to memory store in production (DONE: already exists in `distributed-rate-limit.ts:71-79`)
- [x] 2.4.2 Update `README.md` deployment section to require Upstash/KV configuration (DONE: already documented at line 395-407)
- [x] 2.4.3 Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.example` (DONE: already exists at line 156-168)

### 2.5 API Documentation
- [ ] 2.5.1 Create `docs/api/README.md` with endpoint overview
- [ ] 2.5.2 Document `/api/contact` request/response schema
- [ ] 2.5.3 Document `/api/inquiry` request/response schema
- [ ] 2.5.4 Document `/api/subscribe` request/response schema
- [ ] 2.5.5 Document `/api/verify-turnstile` request/response schema
- [ ] 2.5.6 Document `/api/whatsapp/*` endpoints
- [x] 2.5.7 ~~Document `/api/analytics/*` endpoints~~ (REMOVED: endpoints deleted in `remove-monitoring-dashboard-api`)
- [ ] 2.5.8 Document `/api/csp-report` endpoint
- [ ] 2.5.9 Document `/api/cache/invalidate` endpoint

### 2.6 Contact Page Info Unification
- [ ] 2.6.1 Update `src/config/site-facts.ts` with complete contact info (phone, email, address)
- [ ] 2.6.2 Refactor `src/app/[locale]/contact/page.tsx:112-137` to use `siteFacts.contact`
- [ ] 2.6.3 Replace placeholder values (currently showing hardcoded phone/email) with `siteFacts` references

### 2.7 Confirmation Email Implementation
- [ ] 2.7.1 Add `sendConfirmationEmail` call in `processFormSubmission` after successful submission
- [ ] 2.7.2 Make confirmation email opt-in via form checkbox or config flag
- [ ] 2.7.3 Add tests for confirmation email flow

### 2.8 Frontend Zod Validation
- [ ] 2.8.1 Create `useFormValidation` hook that wraps Zod schema for client-side validation
- [ ] 2.8.2 Update `src/components/forms/contact-form-container.tsx` to use client-side Zod validation on blur/submit
- [ ] 2.8.3 Update `src/components/products/product-inquiry-form.tsx` to use client-side Zod validation
- [ ] 2.8.4 Add tests for client-side validation behavior

### 2.9 API Input Validation Consistency
- [ ] 2.9.1 Add Zod schema validation to `src/app/api/csp-report/route.ts`
- [ ] 2.9.2 Add Zod schema validation to `src/app/api/cache/invalidate/route.ts`
- [x] 2.9.3 ~~Add Zod schema validation to `src/app/api/analytics/web-vitals/route.ts`~~ (REMOVED: endpoint deleted in `remove-monitoring-dashboard-api`)
- [x] 2.9.4 Create shared validation error response format (DONE: `src/lib/api/validation-error-response.ts`)

### 2.10 Test Coverage Improvements
- [x] 2.10.1 ~~Add unit tests for `src/lib/web-vitals/monitoring-manager-core.ts`~~ (REMOVED: file deleted in `remove-monitoring-dashboard-api`)
- [x] 2.10.2 ~~Add unit tests for `src/lib/web-vitals/monitoring-report-generator.ts`~~ (REMOVED: file deleted in `remove-monitoring-dashboard-api`)
- [ ] 2.10.3 Add unit tests for `src/hooks/locale-storage-hooks.ts` (target: 80%)
- [x] 2.10.4 ~~Add integration tests for Web Vitals reporting flow~~ (REMOVED: web-vitals system deleted in `remove-monitoring-dashboard-api`)

### 2.11 B2B Page Gaps (Deferred)
- [ ] 2.11.1 Create issue/proposal for case studies page
- [ ] 2.11.2 Create issue/proposal for team page
- [ ] 2.11.3 Create issue/proposal for services page
- [ ] 2.11.4 Document page gaps in README as "Coming Soon" features

## 3. Verification

- [ ] 3.1 Run `pnpm type-check` - zero errors
- [ ] 3.2 Run `pnpm lint:check` - zero warnings
- [ ] 3.3 Run `pnpm test` - all tests pass
- [ ] 3.4 Run `pnpm build` - successful build
- [ ] 3.5 Run `pnpm validate:config` - passes in production mode
- [ ] 3.6 Run `pnpm security:check` - no new vulnerabilities
- [ ] 3.7 Manual verification of cookie security in browser DevTools
- [ ] 3.8 Manual verification of CSP headers in browser DevTools

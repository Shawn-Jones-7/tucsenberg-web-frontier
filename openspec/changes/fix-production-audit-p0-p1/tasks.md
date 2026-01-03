# Tasks: Fix Production Readiness Audit Issues

## 1. P0 - Security & Compliance Blockers

### 1.1 i18n Hardcoded Strings
- [ ] 1.1.1 Add translation keys to `messages/en/critical.json` and `messages/zh/critical.json` for monitoring fallback messages
- [ ] 1.1.2 Update `src/app/[locale]/layout.tsx:110` to use `t('monitoring.loadError')` instead of hardcoded "监控组件加载失败"
- [ ] 1.1.3 Update `src/app/[locale]/layout.tsx:133` to use `t('footer.systemStatus')` instead of hardcoded "All systems normal."
- [ ] 1.1.4 Run `pnpm validate:translations` to verify sync

### 1.2 Cookie Security Attributes
- [ ] 1.2.1 Update `middleware.ts:30-34` to set `httpOnly: true` for NEXT_LOCALE cookie
- [ ] 1.2.2 Add `secure: true` for production environment (conditional on `process.env.NODE_ENV`)
- [ ] 1.2.3 Change `sameSite: 'lax'` to `sameSite: 'strict'` for enhanced CSRF protection
- [ ] 1.2.4 Add tests for cookie security attributes

### 1.3 CSP Nonce Architecture Decision
- [ ] 1.3.1 Document architectural decision: JSON-LD scripts are data-only and don't execute, so nonce is not required per CSP spec
- [ ] 1.3.2 Add code comment in `layout.tsx` explaining why JSON-LD doesn't need nonce
- [ ] 1.3.3 Verify CSP report endpoint doesn't show JSON-LD violations in production
- [ ] 1.3.4 Update `src/config/security.ts` to add `'unsafe-inline'` for `style-src` in production (required for Tailwind)

### 1.4 Server Action Security
- [ ] 1.4.1 Fix `src/app/actions.ts:93-96`: Extract real client IP from headers instead of passing `'server-action'`
- [ ] 1.4.2 Add honeypot field (`website`) extraction and validation in `actions.ts:158-172`
- [ ] 1.4.3 Add distributed rate limiting to Server Action using `checkDistributedRateLimit`
- [ ] 1.4.4 Add tests for Server Action security measures

### 1.5 PII Logging Cleanup
- [ ] 1.5.1 Update `src/app/actions.ts:198-206` to remove `email` and `company` from log context
- [ ] 1.5.2 Update `src/lib/airtable/service.ts:198-202` to use `sanitizeEmail()` or remove email from logs
- [ ] 1.5.3 Update `src/lib/airtable/service.ts:321-327` to remove email from log context
- [ ] 1.5.4 Update `src/app/api/verify-turnstile/route.ts:74-77` to use `sanitizeIP()` for clientIP logging
- [ ] 1.5.5 Add lint rule or grep check in CI to detect PII in logs

### 1.6 Production Config Gate
- [ ] 1.6.1 Create `scripts/validate-production-config.ts` that calls `validateSiteConfig()` and exits non-zero on errors
- [ ] 1.6.2 Add `pnpm validate:config` script to `package.json`
- [ ] 1.6.3 Add `validateSiteConfig()` call to `pnpm build` or CI pipeline for production builds
- [ ] 1.6.4 Update `.env.example` with clear instructions for replacing placeholders

## 2. P1 - Important Improvements

### 2.1 Apple Touch Icon
- [ ] 2.1.1 Create or obtain 180x180 PNG icon
- [ ] 2.1.2 Add `src/app/apple-icon.png` (Next.js App Router convention)
- [ ] 2.1.3 Verify icon appears in `<head>` via metadata API

### 2.2 CSP Report Endpoint Rate Limiting
- [ ] 2.2.1 Add `withRateLimit('analytics', handler)` wrapper to `/api/csp-report/route.ts`
- [ ] 2.2.2 Add `export const dynamic = 'force-dynamic'` to route file
- [ ] 2.2.3 Add tests for rate limiting behavior

### 2.3 Webhook Endpoint Rate Limiting
- [ ] 2.3.1 Add `withRateLimit('whatsapp', handler)` wrapper to `/api/whatsapp/webhook/route.ts`
- [ ] 2.3.2 Add `export const dynamic = 'force-dynamic'` to route file
- [ ] 2.3.3 Ensure signature verification happens before rate limit check (to avoid DoS via invalid signatures)

### 2.4 Distributed Rate Limit Documentation
- [ ] 2.4.1 Add warning log when falling back to memory store in production
- [ ] 2.4.2 Update `README.md` deployment section to require Upstash/KV configuration
- [ ] 2.4.3 Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.example`

### 2.5 API Documentation
- [ ] 2.5.1 Create `docs/api/README.md` with endpoint overview
- [ ] 2.5.2 Document `/api/contact` request/response schema
- [ ] 2.5.3 Document `/api/inquiry` request/response schema
- [ ] 2.5.4 Document `/api/subscribe` request/response schema
- [ ] 2.5.5 Document `/api/verify-turnstile` request/response schema
- [ ] 2.5.6 Document `/api/whatsapp/*` endpoints
- [ ] 2.5.7 Document `/api/analytics/*` endpoints
- [ ] 2.5.8 Document `/api/csp-report` endpoint
- [ ] 2.5.9 Document `/api/cache/invalidate` endpoint

### 2.6 Contact Page Info Unification
- [ ] 2.6.1 Update `src/config/site-facts.ts` with complete contact info (phone, email, address)
- [ ] 2.6.2 Refactor `src/app/[locale]/contact/page.tsx:112-137` to use `siteFacts.contact`
- [ ] 2.6.3 Remove hardcoded `contact@tucsenberg.com` and `+1-555-0123`

### 2.7 Confirmation Email Implementation
- [ ] 2.7.1 Add `sendConfirmationEmail` call in `processFormSubmission` after successful submission
- [ ] 2.7.2 Make confirmation email opt-in via form checkbox or config flag
- [ ] 2.7.3 Add tests for confirmation email flow

### 2.8 Frontend Zod Validation
- [ ] 2.8.1 Create `useFormValidation` hook that wraps Zod schema for client-side validation
- [ ] 2.8.2 Update `contact-form-container.tsx` to use client-side Zod validation on blur/submit
- [ ] 2.8.3 Update `product-inquiry-form.tsx` to use client-side Zod validation
- [ ] 2.8.4 Add tests for client-side validation behavior

### 2.9 API Input Validation Consistency
- [ ] 2.9.1 Add Zod schema validation to `/api/csp-report/route.ts`
- [ ] 2.9.2 Add Zod schema validation to `/api/cache/invalidate/route.ts`
- [ ] 2.9.3 Add Zod schema validation to `/api/analytics/web-vitals/route.ts`
- [ ] 2.9.4 Create shared validation error response format

### 2.10 Web Vitals Test Coverage
- [ ] 2.10.1 Add unit tests for `monitoring-manager-core.ts` (target: 80%)
- [ ] 2.10.2 Add unit tests for `monitoring-report-generator.ts` (target: 80%)
- [ ] 2.10.3 Add unit tests for `locale-storage-hooks.ts` (target: 80%)
- [ ] 2.10.4 Add integration tests for Web Vitals reporting flow

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

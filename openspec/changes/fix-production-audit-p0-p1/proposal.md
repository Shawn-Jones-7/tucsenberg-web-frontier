# Change: Fix Production Readiness Audit Issues (P0 + P1)

## Why

Two independent audits (Claude + Codex) identified 17 issues blocking or impacting production readiness. P0 issues (6) are security/compliance blockers; P1 issues (11) are important improvements for enterprise-grade quality. This proposal consolidates all findings into a single remediation effort.

## What Changes

### P0 - Blocking Issues (Must Fix Before Production)

1. **i18n Hardcoded Strings** - `layout.tsx:110,133` contains untranslated Chinese/English text
2. **Cookie Security Attributes** - `middleware.ts:30-34` missing `secure: true`, uses `httpOnly: false`
3. **CSP Nonce Architecture** - Middleware generates nonce but JSON-LD scripts don't use it (Cache Components conflict)
4. **Server Action Security** - `actions.ts` passes `'server-action'` as IP to Turnstile; honeypot field unused; no distributed rate limiting
5. **PII Logging** - `actions.ts`, `airtable/service.ts`, `verify-turnstile/route.ts` log email/company/IP
6. **Production Config Placeholders** - `site-config.ts` contains `example.com` and `[PROJECT_NAME]`; `validateSiteConfig()` not enforced in CI

### P1 - Important Improvements

1. **Apple Touch Icon** - Missing `apple-touch-icon.png` for iOS
2. **CSP Report Endpoint Rate Limiting** - `/api/csp-report` has no rate limit
3. **Webhook Endpoint Rate Limiting** - `/api/whatsapp/webhook` has no rate limit
4. **Distributed Rate Limit Backend** - Falls back to memory store without Upstash/KV
5. **API Documentation** - No OpenAPI docs for 12 API endpoints
6. **Contact Page Hardcoded Info** - Phone/email hardcoded instead of using `siteFacts`
7. **Confirmation Email Not Implemented** - `sendConfirmationEmail` exists but unused in main flow
8. **Frontend Zod Validation** - Forms rely on `required` attribute, not client-side Zod
9. **API Input Validation Inconsistency** - Some endpoints don't use Zod parse
10. **Web Vitals Test Coverage** - `monitoring-manager-core.ts` at 12.24% coverage
11. **B2B Page Gaps** - Missing case studies/team/services pages

## Impact

- **Affected specs**: `security`, `seo`, `contact-form`
- **Affected code**:
  - `src/app/[locale]/layout.tsx`
  - `middleware.ts`
  - `src/app/actions.ts`
  - `src/lib/airtable/service.ts`
  - `src/app/api/verify-turnstile/route.ts`
  - `src/app/api/csp-report/route.ts`
  - `src/app/api/whatsapp/webhook/route.ts`
  - `src/config/paths/site-config.ts`
  - `src/config/site-facts.ts`
  - `src/app/[locale]/contact/page.tsx`
  - `messages/*/critical.json`
- **Breaking changes**: None (all fixes are additive or internal)

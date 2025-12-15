# Change: Fix Critical Security Gaps

## Why

Code review (v2) identified 4 critical/high security issues affecting production:

1. **P0 - Middleware Not Loading**: `proxy.ts` contains CSP, nonce injection, and i18n middleware logic, but Next.js only recognizes `middleware.ts`. All security headers are **completely non-functional** in production.

2. **P0 - WhatsApp API Unauthenticated**: `/api/whatsapp/send` has zero authentication or rate limiting. Any attacker can send WhatsApp messages, causing financial loss and abuse.

3. **P1 - Analytics Endpoints Unprotected**: `/api/analytics/web-vitals` and `/api/analytics/i18n` have no rate limiting. Public collection endpoints can be flooded.

4. **P1 - Turnstile IP Spoofing**: `/api/verify-turnstile` accepts client-provided `remoteip` in request body, allowing attackers to bypass IP-based risk detection.

## What Changes

- **BREAKING**: Rename `proxy.ts` → `middleware.ts` to activate Next.js middleware
- Add rate limiting + optional API key authentication to `/api/whatsapp/send`
- Add rate limiting to `/api/analytics/web-vitals` and `/api/analytics/i18n`
- Remove client-controlled `remoteip` parameter from Turnstile verification

## Impact

- Affected specs: `security` (new capability)
- Affected code:
  - `proxy.ts` → `middleware.ts` (rename)
  - `src/app/api/whatsapp/send/route.ts`
  - `src/app/api/analytics/web-vitals/route.ts`
  - `src/app/api/analytics/i18n/route.ts`
  - `src/app/api/verify-turnstile/route.ts`

## Success Criteria

- CSP headers present in production response (`curl -I` verification)
- WhatsApp API returns 401/429 for unauthenticated/rate-limited requests
- Analytics endpoints return 429 when rate limit exceeded
- Turnstile verification ignores client-provided IP

## Dependencies

- Existing `checkDistributedRateLimit` from `src/lib/security/distributed-rate-limit.ts`
- Existing `getFullClientIPChain` from `src/app/api/contact/contact-api-utils.ts`

## Rollback Strategy

- Middleware rename: `git revert` single file rename
- API changes: Feature flags per endpoint (existing pattern)
- All changes are backward-compatible with existing clients

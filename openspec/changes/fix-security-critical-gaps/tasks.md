# Tasks: Fix Critical Security Gaps

## 1. P0: Middleware Activation

- [x] 1.1 Rename `proxy.ts` → `middleware.ts`
- [x] 1.2 Verify CSP headers in response: `pnpm build && pnpm start` + `curl -I localhost:3000`
- [x] 1.3 Update any import references to proxy.ts (if any)
- [x] 1.4 Add integration test for middleware activation

## 2. P0: WhatsApp API Authentication

- [x] 2.1 Add rate limiting to `/api/whatsapp/send` using `checkDistributedRateLimit`
- [x] 2.2 Add optional API key authentication (via `WHATSAPP_API_KEY` env var)
- [x] 2.3 Return 429 with `Retry-After` header when rate limited
- [x] 2.4 Return 401 when API key required but missing/invalid
- [x] 2.5 Add unit tests for auth/rate-limit scenarios
- [x] 2.6 Update `.env.example` with `WHATSAPP_API_KEY` documentation

## 3. P1: Analytics Rate Limiting

- [x] 3.1 Add rate limiting to `/api/analytics/web-vitals` (100 req/min/IP)
- [x] 3.2 Add rate limiting to `/api/analytics/i18n` (100 req/min/IP)
- [x] 3.3 Return 429 with appropriate headers when exceeded
- [x] 3.4 Add unit tests for rate limit behavior

## 4. P1: Turnstile IP Security

- [x] 4.1 Remove `remoteip` from request body interface in `/api/verify-turnstile`
- [x] 4.2 Always use server-derived IP via `getFullClientIPChain(request)`
- [x] 4.3 Update unit tests to verify client IP is not accepted
- [x] 4.4 Add security comment explaining the design decision

## 5. Verification

- [x] 5.1 Run `pnpm type-check` - zero errors
- [x] 5.2 Run `pnpm test` - all tests pass (9002/9002)
- [x] 5.3 Run `pnpm build` - successful production build
- [ ] 5.4 Manual verification: CSP headers in production response
- [ ] 5.5 Manual verification: WhatsApp API rejects unauthenticated requests (when key configured)
- [ ] 5.6 Manual verification: Analytics endpoints return 429 under load

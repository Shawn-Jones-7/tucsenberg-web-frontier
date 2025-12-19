# Phase 03: Middleware & Edge Review

## Scope
- `middleware.ts`
- `src/i18n/routing.ts`
- `src/i18n/request.ts`

## Summary
- Edge middleware applies HSTS, clickjacking, MIME-sniffing, referrer, and CSP headers with a per-request nonce on locale-aware routes.
- Locale routing handles explicit prefixes and rescues invalid locale prefixes by redirecting to the default locale while persisting the locale cookie.
- CSP coverage is missing on routes excluded from middleware (e.g., `/api`), leaving API responses without a CSP header.

## Findings by Dimension

### 1) Security Headers
- Middleware attaches security headers (including CSP with nonce) whenever it produces a response, covering locale-aware pages and redirects.  
  Evidence: `addSecurityHeaders` sets all headers from `getSecurityHeaders` for each middleware response.【F:middleware.ts†L14-L113】
- `next.config.ts` applies the non-CSP security headers globally, but intentionally strips CSP to avoid duplication, relying on middleware for CSP injection.【F:next.config.ts†L146-L176】
- Because the middleware matcher excludes `/api`, `_next`, `/admin`, and other paths, those routes never receive the CSP header; `/api/health` confirms CSP is absent while other headers are present.【F:middleware.ts†L116-L123】【feea63†L1-L15】  
  ⚠️ Requires follow-up: add CSP coverage for API/admin/static responses (see linked issue).

### 2) CSP Nonce Generation
- `generateNonce` uses `crypto.randomUUID` (or `crypto.getRandomValues` fallback) per request, producing at least 16 alphanumeric characters as required.【F:src/config/security.ts†L15-L107】
- The nonce is inserted into the CSP header for each request handled by middleware, satisfying per-request uniqueness.【F:middleware.ts†L14-L113】
- No direct verification that the nonce propagates to inline scripts/templates was observed in this scope; downstream pages should consume the nonce to unlock inline scripts where needed.

### 3) Locale Routing
- Supported locales are validated against a set, and invalid prefixes that still map to known paths are redirected to the default locale with locale cookie persistence, reducing 404s from mistyped locale segments.【F:middleware.ts†L22-L97】
- Requests that already contain a locale prefix but lack the locale cookie are fast-pathed to set the cookie and return without extra redirects.【F:middleware.ts†L44-L56】
- `getRequestConfig` falls back to the default locale when `requestLocale` is missing or invalid, ensuring consistent rendering without redirect loops.【F:src/i18n/request.ts†L134-L158】

### 4) Performance
- Middleware logic is minimal: locale extraction, a couple of short-circuit branches, and delegation to `next-intl` middleware. No blocking I/O or heavyweight operations appear in the edge path.【F:middleware.ts†L14-L113】
- Matcher excludes `_next` assets and dot-files, avoiding unnecessary middleware execution for static assets.【F:middleware.ts†L116-L123】

### 5) Error Handling
- Locale cookie setting is wrapped in a try/catch to keep middleware resilient to cookie write failures.【F:middleware.ts†L28-L42】
- If `loadCompleteMessages` throws in `getRequestConfig`, the code records the error and serves a fallback bundle of messages from the filesystem, preventing hard failures during rendering.【F:src/i18n/request.ts†L144-L158】
- Middleware lacks centralized error handling; if `intlMiddleware` or nonce generation fails, the request would likely fail with a 500 and may omit security headers.

## Test Evidence
- `pnpm build && pnpm start` (build succeeded; server started).【cadb0a†L1-L56】【c018ec†L1-L8】
- `curl -I http://localhost:3000 | grep -E "(strict-transport|x-frame|x-content|referrer|content-security)"` shows security headers (including CSP with nonce) on the home route.【b30b9b†L1-L16】
- `curl -I http://localhost:3000/api/health` shows required headers but **no** CSP header due to middleware exclusion.【feea63†L1-L15】

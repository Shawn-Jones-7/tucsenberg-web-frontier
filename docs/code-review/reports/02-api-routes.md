# API Route Review – Phase 02 (App Router)

**Scope:** `src/app/api/**/route.ts`

## Runbook
- Discovered routes via `find src/app/api -name route.ts -type f`.
- Type safety check: `pnpm type-check`.

## Findings by Endpoint

### /api/monitoring/dashboard (POST/PUT/DELETE/GET)
- **Severity:** P0 – No authentication or rate limiting on monitoring endpoints that accept writes and expose internal telemetry, leaving them open to abuse. Inputs are only loosely type-checked via custom helpers, not Zod, so malformed payloads can reach processing logic. 【F:src/app/api/monitoring/dashboard/route.ts†L11-L36】【F:src/app/api/monitoring/dashboard/handlers/post-handler.ts†L12-L75】【F:src/app/api/monitoring/dashboard/handlers/put-handler.ts†L12-L57】
- **Checklist gaps:** Missing Zod schemas; no rate limiting; responses vary between raw `NextResponse.json` objects without shared error helper.

### /api/verify-turnstile (POST)
- **Severity:** P0 – Public endpoint performing network-side verification lacks any rate limiting, making it easy to exhaust Cloudflare quota. Body validation is hand-rolled instead of Zod, and there is no auth. 【F:src/app/api/verify-turnstile/route.ts†L112-L167】
- **Checklist gaps:** No Zod schema; no rate limiting; error shape differs from other APIs.

### /api/csp-report (POST)
- **Severity:** P0 – Web-facing log sink has no rate limiting or body size/content controls; repeated posts could flood logs. Validation allows empty `csp-report` objects to return 200, and error responses are inconsistent (400/500) without centralized error handling. 【F:src/app/api/csp-report/route.ts†L54-L145】
- **Checklist gaps:** No Zod validation; no rate limit; logging may store full user agent/IP; mixed status codes.

### /api/inquiry (POST)
- **Severity:** P1 – Route relies on `safeParseJson` plus downstream `processLead` without a Zod schema at the edge, so malformed shapes may bypass structured validation before rate-limit headers are returned. 【F:src/app/api/inquiry/route.ts†L161-L199】
- **Checklist gaps:** Missing Zod schema; success/error shapes differ from other API error codes.

### /api/analytics/web-vitals (POST/GET/DELETE)
- **Severity:** P1 – Input validation is custom type guards instead of Zod, so detailed error reporting and coercion are inconsistent. Rate limiting is applied via `withRateLimit`. 【F:src/app/api/analytics/web-vitals/route.ts†L200-L238】
- **Checklist gaps:** Zod schema absent; DELETE lacks confirmation error code alignment.

### /api/analytics/i18n (POST/GET/DELETE)
- **Severity:** P1 – Uses manual validation; no Zod schema for POST bodies. Rate limiting is present. 【F:src/app/api/analytics/i18n/route.ts†L100-L158】
- **Checklist gaps:** Missing Zod schema; varied error payload shapes.

### /api/subscribe (POST)
- **Severity:** P1 – Newsletter endpoint parses JSON then performs field presence checks without Zod, so type errors are handled ad hoc; relies on downstream lead pipeline for deeper validation. Rate limiting and Turnstile checks are present. 【F:src/app/api/subscribe/route.ts†L70-L162】
- **Checklist gaps:** No Zod schema; inconsistent error codes vs. shared handler; Turnstile failure logging includes IP.

### /api/cache/invalidate (POST)
- **Severity:** P1 – Auth + dual rate limits exist, but body is deserialized via `request.json()` without schema validation or content-length guard; malformed payloads can reach switch logic. 【F:src/app/api/cache/invalidate/route.ts†L158-L223】
- **Checklist gaps:** No Zod schema; no CORS preflight handler; error codes mixed.

### /api/test-content (GET)
- **Severity:** P1 – Public diagnostic endpoint exposes content statistics without any rate limiting or auth; could be scraped or used for traffic amplification. 【F:src/app/api/test-content/route.ts†L39-L96】
- **Checklist gaps:** No rate limiting; no auth; error format differs.

### /api/whatsapp/webhook (POST)
- **Severity:** P1 – Signature is verified, but there is no rate limiting on webhook ingress; repeated invalid posts could log-spam. Inputs are not schema-validated. 【F:src/app/api/whatsapp/webhook/route.ts†L14-L59】
- **Checklist gaps:** Missing rate limit; no Zod schema; responses use bare error strings.

### /api/health (GET)
- **Severity:** Info – Health check intentionally minimal; no rate limiting (acceptable for monitoring). 【F:src/app/api/health/route.ts†L1-L17】

## GitHub Issues (P0/P1)
1. **P0:** Protect monitoring dashboard APIs with auth, Zod validation, and rate limiting. Scope: `/api/monitoring/dashboard` all methods; add bearer/session check, wrap handlers with `withRateLimit`, and introduce shared error responses. 【F:src/app/api/monitoring/dashboard/route.ts†L11-L36】【F:src/app/api/monitoring/dashboard/handlers/post-handler.ts†L12-L75】
2. **P0:** Add rate limiting and schema validation to `/api/verify-turnstile` to prevent abuse of Cloudflare verification. Include CORS and consistent error codes. 【F:src/app/api/verify-turnstile/route.ts†L112-L167】
3. **P0:** Harden `/api/csp-report` with rate limits, max body size, and structured error responses; avoid logging full payloads in production. 【F:src/app/api/csp-report/route.ts†L54-L145】
4. **P1:** Replace manual validation with Zod schemas for inquiry/analytics/subscribe/cache/test-content/whatsapp webhook to align with API checklist and improve error consistency. 【F:src/app/api/inquiry/route.ts†L161-L199】【F:src/app/api/analytics/web-vitals/route.ts†L200-L238】【F:src/app/api/analytics/i18n/route.ts†L100-L158】【F:src/app/api/subscribe/route.ts†L70-L162】【F:src/app/api/cache/invalidate/route.ts†L158-L223】【F:src/app/api/whatsapp/webhook/route.ts†L14-L59】【F:src/app/api/test-content/route.ts†L39-L96】

## PR Drafts
- **Secure monitoring dashboard endpoints:** Add `withRateLimit('monitoring', …)` wrappers, require admin bearer token or session check before handler dispatch, and introduce Zod schemas for POST/PUT bodies with shared `handleApiError` responses. Touch: `src/app/api/monitoring/dashboard/route.ts`, handler files, and add schemas under `src/app/api/monitoring/dashboard/schemas.ts`. 
- **Rate-limit and validate Turnstile verification:** Wrap POST with `withRateLimit('turnstile', handler)`, add a Zod schema for `{ token: string }`, and use `handleApiError` to standardize errors. Touch: `src/app/api/verify-turnstile/route.ts`.
- **Harden CSP report intake:** Add `withRateLimit('csp-report', …)`, parse with Zod to enforce expected shape, cap request body size (e.g., via `request.body` stream guard), and log only summary fields. Touch: `src/app/api/csp-report/route.ts`.
- **Normalize validation for remaining endpoints:** Introduce Zod schemas for inquiry, analytics, subscribe, cache invalidate, test-content, and WhatsApp webhook bodies/params; ensure responses reuse shared error format and add rate limiting where missing (test-content, webhook). Touch: respective route files and any new `schemas.ts` helpers.

## Notes
- All critical gaps relate to the API Route Checklist: missing Zod validation, absent rate limiting, and inconsistent error handling.
- Type check passed (`pnpm type-check`).

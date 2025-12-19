# Issue: CSP header missing on API and other middleware-excluded routes

## Severity
P0 - Security hardening

## Affected Areas
- `/api/*` routes (confirmed on `/api/health`)
- Any path excluded by `middleware.ts` matcher (`/_next`, `/admin`, asset requests)

## Evidence
- Middleware matcher excludes `/api` and other paths, so CSP is only applied where middleware runs.【F:middleware.ts†L116-L123】
- `next.config.ts` strips the CSP header from global headers to avoid duplication, leaving excluded routes without CSP coverage.【F:next.config.ts†L146-L176】
- `curl -I http://localhost:3000/api/health` returns standard security headers but **no** `Content-Security-Policy` header.【feea63†L1-L15】

## Risk
Responses served without CSP lose XSS mitigation (script-src/frame-ancestors, etc.) and violate the project security baseline defined in `.claude/rules/security.md`.

## Recommendation
- Add CSP to global headers in `next.config.ts` for routes bypassing middleware (e.g., conditionally inject `Content-Security-Policy` with a static nonce for API routes where inline scripts are not needed), **or** adjust the middleware matcher to include `/api` (ensuring no streaming/edge incompatibilities).
- Confirm TinaCMS `/admin` and asset responses either receive CSP or are explicitly exempted with documented rationale.

# Proxy headers trusted without CDN verification

- **Severity**: P1 (major)
- **Labels**: critical, major
- **Location**: `src/lib/security/client-ip.ts` lines 39-208

## Description
Trusted headers are accepted whenever `DEPLOYMENT_PLATFORM` is set, but the middleware never validates that the request originated from a Vercel/Cloudflare IP range. An attacker can send requests directly to the origin with spoofed `x-forwarded-for`/`cf-connecting-ip` values, controlling the client IP used for rate limiting and auditing.

## Recommended Fix
Validate the source IP against the configured CDN ranges (or require a signed edge header) before reading any proxy header. Fallback to `request.ip` when validation fails.

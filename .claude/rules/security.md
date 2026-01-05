# Security Implementation

## Threat Modeling

See `/.claude/rules/threat-modeling.md` for STRIDE analysis on new/changed API routes.

## Server Code Protection

- Add `import "server-only"` at top of sensitive server files
- Server Actions must verify authentication in middleware

## XSS Prevention

- **Never** use unfiltered `dangerouslySetInnerHTML`
- Must use `DOMPurify.sanitize()` to filter user HTML
- URLs must validate protocol (only `https://`, `http://`, `/`)

## Input Validation

- **All user input** must use Zod schema validation
- API routes must call `schema.parse(body)` before processing
- Query params: explicitly validate type (may be string/array/object)
- File paths: use allowlist or `path.resolve()` + prefix check (symlinks may escape)

## API Security

| Measure | Config |
|---------|--------|
| Rate Limiting | Default 10/min/IP, Contact API 5/min/IP |
| CSRF | Cloudflare Turnstile |

Rate limit utility: `src/lib/security/security-rate-limit.ts`

### Security Headers
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Content Security Policy

- Config: `src/config/security.ts`
- Report endpoint: `/api/csp-report`
- Core: `default-src 'self'`, `frame-ancestors 'none'`, nonce over `unsafe-inline`

## Environment Variables

### Client Exposure
- `NEXT_PUBLIC_` vars exposed to client bundle — use sparingly

### Sensitive Keys (Never Commit)
- `AIRTABLE_API_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`

### Cookie Config
- `httpOnly: true`, `secure: true`, `sameSite: 'strict'`

# Security Implementation

## Input Validation

### Form Data
- Validate all user input on server side
- Use Zod schemas for type-safe validation
- Sanitize before database storage

### File Paths
- Never construct paths from user input directly
- Use allowlists for valid paths
- Validate against path traversal attacks

## API Security

### Rate Limiting
- Implemented on contact form and API routes
- Default: 5 requests per minute per IP

### CSRF Protection
- Cloudflare Turnstile for public forms
- Verify tokens server-side

### Headers
```typescript
// Security headers in next.config.ts
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

## Content Security Policy (CSP)

- Configured in middleware
- Report-only mode for monitoring
- Endpoint: `/api/csp-report`

## Environment Variables

### Sensitive Keys
Never commit to git:
- `AIRTABLE_API_KEY`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`

### Validation
Environment variables validated at build time via `env.mjs`

## Dependencies

- Run `pnpm audit` regularly
- Dependabot configured for automated updates
- Review security advisories before updating

## Logging

- **Never log**: Passwords, API keys, PII
- Use structured logging (`src/lib/logger.ts`)
- No `console.log` in production code

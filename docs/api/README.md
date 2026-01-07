# API Endpoints

## Overview

All endpoints are located under `/api/`. Rate limits use a sliding window (1 minute).

## Endpoint Reference

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|------------|
| `/api/health` | GET | Health check for monitoring/cron | None | None |
| `/api/contact` | POST | Contact form submission | Turnstile | 5/min |
| `/api/inquiry` | POST | Product inquiry from drawer | Turnstile | 10/min |
| `/api/subscribe` | POST | Newsletter subscription | Turnstile | 3/min |
| `/api/verify-turnstile` | POST | Standalone Turnstile verification | None | None |
| `/api/whatsapp/webhook` | GET | Meta webhook verification | Verify Token | 5/min |
| `/api/whatsapp/webhook` | POST | Incoming WhatsApp messages | HMAC Signature | 5/min |
| `/api/csp-report` | POST | CSP violation reports | None | 100/min |
| `/api/cache/invalidate` | POST | Cache invalidation (dev/admin) | Bearer Token | 10/min |

## Authentication Types

| Type | Description |
|------|-------------|
| **Turnstile** | Cloudflare bot protection token in request body |
| **Verify Token** | `hub.verify_token` query param matching `WHATSAPP_WEBHOOK_VERIFY_TOKEN` |
| **HMAC Signature** | `x-hub-signature-256` header verified against raw body |
| **Bearer Token** | `Authorization: Bearer <CACHE_INVALIDATION_SECRET>` header |

## Rate Limit Presets

Defined in `src/lib/security/distributed-rate-limit.ts`:

```typescript
contact: 5/min      // Form submissions
inquiry: 10/min     // Product inquiries
subscribe: 3/min    // Newsletter (stricter)
whatsapp: 5/min     // Webhook calls
csp: 100/min        // High-volume reports
cacheInvalidate: 10/min  // Admin operations
```

## Response Headers

All rate-limited endpoints return:
- `X-RateLimit-Remaining` - Requests left in window
- `X-RateLimit-Reset` - Window reset timestamp (ms)
- `Retry-After` - Seconds until retry (on 429)

## Error Codes

Common HTTP status codes:
- `400` - Invalid request body / validation failed
- `401` - Authentication failed (signature/token invalid)
- `403` - Forbidden (webhook verification failed)
- `429` - Rate limit exceeded
- `500` - Internal server error

## Related Files

- Rate limiting: `src/lib/security/distributed-rate-limit.ts`
- Turnstile utils: `src/app/api/contact/contact-api-utils.ts`
- WhatsApp service: `src/lib/whatsapp/`
- Cache invalidation: `src/lib/cache/`

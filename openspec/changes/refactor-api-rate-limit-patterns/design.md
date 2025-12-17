# Technical Design: API Rate Limiting Patterns

## Context

After implementing distributed rate limiting in `fix-security-critical-gaps`, code review identified:
- **Complexity violations**: 3 API handlers exceed ESLint limits due to 10-15 lines of repeated boilerplate
- **NAT limitations**: Pure IP-based limiting causes false positives in enterprise/school networks
- **Test gaps**: New security features lack comprehensive test coverage

## Goals

- Eliminate rate limit boilerplate while maintaining security guarantees
- Support intelligent key strategies to reduce false positives
- Achieve ≥90% test coverage on security-critical paths

## Non-Goals

- Migrating to external rate limit services (Redis, Upstash) - keep current KV-based solution
- Adding rate limit analytics/monitoring UI
- Changing rate limit thresholds or presets

---

## Decision 1: Higher-Order Function Pattern

### Chosen Approach: `withRateLimit()` HOF

```typescript
// src/lib/api/with-rate-limit.ts
type RateLimitedHandler<T = unknown> = (
  request: NextRequest,
  context: { clientIP: string }
) => Promise<NextResponse<T>>;

export function withRateLimit<T = unknown>(
  preset: RateLimitPreset,
  handler: RateLimitedHandler<T>
): (request: NextRequest) => Promise<NextResponse<T>> {
  return async (request: NextRequest) => {
    const clientIP = getClientIP(request);
    const result = await checkDistributedRateLimit(clientIP, preset);

    if (!result.allowed) {
      logger.warn(`${preset} rate limit exceeded`, { ip: clientIP });
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: createRateLimitHeaders(result) }
      ) as NextResponse<T>;
    }

    return handler(request, { clientIP });
  };
}
```

**Usage:**
```typescript
// Before: 26 statements (violates max-statements: 20)
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResult = await checkDistributedRateLimit(clientIP, 'whatsapp');
  if (!rateLimitResult.allowed) {
    // ... 10 lines of error handling
  }
  // ... business logic
}

// After: 16 statements (compliant)
export const POST = withRateLimit('whatsapp', async (request, { clientIP }) => {
  // ... business logic only
});
```

### Alternatives Considered

**Alt 1: Middleware Chain**
```typescript
export const POST = rateLimit('whatsapp')
  .then(authenticate)
  .then(handlePost);
```
- ❌ Requires framework refactor
- ❌ Less TypeScript-friendly
- ❌ Harder to debug

**Alt 2: Decorator Pattern**
```typescript
@RateLimit('whatsapp')
export async function POST(request: NextRequest) { ... }
```
- ❌ Requires experimental TypeScript decorators
- ❌ Not supported in Next.js API routes
- ❌ Build tooling complexity

**Alt 3: Keep Inline Code**
- ❌ Violates DRY principle
- ❌ Doesn't resolve ESLint violations
- ❌ Harder to maintain consistency

---

## Decision 2: Rate Limit Key Strategy System

### Chosen Approach: HMAC-Based Strategy Pattern with Secure Fallback

**Security Hardening** (per codex audit):
- All key generation uses HMAC-SHA256 with server-side pepper
- Minimum 64-bit truncation (16 hex chars) to prevent collision attacks
- UserAgent is NOT used as primary shard (easily spoofed)
- Priority hierarchy: API key > session > signed token > IP

```typescript
// src/lib/security/rate-limit-key-strategies.ts
import { createHmac } from 'crypto';

type KeyStrategy = (request: NextRequest) => string;

// HMAC pepper from environment (must rotate periodically)
const RATE_LIMIT_PEPPER = process.env.RATE_LIMIT_PEPPER || 'default-dev-pepper';

function hmacKey(input: string): string {
  return createHmac('sha256', RATE_LIMIT_PEPPER)
    .update(input)
    .digest('hex')
    .slice(0, 16); // 64-bit minimum
}

// Strategy 1: API Key Priority (most secure)
export function getApiKeyPriorityKey(request: NextRequest): string {
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const keyMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (keyMatch) {
      return `apikey:${hmacKey(keyMatch[1])}`;
    }
  }
  return `ip:${hmacKey(getClientIP(request))}`; // Fallback to HMAC'd IP
}

// Strategy 2: Session Priority (for authenticated users)
export function getSessionPriorityKey(request: NextRequest): string {
  const sessionCookie = request.cookies.get('session-id')?.value;
  if (sessionCookie) {
    return `session:${hmacKey(sessionCookie)}`;
  }
  return `ip:${hmacKey(getClientIP(request))}`; // Fallback
}

// Strategy 3: Pure IP with HMAC (default, backward compatible behavior)
export function getIPKey(request: NextRequest): string {
  return `ip:${hmacKey(getClientIP(request))}`;
}
```

**Updated HOF signature:**
```typescript
export function withRateLimit<T = unknown>(
  preset: RateLimitPreset,
  handler: RateLimitedHandler<T>,
  keyStrategy?: KeyStrategy // Optional, defaults to IP
): (request: NextRequest) => Promise<NextResponse<T>>
```

**Usage:**
```typescript
// Analytics: Use session priority for authenticated users
export const POST = withRateLimit(
  'analytics',
  async (req, { clientIP }) => { /* ... */ },
  getSessionPriorityKey
);

// WhatsApp: Use API key priority
export const POST = withRateLimit(
  'whatsapp',
  async (req, { clientIP }) => { /* ... */ },
  getApiKeyPriorityKey
);
```

### Trade-offs

| Strategy | Pros | Cons | Best For |
|----------|------|------|----------|
| **Pure IP (HMAC)** | Simple, backward compatible | NAT false positives | Low-traffic, public APIs |
| **Session Priority** | Differentiates users on same IP | Requires session cookie | Authenticated users |
| **API Key Priority** | Precise caller identification | Requires auth system | Server-to-server APIs |

### Privacy & Compliance

- **HMAC hashing**: Server-side pepper ensures keys cannot be reversed or correlated offline
- **IP logging**: Already in use, covered by privacy policy
- **Session/API key hashing**: One-way HMAC prevents identifier reconstruction
- **Pepper rotation**: Implement periodic rotation with grace period for active sessions

### Pepper Management

```typescript
// Environment variables for pepper rotation
RATE_LIMIT_PEPPER=<current-pepper>
RATE_LIMIT_PEPPER_PREVIOUS=<old-pepper>  // Optional: for graceful rotation

// Rotation strategy:
// 1. Set new pepper as current, old as previous
// 2. Check both peppers during grace period (24h)
// 3. Remove previous pepper after grace period
```

---

## Decision 3: Test Architecture

### Test Organization

```
src/app/api/whatsapp/send/__tests__/
├── route.test.ts                    # Existing business logic tests
├── route-rate-limit.test.ts         # NEW: Rate limiting scenarios
└── route-authentication.test.ts     # NEW: API key auth scenarios
```

**Rationale for separate files:**
- Keep test files under 700 lines (complexity limit)
- Clear separation of concerns
- Easier to maintain and review

### Test Coverage Strategy

| Module | Current | Target | Priority |
|--------|---------|--------|----------|
| `with-rate-limit.ts` | 0% | 95% | P1 |
| `rate-limit-key-strategies.ts` | 0% | 92% | P1 |
| WhatsApp API security | ~60% | 90% | P1 |
| Analytics API rate limiting | ~70% | 85% | P2 |

### Mock Strategy

Use existing patterns from `fix-security-critical-gaps`:
```typescript
const mockCheckDistributedRateLimit = vi.hoisted(() => vi.fn());

vi.mock('@/lib/security/distributed-rate-limit', () => ({
  checkDistributedRateLimit: mockCheckDistributedRateLimit,
  createRateLimitHeaders: vi.fn(() => new Headers()),
}));
```

---

## Decision 4: Trusted Proxy Model

### Chosen Approach: Explicit Header Trust with CDN Validation

**Problem**: `X-Forwarded-For` can be spoofed by clients, making rate limiting ineffective.

**Solution**: Trust only specific headers based on deployment environment.

```typescript
// src/lib/security/client-ip.ts
interface TrustedProxyConfig {
  trustedHeaders: string[];  // Headers to trust in order
  cdnIpRanges?: string[];    // Optional: validate proxy IPs
}

const PROXY_CONFIGS: Record<string, TrustedProxyConfig> = {
  vercel: {
    trustedHeaders: ['x-real-ip', 'x-forwarded-for'],
    // Vercel automatically strips client-provided X-Forwarded-For
  },
  cloudflare: {
    trustedHeaders: ['cf-connecting-ip', 'x-forwarded-for'],
    cdnIpRanges: ['173.245.48.0/20', '103.21.244.0/22', /* ... */],
  },
  development: {
    trustedHeaders: ['x-forwarded-for'],
    // Accept all in development
  },
};

export function getClientIP(request: NextRequest): string {
  const env = process.env.DEPLOYMENT_PLATFORM || 'vercel';
  const config = PROXY_CONFIGS[env];

  for (const header of config.trustedHeaders) {
    const value = request.headers.get(header);
    if (value) {
      // Take first IP (client IP in standard proxy chains)
      return value.split(',')[0].trim();
    }
  }

  return request.ip || '0.0.0.0';
}
```

### Security Rationale

- **Vercel**: Strips client-provided `X-Forwarded-For`, safe to trust
- **Cloudflare**: Use `cf-connecting-ip` (Cloudflare-set), validate proxy IP if paranoid
- **Development**: Accept any header for local testing

---

## Decision 5: Storage Failure Strategy

### Chosen Approach: Fail-Open with Alert

**Trade-off**: Fail-open allows traffic during storage outages but creates security risk.

**Rationale**: For this B2B website, availability > strict rate limiting. Attacks during storage outage are rare and detectable.

```typescript
// src/lib/api/with-rate-limit.ts
export function withRateLimit<T>(
  preset: RateLimitPreset,
  handler: RateLimitedHandler<T>,
  keyStrategy?: KeyStrategy
): (request: NextRequest) => Promise<NextResponse<T>> {
  return async (request: NextRequest) => {
    const clientIP = getClientIP(request);
    const key = keyStrategy ? keyStrategy(request) : `ip:${hmacKey(clientIP)}`;

    try {
      const result = await checkDistributedRateLimit(key, preset);

      if (!result.allowed) {
        logger.warn(`${preset} rate limit exceeded`, { key: key.slice(0, 8) }); // Log only prefix
        return createRateLimitResponse<T>(result);
      }
    } catch (error) {
      // FAIL-OPEN: Log and alert, but allow request
      logger.error('Rate limit storage failure', {
        preset,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      // TODO: Send alert to monitoring system
    }

    return handler(request, { clientIP });
  };
}
```

### Alerting Requirements

- Storage failures MUST trigger alerts to ops team
- Alert threshold: >3 failures in 1 minute
- Dashboard metric: `rate_limit_storage_errors_total`

---

## Decision 6: Next.js Route Dynamic Configuration

### Chosen Approach: Explicit Dynamic Export

**Problem**: Next.js may cache route handlers, bypassing rate limiting.

**Solution**: All rate-limited routes MUST export `dynamic = 'force-dynamic'`.

```typescript
// src/app/api/whatsapp/send/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Required for crypto module

export const POST = withRateLimit('whatsapp', async (req, { clientIP }) => {
  // ... handler logic
}, getApiKeyPriorityKey);
```

### Verification Checklist

- [ ] All rate-limited routes have `export const dynamic = 'force-dynamic'`
- [ ] No conflicting `revalidate` exports
- [ ] Build output shows routes as "λ (Dynamic)" not "○ (Static)"

---

## Risks & Mitigations

### Risk 1: HOF Type Inference Complexity

**Risk**: TypeScript may struggle with generic HOF return types.

**Mitigation**:
- Explicit type parameters: `withRateLimit<ResponseData>(...)`
- Comprehensive type tests
- Fallback to explicit typing if needed

### Risk 2: Composite Keys Increase Storage

**Risk**: Longer keys increase KV storage usage (~8 bytes per key).

**Mitigation**:
- Hash UAs to fixed 8-char hex (negligible increase)
- Monitor KV usage in first month
- Rollback strategy: remove strategy parameter

### Risk 3: Test Suite Runtime Increase

**Risk**: Adding 20+ test scenarios may slow CI.

**Mitigation**:
- Parallelize test execution (already enabled)
- Use lightweight mocks
- Expected increase: <5 seconds

---

## Migration Plan

### Phase 1: Foundation (Day 1)
1. Create `with-rate-limit.ts` and `rate-limit-key-strategies.ts`
2. Write comprehensive unit tests
3. Validate with `pnpm type-check && pnpm lint`

### Phase 2: Incremental Rollout (Day 2)
1. Refactor analytics APIs (lower risk, high traffic)
2. Monitor for regressions
3. Refactor WhatsApp API after analytics stable

### Phase 3: Test Enhancement (Day 3)
1. Add security test scenarios
2. Achieve coverage targets
3. Run full CI pipeline

### Rollback Procedure

If issues detected:
```bash
# Revert individual route
git revert <commit-hash-for-route>

# Or revert entire change
git revert <commit-hash-for-refactor>
```

No database migrations required - all changes are code-only.

---

## Open Questions

1. **Should we add rate limit telemetry?** (e.g., track false positive rate)
   - **Decision**: Defer to separate observability initiative

2. **Should composite keys be configurable per preset?**
   - **Decision**: Hardcode strategies per preset for simplicity; revisit if needs diversify

3. **Should we extract authentication to separate HOF?**
   - **Decision**: No - authentication is WhatsApp-specific; rate limiting is cross-cutting

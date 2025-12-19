# Phase 01 Security Core Audit

Scope: `src/lib/security/`, `src/config/security.ts`, `middleware.ts`

## Findings

### 1) Proxy headers trusted without CDN source verification
- **Location**: `src/lib/security/client-ip.ts` lines 39-71, 85-208
- **Severity**: P1 (major)
- **Description**: The client IP extractor trusts proxy headers whenever `DEPLOYMENT_PLATFORM` is set to `vercel` or `cloudflare`, but it never validates that the request originated from the platform’s IP ranges. A direct connection to the origin could set spoofed `x-forwarded-for`/`cf-connecting-ip` values and fully control the rate-limit key or logging IP, bypassing abuse controls.
- **Recommended fix**:
  - Enforce a CDN source check before trusting any proxy header (e.g., verify `request.ip` against the known IP ranges for the configured platform, or require a signed header from the edge).
  - Fall back to `request.ip` or reject when the source is untrusted.
  - Example:
    ```ts
    import ipRangeCheck from 'ip-range-check';

    function isFromTrustedCdn(request: NextRequest, ranges: string[]): boolean {
      const sourceIp = (request as NextRequest & { ip?: string }).ip;
      return Boolean(sourceIp && ipRangeCheck(sourceIp, ranges));
    }

    if (!platform || !config || !isFromTrustedCdn(request, config.cdnIpRanges ?? [])) {
      return getNextJsIP(request) ?? FALLBACK_IP;
    }

    const headerIP = getIPFromTrustedHeaders(request, config);
    return headerIP ?? getNextJsIP(request) ?? FALLBACK_IP;
    ```

### 2) Rate limit keys accept unverified session/bearer values (pre-auth bypass)
- **Location**: `src/lib/security/rate-limit-key-strategies.ts` lines 140-204
- **Severity**: P1 (major)
- **Description**: `getSessionPriorityKey` and `getApiKeyPriorityKey` derive rate-limit identifiers directly from the `session-id` cookie or `Authorization` header before any signature/authentication check. An attacker can rotate arbitrary cookie values or bearer tokens to evade per-identity limits while still hitting expensive endpoints.
- **Recommended fix**:
  - Keep pre-auth rate limiting strictly IP-based until authentication succeeds.
  - After auth passes, derive a second key from a verified session or API key signature and enforce both.
  - Example:
    ```ts
    export function getPreAuthKey(request: NextRequest): string {
      return getIPKey(request);
    }

    export function getPostAuthKey(sessionId: string | undefined, apiKey: string | undefined): string {
      if (sessionId) return `session:${hmacKey(sessionId)}`;
      if (apiKey) return `apikey:${hmacKey(apiKey)}`;
      return 'anon';
    }
    ```

## CSP / XSS / Input Validation Notes
- No P0 issues found in `generateCSP` or middleware; nonce generation exists but should be paired with nonce propagation on inline scripts during implementation.

## Issue Tracker
- P1 Issues created in `docs/code-review/issues/` with label `major`.
- No P0 issues identified in this phase.

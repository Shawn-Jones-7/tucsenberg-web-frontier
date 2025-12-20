# Rate limit keys accept unverified session/Authorization values

- **Severity**: P1 (major)
- **Labels**: major
- **Location**: `src/lib/security/rate-limit-key-strategies.ts` lines 140-204

## Description
`getSessionPriorityKey` and `getApiKeyPriorityKey` build rate-limit identifiers directly from the `session-id` cookie and bearer token before any signature or authentication check. Attackers can rotate arbitrary cookie values or bearer tokens to evade identity-based rate limits while still consuming expensive endpoints.

## Recommended Fix
Keep pre-auth limits IP-based, then derive a second rate-limit key from a verified session or API key after authentication succeeds. Enforce both keys to prevent bypass.

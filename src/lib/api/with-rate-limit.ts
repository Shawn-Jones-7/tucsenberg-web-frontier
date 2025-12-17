/**
 * Rate Limit Higher-Order Function
 *
 * Eliminates rate limiting boilerplate from API routes by wrapping handlers
 * with consistent rate limit checking, error responses, and context injection.
 *
 * @example
 * ```typescript
 * // Basic usage with default IP-based key
 * export const POST = withRateLimit('analytics', async (req, { clientIP }) => {
 *   // Handler logic - clientIP already extracted
 *   return NextResponse.json({ success: true });
 * });
 *
 * // With custom key strategy
 * export const POST = withRateLimit(
 *   'whatsapp',
 *   async (req, { clientIP }) => { ... },
 *   getApiKeyPriorityKey
 * );
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getClientIP as getTrustedClientIP } from '@/lib/security/client-ip';
import {
  checkDistributedRateLimit,
  createRateLimitHeaders,
  type RateLimitPreset,
} from '@/lib/security/distributed-rate-limit';
import {
  getIPKey,
  type KeyStrategy,
} from '@/lib/security/rate-limit-key-strategies';

// Re-export types for convenience
export type { RateLimitPreset } from '@/lib/security/distributed-rate-limit';
export type { KeyStrategy } from '@/lib/security/rate-limit-key-strategies';

/** HTTP status codes */
const HTTP_TOO_MANY_REQUESTS = 429;

/** Header for degraded mode indication */
const RATE_LIMIT_DEGRADED_HEADER = 'X-RateLimit-Degraded';

/**
 * Storage failure tracking for alert threshold
 * Track failures within a sliding window to trigger alerts
 */
interface FailureTracker {
  count: number;
  windowStart: number;
}

const ALERT_THRESHOLD = 3;
const ALERT_WINDOW_MS = 60000; // 1 minute
let storageFailureTracker: FailureTracker = {
  count: 0,
  windowStart: Date.now(),
};

/**
 * Context provided to rate-limited handlers
 */
export interface RateLimitContext {
  /** Client IP address used for rate limiting */
  clientIP: string;
  /** Whether rate limiting is in degraded mode (storage failure) */
  degraded?: boolean;
}

/**
 * Rate-limited handler function signature
 * Supports both sync and async handlers for flexibility
 */
export type RateLimitedHandler<T = unknown> = (
  request: NextRequest,
  context: RateLimitContext,
) => Promise<NextResponse<T>> | NextResponse<T>;

/**
 * Standard rate limit error response body
 */
interface RateLimitErrorBody {
  success: false;
  error: string;
}

/**
 * Track storage failure and check if alert threshold exceeded
 */
function trackStorageFailure(): boolean {
  const now = Date.now();

  // Reset window if expired
  if (now - storageFailureTracker.windowStart > ALERT_WINDOW_MS) {
    storageFailureTracker = { count: 1, windowStart: now };
    return false;
  }

  storageFailureTracker.count += 1;
  return storageFailureTracker.count > ALERT_THRESHOLD;
}

/**
 * Create rate limit exceeded response
 */
function createRateLimitResponse<T>(
  result: Awaited<ReturnType<typeof checkDistributedRateLimit>>,
  keyPrefix: string,
): NextResponse<T> {
  const headers = createRateLimitHeaders(result);

  // Log only safe prefix (max 8 chars) per privacy requirements
  logger.warn('Rate limit exceeded', {
    keyPrefix: keyPrefix.slice(0, 8),
    retryAfter: result.retryAfter,
  });

  return NextResponse.json(
    { success: false, error: 'Too many requests' } as RateLimitErrorBody,
    { status: HTTP_TOO_MANY_REQUESTS, headers },
  ) as NextResponse<T>;
}

/**
 * Higher-order function that wraps API handlers with rate limiting
 *
 * Features:
 * - Eliminates 10-15 lines of boilerplate per route
 * - Consistent 429 responses with proper headers
 * - Fail-open behavior on storage failures
 * - Context injection with clientIP
 * - TypeScript-safe generics
 *
 * @param preset - Rate limit preset name (e.g., 'analytics', 'whatsapp')
 * @param handler - The actual request handler function
 * @param keyStrategy - Optional custom key generation strategy (defaults to IP-based)
 * @returns Wrapped handler function compatible with Next.js route exports
 *
 * @example
 * ```typescript
 * // In src/app/api/analytics/i18n/route.ts
 * export const dynamic = 'force-dynamic';
 *
 * export const POST = withRateLimit('analytics', async (req, { clientIP }) => {
 *   const body = await req.json();
 *   // ... handler logic
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withRateLimit<T = unknown>(
  preset: RateLimitPreset,
  handler: RateLimitedHandler<T>,
  keyStrategy: KeyStrategy = getIPKey,
): (request: NextRequest) => Promise<NextResponse<T>> {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    const clientIP = getTrustedClientIP(request);
    const rateLimitKey = keyStrategy(request);

    const result = await checkDistributedRateLimit(rateLimitKey, preset);

    // Rate limit exceeded - return 429
    if (!result.allowed) {
      return createRateLimitResponse<T>(result, rateLimitKey);
    }

    // Storage failure triggered fail-open - track and add degraded header
    if (result.degraded) {
      const shouldAlert = trackStorageFailure();

      logger.warn('Rate limit storage degraded (fail-open)', {
        preset,
        alertTriggered: shouldAlert,
      });

      if (shouldAlert) {
        logger.error('ALERT: Rate limit storage failure threshold exceeded', {
          failureCount: storageFailureTracker.count,
          windowMs: ALERT_WINDOW_MS,
        });
      }

      // Execute handler and add degraded header
      const response = await handler(request, { clientIP, degraded: true });
      response.headers.set(RATE_LIMIT_DEGRADED_HEADER, 'true');
      return response;
    }

    // Normal flow - rate limit passed
    return handler(request, { clientIP });
  };
}

/**
 * Reset storage failure tracker (for testing)
 */
export function resetStorageFailureTracker(): void {
  storageFailureTracker = { count: 0, windowStart: Date.now() };
}

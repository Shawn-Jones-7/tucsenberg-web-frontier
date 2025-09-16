import { COUNT_PAIR } from '@/constants/magic-numbers';

/**
 * 速率限制工具
 * Rate limiting utilities
 */

/**
 * Rate limiting constants
 */
const RATE_LIMIT_CONSTANTS = {
  DEFAULT_MAX_REQUESTS: 10,
  DEFAULT_WINDOW_MS: 60000, // 1 minute
  CLEANUP_INTERVAL_MINUTES: 5,
  MINUTES_TO_MS: 60,
  SECONDS_TO_MS: 1000,
} as const;

/**
 * Rate limit entry interface
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Rate limit store
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiting utility
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = RATE_LIMIT_CONSTANTS.DEFAULT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_CONSTANTS.DEFAULT_WINDOW_MS,
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(identifier, entry);
  return true;
}

/**
 * Get rate limit status for an identifier
 */
export function getRateLimitStatus(identifier: string): {
  remaining: number;
  resetTime: number;
  isLimited: boolean;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    return {
      remaining: RATE_LIMIT_CONSTANTS.DEFAULT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_CONSTANTS.DEFAULT_WINDOW_MS,
      isLimited: false,
    };
  }

  const remaining = Math.max(
    0,
    RATE_LIMIT_CONSTANTS.DEFAULT_MAX_REQUESTS - entry.count,
  );
  return {
    remaining,
    resetTime: entry.resetTime,
    isLimited: remaining === 0,
  };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Reset rate limit for a specific identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get all active rate limit entries (for debugging)
 */
export function getActiveLimits(): Array<{
  identifier: string;
  count: number;
  resetTime: number;
  remaining: number;
}> {
  const now = Date.now();
  const active: Array<{
    identifier: string;
    count: number;
    resetTime: number;
    remaining: number;
  }> = [];

  for (const [identifier, entry] of rateLimitStore.entries()) {
    if (now <= entry.resetTime) {
      active.push({
        identifier,
        count: entry.count,
        resetTime: entry.resetTime,
        remaining: Math.max(
          0,
          RATE_LIMIT_CONSTANTS.DEFAULT_MAX_REQUESTS - entry.count,
        ),
      });
    }
  }

  return active;
}

/**
 * Advanced rate limiting with different tiers
 */
export interface RateLimitTier {
  name: string;
  maxRequests: number;
  windowMs: number;
}

const defaultTiers: Record<string, RateLimitTier> = {
  strict: {
    name: 'strict',
    maxRequests: 5,
    windowMs: 60000, // 1 minute
  },
  normal: {
    name: 'normal',
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  },
  relaxed: {
    name: 'relaxed',
    maxRequests: 20,
    windowMs: 60000, // 1 minute
  },
  premium: {
    name: 'premium',
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
};

/**
 * Rate limit with tier support
 */
export function rateLimitWithTier(
  identifier: string,
  tierName: keyof typeof defaultTiers = 'normal',
): boolean {
  const tier = defaultTiers[tierName];
  if (!tier) {
    throw new Error(`Unknown rate limit tier: ${tierName}`);
  }

  return rateLimit(identifier, tier.maxRequests, tier.windowMs);
}

/**
 * Create custom rate limit tier
 */
export function createRateLimitTier(
  name: string,
  maxRequests: number,
  windowMs: number,
): RateLimitTier {
  return { name, maxRequests, windowMs };
}

/**
 * Sliding window rate limiter
 */
interface SlidingWindowEntry {
  timestamps: number[];
}

const slidingWindowStore = new Map<string, SlidingWindowEntry>();

/**
 * Sliding window rate limiting
 */
export function slidingWindowRateLimit(
  identifier: string,
  maxRequests: number = RATE_LIMIT_CONSTANTS.DEFAULT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_CONSTANTS.DEFAULT_WINDOW_MS,
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = slidingWindowStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    slidingWindowStore.set(identifier, entry);
  }

  // Remove old timestamps outside the window
  entry.timestamps = entry.timestamps.filter(
    (timestamp) => timestamp > windowStart,
  );

  // Check if we're within the limit
  if (entry.timestamps.length >= maxRequests) {
    return false;
  }

  // Add current timestamp
  entry.timestamps.push(now);
  return true;
}

/**
 * Clean up sliding window entries
 */
export function cleanupSlidingWindow(): void {
  const now = Date.now();
  const maxAge = RATE_LIMIT_CONSTANTS.DEFAULT_WINDOW_MS * COUNT_PAIR; // Keep entries for 2x window size

  for (const [key, entry] of slidingWindowStore.entries()) {
    const oldestTimestamp = Math.min(...entry.timestamps);
    if (now - oldestTimestamp > maxAge) {
      slidingWindowStore.delete(key);
    }
  }
}

// Clean up rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      cleanupRateLimit();
      cleanupSlidingWindow();
    },
    RATE_LIMIT_CONSTANTS.CLEANUP_INTERVAL_MINUTES *
      RATE_LIMIT_CONSTANTS.MINUTES_TO_MS *
      RATE_LIMIT_CONSTANTS.SECONDS_TO_MS,
  );
}

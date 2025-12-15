/**
 * Distributed Rate Limiting for Serverless
 *
 * Implements rate limiting that works across serverless instances.
 * Supports Upstash Redis or Vercel KV when configured, falls back to
 * in-memory store with warning for local development.
 */

import { logger } from '@/lib/logger';
import {
  COUNT_FIVE,
  COUNT_TEN,
  COUNT_THREE,
  MINUTE_MS,
  ONE,
  ZERO,
} from '@/constants';

// Rate limit configuration per endpoint
export const RATE_LIMIT_PRESETS = {
  contact: { maxRequests: COUNT_FIVE, windowMs: MINUTE_MS },
  inquiry: { maxRequests: COUNT_TEN, windowMs: MINUTE_MS },
  subscribe: { maxRequests: COUNT_THREE, windowMs: MINUTE_MS },
  whatsapp: { maxRequests: COUNT_FIVE, windowMs: MINUTE_MS },
  analytics: { maxRequests: 100, windowMs: MINUTE_MS },
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMIT_PRESETS;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number | null;
}

interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>;
  increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }>;
}

/**
 * In-memory rate limit store (fallback for local development)
 */
class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private warned = false;

  constructor() {
    this.warnAboutMemoryStore();
  }

  private warnAboutMemoryStore(): void {
    if (!this.warned) {
      logger.warn(
        '[Rate Limit] Using in-memory store. Rate limits will not persist across serverless instances. ' +
          'Configure UPSTASH_REDIS_REST_URL or KV_REST_API_URL for distributed rate limiting.',
      );
      this.warned = true;
    }
  }

  get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key);
    if (!entry) return Promise.resolve(null);

    const now = Date.now();
    if (now > entry.resetTime) {
      this.store.delete(key);
      return Promise.resolve(null);
    }

    return Promise.resolve(entry);
  }

  set(key: string, entry: RateLimitEntry): Promise<void> {
    this.store.set(key, entry);
    return Promise.resolve();
  }

  increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      const newEntry: RateLimitEntry = {
        count: ONE,
        resetTime: now + windowMs,
      };
      this.store.set(key, newEntry);
      return Promise.resolve(newEntry);
    }

    existing.count += ONE;
    this.store.set(key, existing);
    return Promise.resolve(existing);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Redis-based rate limit store (Upstash Redis)
 */
class RedisRateLimitStore implements RateLimitStore {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url.replace(/\/$/, '');
    this.token = token;
  }

  private async redisCommand<T>(
    commands: (string | number)[],
  ): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commands),
      });

      if (!response.ok) {
        logger.error('[Rate Limit] Redis command failed', {
          status: response.status,
        });
        return null;
      }

      const data = (await response.json()) as { result: T };
      return data.result;
    } catch (error) {
      logger.error('[Rate Limit] Redis connection error', { error });
      return null;
    }
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const result = await this.redisCommand<string | null>(['GET', key]);
    if (!result) return null;

    try {
      return JSON.parse(result) as RateLimitEntry;
    } catch {
      return null;
    }
  }

  async set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    const ttlSeconds = Math.ceil(ttlMs / MINUTE_MS) * (MINUTE_MS / 1000);
    await this.redisCommand([
      'SET',
      key,
      JSON.stringify(entry),
      'PX',
      Math.ceil(ttlSeconds * 1000),
    ]);
  }

  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = await this.get(key);

    if (!existing || now > existing.resetTime) {
      const newEntry: RateLimitEntry = {
        count: ONE,
        resetTime: now + windowMs,
      };
      await this.set(key, newEntry, windowMs);
      return newEntry;
    }

    existing.count += ONE;
    const remainingTtl = existing.resetTime - now;
    await this.set(key, existing, remainingTtl);
    return existing;
  }
}

/**
 * Vercel KV-based rate limit store
 */
class KVRateLimitStore implements RateLimitStore {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url.replace(/\/$/, '');
    this.token = token;
  }

  private async kvCommand<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (!response.ok) {
        logger.error('[Rate Limit] KV command failed', {
          status: response.status,
        });
        return null;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      logger.error('[Rate Limit] KV connection error', { error });
      return null;
    }
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const result = await this.kvCommand<{ result: string | null }>(
      'GET',
      `/get/${key}`,
    );
    if (!result?.result) return null;

    try {
      return JSON.parse(result.result) as RateLimitEntry;
    } catch {
      return null;
    }
  }

  async set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    await this.kvCommand('POST', `/set/${key}`, {
      value: JSON.stringify(entry),
      ex: ttlSeconds,
    });
  }

  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = await this.get(key);

    if (!existing || now > existing.resetTime) {
      const newEntry: RateLimitEntry = {
        count: ONE,
        resetTime: now + windowMs,
      };
      await this.set(key, newEntry, windowMs);
      return newEntry;
    }

    existing.count += ONE;
    const remainingTtl = existing.resetTime - now;
    await this.set(key, existing, remainingTtl);
    return existing;
  }
}

/**
 * Create the appropriate rate limit store based on available configuration
 */
function createRateLimitStore(): RateLimitStore {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    logger.info('[Rate Limit] Using Upstash Redis store');
    return new RedisRateLimitStore(upstashUrl, upstashToken);
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    logger.info('[Rate Limit] Using Vercel KV store');
    return new KVRateLimitStore(kvUrl, kvToken);
  }

  return new MemoryRateLimitStore();
}

let rateLimitStore: RateLimitStore | null = null;

function getRateLimitStore(): RateLimitStore {
  if (!rateLimitStore) {
    rateLimitStore = createRateLimitStore();
  }
  return rateLimitStore;
}

/**
 * Get rate limit config for preset (safe access pattern)
 */
function getRateLimitConfig(preset: RateLimitPreset): {
  maxRequests: number;
  windowMs: number;
} {
  switch (preset) {
    case 'contact':
      return RATE_LIMIT_PRESETS.contact;
    case 'inquiry':
      return RATE_LIMIT_PRESETS.inquiry;
    case 'subscribe':
      return RATE_LIMIT_PRESETS.subscribe;
    case 'whatsapp':
      return RATE_LIMIT_PRESETS.whatsapp;
    case 'analytics':
      return RATE_LIMIT_PRESETS.analytics;
    default: {
      // Exhaustive check - TypeScript will error if a case is missing
      const exhaustiveCheck: never = preset;
      return exhaustiveCheck;
    }
  }
}

/**
 * Check rate limit for a given identifier and preset
 */
export async function checkDistributedRateLimit(
  identifier: string,
  preset: RateLimitPreset,
): Promise<RateLimitResult> {
  const store = getRateLimitStore();
  const config = getRateLimitConfig(preset);
  const key = `ratelimit:${preset}:${identifier}`;

  try {
    const { count, resetTime } = await store.increment(key, config.windowMs);
    const now = Date.now();
    const remaining = Math.max(ZERO, config.maxRequests - count);
    const allowed = count <= config.maxRequests;

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? null : Math.ceil((resetTime - now) / 1000),
    };
  } catch (error) {
    logger.error('[Rate Limit] Check failed, allowing request', { error });
    return {
      allowed: true,
      remaining: config.maxRequests - ONE,
      resetTime: Date.now() + config.windowMs,
      retryAfter: null,
    };
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  preset: RateLimitPreset,
): Promise<RateLimitResult> {
  const store = getRateLimitStore();
  const config = getRateLimitConfig(preset);
  const key = `ratelimit:${preset}:${identifier}`;

  try {
    const entry = await store.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        retryAfter: null,
      };
    }

    const remaining = Math.max(ZERO, config.maxRequests - entry.count);
    const allowed = entry.count < config.maxRequests;

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: allowed ? null : Math.ceil((entry.resetTime - now) / 1000),
    };
  } catch (error) {
    logger.error('[Rate Limit] Status check failed', { error });
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      retryAfter: null,
    };
  }
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(result.resetTime));

  if (result.retryAfter !== null) {
    headers.set('Retry-After', String(result.retryAfter));
  }

  return headers;
}

/**
 * Cleanup expired entries (for memory store only)
 */
export function cleanupRateLimitStore(): void {
  const store = getRateLimitStore();
  if (store instanceof MemoryRateLimitStore) {
    store.cleanup();
  }
}

/**
 * Reset store instance (for testing)
 */
export function resetRateLimitStore(): void {
  rateLimitStore = null;
}

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/cache/invalidate/route';
import { API_ERROR_CODES } from '@/constants/api-error-codes';

const {
  mockLogger,
  mockGetClientIP,
  mockCheckDistributedRateLimit,
  mockCreateRateLimitHeaders,
  mockInvalidateI18n,
  mockInvalidateContent,
  mockInvalidateProduct,
  mockInvalidateLocale,
  mockInvalidateDomain,
} = vi.hoisted(() => {
  return {
    mockLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    mockGetClientIP: vi.fn(() => '127.0.0.1'),
    mockCheckDistributedRateLimit: vi.fn(async () => ({
      allowed: true,
      remaining: 10,
      resetTime: Date.now() + 60000,
      retryAfter: null,
    })),
    mockCreateRateLimitHeaders: vi.fn(() => new Headers()),
    mockInvalidateI18n: {
      all: vi.fn(() => ({
        success: true,
        invalidatedTags: ['i18n'],
        errors: [],
      })),
      locale: vi.fn(() => ({
        success: true,
        invalidatedTags: ['i18n:locale'],
        errors: [],
      })),
      critical: vi.fn(() => ({
        success: true,
        invalidatedTags: ['i18n:critical'],
        errors: [],
      })),
      deferred: vi.fn(() => ({
        success: true,
        invalidatedTags: ['i18n:deferred'],
        errors: [],
      })),
    },
    mockInvalidateContent: {
      locale: vi.fn(() => ({
        success: true,
        invalidatedTags: ['content:locale'],
        errors: [],
      })),
      blogPost: vi.fn(() => ({
        success: true,
        invalidatedTags: ['content:blog'],
        errors: [],
      })),
      page: vi.fn(() => ({
        success: true,
        invalidatedTags: ['content:page'],
        errors: [],
      })),
    },
    mockInvalidateProduct: {
      locale: vi.fn(() => ({
        success: true,
        invalidatedTags: ['product:locale'],
        errors: [],
      })),
      detail: vi.fn(() => ({
        success: true,
        invalidatedTags: ['product:detail'],
        errors: [],
      })),
      categories: vi.fn(() => ({
        success: true,
        invalidatedTags: ['product:categories'],
        errors: [],
      })),
      featured: vi.fn(() => ({
        success: true,
        invalidatedTags: ['product:featured'],
        errors: [],
      })),
    },
    mockInvalidateLocale: vi.fn(() => ({
      success: true,
      invalidatedTags: ['all:locale'],
      errors: [],
    })),
    mockInvalidateDomain: vi.fn(() => ({
      success: true,
      invalidatedTags: ['all:domain'],
      errors: [],
    })),
  };
});

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

vi.mock('@/app/api/contact/contact-api-utils', () => ({
  getClientIP: mockGetClientIP,
}));

vi.mock('@/lib/security/distributed-rate-limit', () => ({
  checkDistributedRateLimit: mockCheckDistributedRateLimit,
  createRateLimitHeaders: mockCreateRateLimitHeaders,
}));

vi.mock('@/lib/cache', () => ({
  CACHE_DOMAINS: {
    I18N: 'i18n',
    CONTENT: 'content',
    PRODUCT: 'product',
  },
  invalidateI18n: mockInvalidateI18n,
  invalidateContent: mockInvalidateContent,
  invalidateProduct: mockInvalidateProduct,
  invalidateLocale: mockInvalidateLocale,
  invalidateDomain: mockInvalidateDomain,
}));

describe('cache invalidate route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CACHE_INVALIDATION_SECRET', 'secret');
  });

  it('GET returns usage metadata', async () => {
    const response = GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('usage');
  });

  it('POST returns 401 when missing authorization', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/invalidate',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ domain: 'i18n' }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.errorCode).toBe(API_ERROR_CODES.UNAUTHORIZED);
  });

  it('POST invalidates i18n tags when authorized', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/invalidate',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer secret',
        },
        body: JSON.stringify({
          domain: 'i18n',
          locale: 'en',
          entity: 'critical',
        }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(mockInvalidateI18n.critical).toHaveBeenCalled();
  });

  it('POST returns 400 for content invalidation without locale', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/cache/invalidate',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer secret',
        },
        body: JSON.stringify({
          domain: 'content',
          entity: 'page',
          identifier: 'about',
        }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errorCode).toBe(API_ERROR_CODES.CACHE_LOCALE_REQUIRED);
  });
});

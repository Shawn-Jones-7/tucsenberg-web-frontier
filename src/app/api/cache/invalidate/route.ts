/**
 * Cache Invalidation API Route
 *
 * Provides HTTP endpoints for triggering cache invalidation.
 * Protected by API key authentication for security.
 *
 * Usage:
 * POST /api/cache/invalidate
 * Authorization: Bearer <CACHE_INVALIDATION_SECRET>
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "domain": "i18n" | "content" | "product",
 *   "locale"?: "en" | "zh",
 *   "entity"?: string,
 *   "identifier"?: string
 * }
 *
 * @see src/lib/cache/invalidate.ts - Core invalidation utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Locale } from '@/types/content.types';
import {
  CACHE_DOMAINS,
  invalidateContent,
  invalidateDomain,
  invalidateI18n,
  invalidateLocale,
  invalidateProduct,
} from '@/lib/cache';
import { logger } from '@/lib/logger';
import {
  checkDistributedRateLimit,
  createRateLimitHeaders,
} from '@/lib/security/distributed-rate-limit';
import { getClientIP } from '@/app/api/contact/contact-api-utils';
import { API_ERROR_CODES } from '@/constants/api-error-codes';

const VALID_LOCALES = ['en', 'zh'] as const;

interface InvalidationRequest {
  domain: 'i18n' | 'content' | 'product' | 'all';
  locale?: Locale;
  entity?: string;
  identifier?: string;
}

function isValidLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && VALID_LOCALES.includes(locale as Locale);
}

function validateApiKey(request: NextRequest): boolean {
  const secret = process.env.CACHE_INVALIDATION_SECRET;

  // In development, allow without secret if not set
  if (!secret && process.env.NODE_ENV === 'development') {
    return true;
  }

  if (!secret) {
    logger.error('CACHE_INVALIDATION_SECRET not configured');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.slice(7);
  return token === secret;
}

interface InvalidationResult {
  success: boolean;
  invalidatedTags: string[];
  errors: string[];
}

function handleI18nInvalidation(
  locale: Locale | undefined,
  entity: string | undefined,
): InvalidationResult {
  if (locale && isValidLocale(locale)) {
    if (entity === 'critical') return invalidateI18n.critical(locale);
    if (entity === 'deferred') return invalidateI18n.deferred(locale);
    return invalidateI18n.locale(locale);
  }
  return invalidateI18n.all();
}

function handleContentInvalidation(
  locale: Locale,
  entity: string | undefined,
  identifier: string | undefined,
): InvalidationResult {
  if (entity === 'blog' && identifier) {
    return invalidateContent.blogPost(identifier, locale);
  }
  if (entity === 'page' && identifier) {
    return invalidateContent.page(identifier, locale);
  }
  return invalidateContent.locale(locale);
}

function handleProductInvalidation(
  locale: Locale,
  entity: string | undefined,
  identifier: string | undefined,
): InvalidationResult {
  if (entity === 'detail' && identifier) {
    return invalidateProduct.detail(identifier, locale);
  }
  if (entity === 'categories') return invalidateProduct.categories(locale);
  if (entity === 'featured') return invalidateProduct.featured(locale);
  return invalidateProduct.locale(locale);
}

function handleAllInvalidation(locale: Locale | undefined): InvalidationResult {
  if (locale && isValidLocale(locale)) {
    return invalidateLocale(locale);
  }
  const results = [
    invalidateDomain(CACHE_DOMAINS.I18N),
    invalidateDomain(CACHE_DOMAINS.CONTENT),
    invalidateDomain(CACHE_DOMAINS.PRODUCT),
  ];
  return {
    success: results.every((r) => r.errors.length === 0),
    invalidatedTags: results.flatMap((r) => r.invalidatedTags),
    errors: results.flatMap((r) => r.errors),
  };
}

type RateLimitPresetType = 'cacheInvalidatePreAuth' | 'cacheInvalidate';

async function checkRateLimitAndRespond(
  clientIP: string,
  preset: RateLimitPresetType,
  logContext: string,
): Promise<NextResponse | null> {
  const rateLimitResult = await checkDistributedRateLimit(clientIP, preset);
  if (!rateLimitResult.allowed) {
    logger.warn(`Cache invalidation ${logContext} rate limit exceeded`, {
      ip: clientIP,
      retryAfter: rateLimitResult.retryAfter,
    });
    return NextResponse.json(
      { success: false, errorCode: API_ERROR_CODES.RATE_LIMIT_EXCEEDED },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) },
    );
  }
  return null;
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // 1. Pre-auth rate limit (brute force protection - coarse limit per IP)
  const preAuthBlock = await checkRateLimitAndRespond(
    clientIP,
    'cacheInvalidatePreAuth',
    'pre-auth',
  );
  if (preAuthBlock) return preAuthBlock;

  // 2. Auth check
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { success: false, errorCode: API_ERROR_CODES.UNAUTHORIZED },
      { status: 401 },
    );
  }

  // 3. Post-auth rate limit (defense in depth - finer limit for valid tokens)
  const postAuthBlock = await checkRateLimitAndRespond(
    clientIP,
    'cacheInvalidate',
    'post-auth',
  );
  if (postAuthBlock) return postAuthBlock;

  try {
    const body = (await request.json()) as InvalidationRequest;
    const { domain, locale, entity, identifier } = body;

    const result = processDomainInvalidation({
      domain,
      locale,
      entity,
      identifier,
    });
    if ('errorCode' in result) {
      return NextResponse.json(
        { success: false, errorCode: result.errorCode },
        { status: result.status },
      );
    }

    logger.info('Cache invalidation triggered', {
      domain,
      locale,
      entity,
      identifier,
      result,
    });

    return NextResponse.json({
      success: result.success,
      errorCode: API_ERROR_CODES.CACHE_INVALIDATED,
      invalidatedTags: result.invalidatedTags,
      ...(result.errors.length > 0 && { errors: result.errors }),
    });
  } catch (error) {
    logger.error('Cache invalidation failed', error);
    return NextResponse.json(
      { success: false, errorCode: API_ERROR_CODES.CACHE_INVALIDATION_FAILED },
      { status: 500 },
    );
  }
}

type ProcessResult = InvalidationResult | { errorCode: string; status: number };

interface ProcessOptions {
  domain: string;
  locale: Locale | undefined;
  entity: string | undefined;
  identifier: string | undefined;
}

function processDomainInvalidation(options: ProcessOptions): ProcessResult {
  const { domain, locale, entity, identifier } = options;
  switch (domain) {
    case 'i18n':
      return handleI18nInvalidation(locale, entity);

    case 'content':
      if (!locale || !isValidLocale(locale)) {
        return {
          errorCode: API_ERROR_CODES.CACHE_LOCALE_REQUIRED,
          status: 400,
        };
      }
      return handleContentInvalidation(locale, entity, identifier);

    case 'product':
      if (!locale || !isValidLocale(locale)) {
        return {
          errorCode: API_ERROR_CODES.CACHE_LOCALE_REQUIRED,
          status: 400,
        };
      }
      return handleProductInvalidation(locale, entity, identifier);

    case 'all':
      return handleAllInvalidation(locale);

    default:
      return { errorCode: API_ERROR_CODES.CACHE_INVALID_DOMAIN, status: 400 };
  }
}

export function GET() {
  return NextResponse.json({
    message: 'Cache Invalidation API',
    usage: {
      method: 'POST',
      authentication: 'Bearer <CACHE_INVALIDATION_SECRET>',
      body: {
        domain: 'i18n | content | product | all',
        locale: 'en | zh (optional for i18n, required for others)',
        entity:
          'critical | deferred | blog | page | detail | categories | featured',
        identifier: 'slug or specific identifier',
      },
    },
  });
}

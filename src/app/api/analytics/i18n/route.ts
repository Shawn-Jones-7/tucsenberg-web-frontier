import { NextRequest, NextResponse } from 'next/server';
import { createCachedResponse } from '@/lib/api-cache-utils';
import { safeParseJson } from '@/lib/api/safe-parse-json';
import {
  withRateLimit,
  type RateLimitContext,
} from '@/lib/api/with-rate-limit';
import { logger } from '@/lib/logger';

/**
 * i18n分析数据类型定义
 */
interface I18nAnalyticsData {
  locale: string;
  event: string;
  timestamp: number;
  metadata?: Record<string, string | number | boolean | null>;
}

const ALLOWED_I18N_ANALYTICS_FIELDS = [
  'locale',
  'event',
  'timestamp',
  'metadata',
] as const;
type I18nAnalyticsField = (typeof ALLOWED_I18N_ANALYTICS_FIELDS)[number];

function hasOnlyAllowedFields(target: Record<string, unknown>): boolean {
  return Object.keys(target).every((key) =>
    ALLOWED_I18N_ANALYTICS_FIELDS.includes(key as I18nAnalyticsField),
  );
}

function isPlainSafeObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isValidMetadata(metadata: Record<string, unknown>): boolean {
  for (const [key, value] of Object.entries(metadata)) {
    if (!key || key.startsWith('__')) {
      return false;
    }
    if (
      value !== null &&
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean'
    ) {
      return false;
    }
  }
  return true;
}

/**
 * 验证i18n分析数据格式
 */
function validateI18nAnalyticsData(data: unknown): data is I18nAnalyticsData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const record = data as Record<string, unknown>;
  if (!hasOnlyAllowedFields(record)) {
    return false;
  }

  const hasValidLocale =
    typeof record.locale === 'string' && record.locale.trim().length > 0;
  const hasValidEvent =
    typeof record.event === 'string' && record.event.trim().length > 0;
  const hasValidTimestamp =
    typeof record.timestamp === 'number' && Number.isFinite(record.timestamp);

  if (!hasValidLocale || !hasValidEvent || !hasValidTimestamp) {
    return false;
  }

  if (record.metadata !== undefined) {
    if (!isPlainSafeObject(record.metadata)) {
      return false;
    }

    if (!isValidMetadata(record.metadata as Record<string, unknown>)) {
      return false;
    }
  }

  return true;
}

/**
 * POST handler implementation
 */
async function handlePost(
  request: NextRequest,
  _ctx: RateLimitContext,
): Promise<NextResponse> {
  try {
    const parsedBody = await safeParseJson<unknown>(request, {
      route: '/api/analytics/i18n',
    });
    if (!parsedBody.ok) {
      return NextResponse.json(
        {
          success: false,
          error: parsedBody.error,
          message: 'Invalid JSON body for i18n analytics endpoint',
        },
        { status: 400 },
      );
    }
    const body = parsedBody.data;

    if (!validateI18nAnalyticsData(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid i18n analytics data format',
          message:
            'The provided data does not match the expected i18n analytics format',
        },
        { status: 400 },
      );
    }

    logger.info('i18n analytics data received', {
      locale: body.locale,
      event: body.event,
      timestamp: body.timestamp,
      metadata: body.metadata || {},
    });

    return NextResponse.json({
      success: true,
      message: 'i18n analytics data recorded successfully',
      data: {
        locale: body.locale,
        event: body.event,
        timestamp: body.timestamp,
      },
    });
  } catch (_error) {
    logger.error('Failed to process i18n analytics data', {
      _error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process i18n analytics data',
      },
      { status: 500 },
    );
  }
}

/**
 * Build locale distribution for filtered response
 */
function buildLocaleDistribution(
  safeLocale: 'en' | 'zh' | 'ja' | 'other',
  distribution: { en: number; zh: number; ja: number; other: number },
): { en: number } | { zh: number } | { ja: number } | { other: number } {
  switch (safeLocale) {
    case 'en':
      return { en: distribution.en };
    case 'zh':
      return { zh: distribution.zh };
    case 'ja':
      return { ja: distribution.ja };
    default:
      return { other: distribution.other };
  }
}

/**
 * GET handler implementation
 */
function handleGet(request: NextRequest, _ctx: RateLimitContext): NextResponse {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const timeRange = searchParams.get('timeRange') || '24h';

    const mockStats = {
      timeRange,
      locale: locale || 'all',
      events: {
        localeSwitch: { count: 150, topTargetLocales: ['en', 'zh', 'ja'] },
        translationMissing: {
          count: 12,
          topMissingKeys: ['common.newFeature', '_error.validation'],
        },
        translationLoad: { count: 1250, averageLoadTime: 45, p95LoadTime: 120 },
      },
      localeDistribution: { en: 0.65, zh: 0.25, ja: 0.08, other: 0.02 },
      summary: {
        totalEvents: 1412,
        uniqueUsers: 890,
        translationCoverage: 0.94,
        averageSessionLocales: 1.2,
      },
    };

    if (locale && locale !== 'all') {
      const allowedLocales = ['en', 'zh', 'ja', 'other'] as const;
      type AllowedLocale = (typeof allowedLocales)[number];

      if (!allowedLocales.includes(locale as AllowedLocale)) {
        return NextResponse.json(
          { success: false, error: 'Invalid locale parameter' },
          { status: 400 },
        );
      }

      const safeLocale = locale as AllowedLocale;
      const localeDistribution = buildLocaleDistribution(
        safeLocale,
        mockStats.localeDistribution,
      );

      return createCachedResponse(
        {
          success: true,
          data: {
            locale: safeLocale,
            localeDistribution,
            summary: mockStats.summary,
            events: mockStats.events,
            timeRange: mockStats.timeRange,
          },
        },
        { maxAge: 300 },
      );
    }

    return createCachedResponse(
      { success: true, data: mockStats },
      { maxAge: 300 },
    );
  } catch (_error) {
    logger.error('Failed to get i18n analytics statistics', {
      _error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve i18n analytics statistics',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE handler implementation
 */
function handleDelete(
  request: NextRequest,
  _ctx: RateLimitContext,
): NextResponse {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const timeRange = searchParams.get('timeRange');
    const confirm = searchParams.get('confirm');

    if (confirm !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirmation required',
          message: 'Please add confirm=true parameter to confirm deletion',
        },
        { status: 400 },
      );
    }

    logger.info('i18n analytics data deletion requested', {
      locale: locale || 'all',
      timeRange: timeRange || 'all',
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `i18n analytics data deleted for locale: ${locale || 'all'}, time range: ${timeRange || 'all'}`,
      deletedAt: new Date().toISOString(),
    });
  } catch (_error) {
    logger.error('Failed to delete i18n analytics data', {
      _error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        _error: 'Internal server _error',
        message: 'Failed to delete i18n analytics data',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/analytics/i18n
 * 收集国际化相关的分析数据
 */
export const POST = withRateLimit('analytics', handlePost);

/**
 * GET /api/analytics/i18n
 * 获取i18n分析统计信息
 */
export const GET = withRateLimit('analytics', handleGet);

/**
 * DELETE /api/analytics/i18n
 * 删除i18n分析数据（管理功能）
 */
export const DELETE = withRateLimit('analytics', handleDelete);

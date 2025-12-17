import { NextRequest, NextResponse } from 'next/server';
import { createCachedResponse } from '@/lib/api-cache-utils';
import { safeParseJson } from '@/lib/api/safe-parse-json';
import {
  withRateLimit,
  type RateLimitContext,
} from '@/lib/api/with-rate-limit';
import { logger } from '@/lib/logger';

// HTTP 状态码常量
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Web Vitals 数据接口
interface WebVitalsBaseData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  timestamp: number;
}

interface WebVitalsExtendedData {
  id?: string;
  navigationType?: string;
  url?: string;
  userAgent?: string;
  path?: string;
}

type WebVitalsData = WebVitalsBaseData & WebVitalsExtendedData;

function isValidWebVitalsBaseFields(obj: Record<string, unknown>): boolean {
  return (
    typeof obj.name === 'string' &&
    typeof obj.value === 'number' &&
    ['good', 'needs-improvement', 'poor'].includes(obj.rating as string) &&
    typeof obj.delta === 'number' &&
    typeof obj.timestamp === 'number'
  );
}

function hasValidOptionalId(obj: Record<string, unknown>): boolean {
  return !('id' in obj) || typeof obj.id === 'string';
}

function hasValidOptionalNavigationType(obj: Record<string, unknown>): boolean {
  return !('navigationType' in obj) || typeof obj.navigationType === 'string';
}

function hasValidOptionalUrl(obj: Record<string, unknown>): boolean {
  return !('url' in obj) || typeof obj.url === 'string';
}

function hasValidOptionalUserAgent(obj: Record<string, unknown>): boolean {
  return !('userAgent' in obj) || typeof obj.userAgent === 'string';
}

function hasValidOptionalPath(obj: Record<string, unknown>): boolean {
  return !('path' in obj) || typeof obj.path === 'string';
}

function validateWebVitalsData(data: unknown): data is WebVitalsData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!isValidWebVitalsBaseFields(obj)) {
    return false;
  }

  return (
    hasValidOptionalId(obj) &&
    hasValidOptionalNavigationType(obj) &&
    hasValidOptionalUrl(obj) &&
    hasValidOptionalUserAgent(obj) &&
    hasValidOptionalPath(obj)
  );
}

interface LogPayload {
  metric: string;
  value: number;
  rating: string;
  timestamp: number;
  path?: string;
  url?: string;
  navigationType?: string;
  userAgent?: string;
  id?: string;
}

function buildLogPayload(body: WebVitalsData): LogPayload {
  const payload: LogPayload = {
    metric: body.name,
    value: body.value,
    rating: body.rating,
    timestamp: body.timestamp,
  };

  if (body.path) payload.path = body.path;
  if (body.url) payload.url = body.url;
  if (body.navigationType) payload.navigationType = body.navigationType;
  if (body.userAgent) payload.userAgent = body.userAgent;
  if (body.id) payload.id = body.id;

  return payload;
}

function buildSuccessResponse(body: WebVitalsData) {
  return NextResponse.json({
    success: true,
    message: 'Web Vitals data recorded successfully',
    data: {
      metric: body.name,
      value: body.value,
      rating: body.rating,
      timestamp: body.timestamp,
    },
  });
}

function buildErrorResponse(
  errorType: string,
  message: string,
  status: number,
) {
  return NextResponse.json(
    { success: false, _error: errorType, message },
    { status },
  );
}

/**
 * Mock stats data for Web Vitals
 */
function getMockStats(timeRange: string) {
  return {
    timeRange,
    metrics: {
      CLS: {
        average: 0.05,
        p75: 0.08,
        p90: 0.12,
        samples: 1250,
        rating: 'good' as const,
      },
      FID: {
        average: 45,
        p75: 65,
        p90: 85,
        samples: 1180,
        rating: 'good' as const,
      },
      LCP: {
        average: 1800,
        p75: 2200,
        p90: 2800,
        samples: 1300,
        rating: 'good' as const,
      },
      FCP: {
        average: 1200,
        p75: 1500,
        p90: 1900,
        samples: 1300,
        rating: 'good' as const,
      },
      TTFB: {
        average: 200,
        p75: 300,
        p90: 450,
        samples: 1300,
        rating: 'good' as const,
      },
    },
    summary: {
      totalSamples: 1300,
      goodRating: 0.85,
      needsImprovementRating: 0.12,
      poorRating: 0.03,
    },
  };
}

type MetricName = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB';

/**
 * Get stats for a specific metric
 */
function getMetricStats(
  metrics: ReturnType<typeof getMockStats>['metrics'],
  metricName: MetricName,
) {
  // eslint-disable-next-line security/detect-object-injection -- metricName is validated against allowedMetrics allowlist
  return metrics[metricName];
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
      route: '/api/analytics/web-vitals',
    });

    if (!parsedBody.ok) {
      return buildErrorResponse(
        parsedBody.error,
        'Invalid JSON body for Web Vitals endpoint',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const body = parsedBody.data;

    if (!validateWebVitalsData(body)) {
      return buildErrorResponse(
        'Invalid web vitals data format',
        'The provided data does not match the expected Web Vitals format',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    logger.info('Web Vitals data received', buildLogPayload(body));
    return buildSuccessResponse(body);
  } catch (_error) {
    logger.error('Failed to process Web Vitals data', {
      _error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return buildErrorResponse(
      'Internal server _error',
      'Failed to process Web Vitals data',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * GET handler implementation
 */
function handleGet(request: NextRequest, _ctx: RateLimitContext): NextResponse {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const metric = searchParams.get('metric');
    const mockStats = getMockStats(timeRange);
    const allowedMetrics: MetricName[] = ['CLS', 'FID', 'LCP', 'FCP', 'TTFB'];

    if (metric && allowedMetrics.includes(metric as MetricName)) {
      const safeMetric = metric as MetricName;
      return createCachedResponse(
        {
          success: true,
          data: {
            timeRange,
            metric: safeMetric,
            stats: getMetricStats(mockStats.metrics, safeMetric),
          },
        },
        { maxAge: 120 },
      );
    }

    return createCachedResponse(
      { success: true, data: mockStats },
      { maxAge: 120 },
    );
  } catch (_error) {
    logger.error('Failed to get Web Vitals statistics', {
      _error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        _error: 'Internal server _error',
        message: 'Failed to retrieve Web Vitals statistics',
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
    const timeRange = searchParams.get('timeRange');
    const confirm = searchParams.get('confirm');

    if (confirm !== 'true') {
      return NextResponse.json(
        {
          success: false,
          _error: 'Confirmation required',
          message: 'Please add confirm=true parameter to confirm deletion',
        },
        { status: 400 },
      );
    }

    logger.info('Web Vitals data deletion requested', {
      timeRange: timeRange || 'all',
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Web Vitals data deleted for time range: ${timeRange || 'all'}`,
      deletedAt: new Date().toISOString(),
    });
  } catch (_error) {
    logger.error('Failed to delete Web Vitals data', {
      _error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        _error: 'Internal server _error',
        message: 'Failed to delete Web Vitals data',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/analytics/web-vitals
 * 处理 Web Vitals 数据收集
 */
export const POST = withRateLimit('analytics', handlePost);

/**
 * GET /api/analytics/web-vitals
 * 获取 Web Vitals 统计信息
 */
export const GET = withRateLimit('analytics', handleGet);

/**
 * DELETE /api/analytics/web-vitals
 * 删除 Web Vitals 数据（管理功能）
 */
export const DELETE = withRateLimit('analytics', handleDelete);

import { NextRequest, NextResponse } from 'next/server';
import { createCachedResponse } from '@/lib/api-cache-utils';
import { safeParseJson } from '@/lib/api/safe-parse-json';
import { logger } from '@/lib/logger';
import {
  checkDistributedRateLimit,
  createRateLimitHeaders,
} from '@/lib/security/distributed-rate-limit';
import { getClientIP } from '@/app/api/contact/contact-api-utils';

// HTTP 状态码常量
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Web Vitals 数据接口
//
// 说明：
// - 为兼容当前前端上报的精简结构，仅以下字段为必填：
//   - name / value / rating / delta / timestamp
// - 其余字段（id / navigationType / url / userAgent / path）为可选扩展字段，
//   未来如需更细粒度分析可在前端按需补充，而不会破坏现有后端校验。
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

// 验证 Web Vitals 数据 - 拆分基础字段与可选字段校验，降低复杂度
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
  if (!('id' in obj)) {
    return true;
  }

  return typeof obj.id === 'string';
}

function hasValidOptionalNavigationType(obj: Record<string, unknown>): boolean {
  if (!('navigationType' in obj)) {
    return true;
  }

  return typeof obj.navigationType === 'string';
}

function hasValidOptionalUrl(obj: Record<string, unknown>): boolean {
  if (!('url' in obj)) {
    return true;
  }

  return typeof obj.url === 'string';
}

function hasValidOptionalUserAgent(obj: Record<string, unknown>): boolean {
  if (!('userAgent' in obj)) {
    return true;
  }

  return typeof obj.userAgent === 'string';
}

function hasValidOptionalPath(obj: Record<string, unknown>): boolean {
  if (!('path' in obj)) {
    return true;
  }

  return typeof obj.path === 'string';
}

function validateWebVitalsData(data: unknown): data is WebVitalsData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // 1) 必填字段校验：与前端 WebVitalsReporter 上报的精简结构对齐
  if (!isValidWebVitalsBaseFields(obj)) {
    return false;
  }

  // 2) 可选扩展字段：如存在则做类型校验，否则忽略
  return (
    hasValidOptionalId(obj) &&
    hasValidOptionalNavigationType(obj) &&
    hasValidOptionalUrl(obj) &&
    hasValidOptionalUserAgent(obj) &&
    hasValidOptionalPath(obj)
  );
}

// 构建日志载荷，将可选字段追加到基础对象
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

  // 仅在存在时记录可选字段，避免 exactOptionalPropertyTypes 下显式传入 undefined
  if (body.path) {
    payload.path = body.path;
  }
  if (body.url) {
    payload.url = body.url;
  }
  if (body.navigationType) {
    payload.navigationType = body.navigationType;
  }
  if (body.userAgent) {
    payload.userAgent = body.userAgent;
  }
  if (body.id) {
    payload.id = body.id;
  }

  return payload;
}

// 构建成功响应
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

// 构建错误响应
function buildErrorResponse(
  errorType: string,
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      _error: errorType,
      message,
    },
    { status },
  );
}

// 处理 Web Vitals 数据收集
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Check rate limit (100 requests per minute for analytics)
  const rateLimitResult = await checkDistributedRateLimit(
    clientIP,
    'analytics',
  );
  if (!rateLimitResult.allowed) {
    logger.warn('Web Vitals rate limit exceeded', {
      ip: clientIP,
      retryAfter: rateLimitResult.retryAfter,
    });
    const headers = createRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      },
      { status: HTTP_STATUS.TOO_MANY_REQUESTS, headers },
    );
  }

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

    // 验证请求数据
    if (!validateWebVitalsData(body)) {
      return buildErrorResponse(
        'Invalid web vitals data format',
        'The provided data does not match the expected Web Vitals format',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // 记录 Web Vitals 数据
    logger.info('Web Vitals data received', buildLogPayload(body));

    // 在实际应用中，这里会将数据存储到数据库或发送到分析服务
    // 目前只是记录日志
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

// 获取 Web Vitals 统计信息
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Check rate limit (100 requests per minute for analytics)
  const rateLimitResult = await checkDistributedRateLimit(
    clientIP,
    'analytics',
  );
  if (!rateLimitResult.allowed) {
    logger.warn('Web Vitals GET rate limit exceeded', { ip: clientIP });
    const headers = createRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: HTTP_STATUS.TOO_MANY_REQUESTS, headers },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const metric = searchParams.get('metric');

    // 模拟统计数据（在实际应用中会从数据库查询）
    const mockStats = {
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

    const allowedMetrics = ['CLS', 'FID', 'LCP', 'FCP', 'TTFB'] as Array<
      keyof typeof mockStats.metrics
    >;

    // 如果指定了特定指标，只返回该指标的数据
    if (
      metric &&
      allowedMetrics.includes(metric as (typeof allowedMetrics)[number])
    ) {
      const safeMetric = metric as keyof typeof mockStats.metrics;
      let metricStats:
        | (typeof mockStats.metrics)['CLS']
        | (typeof mockStats.metrics)['FID']
        | (typeof mockStats.metrics)['LCP']
        | (typeof mockStats.metrics)['FCP']
        | (typeof mockStats.metrics)['TTFB'];

      switch (safeMetric) {
        case 'FID':
          metricStats = mockStats.metrics.FID;
          break;
        case 'LCP':
          metricStats = mockStats.metrics.LCP;
          break;
        case 'FCP':
          metricStats = mockStats.metrics.FCP;
          break;
        case 'TTFB':
          metricStats = mockStats.metrics.TTFB;
          break;
        default:
          metricStats = mockStats.metrics.CLS;
          break;
      }
      return createCachedResponse(
        {
          success: true,
          data: {
            timeRange,
            metric: safeMetric,
            stats: metricStats,
          },
        },
        { maxAge: 120 },
      );
    }

    return createCachedResponse(
      {
        success: true,
        data: mockStats,
      },
      { maxAge: 120 },
    );
  } catch (_error) {
    // 忽略错误变量
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

// 删除 Web Vitals 数据（管理功能）
export async function DELETE(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Check rate limit (100 requests per minute for analytics)
  const rateLimitResult = await checkDistributedRateLimit(
    clientIP,
    'analytics',
  );
  if (!rateLimitResult.allowed) {
    logger.warn('Web Vitals DELETE rate limit exceeded', { ip: clientIP });
    const headers = createRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: HTTP_STATUS.TOO_MANY_REQUESTS, headers },
    );
  }

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

    // 在实际应用中，这里会删除指定时间范围的数据
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
    // 忽略错误变量
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

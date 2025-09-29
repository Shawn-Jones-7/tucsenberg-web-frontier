import { NextRequest, NextResponse } from 'next/server';
import { createCachedResponse } from '@/lib/api-cache-utils';
import { logger } from '@/lib/logger';

// Web Vitals 数据接口
interface WebVitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  url: string;
  userAgent: string;
  timestamp: number;
}

// 验证 Web Vitals 数据
function validateWebVitalsData(data: unknown): data is WebVitalsData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.value === 'number' &&
    ['good', 'needs-improvement', 'poor'].includes(obj.rating as string) &&
    typeof obj.delta === 'number' &&
    typeof obj.id === 'string' &&
    typeof obj.navigationType === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.userAgent === 'string' &&
    typeof obj.timestamp === 'number'
  );
}

// 处理 Web Vitals 数据收集
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    if (!validateWebVitalsData(body)) {
      return NextResponse.json(
        {
          success: false,
          _error: 'Invalid web vitals data format',
          message:
            'The provided data does not match the expected Web Vitals format',
        },
        { status: 400 },
      );
    }

    // 记录 Web Vitals 数据
    logger.info('Web Vitals data received', {
      metric: body.name,
      value: body.value,
      rating: body.rating,
      url: body.url,
      timestamp: body.timestamp,
    });

    // 在实际应用中，这里会将数据存储到数据库或发送到分析服务
    // 目前只是记录日志

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
  } catch (_error) {
    // 忽略错误变量
    logger.error('Failed to process Web Vitals data', {
      _error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        _error: 'Internal server _error',
        message: 'Failed to process Web Vitals data',
      },
      { status: 500 },
    );
  }
}

// 获取 Web Vitals 统计信息
export function GET(request: NextRequest) {
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

    // 如果指定了特定指标，只返回该指标的数据
    if (metric && mockStats.metrics[metric as keyof typeof mockStats.metrics]) {
      return createCachedResponse(
        {
          success: true,
          data: {
            timeRange,
            metric,
            stats: mockStats.metrics[metric as keyof typeof mockStats.metrics],
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
export function DELETE(request: NextRequest) {
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

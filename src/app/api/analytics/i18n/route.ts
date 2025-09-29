import { NextRequest, NextResponse } from 'next/server';
import { createCachedResponse } from '@/lib/api-cache-utils';
import { logger } from '@/lib/logger';

/**
 * i18n分析数据类型定义
 */
interface I18nAnalyticsData {
  locale: string;
  event: string;
  timestamp: number;
  [key: string]: unknown;
}

/**
 * 验证i18n分析数据格式
 */
function validateI18nAnalyticsData(data: unknown): data is I18nAnalyticsData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const record = data as Record<string, unknown>;
  const requiredFields = ['locale', 'event', 'timestamp'];
  return requiredFields.every((field) => field in record);
}

/**
 * POST /api/analytics/i18n
 * 收集国际化相关的分析数据
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
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

    // 记录i18n分析数据
    logger.info('i18n analytics data received', {
      locale: body.locale,
      event: body.event,
      timestamp: body.timestamp,
      metadata: body.metadata || {},
    });

    // 在实际应用中，这里会将数据存储到数据库或发送到分析服务
    // 目前只是记录日志

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
    // 忽略错误变量
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
 * GET /api/analytics/i18n
 * 获取i18n分析统计信息
 */
export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const timeRange = searchParams.get('timeRange') || '24h';

    // 模拟统计数据（在实际应用中会从数据库查询）
    const mockStats = {
      timeRange,
      locale: locale || 'all',
      events: {
        localeSwitch: {
          count: 150,
          topTargetLocales: ['en', 'zh', 'ja'],
        },
        translationMissing: {
          count: 12,
          topMissingKeys: ['common.newFeature', '_error.validation'],
        },
        translationLoad: {
          count: 1250,
          averageLoadTime: 45,
          p95LoadTime: 120,
        },
      },
      localeDistribution: {
        en: 0.65,
        zh: 0.25,
        ja: 0.08,
        other: 0.02,
      },
      summary: {
        totalEvents: 1412,
        uniqueUsers: 890,
        translationCoverage: 0.94,
        averageSessionLocales: 1.2,
      },
    };

    // 如果指定了特定语言，过滤数据
    if (locale && locale !== 'all') {
      return createCachedResponse(
        {
          success: true,
          data: {
            ...mockStats,
            locale,
            localeDistribution: {
              [locale]:
                mockStats.localeDistribution[
                  locale as keyof typeof mockStats.localeDistribution
                ] || 0,
            },
          },
        },
        { maxAge: 300 },
      );
    }

    return createCachedResponse(
      {
        success: true,
        data: mockStats,
      },
      { maxAge: 300 },
    );
  } catch (_error) {
    // 忽略错误变量
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
 * DELETE /api/analytics/i18n
 * 删除i18n分析数据（管理功能）
 */
export function DELETE(request: NextRequest) {
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

    // 在实际应用中，这里会删除指定的i18n分析数据
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
    // 忽略错误变量
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

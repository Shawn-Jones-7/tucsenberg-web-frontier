import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { HOURS_2_IN_MS, HOURS_24_IN_MS } from '@/app/api/monitoring/dashboard/types';

/**
 * GET /api/monitoring/dashboard
 * 获取监控仪表板统计信息
 */
export function handleGetRequest(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const timeRange = searchParams.get('timeRange') || '1h';
    const environment = searchParams.get('environment') || 'production';

    // 模拟监控统计数据（在实际应用中会从数据库查询）
    const mockDashboardData = {
      timeRange,
      environment,
      source: source || 'all',
      systemHealth: {
        status: 'healthy',
        uptime: '99.9%',
        responseTime: {
          average: 120,
          p95: 250,
          p99: 450,
        },
        errorRate: 0.001,
      },
      performance: {
        webVitals: {
          cls: { value: 0.05, rating: 'good' },
          fid: { value: 45, rating: 'good' },
          lcp: { value: 1800, rating: 'good' },
        },
        bundleSize: {
          main: 45000,
          framework: 125000,
          css: 12000,
        },
        cacheHitRate: 0.94,
      },
      i18n: {
        translationCoverage: 0.96,
        localeDistribution: {
          en: 0.65,
          zh: 0.25,
          ja: 0.08,
          other: 0.02,
        },
        missingTranslations: 8,
      },
      security: {
        cspViolations: 2,
        suspiciousRequests: 0,
        rateLimitHits: 15,
        lastSecurityScan: new Date(Date.now() - HOURS_24_IN_MS).toISOString(),
      },
      alerts: [
        {
          id: 'alert-001',
          level: 'warning',
          message: 'Bundle size approaching limit',
          timestamp: new Date(Date.now() - HOURS_2_IN_MS).toISOString(),
        },
      ],
      summary: {
        totalRequests: 125000,
        uniqueUsers: 8900,
        dataPoints: 45000,
        lastUpdated: new Date().toISOString(),
      },
    };

    // 如果指定了特定来源，过滤数据
    if (source && source !== 'all') {
      return NextResponse.json({
        success: true,
        data: {
          ...mockDashboardData,
          source,
          // 可以根据source过滤特定的监控数据
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: mockDashboardData,
    });
  } catch (_error) {
    // 忽略错误变量
    logger.error('Failed to get monitoring dashboard data', {
      error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve monitoring dashboard data',
      },
      { status: 500 },
    );
  }
}

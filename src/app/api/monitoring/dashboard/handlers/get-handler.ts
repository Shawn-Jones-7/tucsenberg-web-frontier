import { NextRequest, NextResponse } from 'next/server';
import { createCachedResponse } from '@/lib/api-cache-utils';
import { logger } from '@/lib/logger';
import { validateAdminAccess } from '@/app/api/contact/contact-api-validation';
import {
  HOURS_2_IN_MS,
  HOURS_24_IN_MS,
} from '@/app/api/monitoring/dashboard/types';
import { COUNT_PAIR, ZERO } from '@/constants';
import { API_ERROR_CODES } from '@/constants/api-error-codes';
import {
  COUNT_45,
  COUNT_120,
  COUNT_250,
  COUNT_450,
  COUNT_12000,
  COUNT_45000,
  COUNT_125000,
  MAGIC_8,
  MAGIC_15,
  MAGIC_1800,
} from '@/constants/count';
import {
  DEC_0_001,
  DEC_0_02,
  DEC_0_05,
  DEC_0_08,
  DEC_0_65,
  DEC_0_94,
  DEC_0_96,
  MAGIC_0_25,
} from '@/constants/decimal';

/**
 * GET /api/monitoring/dashboard
 * 获取监控仪表板统计信息
 */
export function handleGetRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!validateAdminAccess(authHeader)) {
      logger.warn('Unauthorized access attempt to monitoring dashboard');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

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
          average: COUNT_120,
          p95: COUNT_250,
          p99: COUNT_450,
        },
        errorRate: DEC_0_001,
      },
      performance: {
        webVitals: {
          cls: { value: DEC_0_05, rating: 'good' },
          fid: { value: COUNT_45, rating: 'good' },
          lcp: { value: MAGIC_1800, rating: 'good' },
        },
        bundleSize: {
          main: COUNT_45000,
          framework: COUNT_125000,
          css: COUNT_12000,
        },
        cacheHitRate: DEC_0_94,
      },
      i18n: {
        translationCoverage: DEC_0_96,
        localeDistribution: {
          en: DEC_0_65,
          zh: MAGIC_0_25,
          ja: DEC_0_08,
          other: DEC_0_02,
        },
        missingTranslations: MAGIC_8,
      },
      security: {
        cspViolations: COUNT_PAIR,
        suspiciousRequests: ZERO,
        rateLimitHits: MAGIC_15,
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
        totalRequests: COUNT_125000,
        uniqueUsers: 8900,
        dataPoints: COUNT_45000,
        lastUpdated: new Date().toISOString(),
      },
    };

    // 如果指定了特定来源，过滤数据
    if (source && source !== 'all') {
      return createCachedResponse(
        {
          success: true,
          data: {
            timeRange: mockDashboardData.timeRange,
            environment: mockDashboardData.environment,
            // 显式设置 source 字段，避免使用对象扩展运算符合并潜在不受控字段
            source,
            systemHealth: mockDashboardData.systemHealth,
            performance: mockDashboardData.performance,
            i18n: mockDashboardData.i18n,
            security: mockDashboardData.security,
            alerts: mockDashboardData.alerts,
            summary: mockDashboardData.summary,
          },
        },
        { maxAge: 60 },
      );
    }

    return createCachedResponse(
      {
        success: true,
        data: mockDashboardData,
      },
      { maxAge: 60 },
    );
  } catch (_error) {
    // 忽略错误变量
    logger.error('Failed to get monitoring dashboard data', {
      error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        errorCode: API_ERROR_CODES.MONITORING_RETRIEVE_FAILED,
      },
      { status: 500 },
    );
  }
}

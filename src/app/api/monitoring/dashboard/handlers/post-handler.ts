import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { validateMonitoringData } from '@/app/api/monitoring/dashboard/types';

/**
 * POST /api/monitoring/dashboard
 * 收集监控仪表板数据
 */
export async function handlePostRequest(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    if (!validateMonitoringData(body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid monitoring data format',
          message: 'Required fields: source, metrics, timestamp',
        },
        { status: 400 },
      );
    }

    // 记录监控数据（在实际应用中会存储到数据库）
    logger.info('Monitoring dashboard data received', {
      source: body.source,
      timestamp: body.timestamp,
      metricsCount: Object.keys(body.metrics).length,
    });

    // 模拟数据处理
    const processedData = {
      id: `monitoring-${Date.now()}`,
      ...body,
      processedAt: new Date().toISOString(),
      status: 'processed',
    };

    return NextResponse.json({
      success: true,
      message: 'Monitoring data received successfully',
      data: processedData,
    });
  } catch (_error) {
    // 忽略错误变量
    logger.error('Failed to process monitoring dashboard data', {
      error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process monitoring dashboard data',
      },
      { status: 500 },
    );
  }
}

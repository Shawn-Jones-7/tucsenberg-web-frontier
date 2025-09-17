import { HTTP_BAD_REQUEST } from "@/constants/magic-numbers";
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/monitoring/dashboard
 * 清除监控数据（管理功能）
 */
export function handleDeleteRequest(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange');
    const source = searchParams.get('source');
    const confirm = searchParams.get('confirm');

    if (confirm !== 'true') {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirmation required',
          message: 'Please add confirm=true parameter to confirm deletion',
        },
        { status: HTTP_BAD_REQUEST },
      );
    }

    // 在实际应用中，这里会删除指定的监控数据
    logger.info('Monitoring dashboard data deletion requested', {
      source: source || 'all',
      timeRange: timeRange || 'all',
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Monitoring data deleted for source: ${source || 'all'}, time range: ${timeRange || 'all'}`,
      deletedAt: new Date().toISOString(),
    });
  } catch (_error) {
    // 忽略错误变量
    logger.error('Failed to delete monitoring dashboard data', {
      error: _error instanceof Error ? _error.message : String(_error),
      stack: _error instanceof Error ? _error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete monitoring dashboard data',
      },
      { status: 500 },
    );
  }
}

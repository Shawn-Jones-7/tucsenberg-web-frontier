import { logger as _logger } from '@/lib/logger';

export async function register() {
  // Sentry 已移除（2025-11-20）
  // 如果未来需要启用，请取消注释以下代码并恢复配置文件
  /*
  try {
    if (process.env['NEXT_RUNTIME'] === 'nodejs') {
      await import('./sentry.server.config');
    }

    if (process.env['NEXT_RUNTIME'] === 'edge') {
      await import('./sentry.edge.config');
    }
  } catch (error) {
    _logger.error(
      'Failed to register instrumentation',
      {
        runtime: process.env['NEXT_RUNTIME'],
        nodeEnv: process.env.NODE_ENV,
      },
      error instanceof Error ? error : new Error(String(error)),
    );
  }
  */
}

// Sentry 已移除（2025-11-20）
// 如果未来需要启用错误监控，请取消注释以下代码
/*
// Required for Sentry 10.x - handles errors from nested React Server Components
export async function onRequestError(
  error: unknown,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
  },
) {
  // Only capture errors in production to avoid noise in development
  if (
    process.env.NODE_ENV === 'production' &&
    process.env['DISABLE_SENTRY_BUNDLE'] !== '1'
  ) {
    // Dynamic import to avoid bundling Sentry in client bundle
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureRequestError(error, request, context);
  }
}
*/

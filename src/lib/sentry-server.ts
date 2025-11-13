/**
 * 服务器端 Sentry 轻量包装器
 * - 避免在测试/开发环境中打包 @sentry/nextjs，减少构建耦合
 * - 仅在生产环境按需动态加载，失败时静默降级为 no-op
 */

// 避免在构建期解析 @sentry/nextjs，使用最小类型声明
type SentryServerModule = {
  captureException: (error: unknown) => void;
};

const DISABLE_SENTRY =
  process.env['PLAYWRIGHT_TEST'] === 'true' ||
  process.env['NEXT_PUBLIC_DISABLE_SENTRY'] === '1' ||
  process.env['DISABLE_SENTRY_BUNDLE'] === '1';

let sentryPromise: Promise<SentryServerModule> | null = null;

function loadSentry(): Promise<SentryServerModule> | null {
  if (DISABLE_SENTRY) return null;
  if (process.env.NODE_ENV !== 'production') return null;
  if (!sentryPromise) {
    // 动态导入仅在生产生效，避免测试环境模块解析报错
    // 使用字符串变量规避静态分析提前解析依赖
    const mod = '@sentry/nextjs' as const;
    sentryPromise = import(mod);
  }
  return sentryPromise;
}

function withSentry(action: (s: SentryServerModule) => void) {
  const p = loadSentry();
  if (!p) return; // 非生产/测试直接跳过
  p.then((s) => {
    try {
      action(s);
    } catch {
      // 静默忽略 Sentry 内部异常，避免影响主流程
    }
  }).catch(() => {
    // 忽略动态导入失败
  });
}

export function captureException(error: unknown) {
  withSentry((s) => s.captureException(error));
}

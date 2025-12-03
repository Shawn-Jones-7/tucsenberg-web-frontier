import { getRequestConfig } from 'next-intl/server';
import {
  I18nPerformanceMonitor,
  TranslationCache,
} from '@/lib/i18n-performance';
import { loadCompleteMessages } from '@/lib/load-messages';
import { COUNT_FIVE, ONE } from '@/constants';
import { routing } from '@/i18n/routing';

// 辅助函数：获取格式配置
function getFormats(locale: string) {
  return {
    dateTime: {
      short: {
        day: 'numeric' as const,
        month: 'short' as const,
        year: 'numeric' as const,
      },
      long: {
        day: 'numeric' as const,
        month: 'long' as const,
        year: 'numeric' as const,
        weekday: 'long' as const,
      },
    },
    number: {
      precise: {
        maximumFractionDigits: COUNT_FIVE,
      },
      currency: {
        style: 'currency' as const,
        currency: locale === 'zh' ? 'CNY' : 'USD',
      },
      percentage: {
        style: 'percent' as const,
        minimumFractionDigits: ONE,
      },
    },
    list: {
      enumeration: {
        style: 'long' as const,
        type: 'conjunction' as const,
      },
    },
  };
}

// 辅助函数：处理缓存性能监控
function handleCacheMetrics(locale: string, loadTime: number) {
  I18nPerformanceMonitor.recordLoadTime(loadTime);

  const cache = TranslationCache.getInstance();
  const cached = cache.get(`messages-${locale}-critical`);
  if (cached) {
    I18nPerformanceMonitor.recordCacheHit();
  } else {
    I18nPerformanceMonitor.recordCacheMiss();
  }

  return Boolean(cached);
}

// 辅助函数：创建成功响应
interface SuccessResponseArgs {
  locale: string;
  messages: Record<string, unknown>;
  loadTime: number;
  cacheUsed: boolean;
}

function createSuccessResponse({
  locale,
  messages,
  loadTime,
  cacheUsed,
}: SuccessResponseArgs) {
  if (
    process.env.I18N_DEBUG_BUILD === '1' &&
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    const topLevelKeys = Object.keys(messages);
    // eslint-disable-next-line no-console
    console.error('[i18n-debug] createSuccessResponse snapshot', {
      locale,
      loadTime,
      cacheUsed,
      topLevelKeys,
      hasProducts: Object.prototype.hasOwnProperty.call(messages, 'products'),
      hasFaq: Object.prototype.hasOwnProperty.call(messages, 'faq'),
      hasPrivacy: Object.prototype.hasOwnProperty.call(messages, 'privacy'),
    });
  }

  return {
    locale,
    messages,
    timeZone: locale === 'zh' ? 'Asia/Shanghai' : 'UTC',
    formats: getFormats(locale),
    strictMessageTypeSafety: true,
    metadata: {
      loadTime,
      cacheUsed,
    },
  };
}

// 辅助函数：创建错误回退响应
async function createFallbackResponse(locale: string, startTime: number) {
  if (
    process.env.I18N_DEBUG_BUILD === '1' &&
    process.env.NEXT_PHASE === 'phase-production-build'
  ) {
    // eslint-disable-next-line no-console
    console.error('[i18n-debug] createFallbackResponse triggered', {
      locale,
      phase: process.env.NEXT_PHASE,
    });
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: locale === 'zh' ? 'Asia/Shanghai' : 'UTC',
    formats: getFormats(locale),
    metadata: {
      loadTime: performance.now() - startTime,
      cacheUsed: false,
      error: true,
    },
  };
}

export default getRequestConfig(async ({ requestLocale }) => {
  const startTime = performance.now();
  let locale = await requestLocale;

  // 如果没有明确的语言偏好，使用默认语言
  // next-intl middleware会自动处理语言检测和cookie
  if (!locale || !routing.locales.includes(locale as 'en' | 'zh')) {
    locale = routing.defaultLocale;
  }

  try {
    const messages = await loadCompleteMessages(locale as 'en' | 'zh');
    const loadTime = performance.now() - startTime;
    const cacheUsed = handleCacheMetrics(locale, loadTime);

    return createSuccessResponse({
      locale,
      messages,
      loadTime,
      cacheUsed,
    });
  } catch {
    I18nPerformanceMonitor.recordError();
    return createFallbackResponse(locale, startTime);
  }
});

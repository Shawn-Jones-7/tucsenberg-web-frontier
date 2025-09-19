import { getRequestConfig } from 'next-intl/server';
import {
  getCachedMessages,
  I18nPerformanceMonitor,
  TranslationCache,
} from '@/lib/i18n-performance';
import { COUNT_FIVE, ONE } from '@/constants';
import { routing } from '@/i18n/routing';

// 重用 request.ts 中的辅助函数
function getEnhancedFormats(locale: string) {
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

function handleEnhancedCacheMetrics(locale: string, loadTime: number) {
  I18nPerformanceMonitor.recordLoadTime(loadTime);

  const cache = TranslationCache.getInstance();
  const cached = cache.get(`messages-${locale}`);
  if (cached) {
    I18nPerformanceMonitor.recordCacheHit();
  } else {
    I18nPerformanceMonitor.recordCacheMiss();
  }

  return Boolean(cached);
}

interface EnhancedResponseArgs {
  locale: string;
  messages: Record<string, unknown>;
  loadTime: number;
  cacheUsed: boolean;
}

function createEnhancedResponse({
  locale,
  messages,
  loadTime,
  cacheUsed,
}: EnhancedResponseArgs) {
  return {
    locale,
    messages,
    timeZone: locale === 'zh' ? 'Asia/Shanghai' : 'UTC',
    now: new Date(),
    formats: getEnhancedFormats(locale),
    metadata: {
      loadTime,
      cacheUsed,
      timestamp: Date.now(),
    },
  };
}

function createEnhancedFallbackResponse(locale: string, startTime: number) {
  return {
    locale,
    messages: {},
    timeZone: locale === 'zh' ? 'Asia/Shanghai' : 'UTC',
    now: new Date(),
    formats: getEnhancedFormats(locale),
    metadata: {
      loadTime: performance.now() - startTime,
      cacheUsed: false,
      error: true,
      timestamp: Date.now(),
    },
  };
}

export default getRequestConfig(async ({ requestLocale }) => {
  const startTime = performance.now();
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'en' | 'zh')) {
    locale = routing.defaultLocale;
  }

  try {
    const messages = await getCachedMessages(locale);
    const loadTime = performance.now() - startTime;
    const cacheUsed = handleEnhancedCacheMetrics(locale, loadTime);

    return createEnhancedResponse({ locale, messages, loadTime, cacheUsed });
  } catch {
    I18nPerformanceMonitor.recordError();
    return createEnhancedFallbackResponse(locale, startTime);
  }
});

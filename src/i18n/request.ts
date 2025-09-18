import { routing } from '@/i18n/routing';
import { COUNT_FIVE, ONE } from '@/constants';

import {
  getCachedMessages,
  I18nPerformanceMonitor,
  TranslationCache,
} from '@/lib/i18n-performance';
import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

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
  const cached = cache.get(`messages-${locale}`);
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
  return {
    locale,
    messages,
    timeZone: locale === 'zh' ? 'Asia/Shanghai' : 'UTC',
    now: new Date(),
    formats: getFormats(locale),
    strictMessageTypeSafety: true,
    metadata: {
      loadTime,
      cacheUsed,
      timestamp: Date.now(),
    },
  };
}

// 辅助函数：创建错误回退响应
async function createFallbackResponse(locale: string, startTime: number) {
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: locale === 'zh' ? 'Asia/Shanghai' : 'UTC',
    now: new Date(),
    formats: getFormats(locale),
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

  // 获取智能检测信息
  const headersList = await headers();
  const detectedLocale = headersList.get('x-detected-locale');
  const detectionSource = headersList.get('x-detection-source');
  const detectionConfidence = headersList.get('x-detection-confidence');

  // 如果没有明确的语言偏好，使用智能检测结果
  if (!locale || !routing.locales.includes(locale as 'en' | 'zh')) {
    if (
      detectedLocale &&
      routing.locales.includes(detectedLocale as 'en' | 'zh')
    ) {
      locale = detectedLocale;
    } else {
      locale = routing.defaultLocale;
    }
  }

  try {
    const messages = await getCachedMessages(locale);
    const loadTime = performance.now() - startTime;
    const cacheUsed = handleCacheMetrics(locale, loadTime);

    // 创建增强的响应，包含检测信息
    const response = createSuccessResponse({
      locale,
      messages,
      loadTime,
      cacheUsed,
    });

    // 添加智能检测元数据
    if (detectedLocale && detectionSource && detectionConfidence) {
      (
        response as typeof response & { metadata: Record<string, unknown> }
      ).metadata = {
        ...response.metadata,
        smartDetection: {
          detectedLocale,
          source: detectionSource,
          confidence: parseFloat(detectionConfidence),
          applied: locale === detectedLocale,
        },
      };
    }

    return response;
  } catch {
    I18nPerformanceMonitor.recordError();
    return createFallbackResponse(locale, startTime);
  }
});

'use client';

import { ZERO } from "@/constants/magic-numbers";
import { logger } from '@/lib/logger';
import { Analytics } from '@vercel/analytics/react';
import { useLocale } from 'next-intl';
import React, { useEffect } from 'react';

/**
 * 使用全局 logger（开发环境输出，生产环境静默）
 */

interface AnalyticsConfig {
  enableWebVitals: boolean;
  enableI18nTracking: boolean;
  enablePerformanceMonitoring: boolean;
}

const defaultConfig: AnalyticsConfig = {
  enableWebVitals: true,
  enableI18nTracking: true,
  enablePerformanceMonitoring: true,
};

export function EnterpriseAnalytics({
  children,
  config = defaultConfig,
}: {
  children: React.ReactNode;
  config?: AnalyticsConfig;
}) {
  const locale = useLocale();

  useEffect(() => {
    // 初始化企业级监控
    if (typeof window === 'undefined') return;

    // Web Vitals监控
    if (config.enableWebVitals) {
      initWebVitals(locale);
    }

    // i18n性能监控
    if (config.enableI18nTracking) {
      initI18nTracking(locale);
    }

    // 性能监控
    if (config.enablePerformanceMonitoring) {
      initPerformanceMonitoring(locale);
    }
  }, [locale, config]);

  return (
    <>
      {children}
      <Analytics />
    </>
  );
}

function initWebVitals(locale: string): void {
  // 动态导入web-vitals
  import('web-vitals')
    .then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      const reportVital = (metric: {
        name: string;
        value: number;
        rating: string;
      }) => {
        // 开发环境日志
        logger.warn(
          `[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating}) - Locale: ${locale}`,
        );

        // 发送到Vercel Analytics
        if ('va' in window) {
          try {
            (window as any).va('track', 'Web Vital', {
              metric_name: metric.name,
              metric_value: metric.value,
              metric_rating: metric.rating,
              locale,
            });
          } catch (error) {
            logger.error('Failed to send to Vercel Analytics:', error);
          }
        }
      };

      onCLS(reportVital);
      onFCP(reportVital);
      onLCP(reportVital);
      onTTFB(reportVital);
      onINP(reportVital);
    })
    .catch((error) => {
      logger.error('Failed to load web-vitals:', error);
    });
}

function initI18nTracking(locale: string): void {
  // 监控语言切换
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    trackNavigation(locale);
    return originalPushState.apply(this, args);
  };

  history.replaceState = function (...args) {
    trackNavigation(locale);
    return originalReplaceState.apply(this, args);
  };

  window.addEventListener('popstate', () => {
    trackNavigation(locale);
  });
}

function trackNavigation(locale: string): void {
  logger.warn(
    `[I18n Navigation] Locale: ${locale}, URL: ${window.location.href}`,
  );

  // 发送导航事件
  if ('va' in window) {
    try {
      (window as any).va('track', 'Navigation', {
        locale,
        url: window.location.href,
      });
    } catch (error) {
      logger.error('Failed to send navigation event:', error);
    }
  }
}

function initPerformanceMonitoring(locale: string): void {
  // 监控页面加载性能
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[ZERO] as PerformanceNavigationTiming;

      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          load: navigation.loadEventEnd - navigation.loadEventStart,
          total: navigation.loadEventEnd - navigation.fetchStart,
        };

        logger.warn(`[Performance] Locale: ${locale}`, metrics);

        // 发送性能指标
        if ('va' in window) {
          try {
            (window as any).va('track', 'Performance', {
              ...metrics,
              locale,
            });
          } catch (error) {
            logger.error('Failed to send performance metrics:', error);
          }
        }
      }
    }, ZERO);
  });

  // 监控资源加载
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();

    for (const entry of entries) {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;

        // 特别关注i18n相关资源
        if (
          resourceEntry.name.includes('/messages/') ||
          resourceEntry.name.includes('locale') ||
          resourceEntry.name.includes('i18n')
        ) {
          logger.warn(
            `[I18n Resource] ${resourceEntry.name}: ${resourceEntry.duration}ms (${resourceEntry.transferSize} bytes) - Locale: ${locale}`,
          );
        }
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });
}

// 导出用于手动追踪的函数
export const enterpriseAnalytics = {
  trackEvent: (eventName: string, properties: Record<string, unknown> = {}) => {
    if (typeof window === 'undefined') return;

    logger.warn(`[Analytics Event] ${eventName}:`, properties);

    if ('va' in window) {
      try {
        (window as any).va('track', eventName, properties);
      } catch (error) {
        logger.error('Failed to send to Vercel Analytics:', error);
      }
    }

    if ('gtag' in window) {
      try {
        (window as any).gtag('event', eventName, properties);
      } catch (error) {
        logger.error('Failed to send to Google Analytics:', error);
      }
    }
  },

  trackError: (error: Error, context: Record<string, unknown> = {}) => {
    if (typeof window === 'undefined') return;

    logger.error('[Tracked Error]', error, context);

    enterpriseAnalytics.trackEvent('Error', {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack,
      ...context,
    });
  },

  trackI18nEvent: (eventType: string, data: Record<string, unknown> = {}) => {
    if (typeof window === 'undefined') return;

    logger.warn(`[I18n Event] ${eventType}:`, data);

    enterpriseAnalytics.trackEvent(`I18n ${eventType}`, data);
  },

  trackLocaleChange: (fromLocale: string, toLocale: string) => {
    enterpriseAnalytics.trackI18nEvent('Locale Change', {
      from_locale: fromLocale,
      to_locale: toLocale,
      source: 'user_action',
    });
  },

  trackPerformance: (metric: string, value: number, locale: string) => {
    enterpriseAnalytics.trackEvent('Performance Metric', {
      metric,
      value,
      locale,
    });
  },
};

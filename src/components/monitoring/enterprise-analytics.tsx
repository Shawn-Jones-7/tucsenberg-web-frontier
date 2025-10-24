'use client';

import { useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { logger } from '@/lib/logger';
import { ZERO } from '@/constants/magic-numbers';

// 动态导入 Vercel Analytics（延迟加载，减少首屏Bundle）
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false },
);

// 动态导入 Vercel Speed Insights（延迟加载,减少首屏Bundle）
const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false },
);

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

type VercelAnalyticsTracker = (
  action: 'track',
  eventName: string,
  properties: Record<string, unknown>,
) => void;

type GoogleAnalyticsTracker = (...args: unknown[]) => void;

const hasVercelAnalytics = (
  candidate: Window & { va?: unknown },
): candidate is Window & { va: VercelAnalyticsTracker } =>
  typeof candidate.va === 'function';

const hasGoogleAnalytics = (
  candidate: Window & { gtag?: unknown },
): candidate is Window & { gtag: GoogleAnalyticsTracker } =>
  typeof candidate.gtag === 'function';

const trackWithVercelAnalytics = (
  eventName: string,
  properties: Record<string, unknown>,
) => {
  if (typeof window === 'undefined') return;
  const analyticsWindow = window as Window & { va?: unknown };
  if (hasVercelAnalytics(analyticsWindow)) {
    analyticsWindow.va('track', eventName, properties);
  }
};

const trackWithGoogleAnalytics = (
  eventName: string,
  properties: Record<string, unknown>,
) => {
  if (typeof window === 'undefined') return;
  const analyticsWindow = window as Window & { gtag?: unknown };
  if (hasGoogleAnalytics(analyticsWindow)) {
    analyticsWindow.gtag('event', eventName, properties);
  }
};

export function EnterpriseAnalytics({
  children,
  config = defaultConfig,
}: {
  children: ReactNode;
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
      {/* Vercel Analytics - 实时用户行为和性能监控 */}
      <Analytics />
      {/* Vercel Speed Insights - 实时性能指标监控 */}
      <SpeedInsights />
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
        try {
          trackWithVercelAnalytics('Web Vital', {
            metric_name: metric.name,
            metric_value: metric.value,
            metric_rating: metric.rating,
            locale,
          });
        } catch (error) {
          logger.error('Failed to send to Vercel Analytics:', error);
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

  history.pushState = function pushStateWithTracking(...args) {
    trackNavigation(locale);
    return originalPushState.apply(this, args);
  };

  history.replaceState = function replaceStateWithTracking(...args) {
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
  try {
    trackWithVercelAnalytics('Navigation', {
      locale,
      url: window.location.href,
    });
  } catch (error) {
    logger.error('Failed to send navigation event:', error);
  }
}

function initPerformanceMonitoring(locale: string): void {
  // 监控页面加载性能
  const collectPerformanceMetrics = () => {
    const navigationEntries = performance.getEntriesByType(
      'navigation',
    ) as PerformanceNavigationTiming[];
    const navigation = navigationEntries.find(() => true);

    if (!navigation) {
      return;
    }

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

    const performancePayload = {
      dns: metrics.dns,
      tcp: metrics.tcp,
      request: metrics.request,
      response: metrics.response,
      dom: metrics.dom,
      load: metrics.load,
      total: metrics.total,
      locale,
    };

    // 发送性能指标
    try {
      trackWithVercelAnalytics('Performance', performancePayload);
    } catch (error) {
      logger.error('Failed to send performance metrics:', error);
    }
  };

  function handleLoadEvent() {
    setTimeout(collectPerformanceMetrics, ZERO);
  }

  window.addEventListener('load', handleLoadEvent);

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

    try {
      trackWithVercelAnalytics(eventName, properties);
    } catch (error) {
      logger.error('Failed to send to Vercel Analytics:', error);
    }

    try {
      trackWithGoogleAnalytics(eventName, properties);
    } catch (error) {
      logger.error('Failed to send to Google Analytics:', error);
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

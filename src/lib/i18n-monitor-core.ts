/**
 * 企业级国际化监控和错误追踪 - 主监控管理器
 * 提供统一的监控API和管理功能
 */

import type { I18nMetrics, Locale, TranslationError } from '@/types/i18n';
import {
  CACHE_LIMITS,
  PERFORMANCE_THRESHOLDS,
  REPORTING_THRESHOLDS,
  TIME_UNITS,
} from '@/constants/i18n-constants';
import { EventCollector } from '@/lib/i18n-event-collector';
import type {
  ErrorLevel,
  MonitoringConfig,
  MonitoringEvent,
  MonitoringEventType,
} from './i18n-monitoring-types';
import { PerformanceMonitor } from '@/lib/i18n-performance-monitor';

// 主监控管理器
export class I18nMonitor {
  private config: MonitoringConfig;
  private eventCollector: EventCollector;
  private performanceMonitor: PerformanceMonitor;

  constructor(config?: Partial<MonitoringConfig>) {
    const defaultConfig: MonitoringConfig = {
      enabled: process.env.NODE_ENV === 'production',
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      enableRemoteLogging: process.env.NODE_ENV === 'production',
      enablePerformanceTracking: true,
      enableQualityTracking: true,
      performanceThresholds: {
        translationLoadTime: PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME,
        cacheHitRate: PERFORMANCE_THRESHOLDS.GOOD,
        errorRate: REPORTING_THRESHOLDS.ERROR_RATE_ALERT,
        memoryUsage: CACHE_LIMITS.MAX_DETECTION_HISTORY,
      },
      qualityThresholds: {
        completeness: PERFORMANCE_THRESHOLDS.EXCELLENT,
        consistency: PERFORMANCE_THRESHOLDS.GOOD + 10,
        accuracy: PERFORMANCE_THRESHOLDS.EXCELLENT + 3,
        freshness: CACHE_LIMITS.MAX_DETECTION_HISTORY,
      },
      maxEvents: CACHE_LIMITS.MAX_PERFORMANCE_DATA_POINTS,
      flushInterval: TIME_UNITS.MINUTE,
    };

    const endpoint = process.env['NEXT_PUBLIC_I18N_MONITORING_ENDPOINT'];
    if (endpoint) {
      defaultConfig.remoteEndpoint = endpoint;
    }

    this.config = { ...defaultConfig, ...config };
    this.eventCollector = new EventCollector(this.config);
    this.performanceMonitor = new PerformanceMonitor(
      this.config,
      this.eventCollector,
    );
  }

  // Public API methods
  recordTranslationMissing(key: string, locale: Locale): void {
    this.eventCollector.addEvent({
      type: 'translation_missing' as MonitoringEventType,
      level: 'warning' as ErrorLevel,
      locale,
      message: `Missing translation for key: ${key}`,
      metadata: { key },
    });
  }

  recordLocaleSwitch(
    fromLocale: Locale,
    toLocale: Locale,
    duration: number,
  ): void {
    this.eventCollector.addEvent({
      type: 'locale_switch' as MonitoringEventType,
      level: 'info' as ErrorLevel,
      locale: toLocale,
      message: `Locale switched from ${fromLocale} to ${toLocale}`,
      metadata: { fromLocale, toLocale, duration },
    });
  }

  recordLoadTime(time: number, locale: Locale): void {
    this.performanceMonitor.recordLoadTime(time, locale);
  }

  recordCacheHit(locale: Locale): void {
    this.performanceMonitor.recordCacheHit(locale);
  }

  recordCacheMiss(locale: Locale): void {
    this.performanceMonitor.recordCacheMiss(locale);
  }

  recordError(error: TranslationError, locale: Locale): void {
    this.performanceMonitor.recordError(error, locale);
  }

  getMetrics(): I18nMetrics {
    return this.performanceMonitor.getMetrics();
  }

  getEvents(): MonitoringEvent[] {
    return this.eventCollector.getEvents();
  }

  async flush(): Promise<void> {
    await this.eventCollector.flush();
  }

  reset(): void {
    this.eventCollector.clearEvents();
    this.performanceMonitor.reset();
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.eventCollector.updateConfig(this.config);
    this.performanceMonitor.updateConfig(this.config);
  }

  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  enable(): void {
    this.updateConfig({ enabled: true });
  }

  disable(): void {
    this.updateConfig({ enabled: false });
  }
}

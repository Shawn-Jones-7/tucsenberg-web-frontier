/**
 * 企业级国际化监控和错误追踪 - 主监控管理器
 * 提供统一的监控API和管理功能
 */

import type { I18nMetrics, Locale, TranslationError } from '@/types/i18n';
import { EventCollector } from '@/lib/i18n-event-collector';
import type {
  ErrorLevel,
  MonitoringConfig,
  MonitoringEvent,
  MonitoringEventType,
} from '@/lib/i18n-monitoring-types';
import { I18nPerformanceMonitor as PerformanceMonitor } from '@/lib/i18n-performance';
import { COUNT_TEN, COUNT_TRIPLE } from '@/constants';
import {
  CACHE_LIMITS,
  PERFORMANCE_THRESHOLDS,
  REPORTING_THRESHOLDS,
  TIME_UNITS,
} from '@/constants/i18n-constants';

// 主监控管理器
export class I18nMonitor {
  private config: MonitoringConfig;
  private eventCollector: EventCollector;
  // 性能监控使用静态方法，无需实例

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
        consistency: PERFORMANCE_THRESHOLDS.GOOD + COUNT_TEN,
        accuracy: PERFORMANCE_THRESHOLDS.EXCELLENT + COUNT_TRIPLE,
        freshness: CACHE_LIMITS.MAX_DETECTION_HISTORY,
      },
      maxEvents: CACHE_LIMITS.MAX_PERFORMANCE_DATA_POINTS,
      flushInterval: TIME_UNITS.MINUTE,
    };

    const endpoint = process.env['NEXT_PUBLIC_I18N_MONITORING_ENDPOINT'];
    if (endpoint) {
      defaultConfig.remoteEndpoint = endpoint;
    }

    // nosemgrep: object-injection-sink-spread-operator -- 配置源于受控默认值与受信任的局部配置
    this.config = { ...defaultConfig, ...config };
    this.eventCollector = new EventCollector(this.config);
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

  recordLoadTime(time: number, _locale: Locale): void {
    PerformanceMonitor.recordLoadTime(time);
  }

  recordCacheHit(_locale: Locale): void {
    PerformanceMonitor.recordCacheHit();
  }

  recordCacheMiss(_locale: Locale): void {
    PerformanceMonitor.recordCacheMiss();
  }

  recordError(_error: TranslationError, _locale: Locale): void {
    PerformanceMonitor.recordError();
  }

  getMetrics(): I18nMetrics {
    const perfMetrics = PerformanceMonitor.getMetrics();
    // 适配器：将PerformanceMonitor的返回值转换为I18nMetrics格式
    return {
      loadTime: perfMetrics.averageLoadTime,
      cacheHitRate: perfMetrics.cacheHitRate,
      errorRate:
        perfMetrics.totalRequests > 0
          ? perfMetrics.totalErrors / perfMetrics.totalRequests
          : 0,
      translationCoverage: 1.0, // 简化后默认100%覆盖
      localeUsage: { en: 0.5, zh: 0.5 }, // 简化后默认均匀分布
    };
  }

  getEvents(): MonitoringEvent[] {
    return this.eventCollector.getEvents();
  }

  async flush(): Promise<void> {
    await this.eventCollector.flush();
  }

  reset(): void {
    this.eventCollector.clearEvents();
    PerformanceMonitor.reset();
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    // nosemgrep: object-injection-sink-spread-operator -- 仅合并受控配置对象
    this.config = { ...this.config, ...newConfig };
    this.eventCollector.updateConfig(this.config);
    // PerformanceMonitor 是静态类，无需更新配置
  }

  getConfig(): MonitoringConfig {
    // nosemgrep: object-injection-sink-spread-operator -- 返回配置副本用于只读用途
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

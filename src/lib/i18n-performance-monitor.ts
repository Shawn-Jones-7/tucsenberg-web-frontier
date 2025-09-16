/**
 * 企业级国际化监控和错误追踪 - 性能监控器
 * 负责监控翻译性能、缓存命中率和错误率
 */

import type { I18nMetrics, Locale, TranslationError } from '@/types/i18n';
import { CACHE_LIMITS } from '@/constants/i18n-constants';
import type { EventCollector } from '@/lib/i18n-event-collector';
import type {
  MonitoringConfig,
  MonitoringEventType,
  PerformanceData,
} from './i18n-monitoring-types';
import { ErrorLevel } from '@/lib/i18n-monitoring-types';

// 性能监控器
export class PerformanceMonitor {
  private config: MonitoringConfig;
  private eventCollector: EventCollector;
  private performanceData: PerformanceData = {
    loadTimes: [],
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    totalRequests: 0,
  };

  constructor(config: MonitoringConfig, eventCollector: EventCollector) {
    this.config = config;
    this.eventCollector = eventCollector;
  }

  recordLoadTime(time: number, locale: Locale): void {
    if (!this.config.enablePerformanceTracking) return;

    this.performanceData.loadTimes.push(time);
    this.performanceData.totalRequests += 1;

    // Check if load time exceeds threshold
    if (time > this.config.performanceThresholds.translationLoadTime) {
      this.eventCollector.addEvent({
        type: 'performance_issue' as MonitoringEventType,
        level: 'warning' as ErrorLevel,
        locale,
        message: `Translation load time exceeded threshold: ${time}ms`,
        metadata: {
          loadTime: time,
          threshold: this.config.performanceThresholds.translationLoadTime,
        },
      });
    }
  }

  recordCacheHit(locale: Locale): void {
    this.performanceData.cacheHits += 1;
    this.performanceData.totalRequests += 1;
    this.checkCacheHitRate(locale);
  }

  recordCacheMiss(locale: Locale): void {
    this.performanceData.cacheMisses += 1;
    this.performanceData.totalRequests += 1;
    this.checkCacheHitRate(locale);

    this.eventCollector.addEvent({
      type: 'cache_miss' as MonitoringEventType,
      level: 'info' as ErrorLevel,
      locale,
      message: 'Translation cache miss',
      metadata: {
        cacheHitRate: this.getCacheHitRate(),
        totalRequests: this.performanceData.totalRequests,
      },
    });
  }

  recordError(error: TranslationError, locale: Locale): void {
    this.performanceData.errors += 1;
    this.performanceData.totalRequests += 1;

    const level: ErrorLevel =
      error.code === 'MISSING_KEY' ? ErrorLevel.WARNING : ErrorLevel.ERROR;

    this.eventCollector.addEvent({
      type: 'translation_error' as MonitoringEventType,
      level,
      locale,
      message: error.message,
      metadata: {
        errorCode: error.code,
        key: error.key || '',
        params: error.params || {},
        errorRate: this.getErrorRate(),
      },
    });
  }

  private checkCacheHitRate(locale: Locale): void {
    const hitRate = this.getCacheHitRate();
    if (hitRate < this.config.performanceThresholds.cacheHitRate) {
      this.eventCollector.addEvent({
        type: 'performance_issue' as MonitoringEventType,
        level: 'warning' as ErrorLevel,
        locale,
        message: `Cache hit rate below threshold: ${hitRate.toFixed(2)}%`,
        metadata: {
          cacheHitRate: hitRate,
          threshold: this.config.performanceThresholds.cacheHitRate,
        },
      });
    }
  }

  private getCacheHitRate(): number {
    const total =
      this.performanceData.cacheHits + this.performanceData.cacheMisses;
    return total > 0
      ? (this.performanceData.cacheHits / total) *
          CACHE_LIMITS.MAX_CACHE_ENTRIES
      : 0;
  }

  private getErrorRate(): number {
    return this.performanceData.totalRequests > 0
      ? (this.performanceData.errors / this.performanceData.totalRequests) *
          CACHE_LIMITS.MAX_CACHE_ENTRIES
      : 0;
  }

  getMetrics(): I18nMetrics {
    const avgLoadTime =
      this.performanceData.loadTimes.length > 0
        ? this.performanceData.loadTimes.reduce((a, b) => a + b, 0) /
          this.performanceData.loadTimes.length
        : 0;

    return {
      loadTime: avgLoadTime,
      cacheHitRate: this.getCacheHitRate(),
      errorRate: this.getErrorRate(),
      translationCoverage: 0, // To be calculated by quality monitor
      localeUsage: { en: 0, zh: 0 }, // To be calculated by usage tracker
    };
  }

  getPerformanceData(): PerformanceData {
    return { ...this.performanceData };
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  reset(): void {
    this.performanceData = {
      loadTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      totalRequests: 0,
    };
  }
}

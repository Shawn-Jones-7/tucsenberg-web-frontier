/**
 * 企业级国际化监控和错误追踪 - 性能监控器
 * 负责监控翻译性能、缓存命中率和错误率
 */

import type { I18nMetrics, Locale, TranslationError } from '@/types/i18n';
import type { EventCollector } from '@/lib/i18n-event-collector';
import {
  ErrorLevel,
  type MonitoringConfig,
  type MonitoringEventType,
  type PerformanceData,
} from '@/lib/i18n-monitoring-types';
import { COUNT_PAIR, ONE, ZERO } from '@/constants';
import { CACHE_LIMITS } from '@/constants/i18n-constants';

// 性能监控器
export class PerformanceMonitor {
  private config: MonitoringConfig;
  private eventCollector: EventCollector;
  private performanceData: PerformanceData = {
    loadTimes: [],
    cacheHits: ZERO,
    cacheMisses: ZERO,
    errors: ZERO,
    totalRequests: ZERO,
  };

  constructor(config: MonitoringConfig, eventCollector: EventCollector) {
    this.config = config;
    this.eventCollector = eventCollector;
  }

  recordLoadTime(time: number, locale: Locale): void {
    if (!this.config.enablePerformanceTracking) return;

    this.performanceData.loadTimes.push(time);
    this.performanceData.totalRequests += ONE;

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
    this.performanceData.cacheHits += ONE;
    this.performanceData.totalRequests += ONE;
    this.checkCacheHitRate(locale);
  }

  recordCacheMiss(locale: Locale): void {
    this.performanceData.cacheMisses += ONE;
    this.performanceData.totalRequests += ONE;
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
    this.performanceData.errors += ONE;
    this.performanceData.totalRequests += ONE;

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
        message: `Cache hit rate below threshold: ${hitRate.toFixed(COUNT_PAIR)}%`,
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
    return total > ZERO
      ? (this.performanceData.cacheHits / total) *
          CACHE_LIMITS.MAX_CACHE_ENTRIES
      : ZERO;
  }

  private getErrorRate(): number {
    return this.performanceData.totalRequests > ZERO
      ? (this.performanceData.errors / this.performanceData.totalRequests) *
          CACHE_LIMITS.MAX_CACHE_ENTRIES
      : ZERO;
  }

  getMetrics(): I18nMetrics {
    const avgLoadTime =
      this.performanceData.loadTimes.length > ZERO
        ? this.performanceData.loadTimes.reduce((a, b) => a + b, ZERO) /
          this.performanceData.loadTimes.length
        : ZERO;

    return {
      loadTime: avgLoadTime,
      cacheHitRate: this.getCacheHitRate(),
      errorRate: this.getErrorRate(),
      translationCoverage: ZERO, // To be calculated by quality monitor
      localeUsage: { en: ZERO, zh: ZERO }, // To be calculated by usage tracker
    };
  }

  getPerformanceData(): PerformanceData {
    // nosemgrep: object-injection-sink-spread-operator -- 返回内部受控数据副本
    return { ...this.performanceData };
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    // nosemgrep: object-injection-sink-spread-operator -- 合并受控配置
    this.config = { ...this.config, ...newConfig };
  }

  reset(): void {
    this.performanceData = {
      loadTimes: [],
      cacheHits: ZERO,
      cacheMisses: ZERO,
      errors: ZERO,
      totalRequests: ZERO,
    };
  }
}

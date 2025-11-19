/**
 * 国际化性能指标收集器
 *
 * 负责收集和管理 i18n 系统的性能指标，包括缓存命中率、加载时间、错误率等
 */

import type { I18nMetrics, Locale } from '@/types/i18n';
import type {
  CacheEvent,
  CacheEventListener,
  CacheEventType,
  MetricsCollector,
} from '@/lib/i18n-cache-types';
import { logger } from '@/lib/logger';
import {
  ANGLE_90_DEG,
  COUNT_PAIR,
  COUNT_TEN,
  DAYS_PER_MONTH,
  HTTP_OK,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  PERCENTAGE_QUARTER,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import {
  COUNT_35,
  MAGIC_20,
  MAGIC_40,
  MAGIC_70,
  MAGIC_80,
  MAGIC_95,
} from '@/constants/count';
import {
  MAGIC_0_1,
  MAGIC_0_5,
  MAGIC_0_9,
  MAGIC_0_95,
  MAGIC_0_99,
} from '@/constants/decimal';
import { MINUTE_MS } from '@/constants/time';

// 性能指标收集器实现
export class I18nMetricsCollector implements MetricsCollector {
  private metrics: I18nMetrics = {
    loadTime: ZERO,
    cacheHitRate: ZERO,
    errorRate: ZERO,
    translationCoverage: ZERO,
    localeUsage: { en: ZERO, zh: ZERO },
  };

  private totalRequests = ZERO;
  private cacheHits = ZERO;
  private errors = ZERO;
  private loadTimes: number[] = [];
  private localeUsageCount: { en: number; zh: number } = { en: ZERO, zh: ZERO };
  private eventListeners: Map<CacheEventType | '*', CacheEventListener[]> =
    new Map();

  private static isAllowedEventType(
    type: string,
  ): type is CacheEventType | '*' {
    switch (type) {
      case 'hit':
      case 'miss':
      case 'set':
      case 'delete':
      case 'clear':
      case 'expire':
      case 'preload_start':
      case 'preload_complete':
      case 'preload_error':
      case '*':
        return true;
      default:
        return false;
    }
  }
  private startTime = Date.now();

  // 记录加载时间
  recordLoadTime(time: number): void {
    this.loadTimes.push(time);

    // 保持最近 100 次记录以计算平均值
    if (this.loadTimes.length > PERCENTAGE_FULL) {
      this.loadTimes = this.loadTimes.slice(-PERCENTAGE_FULL);
    }

    this.metrics.loadTime =
      this.loadTimes.reduce((a, b) => a + b, ZERO) / this.loadTimes.length;

    this.emitEvent({
      type: 'hit',
      timestamp: Date.now(),
      metadata: { loadTime: time },
    });
  }

  // 记录缓存命中
  recordCacheHit(): void {
    this.cacheHits += ONE;
    this.totalRequests += ONE;
    this.updateCacheHitRate();

    this.emitEvent({
      type: 'hit',
      timestamp: Date.now(),
      metadata: {
        totalHits: this.cacheHits,
        totalRequests: this.totalRequests,
        hitRate: this.metrics.cacheHitRate,
      },
    });
  }

  // 记录缓存未命中
  recordCacheMiss(): void {
    this.totalRequests += ONE;
    this.updateCacheHitRate();

    this.emitEvent({
      type: 'miss',
      timestamp: Date.now(),
      metadata: {
        totalRequests: this.totalRequests,
        hitRate: this.metrics.cacheHitRate,
      },
    });
  }

  // 记录错误
  recordError(): void {
    this.errors += ONE;
    this.updateErrorRate();

    this.emitEvent({
      type: 'preload_error',
      timestamp: Date.now(),
      metadata: {
        totalErrors: this.errors,
        errorRate: this.metrics.errorRate,
      },
    });
  }

  // 记录语言使用情况
  recordLocaleUsage(locale: Locale): void {
    if (locale === 'en') {
      this.localeUsageCount.en += ONE;
    } else if (locale === 'zh') {
      this.localeUsageCount.zh += ONE;
    }
    this.updateLocaleUsage();

    this.emitEvent({
      type: 'hit',
      timestamp: Date.now(),
      metadata: {
        locale,
        usageCount:
          locale === 'en' ? this.localeUsageCount.en : this.localeUsageCount.zh,
        totalUsage: this.getTotalLocaleUsage(),
      },
    });
  }

  // 记录翻译覆盖率
  recordTranslationCoverage(coverage: number): void {
    const safeCoverage = Math.min(Math.max(coverage, ZERO), ONE);
    this.metrics.translationCoverage = safeCoverage;

    this.emitEvent({
      type: 'set',
      timestamp: Date.now(),
      metadata: {
        translationCoverage: safeCoverage,
      },
    });
  }

  // 获取当前指标
  getMetrics(): I18nMetrics {
    // nosemgrep: object-injection-sink-spread-operator -- 返回内部受控指标副本
    return { ...this.metrics };
  }

  // 重置指标
  reset(): void {
    this.metrics = {
      loadTime: ZERO,
      cacheHitRate: ZERO,
      errorRate: ZERO,
      translationCoverage: ZERO,
      localeUsage: { en: ZERO, zh: ZERO },
    };

    this.totalRequests = ZERO;
    this.cacheHits = ZERO;
    this.errors = ZERO;
    this.loadTimes = [];
    this.localeUsageCount = { en: ZERO, zh: ZERO };
    this.startTime = Date.now();

    this.emitEvent({
      type: 'clear',
      timestamp: Date.now(),
      metadata: { reason: 'metrics_reset' },
    });
  }

  // 获取详细统计信息
  getDetailedStats() {
    const uptime = Date.now() - this.startTime;
    const requestsPerMinute =
      this.totalRequests > ZERO
        ? this.totalRequests / (uptime / MINUTE_MS)
        : ZERO;

    return {
      uptime,
      totalRequests: this.totalRequests,
      cacheHits: this.cacheHits,
      cacheMisses: this.totalRequests - this.cacheHits,
      errors: this.errors,
      requestsPerMinute,
      averageLoadTime: this.metrics.loadTime,
      loadTimePercentiles: this.calculateLoadTimePercentiles(),
      localeDistribution: this.getLocaleDistribution(),
      performanceGrade: this.calculatePerformanceGrade(),
    };
  }

  // 添加事件监听器
  addEventListener(
    eventType: CacheEventType | '*',
    listener: CacheEventListener,
  ): void {
    if (!I18nMetricsCollector.isAllowedEventType(eventType)) return;
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  // 移除事件监听器
  removeEventListener(
    eventType: CacheEventType | '*',
    listener: CacheEventListener,
  ): void {
    if (!I18nMetricsCollector.isAllowedEventType(eventType)) return;
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -ONE) {
        listeners.splice(index, ONE);
      }
    }
  }

  // 发出事件
  private emitEvent(event: CacheEvent): void {
    const listeners = I18nMetricsCollector.isAllowedEventType(event.type)
      ? this.eventListeners.get(event.type)
      : undefined;
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          logger.error('Error in cache event listener:', error);
        }
      });
    }

    // 也发送给通用监听器
    const allListeners = this.eventListeners.get('*');
    if (allListeners) {
      allListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          logger.error('Error in cache event listener:', error);
        }
      });
    }
  }

  // 更新缓存命中率
  private updateCacheHitRate(): void {
    this.metrics.cacheHitRate =
      this.totalRequests > ZERO ? this.cacheHits / this.totalRequests : ZERO;
  }

  // 更新错误率
  private updateErrorRate(): void {
    this.metrics.errorRate =
      this.totalRequests > ZERO ? this.errors / this.totalRequests : ZERO;
  }

  // 更新语言使用情况
  private updateLocaleUsage(): void {
    const enCount = this.localeUsageCount.en;
    const zhCount = this.localeUsageCount.zh;
    this.metrics.localeUsage = {
      en: enCount,
      zh: zhCount,
    };
  }

  // 获取总语言使用次数
  private getTotalLocaleUsage(): number {
    return Object.values(this.localeUsageCount).reduce(
      (sum, count) => sum + count,
      ZERO,
    );
  }

  // 计算加载时间百分位数
  private calculateLoadTimePercentiles() {
    if (this.loadTimes.length === ZERO) {
      return { p50: ZERO, p90: ZERO, p95: ZERO, p99: ZERO };
    }

    const sorted = [...this.loadTimes].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      p50: sorted.at(Math.floor(len * MAGIC_0_5)) ?? ZERO,
      p90: sorted.at(Math.floor(len * MAGIC_0_9)) ?? ZERO,
      p95: sorted.at(Math.floor(len * MAGIC_0_95)) ?? ZERO,
      p99: sorted.at(Math.floor(len * MAGIC_0_99)) ?? ZERO,
    };
  }

  // 获取语言分布
  private getLocaleDistribution() {
    const total = this.getTotalLocaleUsage();
    return Object.entries(this.localeUsageCount).map(([locale, count]) => ({
      locale,
      count,
      percentage: total > ZERO ? (count / total) * PERCENTAGE_FULL : ZERO,
    }));
  }

  // 计算性能等级
  private calculatePerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const hitRatePercent = this.metrics.cacheHitRate * PERCENTAGE_FULL;
    const errorRatePercent = this.metrics.errorRate * PERCENTAGE_FULL;
    const avgLoadTime = this.metrics.loadTime;

    // 基于多个指标计算综合评分
    let score = ZERO;

    // 缓存命中率评分 (40%)
    if (hitRatePercent >= MAGIC_95) score += MAGIC_40;
    else if (hitRatePercent >= ANGLE_90_DEG) score += COUNT_35;
    else if (hitRatePercent >= MAGIC_80) score += DAYS_PER_MONTH;
    else if (hitRatePercent >= MAGIC_70) score += MAGIC_20;
    else score += COUNT_TEN;

    // 错误率评分 (30%)
    if (errorRatePercent <= MAGIC_0_1) score += DAYS_PER_MONTH;
    else if (errorRatePercent <= MAGIC_0_5) score += PERCENTAGE_QUARTER;
    else if (errorRatePercent <= ONE) score += MAGIC_20;
    else if (errorRatePercent <= COUNT_PAIR) score += COUNT_TEN;
    else score += ZERO;

    // 平均加载时间评分 (30%)
    if (avgLoadTime <= COUNT_TEN) score += DAYS_PER_MONTH;
    else if (avgLoadTime <= PERCENTAGE_HALF) score += PERCENTAGE_QUARTER;
    else if (avgLoadTime <= PERCENTAGE_FULL) score += MAGIC_20;
    else if (avgLoadTime <= HTTP_OK) score += COUNT_TEN;
    else score += ZERO;

    // 根据总分确定等级
    if (score >= ANGLE_90_DEG) return 'A';
    if (score >= MAGIC_80) return 'B';
    if (score >= MAGIC_70) return 'C';
    if (score >= SECONDS_PER_MINUTE) return 'D';
    return 'F';
  }

  // 生成性能报告
  generatePerformanceReport() {
    const stats = this.getDetailedStats();
    const percentiles = this.calculateLoadTimePercentiles();
    const grade = this.calculatePerformanceGrade();

    return {
      summary: {
        grade,
        uptime: stats.uptime,
        totalRequests: stats.totalRequests,
        averageLoadTime: stats.averageLoadTime,
        cacheHitRate: this.metrics.cacheHitRate,
        errorRate: this.metrics.errorRate,
      },
      performance: {
        requestsPerMinute: stats.requestsPerMinute,
        loadTimePercentiles: percentiles,
        cacheEfficiency: {
          hits: stats.cacheHits,
          misses: stats.cacheMisses,
          hitRate: this.metrics.cacheHitRate,
        },
      },
      usage: {
        localeDistribution: stats.localeDistribution,
        totalErrors: stats.errors,
      },
      recommendations: this.generateRecommendations(stats, grade),
    };
  }

  // 生成性能建议
  private generateRecommendations(
    stats: Record<string, unknown>,
    grade: string,
  ): string[] {
    const recommendations: string[] = [];

    const hitRatePercent = this.metrics.cacheHitRate * PERCENTAGE_FULL;
    const errorRatePercent = this.metrics.errorRate * PERCENTAGE_FULL;

    if (hitRatePercent < MAGIC_80) {
      recommendations.push('考虑增加缓存大小或调整 TTL 以提高缓存命中率');
    }

    if (errorRatePercent > ONE) {
      recommendations.push('错误率较高，建议检查网络连接和翻译文件完整性');
    }

    if (this.metrics.loadTime > PERCENTAGE_FULL) {
      recommendations.push(
        '平均加载时间较长，考虑启用预加载或优化翻译文件大小',
      );
    }

    const requestsPerMinute =
      typeof stats.requestsPerMinute === 'number'
        ? stats.requestsPerMinute
        : ZERO;
    if (requestsPerMinute > PERCENTAGE_FULL) {
      recommendations.push('请求频率较高，建议增加缓存容量');
    }

    if (grade === 'D' || grade === 'F') {
      recommendations.push('整体性能需要改进，建议全面优化缓存策略');
    }

    return recommendations;
  }
}

// 创建默认指标收集器实例
export const defaultMetricsCollector = new I18nMetricsCollector();

// 导出工具函数
export function createMetricsCollector(): I18nMetricsCollector {
  return new I18nMetricsCollector();
}

export function formatMetrics(metrics: I18nMetrics): string {
  return `
缓存命中率: ${(metrics.cacheHitRate * PERCENTAGE_FULL).toFixed(COUNT_PAIR)}%
平均加载时间: ${metrics.loadTime.toFixed(COUNT_PAIR)}ms
错误率: ${(metrics.errorRate * PERCENTAGE_FULL).toFixed(COUNT_PAIR)}%
翻译覆盖率: ${metrics.translationCoverage.toFixed(COUNT_PAIR)}%
语言使用分布: ${Object.entries(metrics.localeUsage)
    .map(([locale, usage]) => `${locale}: ${usage.toFixed(ONE)}%`)
    .join(', ')}
  `.trim();
}

// 导出类型别名
export type { I18nMetricsCollector as MetricsCollector };

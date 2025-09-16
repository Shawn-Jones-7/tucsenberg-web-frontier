/**
 * 国际化性能指标收集器
 *
 * 负责收集和管理 i18n 系统的性能指标，包括缓存命中率、加载时间、错误率等
 */

import type { I18nMetrics, Locale } from '@/types/i18n';
import { logger } from '@/lib/logger';
import type {
  CacheEvent,
  CacheEventListener,
  MetricsCollector,
} from './i18n-cache-types';

// 性能指标收集器实现
export class I18nMetricsCollector implements MetricsCollector {
  private metrics: I18nMetrics = {
    loadTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    translationCoverage: 0,
    localeUsage: { en: 0, zh: 0 },
  };

  private totalRequests = 0;
  private cacheHits = 0;
  private errors = 0;
  private loadTimes: number[] = [];
  private localeUsageCount: Record<string, number> = {};
  private eventListeners: Map<string, CacheEventListener[]> = new Map();
  private startTime = Date.now();

  // 记录加载时间
  recordLoadTime(time: number): void {
    this.loadTimes.push(time);

    // 保持最近 100 次记录以计算平均值
    if (this.loadTimes.length > 100) {
      this.loadTimes = this.loadTimes.slice(-100);
    }

    this.metrics.loadTime =
      this.loadTimes.reduce((a, b) => a + b, 0) / this.loadTimes.length;

    this.emitEvent({
      type: 'hit',
      timestamp: Date.now(),
      metadata: { loadTime: time },
    });
  }

  // 记录缓存命中
  recordCacheHit(): void {
    this.cacheHits += 1;
    this.totalRequests += 1;
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
    this.totalRequests += 1;
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
    this.errors += 1;
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
    this.localeUsageCount[locale] = (this.localeUsageCount[locale] || 0) + 1;
    this.updateLocaleUsage();

    this.emitEvent({
      type: 'hit',
      timestamp: Date.now(),
      metadata: {
        locale,
        usageCount: this.localeUsageCount[locale],
        totalUsage: this.getTotalLocaleUsage(),
      },
    });
  }

  // 获取当前指标
  getMetrics(): I18nMetrics {
    return { ...this.metrics };
  }

  // 重置指标
  reset(): void {
    this.metrics = {
      loadTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      translationCoverage: 0,
      localeUsage: { en: 0, zh: 0 },
    };

    this.totalRequests = 0;
    this.cacheHits = 0;
    this.errors = 0;
    this.loadTimes = [];
    this.localeUsageCount = {};
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
      this.totalRequests > 0 ? this.totalRequests / (uptime / 60000) : 0;

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
  addEventListener(eventType: string, listener: CacheEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  // 移除事件监听器
  removeEventListener(eventType: string, listener: CacheEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 发出事件
  private emitEvent(event: CacheEvent): void {
    const listeners = this.eventListeners.get(event.type);
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
      this.totalRequests > 0 ? (this.cacheHits / this.totalRequests) * 100 : 0;
  }

  // 更新错误率
  private updateErrorRate(): void {
    this.metrics.errorRate =
      this.totalRequests > 0 ? (this.errors / this.totalRequests) * 100 : 0;
  }

  // 更新语言使用情况
  private updateLocaleUsage(): void {
    const total = this.getTotalLocaleUsage();
    if (total > 0) {
      this.metrics.localeUsage = Object.keys(this.localeUsageCount).reduce(
        (acc, locale) => {
          acc[locale as Locale] =
            ((this.localeUsageCount[locale] ?? 0) / total) * 100;
          return acc;
        },
        {} as Record<Locale, number>,
      );
    }
  }

  // 获取总语言使用次数
  private getTotalLocaleUsage(): number {
    return Object.values(this.localeUsageCount).reduce(
      (sum, count) => sum + count,
      0,
    );
  }

  // 计算加载时间百分位数
  private calculateLoadTimePercentiles() {
    if (this.loadTimes.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 };
    }

    const sorted = [...this.loadTimes].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      p50: sorted[Math.floor(len * 0.5)],
      p90: sorted[Math.floor(len * 0.9)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)],
    };
  }

  // 获取语言分布
  private getLocaleDistribution() {
    const total = this.getTotalLocaleUsage();
    return Object.entries(this.localeUsageCount).map(([locale, count]) => ({
      locale,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));
  }

  // 计算性能等级
  private calculatePerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const hitRate = this.metrics.cacheHitRate;
    const {errorRate} = this.metrics;
    const avgLoadTime = this.metrics.loadTime;

    // 基于多个指标计算综合评分
    let score = 0;

    // 缓存命中率评分 (40%)
    if (hitRate >= 95) score += 40;
    else if (hitRate >= 90) score += 35;
    else if (hitRate >= 80) score += 30;
    else if (hitRate >= 70) score += 20;
    else score += 10;

    // 错误率评分 (30%)
    if (errorRate <= 0.1) score += 30;
    else if (errorRate <= 0.5) score += 25;
    else if (errorRate <= 1) score += 20;
    else if (errorRate <= 2) score += 10;
    else score += 0;

    // 平均加载时间评分 (30%)
    if (avgLoadTime <= 10) score += 30;
    else if (avgLoadTime <= 50) score += 25;
    else if (avgLoadTime <= 100) score += 20;
    else if (avgLoadTime <= 200) score += 10;
    else score += 0;

    // 根据总分确定等级
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
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

    if (this.metrics.cacheHitRate < 80) {
      recommendations.push('考虑增加缓存大小或调整 TTL 以提高缓存命中率');
    }

    if (this.metrics.errorRate > 1) {
      recommendations.push('错误率较高，建议检查网络连接和翻译文件完整性');
    }

    if (this.metrics.loadTime > 100) {
      recommendations.push(
        '平均加载时间较长，考虑启用预加载或优化翻译文件大小',
      );
    }

    const requestsPerMinute =
      typeof stats.requestsPerMinute === 'number' ? stats.requestsPerMinute : 0;
    if (requestsPerMinute > 100) {
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
缓存命中率: ${metrics.cacheHitRate.toFixed(2)}%
平均加载时间: ${metrics.loadTime.toFixed(2)}ms
错误率: ${metrics.errorRate.toFixed(2)}%
翻译覆盖率: ${metrics.translationCoverage.toFixed(2)}%
语言使用分布: ${Object.entries(metrics.localeUsage)
    .map(([locale, usage]) => `${locale}: ${usage.toFixed(1)}%`)
    .join(', ')}
  `.trim();
}

// 导出类型别名
export type { I18nMetricsCollector as MetricsCollector };

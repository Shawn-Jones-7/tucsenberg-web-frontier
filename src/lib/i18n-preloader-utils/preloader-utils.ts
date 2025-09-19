/**
 * 预加载器工具函数
 * Preloader Utility Functions
 */

import type { Locale, Messages } from '@/types/i18n';
import type {
  IPreloader,
  PreloaderConfig,
  PreloaderMetrics,
  PreloadResult,
} from '@/lib/i18n-preloader-types';
import {
  ANIMATION_DURATION_VERY_SLOW,
  BYTES_PER_KB,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  COUNT_TRIPLE,
  FIVE_SECONDS_MS,
  HOURS_PER_DAY,
  MAGIC_0_1,
  MAGIC_0_2,
  MAGIC_0_8,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  SECONDS_PER_MINUTE,
  TEN_SECONDS_MS,
  ZERO,
} from '@/constants';
import { MINUTE_MS } from '@/constants/time';

/**
 * 预加载器工具函数
 * Preloader utility functions
 */
export const PreloaderUtils = {
  /**
   * 验证预加载配置
   * Validate preload configuration
   */
  validateConfig(config: Partial<PreloaderConfig>): boolean {
    if (config.batchSize && config.batchSize <= ZERO) {
      return false;
    }
    if (config.timeout && config.timeout <= ZERO) {
      return false;
    }
    if (config.retryCount && config.retryCount < ZERO) {
      return false;
    }
    return true;
  },

  /**
   * 合并配置
   * Merge configurations
   */
  mergeConfigs(
    base: PreloaderConfig,
    override: Partial<PreloaderConfig>,
  ): PreloaderConfig {
    return {
      ...base,
      ...override,
      smartPreload: {
        ...base.smartPreload,
        ...override.smartPreload,
      },
      events: {
        ...base.events,
        ...override.events,
      },
    };
  },

  /**
   * 计算预加载优先级
   * Calculate preload priority
   */
  calculatePriority(locale: Locale, metrics: PreloaderMetrics): number {
    // 基础优先级
    const basePriority = locale === 'en' ? COUNT_TEN : COUNT_FIVE;

    // 根据使用频率调整
    const usageBonus = Math.min(
      metrics.successfulPreloads * MAGIC_0_1,
      COUNT_FIVE,
    );

    // 根据错误率调整
    const errorPenalty = metrics.failedPreloads * MAGIC_0_2;

    return Math.max(basePriority + usageBonus - errorPenalty, ONE);
  },

  /**
   * 格式化预加载结果
   * Format preload result
   */
  formatResult(result: PreloadResult): string {
    const status = result.success ? '✅' : '❌';
    const time = `${result.loadTime}ms`;
    const source = result.fromCache ? '(cached)' : '(network)';

    return `${status} ${result.locale} ${time} ${source}`;
  },

  /**
   * 生成预加载报告
   * Generate preload report
   */
  generateReport(results: PreloadResult[]): {
    total: number;
    successful: number;
    failed: number;
    averageTime: number;
    cacheHitRate: number;
    details: string[];
  } {
    const total = results.length;
    const successful = results.filter((r) => r.success).length;
    const failed = total - successful;
    const cacheHits = results.filter((r) => r.fromCache).length;

    const totalTime = results.reduce((sum, r) => sum + r.loadTime, ZERO);
    const averageTime = total > ZERO ? totalTime / total : ZERO;
    const cacheHitRate = total > ZERO ? cacheHits / total : ZERO;

    const details = results.map((result) =>
      PreloaderUtils.formatResult(result),
    );

    return {
      total,
      successful,
      failed,
      averageTime,
      cacheHitRate,
      details,
    };
  },

  /**
   * 检查预加载器健康状态
   * Check preloader health
   */
  checkHealth(preloader: IPreloader): {
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    recommendations: string[];
  } {
    const stats = preloader.getPreloadStats();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 检查成功率
    if (stats.successRate < MAGIC_0_8) {
      issues.push(
        `Low success rate: ${(stats.successRate * PERCENTAGE_FULL).toFixed(ONE)}%`,
      );
      recommendations.push('Check network connectivity and API endpoints');
    }

    // 检查平均加载时间
    if (stats.averageLoadTime > FIVE_SECONDS_MS) {
      issues.push(`High average load time: ${stats.averageLoadTime}ms`);
      recommendations.push(
        'Consider optimizing network requests or reducing payload size',
      );
    }

    // 检查错误数量
    if (stats.errorCount > COUNT_FIVE) {
      issues.push(`High error count: ${stats.errorCount}`);
      recommendations.push(
        'Review error logs and implement better error handling',
      );
    }

    const status =
      issues.length === ZERO
        ? 'healthy'
        : issues.length <= COUNT_PAIR
          ? 'warning'
          : 'error';

    return { status, issues, recommendations };
  },

  /**
   * 创建默认配置
   * Create default configuration
   */
  createDefaultConfig(): PreloaderConfig {
    return {
      enablePreload: true,
      preloadLocales: ['en', 'zh'],
      batchSize: COUNT_TRIPLE,
      delayBetweenBatches: PERCENTAGE_FULL,
      maxConcurrency: COUNT_FIVE,
      timeout: TEN_SECONDS_MS,
      retryCount: COUNT_TRIPLE,
      retryDelay: ANIMATION_DURATION_VERY_SLOW,
      smartPreload: {
        enabled: true,
        maxLocales: COUNT_FIVE,
        minUsageThreshold: MAGIC_0_1,
        usageWindow: HOURS_PER_DAY,
        preloadTrigger: 'idle',
        scheduleInterval: SECONDS_PER_MINUTE,
      },
      memoryLimit: PERCENTAGE_HALF * BYTES_PER_KB * BYTES_PER_KB, // 50MB
      networkThrottling: false,
      priorityQueue: true,
      cacheStrategy: 'adaptive',
      cacheTTL:
        HOURS_PER_DAY *
        SECONDS_PER_MINUTE *
        SECONDS_PER_MINUTE *
        ANIMATION_DURATION_VERY_SLOW, // HOURS_PER_DAY hours
      maxCacheSize: PERCENTAGE_FULL,
      enableMetrics: true,
      metricsInterval: MINUTE_MS, // 1 minute
      enableLogging: true,
      logLevel: 'info',
    };
  },

  /**
   * 估算内存使用量
   * Estimate memory usage
   */
  estimateMemoryUsage(messages: Messages): number {
    const jsonString = JSON.stringify(messages);
    return new Blob([jsonString]).size;
  },

  /**
   * 检查浏览器支持
   * Check browser support
   */
  checkBrowserSupport(): {
    fetch: boolean;
    abortController: boolean;
    intersectionObserver: boolean;
    serviceWorker: boolean;
  } {
    return {
      fetch: typeof fetch !== 'undefined',
      abortController: typeof AbortController !== 'undefined',
      intersectionObserver: typeof IntersectionObserver !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
    };
  },
};

/**
 * 预加载器工具函数
 * Preloader Utility Functions
 */

import type { Locale, Messages } from '@/types/i18n';
import { COUNT_TEN, COUNT_FIVE, MAGIC_0_1, MAGIC_0_2, MAGIC_0_8, COUNT_PAIR, PERCENTAGE_HALF, BYTES_PER_KB, HOURS_PER_DAY, SECONDS_PER_MINUTE } from '@/constants/magic-numbers';

import type {
  IPreloader,
  PreloaderConfig,
  PreloaderMetrics,
  PreloadResult,
} from '../i18n-preloader-types';

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
    if (config.batchSize && config.batchSize <= 0) {
      return false;
    }
    if (config.timeout && config.timeout <= 0) {
      return false;
    }
    if (config.retryCount && config.retryCount < 0) {
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
    const usageBonus = Math.min(metrics.successfulPreloads * MAGIC_0_1, COUNT_FIVE);

    // 根据错误率调整
    const errorPenalty = metrics.failedPreloads * MAGIC_0_2;

    return Math.max(basePriority + usageBonus - errorPenalty, 1);
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

    const totalTime = results.reduce((sum, r) => sum + r.loadTime, 0);
    const averageTime = total > 0 ? totalTime / total : 0;
    const cacheHitRate = total > 0 ? cacheHits / total : 0;

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
      issues.push(`Low success rate: ${(stats.successRate * 100).toFixed(1)}%`);
      recommendations.push('Check network connectivity and API endpoints');
    }

    // 检查平均加载时间
    if (stats.averageLoadTime > 5000) {
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
      issues.length === 0
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
      batchSize: 3,
      delayBetweenBatches: 100,
      maxConcurrency: COUNT_FIVE,
      timeout: 10000,
      retryCount: 3,
      retryDelay: 1000,
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
      cacheTTL: HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000, // HOURS_PER_DAY hours
      maxCacheSize: 100,
      enableMetrics: true,
      metricsInterval: 60000, // 1 minute
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

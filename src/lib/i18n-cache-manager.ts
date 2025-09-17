/**
 * 国际化缓存管理器
 *
 * 主缓存管理器，整合 LRU 缓存、预加载器和性能指标收集器
 */

import { MAGIC_70, MAGIC_80 } from "@/constants/count";
import { CACHE_DURATIONS, CACHE_LIMITS } from '@/constants/i18n-constants';
import { ANGLE_90_DEG, ANIMATION_DURATION_VERY_SLOW, BYTES_PER_KB, COUNT_FIVE, COUNT_PAIR, COUNT_TEN, HTTP_OK, PERCENTAGE_FULL, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import { LRUCache } from '@/lib/i18n-lru-cache';
import { I18nMetricsCollector } from '@/lib/i18n-metrics-collector';
import { TranslationPreloader } from '@/lib/i18n-preloader';
import { logger } from '@/lib/logger';
import type { I18nMetrics, Locale, Messages } from '@/types/i18n';
import type {
  CacheConfig,
  CacheDebugInfo,
  CacheHealthCheck,
  CacheManager,
  CacheStats,
  PreloadConfig,
} from './i18n-cache-types';

// 主缓存管理器实现
export class I18nCacheManager implements CacheManager {
  private cache: LRUCache<Messages>;
  private preloader: TranslationPreloader;
  private metricsCollector: I18nMetricsCollector;
  private config: CacheConfig;
  private healthCheckInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    config?: Partial<CacheConfig>,
    preloadConfig?: Partial<PreloadConfig>,
  ) {
    // 默认配置
    const defaultConfig: CacheConfig = {
      maxSize: CACHE_LIMITS.MAX_CACHE_ENTRIES,
      ttl: CACHE_DURATIONS.PERFORMANCE_CACHE,
      enablePersistence: true,
      storageKey: 'i18n_cache',
    };

    this.config = { ...defaultConfig, ...config };
    this.metricsCollector = new I18nMetricsCollector();
    this.cache = new LRUCache<Messages>(this.config, this.metricsCollector);
    this.preloader = new TranslationPreloader(
      this.cache,
      this.metricsCollector,
      preloadConfig,
    );

    this.setupPeriodicTasks();
  }

  // 获取消息
  async getMessages(locale: Locale): Promise<Messages> {
    this.metricsCollector.recordLocaleUsage(locale);
    return this.preloader.preloadLocale(locale);
  }

  // 预加载消息
  preloadMessages(locale: Locale): Promise<Messages> {
    return this.preloader.preloadLocale(locale);
  }

  // 预热缓存
  warmupCache(): void {
    this.preloader.warmupCache();
  }

  // 获取性能指标
  getMetrics(): I18nMetrics {
    return this.metricsCollector.getMetrics();
  }

  // 获取缓存统计
  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }

  // 清空缓存
  clearCache(): void {
    this.cache.clear();
  }

  // 重置指标
  resetMetrics(): void {
    this.metricsCollector.reset();
  }

  // 获取详细统计信息
  getDetailedStats() {
    return {
      cache: this.cache.getDetailedStats(),
      metrics: this.metricsCollector.getDetailedStats(),
      preloader: this.preloader.getPreloadStats(),
      config: this.config,
    };
  }

  // 健康检查
  async performHealthCheck(): Promise<CacheHealthCheck> {
    const metrics = this.getMetrics();
    const stats = this.getCacheStats();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 检查缓存命中率
    if (metrics.cacheHitRate < MAGIC_70) {
      issues.push('缓存命中率过低');
      recommendations.push('考虑增加缓存大小或调整 TTL');
    }

    // 检查错误率
    if (metrics.errorRate > COUNT_FIVE) {
      issues.push('错误率过高');
      recommendations.push('检查网络连接和翻译文件完整性');
    }

    // 检查平均加载时间
    if (metrics.loadTime > HTTP_OK) {
      issues.push('平均加载时间过长');
      recommendations.push('启用预加载或优化翻译文件大小');
    }

    // 检查缓存利用率
    const utilizationRate = (stats.size / this.config.maxSize) * PERCENTAGE_FULL;
    if (utilizationRate > ANGLE_90_DEG) {
      issues.push('缓存接近满载');
      recommendations.push('考虑增加缓存大小');
    }

    return {
      isHealthy: issues.length === ZERO,
      issues,
      performance: {
        hitRate: metrics.cacheHitRate,
        averageLoadTime: metrics.loadTime,
        errorRate: metrics.errorRate,
      },
      recommendations,
    };
  }

  // 获取调试信息
  getDebugInfo(): CacheDebugInfo {
    return {
      config: this.config,
      stats: this.getCacheStats(),
      metrics: this.getMetrics(),
      recentEvents: [], // 可以从 metricsCollector 获取
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  // 优化缓存
  async optimizeCache(): Promise<void> {
    // 清理过期项
    const cleanedCount = this.cache.cleanup();
    logger.info('Cleaned expired cache entries', { cleanedCount });

    // 基于使用模式调整配置
    const metrics = this.getMetrics();
    if (metrics.cacheHitRate < MAGIC_80) {
      // 如果命中率低，尝试智能预加载
      await this.preloader.smartPreload();
    }
  }

  // 导出缓存数据
  exportCache(): string {
    const data = {
      version: '1.0',
      timestamp: Date.now(),
      config: this.config,
      entries: Array.from(this.cache.entries()),
      stats: this.getCacheStats(),
      metrics: this.getMetrics(),
    };

    return JSON.stringify(data, null, COUNT_PAIR);
  }

  // 导入缓存数据
  importCache(data: string): void {
    try {
      const parsed = JSON.parse(data);

      if (parsed.entries && Array.isArray(parsed.entries)) {
        this.cache.clear();
        parsed.entries.forEach(([key, value]: [string, Messages]) => {
          this.cache.set(key, value);
        });
      }
    } catch (error) {
      logger.error('Failed to import cache data', { error: error as Error });
      throw new Error('Invalid cache data format');
    }
  }

  // 批量操作
  async batchGetMessages(locales: Locale[]): Promise<Map<Locale, Messages>> {
    const results = new Map<Locale, Messages>();

    // 并行加载
    const promises = locales.map(async (locale) => {
      try {
        const messages = await this.getMessages(locale);
        results.set(locale, messages);
      } catch (error) {
        logger.error('Failed to load messages for locale', {
          locale,
          error: error as Error,
        });
      }
    });

    await Promise.all(promises);
    return results;
  }

  // 预加载多个语言
  async preloadMultipleLocales(locales: Locale[]): Promise<void> {
    await this.preloader.preloadMultipleLocales(locales);
  }

  // 设置缓存配置
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // 注意：这里可能需要重新创建缓存实例以应用新配置
  }

  // 设置预加载配置
  updatePreloadConfig(newConfig: Partial<PreloadConfig>): void {
    this.preloader.setConfig(newConfig);
  }

  // 获取性能报告
  generatePerformanceReport() {
    return this.metricsCollector.generatePerformanceReport();
  }

  // 添加事件监听器
  addEventListener(
    eventType: string,
    listener: (event: Record<string, unknown>) => void,
  ): void {
    // 创建适配器函数来转换事件类型
    const adaptedListener = (cacheEvent: any) => {
      listener(cacheEvent as Record<string, unknown>);
    };
    this.metricsCollector.addEventListener(eventType, adaptedListener);
  }

  // 移除事件监听器
  removeEventListener(
    eventType: string,
    listener: (event: Record<string, unknown>) => void,
  ): void {
    // 创建适配器函数来转换事件类型
    const adaptedListener = (cacheEvent: any) => {
      listener(cacheEvent as Record<string, unknown>);
    };
    this.metricsCollector.removeEventListener(eventType, adaptedListener);
  }

  // 估算内存使用量
  private estimateMemoryUsage() {
    const cacheStats = this.cache.getDetailedStats();
    return {
      used: cacheStats.memoryUsage || ZERO,
      total: this.config.maxSize * BYTES_PER_KB, // 估算值
      percentage: cacheStats.utilizationRate || ZERO,
    };
  }

  // 设置定期任务
  private setupPeriodicTasks(): void {
    // 定期健康检查
    this.healthCheckInterval = setInterval(
      async () => {
        const health = await this.performHealthCheck();
        if (!health.isHealthy) {
          console.warn('Cache health check failed:', health.issues);
        }
      },
      COUNT_FIVE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
    ); // 每5分钟检查一次

    // 定期清理过期项
    this.cleanupInterval = setInterval(
      () => {
        this.cache.cleanup();
      },
      COUNT_TEN * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
    ); // 每10分钟清理一次
  }

  // 清理资源
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.preloader.cleanup();
    this.cache.clear();
  }

  // 获取缓存键
  getCacheKey(locale: Locale, namespace?: string): string {
    return namespace ? `${locale}:${namespace}` : locale;
  }

  // 检查缓存是否存在
  hasMessages(locale: Locale, namespace?: string): boolean {
    const key = this.getCacheKey(locale, namespace);
    return this.cache.has(key);
  }

  // 删除特定语言的缓存
  deleteMessages(locale: Locale, namespace?: string): boolean {
    const key = this.getCacheKey(locale, namespace);
    return this.cache.delete(key);
  }

  // 获取所有缓存的语言
  getCachedLocales(): Locale[] {
    const keys = Array.from(this.cache.keys());
    return [...new Set(keys.map((key) => key.split(':')[ZERO] as Locale))];
  }

  // 获取缓存大小（字节）
  getCacheSize(): number {
    return this.cache.getDetailedStats().memoryUsage || ZERO;
  }

  // 检查是否正在预加载
  isPreloading(): boolean {
    return this.preloader.isPreloading();
  }

  // 获取预加载进度
  getPreloadProgress(): number {
    return this.preloader.getPreloadProgress();
  }

  // 停止预加载
  stopPreloading(): void {
    this.preloader.stopPreloading();
  }
}

// 全局缓存实例
export const i18nCache = new I18nCacheManager();

// 初始化缓存预热
if (typeof window !== 'undefined') {
  // 在浏览器环境中预热缓存
  i18nCache.warmupCache();
}

// 创建缓存管理器的工厂函数
export function createI18nCacheManager(
  config?: Partial<CacheConfig>,
  preloadConfig?: Partial<PreloadConfig>,
): I18nCacheManager {
  return new I18nCacheManager(config, preloadConfig);
}

// 导出类型别名
export type { I18nCacheManager as CacheManager };

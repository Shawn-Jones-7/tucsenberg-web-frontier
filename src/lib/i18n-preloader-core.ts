/**
 * 翻译预加载器核心实现
 * Translation Preloader Core Implementation
 *
 * 提供翻译预加载的核心功能和主要类实现
 */

import type { Locale, Messages } from '@/types/i18n';
import { logger } from '@/lib/logger';
import type {
  CacheOperationResult,
  CacheStorage,
  MetricsCollector,
  Preloader,
} from './i18n-cache-types';
import type {
  IPreloader,
  PreloaderConfig,
  PreloadOptions,
  PreloadState,
  PreloadStats,
} from './i18n-preloader-types';
import {
  PreloaderError,
  PreloaderNetworkError,
  PreloaderTimeoutError,
} from './i18n-preloader-types';

/**
 * 翻译预加载器核心实现
 * Translation preloader core implementation
 */
export class TranslationPreloader implements Preloader, IPreloader {
  private cache: CacheStorage<Messages>;
  private metricsCollector: MetricsCollector;
  private preloadState: PreloadState = {
    isPreloading: false,
    progress: 0,
    totalLocales: 0,
    completedLocales: 0,
    errors: [],
  };
  private preloadConfig: PreloaderConfig;
  private abortController?: AbortController;

  constructor(
    cache: CacheStorage<Messages>,
    metricsCollector: MetricsCollector,
    config?: Partial<PreloaderConfig>,
  ) {
    this.cache = cache;
    this.metricsCollector = metricsCollector;
    this.preloadConfig = {
      enablePreload: true,
      preloadLocales: ['en', 'zh'],
      batchSize: 3,
      delayBetweenBatches: 100,
      maxConcurrency: 5,
      timeout: 10000,
      retryCount: 3,
      retryDelay: 1000,
      smartPreload: {
        enabled: false,
        maxLocales: 3,
        minUsageThreshold: 0.1,
        usageWindow: 24,
        preloadTrigger: 'idle',
      },
      memoryLimit: 50 * 1024 * 1024,
      networkThrottling: false,
      priorityQueue: false,
      cacheStrategy: 'adaptive',
      cacheTTL: 24 * 60 * 60 * 1000,
      maxCacheSize: 100,
      enableMetrics: true,
      metricsInterval: 60000,
      enableLogging: false,
      logLevel: 'info',
      ...config,
    };
  }

  /**
   * 预加载指定语言
   * Preload specific locale
   */
  async preloadLocale(
    locale: Locale,
    options?: PreloadOptions,
  ): Promise<Messages> {
    const startTime = Date.now();

    try {
      // 首先检查缓存
      const cached = this.cache.get(locale);
      if (cached) {
        this.metricsCollector.recordLoadTime(Date.now() - startTime);
        options?.onSuccess?.(locale, cached);
        return cached;
      }

      // 从服务器加载
      const messages = await this.loadMessagesFromServer(locale, options);

      // 存储到缓存
      this.cache.set(locale, messages);
      this.metricsCollector.recordLoadTime(Date.now() - startTime);

      options?.onSuccess?.(locale, messages);
      return messages;
    } catch (error) {
      const preloaderError =
        error instanceof Error
          ? new PreloaderNetworkError(locale, error)
          : new PreloaderError(`Failed to preload locale ${locale}`, locale);

      options?.onError?.(preloaderError, locale);
      throw preloaderError;
    }
  }

  /**
   * 预热缓存
   * Warmup cache
   */
  warmupCache(): void {
    if (!this.preloadConfig.enablePreload || this.preloadState.isPreloading) {
      return;
    }

    this.preloadMultipleLocales(this.preloadConfig.preloadLocales);
  }

  /**
   * 检查是否正在预加载
   * Check if preloading
   */
  isPreloading(): boolean {
    return this.preloadState.isPreloading;
  }

  /**
   * 获取预加载进度
   * Get preload progress
   */
  getPreloadProgress(): number {
    return this.preloadState.progress;
  }

  /**
   * 获取预加载状态
   * Get preload state
   */
  getPreloadState(): PreloadState {
    return { ...this.preloadState };
  }

  /**
   * 批量预加载多个语言
   * Preload multiple locales in batches
   */
  async preloadMultipleLocales(
    locales: Locale[],
    options?: PreloadOptions,
  ): Promise<CacheOperationResult<Messages>[]> {
    if (this.preloadState.isPreloading) {
      throw new PreloaderError('Preloading is already in progress');
    }

    this.preloadState = {
      isPreloading: true,
      progress: 0,
      totalLocales: locales.length,
      completedLocales: 0,
      errors: [],
      startTime: Date.now(),
    };

    this.abortController = new AbortController();
    const results: CacheOperationResult<Messages>[] = [];

    try {
      // 分批处理
      const batches = this.createBatches(locales, this.preloadConfig.batchSize);

      for (let i = 0; i < batches.length; i++) {
        if (this.abortController.signal.aborted) {
          break;
        }

        const batch = batches[i];
        if (!batch) continue;
        const batchResults = await this.processBatch(batch, options);
        results.push(...batchResults);

        // 更新进度
        this.preloadState.completedLocales += batch.length;
        this.preloadState.progress =
          (this.preloadState.completedLocales /
            this.preloadState.totalLocales) *
          100;

        options?.onProgress?.(this.preloadState.progress);

        // 批次间延迟
        if (
          i < batches.length - 1 &&
          this.preloadConfig.delayBetweenBatches > 0
        ) {
          await this.delay(this.preloadConfig.delayBetweenBatches);
        }
      }
    } catch (error) {
      logger.error('Preloading failed:', error);
    } finally {
      this.preloadState.isPreloading = false;
    }

    return results;
  }

  /**
   * 停止预加载
   * Stop preloading
   */
  stopPreloading(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.preloadState.isPreloading = false;
  }

  /**
   * 暂停预加载
   * Pause preloading
   */
  pausePreloading(): void {
    // 实现暂停逻辑
    this.stopPreloading();
  }

  /**
   * 恢复预加载
   * Resume preloading
   */
  resumePreloading(): void {
    // 实现恢复逻辑
    if (!this.preloadState.isPreloading) {
      this.warmupCache();
    }
  }

  /**
   * 智能预加载（基于使用模式）
   * Smart preload based on usage patterns
   */
  async smartPreload(): Promise<void> {
    // 获取使用统计
    const metrics = this.metricsCollector.getMetrics();
    const {localeUsage} = metrics;

    // 按使用频率排序
    const sortedLocales = Object.entries(localeUsage)
      .sort(([, a], [, b]) => b - a)
      .map(([locale]) => locale as Locale)
      .slice(0, 3); // 只预加载前3个最常用的语言

    if (sortedLocales.length > 0) {
      await this.preloadMultipleLocales(sortedLocales);
    }
  }

  /**
   * 预加载相关语言
   * Preload related locales
   */
  async preloadRelatedLocales(currentLocale: Locale): Promise<void> {
    const relatedLocales = this.getRelatedLocales(currentLocale);
    if (relatedLocales.length > 0) {
      await this.preloadMultipleLocales(relatedLocales);
    }
  }

  /**
   * 预加载缺失的翻译
   * Preload missing translations
   */
  async preloadMissingTranslations(
    locale: Locale,
    keys: string[],
  ): Promise<void> {
    try {
      const messages = await this.loadSpecificKeys(locale, keys);

      // 合并到现有缓存
      const existing = this.cache.get(locale) || {};
      const merged = { ...existing, ...messages } as Messages;
      this.cache.set(locale, merged);
    } catch (error) {
      logger.error(
        `Failed to preload missing translations for ${locale}:`,
        error,
      );
    }
  }

  /**
   * 获取预加载统计
   * Get preload statistics
   */
  getPreloadStats(): PreloadStats {
    const state = this.preloadState;
    const duration = state.startTime ? Date.now() - state.startTime : 0;

    return {
      isActive: state.isPreloading,
      progress: state.progress,
      totalLocales: state.totalLocales,
      completedLocales: state.completedLocales,
      errorCount: state.errors.length,
      duration,
      averageLoadTime: duration / Math.max(state.completedLocales, 1),
      successRate:
        state.totalLocales > 0
          ? (state.completedLocales - state.errors.length) / state.totalLocales
          : 0,
    };
  }

  /**
   * 清除缓存
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size(),
      keys: Array.from(this.cache.keys()),
      // 其他缓存统计信息
    };
  }

  /**
   * 从服务器加载消息
   * Load messages from server
   */
  private async loadMessagesFromServer(
    locale: Locale,
    options?: PreloadOptions,
  ): Promise<Messages> {
    try {
      // 这里应该是实际的 API 调用
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        options?.timeout || this.preloadConfig.timeout,
      );

      const response = await fetch(`/api/messages/${locale}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to load messages for ${locale}: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new PreloaderTimeoutError(
            locale,
            options?.timeout || this.preloadConfig.timeout,
          );
        }
        throw new PreloaderNetworkError(locale, error);
      }
      throw error;
    }
  }

  /**
   * 加载特定键的翻译
   * Load specific translation keys
   */
  private async loadSpecificKeys(
    locale: Locale,
    keys: string[],
  ): Promise<Partial<Messages>> {
    try {
      const response = await fetch(`/api/messages/${locale}/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys }),
        signal: this.abortController?.signal,
      } as RequestInit);

      if (!response.ok) {
        throw new Error(
          `Failed to load specific keys for ${locale}: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new PreloaderError('Load was cancelled', locale);
      }
      throw error;
    }
  }

  /**
   * 创建批次
   * Create batches
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * 处理批次
   * Process batch
   */
  private async processBatch(
    batch: Locale[],
    options?: PreloadOptions,
  ): Promise<CacheOperationResult<Messages>[]> {
    const promises = batch.map(
      async (locale): Promise<CacheOperationResult<Messages>> => {
        try {
          const messages = await this.preloadLocale(locale, options);
          return {
            success: true,
            data: messages,
            fromCache: false,
            loadTime: Date.now(),
          };
        } catch (error) {
          this.preloadState.errors.push({
            locale,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            fromCache: false,
          };
        }
      },
    );

    return Promise.all(promises);
  }

  /**
   * 获取相关语言
   * Get related locales
   */
  private getRelatedLocales(locale: Locale): Locale[] {
    const relatedMap: Record<Locale, Locale[]> = {
      en: ['zh'],
      zh: ['en'],
    };

    return relatedMap[locale] || [];
  }

  /**
   * 延迟函数
   * Delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 清理资源
   * Cleanup resources
   */
  cleanup(): void {
    this.stopPreloading();
    this.preloadState = {
      isPreloading: false,
      progress: 0,
      totalLocales: 0,
      completedLocales: 0,
      errors: [],
    };
  }

  /**
   * 设置预加载配置
   * Set preload configuration
   */
  setConfig(config: Partial<PreloaderConfig>): void {
    this.preloadConfig = { ...this.preloadConfig, ...config };
  }

  /**
   * 获取预加载配置
   * Get preload configuration
   */
  getConfig(): PreloaderConfig {
    return { ...this.preloadConfig };
  }
}

/**
 * 翻译预加载策略管理器
 * Translation Preloader Strategy Manager
 */

import { ONE } from "@/constants/magic-numbers";
import type {
  PreloaderMetrics,
  PreloadStrategy,
  PreloadStrategyConfig,
} from '../i18n-preloader-types';

/**
 * 预加载策略管理器
 * Preload strategy manager
 */
export class PreloadStrategyManager {
  private strategies = new Map<string, PreloadStrategy>();
  private configs = new Map<string, PreloadStrategyConfig>();

  /**
   * 注册策略
   * Register strategy
   */
  registerStrategy(
    name: string,
    strategy: PreloadStrategy,
    config?: PreloadStrategyConfig,
  ): void {
    this.strategies.set(name, strategy);
    if (config) {
      this.configs.set(name, config);
    }
  }

  /**
   * 获取策略
   * Get strategy
   */
  getStrategy(name: string): PreloadStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * 获取策略配置
   * Get strategy configuration
   */
  getStrategyConfig(name: string): PreloadStrategyConfig | undefined {
    return this.configs.get(name);
  }

  /**
   * 列出所有策略
   * List all strategies
   */
  listStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * 选择最佳策略
   * Select best strategy
   */
  selectBestStrategy(
    metrics: PreloaderMetrics,
    networkCondition: 'fast' | 'slow' | 'offline',
  ): string {
    const configs = Array.from(this.configs.entries());

    // 根据网络条件和性能指标选择策略
    for (const [name, config] of configs) {
      if (this.isStrategyApplicable(config, metrics, networkCondition)) {
        return name;
      }
    }

    // 默认策略
    return 'progressive';
  }

  /**
   * 检查策略是否适用
   * Check if strategy is applicable
   */
  private isStrategyApplicable(
    config: PreloadStrategyConfig,
    metrics: PreloaderMetrics,
    networkCondition: 'fast' | 'slow' | 'offline',
  ): boolean {
    const { conditions } = config;

    if (
      conditions.networkCondition &&
      conditions.networkCondition !== networkCondition
    ) {
      return false;
    }

    if (
      conditions.minCacheHitRate &&
      metrics.cacheHitRate < conditions.minCacheHitRate
    ) {
      return false;
    }

    if (conditions.maxErrorRate) {
      const errorRate =
        metrics.failedPreloads / Math.max(metrics.totalPreloads, ONE);
      if (errorRate > conditions.maxErrorRate) {
        return false;
      }
    }

    return true;
  }
}

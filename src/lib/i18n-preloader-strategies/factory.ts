/**
 * 翻译预加载策略工厂和集合
 * Translation Preloader Strategy Factory and Collections
 */

import type { PreloaderMetrics } from '@/lib/i18n-preloader-types';
import {
  adaptiveStrategy,
  batchStrategy,
  memoryAwareStrategy,
  networkAwareStrategy,
  timeAwareStrategy,
} from './advanced-strategies';
// 导入所有策略
import {
  immediateStrategy,
  lazyStrategy,
  priorityStrategy,
  progressiveStrategy,
  smartStrategy,
} from './basic-strategies';
import { strategyConfigs } from '@/lib/i18n-preloader-strategies/configs';
import { PreloadStrategyManager } from '@/lib/i18n-preloader-strategies/manager';

/**
 * 预加载策略集合
 * Preload strategies collection
 */
export const PreloadStrategies = {
  immediate: immediateStrategy,
  smart: smartStrategy,
  progressive: progressiveStrategy,
  priority: priorityStrategy,
  lazy: lazyStrategy,
  batch: batchStrategy,
  adaptive: adaptiveStrategy,
  networkAware: networkAwareStrategy,
  timeAware: timeAwareStrategy,
  memoryAware: memoryAwareStrategy,
};

/**
 * 创建策略管理器
 * Create strategy manager
 */
export function createStrategyManager(): PreloadStrategyManager {
  const manager = new PreloadStrategyManager();

  // 注册所有策略
  Object.entries(PreloadStrategies).forEach(([name, strategy]) => {
    const config = strategyConfigs[name];
    manager.registerStrategy(name, strategy, config);
  });

  return manager;
}

/**
 * 获取推荐策略
 * Get recommended strategy
 */
export function getRecommendedStrategy(
  metrics: PreloaderMetrics,
  networkCondition: 'fast' | 'slow' | 'offline' = 'fast',
): string {
  const manager = createStrategyManager();
  return manager.selectBestStrategy(metrics, networkCondition);
}

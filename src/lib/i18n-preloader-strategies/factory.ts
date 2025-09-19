/**
 * 翻译预加载策略工厂和集合
 * Translation Preloader Strategy Factory and Collections
 */

import {
  adaptiveStrategy,
  batchStrategy,
  memoryAwareStrategy,
  networkAwareStrategy,
  timeAwareStrategy,
} from '@/lib/i18n-preloader-strategies/advanced-strategies';
// 导入所有策略
import {
  immediateStrategy,
  lazyStrategy,
  priorityStrategy,
  progressiveStrategy,
  smartStrategy,
} from '@/lib/i18n-preloader-strategies/basic-strategies';
import { strategyConfigs } from '@/lib/i18n-preloader-strategies/configs';
import { PreloadStrategyManager } from '@/lib/i18n-preloader-strategies/manager';
import type {
  PreloaderMetrics,
  PreloadStrategy,
  PreloadStrategyName,
} from '@/lib/i18n-preloader-types';

/**
 * 预加载策略集合
 * Preload strategies collection
 */
export const PreloadStrategies: Record<PreloadStrategyName, PreloadStrategy> = {
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
} as const;

/**
 * 创建策略管理器
 * Create strategy manager
 */
export function createStrategyManager(): PreloadStrategyManager {
  const manager = new PreloadStrategyManager();

  // 注册所有策略
  const keys: ReadonlyArray<PreloadStrategyName> = [
    'immediate',
    'smart',
    'progressive',
    'priority',
    'lazy',
    'batch',
    'adaptive',
    'networkAware',
    'timeAware',
    'memoryAware',
  ];

  for (const key of keys) {
    switch (key) {
      case 'immediate':
        manager.registerStrategy(
          'immediate',
          immediateStrategy,
          strategyConfigs.immediate,
        );
        break;
      case 'smart':
        manager.registerStrategy('smart', smartStrategy, strategyConfigs.smart);
        break;
      case 'progressive':
        manager.registerStrategy(
          'progressive',
          progressiveStrategy,
          strategyConfigs.progressive,
        );
        break;
      case 'priority':
        manager.registerStrategy(
          'priority',
          priorityStrategy,
          strategyConfigs.priority,
        );
        break;
      case 'lazy':
        manager.registerStrategy('lazy', lazyStrategy, strategyConfigs.lazy);
        break;
      case 'batch':
        manager.registerStrategy('batch', batchStrategy, strategyConfigs.batch);
        break;
      case 'adaptive':
        manager.registerStrategy(
          'adaptive',
          adaptiveStrategy,
          strategyConfigs.adaptive,
        );
        break;
      case 'networkAware':
        manager.registerStrategy(
          'networkAware',
          networkAwareStrategy,
          strategyConfigs.networkAware,
        );
        break;
      case 'timeAware':
        manager.registerStrategy(
          'timeAware',
          timeAwareStrategy,
          strategyConfigs.timeAware,
        );
        break;
      case 'memoryAware':
        manager.registerStrategy(
          'memoryAware',
          memoryAwareStrategy,
          strategyConfigs.memoryAware,
        );
        break;
      default:
        break;
    }
  }

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

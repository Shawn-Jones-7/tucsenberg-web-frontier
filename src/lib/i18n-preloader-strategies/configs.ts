/**
 * 翻译预加载策略配置
 * Translation Preloader Strategy Configurations
 */

import type { PreloadStrategyConfig } from '@/lib/i18n-preloader-types';

/**
 * 预加载策略配置
 * Preload strategy configurations
 */
export const strategyConfigs: Record<string, PreloadStrategyConfig> = {
  immediate: {
    name: 'immediate',
    description: '立即预加载所有语言',
    priority: 1,
    conditions: {
      minCacheHitRate: 0.8,
      maxErrorRate: 0.1,
      networkCondition: 'fast',
    },
    parameters: {
      batchSize: 5,
      delayBetweenBatches: 0,
      maxConcurrency: 10,
      timeout: 5000,
    },
  },
  smart: {
    name: 'smart',
    description: '基于使用模式的智能预加载',
    priority: 2,
    conditions: {
      minCacheHitRate: 0.6,
      maxErrorRate: 0.2,
    },
    parameters: {
      batchSize: 3,
      delayBetweenBatches: 100,
      maxConcurrency: 5,
      timeout: 8000,
    },
  },
  progressive: {
    name: 'progressive',
    description: '渐进式预加载',
    priority: 3,
    conditions: {
      maxErrorRate: 0.3,
    },
    parameters: {
      batchSize: 1,
      delayBetweenBatches: 500,
      maxConcurrency: 2,
      timeout: 10000,
    },
  },
  priority: {
    name: 'priority',
    description: '优先级预加载',
    priority: 2,
    conditions: {
      minCacheHitRate: 0.7,
      maxErrorRate: 0.15,
    },
    parameters: {
      batchSize: 2,
      delayBetweenBatches: 200,
      maxConcurrency: 3,
      timeout: 7000,
    },
  },
  lazy: {
    name: 'lazy',
    description: '懒加载策略',
    priority: 4,
    conditions: {
      networkCondition: 'slow',
    },
    parameters: {
      batchSize: 1,
      delayBetweenBatches: 1000,
      maxConcurrency: 1,
      timeout: 15000,
    },
  },
  batch: {
    name: 'batch',
    description: '批量预加载策略',
    priority: 3,
    conditions: {
      maxErrorRate: 0.25,
    },
    parameters: {
      batchSize: 2,
      delayBetweenBatches: 1000,
      maxConcurrency: 2,
      timeout: 12000,
    },
  },
  adaptive: {
    name: 'adaptive',
    description: '自适应预加载策略',
    priority: 2,
    conditions: {
      minCacheHitRate: 0.5,
      maxErrorRate: 0.3,
    },
    parameters: {
      batchSize: 3,
      delayBetweenBatches: 300,
      maxConcurrency: 4,
      timeout: 9000,
    },
  },
  networkAware: {
    name: 'networkAware',
    description: '网络感知预加载策略',
    priority: 2,
    conditions: {
      maxErrorRate: 0.2,
    },
    parameters: {
      batchSize: 2,
      delayBetweenBatches: 400,
      maxConcurrency: 3,
      timeout: 8000,
    },
  },
  timeAware: {
    name: 'timeAware',
    description: '时间感知预加载策略',
    priority: 3,
    conditions: {
      maxErrorRate: 0.25,
    },
    parameters: {
      batchSize: 2,
      delayBetweenBatches: 600,
      maxConcurrency: 3,
      timeout: 10000,
    },
  },
  memoryAware: {
    name: 'memoryAware',
    description: '内存感知预加载策略',
    priority: 3,
    conditions: {
      maxErrorRate: 0.3,
    },
    parameters: {
      batchSize: 1,
      delayBetweenBatches: 800,
      maxConcurrency: 2,
      timeout: 12000,
    },
  },
};

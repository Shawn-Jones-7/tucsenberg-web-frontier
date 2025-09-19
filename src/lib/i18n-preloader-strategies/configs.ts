/**
 * 翻译预加载策略配置
 * Translation Preloader Strategy Configurations
 */

import type {
  PreloadStrategyConfig,
  PreloadStrategyName,
} from '@/lib/i18n-preloader-types';
import {
  ANIMATION_DURATION_NORMAL,
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  COUNT_TRIPLE,
  FIVE_SECONDS_MS,
  FOUR_HUNDRED_MS,
  HALF_SECOND_MS,
  ONE,
  PERCENTAGE_FULL,
  TEN_SECONDS_MS,
  TWO_HUNDRED_MS,
  ZERO,
} from '@/constants';
import {
  COUNT_4,
  COUNT_800,
  COUNT_7000,
  COUNT_8000,
  COUNT_9000,
  COUNT_12000,
  COUNT_15000,
} from '@/constants/count';
import {
  DEC_0_15,
  MAGIC_0_1,
  MAGIC_0_2,
  MAGIC_0_3,
  MAGIC_0_5,
  MAGIC_0_6,
  MAGIC_0_7,
  MAGIC_0_8,
  MAGIC_0_25,
} from '@/constants/decimal';
import { WEB_VITALS_CONSTANTS } from '@/constants/test-web-vitals-constants';

/**
 * 预加载策略配置
 * Preload strategy configurations
 */
export const strategyConfigs: Record<
  PreloadStrategyName,
  PreloadStrategyConfig
> = {
  immediate: {
    name: 'immediate',
    description: '立即预加载所有语言',
    priority: ONE,
    conditions: {
      minCacheHitRate: MAGIC_0_8,
      maxErrorRate: MAGIC_0_1,
      networkCondition: 'fast',
    },
    parameters: {
      batchSize: COUNT_FIVE,
      delayBetweenBatches: ZERO,
      maxConcurrency: COUNT_TEN,
      timeout: FIVE_SECONDS_MS,
    },
  },
  smart: {
    name: 'smart',
    description: '基于使用模式的智能预加载',
    priority: COUNT_PAIR,
    conditions: {
      minCacheHitRate: MAGIC_0_6,
      maxErrorRate: MAGIC_0_2,
    },
    parameters: {
      batchSize: COUNT_TRIPLE,
      delayBetweenBatches: PERCENTAGE_FULL,
      maxConcurrency: COUNT_FIVE,
      timeout: COUNT_8000,
    },
  },
  progressive: {
    name: 'progressive',
    description: '渐进式预加载',
    priority: COUNT_TRIPLE,
    conditions: {
      maxErrorRate: MAGIC_0_3,
    },
    parameters: {
      batchSize: ONE,
      delayBetweenBatches: HALF_SECOND_MS,
      maxConcurrency: COUNT_PAIR,
      timeout: TEN_SECONDS_MS,
    },
  },
  priority: {
    name: 'priority',
    description: '优先级预加载',
    priority: COUNT_PAIR,
    conditions: {
      minCacheHitRate: MAGIC_0_7,
      maxErrorRate: DEC_0_15,
    },
    parameters: {
      batchSize: COUNT_PAIR,
      delayBetweenBatches: TWO_HUNDRED_MS,
      maxConcurrency: COUNT_TRIPLE,
      timeout: COUNT_7000,
    },
  },
  lazy: {
    name: 'lazy',
    description: '懒加载策略',
    priority: COUNT_4,
    conditions: {
      networkCondition: 'slow',
    },
    parameters: {
      batchSize: ONE,
      delayBetweenBatches: ANIMATION_DURATION_VERY_SLOW,
      maxConcurrency: ONE,
      timeout: COUNT_15000,
    },
  },
  batch: {
    name: 'batch',
    description: '批量预加载策略',
    priority: COUNT_TRIPLE,
    conditions: {
      maxErrorRate: MAGIC_0_25,
    },
    parameters: {
      batchSize: COUNT_PAIR,
      delayBetweenBatches: ANIMATION_DURATION_VERY_SLOW,
      maxConcurrency: COUNT_PAIR,
      timeout: COUNT_12000,
    },
  },
  adaptive: {
    name: 'adaptive',
    description: '自适应预加载策略',
    priority: COUNT_PAIR,
    conditions: {
      minCacheHitRate: MAGIC_0_5,
      maxErrorRate: MAGIC_0_3,
    },
    parameters: {
      batchSize: COUNT_TRIPLE,
      delayBetweenBatches: ANIMATION_DURATION_NORMAL,
      maxConcurrency: COUNT_4,
      timeout: COUNT_9000,
    },
  },
  networkAware: {
    name: 'networkAware',
    description: '网络感知预加载策略',
    priority: COUNT_PAIR,
    conditions: {
      maxErrorRate: MAGIC_0_2,
    },
    parameters: {
      batchSize: COUNT_PAIR,
      delayBetweenBatches: FOUR_HUNDRED_MS,
      maxConcurrency: COUNT_TRIPLE,
      timeout: COUNT_8000,
    },
  },
  timeAware: {
    name: 'timeAware',
    description: '时间感知预加载策略',
    priority: COUNT_TRIPLE,
    conditions: {
      maxErrorRate: MAGIC_0_25,
    },
    parameters: {
      batchSize: COUNT_PAIR,
      delayBetweenBatches: WEB_VITALS_CONSTANTS.TEST_DOM_INTERACTIVE,
      maxConcurrency: COUNT_TRIPLE,
      timeout: TEN_SECONDS_MS,
    },
  },
  memoryAware: {
    name: 'memoryAware',
    description: '内存感知预加载策略',
    priority: COUNT_TRIPLE,
    conditions: {
      maxErrorRate: MAGIC_0_3,
    },
    parameters: {
      batchSize: ONE,
      delayBetweenBatches: COUNT_800,
      maxConcurrency: COUNT_PAIR,
      timeout: COUNT_12000,
    },
  },
};

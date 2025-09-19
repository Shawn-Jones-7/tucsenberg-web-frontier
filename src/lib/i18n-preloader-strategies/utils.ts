/**
 * 翻译预加载策略工具函数
 * Translation Preloader Strategy Utility Functions
 */

import { strategyConfigs } from '@/lib/i18n-preloader-strategies/configs';
import type {
  PreloaderMetrics,
  PreloadStrategyName,
} from '@/lib/i18n-preloader-types';
import {
  COUNT_PAIR,
  MAGIC_0_5,
  MAGIC_0_9,
  MAGIC_9,
  MAGIC_17,
  MAGIC_18,
  MAGIC_22,
  ONE,
  ZERO,
} from '@/constants';

/**
 * 策略工具函数
 * Strategy utility functions
 */
export const StrategyUtils = {
  /**
   * 检查网络状况
   * Check network condition
   */
  getNetworkCondition(): 'fast' | 'slow' | 'offline' {
    if (!navigator.onLine) {
      return 'offline';
    }

    const { connection } = navigator as {
      connection?: { effectiveType?: string; downlink?: number };
    };
    if (connection) {
      const { effectiveType, downlink } = connection;
      if (effectiveType === '4g' && (downlink ?? ZERO) > COUNT_PAIR) {
        return 'fast';
      }
    }

    return 'slow';
  },

  /**
   * 检查内存使用情况
   * Check memory usage
   */
  getMemoryUsage(): number {
    const { memory } = performance as {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
    };
    if (memory) {
      const { usedJSHeapSize, totalJSHeapSize } = memory;
      return usedJSHeapSize / totalJSHeapSize;
    }
    return MAGIC_0_5; // 默认值
  },

  /**
   * 获取当前时间段
   * Get current time period
   */
  getTimePeriod(): 'work' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= MAGIC_9 && hour <= MAGIC_17) {
      return 'work';
    }
    if (hour >= MAGIC_18 && hour <= MAGIC_22) {
      return 'evening';
    }
    return 'night';
  },

  /**
   * 计算策略优先级
   * Calculate strategy priority
   */
  calculateStrategyPriority(
    strategy: PreloadStrategyName,
    metrics: PreloaderMetrics,
    conditions: { network: string; memory: number; time: string },
  ): number {
    const config = (() => {
      switch (strategy) {
        case 'immediate':
          return strategyConfigs.immediate;
        case 'smart':
          return strategyConfigs.smart;
        case 'progressive':
          return strategyConfigs.progressive;
        case 'priority':
          return strategyConfigs.priority;
        case 'lazy':
          return strategyConfigs.lazy;
        case 'batch':
          return strategyConfigs.batch;
        case 'adaptive':
          return strategyConfigs.adaptive;
        case 'networkAware':
          return strategyConfigs.networkAware;
        case 'timeAware':
          return strategyConfigs.timeAware;
        case 'memoryAware':
          return strategyConfigs.memoryAware;
        default:
          return undefined;
      }
    })();
    if (!config) return ZERO;

    let score = config.priority;

    // 根据条件调整分数
    if (conditions.network === 'fast' && strategy === 'immediate') {
      score += COUNT_PAIR;
    }
    if (conditions.memory < MAGIC_0_5 && strategy === 'lazy') {
      score += ONE;
    }
    if (metrics.successRate > MAGIC_0_9 && strategy === 'smart') {
      score += ONE;
    }

    return score;
  },
};

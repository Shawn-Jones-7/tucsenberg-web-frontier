/**
 * 翻译预加载策略工具函数
 * Translation Preloader Strategy Utility Functions
 */

import type { PreloaderMetrics } from '@/lib/i18n-preloader-types';
import { COUNT_PAIR, MAGIC_0_5, MAGIC_9, MAGIC_17, MAGIC_18, MAGIC_22, MAGIC_0_9 } from '@/constants/magic-numbers';

import { strategyConfigs } from '@/lib/i18n-preloader-strategies/configs';

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

    const connection = (
      navigator as {
        connection?: { effectiveType?: string; downlink?: number };
      }
    ).connection;
    if (connection) {
      const { effectiveType, downlink } = connection;
      if (effectiveType === '4g' && (downlink ?? 0) > COUNT_PAIR) {
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
    const memory = (
      performance as {
        memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
      }
    ).memory;
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
    strategy: string,
    metrics: PreloaderMetrics,
    conditions: { network: string; memory: number; time: string },
  ): number {
    const config = strategyConfigs[strategy];
    if (!config) return 0;

    let score = config.priority;

    // 根据条件调整分数
    if (conditions.network === 'fast' && strategy === 'immediate') {
      score += COUNT_PAIR;
    }
    if (conditions.memory < MAGIC_0_5 && strategy === 'lazy') {
      score += 1;
    }
    if (metrics.successRate > 0.9 && strategy === 'smart') {
      score += 1;
    }

    return score;
  },
};

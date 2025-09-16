/**
 * 高级翻译预加载策略实现
 * Advanced Translation Preloader Strategy Implementations
 */

import type { Locale } from '@/types/i18n';
import { MAGIC_0_9, MAGIC_0_7, COUNT_PAIR, MAGIC_0_5, MAGIC_9, MAGIC_17, MAGIC_18, MAGIC_22, MAGIC_0_8 } from '@/constants/magic-numbers';

import type {
  IPreloader,
  PreloadOptions,
  PreloadStrategy,
} from '../i18n-preloader-types';
// 导入基础策略以便复用
import {
  immediateStrategy,
  lazyStrategy,
  progressiveStrategy,
} from './basic-strategies';

/**
 * 批量预加载策略
 * Batch preload strategy
 */
export const batchStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => {
  const batchSize = COUNT_PAIR;
  const batches: Locale[][] = [];

  for (let i = 0; i < locales.length; i += batchSize) {
    batches.push(locales.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    await preloader.preloadMultipleLocales(batch, options);
    // 批次间延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

/**
 * 自适应预加载策略
 * Adaptive preload strategy
 */
export const adaptiveStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => {
  const stats = preloader.getPreloadStats();

  // 根据当前性能选择策略
  if (stats.successRate > MAGIC_0_9 && stats.averageLoadTime < 1000) {
    // 性能良好，使用立即策略
    await immediateStrategy(preloader, locales, options);
  } else if (stats.successRate > MAGIC_0_7) {
    // 性能一般，使用渐进式策略
    await progressiveStrategy(preloader, locales, options);
  } else {
    // 性能较差，使用懒加载策略
    await lazyStrategy(preloader, locales, options);
  }
};

/**
 * 网络感知预加载策略
 * Network-aware preload strategy
 */
export const networkAwareStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => {
  // 检测网络状况
  const isOnline = navigator.onLine;
  const {connection} = (navigator as { connection?: { effectiveType?: string; downlink?: number } });

  if (!isOnline) {
    // 离线状态，不进行预加载
    return;
  }

  if (connection) {
    const { effectiveType, downlink } = connection;

    if (effectiveType === '4g' && (downlink ?? 0) > COUNT_PAIR) {
      // 快速网络，使用立即策略
      await immediateStrategy(preloader, locales, options);
    } else if (effectiveType === '3g' || (downlink ?? 0) > MAGIC_0_5) {
      // 中等网络，使用渐进式策略
      await progressiveStrategy(preloader, locales, options);
    } else {
      // 慢速网络，使用懒加载策略
      await lazyStrategy(preloader, locales, options);
    }
  } else {
    // 无法检测网络，使用默认策略
    await progressiveStrategy(preloader, locales, options);
  }
};

/**
 * 时间感知预加载策略
 * Time-aware preload strategy
 */
export const timeAwareStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => {
  const now = new Date();
  const hour = now.getHours();

  // 根据时间选择策略
  if (hour >= MAGIC_9 && hour <= MAGIC_17) {
    // 工作时间，使用快速策略
    await immediateStrategy(preloader, locales, options);
  } else if (hour >= MAGIC_18 && hour <= MAGIC_22) {
    // 晚上，使用渐进式策略
    await progressiveStrategy(preloader, locales, options);
  } else {
    // 深夜或早晨，使用懒加载策略
    await lazyStrategy(preloader, locales, options);
  }
};

/**
 * 内存感知预加载策略
 * Memory-aware preload strategy
 */
export const memoryAwareStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => {
  // 检查可用内存
  const {memory} = (performance as {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
    });

  if (memory) {
    const { usedJSHeapSize, totalJSHeapSize } = memory;
    const memoryUsage = usedJSHeapSize / totalJSHeapSize;

    if (memoryUsage < MAGIC_0_5) {
      // 内存充足，使用立即策略
      await immediateStrategy(preloader, locales, options);
    } else if (memoryUsage < MAGIC_0_8) {
      // 内存一般，使用渐进式策略
      await progressiveStrategy(preloader, locales, options);
    } else {
      // 内存不足，使用懒加载策略
      await lazyStrategy(preloader, locales, options);
    }
  } else {
    // 无法检测内存，使用默认策略
    await progressiveStrategy(preloader, locales, options);
  }
};

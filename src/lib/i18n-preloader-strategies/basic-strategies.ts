/**
 * 基础翻译预加载策略实现
 * Basic Translation Preloader Strategy Implementations
 */

import { COUNT_PAIR, MAGIC_999, ONE, ZERO } from "@/constants/magic-numbers";
import type { Locale } from '@/types/i18n';
import type {
  IPreloader,
  PreloadOptions,
  PreloadStrategy,
} from '../i18n-preloader-types';

/**
 * 立即预加载策略
 * Immediate preload strategy
 */
export const immediateStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => {
  await preloader.preloadMultipleLocales(locales, options);
};

/**
 * 智能预加载策略
 * Smart preload strategy
 */
export const smartStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  _locales: Locale[],
  _options?: PreloadOptions,
) => {
  await preloader.smartPreload();
};

/**
 * 渐进式预加载策略
 * Progressive preload strategy
 */
export const progressiveStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => {
  for (const locale of locales) {
    if (preloader.isPreloading()) {
      await preloader.preloadLocale(locale, options);
      // 添加延迟以避免阻塞主线程
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
};

/**
 * 优先级预加载策略
 * Priority preload strategy
 */
export const priorityStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => {
  // 定义语言优先级
  const priorityMap: Record<Locale, number> = {
    en: ONE,
    zh: COUNT_PAIR,
  };

  // 按优先级排序
  const sortedLocales = locales.sort((a, b) => {
    const priorityA = priorityMap[a] || MAGIC_999;
    const priorityB = priorityMap[b] || MAGIC_999;
    return priorityA - priorityB;
  });

  // 高优先级的语言先预加载
  for (const locale of sortedLocales) {
    await preloader.preloadLocale(locale, {
      ...options,
      priority: priorityMap[locale] <= COUNT_PAIR ? 'high' : 'normal',
    });
  }
};

/**
 * 懒加载策略
 * Lazy preload strategy
 */
export const lazyStrategy: PreloadStrategy = async (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => {
  // 只预加载当前最需要的语言
  if (locales.length > ZERO) {
    await preloader.preloadLocale(locales[ZERO]!, options);
  }
};

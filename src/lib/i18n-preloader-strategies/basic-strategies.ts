/**
 * 基础翻译预加载策略实现
 * Basic Translation Preloader Strategy Implementations
 */

import type { Locale } from '@/types/i18n';
import type {
  IPreloader,
  PreloadOptions,
  PreloadStrategy,
} from '@/lib/i18n-preloader-types';
import { COUNT_PAIR, HALF_SECOND_MS, MAGIC_999, ONE, ZERO } from '@/constants';

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
      await new Promise((resolve) => setTimeout(resolve, HALF_SECOND_MS));
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
  // 定义语言优先级（使用受控映射）
  const getPriority = (l: Locale): number => {
    switch (l) {
      case 'en':
        return ONE;
      case 'zh':
        return COUNT_PAIR;
      default:
        return MAGIC_999;
    }
  };

  // 按优先级排序
  const sortedLocales = locales.sort((a, b) => {
    const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    return priorityA - priorityB;
  });

  // 高优先级的语言先预加载
  for (const locale of sortedLocales) {
    const p = getPriority(locale);
    await preloader.preloadLocale(locale, {
      ...options,
      priority: p <= COUNT_PAIR ? 'high' : 'normal',
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
    const [firstLocale] = locales;
    if (firstLocale) {
      await preloader.preloadLocale(firstLocale, options);
    }
  }
};

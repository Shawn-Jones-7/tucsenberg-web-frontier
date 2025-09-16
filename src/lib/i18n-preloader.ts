// 向后兼容的重新导出
import type { Locale, Messages } from '@/types/i18n';
import type { PreloadConfig } from '@/lib/i18n-cache-types';
import { TranslationPreloader } from '@/lib/i18n-preloader-core';
import {
  createStrategyManager,
  getRecommendedStrategy,
  PreloadStrategies,
  PreloadStrategyManager,
  StrategyUtils,
} from './i18n-preloader-strategies';
import type {
  IPreloader,
  PreloaderConfig,
  PreloaderEvents,
  PreloaderFactory,
  PreloaderMetrics,
  PreloaderPlugin,
  PreloadOptions,
  PreloadResult,
  PreloadState,
  PreloadStats,
  PreloadStrategy,
} from './i18n-preloader-types';
import {
  cleanupPreloaders,
  createTranslationPreloader,
  getDefaultPreloader,
  globalPreloaderFactory,
  globalPreloaderManager,
  PreloaderFactory as PreloaderFactoryClass,
  PreloaderManager,
  PreloaderUtils,
  preloadLocale,
  setupPreloader,
  smartPreload,
} from './i18n-preloader-utils';

/**
 * 翻译预加载器 - 主入口
 * Translation Preloader - Main Entry Point
 *
 * 统一的翻译预加载器入口，整合所有预加载相关功能
 */

// 重新导出所有模块的功能
export type {
  PreloadOptions,
  SmartPreloadConfig,
  PreloadStrategyConfig,
  PreloaderConfig,
  PreloaderFactoryConfig,
  IPreloader,
  PreloadConfigKey,
} from './i18n-preloader-types';
export {
  PRELOADER_CONSTANTS,
  PRELOADER_EVENTS,
  isPreloadResult,
  isPreloadState,
  isPreloaderError,
} from './i18n-preloader-types';
export type {
  PreloaderStateManager,
  PreloaderCache,
  PreloaderNetwork,
  PreloaderScheduler,
  PreloaderMonitor,
  PreloadStrategy,
  PreloaderMiddleware,
  PreloaderPlugin,
  PreloaderError,
  PreloaderTimeoutError,
  PreloaderNetworkError,
  PreloaderCacheError,
} from './i18n-preloader-types';
export type {
  PreloadState,
  PreloadStats,
  PreloadResult,
  BatchResult,
  PreloaderMetrics,
  PreloaderEvents,
  PreloadEventHandler,
  PreloadEventMap,
  PreloadStateKey,
  PreloadStatsKey,
} from './i18n-preloader-types';
export { TranslationPreloader as CorePreloader } from '@/lib/i18n-preloader-core';
export * from '@/lib/i18n-preloader-strategies';
export * from '@/lib/i18n-preloader-utils';

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
export type {
  // 核心类型
  TranslationPreloader as Preloader,
  IPreloader as PreloaderInterface,
  PreloadState as State,
  PreloadStats as Stats,
  PreloadResult as Result,
  PreloadOptions as Options,

  // 配置类型
  PreloaderConfig as Config,
  PreloadConfig as LegacyConfig,
  // PreloaderFactoryConfig as FactoryConfig, // 注释掉不存在的类型

  // 策略类型
  PreloadStrategy as Strategy,
  PreloadStrategyManager as StrategyManager,

  // 工厂类型
  PreloaderFactory as Factory,
  PreloaderManager as Manager,
  PreloaderPlugin as Plugin,

  // 事件类型
  PreloaderEvents as Events,
  PreloaderMetrics as Metrics,
};

/**
 * 向后兼容的导出别名
 * Backward compatible export aliases
 */
export {
  // 核心类
  TranslationPreloader,

  // 策略
  PreloadStrategies,
  PreloadStrategyManager,
  createStrategyManager,
  getRecommendedStrategy,
  StrategyUtils,

  // 工厂和管理器
  // PreloaderFactoryClass as PreloaderFactory, // 注释掉重复的导出
  PreloaderManager,
  PreloaderUtils,

  // 全局实例
  globalPreloaderManager,
  globalPreloaderFactory,

  // 便捷函数
  createTranslationPreloader,
  setupPreloader,
  getDefaultPreloader,
  preloadLocale,
  smartPreload,
  cleanupPreloaders,
};

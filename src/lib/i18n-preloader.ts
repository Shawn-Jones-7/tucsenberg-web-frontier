// 向后兼容的重新导出
import type { PreloadConfig } from '@/lib/i18n-cache-types';
import { TranslationPreloader } from '@/lib/i18n-preloader-core';
import {
  createStrategyManager,
  getRecommendedStrategy,
  PreloadStrategies,
  PreloadStrategyManager,
  StrategyUtils,
} from '@/lib/i18n-preloader-strategies';
import type {
  IPreloader,
  PreloaderConfig,
  PreloaderEvents,
  PreloaderMetrics,
  PreloaderPlugin,
  PreloadOptions,
  PreloadResult,
  PreloadState,
  PreloadStats,
  PreloadStrategy,
} from '@/lib/i18n-preloader-types';
import {
  cleanupPreloaders,
  createTranslationPreloader,
  getDefaultPreloader,
  globalPreloaderFactory,
  globalPreloaderManager,
  PreloaderManager,
  PreloaderUtils,
  preloadLocale,
  setupPreloader,
  smartPreload,
} from '@/lib/i18n-preloader-utils';

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
} from '@/lib/i18n-preloader-types';
export {
  PRELOADER_CONSTANTS,
  PRELOADER_EVENTS,
  isPreloadResult,
  isPreloadState,
  isPreloaderError,
} from '@/lib/i18n-preloader-types';
export type {
  PreloaderStateManager,
  PreloaderCache,
  PreloaderNetwork,
  PreloaderScheduler,
  PreloaderMonitor,
  PreloadStrategy,
  PreloaderMiddleware,
  PreloaderPlugin,
} from '@/lib/i18n-preloader-types';

// 错误类需要以值导出，避免仅类型导出导致运行时不可用
export {
  PreloaderError,
  PreloaderTimeoutError,
  PreloaderNetworkError,
  PreloaderCacheError,
} from '@/lib/i18n-preloader-types';
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
} from '@/lib/i18n-preloader-types';
export { TranslationPreloader as CorePreloader } from '@/lib/i18n-preloader-core';
export { TranslationPreloader } from '@/lib/i18n-preloader-core';
export {
  PreloadStrategyManager,
  immediateStrategy,
  smartStrategy,
  progressiveStrategy,
  priorityStrategy,
  lazyStrategy,
  batchStrategy,
  adaptiveStrategy,
  networkAwareStrategy,
  timeAwareStrategy,
  memoryAwareStrategy,
  strategyConfigs,
  PreloadStrategies,
  createStrategyManager,
  getRecommendedStrategy,
  StrategyUtils,
} from '@/lib/i18n-preloader-strategies';
export {
  createTranslationPreloader,
  PreloaderFactory as PreloaderFactoryClass,
  PreloaderManager,
  PreloaderUtils,
  globalPreloaderManager,
  globalPreloaderFactory,
  setupPreloader,
  getDefaultPreloader,
  preloadLocale,
  smartPreload,
  cleanupPreloaders,
} from '@/lib/i18n-preloader-utils';

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
// 核心类型（别名，避免与上方同名导出冲突）
export type {
  IPreloader as PreloaderInterface,
  PreloadState as State,
  PreloadStats as Stats,
  PreloadResult as Result,
  PreloadOptions as Options,
  PreloaderConfig as Config,
  PreloadStrategy as Strategy,
  PreloaderPlugin as Plugin,
  PreloaderEvents as Events,
  PreloaderMetrics as Metrics,
} from '@/lib/i18n-preloader-types';

// 旧版配置别名来源于缓存配置模块
export type { PreloadConfig as LegacyConfig } from '@/lib/i18n-cache-types';

// 来自策略/工具模块的类型别名（导出类型）
export type { PreloadStrategyManager as StrategyManager } from '@/lib/i18n-preloader-strategies';
export type { PreloaderManager as Manager } from '@/lib/i18n-preloader-utils';

// 兼容别名：类类型别名（从核心导出）
export type { TranslationPreloader as Preloader } from '@/lib/i18n-preloader-core';

/**
 * 向后兼容的导出别名
 * Backward compatible export aliases
 */
// 为避免重复标识符，移除重复的值导出别名块

/**
 * 企业级国际化缓存和性能优化 - 主入口文件
 *
 * 这个文件作为国际化缓存系统的统一入口点，重新导出所有相关功能
 */

// 基础类型和配置
export {
  type CacheConfig,
  type CacheItem,
  type CacheStats,
  type CacheEvent,
  type CacheEventType,
  type CacheEventListener,
  type CacheStorage,
  type PersistentStorage,
  type MetricsCollector,
  type Preloader,
  type CacheManager,
  type PreloadConfig,
  type CacheOperationResult,
  type CacheConfigValidation,
  type CacheHealthCheck,
  type CacheDebugInfo,
  type CacheError,
  type CacheValidationError,
  type CacheStorageError,
  type CacheSerializationError,
  DEFAULT_CACHE_CONFIG,
  DEFAULT_PRELOAD_CONFIG,
  CACHE_CONSTANTS,
  isCacheItem,
  isCacheConfig,
  isCacheEvent,
  validateCacheConfig,
  createCacheKey,
  parseCacheKey,
  type Config,
  type Item,
  type Stats,
  type Event,
  type Manager,
  type Metrics,
} from './i18n-cache-types';

// 性能指标收集器
export {
  I18nMetricsCollector,
  createMetricsCollector,
  formatMetrics,
  defaultMetricsCollector,
  type MetricsCollector as Collector,
} from './i18n-metrics-collector';

// LRU 缓存实现
export { LRUCache, createLRUCache, type Cache } from '@/lib/i18n-lru-cache';

// 翻译预加载器
export {
  TranslationPreloader,
  createTranslationPreloader,
  PreloadStrategies,
  type Preloader as PreloaderImpl,
  type PreloadState,
} from './i18n-preloader';

// 主缓存管理器
export {
  I18nCacheManager,
  createI18nCacheManager,
  i18nCache,
  type CacheManager as ManagerImpl,
} from './i18n-cache-manager';

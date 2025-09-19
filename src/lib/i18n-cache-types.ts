// 向后兼容的重新导出
import type {
  AdvancedCacheConfig,
  CacheClusterConfig,
  CacheShardingConfig,
} from '@/lib/i18n-cache-types-advanced';
import type {
  CacheConfig,
  CacheEvent,
  CacheEventListener,
  CacheEventType,
  CacheItem,
  CacheStats,
  CacheStrategy,
} from '@/lib/i18n-cache-types-base';
import type {
  CacheManager,
  CacheStorage,
  MetricsCollector,
  PersistentStorage,
  Preloader,
} from '@/lib/i18n-cache-types-interfaces';

// Note: re-export utils directly below without intermediate imports to avoid unused warnings

/**
 * 国际化缓存基础类型定义 - 主入口
 * I18n Cache Base Type Definitions - Main Entry Point
 *
 * 统一的国际化缓存类型入口，整合所有类型定义模块
 */

// 重新导出所有模块的功能 - 类型导出
export type {
  CacheConfig,
  CacheItem,
  CacheStats,
  PreloadConfig,
  CacheOperationResult,
  CacheEventType,
  CacheEvent,
  CacheEventListener,
  CacheStrategy,
  CacheConfigValidation,
  CacheHealthCheck,
  CacheDebugInfo,
  CacheError,
  CacheValidationError,
  CacheStorageError,
  CacheSerializationError,
} from '@/lib/i18n-cache-types-base';

// 常量和函数导出
export {
  DEFAULT_CACHE_CONFIG,
  DEFAULT_PRELOAD_CONFIG,
  CACHE_CONSTANTS,
  isCacheItem,
  isCacheConfig,
  isCacheEvent,
  createCacheKey,
  parseCacheKey,
  validateCacheConfig,
} from '@/lib/i18n-cache-types-base';

export type {
  CacheStorage,
  PersistentStorage,
  MetricsCollector,
  Preloader,
  CacheManager,
  SerializationOptions,
  CacheExportData,
  CacheSyncOptions,
  CachePartitionConfig,
  CacheCompressionConfig,
  CacheEncryptionConfig,
  CacheMonitoringConfig,
  CacheBackupConfig,
  CacheRecoveryOptions,
  CachePerformanceConfig,
  CacheSecurityConfig,
  CacheObserver,
  CacheMiddleware,
  CacheStrategyInterface,
  CacheAdapter,
  CacheFactory,
  CacheEventEmitter,
  CachePlugin,
  CacheLifecycleHooks,
  CacheStatsCollector,
} from '@/lib/i18n-cache-types-interfaces';

export type {
  AdvancedCacheConfig,
  CacheClusterConfig,
  CacheShardingConfig,
  CacheWarmingConfig,
  CacheInvalidationConfig,
  CacheConsistencyConfig,
  CacheRateLimitConfig,
  CacheQualityConfig,
  CacheExtensionConfig,
  CacheEnvironmentConfig,
} from '@/lib/i18n-cache-types-advanced';

export {
  DEFAULT_ADVANCED_CACHE_CONFIG,
  CacheConfigFactory,
} from '@/lib/i18n-cache-types-advanced';

export {
  CacheKeyUtils,
  CacheTimeUtils,
  CacheSizeUtils,
  CacheStatsUtils,
  CacheValidationUtils,
  CacheSerializationUtils,
  CacheEventUtils,
  CacheDebugUtils,
} from '@/lib/i18n-cache-types-utils';

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
export type {
  // 基础类型
  CacheConfig as Config,
  CacheItem as Item,
  CacheStats as Stats,
  CacheEvent as Event,
  CacheManager as Manager,

  // 高级配置
  AdvancedCacheConfig as AdvancedConfig,
  CacheClusterConfig as ClusterConfig,
  CacheShardingConfig as ShardingConfig,

  // 接口
  CacheStorage as Storage,
  PersistentStorage as PersistentStore,
  MetricsCollector as Metrics,
  Preloader as PreloadManager,

  // 工具类型
  CacheEventType as EventType,
  CacheStrategy as Strategy,
  CacheEventListener as EventListener,
};

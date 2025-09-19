// 向后兼容的重新导出
import type { I18nMetrics, Locale, Messages } from '@/types/i18n';
import { CacheConfigFactory } from '@/../backups/barrel-exports/src/lib/i18n-cache-types-advanced';
import type {
  AdvancedCacheConfig,
  CacheClusterConfig,
  CacheConsistencyConfig,
  CacheEnvironmentConfig,
  CacheExtensionConfig,
  CacheInvalidationConfig,
  CacheQualityConfig,
  CacheRateLimitConfig,
  CacheShardingConfig,
  CacheWarmingConfig,
  DEFAULT_ADVANCED_CACHE_CONFIG,
} from './i18n-cache-types-advanced';
import type {
  CACHE_CONSTANTS,
  CacheConfig,
  CacheConfigValidation,
  CacheDebugInfo,
  CacheError,
  CacheEvent,
  CacheEventListener,
  CacheEventType,
  CacheHealthCheck,
  CacheItem,
  CacheOperationResult,
  CacheSerializationError,
  CacheStats,
  CacheStorageError,
  CacheStrategy,
  CacheValidationError,
  DEFAULT_CACHE_CONFIG,
  DEFAULT_PRELOAD_CONFIG,
  PreloadConfig,
} from './i18n-cache-types-base';
import type {
  CacheAdapter,
  CacheBackupConfig,
  CacheCompressionConfig,
  CacheEncryptionConfig,
  CacheEventEmitter,
  CacheExportData,
  CacheFactory,
  CacheLifecycleHooks,
  CacheManager,
  CacheMiddleware,
  CacheMonitoringConfig,
  CacheObserver,
  CachePartitionConfig,
  CachePerformanceConfig,
  CachePlugin,
  CacheRecoveryOptions,
  CacheSecurityConfig,
  CacheStatsCollector,
  CacheStorage,
  CacheStrategyInterface,
  CacheSyncOptions,
  MetricsCollector,
  PersistentStorage,
  Preloader,
  SerializationOptions,
} from './i18n-cache-types-interfaces';
import {
  CacheDebugUtils,
  CacheEventUtils,
  CacheKeyUtils,
  CacheSerializationUtils,
  CacheSizeUtils,
  CacheStatsUtils,
  CacheTimeUtils,
  CacheValidationUtils,
} from './i18n-cache-types-utils';

/**
 * 国际化缓存基础类型定义 - 主入口
 * I18n Cache Base Type Definitions - Main Entry Point
 *
 * 统一的国际化缓存类型入口，整合所有类型定义模块
 */

// 重新导出所有模块的功能
export * from '@/../backups/barrel-exports/src/lib/i18n-cache-types-base';
export * from '@/../backups/barrel-exports/src/lib/i18n-cache-types-interfaces';
export * from '@/../backups/barrel-exports/src/lib/i18n-cache-types-advanced';
export * from '@/../backups/barrel-exports/src/lib/i18n-cache-types-utils';

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

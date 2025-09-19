/**
 * 国际化缓存接口定义
 * I18n Cache Interface Definitions
 *
 * 提供缓存系统所需的接口定义，包括存储、管理器、预加载器等
 */

import type { I18nMetrics, Locale, Messages } from '@/types/i18n';
import type { CacheEvent, CacheStats } from '@/lib/i18n-cache-types-base';

/**
 * 缓存存储接口
 * Cache storage interface
 */
export interface CacheStorage<T> {
  get(key: string): T | null;
  set(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
  keys(): IterableIterator<string>;
  values(): IterableIterator<T>;
  entries(): IterableIterator<[string, T]>;
}

/**
 * 持久化存储接口
 * Persistent storage interface
 */
export interface PersistentStorage {
  load(key: string): Promise<unknown> | unknown;
  save(key: string, data: unknown): Promise<void> | void;
  remove(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

/**
 * 指标收集器接口
 * Metrics collector interface
 */
export interface MetricsCollector {
  recordLoadTime(time: number): void;
  recordCacheHit(): void;
  recordCacheMiss(): void;
  recordError(): void;
  recordLocaleUsage(locale: Locale): void;
  recordTranslationCoverage(coverage: number): void;
  getMetrics(): I18nMetrics;
  reset(): void;
}

/**
 * 预加载器接口
 * Preloader interface
 */
export interface Preloader {
  preloadLocale(locale: Locale): Promise<Messages>;
  warmupCache(): void;
  isPreloading(): boolean;
  getPreloadProgress(): number;
}

/**
 * 缓存管理器接口
 * Cache manager interface
 */
export interface CacheManager {
  getMessages(locale: Locale): Promise<Messages>;
  preloadMessages(locale: Locale): Promise<Messages>;
  warmupCache(): void;
  getMetrics(): I18nMetrics;
  getCacheStats(): CacheStats;
  clearCache(): void;
  resetMetrics(): void;
}

/**
 * 缓存序列化选项
 * Cache serialization options
 */
export interface SerializationOptions {
  compress: boolean;
  encryption: boolean;
  format: 'json' | 'binary' | 'msgpack';
}

/**
 * 缓存导入/导出
 * Cache import/export
 */
export interface CacheExportData {
  version: string;
  timestamp: number;
  config: Record<string, unknown>;
  entries: Array<{
    key: string;
    data: unknown;
    timestamp: number;
    ttl: number;
    hits: number;
  }>;
  metadata: {
    totalSize: number;
    checksum?: string;
  };
}

/**
 * 缓存同步选项
 * Cache synchronization options
 */
export interface CacheSyncOptions {
  enableSync: boolean;
  syncInterval: number;
  conflictResolution: 'local' | 'remote' | 'merge' | 'manual';
  syncEndpoint?: string;
}

/**
 * 缓存分区配置
 * Cache partition configuration
 */
export interface CachePartitionConfig {
  enablePartitioning: boolean;
  partitionKey: (key: string) => string;
  maxPartitions: number;
  partitionStrategy: 'hash' | 'prefix' | 'custom';
}

/**
 * 缓存压缩配置
 * Cache compression configuration
 */
export interface CacheCompressionConfig {
  enableCompression: boolean;
  algorithm: 'gzip' | 'deflate' | 'brotli';
  threshold: number; // Minimum size to compress
  level: number; // Compression level (1-9)
}

/**
 * 缓存加密配置
 * Cache encryption configuration
 */
export interface CacheEncryptionConfig {
  enableEncryption: boolean;
  algorithm: 'aes-256-gcm' | 'aes-192-gcm' | 'aes-128-gcm';
  keyDerivation: 'pbkdf2' | 'scrypt' | 'argon2';
  saltLength: number;
}

/**
 * 缓存监控配置
 * Cache monitoring configuration
 */
export interface CacheMonitoringConfig {
  enableMonitoring: boolean;
  metricsInterval: number;
  alertThresholds: {
    hitRateBelow: number;
    errorRateAbove: number;
    loadTimeAbove: number;
  };
  webhookUrl?: string;
}

/**
 * 缓存备份配置
 * Cache backup configuration
 */
export interface CacheBackupConfig {
  enableBackup: boolean;
  backupInterval: number;
  maxBackups: number;
  backupLocation: string;
  compressionEnabled: boolean;
}

/**
 * 缓存恢复选项
 * Cache recovery options
 */
export interface CacheRecoveryOptions {
  backupFile: string;
  validateChecksum: boolean;
  mergeStrategy: 'replace' | 'merge' | 'skip_existing';
  onProgress?: (progress: number) => void;
}

/**
 * 缓存性能配置
 * Cache performance configuration
 */
export interface CachePerformanceConfig {
  enableLazyLoading: boolean;
  prefetchThreshold: number;
  maxConcurrentLoads: number;
  loadTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * 缓存安全配置
 * Cache security configuration
 */
export interface CacheSecurityConfig {
  enableAccessControl: boolean;
  allowedOrigins: string[];
  maxKeyLength: number;
  maxValueSize: number;
  sanitizeKeys: boolean;
  validateValues: boolean;
}

/**
 * 缓存观察者接口
 * Cache observer interface
 */
export interface CacheObserver {
  onCacheHit(key: string, data: unknown): void;
  onCacheMiss(key: string): void;
  onCacheSet(key: string, data: unknown): void;
  onCacheDelete(key: string): void;
  onCacheClear(): void;
  onCacheError(error: Error, operation: string): void;
}

/**
 * 缓存中间件接口
 * Cache middleware interface
 */
export interface CacheMiddleware {
  beforeGet?(key: string): string | Promise<string>;
  afterGet?(key: string, value: unknown): unknown | Promise<unknown>;
  beforeSet?(
    key: string,
    value: unknown,
  ): { key: string; value: unknown } | Promise<{ key: string; value: unknown }>;
  afterSet?(key: string, value: unknown): void | Promise<void>;
  beforeDelete?(key: string): string | Promise<string>;
  afterDelete?(key: string): void | Promise<void>;
}

/**
 * 缓存策略接口
 * Cache strategy interface
 */
export interface CacheStrategyInterface {
  shouldEvict(
    items: Array<{ key: string; lastAccessed: number; hits: number }>,
  ): string[];
  onAccess(key: string): void;
  onSet(key: string): void;
  onDelete(key: string): void;
  reset(): void;
}

/**
 * 缓存适配器接口
 * Cache adapter interface
 */
export interface CacheAdapter<T = unknown> {
  name: string;
  isAvailable(): boolean;
  get(key: string): Promise<T | null> | T | null;
  set(key: string, value: T, ttl?: number): Promise<void> | void;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  size(): Promise<number> | number;
  keys(): Promise<string[]> | string[];
}

/**
 * 缓存工厂接口
 * Cache factory interface
 */
export interface CacheFactory {
  createCache<T>(
    name: string,
    config?: Partial<Record<string, unknown>>,
  ): CacheStorage<T>;
  createPersistentStorage(
    name: string,
    config?: Partial<Record<string, unknown>>,
  ): PersistentStorage;
  createMetricsCollector(
    name: string,
    config?: Partial<Record<string, unknown>>,
  ): MetricsCollector;
  createPreloader(
    name: string,
    config?: Partial<Record<string, unknown>>,
  ): Preloader;
}

/**
 * 缓存事件发射器接口
 * Cache event emitter interface
 */
export interface CacheEventEmitter {
  on<T = unknown>(event: string, listener: (data: CacheEvent<T>) => void): void;
  off<T = unknown>(
    event: string,
    listener: (data: CacheEvent<T>) => void,
  ): void;
  emit<T = unknown>(event: string, data: CacheEvent<T>): void;
  once<T = unknown>(
    event: string,
    listener: (data: CacheEvent<T>) => void,
  ): void;
  removeAllListeners(event?: string): void;
}

/**
 * 缓存插件接口
 * Cache plugin interface
 */
export interface CachePlugin {
  name: string;
  version: string;
  install(cache: CacheManager): void;
  uninstall(cache: CacheManager): void;
  isInstalled(): boolean;
}

/**
 * 缓存生命周期钩子
 * Cache lifecycle hooks
 */
export interface CacheLifecycleHooks {
  onInit?(): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
  onConfigChange?(newConfig: Record<string, unknown>): void | Promise<void>;
  onCacheFull?(): void | Promise<void>;
  onCacheEmpty?(): void | Promise<void>;
}

/**
 * 缓存统计收集器接口
 * Cache statistics collector interface
 */
export interface CacheStatsCollector {
  recordOperation(operation: string, duration: number): void;
  recordSize(size: number): void;
  recordHitRate(rate: number): void;
  recordMemoryUsage(usage: number): void;
  getStats(): Record<string, unknown>;
  reset(): void;
  export(): string;
}

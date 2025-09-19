/**
 * 翻译预加载器类型定义
 * Translation Preloader Type Definitions
 *
 * 提供预加载器相关的类型定义和接口
 */

import type { Locale, Messages } from '@/types/i18n';
import type { CacheOperationResult } from '@/lib/i18n-cache-types';
import {
  ANIMATION_DURATION_VERY_SLOW,
  BYTES_PER_KB,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  COUNT_TRIPLE,
  HOURS_PER_DAY,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  SECONDS_PER_MINUTE,
  TEN_SECONDS_MS,
} from '@/constants';
import { COUNT_4 } from '@/constants/count';
import { MAGIC_0_1, MAGIC_0_8 } from '@/constants/decimal';

/**
 * 预加载状态
 * Preload state
 */
export interface PreloadState {
  isPreloading: boolean;
  currentLocale?: Locale;
  progress: number;
  totalLocales: number;
  completedLocales: number;
  errors: Array<{ locale: Locale; error: string }>;
  startTime?: number;
}

/**
 * 预加载统计信息
 * Preload statistics
 */
export interface PreloadStats {
  isActive: boolean;
  progress: number;
  totalLocales: number;
  completedLocales: number;
  errorCount: number;
  duration: number;
  averageLoadTime: number;
  successRate: number;
}

/**
 * 预加载结果
 * Preload result
 */
export interface PreloadResult {
  success: boolean;
  locale: Locale;
  messages?: Messages;
  error?: string;
  loadTime: number;
  fromCache: boolean;
}

/**
 * 批处理结果
 * Batch processing result
 */
export interface BatchResult {
  batchIndex: number;
  results: PreloadResult[];
  totalTime: number;
  successCount: number;
  errorCount: number;
}

/**
 * 预加载选项
 * Preload options
 */
export interface PreloadOptions {
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
  onError?: (error: Error, locale: Locale) => void;
  onSuccess?: (locale: Locale, messages: Messages) => void;
}

/**
 * 智能预加载配置
 * Smart preload configuration
 */
export interface SmartPreloadConfig {
  enabled: boolean;
  maxLocales: number;
  minUsageThreshold: number;
  usageWindow: number; // 统计窗口（小时）
  preloadTrigger: 'immediate' | 'idle' | 'scheduled';
  scheduleInterval?: number; // 定时预加载间隔（分钟）
}

/**
 * 预加载策略配置
 * Preload strategy configuration
 */
export interface PreloadStrategyConfig {
  name: string;
  description: string;
  priority: number;
  conditions: {
    minCacheHitRate?: number;
    maxErrorRate?: number;
    minAvailableMemory?: number;
    networkCondition?: 'fast' | 'slow' | 'offline';
  };
  parameters: {
    batchSize?: number;
    delayBetweenBatches?: number;
    maxConcurrency?: number;
    timeout?: number;
  };
}

/**
 * 预加载器性能指标
 * Preloader performance metrics
 */
export interface PreloaderMetrics {
  totalPreloads: number;
  successfulPreloads: number;
  failedPreloads: number;
  averageLoadTime: number;
  cacheHitRate: number;
  successRate: number;
  memoryUsage: number;
  networkRequests: number;
  lastPreloadTime?: number;
  performanceScore: number;
}

/**
 * 预加载器事件
 * Preloader events
 */
export interface PreloaderEvents {
  onPreloadStart: (locales: Locale[]) => void;
  onPreloadProgress: (progress: number, currentLocale?: Locale) => void;
  onPreloadComplete: (results: PreloadResult[]) => void;
  onPreloadError: (error: Error, locale?: Locale) => void;
  onPreloadCancel: () => void;
  onCacheHit: (locale: Locale, messages: Messages) => void;
  onCacheMiss: (locale: Locale) => void;
  onBatchComplete: (batchResult: BatchResult) => void;
}

/**
 * 预加载器配置
 * Preloader configuration
 */
export interface PreloaderConfig {
  // 基础配置
  enablePreload: boolean;
  preloadLocales: Locale[];
  batchSize: number;
  delayBetweenBatches: number;
  maxConcurrency: number;
  timeout: number;
  retryCount: number;
  retryDelay: number;

  // 智能预加载
  smartPreload: SmartPreloadConfig;

  // 性能配置
  memoryLimit: number;
  networkThrottling: boolean;
  priorityQueue: boolean;

  // 缓存配置
  cacheStrategy: 'aggressive' | 'conservative' | 'adaptive';
  cacheTTL: number;
  maxCacheSize: number;

  // 监控配置
  enableMetrics: boolean;
  metricsInterval: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // 事件处理
  events?: Partial<PreloaderEvents>;
}

/**
 * 预加载器状态管理
 * Preloader state management
 */
export interface PreloaderStateManager {
  getState(): PreloadState;
  setState(state: Partial<PreloadState>): void;
  resetState(): void;
  isPreloading(): boolean;
  getProgress(): number;
  getErrors(): Array<{ locale: Locale; error: string }>;
  addError(locale: Locale, error: string): void;
  clearErrors(): void;
}

/**
 * 预加载器缓存接口
 * Preloader cache interface
 */
export interface PreloaderCache {
  get(locale: Locale): Messages | undefined;
  set(locale: Locale, messages: Messages): void;
  has(locale: Locale): boolean;
  delete(locale: Locale): boolean;
  clear(): void;
  size(): number;
  keys(): Locale[];
  getStats(): {
    hitCount: number;
    missCount: number;
    hitRate: number;
    size: number;
    memoryUsage: number;
  };
}

/**
 * 预加载器网络接口
 * Preloader network interface
 */
export interface PreloaderNetwork {
  loadMessages(locale: Locale, options?: PreloadOptions): Promise<Messages>;
  loadSpecificKeys(
    locale: Locale,
    keys: string[],
    options?: PreloadOptions,
  ): Promise<Partial<Messages>>;
  checkNetworkStatus(): Promise<{
    online: boolean;
    speed: 'fast' | 'slow';
    latency: number;
  }>;
  estimateLoadTime(locale: Locale): Promise<number>;
}

/**
 * 预加载器调度器
 * Preloader scheduler
 */
export interface PreloaderScheduler {
  schedule(task: () => Promise<void>, priority?: number): void;
  cancel(taskId: string): boolean;
  pause(): void;
  resume(): void;
  clear(): void;
  getQueueSize(): number;
  isRunning(): boolean;
}

/**
 * 预加载器监控器
 * Preloader monitor
 */
export interface PreloaderMonitor {
  startMonitoring(): void;
  stopMonitoring(): void;
  getMetrics(): PreloaderMetrics;
  resetMetrics(): void;
  recordPreload(result: PreloadResult): void;
  recordCacheHit(locale: Locale): void;
  recordCacheMiss(locale: Locale): void;
  recordError(error: Error, locale?: Locale): void;
  getPerformanceScore(): number;
}

/**
 * 预加载器工厂配置
 * Preloader factory configuration
 */
export interface PreloaderFactoryConfig {
  cacheType: 'memory' | 'indexeddb' | 'localstorage';
  networkAdapter: 'fetch' | 'xhr' | 'custom';
  schedulerType: 'fifo' | 'priority' | 'adaptive';
  monitoringEnabled: boolean;
  debugMode: boolean;
}

/**
 * 预加载器实例接口
 * Preloader instance interface
 */
export interface IPreloader {
  // 基础预加载方法
  preloadLocale(locale: Locale, options?: PreloadOptions): Promise<Messages>;
  preloadMultipleLocales(
    locales: Locale[],
    options?: PreloadOptions,
  ): Promise<CacheOperationResult<Messages>[]>;
  preloadMissingTranslations(locale: Locale, keys: string[]): Promise<void>;

  // 智能预加载
  smartPreload(): Promise<void>;
  preloadRelatedLocales(currentLocale: Locale): Promise<void>;

  // 缓存管理
  warmupCache(): void;
  clearCache(): void;
  getCacheStats(): { size: number; keys: string[] };

  // 状态管理
  isPreloading(): boolean;
  getPreloadProgress(): number;
  getPreloadState(): PreloadState;
  getPreloadStats(): PreloadStats;

  // 控制方法
  stopPreloading(): void;
  pausePreloading(): void;
  resumePreloading(): void;

  // 配置管理
  setConfig(config: Partial<PreloaderConfig>): void;
  getConfig(): PreloaderConfig;

  // 清理资源
  cleanup(): void;
}

/**
 * 预加载策略函数类型
 * Preload strategy function type
 */
export type PreloadStrategy = (
  preloader: IPreloader,
  locales: Locale[],
  options?: PreloadOptions,
) => Promise<void>;

/**
 * 预加载器工厂函数类型
 * Preloader factory function type
 */
export type PreloaderFactory = (config: PreloaderFactoryConfig) => IPreloader;

/**
 * 预加载器中间件类型
 * Preloader middleware type
 */
export type PreloaderMiddleware = (
  locale: Locale,
  next: () => Promise<Messages>,
) => Promise<Messages>;

/**
 * 预加载策略名称（受控联合）
 * Preload strategy name (controlled union)
 */
export type PreloadStrategyName =
  | 'immediate'
  | 'smart'
  | 'progressive'
  | 'priority'
  | 'lazy'
  | 'batch'
  | 'adaptive'
  | 'networkAware'
  | 'timeAware'
  | 'memoryAware';

/**
 * 预加载器插件接口
 * Preloader plugin interface
 */
export interface PreloaderPlugin {
  name: string;
  version: string;
  install(preloader: IPreloader): void;
  uninstall(preloader: IPreloader): void;
  onPreloadStart?(locales: Locale[]): void;
  onPreloadComplete?(results: PreloadResult[]): void;
  onPreloadError?(error: Error, locale?: Locale): void;
}

/**
 * 预加载器错误类型
 * Preloader error types
 */
export interface PreloaderErrorParams {
  message: string;
  locale?: Locale;
  code?: string;
  retryable?: boolean;
}

export class PreloaderError extends Error {
  public locale: Locale | undefined;
  public code: string | undefined;
  public retryable: boolean;

  constructor(params: PreloaderErrorParams) {
    super(params.message);
    this.name = 'PreloaderError';
    if (params.locale !== undefined) {
      this.locale = params.locale;
    }
    if (params.code !== undefined) {
      this.code = params.code;
    }
    this.retryable = params.retryable ?? true;
  }
}

export class PreloaderTimeoutError extends PreloaderError {
  constructor(locale: Locale, timeout: number) {
    super({
      message: `Preload timeout for locale ${locale} after ${timeout}ms`,
      locale,
      code: 'TIMEOUT',
      retryable: true,
    });
    this.name = 'PreloaderTimeoutError';
  }
}

export class PreloaderNetworkError extends PreloaderError {
  constructor(locale: Locale, originalError: Error) {
    super({
      message: `Network error while preloading ${locale}: ${originalError.message}`,
      locale,
      code: 'NETWORK',
      retryable: true,
    });
    this.name = 'PreloaderNetworkError';
  }
}

export class PreloaderCacheError extends PreloaderError {
  constructor(locale: Locale, operation: string) {
    super({
      message: `Cache error during ${operation} for locale ${locale}`,
      locale,
      code: 'CACHE',
      retryable: false,
    });
    this.name = 'PreloaderCacheError';
  }
}

/**
 * 预加载器常量
 * Preloader constants
 */
export const PRELOADER_CONSTANTS = {
  DEFAULT_BATCH_SIZE: COUNT_TRIPLE,
  DEFAULT_DELAY_BETWEEN_BATCHES: PERCENTAGE_FULL,
  DEFAULT_MAX_CONCURRENCY: COUNT_FIVE,
  DEFAULT_TIMEOUT: TEN_SECONDS_MS,
  DEFAULT_RETRY_COUNT: COUNT_TRIPLE,
  DEFAULT_RETRY_DELAY: ANIMATION_DURATION_VERY_SLOW,
  DEFAULT_CACHE_TTL:
    HOURS_PER_DAY *
    SECONDS_PER_MINUTE *
    SECONDS_PER_MINUTE *
    ANIMATION_DURATION_VERY_SLOW, // 24 hours
  DEFAULT_MEMORY_LIMIT: PERCENTAGE_HALF * BYTES_PER_KB * BYTES_PER_KB, // 50MB
  MIN_USAGE_THRESHOLD: MAGIC_0_1,
  MAX_PRELOAD_LOCALES: COUNT_TEN,
  PERFORMANCE_SCORE_THRESHOLD: MAGIC_0_8,
} as const;

/**
 * 预加载器事件名称
 * Preloader event names
 */
export const PRELOADER_EVENTS = {
  PRELOAD_START: 'preload:start',
  PRELOAD_PROGRESS: 'preload:progress',
  PRELOAD_COMPLETE: 'preload:complete',
  PRELOAD_ERROR: 'preload:error',
  PRELOAD_CANCEL: 'preload:cancel',
  CACHE_HIT: 'cache:hit',
  CACHE_MISS: 'cache:miss',
  BATCH_COMPLETE: 'batch:complete',
  NETWORK_SLOW: 'network:slow',
  MEMORY_WARNING: 'memory:warning',
} as const;

/**
 * 预加载器状态枚举
 * Preloader state enum
 */
export enum PreloaderState {
  IDLE = 'idle',
  PRELOADING = 'preloading',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

/**
 * 预加载优先级枚举
 * Preload priority enum
 */
export enum PreloadPriority {
  LOW = ONE,
  NORMAL = COUNT_PAIR,
  HIGH = COUNT_TRIPLE,
  CRITICAL = COUNT_4,
}

/**
 * 类型守卫函数
 * Type guard functions
 */
export function isPreloadResult(obj: unknown): obj is PreloadResult {
  return (
    Boolean(obj) &&
    typeof obj === 'object' &&
    typeof (obj as Record<string, unknown>).success === 'boolean' &&
    typeof (obj as Record<string, unknown>).locale === 'string' &&
    typeof (obj as Record<string, unknown>).loadTime === 'number' &&
    typeof (obj as Record<string, unknown>).fromCache === 'boolean'
  );
}

export function isPreloadState(obj: unknown): obj is PreloadState {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      typeof (obj as PreloadState).isPreloading === 'boolean' &&
      typeof (obj as PreloadState).progress === 'number' &&
      typeof (obj as PreloadState).totalLocales === 'number' &&
      typeof (obj as PreloadState).completedLocales === 'number' &&
      Array.isArray((obj as PreloadState).errors),
  );
}

export function isPreloaderError(error: unknown): error is PreloaderError {
  return error instanceof PreloaderError;
}

/**
 * 工具类型
 * Utility types
 */
export type PreloadEventHandler<T = Record<string, unknown>> = (
  data: T,
) => void;
export type PreloadEventMap = {
  [K in keyof PreloaderEvents]: PreloaderEvents[K];
};

export type PreloadConfigKey = keyof PreloaderConfig;
export type PreloadStateKey = keyof PreloadState;
export type PreloadStatsKey = keyof PreloadStats;

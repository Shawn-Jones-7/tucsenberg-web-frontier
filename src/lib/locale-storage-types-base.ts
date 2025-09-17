/**
 * 语言存储系统基础类型和常量
 * Locale Storage System Base Types and Constants
 *
 * 提供语言偏好存储系统所需的基础类型定义和常量
 */

import { MAGIC_32, MAGIC_4096 } from "@/constants/count";
import { MAGIC_0_5 } from "@/constants/decimal";
import { ANGLE_90_DEG, ANIMATION_DURATION_VERY_SLOW, BYTES_PER_KB, COUNT_FIVE, COUNT_TEN, COUNT_TRIPLE, DAYS_PER_MONTH, HOURS_PER_DAY, ONE, PERCENTAGE_FULL, PERCENTAGE_HALF, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import type { Locale } from '@/types/i18n';
import { FILE_SECURITY_CONSTANTS } from "@/constants/security-constants";
const FILENAME_MAX_LENGTH = FILE_SECURITY_CONSTANTS.FILENAME_MAX_LENGTH;

/**
 * 存储键名常量
 * Storage key constants
 */
export const STORAGE_KEYS = {
  LOCALE_PREFERENCE: 'locale_preference',
  LOCALE_DETECTION_HISTORY: 'locale_detection_history',
  USER_LOCALE_OVERRIDE: 'user_locale_override',
  LOCALE_ANALYTICS: 'locale_analytics',
  LOCALE_CACHE: 'locale_cache',
  LOCALE_SETTINGS: 'locale_settings',
} as const;

/**
 * 存储键名类型
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * 语言来源类型
 * Locale source types
 */
export type LocaleSource =
  | 'user'
  | 'geo'
  | 'browser'
  | 'default'
  | 'auto'
  | 'fallback'
  | 'user_override';

/**
 * 存储事件类型
 * Storage event types
 */
export type StorageEventType =
  | 'preference_saved'
  | 'preference_loaded'
  | 'preference_updated'
  | 'preference_deleted'
  | 'cache_hit'
  | 'cache_miss'
  | 'cache_cleared'
  | 'error_occurred'
  | 'storage_full'
  | 'migration_started'
  | 'migration_completed'
  | 'backup_created'
  | 'backup_restored'
  | 'history_error'
  | 'override_set'
  | 'override_cleared'
  | 'preference_sync'
  | 'preference_error';

/**
 * 存储常量
 * Storage constants
 */
export const STORAGE_CONSTANTS = {
  MAX_COOKIE_SIZE: MAGIC_4096, // 4KB
  MAX_LOCALSTORAGE_SIZE: COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB, // 5MB
  MAX_SESSIONSTORAGE_SIZE: COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB, // 5MB
  MAX_INDEXEDDB_SIZE: PERCENTAGE_HALF * BYTES_PER_KB * BYTES_PER_KB, // 50MB

  // 数据保留时间
  DEFAULT_RETENTION_TIME: DAYS_PER_MONTH * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // 30天
  CACHE_RETENTION_TIME: HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // 24小时
  ANALYTICS_RETENTION_TIME: ANGLE_90_DEG * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // 90天

  // 性能限制
  MAX_HISTORY_ENTRIES: PERCENTAGE_FULL,
  MAX_ANALYTICS_ENTRIES: ANIMATION_DURATION_VERY_SLOW,
  MAX_CACHE_ENTRIES: PERCENTAGE_HALF,

  // 压缩和加密
  COMPRESSION_THRESHOLD: BYTES_PER_KB, // 1KB
  ENCRYPTION_KEY_LENGTH: MAGIC_32,

  // 同步配置
  SYNC_INTERVAL: COUNT_FIVE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // 5分钟
  SYNC_RETRY_ATTEMPTS: COUNT_TRIPLE,
  SYNC_TIMEOUT: COUNT_TEN * ANIMATION_DURATION_VERY_SLOW, // 10秒

  // 验证配置
  MIN_CONFIDENCE: ZERO,
  MAX_CONFIDENCE: ONE,
  DEFAULT_CONFIDENCE: MAGIC_0_5,

  // 备份配置
  MAX_BACKUP_FILES: COUNT_FIVE,
  BACKUP_INTERVAL: HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // 24小时

  // 错误重试
  MAX_RETRY_ATTEMPTS: COUNT_TRIPLE,
  RETRY_DELAY: ANIMATION_DURATION_VERY_SLOW, // 1秒

  // 健康检查
  HEALTH_CHECK_INTERVAL: SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW, // 1分钟
  HEALTH_CHECK_TIMEOUT: COUNT_FIVE * ANIMATION_DURATION_VERY_SLOW, // 5秒
} as const;

/**
 * 存储类型枚举
 * Storage type enumeration
 */
export const STORAGE_TYPES = {
  COOKIE: 'cookie',
  LOCAL_STORAGE: 'localStorage',
  SESSION_STORAGE: 'sessionStorage',
  INDEXED_DB: 'indexedDB',
  MEMORY: 'memory',
} as const;

export type StorageType = (typeof STORAGE_TYPES)[keyof typeof STORAGE_TYPES];

/**
 * 压缩算法类型
 * Compression algorithm types
 */
export const COMPRESSION_ALGORITHMS = {
  NONE: 'none',
  GZIP: 'gzip',
  LZ4: 'lz4',
  BROTLI: 'brotli',
} as const;

export type CompressionAlgorithm =
  (typeof COMPRESSION_ALGORITHMS)[keyof typeof COMPRESSION_ALGORITHMS];

/**
 * 加密算法类型
 * Encryption algorithm types
 */
export const ENCRYPTION_ALGORITHMS = {
  NONE: 'none',
  AES_256_GCM: 'aes-256-gcm',
  CHACHA20_POLY1305: 'chacha20-poly1305',
} as const;

export type EncryptionAlgorithm =
  (typeof ENCRYPTION_ALGORITHMS)[keyof typeof ENCRYPTION_ALGORITHMS];

/**
 * 同步状态类型
 * Sync status types
 */
export const SYNC_STATUS = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error',
  CONFLICT: 'conflict',
} as const;

export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

/**
 * 迁移状态类型
 * Migration status types
 */
export const MIGRATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back',
} as const;

export type MigrationStatus =
  (typeof MIGRATION_STATUS)[keyof typeof MIGRATION_STATUS];

/**
 * 健康状态类型
 * Health status types
 */
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export type HealthStatus = (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];

/**
 * 错误类型
 * Error types
 */
export const ERROR_TYPES = {
  STORAGE_FULL: 'storage_full',
  QUOTA_EXCEEDED: 'quota_exceeded',
  ACCESS_DENIED: 'access_denied',
  NETWORK_ERROR: 'network_error',
  PARSE_ERROR: 'parse_error',
  VALIDATION_ERROR: 'validation_error',
  ENCRYPTION_ERROR: 'encryption_error',
  COMPRESSION_ERROR: 'compression_error',
  SYNC_ERROR: 'sync_error',
  MIGRATION_ERROR: 'migration_error',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

export type ErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];

/**
 * 优先级类型
 * Priority types
 */
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type PriorityLevel =
  (typeof PRIORITY_LEVELS)[keyof typeof PRIORITY_LEVELS];

/**
 * 环境类型
 * Environment types
 */
export const ENVIRONMENT_TYPES = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export type EnvironmentType =
  (typeof ENVIRONMENT_TYPES)[keyof typeof ENVIRONMENT_TYPES];

/**
 * 浏览器类型
 * Browser types
 */
export const BROWSER_TYPES = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  EDGE: 'edge',
  OPERA: 'opera',
  IE: 'ie',
  UNKNOWN: 'unknown',
} as const;

export type BrowserType = (typeof BROWSER_TYPES)[keyof typeof BROWSER_TYPES];

/**
 * 设备类型
 * Device types
 */
export const DEVICE_TYPES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  UNKNOWN: 'unknown',
} as const;

export type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES];

/**
 * 操作系统类型
 * Operating system types
 */
export const OS_TYPES = {
  WINDOWS: 'windows',
  MACOS: 'macos',
  LINUX: 'linux',
  IOS: 'ios',
  ANDROID: 'android',
  UNKNOWN: 'unknown',
} as const;

export type OSType = (typeof OS_TYPES)[keyof typeof OS_TYPES];

/**
 * 版本信息接口
 * Version information interface
 */
export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  build?: string;
  prerelease?: string;
}

/**
 * 时间戳工具函数
 * Timestamp utility functions
 */
export const TimestampUtils = {
  /**
   * 获取当前时间戳
   * Get current timestamp
   */
  now(): number {
    return Date.now();
  },

  /**
   * 检查时间戳是否过期
   * Check if timestamp is expired
   */
  isExpired(timestamp: number, maxAge: number): boolean {
    return Date.now() - timestamp > maxAge;
  },

  /**
   * 格式化时间戳
   * Format timestamp
   */
  format(timestamp: number, locale = 'en-US'): string {
    return new Date(timestamp).toLocaleString(locale);
  },

  /**
   * 计算时间差
   * Calculate time difference
   */
  diff(start: number, end: number): number {
    return Math.abs(end - start);
  },

  /**
   * 添加时间
   * Add time
   */
  add(timestamp: number, milliseconds: number): number {
    return timestamp + milliseconds;
  },

  /**
   * 减去时间
   * Subtract time
   */
  subtract(timestamp: number, milliseconds: number): number {
    return timestamp - milliseconds;
  },
} as const;

/**
 * 基础验证函数
 * Basic validation functions
 */
export const BaseValidators = {
  /**
   * 验证语言代码
   * Validate locale code
   */
  isValidLocale(locale: string): locale is Locale {
    return ['en', 'zh'].includes(locale);
  },

  /**
   * 验证来源类型
   * Validate source type
   */
  isValidSource(source: string): source is LocaleSource {
    return ['user', 'geo', 'browser', 'default', 'auto', 'fallback'].includes(
      source,
    );
  },

  /**
   * 验证置信度
   * Validate confidence
   */
  isValidConfidence(confidence: number): boolean {
    return (
      typeof confidence === 'number' &&
      confidence >= STORAGE_CONSTANTS.MIN_CONFIDENCE &&
      confidence <= STORAGE_CONSTANTS.MAX_CONFIDENCE
    );
  },

  /**
   * 验证时间戳
   * Validate timestamp
   */
  isValidTimestamp(timestamp: number): boolean {
    return (
      typeof timestamp === 'number' && timestamp > ZERO && timestamp <= Date.now()
    );
  },

  /**
   * 验证存储键
   * Validate storage key
   */
  isValidStorageKey(key: string): boolean {
    return typeof key === 'string' && key.length > ZERO && key.length <= FILE_SECURITY_CONSTANTS.FILENAME_MAX_LENGTH;
  },
} as const;

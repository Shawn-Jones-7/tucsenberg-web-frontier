// 向后兼容的重新导出
import type { Locale } from '@/types/i18n';
import type {
  BaseValidators,
  BrowserType,
  CompressionAlgorithm,
  DeviceType,
  EncryptionAlgorithm,
  EnvironmentType,
  ErrorType,
  HealthStatus,
  LocaleSource,
  MigrationStatus,
  OSType,
  PriorityLevel,
  STORAGE_CONSTANTS,
  STORAGE_KEYS,
  StorageEventType,
  StorageType,
  SyncStatus,
  TimestampUtils,
  VersionInfo,
} from './locale-storage-types-base';
import type {
  CONFIG_MIGRATIONS,
  CONFIG_PRESETS,
  CONFIG_VALIDATION_RULES,
  ConfigMigration,
  ConfigValidationRules,
  DEFAULT_STORAGE_CONFIG,
  EnvironmentConfig,
  StorageConfig,
} from './locale-storage-types-config';
import type {
  AuditLogEntry,
  ConfigSnapshot,
  DataExport,
  DataImportResult,
  DeviceInfo,
  ErrorInfo,
  GeolocationInfo,
  LocaleDetectionHistory,
  LocaleDetectionRecord,
  NetworkInfo,
  PerformanceMetrics,
  SessionInfo,
  StorageBackupData,
  StorageCompressionConfig,
  StorageEncryptionConfig,
  StorageEvent,
  StorageEventListener,
  StorageHealthCheck,
  StorageMigrationConfig,
  StorageOperationResult,
  StorageStats,
  StorageSyncConfig,
  UserLocalePreference,
  ValidationResult,
} from './locale-storage-types-data';
import {
  compareObjects,
  createStorageKey,
  debounce,
  deepClone,
  estimateStorageSize,
  formatByteSize,
  formatDuration,
  generateChecksum,
  generateUniqueId,
  isLocaleDetectionHistory,
  isStorageConfig,
  isUserLocalePreference,
  mergeObjects,
  parseStorageKey,
  retry,
  safeJsonParse,
  safeJsonStringify,
  throttle,
  validateDetectionHistory,
  validatePreference,
} from './locale-storage-types-utils';

/**
 * 语言存储系统基础类型定义 - 主入口
 * Locale Storage System Base Type Definitions - Main Entry Point
 *
 * 统一的语言存储系统类型入口，整合所有类型定义模块
 */

// 重新导出所有模块的功能
export * from '@/../backups/barrel-exports/src/lib/locale-storage-types-base';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-types-data';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-types-config';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-types-utils';

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
export type {
  // 基础类型
  STORAGE_KEYS as StorageKeys,
  LocaleSource as Source,
  StorageEventType as EventType,

  // 数据结构
  UserLocalePreference as Preference,
  LocaleDetectionRecord as DetectionRecord,
  LocaleDetectionHistory as DetectionHistory,
  StorageOperationResult as OperationResult,
  StorageEvent as Event,
  StorageEventListener as EventListener,

  // 配置
  StorageConfig as Config,
  DEFAULT_STORAGE_CONFIG as DefaultConfig,

  // 工具函数类型
  ValidationResult as Validation,
};

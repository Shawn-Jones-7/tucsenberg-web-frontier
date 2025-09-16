/**
 * 语言存储系统基础类型定义 - 主入口
 * Locale Storage System Base Type Definitions - Main Entry Point
 *
 * 统一的语言存储系统类型入口，整合所有类型定义模块
 */

// 重新导出所有模块的功能
// 导出基础常量和枚举
export {
  STORAGE_KEYS,
  STORAGE_CONSTANTS,
  STORAGE_TYPES,
  COMPRESSION_ALGORITHMS,
  ENCRYPTION_ALGORITHMS,
  SYNC_STATUS,
  MIGRATION_STATUS,
  HEALTH_STATUS,
  ERROR_TYPES,
  PRIORITY_LEVELS,
  ENVIRONMENT_TYPES,
  BROWSER_TYPES,
  DEVICE_TYPES,
  OS_TYPES,
  TimestampUtils,
  BaseValidators,
} from './locale-storage-types-base';
// 导出基础类型
export type {
  StorageKey,
  LocaleSource,
  StorageEventType,
  StorageType,
  CompressionAlgorithm,
  EncryptionAlgorithm,
  SyncStatus,
  MigrationStatus,
  HealthStatus,
  ErrorType,
  PriorityLevel,
  EnvironmentType,
  BrowserType,
  DeviceType,
  OSType,
  VersionInfo,
} from './locale-storage-types-base';
// 导出数据结构类型
export type {
  UserLocalePreference,
  LocaleDetectionRecord,
  LocaleDetectionHistory,
  StorageStats,
  StorageOperationResult,
  StorageEvent,
  StorageEventListener,
  StorageHealthCheck,
  ValidationResult,
  StorageBackupData,
  StorageMigrationConfig,
  StorageCompressionConfig,
  StorageEncryptionConfig,
  StorageSyncConfig,
  DeviceInfo,
  NetworkInfo,
  GeolocationInfo,
  SessionInfo,
  PerformanceMetrics,
  ErrorInfo,
  AuditLogEntry,
  ConfigSnapshot,
  DataExport,
  DataImportResult,
} from './locale-storage-types-data';
export type { MaintenanceOptions } from '@/lib/locale-storage-types-data';
export type {
  ExportData,
  ImportData,
} from './locale-storage-maintenance-import-export';
// 导出配置相关
export {
  DEFAULT_STORAGE_CONFIG,
  CONFIG_PRESETS,
  CONFIG_VALIDATION_RULES,
  CONFIG_MIGRATIONS,
} from './locale-storage-types-config';
export type {
  StorageConfig,
  EnvironmentConfig,
  ConfigValidationRules,
  ConfigMigration,
  ConfigFactory,
} from './locale-storage-types-config';
// 导出工具函数
export {
  isUserLocalePreference,
  isLocaleDetectionHistory,
  isStorageSyncConfig,
  validatePreference,
  validateDetectionHistory,
  createStorageKey,
  parseStorageKey,
  estimateStorageSize,
  generateChecksum,
  deepClone,
  mergeObjects,
  compareObjects,
  formatByteSize,
  formatDuration,
  generateUniqueId,
  throttle,
  debounce,
  retry,
  safeJsonParse,
  safeJsonStringify,
} from './locale-storage-types-utils';

// ==================== 向后兼容的别名导出（正确的 from 语法） ====================

// 基础类型别名（来自 base 模块）
export type {
  LocaleSource as Source,
  StorageEventType as EventType,
} from './locale-storage-types-base';

// 数据结构类型别名（来自 data 模块）
export type {
  UserLocalePreference as Preference,
  LocaleDetectionRecord as DetectionRecord,
  LocaleDetectionHistory as DetectionHistory,
  StorageOperationResult as OperationResult,
  StorageEvent as Event,
  StorageEventListener as EventListener,
  ValidationResult as Validation,
} from './locale-storage-types-data';

// 配置别名（值与类型分别导出）
export { DEFAULT_STORAGE_CONFIG as DefaultConfig } from '@/lib/locale-storage-types-config';
export type { StorageConfig as Config } from '@/lib/locale-storage-types-config';

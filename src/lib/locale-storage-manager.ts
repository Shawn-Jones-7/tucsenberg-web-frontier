/**
 * 语言存储管理器 - 主入口文件
 * Locale Storage Manager - Main Entry Point
 *
 * 统一的语言偏好存储管理接口，整合所有子模块功能
 */

'use client';

// 重新导出所有模块的类型和功能
// 导出常量和枚举
// 导入主要功能类
import type { Locale } from '@/types/i18n';
import { LocaleStorageAnalytics as LocaleAnalyticsManager } from '@/lib/locale-storage-analytics';
import { LocaleHistoryManager } from '@/lib/locale-storage-history';
import { LocaleMaintenanceManager } from '@/lib/locale-storage-maintenance';
import { LocalePreferenceManager } from '@/lib/locale-storage-preference';
import type {
  LocaleDetectionHistory,
  MaintenanceOptions,
  UserLocalePreference,
} from './locale-storage-types';

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
  DEFAULT_STORAGE_CONFIG,
  CONFIG_PRESETS,
  CONFIG_VALIDATION_RULES,
  CONFIG_MIGRATIONS,
} from './locale-storage-types';
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
} from './locale-storage-types';
// 导出类型定义
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
  TimestampUtils,
  BaseValidators,
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
  StorageConfig,
  EnvironmentConfig,
  ConfigValidationRules,
  ConfigMigration,
  ConfigFactory,
  Source,
  EventType,
  Preference,
  DetectionRecord,
  DetectionHistory,
  OperationResult,
  Event,
  EventListener,
  Config,
  DefaultConfig,
  Validation,
} from './locale-storage-types';
// 导出偏好管理功能
export {
  validatePreferenceData,
  createDefaultPreference,
  normalizePreference,
  saveUserPreference,
  getUserPreference,
  updatePreferenceConfidence,
  hasUserPreference,
  getPreferenceSourcePriority,
  comparePreferences,
  getPreferenceSummary,
  clearUserPreference,
  setUserOverride,
  getUserOverride,
  clearUserOverride,
  hasUserOverride,
  getOverrideHistory,
  recordOverrideOperation,
  getOverrideStats,
  clearOverrideHistory,
  exportOverrideData,
  importOverrideData,
  PreferenceCacheManager,
  syncPreferenceData,
  checkDataConsistency,
  fixDataInconsistency,
  getStorageUsage,
  optimizeStoragePerformance,
  PreferenceEventManager,
  createPreferenceSavedEvent,
  createPreferenceLoadedEvent,
  createOverrideSetEvent,
  createOverrideClearedEvent,
  createSyncEvent,
  createPreferenceErrorEvent,
  getPreferenceHistory,
  recordPreferenceHistory,
  clearPreferenceHistory,
  getPreferenceChangeStats,
  consoleLogListener,
  historyRecordingListener,
  setupDefaultListeners,
  cleanupEventSystem,
  getEventSystemStatus,
  LocalePreferenceManager,
  type PreferenceManager,
} from './locale-storage-preference';
// 导出历史管理功能
export {
  LocaleHistoryManager,
  type HistoryManager,
} from './locale-storage-history';
export type { QueryConditions } from '@/lib/locale-storage-history';
// 导出分析功能
export {
  LocaleStorageAnalytics,
  type Analytics,
} from './locale-storage-analytics';
export type {
  UsagePatterns,
  UsageTrends,
  ExportData,
} from './locale-storage-analytics';
// 导出维护功能
export { LocaleMaintenanceManager } from '@/lib/locale-storage-maintenance';

/**
 * 统一的语言存储管理器
 * Unified locale storage manager
 *
 * 提供向后兼容的API，整合所有子模块功能
 */
export class LocaleStorageManager {
  /**
   * 保存用户语言偏好
   * Save user locale preference
   */
  static saveUserPreference(preference: UserLocalePreference): void {
    const result = LocalePreferenceManager.saveUserPreference(preference);
    // 忽略返回值，保持向后兼容的void返回类型
    
  }

  /**
   * 获取用户语言偏好
   * Get user locale preference
   */
  static getUserPreference(): UserLocalePreference | null {
    const result = LocalePreferenceManager.getUserPreference();
    return result.success ? (result.data ?? null) : null;
  }

  /**
   * 设置用户手动选择的语言
   * Set user manually selected locale
   */
  static setUserOverride(locale: Locale): void {
    const result = LocalePreferenceManager.setUserOverride(locale);
    // 忽略返回值，保持向后兼容的void返回类型
    
  }

  /**
   * 获取用户手动选择的语言
   * Get user manually selected locale
   */
  static getUserOverride(): Locale | null {
    const result = LocalePreferenceManager.getUserOverride();
    return result.success ? (result.data ?? null) : null;
  }

  /**
   * 清除用户手动选择
   * Clear user manual selection
   */
  static clearUserOverride(): void {
    const result = LocalePreferenceManager.clearUserOverride();
    // 忽略返回值，保持向后兼容的void返回类型
    
  }

  /**
   * 获取检测历史
   * Get detection history
   */
  static getDetectionHistory(): LocaleDetectionHistory | null {
    const result = LocaleHistoryManager.getDetectionHistory();
    return result.success ? result.data || null : null;
  }

  /**
   * 获取回退语言
   * Get fallback locale
   */
  static getFallbackLocale(): Locale | null {
    // 返回默认语言作为回退
    return 'en';
  }

  /**
   * 添加检测记录
   * Add detection record
   */
  static addDetectionRecord(detection: {
    locale: Locale;
    source: string;
    timestamp: number;
    confidence: number;
  }): void {
    return (LocaleHistoryManager.addDetectionRecord as any)(detection);
  }

  /**
   * 获取最近的检测记录
   * Get recent detection records
   */
  static getRecentDetections(limit: number = 5): Array<{
    locale: Locale;
    source: string;
    timestamp: number;
    confidence: number;
  }> {
    return LocaleHistoryManager.getRecentDetections(limit);
  }

  /**
   * 清除所有存储数据
   * Clear all storage data
   */
  static clearAll(): void {
    const result = LocaleMaintenanceManager.clearAll();
    // 忽略返回值，保持向后兼容的void返回类型
    
  }

  /**
   * 获取存储统计信息
   * Get storage statistics
   */
  static getStorageStats() {
    return LocaleAnalyticsManager.getStorageStats();
  }

  /**
   * 验证偏好数据的有效性
   * Validate preference data integrity
   */
  static validatePreference(preference: UserLocalePreference): boolean {
    return LocalePreferenceManager.validatePreference(preference);
  }

  /**
   * 清理过期的检测记录
   * Clean up expired detection records
   */
  static cleanupExpiredDetections(
    maxAgeMs: number = 30 * 24 * 60 * 60 * 1000,
  ): void {
    const result = LocaleMaintenanceManager.cleanupExpiredDetections(maxAgeMs);
    // 忽略返回值，保持向后兼容的void返回类型
    
  }

  /**
   * 导出所有存储数据
   * Export all storage data
   */
  static exportData() {
    return LocaleMaintenanceManager.exportData();
  }

  /**
   * 导入存储数据
   * Import storage data
   */
  static importData(data: {
    preference?: UserLocalePreference;
    override?: Locale;
    history?: LocaleDetectionHistory;
  }): void {
    const importData: any = {};
    if (data.preference) importData.preference = data.preference;
    if (data.override) importData.override = data.override;
    if (data.history) importData.history = data.history;

    const result = LocaleMaintenanceManager.importData(importData);
    // 忽略返回值，保持向后兼容的void返回类型
    
  }

  /**
   * 执行存储维护
   * Perform storage maintenance
   */
  static performMaintenance(options?: MaintenanceOptions) {
    return LocaleMaintenanceManager.performMaintenance(options);
  }

  /**
   * 验证存储数据完整性
   * Validate storage data integrity
   */
  static validateStorageIntegrity() {
    return LocaleMaintenanceManager.validateStorageIntegrity();
  }
}

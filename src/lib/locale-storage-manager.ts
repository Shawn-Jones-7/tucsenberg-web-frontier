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
import { LocaleStorageAnalytics as LocaleAnalyticsManager } from '@/lib/locale-storage-analytics';
import { ANIMATION_DURATION_VERY_SLOW, COUNT_FIVE, DAYS_PER_MONTH, HOURS_PER_DAY, SECONDS_PER_MINUTE } from '@/constants';

import { LocaleHistoryManager } from '@/lib/locale-storage-history';
import { LocaleMaintenanceManager } from '@/lib/locale-storage-maintenance';
import { LocalePreferenceManager } from '@/lib/locale-storage-preference';
import type { Locale } from '@/types/i18n';
import type {
  LocaleDetectionHistory,
  LocaleSource,
  MaintenanceOptions,
  UserLocalePreference,
} from '@/lib/locale-storage-types';

export {
  BROWSER_TYPES, COMPRESSION_ALGORITHMS, CONFIG_MIGRATIONS, CONFIG_PRESETS,
  CONFIG_VALIDATION_RULES, DEFAULT_STORAGE_CONFIG, DEVICE_TYPES, ENCRYPTION_ALGORITHMS, ENVIRONMENT_TYPES, ERROR_TYPES, HEALTH_STATUS, MIGRATION_STATUS, OS_TYPES, PRIORITY_LEVELS, STORAGE_CONSTANTS, STORAGE_KEYS, STORAGE_TYPES, SYNC_STATUS
} from '@/lib/locale-storage-types';
// 导出工具函数
export {
  compareObjects, createStorageKey, debounce, deepClone, estimateStorageSize, formatByteSize,
  formatDuration, generateChecksum, generateUniqueId, isLocaleDetectionHistory,
  isStorageSyncConfig, isUserLocalePreference, mergeObjects, parseStorageKey, retry,
  safeJsonParse,
  safeJsonStringify, throttle, validateDetectionHistory, validatePreference
} from '@/lib/locale-storage-types';
// 导出类型定义
export type {
  AuditLogEntry, BaseValidators, BrowserType, CompressionAlgorithm, Config, ConfigFactory, ConfigMigration, ConfigSnapshot, ConfigValidationRules, DataExport,
  DataImportResult, DefaultConfig, DetectionHistory, DetectionRecord, DeviceInfo, DeviceType, EncryptionAlgorithm, EnvironmentConfig, EnvironmentType, ErrorInfo, ErrorType, Event,
  EventListener, EventType, GeolocationInfo, HealthStatus, LocaleDetectionHistory, LocaleDetectionRecord, LocaleSource, MigrationStatus, NetworkInfo, OperationResult, OSType, PerformanceMetrics, Preference, PriorityLevel, SessionInfo, Source, StorageBackupData, StorageCompressionConfig, StorageConfig, StorageEncryptionConfig, StorageEvent,
  StorageEventListener, StorageEventType, StorageHealthCheck, StorageKey, StorageMigrationConfig, StorageOperationResult, StorageStats, StorageSyncConfig, StorageType, SyncStatus, TimestampUtils, UserLocalePreference, Validation, ValidationResult, VersionInfo
} from '@/lib/locale-storage-types';
// 导出偏好管理功能
export {
  checkDataConsistency, cleanupEventSystem, clearOverrideHistory, clearPreferenceHistory, clearUserOverride, clearUserPreference, comparePreferences, consoleLogListener, createDefaultPreference, createOverrideClearedEvent, createOverrideSetEvent, createPreferenceErrorEvent, createPreferenceLoadedEvent, createPreferenceSavedEvent, createSyncEvent, exportOverrideData, fixDataInconsistency, getEventSystemStatus, getOverrideHistory, getOverrideStats, getPreferenceChangeStats, getPreferenceHistory, getPreferenceSourcePriority, getPreferenceSummary, getStorageUsage, getUserOverride, getUserPreference, hasUserOverride, hasUserPreference, historyRecordingListener, importOverrideData, LocalePreferenceManager, normalizePreference, optimizeStoragePerformance, PreferenceCacheManager, PreferenceEventManager, recordOverrideOperation, recordPreferenceHistory, saveUserPreference, setupDefaultListeners, setUserOverride, syncPreferenceData, updatePreferenceConfidence, validatePreferenceData, type PreferenceManager
} from '@/lib/locale-storage-preference';
// 导出历史管理功能
export type { QueryConditions } from '@/lib/locale-storage-history';
export {
  LocaleHistoryManager,
  type HistoryManager
} from '@/lib/locale-storage-history';
// 导出分析功能
export {
  LocaleStorageAnalytics,
  type Analytics
} from '@/lib/locale-storage-analytics';
export type {
  ExportData, UsagePatterns,
  UsageTrends
} from '@/lib/locale-storage-analytics';
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
    LocalePreferenceManager.saveUserPreference(preference);
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
    LocalePreferenceManager.setUserOverride(locale);
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
    LocalePreferenceManager.clearUserOverride();
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
    LocaleHistoryManager.addDetectionRecord({
      locale: detection.locale,
      source: detection.source as LocaleSource,
      confidence: detection.confidence,
      metadata: { timestamp: detection.timestamp },
    });
  }

  /**
   * 获取最近的检测记录
   * Get recent detection records
   */
  static getRecentDetections(limit: number = COUNT_FIVE): Array<{
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
    LocaleMaintenanceManager.clearAll();
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
    maxAgeMs: number = DAYS_PER_MONTH * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
  ): void {
    LocaleMaintenanceManager.cleanupExpiredDetections(maxAgeMs);
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
    const payload: {
      preference?: UserLocalePreference;
      override?: Locale;
      history?: LocaleDetectionHistory;
    } = {};
    if (data.preference) payload.preference = data.preference;
    if (data.override) payload.override = data.override;
    if (data.history) payload.history = data.history;

    LocaleMaintenanceManager.importData(payload);
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

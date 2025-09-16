/**
 * 语言存储管理器 - 主入口文件
 * Locale Storage Manager - Main Entry Point
 *
 * 统一的语言偏好存储管理接口，整合所有子模块功能
 */

'use client';

// 重新导出所有模块的类型和功能
// 导入主要功能类
import type { Locale } from '@/types/i18n';
import { LocaleAnalyticsManager } from '@/../backups/barrel-exports/src/lib/locale-storage-analytics';
import { LocaleHistoryManager } from '@/../backups/barrel-exports/src/lib/locale-storage-history';
import { LocaleMaintenanceManager } from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance';
import { LocalePreferenceManager } from '@/../backups/barrel-exports/src/lib/locale-storage-preference';
import type {
  LocaleDetectionHistory,
  MaintenanceOptions,
  UserLocalePreference,
} from './locale-storage-types';

export * from '@/../backups/barrel-exports/src/lib/locale-storage-types';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-preference';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-history';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-analytics';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance';

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
    return LocalePreferenceManager.saveUserPreference(preference);
  }

  /**
   * 获取用户语言偏好
   * Get user locale preference
   */
  static getUserPreference(): UserLocalePreference | null {
    return LocalePreferenceManager.getUserPreference();
  }

  /**
   * 设置用户手动选择的语言
   * Set user manually selected locale
   */
  static setUserOverride(locale: Locale): void {
    return LocalePreferenceManager.setUserOverride(locale);
  }

  /**
   * 获取用户手动选择的语言
   * Get user manually selected locale
   */
  static getUserOverride(): Locale | null {
    return LocalePreferenceManager.getUserOverride();
  }

  /**
   * 清除用户手动选择
   * Clear user manual selection
   */
  static clearUserOverride(): void {
    return LocalePreferenceManager.clearUserOverride();
  }

  /**
   * 获取检测历史
   * Get detection history
   */
  static getDetectionHistory(): LocaleDetectionHistory | null {
    return LocaleHistoryManager.getDetectionHistory();
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
    return LocaleHistoryManager.addDetectionRecord(detection);
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
    return LocaleMaintenanceManager.clearAll();
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
    return LocaleMaintenanceManager.cleanupExpiredDetections(maxAgeMs);
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
    return LocaleMaintenanceManager.importData(data);
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

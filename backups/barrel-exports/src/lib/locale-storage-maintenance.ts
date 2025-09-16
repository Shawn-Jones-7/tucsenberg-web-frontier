/**
 * 语言存储维护管理 - 主入口
 * Locale Storage Maintenance - Main Entry Point
 *
 * 统一的语言存储维护入口，整合所有维护功能模块
 */

'use client';

// 重新导出所有模块的功能
// 导入各个功能模块
import { LocaleCleanupManager } from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance-cleanup';
import { LocaleImportExportManager } from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance-import-export';
import { LocaleMaintenanceOperationsManager } from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance-operations';
import { LocaleValidationManager } from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance-validation';
import type {
  ExportData,
  ImportData,
  MaintenanceOptions,
  StorageOperationResult,
} from './locale-storage-types';

export * from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance-cleanup';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance-validation';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance-operations';
export * from '@/../backups/barrel-exports/src/lib/locale-storage-maintenance-import-export';

/**
 * 语言存储维护管理器 - 统一接口
 * Locale storage maintenance manager - Unified interface
 */
export class LocaleMaintenanceManager {
  // ==================== 清理操作 ====================

  /**
   * 清除所有存储数据
   * Clear all storage data
   */
  static clearAll(): StorageOperationResult {
    return LocaleCleanupManager.clearAll();
  }

  /**
   * 清理过期的检测记录
   * Clean up expired detection records
   */
  static cleanupExpiredDetections(maxAgeMs?: number): StorageOperationResult {
    return LocaleCleanupManager.cleanupExpiredDetections(maxAgeMs);
  }

  /**
   * 清理特定类型的存储数据
   * Clean up specific type of storage data
   */
  static clearSpecificData(
    dataType: Parameters<typeof LocaleCleanupManager.clearSpecificData>[0],
  ): StorageOperationResult {
    return LocaleCleanupManager.clearSpecificData(dataType);
  }

  /**
   * 清理无效的用户偏好数据
   * Clean up invalid user preference data
   */
  static cleanupInvalidPreferences(): StorageOperationResult {
    return LocaleCleanupManager.cleanupInvalidPreferences();
  }

  /**
   * 清理重复的检测记录
   * Clean up duplicate detection records
   */
  static cleanupDuplicateDetections(): StorageOperationResult {
    return LocaleCleanupManager.cleanupDuplicateDetections();
  }

  /**
   * 获取清理统计信息
   * Get cleanup statistics
   */
  static getCleanupStats(): ReturnType<
    typeof LocaleCleanupManager.getCleanupStats
  > {
    return LocaleCleanupManager.getCleanupStats();
  }

  // ==================== 验证操作 ====================

  /**
   * 验证存储数据完整性
   * Validate storage data integrity
   */
  static validateStorageIntegrity(): StorageOperationResult {
    return LocaleValidationManager.validateStorageIntegrity();
  }

  /**
   * 验证用户偏好数据
   * Validate user preference data
   */
  static validatePreferenceData(
    preference: Parameters<
      typeof LocaleValidationManager.validatePreferenceData
    >[0],
  ): boolean {
    return LocaleValidationManager.validatePreferenceData(preference);
  }

  /**
   * 验证检测历史数据
   * Validate detection history data
   */
  static validateHistoryData(
    history: Parameters<typeof LocaleValidationManager.validateHistoryData>[0],
  ): boolean {
    return LocaleValidationManager.validateHistoryData(history);
  }

  /**
   * 验证存储同步状态
   * Validate storage synchronization
   */
  static validateStorageSync(): string[] {
    return LocaleValidationManager.validateStorageSync();
  }

  /**
   * 验证特定存储键的数据
   * Validate data for specific storage key
   */
  static validateSpecificData(
    key: Parameters<typeof LocaleValidationManager.validateSpecificData>[0],
  ): ReturnType<typeof LocaleValidationManager.validateSpecificData> {
    return LocaleValidationManager.validateSpecificData(key);
  }

  /**
   * 验证所有存储数据
   * Validate all storage data
   */
  static validateAllData(): ReturnType<
    typeof LocaleValidationManager.validateAllData
  > {
    return LocaleValidationManager.validateAllData();
  }

  /**
   * 检查数据一致性
   * Check data consistency
   */
  static checkDataConsistency(): StorageOperationResult {
    return LocaleValidationManager.checkDataConsistency();
  }

  /**
   * 获取验证摘要
   * Get validation summary
   */
  static getValidationSummary(): ReturnType<
    typeof LocaleValidationManager.getValidationSummary
  > {
    return LocaleValidationManager.getValidationSummary();
  }

  /**
   * 修复同步问题
   * Fix synchronization issues
   */
  static fixSyncIssues(): StorageOperationResult {
    return LocaleValidationManager.fixSyncIssues();
  }

  // ==================== 维护操作 ====================

  /**
   * 执行存储维护
   * Perform storage maintenance
   */
  static performMaintenance(
    options: MaintenanceOptions = {},
  ): StorageOperationResult {
    return LocaleMaintenanceOperationsManager.performMaintenance(options);
  }

  /**
   * 压缩存储空间
   * Compact storage space
   */
  static compactStorage(): StorageOperationResult {
    return LocaleMaintenanceOperationsManager.compactStorage();
  }

  /**
   * 优化检测历史数据
   * Optimize detection history data
   */
  static optimizeDetectionHistory(): StorageOperationResult {
    return LocaleMaintenanceOperationsManager.optimizeDetectionHistory();
  }

  /**
   * 重建存储索引
   * Rebuild storage index
   */
  static rebuildStorageIndex(): StorageOperationResult {
    return LocaleMaintenanceOperationsManager.rebuildStorageIndex();
  }

  /**
   * 执行深度维护
   * Perform deep maintenance
   */
  static performDeepMaintenance(): StorageOperationResult {
    return LocaleMaintenanceOperationsManager.performDeepMaintenance();
  }

  /**
   * 获取维护建议
   * Get maintenance recommendations
   */
  static getMaintenanceRecommendations(): ReturnType<
    typeof LocaleMaintenanceOperationsManager.getMaintenanceRecommendations
  > {
    return LocaleMaintenanceOperationsManager.getMaintenanceRecommendations();
  }

  // ==================== 导入导出操作 ====================

  /**
   * 导出所有存储数据
   * Export all storage data
   */
  static exportData(): ExportData {
    return LocaleImportExportManager.exportData();
  }

  /**
   * 导入存储数据
   * Import storage data
   */
  static importData(data: ImportData): StorageOperationResult {
    return LocaleImportExportManager.importData(data);
  }

  /**
   * 导出为JSON字符串
   * Export as JSON string
   */
  static exportAsJson(): string {
    return LocaleImportExportManager.exportAsJson();
  }

  /**
   * 从JSON字符串导入
   * Import from JSON string
   */
  static importFromJson(jsonString: string): StorageOperationResult {
    return LocaleImportExportManager.importFromJson(jsonString);
  }

  /**
   * 创建备份
   * Create backup
   */
  static createBackup(): StorageOperationResult {
    return LocaleImportExportManager.createBackup();
  }

  /**
   * 恢复备份
   * Restore backup
   */
  static restoreBackup(backupKey: string): StorageOperationResult {
    return LocaleImportExportManager.restoreBackup(backupKey);
  }

  /**
   * 列出所有备份
   * List all backups
   */
  static listBackups(): ReturnType<
    typeof LocaleImportExportManager.listBackups
  > {
    return LocaleImportExportManager.listBackups();
  }

  /**
   * 删除备份
   * Delete backup
   */
  static deleteBackup(backupKey: string): StorageOperationResult {
    return LocaleImportExportManager.deleteBackup(backupKey);
  }

  /**
   * 清理旧备份
   * Clean up old backups
   */
  static cleanupOldBackups(maxBackups?: number): StorageOperationResult {
    return LocaleImportExportManager.cleanupOldBackups(maxBackups);
  }

  /**
   * 获取导出统计信息
   * Get export statistics
   */
  static getExportStats(): ReturnType<
    typeof LocaleImportExportManager.getExportStats
  > {
    return LocaleImportExportManager.getExportStats();
  }
}

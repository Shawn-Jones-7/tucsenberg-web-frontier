/**
 * 语言存储导入导出操作
 * Locale Storage Import/Export Operations
 *
 * 负责存储数据的导入、导出和备份恢复
 */

'use client';

import type { Locale } from '@/types/i18n';
import { CookieManager } from '@/lib/locale-storage-cookie';
import { LocalStorageManager } from '@/lib/locale-storage-local';
import { LocaleValidationManager } from '@/lib/locale-storage-maintenance-validation';
import {
  STORAGE_KEYS,
  type LocaleDetectionHistory,
  type StorageOperationResult,
  type UserLocalePreference,
} from '@/lib/locale-storage-types';
import { logger } from '@/lib/logger';
import { COUNT_FIVE, COUNT_PAIR, ONE, ZERO } from '@/constants';

/**
 * 导出数据接口
 * Export data interface
 */
export interface ExportData {
  preference?: UserLocalePreference;
  override?: Locale;
  history?: LocaleDetectionHistory;
  version: string;
  timestamp: number;
  metadata: {
    userAgent: string;
    exportedBy: string;
    dataIntegrity: string;
  };
}

/**
 * 导入数据接口
 * Import data interface
 */
export type ImportData = ExportData;

/**
 * 语言存储导入导出管理器
 * Locale storage import/export manager
 */
export class LocaleImportExportManager {
  /**
   * 导出所有存储数据
   * Export all storage data
   */
  static exportData(): ExportData {
    const preference = LocalStorageManager.get<UserLocalePreference>(
      STORAGE_KEYS.LOCALE_PREFERENCE,
    );
    const override = LocalStorageManager.get<Locale>(
      STORAGE_KEYS.USER_LOCALE_OVERRIDE,
    );
    const history = LocalStorageManager.get<LocaleDetectionHistory>(
      STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
    );

    const result: ExportData = {
      version: '1.0.0',
      timestamp: Date.now(),
      metadata: {
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        exportedBy: 'LocaleMaintenanceManager',
        dataIntegrity: this.calculateDataChecksum(),
      },
    };

    // 只有当值存在时才设置可选属性
    if (preference) result.preference = preference;
    if (override) result.override = override;
    if (history) result.history = history;

    return result;
  }

  /**
   * 导入存储数据
   * Import storage data
   */
  static importData(data: ImportData): StorageOperationResult {
    try {
      let importedItems = ZERO;
      const errors: string[] = [];

      // 验证导入数据版本
      if (data.version && data.version !== '1.0.0') {
        return {
          success: false,
          timestamp: Date.now(),
          error: `不支持的数据版本: ${data.version}`,
        };
      }

      // 导入用户偏好数据
      importedItems += this.importPreference(data, errors);

      // 导入用户覆盖设置
      importedItems += this.importOverride(data, errors);

      // 导入检测历史数据
      importedItems += this.importHistory(data, errors);

      const result: StorageOperationResult<{
        importedItems: number;
        errors: string[];
      }> = {
        success: errors.length === ZERO,
        timestamp: Date.now(),
        data: { importedItems, errors },
      };

      if (errors.length > ZERO) {
        result.error = `导入完成，但有 ${errors.length} 个错误`;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  private static importPreference(data: ImportData, errors: string[]): number {
    if (!data.preference) return ZERO;
    if (LocaleValidationManager.validatePreferenceData(data.preference)) {
      LocalStorageManager.set(STORAGE_KEYS.LOCALE_PREFERENCE, data.preference);
      CookieManager.set(
        STORAGE_KEYS.LOCALE_PREFERENCE,
        JSON.stringify(data.preference),
      );
      return ONE;
    }
    errors.push('用户偏好数据格式无效');
    return ZERO;
  }

  private static importOverride(data: ImportData, errors: string[]): number {
    if (!data.override) return ZERO;
    if (typeof data.override === 'string') {
      LocalStorageManager.set(STORAGE_KEYS.USER_LOCALE_OVERRIDE, data.override);
      CookieManager.set(STORAGE_KEYS.USER_LOCALE_OVERRIDE, data.override);
      return ONE;
    }
    errors.push('用户覆盖设置格式无效');
    return ZERO;
  }

  private static importHistory(data: ImportData, errors: string[]): number {
    if (!data.history) return ZERO;
    if (LocaleValidationManager.validateHistoryData(data.history)) {
      LocalStorageManager.set(
        STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
        data.history,
      );
      return ONE;
    }
    errors.push('检测历史数据格式无效');
    return ZERO;
  }

  /**
   * 导出为JSON字符串
   * Export as JSON string
   */
  static exportAsJson(): string {
    const data = this.exportData();
    return JSON.stringify(data, null, COUNT_PAIR);
  }

  /**
   * 从JSON字符串导入
   * Import from JSON string
   */
  static importFromJson(jsonString: string): StorageOperationResult {
    try {
      const data = JSON.parse(jsonString) as ImportData;
      return this.importData(data);
    } catch (error) {
      return {
        success: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'JSON解析错误',
      };
    }
  }

  /**
   * 创建备份
   * Create backup
   */
  static createBackup(): StorageOperationResult {
    try {
      const exportData = this.exportData();
      const backupKey = `locale_backup_${Date.now()}`;

      // 将备份存储到localStorage（使用特殊前缀）
      LocalStorageManager.set(backupKey, exportData);

      return {
        success: true,
        timestamp: Date.now(),
        data: { backupKey, backupData: exportData },
      };
    } catch (error) {
      return {
        success: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 恢复备份
   * Restore backup
   */
  static restoreBackup(backupKey: string): StorageOperationResult {
    try {
      const backupData = LocalStorageManager.get<ExportData>(backupKey);

      if (!backupData) {
        return {
          success: false,
          timestamp: Date.now(),
          error: '备份数据不存在',
        };
      }

      const importResult = this.importData(backupData);
      if (importResult.success) {
        return {
          success: true,
          timestamp: Date.now(),
          data: importResult.data,
        };
      }
      return importResult;
    } catch (error) {
      return {
        success: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 列出所有备份
   * List all backups
   */
  static listBackups(): Array<{
    key: string;
    timestamp: number;
    size: number;
    isValid: boolean;
  }> {
    const backups: Array<{
      key: string;
      timestamp: number;
      size: number;
      isValid: boolean;
    }> = [];

    try {
      // 遍历localStorage查找备份
      if (typeof localStorage === 'undefined') return backups;

      for (let i = ZERO; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('locale_backup_')) continue;
        const data = localStorage.getItem(key);
        if (!data) continue;
        try {
          const parsed = JSON.parse(data) as ExportData;
          backups.push({
            key,
            timestamp: parsed.timestamp || ZERO,
            size: data.length,
            isValid: this.validateExportData(parsed),
          });
        } catch {
          backups.push({ key, timestamp: ZERO, size: ZERO, isValid: false });
        }
      }
    } catch (error) {
      logger.warn('列出备份时出错', { error: error as Error });
    }

    // 按时间戳排序（最新的在前）
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 删除备份
   * Delete backup
   */
  static deleteBackup(backupKey: string): StorageOperationResult {
    try {
      if (!backupKey.startsWith('locale_backup_')) {
        return {
          success: false,
          timestamp: Date.now(),
          error: '无效的备份键名',
        };
      }

      LocalStorageManager.remove(backupKey);

      return {
        success: true,
        timestamp: Date.now(),
        data: { deletedKey: backupKey },
      };
    } catch (error) {
      return {
        success: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 清理旧备份
   * Clean up old backups
   */
  static cleanupOldBackups(
    maxBackups: number = COUNT_FIVE,
  ): StorageOperationResult {
    try {
      const backups = this.listBackups();

      if (backups.length <= maxBackups) {
        return {
          success: true,
          error: '没有需要清理的旧备份',
          timestamp: Date.now(),
          data: { totalBackups: backups.length, maxBackups },
        };
      }

      const backupsToDelete = backups.slice(maxBackups);
      let deletedCount = ZERO;

      backupsToDelete.forEach((backup) => {
        try {
          LocalStorageManager.remove(backup.key);
          deletedCount += ONE;
        } catch {
          // 忽略删除失败的备份
        }
      });

      return {
        success: true,
        error: `已清理 ${deletedCount} 个旧备份`,
        timestamp: Date.now(),
        data: { deletedCount, remainingBackups: backups.length - deletedCount },
      };
    } catch (error) {
      return {
        success: false,
        error: `清理旧备份失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 验证导出数据
   * Validate export data
   */
  private static validateExportData(data: ExportData): boolean {
    try {
      // 检查基本结构
      if (!data || typeof data !== 'object') return false;
      if (typeof data.timestamp !== 'number') return false;

      // 验证偏好数据（如果存在）
      if (
        data.preference &&
        !LocaleValidationManager.validatePreferenceData(data.preference)
      ) {
        return false;
      }

      // 验证历史数据（如果存在）
      if (
        data.history &&
        !LocaleValidationManager.validateHistoryData(data.history)
      ) {
        return false;
      }

      // 验证覆盖设置（如果存在）
      if (data.override && typeof data.override !== 'string') {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 计算数据校验和
   * Calculate data checksum
   */
  private static calculateDataChecksum(): string {
    try {
      const preference = LocalStorageManager.get(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );
      const override = LocalStorageManager.get(
        STORAGE_KEYS.USER_LOCALE_OVERRIDE,
      );
      const history = LocalStorageManager.get(
        STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
      );

      const dataString = JSON.stringify({ preference, override, history });

      // 简单的校验和计算（实际应用中可能需要更强的算法）
      let hash = ZERO;
      for (let i = ZERO; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = (hash << COUNT_FIVE) - hash + char;
        hash = hash & hash; // 转换为32位整数
      }

      return Math.abs(hash).toString(16);
    } catch {
      return 'unknown';
    }
  }

  /**
   * 获取导出统计信息
   * Get export statistics
   */
  static getExportStats(): {
    totalItems: number;
    hasPreference: boolean;
    hasOverride: boolean;
    hasHistory: boolean;
    historyRecords: number;
    dataSize: number;
    lastModified: number;
  } {
    const preference = LocalStorageManager.get<UserLocalePreference>(
      STORAGE_KEYS.LOCALE_PREFERENCE,
    );
    const override = LocalStorageManager.get<Locale>(
      STORAGE_KEYS.USER_LOCALE_OVERRIDE,
    );
    const history = LocalStorageManager.get<LocaleDetectionHistory>(
      STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
    );

    const exportData = this.exportData();
    const dataSize = JSON.stringify(exportData).length;

    let lastModified = ZERO;
    if (preference?.timestamp)
      lastModified = Math.max(lastModified, preference.timestamp);
    if (history?.lastUpdated)
      lastModified = Math.max(lastModified, history.lastUpdated);

    return {
      totalItems: [preference, override, history].filter(Boolean).length,
      hasPreference: Boolean(preference),
      hasOverride: Boolean(override),
      hasHistory: Boolean(history),
      historyRecords: history?.detections?.length || ZERO,
      dataSize,
      lastModified,
    };
  }
}

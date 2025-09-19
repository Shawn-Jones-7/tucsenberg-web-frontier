/**
 * 语言存储清理操作
 * Locale Storage Cleanup Operations
 *
 * 负责存储数据的清理和过期数据处理
 */

'use client';

import { CookieManager } from '@/lib/locale-storage-cookie';
import { LocalStorageManager } from '@/lib/locale-storage-local';
import {
  STORAGE_KEYS,
  type LocaleDetectionHistory,
  type StorageOperationResult,
  type UserLocalePreference,
} from '@/lib/locale-storage-types';
import { logger } from '@/lib/logger';
import {
  ANIMATION_DURATION_VERY_SLOW,
  DAYS_PER_MONTH,
  HOURS_PER_DAY,
  ONE,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import { MINUTE_MS } from '@/constants/time';

/**
 * 语言存储清理管理器
 * Locale storage cleanup manager
 */
export class LocaleCleanupManager {
  private static readonly ALL_KEYS = [
    STORAGE_KEYS.LOCALE_PREFERENCE,
    STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
    STORAGE_KEYS.USER_LOCALE_OVERRIDE,
    STORAGE_KEYS.LOCALE_ANALYTICS,
    STORAGE_KEYS.LOCALE_CACHE,
    STORAGE_KEYS.LOCALE_SETTINGS,
  ] as const;

  private static forEachStorageKey(
    cb: (key: (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]) => void,
  ): void {
    for (const key of LocaleCleanupManager.ALL_KEYS) cb(key);
  }
  /**
   * 清除所有存储数据
   * Clear all storage data
   */
  static clearAll(): StorageOperationResult {
    try {
      // 清除 Cookies 和 localStorage（白名单）
      this.forEachStorageKey((key) => CookieManager.remove(key));
      this.forEachStorageKey((key) => LocalStorageManager.remove(key));

      return {
        success: true,
        timestamp: Date.now(),
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
   * 清理过期的检测记录
   * Clean up expired detection records
   */
  static cleanupExpiredDetections(
    maxAgeMs: number = DAYS_PER_MONTH *
      HOURS_PER_DAY *
      SECONDS_PER_MINUTE *
      SECONDS_PER_MINUTE *
      ANIMATION_DURATION_VERY_SLOW,
  ): StorageOperationResult {
    try {
      const historyData = LocalStorageManager.get<LocaleDetectionHistory>(
        STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
      );

      if (!historyData || !Array.isArray(historyData.detections)) {
        return {
          success: true,
          timestamp: Date.now(),
        };
      }

      const now = Date.now();
      const originalCount = historyData.detections.length;

      // 过滤掉过期的检测记录
      const validDetections = historyData.detections.filter(
        (detection) => now - detection.timestamp <= maxAgeMs,
      );

      const cleanedCount = originalCount - validDetections.length;

      if (cleanedCount > ZERO) {
        const updatedHistory: LocaleDetectionHistory = {
          detections: validDetections,
          history: validDetections,
          lastUpdated: now,
          totalDetections: validDetections.length,
        };

        LocalStorageManager.set(
          STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
          updatedHistory,
        );

        return {
          success: true,
          timestamp: Date.now(),
          data: { cleanedCount, remainingCount: validDetections.length },
        };
      }

      return {
        success: true,
        timestamp: Date.now(),
        data: { cleanedCount: ZERO, remainingCount: originalCount },
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
   * 清理特定类型的存储数据
   * Clean up specific type of storage data
   */
  private static getKeyByType(type: keyof typeof STORAGE_KEYS) {
    switch (type) {
      case 'LOCALE_PREFERENCE':
        return STORAGE_KEYS.LOCALE_PREFERENCE;
      case 'LOCALE_DETECTION_HISTORY':
        return STORAGE_KEYS.LOCALE_DETECTION_HISTORY;
      case 'USER_LOCALE_OVERRIDE':
        return STORAGE_KEYS.USER_LOCALE_OVERRIDE;
      case 'LOCALE_ANALYTICS':
        return STORAGE_KEYS.LOCALE_ANALYTICS;
      case 'LOCALE_CACHE':
        return STORAGE_KEYS.LOCALE_CACHE;
      case 'LOCALE_SETTINGS':
        return STORAGE_KEYS.LOCALE_SETTINGS;
      default:
        return STORAGE_KEYS.LOCALE_PREFERENCE;
    }
  }

  static clearSpecificData(
    dataType: keyof typeof STORAGE_KEYS,
  ): StorageOperationResult {
    try {
      const key = this.getKeyByType(dataType);

      // 从两个存储中移除
      CookieManager.remove(key);
      LocalStorageManager.remove(key);

      return {
        success: true,
        timestamp: Date.now(),
        data: { dataType, key },
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
   * 清理无效的用户偏好数据
   * Clean up invalid user preference data
   */
  static cleanupInvalidPreferences(): StorageOperationResult {
    try {
      let cleanedItems = ZERO;
      const issues: string[] = [];

      // 检查并清理localStorage中的偏好数据
      const localPreference = LocalStorageManager.get<UserLocalePreference>(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );

      if (localPreference && !this.isValidPreferenceData(localPreference)) {
        LocalStorageManager.remove(STORAGE_KEYS.LOCALE_PREFERENCE);
        cleanedItems += ONE;
        issues.push('已清理localStorage中的无效偏好数据');
      }

      // 检查并清理Cookie中的偏好数据
      this.cleanupCookiePreference(issues, () => {
        cleanedItems += ONE;
      });

      return {
        success: true,
        timestamp: Date.now(),
        data: { cleanedItems, issues },
      };
    } catch (error) {
      return {
        success: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  private static cleanupCookiePreference(
    issues: string[],
    onClean: () => void,
  ): void {
    const cookiePreference = CookieManager.get(STORAGE_KEYS.LOCALE_PREFERENCE);
    if (!cookiePreference) return;
    try {
      const parsed = JSON.parse(cookiePreference) as UserLocalePreference;
      if (!this.isValidPreferenceData(parsed)) {
        CookieManager.remove(STORAGE_KEYS.LOCALE_PREFERENCE);
        onClean();
        issues.push('已清理Cookie中的无效偏好数据');
      }
    } catch {
      CookieManager.remove(STORAGE_KEYS.LOCALE_PREFERENCE);
      onClean();
      issues.push('已清理Cookie中的格式错误偏好数据');
    }
  }

  /**
   * 清理重复的检测记录
   * Clean up duplicate detection records
   */
  static cleanupDuplicateDetections(): StorageOperationResult {
    try {
      const historyData = LocalStorageManager.get<LocaleDetectionHistory>(
        STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
      );

      if (!historyData || !Array.isArray(historyData.detections)) {
        return {
          success: true,
          timestamp: Date.now(),
        };
      }

      const originalCount = historyData.detections.length;
      const seen = new Set<string>();
      const uniqueDetections = historyData.detections.filter((detection) => {
        const key = `${detection.locale}-${detection.source}-${Math.floor(detection.timestamp / MINUTE_MS)}`; // 按分钟分组
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });

      const duplicateCount = originalCount - uniqueDetections.length;

      if (duplicateCount > ZERO) {
        const updatedHistory: LocaleDetectionHistory = {
          detections: uniqueDetections,
          history: uniqueDetections,
          lastUpdated: Date.now(),
          totalDetections: uniqueDetections.length,
        };

        LocalStorageManager.set(
          STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
          updatedHistory,
        );

        return {
          success: true,
          timestamp: Date.now(),
          data: { duplicateCount, remainingCount: uniqueDetections.length },
        };
      }

      return {
        success: true,
        timestamp: Date.now(),
        data: { duplicateCount: ZERO, remainingCount: originalCount },
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
   * 验证偏好数据是否有效
   * Validate if preference data is valid
   */
  private static isValidPreferenceData(
    preference: UserLocalePreference,
  ): boolean {
    if (!preference || typeof preference !== 'object') return false;

    const requiredFields = ['locale', 'source', 'timestamp', 'confidence'];
    const hasAllFields = requiredFields.every((field) => field in preference);

    if (!hasAllFields) return false;

    // 验证字段类型
    if (typeof preference.locale !== 'string') return false;
    if (typeof preference.source !== 'string') return false;
    if (typeof preference.timestamp !== 'number') return false;
    if (typeof preference.confidence !== 'number') return false;

    // 验证值的合理性
    if (preference.confidence < ZERO || preference.confidence > ONE)
      return false;
    if (preference.timestamp > Date.now() || preference.timestamp < ZERO)
      return false;

    return true;
  }

  /**
   * 获取清理统计信息
   * Get cleanup statistics
   */
  static getCleanupStats(): {
    totalItems: number;
    expiredDetections: number;
    invalidPreferences: number;
    duplicateDetections: number;
  } {
    let totalItems = ZERO;
    let expiredDetections = ZERO;
    let invalidPreferences = ZERO;
    let duplicateDetections = ZERO;

    try {
      totalItems = this.countTotalItems();
      const historyStats = this.computeHistoryStats();
      expiredDetections = historyStats.expired;
      duplicateDetections = historyStats.duplicates;
      invalidPreferences = this.computeInvalidPreferences();
    } catch (error) {
      logger.warn('获取清理统计信息时出错', { error: error as Error });
    }

    return {
      totalItems,
      expiredDetections,
      invalidPreferences,
      duplicateDetections,
    };
  }

  private static countTotalItems(): number {
    let total = ZERO;
    this.forEachStorageKey((key) => {
      if (LocalStorageManager.get(key) !== null) total += ONE;
      if (CookieManager.get(key) !== null) total += ONE;
    });
    return total;
  }

  private static computeHistoryStats(): {
    expired: number;
    duplicates: number;
  } {
    const historyData = LocalStorageManager.get<LocaleDetectionHistory>(
      STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
    );
    if (!historyData?.detections) return { expired: ZERO, duplicates: ZERO };
    const now = Date.now();
    const maxAge =
      DAYS_PER_MONTH *
      HOURS_PER_DAY *
      SECONDS_PER_MINUTE *
      SECONDS_PER_MINUTE *
      ANIMATION_DURATION_VERY_SLOW; // 30天
    const expired = historyData.detections.filter(
      (d) => now - d.timestamp > maxAge,
    ).length;
    const seen = new Set<string>();
    let duplicates = ZERO;
    historyData.detections.forEach((d) => {
      const key = `${d.locale}-${d.source}-${Math.floor(d.timestamp / MINUTE_MS)}`;
      if (seen.has(key)) duplicates += ONE;
      else seen.add(key);
    });
    return { expired, duplicates };
  }

  private static computeInvalidPreferences(): number {
    let invalid = ZERO;
    const localPreference = LocalStorageManager.get<UserLocalePreference>(
      STORAGE_KEYS.LOCALE_PREFERENCE,
    );
    if (localPreference && !this.isValidPreferenceData(localPreference)) {
      invalid += ONE;
    }
    const cookiePreference = CookieManager.get(STORAGE_KEYS.LOCALE_PREFERENCE);
    if (cookiePreference) {
      try {
        const parsed = JSON.parse(cookiePreference) as UserLocalePreference;
        if (!this.isValidPreferenceData(parsed)) invalid += ONE;
      } catch {
        invalid += ONE;
      }
    }
    return invalid;
  }
}

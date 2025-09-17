/**
 * 语言存储清理操作
 * Locale Storage Cleanup Operations
 *
 * 负责存储数据的清理和过期数据处理
 */

'use client';

import { ANIMATION_DURATION_VERY_SLOW, DAYS_PER_MONTH, HOURS_PER_DAY, ONE, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import { MINUTE_MS } from "@/constants/time";
import { CookieManager } from '@/lib/locale-storage-cookie';
import { LocalStorageManager } from '@/lib/locale-storage-local';
import { STORAGE_KEYS } from '@/lib/locale-storage-types';
import { logger } from '@/lib/logger';
import type {
  LocaleDetectionHistory,
  StorageOperationResult,
  UserLocalePreference,
} from './locale-storage-types';

/**
 * 语言存储清理管理器
 * Locale storage cleanup manager
 */
export class LocaleCleanupManager {
  /**
   * 清除所有存储数据
   * Clear all storage data
   */
  static clearAll(): StorageOperationResult {
    try {
      // 清除 Cookies
      Object.values(STORAGE_KEYS).forEach((key) => {
        CookieManager.remove(key);
      });

      // 清除 localStorage
      Object.values(STORAGE_KEYS).forEach((key) => {
        LocalStorageManager.remove(key);
      });

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
    maxAgeMs: number = DAYS_PER_MONTH * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
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
  static clearSpecificData(
    dataType: keyof typeof STORAGE_KEYS,
  ): StorageOperationResult {
    try {
      const key = STORAGE_KEYS[dataType];

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
      const cookiePreference = CookieManager.get(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );
      if (cookiePreference) {
        try {
          const parsed = JSON.parse(cookiePreference) as UserLocalePreference;
          if (!this.isValidPreferenceData(parsed)) {
            CookieManager.remove(STORAGE_KEYS.LOCALE_PREFERENCE);
            cleanedItems += ONE;
            issues.push('已清理Cookie中的无效偏好数据');
          }
        } catch {
          CookieManager.remove(STORAGE_KEYS.LOCALE_PREFERENCE);
          cleanedItems += ONE;
          issues.push('已清理Cookie中的格式错误偏好数据');
        }
      }

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
    if (preference.confidence < ZERO || preference.confidence > ONE) return false;
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
      // 统计总项目数
      Object.values(STORAGE_KEYS).forEach((key) => {
        if (LocalStorageManager.get(key) !== null) totalItems += ONE;
        if (CookieManager.get(key) !== null) totalItems += ONE;
      });

      // 统计过期检测记录
      const historyData = LocalStorageManager.get<LocaleDetectionHistory>(
        STORAGE_KEYS.LOCALE_DETECTION_HISTORY,
      );
      if (historyData?.detections) {
        const now = Date.now();
        const maxAge = DAYS_PER_MONTH * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW; // 30天
        expiredDetections = historyData.detections.filter(
          (detection) => now - detection.timestamp > maxAge,
        ).length;

        // 统计重复检测记录
        const seen = new Set<string>();
        historyData.detections.forEach((detection) => {
          const key = `${detection.locale}-${detection.source}-${Math.floor(detection.timestamp / MINUTE_MS)}`;
          if (seen.has(key)) {
            duplicateDetections += ONE;
          } else {
            seen.add(key);
          }
        });
      }

      // 统计无效偏好数据
      const localPreference = LocalStorageManager.get<UserLocalePreference>(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );
      if (localPreference && !this.isValidPreferenceData(localPreference)) {
        invalidPreferences += ONE;
      }

      const cookiePreference = CookieManager.get(
        STORAGE_KEYS.LOCALE_PREFERENCE,
      );
      if (cookiePreference) {
        try {
          const parsed = JSON.parse(cookiePreference) as UserLocalePreference;
          if (!this.isValidPreferenceData(parsed)) {
            invalidPreferences += ONE;
          }
        } catch {
          invalidPreferences += ONE;
        }
      }
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
}

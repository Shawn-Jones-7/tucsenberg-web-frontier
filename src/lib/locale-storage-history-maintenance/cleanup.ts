/**
 * 语言检测历史清理功能
 * Locale Detection History Cleanup Functions
 */

'use client';

import { CACHE_LIMITS } from '@/constants/i18n-constants';
import { ANIMATION_DURATION_VERY_SLOW, DAYS_PER_MONTH, HOURS_PER_DAY, PERCENTAGE_FULL, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import { LocalStorageManager } from '@/lib/locale-storage-local';
import {
  createDefaultHistory,
  getDetectionHistory,
  HistoryCacheManager,
} from '../locale-storage-history-core';
import type {
  LocaleDetectionRecord,
  StorageOperationResult,
} from '../locale-storage-types';

/**
 * 清理过期的检测记录
 * Cleanup expired detection records
 */
export function cleanupExpiredDetections(
  maxAgeMs: number = DAYS_PER_MONTH * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
): StorageOperationResult<number> {
  const startTime = Date.now();

  try {
    const historyResult = getDetectionHistory();

    if (!historyResult.success || !historyResult.data) {
      return {
        success: false,
        error: 'Failed to get detection history',
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    const history = historyResult.data;
    const cutoffTime = Date.now() - maxAgeMs;
    const originalCount = history.history.length;

    // 过滤掉过期的记录
    history.history = history.history.filter(
      (record) => record.timestamp > cutoffTime,
    );

    const removedCount = originalCount - history.history.length;

    if (removedCount > ZERO) {
      // 更新时间戳
      history.lastUpdated = Date.now();

      // 保存更新后的历史
      LocalStorageManager.set('locale_detection_history', history);

      // LocalStorageManager.set() returns void, so we assume success if no error is thrown
      // 清除缓存
      HistoryCacheManager.clearCache();

      return {
        success: true,
        data: removedCount,
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }
    return {
      success: true,
      data: ZERO,
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * 清理重复的检测记录
 * Cleanup duplicate detection records
 */
export function cleanupDuplicateDetections(): StorageOperationResult<number> {
  const startTime = Date.now();

  try {
    const historyResult = getDetectionHistory();

    if (!historyResult.success || !historyResult.data) {
      return {
        success: false,
        error: 'Failed to get detection history',
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    const history = historyResult.data;
    const originalCount = history.history.length;

    // 使用 Set 来跟踪已见过的记录
    const seen = new Set<string>();
    const uniqueRecords: LocaleDetectionRecord[] = [];

    history.history.forEach((record) => {
      // 创建记录的唯一标识符
      const key = `${record.locale}-${record.source}-${record.timestamp}-${record.confidence}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueRecords.push(record);
      }
    });

    const removedCount = originalCount - uniqueRecords.length;

    if (removedCount > ZERO) {
      history.history = uniqueRecords;
      history.lastUpdated = Date.now();

      LocalStorageManager.set('locale_detection_history', history);

      // LocalStorageManager.set() returns void, so we assume success if no error is thrown
      HistoryCacheManager.clearCache();

      return {
        success: true,
        data: removedCount,
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }
    return {
      success: true,
      data: ZERO,
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * 限制历史记录数量
 * Limit history record count
 */
export function limitHistorySize(
  maxRecords: number = CACHE_LIMITS.MAX_DETECTION_HISTORY || PERCENTAGE_FULL,
): StorageOperationResult<number> {
  const startTime = Date.now();

  try {
    const historyResult = getDetectionHistory();

    if (!historyResult.success || !historyResult.data) {
      return {
        success: false,
        error: 'Failed to get detection history',
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    const history = historyResult.data;
    const originalCount = history.history.length;

    if (originalCount > maxRecords) {
      // 保留最新的记录
      history.history = history.history.slice(ZERO, maxRecords);
      history.lastUpdated = Date.now();

      LocalStorageManager.set('locale_detection_history', history);

      // LocalStorageManager.set() returns void, so we assume success if no error is thrown
      HistoryCacheManager.clearCache();

      const removedCount = originalCount - maxRecords;
      return {
        success: true,
        data: removedCount,
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }
    return {
      success: true,
      data: ZERO,
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * 清除所有历史记录
 * Clear all history
 */
export function clearAllHistory(): StorageOperationResult<void> {
  const startTime = Date.now();

  try {
    const defaultHistory = createDefaultHistory();
    LocalStorageManager.set('locale_detection_history', defaultHistory);

    // LocalStorageManager.set() returns void, so we assume success if no error is thrown
    HistoryCacheManager.clearCache();

    return {
      success: true,
      data: undefined,
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  }
}

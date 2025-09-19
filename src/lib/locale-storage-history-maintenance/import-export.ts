/**
 * 语言检测历史导入导出功能
 * Locale Detection History Import/Export Functions
 */

'use client';

import {
  getDetectionHistory,
  HistoryCacheManager,
  validateHistoryData,
} from '@/lib/locale-storage-history-core';
import { LocalStorageManager } from '@/lib/locale-storage-local';
import type {
  LocaleDetectionHistory,
  StorageOperationResult,
} from '@/lib/locale-storage-types';
import { COUNT_PAIR } from '@/constants';

/**
 * 导出历史记录
 * Export history
 */
export function exportHistory(): StorageOperationResult<LocaleDetectionHistory> {
  return getDetectionHistory();
}

/**
 * 导出历史记录为JSON字符串
 * Export history as JSON string
 */
export function exportHistoryAsJson(): StorageOperationResult<string> {
  const historyResult = exportHistory();

  if (!historyResult.success) {
    return {
      success: false,
      timestamp: Date.now(),
      error: historyResult.error,
    } as StorageOperationResult<string>;
  }

  try {
    const jsonString = JSON.stringify(historyResult.data, null, COUNT_PAIR);
    return {
      ...historyResult,
      data: jsonString,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to serialize history',
      source: 'localStorage',
      timestamp: Date.now(),
    };
  }
}

/**
 * 导入历史记录
 * Import history
 */
export function importHistory(
  history: LocaleDetectionHistory,
): StorageOperationResult<LocaleDetectionHistory> {
  const startTime = Date.now();

  try {
    // 验证导入的数据
    if (!validateHistoryData(history)) {
      return {
        success: false,
        error: 'Invalid history data format',
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    // 更新时间戳
    const updatedHistory: LocaleDetectionHistory = {
      ...history,
      lastUpdated: Date.now(),
    };

    // 保存到存储
    LocalStorageManager.set('locale_detection_history', updatedHistory);

    // LocalStorageManager.set() returns void, so we assume success if no error is thrown
    HistoryCacheManager.clearCache();
    return {
      success: true,
      data: updatedHistory,
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
 * 从JSON字符串导入历史记录
 * Import history from JSON string
 */
export function importHistoryFromJson(
  jsonString: string,
): StorageOperationResult<LocaleDetectionHistory> {
  try {
    const history = JSON.parse(jsonString) as LocaleDetectionHistory;
    return importHistory(history);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JSON',
      source: 'localStorage',
      timestamp: Date.now(),
    };
  }
}

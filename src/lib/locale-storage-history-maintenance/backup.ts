/**
 * 语言检测历史备份和恢复功能
 * Locale Detection History Backup and Restore Functions
 */

'use client';

import {
  exportHistory,
  importHistory,
} from '@/lib/locale-storage-history-maintenance/import-export';
import type {
  LocaleDetectionHistory,
  StorageOperationResult,
} from '@/lib/locale-storage-types';

/**
 * 创建历史记录备份
 * Create history backup
 */
export function createBackup(): StorageOperationResult<{
  backup: LocaleDetectionHistory;
  timestamp: number;
  size: number;
}> {
  const historyResult = exportHistory();

  if (!historyResult.success) {
    return {
      success: false,
      timestamp: Date.now(),
      error: historyResult.error,
    } as StorageOperationResult<{
      backup: LocaleDetectionHistory;
      timestamp: number;
      size: number;
    }>;
  }

  const backup = historyResult.data!;
  const timestamp = Date.now();
  const size = JSON.stringify(backup).length;

  return {
    success: true,
    data: {
      backup,
      timestamp,
      size,
    },
    source: 'localStorage',
    timestamp,
  };
}

/**
 * 从备份恢复历史记录
 * Restore history from backup
 */
export function restoreFromBackup(
  backup: LocaleDetectionHistory,
): StorageOperationResult<LocaleDetectionHistory> {
  return importHistory(backup);
}

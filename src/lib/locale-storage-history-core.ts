/**
 * 语言检测历史核心管理
 * Locale Detection History Core Management
 *
 * 负责历史记录的基础操作：添加、获取、更新和缓存管理
 */

'use client';

import type { Locale } from '@/types/i18n';
import { LocalStorageManager } from '@/lib/locale-storage-local';
import {
  isLocaleDetectionHistory,
  type LocaleDetectionHistory,
  type LocaleDetectionRecord,
  type LocaleSource,
  type StorageOperationResult,
} from '@/lib/locale-storage-types';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_TEN,
  DAYS_PER_MONTH,
  HOURS_PER_DAY,
  ONE,
  PERCENTAGE_FULL,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import { CACHE_LIMITS } from '@/constants/i18n-constants';

// ==================== 缓存管理 ====================

/**
 * 历史记录缓存管理器
 * History cache manager
 */
export class HistoryCacheManager {
  private static cache: LocaleDetectionHistory | null = null;
  private static cacheTimestamp = ZERO;
  private static readonly CACHE_TTL =
    COUNT_TEN * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW; // 10 minutes

  /**
   * 获取缓存的历史记录
   * Get cached history
   */
  static getCachedHistory(): LocaleDetectionHistory | null {
    if (Date.now() - this.cacheTimestamp > this.CACHE_TTL) {
      this.cache = null;
      return null;
    }
    return this.cache;
  }

  /**
   * 更新缓存
   * Update cache
   */
  static updateCache(history: LocaleDetectionHistory): void {
    this.cache = history;
    this.cacheTimestamp = Date.now();
  }

  /**
   * 清除缓存
   * Clear cache
   */
  static clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = ZERO;
  }

  /**
   * 获取缓存状态
   * Get cache status
   */
  static getCacheStatus(): {
    isCached: boolean;
    cacheAge: number;
    cacheSize: number;
  } {
    const isCached =
      this.cache !== null && Date.now() - this.cacheTimestamp <= this.CACHE_TTL;
    const cacheAge = Date.now() - this.cacheTimestamp;
    const cacheSize = this.cache ? JSON.stringify(this.cache).length : ZERO;

    return {
      isCached,
      cacheAge,
      cacheSize,
    };
  }
}

// ==================== 核心历史管理 ====================

/**
 * 添加检测记录
 * Add detection record
 */
export function addDetectionRecord(params: {
  locale: Locale;
  source: LocaleSource;
  confidence: number;
  metadata?: Record<string, unknown>;
}): StorageOperationResult<LocaleDetectionHistory> {
  const startTime = Date.now();

  try {
    const { locale, source, confidence, metadata } = params;
    const detection: LocaleDetectionRecord = {
      locale,
      source,
      timestamp: Date.now(),
      confidence: Math.max(ZERO, Math.min(ONE, confidence)),
      metadata: metadata || {},
    };

    const result = updateDetectionHistory(detection);

    if (result.success) {
      // 清除缓存以确保下次获取最新数据
      HistoryCacheManager.clearCache();
    }

    return {
      ...result,
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
 * 获取检测历史
 * Get detection history
 */
export function getDetectionHistory(): StorageOperationResult<LocaleDetectionHistory> {
  const startTime = Date.now();

  try {
    // 首先检查缓存
    const cached = HistoryCacheManager.getCachedHistory();
    if (cached) {
      return {
        success: true,
        data: cached,
        source: 'memory',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    // 从存储中获取
    const stored = LocalStorageManager.get<LocaleDetectionHistory>(
      'locale_detection_history',
    );

    if (!stored) {
      return createAndCacheDefaultHistory(startTime);
    }

    // 验证数据格式
    if (!validateHistoryData(stored)) {
      return {
        success: false,
        error: 'Invalid history data format',
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }

    // 更新缓存
    HistoryCacheManager.updateCache(stored);

    return {
      success: true,
      data: stored,
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
 * 更新检测历史
 * Update detection history
 */
export function updateDetectionHistory(
  detection: LocaleDetectionRecord,
): StorageOperationResult<LocaleDetectionHistory> {
  const existingResult = getDetectionHistory();

  if (!existingResult.success) {
    return existingResult;
  }

  const history = existingResult.data!;

  // 添加新记录到历史开头
  history.history.unshift(detection);

  // 限制历史记录数量
  const maxRecords = CACHE_LIMITS.MAX_DETECTION_HISTORY || PERCENTAGE_FULL;
  if (history.history.length > maxRecords) {
    history.history = history.history.slice(ZERO, maxRecords);
  }

  // 更新时间戳
  history.lastUpdated = Date.now();

  // 保存到存储
  try {
    LocalStorageManager.set('locale_detection_history', history);
    const saveResult = { success: true };

    if (saveResult.success) {
      // 更新缓存
      HistoryCacheManager.updateCache(history);
      return {
        success: true,
        data: history,
        source: 'localStorage',
        timestamp: Date.now(),
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save history',
      source: 'localStorage',
      timestamp: Date.now(),
    };
  }

  // 默认返回失败结果
  return {
    success: false,
    error: 'Unknown error occurred',
    source: 'localStorage',
    timestamp: Date.now(),
  };
}

/**
 * 验证历史数据格式
 * Validate history data format
 */
export function validateHistoryData(
  history: unknown,
): history is LocaleDetectionHistory {
  return isLocaleDetectionHistory(history);
}

function createAndCacheDefaultHistory(
  startTime: number,
): StorageOperationResult<LocaleDetectionHistory> {
  const defaultHistory: LocaleDetectionHistory = {
    detections: [],
    history: [],
    lastUpdated: Date.now(),
    totalDetections: ZERO,
  };

  try {
    LocalStorageManager.set('locale_detection_history', defaultHistory);
    const saveResult = { success: true };
    if (saveResult.success) {
      HistoryCacheManager.updateCache(defaultHistory);
      return {
        success: true,
        data: defaultHistory,
        source: 'localStorage',
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create default history',
      source: 'localStorage',
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
    };
  }

  return {
    success: false,
    error: 'Unknown error occurred',
    source: 'localStorage',
    timestamp: Date.now(),
    responseTime: Date.now() - startTime,
  };
}

/**
 * 创建默认历史记录
 * Create default history
 */
export function createDefaultHistory(): LocaleDetectionHistory {
  return {
    detections: [],
    history: [],
    lastUpdated: Date.now(),
    totalDetections: ZERO,
  };
}

/**
 * 获取历史记录摘要
 * Get history summary
 */
export function getHistorySummary(): {
  totalRecords: number;
  lastUpdated: number;
  oldestRecord: number;
  newestRecord: number;
  cacheStatus: ReturnType<typeof HistoryCacheManager.getCacheStatus>;
} {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return {
      totalRecords: ZERO,
      lastUpdated: ZERO,
      oldestRecord: ZERO,
      newestRecord: ZERO,
      cacheStatus: HistoryCacheManager.getCacheStatus(),
    };
  }

  const history = historyResult.data;
  const records = history.history;

  return {
    totalRecords: records.length,
    lastUpdated: history.lastUpdated,
    oldestRecord:
      records.length > ZERO ? (records.at(-ONE)?.timestamp ?? ZERO) : ZERO,
    newestRecord:
      records.length > ZERO ? (records.at(ZERO)?.timestamp ?? ZERO) : ZERO,
    cacheStatus: HistoryCacheManager.getCacheStatus(),
  };
}

/**
 * 检查历史记录是否需要清理
 * Check if history needs cleanup
 */
export function needsCleanup(
  maxAge: number = DAYS_PER_MONTH *
    HOURS_PER_DAY *
    SECONDS_PER_MINUTE *
    SECONDS_PER_MINUTE *
    ANIMATION_DURATION_VERY_SLOW,
): {
  needsCleanup: boolean;
  expiredCount: number;
  totalCount: number;
  recommendations: string[];
} {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return {
      needsCleanup: false,
      expiredCount: ZERO,
      totalCount: ZERO,
      recommendations: ['无法获取历史记录'],
    };
  }

  const history = historyResult.data;
  const cutoffTime = Date.now() - maxAge;
  const expiredRecords = history.history.filter(
    (record: LocaleDetectionRecord) => record.timestamp < cutoffTime,
  );
  const totalCount = history.history.length;
  const expiredCount = expiredRecords.length;

  const recommendations: string[] = [];

  if (expiredCount > ZERO) {
    recommendations.push(`发现 ${expiredCount} 条过期记录，建议清理`);
  }

  if (totalCount > PERCENTAGE_FULL) {
    recommendations.push(`历史记录过多 (${totalCount} 条)，建议清理旧记录`);
  }

  const maxRecords = CACHE_LIMITS.MAX_DETECTION_HISTORY || PERCENTAGE_FULL;
  if (totalCount > maxRecords) {
    recommendations.push(`超出最大记录限制 (${maxRecords})，将自动截断`);
  }

  if (recommendations.length === ZERO) {
    recommendations.push('历史记录状态良好，无需清理');
  }

  return {
    needsCleanup: expiredCount > ZERO || totalCount > maxRecords,
    expiredCount,
    totalCount,
    recommendations,
  };
}

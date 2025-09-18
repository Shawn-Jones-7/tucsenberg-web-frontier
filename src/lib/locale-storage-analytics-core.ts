/**
 * 语言存储分析核心功能
 * Locale Storage Analytics Core Functions
 *
 * 负责核心统计信息收集和健康检查功能
 */

'use client';

import { DEC_0_4, MAGIC_0_1, MAGIC_0_2, MAGIC_0_3, MAGIC_0_5, MAGIC_0_6, MAGIC_0_7, MAGIC_0_8 } from "@/constants/decimal";
import { ANIMATION_DURATION_VERY_SLOW, BYTES_PER_KB, COUNT_FIVE, HOURS_PER_DAY, ONE, PERCENTAGE_FULL, SECONDS_PER_MINUTE, ZERO } from '@/constants';

import { DAYS_PER_WEEK } from "@/constants/time";
import { LocalStorageManager } from '@/lib/locale-storage-local';
import { estimateStorageSize, type ErrorType, type PriorityLevel, type StorageHealthCheck, type StorageOperationResult, type StorageStats } from '@/lib/locale-storage-types';

// ==================== 核心统计功能 ====================

/**
 * 计算存储统计信息
 * Calculate storage statistics
 */
interface UserPreferencePartial {
  locale?: string;
  confidence?: number;
  lastUpdated?: number;
  source?: string;
}

interface DetectionHistoryPartial {
  history?: Array<{ detectedLocale?: string; locale?: string; timestamp?: number }>;
  lastUpdated?: number;
}

export function calculateStorageStats(): StorageStats {
  const now = Date.now();

  // 获取所有存储的数据
  const userPreference = LocalStorageManager.get('user-locale-preference') as UserPreferencePartial | null;
  const detectionHistory = (LocalStorageManager.get('locale-detection-history') || { history: [], lastUpdated: ZERO }) as DetectionHistoryPartial;
  const fallbackLocale = LocalStorageManager.get('fallback-locale');

  // 计算存储大小
  const userPreferenceSize = estimateStorageSize(userPreference);
  const historySize = estimateStorageSize(detectionHistory);
  const fallbackSize = estimateStorageSize(fallbackLocale);
  const totalSize = userPreferenceSize + historySize + fallbackSize;

  // 计算历史记录统计
  const historyCount = Array.isArray(detectionHistory?.history) ? detectionHistory.history.length : ZERO;
  const uniqueLocales = Array.isArray(detectionHistory?.history)
    ? new Set(detectionHistory.history.map((h) => h.detectedLocale ?? h.locale ?? 'unknown')).size
    : ZERO;

  // 计算最近活动
  const fallbackLastUpdated =
    typeof fallbackLocale === 'object' && fallbackLocale !== null && 'lastUpdated' in (fallbackLocale as Record<string, unknown>)
      ? Number((fallbackLocale as { lastUpdated?: number }).lastUpdated ?? ZERO)
      : ZERO;
  const lastActivity = Math.max(
    userPreference?.lastUpdated ?? ZERO,
    detectionHistory?.lastUpdated ?? ZERO,
    fallbackLastUpdated,
  );

  // 计算数据新鲜度 (0-1, 1表示最新)
  const maxAge = DAYS_PER_WEEK * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW; // 7天
  const dataAge = now - lastActivity;
  const freshness = Math.max(ZERO, ONE - dataAge / maxAge);

  return {
    totalEntries:
      (userPreference ? ONE : ZERO) +
      (detectionHistory ? ONE : ZERO) +
      (fallbackLocale ? ONE : ZERO),
    totalSize,
    lastAccessed: lastActivity,
    lastModified: lastActivity,
    accessCount: ZERO, // 需要从其他地方获取
    errorCount: ZERO, // 需要从其他地方获取
    freshness,
    hasOverride: userPreference?.source === 'user_override' || false,
    historyStats: {
      totalEntries: historyCount,
      uniqueLocales,
      oldestEntry:
        detectionHistory?.history?.at(-ONE)?.timestamp || ZERO,
      newestEntry: detectionHistory?.history?.at(ZERO)?.timestamp || ZERO,
    },
  };
}

/**
 * 计算语言分布
 * Calculate locale distribution
 */
// 注：保留按需实现的 locale 分布计算；当前未使用以避免无用代码告警

/**
 * 获取存储统计信息
 * Get storage statistics
 */
export function getStorageStats(): StorageOperationResult<StorageStats> {
  const startTime = Date.now();

  try {
    const stats = calculateStorageStats();

    return {
      success: true,
      data: stats,
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

// ==================== 健康检查功能 ====================

/**
 * 计算健康检查结果
 * Calculate health check results
 */
export function calculateHealthCheck(): StorageHealthCheck {
  const stats = calculateStorageStats();
  const availability = checkStorageAvailability();
  type Issue = { type: ErrorType; severity: PriorityLevel; message: string; timestamp: number };
  let healthScore = ONE;
  const issues: Issue[] = [];

  const apply = (delta: number, newIssues: Issue[]) => {
    healthScore -= delta;
    issues.push(...newIssues);
  };

  apply(...checkAvailabilityIssues(availability));
  apply(...checkFreshnessIssue(stats));
  apply(...checkSizeIssue(stats));
  apply(...checkHistoryIssue(stats));

  // 确定健康状态
  let status: 'healthy' | 'warning' | 'error';
  if (healthScore >= MAGIC_0_8) {
    status = 'healthy';
  } else if (healthScore >= MAGIC_0_5) {
    status = 'warning';
  } else {
    status = 'error';
  }

  return {
    isHealthy: healthScore >= MAGIC_0_8,
    status,
    issues,
    performance: {
      readLatency: ZERO, // 需要实际测量
      writeLatency: ZERO, // 需要实际测量
      errorRate: ZERO, // 需要从错误统计中获取
      availability: availability.localStorageAvailable ? ONE : ZERO,
    },
    storage: {
      used: stats.totalSize,
      available: COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB - stats.totalSize, // 假设5MB限制
      quota: COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB,
      utilization: stats.totalSize / (COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB),
    },
    lastCheck: Date.now(),
  };
}

function checkAvailabilityIssues(availability: {
  localStorageAvailable: boolean;
  cookiesAvailable: boolean;
}): [number, Array<{ type: ErrorType; severity: PriorityLevel; message: string; timestamp: number }>] {
  const list: Array<{ type: ErrorType; severity: PriorityLevel; message: string; timestamp: number }> = [];
  let delta = ZERO;
  if (!availability.localStorageAvailable) {
    delta += DEC_0_4;
    list.push({ type: 'access_denied', severity: 'high', message: 'localStorage不可用', timestamp: Date.now() });
  }
  if (!availability.cookiesAvailable) {
    delta += MAGIC_0_2;
    list.push({ type: 'access_denied', severity: 'medium', message: 'Cookies不可用', timestamp: Date.now() });
  }
  return [delta, list];
}

function checkFreshnessIssue(stats: StorageStats): [number, Array<{ type: ErrorType; severity: PriorityLevel; message: string; timestamp: number }>] {
  if (stats.freshness < MAGIC_0_5) {
    return [MAGIC_0_2, [{ type: 'validation_error', severity: 'medium', message: '数据过期', timestamp: Date.now() }]];
  }
  return [ZERO, []];
}

function checkSizeIssue(stats: StorageStats): [number, Array<{ type: ErrorType; severity: PriorityLevel; message: string; timestamp: number }>] {
  const maxSize = COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB; // 5MB
  if (stats.totalSize > maxSize * MAGIC_0_8) {
    return [MAGIC_0_1, [{ type: 'storage_full', severity: 'medium', message: '存储空间使用过多', timestamp: Date.now() }]];
  }
  return [ZERO, []];
}

function checkHistoryIssue(stats: StorageStats): [number, Array<{ type: ErrorType; severity: PriorityLevel; message: string; timestamp: number }>] {
  if (stats.historyStats.totalEntries > ANIMATION_DURATION_VERY_SLOW) {
    return [MAGIC_0_1, [{ type: 'validation_error', severity: 'low', message: '历史记录过多', timestamp: Date.now() }]];
  }
  return [ZERO, []];
}

/**
 * 检查存储可用性
 * Check storage availability
 */
function checkStorageAvailability(): {
  localStorageAvailable: boolean;
  sessionStorageAvailable: boolean;
  cookiesAvailable: boolean;
  indexedDBAvailable: boolean;
} {
  const result = {
    localStorageAvailable: false,
    sessionStorageAvailable: false,
    cookiesAvailable: false,
    indexedDBAvailable: false,
  };

  // 检查 localStorage
  try {
    const testKey = '__test_localStorage__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    result.localStorageAvailable = true;
  } catch {
    // localStorage 不可用
  }

  // 检查 sessionStorage
  try {
    const testKey = '__test_sessionStorage__';
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    result.sessionStorageAvailable = true;
  } catch {
    // sessionStorage 不可用
  }

  // 检查 Cookies
  try {
    document.cookie = '__test_cookie__=test; path=/';
    result.cookiesAvailable = document.cookie.includes('__test_cookie__');
    // 清理测试 cookie
    document.cookie =
      '__test_cookie__=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  } catch {
    // Cookies 不可用
  }

  // 检查 IndexedDB
  try {
    result.indexedDBAvailable = 'indexedDB' in window && indexedDB !== null;
  } catch {
    // IndexedDB 不可用
  }

  return result;
}

/**
 * 生成健康建议
 * Generate health recommendations
 */
// 备注：健康建议生成函数按需实现，避免未使用告警

/**
 * 执行健康检查
 * Perform health check
 */
export function performHealthCheck(): StorageOperationResult<StorageHealthCheck> {
  const startTime = Date.now();

  try {
    const healthCheck = calculateHealthCheck();

    return {
      success: true,
      data: healthCheck,
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

// ==================== 存储效率计算 ====================

/**
 * 计算存储效率
 * Calculate storage efficiency
 */
export function calculateStorageEfficiency(stats: StorageStats): number {
  // 基于多个因素计算效率分数 (0-1)
  let efficiency = ONE;

  // 数据新鲜度权重 40%
  efficiency *= MAGIC_0_6 + DEC_0_4 * stats.freshness;

  // 存储利用率权重 30%
  const maxReasonableSize = BYTES_PER_KB * BYTES_PER_KB; // 1MB
  const sizeEfficiency = Math.min(
    ONE,
    maxReasonableSize / Math.max(stats.totalSize, ONE),
  );
  efficiency *= MAGIC_0_7 + MAGIC_0_3 * sizeEfficiency;

  // 历史记录质量权重 30%
  const maxReasonableEntries = PERCENTAGE_FULL;
  const historyEfficiency = Math.min(
    ONE,
    maxReasonableEntries / Math.max(stats.historyStats.totalEntries, ONE),
  );
  efficiency *= MAGIC_0_7 + MAGIC_0_3 * historyEfficiency;

  return Math.max(ZERO, Math.min(ONE, efficiency));
}

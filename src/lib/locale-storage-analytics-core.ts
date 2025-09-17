/**
 * 语言存储分析核心功能
 * Locale Storage Analytics Core Functions
 *
 * 负责核心统计信息收集和健康检查功能
 */

'use client';

import { DEC_0_4, MAGIC_0_1, MAGIC_0_2, MAGIC_0_3, MAGIC_0_5, MAGIC_0_6, MAGIC_0_7, MAGIC_0_8 } from "@/constants/decimal";
import { ANIMATION_DURATION_VERY_SLOW, BYTES_PER_KB, COUNT_FIVE, HOURS_PER_DAY, ONE, PERCENTAGE_FULL, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import { DAYS_PER_WEEK } from "@/constants/time";
import { LocalStorageManager } from '@/lib/locale-storage-local';
import { estimateStorageSize } from '@/lib/locale-storage-types';
import type {
  ErrorType,
  LocaleDetectionHistory,
  PriorityLevel,
  StorageHealthCheck,
  StorageOperationResult,
  StorageStats,
} from './locale-storage-types';

// ==================== 核心统计功能 ====================

/**
 * 计算存储统计信息
 * Calculate storage statistics
 */
export function calculateStorageStats(): StorageStats {
  const now = Date.now();

  // 获取所有存储的数据
  const userPreference = LocalStorageManager.get(
    'user-locale-preference',
  ) as any;
  const detectionHistory = (LocalStorageManager.get(
    'locale-detection-history',
  ) || { history: [], lastUpdated: ZERO }) as any;
  const fallbackLocale = (LocalStorageManager.get('fallback-locale') ||
    'en') as any;

  // 计算存储大小
  const userPreferenceSize = estimateStorageSize(userPreference);
  const historySize = estimateStorageSize(detectionHistory);
  const fallbackSize = estimateStorageSize(fallbackLocale);
  const totalSize = userPreferenceSize + historySize + fallbackSize;

  // 计算历史记录统计
  const historyCount = detectionHistory?.history?.length || ZERO;
  const uniqueLocales = new Set(
    detectionHistory?.history?.map((h: any) => h.detectedLocale) || [],
  ).size;

  // 计算最近活动
  const lastActivity = Math.max(
    userPreference?.lastUpdated || ZERO,
    detectionHistory?.lastUpdated || ZERO,
    fallbackLocale?.lastUpdated || ZERO,
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
        detectionHistory?.history?.[historyCount - ONE]?.timestamp || ZERO,
      newestEntry: detectionHistory?.history?.[ZERO]?.timestamp || ZERO,
    },
  };
}

/**
 * 计算语言分布
 * Calculate locale distribution
 */
function calculateLocaleDistribution(
  detectionHistory: LocaleDetectionHistory | null,
): Record<string, number> {
  if (!detectionHistory?.history) {
    return {};
  }

  const distribution: Record<string, number> = {};

  for (const entry of detectionHistory.history) {
    const locale =
      (entry as any).detectedLocale || (entry as any).locale || 'unknown';
    distribution[locale] = (distribution[locale] || ZERO) + ONE;
  }

  return distribution;
}

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

  // 计算健康分数 (0-1)
  let healthScore = ONE;
  const issues: Array<{
    type: ErrorType;
    severity: PriorityLevel;
    message: string;
    timestamp: number;
  }> = [];

  // 检查存储可用性
  if (!availability.localStorageAvailable) {
    healthScore -= DEC_0_4;
    issues.push({
      type: 'access_denied',
      severity: 'high',
      message: 'localStorage不可用',
      timestamp: Date.now(),
    });
  }

  if (!availability.cookiesAvailable) {
    healthScore -= MAGIC_0_2;
    issues.push({
      type: 'access_denied',
      severity: 'medium',
      message: 'Cookies不可用',
      timestamp: Date.now(),
    });
  }

  // 检查数据新鲜度
  if (stats.freshness < MAGIC_0_5) {
    healthScore -= MAGIC_0_2;
    issues.push({
      type: 'validation_error',
      severity: 'medium',
      message: '数据过期',
      timestamp: Date.now(),
    });
  }

  // 检查存储大小
  const maxSize = COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB; // 5MB
  if (stats.totalSize > maxSize * MAGIC_0_8) {
    healthScore -= MAGIC_0_1;
    issues.push({
      type: 'storage_full',
      severity: 'medium',
      message: '存储空间使用过多',
      timestamp: Date.now(),
    });
  }

  // 检查历史记录数量
  if (stats.historyStats.totalEntries > ANIMATION_DURATION_VERY_SLOW) {
    healthScore -= MAGIC_0_1;
    issues.push({
      type: 'validation_error',
      severity: 'low',
      message: '历史记录过多',
      timestamp: Date.now(),
    });
  }

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
function generateHealthRecommendations(
  healthScore: number,
  issues: Array<{
    type: ErrorType;
    severity: PriorityLevel;
    message: string;
    timestamp: number;
  }>,
): string[] {
  const recommendations: string[] = [];

  if (healthScore < MAGIC_0_5) {
    recommendations.push('建议立即检查存储系统配置');
  }

  if (issues.some((issue) => issue.message === 'localStorage不可用')) {
    recommendations.push('检查浏览器设置，确保localStorage已启用');
  }

  if (issues.some((issue) => issue.message === 'Cookies不可用')) {
    recommendations.push('检查浏览器Cookie设置');
  }

  if (issues.some((issue) => issue.message === '数据过期')) {
    recommendations.push('考虑清理过期数据或更新数据');
  }

  if (issues.some((issue) => issue.message === '存储空间使用过多')) {
    recommendations.push('清理不必要的历史记录');
  }

  if (issues.some((issue) => issue.message === '历史记录过多')) {
    recommendations.push('定期清理旧的检测历史记录');
  }

  if (recommendations.length === ZERO) {
    recommendations.push('系统运行正常，建议定期监控');
  }

  return recommendations;
}

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

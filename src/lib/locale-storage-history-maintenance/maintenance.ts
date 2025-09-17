/**
 * 语言检测历史维护工具功能
 * Locale Detection History Maintenance Tools
 */

'use client';

import { CACHE_LIMITS } from '@/constants/i18n-constants';
import { ANIMATION_DURATION_VERY_SLOW, DAYS_PER_MONTH, HOURS_PER_DAY, MAGIC_1_5, ONE, PERCENTAGE_FULL, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import { getDetectionHistory } from '@/lib/locale-storage-history-core';
import type { StorageOperationResult } from '@/lib/locale-storage-types';
import {
  cleanupDuplicateDetections,
  cleanupExpiredDetections,
  limitHistorySize,
} from './cleanup';

/**
 * 执行完整的历史维护
 * Perform complete history maintenance
 */
export function performMaintenance(options: {
  cleanupExpired?: boolean;
  maxAge?: number;
  removeDuplicates?: boolean;
  limitSize?: boolean;
  maxRecords?: number;
}): StorageOperationResult<{
  expiredRemoved: number;
  duplicatesRemoved: number;
  sizeReduced: number;
  finalCount: number;
}> {
  const startTime = Date.now();

  try {
    let expiredRemoved = ZERO;
    let duplicatesRemoved = ZERO;
    let sizeReduced = ZERO;

    // 清理过期记录
    if (options.cleanupExpired !== false) {
      const expiredResult = cleanupExpiredDetections(options.maxAge);
      if (expiredResult.success) {
        expiredRemoved = expiredResult.data || ZERO;
      }
    }

    // 移除重复记录
    if (options.removeDuplicates !== false) {
      const duplicateResult = cleanupDuplicateDetections();
      if (duplicateResult.success) {
        duplicatesRemoved = duplicateResult.data || ZERO;
      }
    }

    // 限制大小
    if (options.limitSize !== false) {
      const limitResult = limitHistorySize(options.maxRecords);
      if (limitResult.success) {
        sizeReduced = limitResult.data || ZERO;
      }
    }

    // 获取最终计数
    const historyResult = getDetectionHistory();
    const finalCount = historyResult.success
      ? historyResult.data!.history.length
      : ZERO;

    return {
      success: true,
      data: {
        expiredRemoved,
        duplicatesRemoved,
        sizeReduced,
        finalCount,
      },
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
 * 获取维护建议
 * Get maintenance recommendations
 */
export function getMaintenanceRecommendations(): {
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
  estimatedBenefit: string;
} {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return {
      recommendations: ['无法获取历史记录，建议检查存储状态'],
      urgency: 'high',
      estimatedBenefit: '恢复正常功能',
    };
  }

  const history = historyResult.data;
  const records = history.history;
  const recommendations: string[] = [];
  let urgency: 'low' | 'medium' | 'high' = 'low';

  // 检查记录数量
  const maxRecords = CACHE_LIMITS.MAX_DETECTION_HISTORY || PERCENTAGE_FULL;
  if (records.length > maxRecords * MAGIC_1_5) {
    recommendations.push(`历史记录过多 (${records.length})，建议清理`);
    urgency = 'high';
  } else if (records.length > maxRecords) {
    recommendations.push(`历史记录较多 (${records.length})，考虑清理`);
    urgency = urgency === 'low' ? 'medium' : urgency;
  }

  // 检查过期记录
  const thirtyDaysAgo = Date.now() - DAYS_PER_MONTH * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW;
  const expiredCount = records.filter(
    (r) => r.timestamp < thirtyDaysAgo,
  ).length;

  if (expiredCount > ZERO) {
    recommendations.push(`发现 ${expiredCount} 条过期记录，建议清理`);
    urgency = urgency === 'low' ? 'medium' : urgency;
  }

  // 检查重复记录
  const uniqueKeys = new Set();
  let duplicateCount = ZERO;

  records.forEach((record) => {
    const key = `${record.locale}-${record.source}-${record.timestamp}`;
    if (uniqueKeys.has(key)) {
      duplicateCount += ONE;
    } else {
      uniqueKeys.add(key);
    }
  });

  if (duplicateCount > ZERO) {
    recommendations.push(`发现 ${duplicateCount} 条重复记录，建议清理`);
  }

  // 检查数据完整性
  const invalidRecords = records.filter(
    (record) =>
      !record.locale ||
      !record.source ||
      !record.timestamp ||
      record.confidence < ZERO ||
      record.confidence > ONE,
  );

  if (invalidRecords.length > ZERO) {
    recommendations.push(`发现 ${invalidRecords.length} 条无效记录，建议清理`);
    urgency = 'high';
  }

  if (recommendations.length === ZERO) {
    recommendations.push('历史记录状态良好，无需维护');
  }

  const estimatedBenefit =
    urgency === 'high'
      ? '显著提升性能和稳定性'
      : urgency === 'medium'
        ? '改善存储效率'
        : '保持系统整洁';

  return {
    recommendations,
    urgency,
    estimatedBenefit,
  };
}

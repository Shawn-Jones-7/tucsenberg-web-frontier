/**
 * 语言检测历史维护工具功能
 * Locale Detection History Maintenance Tools
 */

'use client';

import { CACHE_LIMITS } from '@/constants/i18n-constants';
import { MAGIC_1_5, DAYS_PER_MONTH, HOURS_PER_DAY, SECONDS_PER_MINUTE } from '@/constants/magic-numbers';

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
    let expiredRemoved = 0;
    let duplicatesRemoved = 0;
    let sizeReduced = 0;

    // 清理过期记录
    if (options.cleanupExpired !== false) {
      const expiredResult = cleanupExpiredDetections(options.maxAge);
      if (expiredResult.success) {
        expiredRemoved = expiredResult.data || 0;
      }
    }

    // 移除重复记录
    if (options.removeDuplicates !== false) {
      const duplicateResult = cleanupDuplicateDetections();
      if (duplicateResult.success) {
        duplicatesRemoved = duplicateResult.data || 0;
      }
    }

    // 限制大小
    if (options.limitSize !== false) {
      const limitResult = limitHistorySize(options.maxRecords);
      if (limitResult.success) {
        sizeReduced = limitResult.data || 0;
      }
    }

    // 获取最终计数
    const historyResult = getDetectionHistory();
    const finalCount = historyResult.success
      ? historyResult.data!.history.length
      : 0;

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
  const maxRecords = CACHE_LIMITS.MAX_DETECTION_HISTORY || 100;
  if (records.length > maxRecords * MAGIC_1_5) {
    recommendations.push(`历史记录过多 (${records.length})，建议清理`);
    urgency = 'high';
  } else if (records.length > maxRecords) {
    recommendations.push(`历史记录较多 (${records.length})，考虑清理`);
    urgency = urgency === 'low' ? 'medium' : urgency;
  }

  // 检查过期记录
  const thirtyDaysAgo = Date.now() - DAYS_PER_MONTH * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * 1000;
  const expiredCount = records.filter(
    (r) => r.timestamp < thirtyDaysAgo,
  ).length;

  if (expiredCount > 0) {
    recommendations.push(`发现 ${expiredCount} 条过期记录，建议清理`);
    urgency = urgency === 'low' ? 'medium' : urgency;
  }

  // 检查重复记录
  const uniqueKeys = new Set();
  let duplicateCount = 0;

  records.forEach((record) => {
    const key = `${record.locale}-${record.source}-${record.timestamp}`;
    if (uniqueKeys.has(key)) {
      duplicateCount += 1;
    } else {
      uniqueKeys.add(key);
    }
  });

  if (duplicateCount > 0) {
    recommendations.push(`发现 ${duplicateCount} 条重复记录，建议清理`);
  }

  // 检查数据完整性
  const invalidRecords = records.filter(
    (record) =>
      !record.locale ||
      !record.source ||
      !record.timestamp ||
      record.confidence < 0 ||
      record.confidence > 1,
  );

  if (invalidRecords.length > 0) {
    recommendations.push(`发现 ${invalidRecords.length} 条无效记录，建议清理`);
    urgency = 'high';
  }

  if (recommendations.length === 0) {
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

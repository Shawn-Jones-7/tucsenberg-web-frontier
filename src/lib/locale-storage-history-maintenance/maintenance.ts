/**
 * 语言检测历史维护工具功能
 * Locale Detection History Maintenance Tools
 */

'use client';

import { CACHE_LIMITS } from '@/constants/i18n-constants';
import { ANIMATION_DURATION_VERY_SLOW, DAYS_PER_MONTH, HOURS_PER_DAY, ONE, PERCENTAGE_FULL, SECONDS_PER_MINUTE, ZERO, MAGIC_1_5 } from '@/constants';

import { getDetectionHistory } from '@/lib/locale-storage-history-core';
import type { StorageOperationResult } from '@/lib/locale-storage-types';
import {
  cleanupDuplicateDetections,
  cleanupExpiredDetections,
  limitHistorySize,
} from '@/lib/locale-storage-history-maintenance/cleanup';

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
    const expiredRemoved = applyExpiredCleanup(options);
    const duplicatesRemoved = applyDuplicateCleanup(options);
    const sizeReduced = applySizeLimit(options);

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

  // 分项评估
  urgency = assessCount(records, recommendations, urgency);
  urgency = assessExpired(records, recommendations, urgency);
  assessDuplicates(records, recommendations);
  urgency = assessIntegrity(records, recommendations, urgency);

  if (recommendations.length === ZERO) {
    recommendations.push('历史记录状态良好，无需维护');
  }

  const estimatedBenefit =
    urgency === 'high'
      ? '显著提升性能和稳定性'
      : urgency === 'medium'
        ? '改善存储效率'
        : '保持系统整洁';

  return { recommendations, urgency, estimatedBenefit };
}

function applyExpiredCleanup(options: { cleanupExpired?: boolean; maxAge?: number }): number {
  if (options.cleanupExpired === false) return ZERO;
  const res = cleanupExpiredDetections(options.maxAge);
  return res.success ? res.data || ZERO : ZERO;
}

function applyDuplicateCleanup(options: { removeDuplicates?: boolean }): number {
  if (options.removeDuplicates === false) return ZERO;
  const res = cleanupDuplicateDetections();
  return res.success ? res.data || ZERO : ZERO;
}

function applySizeLimit(options: { limitSize?: boolean; maxRecords?: number }): number {
  if (options.limitSize === false) return ZERO;
  const res = limitHistorySize(options.maxRecords);
  return res.success ? res.data || ZERO : ZERO;
}

function assessCount(
  records: Array<{ timestamp: number } & Record<string, unknown>>,
  recommendations: string[],
  currentUrgency: 'low' | 'medium' | 'high',
): 'low' | 'medium' | 'high' {
  const maxRecords = CACHE_LIMITS.MAX_DETECTION_HISTORY || PERCENTAGE_FULL;
  if (records.length > maxRecords * MAGIC_1_5) {
    recommendations.push(`历史记录过多 (${records.length})，建议清理`);
    return 'high';
  }
  if (records.length > maxRecords) {
    recommendations.push(`历史记录较多 (${records.length})，考虑清理`);
    return currentUrgency === 'low' ? 'medium' : currentUrgency;
  }
  return currentUrgency;
}

function assessExpired(
  records: Array<{ timestamp: number }>,
  recommendations: string[],
  currentUrgency: 'low' | 'medium' | 'high',
): 'low' | 'medium' | 'high' {
  const thirtyDaysAgo = Date.now() - DAYS_PER_MONTH * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW;
  const expiredCount = records.filter((r) => r.timestamp < thirtyDaysAgo).length;
  if (expiredCount > ZERO) {
    recommendations.push(`发现 ${expiredCount} 条过期记录，建议清理`);
    return currentUrgency === 'low' ? 'medium' : currentUrgency;
  }
  return currentUrgency;
}

function assessDuplicates(
  records: Array<{ locale: unknown; source: unknown; timestamp: number }>,
  recommendations: string[],
): void {
  const uniqueKeys = new Set<string>();
  let duplicateCount = ZERO;
  for (const record of records) {
    const key = `${String(record.locale)}-${String(record.source)}-${record.timestamp}`;
    if (uniqueKeys.has(key)) duplicateCount += ONE; else uniqueKeys.add(key);
  }
  if (duplicateCount > ZERO) {
    recommendations.push(`发现 ${duplicateCount} 条重复记录，建议清理`);
  }
}

function assessIntegrity(
  records: Array<{ locale: unknown; source: unknown; timestamp: number; confidence: number }>,
  recommendations: string[],
  currentUrgency: 'low' | 'medium' | 'high',
): 'low' | 'medium' | 'high' {
  const invalidRecords = records.filter(
    (record) => !record.locale || !record.source || !record.timestamp || record.confidence < ZERO || record.confidence > ONE,
  );
  if (invalidRecords.length > ZERO) {
    recommendations.push(`发现 ${invalidRecords.length} 条无效记录，建议清理`);
    return 'high';
  }
  return currentUrgency;
}

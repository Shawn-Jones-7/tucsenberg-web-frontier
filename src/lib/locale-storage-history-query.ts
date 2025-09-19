/**
 * 语言检测历史查询和过滤
 * Locale Detection History Query and Filtering
 *
 * 负责历史记录的查询、过滤和搜索功能
 */

'use client';

import type { Locale } from '@/types/i18n';
import { getDetectionHistory } from '@/lib/locale-storage-history-core';
import type { LocaleDetectionRecord } from '@/lib/locale-storage-types';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_TEN,
  HOURS_PER_DAY,
  ONE,
  PERCENTAGE_FULL,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';

// ==================== 基础查询功能 ====================

/**
 * 获取最近的检测记录
 * Get recent detections
 */
export function getRecentDetections(
  limit: number = COUNT_TEN,
): LocaleDetectionRecord[] {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  return historyResult.data.history.slice(ZERO, limit);
}

/**
 * 按来源获取检测记录
 * Get detections by source
 */
export function getDetectionsBySource(source: string): LocaleDetectionRecord[] {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  return historyResult.data.history.filter(
    (record) => record.source === source,
  );
}

/**
 * 按语言获取检测记录
 * Get detections by locale
 */
export function getDetectionsByLocale(locale: Locale): LocaleDetectionRecord[] {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  return historyResult.data.history.filter(
    (record) => record.locale === locale,
  );
}

/**
 * 按时间范围获取检测记录
 * Get detections by time range
 */
export function getDetectionsByTimeRange(
  startTime: number,
  endTime: number,
): LocaleDetectionRecord[] {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  return historyResult.data.history.filter(
    (record) => record.timestamp >= startTime && record.timestamp <= endTime,
  );
}

/**
 * 按置信度范围获取检测记录
 * Get detections by confidence range
 */
export function getDetectionsByConfidence(
  minConfidence: number,
  maxConfidence: number = ONE,
): LocaleDetectionRecord[] {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  return historyResult.data.history.filter(
    (record) =>
      record.confidence >= minConfidence && record.confidence <= maxConfidence,
  );
}

// ==================== 高级查询功能 ====================

/**
 * 查询条件接口
 * Query conditions interface
 */
export interface QueryConditions {
  locale?: Locale;
  source?: string;
  startTime?: number;
  endTime?: number;
  minConfidence?: number;
  maxConfidence?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'confidence' | 'locale' | 'source';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 复合查询检测记录
 * Complex query for detection records
 */
export function queryDetections(conditions: QueryConditions): {
  records: LocaleDetectionRecord[];
  totalCount: number;
  hasMore: boolean;
} {
  const historyResult = getDetectionHistory();
  if (!historyResult.success || !historyResult.data) {
    return { records: [], totalCount: ZERO, hasMore: false };
  }

  let records = historyResult.data.history;
  records = applyFilters(records, conditions);
  records = applySort(records, conditions.sortBy, conditions.sortOrder);

  const totalCount = records.length;
  const { items, hasMore } = applyPagination(
    records,
    conditions.offset,
    conditions.limit,
  );

  return { records: items, totalCount, hasMore };
}

function applyFilters(
  records: LocaleDetectionRecord[],
  c: QueryConditions,
): LocaleDetectionRecord[] {
  let result = records;
  if (c.locale) result = result.filter((r) => r.locale === c.locale);
  if (c.source) result = result.filter((r) => r.source === c.source);
  if (c.startTime !== undefined)
    result = result.filter((r) => r.timestamp >= c.startTime!);
  if (c.endTime !== undefined)
    result = result.filter((r) => r.timestamp <= c.endTime!);
  if (c.minConfidence !== undefined)
    result = result.filter((r) => r.confidence >= c.minConfidence!);
  if (c.maxConfidence !== undefined)
    result = result.filter((r) => r.confidence <= c.maxConfidence!);
  return result;
}

function applySort(
  records: LocaleDetectionRecord[],
  sortBy?: QueryConditions['sortBy'],
  sortOrder: QueryConditions['sortOrder'] = 'asc',
): LocaleDetectionRecord[] {
  if (!sortBy) return records;
  const sorted = [...records];
  sorted.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    switch (sortBy) {
      case 'timestamp':
        aValue = a.timestamp;
        bValue = b.timestamp;
        break;
      case 'confidence':
        aValue = a.confidence;
        bValue = b.confidence;
        break;
      case 'locale':
        aValue = a.locale;
        bValue = b.locale;
        break;
      case 'source':
        aValue = a.source;
        bValue = b.source;
        break;
      default:
        return ZERO;
    }
    if (aValue < bValue) return sortOrder === 'desc' ? ONE : -ONE;
    if (aValue > bValue) return sortOrder === 'desc' ? -ONE : ONE;
    return ZERO;
  });
  return sorted;
}

function applyPagination(
  records: LocaleDetectionRecord[],
  offset?: number,
  limit?: number,
): { items: LocaleDetectionRecord[]; hasMore: boolean } {
  const start = offset ?? ZERO;
  const end = start + (limit ?? records.length);
  return { items: records.slice(start, end), hasMore: end < records.length };
}

/**
 * 搜索检测记录
 * Search detection records
 */
export function searchDetections(searchTerm: string): LocaleDetectionRecord[] {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  const term = searchTerm.toLowerCase();

  return historyResult.data.history.filter((record) => {
    // 搜索语言代码
    if (record.locale.toLowerCase().includes(term)) {
      return true;
    }

    // 搜索来源
    if (record.source.toLowerCase().includes(term)) {
      return true;
    }

    // 搜索元数据
    if (record.metadata) {
      const metadataStr = JSON.stringify(record.metadata).toLowerCase();
      if (metadataStr.includes(term)) {
        return true;
      }
    }

    return false;
  });
}

// ==================== 聚合查询功能 ====================

/**
 * 获取唯一的语言列表
 * Get unique locales
 */
export function getUniqueLocales(): Locale[] {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  const locales = new Set<Locale>();
  historyResult.data.history.forEach((record) => {
    locales.add(record.locale);
  });

  return Array.from(locales).sort();
}

/**
 * 获取唯一的来源列表
 * Get unique sources
 */
export function getUniqueSources(): string[] {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  const sources = new Set<string>();
  historyResult.data.history.forEach((record) => {
    sources.add(record.source);
  });

  return Array.from(sources).sort();
}

/**
 * 按语言分组统计
 * Group by locale statistics
 */
export function getLocaleGroupStats(): Array<{
  locale: Locale;
  count: number;
  percentage: number;
  avgConfidence: number;
  lastDetection: number;
}> {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  const records = historyResult.data.history;
  const totalRecords = records.length;

  if (totalRecords === ZERO) {
    return [];
  }

  const localeStats = new Map<
    Locale,
    {
      count: number;
      totalConfidence: number;
      lastDetection: number;
    }
  >();

  records.forEach((record) => {
    const existing = localeStats.get(record.locale) || {
      count: ZERO,
      totalConfidence: ZERO,
      lastDetection: ZERO,
    };

    existing.count += ONE;
    existing.totalConfidence += record.confidence;
    existing.lastDetection = Math.max(existing.lastDetection, record.timestamp);

    localeStats.set(record.locale, existing);
  });

  return Array.from(localeStats.entries())
    .map(([locale, stats]) => ({
      locale,
      count: stats.count,
      percentage: (stats.count / totalRecords) * PERCENTAGE_FULL,
      avgConfidence: stats.totalConfidence / stats.count,
      lastDetection: stats.lastDetection,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 按来源分组统计
 * Group by source statistics
 */
export function getSourceGroupStats(): Array<{
  source: string;
  count: number;
  percentage: number;
  avgConfidence: number;
  lastDetection: number;
}> {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  const records = historyResult.data.history;
  const totalRecords = records.length;

  if (totalRecords === ZERO) {
    return [];
  }

  const sourceStats = new Map<
    string,
    {
      count: number;
      totalConfidence: number;
      lastDetection: number;
    }
  >();

  records.forEach((record) => {
    const existing = sourceStats.get(record.source) || {
      count: ZERO,
      totalConfidence: ZERO,
      lastDetection: ZERO,
    };

    existing.count += ONE;
    existing.totalConfidence += record.confidence;
    existing.lastDetection = Math.max(existing.lastDetection, record.timestamp);

    sourceStats.set(record.source, existing);
  });

  return Array.from(sourceStats.entries())
    .map(([source, stats]) => ({
      source,
      count: stats.count,
      percentage: (stats.count / totalRecords) * PERCENTAGE_FULL,
      avgConfidence: stats.totalConfidence / stats.count,
      lastDetection: stats.lastDetection,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 获取时间分布统计
 * Get time distribution statistics
 */
export function getTimeDistributionStats(
  bucketSize: number = HOURS_PER_DAY *
    SECONDS_PER_MINUTE *
    SECONDS_PER_MINUTE *
    ANIMATION_DURATION_VERY_SLOW,
): Array<{
  startTime: number;
  endTime: number;
  count: number;
  avgConfidence: number;
}> {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return [];
  }

  const records = historyResult.data.history;

  if (records.length === ZERO) {
    return [];
  }

  // 找到时间范围
  const timestamps = records.map((r) => r.timestamp);
  const minTime = Math.min(...timestamps);
  // 最大时间可用于扩展分析（此处不直接使用）

  // 创建时间桶
  const buckets = new Map<
    number,
    {
      count: number;
      totalConfidence: number;
    }
  >();

  records.forEach((record) => {
    const bucketStart =
      Math.floor((record.timestamp - minTime) / bucketSize) * bucketSize +
      minTime;
    const existing = buckets.get(bucketStart) || {
      count: ZERO,
      totalConfidence: ZERO,
    };

    existing.count += ONE;
    existing.totalConfidence += record.confidence;

    buckets.set(bucketStart, existing);
  });

  return Array.from(buckets.entries())
    .map(([startTime, stats]) => ({
      startTime,
      endTime: startTime + bucketSize,
      count: stats.count,
      avgConfidence: stats.totalConfidence / stats.count,
    }))
    .sort((a, b) => a.startTime - b.startTime);
}

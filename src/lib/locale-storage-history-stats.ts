/**
 * 语言检测历史统计和分析
 * Locale Detection History Statistics and Analysis
 *
 * 负责历史记录的统计分析和洞察生成
 */

'use client';

import { getDetectionHistory } from '@/lib/locale-storage-history-core';
import {
  getDetectionTrends,
  type DetectionTrends,
} from '@/lib/locale-storage-history-trends';
import {
  ANGLE_90_DEG,
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  HOURS_PER_DAY,
  ONE,
  PERCENTAGE_FULL,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import { MAGIC_0_5, MAGIC_0_8 } from '@/constants/decimal';
import type {} from '@/lib/locale-storage-types';
import type { Locale } from '@/types/i18n';
import {
  getLocaleGroupStats,
  getSourceGroupStats,
} from '@/lib/locale-storage-history-query';

// Re-export for backwards compatibility
export { getDetectionTrends, type DetectionTrends };

// ==================== 基础统计功能 ====================

/**
 * 获取检测统计信息
 */
export function getDetectionStats(): {
  totalDetections: number;
  uniqueLocales: number;
  uniqueSources: number;
  averageConfidence: number;
  mostDetectedLocale: { locale: Locale; count: number } | null;
  mostUsedSource: { source: string; count: number } | null;
  detectionFrequency: number;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  timeSpan: {
    oldest: number;
    newest: number;
    spanDays: number;
  };
} {
  const historyResult = getDetectionHistory();
  if (!historyResult.success || !historyResult.data) return emptyStats();

  const records = historyResult.data.history;
  if (records.length === ZERO) return emptyStats();

  const {
    locales,
    sources,
    totalConfidence,
    localeCounts,
    sourceCounts,
    buckets,
  } = accumulateStats(records);
  const mostDetectedLocale = getMaxLocale(localeCounts);
  const mostUsedSource = getMaxSource(sourceCounts);
  const timeSpan = computeTimeSpan(records);
  const detectionFrequency =
    timeSpan.spanDays > ZERO ? records.length / timeSpan.spanDays : ZERO;

  return {
    totalDetections: records.length,
    uniqueLocales: locales.size,
    uniqueSources: sources.size,
    averageConfidence: totalConfidence / records.length,
    mostDetectedLocale,
    mostUsedSource,
    detectionFrequency,
    confidenceDistribution: buckets,
    timeSpan,
  };
}

function emptyStats() {
  return {
    totalDetections: ZERO,
    uniqueLocales: ZERO,
    uniqueSources: ZERO,
    averageConfidence: ZERO,
    mostDetectedLocale: null as { locale: Locale; count: number } | null,
    mostUsedSource: null as { source: string; count: number } | null,
    detectionFrequency: ZERO,
    confidenceDistribution: { high: ZERO, medium: ZERO, low: ZERO },
    timeSpan: { oldest: ZERO, newest: ZERO, spanDays: ZERO },
  };
}

function accumulateStats(
  records: Array<{ locale: Locale; source: string; confidence: number }>,
) {
  const locales = new Set<Locale>();
  const sources = new Set<string>();
  let totalConfidence = ZERO;
  const localeCounts = new Map<Locale, number>();
  const sourceCounts = new Map<string, number>();
  const buckets = { high: ZERO, medium: ZERO, low: ZERO };

  for (const record of records) {
    locales.add(record.locale);
    sources.add(record.source);
    totalConfidence += record.confidence;

    if (record.confidence > MAGIC_0_8) buckets.high += ONE;
    else if (record.confidence >= MAGIC_0_5) buckets.medium += ONE;
    else buckets.low += ONE;

    localeCounts.set(
      record.locale,
      (localeCounts.get(record.locale) || ZERO) + ONE,
    );
    sourceCounts.set(
      record.source,
      (sourceCounts.get(record.source) || ZERO) + ONE,
    );
  }

  return {
    locales,
    sources,
    totalConfidence,
    localeCounts,
    sourceCounts,
    buckets,
  };
}

function getMaxLocale(
  map: Map<Locale, number>,
): { locale: Locale; count: number } | null {
  let result: { locale: Locale; count: number } | null = null;
  for (const [locale, count] of map.entries()) {
    if (!result || count > result.count) result = { locale, count };
  }
  return result;
}

function getMaxSource(
  map: Map<string, number>,
): { source: string; count: number } | null {
  let result: { source: string; count: number } | null = null;
  for (const [source, count] of map.entries()) {
    if (!result || count > result.count) result = { source, count };
  }
  return result;
}

function computeTimeSpan(records: Array<{ timestamp: number }>) {
  const timestamps = records.map((r) => r.timestamp);
  const oldest = Math.min(...timestamps);
  const newest = Math.max(...timestamps);
  const spanMs = newest - oldest;
  const spanDays =
    spanMs /
    (HOURS_PER_DAY *
      SECONDS_PER_MINUTE *
      SECONDS_PER_MINUTE *
      ANIMATION_DURATION_VERY_SLOW);
  return { oldest, newest, spanDays };
}

// ==================== 洞察生成功能 ====================

/**
 * 生成历史洞察
 */
export function generateHistoryInsights(): {
  insights: string[];
  recommendations: string[];
  alerts: string[];
} {
  const stats = getDetectionStats();
  const trends = getDetectionTrends();
  // 获取分组统计（当前未直接使用，可用于扩展）
  getLocaleGroupStats();
  getSourceGroupStats();

  const insights: string[] = [];
  const recommendations: string[] = [];
  const alerts: string[] = [];

  addBaseInsights(stats, insights);
  addLocaleSourceInsights(stats, insights);
  addConfidenceInsights(stats, insights, { alerts, recommendations });
  addTrendInsights(trends, insights, recommendations);
  addFrequencyDiversityInsights(stats, insights, recommendations);
  addQualityChecks(stats, recommendations);

  return { insights, recommendations, alerts };
}

function addBaseInsights(
  stats: ReturnType<typeof getDetectionStats>,
  insights: string[],
) {
  if (stats.totalDetections > ZERO) {
    insights.push(`总共记录了 ${stats.totalDetections} 次语言检测`);
    insights.push(`检测到 ${stats.uniqueLocales} 种不同的语言`);
    insights.push(
      `平均置信度为 ${(stats.averageConfidence * PERCENTAGE_FULL).toFixed(ONE)}%`,
    );
  }
}

function addLocaleSourceInsights(
  stats: ReturnType<typeof getDetectionStats>,
  insights: string[],
) {
  if (stats.mostDetectedLocale) {
    const percentage = (
      (stats.mostDetectedLocale.count / stats.totalDetections) *
      PERCENTAGE_FULL
    ).toFixed(ONE);
    insights.push(
      `最常检测的语言是 ${stats.mostDetectedLocale.locale} (${percentage}%)`,
    );
  }
  if (stats.mostUsedSource) {
    const percentage = (
      (stats.mostUsedSource.count / stats.totalDetections) *
      PERCENTAGE_FULL
    ).toFixed(ONE);
    insights.push(
      `最常用的检测来源是 ${stats.mostUsedSource.source} (${percentage}%)`,
    );
  }
}

function addConfidenceInsights(
  stats: ReturnType<typeof getDetectionStats>,
  insights: string[],
  ctx: { alerts: string[]; recommendations: string[] },
) {
  const { high, medium, low } = stats.confidenceDistribution;
  const highPercentage = (
    (high / stats.totalDetections) *
    PERCENTAGE_FULL
  ).toFixed(ONE);
  const lowPercentage = (
    (low / stats.totalDetections) *
    PERCENTAGE_FULL
  ).toFixed(ONE);

  if (high > medium + low) {
    insights.push(`检测质量优秀，${highPercentage}% 的检测具有高置信度`);
  } else if (low > high) {
    ctx.alerts.push(`检测质量需要改善，${lowPercentage}% 的检测置信度较低`);
    ctx.recommendations.push('考虑优化语言检测算法或数据源');
  }
}

function addTrendInsights(
  trends: DetectionTrends,
  insights: string[],
  recommendations: string[],
) {
  if (trends.trendDirection === 'increasing') {
    insights.push('语言检测活动呈上升趋势');
  } else if (trends.trendDirection === 'decreasing') {
    insights.push('语言检测活动呈下降趋势');
    recommendations.push('分析用户行为变化，考虑改进用户体验');
  }
}

function addFrequencyDiversityInsights(
  stats: ReturnType<typeof getDetectionStats>,
  insights: string[],
  recommendations: string[],
) {
  if (stats.detectionFrequency > COUNT_TEN) {
    insights.push('用户语言检测活动频繁，表明多语言需求较高');
  } else if (stats.detectionFrequency < ONE) {
    recommendations.push('考虑增加语言检测的触发场景');
  }

  if (stats.uniqueLocales > COUNT_FIVE) {
    insights.push('用户群体语言多样性较高');
    recommendations.push('确保所有检测到的语言都有良好的本地化支持');
  }
}

function addQualityChecks(
  stats: ReturnType<typeof getDetectionStats>,
  recommendations: string[],
) {
  if (stats.totalDetections > ANIMATION_DURATION_VERY_SLOW) {
    recommendations.push('历史记录较多，建议定期清理过期数据');
  }
  if (stats.timeSpan.spanDays > ANGLE_90_DEG) {
    recommendations.push('数据跨度较长，可以进行长期趋势分析');
  }
}

// ==================== 性能指标功能 ====================

/**
 * 获取性能指标
 */
export function getPerformanceMetrics(): {
  averageConfidence: number;
  confidenceStability: number;
  sourceReliability: Record<string, number>;
  detectionAccuracy: number;
  responseConsistency: number;
} {
  const historyResult = getDetectionHistory();
  if (
    !historyResult.success ||
    !historyResult.data ||
    historyResult.data.history.length === ZERO
  ) {
    return {
      averageConfidence: ZERO,
      confidenceStability: ZERO,
      sourceReliability: {},
      detectionAccuracy: ZERO,
      responseConsistency: ZERO,
    };
  }

  const records = historyResult.data.history;

  const averageConfidence = computeAverageConfidence(records);
  const confidenceStability = computeConfidenceStability(
    records,
    averageConfidence,
  );
  const sourceReliability = buildSourceReliability();
  const detectionAccuracy = computeDetectionAccuracy(records);
  const responseConsistency = computeResponseConsistency(records);

  return {
    averageConfidence,
    confidenceStability,
    sourceReliability,
    detectionAccuracy,
    responseConsistency,
  };
}

function computeAverageConfidence(
  records: Array<{ confidence: number }>,
): number {
  return records.reduce((sum, r) => sum + r.confidence, ZERO) / records.length;
}

function computeConfidenceStability(
  records: Array<{ confidence: number }>,
  avg: number,
): number {
  const variance =
    records.reduce((sum, r) => {
      const diff = r.confidence - avg;
      return sum + diff * diff;
    }, ZERO) / records.length;
  return ONE / (ONE + Math.sqrt(variance));
}

function buildSourceReliability(): Record<string, number> {
  const sourceStats = getSourceGroupStats();
  const map = new Map<string, number>();
  sourceStats.forEach((stat) => map.set(stat.source, stat.avgConfidence));
  return Object.fromEntries(map.entries()) as Record<string, number>;
}

function computeDetectionAccuracy(
  records: Array<{ confidence: number }>,
): number {
  const high = records.filter((r) => r.confidence > MAGIC_0_8).length;
  return records.length > ZERO ? high / records.length : ZERO;
}

function computeResponseConsistency(
  records: Array<{ locale: Locale; confidence: number }>,
): number {
  const localeConsistency = new Map<Locale, number[]>();
  records.forEach((record) => {
    if (!localeConsistency.has(record.locale))
      localeConsistency.set(record.locale, []);
    localeConsistency.get(record.locale)!.push(record.confidence);
  });

  let totalConsistency = ZERO;
  let localeCount = ZERO;
  for (const [, confidences] of localeConsistency.entries()) {
    if (confidences.length > ONE) {
      const avg =
        confidences.reduce((sum, c) => sum + c, ZERO) / confidences.length;
      const variance =
        confidences.reduce((sum, c) => sum + (c - avg) ** COUNT_PAIR, ZERO) /
        confidences.length;
      totalConsistency += ONE / (ONE + Math.sqrt(variance));
      localeCount += ONE;
    }
  }
  return localeCount > ZERO ? totalConsistency / localeCount : ONE;
}

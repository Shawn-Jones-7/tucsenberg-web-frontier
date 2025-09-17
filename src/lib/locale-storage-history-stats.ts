/**
 * 语言检测历史统计和分析
 * Locale Detection History Statistics and Analysis
 *
 * 负责历史记录的统计分析、趋势分析和洞察生成
 */

'use client';

import { MAGIC_6 } from "@/constants/count";
import { MAGIC_0_1, MAGIC_0_5, MAGIC_0_8 } from "@/constants/decimal";
import { ANGLE_90_DEG, ANIMATION_DURATION_VERY_SLOW, COUNT_FIVE, COUNT_PAIR, COUNT_TEN, COUNT_TRIPLE, DAYS_PER_MONTH, HOURS_PER_DAY, ONE, PERCENTAGE_FULL, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import { DAYS_PER_WEEK } from "@/constants/time";
import { getDetectionHistory } from '@/lib/locale-storage-history-core';
import type { } from '@/lib/locale-storage-types';
import type { Locale } from '@/types/i18n';
import {
  getLocaleGroupStats,
  getSourceGroupStats,
} from './locale-storage-history-query';

// ==================== 基础统计功能 ====================

/**
 * 获取检测统计信息
 * Get detection statistics
 */
export function getDetectionStats(): {
  totalDetections: number;
  uniqueLocales: number;
  uniqueSources: number;
  averageConfidence: number;
  mostDetectedLocale: { locale: Locale; count: number } | null;
  mostUsedSource: { source: string; count: number } | null;
  detectionFrequency: number; // detections per day
  confidenceDistribution: {
    high: number; // > 0.8
    medium: number; // 0.5 - 0.8
    low: number; // < 0.5
  };
  timeSpan: {
    oldest: number;
    newest: number;
    spanDays: number;
  };
} {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return {
      totalDetections: ZERO,
      uniqueLocales: ZERO,
      uniqueSources: ZERO,
      averageConfidence: ZERO,
      mostDetectedLocale: null,
      mostUsedSource: null,
      detectionFrequency: ZERO,
      confidenceDistribution: { high: ZERO, medium: ZERO, low: ZERO },
      timeSpan: { oldest: ZERO, newest: ZERO, spanDays: ZERO },
    };
  }

  const records = historyResult.data.history;
  const totalDetections = records.length;

  if (totalDetections === ZERO) {
    return {
      totalDetections: ZERO,
      uniqueLocales: ZERO,
      uniqueSources: ZERO,
      averageConfidence: ZERO,
      mostDetectedLocale: null,
      mostUsedSource: null,
      detectionFrequency: ZERO,
      confidenceDistribution: { high: ZERO, medium: ZERO, low: ZERO },
      timeSpan: { oldest: ZERO, newest: ZERO, spanDays: ZERO },
    };
  }

  // 基础统计
  const locales = new Set<Locale>();
  const sources = new Set<string>();
  let totalConfidence = ZERO;
  let highConfidence = ZERO;
  let mediumConfidence = ZERO;
  let lowConfidence = ZERO;

  const localeCounts = new Map<Locale, number>();
  const sourceCounts = new Map<string, number>();

  records.forEach((record) => {
    locales.add(record.locale);
    sources.add(record.source);
    totalConfidence += record.confidence;

    // 置信度分布
    if (record.confidence > MAGIC_0_8) {
      highConfidence += ONE;
    } else if (record.confidence >= MAGIC_0_5) {
      mediumConfidence += ONE;
    } else {
      lowConfidence += ONE;
    }

    // 计数统计
    localeCounts.set(record.locale, (localeCounts.get(record.locale) || ZERO) + ONE);
    sourceCounts.set(record.source, (sourceCounts.get(record.source) || ZERO) + ONE);
  });

  // 最常检测的语言
  let mostDetectedLocale: { locale: Locale; count: number } | null = null;
  for (const [locale, count] of localeCounts.entries()) {
    if (!mostDetectedLocale || count > mostDetectedLocale.count) {
      mostDetectedLocale = { locale, count };
    }
  }

  // 最常用的来源
  let mostUsedSource: { source: string; count: number } | null = null;
  for (const [source, count] of sourceCounts.entries()) {
    if (!mostUsedSource || count > mostUsedSource.count) {
      mostUsedSource = { source, count };
    }
  }

  // 时间跨度
  const timestamps = records.map((r) => r.timestamp);
  const oldest = Math.min(...timestamps);
  const newest = Math.max(...timestamps);
  const spanMs = newest - oldest;
  const spanDays = spanMs / (HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW);

  // 检测频率（每天）
  const detectionFrequency = spanDays > ZERO ? totalDetections / spanDays : ZERO;

  return {
    totalDetections,
    uniqueLocales: locales.size,
    uniqueSources: sources.size,
    averageConfidence: totalConfidence / totalDetections,
    mostDetectedLocale,
    mostUsedSource,
    detectionFrequency,
    confidenceDistribution: {
      high: highConfidence,
      medium: mediumConfidence,
      low: lowConfidence,
    },
    timeSpan: {
      oldest,
      newest,
      spanDays,
    },
  };
}

// ==================== 趋势分析功能 ====================

/**
 * 获取检测趋势
 * Get detection trends
 */
export function getDetectionTrends(days: number = DAYS_PER_WEEK): {
  dailyDetections: Array<{
    date: string;
    count: number;
    avgConfidence: number;
  }>;
  weeklyGrowth: number;
  monthlyGrowth: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  predictions: Array<{ date: string; predictedCount: number }>;
} {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return {
      dailyDetections: [],
      weeklyGrowth: ZERO,
      monthlyGrowth: ZERO,
      trendDirection: 'stable',
      predictions: [],
    };
  }

  const records = historyResult.data.history;
  const now = Date.now();
  const startTime = now - days * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW;

  // 过滤指定时间范围内的记录
  const recentRecords = records.filter(
    (record) => record.timestamp >= startTime,
  );

  // 按天分组
  const dailyData = new Map<
    string,
    { count: number; totalConfidence: number }
  >();

  // 初始化所有日期
  for (let i = ZERO; i < days; i++) {
    const date = new Date(now - i * HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW);
    const dateStr = date.toISOString().split('T')[ZERO] || date.toISOString();
    dailyData.set(dateStr, { count: ZERO, totalConfidence: ZERO });
  }

  // 填充实际数据
  recentRecords.forEach((record) => {
    const date = new Date(record.timestamp);
    const dateStr = date.toISOString().split('T')[ZERO] || date.toISOString();
    const existing = dailyData.get(dateStr);

    if (existing) {
      existing.count += ONE;
      existing.totalConfidence += record.confidence;
    }
  });

  // 转换为数组并排序
  const dailyDetections = Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      count: data.count,
      avgConfidence: data.count > ZERO ? data.totalConfidence / data.count : ZERO,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 计算增长率
  const weeklyGrowth = calculateGrowthRate(dailyDetections, DAYS_PER_WEEK);
  const monthlyGrowth = calculateGrowthRate(dailyDetections, DAYS_PER_MONTH);

  // 确定趋势方向
  const trendDirection = determineTrendDirection(dailyDetections);

  // 生成预测
  const predictions = generatePredictions(dailyDetections, COUNT_TRIPLE);

  return {
    dailyDetections,
    weeklyGrowth,
    monthlyGrowth,
    trendDirection,
    predictions,
  };
}

/**
 * 计算增长率
 * Calculate growth rate
 */
function calculateGrowthRate(
  dailyData: Array<{ date: string; count: number; avgConfidence: number }>,
  period: number,
): number {
  if (dailyData.length < period) return ZERO;

  const recent = dailyData.slice(-period);
  const previous = dailyData.slice(-period * COUNT_PAIR, -period);

  if (previous.length === ZERO) return ZERO;

  const recentAvg =
    recent.reduce((sum, day) => sum + day.count, ZERO) / recent.length;
  const previousAvg =
    previous.reduce((sum, day) => sum + day.count, ZERO) / previous.length;

  return previousAvg > ZERO ? ((recentAvg - previousAvg) / previousAvg) * PERCENTAGE_FULL : ZERO;
}

/**
 * 确定趋势方向
 * Determine trend direction
 */
function determineTrendDirection(
  dailyData: Array<{ date: string; count: number; avgConfidence: number }>,
): 'increasing' | 'decreasing' | 'stable' {
  if (dailyData.length < COUNT_TRIPLE) return 'stable';

  const recent = dailyData.slice(-COUNT_TRIPLE);
  const counts = recent.map((d) => d.count);

  // 简单的线性回归斜率
  const n = counts.length;
  const sumX = (n * (n - ONE)) / COUNT_PAIR;
  const sumY = counts.reduce((sum, count) => sum + count, ZERO);
  const sumXY = counts.reduce((sum, count, index) => sum + index * count, ZERO);
  const sumX2 = (n * (n - ONE) * (COUNT_PAIR * n - ONE)) / MAGIC_6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  if (slope > MAGIC_0_1) return 'increasing';
  if (slope < -MAGIC_0_1) return 'decreasing';
  return 'stable';
}

/**
 * 生成预测
 * Generate predictions
 */
function generatePredictions(
  dailyData: Array<{ date: string; count: number; avgConfidence: number }>,
  futureDays: number,
): Array<{ date: string; predictedCount: number }> {
  if (dailyData.length < COUNT_TRIPLE) return [];

  // 使用最近7天的数据进行预测
  const recent = dailyData.slice(-Math.min(DAYS_PER_WEEK, dailyData.length));
  const avgCount =
    recent.reduce((sum, day) => sum + day.count, ZERO) / recent.length;

  // 简单的趋势预测
  const trend =
    recent.length > ONE
      ? (recent[recent.length - ONE]!.count - recent[ZERO]!.count) /
        (recent.length - ONE)
      : ZERO;

  const predictions: Array<{ date: string; predictedCount: number }> = [];

  for (let i = ONE; i <= futureDays; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr =
      futureDate.toISOString().split('T')[ZERO] || futureDate.toISOString();

    const predictedCount = Math.max(ZERO, Math.round(avgCount + trend * i));

    predictions.push({
      date: dateStr,
      predictedCount,
    });
  }

  return predictions;
}

// ==================== 洞察生成功能 ====================

/**
 * 生成历史洞察
 * Generate history insights
 */
export function generateHistoryInsights(): {
  insights: string[];
  recommendations: string[];
  alerts: string[];
} {
  const stats = getDetectionStats();
  const trends = getDetectionTrends();
  const _localeStats = getLocaleGroupStats();
  const _sourceStats = getSourceGroupStats();
  // 统计数据已获取但在此处未直接使用

  const insights: string[] = [];
  const recommendations: string[] = [];
  const alerts: string[] = [];

  // 基础洞察
  if (stats.totalDetections > ZERO) {
    insights.push(`总共记录了 ${stats.totalDetections} 次语言检测`);
    insights.push(`检测到 ${stats.uniqueLocales} 种不同的语言`);
    insights.push(
      `平均置信度为 ${(stats.averageConfidence * PERCENTAGE_FULL).toFixed(ONE)}%`,
    );
  }

  // 语言偏好洞察
  if (stats.mostDetectedLocale) {
    const percentage = (
      (stats.mostDetectedLocale.count / stats.totalDetections) *
      PERCENTAGE_FULL
    ).toFixed(ONE);
    insights.push(
      `最常检测的语言是 ${stats.mostDetectedLocale.locale} (${percentage}%)`,
    );
  }

  // 来源分析洞察
  if (stats.mostUsedSource) {
    const percentage = (
      (stats.mostUsedSource.count / stats.totalDetections) *
      PERCENTAGE_FULL
    ).toFixed(ONE);
    insights.push(
      `最常用的检测来源是 ${stats.mostUsedSource.source} (${percentage}%)`,
    );
  }

  // 置信度分析
  const { high, medium, low } = stats.confidenceDistribution;
  const highPercentage = ((high / stats.totalDetections) * PERCENTAGE_FULL).toFixed(ONE);
  const lowPercentage = ((low / stats.totalDetections) * PERCENTAGE_FULL).toFixed(ONE);

  if (high > medium + low) {
    insights.push(`检测质量优秀，${highPercentage}% 的检测具有高置信度`);
  } else if (low > high) {
    alerts.push(`检测质量需要改善，${lowPercentage}% 的检测置信度较低`);
    recommendations.push('考虑优化语言检测算法或数据源');
  }

  // 趋势分析
  if (trends.trendDirection === 'increasing') {
    insights.push('语言检测活动呈上升趋势');
  } else if (trends.trendDirection === 'decreasing') {
    insights.push('语言检测活动呈下降趋势');
    recommendations.push('分析用户行为变化，考虑改进用户体验');
  }

  // 频率分析
  if (stats.detectionFrequency > COUNT_TEN) {
    insights.push('用户语言检测活动频繁，表明多语言需求较高');
  } else if (stats.detectionFrequency < ONE) {
    recommendations.push('考虑增加语言检测的触发场景');
  }

  // 多样性分析
  if (stats.uniqueLocales > COUNT_FIVE) {
    insights.push('用户群体语言多样性较高');
    recommendations.push('确保所有检测到的语言都有良好的本地化支持');
  }

  // 数据质量检查
  if (stats.totalDetections > ANIMATION_DURATION_VERY_SLOW) {
    recommendations.push('历史记录较多，建议定期清理过期数据');
  }

  if (stats.timeSpan.spanDays > ANGLE_90_DEG) {
    recommendations.push('数据跨度较长，可以进行长期趋势分析');
  }

  return {
    insights,
    recommendations,
    alerts,
  };
}

/**
 * 获取性能指标
 * Get performance metrics
 */
export function getPerformanceMetrics(): {
  averageConfidence: number;
  confidenceStability: number;
  sourceReliability: Record<string, number>;
  detectionAccuracy: number;
  responseConsistency: number;
} {
  const historyResult = getDetectionHistory();

  if (!historyResult.success || !historyResult.data) {
    return {
      averageConfidence: ZERO,
      confidenceStability: ZERO,
      sourceReliability: {},
      detectionAccuracy: ZERO,
      responseConsistency: ZERO,
    };
  }

  const records = historyResult.data.history;

  if (records.length === ZERO) {
    return {
      averageConfidence: ZERO,
      confidenceStability: ZERO,
      sourceReliability: {},
      detectionAccuracy: ZERO,
      responseConsistency: ZERO,
    };
  }

  // 平均置信度
  const averageConfidence =
    records.reduce((sum, r) => sum + r.confidence, ZERO) / records.length;

  // 置信度稳定性（标准差的倒数）
  const confidenceVariance =
    records.reduce((sum, r) => {
      const diff = r.confidence - averageConfidence;
      return sum + diff * diff;
    }, ZERO) / records.length;
  const confidenceStability = ONE / (ONE + Math.sqrt(confidenceVariance));

  // 来源可靠性
  const sourceStats = getSourceGroupStats();
  const sourceReliability: Record<string, number> = {};
  sourceStats.forEach((stat) => {
    sourceReliability[stat.source] = stat.avgConfidence;
  });

  // 检测准确性（高置信度检测的比例）
  const highConfidenceCount = records.filter((r) => r.confidence > MAGIC_0_8).length;
  const detectionAccuracy = highConfidenceCount / records.length;

  // 响应一致性（相同语言检测结果的一致性）
  const localeConsistency = new Map<Locale, number[]>();
  records.forEach((record) => {
    if (!localeConsistency.has(record.locale)) {
      localeConsistency.set(record.locale, []);
    }
    localeConsistency.get(record.locale)!.push(record.confidence);
  });

  let totalConsistency = ZERO;
  let localeCount = ZERO;

  for (const [_locale, confidences] of localeConsistency.entries()) {
    if (confidences.length > ONE) {
      const avg =
        confidences.reduce((sum, c) => sum + c, ZERO) / confidences.length;
      const variance =
        confidences.reduce((sum, c) => sum + (c - avg) ** COUNT_PAIR, ZERO) /
        confidences.length;
      const consistency = ONE / (ONE + Math.sqrt(variance));
      totalConsistency += consistency;
      localeCount += ONE;
    }
  }

  const responseConsistency =
    localeCount > ZERO ? totalConsistency / localeCount : ONE;

  return {
    averageConfidence,
    confidenceStability,
    sourceReliability,
    detectionAccuracy,
    responseConsistency,
  };
}

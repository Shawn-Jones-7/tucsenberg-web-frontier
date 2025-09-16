/**
 * 语言检测历史统计和分析
 * Locale Detection History Statistics and Analysis
 *
 * 负责历史记录的统计分析、趋势分析和洞察生成
 */

'use client';

import type { Locale } from '@/types/i18n';
import type {} from '@/lib/locale-storage-types';
import { getDetectionHistory } from '@/lib/locale-storage-history-core';
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
      totalDetections: 0,
      uniqueLocales: 0,
      uniqueSources: 0,
      averageConfidence: 0,
      mostDetectedLocale: null,
      mostUsedSource: null,
      detectionFrequency: 0,
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      timeSpan: { oldest: 0, newest: 0, spanDays: 0 },
    };
  }

  const records = historyResult.data.history;
  const totalDetections = records.length;

  if (totalDetections === 0) {
    return {
      totalDetections: 0,
      uniqueLocales: 0,
      uniqueSources: 0,
      averageConfidence: 0,
      mostDetectedLocale: null,
      mostUsedSource: null,
      detectionFrequency: 0,
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      timeSpan: { oldest: 0, newest: 0, spanDays: 0 },
    };
  }

  // 基础统计
  const locales = new Set<Locale>();
  const sources = new Set<string>();
  let totalConfidence = 0;
  let highConfidence = 0;
  let mediumConfidence = 0;
  let lowConfidence = 0;

  const localeCounts = new Map<Locale, number>();
  const sourceCounts = new Map<string, number>();

  records.forEach((record) => {
    locales.add(record.locale);
    sources.add(record.source);
    totalConfidence += record.confidence;

    // 置信度分布
    if (record.confidence > 0.8) {
      highConfidence += 1;
    } else if (record.confidence >= 0.5) {
      mediumConfidence += 1;
    } else {
      lowConfidence += 1;
    }

    // 计数统计
    localeCounts.set(record.locale, (localeCounts.get(record.locale) || 0) + 1);
    sourceCounts.set(record.source, (sourceCounts.get(record.source) || 0) + 1);
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
  const spanDays = spanMs / (24 * 60 * 60 * 1000);

  // 检测频率（每天）
  const detectionFrequency = spanDays > 0 ? totalDetections / spanDays : 0;

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
export function getDetectionTrends(days: number = 7): {
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
      weeklyGrowth: 0,
      monthlyGrowth: 0,
      trendDirection: 'stable',
      predictions: [],
    };
  }

  const records = historyResult.data.history;
  const now = Date.now();
  const startTime = now - days * 24 * 60 * 60 * 1000;

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
  for (let i = 0; i < days; i++) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0] || date.toISOString();
    dailyData.set(dateStr, { count: 0, totalConfidence: 0 });
  }

  // 填充实际数据
  recentRecords.forEach((record) => {
    const date = new Date(record.timestamp);
    const dateStr = date.toISOString().split('T')[0] || date.toISOString();
    const existing = dailyData.get(dateStr);

    if (existing) {
      existing.count += 1;
      existing.totalConfidence += record.confidence;
    }
  });

  // 转换为数组并排序
  const dailyDetections = Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      count: data.count,
      avgConfidence: data.count > 0 ? data.totalConfidence / data.count : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 计算增长率
  const weeklyGrowth = calculateGrowthRate(dailyDetections, 7);
  const monthlyGrowth = calculateGrowthRate(dailyDetections, 30);

  // 确定趋势方向
  const trendDirection = determineTrendDirection(dailyDetections);

  // 生成预测
  const predictions = generatePredictions(dailyDetections, 3);

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
  if (dailyData.length < period) return 0;

  const recent = dailyData.slice(-period);
  const previous = dailyData.slice(-period * 2, -period);

  if (previous.length === 0) return 0;

  const recentAvg =
    recent.reduce((sum, day) => sum + day.count, 0) / recent.length;
  const previousAvg =
    previous.reduce((sum, day) => sum + day.count, 0) / previous.length;

  return previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
}

/**
 * 确定趋势方向
 * Determine trend direction
 */
function determineTrendDirection(
  dailyData: Array<{ date: string; count: number; avgConfidence: number }>,
): 'increasing' | 'decreasing' | 'stable' {
  if (dailyData.length < 3) return 'stable';

  const recent = dailyData.slice(-3);
  const counts = recent.map((d) => d.count);

  // 简单的线性回归斜率
  const n = counts.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = counts.reduce((sum, count) => sum + count, 0);
  const sumXY = counts.reduce((sum, count, index) => sum + index * count, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  if (slope > 0.1) return 'increasing';
  if (slope < -0.1) return 'decreasing';
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
  if (dailyData.length < 3) return [];

  // 使用最近7天的数据进行预测
  const recent = dailyData.slice(-Math.min(7, dailyData.length));
  const avgCount =
    recent.reduce((sum, day) => sum + day.count, 0) / recent.length;

  // 简单的趋势预测
  const trend =
    recent.length > 1
      ? (recent[recent.length - 1]!.count - recent[0]!.count) /
        (recent.length - 1)
      : 0;

  const predictions: Array<{ date: string; predictedCount: number }> = [];

  for (let i = 1; i <= futureDays; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr =
      futureDate.toISOString().split('T')[0] || futureDate.toISOString();

    const predictedCount = Math.max(0, Math.round(avgCount + trend * i));

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
  if (stats.totalDetections > 0) {
    insights.push(`总共记录了 ${stats.totalDetections} 次语言检测`);
    insights.push(`检测到 ${stats.uniqueLocales} 种不同的语言`);
    insights.push(
      `平均置信度为 ${(stats.averageConfidence * 100).toFixed(1)}%`,
    );
  }

  // 语言偏好洞察
  if (stats.mostDetectedLocale) {
    const percentage = (
      (stats.mostDetectedLocale.count / stats.totalDetections) *
      100
    ).toFixed(1);
    insights.push(
      `最常检测的语言是 ${stats.mostDetectedLocale.locale} (${percentage}%)`,
    );
  }

  // 来源分析洞察
  if (stats.mostUsedSource) {
    const percentage = (
      (stats.mostUsedSource.count / stats.totalDetections) *
      100
    ).toFixed(1);
    insights.push(
      `最常用的检测来源是 ${stats.mostUsedSource.source} (${percentage}%)`,
    );
  }

  // 置信度分析
  const { high, medium, low } = stats.confidenceDistribution;
  const highPercentage = ((high / stats.totalDetections) * 100).toFixed(1);
  const lowPercentage = ((low / stats.totalDetections) * 100).toFixed(1);

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
  if (stats.detectionFrequency > 10) {
    insights.push('用户语言检测活动频繁，表明多语言需求较高');
  } else if (stats.detectionFrequency < 1) {
    recommendations.push('考虑增加语言检测的触发场景');
  }

  // 多样性分析
  if (stats.uniqueLocales > 5) {
    insights.push('用户群体语言多样性较高');
    recommendations.push('确保所有检测到的语言都有良好的本地化支持');
  }

  // 数据质量检查
  if (stats.totalDetections > 1000) {
    recommendations.push('历史记录较多，建议定期清理过期数据');
  }

  if (stats.timeSpan.spanDays > 90) {
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
      averageConfidence: 0,
      confidenceStability: 0,
      sourceReliability: {},
      detectionAccuracy: 0,
      responseConsistency: 0,
    };
  }

  const records = historyResult.data.history;

  if (records.length === 0) {
    return {
      averageConfidence: 0,
      confidenceStability: 0,
      sourceReliability: {},
      detectionAccuracy: 0,
      responseConsistency: 0,
    };
  }

  // 平均置信度
  const averageConfidence =
    records.reduce((sum, r) => sum + r.confidence, 0) / records.length;

  // 置信度稳定性（标准差的倒数）
  const confidenceVariance =
    records.reduce((sum, r) => {
      const diff = r.confidence - averageConfidence;
      return sum + diff * diff;
    }, 0) / records.length;
  const confidenceStability = 1 / (1 + Math.sqrt(confidenceVariance));

  // 来源可靠性
  const sourceStats = getSourceGroupStats();
  const sourceReliability: Record<string, number> = {};
  sourceStats.forEach((stat) => {
    sourceReliability[stat.source] = stat.avgConfidence;
  });

  // 检测准确性（高置信度检测的比例）
  const highConfidenceCount = records.filter((r) => r.confidence > 0.8).length;
  const detectionAccuracy = highConfidenceCount / records.length;

  // 响应一致性（相同语言检测结果的一致性）
  const localeConsistency = new Map<Locale, number[]>();
  records.forEach((record) => {
    if (!localeConsistency.has(record.locale)) {
      localeConsistency.set(record.locale, []);
    }
    localeConsistency.get(record.locale)!.push(record.confidence);
  });

  let totalConsistency = 0;
  let localeCount = 0;

  for (const [_locale, confidences] of localeConsistency.entries()) {
    if (confidences.length > 1) {
      const avg =
        confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
      const variance =
        confidences.reduce((sum, c) => sum + (c - avg) ** 2, 0) /
        confidences.length;
      const consistency = 1 / (1 + Math.sqrt(variance));
      totalConsistency += consistency;
      localeCount += 1;
    }
  }

  const responseConsistency =
    localeCount > 0 ? totalConsistency / localeCount : 1;

  return {
    averageConfidence,
    confidenceStability,
    sourceReliability,
    detectionAccuracy,
    responseConsistency,
  };
}

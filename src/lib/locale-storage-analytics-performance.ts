/**
 * 语言存储分析性能和趋势分析
 * Locale Storage Analytics Performance and Trends
 *
 * 负责性能指标分析、使用模式识别和趋势分析
 */

'use client';

import { calculateStorageStats } from '@/lib/locale-storage-analytics-core';
import {
  AccessLogger,
  ErrorLogger,
  type AccessLogEntry,
} from '@/lib/locale-storage-analytics-events';
import type { StorageStats } from '@/lib/locale-storage-types';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  COUNT_TRIPLE,
  DAYS_PER_MONTH,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import {
  COUNT_23,
  MAGIC_6,
  MAGIC_9,
  MAGIC_12,
  MAGIC_17,
  MAGIC_18,
  MAGIC_95,
  MAGIC_99,
} from '@/constants/count';
import {
  DEC_0_75,
  MAGIC_0_2,
  MAGIC_0_3,
  MAGIC_0_7,
  MAGIC_0_8,
  MAGIC_0_25,
} from '@/constants/decimal';
import { DAYS_PER_WEEK } from '@/constants/time';

// ==================== 使用模式分析 ====================

/**
 * 使用模式分析结果
 * Usage pattern analysis result
 */
export interface UsagePatterns {
  mostAccessedKeys: Array<{ key: string; count: number }>;
  leastAccessedKeys: Array<{ key: string; count: number }>;
  peakUsageHours: Array<{ hour: number; count: number }>;
  operationDistribution: Record<string, number>;
  averageSessionDuration: number;
  userBehaviorInsights: string[];
}

/**
 * 获取使用模式
 * Get usage patterns
 */
export function getUsagePatterns(): UsagePatterns {
  const accessLog = AccessLogger.getAccessLog();
  const accessStats = AccessLogger.getAccessStats();

  // 分析最常访问的键
  const keyEntries = Object.entries(accessStats.keyCounts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

  const mostAccessedKeys = keyEntries.slice(ZERO, COUNT_FIVE);
  const leastAccessedKeys = keyEntries.slice(-COUNT_FIVE).reverse();

  // 分析峰值使用时间（Map 避免对象注入）
  const hourlyUsage = new Map<number, number>();
  for (const entry of accessLog) {
    const hour = new Date(entry.timestamp).getHours();
    if (hour >= ZERO && hour < 24) {
      hourlyUsage.set(hour, (hourlyUsage.get(hour) ?? ZERO) + ONE);
    }
  }

  const peakUsageHours = Array.from(hourlyUsage.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(ZERO, COUNT_FIVE);

  // 计算平均会话持续时间
  const averageSessionDuration = calculateAverageSessionDuration(accessLog);

  // 生成用户行为洞察
  const userBehaviorInsights = generateBehaviorInsights(
    accessStats,
    peakUsageHours,
    averageSessionDuration,
  );

  return {
    mostAccessedKeys,
    leastAccessedKeys,
    peakUsageHours,
    operationDistribution: { ...accessStats.operationCounts } as Record<
      string,
      number
    >,
    averageSessionDuration,
    userBehaviorInsights,
  };
}

/**
 * 计算平均会话持续时间
 * Calculate average session duration
 */
function calculateAverageSessionDuration(accessLog: AccessLogEntry[]): number {
  if (accessLog.length < COUNT_PAIR) return ZERO;

  const sessions: number[] = [];
  let sessionStart = accessLog.at(-ONE)?.timestamp ?? Date.now();
  let lastActivity = sessionStart;

  // 会话间隔阈值：30分钟
  const sessionGap =
    DAYS_PER_MONTH * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW;

  for (const entry of accessLog.slice(0, -ONE).reverse()) {
    const currentTime = entry?.timestamp ?? Date.now();

    if (currentTime - lastActivity > sessionGap) {
      // 新会话开始
      sessions.push(lastActivity - sessionStart);
      sessionStart = currentTime;
    }

    lastActivity = currentTime;
  }

  // 添加最后一个会话
  sessions.push(lastActivity - sessionStart);

  return sessions.length > ZERO
    ? sessions.reduce((sum, duration) => sum + duration, ZERO) / sessions.length
    : ZERO;
}

/**
 * 生成行为洞察
 * Generate behavior insights
 */
function generateBehaviorInsights(
  accessStats: ReturnType<typeof AccessLogger.getAccessStats>,
  peakUsageHours: Array<{ hour: number; count: number }>,
  averageSessionDuration: number,
): string[] {
  const insights: string[] = [];

  function analyzeSuccessRate() {
    if (accessStats.successRate < MAGIC_95) {
      insights.push(
        `存储操作成功率较低 (${accessStats.successRate.toFixed(ONE)}%)，建议检查存储配置`,
      );
    } else if (accessStats.successRate > MAGIC_99) {
      insights.push('存储操作成功率优秀，系统运行稳定');
    }
  }

  function analyzeResponseTime() {
    if (accessStats.averageResponseTime > PERCENTAGE_FULL) {
      insights.push(
        `平均响应时间较慢 (${accessStats.averageResponseTime.toFixed(ONE)}ms)，可能需要优化`,
      );
    } else if (accessStats.averageResponseTime < COUNT_TEN) {
      insights.push('响应时间优秀，存储性能良好');
    }
  }

  function analyzeUsageTimePattern() {
    if (peakUsageHours.length > ZERO) {
      const peakHour = peakUsageHours.at(ZERO)?.hour ?? MAGIC_12;
      if (peakHour >= MAGIC_9 && peakHour <= MAGIC_17) {
        insights.push('主要在工作时间使用，符合办公场景');
      } else if (peakHour >= MAGIC_18 && peakHour <= COUNT_23) {
        insights.push('主要在晚间使用，可能为个人用户');
      }
    }
  }

  function analyzeSessionDuration() {
    const sessionMinutes =
      averageSessionDuration /
      (SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW);
    if (sessionMinutes > SECONDS_PER_MINUTE) {
      insights.push('用户会话时间较长，表明深度使用');
    } else if (sessionMinutes < COUNT_FIVE) {
      insights.push('用户会话时间较短，可能为快速访问');
    }
  }

  function analyzeOperationDistribution() {
    const entries = Object.entries(accessStats.operationCounts);
    const totalOps = entries.reduce((sum, [, count]) => sum + count, ZERO);
    for (const [operation, count] of entries) {
      const percentage = (count / (totalOps || ONE)) * PERCENTAGE_FULL;
      if (percentage > PERCENTAGE_HALF) {
        insights.push(
          `${operation}操作占主导地位 (${percentage.toFixed(ONE)}%)`,
        );
      }
    }
  }

  analyzeSuccessRate();
  analyzeResponseTime();
  analyzeUsageTimePattern();
  analyzeSessionDuration();
  analyzeOperationDistribution();

  return insights;
}

// ==================== 性能指标分析 ====================

/**
 * 性能指标
 * Performance metrics
 */
export interface PerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  efficiency: number;
  recommendations: string[];
}

/**
 * 获取性能指标
 * Get performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  const accessStats = AccessLogger.getAccessStats();
  const errorStats = ErrorLogger.getErrorStats();
  const stats = calculateStorageStats();

  // 计算吞吐量 (操作数/小时)
  const oneHourAgo =
    Date.now() -
    SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW;
  const recentOperations = AccessLogger.getAccessLog().filter(
    (entry) => entry.timestamp > oneHourAgo,
  ).length;
  const throughput = recentOperations; // 每小时操作数

  // 计算效率分数
  const efficiency = calculateEfficiencyScore(accessStats, errorStats, stats);

  // 生成性能建议
  const recommendations = generatePerformanceRecommendations({
    errorRate: errorStats.errorRate,
    responseTime: accessStats.averageResponseTime,
    successRate: accessStats.successRate,
    efficiency,
  });

  return {
    averageResponseTime: accessStats.averageResponseTime,
    successRate: accessStats.successRate,
    errorRate: errorStats.errorRate,
    throughput,
    efficiency,
    recommendations,
  };
}

/**
 * 计算效率分数
 * Calculate efficiency score
 */
function calculateEfficiencyScore(
  accessStats: ReturnType<typeof AccessLogger.getAccessStats>,
  errorStats: ReturnType<typeof ErrorLogger.getErrorStats>,
  storageStats: StorageStats,
): number {
  let score = ONE;

  // 成功率权重 30%
  score *= MAGIC_0_7 + MAGIC_0_3 * (accessStats.successRate / PERCENTAGE_FULL);

  // 响应时间权重 25%
  const responseTimeScore = Math.max(
    ZERO,
    ONE - accessStats.averageResponseTime / 1000,
  );
  score *= DEC_0_75 + MAGIC_0_25 * responseTimeScore;

  // 错误率权重 25%
  const errorRateScore = Math.max(
    ZERO,
    ONE - errorStats.errorRate / PERCENTAGE_FULL,
  );
  score *= DEC_0_75 + MAGIC_0_25 * errorRateScore;

  // 数据新鲜度权重 20%
  score *= MAGIC_0_8 + MAGIC_0_2 * storageStats.freshness;

  return Math.max(ZERO, Math.min(ONE, score));
}

/**
 * 生成性能建议
 * Generate performance recommendations
 */
function generatePerformanceRecommendations(metrics: {
  errorRate: number;
  responseTime: number;
  successRate: number;
  efficiency: number;
}): string[] {
  const recommendations: string[] = [];

  if (metrics.errorRate > COUNT_FIVE) {
    recommendations.push('错误率过高，建议检查存储操作逻辑');
  }

  if (metrics.responseTime > PERCENTAGE_FULL) {
    recommendations.push('响应时间较慢，考虑优化存储访问方式');
  }

  if (metrics.successRate < MAGIC_95) {
    recommendations.push('成功率偏低，建议增加错误处理和重试机制');
  }

  if (metrics.efficiency < MAGIC_0_7) {
    recommendations.push('整体效率偏低，建议全面优化存储策略');
  }

  if (recommendations.length === ZERO) {
    recommendations.push('性能表现良好，建议继续监控');
  }

  return recommendations;
}

// ==================== 趋势分析 ====================

/**
 * 使用趋势
 * Usage trends
 */
export interface UsageTrends {
  dailyOperations: Array<{ date: string; operations: number }>;
  weeklyGrowth: number;
  monthlyGrowth: number;
  seasonalPatterns: Array<{ period: string; avgOperations: number }>;
  predictions: Array<{ date: string; predictedOperations: number }>;
}

/**
 * 获取使用趋势
 * Get usage trends
 */
export function getUsageTrends(days: number = DAYS_PER_WEEK): UsageTrends {
  const accessLog = AccessLogger.getAccessLog();

  // 计算每日操作数
  const dailyOperations = calculateDailyOperations(accessLog, days);

  // 计算增长率
  const weeklyGrowth = calculateGrowthRate(dailyOperations, DAYS_PER_WEEK);
  const monthlyGrowth = calculateGrowthRate(dailyOperations, DAYS_PER_MONTH);

  // 分析季节性模式
  const seasonalPatterns = analyzeSeasonalPatterns(accessLog);

  // 生成预测
  const predictions = generatePredictions(dailyOperations, COUNT_TRIPLE);

  return {
    dailyOperations,
    weeklyGrowth,
    monthlyGrowth,
    seasonalPatterns,
    predictions,
  };
}

/**
 * 计算每日操作数
 * Calculate daily operations
 */
function calculateDailyOperations(
  accessLog: AccessLogEntry[],
  days: number,
): Array<{ date: string; operations: number }> {
  const dailyOps = new Map<string, number>();
  const now = new Date();

  // 初始化日期
  for (let i = days - ONE; i >= ZERO; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr =
      date.toISOString().split('T').at(ZERO) || date.toISOString();
    dailyOps.set(dateStr, ZERO);
  }

  // 统计操作数
  for (const entry of accessLog) {
    const date = new Date(entry.timestamp);
    const dateStr =
      date.toISOString().split('T').at(ZERO) || date.toISOString();
    if (dailyOps.has(dateStr)) {
      dailyOps.set(dateStr, (dailyOps.get(dateStr) ?? ZERO) + ONE);
    }
  }

  return Array.from(dailyOps.entries()).map(([date, operations]) => ({
    date,
    operations,
  }));
}

/**
 * 计算增长率
 * Calculate growth rate
 */
function calculateGrowthRate(
  dailyOperations: Array<{ date: string; operations: number }>,
  period: number,
): number {
  if (dailyOperations.length < period) return ZERO;

  const recent = dailyOperations.slice(-period);
  const previous = dailyOperations.slice(-period * COUNT_PAIR, -period);

  if (previous.length === ZERO) return ZERO;

  const recentAvg =
    recent.reduce((sum, day) => sum + day.operations, ZERO) / recent.length;
  const previousAvg =
    previous.reduce((sum, day) => sum + day.operations, ZERO) / previous.length;

  return previousAvg > ZERO
    ? ((recentAvg - previousAvg) / previousAvg) * PERCENTAGE_FULL
    : ZERO;
}

/**
 * 分析季节性模式
 * Analyze seasonal patterns
 */
function analyzeSeasonalPatterns(
  accessLog: AccessLogEntry[],
): Array<{ period: string; avgOperations: number }> {
  const patterns: Record<string, number[]> = {
    工作日: [],
    周末: [],
    上午: [],
    下午: [],
    晚上: [],
  };

  for (const entry of accessLog) {
    const date = new Date(entry.timestamp);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    // 工作日 vs 周末
    if (dayOfWeek >= ONE && dayOfWeek <= COUNT_FIVE) {
      patterns['工作日']?.push(ONE);
    } else {
      patterns['周末']?.push(ONE);
    }

    // 时间段
    if (hour >= MAGIC_6 && hour < MAGIC_12) {
      patterns['上午']!.push(ONE);
    } else if (hour >= MAGIC_12 && hour < MAGIC_18) {
      patterns['下午']!.push(ONE);
    } else {
      patterns['晚上']!.push(ONE);
    }
  }

  return Object.entries(patterns).map(([period, operations]) => ({
    period,
    avgOperations: operations.length,
  }));
}

/**
 * 生成预测
 * Generate predictions
 */
function generatePredictions(
  dailyOperations: Array<{ date: string; operations: number }>,
  futureDays: number,
): Array<{ date: string; predictedOperations: number }> {
  if (dailyOperations.length < COUNT_TRIPLE) {
    return [];
  }

  // 简单线性趋势预测
  const recent = dailyOperations.slice(-DAYS_PER_WEEK); // 使用最近7天数据
  const avgOperations =
    recent.reduce((sum, day) => sum + day.operations, ZERO) / recent.length;

  // 计算趋势斜率
  const trend =
    recent.length > ONE
      ? ((recent.at(-ONE)?.operations ?? ZERO) -
          (recent.at(ZERO)?.operations ?? ZERO)) /
        (recent.length - ONE)
      : ZERO;

  const predictions: Array<{ date: string; predictedOperations: number }> = [];

  for (let i = ONE; i <= futureDays; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr =
      futureDate.toISOString().split('T').at(ZERO) || futureDate.toISOString();

    const predictedOperations = Math.max(
      ZERO,
      Math.round(avgOperations + trend * i),
    );

    predictions.push({
      date: dateStr,
      predictedOperations,
    });
  }

  return predictions;
}

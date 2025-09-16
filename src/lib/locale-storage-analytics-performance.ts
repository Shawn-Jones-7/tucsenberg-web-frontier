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
} from './locale-storage-analytics-events';
import type { StorageStats } from '@/lib/locale-storage-types';

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

  const mostAccessedKeys = keyEntries.slice(0, 5);
  const leastAccessedKeys = keyEntries.slice(-5).reverse();

  // 分析峰值使用时间
  const hourlyUsage: Record<number, number> = {};
  for (const entry of accessLog) {
    const hour = new Date(entry.timestamp).getHours();
    hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
  }

  const peakUsageHours = Object.entries(hourlyUsage)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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
    operationDistribution: accessStats.operationCounts,
    averageSessionDuration,
    userBehaviorInsights,
  };
}

/**
 * 计算平均会话持续时间
 * Calculate average session duration
 */
function calculateAverageSessionDuration(accessLog: AccessLogEntry[]): number {
  if (accessLog.length < 2) return 0;

  const sessions: number[] = [];
  let sessionStart = accessLog[accessLog.length - 1]?.timestamp ?? Date.now();
  let lastActivity = sessionStart;

  // 会话间隔阈值：30分钟
  const sessionGap = 30 * 60 * 1000;

  for (let i = accessLog.length - 2; i >= 0; i--) {
    const currentTime = accessLog[i]?.timestamp ?? Date.now();

    if (currentTime - lastActivity > sessionGap) {
      // 新会话开始
      sessions.push(lastActivity - sessionStart);
      sessionStart = currentTime;
    }

    lastActivity = currentTime;
  }

  // 添加最后一个会话
  sessions.push(lastActivity - sessionStart);

  return sessions.length > 0
    ? sessions.reduce((sum, duration) => sum + duration, 0) / sessions.length
    : 0;
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

  // 成功率分析
  if (accessStats.successRate < 95) {
    insights.push(
      `存储操作成功率较低 (${accessStats.successRate.toFixed(1)}%)，建议检查存储配置`,
    );
  } else if (accessStats.successRate > 99) {
    insights.push('存储操作成功率优秀，系统运行稳定');
  }

  // 响应时间分析
  if (accessStats.averageResponseTime > 100) {
    insights.push(
      `平均响应时间较慢 (${accessStats.averageResponseTime.toFixed(1)}ms)，可能需要优化`,
    );
  } else if (accessStats.averageResponseTime < 10) {
    insights.push('响应时间优秀，存储性能良好');
  }

  // 使用时间模式分析
  if (peakUsageHours.length > 0) {
    const peakHour = peakUsageHours[0]?.hour ?? 12;
    if (peakHour >= 9 && peakHour <= 17) {
      insights.push('主要在工作时间使用，符合办公场景');
    } else if (peakHour >= 18 && peakHour <= 23) {
      insights.push('主要在晚间使用，可能为个人用户');
    }
  }

  // 会话持续时间分析
  const sessionMinutes = averageSessionDuration / (60 * 1000);
  if (sessionMinutes > 60) {
    insights.push('用户会话时间较长，表明深度使用');
  } else if (sessionMinutes < 5) {
    insights.push('用户会话时间较短，可能为快速访问');
  }

  // 操作类型分析
  const operations = Object.entries(accessStats.operationCounts);
  const totalOps = operations.reduce((sum, [, count]) => sum + count, 0);

  for (const [operation, count] of operations) {
    const percentage = (count / totalOps) * 100;
    if (percentage > 50) {
      insights.push(`${operation}操作占主导地位 (${percentage.toFixed(1)}%)`);
    }
  }

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
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
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
  let score = 1.0;

  // 成功率权重 30%
  score *= 0.7 + 0.3 * (accessStats.successRate / 100);

  // 响应时间权重 25%
  const responseTimeScore = Math.max(
    0,
    1 - accessStats.averageResponseTime / 1000,
  );
  score *= 0.75 + 0.25 * responseTimeScore;

  // 错误率权重 25%
  const errorRateScore = Math.max(0, 1 - errorStats.errorRate / 100);
  score *= 0.75 + 0.25 * errorRateScore;

  // 数据新鲜度权重 20%
  score *= 0.8 + 0.2 * storageStats.freshness;

  return Math.max(0, Math.min(1, score));
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

  if (metrics.errorRate > 5) {
    recommendations.push('错误率过高，建议检查存储操作逻辑');
  }

  if (metrics.responseTime > 100) {
    recommendations.push('响应时间较慢，考虑优化存储访问方式');
  }

  if (metrics.successRate < 95) {
    recommendations.push('成功率偏低，建议增加错误处理和重试机制');
  }

  if (metrics.efficiency < 0.7) {
    recommendations.push('整体效率偏低，建议全面优化存储策略');
  }

  if (recommendations.length === 0) {
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
export function getUsageTrends(days: number = 7): UsageTrends {
  const accessLog = AccessLogger.getAccessLog();

  // 计算每日操作数
  const dailyOperations = calculateDailyOperations(accessLog, days);

  // 计算增长率
  const weeklyGrowth = calculateGrowthRate(dailyOperations, 7);
  const monthlyGrowth = calculateGrowthRate(dailyOperations, 30);

  // 分析季节性模式
  const seasonalPatterns = analyzeSeasonalPatterns(accessLog);

  // 生成预测
  const predictions = generatePredictions(dailyOperations, 3);

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
  const dailyOps: Record<string, number> = {};
  const now = new Date();

  // 初始化日期
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0] || date.toISOString();
    dailyOps[dateStr] = 0;
  }

  // 统计操作数
  for (const entry of accessLog) {
    const date = new Date(entry.timestamp);
    const dateStr = date.toISOString().split('T')[0] || date.toISOString();
    if (Object.prototype.hasOwnProperty.call(dailyOps, dateStr)) {
      dailyOps[dateStr] = (dailyOps[dateStr] || 0) + 1;
    }
  }

  return Object.entries(dailyOps).map(([date, operations]) => ({
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
  if (dailyOperations.length < period) return 0;

  const recent = dailyOperations.slice(-period);
  const previous = dailyOperations.slice(-period * 2, -period);

  if (previous.length === 0) return 0;

  const recentAvg =
    recent.reduce((sum, day) => sum + day.operations, 0) / recent.length;
  const previousAvg =
    previous.reduce((sum, day) => sum + day.operations, 0) / previous.length;

  return previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
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
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      patterns['工作日']?.push(1);
    } else {
      patterns['周末']?.push(1);
    }

    // 时间段
    if (hour >= 6 && hour < 12) {
      patterns['上午']!.push(1);
    } else if (hour >= 12 && hour < 18) {
      patterns['下午']!.push(1);
    } else {
      patterns['晚上']!.push(1);
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
  if (dailyOperations.length < 3) {
    return [];
  }

  // 简单线性趋势预测
  const recent = dailyOperations.slice(-7); // 使用最近7天数据
  const avgOperations =
    recent.reduce((sum, day) => sum + day.operations, 0) / recent.length;

  // 计算趋势斜率
  const trend =
    recent.length > 1
      ? (recent[recent.length - 1]!.operations - recent[0]!.operations) /
        (recent.length - 1)
      : 0;

  const predictions: Array<{ date: string; predictedOperations: number }> = [];

  for (let i = 1; i <= futureDays; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr =
      futureDate.toISOString().split('T')[0] || futureDate.toISOString();

    const predictedOperations = Math.max(
      0,
      Math.round(avgOperations + trend * i),
    );

    predictions.push({
      date: dateStr,
      predictedOperations,
    });
  }

  return predictions;
}

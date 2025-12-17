/**
 * 语言检测历史趋势分析
 * Locale Detection History Trend Analysis
 *
 * 负责趋势计算、增长率分析和预测生成功能
 * 从 locale-storage-history-stats.ts 提取以保持单文件 ≤500 行
 */

'use client';

import { getDetectionHistory } from '@/lib/locale-storage-history-core';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_PAIR,
  COUNT_TRIPLE,
  DAYS_PER_MONTH,
  HOURS_PER_DAY,
  ONE,
  PERCENTAGE_FULL,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import { MAGIC_6 } from '@/constants/count';
import { MAGIC_0_1 } from '@/constants/decimal';
import { DAYS_PER_WEEK } from '@/constants/time';

// ==================== 趋势方向类型 ====================

export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

// ==================== 每日检测数据接口 ====================

export interface DailyDetection {
  date: string;
  count: number;
  avgConfidence: number;
}

// ==================== 预测数据接口 ====================

export interface Prediction {
  date: string;
  predictedCount: number;
}

// ==================== 趋势结果接口 ====================

export interface DetectionTrends {
  dailyDetections: DailyDetection[];
  weeklyGrowth: number;
  monthlyGrowth: number;
  trendDirection: TrendDirection;
  predictions: Prediction[];
}

// ==================== 增长率计算 ====================

/**
 * 计算增长率
 */
export function calculateGrowthRate(
  dailyData: DailyDetection[],
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

  return previousAvg > ZERO
    ? ((recentAvg - previousAvg) / previousAvg) * PERCENTAGE_FULL
    : ZERO;
}

// ==================== 趋势方向确定 ====================

/**
 * 确定趋势方向
 */
export function determineTrendDirection(
  dailyData: DailyDetection[],
): TrendDirection {
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

// ==================== 预测生成 ====================

/**
 * 生成预测
 */
export function generatePredictions(
  dailyData: DailyDetection[],
  futureDays: number,
): Prediction[] {
  if (dailyData.length < COUNT_TRIPLE) return [];

  // 使用最近7天的数据进行预测
  const recent = dailyData.slice(-Math.min(DAYS_PER_WEEK, dailyData.length));
  const avgCount =
    recent.reduce((sum, day) => sum + day.count, ZERO) / recent.length;

  // 简单的趋势预测
  const trend =
    recent.length > ONE
      ? ((recent.at(-ONE)?.count ?? ZERO) - (recent.at(ZERO)?.count ?? ZERO)) /
        (recent.length - ONE)
      : ZERO;

  const predictions: Prediction[] = [];

  for (let i = ONE; i <= futureDays; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const dateStr =
      futureDate.toISOString().split('T').at(ZERO) || futureDate.toISOString();

    const predictedCount = Math.max(ZERO, Math.round(avgCount + trend * i));

    predictions.push({
      date: dateStr,
      predictedCount,
    });
  }

  return predictions;
}

// ==================== 每日数据聚合 ====================

/**
 * 聚合每日检测数据
 */
function aggregateDailyData(
  records: Array<{ timestamp: number; confidence: number }>,
  now: number,
  days: number,
): Map<string, { count: number; totalConfidence: number }> {
  const dailyData = new Map<
    string,
    { count: number; totalConfidence: number }
  >();

  // 初始化所有日期
  for (let i = ZERO; i < days; i++) {
    const date = new Date(
      now -
        i *
          HOURS_PER_DAY *
          SECONDS_PER_MINUTE *
          SECONDS_PER_MINUTE *
          ANIMATION_DURATION_VERY_SLOW,
    );
    const dateStr =
      date.toISOString().split('T').at(ZERO) || date.toISOString();
    dailyData.set(dateStr, { count: ZERO, totalConfidence: ZERO });
  }

  // 填充实际数据
  for (const record of records) {
    const date = new Date(record.timestamp);
    const dateStr =
      date.toISOString().split('T').at(ZERO) || date.toISOString();
    const existing = dailyData.get(dateStr);

    if (existing) {
      existing.count += ONE;
      existing.totalConfidence += record.confidence;
    }
  }

  return dailyData;
}

/**
 * 转换为每日检测数组
 */
function convertToDailyDetections(
  dailyData: Map<string, { count: number; totalConfidence: number }>,
): DailyDetection[] {
  return Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      count: data.count,
      avgConfidence:
        data.count > ZERO ? data.totalConfidence / data.count : ZERO,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ==================== 主函数 ====================

/**
 * 获取检测趋势
 */
export function getDetectionTrends(
  days: number = DAYS_PER_WEEK,
): DetectionTrends {
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
  const startTime =
    now -
    days *
      HOURS_PER_DAY *
      SECONDS_PER_MINUTE *
      SECONDS_PER_MINUTE *
      ANIMATION_DURATION_VERY_SLOW;

  // 过滤指定时间范围内的记录
  const recentRecords = records.filter(
    (record) => record.timestamp >= startTime,
  );

  // 聚合每日数据
  const dailyData = aggregateDailyData(recentRecords, now, days);
  const dailyDetections = convertToDailyDetections(dailyData);

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

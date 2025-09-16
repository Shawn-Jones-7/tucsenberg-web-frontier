/**
 * Web Vitals 诊断计算器
 * Web Vitals diagnostics calculator functions
 */

import type { DetailedWebVitals } from '@/lib/enhanced-web-vitals';
import { COUNT_PAIR, MAGIC_0_95, MAGIC_90, MAGIC_80, MAGIC_70, SECONDS_PER_MINUTE } from '@/constants/magic-numbers';

import {
  WEB_VITALS_CONSTANTS,
  type DiagnosticReport,
  type PerformanceTrend,
} from './web-vitals-diagnostics-constants';

/**
 * 计算性能趋势
 */
export const calculatePerformanceTrends = (
  historicalReports: DiagnosticReport[],
): PerformanceTrend[] | null => {
  if (historicalReports.length < WEB_VITALS_CONSTANTS.SCORE_DIVISOR)
    return null;

  const recentReports = historicalReports.slice(
    -WEB_VITALS_CONSTANTS.TREND_THRESHOLD,
  );
  const previousReports = historicalReports.slice(
    -WEB_VITALS_CONSTANTS.SCORE_MULTIPLIER_10,
    -WEB_VITALS_CONSTANTS.TREND_THRESHOLD,
  );

  if (previousReports.length === 0) return null;

  const metrics: (keyof DetailedWebVitals)[] = [
    'lcp',
    'fid',
    'cls',
    'fcp',
    'ttfb',
  ];

  return metrics.map((metric) => {
    const recentValues = recentReports
      .map((report) => report.vitals[metric])
      .filter((value): value is number => value !== undefined);

    const previousValues = previousReports
      .map((report) => report.vitals[metric])
      .filter((value): value is number => value !== undefined);

    if (recentValues.length === 0 || previousValues.length === 0) {
      return {
        metric,
        trend: 'stable' as const,
        change: 0,
        recent: 0,
        previous: 0,
      };
    }

    const recentAvg =
      recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const previousAvg =
      previousValues.reduce((sum, val) => sum + val, 0) / previousValues.length;

    const change = recentAvg - previousAvg;
    const percentageChange = Math.abs(change / previousAvg) * 100;

    let trend: 'improving' | 'declining' | 'stable';

    // 对于CLS，值越小越好；对于其他指标，值越小也越好
    if (percentageChange < WEB_VITALS_CONSTANTS.TREND_THRESHOLD) {
      trend = 'stable';
    } else if (change < 0) {
      trend = 'improving'; // 值减少是改善
    } else {
      trend = 'declining'; // 值增加是恶化
    }

    return {
      metric,
      trend,
      change: Number(change.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES)),
      recent: Number(recentAvg.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES)),
      previous: Number(
        previousAvg.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES),
      ),
    };
  });
};

/**
 * 计算性能分数
 */
export const calculatePerformanceScore = (
  vitals: DetailedWebVitals,
): number => {
  const PERFECT_SCORE = 100;
  const LCP_THRESHOLD_GOOD = 1200;
  const FID_THRESHOLD_GOOD = 50;
  const CLS_THRESHOLD_GOOD = 0.05;

  let score = PERFECT_SCORE;

  // LCP评分 (权重40%)
  if (vitals.lcp) {
    if (vitals.lcp > WEB_VITALS_CONSTANTS.LCP_POOR) {
      score -= WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_MAJOR;
    } else if (vitals.lcp > WEB_VITALS_CONSTANTS.LCP_GOOD) {
      score -= WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_MINOR;
    } else if (vitals.lcp > LCP_THRESHOLD_GOOD) {
      score -= WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_TINY;
    }
  }

  // FID评分 (权重30%)
  if (vitals.fid) {
    if (vitals.fid > WEB_VITALS_CONSTANTS.FID_POOR) {
      score -= WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_MINOR;
    } else if (vitals.fid > WEB_VITALS_CONSTANTS.FID_GOOD) {
      score -= WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_SMALL;
    } else if (vitals.fid > FID_THRESHOLD_GOOD) {
      score -= WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_TINY;
    }
  }

  // CLS评分 (权重30%)
  if (vitals.cls) {
    if (vitals.cls > WEB_VITALS_CONSTANTS.CLS_POOR) {
      score -= WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_MINOR;
    } else if (vitals.cls > WEB_VITALS_CONSTANTS.CLS_GOOD) {
      score -= WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_SMALL;
    } else if (vitals.cls > CLS_THRESHOLD_GOOD) {
      score -= WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_TINY;
    }
  }

  return Math.max(0, score);
};

/**
 * 计算指标差异百分比
 */
export const calculatePercentageChange = (
  current: number,
  previous: number,
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(
    (((current - previous) / previous) * 100).toFixed(
      WEB_VITALS_CONSTANTS.DECIMAL_PLACES,
    ),
  );
};

/**
 * 计算平均值
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Number(
    (sum / values.length).toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES),
  );
};

/**
 * 计算中位数
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / COUNT_PAIR);

  if (sorted.length % COUNT_PAIR === 0) {
    const left = sorted[middle - 1] ?? 0;
    const right = sorted[middle] ?? 0;
    return Number(
      ((left + right) / COUNT_PAIR).toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES),
    );
  }

  return Number(
    (sorted[middle] ?? 0).toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES),
  );
};

/**
 * 计算第95百分位数
 */
export const calculateP95 = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * MAGIC_0_95) - 1;

  return Number(
    (sorted[Math.max(0, index)] ?? 0).toFixed(
      WEB_VITALS_CONSTANTS.DECIMAL_PLACES,
    ),
  );
};

/**
 * 计算性能指标统计信息
 */
export const calculateMetricStats = (values: number[]) => {
  if (values.length === 0) {
    return {
      average: 0,
      median: 0,
      p95: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  return {
    average: calculateAverage(values),
    median: calculateMedian(values),
    p95: calculateP95(values),
    min: Number(
      Math.min(...values).toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES),
    ),
    max: Number(
      Math.max(...values).toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES),
    ),
    count: values.length,
  };
};

/**
 * 计算性能等级
 */
export const calculatePerformanceGrade = (score: number): string => {
  if (score >= MAGIC_90) return 'A';
  if (score >= MAGIC_80) return 'B';
  if (score >= MAGIC_70) return 'C';
  if (score >= SECONDS_PER_MINUTE) return 'D';
  return 'F';
};

/**
 * 计算改善潜力
 */
export const calculateImprovementPotential = (
  vitals: DetailedWebVitals,
): number => {
  let potential = 0;

  if (vitals.lcp && vitals.lcp > WEB_VITALS_CONSTANTS.LCP_GOOD) {
    potential += WEB_VITALS_CONSTANTS.SCORE_WEIGHT_LCP;
  }

  if (vitals.fid && vitals.fid > WEB_VITALS_CONSTANTS.FID_GOOD) {
    potential += WEB_VITALS_CONSTANTS.SCORE_WEIGHT_FID;
  }

  if (vitals.cls && vitals.cls > WEB_VITALS_CONSTANTS.CLS_GOOD) {
    potential += WEB_VITALS_CONSTANTS.SCORE_WEIGHT_CLS;
  }

  return potential;
};

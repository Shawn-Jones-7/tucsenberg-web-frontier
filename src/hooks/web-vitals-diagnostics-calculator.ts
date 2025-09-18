/**
 * Web Vitals 诊断计算器
 * Web Vitals diagnostics calculator functions
 */

import type { DetailedWebVitals } from '@/lib/enhanced-web-vitals';
import { COUNT_PAIR, MAGIC_0_95, MAGIC_90, MAGIC_80, MAGIC_70, SECONDS_PER_MINUTE  } from '@/constants';

import {
  WEB_VITALS_CONSTANTS,
  type DiagnosticReport,
  type PerformanceTrend,
} from '@/hooks/web-vitals-diagnostics-constants';

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

  // helpers to avoid dynamic object indexing
  const extractValues = (
    reports: DiagnosticReport[],
    pick: (v: DetailedWebVitals) => number | undefined,
  ): number[] =>
    reports
      .map((r) => pick(r.vitals))
      .filter((v): v is number => typeof v === 'number');

  const buildTrend = (
    metric: 'lcp' | 'fid' | 'cls' | 'fcp' | 'ttfb',
    pick: (v: DetailedWebVitals) => number | undefined,
  ): PerformanceTrend => {
    const recentValues = extractValues(recentReports, pick);
    const previousValues = extractValues(previousReports, pick);

    if (recentValues.length === 0 || previousValues.length === 0) {
      return { metric, trend: 'stable', change: 0, recent: 0, previous: 0 };
    }

    const recentAvg =
      recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const previousAvg =
      previousValues.reduce((sum, val) => sum + val, 0) / previousValues.length;

    const change = recentAvg - previousAvg;
    const percentageChange = Math.abs(change / previousAvg) * 100;
    const trend:
      | 'improving'
      | 'declining'
      | 'stable' =
      percentageChange < WEB_VITALS_CONSTANTS.TREND_THRESHOLD
        ? 'stable'
        : change < 0
          ? 'improving'
          : 'declining';

    return {
      metric,
      trend,
      change: Number(change.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES)),
      recent: Number(recentAvg.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES)),
      previous: Number(previousAvg.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES)),
    };
  };

  return [
    buildTrend('lcp', (v) => v.lcp),
    buildTrend('fid', (v) => v.fid),
    buildTrend('cls', (v) => v.cls),
    buildTrend('fcp', (v) => v.fcp),
    buildTrend('ttfb', (v) => v.ttfb),
  ];
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

  const lcpDeduction = !vitals.lcp
    ? 0
    : vitals.lcp > WEB_VITALS_CONSTANTS.LCP_POOR
      ? WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_MAJOR
      : vitals.lcp > WEB_VITALS_CONSTANTS.LCP_GOOD
        ? WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_MINOR
        : vitals.lcp > LCP_THRESHOLD_GOOD
          ? WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_TINY
          : 0;

  const fidDeduction = !vitals.fid
    ? 0
    : vitals.fid > WEB_VITALS_CONSTANTS.FID_POOR
      ? WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_MINOR
      : vitals.fid > WEB_VITALS_CONSTANTS.FID_GOOD
        ? WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_SMALL
        : vitals.fid > FID_THRESHOLD_GOOD
          ? WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_TINY
          : 0;

  const clsDeduction = !vitals.cls
    ? 0
    : vitals.cls > WEB_VITALS_CONSTANTS.CLS_POOR
      ? WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_MINOR
      : vitals.cls > WEB_VITALS_CONSTANTS.CLS_GOOD
        ? WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_SMALL
        : vitals.cls > CLS_THRESHOLD_GOOD
          ? WEB_VITALS_CONSTANTS.SCORE_DEDUCTION_TINY
          : 0;

  const score = PERFECT_SCORE - lcpDeduction - fidDeduction - clsDeduction;
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
    const [left = 0, right = 0] = sorted.slice(middle - 1, middle + 1);
    return Number(
      ((left + right) / COUNT_PAIR).toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES),
    );
  }

  return Number(
    (sorted.slice(middle, middle + 1)[0] ?? 0).toFixed(
      WEB_VITALS_CONSTANTS.DECIMAL_PLACES,
    ),
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
    (sorted.slice(Math.max(0, index), Math.max(0, index) + 1)[0] ?? 0).toFixed(
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

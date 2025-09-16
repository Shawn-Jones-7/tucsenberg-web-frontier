/**
 * 性能监控工具函数
 * 提供通用的工具方法和辅助函数
 */

import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import { PERFORMANCE_THRESHOLDS } from '@/lib/web-vitals/constants';
import type { DetailedWebVitals, PerformanceBaseline } from '@/lib/web-vitals/types';

/**
 * 性能监控工具类
 */
export class MonitoringUtils {
  /**
   * 获取指标状态的辅助函数
   */
  static getStandardMetricStatus(
    value: number,
    goodThreshold: number,
    needsImprovementThreshold: number,
  ): string {
    if (value <= goodThreshold) return '🟢';
    if (value <= needsImprovementThreshold) return '🟡';
    return '🔴';
  }

  /**
   * 获取指标状态
   */
  static getMetricStatus(metric: string, value: number): string {
    const thresholds = PERFORMANCE_THRESHOLDS;

    // 定义指标阈值映射
    const metricThresholds = {
      cls: {
        good: thresholds.CLS_GOOD,
        needsImprovement: thresholds.CLS_NEEDS_IMPROVEMENT,
      },
      fid: {
        good: thresholds.FID_GOOD,
        needsImprovement: thresholds.FID_NEEDS_IMPROVEMENT,
      },
      lcp: {
        good: thresholds.LCP_GOOD,
        needsImprovement: thresholds.LCP_NEEDS_IMPROVEMENT,
      },
      fcp: {
        good: thresholds.FCP_GOOD,
        needsImprovement: WEB_VITALS_CONSTANTS.FCP_NEEDS_IMPROVEMENT_THRESHOLD,
      },
      ttfb: {
        good: thresholds.TTFB_GOOD,
        needsImprovement: thresholds.TTFB_NEEDS_IMPROVEMENT,
      },
    };

    const threshold = metricThresholds[metric as keyof typeof metricThresholds];
    if (!threshold) {
      return '';
    }

    return MonitoringUtils.getStandardMetricStatus(
      value,
      threshold.good,
      threshold.needsImprovement,
    );
  }

  /**
   * 判断是否应该保存基准数据
   */
  static shouldSaveBaseline(
    _metrics: DetailedWebVitals,
    baseline: PerformanceBaseline | null,
  ): boolean {
    if (!baseline) return true; // 没有基准数据时总是保存

    // 如果距离上次基准超过24小时，保存新基准
    const hoursSinceBaseline =
      (Date.now() - baseline.timestamp) /
      (WEB_VITALS_CONSTANTS.MILLISECONDS_PER_SECOND *
        WEB_VITALS_CONSTANTS.SECONDS_PER_MINUTE *
        WEB_VITALS_CONSTANTS.MINUTES_PER_HOUR);
    return hoursSinceBaseline > WEB_VITALS_CONSTANTS.BASELINE_REFRESH_HOURS;
  }

  /**
   * 验证指标数据有效性
   */
  static isValidMetrics(metrics: DetailedWebVitals): boolean {
    return metrics.lcp > 0 && metrics.fcp > 0 && metrics.ttfb > 0;
  }

  /**
   * 提取页面标识符
   */
  static extractPageIdentifier(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  /**
   * 提取locale
   */
  static extractLocale(url: string): string {
    const match = url.match(/\/([a-z]{2})(?:\/|$)/);
    return match?.[1] ?? 'en';
  }

  /**
   * 计算性能等级
   */
  static calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= WEB_VITALS_CONSTANTS.GRADE_A_THRESHOLD) return 'A';
    if (score >= WEB_VITALS_CONSTANTS.GRADE_B_THRESHOLD) return 'B';
    if (score >= WEB_VITALS_CONSTANTS.GRADE_C_THRESHOLD) return 'C';
    if (score >= WEB_VITALS_CONSTANTS.GRADE_D_THRESHOLD) return 'D';
    return 'F';
  }
}

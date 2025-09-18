/**
 * Web Vitals 收集器分析器
 * Web Vitals collector analyzer
 */

'use client';

import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import { BYTES_PER_KB, COUNT_FIVE, COUNT_PAIR, COUNT_TEN, COUNT_TRIPLE, DAYS_PER_MONTH, MAGIC_15, MAGIC_600, MAGIC_800, MAGIC_1800, ONE, PERCENTAGE_FULL, PERCENTAGE_QUARTER, THREE_SECONDS_MS, ZERO } from '@/constants';

import { PERFORMANCE_THRESHOLDS } from '@/lib/web-vitals/constants';
import type { DetailedWebVitals } from '@/lib/web-vitals/types';

/**
 * Web Vitals 性能分析器
 * 负责性能指标分析和诊断报告生成
 */
export class WebVitalsCollectorAnalyzer {
  private static readonly SLOW_RESOURCE_MS_THRESHOLD = PERCENTAGE_FULL * COUNT_FIVE; // 500ms
  /**
   * 分析 CLS 指标并生成问题和建议
   */
  protected analyzeCLS(
    cls: number,
    issues: string[],
    recommendations: string[],
  ): void {
    if (cls > PERFORMANCE_THRESHOLDS.CLS_NEEDS_IMPROVEMENT) {
      issues.push(`累积布局偏移 (CLS) 过高: ${cls.toFixed(COUNT_TRIPLE)}`);
      recommendations.push(
        '为图片和广告设置明确的尺寸，避免动态内容插入导致布局偏移',
      );
      recommendations.push(
        '使用 CSS aspect-ratio 属性预留空间，避免内容加载时的布局变化',
      );
      recommendations.push(
        '确保字体加载不会导致文本重新布局，使用 font-display: swap',
      );
    }
  }

  /**
   * 分析 LCP 指标并生成问题和建议
   */
  protected analyzeLCP(
    lcp: number,
    issues: string[],
    recommendations: string[],
  ): void {
    if (lcp > PERFORMANCE_THRESHOLDS.LCP_NEEDS_IMPROVEMENT) {
      issues.push(`最大内容绘制 (LCP) 过慢: ${lcp.toFixed(ZERO)}ms`);
      recommendations.push('优化图片加载，使用现代图片格式如 WebP');
      recommendations.push('减少服务器响应时间，优化后端性能');
      recommendations.push('使用 CDN 加速资源加载');
    }
  }

  /**
   * 分析 FID 指标并生成问题和建议
   */
  protected analyzeFID(
    fid: number,
    issues: string[],
    recommendations: string[],
  ): void {
    if (fid > PERFORMANCE_THRESHOLDS.FID_NEEDS_IMPROVEMENT) {
      issues.push(`首次输入延迟 (FID) 过高: ${fid.toFixed(ZERO)}ms`);
      recommendations.push('减少 JavaScript 执行时间，考虑代码分割和懒加载');
      recommendations.push('优化第三方脚本，延迟非关键脚本的加载');
      recommendations.push('使用 Web Workers 处理计算密集型任务');
    }
  }

  /**
   * 分析资源加载性能并生成问题和建议
   */
  protected analyzeResourceTiming(
    resourceTiming: DetailedWebVitals['resourceTiming'],
    issues: string[],
    recommendations: string[],
  ): void {
    const [firstSlow] = resourceTiming.slowResources;
    if (firstSlow && firstSlow.duration > WebVitalsCollectorAnalyzer.SLOW_RESOURCE_MS_THRESHOLD) {
      issues.push(
        `发现慢速资源: ${firstSlow.name} (${firstSlow.duration.toFixed(ZERO)}ms)`,
      );
      recommendations.push('优化慢速资源的加载，考虑压缩或使用 CDN');
    }

    if (resourceTiming.totalSize > COUNT_PAIR * BYTES_PER_KB * BYTES_PER_KB) {
      // 2MB
      issues.push(
        `总资源大小过大: ${(resourceTiming.totalSize / BYTES_PER_KB / BYTES_PER_KB).toFixed(ONE)}MB`,
      );
      recommendations.push('减少资源大小，启用 gzip 压缩');
    }
  }

  /**
   * 计算性能评分
   */
  protected calculatePerformanceScore(metrics: DetailedWebVitals): number {
    const { PERFECT_SCORE } = WEB_VITALS_CONSTANTS;
    let score = PERFECT_SCORE;

    // CLS 评分
    if (metrics.cls > PERFORMANCE_THRESHOLDS.CLS_NEEDS_IMPROVEMENT) {
      score -= PERCENTAGE_QUARTER;
    } else if (metrics.cls > PERFORMANCE_THRESHOLDS.CLS_GOOD) {
      score -= COUNT_TEN;
    }

    // LCP 评分
    if (metrics.lcp > PERFORMANCE_THRESHOLDS.LCP_NEEDS_IMPROVEMENT) {
      score -= DAYS_PER_MONTH;
    } else if (metrics.lcp > PERFORMANCE_THRESHOLDS.LCP_GOOD) {
      score -= MAGIC_15;
    }

    // FID 评分
    if (metrics.fid > PERFORMANCE_THRESHOLDS.FID_NEEDS_IMPROVEMENT) {
      score -= PERCENTAGE_QUARTER;
    } else if (metrics.fid > PERFORMANCE_THRESHOLDS.FID_GOOD) {
      score -= COUNT_TEN;
    }

    // FCP 评分
    if (metrics.fcp > THREE_SECONDS_MS) {
      score -= COUNT_TEN;
    } else if (metrics.fcp > MAGIC_1800) {
      score -= COUNT_FIVE;
    }

    // TTFB 评分
    if (metrics.ttfb > MAGIC_800) {
      score -= COUNT_TEN;
    } else if (metrics.ttfb > MAGIC_600) {
      score -= COUNT_FIVE;
    }

    return Math.max(ZERO, score);
  }

  /**
   * 执行所有性能指标分析
   */
  protected performMetricsAnalysis(
    metrics: DetailedWebVitals,
    issues: string[],
    recommendations: string[],
  ): void {
    this.analyzeCLS(metrics.cls, issues, recommendations);
    this.analyzeLCP(metrics.lcp, issues, recommendations);
    this.analyzeFID(metrics.fid, issues, recommendations);
    this.analyzeResourceTiming(metrics.resourceTiming, issues, recommendations);
  }

  /**
   * 构建诊断报告结果对象
   */
  protected buildDiagnosticResult(args: {
    metrics: DetailedWebVitals;
    issues: string[];
    recommendations: string[];
    score: number;
  }): {
    metrics: DetailedWebVitals;
    analysis: {
      issues: string[];
      recommendations: string[];
      score: number;
    };
  } {
    return {
      metrics: args.metrics,
      analysis: {
        issues: args.issues,
        recommendations: args.recommendations,
        score: args.score,
      },
    };
  }

  /**
   * 生成完整的诊断报告
   */
  public generateDiagnosticReport(metrics: DetailedWebVitals): {
    metrics: DetailedWebVitals;
    analysis: {
      issues: string[];
      recommendations: string[];
      score: number;
    };
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 执行所有分析
    this.performMetricsAnalysis(metrics, issues, recommendations);

    // 计算性能评分
    const score = this.calculatePerformanceScore(metrics);

    // 构建并返回结果
    return this.buildDiagnosticResult({ metrics, issues, recommendations, score });
  }

  /**
   * 分析性能趋势
   */
  public analyzePerformanceTrend(
    currentMetrics: DetailedWebVitals,
    previousMetrics: DetailedWebVitals,
  ): {
    trend: 'improving' | 'declining' | 'stable';
    changes: Array<{
      metric: string;
      current: number;
      previous: number;
      change: number;
      changePercent: number;
    }>;
  } {
    const changes = [
      {
        metric: 'LCP',
        current: currentMetrics.lcp,
        previous: previousMetrics.lcp,
        change: currentMetrics.lcp - previousMetrics.lcp,
        changePercent:
          previousMetrics.lcp > ZERO
            ? ((currentMetrics.lcp - previousMetrics.lcp) /
                previousMetrics.lcp) *
              PERCENTAGE_FULL
            : ZERO,
      },
      {
        metric: 'FID',
        current: currentMetrics.fid,
        previous: previousMetrics.fid,
        change: currentMetrics.fid - previousMetrics.fid,
        changePercent:
          previousMetrics.fid > ZERO
            ? ((currentMetrics.fid - previousMetrics.fid) /
                previousMetrics.fid) *
              PERCENTAGE_FULL
            : ZERO,
      },
      {
        metric: 'CLS',
        current: currentMetrics.cls,
        previous: previousMetrics.cls,
        change: currentMetrics.cls - previousMetrics.cls,
        changePercent:
          previousMetrics.cls > ZERO
            ? ((currentMetrics.cls - previousMetrics.cls) /
                previousMetrics.cls) *
              PERCENTAGE_FULL
            : ZERO,
      },
    ];

    // 计算总体趋势
    const improvingCount = changes.filter((c) => c.change < ZERO).length;
    const decliningCount = changes.filter((c) => c.change > ZERO).length;

    let trend: 'improving' | 'declining' | 'stable';
    if (improvingCount > decliningCount) {
      trend = 'improving';
    } else if (decliningCount > improvingCount) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    return { trend, changes };
  }
}

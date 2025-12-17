/**
 * 性能监控核心报告生成
 * Performance Monitoring Core Report Generation
 *
 * 负责性能报告的生成、评分计算和建议提供功能
 */

import type {
  PerformanceConfig,
  PerformanceMetrics,
  PerformanceMetricSource,
  PerformanceMetricType,
} from '@/lib/performance-monitoring-types';
import {
  buildBundleAnalysis,
  buildComponentAnalysis,
  buildNetworkAnalysis,
  calculateTrend,
  getBundleMetrics,
  getComponentMetrics,
  getMetricValue,
  getNetworkMetrics,
  isBundleData,
  isComponentData,
  isNetworkData,
  type BundleAnalysis,
  type ComponentAnalysis,
  type NetworkAnalysis,
  type TrendDirection,
} from '@/lib/performance-report-analysis';
import {
  ANIMATION_DURATION_SLOW,
  ANIMATION_DURATION_VERY_SLOW,
  BYTES_PER_KB,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TRIPLE,
  MAGIC_0_3,
  MAGIC_0_5,
  MAGIC_0_6,
  MAGIC_1_5,
  MAGIC_20,
  MAGIC_40,
  MAGIC_80,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import { DEC_0_4, MAGIC_0_2 } from '@/constants/decimal';

/**
 * 性能报告接口
 */
export interface PerformanceReport {
  /** 报告摘要 */
  summary: {
    totalMetrics: number;
    recentMetrics: number;
    sources: PerformanceMetricSource[];
    types: PerformanceMetricType[];
    timeRange: {
      start: number;
      end: number;
    };
    averageMetricsPerMinute: number;
  };
  /** 详细指标 */
  details: PerformanceMetrics[];
  /** 性能建议 */
  recommendations: string[];
  /** 性能评分 */
  score?: {
    overall: number;
    component: number;
    network: number;
    bundle: number;
  };
}

/**
 * 详细报告返回类型
 */
export interface DetailedReport {
  overview: PerformanceReport;
  analysis: {
    componentAnalysis: ComponentAnalysis;
    networkAnalysis: NetworkAnalysis;
    bundleAnalysis: BundleAnalysis;
  };
  trends: {
    componentTrend: TrendDirection;
    networkTrend: TrendDirection;
    bundleTrend: TrendDirection;
  };
}

/**
 * 报告生成器
 */
export class PerformanceReportGenerator {
  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * 生成性能报告
   */
  generateReport(
    metrics: PerformanceMetrics[],
    timeWindow = SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
  ): PerformanceReport {
    const now = Date.now();
    const windowStart = now - timeWindow;
    const windowMetrics = metrics.filter(
      (metric) => metric.timestamp >= windowStart,
    );

    const summary = this.generateSummary(windowMetrics, windowStart, now);
    const recommendations = this.generateRecommendations(windowMetrics);
    const score = this.calculatePerformanceScore(windowMetrics);

    const report: PerformanceReport = {
      summary,
      details: windowMetrics,
      recommendations,
    };

    if (score !== undefined) {
      report.score = score;
    }

    return report;
  }

  /**
   * 生成报告摘要
   */
  private generateSummary(
    metrics: PerformanceMetrics[],
    windowStart: number,
    windowEnd: number,
  ): PerformanceReport['summary'] {
    const sources = [...new Set(metrics.map((m) => m.source))];
    const types = [...new Set(metrics.map((m) => m.type))];

    const timeSpanMinutes =
      (windowEnd - windowStart) /
      (SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW);
    const averageMetricsPerMinute =
      timeSpanMinutes > ZERO ? metrics.length / timeSpanMinutes : ZERO;

    return {
      totalMetrics: metrics.length,
      recentMetrics: metrics.filter(
        (m) =>
          windowEnd - m.timestamp <
          SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
      ).length,
      sources,
      types,
      timeRange: { start: windowStart, end: windowEnd },
      averageMetricsPerMinute,
    };
  }

  /**
   * 生成性能建议
   */
  private generateRecommendations(metrics: PerformanceMetrics[]): string[] {
    const recommendations: string[] = [];

    recommendations.push(
      ...this.generateComponentRecommendations(metrics),
      ...this.generateNetworkRecommendations(metrics),
      ...this.generateBundleRecommendations(metrics),
    );

    if (metrics.length > PERCENTAGE_FULL) {
      recommendations.push('性能指标数量较多，建议调整监控频率或增加数据清理');
    }

    if (recommendations.length === ZERO) {
      recommendations.push('当前性能表现良好，继续保持！');
    }

    return recommendations;
  }

  private generateComponentRecommendations(
    metrics: PerformanceMetrics[],
  ): string[] {
    const recs: string[] = [];
    const componentMetrics = getComponentMetrics(metrics);
    if (componentMetrics.length === ZERO) return recs;

    const slowComponents = componentMetrics.filter((m) => {
      if (isComponentData(m.data)) {
        return (
          (Number(m.data.renderTime) || ZERO) >
          (this.config.component?.thresholds?.renderTime || PERCENTAGE_FULL)
        );
      }
      return false;
    });
    if (slowComponents.length > ZERO) {
      recs.push(
        `发现 ${slowComponents.length} 个组件渲染时间超过阈值，建议优化组件性能`,
      );
    }

    const avgRenderTime =
      componentMetrics.reduce((sum, m) => sum + getMetricValue(m), ZERO) /
      componentMetrics.length;
    if (avgRenderTime > PERCENTAGE_HALF) {
      recs.push('组件平均渲染时间较高，考虑使用 React.memo 或 useMemo 优化');
    }
    return recs;
  }

  private generateNetworkRecommendations(
    metrics: PerformanceMetrics[],
  ): string[] {
    const recs: string[] = [];
    const networkMetrics = getNetworkMetrics(metrics);
    if (networkMetrics.length === ZERO) return recs;

    const slowRequests = networkMetrics.filter((m) => {
      if (isNetworkData(m.data)) {
        return (
          (Number(m.data.responseTime) || ZERO) >
          (this.config.network?.thresholds?.responseTime || 1000)
        );
      }
      return false;
    });
    if (slowRequests.length > ZERO) {
      recs.push(
        `发现 ${slowRequests.length} 个网络请求响应时间超过阈值，建议优化API性能`,
      );
    }

    const avgResponseTime =
      networkMetrics.reduce((sum, m) => sum + getMetricValue(m), ZERO) /
      networkMetrics.length;
    if (avgResponseTime > ANIMATION_DURATION_SLOW) {
      recs.push('网络请求平均响应时间较高，考虑使用缓存或CDN优化');
    }
    return recs;
  }

  private generateBundleRecommendations(
    metrics: PerformanceMetrics[],
  ): string[] {
    const recs: string[] = [];
    const bundleMetrics = getBundleMetrics(metrics);
    if (bundleMetrics.length === ZERO) return recs;

    const largeBundles = bundleMetrics.filter((m) => {
      if (isBundleData(m.data)) {
        return (
          (Number(m.data.size) || ZERO) >
          (this.config.bundle?.thresholds?.size || BYTES_PER_KB * BYTES_PER_KB)
        );
      }
      return false;
    });
    if (largeBundles.length > ZERO) {
      recs.push(
        `发现 ${largeBundles.length} 个打包文件大小超过阈值，建议进行代码分割`,
      );
    }

    const totalBundleSize = bundleMetrics.reduce(
      (sum, m) => sum + getMetricValue(m),
      ZERO,
    );
    if (totalBundleSize > COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB) {
      recs.push('总打包大小较大，建议使用动态导入和懒加载优化');
    }
    return recs;
  }

  /**
   * 计算性能评分
   */
  private calculatePerformanceScore(
    metrics: PerformanceMetrics[],
  ): PerformanceReport['score'] {
    const componentScore = this.calculateComponentScore(metrics);
    const networkScore = this.calculateNetworkScore(metrics);
    const bundleScore = this.calculateBundleScore(metrics);

    const weights = { component: DEC_0_4, network: DEC_0_4, bundle: MAGIC_0_2 };
    const overall =
      componentScore * weights.component +
      networkScore * weights.network +
      bundleScore * weights.bundle;

    return {
      overall: Math.round(overall),
      component: componentScore,
      network: networkScore,
      bundle: bundleScore,
    };
  }

  private calculateComponentScore(metrics: PerformanceMetrics[]): number {
    const componentMetrics = getComponentMetrics(metrics);
    if (componentMetrics.length === ZERO) return PERCENTAGE_FULL;

    const threshold =
      this.config.component?.thresholds?.renderTime || PERCENTAGE_FULL;
    const avgRenderTime =
      componentMetrics.reduce((sum, m) => sum + getMetricValue(m), ZERO) /
      componentMetrics.length;

    if (avgRenderTime <= threshold * MAGIC_0_5) return PERCENTAGE_FULL;
    if (avgRenderTime <= threshold) return MAGIC_80;
    if (avgRenderTime <= threshold * MAGIC_1_5) return SECONDS_PER_MINUTE;
    if (avgRenderTime <= threshold * COUNT_PAIR) return MAGIC_40;
    return MAGIC_20;
  }

  private calculateNetworkScore(metrics: PerformanceMetrics[]): number {
    const networkMetrics = getNetworkMetrics(metrics);
    if (networkMetrics.length === ZERO) return PERCENTAGE_FULL;

    const threshold = this.config.network?.thresholds?.responseTime || 1000;
    const avgResponseTime =
      networkMetrics.reduce((sum, m) => sum + getMetricValue(m), ZERO) /
      networkMetrics.length;

    if (avgResponseTime <= threshold * MAGIC_0_3) return PERCENTAGE_FULL;
    if (avgResponseTime <= threshold * MAGIC_0_6) return MAGIC_80;
    if (avgResponseTime <= threshold) return SECONDS_PER_MINUTE;
    if (avgResponseTime <= threshold * MAGIC_1_5) return MAGIC_40;
    return MAGIC_20;
  }

  private calculateBundleScore(metrics: PerformanceMetrics[]): number {
    const bundleMetrics = getBundleMetrics(metrics);
    if (bundleMetrics.length === ZERO) return PERCENTAGE_FULL;

    const threshold =
      this.config.bundle?.thresholds?.size || BYTES_PER_KB * BYTES_PER_KB;
    const totalSize = bundleMetrics.reduce(
      (sum, m) => sum + getMetricValue(m),
      ZERO,
    );

    if (totalSize <= threshold * MAGIC_0_5) return PERCENTAGE_FULL;
    if (totalSize <= threshold) return MAGIC_80;
    if (totalSize <= threshold * COUNT_PAIR) return SECONDS_PER_MINUTE;
    if (totalSize <= threshold * COUNT_TRIPLE) return MAGIC_40;
    return MAGIC_20;
  }

  /**
   * 生成详细的性能分析报告
   */
  generateDetailedReport(metrics: PerformanceMetrics[]): DetailedReport {
    const overview = this.generateReport(metrics);

    const componentMetrics = getComponentMetrics(metrics);
    const networkMetrics = getNetworkMetrics(metrics);
    const bundleMetrics = getBundleMetrics(metrics);

    return {
      overview,
      analysis: {
        componentAnalysis: buildComponentAnalysis(
          componentMetrics,
          this.config,
        ),
        networkAnalysis: buildNetworkAnalysis(networkMetrics, this.config),
        bundleAnalysis: buildBundleAnalysis(bundleMetrics, this.config),
      },
      trends: {
        componentTrend: calculateTrend(componentMetrics),
        networkTrend: calculateTrend(networkMetrics),
        bundleTrend: calculateTrend(bundleMetrics),
      },
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: PerformanceConfig): void {
    this.config = newConfig;
  }
}

/**
 * 创建报告生成器
 */
export function createReportGenerator(
  config: PerformanceConfig,
): PerformanceReportGenerator {
  return new PerformanceReportGenerator(config);
}

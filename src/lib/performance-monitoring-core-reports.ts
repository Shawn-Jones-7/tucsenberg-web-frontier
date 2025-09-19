/**
 * 性能监控核心报告生成
 * Performance Monitoring Core Report Generation
 *
 * 负责性能报告的生成、评分计算和建议提供功能
 */

import type {
  BundlePerformanceData,
  ComponentPerformanceData,
  NetworkPerformanceData,
  PerformanceConfig,
  PerformanceMetrics,
  PerformanceMetricSource,
  PerformanceMetricType,
} from '@/lib/performance-monitoring-types';
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
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  SECONDS_PER_MINUTE,
  ZERO,
} from '@/constants';
import { DEC_0_4, MAGIC_0_2 } from '@/constants/decimal';

/**
 * 性能报告接口
 * Performance report interface
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
 * 报告生成器
 * Report generator
 */
export class PerformanceReportGenerator {
  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * 类型守卫：检查是否为组件性能数据
   */
  private isComponentData(data: unknown): data is ComponentPerformanceData {
    return typeof data === 'object' && data !== null && 'renderTime' in data;
  }

  /**
   * 类型守卫：检查是否为网络性能数据
   */
  private isNetworkData(data: unknown): data is NetworkPerformanceData {
    return typeof data === 'object' && data !== null && 'responseTime' in data;
  }

  /**
   * 类型守卫：检查是否为打包性能数据
   */
  private isBundleData(data: unknown): data is BundlePerformanceData {
    return typeof data === 'object' && data !== null && 'size' in data;
  }

  /**
   * 生成性能报告
   * Generate performance report
   */
  generateReport(
    metrics: PerformanceMetrics[],
    timeWindow = SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
  ): PerformanceReport {
    const now = Date.now();
    const windowStart = now - timeWindow;

    // 过滤时间窗口内的指标
    const windowMetrics = metrics.filter(
      (metric) => metric.timestamp >= windowStart,
    );

    // 生成报告摘要
    const summary = this.generateSummary(windowMetrics, windowStart, now);

    // 生成建议
    const recommendations = this.generateRecommendations(windowMetrics);

    // 计算性能评分
    const score = this.calculatePerformanceScore(windowMetrics);

    return {
      summary,
      details: windowMetrics,
      recommendations,
      ...(score !== undefined && { score }),
    };
  }

  /**
   * 生成报告摘要
   * Generate report summary
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
      ).length, // 最近1分钟
      sources,
      types,
      timeRange: {
        start: windowStart,
        end: windowEnd,
      },
      averageMetricsPerMinute,
    };
  }

  /**
   * 生成性能建议
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetrics[]): string[] {
    const recommendations: string[] = [];

    // 分模块生成建议，降低单个函数语句数
    recommendations.push(
      ...this.generateComponentRecommendations(metrics),
      ...this.generateNetworkRecommendations(metrics),
      ...this.generateBundleRecommendations(metrics),
    );

    // 通用建议
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
    const componentMetrics = metrics.filter((m) => m.type === 'component');
    if (componentMetrics.length === ZERO) return recs;

    const slowComponents = componentMetrics.filter((m) => {
      if (this.isComponentData(m.data)) {
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
      componentMetrics.reduce((sum, m) => {
        if (this.isComponentData(m.data)) {
          return sum + (Number(m.data.renderTime) || ZERO);
        }
        return sum;
      }, ZERO) / componentMetrics.length;
    if (avgRenderTime > PERCENTAGE_HALF) {
      recs.push('组件平均渲染时间较高，考虑使用 React.memo 或 useMemo 优化');
    }
    return recs;
  }

  private generateNetworkRecommendations(
    metrics: PerformanceMetrics[],
  ): string[] {
    const recs: string[] = [];
    const networkMetrics = metrics.filter((m) => m.type === 'network');
    if (networkMetrics.length === ZERO) return recs;
    const slowRequests = networkMetrics.filter((m) => {
      if (this.isNetworkData(m.data)) {
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
      networkMetrics.reduce((sum, m) => {
        if (this.isNetworkData(m.data)) {
          return sum + (Number(m.data.responseTime) || ZERO);
        }
        return sum;
      }, ZERO) / networkMetrics.length;
    if (avgResponseTime > ANIMATION_DURATION_SLOW) {
      recs.push('网络请求平均响应时间较高，考虑使用缓存或CDN优化');
    }
    return recs;
  }

  private generateBundleRecommendations(
    metrics: PerformanceMetrics[],
  ): string[] {
    const recs: string[] = [];
    const bundleMetrics = metrics.filter((m) => m.type === 'bundle');
    if (bundleMetrics.length === ZERO) return recs;

    const largeBundles = bundleMetrics.filter((m) => {
      if (this.isBundleData(m.data)) {
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

    const totalBundleSize = bundleMetrics.reduce((sum, m) => {
      if (this.isBundleData(m.data)) {
        return sum + (Number(m.data.size) || ZERO);
      }
      return sum;
    }, ZERO);
    if (totalBundleSize > COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB) {
      recs.push('总打包大小较大，建议使用动态导入和懒加载优化');
    }
    return recs;
  }

  /**
   * 计算性能评分
   * Calculate performance score
   */
  private calculatePerformanceScore(
    metrics: PerformanceMetrics[],
  ): PerformanceReport['score'] {
    const componentScore = this.calculateComponentScore(metrics);
    const networkScore = this.calculateNetworkScore(metrics);
    const bundleScore = this.calculateBundleScore(metrics);

    // 计算总体评分（加权平均）
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

  /**
   * 计算组件性能评分
   * Calculate component performance score
   */
  private calculateComponentScore(metrics: PerformanceMetrics[]): number {
    const componentMetrics = metrics.filter((m) => m.type === 'component');
    if (componentMetrics.length === ZERO) return PERCENTAGE_FULL;

    const threshold =
      this.config.component?.thresholds?.renderTime || PERCENTAGE_FULL;
    const avgRenderTime =
      componentMetrics.reduce((sum, m) => {
        if (this.isComponentData(m.data)) {
          return sum + (Number(m.data.renderTime) || ZERO);
        }
        return sum;
      }, ZERO) / componentMetrics.length;

    // 评分算法：基于平均渲染时间与阈值的比较
    if (avgRenderTime <= threshold * MAGIC_0_5) return PERCENTAGE_FULL;
    if (avgRenderTime <= threshold) return MAGIC_80;
    if (avgRenderTime <= threshold * MAGIC_1_5) return SECONDS_PER_MINUTE;
    if (avgRenderTime <= threshold * COUNT_PAIR) return MAGIC_40;
    return MAGIC_20;
  }

  /**
   * 计算网络性能评分
   * Calculate network performance score
   */
  private calculateNetworkScore(metrics: PerformanceMetrics[]): number {
    const networkMetrics = metrics.filter((m) => m.type === 'network');
    if (networkMetrics.length === ZERO) return PERCENTAGE_FULL;

    const threshold = this.config.network?.thresholds?.responseTime || 1000;
    const avgResponseTime =
      networkMetrics.reduce((sum, m) => {
        if (this.isNetworkData(m.data)) {
          return sum + (Number(m.data.responseTime) || ZERO);
        }
        return sum;
      }, ZERO) / networkMetrics.length;

    // 评分算法：基于平均响应时间与阈值的比较
    if (avgResponseTime <= threshold * MAGIC_0_3) return PERCENTAGE_FULL;
    if (avgResponseTime <= threshold * MAGIC_0_6) return MAGIC_80;
    if (avgResponseTime <= threshold) return SECONDS_PER_MINUTE;
    if (avgResponseTime <= threshold * MAGIC_1_5) return MAGIC_40;
    return MAGIC_20;
  }

  /**
   * 计算打包性能评分
   * Calculate bundle performance score
   */
  private calculateBundleScore(metrics: PerformanceMetrics[]): number {
    const bundleMetrics = metrics.filter((m) => m.type === 'bundle');
    if (bundleMetrics.length === ZERO) return PERCENTAGE_FULL;

    const threshold =
      this.config.bundle?.thresholds?.size || BYTES_PER_KB * BYTES_PER_KB; // 1MB
    const totalSize = bundleMetrics.reduce((sum, m) => {
      if (this.isBundleData(m.data)) {
        return sum + (Number(m.data.size) || ZERO);
      }
      return sum;
    }, ZERO);

    // 评分算法：基于总打包大小与阈值的比较
    if (totalSize <= threshold * MAGIC_0_5) return PERCENTAGE_FULL;
    if (totalSize <= threshold) return MAGIC_80;
    if (totalSize <= threshold * COUNT_PAIR) return SECONDS_PER_MINUTE;
    if (totalSize <= threshold * COUNT_TRIPLE) return MAGIC_40;
    return MAGIC_20;
  }

  /**
   * 生成详细的性能分析报告
   * Generate detailed performance analysis report
   */
  // 小函数化：按类型过滤，降低 generateDetailedReport 语句数与复杂度
  private getComponentMetrics(metrics: PerformanceMetrics[]) {
    return metrics.filter((m) => m.type === 'component');
  }
  private getNetworkMetrics(metrics: PerformanceMetrics[]) {
    return metrics.filter((m) => m.type === 'network');
  }
  private getBundleMetrics(metrics: PerformanceMetrics[]) {
    return metrics.filter((m) => m.type === 'bundle');
  }

  // 小函数化：统一指标取值逻辑，降低 calculateTrend 的分支复杂度
  private getMetricValue(m: PerformanceMetrics): number {
    if (this.isComponentData(m.data)) return Number(m.data.renderTime) || ZERO;
    if (this.isNetworkData(m.data)) return Number(m.data.responseTime) || ZERO;
    if (this.isBundleData(m.data)) return Number(m.data.size) || ZERO;
    return ZERO;
  }

  generateDetailedReport(metrics: PerformanceMetrics[]): {
    overview: PerformanceReport;
    analysis: {
      componentAnalysis: {
        slowestComponents: Array<{
          name: string;
          value: number;
          threshold: number;
        }>;
        renderTimeDistribution: Record<string, number>;
        averageRenderTime: number;
      };
      networkAnalysis: {
        slowestRequests: Array<{
          name: string;
          value: number;
          threshold: number;
        }>;
        responseTimeDistribution: Record<string, number>;
        averageResponseTime: number;
      };
      bundleAnalysis: {
        largestBundles: Array<{
          name: string;
          value: number;
          threshold: number;
        }>;
        sizeDistribution: Record<string, number>;
        totalSize: number;
      };
    };
    trends: {
      componentTrend: 'improving' | 'stable' | 'degrading';
      networkTrend: 'improving' | 'stable' | 'degrading';
      bundleTrend: 'improving' | 'stable' | 'degrading';
    };
  } {
    const overview = this.generateReport(metrics);

    const componentMetrics = this.getComponentMetrics(metrics);
    const networkMetrics = this.getNetworkMetrics(metrics);
    const bundleMetrics = this.getBundleMetrics(metrics);

    return {
      overview,
      analysis: {
        componentAnalysis: this.buildComponentAnalysis(componentMetrics),
        networkAnalysis: this.buildNetworkAnalysis(networkMetrics),
        bundleAnalysis: this.buildBundleAnalysis(bundleMetrics),
      },
      trends: {
        componentTrend: this.calculateTrend(componentMetrics),
        networkTrend: this.calculateTrend(networkMetrics),
        bundleTrend: this.calculateTrend(bundleMetrics),
      },
    };
  }

  private buildComponentAnalysis(componentMetrics: PerformanceMetrics[]) {
    const componentThreshold =
      this.config.component?.thresholds?.renderTime || PERCENTAGE_FULL;
    const slowestComponents = componentMetrics
      .filter(
        (m) =>
          this.isComponentData(m.data) &&
          (Number(m.data.renderTime) || ZERO) > componentThreshold,
      )
      .map((m) => ({
        name: m.id || m.type,
        value: this.isComponentData(m.data)
          ? Number(m.data.renderTime) || ZERO
          : ZERO,
        threshold: componentThreshold,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(ZERO, COUNT_FIVE);

    const averageRenderTime =
      componentMetrics.reduce((sum, m) => {
        if (this.isComponentData(m.data)) {
          return sum + (Number(m.data.renderTime) || ZERO);
        }
        return sum;
      }, ZERO) / componentMetrics.length || ZERO;

    return {
      slowestComponents,
      renderTimeDistribution: this.calculateDistribution(componentMetrics),
      averageRenderTime,
    };
  }

  private buildNetworkAnalysis(networkMetrics: PerformanceMetrics[]) {
    const networkThreshold =
      this.config.network?.thresholds?.responseTime || 1000;
    const slowestRequests = networkMetrics
      .filter(
        (m) =>
          this.isNetworkData(m.data) &&
          (Number(m.data.responseTime) || ZERO) > networkThreshold,
      )
      .map((m) => ({
        name: m.id || m.type,
        value: this.isNetworkData(m.data)
          ? Number(m.data.responseTime) || ZERO
          : ZERO,
        threshold: networkThreshold,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(ZERO, COUNT_FIVE);

    const averageResponseTime =
      networkMetrics.reduce((sum, m) => {
        if (this.isNetworkData(m.data)) {
          return sum + (Number(m.data.responseTime) || ZERO);
        }
        return sum;
      }, ZERO) / networkMetrics.length || ZERO;

    return {
      slowestRequests,
      responseTimeDistribution: this.calculateDistribution(networkMetrics),
      averageResponseTime,
    };
  }

  private buildBundleAnalysis(bundleMetrics: PerformanceMetrics[]) {
    const bundleThreshold =
      this.config.bundle?.thresholds?.size || BYTES_PER_KB * BYTES_PER_KB;
    const largestBundles = bundleMetrics
      .filter(
        (m) =>
          this.isBundleData(m.data) &&
          (Number(m.data.size) || ZERO) > bundleThreshold,
      )
      .map((m) => ({
        name: m.id || m.type,
        value: this.isBundleData(m.data) ? Number(m.data.size) || ZERO : ZERO,
        threshold: bundleThreshold,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(ZERO, COUNT_FIVE);

    const totalSize = bundleMetrics.reduce((sum, m) => {
      if (this.isBundleData(m.data)) {
        return sum + (Number(m.data.size) || ZERO);
      }
      return sum;
    }, ZERO);

    return {
      largestBundles,
      sizeDistribution: this.calculateDistribution(bundleMetrics),
      totalSize,
    };
  }

  /**
   * 计算分布
   * Calculate distribution
   */
  private calculateDistribution(
    metrics: PerformanceMetrics[],
  ): Record<string, number> {
    const map = new Map<string, number>();
    for (const metric of metrics) {
      const key = metric.id || metric.type;
      const current = map.get(key) ?? ZERO;
      map.set(key, current + ONE);
    }
    return Object.fromEntries(map);
  }

  /**
   * 计算趋势
   * Calculate trend
   */
  private calculateTrend(
    metrics: PerformanceMetrics[],
  ): 'improving' | 'stable' | 'degrading' {
    if (metrics.length < COUNT_PAIR) return 'stable';

    // 按时间排序
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const midPoint = Math.floor(sortedMetrics.length / COUNT_PAIR);

    const firstHalf = sortedMetrics.slice(ZERO, midPoint);
    const secondHalf = sortedMetrics.slice(midPoint);

    const firstAvg =
      firstHalf.reduce((sum, m) => sum + this.getMetricValue(m), ZERO) /
      firstHalf.length;

    const secondAvg =
      secondHalf.reduce((sum, m) => sum + this.getMetricValue(m), ZERO) /
      secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * PERCENTAGE_FULL;

    if (changePercent < -COUNT_FIVE) return 'improving'; // 性能提升
    if (changePercent > COUNT_FIVE) return 'degrading'; // 性能下降
    return 'stable'; // 性能稳定
  }

  /**
   * 更新配置
   * Update configuration
   */
  updateConfig(newConfig: PerformanceConfig): void {
    this.config = newConfig;
  }
}

/**
 * 创建报告生成器
 * Create report generator
 */
export function createReportGenerator(
  config: PerformanceConfig,
): PerformanceReportGenerator {
  return new PerformanceReportGenerator(config);
}

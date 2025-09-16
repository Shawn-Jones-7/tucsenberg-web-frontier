import { BYTES_PER_KB, COUNT_FIVE, COUNT_PAIR, COUNT_TRIPLE, MAGIC_0_3, MAGIC_0_6, MAGIC_20, MAGIC_40, MAGIC_80, PERCENTAGE_HALF, SECONDS_PER_MINUTE } from '@/constants/magic-numbers';

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
} from './performance-monitoring-types';

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
    timeWindow = SECONDS_PER_MINUTE * 1000,
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

    const timeSpanMinutes = (windowEnd - windowStart) / (SECONDS_PER_MINUTE * 1000);
    const averageMetricsPerMinute =
      timeSpanMinutes > 0 ? metrics.length / timeSpanMinutes : 0;

    return {
      totalMetrics: metrics.length,
      recentMetrics: metrics.filter((m) => windowEnd - m.timestamp < SECONDS_PER_MINUTE * 1000)
        .length, // 最近1分钟
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

    // 组件性能建议
    const componentMetrics = metrics.filter((m) => m.type === 'component');
    if (componentMetrics.length > 0) {
      const slowComponents = componentMetrics.filter((m) => {
        if (this.isComponentData(m.data)) {
          return (
            (Number(m.data.renderTime) || 0) >
            (this.config.component?.thresholds?.renderTime || 100)
          );
        }
        return false;
      });

      if (slowComponents.length > 0) {
        recommendations.push(
          `发现 ${slowComponents.length} 个组件渲染时间超过阈值，建议优化组件性能`,
        );
      }

      const avgRenderTime =
        componentMetrics.reduce((sum, m) => {
          if (this.isComponentData(m.data)) {
            return sum + (Number(m.data.renderTime) || 0);
          }
          return sum;
        }, 0) / componentMetrics.length;
      if (avgRenderTime > PERCENTAGE_HALF) {
        recommendations.push(
          '组件平均渲染时间较高，考虑使用 React.memo 或 useMemo 优化',
        );
      }
    }

    // 网络性能建议
    const networkMetrics = metrics.filter((m) => m.type === 'network');
    if (networkMetrics.length > 0) {
      const slowRequests = networkMetrics.filter((m) => {
        if (this.isNetworkData(m.data)) {
          return (
            (Number(m.data.responseTime) || 0) >
            (this.config.network?.thresholds?.responseTime || 1000)
          );
        }
        return false;
      });

      if (slowRequests.length > 0) {
        recommendations.push(
          `发现 ${slowRequests.length} 个网络请求响应时间超过阈值，建议优化API性能`,
        );
      }

      const avgResponseTime =
        networkMetrics.reduce((sum, m) => {
          if (this.isNetworkData(m.data)) {
            return sum + (Number(m.data.responseTime) || 0);
          }
          return sum;
        }, 0) / networkMetrics.length;
      if (avgResponseTime > 500) {
        recommendations.push('网络请求平均响应时间较高，考虑使用缓存或CDN优化');
      }
    }

    // 打包大小建议
    const bundleMetrics = metrics.filter((m) => m.type === 'bundle');
    if (bundleMetrics.length > 0) {
      const largeBundles = bundleMetrics.filter((m) => {
        if (this.isBundleData(m.data)) {
          return (
            (Number(m.data.size) || 0) >
            (this.config.bundle?.thresholds?.size || BYTES_PER_KB * BYTES_PER_KB)
          );
        }
        return false;
      });

      if (largeBundles.length > 0) {
        recommendations.push(
          `发现 ${largeBundles.length} 个打包文件大小超过阈值，建议进行代码分割`,
        );
      }

      const totalBundleSize = bundleMetrics.reduce((sum, m) => {
        if (this.isBundleData(m.data)) {
          return sum + (Number(m.data.size) || 0);
        }
        return sum;
      }, 0);
      if (totalBundleSize > COUNT_FIVE * BYTES_PER_KB * BYTES_PER_KB) {
        // 5MB
        recommendations.push('总打包大小较大，建议使用动态导入和懒加载优化');
      }
    }

    // 通用建议
    if (metrics.length > 100) {
      recommendations.push('性能指标数量较多，建议调整监控频率或增加数据清理');
    }

    if (recommendations.length === 0) {
      recommendations.push('当前性能表现良好，继续保持！');
    }

    return recommendations;
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
    const weights = { component: 0.4, network: 0.4, bundle: 0.2 };
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
    if (componentMetrics.length === 0) return 100;

    const threshold = this.config.component?.thresholds?.renderTime || 100;
    const avgRenderTime =
      componentMetrics.reduce((sum, m) => {
        if (this.isComponentData(m.data)) {
          return sum + (Number(m.data.renderTime) || 0);
        }
        return sum;
      }, 0) / componentMetrics.length;

    // 评分算法：基于平均渲染时间与阈值的比较
    if (avgRenderTime <= threshold * 0.5) return 100;
    if (avgRenderTime <= threshold) return MAGIC_80;
    if (avgRenderTime <= threshold * 1.5) return SECONDS_PER_MINUTE;
    if (avgRenderTime <= threshold * COUNT_PAIR) return MAGIC_40;
    return MAGIC_20;
  }

  /**
   * 计算网络性能评分
   * Calculate network performance score
   */
  private calculateNetworkScore(metrics: PerformanceMetrics[]): number {
    const networkMetrics = metrics.filter((m) => m.type === 'network');
    if (networkMetrics.length === 0) return 100;

    const threshold = this.config.network?.thresholds?.responseTime || 1000;
    const avgResponseTime =
      networkMetrics.reduce((sum, m) => {
        if (this.isNetworkData(m.data)) {
          return sum + (Number(m.data.responseTime) || 0);
        }
        return sum;
      }, 0) / networkMetrics.length;

    // 评分算法：基于平均响应时间与阈值的比较
    if (avgResponseTime <= threshold * MAGIC_0_3) return 100;
    if (avgResponseTime <= threshold * MAGIC_0_6) return MAGIC_80;
    if (avgResponseTime <= threshold) return SECONDS_PER_MINUTE;
    if (avgResponseTime <= threshold * 1.5) return MAGIC_40;
    return MAGIC_20;
  }

  /**
   * 计算打包性能评分
   * Calculate bundle performance score
   */
  private calculateBundleScore(metrics: PerformanceMetrics[]): number {
    const bundleMetrics = metrics.filter((m) => m.type === 'bundle');
    if (bundleMetrics.length === 0) return 100;

    const threshold = this.config.bundle?.thresholds?.size || BYTES_PER_KB * BYTES_PER_KB; // 1MB
    const totalSize = bundleMetrics.reduce((sum, m) => {
      if (this.isBundleData(m.data)) {
        return sum + (Number(m.data.size) || 0);
      }
      return sum;
    }, 0);

    // 评分算法：基于总打包大小与阈值的比较
    if (totalSize <= threshold * 0.5) return 100;
    if (totalSize <= threshold) return MAGIC_80;
    if (totalSize <= threshold * COUNT_PAIR) return SECONDS_PER_MINUTE;
    if (totalSize <= threshold * COUNT_TRIPLE) return MAGIC_40;
    return MAGIC_20;
  }

  /**
   * 生成详细的性能分析报告
   * Generate detailed performance analysis report
   */
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

    // 组件分析
    const componentMetrics = metrics.filter((m) => m.type === 'component');
    const componentThreshold =
      this.config.component?.thresholds?.renderTime || 100;
    const slowestComponents = componentMetrics
      .filter((m) => {
        if (this.isComponentData(m.data)) {
          return (Number(m.data.renderTime) || 0) > componentThreshold;
        }
        return false;
      })
      .map((m) => {
        if (this.isComponentData(m.data)) {
          return {
            name: m.id || m.type,
            value: Number(m.data.renderTime) || 0,
            threshold: componentThreshold,
          };
        }
        return {
          name: m.id || m.type,
          value: 0,
          threshold: componentThreshold,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, COUNT_FIVE);

    // 网络分析
    const networkMetrics = metrics.filter((m) => m.type === 'network');
    const networkThreshold =
      this.config.network?.thresholds?.responseTime || 1000;
    const slowestRequests = networkMetrics
      .filter((m) => {
        if (this.isNetworkData(m.data)) {
          return (Number(m.data.responseTime) || 0) > networkThreshold;
        }
        return false;
      })
      .map((m) => {
        if (this.isNetworkData(m.data)) {
          return {
            name: m.id || m.type,
            value: Number(m.data.responseTime) || 0,
            threshold: networkThreshold,
          };
        }
        return { name: m.id || m.type, value: 0, threshold: networkThreshold };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, COUNT_FIVE);

    // 打包分析
    const bundleMetrics = metrics.filter((m) => m.type === 'bundle');
    const bundleThreshold = this.config.bundle?.thresholds?.size || BYTES_PER_KB * BYTES_PER_KB;
    const largestBundles = bundleMetrics
      .filter((m) => {
        if (this.isBundleData(m.data)) {
          return (Number(m.data.size) || 0) > bundleThreshold;
        }
        return false;
      })
      .map((m) => {
        if (this.isBundleData(m.data)) {
          return {
            name: m.id || m.type,
            value: Number(m.data.size) || 0,
            threshold: bundleThreshold,
          };
        }
        return { name: m.id || m.type, value: 0, threshold: bundleThreshold };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, COUNT_FIVE);

    return {
      overview,
      analysis: {
        componentAnalysis: {
          slowestComponents,
          renderTimeDistribution: this.calculateDistribution(componentMetrics),
          averageRenderTime:
            componentMetrics.reduce((sum, m) => {
              if (this.isComponentData(m.data)) {
                return sum + (Number(m.data.renderTime) || 0);
              }
              return sum;
            }, 0) / componentMetrics.length || 0,
        },
        networkAnalysis: {
          slowestRequests,
          responseTimeDistribution: this.calculateDistribution(networkMetrics),
          averageResponseTime:
            networkMetrics.reduce((sum, m) => {
              if (this.isNetworkData(m.data)) {
                return sum + (Number(m.data.responseTime) || 0);
              }
              return sum;
            }, 0) / networkMetrics.length || 0,
        },
        bundleAnalysis: {
          largestBundles,
          sizeDistribution: this.calculateDistribution(bundleMetrics),
          totalSize: bundleMetrics.reduce((sum, m) => {
            if (this.isBundleData(m.data)) {
              return sum + (Number(m.data.size) || 0);
            }
            return sum;
          }, 0),
        },
      },
      trends: {
        componentTrend: this.calculateTrend(componentMetrics),
        networkTrend: this.calculateTrend(networkMetrics),
        bundleTrend: this.calculateTrend(bundleMetrics),
      },
    };
  }

  /**
   * 计算分布
   * Calculate distribution
   */
  private calculateDistribution(
    metrics: PerformanceMetrics[],
  ): Record<string, number> {
    const distribution: Record<string, number> = {};

    metrics.forEach((metric) => {
      const key = metric.id || metric.type;
      distribution[key] = (distribution[key] || 0) + 1;
    });

    return distribution;
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

    const firstHalf = sortedMetrics.slice(0, midPoint);
    const secondHalf = sortedMetrics.slice(midPoint);

    const firstAvg =
      firstHalf.reduce((sum, m) => {
        if (this.isComponentData(m.data)) {
          return sum + (Number(m.data.renderTime) || 0);
        } else if (this.isNetworkData(m.data)) {
          return sum + (Number(m.data.responseTime) || 0);
        } else if (this.isBundleData(m.data)) {
          return sum + (Number(m.data.size) || 0);
        }
        return sum;
      }, 0) / firstHalf.length;

    const secondAvg =
      secondHalf.reduce((sum, m) => {
        if (this.isComponentData(m.data)) {
          return sum + (Number(m.data.renderTime) || 0);
        } else if (this.isNetworkData(m.data)) {
          return sum + (Number(m.data.responseTime) || 0);
        } else if (this.isBundleData(m.data)) {
          return sum + (Number(m.data.size) || 0);
        }
        return sum;
      }, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

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

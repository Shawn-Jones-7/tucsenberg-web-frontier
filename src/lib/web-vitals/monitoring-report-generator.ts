/**
 * 性能监控报告生成器
 * 负责生成各种性能监控报告
 */

import { ONE, ZERO } from "@/constants/magic-numbers";
import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import { MonitoringUtils } from '@/lib/web-vitals/monitoring-utils';
import { PerformanceRegressionDetector } from '@/lib/web-vitals/regression-detector';
import type {
  DetailedWebVitals,
  PerformanceBaseline,
  RegressionDetectionResult,
} from './types';

/**
 * 性能监控报告生成器类
 */
export class MonitoringReportGenerator {
  private regressionDetector: PerformanceRegressionDetector;

  constructor(regressionDetector: PerformanceRegressionDetector) {
    this.regressionDetector = regressionDetector;
  }

  /**
   * 生成报告头部信息
   */
  generateReportHeader(metrics: DetailedWebVitals): string[] {
    const lines: string[] = [];
    lines.push('📊 综合性能监控报告');
    lines.push('='.repeat(WEB_VITALS_CONSTANTS.REPORT_ITEM_LIMIT));
    lines.push(`🕐 时间: ${new Date(metrics.page.timestamp).toLocaleString()}`);
    lines.push(`📄 页面: ${metrics.page.title}`);
    lines.push(`🌐 URL: ${metrics.page.url}`);
    lines.push('');
    return lines;
  }

  /**
   * 生成核心指标部分
   */
  generateCoreMetricsSection(metrics: DetailedWebVitals): string[] {
    const lines: string[] = [];
    lines.push('🎯 核心 Web Vitals:');
    lines.push(
      `  CLS: ${metrics.cls.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES_THREE)} ${MonitoringUtils.getMetricStatus('cls', metrics.cls)}`,
    );
    lines.push(
      `  FID: ${Math.round(metrics.fid)}ms ${MonitoringUtils.getMetricStatus('fid', metrics.fid)}`,
    );
    lines.push(
      `  LCP: ${Math.round(metrics.lcp)}ms ${MonitoringUtils.getMetricStatus('lcp', metrics.lcp)}`,
    );
    lines.push(
      `  FCP: ${Math.round(metrics.fcp)}ms ${MonitoringUtils.getMetricStatus('fcp', metrics.fcp)}`,
    );
    lines.push(
      `  TTFB: ${Math.round(metrics.ttfb)}ms ${MonitoringUtils.getMetricStatus('ttfb', metrics.ttfb)}`,
    );
    lines.push('');
    return lines;
  }

  /**
   * 生成基准对比部分
   */
  generateBaselineComparisonSection(
    metrics: DetailedWebVitals,
    baseline: PerformanceBaseline,
  ): string[] {
    const lines: string[] = [];
    lines.push('📈 与基准对比:');
    lines.push(`  基准时间: ${new Date(baseline.timestamp).toLocaleString()}`);

    const metricsToCompare: Array<keyof PerformanceBaseline['metrics']> = [
      'cls',
      'fid',
      'lcp',
      'fcp',
      'ttfb',
    ];

    metricsToCompare.forEach((metric) => {
      // 安全的对象属性访问，避免对象注入
      const safeMetrics = new Map(Object.entries(metrics));
      const safeBaseline = new Map(Object.entries(baseline.metrics));
      const current = safeMetrics.get(metric) as number;
      const baselineValue = safeBaseline.get(metric);

      if (current && baselineValue) {
        const change = current - baselineValue;
        const changePercent =
          (change / baselineValue) * WEB_VITALS_CONSTANTS.PERFECT_SCORE;
        const trend = change > ZERO ? '📈' : change < ZERO ? '📉' : '➡️';
        lines.push(
          `  ${metric.toUpperCase()}: ${trend} ${changePercent > ZERO ? '+' : ''}${changePercent.toFixed(ONE)}%`,
        );
      }
    });

    lines.push('');
    return lines;
  }

  /**
   * 生成慢速资源部分
   */
  generateSlowResourcesSection(metrics: DetailedWebVitals): string[] {
    const lines: string[] = [];

    if (metrics.resourceTiming.slowResources.length > ZERO) {
      lines.push('🐌 慢速资源:');
      metrics.resourceTiming.slowResources
        .slice(ZERO, WEB_VITALS_CONSTANTS.SCORE_MULTIPLIER_POOR)
        .forEach((resource, index) => {
          lines.push(
            `  ${index + ONE}. ${resource.type}: ${resource.duration}ms - ${resource.name.split('/').pop()}`,
          );
        });
      lines.push('');
    }

    return lines;
  }

  /**
   * 生成环境信息部分
   */
  generateEnvironmentSection(metrics: DetailedWebVitals): string[] {
    const lines: string[] = [];
    lines.push('💻 环境信息:');
    lines.push(
      `  视口: ${metrics.device.viewport.width}x${metrics.device.viewport.height}`,
    );

    if (metrics.device.memory) {
      lines.push(`  内存: ${metrics.device.memory}GB`);
    }

    if (metrics.device.cores) {
      lines.push(`  CPU核心: ${metrics.device.cores}`);
    }

    if (metrics.connection) {
      lines.push(
        `  网络: ${metrics.connection.effectiveType} (${metrics.connection.downlink}Mbps)`,
      );
    }

    return lines;
  }

  /**
   * 生成综合性能报告
   */
  generateComprehensiveReport(
    metrics: DetailedWebVitals,
    baseline: PerformanceBaseline | null,
    regressionResult: RegressionDetectionResult | null,
  ): string {
    const sections: string[][] = [];

    // 添加各个部分
    sections.push(this.generateReportHeader(metrics));
    sections.push(this.generateCoreMetricsSection(metrics));

    // 基准对比
    if (baseline) {
      sections.push(this.generateBaselineComparisonSection(metrics, baseline));
    }

    // 回归检测结果
    if (regressionResult) {
      sections.push([
        this.regressionDetector.generateRegressionReport(regressionResult),
        '',
      ]);
    }

    // 慢速资源
    sections.push(this.generateSlowResourcesSection(metrics));

    // 环境信息
    sections.push(this.generateEnvironmentSection(metrics));

    // 合并所有部分
    return sections.flat().join('\n');
  }
}

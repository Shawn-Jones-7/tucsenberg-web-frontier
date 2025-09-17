import { ONE, ZERO } from "@/constants/magic-numbers";
import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import type {
  DetailedWebVitals,
  PerformanceBaseline,
  RegressionDetectionResult,
} from './types';

/**
 * 性能回归检测器
 * 负责检测性能指标的回归和改进
 */
export class PerformanceRegressionDetector {
  private static readonly REGRESSION_THRESHOLDS = {
    cls: {
      warning: WEB_VITALS_CONSTANTS.CLS_WARNING_CHANGE,
      critical: WEB_VITALS_CONSTANTS.CLS_CRITICAL_CHANGE,
    }, // 绝对值变化
    fid: {
      warning: WEB_VITALS_CONSTANTS.FID_WARNING_CHANGE,
      critical: WEB_VITALS_CONSTANTS.FID_CRITICAL_CHANGE,
    }, // ms
    lcp: {
      warning: WEB_VITALS_CONSTANTS.LCP_WARNING_CHANGE,
      critical: WEB_VITALS_CONSTANTS.LCP_CRITICAL_CHANGE,
    }, // ms
    fcp: {
      warning: WEB_VITALS_CONSTANTS.FCP_WARNING_CHANGE,
      critical: WEB_VITALS_CONSTANTS.FCP_CRITICAL_CHANGE,
    }, // ms
    ttfb: {
      warning: WEB_VITALS_CONSTANTS.TTFB_WARNING_CHANGE,
      critical: WEB_VITALS_CONSTANTS.TTFB_CRITICAL_CHANGE,
    }, // ms
    percentChange: {
      warning: WEB_VITALS_CONSTANTS.PERCENT_CHANGE_WARNING,
      critical: WEB_VITALS_CONSTANTS.PERCENT_CHANGE_CRITICAL,
    }, // 百分比变化
  };

  /**
   * 安全地获取指标阈值，避免 Object Injection Sink
   */
  private static getMetricThreshold(
    metric: string,
    severity: 'warning' | 'critical',
  ): number | undefined {
    // 使用白名单验证指标名称和严重程度
    const thresholds = PerformanceRegressionDetector.REGRESSION_THRESHOLDS;

    switch (metric) {
      case 'cls':
        return severity === 'warning'
          ? thresholds.cls.warning
          : thresholds.cls.critical;
      case 'fid':
        return severity === 'warning'
          ? thresholds.fid.warning
          : thresholds.fid.critical;
      case 'lcp':
        return severity === 'warning'
          ? thresholds.lcp.warning
          : thresholds.lcp.critical;
      case 'fcp':
        return severity === 'warning'
          ? thresholds.fcp.warning
          : thresholds.fcp.critical;
      case 'ttfb':
        return severity === 'warning'
          ? thresholds.ttfb.warning
          : thresholds.ttfb.critical;
      default:
        return undefined;
    }
  }

  /**
   * 检测性能回归
   */
  detectRegression(
    current: DetailedWebVitals,
    baseline: PerformanceBaseline,
  ): RegressionDetectionResult {
    const regressions: RegressionDetectionResult['regressions'] = [];

    // 检查每个核心指标
    const metricsToCheck: Array<keyof PerformanceBaseline['metrics']> = [
      'cls',
      'fid',
      'lcp',
      'fcp',
      'ttfb',
    ];

    metricsToCheck.forEach((metric) => {
      // 安全的对象属性访问，避免对象注入
      const safeCurrent = new Map(Object.entries(current));
      const safeBaseline = new Map(Object.entries(baseline.metrics));
      const currentValue = safeCurrent.get(metric) as number;
      const baselineValue = safeBaseline.get(metric);

      if (currentValue && baselineValue) {
        const change = currentValue - baselineValue;
        const changePercent = Math.abs(
          (change / baselineValue) * WEB_VITALS_CONSTANTS.PERFECT_SCORE,
        );

        // 判断是否为回归（性能变差）
        const isRegression = this.isMetricRegression(metric, change);

        if (
          isRegression &&
          changePercent >=
            PerformanceRegressionDetector.REGRESSION_THRESHOLDS.percentChange
              .warning
        ) {
          const severity = this.calculateSeverity(
            metric,
            change,
            changePercent,
          );
          const threshold = this.getThreshold(metric, severity);

          regressions.push({
            metric,
            current: currentValue,
            baseline: baselineValue,
            change,
            changePercent,
            severity,
            threshold,
          });
        }
      }
    });

    return {
      hasRegression: regressions.length > ZERO,
      regressions,
      summary: {
        totalRegressions: regressions.length,
        criticalRegressions: regressions.filter(
          (r) => r.severity === 'critical',
        ).length,
        warningRegressions: regressions.filter((r) => r.severity === 'warning')
          .length,
        overallSeverity: this.calculateOverallSeverity(regressions),
      },
      baseline,
      current,
    };
  }

  /**
   * 判断指标变化是否为回归
   */
  private isMetricRegression(_metric: string, change: number): boolean {
    // 对于所有Web Vitals指标，数值增加都是回归（性能变差）
    return change > ZERO;
  }

  /**
   * 计算回归严重程度
   */
  private calculateSeverity(
    metric: string,
    change: number,
    changePercent: number,
  ): 'warning' | 'critical' {
    const thresholds = PerformanceRegressionDetector.REGRESSION_THRESHOLDS;

    // 基于绝对值变化判断
    const metricThreshold = thresholds[metric as keyof typeof thresholds];
    if (metricThreshold && typeof metricThreshold === 'object') {
      if (Math.abs(change) >= metricThreshold.critical) return 'critical';
      if (Math.abs(change) >= metricThreshold.warning) return 'warning';
    }

    // 基于百分比变化判断
    if (changePercent >= thresholds.percentChange.critical) return 'critical';
    if (changePercent >= thresholds.percentChange.warning) return 'warning';

    return 'warning';
  }

  /**
   * 获取阈值
   */
  private getThreshold(
    metric: string,
    severity: 'warning' | 'critical',
  ): number {
    // 使用安全的方法获取指标阈值
    const metricThreshold = PerformanceRegressionDetector.getMetricThreshold(
      metric,
      severity,
    );

    if (metricThreshold !== undefined) {
      return metricThreshold;
    }

    // 回退到百分比变化阈值
    const thresholds = PerformanceRegressionDetector.REGRESSION_THRESHOLDS;
    return severity === 'warning'
      ? thresholds.percentChange.warning
      : thresholds.percentChange.critical;
  }

  /**
   * 计算总体严重程度
   */
  private calculateOverallSeverity(
    regressions: RegressionDetectionResult['regressions'],
  ): 'none' | 'warning' | 'critical' {
    if (regressions.length === ZERO) return 'none';

    const criticalCount = regressions.filter(
      (r) => r.severity === 'critical',
    ).length;
    if (criticalCount > ZERO) return 'critical';

    return 'warning';
  }

  /**
   * 生成回归报告
   */
  generateRegressionReport(result: RegressionDetectionResult): string {
    const lines: string[] = [];

    lines.push('🔍 性能回归检测报告');
    lines.push('='.repeat(WEB_VITALS_CONSTANTS.PERFORMANCE_SAMPLE_SIZE));
    lines.push(
      `📊 总体严重程度: ${this.getSeverityEmoji(result.summary.overallSeverity)} ${result.summary.overallSeverity}`,
    );
    lines.push(
      `🚨 回归数量: ${result.summary.totalRegressions} (关键: ${result.summary.criticalRegressions})`,
    );

    if (result.regressions.length > ZERO) {
      lines.push('\n🔴 发现的回归:');
      result.regressions.forEach((regression, index) => {
        const icon = this.getSeverityEmoji(regression.severity);
        lines.push(
          `${index + ONE}. ${icon} ${regression.metric.toUpperCase()}: ` +
            `${regression.baseline.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES_TWO)} → ${regression.current.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES_TWO)} ` +
            `(+${regression.changePercent.toFixed(WEB_VITALS_CONSTANTS.DECIMAL_PLACES_ONE)}%)`,
        );
      });
    }

    return lines.join('\n');
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '🟠';
      case 'none':
        return '🟢';
      default:
        return '🟡';
    }
  }
}

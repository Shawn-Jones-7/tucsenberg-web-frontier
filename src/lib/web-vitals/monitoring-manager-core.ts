/**
 * 集成的性能监控管理器 - 核心类
 * 统一管理所有性能监控功能
 */

import { logger } from '@/lib/logger';
import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import { PerformanceAlertSystem } from '@/lib/web-vitals/alert-system';
import { PerformanceBaselineManager } from '@/lib/web-vitals/baseline-manager';
import { EnhancedWebVitalsCollector } from '@/lib/web-vitals/collector';
import { MonitoringReportGenerator } from '@/lib/web-vitals/monitoring-report-generator';
import { MonitoringUtils } from '@/lib/web-vitals/monitoring-utils';
import { PerformanceRegressionDetector } from '@/lib/web-vitals/regression-detector';
import type {
  DetailedWebVitals,
  PerformanceAlertConfig,
  PerformanceBaseline,
  RegressionDetectionResult,
} from './types';

/**
 * 集成的性能监控管理器
 * 统一管理所有性能监控功能
 */
export class PerformanceMonitoringManager {
  private collector: EnhancedWebVitalsCollector;
  private baselineManager: PerformanceBaselineManager;
  private regressionDetector: PerformanceRegressionDetector;
  private alertSystem: PerformanceAlertSystem;
  private reportGenerator: MonitoringReportGenerator;
  private isInitialized = false;

  constructor() {
    this.collector = new EnhancedWebVitalsCollector();
    this.baselineManager = new PerformanceBaselineManager();
    this.regressionDetector = new PerformanceRegressionDetector();
    this.alertSystem = new PerformanceAlertSystem();
    this.reportGenerator = new MonitoringReportGenerator(
      this.regressionDetector,
    );
  }

  /**
   * 初始化性能监控系统
   */
  initialize(config?: {
    alertConfig?: Partial<PerformanceAlertConfig>;
    autoBaseline?: boolean;
    cleanupInterval?: number;
  }): void {
    if (this.isInitialized) return;

    // 配置预警系统
    if (config?.alertConfig) {
      this.alertSystem.configure(config.alertConfig);
    }

    // 设置自动清理
    if (config?.cleanupInterval) {
      setInterval(() => {
        this.baselineManager.cleanupOldBaselines();
      }, config.cleanupInterval);
    }

    // 设置自动基准保存
    if (config?.autoBaseline !== false) {
      this.setupAutoBaseline();
    }

    this.isInitialized = true;
    logger.info('Performance monitoring system initialized');
  }

  /**
   * 执行完整的性能监控流程
   */
  performFullMonitoring(buildInfo?: PerformanceBaseline['buildInfo']): {
    metrics: DetailedWebVitals;
    baseline: PerformanceBaseline | null;
    regressionResult: RegressionDetectionResult | null;
    report: string;
  } {
    try {
      // 1. 收集当前性能指标
      const metrics = this.collector.getDetailedMetrics();

      // 2. 获取基准数据
      const page = MonitoringUtils.extractPageIdentifier(metrics.page.url);
      const locale = MonitoringUtils.extractLocale(metrics.page.url);
      const baseline = this.baselineManager.getRecentBaseline(page, locale);

      // 3. 检测回归
      let regressionResult: RegressionDetectionResult | null = null;
      if (baseline) {
        regressionResult = this.regressionDetector.detectRegression(
          metrics,
          baseline,
        );
      }

      // 4. 检查预警
      this.alertSystem.checkAndAlert(metrics, regressionResult || undefined);

      // 5. 保存新的基准数据（如果需要）
      if (MonitoringUtils.shouldSaveBaseline(metrics, baseline)) {
        this.baselineManager.saveBaseline(metrics, buildInfo);
      }

      // 6. 生成综合报告
      const report = this.reportGenerator.generateComprehensiveReport(
        metrics,
        baseline,
        regressionResult,
      );

      return {
        metrics,
        baseline,
        regressionResult,
        report,
      };
    } catch (error) {
      logger.error('Failed to perform full monitoring', { error });
      throw error;
    }
  }

  /**
   * 设置自动基准保存
   */
  private setupAutoBaseline(): void {
    // 页面加载完成后延迟保存基准
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const metrics = this.collector.getDetailedMetrics();
          if (MonitoringUtils.isValidMetrics(metrics)) {
            this.baselineManager.saveBaseline(metrics);
          }
        }, WEB_VITALS_CONSTANTS.BASELINE_SAVE_DELAY); // 等待5秒确保所有指标收集完成
      });
    }
  }

  /**
   * 获取性能摘要
   */
  getPerformanceSummary(): {
    metrics: DetailedWebVitals;
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  } {
    const metrics = this.collector.getDetailedMetrics();
    const report = this.collector.generateDiagnosticReport();

    const grade = MonitoringUtils.calculateGrade(report.analysis.score);

    return {
      metrics,
      score: report.analysis.score,
      grade,
    };
  }

  /**
   * 获取收集器实例
   */
  getCollector(): EnhancedWebVitalsCollector {
    return this.collector;
  }

  /**
   * 获取基准管理器实例
   */
  getBaselineManager(): PerformanceBaselineManager {
    return this.baselineManager;
  }

  /**
   * 获取回归检测器实例
   */
  getRegressionDetector(): PerformanceRegressionDetector {
    return this.regressionDetector;
  }

  /**
   * 获取预警系统实例
   */
  getAlertSystem(): PerformanceAlertSystem {
    return this.alertSystem;
  }

  /**
   * 获取报告生成器实例
   */
  getReportGenerator(): MonitoringReportGenerator {
    return this.reportGenerator;
  }

  /**
   * 检查是否已初始化
   */
  isSystemInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.collector.cleanup();
    this.isInitialized = false;
  }
}

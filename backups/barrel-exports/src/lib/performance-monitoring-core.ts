// 导入主要功能用于向后兼容
import { PerformanceConfigManager } from '@/../backups/barrel-exports/src/lib/performance-monitoring-core-config';
import { PerformanceMetricsManager } from '@/../backups/barrel-exports/src/lib/performance-monitoring-core-metrics';
import {
  PerformanceToolConflictChecker,
  type ToolConflictResult,
} from './performance-monitoring-core-conflicts';
import {
  PerformanceReportGenerator,
  type PerformanceReport,
} from './performance-monitoring-core-reports';
import type {
  PerformanceConfig,
  PerformanceMetrics,
} from './performance-monitoring-types';

/**
 * 性能监控核心协调器 - 主入口
 * Performance Monitoring Core Coordinator - Main Entry Point
 *
 * 统一的性能监控核心入口，整合所有性能监控功能模块
 */

// 重新导出所有模块的功能
export * from '@/../backups/barrel-exports/src/lib/performance-monitoring-core-config';
export * from '@/../backups/barrel-exports/src/lib/performance-monitoring-core-metrics';
export * from '@/../backups/barrel-exports/src/lib/performance-monitoring-core-reports';
export * from '@/../backups/barrel-exports/src/lib/performance-monitoring-core-conflicts';

/**
 * 性能监控核心协调器类 - 向后兼容
 * Performance monitoring core coordinator class - Backward compatible
 */
export class PerformanceMonitoringCore {
  private configManager: PerformanceConfigManager;
  private metricsManager: PerformanceMetricsManager;
  private reportGenerator: PerformanceReportGenerator;
  private conflictChecker: PerformanceToolConflictChecker;

  constructor(customConfig?: Partial<PerformanceConfig>) {
    this.configManager = new PerformanceConfigManager(customConfig);
    this.metricsManager = new PerformanceMetricsManager(
      this.configManager.getConfig(),
    );
    this.reportGenerator = new PerformanceReportGenerator(
      this.configManager.getConfig(),
    );
    this.conflictChecker = new PerformanceToolConflictChecker();
  }

  /**
   * 记录性能指标
   * Record performance metric
   */
  recordMetric(metric: Omit<PerformanceMetrics, 'timestamp'>): void {
    this.metricsManager.recordMetric(metric);
  }

  /**
   * 获取配置
   * Get configuration
   */
  getConfig(): PerformanceConfig {
    return this.configManager.getConfig();
  }

  /**
   * 更新配置
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.configManager.updateConfig(newConfig);

    // 更新所有管理器的配置
    const updatedConfig = this.configManager.getConfig();
    this.metricsManager.updateConfig(updatedConfig);
    this.reportGenerator.updateConfig(updatedConfig);
  }

  /**
   * 获取指标
   * Get metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return this.metricsManager.getAllMetrics();
  }

  /**
   * 按类型获取指标
   * Get metrics by type
   */
  getMetricsByType(type: PerformanceMetricType): PerformanceMetrics[] {
    return this.metricsManager.getMetricsByType(type);
  }

  /**
   * 按来源获取指标
   * Get metrics by source
   */
  getMetricsBySource(source: PerformanceMetricSource): PerformanceMetrics[] {
    return this.metricsManager.getMetricsBySource(source);
  }

  /**
   * 获取指定时间窗口内的指标
   * Get metrics within time window
   */
  getMetricsInTimeWindow(timeWindow: number): PerformanceMetrics[] {
    return this.metricsManager.getMetricsInTimeWindow(timeWindow);
  }

  /**
   * 生成性能报告
   * Generate performance report
   */
  generateReport(timeWindow = 60 * 1000): PerformanceReport {
    const metrics = this.metricsManager.getAllMetrics();
    return this.reportGenerator.generateReport(metrics, timeWindow);
  }

  /**
   * 生成详细性能报告
   * Generate detailed performance report
   */
  generateDetailedReport(): ReturnType<
    PerformanceReportGenerator['generateDetailedReport']
  > {
    const metrics = this.metricsManager.getAllMetrics();
    return this.reportGenerator.generateDetailedReport(metrics);
  }

  /**
   * 检查工具冲突
   * Check tool conflicts
   */
  checkToolConflicts(): ToolConflictResult {
    return this.conflictChecker.checkToolConflicts();
  }

  /**
   * 获取工具详细信息
   * Get tool details
   */
  getToolDetails(
    toolName: string,
  ): ReturnType<PerformanceToolConflictChecker['getToolDetails']> {
    return this.conflictChecker.getToolDetails(toolName);
  }

  /**
   * 获取指标统计
   * Get metrics statistics
   */
  getMetricsStats(): ReturnType<PerformanceMetricsManager['getMetricsStats']> {
    return this.metricsManager.getMetricsStats();
  }

  /**
   * 清空所有指标
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.metricsManager.clearAllMetrics();
  }

  /**
   * 导出指标数据
   * Export metrics data
   */
  exportMetrics(): ReturnType<PerformanceMetricsManager['exportMetrics']> {
    return this.metricsManager.exportMetrics();
  }

  /**
   * 导入指标数据
   * Import metrics data
   */
  importMetrics(data: PerformanceMetrics[], replace = false): number {
    return this.metricsManager.importMetrics(data, replace);
  }

  /**
   * 销毁协调器
   * Destroy coordinator
   */
  destroy(): void {
    this.metricsManager.destroy();
  }
}

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
export type { PerformanceMonitoringCore as PerformanceCoordinator };

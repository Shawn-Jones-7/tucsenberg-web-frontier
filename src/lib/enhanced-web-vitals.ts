// 导入实例用于内部函数使用
import {
  enhancedWebVitalsCollector,
  performanceAlertSystem,
  performanceMonitoringManager,
} from './web-vitals';

/**
 * Enhanced Web Vitals - 统一导出接口
 *
 * 这个文件作为Web Vitals增强监控系统的主要入口点，
 * 重新导出所有相关的类、类型和实例，确保向后兼容性。
 */

// 重新导出所有类型
export type {
  DetailedWebVitals,
  PerformanceAlert,
  PerformanceAlertConfig,
  PerformanceBaseline,
  PerformanceMonitoringConfig,
  PerformanceMonitoringStatus,
  RegressionDetectionResult,
} from './web-vitals/types';

// 重新导出常量
export { PERFORMANCE_THRESHOLDS } from '@/lib/web-vitals/constants';

// 重新导出所有类
export { PerformanceAlertSystem } from '@/lib/web-vitals/alert-system';
export { PerformanceBaselineManager } from '@/lib/web-vitals/baseline-manager';
export { EnhancedWebVitalsCollector } from '@/lib/web-vitals/collector';
export { PerformanceMonitoringManager } from '@/lib/web-vitals/monitoring-manager';
export { PerformanceRegressionDetector } from '@/lib/web-vitals/regression-detector';

// 重新导出实例
export {
  default,
  enhancedWebVitalsCollector,
  performanceAlertSystem,
  performanceBaselineManager,
  performanceMonitoringManager,
  performanceRegressionDetector,
} from './web-vitals';

// 为了向后兼容，也导出一些常用的别名
export {
  performanceMonitoringManager as monitoringManager,
  enhancedWebVitalsCollector as webVitalsCollector,
} from './web-vitals';

/**
 * 快速启动性能监控的便捷函数
 */
export function initializePerformanceMonitoring(config?: {
  enableAlerts?: boolean;
  alertThresholds?: {
    cls?: { warning: number; critical: number };
    lcp?: { warning: number; critical: number };
    fid?: { warning: number; critical: number };
    fcp?: { warning: number; critical: number };
    ttfb?: { warning: number; critical: number };
    score?: { warning: number; critical: number };
  };
}) {
  // 使用已导入的模块实例

  // 初始化监控管理器
  performanceMonitoringManager.initialize();

  // 配置预警系统
  if (config?.enableAlerts) {
    performanceAlertSystem.configure({
      enabled: true,
      thresholds: {
        cls: config.alertThresholds?.cls || { warning: 0.1, critical: 0.25 },
        lcp: config.alertThresholds?.lcp || { warning: 2500, critical: 4000 },
        fid: config.alertThresholds?.fid || { warning: 100, critical: 300 },
        fcp: config.alertThresholds?.fcp || { warning: 1800, critical: 3000 },
        ttfb: config.alertThresholds?.ttfb || { warning: 800, critical: 1800 },
        score: config.alertThresholds?.score || { warning: 70, critical: 50 },
      },
    });
  }

  return {
    monitoringManager: performanceMonitoringManager,
    alertSystem: performanceAlertSystem,
  };
}

/**
 * 获取当前页面的性能诊断报告
 */
export function generatePerformanceDiagnostics() {
  // 使用已导入的模块实例
  return enhancedWebVitalsCollector.generateDiagnosticReport();
}

/**
 * 执行完整的性能监控流程
 */
export function performFullPerformanceMonitoring(buildInfo?: {
  version: string;
  commit: string;
  branch: string;
  timestamp: number;
}) {
  // 使用已导入的模块实例
  return performanceMonitoringManager.performFullMonitoring(buildInfo);
}

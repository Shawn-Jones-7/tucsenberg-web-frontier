// 导入实例用于内部函数使用
import { COUNT_800, MAGIC_1800, MAGIC_2500, MAGIC_4000, MAGIC_70 } from "@/constants/count";
import { MAGIC_0_1, MAGIC_0_25 } from "@/constants/decimal";
import { ANIMATION_DURATION_NORMAL, PERCENTAGE_FULL, PERCENTAGE_HALF, THREE_SECONDS_MS } from "@/constants/magic-numbers";
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
  RegressionDetectionResult
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
  performanceRegressionDetector
} from './web-vitals';

// 为了向后兼容，也导出一些常用的别名
export {
  performanceMonitoringManager as monitoringManager,
  enhancedWebVitalsCollector as webVitalsCollector
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
        cls: config.alertThresholds?.cls || { warning: MAGIC_0_1, critical: MAGIC_0_25 },
        lcp: config.alertThresholds?.lcp || { warning: MAGIC_2500, critical: MAGIC_4000 },
        fid: config.alertThresholds?.fid || { warning: PERCENTAGE_FULL, critical: ANIMATION_DURATION_NORMAL },
        fcp: config.alertThresholds?.fcp || { warning: MAGIC_1800, critical: THREE_SECONDS_MS },
        ttfb: config.alertThresholds?.ttfb || { warning: COUNT_800, critical: MAGIC_1800 },
        score: config.alertThresholds?.score || { warning: MAGIC_70, critical: PERCENTAGE_HALF },
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

// 创建并导出全局实例
import { PerformanceAlertSystem } from '@/lib/web-vitals/alert-system';
import { PerformanceBaselineManager } from '@/lib/web-vitals/baseline-manager';
import { EnhancedWebVitalsCollector } from '@/lib/web-vitals/collector';
import { PerformanceMonitoringManager } from '@/lib/web-vitals/monitoring-manager';
import { PerformanceRegressionDetector } from '@/lib/web-vitals/regression-detector';

/**
 * Web Vitals 增强监控系统
 * 统一导出所有类和实例
 */

// 导出类型
export type {
  DetailedWebVitals,
  PerformanceAlert,
  PerformanceAlertConfig,
  PerformanceBaseline,
  PerformanceMonitoringConfig,
  PerformanceMonitoringStatus,
  RegressionDetectionResult,
} from './types';

// 导出常量
export { PERFORMANCE_THRESHOLDS } from '@/lib/web-vitals/constants';

// 导出类
export { PerformanceAlertSystem } from '@/lib/web-vitals/alert-system';
export { PerformanceBaselineManager } from '@/lib/web-vitals/baseline-manager';
export { EnhancedWebVitalsCollector } from '@/lib/web-vitals/collector';
export { PerformanceMonitoringManager } from '@/lib/web-vitals/monitoring-manager';
export { PerformanceRegressionDetector } from '@/lib/web-vitals/regression-detector';

export const enhancedWebVitalsCollector = new EnhancedWebVitalsCollector();
export const performanceBaselineManager = new PerformanceBaselineManager();
export const performanceRegressionDetector =
  new PerformanceRegressionDetector();
export const performanceAlertSystem = new PerformanceAlertSystem();
export const performanceMonitoringManager = new PerformanceMonitoringManager();

// 默认导出监控管理器
export { performanceMonitoringManager as default };

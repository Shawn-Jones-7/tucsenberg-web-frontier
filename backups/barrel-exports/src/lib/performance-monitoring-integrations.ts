// 向后兼容的重新导出
import type { BundleAnalyzerIntegration } from '@/../backups/barrel-exports/src/lib/performance-monitoring-integrations-bundle';
import type { ReactScanIntegration } from '@/../backups/barrel-exports/src/lib/performance-monitoring-integrations-react-scan';
import type { WebEvalAgentIntegration } from '@/../backups/barrel-exports/src/lib/performance-monitoring-integrations-web-eval';
import {
  BundleAnalyzerAnalyzer,
  BundleAnalyzerUtils,
  useBundleAnalyzerIntegration,
  validateBundleAnalyzerConfig,
} from './performance-monitoring-integrations-bundle';
import {
  ReactScanAnalyzer,
  ReactScanUtils,
  useReactScanIntegration,
  validateReactScanConfig,
} from './performance-monitoring-integrations-react-scan';
import type {
  EnvironmentCompatibilityResult,
  WebVitalsIntegration,
} from './performance-monitoring-integrations-vitals';
import {
  checkEnvironmentCompatibility,
  performHealthCheck,
  useWebVitalsIntegration,
  validateWebVitalsConfig,
  WebVitalsAnalyzer,
} from './performance-monitoring-integrations-vitals';
import {
  useWebEvalAgentIntegration,
  validateWebEvalAgentConfig,
  WebEvalAgentAnalyzer,
} from './performance-monitoring-integrations-web-eval';
import type {
  PerformanceConfig,
  PerformanceMetrics,
} from './performance-monitoring-types';

/**
 * 性能监控集成钩子和工具 - 主入口
 * Performance Monitoring Integrations - Main Entry Point
 *
 * 统一的性能监控集成入口，整合所有集成模块
 */

// 重新导出所有模块的功能
export * from '@/../backups/barrel-exports/src/lib/performance-monitoring-integrations-react-scan';
export * from '@/../backups/barrel-exports/src/lib/performance-monitoring-integrations-web-eval';
export * from '@/../backups/barrel-exports/src/lib/performance-monitoring-integrations-bundle';
export * from '@/../backups/barrel-exports/src/lib/performance-monitoring-integrations-vitals';

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
export type {
  // React Scan 集成
  ReactScanIntegration as ReactScan,

  // Web Eval Agent 集成
  WebEvalAgentIntegration as WebEvalAgent,

  // Bundle Analyzer 集成
  BundleAnalyzerIntegration as BundleAnalyzer,

  // Web Vitals 集成
  WebVitalsIntegration as WebVitals,

  // 环境检查
  EnvironmentCompatibilityResult as EnvironmentCheck,
};

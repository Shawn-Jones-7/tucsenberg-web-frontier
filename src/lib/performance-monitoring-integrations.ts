// 向后兼容的重新导出（仅保留别名所需的类型导入）
import type { BundleAnalyzerIntegration } from '@/lib/performance-monitoring-integrations-bundle';
import type { ReactScanIntegration } from '@/lib/performance-monitoring-integrations-react-scan';
import type { EnvironmentCompatibilityResult, WebVitalsIntegration } from '@/lib/performance-monitoring-integrations-vitals';
import type { WebEvalAgentIntegration } from '@/lib/performance-monitoring-integrations-web-eval';

/**
 * 性能监控集成钩子和工具 - 主入口
 * Performance Monitoring Integrations - Main Entry Point
 *
 * 统一的性能监控集成入口，整合所有集成模块
 */

// 重新导出所有模块的功能
export type { ReactScanIntegration } from '@/lib/performance-monitoring-integrations-react-scan';
export {
  useReactScanIntegration,
  validateReactScanConfig,
  ReactScanAnalyzer,
  ReactScanUtils,
} from '@/lib/performance-monitoring-integrations-react-scan';
export type { WebEvalAgentIntegration } from '@/lib/performance-monitoring-integrations-web-eval';
export {
  useWebEvalAgentIntegration,
  validateWebEvalAgentConfig,
  WebEvalAgentAnalyzer,
} from '@/lib/performance-monitoring-integrations-web-eval';
export type { BundleAnalyzerIntegration } from '@/lib/performance-monitoring-integrations-bundle';
export {
  useBundleAnalyzerIntegration,
  validateBundleAnalyzerConfig,
  BundleAnalyzerAnalyzer,
  BundleAnalyzerUtils,
} from '@/lib/performance-monitoring-integrations-bundle';
export type {
  WebVitalsIntegration,
  EnvironmentCompatibilityResult,
} from '@/lib/performance-monitoring-integrations-vitals';
export {
  useWebVitalsIntegration,
  checkEnvironmentCompatibility,
  performHealthCheck,
  validateWebVitalsConfig,
  WebVitalsAnalyzer,
} from '@/lib/performance-monitoring-integrations-vitals';

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

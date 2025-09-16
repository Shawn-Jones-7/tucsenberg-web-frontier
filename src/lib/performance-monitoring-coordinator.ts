// 导入核心功能
import { PerformanceMonitoringCore } from '@/lib/performance-monitoring-core';
import type { PerformanceConfig } from '@/lib/performance-monitoring-types';
import { generateEnvironmentConfig } from '@/lib/performance-monitoring-types';

/**
 * 性能监控协调器 - 主入口文件
 * Performance Monitoring Coordinator - Main Entry Point
 *
 * 统一管理多个性能监控工具的协调运作：
 * - React Scan: 实时组件性能监控
 * - Web Eval Agent: 端到端用户体验测试
 * - Bundle Analyzer: 构建产物分析
 * - Size Limit: 包大小监控
 * - Web Vitals: 核心网页指标监控
 */

// 重新导出所有模块的类型和功能
export {
  PerformanceMetricSource,
  PerformanceMetricType,
  PerformanceMetrics,
  ReactScanConfig,
  WebEvalAgentConfig,
  BundleAnalyzerConfig,
  SizeLimitConfig,
  WebVitalsConfig,
  PerformanceConfig,
  Environment,
  getCurrentEnvironment,
  isTestEnvironment,
  isDevelopmentEnvironment,
  isProductionEnvironment,
  generateEnvironmentConfig,
  validateConfig,
} from './performance-monitoring-types';
export {
  PerformanceConfigManager,
  createConfigManager,
  getDefaultConfig,
  validatePerformanceConfig,
  PerformanceMetricsManager,
  createMetricsManager,
  PerformanceReport,
  PerformanceReportGenerator,
  createReportGenerator,
  ToolConflictResult,
  PerformanceToolConflictChecker,
  createConflictChecker,
  quickConflictCheck,
  PerformanceMonitoringCore,
  PerformanceCoordinator,
} from './performance-monitoring-core';
export {
  ReactScanIntegration,
  useReactScanIntegration,
  validateReactScanConfig,
  ReactScanAnalyzer,
  ReactScanUtils,
  WebEvalAgentIntegration,
  useWebEvalAgentIntegration,
  validateWebEvalAgentConfig,
  WebEvalAgentAnalyzer,
  BundleAnalyzerIntegration,
  useBundleAnalyzerIntegration,
  validateBundleAnalyzerConfig,
  BundleAnalyzerAnalyzer,
  BundleAnalyzerUtils,
  WebVitalsIntegration,
  useWebVitalsIntegration,
  EnvironmentCompatibilityResult,
  checkEnvironmentCompatibility,
  performHealthCheck,
  validateWebVitalsConfig,
  WebVitalsAnalyzer,
  ReactScan,
  WebEvalAgent,
  BundleAnalyzer,
  WebVitals,
  EnvironmentCheck,
} from './performance-monitoring-integrations';

/**
 * 性能监控协调器 - 向后兼容的主类
 * Performance Monitoring Coordinator - Backward compatible main class
 */
export class PerformanceMonitoringCoordinator extends PerformanceMonitoringCore {
  constructor(customConfig?: Partial<PerformanceConfig>) {
    super(customConfig);
  }
}

// ==================== 全局实例和便捷导出 ====================

/**
 * 全局性能监控协调器实例
 * Global performance monitoring coordinator instance
 */
export const performanceCoordinator = new PerformanceMonitoringCoordinator();

// ==================== 便捷工厂函数 ====================

/**
 * 创建性能监控协调器实例
 * Create performance monitoring coordinator instance
 */
export function createPerformanceCoordinator(
  customConfig?: Partial<PerformanceConfig>,
): PerformanceMonitoringCoordinator {
  return new PerformanceMonitoringCoordinator(customConfig);
}

/**
 * 获取默认环境配置
 * Get default environment configuration
 */
export function getDefaultConfig(): PerformanceConfig {
  return generateEnvironmentConfig();
}

// ==================== 便捷集成钩子 ====================

/**
 * React Scan 集成钩子 (向后兼容)
 * React Scan integration hook (backward compatible)
 */
export function useReactScanIntegration() {
  const config = performanceCoordinator.getConfig();

  return {
    enabled: config.reactScan.enabled,
    recordRender: (componentName: string, renderCount: number) => {
      if (config.reactScan.enabled) {
        performanceCoordinator.recordMetric({
          source: 'react-scan',
          type: 'component',
          data: {
            componentName,
            renderCount,
            timestamp: Date.now(),
          },
        });
      }
    },
  };
}

/**
 * Web Eval Agent 集成钩子 (向后兼容)
 * Web Eval Agent integration hook (backward compatible)
 */
export function useWebEvalAgentIntegration() {
  const config = performanceCoordinator.getConfig();

  return {
    enabled: config.webEvalAgent.enabled,
    recordUserInteraction: (
      action: string,
      timing: number,
      success: boolean,
    ) => {
      if (config.webEvalAgent.enabled) {
        performanceCoordinator.recordMetric({
          source: 'web-eval-agent',
          type: 'user-interaction',
          data: {
            action,
            timing,
            success,
            timestamp: Date.now(),
          },
        });
      }
    },
    recordNetworkRequest: (
      url: string,
      method: string,
      status: number,
      timing: number,
    ) => {
      if (config.webEvalAgent.enabled && config.webEvalAgent.captureNetwork) {
        performanceCoordinator.recordMetric({
          source: 'web-eval-agent',
          type: 'network',
          data: {
            url,
            method,
            status,
            timing,
            timestamp: Date.now(),
          },
        });
      }
    },
  };
}

/**
 * 环境检查工具 (向后兼容)
 * Environment check tool (backward compatible)
 */
export function checkEnvironmentCompatibility(): {
  isCompatible: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 检查测试环境配置
  if (process.env.PLAYWRIGHT_TEST === 'true') {
    if (process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN !== 'true') {
      issues.push('测试环境中 React Scan 未被禁用');
      recommendations.push('设置 NEXT_PUBLIC_DISABLE_REACT_SCAN=true');
    }
  }

  // 检查开发环境配置
  if (process.env.NODE_ENV === 'development') {
    if (process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN === 'true') {
      recommendations.push(
        '开发环境中 React Scan 被禁用，考虑启用以获得性能监控',
      );
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    recommendations,
  };
}

// ==================== 默认导出 ====================

/**
 * 默认导出全局协调器实例
 * Default export global coordinator instance
 */
export default performanceCoordinator;

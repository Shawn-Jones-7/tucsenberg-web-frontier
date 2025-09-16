import { COUNT_PAIR, MAGIC_0_9, MAGIC_1_1, OFFSET_NEGATIVE_EXTRA_LARGE, OFFSET_NEGATIVE_LARGE, OFFSET_NEGATIVE_MEDIUM, PERCENTAGE_HALF } from '@/constants/magic-numbers';

/**
 * Web Vitals 和环境检查性能监控集成
 * Web Vitals and Environment Check Performance Monitoring Integration
 *
 * 提供与Web Vitals工具的集成钩子和环境兼容性检查功能
 */

import type {
  PerformanceConfig,
  PerformanceMetrics,
} from './performance-monitoring-types';
import {
  isDevelopmentEnvironment,
  isTestEnvironment,
} from './performance-monitoring-types';

/**
 * Web Vitals 集成钩子返回类型
 * Web Vitals integration hook return type
 */
export interface WebVitalsIntegration {
  enabled: boolean;
  recordWebVital: (
    name: string,
    value: number,
    rating: 'good' | 'needs-improvement' | 'poor',
  ) => void;
  recordCustomMetric: (name: string, value: number, unit?: string) => void;
}

/**
 * Web Vitals 集成钩子
 * Web Vitals integration hook
 */
export function useWebVitalsIntegration(
  config: PerformanceConfig,
  recordMetric: (metric: Omit<PerformanceMetrics, 'timestamp'>) => void,
): WebVitalsIntegration {
  return {
    enabled: config.webVitals?.enabled || false,

    recordWebVital: (
      name: string,
      value: number,
      rating: 'good' | 'needs-improvement' | 'poor',
    ) => {
      if (!config.webVitals?.enabled) return;

      recordMetric({
        source: 'web-vitals',
        type: 'page',
        data: {
          name,
          value,
          rating,
          timestamp: Date.now(),
        },
        tags: ['web-vitals', name.toLowerCase()],
        priority: rating === 'poor' ? 'high' : 'medium',
      });
    },

    recordCustomMetric: (name: string, value: number, unit = 'ms') => {
      if (!config.webVitals?.enabled) return;

      recordMetric({
        source: 'custom',
        type: 'page',
        data: {
          name,
          value,
          unit,
          timestamp: Date.now(),
        },
        tags: ['custom-metric'],
        priority: 'low',
      });
    },
  };
}

/**
 * 环境兼容性检查结果
 * Environment compatibility check result
 */
export interface EnvironmentCompatibilityResult {
  isCompatible: boolean;
  issues: string[];
  recommendations: string[];
  environment: string;
  warnings: string[];
}

/**
 * 环境兼容性检查
 * Environment compatibility check
 */
export function checkEnvironmentCompatibility(): EnvironmentCompatibilityResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const warnings: string[] = [];
  const environment = process.env.NODE_ENV || 'development';

  // 检查测试环境配置
  if (isTestEnvironment()) {
    if (process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN !== 'true') {
      issues.push('测试环境中 React Scan 未被禁用');
      recommendations.push('设置 NEXT_PUBLIC_DISABLE_REACT_SCAN=true');
    }

    if (process.env.NEXT_PUBLIC_ENABLE_WEB_EVAL_AGENT !== 'true') {
      warnings.push('测试环境中 Web Eval Agent 未启用');
      recommendations.push('考虑设置 NEXT_PUBLIC_ENABLE_WEB_EVAL_AGENT=true');
    }
  }

  // 检查开发环境配置
  if (isDevelopmentEnvironment()) {
    if (process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN === 'true') {
      warnings.push('开发环境中 React Scan 被禁用');
      recommendations.push('考虑启用 React Scan 以获得性能监控');
    }

    if (!process.env.ANALYZE && process.env.NODE_ENV === 'development') {
      recommendations.push(
        '考虑定期运行 ANALYZE=true npm run build 来分析包大小',
      );
    }
  }

  // 检查生产环境配置
  if (environment === 'production') {
    if (process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN !== 'true') {
      issues.push('生产环境中 React Scan 未被禁用');
      recommendations.push(
        '在生产环境中设置 NEXT_PUBLIC_DISABLE_REACT_SCAN=true',
      );
    }

    if (process.env.ANALYZE === 'true') {
      warnings.push('生产环境中启用了 Bundle Analyzer');
      recommendations.push('生产环境中应禁用 Bundle Analyzer');
    }
  }

  // 检查必要的环境变量
  const requiredEnvVars = ['NODE_ENV'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      issues.push(`缺少必要的环境变量: ${envVar}`);
      recommendations.push(`设置环境变量 ${envVar}`);
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    recommendations,
    environment,
    warnings,
  };
}

/**
 * 性能监控健康检查
 * Performance monitoring health check
 */
export function performHealthCheck(config: PerformanceConfig): {
  isHealthy: boolean;
  status: Record<string, 'healthy' | 'warning' | 'error'>;
  details: Record<string, string>;
} {
  const status: Record<string, 'healthy' | 'warning' | 'error'> = {};
  const details: Record<string, string> = {};

  // 检查 React Scan 状态
  if (config.reactScan.enabled) {
    if (isTestEnvironment()) {
      status.reactScan = 'error';
      details.reactScan = 'React Scan should be disabled in test environment';
    } else if (isDevelopmentEnvironment()) {
      status.reactScan = 'healthy';
      details.reactScan = 'React Scan is properly configured for development';
    } else {
      status.reactScan = 'warning';
      details.reactScan =
        'React Scan is enabled in non-development environment';
    }
  } else {
    status.reactScan = 'healthy';
    details.reactScan = 'React Scan is disabled';
  }

  // 检查 Web Eval Agent 状态
  if (config.webEvalAgent.enabled) {
    if (isTestEnvironment()) {
      status.webEvalAgent = 'healthy';
      details.webEvalAgent =
        'Web Eval Agent is properly configured for testing';
    } else {
      status.webEvalAgent = 'warning';
      details.webEvalAgent =
        'Web Eval Agent is enabled outside test environment';
    }
  } else {
    status.webEvalAgent = 'healthy';
    details.webEvalAgent = 'Web Eval Agent is disabled';
  }

  // 检查 Bundle Analyzer 状态
  status.bundleAnalyzer = config.bundleAnalyzer.enabled ? 'healthy' : 'healthy';
  details.bundleAnalyzer = config.bundleAnalyzer.enabled
    ? 'Bundle Analyzer is enabled'
    : 'Bundle Analyzer is disabled';

  // 检查 Size Limit 状态
  status.sizeLimit = config.sizeLimit.enabled ? 'healthy' : 'warning';
  details.sizeLimit = config.sizeLimit.enabled
    ? 'Size Limit monitoring is active'
    : 'Size Limit monitoring is disabled';

  const isHealthy = Object.values(status).every((s) => s !== 'error');

  return {
    isHealthy,
    status,
    details,
  };
}

/**
 * Web Vitals 配置验证
 * Web Vitals configuration validation
 */
export function validateWebVitalsConfig(config: PerformanceConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.webVitals) {
    if (typeof config.webVitals.enabled !== 'boolean') {
      errors.push('Web Vitals enabled must be a boolean');
    }

    if (config.webVitals.enabled) {
      if (
        config.webVitals.reportAllChanges &&
        typeof config.webVitals.reportAllChanges !== 'boolean'
      ) {
        warnings.push('Web Vitals reportAllChanges should be a boolean');
      }

      if (config.webVitals.thresholds) {
        const {thresholds} = config.webVitals;

        if (
          thresholds.lcp &&
          (typeof thresholds.lcp !== 'number' || thresholds.lcp <= 0)
        ) {
          warnings.push('Web Vitals LCP threshold should be a positive number');
        }

        if (
          thresholds.fid &&
          (typeof thresholds.fid !== 'number' || thresholds.fid <= 0)
        ) {
          warnings.push('Web Vitals FID threshold should be a positive number');
        }

        if (
          thresholds.cls &&
          (typeof thresholds.cls !== 'number' || thresholds.cls <= 0)
        ) {
          warnings.push('Web Vitals CLS threshold should be a positive number');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Web Vitals 性能分析器
 * Web Vitals performance analyzer
 */
export class WebVitalsAnalyzer {
  private vitals = new Map<
    string,
    {
      values: number[];
      ratings: Array<'good' | 'needs-improvement' | 'poor'>;
      lastUpdated: number;
    }
  >();

  private customMetrics = new Map<
    string,
    {
      values: number[];
      unit: string;
      lastUpdated: number;
    }
  >();

  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * 记录Web Vital指标
   * Record Web Vital metric
   */
  recordWebVital(
    name: string,
    value: number,
    rating: 'good' | 'needs-improvement' | 'poor',
  ): void {
    if (!this.config.webVitals?.enabled) return;

    const current = this.vitals.get(name) || {
      values: [],
      ratings: [],
      lastUpdated: 0,
    };

    current.values.push(value);
    current.ratings.push(rating);
    current.lastUpdated = Date.now();

    this.vitals.set(name, current);

    // 保持数组大小在合理范围内
    if (current.values.length > 100) {
      current.values = current.values.slice(OFFSET_NEGATIVE_EXTRA_LARGE);
      current.ratings = current.ratings.slice(OFFSET_NEGATIVE_EXTRA_LARGE);
    }
  }

  /**
   * 记录自定义指标
   * Record custom metric
   */
  recordCustomMetric(name: string, value: number, unit = 'ms'): void {
    if (!this.config.webVitals?.enabled) return;

    const current = this.customMetrics.get(name) || {
      values: [],
      unit,
      lastUpdated: 0,
    };

    current.values.push(value);
    current.lastUpdated = Date.now();

    this.customMetrics.set(name, current);

    // 保持数组大小在合理范围内
    if (current.values.length > 100) {
      current.values = current.values.slice(OFFSET_NEGATIVE_EXTRA_LARGE);
    }
  }

  /**
   * 获取Web Vitals报告
   * Get Web Vitals report
   */
  getWebVitalsReport(): {
    vitals: Record<
      string,
      {
        average: number;
        latest: number;
        trend: 'improving' | 'stable' | 'degrading';
        rating: 'good' | 'needs-improvement' | 'poor';
      }
    >;
    score: number;
    recommendations: string[];
  } {
    const vitals: Record<
      string,
      {
        average: number;
        latest: number;
        trend: 'improving' | 'stable' | 'degrading';
        rating: 'good' | 'needs-improvement' | 'poor';
      }
    > = {};
    let totalScore = 0;
    let vitalCount = 0;

    for (const [name, data] of this.vitals.entries()) {
      if (data.values.length === 0) continue;

      const average =
        data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
      const latest = data.values[data.values.length - 1] ?? 0;
      const latestRating = data.ratings[data.ratings.length - 1] ?? 'poor';

      // 计算趋势
      let trend: 'improving' | 'stable' | 'degrading' = 'stable';
      if (data.values.length >= COUNT_PAIR) {
        const recent = data.values.slice(OFFSET_NEGATIVE_MEDIUM);
        const older = data.values.slice(OFFSET_NEGATIVE_LARGE, OFFSET_NEGATIVE_MEDIUM);
        if (recent.length > 0 && older.length > 0) {
          const recentAvg =
            recent.reduce((sum, val) => sum + val, 0) / recent.length;
          const olderAvg =
            older.reduce((sum, val) => sum + val, 0) / older.length;

          if (recentAvg < olderAvg * MAGIC_0_9) trend = 'improving';
          else if (recentAvg > olderAvg * MAGIC_1_1) trend = 'degrading';
        }
      }

      vitals[name] = {
        average,
        latest,
        trend,
        rating: latestRating,
      };

      // 计算分数
      const ratingScore =
        latestRating === 'good'
          ? 100
          : latestRating === 'needs-improvement'
            ? PERCENTAGE_HALF
            : 0;
      totalScore += ratingScore;
      vitalCount += 1;
    }

    const score = vitalCount > 0 ? totalScore / vitalCount : 0;

    // 生成建议
    const recommendations: string[] = [];
    for (const [name, data] of Object.entries(vitals)) {
      if (data.rating === 'poor') {
        recommendations.push(
          `${name} needs improvement (current: ${data.latest.toFixed(COUNT_PAIR)})`,
        );
      }
      if (data.trend === 'degrading') {
        recommendations.push(`${name} performance is degrading over time`);
      }
    }

    return {
      vitals,
      score,
      recommendations,
    };
  }

  /**
   * 重置所有数据
   * Reset all data
   */
  reset(): void {
    this.vitals.clear();
    this.customMetrics.clear();
  }
}

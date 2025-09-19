/**
 * Web Vitals 和环境检查性能监控集成
 * Web Vitals and Environment Check Performance Monitoring Integration
 *
 * 提供与Web Vitals工具的集成钩子和环境兼容性检查功能
 */

import {
  isDevelopmentEnvironment,
  isTestEnvironment,
  type PerformanceConfig,
  type PerformanceMetrics,
} from '@/lib/performance-monitoring-types';
import {
  COUNT_PAIR,
  MAGIC_0_9,
  MAGIC_1_1,
  OFFSET_NEGATIVE_EXTRA_LARGE,
  OFFSET_NEGATIVE_LARGE,
  OFFSET_NEGATIVE_MEDIUM,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  ZERO,
} from '@/constants';

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
function checkTestEnv(
  issues: string[],
  warnings: string[],
  recommendations: string[],
): void {
  if (process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN !== 'true') {
    issues.push('测试环境中 React Scan 未被禁用');
    recommendations.push('设置 NEXT_PUBLIC_DISABLE_REACT_SCAN=true');
  }

  if (process.env.NEXT_PUBLIC_ENABLE_WEB_EVAL_AGENT !== 'true') {
    warnings.push('测试环境中 Web Eval Agent 未启用');
    recommendations.push('考虑设置 NEXT_PUBLIC_ENABLE_WEB_EVAL_AGENT=true');
  }
}

function checkDevEnv(warnings: string[], recommendations: string[]): void {
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

function checkProdEnv(
  issues: string[],
  warnings: string[],
  recommendations: string[],
): void {
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

export function checkEnvironmentCompatibility(): EnvironmentCompatibilityResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const warnings: string[] = [];
  const environment = process.env.NODE_ENV || 'development';

  // 检查测试环境配置
  if (isTestEnvironment()) checkTestEnv(issues, warnings, recommendations);

  // 检查开发环境配置
  if (isDevelopmentEnvironment()) checkDevEnv(warnings, recommendations);

  // 检查生产环境配置
  if (environment === 'production')
    checkProdEnv(issues, warnings, recommendations);

  // 检查必要的环境变量
  // 仅白名单检查，避免动态对象索引
  if (!process.env.NODE_ENV) {
    issues.push('缺少必要的环境变量: NODE_ENV');
    recommendations.push('设置环境变量 NODE_ENV');
  }

  return {
    isCompatible: issues.length === ZERO,
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
function analyzeReactScan(config: PerformanceConfig): {
  status: 'healthy' | 'warning' | 'error';
  detail: string;
} {
  if (config.reactScan.enabled) {
    if (isTestEnvironment())
      return {
        status: 'error',
        detail: 'React Scan should be disabled in test environment',
      };
    if (isDevelopmentEnvironment())
      return {
        status: 'healthy',
        detail: 'React Scan is properly configured for development',
      };
    return {
      status: 'warning',
      detail: 'React Scan is enabled in non-development environment',
    };
  }
  return { status: 'healthy', detail: 'React Scan is disabled' };
}

function analyzeWebEval(config: PerformanceConfig): {
  status: 'healthy' | 'warning';
  detail: string;
} {
  if (config.webEvalAgent.enabled) {
    if (isTestEnvironment())
      return {
        status: 'healthy',
        detail: 'Web Eval Agent is properly configured for testing',
      };
    return {
      status: 'warning',
      detail: 'Web Eval Agent is enabled outside test environment',
    };
  }
  return { status: 'healthy', detail: 'Web Eval Agent is disabled' };
}

function analyzeBundleAndSize(config: PerformanceConfig): {
  bundle: 'healthy';
  bundleDetail: string;
  size: 'healthy' | 'warning';
  sizeDetail: string;
} {
  const bundle = 'healthy' as const;
  const bundleDetail = config.bundleAnalyzer.enabled
    ? 'Bundle Analyzer is enabled'
    : 'Bundle Analyzer is disabled';
  const size = config.sizeLimit.enabled ? 'healthy' : 'warning';
  const sizeDetail = config.sizeLimit.enabled
    ? 'Size Limit monitoring is active'
    : 'Size Limit monitoring is disabled';
  return { bundle, bundleDetail, size, sizeDetail };
}

export function performHealthCheck(config: PerformanceConfig): {
  isHealthy: boolean;
  status: Record<string, 'healthy' | 'warning' | 'error'>;
  details: Record<string, string>;
} {
  const status: Record<string, 'healthy' | 'warning' | 'error'> = {};
  const details: Record<string, string> = {};

  const reactScan = analyzeReactScan(config);
  status.reactScan = reactScan.status;
  details.reactScan = reactScan.detail;

  const webEval = analyzeWebEval(config);
  status.webEvalAgent = webEval.status;
  details.webEvalAgent = webEval.detail;

  const bundleSize = analyzeBundleAndSize(config);
  status.bundleAnalyzer = bundleSize.bundle;
  details.bundleAnalyzer = bundleSize.bundleDetail;
  status.sizeLimit = bundleSize.size;
  details.sizeLimit = bundleSize.sizeDetail;

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
function validateThresholds(
  thresholds: Record<string, number>,
  warnings: string[],
): void {
  if (
    thresholds.lcp &&
    (typeof thresholds.lcp !== 'number' || thresholds.lcp <= ZERO)
  ) {
    warnings.push('Web Vitals LCP threshold should be a positive number');
  }

  if (
    thresholds.fid &&
    (typeof thresholds.fid !== 'number' || thresholds.fid <= ZERO)
  ) {
    warnings.push('Web Vitals FID threshold should be a positive number');
  }

  if (
    thresholds.cls &&
    (typeof thresholds.cls !== 'number' || thresholds.cls <= ZERO)
  ) {
    warnings.push('Web Vitals CLS threshold should be a positive number');
  }
}

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
        const { thresholds } = config.webVitals;
        validateThresholds(thresholds as Record<string, number>, warnings);
      }
    }
  }

  return {
    isValid: errors.length === ZERO,
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

  private evaluateTrend(
    values: number[],
  ): 'improving' | 'stable' | 'degrading' {
    if (values.length < COUNT_PAIR) return 'stable';
    const recent = values.slice(OFFSET_NEGATIVE_MEDIUM);
    const older = values.slice(OFFSET_NEGATIVE_LARGE, OFFSET_NEGATIVE_MEDIUM);
    if (recent.length === ZERO || older.length === ZERO) return 'stable';
    const recentAvg = recent.reduce((s, v) => s + v, ZERO) / recent.length;
    const olderAvg = older.reduce((s, v) => s + v, ZERO) / older.length;
    if (recentAvg < olderAvg * MAGIC_0_9) return 'improving';
    if (recentAvg > olderAvg * MAGIC_1_1) return 'degrading';
    return 'stable';
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
      lastUpdated: ZERO,
    };

    current.values.push(value);
    current.ratings.push(rating);
    current.lastUpdated = Date.now();

    this.vitals.set(name, current);

    // 保持数组大小在合理范围内
    if (current.values.length > PERCENTAGE_FULL) {
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
      lastUpdated: ZERO,
    };

    current.values.push(value);
    current.lastUpdated = Date.now();

    this.customMetrics.set(name, current);

    // 保持数组大小在合理范围内
    if (current.values.length > PERCENTAGE_FULL) {
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
    const vitalsMap = new Map<
      string,
      {
        average: number;
        latest: number;
        trend: 'improving' | 'stable' | 'degrading';
        rating: 'good' | 'needs-improvement' | 'poor';
      }
    >();
    let totalScore = ZERO;
    let vitalCount = ZERO;

    for (const [name, data] of this.vitals.entries()) {
      if (data.values.length === ZERO) continue;

      const average =
        data.values.reduce((sum, val) => sum + val, ZERO) / data.values.length;
      const latest = data.values[data.values.length - ONE] ?? ZERO;
      const latestRating = data.ratings[data.ratings.length - ONE] ?? 'poor';

      // 计算趋势
      const trend = this.evaluateTrend(data.values);

      vitalsMap.set(name, {
        average,
        latest,
        trend,
        rating: latestRating,
      });

      // 计算分数
      const ratingScore =
        latestRating === 'good'
          ? PERCENTAGE_FULL
          : latestRating === 'needs-improvement'
            ? PERCENTAGE_HALF
            : ZERO;
      totalScore += ratingScore;
      vitalCount += ONE;
    }

    const score = vitalCount > ZERO ? totalScore / vitalCount : ZERO;

    const recommendations = this.buildRecommendations(vitalsMap);

    return {
      vitals: Object.fromEntries(vitalsMap) as Record<
        string,
        {
          average: number;
          latest: number;
          trend: 'improving' | 'stable' | 'degrading';
          rating: 'good' | 'needs-improvement' | 'poor';
        }
      >,
      score,
      recommendations,
    };
  }

  private buildRecommendations(
    vitalsMap: Map<
      string,
      {
        average: number;
        latest: number;
        trend: 'improving' | 'stable' | 'degrading';
        rating: 'good' | 'needs-improvement' | 'poor';
      }
    >,
  ): string[] {
    const recommendations: string[] = [];
    for (const [name, data] of vitalsMap.entries()) {
      if (data.rating === 'poor') {
        recommendations.push(
          `${name} needs improvement (current: ${data.latest.toFixed(COUNT_PAIR)})`,
        );
      }
      if (data.trend === 'degrading') {
        recommendations.push(`${name} performance is degrading over time`);
      }
    }
    return recommendations;
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

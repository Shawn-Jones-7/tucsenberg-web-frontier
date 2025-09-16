/**
 * Web Eval Agent 性能监控集成
 * Web Eval Agent Performance Monitoring Integration
 *
 * 提供与Web Eval Agent工具的集成钩子，用于监控用户交互和页面性能
 */

import { logger } from '@/lib/logger';
import { ANIMATION_DURATION_NORMAL, OFFSET_NEGATIVE_MASSIVE, OFFSET_NEGATIVE_EXTRA_LARGE, COUNT_TEN, MAGIC_0_9 } from '@/constants/magic-numbers';

import type {
  PerformanceConfig,
  PerformanceMetrics,
} from './performance-monitoring-types';

/**
 * Web Eval Agent 集成钩子返回类型
 * Web Eval Agent integration hook return type
 */
export interface WebEvalAgentIntegration {
  enabled: boolean;
  recordUserInteraction: (
    action: string,
    timing: number,
    success: boolean,
    details?: Record<string, unknown>,
  ) => void;
  recordNetworkRequest: (
    url: string,
    method: string,
    status: number,
    timing: number,
    size?: number,
  ) => void;
  recordPageLoad: (url: string, timing: Record<string, number>) => void;
  recordError: (error: Error, context?: Record<string, unknown>) => void;
}

/**
 * Web Eval Agent 集成钩子
 * Web Eval Agent integration hook
 */
export function useWebEvalAgentIntegration(
  config: PerformanceConfig,
  recordMetric: (metric: Omit<PerformanceMetrics, 'timestamp'>) => void,
): WebEvalAgentIntegration {
  return {
    enabled: config.webEvalAgent.enabled,

    recordUserInteraction: (
      action: string,
      timing: number,
      success: boolean,
      details = {},
    ) => {
      if (!config.webEvalAgent.enabled) return;

      recordMetric({
        source: 'web-eval-agent',
        type: 'user-interaction',
        data: {
          action,
          timing,
          success,
          ...details,
          timestamp: Date.now(),
        },
        tags: ['web-eval-agent', 'user-interaction'],
        priority: success ? 'medium' : 'high',
      });
    },

    recordNetworkRequest: (
      url: string,
      method: string,
      status: number,
      timing: number,
      size = 0,
    ) => {
      if (!config.webEvalAgent.enabled || !config.webEvalAgent.captureNetwork)
        return;

      recordMetric({
        source: 'web-eval-agent',
        type: 'network',
        data: {
          url,
          method,
          status,
          timing,
          size,
          isSuccess: status >= 200 && status < ANIMATION_DURATION_NORMAL,
          timestamp: Date.now(),
        },
        tags: ['web-eval-agent', 'network-request'],
        priority: timing > 1000 ? 'high' : 'medium',
      });
    },

    recordPageLoad: (url: string, timing: Record<string, number>) => {
      if (!config.webEvalAgent.enabled) return;

      recordMetric({
        source: 'web-eval-agent',
        type: 'page',
        data: {
          url,
          ...timing,
          timestamp: Date.now(),
        },
        tags: ['web-eval-agent', 'page-load'],
        priority: 'medium',
      });
    },

    recordError: (error: Error, context = {}) => {
      if (!config.webEvalAgent.enabled || !config.webEvalAgent.captureLogs)
        return;

      recordMetric({
        source: 'web-eval-agent',
        type: 'user-interaction',
        data: {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          context,
          timestamp: Date.now(),
        },
        tags: ['web-eval-agent', 'error'],
        priority: 'critical',
      });
    },
  };
}

/**
 * Web Eval Agent 配置验证
 * Web Eval Agent configuration validation
 */
export function validateWebEvalAgentConfig(config: PerformanceConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.webEvalAgent) {
    errors.push('Web Eval Agent configuration is missing');
    return { isValid: false, errors, warnings };
  }

  if (typeof config.webEvalAgent.enabled !== 'boolean') {
    errors.push('Web Eval Agent enabled must be a boolean');
  }

  if (config.webEvalAgent.enabled) {
    if (typeof config.webEvalAgent.captureNetwork !== 'boolean') {
      warnings.push('Web Eval Agent captureNetwork should be a boolean');
    }

    if (typeof config.webEvalAgent.captureLogs !== 'boolean') {
      warnings.push('Web Eval Agent captureLogs should be a boolean');
    }

    if (
      config.webEvalAgent.maxInteractionsPerSession &&
      (typeof config.webEvalAgent.maxInteractionsPerSession !== 'number' ||
        config.webEvalAgent.maxInteractionsPerSession <= 0)
    ) {
      warnings.push(
        'Web Eval Agent maxInteractionsPerSession should be a positive number',
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Web Eval Agent 性能分析器
 * Web Eval Agent performance analyzer
 */
export class WebEvalAgentAnalyzer {
  private interactions = new Map<
    string,
    {
      count: number;
      totalTime: number;
      successCount: number;
      lastInteraction: number;
    }
  >();

  private networkRequests: Array<{
    url: string;
    method: string;
    status: number;
    timing: number;
    size: number;
    timestamp: number;
  }> = [];

  private pageLoads: Array<{
    url: string;
    timing: Record<string, number>;
    timestamp: number;
  }> = [];

  private errors: Array<{
    error: Error;
    context: Record<string, unknown>;
    timestamp: number;
  }> = [];

  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * 记录用户交互
   * Record user interaction
   */
  recordInteraction(
    action: string,
    timing: number,
    success: boolean,
    _details?: Record<string, unknown>,
  ): void {
    if (!this.config.webEvalAgent.enabled) return;

    const current = this.interactions.get(action) || {
      count: 0,
      totalTime: 0,
      successCount: 0,
      lastInteraction: 0,
    };

    current.count += 1;
    current.totalTime += timing;
    if (success) current.successCount += 1;
    current.lastInteraction = Date.now();

    this.interactions.set(action, current);

    // 检查是否超过会话限制
    const maxInteractions =
      this.config.webEvalAgent.maxInteractionsPerSession || 1000;
    if (current.count > maxInteractions) {
      logger.warn(`Interaction ${action} has exceeded session limit`, {
        maxInteractions,
      });
    }
  }

  /**
   * 记录网络请求
   * Record network request
   */
  recordNetworkRequest(
    url: string,
    method: string,
    status: number,
    timing: number,
    size = 0,
  ): void {
    if (
      !this.config.webEvalAgent.enabled ||
      !this.config.webEvalAgent.captureNetwork
    )
      return;

    this.networkRequests.push({
      url,
      method,
      status,
      timing,
      size,
      timestamp: Date.now(),
    });

    // 保持数组大小在合理范围内
    if (this.networkRequests.length > 1000) {
      this.networkRequests = this.networkRequests.slice(OFFSET_NEGATIVE_MASSIVE);
    }
  }

  /**
   * 记录页面加载
   * Record page load
   */
  recordPageLoad(url: string, timing: Record<string, number>): void {
    if (!this.config.webEvalAgent.enabled) return;

    this.pageLoads.push({
      url,
      timing,
      timestamp: Date.now(),
    });

    // 保持数组大小在合理范围内
    if (this.pageLoads.length > 100) {
      this.pageLoads = this.pageLoads.slice(OFFSET_NEGATIVE_EXTRA_LARGE);
    }
  }

  /**
   * 记录错误
   * Record error
   */
  recordError(error: Error, context: Record<string, unknown> = {}): void {
    if (
      !this.config.webEvalAgent.enabled ||
      !this.config.webEvalAgent.captureLogs
    )
      return;

    this.errors.push({
      error,
      context,
      timestamp: Date.now(),
    });

    // 保持数组大小在合理范围内
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(OFFSET_NEGATIVE_EXTRA_LARGE);
    }
  }

  /**
   * 获取用户交互报告
   * Get user interaction report
   */
  getInteractionReport(): {
    totalInteractions: number;
    uniqueActions: number;
    averageResponseTime: number;
    successRate: number;
    topSlowActions: Array<{
      action: string;
      averageTime: number;
      count: number;
      successRate: number;
    }>;
    recommendations: string[];
  } {
    const interactions = Array.from(this.interactions.entries());
    const totalInteractions = interactions.reduce(
      (sum, [, metrics]) => sum + metrics.count,
      0,
    );
    const totalTime = interactions.reduce(
      (sum, [, metrics]) => sum + metrics.totalTime,
      0,
    );
    const totalSuccesses = interactions.reduce(
      (sum, [, metrics]) => sum + metrics.successCount,
      0,
    );

    const topSlowActions = interactions
      .map(([action, metrics]) => ({
        action,
        averageTime: metrics.totalTime / metrics.count,
        count: metrics.count,
        successRate: metrics.successCount / metrics.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, COUNT_TEN);

    const recommendations: string[] = [];

    // 生成建议
    if (topSlowActions.length > 0) {
      const slowestAction = topSlowActions[0];
      if (slowestAction && slowestAction.averageTime > 1000) {
        recommendations.push(
          `Action "${slowestAction.action}" is slow (${slowestAction.averageTime.toFixed(0)}ms average)`,
        );
      }
    }

    const lowSuccessActions = topSlowActions.filter((a) => a.successRate < MAGIC_0_9);
    if (lowSuccessActions.length > 0) {
      recommendations.push(
        `${lowSuccessActions.length} actions have low success rates. Consider improving error handling.`,
      );
    }

    return {
      totalInteractions,
      uniqueActions: interactions.length,
      averageResponseTime: totalTime / totalInteractions || 0,
      successRate: totalSuccesses / totalInteractions || 0,
      topSlowActions,
      recommendations,
    };
  }

  /**
   * 获取网络性能报告
   * Get network performance report
   */
  getNetworkReport(): {
    totalRequests: number;
    averageResponseTime: number;
    successRate: number;
    totalDataTransferred: number;
    slowestRequests: Array<{
      url: string;
      method: string;
      timing: number;
      status: number;
    }>;
    errorRequests: Array<{
      url: string;
      method: string;
      status: number;
      timing: number;
    }>;
  } {
    const totalRequests = this.networkRequests.length;
    const totalTime = this.networkRequests.reduce(
      (sum, req) => sum + req.timing,
      0,
    );
    const successfulRequests = this.networkRequests.filter(
      (req) => req.status >= 200 && req.status < ANIMATION_DURATION_NORMAL,
    );
    const totalDataTransferred = this.networkRequests.reduce(
      (sum, req) => sum + req.size,
      0,
    );

    const slowestRequests = [...this.networkRequests]
      .sort((a, b) => b.timing - a.timing)
      .slice(0, COUNT_TEN)
      .map((req) => ({
        url: req.url,
        method: req.method,
        timing: req.timing,
        status: req.status,
      }));

    const errorRequests = this.networkRequests
      .filter((req) => req.status >= 400)
      .map((req) => ({
        url: req.url,
        method: req.method,
        status: req.status,
        timing: req.timing,
      }));

    return {
      totalRequests,
      averageResponseTime: totalTime / totalRequests || 0,
      successRate: successfulRequests.length / totalRequests || 0,
      totalDataTransferred,
      slowestRequests,
      errorRequests,
    };
  }

  /**
   * 获取页面加载报告
   * Get page load report
   */
  getPageLoadReport(): {
    totalPageLoads: number;
    averageLoadTime: number;
    slowestPages: Array<{
      url: string;
      loadTime: number;
      timestamp: number;
    }>;
  } {
    const totalPageLoads = this.pageLoads.length;
    const totalLoadTime = this.pageLoads.reduce((sum, page) => {
      return (
        sum + (page.timing.loadComplete || page.timing.domContentLoaded || 0)
      );
    }, 0);

    const slowestPages = this.pageLoads
      .map((page) => ({
        url: page.url,
        loadTime: page.timing.loadComplete || page.timing.domContentLoaded || 0,
        timestamp: page.timestamp,
      }))
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, COUNT_TEN);

    return {
      totalPageLoads,
      averageLoadTime: totalLoadTime / totalPageLoads || 0,
      slowestPages,
    };
  }

  /**
   * 重置所有数据
   * Reset all data
   */
  reset(): void {
    this.interactions.clear();
    this.networkRequests.length = 0;
    this.pageLoads.length = 0;
    this.errors.length = 0;
  }
}

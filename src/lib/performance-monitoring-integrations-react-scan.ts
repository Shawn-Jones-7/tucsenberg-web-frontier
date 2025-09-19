/**
 * React Scan 性能监控集成
 * React Scan Performance Monitoring Integration
 *
 * 提供与React Scan工具的集成钩子，用于监控React组件渲染性能
 */

import { logger } from '@/lib/logger';
import type {
  PerformanceConfig,
  PerformanceMetrics,
} from '@/lib/performance-monitoring-types';
import {
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  MAGIC_0_3,
  MAGIC_8,
  MAGIC_16,
  MAGIC_32,
} from '@/constants';

/**
 * React Scan 集成钩子返回类型
 * React Scan integration hook return type
 */
export interface ReactScanIntegration {
  enabled: boolean;
  recordRender: (
    componentName: string,
    renderCount: number,
    renderTime?: number,
  ) => void;
  recordUnnecessaryRender: (componentName: string, reason: string) => void;
  getComponentStats: () => Record<
    string,
    { renders: number; totalTime: number }
  >;
}

/**
 * React Scan 集成钩子
 * React Scan integration hook
 */
export function useReactScanIntegration(
  config: PerformanceConfig,
  recordMetric: (metric: Omit<PerformanceMetrics, 'timestamp'>) => void,
): ReactScanIntegration {
  const componentStats = new Map<
    string,
    { renders: number; totalTime: number }
  >();

  return {
    enabled: config.reactScan.enabled,

    recordRender: (
      componentName: string,
      renderCount: number,
      renderTime = 0,
    ) => {
      if (!config.reactScan.enabled) return;

      // 更新组件统计
      const current = componentStats.get(componentName) || {
        renders: 0,
        totalTime: 0,
      };
      current.renders += renderCount;
      current.totalTime += renderTime;
      componentStats.set(componentName, current);

      recordMetric({
        source: 'react-scan',
        type: 'component',
        data: {
          componentName,
          renderCount,
          renderTime,
          totalRenders: current.renders,
          averageRenderTime: current.totalTime / current.renders,
          timestamp: Date.now(),
        },
        tags: ['react-scan', 'component-render'],
        priority: renderCount > COUNT_FIVE ? 'high' : 'medium',
      });
    },

    recordUnnecessaryRender: (componentName: string, reason: string) => {
      if (
        !config.reactScan.enabled ||
        !config.reactScan.trackUnnecessaryRenders
      )
        return;

      recordMetric({
        source: 'react-scan',
        type: 'component',
        data: {
          componentName,
          reason,
          type: 'unnecessary-render',
          timestamp: Date.now(),
        },
        tags: ['react-scan', 'unnecessary-render'],
        priority: 'high',
      });
    },

    getComponentStats: () => {
      return Object.fromEntries(componentStats);
    },
  };
}

/**
 * React Scan 配置验证
 * React Scan configuration validation
 */
export function validateReactScanConfig(config: PerformanceConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.reactScan) {
    errors.push('React Scan configuration is missing');
    return { isValid: false, errors, warnings };
  }

  if (typeof config.reactScan.enabled !== 'boolean') {
    errors.push('React Scan enabled must be a boolean');
  }

  if (config.reactScan.enabled) {
    if (typeof config.reactScan.trackUnnecessaryRenders !== 'boolean') {
      warnings.push('React Scan trackUnnecessaryRenders should be a boolean');
    }

    if (
      config.reactScan.maxTrackedComponents &&
      (typeof config.reactScan.maxTrackedComponents !== 'number' ||
        config.reactScan.maxTrackedComponents <= 0)
    ) {
      warnings.push(
        'React Scan maxTrackedComponents should be a positive number',
      );
    }

    if (
      config.reactScan.showRenderTime !== undefined &&
      typeof config.reactScan.showRenderTime !== 'boolean'
    ) {
      warnings.push('React Scan showRenderTime should be a boolean');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * React Scan 性能分析器
 * React Scan performance analyzer
 */
export class ReactScanAnalyzer {
  private componentMetrics = new Map<
    string,
    {
      renders: number;
      totalTime: number;
      lastRender: number;
      unnecessaryRenders: number;
    }
  >();

  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * 记录组件渲染
   * Record component render
   */
  recordRender(componentName: string, renderTime: number): void {
    if (!this.config.reactScan.enabled) return;

    const current = this.componentMetrics.get(componentName) || {
      renders: 0,
      totalTime: 0,
      lastRender: 0,
      unnecessaryRenders: 0,
    };

    current.renders += 1;
    current.totalTime += renderTime;
    current.lastRender = Date.now();

    this.componentMetrics.set(componentName, current);

    // 检查是否为不必要的渲染
    if (this.isUnnecessaryRender(componentName, renderTime)) {
      current.unnecessaryRenders += 1;
      this.recordUnnecessaryRender(
        componentName,
        'High frequency rendering detected',
      );
    }
  }

  /**
   * 记录不必要的渲染
   * Record unnecessary render
   */
  recordUnnecessaryRender(componentName: string, reason: string): void {
    if (
      !this.config.reactScan.enabled ||
      !this.config.reactScan.trackUnnecessaryRenders
    )
      return;

    const current = this.componentMetrics.get(componentName);
    if (current) {
      current.unnecessaryRenders += 1;
    }

    // 可以在这里添加日志或发送到监控服务
    if (this.config.debug) {
      logger.warn(`Unnecessary render detected for ${componentName}`, {
        reason,
      });
    }
  }

  /**
   * 检查是否为不必要的渲染
   * Check if render is unnecessary
   */
  private isUnnecessaryRender(
    componentName: string,
    _renderTime: number,
  ): boolean {
    const current = this.componentMetrics.get(componentName);
    if (!current) return false;

    const threshold = this.config.reactScan.renderThreshold || 100;
    const timeSinceLastRender = Date.now() - current.lastRender;

    // 如果渲染间隔太短，可能是不必要的渲染
    return timeSinceLastRender < threshold;
  }

  /**
   * 获取组件性能报告
   * Get component performance report
   */
  getPerformanceReport(): {
    totalComponents: number;
    totalRenders: number;
    averageRenderTime: number;
    topSlowComponents: Array<{
      name: string;
      averageTime: number;
      renders: number;
      unnecessaryRenders: number;
    }>;
    recommendations: string[];
  } {
    const components = Array.from(this.componentMetrics.entries());
    const totalRenders = components.reduce(
      (sum, [, metrics]) => sum + metrics.renders,
      0,
    );
    const totalTime = components.reduce(
      (sum, [, metrics]) => sum + metrics.totalTime,
      0,
    );

    const topSlowComponents = components
      .map(([name, metrics]) => ({
        name,
        averageTime: metrics.totalTime / metrics.renders,
        renders: metrics.renders,
        unnecessaryRenders: metrics.unnecessaryRenders,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, COUNT_TEN);

    const recommendations: string[] = [];

    // 生成建议
    if (topSlowComponents.length > 0) {
      const slowestComponent = topSlowComponents[0];
      if (slowestComponent && slowestComponent.averageTime > MAGIC_16) {
        // 超过一帧的时间
        recommendations.push(
          `Consider optimizing ${slowestComponent.name} - average render time: ${slowestComponent.averageTime.toFixed(COUNT_PAIR)}ms`,
        );
      }
    }

    const unnecessaryRenderComponents = topSlowComponents.filter(
      (c) => c.unnecessaryRenders > 0,
    );
    if (unnecessaryRenderComponents.length > 0) {
      recommendations.push(
        `${unnecessaryRenderComponents.length} components have unnecessary renders. Consider using React.memo or useMemo.`,
      );
    }

    return {
      totalComponents: components.length,
      totalRenders,
      averageRenderTime: totalTime / totalRenders || 0,
      topSlowComponents,
      recommendations,
    };
  }

  /**
   * 重置统计数据
   * Reset statistics
   */
  reset(): void {
    this.componentMetrics.clear();
  }

  /**
   * 获取特定组件的统计数据
   * Get statistics for specific component
   */
  getComponentStats(componentName: string): {
    renders: number;
    totalTime: number;
    averageTime: number;
    lastRender: number;
    unnecessaryRenders: number;
  } | null {
    const metrics = this.componentMetrics.get(componentName);
    if (!metrics) return null;

    return {
      renders: metrics.renders,
      totalTime: metrics.totalTime,
      averageTime: metrics.totalTime / metrics.renders,
      lastRender: metrics.lastRender,
      unnecessaryRenders: metrics.unnecessaryRenders,
    };
  }
}

/**
 * React Scan 工具函数
 * React Scan utility functions
 */
export const ReactScanUtils = {
  /**
   * 格式化渲染时间
   * Format render time
   */
  formatRenderTime(milliseconds: number): string {
    if (milliseconds < 1) {
      return `${(milliseconds * 1000).toFixed(1)}μs`;
    }
    if (milliseconds < 1000) {
      return `${milliseconds.toFixed(COUNT_PAIR)}ms`;
    }
    return `${(milliseconds / 1000).toFixed(COUNT_PAIR)}s`;
  },

  /**
   * 获取渲染性能等级
   * Get render performance rating
   */
  getRenderPerformanceRating(
    renderTime: number,
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (renderTime < MAGIC_8) return 'excellent';
    if (renderTime < MAGIC_16) return 'good';
    if (renderTime < MAGIC_32) return 'fair';
    return 'poor';
  },

  /**
   * 计算渲染效率分数
   * Calculate render efficiency score
   */
  calculateEfficiencyScore(
    totalRenders: number,
    unnecessaryRenders: number,
  ): number {
    if (totalRenders === 0) return 100;
    const efficiency = (totalRenders - unnecessaryRenders) / totalRenders;
    return Math.round(efficiency * 100);
  },

  /**
   * 生成组件优化建议
   * Generate component optimization suggestions
   */
  generateOptimizationSuggestions(componentStats: {
    renders: number;
    averageTime: number;
    unnecessaryRenders: number;
  }): string[] {
    const suggestions: string[] = [];

    if (componentStats.averageTime > MAGIC_16) {
      suggestions.push(
        'Consider breaking down this component into smaller components',
      );
      suggestions.push('Use React.memo to prevent unnecessary re-renders');
    }

    if (
      componentStats.unnecessaryRenders >
      componentStats.renders * MAGIC_0_3
    ) {
      suggestions.push(
        'High rate of unnecessary renders detected - check prop dependencies',
      );
      suggestions.push(
        'Consider using useMemo or useCallback for expensive computations',
      );
    }

    if (componentStats.renders > 100) {
      suggestions.push(
        'High render frequency - consider implementing virtualization if rendering lists',
      );
    }

    return suggestions;
  },
} as const;

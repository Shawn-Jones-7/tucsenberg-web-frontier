/**
 * 性能报告详细分析模块
 * Performance Report Detailed Analysis Module
 *
 * 负责性能报告的详细分析、分布计算和趋势分析功能
 * 从 performance-monitoring-core-reports.ts 提取以保持单文件 ≤500 行
 */

import type {
  BundlePerformanceData,
  ComponentPerformanceData,
  NetworkPerformanceData,
  PerformanceConfig,
  PerformanceMetrics,
} from '@/lib/performance-monitoring-types';
import {
  BYTES_PER_KB,
  COUNT_FIVE,
  COUNT_PAIR,
  ONE,
  PERCENTAGE_FULL,
  ZERO,
} from '@/constants';

// ==================== 类型守卫 ====================

/**
 * 检查是否为组件性能数据
 */
export function isComponentData(
  data: unknown,
): data is ComponentPerformanceData {
  return typeof data === 'object' && data !== null && 'renderTime' in data;
}

/**
 * 检查是否为网络性能数据
 */
export function isNetworkData(data: unknown): data is NetworkPerformanceData {
  return typeof data === 'object' && data !== null && 'responseTime' in data;
}

/**
 * 检查是否为打包性能数据
 */
export function isBundleData(data: unknown): data is BundlePerformanceData {
  return typeof data === 'object' && data !== null && 'size' in data;
}

/**
 * 获取指标数值
 */
export function getMetricValue(m: PerformanceMetrics): number {
  if (isComponentData(m.data)) return Number(m.data.renderTime) || ZERO;
  if (isNetworkData(m.data)) return Number(m.data.responseTime) || ZERO;
  if (isBundleData(m.data)) return Number(m.data.size) || ZERO;
  return ZERO;
}

// ==================== 分析结果接口 ====================

export interface ComponentAnalysis {
  slowestComponents: Array<{
    name: string;
    value: number;
    threshold: number;
  }>;
  renderTimeDistribution: Record<string, number>;
  averageRenderTime: number;
}

export interface NetworkAnalysis {
  slowestRequests: Array<{
    name: string;
    value: number;
    threshold: number;
  }>;
  responseTimeDistribution: Record<string, number>;
  averageResponseTime: number;
}

export interface BundleAnalysis {
  largestBundles: Array<{
    name: string;
    value: number;
    threshold: number;
  }>;
  sizeDistribution: Record<string, number>;
  totalSize: number;
}

export type TrendDirection = 'improving' | 'stable' | 'degrading';

// ==================== 分布计算 ====================

/**
 * 计算分布
 */
export function calculateDistribution(
  metrics: PerformanceMetrics[],
): Record<string, number> {
  const map = new Map<string, number>();
  for (const metric of metrics) {
    const key = metric.id || metric.type;
    const current = map.get(key) ?? ZERO;
    map.set(key, current + ONE);
  }
  return Object.fromEntries(map);
}

// ==================== 趋势计算 ====================

/**
 * 计算趋势
 */
export function calculateTrend(metrics: PerformanceMetrics[]): TrendDirection {
  if (metrics.length < COUNT_PAIR) return 'stable';

  const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
  const midPoint = Math.floor(sortedMetrics.length / COUNT_PAIR);

  const firstHalf = sortedMetrics.slice(ZERO, midPoint);
  const secondHalf = sortedMetrics.slice(midPoint);

  const firstAvg =
    firstHalf.reduce((sum, m) => sum + getMetricValue(m), ZERO) /
    firstHalf.length;

  const secondAvg =
    secondHalf.reduce((sum, m) => sum + getMetricValue(m), ZERO) /
    secondHalf.length;

  const changePercent = ((secondAvg - firstAvg) / firstAvg) * PERCENTAGE_FULL;

  if (changePercent < -COUNT_FIVE) return 'improving';
  if (changePercent > COUNT_FIVE) return 'degrading';
  return 'stable';
}

// ==================== 组件分析 ====================

/**
 * 构建组件分析
 */
export function buildComponentAnalysis(
  componentMetrics: PerformanceMetrics[],
  config: PerformanceConfig,
): ComponentAnalysis {
  const componentThreshold =
    config.component?.thresholds?.renderTime || PERCENTAGE_FULL;

  const slowestComponents = componentMetrics
    .filter(
      (m) =>
        isComponentData(m.data) &&
        (Number(m.data.renderTime) || ZERO) > componentThreshold,
    )
    .map((m) => ({
      name: m.id || m.type,
      value: isComponentData(m.data) ? Number(m.data.renderTime) || ZERO : ZERO,
      threshold: componentThreshold,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(ZERO, COUNT_FIVE);

  const averageRenderTime =
    componentMetrics.reduce((sum, m) => {
      if (isComponentData(m.data)) {
        return sum + (Number(m.data.renderTime) || ZERO);
      }
      return sum;
    }, ZERO) / componentMetrics.length || ZERO;

  return {
    slowestComponents,
    renderTimeDistribution: calculateDistribution(componentMetrics),
    averageRenderTime,
  };
}

// ==================== 网络分析 ====================

/**
 * 构建网络分析
 */
export function buildNetworkAnalysis(
  networkMetrics: PerformanceMetrics[],
  config: PerformanceConfig,
): NetworkAnalysis {
  const networkThreshold = config.network?.thresholds?.responseTime || 1000;

  const slowestRequests = networkMetrics
    .filter(
      (m) =>
        isNetworkData(m.data) &&
        (Number(m.data.responseTime) || ZERO) > networkThreshold,
    )
    .map((m) => ({
      name: m.id || m.type,
      value: isNetworkData(m.data) ? Number(m.data.responseTime) || ZERO : ZERO,
      threshold: networkThreshold,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(ZERO, COUNT_FIVE);

  const averageResponseTime =
    networkMetrics.reduce((sum, m) => {
      if (isNetworkData(m.data)) {
        return sum + (Number(m.data.responseTime) || ZERO);
      }
      return sum;
    }, ZERO) / networkMetrics.length || ZERO;

  return {
    slowestRequests,
    responseTimeDistribution: calculateDistribution(networkMetrics),
    averageResponseTime,
  };
}

// ==================== 打包分析 ====================

/**
 * 构建打包分析
 */
export function buildBundleAnalysis(
  bundleMetrics: PerformanceMetrics[],
  config: PerformanceConfig,
): BundleAnalysis {
  const bundleThreshold =
    config.bundle?.thresholds?.size || BYTES_PER_KB * BYTES_PER_KB;

  const largestBundles = bundleMetrics
    .filter(
      (m) =>
        isBundleData(m.data) && (Number(m.data.size) || ZERO) > bundleThreshold,
    )
    .map((m) => ({
      name: m.id || m.type,
      value: isBundleData(m.data) ? Number(m.data.size) || ZERO : ZERO,
      threshold: bundleThreshold,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(ZERO, COUNT_FIVE);

  const totalSize = bundleMetrics.reduce((sum, m) => {
    if (isBundleData(m.data)) {
      return sum + (Number(m.data.size) || ZERO);
    }
    return sum;
  }, ZERO);

  return {
    largestBundles,
    sizeDistribution: calculateDistribution(bundleMetrics),
    totalSize,
  };
}

// ==================== 按类型过滤 ====================

/**
 * 获取组件指标
 */
export function getComponentMetrics(
  metrics: PerformanceMetrics[],
): PerformanceMetrics[] {
  return metrics.filter((m) => m.type === 'component');
}

/**
 * 获取网络指标
 */
export function getNetworkMetrics(
  metrics: PerformanceMetrics[],
): PerformanceMetrics[] {
  return metrics.filter((m) => m.type === 'network');
}

/**
 * 获取打包指标
 */
export function getBundleMetrics(
  metrics: PerformanceMetrics[],
): PerformanceMetrics[] {
  return metrics.filter((m) => m.type === 'bundle');
}

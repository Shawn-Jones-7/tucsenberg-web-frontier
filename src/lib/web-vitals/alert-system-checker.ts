/**
 * 性能预警系统 - 指标检查器
 * Performance Alert System - Metrics Checker
 */

import { ZERO } from "@/constants/magic-numbers";
import {
  extractCoreMetrics,
  formatMetricValue,
  getDefaultConnection,
  getDefaultDevice,
  getDefaultPage,
  getDefaultResourceTiming,
} from './alert-helpers';
import type {
  DetailedWebVitals,
  PerformanceAlertConfig,
  RegressionDetectionResult,
} from './types';

/**
 * 预警信息接口
 */
export interface AlertInfo {
  type: 'metric' | 'regression';
  severity: 'warning' | 'critical';
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

/**
 * 性能指标检查器类
 * Performance metrics checker class
 */
export class AlertSystemChecker {
  /**
   * 检查指标阈值
   */
  static checkMetricThresholds(
    metrics: DetailedWebVitals,
    config: PerformanceAlertConfig,
    alerts: AlertInfo[],
  ): void {
    const metricsToCheck = [
      { key: 'cls', value: metrics.cls, name: 'Cumulative Layout Shift' },
      { key: 'fid', value: metrics.fid, name: 'First Input Delay' },
      { key: 'lcp', value: metrics.lcp, name: 'Largest Contentful Paint' },
      { key: 'fcp', value: metrics.fcp, name: 'First Contentful Paint' },
      { key: 'ttfb', value: metrics.ttfb, name: 'Time to First Byte' },
    ] as const;

    metricsToCheck.forEach(({ key, value, name }) => {
      if (!value) return;

      // 安全的对象属性访问，避免对象注入
      const safeThresholds = new Map(Object.entries(config.thresholds));
      const thresholds = safeThresholds.get(key);
      if (!thresholds) return;

      if (value >= thresholds.critical) {
        alerts.push({
          type: 'metric',
          severity: 'critical',
          message: `🔴 ${name} 严重超标: ${formatMetricValue(key, value)} (阈值: ${formatMetricValue(key, thresholds.critical)})`,
          metric: key,
          value,
          threshold: thresholds.critical,
        });
      } else if (value >= thresholds.warning) {
        alerts.push({
          type: 'metric',
          severity: 'warning',
          message: `🟡 ${name} 超出警告线: ${formatMetricValue(key, value)} (阈值: ${formatMetricValue(key, thresholds.warning)})`,
          metric: key,
          value,
          threshold: thresholds.warning,
        });
      }
    });
  }

  /**
   * 检查回归预警
   */
  static checkRegressionAlerts(
    regressionResult: RegressionDetectionResult,
    alerts: AlertInfo[],
  ): void {
    if (regressionResult.summary.criticalRegressions > ZERO) {
      alerts.push({
        type: 'regression',
        severity: 'critical',
        message: `🚨 检测到 ${regressionResult.summary.criticalRegressions} 个关键性能回归`,
      });
    } else if (regressionResult.summary.totalRegressions > ZERO) {
      alerts.push({
        type: 'regression',
        severity: 'warning',
        message: `⚠️ 检测到 ${regressionResult.summary.totalRegressions} 个性能回归`,
      });
    }
  }

  /**
   * 检查指标并生成警报信息 (测试方法)
   */
  static checkMetrics(
    metrics: Record<string, number>,
    config: PerformanceAlertConfig,
  ): AlertInfo[] {
    if (!config.enabled) return [];

    const alerts: AlertInfo[] = [];

    // 安全地转换 Record<string, number> 为 DetailedWebVitals 兼容格式
    const detailedMetrics =
      AlertSystemChecker.convertToDetailedWebVitals(metrics);
    AlertSystemChecker.checkMetricThresholds(detailedMetrics, config, alerts);

    return alerts;
  }

  /**
   * 安全地将 Record<string, number> 转换为 DetailedWebVitals 格式
   */
  static convertToDetailedWebVitals(
    metrics: Record<string, number>,
  ): DetailedWebVitals {
    return {
      ...extractCoreMetrics(metrics),
      resourceTiming: getDefaultResourceTiming(),
      connection: getDefaultConnection(),
      device: getDefaultDevice(),
      page: getDefaultPage(),
    };
  }

  /**
   * 验证指标值是否有效
   */
  static isValidMetricValue(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * 获取指标的严重程度
   */
  static getMetricSeverity(
    metricKey: string,
    value: number,
    config: PerformanceAlertConfig,
  ): 'good' | 'warning' | 'critical' | null {
    const safeThresholds = new Map(Object.entries(config.thresholds));
    const thresholds = safeThresholds.get(metricKey);
    if (!thresholds) return null;

    if (value >= thresholds.critical) {
      return 'critical';
    }
    if (value >= thresholds.warning) {
      return 'warning';
    }
    return 'good';
  }

  /**
   * 批量检查多个指标
   */
  static batchCheckMetrics(
    metricsArray: DetailedWebVitals[],
    config: PerformanceAlertConfig,
  ): AlertInfo[] {
    const allAlerts: AlertInfo[] = [];

    metricsArray.forEach((metrics) => {
      const alerts: AlertInfo[] = [];
      AlertSystemChecker.checkMetricThresholds(metrics, config, alerts);
      allAlerts.push(...alerts);
    });

    return allAlerts;
  }
}

import { MAGIC_16 } from "@/constants/count";
import { ANIMATION_DURATION_VERY_SLOW, COUNT_PAIR, MAGIC_36, MAGIC_9, ONE, PERCENTAGE_FULL, PERCENTAGE_HALF, THREE_SECONDS_MS, ZERO } from "@/constants/magic-numbers";
import React from 'react';
import type {
  MonitoringControls,
  PerformanceAlert,
  PerformanceAlertSystem,
  PerformanceAlertThresholds,
  PerformanceMetrics,
  PerformanceMonitorReturnParams,
  PerformanceMonitorState,
  UsePerformanceMonitorOptions,
} from './performance-monitor-types';

/**
 * 性能监控常量
 */
export const PERFORMANCE_CONSTANTS = {
  MEMORY_THRESHOLD_MB: PERCENTAGE_HALF,
  MEMORY_BYTES_PER_MB: 1048576, // 1024 * 1024
  TIME_CALCULATION_FACTOR: MAGIC_36,
  CALCULATION_DIVISOR: COUNT_PAIR,
  CALCULATION_MULTIPLIER: MAGIC_9,
} as const;

/**
 * 默认性能警告阈值
 */
export const DEFAULT_ALERT_THRESHOLDS: Required<PerformanceAlertThresholds> = {
  loadTime: THREE_SECONDS_MS, // 3秒
  renderTime: MAGIC_16, // 16毫秒 (60fps)
  memoryUsage:
    PERFORMANCE_CONSTANTS.MEMORY_THRESHOLD_MB *
    PERFORMANCE_CONSTANTS.MEMORY_BYTES_PER_MB,
};

/**
 * 辅助函数：检查内存使用并生成警告
 */
export const checkMemoryUsageAlert = (
  memoryUsage: number,
  threshold: number,
  addAlert: (_alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void,
) => {
  if (memoryUsage > threshold) {
    addAlert({
      level: 'error',
      message: `High memory usage detected: ${Math.round(memoryUsage / PERFORMANCE_CONSTANTS.MEMORY_BYTES_PER_MB)}MB`,
      data: { memoryUsage },
    });
  }
};

/**
 * 辅助函数：创建性能警告系统
 */
export const createPerformanceAlertSystem = (
  alerts: PerformanceAlert[],
  alertHistory: React.MutableRefObject<PerformanceAlert[]>,
  addAlert: (_alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void,
  setAlerts: React.Dispatch<React.SetStateAction<PerformanceAlert[]>>,
): PerformanceAlertSystem => ({
  addAlert,
  getAlerts: () => alerts,
  getAlertHistory: () => alertHistory.current,
  clearAlerts: () => {
    setAlerts([]);
    alertHistory.current = [];
  },
});

/**
 * 辅助函数：创建监控控制函数
 */
export const createMonitoringControls = (
  setIsMonitoring: React.Dispatch<React.SetStateAction<boolean>>,
  _setError: React.Dispatch<React.SetStateAction<string | null>>,
  startTime: React.MutableRefObject<number | null>,
  setMetrics: React.Dispatch<React.SetStateAction<PerformanceMetrics | null>>,
): MonitoringControls => ({
  startMonitoring: () => {
    setIsMonitoring(true);
    startTime.current = performance.now();
    _setError(null);
  },
  stopMonitoring: () => {
    setIsMonitoring(false);
    startTime.current = null;
  },
  resetMetrics: () => {
    setMetrics(null);
    startTime.current = null;
    _setError(null);
  },
  refreshMetrics: () => {
    // 刷新当前指标
    _setError(null);
  },
});

/**
 * 辅助函数：创建返回对象
 */
export const createPerformanceMonitorReturn = (
  params: PerformanceMonitorReturnParams,
) => {
  const {
    isMonitoring,
    metrics,
    alerts,
    error,
    getMetrics,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    measureLoadTime,
    measureRenderTime,
    refreshMetrics,
    clearAlerts,
    performanceAlertSystem,
  } = params;

  return {
    isMonitoring,
    metrics,
    alerts,
    error,
    getMetrics,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    measureLoadTime,
    measureRenderTime,
    refreshMetrics,
    clearAlerts,
    performanceAlertSystem,
  };
};

/**
 * 验证和清理选项的辅助函数
 */
export const validateAndSanitizeOptions = (
  options: UsePerformanceMonitorOptions,
): PerformanceMonitorState => {
  // Validate and sanitize options to handle null/undefined/invalid values
  const safeOptions = options || {};

  const {
    enableAlerts = false,
    alertThresholds = {},
    monitoringInterval = ANIMATION_DURATION_VERY_SLOW,
    enableMemoryMonitoring = true,
    enableNetworkMonitoring = false,
    enableRenderTimeMonitoring = true,
    enableLoadTimeMonitoring = true,
    enableAutoBaseline = false,
    maxAlerts = PERCENTAGE_FULL,
  } = safeOptions;

  // Validate alertThresholds with proper fallbacks
  const safeAlertThresholds = alertThresholds || {};
  const validatedAlertThresholds: Required<PerformanceAlertThresholds> = {
    loadTime:
      typeof safeAlertThresholds.loadTime === 'number' &&
      safeAlertThresholds.loadTime > ZERO
        ? safeAlertThresholds.loadTime
        : DEFAULT_ALERT_THRESHOLDS.loadTime,
    renderTime:
      typeof safeAlertThresholds.renderTime === 'number' &&
      safeAlertThresholds.renderTime > ZERO
        ? safeAlertThresholds.renderTime
        : DEFAULT_ALERT_THRESHOLDS.renderTime,
    memoryUsage:
      typeof safeAlertThresholds.memoryUsage === 'number' &&
      safeAlertThresholds.memoryUsage > ZERO
        ? safeAlertThresholds.memoryUsage
        : DEFAULT_ALERT_THRESHOLDS.memoryUsage,
  };

  // Validate monitoringInterval
  const validMonitoringInterval =
    typeof monitoringInterval === 'number' && monitoringInterval > ZERO
      ? Math.max(PERCENTAGE_FULL, monitoringInterval) // Minimum 100ms
      : ANIMATION_DURATION_VERY_SLOW;

  // Validate maxAlerts
  const validMaxAlerts =
    typeof maxAlerts === 'number' && maxAlerts > ZERO
      ? Math.min(ANIMATION_DURATION_VERY_SLOW, Math.max(ONE, maxAlerts)) // Between 1 and 1000
      : PERCENTAGE_FULL;

  return {
    enableAlerts: Boolean(enableAlerts),
    alertThresholds: validatedAlertThresholds,
    enableMemoryMonitoring: Boolean(enableMemoryMonitoring),
    enableNetworkMonitoring: Boolean(enableNetworkMonitoring),
    enableRenderTimeMonitoring: Boolean(enableRenderTimeMonitoring),
    enableLoadTimeMonitoring: Boolean(enableLoadTimeMonitoring),
    enableAutoBaseline: Boolean(enableAutoBaseline),
    maxAlerts: validMaxAlerts,
    monitoringInterval: validMonitoringInterval,
  };
};

/**
 * 生成唯一ID的辅助函数
 */
export const generateAlertId = (): string => {
  return `alert_${Date.now()}_${Math.random().toString(MAGIC_36).substr(COUNT_PAIR, MAGIC_9)}`;
};

/**
 * 格式化内存使用量的辅助函数
 */
export const formatMemoryUsage = (bytes: number): string => {
  const mb = bytes / PERFORMANCE_CONSTANTS.MEMORY_BYTES_PER_MB;
  return `${mb.toFixed(COUNT_PAIR)}MB`;
};

/**
 * 格式化时间的辅助函数
 */
export const formatTime = (milliseconds: number): string => {
  if (milliseconds < ANIMATION_DURATION_VERY_SLOW) {
    return `${milliseconds.toFixed(COUNT_PAIR)}ms`;
  }
  return `${(milliseconds / ANIMATION_DURATION_VERY_SLOW).toFixed(COUNT_PAIR)}s`;
};

/**
 * 检查性能指标是否超过阈值
 */
export const checkPerformanceThresholds = (
  metrics: PerformanceMetrics,
  thresholds: Required<PerformanceAlertThresholds>,
  addAlert: (_alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void,
): void => {
  // 检查加载时间
  if (metrics.loadTime > thresholds.loadTime) {
    addAlert({
      level: 'warning',
      message: `Slow load time detected: ${formatTime(metrics.loadTime)}`,
      data: { loadTime: metrics.loadTime, threshold: thresholds.loadTime },
    });
  }

  // 检查渲染时间
  if (metrics.renderTime > thresholds.renderTime) {
    addAlert({
      level: 'warning',
      message: `Slow render time detected: ${formatTime(metrics.renderTime)}`,
      data: {
        renderTime: metrics.renderTime,
        threshold: thresholds.renderTime,
      },
    });
  }

  // 检查内存使用
  if (metrics.memoryUsage && metrics.memoryUsage > thresholds.memoryUsage) {
    addAlert({
      level: 'error',
      message: `High memory usage detected: ${formatMemoryUsage(metrics.memoryUsage)}`,
      data: {
        memoryUsage: metrics.memoryUsage,
        threshold: thresholds.memoryUsage,
      },
    });
  }
};

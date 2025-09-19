import React from 'react';
import {
  ANIMATION_DURATION_VERY_SLOW,
  COUNT_PAIR,
  MAGIC_9,
  MAGIC_36,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  THREE_SECONDS_MS,
  ZERO,
} from '@/constants';
import { MAGIC_16 } from '@/constants/count';
import type {
  MonitoringControls,
  PerformanceAlert,
  PerformanceAlertSystem,
  PerformanceAlertThresholds,
  PerformanceMetrics,
  PerformanceMonitorReturnParams,
  PerformanceMonitorState,
  UsePerformanceMonitorOptions,
} from '@/hooks/performance-monitor-types';

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
interface CreatePerformanceAlertSystemArgs {
  alerts: PerformanceAlert[];
  alertHistory: React.MutableRefObject<PerformanceAlert[]>;
  addAlert: (_alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void;
  setAlerts: React.Dispatch<React.SetStateAction<PerformanceAlert[]>>;
}

export const createPerformanceAlertSystem = ({
  alerts,
  alertHistory,
  addAlert,
  setAlerts,
}: CreatePerformanceAlertSystemArgs): PerformanceAlertSystem => ({
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
interface CreateMonitoringControlsArgs {
  setIsMonitoring: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  startTime: React.MutableRefObject<number | null>;
  setMetrics: React.Dispatch<React.SetStateAction<PerformanceMetrics | null>>;
  monitoringInterval: number;
  refreshMetrics: () => void;
  monitoringIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export const createMonitoringControls = ({
  setIsMonitoring,
  setError,
  startTime,
  setMetrics,
  monitoringInterval,
  refreshMetrics,
  monitoringIntervalRef,
}: CreateMonitoringControlsArgs): MonitoringControls => ({
  startMonitoring: () => {
    setIsMonitoring(true);
    startTime.current = performance.now();
    setError(null);
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
    monitoringIntervalRef.current = setInterval(() => {
      refreshMetrics();
    }, monitoringInterval);
  },
  stopMonitoring: () => {
    setIsMonitoring(false);
    startTime.current = null;
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  },
  resetMetrics: () => {
    setMetrics(null);
    startTime.current = null;
    setError(null);
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  },
  refreshMetrics: () => {
    // 刷新当前指标
    setError(null);
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
const coerceBoolean = (v: unknown, fallback: boolean): boolean =>
  typeof v === 'boolean' ? v : fallback;

const validateThresholds = (
  input?: PerformanceAlertThresholds,
): Required<PerformanceAlertThresholds> => {
  const t = input || {};
  return {
    loadTime:
      typeof t.loadTime === 'number' && t.loadTime > ZERO
        ? t.loadTime
        : DEFAULT_ALERT_THRESHOLDS.loadTime,
    renderTime:
      typeof t.renderTime === 'number' && t.renderTime > ZERO
        ? t.renderTime
        : DEFAULT_ALERT_THRESHOLDS.renderTime,
    memoryUsage:
      typeof t.memoryUsage === 'number' && t.memoryUsage > ZERO
        ? t.memoryUsage
        : DEFAULT_ALERT_THRESHOLDS.memoryUsage,
  };
};

const clampMonitoringInterval = (v: unknown): number => {
  if (typeof v === 'number' && v > ZERO) {
    return Math.max(PERCENTAGE_FULL, v);
  }
  return ANIMATION_DURATION_VERY_SLOW;
};

const clampMaxAlerts = (v: unknown): number => {
  if (typeof v === 'number' && v > ZERO) {
    const bounded = Math.max(ONE, v);
    return Math.min(ANIMATION_DURATION_VERY_SLOW, bounded);
  }
  return PERCENTAGE_FULL;
};

export const validateAndSanitizeOptions = (
  options: UsePerformanceMonitorOptions,
): PerformanceMonitorState => {
  const o = options || {};
  return {
    enableAlerts: coerceBoolean(o.enableAlerts, false),
    alertThresholds: validateThresholds(o.alertThresholds),
    enableMemoryMonitoring: coerceBoolean(o.enableMemoryMonitoring, true),
    enableNetworkMonitoring: coerceBoolean(o.enableNetworkMonitoring, false),
    enableRenderTimeMonitoring: coerceBoolean(
      o.enableRenderTimeMonitoring,
      true,
    ),
    enableLoadTimeMonitoring: coerceBoolean(o.enableLoadTimeMonitoring, true),
    enableAutoBaseline: coerceBoolean(o.enableAutoBaseline, false),
    maxAlerts: clampMaxAlerts(o.maxAlerts),
    monitoringInterval: clampMonitoringInterval(o.monitoringInterval),
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

'use client';

import { COUNT_PAIR, PERCENTAGE_FULL } from "@/constants/magic-numbers";
import { usePerformanceMeasurements } from '@/hooks/performance-monitor-measurements';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  PerformanceAlert,
  PerformanceMetrics,
  UsePerformanceMonitorOptions,
  UsePerformanceMonitorReturn,
} from './performance-monitor-types';
import {
  createMonitoringControls,
  createPerformanceAlertSystem,
  createPerformanceMonitorReturn,
  generateAlertId,
  validateAndSanitizeOptions,
} from './performance-monitor-utils';

/**
 * 性能监控 Hook
 *
 * 提供全面的性能监控功能，包括：
 * - 加载时间监控
 * - 渲染时间监控
 * - 内存使用监控
 * - 性能警告系统
 * - 实时性能指标
 */
export function usePerformanceMonitor(
  options: UsePerformanceMonitorOptions = {},
): UsePerformanceMonitorReturn {
  // 验证和清理选项
  const state = validateAndSanitizeOptions(options);
  const {
    enableAlerts,
    alertThresholds,
    monitoringInterval,
    enableMemoryMonitoring,
    enableRenderTimeMonitoring,
    enableLoadTimeMonitoring,
    maxAlerts,
  } = state;

  // 状态管理
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const startTime = useRef<number | null>(null);
  const alertHistory = useRef<PerformanceAlert[]>([]);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 添加警告的函数
  const addAlert = useCallback(
    (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
      const newAlert: PerformanceAlert = {
        ...alert,
        id: generateAlertId(),
        timestamp: Date.now(),
      };

      setAlerts((prev) => {
        const updated = [...prev, newAlert];
        // 限制警告数量
        if (updated.length > maxAlerts) {
          return updated.slice(-maxAlerts);
        }
        return updated;
      });

      // 添加到历史记录
      alertHistory.current.push(newAlert);
      if (alertHistory.current.length > maxAlerts * COUNT_PAIR) {
        alertHistory.current = alertHistory.current.slice(-maxAlerts * COUNT_PAIR);
      }
    },
    [maxAlerts],
  );

  // 性能测量函数
  const measurements = usePerformanceMeasurements(
    enableAlerts,
    alertThresholds,
    addAlert,
    setMetrics,
    startTime as any,
  );

  // 监控控制函数
  const controls = createMonitoringControls(
    setIsMonitoring,
    setError,
    startTime,
    setMetrics,
  );

  // 性能警告系统
  const performanceAlertSystem = createPerformanceAlertSystem(
    alerts,
    alertHistory,
    addAlert,
    setAlerts,
  );

  // 获取当前指标
  const getMetrics = useCallback(() => metrics, [metrics]);

  // 刷新指标
  const refreshMetrics = useCallback(() => {
    if (enableLoadTimeMonitoring) {
      measurements.measureLoadTime();
    }
    if (enableRenderTimeMonitoring) {
      measurements.measureRenderTime();
    }
    if (enableMemoryMonitoring) {
      measurements.measureMemoryUsage();
    }
  }, [
    enableLoadTimeMonitoring,
    enableRenderTimeMonitoring,
    enableMemoryMonitoring,
    measurements,
  ]);

  // 自动监控效果
  useEffect(() => {
    if (isMonitoring) {
      monitoringIntervalRef.current = setInterval(() => {
        refreshMetrics();
      }, monitoringInterval);

      return () => {
        if (monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current);
          monitoringIntervalRef.current = null;
        }
      };
    }
    return undefined;
  }, [isMonitoring, monitoringInterval, refreshMetrics]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  // 初始化时测量加载时间
  useEffect(() => {
    if (enableLoadTimeMonitoring) {
      // 延迟测量以确保页面完全加载
      const timer = setTimeout(() => {
        measurements.measureLoadTime();
      }, PERCENTAGE_FULL);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [enableLoadTimeMonitoring, measurements]);

  // 返回性能监控接口
  return createPerformanceMonitorReturn({
    isMonitoring,
    metrics,
    alerts,
    error,
    getMetrics,
    startMonitoring: controls.startMonitoring,
    stopMonitoring: controls.stopMonitoring,
    resetMetrics: controls.resetMetrics,
    measureLoadTime: measurements.measureLoadTime,
    measureRenderTime: measurements.measureRenderTime,
    refreshMetrics,
    clearAlerts: performanceAlertSystem.clearAlerts,
    performanceAlertSystem,
  });
}

/**
 * 导出类型定义
 */
export type {
  PerformanceAlert,
  PerformanceAlertSystem, PerformanceMetrics, UsePerformanceMonitorOptions,
  UsePerformanceMonitorReturn
} from './performance-monitor-types';

/**
 * 导出工具函数
 */
export {
  checkPerformanceThresholds, formatMemoryUsage,
  formatTime, PERFORMANCE_CONSTANTS
} from './performance-monitor-utils';

/**
 * 导出测量函数
 */
export {
  measureComprehensivePerformance, measureCumulativeLayoutShift, measureFirstContentfulPaint, measureFirstInputDelay, measureLargestContentfulPaint, measureNetworkLatency
} from './performance-monitor-measurements';

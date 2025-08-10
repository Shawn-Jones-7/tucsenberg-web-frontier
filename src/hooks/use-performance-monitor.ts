'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

// 性能监控常量
const PERFORMANCE_CONSTANTS = {
  MEMORY_THRESHOLD_MB: 50,
  MEMORY_BYTES_PER_MB: 1048576, // 1024 * 1024
  TIME_CALCULATION_FACTOR: 36,
  CALCULATION_DIVISOR: 2,
  CALCULATION_MULTIPLIER: 9,
} as const;

// 辅助函数：检查内存使用并生成警告
const checkMemoryUsageAlert = (
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

// 扩展Performance接口以包含memory属性
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkLatency?: number;
}

interface PerformanceAlert {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
  data?: Record<string, string | number | boolean>;
}

interface PerformanceAlertSystem {
  addAlert: (_alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void;
  getAlerts: () => PerformanceAlert[];
  getAlertHistory: () => PerformanceAlert[];
  clearAlerts: () => void;
}

interface PerformanceAlertThresholds {
  loadTime?: number;
  renderTime?: number;
  memoryUsage?: number;
}

interface UsePerformanceMonitorOptions {
  enableAlerts?: boolean;
  alertThresholds?: {
    loadTime?: number;
    renderTime?: number;
    memoryUsage?: number;
  };
  autoMonitoring?: boolean;
  monitoringInterval?: number;
  alertConfig?: {
    enabled: boolean;
    thresholds: {
      cls: { warning: number; critical: number };
      lcp: { warning: number; critical: number };
      fid: { warning: number; critical: number };
    };
  };
  autoBaseline?: boolean;
}

// 辅助函数：创建性能警告系统
const createPerformanceAlertSystem = (
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

// 辅助函数：创建监控控制函数
const createMonitoringControls = (
  setIsMonitoring: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  startTime: React.MutableRefObject<number | null>,
  setMetrics: React.Dispatch<React.SetStateAction<PerformanceMetrics | null>>,
) => ({
  startMonitoring: () => {
    setIsMonitoring(true);
    setError(null);
    startTime.current = Date.now();
    setMetrics({
      loadTime: 0,
      renderTime: 0,
    });
  },
  stopMonitoring: () => {
    setIsMonitoring(false);
  },
  resetMetrics: () => {
    setMetrics(null);
    setError(null);
  },
});

// 辅助函数：创建返回对象
interface PerformanceMonitorReturnParams {
  isMonitoring: boolean;
  metrics: PerformanceMetrics | null;
  alerts: PerformanceAlert[];
  error: string | null;
  getMetrics: () => PerformanceMetrics | null;
  resetMetrics: () => void;
  measureLoadTime: () => number;
  measureRenderTime: (renderStart: number) => number;
  measureMemoryUsage: () => number | undefined;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  refreshMetrics: () => void;
  clearAlerts: () => void;
  performanceAlertSystem: PerformanceAlertSystem;
}

const createPerformanceMonitorReturn = (
  params: PerformanceMonitorReturnParams,
) => {
  const {
    isMonitoring,
    metrics,
    alerts,
    error,
    getMetrics,
    resetMetrics,
    measureLoadTime,
    measureRenderTime,
    measureMemoryUsage,
    startMonitoring,
    stopMonitoring,
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
    resetMetrics,
    measureLoadTime,
    measureRenderTime,
    measureMemoryUsage,
    startMonitoring,
    stopMonitoring,
    refreshMetrics,
    clearAlerts,
    performanceAlertSystem,
  };
};

// 创建性能监控状态的辅助函数
function usePerformanceMonitorState(options: UsePerformanceMonitorOptions) {
  const {
    enableAlerts = false,
    alertThresholds = {
      loadTime: 3000,
      renderTime: 100,
      memoryUsage:
        PERFORMANCE_CONSTANTS.MEMORY_THRESHOLD_MB *
        PERFORMANCE_CONSTANTS.MEMORY_BYTES_PER_MB, // 50MB
    },
  } = options;

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const alertHistory = useRef<PerformanceAlert[]>([]);
  const startTime = useRef<number>(Date.now());

  const addAlert = useCallback(
    (alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
      const newAlert: PerformanceAlert = {
        ...alert,
        id: Math.random()
          .toString(PERFORMANCE_CONSTANTS.TIME_CALCULATION_FACTOR)
          .substr(
            PERFORMANCE_CONSTANTS.CALCULATION_DIVISOR,
            PERFORMANCE_CONSTANTS.CALCULATION_MULTIPLIER,
          ),
        timestamp: Date.now(),
      };

      setAlerts((prev) => [...prev, newAlert]);
      alertHistory.current.push(newAlert);
    },
    [],
  );

  return {
    enableAlerts,
    alertThresholds,
    isMonitoring,
    setIsMonitoring,
    metrics,
    setMetrics,
    alerts,
    setAlerts,
    error,
    setError,
    alertHistory,
    startTime,
    addAlert,
  };
}

// 创建性能测量函数的辅助函数
function usePerformanceMeasurements(
  enableAlerts: boolean,
  alertThresholds: Required<PerformanceAlertThresholds>,
  addAlert: (_alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void,
  setMetrics: React.Dispatch<React.SetStateAction<PerformanceMetrics | null>>,
  startTime: React.MutableRefObject<number>,
) {
  const measureLoadTime = useCallback(() => {
    const loadTime = Date.now() - startTime.current;
    setMetrics((prev) =>
      prev ? { ...prev, loadTime } : { loadTime, renderTime: 0 },
    );

    if (enableAlerts && loadTime > alertThresholds.loadTime!) {
      addAlert({
        level: 'warning',
        message: `Slow load time detected: ${loadTime}ms`,
        data: { loadTime },
      });
    }

    return loadTime;
  }, [enableAlerts, alertThresholds.loadTime, addAlert, setMetrics, startTime]);

  const measureRenderTime = useCallback(
    (renderStart: number) => {
      const renderTime = Date.now() - renderStart;
      setMetrics((prev) =>
        prev ? { ...prev, renderTime } : { loadTime: 0, renderTime },
      );

      if (enableAlerts && renderTime > alertThresholds.renderTime!) {
        addAlert({
          level: 'warning',
          message: `Slow render time detected: ${renderTime}ms`,
          data: { renderTime },
        });
      }

      return renderTime;
    },
    [enableAlerts, alertThresholds.renderTime, addAlert, setMetrics],
  );

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance && performance.memory) {
      const memoryInfo = performance.memory;
      const memoryUsage = memoryInfo.usedJSHeapSize;
      setMetrics((prev) =>
        prev
          ? { ...prev, memoryUsage }
          : { loadTime: 0, renderTime: 0, memoryUsage },
      );

      if (enableAlerts && alertThresholds.memoryUsage) {
        checkMemoryUsageAlert(
          memoryUsage,
          alertThresholds.memoryUsage,
          addAlert,
        );
      }

      return memoryUsage;
    }
    return undefined;
  }, [enableAlerts, alertThresholds.memoryUsage, addAlert, setMetrics]);

  return {
    measureLoadTime,
    measureRenderTime,
    measureMemoryUsage,
  };
}

export function usePerformanceMonitor(
  options: UsePerformanceMonitorOptions = {},
) {
  const state = usePerformanceMonitorState(options);
  const {
    enableAlerts,
    alertThresholds,
    isMonitoring,
    setIsMonitoring,
    metrics,
    setMetrics,
    alerts,
    setAlerts,
    error,
    setError,
    alertHistory,
    startTime,
    addAlert,
  } = state;

  const performanceAlertSystem: PerformanceAlertSystem =
    createPerformanceAlertSystem(alerts, alertHistory, addAlert, setAlerts);

  const monitoringControls = createMonitoringControls(
    setIsMonitoring,
    setError,
    startTime,
    setMetrics,
  );
  const { startMonitoring, stopMonitoring, resetMetrics } = monitoringControls;

  const measurements = usePerformanceMeasurements(
    enableAlerts,
    alertThresholds as Required<PerformanceAlertThresholds>,
    addAlert,
    setMetrics,
    startTime,
  );
  const { measureLoadTime, measureRenderTime, measureMemoryUsage } =
    measurements;

  const refreshMetrics = useCallback(() => {
    if (isMonitoring) {
      measureLoadTime();
      measureMemoryUsage();
    }
  }, [isMonitoring, measureLoadTime, measureMemoryUsage]);

  useEffect(() => {
    // Measure initial load time
    const timer = setTimeout(() => {
      measureLoadTime();
    }, 100);

    return () => clearTimeout(timer);
  }, [measureLoadTime]);

  const getMetrics = () => metrics;

  return createPerformanceMonitorReturn({
    isMonitoring,
    metrics,
    alerts,
    error,
    getMetrics,
    resetMetrics,
    measureLoadTime,
    measureRenderTime,
    measureMemoryUsage,
    startMonitoring,
    stopMonitoring,
    refreshMetrics,
    clearAlerts: performanceAlertSystem.clearAlerts,
    performanceAlertSystem,
  });
}

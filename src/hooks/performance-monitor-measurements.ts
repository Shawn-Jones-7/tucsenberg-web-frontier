import React from 'react';
import { MAGIC_10000 } from '@/constants/magic-numbers';

import { logger } from '@/lib/logger';
import type {
  PerformanceAlert,
  PerformanceAlertThresholds,
  PerformanceMeasurements,
  PerformanceMetrics,
} from './performance-monitor-types';
import { checkMemoryUsageAlert } from '@/hooks/performance-monitor-utils';

/**
 * 创建性能测量函数的辅助函数
 */
export function usePerformanceMeasurements(
  enableAlerts: boolean,
  alertThresholds: Required<PerformanceAlertThresholds>,
  addAlert: (_alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => void,
  setMetrics: React.Dispatch<React.SetStateAction<PerformanceMetrics | null>>,
  startTime: React.MutableRefObject<number>,
): PerformanceMeasurements {
  const measureLoadTime = React.useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.startTime;

          setMetrics((prev) => ({
            renderTime: 0,
            ...(prev || {}),
            loadTime,
          }));

          if (enableAlerts && loadTime > alertThresholds.loadTime) {
            addAlert({
              level: 'warning',
              message: `Slow page load detected: ${Math.round(loadTime)}ms`,
              data: { loadTime },
            });
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to measure load time', { error: error as Error });
    }
  }, [enableAlerts, alertThresholds.loadTime, addAlert, setMetrics]);

  const measureRenderTime = React.useCallback(() => {
    try {
      if (startTime.current !== null) {
        const renderTime = performance.now() - startTime.current;

        setMetrics((prev) => ({
          loadTime: 0,
          ...(prev || {}),
          renderTime,
        }));

        if (enableAlerts && renderTime > alertThresholds.renderTime) {
          addAlert({
            level: 'warning',
            message: `Slow render detected: ${Math.round(renderTime)}ms`,
            data: { renderTime },
          });
        }
      }
    } catch (error) {
      logger.warn('Failed to measure render time', { error: error as Error });
    }
  }, [
    enableAlerts,
    alertThresholds.renderTime,
    addAlert,
    setMetrics,
    startTime,
  ]);

  const measureMemoryUsage = React.useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.performance?.memory) {
        const memoryUsage = window.performance.memory.usedJSHeapSize;

        setMetrics((prev) => ({
          loadTime: 0,
          renderTime: 0,
          ...(prev || {}),
          memoryUsage,
        }));

        if (enableAlerts) {
          checkMemoryUsageAlert(
            memoryUsage,
            alertThresholds.memoryUsage,
            addAlert,
          );
        }
      }
    } catch (error) {
      logger.warn('Failed to measure memory usage', { error: error as Error });
    }
  }, [enableAlerts, alertThresholds.memoryUsage, addAlert, setMetrics]);

  return {
    measureLoadTime,
    measureRenderTime,
    measureMemoryUsage,
  };
}

/**
 * 测量网络延迟
 */
export const measureNetworkLatency = async (): Promise<number | null> => {
  try {
    if (typeof window !== 'undefined' && (navigator as any).connection) {
      // 使用 Network Information API (如果可用)
      const connection = (navigator as any).connection as {
        rtt?: number;
        effectiveType?: string;
        downlink?: number;
      };
      if (connection.rtt) {
        return connection.rtt;
      }
    }

    // 回退到简单的ping测试
    const startTime = performance.now();
    await fetch('/api/ping', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    const endTime = performance.now();

    return endTime - startTime;
  } catch (error) {
    logger.warn('Failed to measure network latency', { error: error as Error });
    return null;
  }
};

/**
 * 测量首次内容绘制 (FCP)
 */
export const measureFirstContentfulPaint = (): number | null => {
  try {
    if (typeof window !== 'undefined' && window.performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(
        (entry) => entry.name === 'first-contentful-paint',
      );
      return fcpEntry ? fcpEntry.startTime : null;
    }
    return null;
  } catch (error) {
    logger.warn('Failed to measure FCP', { error: error as Error });
    return null;
  }
};

/**
 * 测量最大内容绘制 (LCP)
 */
export const measureLargestContentfulPaint = (): Promise<number | null> => {
  return new Promise((resolve) => {
    try {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry ? lastEntry.startTime : null);
          observer.disconnect();
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // 超时处理
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, 5000);
      } else {
        resolve(null);
      }
    } catch (error) {
      logger.warn('Failed to measure LCP', { error: error as Error });
      resolve(null);
    }
  });
};

/**
 * 测量累积布局偏移 (CLS)
 */
export const measureCumulativeLayoutShift = (): Promise<number | null> => {
  return new Promise((resolve) => {
    try {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        let clsValue = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as unknown as {
              hadRecentInput?: boolean;
              value: number;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });

        // 在页面隐藏时返回结果
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'hidden') {
            observer.disconnect();
            document.removeEventListener(
              'visibilitychange',
              handleVisibilityChange,
            );
            resolve(clsValue);
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 超时处理
        setTimeout(() => {
          observer.disconnect();
          document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange,
          );
          resolve(clsValue);
        }, MAGIC_10000);
      } else {
        resolve(null);
      }
    } catch (error) {
      logger.warn('Failed to measure CLS', { error: error as Error });
      resolve(null);
    }
  });
};

/**
 * 测量首次输入延迟 (FID)
 */
export const measureFirstInputDelay = (): Promise<number | null> => {
  return new Promise((resolve) => {
    try {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          if (firstEntry) {
            const firstInputEntry = firstEntry as unknown as {
              processingStart: number;
              startTime: number;
            };
            const fid = firstInputEntry.processingStart - firstEntry.startTime;
            resolve(fid);
          } else {
            resolve(null);
          }
          observer.disconnect();
        });

        observer.observe({ entryTypes: ['first-input'] });

        // 超时处理
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, MAGIC_10000);
      } else {
        resolve(null);
      }
    } catch (error) {
      logger.warn('Failed to measure FID', { error: error as Error });
      resolve(null);
    }
  });
};

/**
 * 综合性能测量函数
 */
export const measureComprehensivePerformance = async (): Promise<
  Partial<PerformanceMetrics>
> => {
  const metrics: Partial<PerformanceMetrics> = {};

  try {
    // 测量基本指标
    if (typeof window !== 'undefined' && window.performance) {
      // 加载时间
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.loadTime = navigation.loadEventEnd - navigation.startTime;
      }

      // 内存使用
      if (window.performance.memory) {
        metrics.memoryUsage = window.performance.memory.usedJSHeapSize;
      }
    }

    // 网络延迟
    const networkLatency = await measureNetworkLatency();
    if (networkLatency !== null) {
      metrics.networkLatency = networkLatency;
    }

    return metrics;
  } catch (error) {
    logger.warn('Failed to measure comprehensive performance', {
      error: error as Error,
    });
    return {};
  }
};

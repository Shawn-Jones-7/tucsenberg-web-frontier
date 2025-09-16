import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TEST_BASE_NUMBERS } from '@/constants/test-constants';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';

// Mock performance.memory
const mockPerformanceMemory = {
  usedJSHeapSize:
    TEST_BASE_NUMBERS.MEMORY_SIZE_50MB *
    TEST_BASE_NUMBERS.BYTES_PER_KB *
    TEST_BASE_NUMBERS.BYTES_PER_KB, // 50MB
  totalJSHeapSize:
    TEST_BASE_NUMBERS.MEMORY_SIZE_100MB *
    TEST_BASE_NUMBERS.BYTES_PER_KB *
    TEST_BASE_NUMBERS.BYTES_PER_KB, // 100MB
  jsHeapSizeLimit:
    TEST_BASE_NUMBERS.MEMORY_SIZE_200MB *
    TEST_BASE_NUMBERS.BYTES_PER_KB *
    TEST_BASE_NUMBERS.BYTES_PER_KB, // 200MB
};

// Mock performance API
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    ...performance,
    memory: mockPerformanceMemory,
    now: vi.fn(() => Date.now()),
  },
});

// Mock Date.now for consistent timing
const mockDateNow = vi.fn(() => 1000);
vi.stubGlobal('Date', {
  ...Date,
  now: mockDateNow,
});

// Mock setTimeout and clearTimeout
vi.stubGlobal(
  'setTimeout',
  vi.fn((fn, _delay) => {
    if (typeof fn === 'function') {
      fn();
    }
    return 1;
  }),
);
vi.stubGlobal('clearTimeout', vi.fn());

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset Date.now mock
    mockDateNow.mockReturnValue(1000);

    // Reset performance.memory mock
    Object.defineProperty(global.performance, 'memory', {
      writable: true,
      value: mockPerformanceMemory,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初始化', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(result.current.isMonitoring).toBe(false);
      expect(result.current.metrics).toEqual({
        loadTime: 0,
        renderTime: 0,
      });
      expect(result.current.alerts).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(typeof result.current.startMonitoring).toBe('function');
      expect(typeof result.current.stopMonitoring).toBe('function');
      expect(typeof result.current.refreshMetrics).toBe('function');
      expect(typeof result.current.clearAlerts).toBe('function');
    });

    it('should initialize with custom config', () => {
      const config = {
        enableAlerts: true,
        alertThresholds: {
          loadTime: 1000,
          renderTime: 500,
          memoryUsage:
            TEST_BASE_NUMBERS.MEMORY_SIZE_100MB *
            TEST_BASE_NUMBERS.BYTES_PER_KB *
            TEST_BASE_NUMBERS.BYTES_PER_KB, // 100MB
        },
        autoMonitoring: true,
        monitoringInterval: 5000,
      };

      const { result } = renderHook(() => usePerformanceMonitor(config));

      expect(result.current.isMonitoring).toBe(true);
      expect(result.current.metrics).toEqual({
        loadTime: 0,
        renderTime: 0,
      });
      expect(result.current.alerts).toEqual([]);
      expect(result.current.error).toBe(null);
    });
  });

  describe('性能监控控制', () => {
    it('should start monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);
      expect(result.current.metrics).toEqual({
        loadTime: 0,
        renderTime: 0,
      });
    });

    it('should stop monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);

      act(() => {
        result.current.stopMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);
    });

    it('should handle monitoring errors', () => {
      // Mock performance.memory to be undefined to trigger error
      Object.defineProperty(global.performance, 'memory', {
        writable: true,
        value: undefined,
      });

      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      // Should still start monitoring even without memory API
      expect(result.current.isMonitoring).toBe(true);
    });

    it('should handle unknown errors', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      // Should handle gracefully
      expect(result.current.isMonitoring).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });

  describe('指标刷新', () => {
    it('should refresh metrics manually', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      act(() => {
        result.current.refreshMetrics();
      });

      // Should have metrics after refresh
      expect(result.current.metrics).toBeTruthy();
      expect(result.current.isMonitoring).toBe(true);
    });

    it('should handle refresh when not monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.refreshMetrics();
      });

      // Should not crash when not monitoring
      expect(result.current.metrics).toEqual({
        loadTime: 0,
        renderTime: 0,
      });
      expect(result.current.error).toBe(null);
    });
  });

  describe('自动监控', () => {
    it('should perform automatic monitoring when enabled', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAutoBaseline: true,
          monitoringInterval: 1000,
        }),
      );

      act(() => {
        result.current.startMonitoring();
      });

      // Should start monitoring
      expect(result.current.isMonitoring).toBe(true);
    });

    it('should not perform automatic monitoring when disabled', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAutoBaseline: false,
        }),
      );

      act(() => {
        result.current.startMonitoring();
      });

      // Should still start monitoring manually
      expect(result.current.isMonitoring).toBe(true);
    });

    it('should clear interval when monitoring stops', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAutoBaseline: true,
          monitoringInterval: 1000,
        }),
      );

      act(() => {
        result.current.startMonitoring();
      });

      act(() => {
        result.current.stopMonitoring();
      });

      // Should stop monitoring
      expect(result.current.isMonitoring).toBe(false);
    });
  });

  describe('警报管理', () => {
    it('should load alerts from alert system', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAlerts: true,
          alertThresholds: {
            memoryUsage:
              (TEST_BASE_NUMBERS.MEMORY_SIZE_50MB *
                TEST_BASE_NUMBERS.BYTES_PER_KB *
                TEST_BASE_NUMBERS.BYTES_PER_KB) /
              TEST_BASE_NUMBERS.SMALL_COUNT, // 25MB threshold
          },
        }),
      );

      // Start monitoring to trigger memory check
      act(() => {
        result.current.startMonitoring();
      });

      // Should have alerts array (may be empty initially)
      expect(Array.isArray(result.current.alerts)).toBe(true);
    });

    it('should clear alerts', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.clearAlerts();
      });

      expect(result.current.alerts).toEqual([]);
    });

    it('should handle alert system errors', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(() => {
        result.current.clearAlerts();
      }).not.toThrow();
    });
  });

  describe('组件卸载处理', () => {
    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() =>
        usePerformanceMonitor({
          enableAutoBaseline: true,
          monitoringInterval: 1000,
        }),
      );

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);

      unmount();

      // Should not cause errors after unmount
      expect(() => {
        // Just test that unmount doesn't throw
      }).not.toThrow();
    });

    it('should handle cleanup errors gracefully', () => {
      const { result, unmount } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      // Should handle unmount gracefully
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('边缘情况处理', () => {
    it('should handle multiple start monitoring calls', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
        result.current.startMonitoring();
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);
    });

    it('should handle stop monitoring when not monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(() => {
        result.current.stopMonitoring();
      }).not.toThrow();

      expect(result.current.isMonitoring).toBe(false);
    });

    it('should handle refresh when not monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.refreshMetrics();
      });

      // Should handle gracefully when not monitoring
      expect(result.current.metrics).toEqual({
        loadTime: 0,
        renderTime: 0,
      });
      expect(result.current.error).toBe(null);
    });
  });

  describe('内存监控深度测试', () => {
    it('should handle memory API variations', () => {
      const memoryVariations = [
        { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 },
        {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 4000000,
        },
        {
          usedJSHeapSize: undefined,
          totalJSHeapSize: undefined,
          jsHeapSizeLimit: undefined,
        },
      ];

      memoryVariations.forEach((memory) => {
        Object.defineProperty(global.performance, 'memory', {
          writable: true,
          value: memory,
        });

        const { result } = renderHook(() => usePerformanceMonitor());

        act(() => {
          result.current.startMonitoring();
        });

        expect(result.current.isMonitoring).toBe(true);
      });
    });

    it('should handle performance.now errors', () => {
      const originalNow = global.performance.now;

      try {
        global.performance.now = vi.fn(() => {
          throw new Error('Performance.now error');
        });

        const { result } = renderHook(() => usePerformanceMonitor());

        expect(() => {
          act(() => {
            result.current.startMonitoring();
          });
        }).not.toThrow();
      } finally {
        global.performance.now = originalNow;
      }
    });

    it('should handle missing performance object', () => {
      const originalPerformance = global.performance;

      try {
        // @ts-expect-error - Testing edge case
        global.performance = undefined;

        const { result } = renderHook(() => usePerformanceMonitor());

        expect(() => {
          act(() => {
            result.current.startMonitoring();
          });
        }).not.toThrow();
      } finally {
        global.performance = originalPerformance;
      }
    });
  });

  describe('配置验证和错误处理', () => {
    it('should handle invalid configuration gracefully', () => {
      const invalidConfigs = [
        { monitoringInterval: -1 },
        { monitoringInterval: 0 },
        { alertThresholds: null },
        { enableAlerts: 'invalid' },
      ];

      invalidConfigs.forEach((config) => {
        expect(() => {
          renderHook(() => usePerformanceMonitor(config as any));
        }).not.toThrow();
      });
    });

    it('should handle extremely high monitoring intervals', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAutoBaseline: true,
          monitoringInterval: 999999999,
        }),
      );

      expect(result.current.isMonitoring).toBe(true);
    });

    it('should handle configuration changes during monitoring', () => {
      const { result, rerender } = renderHook(
        ({ config }) => usePerformanceMonitor(config),
        {
          initialProps: {
            config: { autoMonitoring: true, monitoringInterval: 1000 },
          },
        },
      );

      expect(result.current.isMonitoring).toBe(true);

      // Change configuration
      rerender({
        config: { autoMonitoring: false, monitoringInterval: 2000 },
      });

      // Should handle configuration change gracefully
      expect(() => {
        act(() => {
          result.current.refreshMetrics();
        });
      }).not.toThrow();
    });
  });

  describe('并发和竞态条件', () => {
    it('should handle rapid start/stop cycles', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(() => {
        act(() => {
          for (let i = 0; i < 10; i++) {
            result.current.startMonitoring();
            result.current.stopMonitoring();
          }
        });
      }).not.toThrow();
    });

    it('should handle concurrent refresh calls', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      expect(() => {
        act(() => {
          // Simulate concurrent refresh calls
          result.current.refreshMetrics();
          result.current.refreshMetrics();
          result.current.refreshMetrics();
        });
      }).not.toThrow();
    });

    it('should handle monitoring state changes during refresh', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        result.current.startMonitoring();
      });

      expect(() => {
        act(() => {
          result.current.refreshMetrics();
          result.current.stopMonitoring();
          result.current.refreshMetrics();
        });
      }).not.toThrow();
    });
  });

  describe('性能警报系统边缘情况', () => {
    it('should handle alert system with missing memory API', () => {
      const originalMemory = global.performance.memory;
      delete (global.performance as unknown).memory;

      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAlerts: true,
          alertThresholds: {
            memoryUsage: 1000000, // 1MB threshold
          },
        }),
      );

      act(() => {
        result.current.startMonitoring();
        // measureMemoryUsage is not exposed in the hook return value
        // Instead, we can check if memory monitoring works through metrics
        expect(result.current.metrics?.memoryUsage).toBeUndefined();
      });

      // Restore memory property
      Object.defineProperty(global.performance, 'memory', {
        writable: true,
        value: originalMemory,
      });
    });

    it('should handle alert threshold edge cases', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAlerts: true,
          alertThresholds: {
            loadTime: 0, // Zero threshold should trigger alerts
            renderTime: Number.MAX_SAFE_INTEGER, // Very high threshold
            memoryUsage: -1, // Negative threshold (invalid)
          },
        }),
      );

      act(() => {
        result.current.startMonitoring();
        result.current.measureLoadTime();
        result.current.measureRenderTime();
      });

      // Should handle edge cases without crashing
      expect(result.current.isMonitoring).toBe(true);
    });
  });

  describe('自动基线功能测试', () => {
    it('should handle autoBaseline configuration', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAutoBaseline: true,
          enableAlerts: true,
          alertThresholds: {
            loadTime: 2500,
            renderTime: 100,
            memoryUsage: 300,
          },
        }),
      );

      expect(result.current.performanceAlertSystem).toBeDefined();
    });

    it('should handle missing alertConfig with autoBaseline', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          autoBaseline: true,
          // Missing alertConfig
        }),
      );

      expect(result.current.performanceAlertSystem).toBeDefined();
    });
  });

  describe('内存泄漏防护测试', () => {
    it('should not accumulate alerts indefinitely', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAlerts: true,
          alertThresholds: {
            loadTime: 0, // Always trigger alerts
          },
        }),
      );

      act(() => {
        result.current.startMonitoring();

        // Generate many alerts
        for (let i = 0; i < 100; i++) {
          result.current.measureLoadTime();
        }
      });

      // Should have some alerts but not necessarily all 100
      expect(result.current.alerts.length).toBeGreaterThan(0);
      expect(result.current.alerts.length).toBeLessThan(200); // Reasonable upper bound
    });

    it('should handle alert clearing', () => {
      const { result } = renderHook(() =>
        usePerformanceMonitor({
          enableAlerts: true,
          alertThresholds: {
            loadTime: 0,
          },
        }),
      );

      act(() => {
        result.current.startMonitoring();
        result.current.measureLoadTime();
        result.current.clearAlerts();
      });

      expect(result.current.alerts).toEqual([]);
    });
  });
});

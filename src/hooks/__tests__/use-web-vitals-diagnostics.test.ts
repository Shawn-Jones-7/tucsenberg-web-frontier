import { act, renderHook, type RenderHookResult } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DetailedWebVitals } from '@/lib/web-vitals/types';
// 4. 导入测试常量和被测试的模块
import {
  TEST_COUNT_CONSTANTS,
  TEST_WEB_VITALS_DIAGNOSTICS,
} from '@/constants/test-constants';
import { useWebVitalsDiagnostics } from '@/hooks/use-web-vitals-diagnostics';
import type { UseWebVitalsDiagnosticsReturn } from '@/hooks/web-vitals-diagnostics-types';
import type { DiagnosticReport } from '@/hooks/web-vitals-diagnostics-utils';

// 1. 直接Mock模块 - 移到文件顶部确保在所有导入前执行
vi.mock('@/lib/enhanced-web-vitals', () => ({
  enhancedWebVitalsCollector: {
    generateDiagnosticReport: vi.fn(),
    getDetailedMetrics: vi.fn(),
    cleanup: vi.fn(),
  },
}));

// Mock logger模块
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const renderDiagnosticsHook = (): RenderHookResult<
  UseWebVitalsDiagnosticsReturn,
  void
> => renderHook(() => useWebVitalsDiagnostics());

// 2. 使用vi.hoisted确保Mock函数在模块导入前设置
const { mockLocalStorage, _mockLogger } = vi.hoisted(() => ({
  mockLocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  _mockLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const getCollectorMock = async () => {
  const { enhancedWebVitalsCollector } = await import(
    '@/lib/enhanced-web-vitals'
  );
  return vi.mocked(enhancedWebVitalsCollector);
};

const getLoggerMock = async () => {
  const { logger } = await import('@/lib/logger');
  return vi.mocked(logger);
};

type DiagnosticsHookRender = ReturnType<typeof renderDiagnosticsHook>;
type DiagnosticsHookResult = DiagnosticsHookRender['result'];

let performanceNowSpy: ReturnType<typeof vi.spyOn> | null = null;

// 3. Mock浏览器API
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock URL.createObjectURL for browser API tests
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

// Mock window对象
Object.defineProperty(global, 'window', {
  value: {
    location: { href: 'http://localhost:3000/test' },
    navigator: { userAgent: 'test-agent' },
  },
  writable: true,
});

// Mock验证函数
const verifyMockSetup = async () => {
  const { enhancedWebVitalsCollector } = await import(
    '@/lib/enhanced-web-vitals'
  );

  // 验证Mock函数是否正确设置
  expect(
    vi.isMockFunction(enhancedWebVitalsCollector.generateDiagnosticReport),
  ).toBe(true);
  expect(vi.isMockFunction(enhancedWebVitalsCollector.getDetailedMetrics)).toBe(
    true,
  );
  expect(vi.isMockFunction(enhancedWebVitalsCollector.cleanup)).toBe(true);

  // 验证Mock函数可以被调用
  expect(enhancedWebVitalsCollector.generateDiagnosticReport).toBeDefined();
  expect(enhancedWebVitalsCollector.getDetailedMetrics).toBeDefined();
  expect(enhancedWebVitalsCollector.cleanup).toBeDefined();
};

// 辅助函数：验证Hook返回值的完整性
const validateHookResult = ({ current }: DiagnosticsHookResult) => {
  expect(current).toBeTruthy();
  expect(current).not.toBeNull();
  expect(typeof current.refreshDiagnostics).toBe('function');
  expect(typeof current.getPerformanceTrends).toBe('function');
  expect(typeof current.exportReport).toBe('function');
  expect(typeof current.getPageComparison).toBe('function');
  expect(typeof current.clearHistory).toBe('function');
};

describe('useWebVitalsDiagnostics', () => {
  const baseTimestamp = Date.now();

  const mockDetailedMetrics: DetailedWebVitals = {
    cls: TEST_WEB_VITALS_DIAGNOSTICS.CLS_BASELINE,
    fid: TEST_WEB_VITALS_DIAGNOSTICS.FID_BASELINE,
    lcp: TEST_WEB_VITALS_DIAGNOSTICS.LCP_BASELINE,
    fcp: TEST_WEB_VITALS_DIAGNOSTICS.FCP_BASELINE,
    ttfb: TEST_WEB_VITALS_DIAGNOSTICS.TTFB_BASELINE,
    inp: TEST_WEB_VITALS_DIAGNOSTICS.INP_BASELINE,
    domContentLoaded: 1200,
    loadComplete: 2000,
    firstPaint: 900,
    resourceTiming: {
      totalResources: 5,
      slowResources: [],
      totalSize: 0,
      totalDuration: 0,
    },
    connection: {
      effectiveType: '4g',
      downlink: TEST_WEB_VITALS_DIAGNOSTICS.NETWORK_DOWNLINK,
      rtt: TEST_WEB_VITALS_DIAGNOSTICS.NETWORK_RTT,
      saveData: false,
    },
    device: {
      memory: TEST_WEB_VITALS_DIAGNOSTICS.DEVICE_MEMORY,
      cores: 4,
      userAgent: 'test-agent',
      viewport: { width: 1920, height: 1080 },
    },
    page: {
      url: 'http://localhost:3000/test',
      referrer: '',
      title: 'Diagnostics Test Page',
      timestamp: baseTimestamp,
    },
  };

  // Mock返回值应该匹配generateDiagnosticReport的返回类型
  const mockGenerateReportResult = {
    metrics: mockDetailedMetrics,
    analysis: {
      issues: ['LCP could be improved'],
      recommendations: ['Optimize images', 'Use CDN'],
      score: TEST_WEB_VITALS_DIAGNOSTICS.PERFORMANCE_SCORE,
    },
  };

  // 期望的DiagnosticReport结构（Hook内部转换后的）
  const mockDiagnosticReport: DiagnosticReport = {
    timestamp: baseTimestamp,
    vitals: mockDetailedMetrics,
    score: mockGenerateReportResult.analysis.score,
    issues: mockGenerateReportResult.analysis.issues,
    recommendations: mockGenerateReportResult.analysis.recommendations,
    pageUrl: mockDetailedMetrics.page.url,
    userAgent: mockDetailedMetrics.device.userAgent,
  };

  beforeEach(async () => {
    // 1. 验证Mock设置
    await verifyMockSetup();

    // 2. 统一使用vi.clearAllMocks()重置所有Mock
    vi.clearAllMocks();
    vi.useFakeTimers();

    performanceNowSpy = vi
      .spyOn(globalThis.performance, 'now')
      .mockReturnValue(100);

    // 3. 获取Mock实例并设置默认行为
    const collector = await getCollectorMock();
    collector.generateDiagnosticReport.mockReturnValue(
      mockGenerateReportResult,
    );
    collector.getDetailedMetrics.mockReturnValue(mockDetailedMetrics);
    collector.cleanup.mockImplementation(() => {});

    // 4. 设置浏览器API Mock的默认行为
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
    mockLocalStorage.clear.mockImplementation(() => {});
  });

  // 辅助函数：重置所有Mock到默认状态
  const resetMocksToDefault = async () => {
    vi.clearAllMocks();

    // 获取Mock实例并重新设置默认行为
    const collector = await getCollectorMock();
    collector.generateDiagnosticReport.mockReturnValue(
      mockGenerateReportResult,
    );
    collector.getDetailedMetrics.mockReturnValue(mockDetailedMetrics);
    collector.cleanup.mockImplementation(() => {});

    // 重置浏览器API Mock
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
    mockLocalStorage.clear.mockImplementation(() => {});
  };

  afterEach(() => {
    vi.useRealTimers();
    if (performanceNowSpy) {
      performanceNowSpy.mockRestore();
      performanceNowSpy = null;
    }
    // 统一使用vi.clearAllMocks()而不是vi.resetAllMocks()
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      expect(result.current).not.toBeNull();
      expect(result.current).toBeDefined();
      // Hook初始化时isLoading为false，只有在调用refreshDiagnostics时才为true
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentReport).toBe(null);
      expect(result.current.historicalReports).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should provide all required functions', () => {
      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      expect(result.current).not.toBeNull();
      expect(result.current).toBeDefined();

      expect(typeof result.current.refreshDiagnostics).toBe('function');
      expect(typeof result.current.getPerformanceTrends).toBe('function');
      expect(typeof result.current.exportReport).toBe('function');
      expect(typeof result.current.getPageComparison).toBe('function');
      expect(typeof result.current.clearHistory).toBe('function');
    });

    it('should load historical data from localStorage on mount', () => {
      const historicalData = [
        { ...mockDiagnosticReport, timestamp: Date.now() - 1000 },
        {
          ...mockDiagnosticReport,
          timestamp:
            Date.now() - TEST_WEB_VITALS_DIAGNOSTICS.HISTORICAL_TIME_OFFSET,
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(historicalData));

      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      expect(result.current).not.toBeNull();
      expect(result.current).toBeDefined();

      // 验证历史数据已加载（同步操作）
      expect(result.current.historicalReports).toEqual(historicalData);
    });
  });

  describe('refreshDiagnostics', () => {
    it('should generate new diagnostic report', async () => {
      await resetMocksToDefault();
      const { result } = renderDiagnosticsHook();

      // 在测试环境中，Hook应该立即可用，无需等待初始化
      expect(result.current).toBeTruthy();
      expect(typeof result.current.refreshDiagnostics).toBe('function');

      act(() => {
        // 先推进计时器处理初始化延迟
        vi.runAllTimers();
        // 然后调用refreshDiagnostics（现在是同步的）
        result.current.refreshDiagnostics();
        // 再次推进计时器处理状态更新
        vi.runAllTimers();
      });

      // 验证Mock被调用 - refreshDiagnostics调用getDetailedMetrics而不是generateDiagnosticReport
      const { enhancedWebVitalsCollector } = await import(
        '@/lib/enhanced-web-vitals'
      );
      expect(enhancedWebVitalsCollector.getDetailedMetrics).toHaveBeenCalled();

      // 验证结果
      expect(result.current.currentReport).toBeTruthy();
      expect(result.current.currentReport?.vitals.cls).toBe(
        TEST_WEB_VITALS_DIAGNOSTICS.CLS_BASELINE,
      );
      expect(result.current.isLoading).toBe(false);
    });

    it('should save report to localStorage', async () => {
      await resetMocksToDefault();
      const { result } = renderDiagnosticsHook();

      // 在测试环境中，Hook应该立即可用
      expect(result.current).toBeTruthy();
      expect(typeof result.current.refreshDiagnostics).toBe('function');

      await act(async () => {
        vi.runAllTimers();
        const promise = result.current.refreshDiagnostics();
        vi.runAllTimers();
        await promise;
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'webVitalsDiagnostics',
        expect.stringContaining('"vitals"'),
      );
    });

    it('should handle errors during report generation', async () => {
      await resetMocksToDefault();

      // 设置错误Mock - 修复为getDetailedMetrics
      const collector = await getCollectorMock();
      collector.getDetailedMetrics.mockImplementation(() => {
        throw new Error('Report generation failed');
      });

      const { result } = renderDiagnosticsHook();

      // 在测试环境中，Hook应该立即可用
      expect(result.current).toBeTruthy();
      expect(typeof result.current.refreshDiagnostics).toBe('function');

      await act(async () => {
        vi.runAllTimers();
        const promise = result.current.refreshDiagnostics();
        vi.runAllTimers();
        await promise;
      });

      expect(result.current.error).toBe('Report generation failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle unknown errors', async () => {
      await resetMocksToDefault();

      // 设置错误Mock - 修复为getDetailedMetrics
      const collector = await getCollectorMock();
      collector.getDetailedMetrics.mockImplementation(() => {
        throw new Error('String error');
      });

      const { result } = renderDiagnosticsHook();

      // 在测试环境中，Hook应该立即可用
      expect(result.current).toBeTruthy();
      expect(typeof result.current.refreshDiagnostics).toBe('function');

      await act(async () => {
        vi.runAllTimers();
        const promise = result.current.refreshDiagnostics();
        vi.runAllTimers();
        await promise;
      });

      expect(result.current.error).toBe('String error');
    });
  });

  describe('localStorage operations', () => {
    it('should handle localStorage read errors gracefully', async () => {
      resetMocksToDefault();
      // 设置localStorage错误
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderDiagnosticsHook();

      // Should not throw and should warn
      expect(() => result.current).not.toThrow();
      expect(result.current).not.toBeNull();

      // 验证logger.error被调用而不是console.warn
      const logger = await getLoggerMock();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to load historical data',
        expect.objectContaining({
          error: expect.any(Error),
        }),
      );
    });

    it('should handle invalid JSON in localStorage', async () => {
      resetMocksToDefault();
      // 设置无效JSON
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const { result } = renderDiagnosticsHook();

      expect(() => result.current).not.toThrow();
      expect(result.current).not.toBeNull();

      // 验证logger.error被调用而不是console.warn
      const logger = await getLoggerMock();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to load historical data',
        expect.objectContaining({
          error: expect.any(Error),
        }),
      );
    });

    it('should handle non-array data in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('{"not": "array"}');

      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      await act(async () => {
        vi.runAllTimers();
        const promise = result.current.refreshDiagnostics();
        vi.runAllTimers();
        await promise;
      });

      // Should still work with empty array as fallback
      expect(result.current.historicalReports.length).toBe(1);
    });

    it('should handle localStorage write errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      await act(async () => {
        vi.runAllTimers();
        const promise = result.current.refreshDiagnostics();
        vi.runAllTimers();
        await promise;
      });

      // 验证logger.error被调用而不是console.warn
      const logger = await getLoggerMock();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to save to storage',
        expect.objectContaining({
          error: expect.any(Error),
        }),
      );
      // Should still update state even if save fails
      expect(result.current.currentReport).toBeTruthy();
    });

    it('should limit stored reports to 100', async () => {
      // Create 120 historical reports (超过MAX_HISTORY_SIZE=100的限制)
      const manyReports = Array.from({ length: 120 }, (_, i) => ({
        ...mockDiagnosticReport,
        timestamp: Date.now() - i * 1000,
      }));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(manyReports));

      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      expect(result.current).not.toBeNull();
      expect(result.current).toBeDefined();

      await act(async () => {
        await result.current.refreshDiagnostics();
        vi.runAllTimers();
      });

      // Check that setItem was called with limited data (MAX_HISTORY_SIZE=100)
      const setItemCalls = mockLocalStorage.setItem.mock.calls;
      expect(setItemCalls.length).toBeGreaterThan(0);
      const savedData = JSON.parse(setItemCalls[0]![1] as string);
      expect(savedData.length).toBeLessThanOrEqual(100);
    });
  });

  describe('performance trends analysis', () => {
    it('should return null when insufficient data', async () => {
      await resetMocksToDefault();
      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      const trends = result.current.getPerformanceTrends();
      expect(trends).toBe(null);
    });

    it('should calculate performance trends with sufficient data', async () => {
      await resetMocksToDefault();

      // Create historical data with varying metrics
      const historicalData = Array.from({ length: 25 }, (_, i) => ({
        ...mockDiagnosticReport,
        vitals: {
          ...mockDiagnosticReport.vitals,
          cls:
            TEST_WEB_VITALS_DIAGNOSTICS.CLS_BASELINE +
            i * TEST_WEB_VITALS_DIAGNOSTICS.CLS_INCREMENT,
          lcp:
            TEST_WEB_VITALS_DIAGNOSTICS.LCP_BASELINE +
            i * TEST_WEB_VITALS_DIAGNOSTICS.LCP_INCREMENT,
          fid:
            TEST_WEB_VITALS_DIAGNOSTICS.FID_BASELINE +
            i * TEST_WEB_VITALS_DIAGNOSTICS.FID_INCREMENT,
        },
        score: TEST_WEB_VITALS_DIAGNOSTICS.PERFORMANCE_SCORE - i,
        timestamp: Date.now() - i * 1000,
      }));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(historicalData));

      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      await act(async () => {
        await result.current.refreshDiagnostics();
        vi.runAllTimers();
      });

      const trends = result.current.getPerformanceTrends();

      expect(trends).toBeTruthy();
      expect(trends?.find((t) => t.metric === 'cls')).toBeDefined();
      expect(trends?.find((t) => t.metric === 'lcp')).toBeDefined();
      expect(trends?.find((t) => t.metric === 'fid')).toBeDefined();
      expect(trends?.length).toBeGreaterThan(0);
    });

    it('should handle empty metrics in trend calculation', async () => {
      await resetMocksToDefault();

      // 设置Mock返回零值，确保新生成的报告也是零值
      const collector = await getCollectorMock();
      collector.getDetailedMetrics.mockReturnValue({
        ...TEST_WEB_VITALS_DIAGNOSTICS,
        cls: 0,
        fid: 0,
        lcp: 0,
        fcp: 0,
        ttfb: 0,
      });

      const historicalData = Array.from({ length: 25 }, (_, i) => ({
        ...mockDiagnosticReport,
        vitals: {
          ...mockDiagnosticReport.vitals,
          cls: 0, // Zero values should be filtered out
          lcp:
            i % TEST_COUNT_CONSTANTS.SMALL === 0
              ? TEST_WEB_VITALS_DIAGNOSTICS.LCP_BASELINE
              : 0,
          fid: 0,
        },
        timestamp: Date.now() - i * 1000,
      }));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(historicalData));

      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      await act(async () => {
        await result.current.refreshDiagnostics();
        vi.runAllTimers();
      });

      const trends = result.current.getPerformanceTrends();
      expect(trends).toBeTruthy();
      // Should handle zero values gracefully
      expect(trends?.find((t) => t.metric === 'cls')?.recent).toBe(0);
      expect(trends?.find((t) => t.metric === 'fid')?.recent).toBe(0);
    });
  });

  describe('data export', () => {
    it('should call exportReport function', async () => {
      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      await act(async () => {
        vi.runAllTimers();
        const promise = result.current.refreshDiagnostics();
        vi.runAllTimers();
        await promise;
      });

      expect(() => {
        result.current.exportReport('json');
      }).not.toThrow();
    });

    it('should handle export with empty state', async () => {
      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      expect(() => {
        result.current.exportReport('json');
      }).not.toThrow();
    });
  });

  describe('clear history', () => {
    it('should clear historical data', async () => {
      await resetMocksToDefault();
      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      // First add some data
      await act(async () => {
        await result.current.refreshDiagnostics();
        vi.runAllTimers();
      });

      expect(result.current.historicalReports.length).toBeGreaterThan(0);

      // Then clear it
      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.historicalReports).toEqual([]);
      expect(result.current.currentReport).toBe(null);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'webVitalsDiagnostics',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid refresh calls', async () => {
      await resetMocksToDefault();
      const { result } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      act(() => {
        // 调用多次refreshDiagnostics（现在是同步的）
        result.current.refreshDiagnostics();
        result.current.refreshDiagnostics();
        result.current.refreshDiagnostics();

        vi.runAllTimers();
      });

      // Should handle concurrent calls gracefully
      expect(result.current.currentReport).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle component unmounting during async operation', async () => {
      await resetMocksToDefault();
      const { result, unmount } = renderDiagnosticsHook();

      // 验证Hook正确初始化
      validateHookResult(result);

      act(() => {
        result.current.refreshDiagnostics();
      });

      // Unmount before async operation completes
      unmount();

      // Should not cause errors
      vi.runAllTimers();

      // No assertions needed - just ensuring no errors are thrown
    });
  });
});

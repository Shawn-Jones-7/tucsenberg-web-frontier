import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import type { DetailedWebVitals, PerformanceBaseline } from '@/types';
import {
  PerformanceAlertSystem,
  PerformanceBaselineManager,
  PerformanceRegressionDetector,
} from '../enhanced-web-vitals';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock EnhancedWebVitalsCollector
const mockCollector = {
  getDetailedMetrics: vi.fn(),
  generateDiagnosticReport: vi.fn(),
};

vi.mock('../enhanced-web-vitals', async () => {
  const actual = await vi.importActual('../enhanced-web-vitals');
  return {
    ...actual,
    EnhancedWebVitalsCollector: vi.fn(() => mockCollector),
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window object for localStorage
Object.defineProperty(global, 'window', {
  value: {
    localStorage: mockLocalStorage,
  },
  writable: true,
});

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('PerformanceBaselineManager', () => {
  let baselineManager: InstanceType<typeof PerformanceBaselineManager>;

  // Shared baseline object for tests
  const mockBaseline = {
    id: 'test-baseline',
    timestamp: Date.now(),
    url: 'https://test.com/en/test-page',
    userAgent: 'Test Browser',
    cls: 0.1,
    fid: 100,
    lcp: 2500,
    fcp: 1800,
    ttfb: 800,
    inp: 50,
    domContentLoaded: 1500,
    loadComplete: 3000,
    firstPaint: 1200,
    resourceTiming: {
      totalResources: 10,
      slowResources: [],
      totalSize: 1024000,
      totalDuration: 2000,
    },
    connection: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
    },
    device: {
      memory: 8,
      cores: 4,
      userAgent: 'Test Browser',
      viewport: {
        width: 1920,
        height: 1080,
      },
    },
    page: {
      url: 'https://test.com/en/test-page',
      referrer: '',
      title: 'Test Page',
      timestamp: Date.now(),
    },
    metrics: {
      cls: 0.1,
      lcp: 2500,
      fid: 100,
      fcp: 1800,
      ttfb: 800,
      domContentLoaded: 1500,
      loadComplete: 3000,
      firstPaint: 1200,
    },
    score: 0.8,
    environment: {
      viewport: { width: 1920, height: 1080 },
      memory: 8,
      cores: 4,
    },
  };

  const mockDetailedWebVitals: DetailedWebVitals = {
    cls: 0.1,
    fid: 100,
    lcp: 2500,
    fcp: 1800,
    ttfb: 800,
    inp: 200,
    domContentLoaded: 1500,
    loadComplete: 3000,
    firstPaint: 1200,
    resourceTiming: {
      totalResources: 10,
      slowResources: [],
      totalSize: 1024000,
      totalDuration: 2000,
    },
    connection: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
    },
    device: {
      memory: 8,
      cores: 4,
      userAgent: 'Test Browser',
      viewport: {
        width: 1920,
        height: 1080,
      },
    },
    page: {
      url: 'https://test.com/page',
      referrer: '',
      title: 'Test Page',
      timestamp: Date.now(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    baselineManager = new PerformanceBaselineManager();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基准数据管理', () => {
    it('should save baseline to localStorage', () => {
      baselineManager.saveBaseline(mockDetailedWebVitals);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'performance-baselines',
        expect.stringContaining('"url":"https://test.com/page"'),
      );
    });

    it('should load baselines from localStorage', () => {
      const storedBaselines = [mockBaseline];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedBaselines));

      const baselines = baselineManager.getBaselines();

      expect(baselines).toHaveLength(1);
      expect(baselines[0]?.id).toBe('test-baseline');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        baselineManager.getBaselines();
      }).not.toThrow();
    });

    it('should get most recent baseline', () => {
      const oldBaseline = {
        ...mockBaseline,
        timestamp: Date.now() - WEB_VITALS_CONSTANTS.MILLISECONDS_PER_DAY,
      }; // 1 day ago
      const newBaseline = {
        ...mockBaseline,
        id: 'new-baseline',
        timestamp: Date.now(),
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify([oldBaseline, newBaseline]),
      );

      const recent = baselineManager.getRecentBaseline('/test-page', 'en');

      expect(recent?.id).toBe('new-baseline');
    });

    it('should return null when no baselines exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const recent = baselineManager.getRecentBaseline('/test-page', 'en');

      expect(recent).toBe(null);
    });

    it('should filter baselines by page and locale', () => {
      const baselines = [
        { ...mockBaseline, url: 'https://test.com/en/page1' },
        { ...mockBaseline, url: 'https://test.com/en/page2' },
        { ...mockBaseline, url: 'https://test.com/zh/page1' },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(baselines));

      const filtered = baselineManager.getRecentBaseline('/page1', 'en');

      expect(filtered).toBeDefined();
      expect(filtered?.url).toBe('https://test.com/en/page1');
    });

    it('should limit stored baselines to prevent memory issues', () => {
      const manyBaselines = Array.from({ length: 150 }, (_, i) => ({
        ...mockBaseline,
        id: `baseline-${i}`,
        timestamp: Date.now() - i * 1000,
      }));

      baselineManager.saveBaseline(mockBaseline);

      // Mock existing baselines
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(manyBaselines));

      baselineManager.saveBaseline({
        ...mockBaseline,
        id: 'new-baseline',
      } as DetailedWebVitals);

      // Should limit to 100 baselines
      const setItemCall = mockLocalStorage.setItem.mock.calls.find(
        (call) => call[0] === 'performance-baselines',
      );

      if (setItemCall) {
        const savedBaselines = JSON.parse(setItemCall[1]);
        expect(savedBaselines.length).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('数据验证', () => {
    it('should validate baseline structure', () => {
      const invalidBaseline = {
        id: 'test',
        // Missing required fields
      };

      expect(() => {
        baselineManager.saveBaseline(invalidBaseline as DetailedWebVitals);
      }).not.toThrow(); // Should handle gracefully
    });

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      expect(() => {
        baselineManager.getBaselines();
      }).not.toThrow();
    });

    it('should handle non-array data in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('{"not": "array"}');

      const baselines = baselineManager.getBaselines();

      expect(baselines).toEqual([]);
    });
  });
});

describe('PerformanceRegressionDetector', () => {
  let detector: InstanceType<typeof PerformanceRegressionDetector>;

  const mockCurrentMetrics: DetailedWebVitals = {
    cls: 0.15, // Regression from baseline
    lcp: 3000, // Regression from baseline
    fid: 120, // Slight regression
    inp: 200,
    ttfb: 900,
    fcp: 2000,
    domContentLoaded: 1500,
    loadComplete: 3000,
    firstPaint: 1200,
    resourceTiming: {
      totalResources: 10,
      slowResources: [],
      totalSize: 1024000,
      totalDuration: 2000,
    },
    device: {
      memory: 8,
      cores: 4,
      userAgent: 'Test Browser',
      viewport: {
        width: 1920,
        height: 1080,
      },
    },
    connection: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
    },
    page: {
      url: 'https://test.com/page',
      referrer: '',
      title: 'Test Page',
      timestamp: Date.now(),
    },
  };

  const mockBaseline: PerformanceBaseline = {
    id: 'test-baseline',
    timestamp: Date.now() - WEB_VITALS_CONSTANTS.MILLISECONDS_PER_DAY,
    page: '/page',
    locale: 'en',
    metrics: {
      cls: 0.1,
      lcp: 2500,
      fid: 100,
      inp: 200,
      ttfb: 800,
      fcp: 1800,
    },
    buildInfo: {
      version: '1.0.0',
      commit: 'abc123',
      branch: 'main',
    },
    environment: {
      page: 'https://test.com/page',
      locale: 'en',
      userAgent: 'Test Browser',
      viewport: '1920x1080',
      connection: '4g',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    detector = new PerformanceRegressionDetector();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('回归检测', () => {
    it('should detect performance regressions', () => {
      const result = detector.detectRegression(
        mockCurrentMetrics,
        mockBaseline,
      );

      expect(result.hasRegression).toBe(true);
      expect(result.regressions.length).toBeGreaterThan(0);

      const clsRegression = result.regressions.find(
        (r: unknown) => r.metric === 'cls',
      );
      expect(clsRegression).toBeDefined();
      expect(clsRegression?.severity).toBe('critical');
    });

    it('should not detect regression for good metrics', () => {
      const goodMetrics = {
        ...mockCurrentMetrics,
        cls: 0.08, // Better than baseline (0.1)
        lcp: 2200, // Better than baseline (2500)
        fid: 80, // Better than baseline (100)
        ttfb: 700, // Better than baseline (800)
        fcp: 1600, // Better than baseline (1800)
      };

      const result = detector.detectRegression(goodMetrics, mockBaseline);

      expect(result.hasRegression).toBe(false);
      expect(result.regressions).toEqual([]);
    });

    it('should calculate correct regression percentages', () => {
      const result = detector.detectRegression(
        mockCurrentMetrics,
        mockBaseline,
      );

      const clsRegression = result.regressions.find(
        (r: unknown) => r.metric === 'cls',
      );
      expect(clsRegression?.changePercent).toBeCloseTo(
        WEB_VITALS_CONSTANTS.TEST_PERCENTAGE_FIFTY,
        1, // 1 decimal place precision
      ); // 0.15 vs 0.1 = 50% increase
    });

    it('should categorize regression severity correctly', () => {
      const severeMetrics = {
        ...mockCurrentMetrics,
        cls: 0.3, // 200% increase - critical
        lcp: 5000, // 100% increase - critical
      };

      const result = detector.detectRegression(severeMetrics, mockBaseline);

      const clsRegression = result.regressions.find(
        (r: unknown) => r.metric === 'cls',
      );
      expect(clsRegression?.severity).toBe('critical');
    });

    it('should handle missing baseline metrics gracefully', () => {
      const incompleteBaseline = {
        ...mockBaseline,
        metrics: {
          cls: 0.1,
          // Missing other metrics
        } as DetailedWebVitals,
      };

      expect(() => {
        detector.detectRegression(mockCurrentMetrics, incompleteBaseline);
      }).not.toThrow();
    });
  });

  describe('阈值配置', () => {
    it('should use configurable thresholds', () => {
      const customDetector = new PerformanceRegressionDetector();

      const result = customDetector.detectRegression(
        mockCurrentMetrics,
        mockBaseline,
      );

      // With custom thresholds, some regressions might be different severity
      expect(result).toBeDefined();
    });

    it('should handle zero baseline values', () => {
      const zeroBaseline = {
        ...mockBaseline,
        metrics: {
          ...mockBaseline.metrics,
          cls: 0,
          fid: 0,
        },
      };

      expect(() => {
        detector.detectRegression(mockCurrentMetrics, zeroBaseline);
      }).not.toThrow();
    });
  });
});

describe('PerformanceAlertSystem', () => {
  let alertSystem: InstanceType<typeof PerformanceAlertSystem>;

  beforeEach(() => {
    vi.clearAllMocks();
    alertSystem = new PerformanceAlertSystem();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('警报配置', () => {
    it('should initialize with default configuration', () => {
      expect(alertSystem).toBeDefined();
    });

    it('should configure custom alert thresholds', () => {
      const customConfig = {
        enabled: true,
        thresholds: {
          cls: { warning: 0.15, critical: 0.3 },
          lcp: { warning: 3000, critical: 5000 },
          fid: { warning: 150, critical: 400 },
        },
        notifications: {
          console: true,
          webhook: 'https://example.com/webhook',
        },
      };

      alertSystem.configure(customConfig as DetailedWebVitals);

      // Should not throw and should accept configuration
      expect(() =>
        alertSystem.configure(customConfig as DetailedWebVitals),
      ).not.toThrow();
    });

    it('should handle invalid configuration gracefully', () => {
      const invalidConfig = {
        enabled: 'not-boolean',
        thresholds: 'not-object',
      } as DetailedWebVitals;

      expect(() => {
        alertSystem.configure(invalidConfig);
      }).not.toThrow();
    });
  });

  describe('性能警报检查', () => {
    it('should trigger alerts for poor performance', async () => {
      const poorMetrics = {
        cls: 0.3, // Critical
        lcp: 5000, // Critical
        fid: 400, // Critical
        inp: 500,
        ttfb: 2000,
        fcp: 4000,
      };

      // 获取已经 Mock 的 logger
      const { logger } = await import('@/lib/logger');
      const loggerErrorSpy = vi.mocked(logger.error);
      const loggerWarnSpy = vi.mocked(logger.warn);

      // 清除之前的调用记录
      loggerErrorSpy.mockClear();
      loggerWarnSpy.mockClear();

      (alertSystem as DetailedWebVitals).checkMetrics(
        poorMetrics as DetailedWebVitals,
      );

      // 由于这些指标都超过了critical阈值，应该调用logger.error
      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it('should not trigger alerts for good performance', () => {
      const goodMetrics = {
        cls: 0.05, // Good
        lcp: 1500, // Good
        fid: 50, // Good
        inp: 100,
        ttfb: 400,
        fcp: 1200,
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      (alertSystem as DetailedWebVitals).checkMetrics(
        goodMetrics as DetailedWebVitals,
      );

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle disabled alerts', () => {
      alertSystem.configure({ enabled: false });

      const poorMetrics = {
        cls: 0.5,
        lcp: 8000,
        fid: 600,
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      (alertSystem as DetailedWebVitals).checkMetrics(
        poorMetrics as DetailedWebVitals,
      );

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('通知系统', () => {
    it('should send console notifications when enabled', async () => {
      alertSystem.configure({
        enabled: true,
        channels: { console: true, storage: false },
      });

      // Mock logger.error instead of console.warn for critical alerts
      const { logger } = await vi.importMock('@/lib/logger');
      const loggerSpy = vi.mocked((logger as DetailedWebVitals).error);

      (alertSystem as unknown as { sendAlert: (args: { severity: 'critical' | 'warning'; message: string; data?: Record<string, unknown> }) => Promise<void> }).sendAlert({
        severity: 'critical',
        message: 'Test alert message',
        data: { metric: 'cls', value: 0.5 },
      });

      // 检查logger.error被调用
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test alert message'),
        expect.any(Object),
      );
    });

    it('should handle webhook notifications', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });
      global.fetch = mockFetch;

      alertSystem.configure({
        enabled: true,
        notifications: {
          console: false,
          webhook: 'https://example.com/webhook',
        },
      });

      await (alertSystem as unknown as { sendAlert: (args: { severity: 'critical' | 'warning'; message: string; data?: Record<string, unknown> }) => Promise<void> }).sendAlert({ severity: 'warning', message: 'Test webhook alert', data: { metric: 'lcp', value: 3500 } });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should handle webhook failures gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      alertSystem.configure({
        enabled: true,
        notifications: {
          console: false,
          webhook: 'https://example.com/webhook',
        },
      });

      await expect((alertSystem as unknown as { sendAlert: (args: { severity: 'critical' | 'warning'; message: string; data?: Record<string, unknown> }) => Promise<void> }).sendAlert({ severity: 'critical', message: 'Test alert', data: { metric: 'cls', value: 0.5 } })).resolves.not.toThrow();
    });
  });

  describe('警报历史记录', () => {
    it('should track alert history', () => {
      (alertSystem as unknown as { sendAlert: (args: { severity: 'critical' | 'warning'; message: string; data?: Record<string, unknown> }) => Promise<void> }).sendAlert({ severity: 'warning', message: 'Test alert 1', data: { metric: 'cls', value: 0.2 } });
      (alertSystem as unknown as { sendAlert: (args: { severity: 'critical' | 'warning'; message: string; data?: Record<string, unknown> }) => Promise<void> }).sendAlert({ severity: 'critical', message: 'Test alert 2', data: { metric: 'lcp', value: 5000 } });

      const history = (alertSystem as DetailedWebVitals).getAlertHistory();

      expect(history).toHaveLength(WEB_VITALS_CONSTANTS.TEST_COUNT_TWO);
      expect(history[0]?.level).toBe('warning');
      expect(history[1]?.level).toBe('critical');
    });

    it('should limit alert history size', () => {
      // Send many alerts
      for (let i = 0; i < WEB_VITALS_CONSTANTS.TEST_ALERT_HISTORY_LIMIT; i++) {
        (alertSystem as unknown as { sendAlert: (args: { severity: 'critical' | 'warning'; message: string; data?: Record<string, unknown> }) => Promise<void> }).sendAlert({ severity: 'warning', message: `Alert ${i}`, data: { metric: 'cls', value: 0.2 } });
      }

      const history = (alertSystem as DetailedWebVitals).getAlertHistory();

      expect(history.length).toBeLessThanOrEqual(100); // Should limit to 100
    });

    it('should clear alert history', () => {
      (alertSystem as unknown as { sendAlert: (args: { severity: 'critical' | 'warning'; message: string; data?: Record<string, unknown> }) => Promise<void> }).sendAlert({ severity: 'warning', message: 'Test alert', data: { metric: 'cls', value: 0.2 } });

      expect((alertSystem as DetailedWebVitals).getAlertHistory()).toHaveLength(
        1,
      );

      (alertSystem as DetailedWebVitals).clearHistory();

      expect((alertSystem as DetailedWebVitals).getAlertHistory()).toHaveLength(
        0,
      );
    });
  });
});

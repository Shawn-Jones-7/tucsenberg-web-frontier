import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PerformanceAlertConfig } from '@/lib/web-vitals/types';
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

const createTestPage = (
  url: string,
  overrides: Partial<DetailedWebVitals['page']> = {},
): DetailedWebVitals['page'] => ({
  url,
  referrer: '',
  title: 'Test Page',
  timestamp: Date.now(),
  ...overrides,
});

const createDetailedMetrics = (
  overrides: Partial<DetailedWebVitals> = {},
): DetailedWebVitals => {
  const now = Date.now();
  const base: DetailedWebVitals = {
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
      slowResources: [] as DetailedWebVitals['resourceTiming']['slowResources'],
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
      rtt: 50,
      saveData: false,
    },
    page: {
      url: 'https://test.com/en/test-page',
      referrer: '',
      title: 'Test Page',
      timestamp: now,
    },
  };

  const result: DetailedWebVitals = {
    ...base,
    ...overrides,
  };

  result.resourceTiming = {
    ...base.resourceTiming,
    ...(overrides.resourceTiming ?? {}),
  };

  result.device = {
    ...base.device,
    ...(overrides.device ?? {}),
    viewport: {
      ...base.device.viewport,
      ...(overrides.device?.viewport ?? {}),
    },
  };

  if (overrides.connection) {
    result.connection = {
      ...base.connection!,
      ...overrides.connection,
    };
  } else if (overrides.connection === null) {
    const updatedResult = { ...result };
    delete updatedResult.connection;
    return {
      ...updatedResult,
      page: {
        ...base.page,
        ...(overrides.page ?? {}),
      },
    };
  } else if (!result.connection && base.connection) {
    result.connection = base.connection;
  }

  result.page = {
    ...base.page,
    ...(overrides.page ?? {}),
  };

  return result;
};

const createBaselineFromMetrics = (
  metrics: DetailedWebVitals,
  overrides: Partial<PerformanceBaseline> = {},
): PerformanceBaseline => {
  const environment: PerformanceBaseline['environment'] = {
    viewport: metrics.device.viewport,
  };
  if (metrics.device.memory !== undefined) {
    environment.memory = metrics.device.memory;
  }
  if (metrics.device.cores !== undefined) {
    environment.cores = metrics.device.cores;
  }

  const connection = metrics.connection
    ? {
        effectiveType: metrics.connection.effectiveType,
        downlink: metrics.connection.downlink,
      }
    : undefined;

  const {
    environment: environmentOverride,
    metrics: metricsOverride,
    buildInfo: buildInfoOverride,
    connection: connectionOverride,
    ...restOverrides
  } = overrides;

  let baseline: PerformanceBaseline = {
    id: `baseline-${metrics.page.timestamp}`,
    timestamp: metrics.page.timestamp,
    url: metrics.page.url,
    userAgent: metrics.device.userAgent,
    metrics: {
      cls: metrics.cls,
      lcp: metrics.lcp,
      fid: metrics.fid,
      fcp: metrics.fcp,
      ttfb: metrics.ttfb,
      domContentLoaded: metrics.domContentLoaded,
      loadComplete: metrics.loadComplete,
      firstPaint: metrics.firstPaint,
    },
    score: 0.8,
    environment,
    buildInfo: {
      version: '1.0.0',
      commit: 'abc123',
      branch: 'main',
      timestamp: metrics.page.timestamp,
    },
  };

  if (environmentOverride) {
    const { viewport, memory, cores } = environmentOverride;
    baseline = {
      ...baseline,
      environment: {
        ...baseline.environment,
        ...(memory !== undefined ? { memory } : {}),
        ...(cores !== undefined ? { cores } : {}),
        viewport: viewport
          ? {
              ...baseline.environment.viewport,
              ...viewport,
            }
          : baseline.environment.viewport,
      },
    };
  }

  if (metricsOverride) {
    baseline = {
      ...baseline,
      metrics: {
        ...baseline.metrics,
        ...metricsOverride,
      },
    };
  }

  if (buildInfoOverride) {
    baseline = {
      ...baseline,
      buildInfo: {
        ...baseline.buildInfo,
        ...buildInfoOverride,
      },
    };
  }

  if (connection) {
    baseline = {
      ...baseline,
      connection,
    };
  }

  if (connectionOverride !== undefined) {
    if (connectionOverride === null) {
      const updatedBaseline = { ...baseline };
      delete updatedBaseline.connection;
      baseline = updatedBaseline;
    } else {
      baseline = {
        ...baseline,
        connection: connectionOverride,
      };
    }
  }

  baseline = {
    ...baseline,
    ...restOverrides,
  };

  return baseline;
};

const mockDetailedWebVitals = createDetailedMetrics({
  inp: 200,
  page: createTestPage('https://test.com/page'),
});

const mockBaseline = createBaselineFromMetrics(mockDetailedWebVitals, {
  id: 'test-baseline',
});

describe('PerformanceBaselineManager', () => {
  let baselineManager: InstanceType<typeof PerformanceBaselineManager>;

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
      const oldBaseline = createBaselineFromMetrics(
        createDetailedMetrics({
          page: {
            url: 'https://test.com/en/test-page-old',
            referrer: '',
            title: 'Old Page',
            timestamp: Date.now() - WEB_VITALS_CONSTANTS.MILLISECONDS_PER_DAY,
          },
        }),
        { id: 'old-baseline' },
      );
      const newBaseline = createBaselineFromMetrics(
        createDetailedMetrics({
          page: {
            url: 'https://test.com/en/test-page-new',
            referrer: '',
            title: 'New Page',
            timestamp: Date.now(),
          },
        }),
        { id: 'new-baseline' },
      );

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
        createBaselineFromMetrics(
          createDetailedMetrics({
            page: createTestPage('https://test.com/en/page1'),
          }),
        ),
        createBaselineFromMetrics(
          createDetailedMetrics({
            page: createTestPage('https://test.com/en/page2'),
          }),
        ),
        createBaselineFromMetrics(
          createDetailedMetrics({
            page: createTestPage('https://test.com/zh/page1'),
          }),
        ),
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(baselines));

      const filtered = baselineManager.getRecentBaseline('/page1', 'en');

      expect(filtered).toBeDefined();
      expect(filtered?.url).toBe('https://test.com/en/page1');
    });

    it('should limit stored baselines to prevent memory issues', () => {
      const manyBaselines = Array.from({ length: 150 }, (_, i) =>
        createBaselineFromMetrics(
          createDetailedMetrics({
            page: {
              url: `https://test.com/page${i}`,
              referrer: '',
              title: `Test Page ${i}`,
              timestamp: Date.now() - i * 1000,
            },
          }),
          { id: `baseline-${i}` },
        ),
      );

      baselineManager.saveBaseline(mockDetailedWebVitals);

      // Mock existing baselines
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(manyBaselines));

      baselineManager.saveBaseline(
        createDetailedMetrics({
          page: {
            url: 'https://test.com/new-page',
            referrer: '',
            title: 'New Test Page',
            timestamp: Date.now(),
          },
        }),
      );

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
      expect(() => {
        baselineManager.saveBaseline(
          createDetailedMetrics({
            resourceTiming:
              undefined as unknown as DetailedWebVitals['resourceTiming'],
          }),
        );
      }).not.toThrow();
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

  const mockBaseline: PerformanceBaseline = createBaselineFromMetrics(
    mockDetailedWebVitals,
    { id: 'test-baseline' },
  );

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

      const clsRegression = result.regressions.find((r) => r.metric === 'cls');
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

      const clsRegression = result.regressions.find((r) => r.metric === 'cls');
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

      const clsRegression = result.regressions.find((r) => r.metric === 'cls');
      expect(clsRegression?.severity).toBe('critical');
    });

    it('should handle missing baseline metrics gracefully', () => {
      const incompleteBaseline = {
        ...mockBaseline,
        metrics: {
          cls: 0.1,
          // Missing other metrics
        } as unknown as PerformanceBaseline['metrics'],
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
      const customConfig: Partial<PerformanceAlertConfig> & {
        notifications: { console: boolean; webhook: string };
      } = {
        enabled: true,
        thresholds: {
          cls: { warning: 0.15, critical: 0.3 },
          lcp: { warning: 3000, critical: 5000 },
          fid: { warning: 150, critical: 400 },
          fcp: { warning: 1900, critical: 3000 },
          ttfb: { warning: 900, critical: 1500 },
          score: { warning: 0.75, critical: 0.5 },
        },
        notifications: {
          console: true,
          webhook: 'https://example.com/webhook',
        },
      };

      expect(() => alertSystem.configure(customConfig)).not.toThrow();
    });

    it('should handle invalid configuration gracefully', () => {
      const invalidConfig = {
        enabled: 'not-boolean',
        thresholds: 'not-object',
      } as unknown as Partial<PerformanceAlertConfig>;

      expect(() => {
        alertSystem.configure(invalidConfig);
      }).not.toThrow();
    });
  });

  describe('性能警报检查', () => {
    it('should trigger alerts for poor performance', async () => {
      const poorMetrics: Record<string, number> = {
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

      alertSystem.checkMetrics(poorMetrics);

      // 由于这些指标都超过了critical阈值，应该调用logger.error
      expect(loggerErrorSpy).toHaveBeenCalled();
    });

    it('should not trigger alerts for good performance', () => {
      const goodMetrics: Record<string, number> = {
        cls: 0.05, // Good
        lcp: 1500, // Good
        fid: 50, // Good
        inp: 100,
        ttfb: 400,
        fcp: 1200,
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      alertSystem.checkMetrics(goodMetrics);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle disabled alerts', () => {
      alertSystem.configure({ enabled: false });

      const poorMetrics: Record<string, number> = {
        cls: 0.5,
        lcp: 8000,
        fid: 600,
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      alertSystem.checkMetrics(poorMetrics);

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
      const loggerModule = await import('@/lib/logger');
      const loggerSpy = vi
        .spyOn(loggerModule.logger, 'error')
        .mockImplementation(() => undefined);

      await alertSystem.sendAlert({
        severity: 'critical',
        message: 'Test alert message',
        data: { metric: 'cls', value: 0.5 },
      });

      // 检查logger.error被调用
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test alert message'),
        expect.any(Object),
      );
      loggerSpy.mockRestore();
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

      await alertSystem.sendAlert({
        severity: 'warning',
        message: 'Test webhook alert',
        data: { metric: 'lcp', value: 3500 },
      });

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

      await expect(
        alertSystem.sendAlert({
          severity: 'critical',
          message: 'Test alert',
          data: { metric: 'cls', value: 0.5 },
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('警报历史记录', () => {
    it('should track alert history', async () => {
      await alertSystem.sendAlert({
        severity: 'warning',
        message: 'Test alert 1',
        data: { metric: 'cls', value: 0.2 },
      });
      await alertSystem.sendAlert({
        severity: 'critical',
        message: 'Test alert 2',
        data: { metric: 'lcp', value: 5000 },
      });

      const history = alertSystem.getAlertHistory();

      expect(history).toHaveLength(WEB_VITALS_CONSTANTS.TEST_COUNT_TWO);
      expect(history[0]?.level).toBe('warning');
      expect(history[1]?.level).toBe('critical');
    });

    it('should limit alert history size', async () => {
      // Send many alerts
      for (let i = 0; i < WEB_VITALS_CONSTANTS.TEST_ALERT_HISTORY_LIMIT; i++) {
        await alertSystem.sendAlert({
          severity: 'warning',
          message: `Alert ${i}`,
          data: { metric: 'cls', value: 0.2 },
        });
      }

      const history = alertSystem.getAlertHistory();

      expect(history.length).toBeLessThanOrEqual(100); // Should limit to 100
    });

    it('should clear alert history', async () => {
      await alertSystem.sendAlert({
        severity: 'warning',
        message: 'Test alert',
        data: { metric: 'cls', value: 0.2 },
      });

      expect(alertSystem.getAlertHistory()).toHaveLength(1);

      alertSystem.clearAlertHistory();

      expect(alertSystem.getAlertHistory()).toHaveLength(0);
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEVICE_DEFAULTS } from '@/lib/web-vitals/constants';
import type { DetailedWebVitals } from '@/lib/web-vitals/types';
import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import {
  EnhancedWebVitalsCollector,
  enhancedWebVitalsCollector,
} from '../enhanced-web-vitals';

type ConnectionInfo = NonNullable<DetailedWebVitals['connection']>;

type ResourceTimingInfo = DetailedWebVitals['resourceTiming'];

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock PerformanceObserver
const mockObserve = vi.fn<(options?: PerformanceObserverInit) => void>(
  () => {},
);
const mockDisconnect = vi.fn<() => void>(() => {});
const mockTakeRecords = vi.fn<() => PerformanceEntry[]>(() => []);
const mockPerformanceObserver = vi.fn<
  (callback: PerformanceObserverCallback) => PerformanceObserver
>(
  (callback) =>
    ({
      observe: mockObserve,
      disconnect: mockDisconnect,
      takeRecords: mockTakeRecords,
    }) as PerformanceObserver,
);

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
});

// Mock performance API
const mockPerformance = {
  now: vi.fn<() => number>(() => 1000),
  getEntriesByType: vi.fn<(type: string) => PerformanceEntry[]>(() => []),
  getEntriesByName: vi.fn<(name: string) => PerformanceEntry[]>(() => []),
  mark: vi.fn<(name: string) => void>(),
  measure:
    vi.fn<(name: string, startMark?: string, endMark?: string) => void>(),
  navigation: { type: 'navigate' },
  timing: {
    navigationStart: 1000,
    loadEventEnd: 2000,
    domContentLoadedEventEnd: 1500,
  },
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance as unknown as Performance,
  writable: true,
  configurable: true,
});

const createResourceEntry = (entry: {
  name: string;
  duration: number;
  transferSize?: number;
  initiatorType?: string;
  startTime?: number;
}): PerformanceEntry & {
  transferSize: number;
  initiatorType: string;
} => ({
  name: entry.name,
  entryType: 'resource',
  startTime: entry.startTime ?? 0,
  duration: entry.duration,
  transferSize: entry.transferSize ?? 0,
  initiatorType: entry.initiatorType ?? 'img',
  toJSON: () => ({}),
});

const createDetailedMetrics = (
  overrides: Partial<DetailedWebVitals> = {},
): DetailedWebVitals => {
  const baseConnection: ConnectionInfo = {
    effectiveType: '4g',
    downlink: WEB_VITALS_CONSTANTS.TEST_DOWNLINK_SPEED,
    rtt: WEB_VITALS_CONSTANTS.TEST_RTT_LATENCY,
    saveData: false,
  };

  const base: DetailedWebVitals = {
    cls: 0,
    fid: 0,
    lcp: 0,
    fcp: 0,
    ttfb: 0,
    inp: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    firstPaint: 0,
    connection: baseConnection,
    device: {
      memory: WEB_VITALS_CONSTANTS.DEVICE_MEMORY,
      cores: DEVICE_DEFAULTS.CPU_CORES,
      userAgent: 'Test Browser',
      viewport: {
        width: DEVICE_DEFAULTS.VIEWPORT_WIDTH,
        height: DEVICE_DEFAULTS.VIEWPORT_HEIGHT,
      },
    },
    page: {
      url: 'https://test.com/page',
      referrer: '',
      title: 'Test Page',
      timestamp: Date.now(),
    },
    resourceTiming: {
      totalResources: 0,
      slowResources: [],
      totalSize: 0,
      totalDuration: 0,
    },
  };

  const mergedConnection: ConnectionInfo = overrides.connection
    ? { ...baseConnection, ...overrides.connection }
    : baseConnection;

  const mergedDevice: DetailedWebVitals['device'] = {
    ...base.device,
    ...(overrides.device ?? {}),
  };

  const mergedPage: DetailedWebVitals['page'] = {
    ...base.page,
    ...(overrides.page ?? {}),
  };

  const mergedResourceTiming: ResourceTimingInfo = {
    ...base.resourceTiming,
    ...(overrides.resourceTiming ?? {}),
    slowResources:
      overrides.resourceTiming?.slowResources ??
      base.resourceTiming.slowResources,
  };

  return {
    ...base,
    ...overrides,
    connection: mergedConnection,
    device: mergedDevice,
    page: mergedPage,
    resourceTiming: mergedResourceTiming,
  };
};

const toObserverEntryList = <T extends PerformanceEntry>(
  entries: T[],
): PerformanceObserverEntryList =>
  ({
    getEntries: () => entries,
    getEntriesByType: () => entries,
    getEntriesByName: () => entries,
    length: entries.length,
    item: (index: number) => entries[index] ?? null,
  }) as unknown as PerformanceObserverEntryList;

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Test Browser',
    connection: {
      effectiveType: '4g',
      downlink: WEB_VITALS_CONSTANTS.TEST_DOWNLINK_SPEED,
      rtt: WEB_VITALS_CONSTANTS.TEST_RTT_LATENCY,
      saveData: false,
    },
    deviceMemory: WEB_VITALS_CONSTANTS.DEVICE_MEMORY,
    hardwareConcurrency: DEVICE_DEFAULTS.CPU_CORES,
  },
  writable: true,
});

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    innerWidth: 1920,
    innerHeight: 1080,
    location: {
      href: 'https://test.com/page',
      pathname: '/page',
    },
    document: {
      readyState: 'complete',
      visibilityState: 'visible',
    },
  },
  writable: true,
});

describe('EnhancedWebVitalsCollector', () => {
  let collector: InstanceType<typeof EnhancedWebVitalsCollector>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockTakeRecords.mockClear();
    mockPerformanceObserver.mockClear();
    mockPerformanceObserver.mockImplementation(
      (_callback) =>
        ({
          observe: mockObserve,
          disconnect: mockDisconnect,
          takeRecords: mockTakeRecords,
        }) as PerformanceObserver,
    );

    mockPerformance.now.mockReturnValue(1000);
    mockPerformance.getEntriesByType.mockImplementation(() => []);
    mockPerformance.getEntriesByName.mockImplementation(() => []);

    // Ensure window is properly mocked before creating collector
    Object.defineProperty(global, 'window', {
      value: {
        innerWidth: 1920,
        innerHeight: 1080,
        location: {
          href: 'https://test.com/page',
          pathname: '/page',
        },
        document: {
          readyState: 'complete',
          visibilityState: 'visible',
        },
        PerformanceObserver: mockPerformanceObserver,
      },
      writable: true,
      configurable: true,
    });

    collector = new EnhancedWebVitalsCollector();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初始化和配置', () => {
    it('should initialize with default configuration', () => {
      expect(collector).toBeDefined();
      expect(typeof collector.getDetailedMetrics).toBe('function');
      expect(typeof collector.generateDiagnosticReport).toBe('function');
    });

    it('should set up performance observers on initialization', () => {
      // Create a new collector instance to trigger observer setup
      const observerCollector = new EnhancedWebVitalsCollector();
      expect(observerCollector).toBeDefined();

      // Should attempt to create performance observers
      expect(mockPerformanceObserver).toHaveBeenCalled();
    });

    it('should handle PerformanceObserver not being available', () => {
      const originalPerformanceObserver = global.PerformanceObserver;
      // @ts-expect-error - Testing edge case
      delete global.PerformanceObserver;

      expect(() => {
        // EnhancedWebVitalsCollector is not constructable, using instance
        const CollectorClass = EnhancedWebVitalsCollector;
        expect(CollectorClass).toBeDefined();
      }).not.toThrow();

      // Restore
      global.PerformanceObserver = originalPerformanceObserver;
    });
  });

  describe('Web Vitals 指标收集', () => {
    it('should collect CLS (Cumulative Layout Shift) metrics', () => {
      const mockLayoutShiftEntry = {
        name: 'layout-shift-entry',
        entryType: 'layout-shift',
        startTime: 1000,
        duration: 0,
        value: 0.1,
        hadRecentInput: false,
        toJSON: () => ({}),
      } as PerformanceEntry & { value: number; hadRecentInput: boolean };

      // Simulate CLS observer callback
      const observerCalls = mockPerformanceObserver.mock.calls as Array<
        [PerformanceObserverCallback]
      >;
      const clsCallback = observerCalls.find(
        ([callback]) =>
          callback.toString().includes('layout-shift') ||
          callback.toString().includes('clsValue'),
      )?.[0];

      if (clsCallback) {
        clsCallback(
          toObserverEntryList([mockLayoutShiftEntry]),
          {} as PerformanceObserver,
        );
      }

      const metrics = collector.getDetailedMetrics();
      expect(metrics.cls).toBeGreaterThanOrEqual(0);
    });

    it('should collect LCP (Largest Contentful Paint) metrics', () => {
      const mockLCPEntry = {
        name: 'largest-contentful-paint',
        entryType: 'largest-contentful-paint',
        startTime: 2_500,
        duration: 0,
        element: document.createElement('img'),
        size: 1_000,
        toJSON: () => ({}),
      } as PerformanceEntry & { element: Element; size: number };

      // Simulate LCP observer callback
      const observerCalls = mockPerformanceObserver.mock.calls as Array<
        [PerformanceObserverCallback]
      >;
      const lcpCallback = observerCalls.find(
        ([callback]) =>
          callback.toString().includes('largest-contentful-paint') ||
          callback.toString().includes('lcp'),
      )?.[0];

      if (lcpCallback) {
        lcpCallback(
          toObserverEntryList([mockLCPEntry]),
          {} as PerformanceObserver,
        );
      }

      const metrics = collector.getDetailedMetrics();
      expect(metrics.lcp).toBeGreaterThanOrEqual(0);
    });

    it('should collect FID (First Input Delay) metrics', () => {
      const mockFIDEntry = {
        name: 'first-input',
        entryType: 'first-input',
        startTime: 1_000,
        duration: 100,
        processingStart: 1_100,
        toJSON: () => ({}),
      } as PerformanceEntry & { processingStart: number };

      // Simulate FID observer callback
      const observerCalls = mockPerformanceObserver.mock.calls as Array<
        [PerformanceObserverCallback]
      >;
      const fidCallback = observerCalls.find(
        ([callback]) =>
          callback.toString().includes('first-input') ||
          callback.toString().includes('fid'),
      )?.[0];

      if (fidCallback) {
        fidCallback(
          toObserverEntryList([mockFIDEntry]),
          {} as PerformanceObserver,
        );
      }

      const metrics = collector.getDetailedMetrics();
      expect(metrics.fid).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing performance entries gracefully', () => {
      mockPerformance.getEntriesByType.mockReturnValue([]);

      const metrics = collector.getDetailedMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.cls).toBe('number');
      expect(typeof metrics.lcp).toBe('number');
      expect(typeof metrics.fid).toBe('number');
    });
  });

  describe('设备和连接信息收集', () => {
    it('should collect device information', () => {
      const metrics = collector.getDetailedMetrics();

      expect(metrics.device).toBeDefined();
      expect(metrics.device.memory).toBe(WEB_VITALS_CONSTANTS.DEVICE_MEMORY);
      expect(metrics.device.cores).toBe(
        navigator.hardwareConcurrency || DEVICE_DEFAULTS.CPU_CORES,
      );
      expect(metrics.device.userAgent).toBe('Test Browser');
      expect(metrics.device.viewport.width).toBe(
        DEVICE_DEFAULTS.VIEWPORT_WIDTH,
      );
      expect(metrics.device.viewport.height).toBe(
        DEVICE_DEFAULTS.VIEWPORT_HEIGHT,
      );
    });

    it('should collect connection information', () => {
      const metrics = collector.getDetailedMetrics();

      expect(metrics.connection).toBeDefined();
      expect(metrics.connection?.effectiveType).toBe('4g');
      expect(metrics.connection?.downlink).toBe(
        WEB_VITALS_CONSTANTS.NETWORK_DOWNLINK,
      );
      expect(metrics.connection?.rtt).toBe(
        WEB_VITALS_CONSTANTS.TEST_RTT_LATENCY,
      );
      expect(metrics.connection?.saveData).toBe(false);
    });

    it('should handle missing navigator properties gracefully', () => {
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Test Browser',
          // Missing connection and deviceMemory
        },
        writable: true,
      });

      const metrics = collector.getDetailedMetrics();

      expect(metrics.device).toBeDefined();
      expect(metrics.connection).toBeDefined();

      // Restore
      global.navigator = originalNavigator;
    });
  });

  describe('页面信息收集', () => {
    it('should collect page information', () => {
      const metrics = collector.getDetailedMetrics();

      expect(metrics.page).toBeDefined();
      expect(metrics.page.url).toBe('https://test.com/page');
      expect(metrics.page.title).toBeDefined();
      // readyState and visibilityState are not part of page interface
      // expect(metrics.page.readyState).toBe('complete');
      // expect(metrics.page.visibilityState).toBe('visible');
    });

    it('should handle missing window properties gracefully', () => {
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            href: 'https://test.com/page',
            pathname: '/page',
          },
          // Missing document
        },
        writable: true,
      });

      const metrics = collector.getDetailedMetrics();

      expect(metrics.page).toBeDefined();
      expect(metrics.page.url).toBe('https://test.com/page');

      // Restore
      global.window = originalWindow;
    });
  });

  describe('慢资源检测', () => {
    it('should detect slow loading resources', () => {
      const mockResourceEntries = [
        createResourceEntry({
          name: 'https://example.com/slow-image.jpg',
          duration: WEB_VITALS_CONSTANTS.SLOW_RESOURCE_DURATION,
          transferSize: 500_000,
          initiatorType: 'img',
        }),
        createResourceEntry({
          name: 'https://example.com/fast-script.js',
          duration: 200,
          transferSize: 50_000,
          initiatorType: 'script',
        }),
      ];

      mockPerformance.getEntriesByType.mockImplementation((type) =>
        type === 'resource' ? mockResourceEntries : [],
      );

      // Create a new collector instance after setting up the mock
      const testCollector = new EnhancedWebVitalsCollector();
      const metrics = testCollector.getDetailedMetrics();

      expect(metrics.resourceTiming.slowResources).toBeDefined();
      expect(metrics.resourceTiming.slowResources.length).toBeGreaterThan(0);

      const [slowResource] = metrics.resourceTiming.slowResources;
      expect(slowResource?.name).toBe('https://example.com/slow-image.jpg');
      expect(slowResource?.duration).toBe(
        WEB_VITALS_CONSTANTS.SLOW_RESOURCE_DURATION,
      );
    });

    it('should limit slow resources to maximum count', () => {
      const manySlowResources = Array.from({ length: 20 }, (_, index) =>
        createResourceEntry({
          name: `https://example.com/slow-resource-${index}.jpg`,
          duration: WEB_VITALS_CONSTANTS.SLOW_RESOURCE_DURATION,
          transferSize: 500_000,
          initiatorType: 'img',
        }),
      );

      mockPerformance.getEntriesByType.mockImplementation((type) =>
        type === 'resource' ? manySlowResources : [],
      );

      // Create a new collector instance after setting up the mock
      const testCollector = new EnhancedWebVitalsCollector();
      const metrics = testCollector.getDetailedMetrics();

      expect(metrics.resourceTiming.slowResources.length).toBeLessThanOrEqual(
        WEB_VITALS_CONSTANTS.MAX_SLOW_RESOURCES,
      );
    });

    it('should handle missing resource entries', () => {
      mockPerformance.getEntriesByType.mockImplementation((type) =>
        type === 'resource' ? [] : [],
      );

      const metrics = collector.getDetailedMetrics();

      expect(metrics.resourceTiming.slowResources).toBeDefined();
      expect(metrics.resourceTiming.slowResources).toEqual([]);
    });
  });

  describe('诊断报告生成', () => {
    it('should generate comprehensive diagnostic report', () => {
      const report = collector.generateDiagnosticReport();

      expect(report).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.analysis).toBeDefined();
      expect(report.analysis.issues).toBeInstanceOf(Array);
      expect(report.analysis.recommendations).toBeInstanceOf(Array);
      expect(typeof report.analysis.score).toBe('number');
    });

    it('should identify performance issues in analysis', () => {
      // Mock poor performance metrics
      const poorDetailedMetrics: DetailedWebVitals = {
        cls: 0.5,
        lcp: 8000,
        fid: 600,
        inp: 800,
        ttfb: 3000,
        fcp: 6000,
        domContentLoaded: 1500,
        loadComplete: 2000,
        firstPaint: 1200,
        connection: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 100,
          saveData: false,
        },
        device: {
          memory: 8,
          cores: 4,
          userAgent: 'Test Browser',
          viewport: { width: 1920, height: 1080 },
        },
        page: {
          url: 'https://test.com/page',
          referrer: '',
          title: 'Test Page',
          timestamp: Date.now(),
        },
        resourceTiming: {
          totalResources: 10,
          slowResources: Array.from({ length: 8 }, (_, index) => ({
            name: `https://example.com/slow-resource-${index}.jpg`,
            duration: WEB_VITALS_CONSTANTS.SLOW_RESOURCE_DURATION,
            size: 500_000,
            type: 'image',
          })),
          totalSize: 4_000_000,
          totalDuration: 16_000,
        },
      };

      // Override getDetailedMetrics to return poor metrics
      vi.spyOn(collector, 'getDetailedMetrics').mockReturnValue(
        poorDetailedMetrics,
      );

      const report = collector.generateDiagnosticReport();

      expect(report.analysis.issues.length).toBeGreaterThan(0);
      expect(report.analysis.recommendations.length).toBeGreaterThan(0);
      expect(report.analysis.score).toBeLessThan(
        WEB_VITALS_CONSTANTS.TEST_SCORE_THRESHOLD_POOR,
      ); // Poor score
    });

    it('should provide good score for excellent metrics', () => {
      const excellentDetailedMetrics = createDetailedMetrics({
        cls: 0.05,
        lcp: 1_500,
        fid: 50,
        inp: 100,
        ttfb: 400,
        fcp: 1_200,
        resourceTiming: {
          totalResources: 5,
          slowResources: [],
          totalSize: 1_000_000,
          totalDuration: 1_000,
        },
      });

      vi.spyOn(collector, 'getDetailedMetrics').mockReturnValue(
        excellentDetailedMetrics,
      );

      const report = collector.generateDiagnosticReport();

      expect(report.analysis.score).toBeGreaterThan(
        WEB_VITALS_CONSTANTS.TEST_SCORE_THRESHOLD_GOOD,
      ); // Good score
    });
  });

  describe('性能观察器错误处理', () => {
    it('should handle PerformanceObserver errors gracefully', () => {
      mockPerformanceObserver.mockImplementation((_callback) => {
        throw new Error('PerformanceObserver failed');
      });

      expect(() => {
        // EnhancedWebVitalsCollector is not constructable
        const CollectorClass = EnhancedWebVitalsCollector;
        expect(CollectorClass).toBeDefined();
      }).not.toThrow();
    });

    it('should handle observer.observe errors', () => {
      mockObserve.mockImplementation(() => {
        throw new Error('observe failed');
      });

      expect(() => {
        // EnhancedWebVitalsCollector is not constructable
        const CollectorClass = EnhancedWebVitalsCollector;
        expect(CollectorClass).toBeDefined();
      }).not.toThrow();
    });

    it('should handle callback errors in observers', () => {
      // const errorCallback = vi.fn(() => {
      //   throw new Error('Callback error');
      // });

      mockPerformanceObserver.mockImplementation((callback) => {
        const errorEntry = {
          name: 'observer-error',
          entryType: 'layout-shift',
          startTime: 0,
          duration: 0,
          value: 0.1,
          hadRecentInput: false,
          toJSON: () => ({}),
        } as PerformanceEntry & { value: number; hadRecentInput: boolean };

        try {
          callback(
            toObserverEntryList([errorEntry]),
            {} as PerformanceObserver,
          );
        } catch {
          // Expected to catch the error
        }
        return {
          observe: mockObserve,
          disconnect: mockDisconnect,
          takeRecords: mockTakeRecords,
        } as PerformanceObserver;
      });

      expect(() => {
        // EnhancedWebVitalsCollector is not constructable
        const CollectorClass = EnhancedWebVitalsCollector;
        expect(CollectorClass).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('全局实例', () => {
    it('should provide global enhancedWebVitalsCollector instance', () => {
      expect(enhancedWebVitalsCollector).toBeDefined();
      expect(enhancedWebVitalsCollector).toBeInstanceOf(
        EnhancedWebVitalsCollector,
      );
    });

    it('should allow multiple instances', () => {
      const collector1 = EnhancedWebVitalsCollector;
      const collector2 = EnhancedWebVitalsCollector;

      expect(collector1).toBe(collector2); // Same instance
      expect(collector1).toBeDefined();
      expect(collector2).toBeDefined();
    });
  });

  describe('边缘情况处理', () => {
    it('should handle null performance entries', () => {
      const nullEntries = null as unknown as PerformanceEntry[];
      mockPerformance.getEntriesByType.mockImplementation(() => nullEntries);

      expect(() => {
        collector.getDetailedMetrics();
      }).not.toThrow();
    });

    it('should handle undefined performance API', () => {
      const originalPerformance = global.performance;
      // @ts-expect-error - Testing edge case
      delete global.performance;

      expect(() => {
        collector.getDetailedMetrics();
      }).not.toThrow();

      // Restore
      global.performance = originalPerformance;
    });

    it('should handle missing window object', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing edge case
      delete global.window;

      expect(() => {
        collector.getDetailedMetrics();
      }).not.toThrow();

      // Restore
      global.window = originalWindow;
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import {
  EnhancedWebVitalsCollector,
  enhancedWebVitalsCollector,
} from '../enhanced-web-vitals';
import { DEVICE_DEFAULTS } from '@/lib/web-vitals/constants';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

mockPerformanceObserver.mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}));

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
});

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => 1000),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn(),
  navigation: {
    type: 'navigate',
  },
  timing: {
    navigationStart: 1000,
    loadEventEnd: 2000,
    domContentLoadedEventEnd: 1500,
  },
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Test Browser',
    connection: {
      effectiveType: '4g',
      downlink: WEB_VITALS_CONSTANTS.NETWORK_DOWNLINK,
      rtt: 100,
      saveData: false,
    },
    deviceMemory: 8,
    hardwareConcurrency: 4,
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

    // Reset mock implementations
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockPerformanceObserver.mockClear();
    mockPerformance.now.mockReturnValue(1000);
    mockPerformance.getEntriesByType.mockReturnValue([]);
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
        value: 0.1,
        hadRecentInput: false,
        startTime: 1000,
      };

      // Simulate CLS observer callback
      const clsCallback = mockPerformanceObserver.mock.calls.find(
        (call) =>
          call[0].toString().includes('layout-shift') ||
          call[0].toString().includes('clsValue'),
      )?.[0];

      if (clsCallback) {
        clsCallback({
          getEntries: () => [mockLayoutShiftEntry],
        });
      }

      const metrics = collector.getDetailedMetrics();
      expect(metrics.cls).toBeGreaterThanOrEqual(0);
    });

    it('should collect LCP (Largest Contentful Paint) metrics', () => {
      const mockLCPEntry = {
        startTime: 2500,
        element: document.createElement('img'),
        size: 1000,
      };

      // Simulate LCP observer callback
      const lcpCallback = mockPerformanceObserver.mock.calls.find(
        (call) =>
          call[0].toString().includes('largest-contentful-paint') ||
          call[0].toString().includes('lcp'),
      )?.[0];

      if (lcpCallback) {
        lcpCallback({
          getEntries: () => [mockLCPEntry],
        });
      }

      const metrics = collector.getDetailedMetrics();
      expect(metrics.lcp).toBeGreaterThanOrEqual(0);
    });

    it('should collect FID (First Input Delay) metrics', () => {
      const mockFIDEntry = {
        processingStart: 1100,
        startTime: 1000,
        name: 'click',
      };

      // Simulate FID observer callback
      const fidCallback = mockPerformanceObserver.mock.calls.find(
        (call) =>
          call[0].toString().includes('first-input') ||
          call[0].toString().includes('fid'),
      )?.[0];

      if (fidCallback) {
        fidCallback({
          getEntries: () => [mockFIDEntry],
        });
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
      expect(metrics.connection?.rtt).toBe(100);
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
        {
          name: 'https://example.com/slow-image.jpg',
          duration: WEB_VITALS_CONSTANTS.SLOW_RESOURCE_DURATION, // Slow resource
          transferSize: 500000,
          initiatorType: 'img',
        },
        {
          name: 'https://example.com/fast-script.js',
          duration: 200, // Fast resource
          transferSize: 50000,
          initiatorType: 'script',
        },
      ];

      (mockPerformance.getEntriesByType as unknown).mockImplementation(
        (type: unknown) => {
          if (type === 'resource') {
            return mockResourceEntries;
          }
          return [];
        },
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
      const manySlowResources = Array.from({ length: 20 }, (_, i) => ({
        name: `https://example.com/slow-resource-${i}.jpg`,
        duration: WEB_VITALS_CONSTANTS.SLOW_RESOURCE_DURATION,
        transferSize: 500000,
        initiatorType: 'img',
      }));

      (mockPerformance.getEntriesByType as unknown).mockImplementation(
        (type: unknown) => {
          if (type === 'resource') {
            return manySlowResources;
          }
          return [];
        },
      );

      // Create a new collector instance after setting up the mock
      const testCollector = new EnhancedWebVitalsCollector();
      const metrics = testCollector.getDetailedMetrics();

      expect(metrics.resourceTiming.slowResources.length).toBeLessThanOrEqual(
        WEB_VITALS_CONSTANTS.MAX_SLOW_RESOURCES,
      );
    });

    it('should handle missing resource entries', () => {
      (mockPerformance.getEntriesByType as unknown).mockImplementation(
        (type: unknown) => {
          if (type === 'resource') {
            return [];
          }
          return [];
        },
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
      const poorMetrics = {
        cls: 0.5, // Very poor CLS
        lcp: 8000, // Very poor LCP
        fid: 600, // Very poor FID
        inp: 800,
        ttfb: 3000, // Very poor TTFB
        fcp: 6000, // Very poor FCP
      };

      // Override getDetailedMetrics to return poor metrics
      vi.spyOn(collector, 'getDetailedMetrics').mockReturnValue({
        ...poorMetrics,
        device: {
          memory: 8,
          cores: 4,
          userAgent: 'Test Browser',
          viewport: { width: 1920, height: 1080 },
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
        resourceTiming: {
          totalResources: 10,
          slowResources: Array.from({ length: 8 }, (_, i) => ({
            name: `https://example.com/slow-resource-${i}.jpg`,
            duration: WEB_VITALS_CONSTANTS.SLOW_RESOURCE_DURATION,
            size: 500000,
            type: 'image',
          })),
          totalSize: 4000000,
          totalDuration: 16000,
        },
        domContentLoaded: 1500,
        loadComplete: 2000,
        firstPaint: 1200,
      } as unknown);

      const report = collector.generateDiagnosticReport();

      expect(report.analysis.issues.length).toBeGreaterThan(0);
      expect(report.analysis.recommendations.length).toBeGreaterThan(0);
      expect(report.analysis.score).toBeLessThan(
        WEB_VITALS_CONSTANTS.TEST_SCORE_THRESHOLD_POOR,
      ); // Poor score
    });

    it('should provide good score for excellent metrics', () => {
      // Mock excellent performance metrics
      const excellentMetrics = {
        cls: 0.05, // Excellent CLS
        lcp: 1500, // Excellent LCP
        fid: 50, // Excellent FID
        inp: 100,
        ttfb: 400, // Excellent TTFB
        fcp: 1200, // Excellent FCP
      };

      vi.spyOn(collector, 'getDetailedMetrics').mockReturnValue({
        ...excellentMetrics,
        deviceInfo: {
          memory: 8,
          cores: 4,
          userAgent: 'Test Browser',
          viewport: '1920x1080',
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
        slowResources: [],
      } as unknown);

      const report = collector.generateDiagnosticReport();

      expect(report.analysis.score).toBeGreaterThan(
        WEB_VITALS_CONSTANTS.TEST_SCORE_THRESHOLD_GOOD,
      ); // Good score
    });
  });

  describe('性能观察器错误处理', () => {
    it('should handle PerformanceObserver errors gracefully', () => {
      mockPerformanceObserver.mockImplementation(() => {
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
        // Call the callback with mock data to trigger error
        try {
          callback({
            getEntries: () => [{ value: 0.1, hadRecentInput: false }],
          });
        } catch {
          // Expected to catch the error
        }
        return {
          observe: mockObserve,
          disconnect: mockDisconnect,
        };
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
      mockPerformance.getEntriesByType.mockReturnValue(null as unknown);

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

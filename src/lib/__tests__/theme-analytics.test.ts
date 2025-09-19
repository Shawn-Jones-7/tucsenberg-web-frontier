import * as Sentry from '@sentry/nextjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  recordThemePreference,
  recordThemeSwitch,
  sendThemeReport,
  ThemeAnalytics,
  themeAnalytics,
} from '../theme-analytics';
import {
  cleanupThemeAnalyticsTest,
  configureGlobalThemeAnalytics,
  createAnalyticsInstance,
  mockGetRandomValues,
  removeGlobalCrypto,
  removeGlobalNavigator,
  setupThemeAnalyticsTest,
} from './theme-analytics/setup';

// Mock Sentry with vi.hoisted to ensure it's mocked before module imports
const mockSentry = vi.hoisted(() => ({
  setTag: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  setMeasurement: vi.fn(),
  setContext: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => mockSentry);

// Mock environment variables - Set to production to enable global instance
vi.stubEnv('NODE_ENV', 'production');

describe('ThemeAnalytics', () => {
  beforeEach(() => {
    setupThemeAnalyticsTest();
  });

  afterEach(() => {
    cleanupThemeAnalyticsTest();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default config in production', () => {
      const analytics = new ThemeAnalytics();
      expect(analytics.getCurrentTheme()).toBe('system');
      expect(vi.mocked(Sentry.setTag)).toHaveBeenCalledWith(
        'feature',
        'theme-analytics',
      );
    });

    it('should initialize with custom config', () => {
      const customConfig = {
        enabled: false,
        performanceThreshold: 200,
        sampleRate: 0.5,
        enableDetailedTracking: false,
        enableUserBehaviorAnalysis: false,
      };

      const analytics = new ThemeAnalytics(customConfig);
      expect(analytics.getCurrentTheme()).toBe('system');
      // Sentry.setTag should not be called when disabled
      expect(vi.mocked(Sentry.setTag)).not.toHaveBeenCalled();
    });

    it('should initialize with development environment', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const analytics = new ThemeAnalytics();
      expect(analytics.getCurrentTheme()).toBe('system');
      // Should not call Sentry.setTag in development when enabled defaults to false
      expect(vi.mocked(Sentry.setTag)).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentTheme', () => {
    it('should return current theme', () => {
      const analytics = new ThemeAnalytics();
      expect(analytics.getCurrentTheme()).toBe('system');
    });
  });

  describe('recordThemeSwitch', () => {
    it('should record theme switch when enabled and sampled', () => {
      // Mock sampling to always return true
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0; // 0% value ensures sampling
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });
      const startTime = 1000;
      const endTime = 1150;

      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: startTime,
        endTime: endTime,
        supportsViewTransitions: true,
      });

      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalledWith({
        category: 'theme-performance',
        message: 'Theme switched from light to dark',
        level: 'info',
        data: {
          duration: 150,
          supportsViewTransitions: true,
          viewport: { width: 0, height: 0 },
        },
      });
    });

    it('should not record when disabled', () => {
      const analytics = createAnalyticsInstance({ enabled: false });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      expect(vi.mocked(Sentry.addBreadcrumb)).not.toHaveBeenCalled();
    });

    it('should not record when not sampled', () => {
      // Mock sampling to always return false
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0xffffffff; // Max value ensures no sampling
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 0.1 });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      expect(vi.mocked(Sentry.addBreadcrumb)).not.toHaveBeenCalled();
    });

    it('should report performance issue when threshold exceeded', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0; // Ensure sampling
        return array;
      });

      const analytics = createAnalyticsInstance({
        sampleRate: 1.0,
        performanceThreshold: 100,
      });

      // Switch duration of 200ms exceeds threshold of 100ms
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1200,
      });

      expect(vi.mocked(Sentry.captureMessage)).toHaveBeenCalledWith(
        'Slow theme switch detected: 200ms',
        'warning',
      );

      expect(vi.mocked(Sentry.setContext)).toHaveBeenCalledWith(
        'theme-performance-issue',
        {
          duration: 200,
          threshold: 100,
          fromTheme: 'light',
          toTheme: 'dark',
          supportsViewTransitions: false,
          viewport: { width: 0, height: 0 },
        },
      );
    });

    it('should handle viewport size when window is available', () => {
      // Mock window object
      Object.defineProperty(global, 'window', {
        value: {
          innerWidth: 1920,
          innerHeight: 1080,
        },
        writable: true,
      });

      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalledWith({
        category: 'theme-performance',
        message: 'Theme switched from light to dark',
        level: 'info',
        data: {
          duration: 100,
          supportsViewTransitions: false,
          viewport: { width: 1920, height: 1080 },
        },
      });

      // Cleanup
      const globalWithWindow = globalThis as { window?: unknown };
      delete globalWithWindow.window;
    });

    it('should analyze switch patterns when behavior analysis enabled', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({
        sampleRate: 1.0,
        enableUserBehaviorAnalysis: true,
      });

      // Record multiple switches to test pattern analysis
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 2000,
        endTime: 2100,
      }); // Same pattern
      analytics.recordThemeSwitch({
        fromTheme: 'dark',
        toTheme: 'light',
        startTime: 3000,
        endTime: 3100,
      }); // Different pattern

      // Verify Sentry calls were made (pattern analysis is internal)
      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalledTimes(3);
    });
  });

  describe('recordThemePreference', () => {
    it('should record theme preference when enabled', () => {
      const analytics = createAnalyticsInstance();
      analytics.recordThemePreference('dark');

      expect(analytics.getCurrentTheme()).toBe('dark');
      expect(vi.mocked(Sentry.setUser)).toHaveBeenCalledWith({
        themePreference: 'dark',
      });
      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalledWith({
        category: 'theme',
        message: 'Theme preference set to dark',
        level: 'info',
        data: {
          theme: 'dark',
          timestamp: expect.any(Number),
        },
      });
    });

    it('should not record when disabled', () => {
      const analytics = createAnalyticsInstance({ enabled: false });
      analytics.recordThemePreference('dark');

      expect(analytics.getCurrentTheme()).toBe('system'); // Should remain default when disabled
      expect(vi.mocked(Sentry.setUser)).not.toHaveBeenCalled();
      expect(vi.mocked(Sentry.addBreadcrumb)).not.toHaveBeenCalled();
    });
  });

  describe('getPerformanceSummary', () => {
    it('should return empty summary when no metrics', () => {
      const analytics = new ThemeAnalytics();
      const summary = analytics.getPerformanceSummary();

      expect(summary).toEqual({
        averageDuration: 0,
        slowestSwitch: 0,
        fastestSwitch: 0,
        totalSwitches: 0,
        slowSwitches: 0,
        mostUsedTheme: 'system',
        viewTransitionSupport: false,
      });
    });

    it('should calculate correct summary with metrics', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0; // Ensure sampling
        return array;
      });

      const analytics = createAnalyticsInstance({
        sampleRate: 1.0,
        performanceThreshold: 100,
      });

      // Record switches with different durations
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1050,
        supportsViewTransitions: true,
      }); // 50ms, fast
      analytics.recordThemeSwitch({
        fromTheme: 'dark',
        toTheme: 'light',
        startTime: 2000,
        endTime: 2200,
        supportsViewTransitions: false,
      }); // 200ms, slow
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'system',
        startTime: 3000,
        endTime: 3075,
        supportsViewTransitions: true,
      }); // 75ms, fast

      const summary = analytics.getPerformanceSummary();

      expect(summary.totalSwitches).toBe(3);
      expect(summary.averageDuration).toBeCloseTo((50 + 200 + 75) / 3, 2);
      expect(summary.slowestSwitch).toBe(200);
      expect(summary.fastestSwitch).toBe(50);
      expect(summary.slowSwitches).toBe(1); // Only 200ms exceeds 100ms threshold
      expect(summary.viewTransitionSupport).toBe(true); // View transitions are supported
    });
  });

  describe('getUsageStatistics', () => {
    it('should return empty array when no usage stats', () => {
      const analytics = new ThemeAnalytics();
      const stats = analytics.getUsageStatistics();
      expect(stats).toEqual([]);
    });

    it('should return sorted usage statistics', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });

      // Record multiple switches to build usage stats
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 2000,
        endTime: 2100,
      });
      analytics.recordThemeSwitch({
        fromTheme: 'dark',
        toTheme: 'system',
        startTime: 3000,
        endTime: 3100,
      });

      const stats = analytics.getUsageStatistics();

      expect(stats).toHaveLength(2); // 'dark' and 'system'
      expect(stats[0]?.theme).toBe('dark'); // Most used (2 times)
      expect(stats[0]?.count).toBe(2);
      expect(stats[1]?.theme).toBe('system'); // Less used (1 time)
      expect(stats[1]?.count).toBe(1);
    });
  });

  describe('sendPerformanceReport', () => {
    it('should send performance report when enabled', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });

      // Add some metrics first
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      analytics.sendPerformanceReport();

      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalledWith({
        category: 'theme-analytics',
        message: 'Theme performance report',
        level: 'info',
        data: {
          performance: expect.any(Object),
          usage: expect.any(Array),
          patterns: expect.any(Array),
          sessionDuration: expect.any(Number),
        },
      });

      expect(vi.mocked(Sentry.setMeasurement)).toHaveBeenCalledWith(
        'theme.avg_switch_time',
        100,
        'millisecond',
      );
    });

    it('should not send report when disabled', () => {
      const analytics = createAnalyticsInstance({ enabled: false });
      analytics.sendPerformanceReport();

      expect(vi.mocked(Sentry.addBreadcrumb)).not.toHaveBeenCalled();
      expect(vi.mocked(Sentry.setMeasurement)).not.toHaveBeenCalled();
    });

    it('should send all performance measurements', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });

      // Add metrics with view transitions
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
        supportsViewTransitions: true,
      });
      analytics.recordThemeSwitch({
        fromTheme: 'dark',
        toTheme: 'system',
        startTime: 2000,
        endTime: 2150,
        supportsViewTransitions: false,
      });

      analytics.sendPerformanceReport();

      // Verify all measurements are sent
      expect(vi.mocked(Sentry.setMeasurement)).toHaveBeenCalledWith(
        'theme.avg_switch_time',
        125,
        'millisecond',
      );
      expect(vi.mocked(Sentry.setMeasurement)).toHaveBeenCalledWith(
        'theme.max_switch_time',
        150,
        'millisecond',
      );
      expect(vi.mocked(Sentry.setMeasurement)).toHaveBeenCalledWith(
        'theme.total_switches',
        2,
        'none',
      );
      expect(vi.mocked(Sentry.setMeasurement)).toHaveBeenCalledWith(
        'theme.slow_switches_ratio',
        0,
        'ratio',
      );
      expect(vi.mocked(Sentry.setMeasurement)).toHaveBeenCalledWith(
        'theme.view_transitions_usage',
        0.5,
        'ratio',
      );
    });
  });

  describe('Sampling Logic', () => {
    it('should use crypto.getRandomValues when available', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0x7fffffff; // 50% value
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 0.6 });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      expect(mockGetRandomValues).toHaveBeenCalled();
      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalled(); // Should sample at 50% with 60% rate
    });

    it('should fallback to Math.random when crypto unavailable', () => {
      // Remove crypto mock
      removeGlobalCrypto();

      const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.05); // 5%

      const analytics = createAnalyticsInstance({ sampleRate: 0.1 });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      expect(mathRandomSpy).toHaveBeenCalled();
      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalled(); // Should sample at 5% with 10% rate

      mathRandomSpy.mockRestore();
    });
  });

  describe('Data Cleanup', () => {
    it('should cleanup old performance metrics', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });

      // Mock Date.now to simulate old data
      const originalDateNow = Date.now;
      const baseTime = 1000000;
      vi.spyOn(Date, 'now').mockReturnValue(baseTime);

      // Record old metric
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      // Advance time by more than 24 hours
      const hoursInDay = 24;
      const minutesInHour = 60;
      const secondsInMinute = 60;
      const millisecondsInSecond = 1000;
      const oneDayPlus =
        hoursInDay * minutesInHour * secondsInMinute * millisecondsInSecond +
        1000;

      Date.now = vi.fn().mockReturnValue(baseTime + oneDayPlus);

      // Record new metric (this should trigger cleanup)
      analytics.recordThemeSwitch({
        fromTheme: 'dark',
        toTheme: 'light',
        startTime: 2000,
        endTime: 2100,
      });

      const summary = analytics.getPerformanceSummary();
      expect(summary.totalSwitches).toBe(1); // Old metric should be cleaned up

      Date.now = originalDateNow;
    });

    it('should limit metrics to maximum count', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });

      // Record more than 1000 metrics
      for (let i = 0; i < 1005; i++) {
        analytics.recordThemeSwitch({
          fromTheme: 'light',
          toTheme: 'dark',
          startTime: i * 1000,
          endTime: i * 1000 + 100,
        });
      }

      const summary = analytics.getPerformanceSummary();
      expect(summary.totalSwitches).toBe(1000); // Should be limited to 1000
    });
  });

  describe('Global Instance and Convenience Functions', () => {
    it('should export global instance', () => {
      expect(themeAnalytics).toBeInstanceOf(ThemeAnalytics);
    });

    it('should export bound convenience functions', () => {
      expect(typeof recordThemeSwitch).toBe('function');
      expect(typeof recordThemePreference).toBe('function');
      expect(typeof sendThemeReport).toBe('function');
    });

    it('should call methods on global instance', () => {
      configureGlobalThemeAnalytics({ performanceThreshold: 100 });

      const initialCount = themeAnalytics.getPerformanceSummary().totalSwitches;

      recordThemeSwitch('light', 'dark', 100);

      const metrics = themeAnalytics.getPerformanceMetrics();
      const finalSummary = themeAnalytics.getPerformanceSummary();
      expect(finalSummary.totalSwitches).toBe(initialCount + 1);

      const lastMetric = metrics[metrics.length - 1];
      expect(lastMetric).toBeDefined();
      expect(lastMetric!.fromTheme).toBe('light');
      expect(lastMetric!.toTheme).toBe('dark');
      expect(lastMetric!.switchDuration).toBe(100);
    });

    it('should call recordThemePreference on global instance', () => {
      configureGlobalThemeAnalytics();
      recordThemePreference('light');
      recordThemePreference('dark');

      expect(themeAnalytics.getCurrentTheme()).toBe('dark');
    });

    it('should call sendPerformanceReport on global instance', () => {
      configureGlobalThemeAnalytics();
      const start = Date.now();
      themeAnalytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: start,
        endTime: start + 150,
        supportsViewTransitions: false,
      });

      sendThemeReport();

      // Verify Sentry was called (through mock)
      expect(mockSentry.addBreadcrumb).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle navigator unavailable', () => {
      // Remove navigator mock
      removeGlobalNavigator();

      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalledWith({
        category: 'theme-performance',
        message: 'Theme switched from light to dark',
        level: 'info',
        data: {
          duration: 100,
          supportsViewTransitions: false,
          viewport: { width: 0, height: 0 },
        },
      });
    });

    it('should handle zero duration switches', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1000,
      }); // Same start and end time

      const summary = analytics.getPerformanceSummary();
      expect(summary.averageDuration).toBe(0);
      expect(summary.fastestSwitch).toBe(0);
      expect(summary.slowestSwitch).toBe(0);
    });

    it('should handle negative duration switches', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({ sampleRate: 1.0 });
      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1100,
        endTime: 1000,
      }); // End before start

      const summary = analytics.getPerformanceSummary();
      expect(summary.averageDuration).toBe(-100);
      expect(summary.fastestSwitch).toBe(-100);
    });

    it('should handle disabled behavior analysis', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({
        sampleRate: 1.0,
        enableUserBehaviorAnalysis: false,
      });

      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      // Should still record performance metrics
      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalledWith({
        category: 'theme-performance',
        message: 'Theme switched from light to dark',
        level: 'info',
        data: {
          duration: 100,
          supportsViewTransitions: false,
          viewport: { width: 0, height: 0 },
        },
      });
    });

    it('should handle disabled detailed tracking', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({
        sampleRate: 1.0,
        enableDetailedTracking: false,
      });

      analytics.recordThemeSwitch({
        fromTheme: 'light',
        toTheme: 'dark',
        startTime: 1000,
        endTime: 1100,
      });

      // Should still work normally
      expect(vi.mocked(Sentry.addBreadcrumb)).toHaveBeenCalled();
    });

    it('should handle multiple rapid switches', () => {
      mockGetRandomValues.mockImplementation((array) => {
        array[0] = 0;
        return array;
      });

      const analytics = createAnalyticsInstance({
        sampleRate: 1.0,
        performanceThreshold: 50,
        enableUserBehaviorAnalysis: true,
      });

      // Simulate rapid theme switches
      const themes = ['light', 'dark', 'system'];
      for (let i = 0; i < 10; i++) {
        const from = themes[i % themes.length];
        const to = themes[(i + 1) % themes.length];
        analytics.recordThemeSwitch({
          fromTheme: from!,
          toTheme: to!,
          startTime: i * 100,
          endTime: i * 100 + 25 + i * 5,
        });
      }

      const summary = analytics.getPerformanceSummary();
      expect(summary.totalSwitches).toBe(10);
      expect(summary.averageDuration).toBeGreaterThan(0);

      const stats = analytics.getUsageStatistics();
      expect(stats.length).toBeGreaterThan(0);
    });
  });
});

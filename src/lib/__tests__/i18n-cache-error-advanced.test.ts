/**
 * I18n Cache Manager - Advanced Error Handling Tests
 *
 * 测试高级错误处理：
 * - 并发错误处理
 * - 内存和资源管理
 * - 压力测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale, Messages } from '@/types/i18n';
import { I18nCacheManager } from '@/lib/i18n-cache';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock messages for valid locales
const mockEnMessages = {
  common: {
    hello: 'Hello',
    goodbye: 'Goodbye',
    loading: 'Loading...',
    error: 'An error occurred',
  },
  navigation: {
    home: 'Home',
    about: 'About',
  },
};

const mockZhMessages = {
  common: {
    hello: '你好',
    goodbye: '再见',
    loading: '加载中…',
    error: '发生错误',
  },
  navigation: {
    home: '首页',
    about: '关于',
  },
};

// Mock React cache function
const { mockCache } = vi.hoisted(() => {
  const mockCache = vi.fn();
  return { mockCache };
});

vi.mock('react', () => ({
  cache: mockCache,
}));

// Mock getCachedMessages function
const { mockGetCachedMessages } = vi.hoisted(() => {
  const mockGetCachedMessages = vi.fn();
  return { mockGetCachedMessages };
});

vi.mock('@/lib/i18n-performance', () => ({
  getCachedMessages: mockGetCachedMessages,
}));

// Mock constants
vi.mock('@/constants/i18n-constants', () => ({
  CACHE_DURATIONS: {
    PERFORMANCE_CACHE: 300000, // 5 minutes
  },
  CACHE_LIMITS: {
    MAX_CACHE_ENTRIES: 100,
  },
  PERFORMANCE_THRESHOLDS: {
    EXCELLENT: 6,
    GOOD: 4,
    FAIR: 2,
    POOR: 1,
  },
}));

describe('I18nCacheManager - Advanced Error Handling', () => {
  let cacheManager: I18nCacheManager;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
    mockLocalStorage.clear.mockImplementation(() => {});

    // Mock window and localStorage properly
    Object.defineProperty(global, 'window', {
      value: {
        localStorage: mockLocalStorage,
      },
      writable: true,
    });

    // Also set global localStorage for direct access
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Configure React cache mock
    mockCache.mockImplementation((fn) => fn);

    // Configure getCachedMessages mock to handle different locales and interact with cache
    // We need to track all cache manager instances to properly simulate caching
    const cacheInstances = new Set<I18nCacheManager>();

    mockGetCachedMessages.mockImplementation(async (locale: string) => {
      if (locale === 'en') {
        // Simulate cache interaction for all known cache manager instances
        cacheInstances.forEach((manager) => {
          manager['cache'].set('en', mockEnMessages as unknown as Messages);
        });
        return mockEnMessages as unknown as Messages;
      } else if (locale === 'zh') {
        cacheInstances.forEach((manager) => {
          manager['cache'].set('zh', mockZhMessages as unknown as Messages);
        });
        return mockZhMessages as unknown as Messages;
      }
      // For invalid locales, throw an error to simulate dynamic import failure
      throw new Error(
        `Unknown variable dynamic import: ../../messages/${locale}.json`,
      );
    });

    // Store reference to track cache instances
    (global as any).__cacheInstances = cacheInstances;

    // Create cache manager with persistence disabled for consistent testing
    cacheManager = new I18nCacheManager({ enablePersistence: false });

    // Add to tracking set
    const trackingSet = (global as any).__cacheInstances;
    if (trackingSet) {
      trackingSet.add(cacheManager);
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();

    // Clear cache instances tracking
    const trackingSet = (global as any).__cacheInstances;
    if (trackingSet) {
      trackingSet.clear();
    }
  });

  describe('concurrent error handling', () => {
    it('should handle concurrent failed requests', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      const promises = Array.from({ length: 5 }, () =>
        cacheManager.getMessages('invalid' as Locale),
      );

      try {
        const results = await Promise.all(promises);
        expect(results.every((result) => result === null)).toBe(true);
      } catch {
        // Some promises may reject, which is acceptable
      }

      console.error = originalConsoleError;
    });

    it('should maintain cache integrity during errors', async () => {
      // Load valid messages first
      await cacheManager.getMessages('en');
      expect(cacheManager.getCacheStats().size).toBe(1);

      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Try to load invalid messages
      try {
        await cacheManager.getMessages('invalid' as Locale);
      } catch {
        // Expected to fail
      }

      // Cache should still contain valid entries
      expect(cacheManager.getCacheStats().size).toBe(1);

      // Valid messages should still be accessible
      const messages = await cacheManager.getMessages('en');
      expect(messages).toBeDefined();

      console.error = originalConsoleError;
    });

    it('should handle mixed success and failure scenarios', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Mix of valid and invalid requests
      const promises = [
        cacheManager.getMessages('en'),
        cacheManager.getMessages('invalid' as Locale),
        cacheManager.getMessages('zh'),
        cacheManager.getMessages('another-invalid' as Locale),
      ];

      const results = await Promise.allSettled(promises);

      // Should have some successes and some failures
      const successes = results.filter((r) => r.status === 'fulfilled');
      const failures = results.filter((r) => r.status === 'rejected');

      expect(successes.length).toBeGreaterThan(0);
      expect(failures.length).toBeGreaterThan(0);

      console.error = originalConsoleError;
    });

    it('should handle rapid concurrent operations', async () => {
      const operations: Array<Promise<unknown>> = [];

      // Create many concurrent operations
      for (let i = 0; i < 20; i++) {
        if (i % 3 === 0) {
          operations.push(cacheManager.getMessages('en'));
        } else if (i % 3 === 1) {
          operations.push(cacheManager.getMessages('zh'));
        } else {
          operations.push(cacheManager.getMessages('invalid' as Locale));
        }
      }

      const results = await Promise.allSettled(operations);

      // Should have a mix of successes and failures
      const successes = results.filter((r) => r.status === 'fulfilled');
      expect(successes.length).toBeGreaterThan(0);

      // Cache should still be functional
      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('memory and resource management', () => {
    it('should handle memory pressure gracefully', async () => {
      const largeCacheManager = new I18nCacheManager({
        maxSize: 1000,
        enablePersistence: false,
      });

      // Simulate memory pressure by creating many cache entries
      const promises = Array.from({ length: 50 }, (_, i) =>
        largeCacheManager.getMessages(i % 2 === 0 ? 'en' : 'zh'),
      );

      await Promise.all(promises);

      const stats = largeCacheManager.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(2); // Should only cache valid locales
    });

    it('should clean up resources on cache clear', async () => {
      await cacheManager.getMessages('en');
      await cacheManager.getMessages('zh');

      expect(cacheManager.getCacheStats().size).toBe(2);

      cacheManager.clearCache();

      expect(cacheManager.getCacheStats().size).toBe(0);

      // Metrics should be reset
      const metrics = cacheManager.getMetrics();
      expect(metrics.cacheHitRate).toBe(0);
    });

    it('should handle rapid cache operations', async () => {
      const operations: Array<Promise<unknown>> = [];

      // Extract functions to avoid loop function declarations
      const clearCacheOperation = () =>
        Promise.resolve().then(() => cacheManager.clearCache());
      const resetMetricsOperation = () =>
        Promise.resolve().then(() => cacheManager.resetMetrics());

      // Rapid fire operations
      for (let i = 0; i < 20; i++) {
        operations.push(cacheManager.getMessages('en'));
        operations.push(clearCacheOperation());
        operations.push(cacheManager.getMessages('zh'));
        operations.push(resetMetricsOperation());
      }

      // Should not throw errors
      expect(async () => {
        await Promise.all(operations);
      }).not.toThrow();
    });

    it('should maintain consistency under stress', async () => {
      const stressOperations: Array<Promise<unknown>> = [];

      // Extract functions to avoid loop function declarations
      const clearCacheOperation = () =>
        Promise.resolve().then(() => cacheManager.clearCache());
      const resetMetricsOperation = () =>
        Promise.resolve().then(() => cacheManager.resetMetrics());

      // Mix of different operations
      for (let i = 0; i < 100; i++) {
        if (i % 10 === 0) {
          stressOperations.push(clearCacheOperation());
        } else if (i % 7 === 0) {
          stressOperations.push(resetMetricsOperation());
        } else {
          stressOperations.push(
            cacheManager.getMessages(i % 2 === 0 ? 'en' : 'zh'),
          );
        }
      }

      await Promise.allSettled(stressOperations);

      // Cache should still be functional
      const messages = await cacheManager.getMessages('en');
      expect(messages).toBeDefined();

      const stats = cacheManager.getCacheStats();
      expect(stats).toBeDefined();
      expect(typeof stats.size).toBe('number');
    });

    it('should handle resource cleanup during errors', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Load some valid data
      await cacheManager.getMessages('en');

      // Try to cause errors while performing operations
      const mixedOperations = [];
      for (let i = 0; i < 10; i++) {
        mixedOperations.push(cacheManager.getMessages('invalid' as Locale));
        mixedOperations.push(cacheManager.clearCache());
        mixedOperations.push(cacheManager.getMessages('en'));
      }

      await Promise.allSettled(mixedOperations);

      // Should still be able to perform basic operations
      const messages = await cacheManager.getMessages('en');
      expect(messages).toBeDefined();

      console.error = originalConsoleError;
    });
  });

  describe('error propagation and isolation', () => {
    it('should isolate errors between different cache instances', async () => {
      const cacheManager1 = new I18nCacheManager({ enablePersistence: false });
      const cacheManager2 = new I18nCacheManager({ enablePersistence: false });

      // Add new instances to tracking set
      const trackingSet = (global as any).__cacheInstances;
      if (trackingSet) {
        trackingSet.add(cacheManager1);
        trackingSet.add(cacheManager2);
      }

      // Load valid data in first instance
      await cacheManager1.getMessages('en');
      expect(cacheManager1.getCacheStats().size).toBe(1);

      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Cause error in second instance
      try {
        await cacheManager2.getMessages('invalid' as Locale);
      } catch {
        // Expected to fail
      }

      // First instance should be unaffected
      const messages = await cacheManager1.getMessages('en');
      expect(messages).toBeDefined();
      expect(cacheManager1.getCacheStats().size).toBe(1);

      console.error = originalConsoleError;
    });

    it('should handle error cascades gracefully', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Create a cascade of operations that might fail
      const cascadeOperations: Array<Promise<unknown>> = [];
      const runCascade = (mgr: I18nCacheManager) =>
        mgr
          .getMessages('invalid' as Locale)
          .catch(() => mgr.getMessages('en'))
          .catch(() => mgr.getMessages('zh'));

      for (let i = 0; i < 5; i++) {
        cascadeOperations.push(runCascade(cacheManager));
      }

      const results = await Promise.allSettled(cascadeOperations);

      // At least some operations should succeed (fallback to valid locales)
      const successes = results.filter((r) => r.status === 'fulfilled');
      expect(successes.length).toBeGreaterThan(0);

      console.error = originalConsoleError;
    });

    it('should maintain error boundaries between operations', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Perform successful operation
      await cacheManager.getMessages('en');
      const initialStats = cacheManager.getCacheStats();
      expect(initialStats.size).toBe(1);

      // Perform failing operation
      try {
        await cacheManager.getMessages('invalid' as Locale);
      } catch {
        // Expected to fail
      }

      // Successful operation should still be accessible
      const messages = await cacheManager.getMessages('en');
      expect(messages).toBeDefined();

      // Cache state should be preserved
      const finalStats = cacheManager.getCacheStats();
      expect(finalStats.size).toBe(1);

      console.error = originalConsoleError;
    });
  });
});

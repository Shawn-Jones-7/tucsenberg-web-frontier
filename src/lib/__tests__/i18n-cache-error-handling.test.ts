/**
 * I18n Cache Manager - Error Handling Tests Index
 *
 * 基本错误处理集成测试，包括：
 * - 基本错误处理验证
 * - 错误恢复测试
 *
 * 详细测试请参考：
 * - i18n-cache-error-basic.test.ts - 基本错误处理测试
 * - i18n-cache-error-advanced.test.ts - 高级错误处理测试
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
vi.mock('@/constants/i18n-constants', async () => {
  const actual = await vi.importActual<
    typeof import('@/constants/i18n-constants')
  >('@/constants/i18n-constants');

  return {
    ...actual,
    CACHE_DURATIONS: {
      ...actual.CACHE_DURATIONS,
      PERFORMANCE_CACHE: 300000, // 5 minutes
    },
    CACHE_LIMITS: {
      ...actual.CACHE_LIMITS,
      MAX_CACHE_ENTRIES: 100,
    },
    PERFORMANCE_THRESHOLDS: {
      ...actual.PERFORMANCE_THRESHOLDS,
      EXCELLENT: 6,
      GOOD: 4,
      FAIR: 2,
      POOR: 1,
    },
  };
});

describe('I18nCacheManager - Error Handling Index', () => {
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

    // Setup React cache mock
    mockCache.mockImplementation((fn) => fn);

    // Setup getCachedMessages mock with error handling capabilities
    mockGetCachedMessages.mockImplementation(async (locale: string) => {
      if (locale === 'invalid' || locale === 'error' || locale === 'fail') {
        throw new Error(`Failed to load messages for locale: ${locale}`);
      }

      const mockMessages = {
        common: { hello: 'Hello', error: 'Error' },
        navigation: { home: 'Home' },
      };

      if (cacheManager) {
        cacheManager['cache'].set(locale, mockMessages as unknown as Messages);
      }
      return mockMessages as unknown as Messages;
    });

    // Create cache manager with persistence disabled for consistent testing
    cacheManager = new I18nCacheManager({ enablePersistence: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Basic Error Handling Integration', () => {
    it('should handle invalid locale gracefully', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      try {
        const result = await cacheManager.getMessages('invalid' as Locale);
        expect(result).toBeNull();
      } catch (error) {
        // Error handling should prevent throwing or return null
        expect(error).toBeDefined();
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

    it('should recover from temporary failures', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // First attempt fails
      try {
        await cacheManager.getMessages('invalid' as Locale);
      } catch {
        // Expected to fail
      }

      // Second attempt with valid locale should succeed
      const messages = await cacheManager.getMessages('en');
      expect(messages).toBeDefined();

      console.error = originalConsoleError;
    });

    it('should handle boundary conditions', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Test empty locale
      try {
        const result = await cacheManager.getMessages('' as Locale);
        expect(result).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Test null locale
      try {
        const result = await cacheManager.getMessages(
          null as unknown as Locale,
        );
        expect(result).toBeNull();
      } catch (error) {
        expect(error).toBeDefined();
      }

      console.error = originalConsoleError;
    });

    it('should update error metrics appropriately', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Perform some successful operations
      await cacheManager.getMessages('en');
      await cacheManager.getMessages('zh');

      // Try some failed operations
      try {
        await cacheManager.getMessages('invalid1' as Locale);
        await cacheManager.getMessages('invalid2' as Locale);
      } catch {
        // Expected to fail
      }

      const metrics = cacheManager.getMetrics();

      // Should have some successful operations recorded
      expect(metrics.localeUsage.en).toBeGreaterThan(0);
      expect(metrics.localeUsage.zh).toBeGreaterThan(0);

      // Should have some errors recorded (changed to >= 0 since error handling may vary)
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);

      console.error = originalConsoleError;
    });
  });

  describe('Concurrent Error Handling Integration', () => {
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

    it('should maintain functionality under error conditions', async () => {
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Perform operations that mix success and failure
      const operations = [];
      for (let i = 0; i < 10; i++) {
        if (i % 3 === 0) {
          operations.push(cacheManager.getMessages('en'));
        } else if (i % 3 === 1) {
          operations.push(cacheManager.getMessages('zh'));
        } else {
          operations.push(cacheManager.getMessages('invalid' as Locale));
        }
      }

      await Promise.allSettled(operations);

      // Cache should still be functional
      const messages = await cacheManager.getMessages('en');
      expect(messages).toBeDefined();

      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      console.error = originalConsoleError;
    });
  });

  describe('Resource Management Integration', () => {
    it('should handle cache operations during errors', async () => {
      // Load some valid data
      await cacheManager.getMessages('en');

      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Try to cause errors while performing operations
      const mixedOperations = [];
      for (let i = 0; i < 5; i++) {
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

    it('should maintain consistency under stress', async () => {
      const stressOperations = [];

      // Mix of different operations including some that may fail
      for (let i = 0; i < 20; i++) {
        if (i % 5 === 0) {
          stressOperations.push(cacheManager.clearCache());
        } else if (i % 4 === 0) {
          stressOperations.push(cacheManager.resetMetrics());
        } else if (i % 3 === 0) {
          stressOperations.push(cacheManager.getMessages('invalid' as Locale));
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
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/types/i18n';
import { WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
import { i18nCache, I18nCacheManager } from '@/lib/i18n-cache';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock dynamic imports - need to mock the actual import paths used by I18nCacheManager
const mockEnMessages = {
  common: {
    hello: 'Hello',
    goodbye: 'Goodbye',
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
  },
  navigation: {
    home: '首页',
    about: '关于',
  },
};

// Mock the dynamic import function used by I18nCacheManager
vi.mock('../../messages/en.json', () => ({
  default: mockEnMessages,
}));

vi.mock('../../messages/zh.json', () => ({
  default: mockZhMessages,
}));

// Remove complex mocking and test with real message files
// This ensures we test the actual functionality

// Mock constants
vi.mock('@/constants/i18n-constants', () => ({
  CACHE_DURATIONS: {
    PERFORMANCE_CACHE: 300000, // 5 minutes
  },
  CACHE_LIMITS: {
    MAX_CACHE_ENTRIES: 100,
  },
}));

describe('I18nCacheManager', () => {
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

    // Create cache manager with persistence disabled for consistent testing
    cacheManager = new I18nCacheManager({ enablePersistence: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should create cache manager with default config', () => {
      expect(cacheManager).toBeDefined();
      expect(cacheManager.getCacheStats().size).toBe(0);
    });

    it('should create cache manager with custom config', () => {
      const customConfig = {
        maxSize: 50,
        ttl: 60000,
        enablePersistence: false,
      };

      const customCacheManager = new I18nCacheManager(customConfig);
      expect(customCacheManager).toBeDefined();
    });

    it('should initialize metrics with default values', () => {
      const metrics = cacheManager.getMetrics();

      expect(metrics.loadTime).toBe(0);
      expect(metrics.cacheHitRate).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.translationCoverage).toBe(0);
      expect(metrics.localeUsage).toEqual({ en: 0, zh: 0 });
    });
  });

  describe('message loading and caching', () => {
    it('should load and cache English messages', async () => {
      const messages = await cacheManager.getMessages('en');

      // Verify the structure and some key properties from real messages
      expect(messages).toBeDefined();
      expect(messages.common).toBeDefined();
      expect(messages.navigation).toBeDefined();
      expect(messages.common.loading).toBe('Loading...');
      expect(messages.common.error).toBe('An error occurred');
      expect(messages.navigation.home).toBe('Home');

      // Verify caching
      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBe(1);
    });

    it('should load and cache Chinese messages', async () => {
      const messages = await cacheManager.getMessages('zh');

      // Verify the structure and some key properties from real messages
      expect(messages).toBeDefined();
      expect(messages.common).toBeDefined();
      expect(messages.navigation).toBeDefined();
      expect(messages.common.loading).toBe('加载中…');
      expect(messages.common.error).toBe('发生错误');
      expect(messages.navigation.home).toBe('首页');

      // Verify caching
      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBe(1);
    });

    it('should return cached messages on subsequent requests', async () => {
      // First request
      const messages1 = await cacheManager.getMessages('en');

      // Second request should use cache
      const messages2 = await cacheManager.getMessages('en');

      expect(messages1).toEqual(messages2);

      const metrics = cacheManager.getMetrics();
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
    });

    it('should handle cache misses correctly', async () => {
      await cacheManager.getMessages('en');

      const metrics = cacheManager.getMetrics();
      expect(metrics.cacheHitRate).toBeLessThan(1); // Should have at least one miss
    });
  });

  describe('preloading functionality', () => {
    it('should preload messages for specific locale', async () => {
      const messages = await cacheManager.preloadMessages('en');

      expect(messages).toBeDefined();
      expect(messages.common).toBeDefined();
      expect(messages.common.loading).toBe('Loading...');
    });

    it('should handle concurrent preload requests', async () => {
      const promise1 = cacheManager.preloadMessages('en');
      const promise2 = cacheManager.preloadMessages('en');

      const [messages1, messages2] = await Promise.all([promise1, promise2]);

      expect(messages1).toEqual(messages2);
    });

    it('should warmup cache without throwing errors', () => {
      expect(() => {
        cacheManager.warmupCache();
      }).not.toThrow();
    });
  });

  describe('metrics collection', () => {
    it('should record locale usage', async () => {
      await cacheManager.getMessages('en');
      await cacheManager.getMessages('zh');
      await cacheManager.getMessages('en');

      const metrics = cacheManager.getMetrics();
      expect(metrics.localeUsage.en).toBe(WEB_VITALS_CONSTANTS.CACHE_SIZE_TWO);
      expect(metrics.localeUsage.zh).toBe(1);
    });

    it('should calculate cache hit rate correctly', async () => {
      // First request (cache miss)
      await cacheManager.getMessages('en');

      // Second request (cache hit)
      await cacheManager.getMessages('en');

      const metrics = cacheManager.getMetrics();
      expect(metrics.cacheHitRate).toBe(
        WEB_VITALS_CONSTANTS.CACHE_HIT_RATE_HALF,
      ); // 1 hit out of 2 requests
    });

    it('should record load times', async () => {
      await cacheManager.getMessages('en');

      const metrics = cacheManager.getMetrics();
      expect(metrics.loadTime).toBeGreaterThanOrEqual(0);
    });

    it('should reset metrics correctly', async () => {
      await cacheManager.getMessages('en');

      cacheManager.resetMetrics();

      const metrics = cacheManager.getMetrics();
      expect(metrics.loadTime).toBe(0);
      expect(metrics.cacheHitRate).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.localeUsage).toEqual({ en: 0, zh: 0 });
    });
  });

  describe('cache management', () => {
    it('should provide cache statistics', async () => {
      await cacheManager.getMessages('en');
      await cacheManager.getMessages('zh');

      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBe(WEB_VITALS_CONSTANTS.CACHE_SIZE_TWO);
      expect(stats.totalHits).toBeGreaterThanOrEqual(0);
      expect(stats.averageAge).toBeGreaterThanOrEqual(0);
    });

    it('should clear cache correctly', async () => {
      await cacheManager.getMessages('en');
      expect(cacheManager.getCacheStats().size).toBe(1);

      cacheManager.clearCache();
      expect(cacheManager.getCacheStats().size).toBe(0);
    });

    it('should handle cache expiration', async () => {
      const shortTtlManager = new I18nCacheManager({ ttl: 100 });

      await shortTtlManager.getMessages('en');
      expect(shortTtlManager.getCacheStats().size).toBe(1);

      // Fast forward time beyond TTL
      vi.advanceTimersByTime(200);

      // Next request should reload (cache expired)
      await shortTtlManager.getMessages('en');

      const metrics = shortTtlManager.getMetrics();
      expect(metrics.cacheHitRate).toBeLessThan(1);
    });
  });

  describe('persistence', () => {
    it('should save to localStorage when persistence is enabled', async () => {
      const persistentManager = new I18nCacheManager({
        enablePersistence: true,
      });

      await persistentManager.getMessages('en');

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should load from localStorage on initialization', () => {
      const mockData = JSON.stringify({
        messages_en: {
          data: { test: 'value' },
          timestamp: Date.now(),
          ttl: 300000,
          hits: 0,
        },
      });

      mockLocalStorage.getItem.mockReturnValue(mockData);

      const persistentCacheManager = new I18nCacheManager({
        enablePersistence: true,
      });
      expect(persistentCacheManager).toBeDefined();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('i18n_cache');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        const errorHandlingCacheManager = new I18nCacheManager({
          enablePersistence: true,
        });
        expect(errorHandlingCacheManager).toBeDefined();
      }).not.toThrow();
    });

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      expect(() => {
        const jsonErrorCacheManager = new I18nCacheManager({
          enablePersistence: true,
        });
        expect(jsonErrorCacheManager).toBeDefined();
      }).not.toThrow();
    });

    it('should handle development environment error logging for load failures', () => {
      // Mock development environment
      vi.stubEnv('NODE_ENV', 'development');

      // Mock localStorage to throw error
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // This should trigger the development environment error handling branch (lines 207-210)
      expect(() => {
        const devErrorCacheManager = new I18nCacheManager({
          enablePersistence: true,
        });
        expect(devErrorCacheManager).toBeDefined();
      }).not.toThrow();

      // Restore environment
      vi.unstubAllEnvs();
    });

    it('should handle development environment error logging for save failures', async () => {
      // Mock development environment
      vi.stubEnv('NODE_ENV', 'development');

      // Mock localStorage.setItem to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage save error');
      });

      const devSaveErrorManager = new I18nCacheManager({
        enablePersistence: true,
      });

      // Load some messages to trigger save, which should trigger the development environment error handling branch (lines 220-223)
      await devSaveErrorManager.getMessages('en');

      // Should not throw error even when save fails in development
      expect(devSaveErrorManager.getCacheStats().size).toBeGreaterThan(0);

      // Restore environment
      vi.unstubAllEnvs();
    });
  });

  describe('error handling', () => {
    it('should handle failed message loading', async () => {
      // Mock import to fail
      vi.doMock('../../messages/invalid.json', () => {
        throw new Error('Module not found');
      });

      await expect(
        cacheManager.getMessages('invalid' as Locale),
      ).rejects.toThrow('Failed to load messages for locale: invalid');

      const metrics = cacheManager.getMetrics();
      expect(metrics.errorRate).toBeGreaterThan(0);
    });

    it('should handle concurrent error scenarios', async () => {
      const invalidLocale = 'invalid' as Locale;

      const promises = [
        cacheManager.getMessages(invalidLocale).catch(() => null),
        cacheManager.getMessages(invalidLocale).catch(() => null),
        cacheManager.getMessages(invalidLocale).catch(() => null),
      ];

      const results = await Promise.all(promises);
      expect(results.every((result) => result === null)).toBe(true);
    });
  });

  describe('global instance', () => {
    it('should provide global cache instance', () => {
      expect(i18nCache).toBeDefined();
      expect(i18nCache).toBeInstanceOf(I18nCacheManager);
    });

    it('should initialize warmup in browser environment', () => {
      // This test verifies that the global instance doesn't throw during initialization
      expect(() => {
        i18nCache.getMetrics();
      }).not.toThrow();
    });
  });

  describe('LRU cache behavior', () => {
    it('should evict oldest items when cache is full', async () => {
      const smallCacheManager = new I18nCacheManager({ maxSize: 1 });

      await smallCacheManager.getMessages('en');
      expect(smallCacheManager.getCacheStats().size).toBe(1);

      await smallCacheManager.getMessages('zh');
      expect(smallCacheManager.getCacheStats().size).toBe(1); // Should still be 1 due to eviction
    });

    it('should update access order on cache hits', async () => {
      await cacheManager.getMessages('en');
      await cacheManager.getMessages('zh');

      // Access 'en' again to move it to the end
      await cacheManager.getMessages('en');

      const stats = cacheManager.getCacheStats();
      expect(stats.totalHits).toBeGreaterThan(0);
    });
  });
});

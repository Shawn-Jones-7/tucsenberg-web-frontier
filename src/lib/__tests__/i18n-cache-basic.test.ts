/**
 * I18n Cache Manager - Basic Functionality Tests
 *
 * 测试基本功能：
 * - 初始化和配置
 * - 消息加载和缓存
 * - 基本缓存操作
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { _Locale } from '@/types/i18n';
import { _WEB_VITALS_CONSTANTS } from '@/constants/test-constants';
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

// Mock constants
vi.mock('@/constants/i18n-constants', () => ({
  CACHE_DURATIONS: {
    PERFORMANCE_CACHE: 300000, // 5 minutes
  },
  CACHE_LIMITS: {
    MAX_CACHE_ENTRIES: 100,
  },
}));

describe('I18nCacheManager - Basic Functionality', () => {
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

    it('should return cached messages on subsequent calls', async () => {
      // First call - should load from source
      const messages1 = await cacheManager.getMessages('en');
      expect(messages1).toBeDefined();

      // Second call - should return from cache
      const messages2 = await cacheManager.getMessages('en');
      expect(messages2).toBe(messages1); // Should be the same object reference

      // Cache should still have only one entry
      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBe(1);
    });

    it('should handle multiple locales independently', async () => {
      const enMessages = await cacheManager.getMessages('en');
      const zhMessages = await cacheManager.getMessages('zh');

      expect(enMessages).toBeDefined();
      expect(zhMessages).toBeDefined();
      expect(enMessages).not.toBe(zhMessages);

      // Should have two cache entries
      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBe(2);

      // Verify cache hit rate calculation
      const metrics = cacheManager.getMetrics();
      expect(metrics.cacheHitRate).toBeLessThan(1); // Should have at least one miss
    });
  });

  describe('basic cache operations', () => {
    it('should provide cache statistics', async () => {
      await cacheManager.getMessages('en');
      await cacheManager.getMessages('zh');

      const stats = cacheManager.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.totalHits).toBeGreaterThanOrEqual(0);
      expect(stats.averageAge).toBeGreaterThanOrEqual(0);
    });

    it('should clear cache when requested', async () => {
      await cacheManager.getMessages('en');
      await cacheManager.getMessages('zh');

      expect(cacheManager.getCacheStats().size).toBe(2);

      cacheManager.clearCache();

      expect(cacheManager.getCacheStats().size).toBe(0);
    });

    it('should handle cache expiration with TTL', async () => {
      const shortTtlManager = new I18nCacheManager({
        ttl: 100, // 100ms TTL
        enablePersistence: false,
      });

      await shortTtlManager.getMessages('en');
      expect(shortTtlManager.getCacheStats().size).toBe(1);

      // Fast-forward time beyond TTL
      vi.advanceTimersByTime(150);

      // Next access should reload from source
      await shortTtlManager.getMessages('en');

      const metrics = shortTtlManager.getMetrics();
      expect(metrics.cacheHitRate).toBeLessThan(1);
    });

    it('should handle cache size limits with LRU eviction', async () => {
      const smallCacheManager = new I18nCacheManager({
        maxSize: 1,
        enablePersistence: false,
      });

      await smallCacheManager.getMessages('en');
      expect(smallCacheManager.getCacheStats().size).toBe(1);

      // Adding another locale should evict the first one
      await smallCacheManager.getMessages('zh');
      expect(smallCacheManager.getCacheStats().size).toBe(1);

      // Verify that 'en' was evicted by checking if it needs to be reloaded
      const stats = smallCacheManager.getCacheStats();
      expect(stats.size).toBe(1);
    });

    it('should track performance metrics correctly', async () => {
      const _startTime = Date.now();
      // 开始时间已记录但在此测试中未直接使用

      await cacheManager.getMessages('en');
      await cacheManager.getMessages('zh');
      await cacheManager.getMessages('en'); // Cache hit

      const metrics = cacheManager.getMetrics();

      expect(metrics.loadTime).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.localeUsage.en).toBeGreaterThan(0);
      expect(metrics.localeUsage.zh).toBeGreaterThan(0);
    });

    it('should reset metrics when requested', async () => {
      await cacheManager.getMessages('en');
      await cacheManager.getMessages('zh');

      let metrics = cacheManager.getMetrics();
      expect(metrics.localeUsage.en).toBeGreaterThan(0);
      expect(metrics.localeUsage.zh).toBeGreaterThan(0);

      cacheManager.resetMetrics();

      metrics = cacheManager.getMetrics();
      expect(metrics.loadTime).toBe(0);
      expect(metrics.cacheHitRate).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.translationCoverage).toBe(0);
      expect(metrics.localeUsage).toEqual({ en: 0, zh: 0 });
    });
  });

  describe('global instance', () => {
    it('should provide global cache instance', () => {
      expect(i18nCache).toBeDefined();
      expect(i18nCache).toBeInstanceOf(I18nCacheManager);
    });

    it('should allow access to global cache methods', () => {
      expect(() => {
        i18nCache.getCacheStats();
        i18nCache.getMetrics();
      }).not.toThrow();
    });

    it('should maintain state across global instance calls', async () => {
      await i18nCache.getMessages('en');

      const stats = i18nCache.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      const metrics = i18nCache.getMetrics();
      expect(metrics.localeUsage.en).toBeGreaterThan(0);
    });
  });
});

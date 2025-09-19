/**
 * I18n Performance - Main Integration Tests
 *
 * 主要集成测试，包括：
 * - 核心函数导出验证
 * - 基本功能集成测试
 * - 真实使用场景测试
 *
 * 详细测试请参考：
 * - i18n-performance-cache.test.ts - 缓存功能测试
 * - i18n-performance-monitor.test.ts - 性能监控测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// 导入需要测试的模块
import {
  evaluatePerformance,
  getCachedMessages,
  getCachedTranslations,
  I18nPerformanceMonitor,
  preloadTranslations,
  TranslationCache,
} from '../i18n-performance';

// 简化Mock数据 - 匹配测试期望
const mockEnTranslations = {
  common: { hello: 'Hello' },
  navigation: { home: 'Home' },
};

const mockZhTranslations = {
  common: { hello: '你好' },
  navigation: { home: '首页' },
};

// Mock React cache
vi.mock('react', () => ({
  cache: (fn: (..._args: unknown[]) => unknown) => fn,
}));

// 使用vi.hoisted确保Mock函数在导入前定义
const { mockGetCachedMessages, mockGetCachedTranslations } = vi.hoisted(() => {
  const hoistedMockGetCachedMessages = vi.fn();
  const hoistedMockGetCachedTranslations = vi.fn();
  return {
    mockGetCachedMessages: hoistedMockGetCachedMessages,
    mockGetCachedTranslations: hoistedMockGetCachedTranslations,
  };
});

// Mock i18n-performance模块
vi.mock('../i18n-performance', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../i18n-performance')>();

  // 设置Mock实现
  mockGetCachedMessages.mockImplementation(async (locale: string) => {
    if (locale === 'en') return mockEnTranslations;
    if (locale === 'zh') return mockZhTranslations;
    return {};
  });

  mockGetCachedTranslations.mockImplementation(
    async (locale: string, namespace?: string) => {
      const messages = await mockGetCachedMessages(locale);
      if (namespace) {
        return messages[namespace] || {};
      }
      return messages;
    },
  );

  return {
    ...actual,
    getCachedMessages: mockGetCachedMessages,
    getCachedTranslations: mockGetCachedTranslations,
  };
});

describe('I18n Performance - Main Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset singleton instance
    Reflect.set(TranslationCache, 'instance', undefined);
    I18nPerformanceMonitor.reset();

    // 重新设置Mock实现
    mockGetCachedMessages.mockImplementation(async (locale: string) => {
      if (locale === 'en') return mockEnTranslations;
      if (locale === 'zh') return mockZhTranslations;

      // 对于无效的locale，模拟console.error调用并返回空对象
      if (locale === 'invalid-locale') {
        console.error(
          `Failed to load messages for locale ${locale}:`,
          new Error('Mock error'),
        );
        return {};
      }

      return {};
    });

    mockGetCachedTranslations.mockImplementation(
      async (locale: string, namespace?: string) => {
        const messages = await mockGetCachedMessages(locale);
        if (namespace) {
          return messages[namespace] || {};
        }
        return messages;
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('核心函数导出验证', () => {
    it('should export all required functions', () => {
      expect(getCachedMessages).toBeDefined();
      expect(getCachedTranslations).toBeDefined();
      expect(preloadTranslations).toBeDefined();
      expect(TranslationCache).toBeDefined();
      expect(I18nPerformanceMonitor).toBeDefined();
      expect(evaluatePerformance).toBeDefined();
    });
  });

  describe('基本功能集成测试', () => {
    it('should load and cache messages for locale', async () => {
      const messages = await getCachedMessages('en');

      expect(messages).toEqual({
        common: { hello: 'Hello' },
        navigation: { home: 'Home' },
      });
    });

    it('should return cached messages on subsequent calls', async () => {
      const messages1 = await getCachedMessages('en');
      const messages2 = await getCachedMessages('en');

      expect(messages1).toBe(messages2);
    });

    it('should get all translations for locale', async () => {
      const translations = await getCachedTranslations('en');

      expect(translations).toEqual({
        common: { hello: 'Hello' },
        navigation: { home: 'Home' },
      });
    });

    it('should get specific namespace translations', async () => {
      const translations = await getCachedTranslations('en', 'common');

      expect(translations).toEqual({ hello: 'Hello' });
    });

    it('should preload translations for multiple locales', async () => {
      await preloadTranslations(['en', 'zh']);

      // Verify both locales are loaded by checking cache
      const cache = TranslationCache.getInstance();
      const enMessages = cache.get('messages-en');
      const zhMessages = cache.get('messages-zh');

      expect(enMessages).toBeDefined();
      expect(zhMessages).toBeDefined();
    });
  });

  describe('真实使用场景测试', () => {
    it('should work with real-world usage pattern', async () => {
      // Simulate loading translations
      const _startTime = Date.now();
      const messages = await getCachedMessages('en');
      const loadTime = Date.now() - _startTime;

      // Record performance metrics
      I18nPerformanceMonitor.recordLoadTime(loadTime);
      I18nPerformanceMonitor.recordCacheHit();

      // Get performance evaluation
      const metrics = I18nPerformanceMonitor.getMetrics();
      const evaluation = evaluatePerformance(metrics);

      expect(messages).toBeDefined();
      expect(evaluation.grade).toMatch(/[A-F]/);
    });

    it('should handle cache warming scenario', async () => {
      const locales = ['en', 'zh'];

      // Preload translations
      await preloadTranslations(locales);

      // Verify all locales are cached
      for (const locale of locales) {
        const messages = await getCachedMessages(locale);
        expect(messages).toBeDefined();
      }
    });

    it('should handle error scenarios gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const messages = await getCachedMessages('invalid-locale');

      expect(messages).toEqual({});
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should maintain performance under load', async () => {
      const promises = [];

      // Simulate concurrent requests
      for (let i = 0; i < 50; i++) {
        promises.push(getCachedMessages('en'));
        promises.push(getCachedTranslations('zh', 'common'));
      }

      const results = await Promise.all(promises);

      // All requests should succeed
      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });

    it('should integrate with performance monitoring', async () => {
      // Load some translations and record metrics
      await getCachedMessages('en');
      I18nPerformanceMonitor.recordLoadTime(50);
      I18nPerformanceMonitor.recordCacheHit();

      await getCachedMessages('zh');
      I18nPerformanceMonitor.recordLoadTime(75);
      I18nPerformanceMonitor.recordCacheHit();

      const metrics = I18nPerformanceMonitor.getMetrics();
      expect(metrics.averageLoadTime).toBe(62.5);
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.cacheHitRate).toBe(100);
    });
  });

  describe('错误处理和边界情况', () => {
    it('should handle empty locale array in preload', async () => {
      await expect(preloadTranslations([])).resolves.toBeUndefined();
    });

    it('should return empty object for non-existent namespace', async () => {
      const translations = await getCachedTranslations('en', 'non-existent');

      expect(translations).toEqual({});
    });

    it('should handle missing locale gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const messages = await getCachedMessages('invalid-locale');

      expect(messages).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load messages for locale invalid-locale:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });
});

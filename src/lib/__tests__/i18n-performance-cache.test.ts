/**
 * I18n Performance - Cache Tests
 *
 * 专门测试缓存功能，包括：
 * - TranslationCache 单例模式
 * - 缓存存储和检索
 * - LRU 淘汰策略
 * - 缓存过期处理
 * - 缓存统计信息
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslationCache } from '@/lib/i18n-performance';

describe('I18n Performance - Cache Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset singleton实例供测试使用
    Reflect.set(TranslationCache, 'instance', undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('TranslationCache', () => {
    it('should create singleton instance', () => {
      const instance1 = TranslationCache.getInstance();
      const instance2 = TranslationCache.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should cache and retrieve values', () => {
      const cache = TranslationCache.getInstance();
      const testValue = { test: 'value' };

      cache.set('test-key', testValue);
      const retrieved = cache.get('test-key');

      expect(retrieved).toEqual(testValue);
    });

    it('should return null for non-existent keys', () => {
      const cache = TranslationCache.getInstance();
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should handle cache expiration', () => {
      const cache = TranslationCache.getInstance();
      const testValue = { test: 'value' };

      cache.set('test-key', testValue);

      // Fast-forward time to expire the cache
      vi.advanceTimersByTime(60 * 60 * 1000); // 1 hour

      const result = cache.get('test-key');
      expect(result).toBeNull();
    });

    it('should implement LRU eviction when cache is full', () => {
      const cache = TranslationCache.getInstance();

      // Fill cache to max capacity + 1 to trigger eviction
      // MAX_PERFORMANCE_DATA_POINTS is 1000, so we add 1001 items
      for (let i = 0; i < 1001; i++) {
        cache.set(`key-${i}`, `value-${i}`);
      }

      // First key should be evicted (LRU)
      const firstValue = cache.get('key-0');
      expect(firstValue).toBeNull();

      // Last key should still exist
      const lastValue = cache.get('key-1000');
      expect(lastValue).toBe('value-1000');
    });

    it('should cleanup expired entries', () => {
      const cache = TranslationCache.getInstance();

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // Fast-forward time to expire entries
      vi.advanceTimersByTime(60 * 60 * 1000); // 1 hour

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should provide cache statistics', () => {
      const cache = TranslationCache.getInstance();

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // Trigger some hits and misses
      cache.get('key1'); // hit
      cache.get('non-existent'); // miss

      const stats = cache.getStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
      expect(stats.size).toBe(2);
    });

    it('should handle concurrent access gracefully', () => {
      const cache = TranslationCache.getInstance();

      // Simulate concurrent access
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            cache.set(`concurrent-key-${i}`, `value-${i}`);
            const value = cache.get(`concurrent-key-${i}`);
            expect(value).toBe(`value-${i}`);
            resolve();
          }),
        );
      }

      return Promise.all(promises);
    });

    it('should handle memory pressure scenarios', () => {
      const cache = TranslationCache.getInstance();

      // Add many large objects to test memory handling
      for (let i = 0; i < 500; i++) {
        const largeObject = {
          id: i,
          data: new Array(1000).fill(`data-${i}`),
          metadata: {
            created: Date.now(),
            size: 1000,
          },
        };
        cache.set(`large-key-${i}`, largeObject);
      }

      // Cache should still function correctly
      const testValue = cache.get('large-key-100');
      expect(testValue).toBeDefined();
      if (testValue && typeof testValue === 'object') {
        expect((testValue as { id: number }).id).toBe(100);
      } else {
        throw new Error('缓存未返回预期的对象结构');
      }
    });

    it('should handle edge cases with null and undefined values', () => {
      const cache = TranslationCache.getInstance();

      // Test with null value
      cache.set('null-key', null);
      expect(cache.get('null-key')).toBeNull();

      // Test with undefined value
      cache.set('undefined-key', undefined);
      expect(cache.get('undefined-key')).toBeUndefined();

      // Test with empty object
      cache.set('empty-key', {});
      expect(cache.get('empty-key')).toEqual({});
    });

    it('should maintain cache integrity during rapid operations', () => {
      const cache = TranslationCache.getInstance();

      // Rapid set/get operations
      for (let i = 0; i < 1000; i++) {
        cache.set(`rapid-key-${i}`, `value-${i}`);
        if (i % 2 === 0) {
          cache.get(`rapid-key-${i}`);
        }
      }

      // Verify cache is still functional
      const stats = cache.getStats();
      expect(stats.size).toBeGreaterThan(0);
    });
  });
});

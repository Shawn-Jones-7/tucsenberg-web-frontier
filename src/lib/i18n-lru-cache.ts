/**
 * LRU (Least Recently Used) 缓存实现
 *
 * 提供高性能的 LRU 缓存，支持 TTL、持久化存储和性能监控
 */

import { COUNT_4, MAGIC_32, MAGIC_8 } from "@/constants/count";
import { COUNT_PAIR, ONE, PERCENTAGE_FULL, ZERO } from '@/constants';

import { logger } from '@/lib/logger';
import type {
  CacheConfig,
  CacheItem,
  CacheStats,
  CacheStorage,
  MetricsCollector
} from '@/lib/i18n-cache-types';

// LRU 缓存实现
export class LRUCache<T> implements CacheStorage<T> {
  private cache = new Map<string, CacheItem<T>>();
  private config: CacheConfig;
  private metricsCollector: MetricsCollector;

  constructor(config: CacheConfig, metricsCollector: MetricsCollector) {
    this.config = config;
    this.metricsCollector = metricsCollector;

    if (config.enablePersistence && typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  // 获取缓存项
  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.metricsCollector.recordCacheMiss();
      this.emitEvent('miss', key);
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.metricsCollector.recordCacheMiss();
      this.emitEvent('expire', key, item.data);
      return null;
    }

    // 更新访问顺序 (LRU)
    this.cache.delete(key);
    item.hits += ONE;
    this.cache.set(key, item);

    this.metricsCollector.recordCacheHit();
    this.emitEvent('hit', key, item.data);
    return item.data;
  }

  // 设置缓存项
  set(key: string, value: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        const removedItem = this.cache.get(firstKey);
        this.cache.delete(firstKey);
        this.emitEvent('delete', firstKey, removedItem?.data);
      }
    }

    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
      hits: ZERO,
    };

    this.cache.set(key, item);
    this.emitEvent('set', key, value);

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
  }

  // 检查是否存在
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // 删除缓存项
  delete(key: string): boolean {
    const item = this.cache.get(key);
    const deleted = this.cache.delete(key);

    if (deleted) {
      this.emitEvent('delete', key, item?.data);
      if (this.config.enablePersistence) {
        this.saveToStorage();
      }
    }

    return deleted;
  }

  // 清空缓存
  clear(): void {
    this.cache.clear();
    this.emitEvent('clear');

    if (this.config.enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem(this.config.storageKey);
    }
  }

  // 获取缓存大小
  size(): number {
    return this.cache.size;
  }

  // 获取所有键
  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  // 获取所有值
  values(): IterableIterator<T> {
    return Array.from(this.cache.values())
      .map((item) => item.data)
      [Symbol.iterator]();
  }

  // 获取所有条目
  entries(): IterableIterator<[string, T]> {
    const entries = Array.from(this.cache.entries()).map(
      ([key, item]) => [key, item.data] as [string, T],
    );
    return entries[Symbol.iterator]();
  }

  // 获取缓存统计信息
  getStats(): CacheStats {
    const items = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      totalHits: items.reduce((sum, item) => sum + item.hits, ZERO),
      averageAge:
        items.length > ZERO
          ? items.reduce(
              (sum, item) => sum + (Date.now() - item.timestamp),
              0,
            ) / items.length
          : ZERO,
    };
  }

  // 获取详细统计信息
  getDetailedStats() {
    const items = Array.from(this.cache.values());
    const now = Date.now();

    const ages = items.map((item) => now - item.timestamp);
    const hits = items.map((item) => item.hits);
    const ttls = items.map((item) => item.ttl);

    return {
      ...this.getStats(),
      memoryUsage: this.estimateMemoryUsage(),
      ageDistribution: {
        min: Math.min(...ages),
        max: Math.max(...ages),
        median: this.calculateMedian(ages),
        average:
          ages.length > ZERO ? ages.reduce((a, b) => a + b, ZERO) / ages.length : ZERO,
      },
      hitDistribution: {
        min: Math.min(...hits),
        max: Math.max(...hits),
        median: this.calculateMedian(hits),
        average:
          hits.length > ZERO ? hits.reduce((a, b) => a + b, ZERO) / hits.length : ZERO,
      },
      ttlDistribution: {
        min: Math.min(...ttls),
        max: Math.max(...ttls),
        median: this.calculateMedian(ttls),
        average:
          ttls.length > ZERO ? ttls.reduce((a, b) => a + b, ZERO) / ttls.length : ZERO,
      },
      expiredItems: items.filter((item) => now - item.timestamp > item.ttl)
        .length,
      utilizationRate: (this.cache.size / this.config.maxSize) * PERCENTAGE_FULL,
    };
  }

  // 清理过期项
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = ZERO;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        this.emitEvent('expire', key, item.data);
        cleanedCount += ONE;
      }
    }

    if (cleanedCount > ZERO && this.config.enablePersistence) {
      this.saveToStorage();
    }

    return cleanedCount;
  }

  // 预热缓存
  warmup(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  // 批量获取
  getMultiple(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>();
    keys.forEach((key) => {
      result.set(key, this.get(key));
    });
    return result;
  }

  // 批量设置
  setMultiple(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  // 批量删除
  deleteMultiple(keys: string[]): number {
    let deletedCount = ZERO;
    keys.forEach((key) => {
      if (this.delete(key)) {
        deletedCount += ONE;
      }
    });
    return deletedCount;
  }

  // 从存储加载
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data && typeof data === 'object') {
          const allowedKey = /^[a-z0-9:_-]+$/i;
          Object.entries(data).forEach(([key, item]) => {
            if (typeof key === 'string' && allowedKey.test(key)) {
              if (this.isValidCacheItem(item)) {
                this.cache.set(key, item as CacheItem<T>);
              }
            }
          });
        }
      }
    } catch (error) {
      // Use centralized logger to avoid console noise in production
      logger.warn('Failed to load cache from storage:', error as unknown);
    }
  }

  // 保存到存储
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      logger.warn('Failed to save cache to storage:', error as unknown);
    }
  }

  // 验证缓存项
  private isValidCacheItem(item: unknown): boolean {
    return (
      typeof item === 'object' &&
      item !== null &&
      'data' in item &&
      'timestamp' in item &&
      'ttl' in item &&
      'hits' in item
    );
  }

  // 估算内存使用量
  private estimateMemoryUsage(): number {
    let totalSize = ZERO;

    for (const [key, item] of this.cache.entries()) {
      // 估算键的大小
      totalSize += key.length * COUNT_PAIR; // UTF-16 字符

      // 估算值的大小
      totalSize += this.estimateObjectSize(item.data);

      // 估算缓存项元数据的大小
      totalSize += MAGIC_32; // timestamp, ttl, hits 等
    }

    return totalSize;
  }

  // 估算对象大小
  private estimateObjectSize(obj: unknown): number {
    if (obj === null || obj === undefined) return ZERO;

    if (typeof obj === 'string') {
      return obj.length * COUNT_PAIR; // UTF-16
    }

    if (typeof obj === 'number') {
      return MAGIC_8; // 64-bit number
    }

    if (typeof obj === 'boolean') {
      return COUNT_4;
    }

    if (Array.isArray(obj)) {
      return obj.reduce((sum, item) => sum + this.estimateObjectSize(item), ZERO);
    }

    if (typeof obj === 'object') {
      return Object.entries(obj).reduce((sum, [key, value]) => {
        return sum + key.length * COUNT_PAIR + this.estimateObjectSize(value);
      }, ZERO);
    }

    return ZERO;
  }

  // 计算中位数
  private calculateMedian(numbers: number[]): number {
    if (numbers.length === ZERO) return ZERO;

    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % COUNT_PAIR === ZERO
      ? (((sorted.at(mid - ONE) ?? ZERO) + (sorted.at(mid) ?? ZERO)) /
          COUNT_PAIR)
      : (sorted.at(mid) ?? ZERO);
  }

  // 发出事件
  private emitEvent(_type: string, _key?: string, _data?: T): void {
    // 这里可以添加事件发射逻辑
    // 由于 MetricsCollector 已经处理了基本事件，这里主要用于扩展
    // TODO: 实现事件发射逻辑
    // 当前暂时不创建事件对象，避免未使用变量警告
    // no-op placeholder for future event pipeline
  }
}

// 创建 LRU 缓存实例的工厂函数
export function createLRUCache<T>(
  config: CacheConfig,
  metricsCollector: MetricsCollector,
): LRUCache<T> {
  return new LRUCache<T>(config, metricsCollector);
}

// 导出类型别名
export type { LRUCache as Cache };

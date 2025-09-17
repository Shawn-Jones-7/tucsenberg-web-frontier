/**
 * 国际化缓存工具函数
 * I18n Cache Utility Functions
 *
 * 提供缓存系统所需的工具函数、验证器和辅助方法
 */

import { COUNT_100000, COUNT_256, MAGIC_9 } from "@/constants/count";
import { ANIMATION_DURATION_VERY_SLOW, BYTES_PER_KB, COUNT_PAIR, COUNT_TEN, HOURS_PER_DAY, ONE, SECONDS_PER_MINUTE, ZERO } from "@/constants/magic-numbers";
import type { AdvancedCacheConfig } from '@/lib/i18n-cache-types-advanced';
import type { Locale } from '@/types/i18n';
import type {
  CacheConfig,
  CacheConfigValidation,
  CacheEvent,
  CacheEventType,
  CacheItem,
  CacheStats,
} from './i18n-cache-types-base';

/**
 * 缓存键工具函数
 * Cache key utility functions
 */
export const CacheKeyUtils = {
  /**
   * 创建缓存键
   * Create cache key
   */
  create(locale: Locale, namespace?: string, key?: string): string {
    const parts: string[] = [locale];
    if (namespace) parts.push(namespace);
    if (key) parts.push(key);
    return parts.join(':');
  },

  /**
   * 解析缓存键
   * Parse cache key
   */
  parse(cacheKey: string): {
    locale: Locale;
    namespace?: string;
    key?: string;
  } {
    const parts = cacheKey.split(':');
    return {
      locale: parts[ZERO] as Locale,
      ...(parts[ONE] && { namespace: parts[ONE] }),
      ...(parts[COUNT_PAIR] && { key: parts[COUNT_PAIR] }),
    };
  },

  /**
   * 验证缓存键格式
   * Validate cache key format
   */
  validate(key: string): boolean {
    return typeof key === 'string' && key.length > ZERO && key.length <= COUNT_256;
  },

  /**
   * 标准化缓存键
   * Normalize cache key
   */
  normalize(key: string): string {
    return key
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9:_-]/g, '_');
  },

  /**
   * 生成通配符模式
   * Generate wildcard pattern
   */
  createPattern(locale?: Locale, namespace?: string): string {
    const parts: string[] = [];
    if (locale) parts.push(locale);
    else parts.push('*');
    if (namespace) parts.push(namespace);
    else parts.push('*');
    parts.push('*');
    return parts.join(':');
  },
} as const;

/**
 * 缓存时间工具函数
 * Cache time utility functions
 */
export const CacheTimeUtils = {
  /**
   * 检查是否过期
   * Check if expired
   */
  isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
  },

  /**
   * 计算剩余时间
   * Calculate remaining time
   */
  getRemainingTime(timestamp: number, ttl: number): number {
    const elapsed = Date.now() - timestamp;
    return Math.max(ZERO, ttl - elapsed);
  },

  /**
   * 格式化时间
   * Format time
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / ANIMATION_DURATION_VERY_SLOW);
    const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
    const hours = Math.floor(minutes / SECONDS_PER_MINUTE);
    const days = Math.floor(hours / HOURS_PER_DAY);

    if (days > ZERO) return `${days}d ${hours % HOURS_PER_DAY}h`;
    if (hours > ZERO) return `${hours}h ${minutes % SECONDS_PER_MINUTE}m`;
    if (minutes > ZERO) return `${minutes}m ${seconds % SECONDS_PER_MINUTE}s`;
    return `${seconds}s`;
  },

  /**
   * 解析时间字符串
   * Parse time string
   */
  parseTimeString(timeStr: string): number {
    const units: Record<string, number> = {
      ms: ONE,
      s: ANIMATION_DURATION_VERY_SLOW,
      m: SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
      h: SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
      d: HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW,
    };

    const match = timeStr.match(/^(\d+)(ms|s|m|h|d)$/);
    if (!match) throw new Error(`Invalid time format: ${timeStr}`);

    const [, value, unit] = match;
    if (!value || !unit) throw new Error(`Invalid time format: ${timeStr}`);
    return parseInt(value, COUNT_TEN) * (units[unit as keyof typeof units] || ONE);
  },
} as const;

/**
 * 缓存大小工具函数
 * Cache size utility functions
 */
export const CacheSizeUtils = {
  /**
   * 估算对象大小
   * Estimate object size
   */
  estimateSize(obj: unknown): number {
    try {
      return new Blob([JSON.stringify(obj)]).size;
    } catch {
      return ZERO;
    }
  },

  /**
   * 格式化字节大小
   * Format byte size
   */
  formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = ZERO;

    while (size >= BYTES_PER_KB && unitIndex < units.length - ONE) {
      size /= BYTES_PER_KB;
      unitIndex += ONE;
    }

    return `${size.toFixed(COUNT_PAIR)} ${units[unitIndex]}`;
  },

  /**
   * 解析大小字符串
   * Parse size string
   */
  parseSize(sizeStr: string): number {
    const units: Record<string, number> = {
      B: ONE,
      KB: BYTES_PER_KB,
      MB: BYTES_PER_KB * BYTES_PER_KB,
      GB: BYTES_PER_KB * BYTES_PER_KB * BYTES_PER_KB,
      TB: BYTES_PER_KB * BYTES_PER_KB * BYTES_PER_KB * BYTES_PER_KB,
    };

    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
    if (!match) throw new Error(`Invalid size format: ${sizeStr}`);

    const [, value, unit] = match;
    if (!value || !unit) throw new Error(`Invalid size format: ${sizeStr}`);
    return (
      parseFloat(value) * (units[unit.toUpperCase() as keyof typeof units] || ONE)
    );
  },
} as const;

/**
 * 缓存统计工具函数
 * Cache statistics utility functions
 */
export const CacheStatsUtils = {
  /**
   * 计算命中率
   * Calculate hit rate
   */
  calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses;
    return total > ZERO ? hits / total : ZERO;
  },

  /**
   * 计算平均年龄
   * Calculate average age
   */
  calculateAverageAge(items: Array<{ timestamp: number }>): number {
    if (items.length === ZERO) return ZERO;
    const now = Date.now();
    const totalAge = items.reduce(
      (sum, item) => sum + (now - item.timestamp),
      ZERO,
    );
    return totalAge / items.length;
  },

  /**
   * 生成统计报告
   * Generate statistics report
   */
  generateReport(stats: CacheStats): string {
    return `Cache Statistics:
- Size: ${stats.size} items
- Total Hits: ${stats.totalHits}
- Average Age: ${CacheTimeUtils.formatDuration(stats.averageAge)}`;
  },

  /**
   * 比较统计数据
   * Compare statistics
   */
  compareStats(
    before: CacheStats,
    after: CacheStats,
  ): {
    sizeDiff: number;
    hitsDiff: number;
    ageDiff: number;
  } {
    return {
      sizeDiff: after.size - before.size,
      hitsDiff: after.totalHits - before.totalHits,
      ageDiff: after.averageAge - before.averageAge,
    };
  },
} as const;

/**
 * 缓存验证工具函数
 * Cache validation utility functions
 */
export const CacheValidationUtils = {
  /**
   * 验证缓存项
   * Validate cache item
   */
  validateItem<T>(item: unknown): item is CacheItem<T> {
    return (
      typeof item === 'object' &&
      item !== null &&
      'data' in item &&
      'timestamp' in item &&
      'ttl' in item &&
      'hits' in item &&
      typeof (item as CacheItem<T>).timestamp === 'number' &&
      typeof (item as CacheItem<T>).ttl === 'number' &&
      typeof (item as CacheItem<T>).hits === 'number'
    );
  },

  /**
   * 验证缓存配置
   * Validate cache configuration
   */
  validateConfig(config: Partial<CacheConfig>): CacheConfigValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.maxSize !== undefined) {
      if (typeof config.maxSize !== 'number' || config.maxSize < ONE) {
        errors.push('maxSize must be a positive number');
      } else if (config.maxSize > COUNT_100000) {
        warnings.push('maxSize is very large, consider reducing it');
      }
    }

    if (config.ttl !== undefined) {
      if (typeof config.ttl !== 'number' || config.ttl < ZERO) {
        errors.push('ttl must be a non-negative number');
      } else if (config.ttl > HOURS_PER_DAY * SECONDS_PER_MINUTE * SECONDS_PER_MINUTE * ANIMATION_DURATION_VERY_SLOW) {
        warnings.push('ttl is very long (>24h), consider reducing it');
      }
    }

    if (config.storageKey !== undefined) {
      if (
        typeof config.storageKey !== 'string' ||
        config.storageKey.length === ZERO
      ) {
        errors.push('storageKey must be a non-empty string');
      }
    }

    if (config.enablePersistence !== undefined) {
      if (typeof config.enablePersistence !== 'boolean') {
        errors.push('enablePersistence must be a boolean');
      }
    }

    return {
      isValid: errors.length === ZERO,
      errors,
      warnings,
    };
  },

  /**
   * 验证高级配置
   * Validate advanced configuration
   */
  validateAdvancedConfig(
    config: Partial<AdvancedCacheConfig>,
  ): CacheConfigValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证基础配置
    const baseValidation = this.validateConfig(config);
    errors.push(...baseValidation.errors);
    warnings.push(...baseValidation.warnings);

    // 验证压缩配置
    if (config.compression) {
      if (
        config.compression.enableCompression &&
        config.compression.threshold < ZERO
      ) {
        errors.push('compression threshold must be non-negative');
      }
      if (
        config.compression.level !== undefined &&
        (config.compression.level < ONE || config.compression.level > MAGIC_9)
      ) {
        errors.push('compression level must be between 1 and 9');
      }
    }

    // 验证性能配置
    if (config.performance) {
      if (
        config.performance.maxConcurrentLoads !== undefined &&
        config.performance.maxConcurrentLoads < ONE
      ) {
        errors.push('maxConcurrentLoads must be at least 1');
      }
      if (
        config.performance.loadTimeout !== undefined &&
        config.performance.loadTimeout < ANIMATION_DURATION_VERY_SLOW
      ) {
        warnings.push(
          'loadTimeout is very short (<1s), consider increasing it',
        );
      }
    }

    return {
      isValid: errors.length === ZERO,
      errors,
      warnings,
    };
  },
} as const;

/**
 * 缓存序列化工具函数
 * Cache serialization utility functions
 */
export const CacheSerializationUtils = {
  /**
   * 序列化数据
   * Serialize data
   */
  serialize(data: unknown): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      throw new Error(
        `Serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },

  /**
   * 反序列化数据
   * Deserialize data
   */
  deserialize<T>(data: string): T {
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      throw new Error(
        `Deserialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },

  /**
   * 安全序列化
   * Safe serialize
   */
  safeSerialize(data: unknown, fallback = '{}'): string {
    try {
      return JSON.stringify(data);
    } catch {
      return fallback;
    }
  },

  /**
   * 安全反序列化
   * Safe deserialize
   */
  safeDeserialize<T>(data: string, fallback: T): T {
    try {
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  },
} as const;

/**
 * 缓存事件工具函数
 * Cache event utility functions
 */
export const CacheEventUtils = {
  /**
   * 创建缓存事件
   * Create cache event
   */
  createEvent<T>(type: string, data?: T, key?: string): CacheEvent<T> {
    return {
      type: type as CacheEventType,
      timestamp: Date.now(),
      ...(key && { key }),
      ...(data && { data }),
    };
  },

  /**
   * 过滤事件
   * Filter events
   */
  filterEvents<T>(
    events: CacheEvent<T>[],
    type?: string,
    timeRange?: { start: number; end: number },
  ): CacheEvent<T>[] {
    return events.filter((event) => {
      if (type && event.type !== type) return false;
      if (
        timeRange &&
        (event.timestamp < timeRange.start || event.timestamp > timeRange.end)
      )
        return false;
      return true;
    });
  },

  /**
   * 聚合事件统计
   * Aggregate event statistics
   */
  aggregateEvents<T>(events: CacheEvent<T>[]): Record<string, number> {
    const stats: Record<string, number> = {};
    events.forEach((event) => {
      stats[event.type] = (stats[event.type] || ZERO) + ONE;
    });
    return stats;
  },
} as const;

/**
 * 缓存调试工具函数
 * Cache debug utility functions
 */
export const CacheDebugUtils = {
  /**
   * 生成调试信息
   * Generate debug information
   */
  generateDebugInfo(cache: unknown): Record<string, unknown> {
    return {
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      memoryUsage: process.memoryUsage?.(),
      cacheInfo: cache,
    };
  },

  /**
   * 格式化调试输出
   * Format debug output
   */
  formatDebugOutput(info: Record<string, unknown>): string {
    return JSON.stringify(info, null, COUNT_PAIR);
  },

  /**
   * 创建性能标记
   * Create performance mark
   */
  mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  /**
   * 测量性能
   * Measure performance
   */
  measure(name: string, startMark: string, endMark?: string): number {
    if (typeof performance !== 'undefined' && performance.measure) {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      return entries.length > ZERO
        ? (entries[entries.length - ONE]?.duration ?? ZERO)
        : ZERO;
    }
    return ZERO;
  },
} as const;

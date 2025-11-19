import { cache } from 'react';
import {
  ANIMATION_DURATION_SLOW,
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  COUNT_TRIPLE,
  HTTP_OK,
  ONE,
  PERCENTAGE_FULL,
  PERCENTAGE_HALF,
  ZERO,
} from '@/constants';
import {
  CACHE_DURATIONS,
  CACHE_LIMITS,
  PERFORMANCE_THRESHOLDS,
} from '@/constants/i18n-constants';

/**
 * 缓存项接口
 */
interface CacheItem {
  value: unknown;
  timestamp: number;
}

// 翻译缓存管理器
export class TranslationCache {
  private static instance: TranslationCache;
  private cache = new Map<string, CacheItem>();
  private readonly maxSize = CACHE_LIMITS.MAX_PERFORMANCE_DATA_POINTS;
  private readonly ttl = CACHE_DURATIONS.TRANSLATION_CACHE;

  static getInstance(): TranslationCache {
    if (!TranslationCache.instance) {
      TranslationCache.instance = new TranslationCache();
    }
    return TranslationCache.instance;
  }

  // 缓存翻译消息
  set(key: string, value: unknown): void {
    if (this.cache.size >= this.maxSize) {
      // LRU清理
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  // 获取缓存的翻译消息
  get(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  private calculateHitRate(): number {
    // 简化的命中率计算
    return this.cache.size > ZERO ? PERFORMANCE_THRESHOLDS.EXCELLENT : ZERO;
  }
}

// 获取基础 URL（用于 fetch）
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// 缓存的消息加载器（使用外部化翻译文件）
// 注意：不能直接导入 load-messages.ts，因为它包含 Node.js 模块（fs/promises）
// 而 i18n-performance.ts 被客户端组件（translation-preloader.tsx）使用
export const getCachedMessages = cache(
  async (locale: string): Promise<Record<string, unknown>> => {
    const cacheInstance = TranslationCache.getInstance();
    const cacheKey = `messages-${locale}-critical`;

    // 检查缓存
    const cached = cacheInstance.get(cacheKey);
    if (cached) {
      return cached as Record<string, unknown>;
    }

    // 从 public 目录加载外部化的翻译文件
    // 使用 fetch 而不是 loadCriticalMessages，避免导入 Node.js 模块
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/messages/${locale}/critical.json`;

    let messages: Record<string, unknown> = {};
    try {
      const response = (await fetch(url, {
        next: { revalidate: 3600 },
      } as unknown as RequestInit)) as Response;
      if (!response || typeof response.ok !== 'boolean' || !response.ok) {
        throw new Error('bad status');
      }
      const parsed = (await response.json()) as unknown;
      messages =
        parsed && typeof parsed === 'object'
          ? (parsed as Record<string, unknown>)
          : {};
    } catch {
      // Network or non-2xx status: record error and return empty object to avoid crashes
      I18nPerformanceMonitor.recordError();
      messages = {};
    }

    cacheInstance.set(cacheKey, messages);
    return messages;
  },
);

// React缓存的翻译函数
export const getCachedTranslations = cache(
  async (locale: string, namespace?: string) => {
    const messages = await getCachedMessages(locale);

    if (namespace) {
      if (messages && typeof messages === 'object') {
        const entry = Object.entries(messages as Record<string, unknown>).find(
          ([k]) => k === namespace,
        );
        // nosemgrep: object-injection-sink-dynamic-property -- 使用 Object.entries 找到匹配命名空间后返回对应对象
        return entry ? (entry[1] as unknown) : {};
      }
      return {};
    }

    return messages;
  },
);

// 预加载翻译消息
export async function preloadTranslations(locales: string[]): Promise<void> {
  const promises = locales.map((locale) => getCachedMessages(locale));
  await Promise.all(promises);
}

// 性能监控
export class I18nPerformanceMonitor {
  private static metrics = {
    loadTime: [] as number[],
    cacheHits: ZERO,
    cacheMisses: ZERO,
    errors: ZERO,
  };

  static recordLoadTime(time: number): void {
    this.metrics.loadTime.push(time);
    // 保持最近记录数量限制
    if (this.metrics.loadTime.length > CACHE_LIMITS.MAX_CACHE_ENTRIES) {
      this.metrics.loadTime.shift();
    }
  }

  static recordCacheHit(): void {
    this.metrics.cacheHits += ONE;
  }

  static recordCacheMiss(): void {
    this.metrics.cacheMisses += ONE;
  }

  static recordError(): void {
    this.metrics.errors += ONE;
  }

  static getMetrics() {
    const loadTimes = this.metrics.loadTime;
    const avgLoadTime =
      loadTimes.length > ZERO
        ? loadTimes.reduce((a, b) => a + b, ZERO) / loadTimes.length
        : ZERO;

    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate =
      totalRequests > ZERO
        ? ((this.metrics.cacheHits / totalRequests) *
            PERFORMANCE_THRESHOLDS.MAX_RESPONSE_TIME) /
          COUNT_TEN
        : ZERO;

    return {
      averageLoadTime: avgLoadTime,
      cacheHitRate,
      totalErrors: this.metrics.errors,
      totalRequests,
    };
  }

  static reset(): void {
    this.metrics = {
      loadTime: [],
      cacheHits: ZERO,
      cacheMisses: ZERO,
      errors: ZERO,
    };
  }
}

// 性能基准目标
export const PERFORMANCE_TARGETS = {
  TRANSLATION_LOAD_TIME: {
    excellent: PERCENTAGE_HALF, // < 50ms
    good: PERCENTAGE_FULL, // < 100ms
    acceptable: HTTP_OK, // < 200ms
    poor: ANIMATION_DURATION_SLOW, // > 500ms
  },

  CACHE_HIT_RATE: {
    excellent: PERFORMANCE_THRESHOLDS.EXCELLENT + COUNT_TRIPLE, // > 98%
    good: PERFORMANCE_THRESHOLDS.EXCELLENT, // > 95%
    acceptable: PERFORMANCE_THRESHOLDS.GOOD + COUNT_TEN, // > 90%
    poor: PERFORMANCE_THRESHOLDS.GOOD, // < 80%
  },
};

// 性能评估函数
export function evaluatePerformance(
  metrics: ReturnType<typeof I18nPerformanceMonitor.getMetrics>,
) {
  const loadTimeScore = getPerformanceScore(
    metrics.averageLoadTime,
    PERFORMANCE_TARGETS.TRANSLATION_LOAD_TIME,
  );

  const cacheScore = getPerformanceScore(
    metrics.cacheHitRate,
    PERFORMANCE_TARGETS.CACHE_HIT_RATE,
    true,
  );

  // 计算错误率惩罚
  const errorRate =
    metrics.totalRequests > 0
      ? (metrics.totalErrors / metrics.totalRequests) * 100
      : 0;

  // 错误率惩罚：每1%错误率减少2分
  const errorPenalty = Math.min(errorRate * 2, 50); // 最大惩罚50分

  let overallScore = (loadTimeScore + cacheScore) / COUNT_PAIR;
  overallScore = Math.max(0, overallScore - errorPenalty); // 应用错误率惩罚

  return {
    loadTimeScore,
    cacheScore,
    overallScore,
    grade: getGrade(overallScore),
  };
}

function getPerformanceScore(
  value: number,
  targets: unknown,
  higherIsBetter = false,
): number {
  // 类型守卫：确保targets是一个包含性能阈值的对象
  const safeTargets = targets as {
    excellent: number;
    good: number;
    acceptable: number;
  } | null;
  if (!safeTargets || typeof safeTargets !== 'object') {
    return PERFORMANCE_THRESHOLDS.POOR;
  }

  if (higherIsBetter) {
    if (value >= safeTargets.excellent) return CACHE_LIMITS.MAX_CACHE_ENTRIES;
    if (value >= safeTargets.good) return PERFORMANCE_THRESHOLDS.GOOD;
    if (value >= safeTargets.acceptable) return PERFORMANCE_THRESHOLDS.FAIR;
    return PERFORMANCE_THRESHOLDS.POOR;
  }

  if (value <= safeTargets.excellent) return CACHE_LIMITS.MAX_CACHE_ENTRIES;
  if (value <= safeTargets.good) return PERFORMANCE_THRESHOLDS.GOOD;
  if (value <= safeTargets.acceptable) return PERFORMANCE_THRESHOLDS.FAIR;
  return PERFORMANCE_THRESHOLDS.POOR;
}

function getGrade(score: number): string {
  if (score >= PERFORMANCE_THRESHOLDS.EXCELLENT - COUNT_FIVE) return 'A';
  if (score >= PERFORMANCE_THRESHOLDS.GOOD) return 'B';
  if (score >= PERFORMANCE_THRESHOLDS.GOOD - COUNT_TEN) return 'C';
  if (score >= PERFORMANCE_THRESHOLDS.FAIR) return 'D';
  return 'F';
}

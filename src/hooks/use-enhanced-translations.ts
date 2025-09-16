'use client';

/* eslint-disable max-lines-per-function, security/detect-object-injection, no-shadow */
import { useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { I18nPerformanceMonitor } from '@/lib/i18n-performance';

interface UseEnhancedTranslationsOptions {
  namespace?: string;
  fallback?: boolean;
  analytics?: boolean;
  preload?: string[];
}

export function useEnhancedTranslations(
  options: UseEnhancedTranslationsOptions = {},
) {
  const {
    namespace,
    fallback = true,
    analytics = true,
    preload = [],
  } = options;
  const t = useTranslations(namespace);
  const locale = useLocale();

  // 预加载指定的翻译键 - 使用useMemo避免effect中的数据传递
  useMemo(() => {
    if (preload.length > 0) {
      preload.forEach((key) => {
        try {
          t(key);
        } catch {
          // 忽略预加载错误
        }
      });
    }
    return null;
  }, [preload, t]);

  // 增强的翻译函数
  const enhancedT = useCallback(
    (
      key: string,
      values?: Record<
        string,
        string | number | boolean | Record<string, unknown> | unknown[]
      >,
    ) => {
      const startTime = performance.now();

      try {
        const result = t(key, values as any);

        // 记录加载时间
        if (analytics) {
          const loadTime = performance.now() - startTime;
          I18nPerformanceMonitor.recordLoadTime(loadTime);
        }

        // 检查是否使用了回退
        if (result === key && fallback) {
          return `[${locale.toUpperCase()}] ${key}`;
        }

        return result;
      } catch {
        // 记录翻译错误
        if (analytics) {
          I18nPerformanceMonitor.recordError();
        }

        return fallback ? `[ERROR] ${key}` : key;
      }
    },
    [t, locale, fallback, analytics],
  );

  // 批量翻译函数
  const batchT = useCallback(
    (
      keys: string[],
      values?: Record<
        string,
        string | number | boolean | Record<string, unknown> | unknown[]
      >,
    ) => {
      return keys.reduce(
        (acc, key) => {
          acc[key] = enhancedT(key, values);
          return acc;
        },
        {} as Record<string, string>,
      );
    },
    [enhancedT],
  );

  // 条件翻译函数
  const conditionalT = useCallback(
    (
      condition: boolean,
      trueKey: string,
      falseKey: string,
      values?: Record<
        string,
        string | number | boolean | Record<string, unknown> | unknown[]
      >,
    ) => {
      return enhancedT(condition ? trueKey : falseKey, values);
    },
    [enhancedT],
  );

  // 富文本翻译函数
  const richT = useCallback(
    (
      key: string,
      components: Record<string, (chunks: React.ReactNode) => React.ReactNode>,
    ) => {
      try {
        return t.rich(key, components);
      } catch {
        if (analytics) {
          I18nPerformanceMonitor.recordError();
        }
        return fallback ? `[RICH ERROR] ${key}` : key;
      }
    },
    [t, fallback, analytics],
  );

  // 翻译存在检查
  const hasTranslation = useCallback(
    (key: string) => {
      try {
        return t.has(key);
      } catch {
        return false;
      }
    },
    [t],
  );

  // 格式化数字
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      try {
        return new Intl.NumberFormat(locale, options).format(value);
      } catch {
        return value.toString();
      }
    },
    [locale],
  );

  // 格式化日期
  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions) => {
      try {
        return new Intl.DateTimeFormat(locale, options).format(date);
      } catch {
        return date.toISOString();
      }
    },
    [locale],
  );

  // 格式化相对时间
  const formatRelativeTime = useCallback(
    (value: number, unit: Intl.RelativeTimeFormatUnit) => {
      try {
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
          value,
          unit,
        );
      } catch {
        return `${value} ${unit}`;
      }
    },
    [locale],
  );

  // 获取性能指标
  const getPerformanceMetrics = useCallback(() => {
    return I18nPerformanceMonitor.getMetrics();
  }, []);

  return useMemo(
    () => ({
      t: enhancedT,
      batchT,
      conditionalT,
      richT,
      hasTranslation,
      formatNumber,
      formatDate,
      formatRelativeTime,
      getPerformanceMetrics,
      locale,
      namespace,
    }),
    [
      enhancedT,
      batchT,
      conditionalT,
      richT,
      hasTranslation,
      formatNumber,
      formatDate,
      formatRelativeTime,
      getPerformanceMetrics,
      locale,
      namespace,
    ],
  );
}

// 性能监控Hook
export function useI18nPerformance() {
  const getMetrics = useCallback(() => {
    return I18nPerformanceMonitor.getMetrics();
  }, []);

  const resetMetrics = useCallback(() => {
    I18nPerformanceMonitor.reset();
  }, []);

  return {
    getMetrics,
    resetMetrics,
  };
}

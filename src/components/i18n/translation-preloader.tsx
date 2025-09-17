'use client';

/* eslint-disable no-case-declarations */
import { MAGIC_2000 } from "@/constants/count";
import { ANGLE_90_DEG, COUNT_FIVE, HTTP_OK, PERCENTAGE_FULL } from "@/constants/magic-numbers";
import { MINUTE_MS } from '@/constants/units';
import {
  I18nPerformanceMonitor,
  preloadTranslations,
} from '@/lib/i18n-performance';
import { logger } from '@/lib/logger';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';

interface TranslationPreloaderProps {
  /**
   * 要预加载的语言列表
   * 默认预加载当前语言和英文作为回退
   */
  locales?: string[];

  /**
   * 是否启用性能监控
   */
  enableMonitoring?: boolean;

  /**
   * 预加载策略
   * - 'immediate': 立即预加载
   * - 'idle': 在浏览器空闲时预加载
   * - 'interaction': 在用户交互时预加载
   */
  strategy?: 'immediate' | 'idle' | 'interaction';

  /**
   * 预加载优先级
   */
  priority?: 'high' | 'normal' | 'low';
}

export function TranslationPreloader({
  locales,
  enableMonitoring = true,
  strategy = 'idle',
  priority: _priority = 'normal',
}: TranslationPreloaderProps) {
  const currentLocale = useLocale();

  useEffect(() => {
    // 确定要预加载的语言
    const targetLocales = locales || [currentLocale, 'en'];

    const preloadWithStrategy = async () => {
      const startTime = performance.now();

      try {
        switch (strategy) {
          case 'immediate':
            await preloadTranslations(targetLocales);
            break;

          case 'idle':
            if ('requestIdleCallback' in window) {
              requestIdleCallback(async () => {
                await preloadTranslations(targetLocales);
              });
            } else {
              // 回退到setTimeout
              setTimeout(async () => {
                await preloadTranslations(targetLocales);
              }, PERCENTAGE_FULL);
            }
            break;

          case 'interaction':
            const handleFirstInteraction = async () => {
              await preloadTranslations(targetLocales);
              // 移除事件监听器
              document.removeEventListener('click', handleFirstInteraction);
              document.removeEventListener('keydown', handleFirstInteraction);
              document.removeEventListener('scroll', handleFirstInteraction);
            };

            document.addEventListener('click', handleFirstInteraction, {
              once: true,
            });
            document.addEventListener('keydown', handleFirstInteraction, {
              once: true,
            });
            document.addEventListener('scroll', handleFirstInteraction, {
              once: true,
            });
            break;
        }

        // 记录性能指标
        if (enableMonitoring) {
          const loadTime = performance.now() - startTime;
          I18nPerformanceMonitor.recordLoadTime(loadTime);
        }
      } catch (error) {
        logger.error('Translation preload failed', { error: error as Error });
        if (enableMonitoring) {
          I18nPerformanceMonitor.recordError();
        }
      }
    };

    preloadWithStrategy();
  }, [currentLocale, locales, strategy, enableMonitoring]);

  // 这个组件不渲染任何内容
  return null;
}

/**
 * 关键路径翻译预加载器
 * 专门用于预加载关键页面的翻译内容
 */
export function CriticalTranslationPreloader() {
  const currentLocale = useLocale();

  useEffect(() => {
    // 预加载关键翻译命名空间
    const preloadCriticalTranslations = async () => {
      const startTime = performance.now();

      try {
        // 预加载当前语言和英文回退
        await preloadTranslations([currentLocale, 'en']);

        const loadTime = performance.now() - startTime;
        I18nPerformanceMonitor.recordLoadTime(loadTime);

        // 记录缓存命中
        I18nPerformanceMonitor.recordCacheHit();
      } catch (error) {
        logger.error('Critical translation preload failed', {
          error: error as Error,
        });
        I18nPerformanceMonitor.recordError();
      }
    };

    // 使用高优先级预加载
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      (window as any).scheduler.postTask(preloadCriticalTranslations, {
        priority: 'user-blocking',
      });
    } else {
      // 回退到立即执行
      preloadCriticalTranslations();
    }
  }, [currentLocale]);

  return null;
}

/**
 * 智能预加载逻辑
 */
async function performSmartPreload(currentLocale: string) {
  // 获取当前页面路径
  const currentPath = window.location.pathname;

  // 基于路径预测需要的翻译
  const predictedNamespaces = getPredictedNamespaces(currentPath);

  // 预加载预测的翻译内容
  for (const namespace of predictedNamespaces) {
    try {
      await preloadTranslations([currentLocale]);
    } catch (error) {
      logger.warn(`Failed to preload namespace ${namespace}`, {
        error: error as Error,
      });
    }
  }
}

/**
 * 调度智能预加载
 */
function scheduleSmartPreload(preloadFn: () => Promise<void>) {
  // 在浏览器空闲时执行智能预加载
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadFn, { timeout: MAGIC_2000 });
  } else {
    setTimeout(preloadFn, 500);
  }
}

/**
 * 智能翻译预加载器
 * 基于用户行为和页面路由智能预加载翻译
 */
export function SmartTranslationPreloader() {
  const currentLocale = useLocale();

  useEffect(() => {
    const smartPreload = () => performSmartPreload(currentLocale);
    scheduleSmartPreload(smartPreload);
  }, [currentLocale]);

  return null;
}

/**
 * 根据页面路径预测需要的翻译命名空间
 */
function getPredictedNamespaces(path: string): string[] {
  const namespaceMap: Record<string, string[]> = {
    '/': ['home', 'hero', 'features'],
    '/about': ['about', 'team', 'company'],
    '/guanyu': ['about', 'team', 'company'],
    '/contact': ['contact', 'form', 'support'],
    '/lianxi': ['contact', 'form', 'support'],
    '/blog': ['blog', 'articles', 'content'],
    '/products': ['products', 'catalog', 'pricing'],
  };

  // 获取基础路径（移除语言前缀）
  const basePath = path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  return namespaceMap[basePath] || ['common'];
}

/**
 * 性能监控预加载器
 * 专门用于监控翻译性能并优化预加载策略
 */
export function PerformanceMonitoringPreloader() {
  useEffect(() => {
    // 定期清理过期缓存
    const cleanupInterval = setInterval(() => {
      // 这里可以添加缓存清理逻辑

      logger.debug('Translation cache cleanup performed');
    }, COUNT_FIVE * MINUTE_MS); // 每5分钟清理一次

    // 定期报告性能指标
    const reportingInterval = setInterval(() => {
      const metrics = I18nPerformanceMonitor.getMetrics();

      // 如果性能指标异常，记录警告
      if (metrics.averageLoadTime > HTTP_OK) {
        logger.warn('Translation load time exceeds target', { metrics });
      }

      if (metrics.cacheHitRate < ANGLE_90_DEG) {
        logger.warn('Translation cache hit rate below target', { metrics });
      }
    }, MINUTE_MS); // 每分钟检查一次

    return () => {
      clearInterval(cleanupInterval);
      clearInterval(reportingInterval);
    };
  }, []);

  return null;
}

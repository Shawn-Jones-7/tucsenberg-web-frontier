/**
 * 翻译预加载器工厂函数
 * Translation Preloader Factory Functions
 */

import type { Messages } from '@/types/i18n';
import type {
  CacheStorage,
  MetricsCollector,
  PreloadConfig,
} from '../i18n-cache-types';
import { TranslationPreloader } from '@/lib/i18n-preloader-core';

/**
 * 创建预加载器实例的工厂函数
 * Factory function to create preloader instance
 */
export function createTranslationPreloader(
  cache: CacheStorage<Messages>,
  metricsCollector: MetricsCollector,
  config?: Partial<PreloadConfig>,
): TranslationPreloader {
  return new TranslationPreloader(cache, metricsCollector, config);
}
